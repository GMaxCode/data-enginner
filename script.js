/* ==========================================================================
   DATA JOURNEY ACADEMY — script.js
   Depende de data.js (objeto DATA com o conteúdo).

   Organização:
   1. Persistência (LocalStorage)
   2. Funções auxiliares
   3. Regras de progresso (o "cérebro" da plataforma)
   4. Telas (cada uma devolve HTML a partir dos dados)
   5. Ações do usuário (quiz, exercício, prova, projeto, carreira)
   6. Navegação e menu
   7. Inicialização

   Ideia central: DADOS (progress + DATA) -> REGRAS (seção 3) -> TELAS (seção 4).
   Para trocar o LocalStorage por um banco no futuro, só a seção 1 muda.
   ========================================================================== */

'use strict';


/* ==========================================================================
   1. PERSISTÊNCIA
   Tudo o que o aluno faz fica em um único objeto: "progress".
   ========================================================================== */
const STORAGE_KEY = 'dja:v1';
const PASS_EXAM = 70;   // nota mínima da prova (0 a 100)
const PASS_QUIZ = 60;   // percentual mínimo do quiz da aula

function defaultProgress() {
  return {
    lessons: {},     // id da aula   -> { completedAt, quizBest, attempts }
    exercises: {},   // id exercício -> { done, attempts, at }
    exams: {},       // id módulo    -> [ { at, correct, total, pct, answers } ]
    validatedModules: {}, // módulos demonstrados no teste de nivelamento
    skills: {},      // id competência -> status
    projects: {},    // id projeto   -> { status, github }
    notes: {},       // id aula      -> texto do desafio
    studyLog: {},    // 'AAAA-MM-DD' -> minutos estudados
    activity: [],    // [ { text, at } ]
  };
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultProgress(), ...JSON.parse(raw) } : defaultProgress();
  } catch (error) {
    console.warn('Não foi possível ler os dados salvos. Começando do zero.', error);
    return defaultProgress();
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn('Não foi possível salvar o progresso.', error);
  }
}

let progress = loadProgress();

// Estado temporário da tela (não é salvo): revisão da última prova
const viewState = { review: null };


/* ==========================================================================
   2. FUNÇÕES AUXILIARES
   ========================================================================== */
const $  = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/** Escapa HTML: obrigatório para qualquer texto digitado pelo usuário. */
const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Escapa e transforma `trecho` em <code>trecho</code>. */
const rich = (text) => esc(text).replace(/`([^`]+)`/g, '<code>$1</code>');

const codeBlock = (code) => `<pre class="code"><code>${esc(code)}</code></pre>`;

function formatMinutes(total) {
  if (total < 60) return `${total} min`;
  return `${Math.floor(total / 60)}h ${String(total % 60).padStart(2, '0')}min`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function dayKey(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

function relativeTime(timestamp) {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  return `há ${Math.floor(hours / 24)} d`;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function logActivity(text) {
  progress.activity.unshift({ text, at: Date.now() });
  progress.activity = progress.activity.slice(0, 20);
}

function setFeedback(element, kind, text) {
  element.hidden = false;
  element.className = `feedback feedback--${kind}`;
  element.textContent = text;
}


/* ==========================================================================
   3. REGRAS DE PROGRESSO
   ========================================================================== */
const ALL_MODULES = DATA.phases.flatMap((phase) => phase.modules);
const findModule = (id) => ALL_MODULES.find((m) => m.id === id);
const phaseOf = (module) => DATA.phases.find((p) => p.modules.includes(module));
const moduleForLesson = (lessonId) => ALL_MODULES.find((module) => module.lessons.includes(lessonId));

const hasContent = (module) => module.lessons.length > 0;
const lessonDone = (id) => Boolean(progress.lessons[id]?.completedAt);
const exerciseDone = (id) => Boolean(progress.exercises[id]?.done);
const exercisesOf = (module) => DATA.exercises.filter((e) => module.lessons.includes(e.lesson));
const attemptsOf = (module) => progress.exams[module.id] ?? [];
const bestExam = (module) => Math.max(0, ...attemptsOf(module).map((a) => a.pct));
const examPassed = (module) => bestExam(module) >= PASS_EXAM;
const moduleValidated = (module) => Boolean(progress.validatedModules?.[module.id]);
const lessonValidated = (id) => {
  const module = moduleForLesson(id);
  return Boolean(module && moduleValidated(module));
};

/** Pré-requisitos da prova: todas as aulas concluídas e todos os exercícios feitos. */
function requirementsMet(module) {
  return module.lessons.every(lessonDone) && exercisesOf(module).every((e) => exerciseDone(e.id));
}

/** Módulo concluído por estudo ou validado no teste de nivelamento. */
function moduleLearned(module) {
  return hasContent(module) && requirementsMet(module) && examPassed(module);
}

function moduleCompleted(module) {
  return moduleValidated(module) || moduleLearned(module);
}

/** Um módulo só abre quando todos os anteriores estão concluídos ou validados. */
function moduleLocked(module) {
  const phase = phaseOf(module);
  if (progress.unlockedPhases?.includes(phase.id)) return false;
  const index = ALL_MODULES.indexOf(module);
  return index > 0 && ALL_MODULES.slice(0, index).some((previous) => !moduleCompleted(previous));
}

function moduleStatus(module) {
  if (moduleLearned(module)) return 'concluido';
  if (moduleLocked(module)) return 'bloqueado';
  if (moduleValidated(module)) return 'validado';
  if (!hasContent(module)) return 'em-breve';
  const started = module.lessons.some((id) => progress.lessons[id]) || exercisesOf(module).some((e) => progress.exercises[e.id]);
  return started ? 'andamento' : 'disponivel';
}

const STATUS_LABELS = {
  'concluido':  ['Concluído', 'ok'],
  'validado':   ['Validado', 'ok'],
  'andamento':  ['Em andamento', 'blue'],
  'disponivel': ['Disponível', 'blue'],
  'em-breve':   ['Conteúdo em breve', ''],
  'bloqueado':  ['Bloqueado', ''],
};
const pill = (text, kind = '') => `<span class="pill${kind ? ` pill--${kind}` : ''}">${esc(text)}</span>`;
const statusPill = (status) => pill(...STATUS_LABELS[status]);

/** Indicadores gerais do Dashboard. */
function computeStats() {
  return {
    lessonsCompleted: Object.keys(DATA.lessons).filter((id) => lessonDone(id) || lessonValidated(id)).length,
    exercisesDone: DATA.exercises.filter((e) => exerciseDone(e.id)).length,
    modulesCompleted: ALL_MODULES.filter(moduleCompleted).length,
    studyMinutes: Object.values(progress.studyLog).reduce((sum, min) => sum + min, 0),
    streak: computeStreak(),
  };
}

/** Sequência: dias seguidos estudados. Se hoje ainda não estudou, a sequência de ontem continua valendo. */
function computeStreak() {
  const date = new Date();
  if (!progress.studyLog[dayKey(date)]) date.setDate(date.getDate() - 1);
  let streak = 0;
  while (progress.studyLog[dayKey(date)]) {
    streak += 1;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

/** Próximo passo recomendado: primeiro módulo disponível que ainda não foi concluído. */
function findNextStep() {
  for (const module of ALL_MODULES) {
    if (!hasContent(module) || moduleLocked(module) || moduleCompleted(module)) continue;
    const lessonId = module.lessons.find((id) => !lessonDone(id));
    if (lessonId) return { kind: 'lesson', module, lesson: DATA.lessons[lessonId] };
    if (!exercisesOf(module).every((e) => exerciseDone(e.id))) return { kind: 'exercises', module };
    return { kind: 'exam', module };
  }
  return null;
}

/* ----- Carreira: competências e percentuais ----- */
const STATUS_INDEX = Object.fromEntries(DATA.skillStatus.map((s, i) => [s.id, i]));
const skillStatus = (id) => progress.skills[id] ?? 'nao-iniciado';

function levelFor(percent) {
  if (percent < 15) return 'Iniciante';
  if (percent < 40) return 'Básico';
  if (percent < 65) return 'Intermediário';
  if (percent < 85) return 'Avançado';
  return 'Profissional';
}

/**
 * Percentual = média dos pontos das competências (0, 25%, 60%, 100%).
 * Enquanto nenhuma competência saiu de "Não iniciado", o resultado é "Não avaliado".
 */
function computeTrack(career) {
  const total = career.skills.length;
  const indexes = career.skills.map(([id]) => STATUS_INDEX[skillStatus(id)]);
  const points = indexes.reduce((sum, i) => sum + DATA.skillStatus[i].points, 0);
  const percent = Math.round((points / total) * 100);
  const evaluated = indexes.some((i) => i > 0);
  return {
    id: career.id,
    name: career.name,
    evaluated,
    percent,
    level: evaluated ? levelFor(percent) : null,
    skillsMastered: indexes.filter((i) => i === 3).length,
    skillsTotal: total,
    theory: Math.round((indexes.filter((i) => i >= 1).length / total) * 100),    // já estudou
    practice: Math.round((indexes.filter((i) => i >= 2).length / total) * 100),  // já praticou
  };
}

/** Eleva (nunca rebaixa) o status das competências ligadas a uma conquista. */
function bumpSkills(ids, statusId) {
  ids.forEach((id) => {
    if (STATUS_INDEX[skillStatus(id)] < STATUS_INDEX[statusId]) progress.skills[id] = statusId;
  });
}


/* ==========================================================================
   4. TELAS
   ========================================================================== */
const view = (id) => $(`#view-${id}`);

