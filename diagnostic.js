/* ==========================================================================
   DATA JOURNEY ACADEMY — diagnostic.js
   "Avaliar meu conhecimento": diagnóstico por regras locais (sem IA externa).
   Depende de: data.js, diagnostic-data.js e script.js (carregados antes).

   Organização:
   1. Regras de avaliação
   2. Recomendações de revisão
   3. Telas (hub, avaliação, resultado, relatório)
   4. Eventos e integração com o restante da plataforma

   REGRAS PEDAGÓGICAS (resumo do que o código faz):
   - Cada tópico tem uma pergunta de conceito e uma de código. Só é
     "demonstrado" se as duas estiverem certas.
   - Um módulo só é validado quando todos os tópicos ligados a ele forem
     demonstrados na avaliação.
   - Uma área só vira "Dominado" com 83% ou mais, boa prática e esse
     desempenho repetido em dois dias diferentes.
   - Sem o pré-requisito sólido, o resultado da área fica limitado a
     "Em aprendizado".
   - "Estudado na trilha" e "Demonstrado" são mostrados separados.
   ========================================================================== */

'use strict';

const DIAG_PARTIAL = 50;     // % mínimo para considerar que há base
const DIAG_MASTERY = 83;     // % mínimo (5 de 6) para candidato a domínio
const DIAG_PRACTICE = 67;    // % mínimo na parte prática (2 de 3) para domínio
const DIAG_PHASE_ADVANCE = 75; // aprovação no nivelamento de Python para abrir a fase 2


/* ==========================================================================
   1. REGRAS DE AVALIAÇÃO
   ========================================================================== */
const diagStore = () => (progress.diagnostic ??= { attempts: {}, qstats: {} });
const areaById = (id) => DATA.diagnostics.find((a) => a.id === id);
const areaQuestions = (area) => area.topics.flatMap((t) => [t.c, t.k]);
const attemptsFor = (areaId) => diagStore().attempts[areaId] ?? [];
const latestAttempt = (areaId) => attemptsFor(areaId).at(-1);
const skillLabel = (statusId) => DATA.skillStatus.find((s) => s.id === statusId).label;

/** Corrige uma tentativa: resultado por tópico e percentuais de teoria e prática. */
function scoreAttempt(area, answers) {
  const topics = area.topics.map((t) => {
    const theory = answers[t.c.id] === t.c.answer;
    const practice = answers[t.k.id] === t.k.answer;
    return { id: t.id, theory, practice, status: theory && practice ? 'demonstrado' : (theory || practice) ? 'parcial' : 'revisar' };
  });
  const count = topics.length;
  const theoryRight = topics.filter((t) => t.theory).length;
  const practiceRight = topics.filter((t) => t.practice).length;
  return {
    topics,
    correct: theoryRight + practiceRight,
    total: count * 2,
    pct: Math.round(((theoryRight + practiceRight) / (count * 2)) * 100),
    theoryPct: Math.round((theoryRight / count) * 100),
    practicePct: Math.round((practiceRight / count) * 100),
  };
}

/** Pré-requisitos sólidos = última avaliação de cada área exigida com pelo menos 50%. */
const prereqMissing = (area) => area.prereq.filter((id) => (latestAttempt(id)?.pct ?? 0) < DIAG_PARTIAL);

/**
 * Situação atual de uma área com base em TODAS as tentativas.
 * Devolve null se a área nunca foi avaliada.
 */
