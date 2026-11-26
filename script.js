/* ==========================================================================
   DATA JOURNEY ACADEMY — script.js
   Organização:
   1. Estado da aplicação (dados)
   2. Funções auxiliares
   3. Renderização do Dashboard
   4. Navegação entre páginas
   5. Menu lateral no celular
   6. Inicialização

   Ideia central: os DADOS ficam no objeto "state" e as funções "render..."
   apenas desenham esses dados na tela. Na etapa de persistência, só será
   preciso trocar a origem do "state" (LocalStorage) sem mexer na tela.
   ========================================================================== */

'use strict';


/* ==========================================================================
   1. ESTADO DA APLICAÇÃO
   Nesta primeira entrega tudo começa zerado e sem avaliação.
   Nenhum percentual é inventado: "evaluated: false" significa que ainda
   não existe base (provas, exercícios, projetos) para calcular a evolução.
   ========================================================================== */
const state = {
  // Indicadores gerais do Dashboard
  stats: {
    lessonsCompleted: 0,
    exercisesDone: 0,
    modulesCompleted: 0,
    studyMinutes: 0,
  },

  // Evolução por carreira. Os totais vêm do plano de competências do projeto.
  tracks: [
    { id: 'engineering', name: 'Engenharia de Dados', evaluated: false, percent: null, level: null, skillsMastered: 0, skillsTotal: 11 },
    { id: 'analysis',    name: 'Análise de Dados',    evaluated: false, percent: null, level: null, skillsMastered: 0, skillsTotal: 9  },
  ],

  // Primeira aula da trilha (Fase 1)
  nextLesson: {
    phase: 'Fase 1: Fundamentos de Python',
    title: 'Lógica de programação',
    goal: 'Entender como transformar um problema em passos que o computador consegue executar.',
  },

  // Cada item futuro terá o formato: { text: 'Concluiu a aula X', time: 'há 2 h' }
  recentActivities: [],
};


/* ==========================================================================
   2. FUNÇÕES AUXILIARES
   ========================================================================== */