const emptyCard = (title, text) => `
  <div class="card empty">
    <p class="empty__title">${esc(title)}</p>
    <p class="empty__text">${esc(text)}</p>
  </div>`;

/* ----- Dashboard ----- */
function buildTrack(track) {
  const wrapper = document.createElement('div');
  wrapper.className = 'track';
  wrapper.innerHTML = `
    <div class="track__top">
      <h3 class="track__name">${esc(track.name)}</h3>
      ${track.evaluated ? `<span class="pill pill--value">${track.percent}%</span>` : pill('Não avaliado')}
    </div>
    <div class="track__bar ${track.evaluated ? '' : 'track__bar--unevaluated'}" role="progressbar"
      aria-label="Evolução em ${esc(track.name)}"
      ${track.evaluated ? `aria-valuemin="0" aria-valuemax="100" aria-valuenow="${track.percent}"` : 'aria-valuetext="Não avaliado"'}>
      <div class="track__fill"></div>
    </div>
    <div class="track__meta">
      <span>Nível atual: ${track.level ?? 'não avaliado'}</span>
      <span>Habilidades dominadas: ${track.skillsMastered} de ${track.skillsTotal}</span>
    </div>`;
  if (track.evaluated) {
    // Largura definida depois de inserir no DOM, para a transição CSS animar
    requestAnimationFrame(() => { $('.track__fill', wrapper).style.width = `${track.percent}%`; });
  }
  return wrapper;
}