function areaResult(area) {
  const attempts = attemptsFor(area.id);
  if (!attempts.length) return null;
  const last = attempts.at(-1);

  let status = 'nao-iniciado';
  if (last.pct >= DIAG_PARTIAL || last.theoryPct >= DIAG_PARTIAL) status = 'aprendizado';
  if (last.pct >= DIAG_PARTIAL && last.practicePct >= DIAG_PARTIAL) status = 'pratica';

  // Domínio exige desempenho alto em pelo menos dois dias diferentes
  const strongDays = new Set(attempts.filter((a) => a.pct >= DIAG_MASTERY && a.practicePct >= DIAG_PRACTICE).map((a) => dayKey(new Date(a.at))));
  const consistent = last.pct >= DIAG_MASTERY && last.practicePct >= DIAG_PRACTICE && strongDays.size >= 2;
  if (status === 'pratica' && consistent) status = 'dominado';

  // Sem base nos pré-requisitos, o resultado fica limitado
  const missing = prereqMissing(area);
  let capped = false;
  if (missing.length && STATUS_INDEX[status] > STATUS_INDEX.aprendizado) { status = 'aprendizado'; capped = true; }

  return { last, status, consistent, capped, missing, attempts: attempts.length };
}

/** Texto explicando o que o resultado significa e o que falta para o próximo nível. */
function statusMessage(result) {
  const { last, status, consistent, capped } = result;
  const strong = last.pct >= DIAG_MASTERY && last.practicePct >= DIAG_PRACTICE;
  if (capped) return 'O resultado está limitado a "Em aprendizado" porque falta base nos pré-requisitos. Reforce-os e refaça esta avaliação.';
  if (status === 'dominado') return 'Domínio demonstrado: você manteve um desempenho alto em dias diferentes.';
  if (status === 'pratica' && strong && !consistent) return 'Ótimo desempenho. Para considerar domínio, refaça a avaliação em outro dia e mantenha o resultado.';
  if (status === 'pratica') return 'Você mostrou teoria e prática em nível de prática. Reforce os tópicos parciais para avançar.';
  if (status === 'aprendizado') return 'Há uma base teórica, mas a prática ainda não está demonstrada. Treine com os exercícios e refaça depois.';
  return 'Ainda não há evidência suficiente. Estude os tópicos recomendados e refaça a avaliação.';
}

/** Guarda a tentativa, atualiza estatísticas de erros e eleva as competências da carreira. */
function saveAttempt(area, answers) {
  const result = scoreAttempt(area, answers);
  const attempt = { at: Date.now(), ...result, answers };
  const store = diagStore();
  store.attempts[area.id] = [...attemptsFor(area.id), attempt];

  areaQuestions(area).forEach((question) => {
    const stat = store.qstats[question.id] ?? { right: 0, wrong: 0 };
    if (answers[question.id] === question.answer) stat.right += 1; else stat.wrong += 1;
    store.qstats[question.id] = stat;
  });

  const topicResults = new Map(result.topics.map((topic) => [topic.id, topic]));
  const moduleIds = new Set(area.topics.map((topic) => topic.module).filter(Boolean));
  progress.validatedModules ??= {};
  moduleIds.forEach((moduleId) => {
    const mappedTopics = area.topics.filter((topic) => topic.module === moduleId);
    if (!mappedTopics.every((topic) => topicResults.get(topic.id)?.status === 'demonstrado')) return;
    const module = findModule(moduleId);
    if (!module) throw new Error(`O diagnóstico referencia um módulo inexistente: ${moduleId}`);
    if (moduleCompleted(module)) return;
    progress.validatedModules[moduleId] = {
      areaId: area.id,
      topics: mappedTopics.map((topic) => topic.id),
      at: Date.now(),
    };
    logActivity(`Validou o módulo "${module.title}" no teste de nivelamento`);
  });

  applyPlacementProgress(area, attempt);
  logActivity(`Fez o diagnóstico de ${area.name}: ${result.pct}%`);
  const evaluation = areaResult(area);
  if (evaluation.status !== 'nao-iniciado') bumpSkills(area.skills, evaluation.status);   // nunca rebaixa
  saveProgress();
  return attempt;
}