/** Atalho para document.querySelector. */
const $  = (selector, root = document) => root.querySelector(selector);
/** Atalho para document.querySelectorAll (já devolve um Array). */
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/** Converte minutos em texto: 0 -> "0 min", 65 -> "1h 05min". */
function formatMinutes(totalMinutes) {
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours}h ${minutes}min`;
}

/** Saudação de acordo com a hora do dia. */
function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** Cria um elemento com classe e texto (textContent evita injetar HTML). */
function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}


/* ==========================================================================
   3. RENDERIZAÇÃO DO DASHBOARD
   ========================================================================== */

/** Saudação do topo. */
function renderGreeting() {
  $('[data-greeting]').textContent = getGreeting();
}

/** Cards de estatísticas: procura elementos com data-stat="nome". */
function renderStats() {
  $$('[data-stat]').forEach((element) => {
    const key = element.dataset.stat;
    const value = state.stats[key];
    element.textContent = key === 'studyMinutes' ? formatMinutes(value) : String(value);
  });
}

/** Monta uma barra de evolução a partir de um item de state.tracks. */
function buildTrack(track) {
  const wrapper = createElement('div', 'track');

  // Linha superior: nome + selo ("Não avaliado" ou percentual)
  const top = createElement('div', 'track__top');
  top.append(createElement('h3', 'track__name', track.name));
  top.append(
    track.evaluated
      ? createElement('span', 'pill pill--value', `${track.percent}%`)
      : createElement('span', 'pill', 'Não avaliado')
  );

  // Barra: sem avaliação fica tracejada e com largura 0
  const bar = createElement('div', track.evaluated ? 'track__bar' : 'track__bar track__bar--unevaluated');
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', `Evolução em ${track.name}`);
  if (track.evaluated) {
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', String(track.percent));
  } else {
    bar.setAttribute('aria-valuetext', 'Não avaliado');
  }
  const fill = createElement('div', 'track__fill');
  bar.append(fill);

  // Informações abaixo da barra
  const meta = createElement('div', 'track__meta');
  meta.append(createElement('span', '', `Nível atual: ${track.level ?? 'não avaliado'}`));
  meta.append(createElement('span', '', `Habilidades dominadas: ${track.skillsMastered} de ${track.skillsTotal}`));

  wrapper.append(top, bar, meta);

  // Define a largura depois de inserir no DOM, para a transição CSS animar
  if (track.evaluated) {
    requestAnimationFrame(() => { fill.style.width = `${track.percent}%`; });
  }
  return wrapper;
}

/** Barras de Engenharia de Dados e Análise de Dados. */
function renderTracks() {
  const container = $('#progress-list');
  container.replaceChildren(...state.tracks.map(buildTrack));
}

/** Seção "Próxima aula". */
function renderNextLesson() {
  $('#next-phase').textContent  = state.nextLesson.phase;
  $('#next-lesson').textContent = state.nextLesson.title;
  $('#next-goal').textContent   = state.nextLesson.goal;
}

/** Seção "Atividades recentes": mostra a lista ou o estado vazio. */
function renderRecentActivities() {
  const list  = $('#recent-list');
  const empty = $('#recent-empty');
  const hasItems = state.recentActivities.length > 0;

  list.hidden  = !hasItems;
  empty.hidden = hasItems;

  list.replaceChildren(
    ...state.recentActivities.map((activity) => {
      const item = createElement('li', 'recent__item');
      item.append(
        createElement('span', 'recent__text', activity.text),
        createElement('span', 'recent__time', activity.time)
      );
      return item;
    })
  );
}

/** Desenha o Dashboard inteiro. */
function renderDashboard() {
  renderGreeting();
  renderStats();
  renderTracks();
  renderNextLesson();
  renderRecentActivities();
}


/* ==========================================================================
   4. NAVEGAÇÃO ENTRE PÁGINAS
   Funciona com o "hash" da URL (ex.: index.html#projetos).
   Vantagens: não recarrega a página, o botão "voltar" do navegador funciona
   e cada página tem um endereço próprio.
   ========================================================================== */
const PAGE_TITLES = {
  'dashboard':    'Dashboard',
  'trilha':       'Trilha de Estudos',
  'sala-de-aula': 'Sala de Aula',
  'exercicios':   'Exercícios',
  'projetos':     'Projetos',
  'carreira':     'Minha Carreira',
  'materiais':    'Materiais Complementares',
};
const DEFAULT_PAGE = 'dashboard';

/** Lê a página pedida na URL; se for inválida, volta ao Dashboard. */
function getCurrentPage() {
  const requested = window.location.hash.replace('#', '');
  return requested in PAGE_TITLES ? requested : DEFAULT_PAGE;
}

/** Mostra a página atual e esconde as outras. */
function showPage(pageId, { moveFocus = true } = {}) {
  // 1. Exibir apenas a seção escolhida
  $$('[data-page]').forEach((section) => {
    section.hidden = section.dataset.page !== pageId;
  });

  // 2. Marcar o item ativo no menu (aria-current informa leitores de tela)
  $$('[data-nav]').forEach((link) => {
    if (link.dataset.nav === pageId) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  // 3. Atualizar o título da aba
  document.title = `${PAGE_TITLES[pageId]} | Data Journey Academy`;

  // 4. Voltar ao topo e levar o foco ao conteúdo (acessibilidade por teclado)
  window.scrollTo(0, 0);
  if (moveFocus) $('#conteudo').focus({ preventScroll: true });
}

/** Reage a cliques em links e ao botão "voltar" do navegador. */
function initRouter() {
  window.addEventListener('hashchange', () => {
    showPage(getCurrentPage());
    closeMenu();
  });
  // Primeira carga: não rouba o foco do início da página
  showPage(getCurrentPage(), { moveFocus: false });
}


/* ==========================================================================
   5. MENU LATERAL NO CELULAR
   No celular a sidebar vira um painel deslizante. O CSS mostra o painel
   quando o <body> tem a classe "nav-open".
   ========================================================================== */
const MOBILE_BREAKPOINT = 900; // mesmo valor do @media no CSS

function openMenu() {
  document.body.classList.add('nav-open');
  $('[data-menu-toggle]').setAttribute('aria-expanded', 'true');
  // Leva o foco para o primeiro link do menu
  $('.nav__link').focus();
}

function closeMenu() {
  if (!document.body.classList.contains('nav-open')) return;
  document.body.classList.remove('nav-open');
  const toggle = $('[data-menu-toggle]');
  toggle.setAttribute('aria-expanded', 'false');
}

function initMenu() {
  $('[data-menu-toggle]').addEventListener('click', openMenu);
  $$('[data-menu-close]').forEach((element) => element.addEventListener('click', closeMenu));

  // Clicar em um item do menu fecha o painel (mesmo se já estiver na mesma página)
  $$('[data-nav]').forEach((link) => link.addEventListener('click', closeMenu));

  // Esc fecha o menu
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
      closeMenu();
      $('[data-menu-toggle]').focus();
    }
  });

  // Ao ampliar a janela, garante que o menu não fique "preso" aberto
  window.addEventListener('resize', () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) closeMenu();
  });
}


/* ==========================================================================
   6. INICIALIZAÇÃO
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  initMenu();
  initRouter();
});