function renderDashboard() {
  $('[data-greeting]').textContent = getGreeting();

  // Cards de estatísticas
  const stats = computeStats();
  $$('[data-stat]').forEach((el) => {
    const value = stats[el.dataset.stat];
    el.textContent = el.dataset.stat === 'studyMinutes' ? formatMinutes(value)
      : el.dataset.stat === 'streak' ? `${value} ${value === 1 ? 'dia' : 'dias'}`
      : String(value);
  });

  const completedPhases = DATA.phases.map((phase) => phase.modules.every(moduleCompleted));
  const firstIncompletePhase = completedPhases.findIndex((completed) => !completed);
  $$('[data-trail-step]').forEach((dot, index) => {
    dot.classList.toggle('trail__dot--completed', Boolean(completedPhases[index]));
    dot.classList.toggle('trail__dot--current', index === firstIncompletePhase);
  });
  const completedPhaseCount = completedPhases.filter(Boolean).length;
  $('.trail__svg').setAttribute('aria-label', `Trilha com 8 fases, da lógica de programação ao portfólio profissional. ${completedPhaseCount} concluídas.`);

  // Barras de evolução
  $('#progress-list').replaceChildren(...DATA.careers.map((c) => buildTrack(computeTrack(c))));

  // Próximo passo
  const next = findNextStep();
  const button = $('#next-button');
  if (!next) {
    $('#next-phase').textContent = 'Tudo em dia';
    $('#next-lesson').textContent = 'Você concluiu todo o conteúdo disponível';
    $('#next-goal').textContent = 'Novas aulas serão adicionadas aos poucos. Enquanto isso, avance nos projetos práticos.';
    button.href = '#projetos';
    button.lastChild.textContent = ' Ver projetos';
  } else {
    const phase = phaseOf(next.module);
    $('#next-phase').textContent = `${phase.title}: ${next.module.title}`;
    if (next.kind === 'lesson') {
      $('#next-lesson').textContent = next.lesson.title;
      $('#next-goal').textContent = next.lesson.objective;
      button.href = `#sala-de-aula/${next.lesson.id}`;
      button.lastChild.textContent = ' Iniciar aula';
    } else if (next.kind === 'exercises') {
      $('#next-lesson').textContent = 'Exercícios do módulo';
      $('#next-goal').textContent = 'Resolva os exercícios obrigatórios para liberar a prova do módulo.';
      button.href = '#exercicios';
      button.lastChild.textContent = ' Fazer exercícios';
    } else {
      $('#next-lesson').textContent = 'Prova do módulo';
      $('#next-goal').textContent = `Você concluiu as atividades. Tire pelo menos ${PASS_EXAM} pontos para fechar o módulo.`;
      button.href = `#trilha/${next.module.id}`;
      button.lastChild.textContent = ' Fazer a prova';
    }
  }

  // Estudo de hoje
  const days = Object.keys(progress.studyLog).length;
  const today = progress.studyLog[dayKey()] ?? 0;
  $('#study-summary').textContent = `Hoje: ${formatMinutes(today)}. Dias estudados no total: ${days}.`;

  // Atividades recentes
  const list = $('#recent-list');
  const hasItems = progress.activity.length > 0;
  list.hidden = !hasItems;
  $('#recent-empty').hidden = hasItems;
  list.innerHTML = progress.activity.slice(0, 6).map((a) => `
    <li class="recent__item"><span class="recent__text">${esc(a.text)}</span><span class="recent__time">${relativeTime(a.at)}</span></li>`).join('');
}

/* ----- Trilha de Estudos ----- */
function renderTrilha(moduleId) {
  const module = moduleId ? findModule(moduleId) : null;
  view('trilha').innerHTML = module ? moduleDetailHtml(module) : trilhaOverviewHtml();
}

function trilhaOverviewHtml() {
  const firstOpen = DATA.phases.find((p) => p.modules.some((m) => !moduleCompleted(m)));
  const currentModule = ALL_MODULES.find((module) => hasContent(module) && !moduleLocked(module) && !moduleCompleted(module));
  return DATA.phases.map((phase, i) => {
    const done = phase.modules.filter(moduleCompleted).length;
    const rows = phase.modules.map((module, j) => {
      const status = moduleStatus(module);
      const current = module === currentModule;
      const validated = moduleValidated(module) && !moduleLearned(module);
      const completed = status === 'concluido' || status === 'validado' || validated;
      const nodeClass = `roadmap__node${status === 'bloqueado' ? ' roadmap__node--locked' : ''}`;
      const icon = completed
        ? '<svg class="icon" aria-hidden="true"><use href="#icon-check"/></svg>'
        : `<span>${i + 1}.${j + 1}</span>`;
      const statusText = status === 'bloqueado' && validated
        ? 'Validado · aguardando etapas anteriores'
        : STATUS_LABELS[status][0];
      const inner = `<span class="roadmap__node-icon">${icon}</span>
        <span class="roadmap__node-copy"><strong>${esc(module.title)}</strong><small>${esc(statusText)}</small></span>`;
      const node = status === 'bloqueado'
        ? `<span class="${nodeClass}" aria-disabled="true">${inner}</span>`
        : `<a class="${nodeClass}" href="#trilha/${module.id}">${inner}</a>`;
      return `<li class="roadmap__item roadmap__item--${j % 2 === 0 ? 'left' : 'right'}${current ? ' roadmap__item--current' : ''}${validated || status === 'validado' ? ' roadmap__item--validated' : ''}${completed ? ' roadmap__item--done' : ''}">${node}</li>`;
    }).join('');
    const pct = Math.round((done / phase.modules.length) * 100);
    return `
      <details class="phase roadmap__phase card" ${phase === firstOpen ? 'open' : ''}>
        <summary class="phase__summary roadmap__summary">
          <span class="roadmap__phase-copy"><small>FASE ${i + 1}</small><strong>${esc(phase.title)}</strong></span>
          <span class="phase__count">${done} de ${phase.modules.length} módulos</span>
        </summary>
        <div class="roadmap__progress" role="progressbar" aria-label="Progresso da fase ${i + 1}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
          <span style="width: ${pct}%"></span>
        </div>
        <ol class="roadmap__nodes">${rows}</ol>
      </details>`;
  }).join('');
}