/** Aprovação no nivelamento de Python dispensa a fase 1 e abre Manipulação de dados. */
function applyPlacementProgress(area, attempt) {
  if (area.id !== 'python' || attempt.pct < DIAG_PHASE_ADVANCE) return false;

  const moduleIds = new Set(area.topics.map((topic) => topic.module).filter(Boolean));
  const modules = Array.from(moduleIds, (id) => {
    const module = findModule(id);
    if (!module) throw new Error(`O diagnóstico referencia um módulo inexistente: ${id}`);
    return module;
  });

  let changed = false;
  progress.validatedModules ??= {};
  modules.forEach((module) => {
    if (moduleCompleted(module)) return;
    const topics = area.topics.filter((topic) => topic.module === module.id);
    progress.validatedModules[module.id] = {
      areaId: area.id,
      topics: topics.map((topic) => topic.id),
      at: attempt.at,
      placement: true,
    };
    logActivity(`Validou o módulo "${module.title}" pela aprovação no nivelamento`);
    changed = true;
  });

  const lastPhaseIndex = Math.max(...modules.map((module) =>
    DATA.phases.findIndex((phase) => phase.modules.includes(module))));
  const nextPhase = DATA.phases[lastPhaseIndex + 1];
  if (nextPhase) {
    progress.unlockedPhases ??= [];
    if (!progress.unlockedPhases.includes(nextPhase.id)) {
      progress.unlockedPhases.push(nextPhase.id);
      changed = true;
    }
  }
  return changed;
}

// Aplica a regra também a quem já tinha um diagnóstico aprovado salvo.
const pythonArea = areaById('python');
const priorPassingAttempt = pythonArea && attemptsFor(pythonArea.id)
  .find((attempt) => attempt.pct >= DIAG_PHASE_ADVANCE);
if (priorPassingAttempt && applyPlacementProgress(pythonArea, priorPassingAttempt)) saveProgress();

/** Evidência de uma competência da carreira (usada na página Minha Carreira). */
function skillEvidenceHtml(skillId) {
  const area = DATA.diagnostics.find((a) => a.skills.includes(skillId));
  if (!area) return '';
  const result = areaResult(area);
  return `<small class="skill__evidence">${result ? `Demonstrado no diagnóstico: ${skillLabel(result.status)}` : 'Sem diagnóstico ainda'}</small>`;
}


/* ==========================================================================
   2. RECOMENDAÇÕES DE REVISÃO
   ========================================================================== */
function moduleAdvice(topic) {
  if (!topic.module) return { text: 'Este assunto ainda não tem aula na trilha. Pratique por conta própria e refaça a avaliação depois.', links: [] };
  const module = findModule(topic.module);
  const status = moduleStatus(module);
  if (status === 'bloqueado') return { text: `A aula está em "${module.title}", que ainda está bloqueado. Avance na trilha para liberar.`, links: [['Ver trilha', '#trilha']] };
  if (!hasContent(module)) return { text: `O módulo "${module.title}" ainda não tem conteúdo publicado.`, links: [] };
  const links = [[`Abrir "${module.title}"`, `#trilha/${module.id}`]];
  if (exercisesOf(module).some((e) => !exerciseDone(e.id))) links.push(['Fazer exercícios', '#exercicios']);
  return { text: 'Revise a aula e pratique com os exercícios do módulo.', links };
}

function failureText(t) {
  if (!t.theory && !t.practice) return 'Você errou a pergunta de conceito e a de interpretação de código.';
  return t.theory ? 'Você acertou o conceito, mas errou a interpretação de código. Falta prática.' : 'Você acertou o código, mas errou o conceito. Falta entender o porquê.';
}