function moduleDetailHtml(module) {
  const status = moduleStatus(module);
  const header = `
    <a class="back" href="#trilha">Voltar para a trilha</a>
    <div class="module-head"><h2 class="section-title">${esc(module.title)}</h2>${statusPill(status)}</div>
    <p class="muted">${esc(phaseOf(module).title)}</p>`;

  if (status === 'bloqueado') {
    const previous = ALL_MODULES.slice(0, ALL_MODULES.indexOf(module)).find((item) => !moduleCompleted(item));
    return header + emptyCard('Módulo bloqueado', `Conclua "${previous.title}" para liberar este módulo. Os fundamentos vêm primeiro.`);
  }
  if (status === 'validado') {
    const lessonLinks = module.lessons.map((id) => `<li><a href="#sala-de-aula/${id}">Rever "${esc(DATA.lessons[id].title)}"</a></li>`).join('');
    return `${header}<section class="card validation-card" role="status">
      <h3 class="subhead">Conhecimento validado</h3>
      <p>Você demonstrou este conteúdo no teste de nivelamento. Pode avançar sem refazer as aulas e exercícios deste módulo.</p>
      ${lessonLinks ? `<ul class="checklist__sub">${lessonLinks}</ul>` : ''}
    </section>`;
  }
  if (!hasContent(module)) {
    return header + emptyCard('Conteúdo em breve', 'As aulas, exercícios e a prova deste módulo ainda estão sendo preparados.');
  }

  const lessonsDone = module.lessons.filter(lessonDone).length;
  const exercises = exercisesOf(module);
  const exercisesDoneCount = exercises.filter((e) => exerciseDone(e.id)).length;
  const ready = requirementsMet(module);
  const attempts = attemptsOf(module);

  const lessonLinks = module.lessons.map((id) => `
    <li><a href="#sala-de-aula/${id}">${esc(DATA.lessons[id].title)}</a> ${lessonDone(id) ? pill('Concluída', 'ok') : pill('Pendente')}</li>`).join('');

  const history = attempts.length ? `
    <h3 class="subhead">Histórico de tentativas</h3>
    <table class="table">
      <thead><tr><th>Data</th><th>Acertos</th><th>Nota</th><th>Resultado</th></tr></thead>
      <tbody>${attempts.slice().reverse().map((a) => `
        <tr><td>${formatDate(a.at)}</td><td>${a.correct} de ${a.total}</td><td>${a.pct}</td><td>${a.pct >= PASS_EXAM ? pill('Aprovado', 'ok') : pill('Reprovado')}</td></tr>`).join('')}
      </tbody>
    </table>` : '';

  const review = viewState.review?.moduleId === module.id ? examReviewHtml(module, viewState.review.attempt) : '';

  const examForm = ready ? `
    <form class="card" data-form="exam" data-module="${module.id}" novalidate>
      <h3 class="subhead">Prova do módulo</h3>
      <p class="muted">${DATA.exams[module.id].length} questões. Nota de 0 a 100, aprovação com ${PASS_EXAM} pontos. Você pode refazer quantas vezes quiser.</p>
      ${questionsHtml('exam', DATA.exams[module.id])}
      <p class="feedback feedback--bad" data-msg hidden></p>
      <button class="button" type="submit">Entregar prova</button>
    </form>` : `<div class="card"><p class="muted">A prova é liberada quando você concluir as aulas e os exercícios obrigatórios deste módulo.</p></div>`;

  return `${header}
    <section class="card" aria-label="Requisitos do módulo">
      <h3 class="subhead">Para concluir o módulo</h3>
      <ul class="checklist">
        <li class="${lessonsDone === module.lessons.length ? 'is-done' : ''}">Aulas concluídas: ${lessonsDone} de ${module.lessons.length}
          <ul class="checklist__sub">${lessonLinks}</ul></li>
        <li class="${exercisesDoneCount === exercises.length ? 'is-done' : ''}">Exercícios obrigatórios: ${exercisesDoneCount} de ${exercises.length}
          <a href="#exercicios">Ir para os exercícios</a></li>
        <li class="${examPassed(module) ? 'is-done' : ''}">Prova com pelo menos ${PASS_EXAM} pontos. Melhor nota: ${attempts.length ? bestExam(module) : 'sem tentativas'}</li>
      </ul>
    </section>
    ${review}${examForm}${history ? `<section class="card">${history}</section>` : ''}`;
}

function examReviewHtml(module, attempt) {
  const questions = DATA.exams[module.id];
  const passed = attempt.pct >= PASS_EXAM;
  return `
    <section class="card result" id="exam-result" tabindex="-1" aria-label="Resultado da prova">
      <h3 class="subhead">Resultado: ${attempt.pct} pontos ${passed ? pill('Aprovado', 'ok') : pill('Reprovado')}</h3>
      <p>Você acertou ${attempt.correct} de ${attempt.total} questões. ${passed ? 'Parabéns, a prova está aprovada.' : `Faltaram pontos para chegar a ${PASS_EXAM}. Veja as explicações e tente de novo abaixo.`}</p>
      <ol class="review">
        ${questions.map((q, i) => {
          const ok = attempt.answers[i] === q.answer;
          return `<li class="${ok ? 'is-ok' : 'is-bad'}">
            <p><strong>${rich(q.q)}</strong></p>
            ${q.code ? codeBlock(q.code) : ''}
            <p>Sua resposta: ${rich(q.options[attempt.answers[i]])} ${ok ? pill('Certo', 'ok') : pill('Errado')}</p>
            ${ok ? '' : `<p>Resposta correta: ${rich(q.options[q.answer])}</p>`}
            <p class="muted">${rich(q.explain)}</p>
          </li>`;
        }).join('')}
      </ol>
    </section>`;
}

/* ----- Perguntas (usadas no quiz da aula e na prova) ----- */
function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Equilibra a posição correta sem alterar os índices usados pelo gabarito. */
function balancedOptionOrders(questions) {
  const start = Math.floor(Math.random() * 4);
  const correctPositions = shuffle(questions.map((_, index) => (start + index) % 4));
  return questions.map((question, index) => {
    if (question.options?.length !== 4 || !Number.isInteger(question.answer)
      || question.answer < 0 || question.answer >= question.options.length) {
      throw new Error('Cada questão de múltipla escolha precisa ter quatro alternativas e um gabarito válido.');
    }

    const distractors = shuffle(question.options.map((_, optionIndex) => optionIndex)
      .filter((optionIndex) => optionIndex !== question.answer));
    const order = [...distractors];
    order.splice(correctPositions[index], 0, question.answer);
    return order;
  });
}

function questionsHtml(prefix, questions) {
  const optionOrders = balancedOptionOrders(questions);
  return questions.map((q, i) => `
    <fieldset class="question">
      <legend>${i + 1}. ${rich(q.q)}</legend>
      ${q.code ? codeBlock(q.code) : ''}
      ${optionOrders[i].map((optionIndex, position) => `
        <label class="option"><input type="radio" name="${prefix}-${i}" value="${optionIndex}"><span>${String.fromCharCode(65 + position)}. ${rich(q.options[optionIndex])}</span></label>`).join('')}
      <p class="feedback" hidden></p>
    </fieldset>`).join('');
}

function gradeQuestions(form, questions, prefix) {
  const answers = questions.map((q, i) => {
    const selected = $(`input[name="${prefix}-${i}"]:checked`, form);
    return selected ? Number(selected.value) : -1;
  });
  const correct = answers.filter((a, i) => a === questions[i].answer).length;
  return { answers, correct, total: questions.length };
}

/* ----- Sala de Aula ----- */
function renderSala(lessonId) {
  const lesson = DATA.lessons[lessonId];
  if (lessonId && lesson) {
    const module = ALL_MODULES.find((m) => m.lessons.includes(lessonId));
    view('sala').innerHTML = moduleLocked(module)
      ? emptyCard('Aula bloqueada', 'Conclua o módulo anterior para liberar esta aula.')
      : lessonHtml(lesson, module);
    return;
  }
  const items = ALL_MODULES.flatMap((module) => {
    if (moduleLocked(module)) return [];
    if (!module.lessons.length) {
      return [`<li><div class="module module--locked" aria-disabled="true"><span class="module__title">${esc(module.title)}<span class="module__sub">${esc(phaseOf(module).title)}</span></span>${pill('Conteúdo em breve')}</div></li>`];
    }
    return module.lessons.map((id) => {
      const lesson = DATA.lessons[id];
      const status = lessonDone(id) ? pill('Concluída', 'ok')
        : lessonValidated(id) ? pill('Validada', 'ok')
        : pill('Disponível', 'blue');
      return `<li><a class="module" href="#sala-de-aula/${id}"><span class="module__title">${esc(lesson.title)}<span class="module__sub">${esc(phaseOf(module).title)}</span></span>${status}</a></li>`;
    });
  }).join('');
  view('sala').innerHTML = `<p class="muted intro">Escolha uma aula. Cada sessão tem 40 minutos: 10 de teoria, 20 de prática, 5 de quiz e 5 de revisão. Os assuntos sem aulas cadastradas aparecem como "Conteúdo em breve".</p><ul class="phase__modules card">${items}</ul>`;
}

function lessonHtml(lesson, module) {
  const section = (title, body) => `<section class="lesson__section"><h3 class="lesson__heading">${title}</h3>${body}</section>`;
  const materials = (DATA.materials[lesson.id] ?? []).map(materialItemHtml).join('');
  const done = lessonDone(lesson.id);
  const validated = lessonValidated(lesson.id);
  return `
    <a class="back" href="#trilha/${module.id}">Voltar ao módulo</a>
    <article class="lesson">
      <h2 class="section-title">${esc(lesson.title)} ${done ? pill('Concluída', 'ok') : validated ? pill('Validada', 'ok') : ''}</h2>
      ${section('Objetivo de aprendizagem', `<p>${esc(lesson.objective)}</p>`)}
      ${section('Explicação conceitual', lesson.concept.map((p) => `<p>${rich(p)}</p>`).join(''))}
      ${section('Analogia do dia a dia', `<p class="callout">${rich(lesson.analogy)}</p>`)}
      ${section('Comandos utilizados', `<dl class="commands">${lesson.commands.map((c) => `<dt>${esc(c.name)}</dt><dd>${rich(c.text)}</dd>`).join('')}</dl>`)}
      ${section('Quando usar na Engenharia de Dados', `<p>${rich(lesson.whenToUse)}</p>`)}
      ${section('Exemplo de código comentado', codeBlock(lesson.code))}
      ${section('Aplicação profissional', `<p>${rich(lesson.professional)}</p>`)}
      ${section('Desafio prático', `
        <p>${rich(lesson.challenge)}</p>
        <label class="field"><span>Sua resposta (salva automaticamente)</span>
          <textarea rows="6" data-note="${lesson.id}">${esc(progress.notes[lesson.id] ?? '')}</textarea></label>`)}
      ${section('Quiz da aula', `
        <form data-form="quiz" data-lesson="${lesson.id}" novalidate>
          ${questionsHtml('quiz', lesson.quiz)}
          <p class="feedback feedback--bad" data-msg hidden></p>
          <p class="result-text" data-result hidden></p>
          <button class="button" type="submit">Conferir quiz</button>
          <button class="button button--ghost" type="button" data-action="retry" hidden>Refazer quiz</button>
        </form>`)}
      ${section('Material complementar', materials ? `<ul class="materials">${materials}</ul>` : '<p class="muted">Em breve.</p>')}
      <section class="lesson__completion" aria-label="Conclusão da aula">
        <button class="button" type="button" data-action="complete-lesson" data-lesson="${lesson.id}"${done || validated ? ' hidden' : ''}>Terminei</button>
        <p class="muted" data-lesson-hint${done || validated ? ' hidden' : ''}>Responda todas as perguntas do quiz para liberar a conclusão da aula.</p>
        <p class="feedback feedback--ok" data-lesson-completed role="status"${done || validated ? '' : ' hidden'}>${validated && !done ? 'Aula validada pelo teste de nivelamento.' : 'Aula concluída. Sua missão foi registrada.'}</p>
      </section>
    </article>`;
}

/* ----- Exercícios ----- */
const TYPE_LABELS = { choice: 'Múltipla escolha', bool: 'Verdadeiro ou falso', code: 'Completar código', error: 'Identificar erro', script: 'Escrever script' };

function exerciseHtml(ex, optionOrder) {
  const state = progress.exercises[ex.id];
  const module = moduleForLesson(ex.lesson);
  const validated = moduleValidated(module);
  const options = ex.type === 'bool' ? ['Verdadeiro', 'Falso'] : ex.options;
  let field;
  if (options) {
    const order = optionOrder ?? shuffle(options.map((_, index) => index));
    field = order.map((optionIndex, position) => `<label class="option"><input type="radio" name="${ex.id}" value="${optionIndex}"><span>${String.fromCharCode(65 + position)}. ${rich(options[optionIndex])}</span></label>`).join('');
  } else if (ex.type === 'code') {
    field = `<label class="field"><span>Sua resposta</span><input type="text" name="answer" autocomplete="off" spellcheck="false"></label>`;
  } else {
    field = `<label class="field"><span>Seu código</span><textarea name="answer" rows="5" spellcheck="false"></textarea></label>`;
  }
  return `
    <form class="card exercise" data-form="exercise" data-ex="${ex.id}" novalidate>
      <div class="exercise__meta">
        ${pill(TYPE_LABELS[ex.type])}${pill(ex.level, 'blue')}
        <span data-badge>${state?.done ? pill('Concluído', 'ok') : validated ? pill('Validado no teste', 'ok') : state ? pill('Tentativa feita') : pill('Pendente')}</span>
      </div>
      <p class="exercise__prompt">${rich(ex.prompt)}</p>
      ${ex.code ? codeBlock(ex.code) : ''}
      ${field}
      <p class="feedback" role="status" hidden></p>
      <button class="button" type="submit">Conferir</button>
      <button class="button button--ghost" type="button" data-action="complete-exercise" hidden>Terminei</button>
    </form>`;
}