/** Lista priorizada: pré-requisitos primeiro, depois tópicos a revisar, depois parciais. */
function buildRecommendations(onlyArea) {
  const recs = [];
  DATA.diagnostics.filter((a) => !onlyArea || a.id === onlyArea).forEach((area) => {
    const result = areaResult(area);
    if (!result) return;
    if (result.missing.length) {
      const names = result.missing.map((id) => areaById(id).name).join(' e ');
      const notDone = result.missing.some((id) => !latestAttempt(id));
      recs.push({
        priority: 0,
        title: `Antes de avançar em ${area.name}, reforce ${names}`,
        detail: notDone ? `Faça o diagnóstico de ${names} para confirmar sua base.` : `${names} está abaixo de ${DIAG_PARTIAL}% na última avaliação.`,
        links: [['Ir ao diagnóstico', '#diagnostico']],
      });
    }
    result.last.topics.forEach((t) => {
      if (t.status === 'demonstrado') return;
      const topic = area.topics.find((x) => x.id === t.id);
      const advice = moduleAdvice(topic);
      recs.push({
        priority: t.status === 'revisar' ? 1 : 2,
        title: `Revisar ${topic.title} (${area.name})`,
        detail: `${failureText(t)} ${advice.text}`,
        links: advice.links,
      });
    });
  });
  return recs.sort((a, b) => a.priority - b.priority);
}


/* ==========================================================================
   3. TELAS
   ========================================================================== */
let session = null;       // avaliação em andamento (só na memória)
let lastResult = null;    // { areaId, attempt } logo após finalizar

const diagView = () => $('#view-diagnostico');
const statusKind = (id) => (id === 'dominado' ? 'ok' : id === 'nao-iniciado' ? '' : 'blue');

const meterHtml = (label, value, color) => `
  <div><div class="meters__label"><span>${label}</span><span>${value}%</span></div>
    <div class="meter"><div class="meter__fill meter__fill--${color}" style="width:${value}%"></div></div></div>`;

const linksHtml = (links) => links.length ? `<p class="rec__links">${links.map(([text, href]) => `<a href="${href}">${esc(text)}</a>`).join('')}</p>` : '';

function recommendationsHtml(recs) {
  if (!recs.length) return '<p class="muted">Nenhuma revisão pendente. Continue avançando na trilha.</p>';
  return `<ol class="recs">${recs.map((r) => `
    <li class="rec rec--p${r.priority}"><strong>${esc(r.title)}</strong><p>${esc(r.detail)}</p>${linksHtml(r.links)}</li>`).join('')}</ol>`;
}

/** Revisão pergunta a pergunta: resposta dada, resposta correta e explicação. */
function questionReviewHtml(area, answers) {
  return area.topics.map((topic) => `
    <div class="qreview">
      <h4 class="qreview__topic">${esc(topic.title)}</h4>
      ${[topic.c, topic.k].map((question) => {
        const given = answers[question.id];
        const ok = given === question.answer;
        return `<details class="qreview__item ${ok ? 'is-ok' : 'is-bad'}" ${ok ? '' : 'open'}>
          <summary>${pill(question.kind === 'codigo' ? 'Código' : 'Conceito', 'blue')} ${rich(question.q)} ${ok ? pill('Certo', 'ok') : pill('Errado')}</summary>
          ${question.code ? codeBlock(question.code) : ''}
          <p>Sua resposta: ${rich(question.options[given] ?? 'sem resposta')}</p>
          ${ok ? '' : `<p>Resposta correta: <strong>${rich(question.options[question.answer])}</strong></p>`}
          <p class="muted">${rich(question.explain)}</p>
        </details>`;
      }).join('')}
    </div>`).join('');
}

/* ----- Hub: lista das áreas ----- */
function renderHub() {
  const anyAttempt = DATA.diagnostics.some((a) => attemptsFor(a.id).length);
  const cards = DATA.diagnostics.map((area) => {
    const result = areaResult(area);
    const missing = prereqMissing(area);
    const questions = area.topics.length * 2;
    return `
      <article class="card area">
        <div class="module-head"><h2 class="section-title">${esc(area.name)}</h2>
          ${result ? pill(skillLabel(result.status), statusKind(result.status)) : pill('Não avaliado')}</div>
        <p class="muted">${questions} questões sobre ${area.topics.map((t) => t.title.toLowerCase()).join(', ')}.</p>
        ${area.prereq.length ? `<p class="area__note ${missing.length ? 'is-warn' : ''}">Pré-requisito: ${area.prereq.map((id) => areaById(id).name).join(' e ')}${missing.length ? ' (ainda sem base confirmada)' : ' (ok)'}</p>` : ''}
        ${result ? `<p class="muted">Última nota: ${result.last.pct}% em ${result.attempts} ${result.attempts === 1 ? 'tentativa' : 'tentativas'}.</p>` : ''}
        <a class="button${result ? ' button--ghost' : ''}" href="#diagnostico/${area.id}">${result ? 'Refazer avaliação' : 'Iniciar avaliação'}</a>
      </article>`;
  }).join('');

  diagView().innerHTML = `
    <p class="muted intro">Você não precisa assistir às aulas antes. Cada área mistura perguntas de conceito e de interpretação de código; quando todos os tópicos de um módulo são demonstrados, ele fica validado. A trilha mantém a ordem dos pré-requisitos e mostra primeiro o que ainda falta. Você pode refazer as avaliações quando quiser.</p>
    ${anyAttempt ? '<a class="button" href="#diagnostico/relatorio" style="justify-self:start">Ver relatório de competências</a>' : ''}
    <div class="area-grid">${cards}</div>`;
}

/* ----- Avaliação: uma pergunta por vez ----- */
function startSession(areaId) {
  const area = areaById(areaId);
  const qs = areaQuestions(area);
  const optionOrders = balancedOptionOrders(qs);
  session = { areaId, qs, index: 0, answers: {}, order: Object.fromEntries(qs.map((question, index) => [question.id, optionOrders[index]])) };
}

function renderSession(focus = false) {
  const s = session;
  const area = areaById(s.areaId);
  const question = s.qs[s.index];
  const total = s.qs.length;
  const isLast = s.index === total - 1;
  diagView().innerHTML = `
    <div class="card step">
      <div class="step__top">
        <span class="muted">${esc(area.name)}: pergunta ${s.index + 1} de ${total}</span>
        ${pill(question.kind === 'codigo' ? 'Interpretação de código' : 'Conceito', 'blue')}
      </div>
      <div class="meter" role="progressbar" aria-label="Progresso da avaliação" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${s.index + 1}">
        <div class="meter__fill meter__fill--violet" style="width:${((s.index + 1) / total) * 100}%"></div></div>
      <fieldset class="question">
        <legend id="diag-legend" tabindex="-1">${rich(question.q)}</legend>
        ${question.code ? codeBlock(question.code) : ''}
        ${s.order[question.id].map((optionIndex, position) => `
          <label class="option"><input type="radio" name="dq" value="${optionIndex}" ${s.answers[question.id] === optionIndex ? 'checked' : ''}><span>${String.fromCharCode(65 + position)}. ${rich(question.options[optionIndex])}</span></label>`).join('')}
      </fieldset>
      <p class="feedback feedback--bad" id="diag-msg" hidden></p>
      <div class="step__nav">
        <button class="button button--ghost" type="button" data-action="diag-prev" ${s.index === 0 ? 'disabled' : ''}>Anterior</button>
        <button class="button" type="button" data-action="diag-next">${isLast ? 'Finalizar' : 'Próxima'}</button>
      </div>
    </div>
    <button class="link-button" type="button" data-action="diag-exit">Sair sem salvar</button>`;
  if (focus) $('#diag-legend').focus();
}