function renderExercicios() {
  const sections = Object.values(DATA.lessons).map((lesson) => {
    const module = ALL_MODULES.find((m) => m.lessons.includes(lesson.id));
    if (moduleLocked(module)) return '';
    const list = DATA.exercises.filter((e) => e.lesson === lesson.id);
    const choiceQuestions = list.filter((exercise) => exercise.type === 'choice' || exercise.type === 'error');
    const optionOrders = balancedOptionOrders(choiceQuestions);
    const choiceOrders = new Map(choiceQuestions.map((exercise, index) => [exercise.id, optionOrders[index]]));
    return `<section><h2 class="section-title">${esc(lesson.title)}</h2>${list.map((exercise) => exerciseHtml(exercise, choiceOrders.get(exercise.id))).join('')}</section>`;
  }).join('');
  const done = DATA.exercises.filter((e) => exerciseDone(e.id)).length;
  view('exercicios').innerHTML = `
    <p class="muted intro">Responda e clique em Conferir para ver a explicação. Depois, clique em Terminei para registrar a missão. Concluídos: <strong id="exercise-completion-count">${done}</strong> de ${DATA.exercises.length}.</p>
    ${sections}`;
}

/* ----- Projetos ----- */
const PROJECT_STATUS = [['nao-iniciado', 'Não iniciado'], ['andamento', 'Em andamento'], ['concluido', 'Concluído']];
const isGithubUrl = (url) => /^https:\/\/github\.com\/[\w.-]+(\/[\w.-]+)?/i.test(url);