/* ----- Resultado de uma tentativa ----- */
function renderResult(areaId, attempt) {
  const area = areaById(areaId);
  const result = areaResult(area);
  diagView().innerHTML = `
    <section class="card" aria-labelledby="result-title">
      <div class="module-head"><h2 class="section-title" id="result-title" tabindex="-1">${esc(area.name)}: ${attempt.pct}%</h2>
        ${pill(skillLabel(result.status), statusKind(result.status))}</div>
      <p>Você acertou ${attempt.correct} de ${attempt.total} perguntas. ${esc(statusMessage(result))}</p>
      <p class="muted">${area.id === 'python' && attempt.pct >= DIAG_PHASE_ADVANCE
        ? `Com ${DIAG_PHASE_ADVANCE}% ou mais, a fase 2 (Manipulação de dados) fica liberada. Você pode revisar os tópicos que errou sem bloquear seu avanço.`
        : 'Os módulos são validados quando todos os tópicos ligados a eles forem demonstrados. Use as recomendações para estudar apenas o que faltou.'}</p>
      <div class="meters">${meterHtml('Conhecimento teórico', attempt.theoryPct, 'blue')}${meterHtml('Capacidade prática', attempt.practicePct, 'violet')}</div>
      <div class="area__topics">${attempt.topics.map((t) => {
        const topic = area.topics.find((x) => x.id === t.id);
        const label = t.status === 'demonstrado' ? ['Demonstrado', 'ok'] : t.status === 'parcial' ? ['Parcial', 'blue'] : ['A revisar', ''];
        return `<span class="area__topic">${esc(topic.title)} ${pill(...label)}</span>`;
      }).join('')}</div>
    </section>
    <section class="card"><h3 class="subhead">O que revisar</h3>${recommendationsHtml(buildRecommendations(areaId))}</section>
    <section class="card"><h3 class="subhead">Correção comentada</h3>${questionReviewHtml(area, attempt.answers)}</section>
    <div class="actions">
      <button class="button" type="button" data-action="diag-retry">Refazer esta avaliação</button>
      <a class="button button--ghost" href="#diagnostico">Voltar às áreas</a>
      <a class="button button--ghost" href="#diagnostico/relatorio">Ver relatório completo</a>
    </div>`;
  $('#result-title').focus();
}

/* ----- Relatório individual de competências ----- */
function studiedLabel(topic) {
  if (!topic.module) return pill('Sem aula na trilha');
  const module = findModule(topic.module);
  if (moduleValidated(module)) return pill('Validado no teste', 'ok');
  if (moduleCompleted(module)) return pill('Módulo concluído', 'ok');
  return hasContent(module) ? pill('Não concluído') : pill('Aula em breve');
}

function renderReport() {
  const evaluated = DATA.diagnostics.filter((a) => attemptsFor(a.id).length);
  if (!evaluated.length) {
    diagView().innerHTML = `<a class="back" href="#diagnostico">Voltar às áreas</a><div class="card empty"><p class="empty__title">Nenhuma avaliação feita ainda</p><p class="empty__text">Faça o diagnóstico de uma área para gerar seu relatório.</p></div>`;
    return;
  }
  const stat = diagStore().qstats;
  const sections = DATA.diagnostics.map((area) => {
    const result = areaResult(area);
    if (!result) {
      return `<section class="card"><div class="module-head"><h3 class="section-title">${esc(area.name)}</h3>${pill('Não avaliado')}</div>
        <a class="button button--ghost" href="#diagnostico/${area.id}" style="justify-self:start">Iniciar avaliação</a></section>`;
    }
    const rows = result.last.topics.map((t) => {
      const topic = area.topics.find((x) => x.id === t.id);
      const errors = (stat[topic.c.id]?.wrong ?? 0) + (stat[topic.k.id]?.wrong ?? 0);
      const demo = t.status === 'demonstrado' ? pill('Demonstrado', 'ok') : t.status === 'parcial' ? pill('Parcial', 'blue') : pill('A revisar');
      return `<tr><td>${esc(topic.title)}</td><td>${studiedLabel(topic)}</td><td>${demo}</td><td>${errors}</td></tr>`;
    }).join('');
    return `
      <section class="card">
        <div class="module-head"><h3 class="section-title">${esc(area.name)}</h3>
          ${pill(skillLabel(result.status), statusKind(result.status))}${pill(`${result.last.pct}%`)}</div>
        <p class="muted">${esc(statusMessage(result))} Tentativas: ${result.attempts}.</p>
        <div class="meters">${meterHtml('Conhecimento teórico', result.last.theoryPct, 'blue')}${meterHtml('Capacidade prática', result.last.practicePct, 'violet')}</div>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Tópico</th><th>Estudado na trilha</th><th>Demonstrado</th><th>Erros acumulados</th></tr></thead>
          <tbody>${rows}</tbody></table></div>
        <details class="qreview-wrap"><summary>Ver correção da última tentativa</summary>${questionReviewHtml(area, result.last.answers)}</details>
        <a class="button button--ghost" href="#diagnostico/${area.id}" style="justify-self:start">Refazer avaliação</a>
      </section>`;
  }).join('');

  diagView().innerHTML = `
    <a class="back" href="#diagnostico">Voltar às áreas</a>
    <p class="muted intro">Estudado na trilha mostra o que você percorreu. Demonstrado mostra o que as respostas comprovam. Os dois podem ser diferentes.</p>
    <section class="card"><h3 class="subhead">O que revisar primeiro</h3>${recommendationsHtml(buildRecommendations())}</section>
    ${sections}`;
}