function renderProjetos() {
  view('projetos').innerHTML = DATA.projects.map((p) => {
    const state = progress.projects[p.id] ?? { status: 'nao-iniciado', github: '' };
    const list = (items) => `<ul class="bullets">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
    return `
      <article class="card project">
        <div class="module-head"><h2 class="section-title">${esc(p.title)}</h2>${state.status === 'concluido' ? pill('Concluído', 'ok') : ''}</div>
        <p><strong>Problema:</strong> ${esc(p.problem)}</p>
        <p><strong>Objetivo:</strong> ${esc(p.goal)}</p>
        <p class="tags">${p.techs.map((t) => pill(t, 'blue')).join('')}</p>
        <div class="project__cols">
          <div><h3 class="subhead">Etapas</h3>${list(p.steps)}</div>
          <div><h3 class="subhead">Critérios de avaliação</h3>${list(p.criteria)}</div>
        </div>
        <p><strong>Desafio:</strong> ${esc(p.challenges)}</p>
        <div class="project__form">
          <label class="field"><span>Status</span>
            <select data-project="${p.id}" data-field="status">
              ${PROJECT_STATUS.map(([id, label]) => `<option value="${id}" ${state.status === id ? 'selected' : ''}>${label}</option>`).join('')}
            </select></label>
          <label class="field"><span>Link do GitHub</span>
            <input type="url" placeholder="https://github.com/usuario/repositorio" value="${esc(state.github)}" data-project="${p.id}" data-field="github"></label>
        </div>
        <p class="feedback feedback--bad" data-msg hidden></p>
      </article>`;
  }).join('');
}

/* ----- Minha Carreira ----- */
function renderCarreira() {
  view('carreira').innerHTML = `
    <p class="muted intro">Marque seu nível real em cada competência. Passar em provas e concluir projetos com link no GitHub eleva as competências ligadas automaticamente, e você pode ajustar quando quiser.</p>
    ${DATA.careers.map((career) => {
      const t = computeTrack(career);
      return `
        <section class="card career" aria-labelledby="career-${career.id}">
          <div class="module-head">
            <h2 class="section-title" id="career-${career.id}">${esc(career.name)}</h2>
            ${t.evaluated ? `<span class="pill pill--value">${t.percent}%</span>` : pill('Não avaliado')}
          </div>
          <div class="meters">
            <div><div class="meters__label"><span>Conhecimento teórico</span><span>${t.theory}%</span></div>
              <div class="meter"><div class="meter__fill meter__fill--blue" style="width:${t.theory}%"></div></div></div>
            <div><div class="meters__label"><span>Capacidade prática</span><span>${t.practice}%</span></div>
              <div class="meter"><div class="meter__fill meter__fill--violet" style="width:${t.practice}%"></div></div></div>
          </div>
          <ul class="skills">
            ${career.skills.map(([id, name]) => `
              <li class="skill"><label for="sk-${id}">${esc(name)}</label>
                <select id="sk-${id}" data-skill="${id}">
                  ${DATA.skillStatus.map((s) => `<option value="${s.id}" ${skillStatus(id) === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
                </select></li>`).join('')}
          </ul>
        </section>`;
    }).join('')}`;
}

/* ----- Materiais complementares ----- */
function materialItemHtml(m) {
  return `<li><a href="${esc(m.url)}" target="_blank" rel="noopener noreferrer">${esc(m.title)}</a>
    <span class="materials__meta">${pill(m.type)}${pill(m.lang)}</span></li>`;
}

function renderMateriais() {
  view('materiais').innerHTML = `
    <p class="muted intro">Links oficiais organizados por aula. Priorizamos materiais em português.</p>
    ${Object.values(DATA.lessons).map((lesson) => `
      <section class="card">
        <h2 class="section-title">${esc(lesson.title)}</h2>
        <ul class="materials">${(DATA.materials[lesson.id] ?? []).map(materialItemHtml).join('') || '<li class="muted">Em breve.</li>'}</ul>
      </section>`).join('')}`;
}


/* ==========================================================================
   5. AÇÕES DO USUÁRIO
   Os eventos são "delegados": um único ouvinte no document trata todos os
   formulários e campos, mesmo os criados depois pela renderização.
   ========================================================================== */

/** Marca cada pergunta como certa/errada e mostra a explicação. */
function markQuestions(form, questions, answers) {
  $$('fieldset.question', form).forEach((fieldset, i) => {
    const ok = answers[i] === questions[i].answer;
    setFeedback($('.feedback', fieldset), ok ? 'ok' : 'bad', `${ok ? 'Correto.' : 'Incorreto.'} ${questions[i].explain}`);
  });
  $$('input', form).forEach((input) => { input.disabled = true; });
}

function handleQuiz(form) {
  const lesson = DATA.lessons[form.dataset.lesson];
  const grade = gradeQuestions(form, lesson.quiz, 'quiz');
  const message = $('[data-msg]', form);
  if (grade.answers.includes(-1)) {
    setFeedback(message, 'bad', 'Responda todas as perguntas antes de conferir.');
    return;
  }
  message.hidden = true;

  const pct = Math.round((grade.correct / grade.total) * 100);
  const record = progress.lessons[lesson.id] ?? {};
  record.attempts = (record.attempts ?? 0) + 1;
  record.quizBest = Math.max(record.quizBest ?? 0, pct);

  let text;
  if (pct >= PASS_QUIZ) {
    if (!record.completedAt) {
      record.completedAt = Date.now();
      logActivity(`Concluiu a aula "${lesson.title}"`);
    }
    text = `Você acertou ${grade.correct} de ${grade.total}. Aula concluída.`;
  } else {
    text = `Você acertou ${grade.correct} de ${grade.total}. São necessários ${PASS_QUIZ}% para concluir a aula. Releia o conteúdo e tente de novo.`;
  }
  progress.lessons[lesson.id] = record;
  saveProgress();

  if (record.completedAt) {
    const lessonElement = form.closest('.lesson');
    $('[data-action="complete-lesson"]', lessonElement).hidden = true;
    $('[data-lesson-hint]', lessonElement).hidden = true;
    $('[data-lesson-completed]', lessonElement).hidden = false;
  }

  markQuestions(form, lesson.quiz, grade.answers);
  const result = $('[data-result]', form);
  result.hidden = false;
  result.textContent = text;
  $('button[type="submit"]', form).hidden = true;
  $('[data-action="retry"]', form).hidden = false;
}

function handleExercise(form) {
  const ex = DATA.exercises.find((e) => e.id === form.dataset.ex);
  const feedback = $('.feedback', form);
  let correct = false;
  let filled = true;

  if (ex.type === 'choice' || ex.type === 'error' || ex.type === 'bool') {
    const selected = $('input:checked', form);
    if (!selected) filled = false; else correct = Number(selected.value) === ex.answer;
  } else {
    const value = form.elements.answer.value.trim();
    if (!value) filled = false;
    else if (ex.type === 'code') correct = ex.accept.some((a) => a.replace(/\s+/g, '') === value.replace(/\s+/g, ''));
    else correct = ex.checks.every((pattern) => new RegExp(pattern).test(value));
  }
  if (!filled) { setFeedback(feedback, 'bad', 'Responda antes de conferir.'); return; }

  const state = progress.exercises[ex.id] ?? { attempts: 0, done: false };
  state.attempts += 1;
  state.at = Date.now();
  if (correct && !state.done) logActivity(`Acertou um exercício de "${DATA.lessons[ex.lesson].title}" (${TYPE_LABELS[ex.type].toLowerCase()})`);
  progress.exercises[ex.id] = state;
  saveProgress();

  setFeedback(feedback, correct ? 'ok' : 'bad', `${correct ? 'Correto.' : 'Ainda não.'} ${ex.explain}`);
  $('[data-badge]', form).innerHTML = state.done ? pill('Concluído', 'ok') : pill('Tentativa feita');
}

function exerciseHasAnswer(ex, form) {
  if (ex.type === 'choice' || ex.type === 'error' || ex.type === 'bool') {
    return Boolean($('input:checked', form));
  }
  return Boolean(form.elements.answer.value.trim());
}

function updateCompletionButton(form) {
  if (form.dataset.form === 'exercise') {
    const ex = DATA.exercises.find((item) => item.id === form.dataset.ex);
    const button = $('[data-action="complete-exercise"]', form);
    button.hidden = exerciseDone(ex.id) || !exerciseHasAnswer(ex, form);
  } else if (form.dataset.form === 'quiz') {
    const lesson = DATA.lessons[form.dataset.lesson];
    const button = $('[data-action="complete-lesson"]', form.closest('.lesson'));
    button.hidden = lessonDone(lesson.id) || gradeQuestions(form, lesson.quiz, 'quiz').answers.includes(-1);
  }
}

function completeExercise(form) {
  const exercise = DATA.exercises.find((item) => item.id === form.dataset.ex);
  if (!exerciseHasAnswer(exercise, form)) {
    setFeedback($('.feedback', form), 'bad', 'Responda ao exercício antes de concluir a missão.');
    return;
  }

  const state = progress.exercises[exercise.id] ?? { attempts: 0, done: false };
  if (!state.done) {
    state.done = true;
    state.completedAt = Date.now();
    logActivity(`Concluiu o exercício "${exercise.prompt}"`);
  }
  progress.exercises[exercise.id] = state;
  saveProgress();

  $('[data-badge]', form).innerHTML = pill('Concluído', 'ok');
  setFeedback($('.feedback', form), 'ok', 'Exercício concluído. Missão marcada como terminada.');
  $('[data-action="complete-exercise"]', form).hidden = true;
  const count = $('#exercise-completion-count');
  if (count) count.textContent = String(DATA.exercises.filter((item) => exerciseDone(item.id)).length);
}

function completeLesson(lessonId) {
  const lesson = DATA.lessons[lessonId];
  const quizForm = $(`[data-form="quiz"][data-lesson="${lessonId}"]`);
  const answersComplete = lesson.quiz.every((_, index) => $(`input[name="quiz-${index}"]:checked`, quizForm));
  if (!answersComplete) return;

  const record = progress.lessons[lessonId] ?? { attempts: 0, quizBest: 0 };
  if (!record.completedAt) {
    record.completedAt = Date.now();
    progress.lessons[lessonId] = record;
    logActivity(`Concluiu a aula "${lesson.title}"`);
    saveProgress();
  }
  route({ moveFocus: false });
}

function handleExam(form) {
  const module = findModule(form.dataset.module);
  const questions = DATA.exams[module.id];
  const grade = gradeQuestions(form, questions, 'exam');
  if (grade.answers.includes(-1)) {
    setFeedback($('[data-msg]', form), 'bad', 'Responda todas as questões antes de entregar.');
    return;
  }
  const pct = Math.round((grade.correct / grade.total) * 100);
  const attempt = { at: Date.now(), correct: grade.correct, total: grade.total, pct, answers: grade.answers };
  const wasCompleted = moduleCompleted(module);

  progress.exams[module.id] = [...attemptsOf(module), attempt];
  logActivity(`Fez a prova de "${module.title}": ${pct} pontos`);
  if (pct >= PASS_EXAM) bumpSkills(module.skills, 'aprendizado');
  if (!wasCompleted && moduleCompleted(module)) logActivity(`Concluiu o módulo "${module.title}"`);
  saveProgress();

  viewState.review = { moduleId: module.id, attempt };
  route({ moveFocus: false });
  $('#exam-result')?.focus();
}

function handleStudy(form) {
  const minutes = Math.round(Number(form.elements.minutes.value));
  const message = $('#study-msg');
  if (!minutes || minutes < 1 || minutes > 600) {
    setFeedback(message, 'bad', 'Informe um valor entre 1 e 600 minutos.');
    return;
  }
  const key = dayKey();
  progress.studyLog[key] = (progress.studyLog[key] ?? 0) + minutes;
  logActivity(`Registrou ${minutes} min de estudo`);
  saveProgress();
  renderDashboard();
  setFeedback(message, 'ok', 'Estudo registrado.');
}

function handleProjectChange(target) {
  const project = DATA.projects.find((p) => p.id === target.dataset.project);
  const state = progress.projects[project.id] ?? { status: 'nao-iniciado', github: '' };
  const card = target.closest('.project');
  const message = $('[data-msg]', card);
  message.hidden = true;

  if (target.dataset.field === 'github') {
    const value = target.value.trim();
    if (value && !isGithubUrl(value)) {
      setFeedback(message, 'bad', 'Use um link do GitHub, por exemplo https://github.com/usuario/repositorio.');
      return;
    }
    state.github = value;
  } else {
    const wantsDone = target.value === 'concluido';
    if (wantsDone && !isGithubUrl(state.github)) {
      setFeedback(message, 'bad', 'Para concluir o projeto, informe antes o link do GitHub.');
      target.value = state.status;
      return;
    }
    if (wantsDone && state.status !== 'concluido') {
      bumpSkills(project.skills, 'pratica');
      logActivity(`Concluiu o projeto "${project.title}"`);
    }
    state.status = target.value;
  }
  progress.projects[project.id] = state;
  saveProgress();
}

function handleSkillChange(target) {
  progress.skills[target.dataset.skill] = target.value;
  saveProgress();
  renderCarreira();
  document.getElementById(target.id)?.focus();   // mantém o foco no mesmo campo
}

function resetAll() {
  if (!window.confirm('Apagar todo o progresso salvo neste navegador? Esta ação não pode ser desfeita.')) return;
  progress = defaultProgress();
  viewState.review = null;
  saveProgress();
  route({ moveFocus: false });
}

document.addEventListener('submit', (event) => {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  const handlers = { quiz: handleQuiz, exercise: handleExercise, exam: handleExam, study: handleStudy };
  handlers[form.dataset.form](form);
});

document.addEventListener('change', (event) => {
  const target = event.target;
  const completionForm = target.closest('form[data-form="exercise"], form[data-form="quiz"]');
  if (completionForm) updateCompletionButton(completionForm);
  if (target.dataset.skill) handleSkillChange(target);
  else if (target.dataset.project) handleProjectChange(target);
  else if (target.dataset.note) {
    progress.notes[target.dataset.note] = target.value;
    saveProgress();
  }
});

document.addEventListener('input', (event) => {
  const form = event.target.closest('form[data-form="exercise"], form[data-form="quiz"]');
  if (form) updateCompletionButton(form);
});

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'reset') resetAll();
  if (action === 'retry') route({ moveFocus: false });   // redesenha a aula e libera o quiz
  if (action === 'complete-exercise') completeExercise(event.target.closest('form[data-form="exercise"]'));
  if (action === 'complete-lesson') completeLesson(event.target.dataset.lesson);
});


/* ==========================================================================
   6. NAVEGAÇÃO E MENU
   Rotas pelo "hash" da URL: #pagina ou #pagina/parametro
   (ex.: #sala-de-aula/l-logica, #trilha/f1-m1).
   ========================================================================== */
const PAGE_TITLES = {
  'inicio': 'Início',
  'dashboard': 'Dashboard',
  'trilha': 'Trilha de Estudos',
  'sala-de-aula': 'Sala de Aula',
  'exercicios': 'Exercícios',
  'projetos': 'Projetos',
  'carreira': 'Minha Carreira',
  'materiais': 'Materiais Complementares',
};
const DEFAULT_PAGE = 'inicio';

function parseHash() {
  const [page, param] = window.location.hash.replace('#', '').split('/');
  return { page: page in PAGE_TITLES ? page : DEFAULT_PAGE, param };
}

const RENDERERS = {
  'inicio': () => {},
  'dashboard': renderDashboard,
  'trilha': renderTrilha,
  'sala-de-aula': renderSala,
  'exercicios': renderExercicios,
  'projetos': renderProjetos,
  'carreira': renderCarreira,
  'materiais': renderMateriais,
};

function showPage(page, { moveFocus = true } = {}) {
  const isWelcome = page === 'inicio';
  $('#welcome-screen').hidden = !isWelcome;
  $('#app-shell').hidden = isWelcome;
  $$('[data-page]').forEach((section) => { section.hidden = section.dataset.page !== page; });
  $$('[data-nav]').forEach((link) => {
    if (link.dataset.nav === page) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = `${PAGE_TITLES[page]} | Data Journey Academy`;
  if (moveFocus) {
    window.scrollTo(0, 0);
    $('#conteudo').focus({ preventScroll: true });
  }
}

/** Desenha a tela da rota atual e a exibe. */
function route({ moveFocus = true } = {}) {
  const { page, param } = parseHash();
  if (page !== 'trilha') viewState.review = null;     // a revisão da prova só vale dentro do módulo
  RENDERERS[page](param);
  showPage(page, { moveFocus });
}

/* ----- Menu lateral no celular ----- */
const MOBILE_BREAKPOINT = 900;   // mesmo valor do @media no CSS

function openMenu() {
  document.body.classList.add('nav-open');
  $('[data-menu-toggle]').setAttribute('aria-expanded', 'true');
  $('.nav__link').focus();
}

function closeMenu() {
  if (!document.body.classList.contains('nav-open')) return;
  document.body.classList.remove('nav-open');
  $('[data-menu-toggle]').setAttribute('aria-expanded', 'false');
}

function initMenu() {
  $('[data-menu-toggle]').addEventListener('click', openMenu);
  $$('[data-menu-close]').forEach((el) => el.addEventListener('click', closeMenu));
  $$('[data-nav]').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
      closeMenu();
      $('[data-menu-toggle]').focus();
    }
  });
  window.addEventListener('resize', () => { if (window.innerWidth > MOBILE_BREAKPOINT) closeMenu(); });
}


/* ==========================================================================
   7. INICIALIZAÇÃO
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  window.addEventListener('hashchange', () => { route(); closeMenu(); });
  route({ moveFocus: false });
});