/* ----- Roteamento do diagnóstico ----- */
function renderDiagnostico(param) {
  if (!param) { session = null; lastResult = null; renderHub(); return; }
  if (param === 'relatorio') { session = null; lastResult = null; renderReport(); return; }
  if (!areaById(param)) { renderHub(); return; }
  if (lastResult?.areaId === param) { renderResult(param, lastResult.attempt); return; }
  if (!session || session.areaId !== param) startSession(param);
  renderSession();
}

function finishSession() {
  const area = areaById(session.areaId);
  const attempt = saveAttempt(area, session.answers);
  lastResult = { areaId: area.id, attempt };
  session = null;
  renderResult(area.id, attempt);
}


/* ==========================================================================
   4. EVENTOS E INTEGRAÇÃO
   ========================================================================== */
document.addEventListener('change', (event) => {
  if (!session || event.target.name !== 'dq') return;
  session.answers[session.qs[session.index].id] = Number(event.target.value);
  $('#diag-msg').hidden = true;
});

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action?.startsWith('diag-')) return;

  if (action === 'diag-exit') { session = null; window.location.hash = '#diagnostico'; return; }
  if (action === 'diag-retry') { const { areaId } = lastResult; lastResult = null; startSession(areaId); renderSession(true); window.scrollTo(0, 0); return; }
  if (!session) return;

  if (action === 'diag-prev' && session.index > 0) { session.index -= 1; renderSession(true); }
  if (action === 'diag-next') {
    if (session.answers[session.qs[session.index].id] === undefined) {
      setFeedback($('#diag-msg'), 'bad', 'Escolha uma resposta para continuar.');
      return;
    }
    if (session.index === session.qs.length - 1) { finishSession(); window.scrollTo(0, 0); return; }
    session.index += 1;
    renderSession(true);
  }
});

// Ao sair da página de diagnóstico, descarta avaliação em andamento
window.addEventListener('hashchange', () => {
  if (parseHash().page !== 'diagnostico') { session = null; lastResult = null; }
});

/** Cartão do Dashboard com o botão "Avaliar meu conhecimento". */
function renderDiagnosticCard() {
  const evaluated = DATA.diagnostics.filter((a) => attemptsFor(a.id).length).length;
  const pending = buildRecommendations().length;
  $('#diag-summary').textContent = evaluated
    ? `${evaluated} de ${DATA.diagnostics.length} áreas avaliadas. ${pending ? `${pending} ${pending === 1 ? 'ponto' : 'pontos'} para revisar.` : 'Nenhuma revisão pendente.'}`
    : 'Descubra seu ponto de partida em Python, Pandas, SQL, Excel, Power BI e Engenharia de Dados.';
  const report = $('#diag-report');
  report.hidden = !evaluated;
}

const renderDashboardWithoutDiagnostic = RENDERERS.dashboard;
RENDERERS.dashboard = () => {
  renderDashboardWithoutDiagnostic();
  renderDiagnosticCard();
};

// Registra a nova página no roteador do script.js
PAGE_TITLES.diagnostico = 'Diagnóstico de Conhecimento';
RENDERERS.diagnostico = renderDiagnostico;
