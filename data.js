/* ==========================================================================
   DATA JOURNEY ACADEMY — data.js
   Todo o CONTEÚDO da plataforma fica aqui, separado da lógica (script.js).
   Para adicionar uma aula nova:
     1. Crie a aula em DATA.lessons
     2. Liste o id dela em "lessons" do módulo (veja o final do arquivo)
     3. Crie exercícios em DATA.exercises (campo "lesson") e a prova em DATA.exams.
        Questões de múltipla escolha devem ter quatro opções; a interface embaralha
        as alternativas e distribui o gabarito de forma equilibrada entre A e D.
     4. Adicione materiais em DATA.materials
   Nada precisa mudar no script.js.
   ========================================================================== */

const DATA = {};

/* --------------------------------------------------------------------------
   1. TRILHA: fases e módulos (conforme o plano do projeto)
   -------------------------------------------------------------------------- */
const PHASE_DEFS = [
  ['Fundamentos de Python', ['Lógica de programação', 'Variáveis e tipos de dados', 'Condicionais', 'Loops', 'Listas', 'Tuplas', 'Dicionários', 'Funções', 'Tratamento de erros', 'Manipulação de arquivos']],
  ['Manipulação de dados', ['CSV e JSON', 'Excel e Parquet', 'Pandas e NumPy', 'Limpeza de dados e valores ausentes', 'Agrupamentos e transformações']],
  ['SQL e banco de dados', ['SELECT, WHERE e ORDER BY', 'GROUP BY e JOIN', 'Subqueries e CTE', 'Window Functions', 'PostgreSQL, MySQL e SQLAlchemy']],
  ['Coleta de dados', ['Consumo de APIs', 'Web Scraping com BeautifulSoup', 'Automação de scripts', 'Paginação e tratamento de erros']],
  ['Análise de dados', ['Estatística básica', 'Análise exploratória', 'Visualização com Matplotlib e Seaborn', 'Power BI e dashboards']],
  ['Engenharia de dados', ['ETL e ELT', 'Pipelines', 'Modelagem e Data Warehouse', 'Data Lake e arquitetura de dados', 'Processamento em lote com PySpark e Polars']],
  ['Orquestração e infraestrutura', ['Git e GitHub', 'Linux e terminal', 'Docker', 'Airflow e Mage', 'POO e testes com Pytest', 'Cloud e fundamentos de AWS']],
  ['Portfólio profissional', ['Projetos completos de mercado']],
];

DATA.phases = PHASE_DEFS.map(([title, modules], i) => ({
  id: `f${i + 1}`,
  title,
  modules: modules.map((moduleTitle, j) => ({ id: `f${i + 1}-m${j + 1}`, title: moduleTitle, lessons: [], skills: [] })),
}));

/* --------------------------------------------------------------------------
   2. AULAS
   -------------------------------------------------------------------------- */
DATA.lessons = {
  'l-logica': {
    id: 'l-logica',
    title: 'Lógica de programação',
    objective: 'Descrever um problema como uma sequência de passos, com decisões e repetições, antes de escrever qualquer código.',
    concept: [
      'Programar é dar instruções a um computador. Ele executa exatamente o que você escreve, sem adivinhar nada. Por isso, antes do código vem a lógica: pensar o problema em passos claros.',
      'Todo algoritmo (uma lista de passos que resolve um problema) usa três blocos: sequência, decisão e repetição.',
    ],
    analogy: 'Pense em uma receita de bolo. A receita é uma sequência de passos. "Se a massa estiver seca, adicione leite" é uma decisão. "Mexa até ficar homogêneo" é uma repetição. Se faltar um passo, o bolo dá errado, e com o computador é igual.',
    commands: [
      { name: 'Sequência', text: 'Os passos rodam de cima para baixo, um de cada vez. A ordem importa: calcular antes de mostrar o resultado.' },
      { name: 'if / else (decisão)', text: 'Executa um bloco somente se a condição for verdadeira. O else define o que fazer quando ela é falsa.' },
      { name: 'for (repetição)', text: 'Repete um bloco para cada item de uma lista. Evita copiar o mesmo código várias vezes.' },
      { name: 'print()', text: 'Mostra uma mensagem na tela. Usamos para acompanhar o que o programa está fazendo.' },
    ],
    whenToUse: 'Em engenharia de dados, quase todo processo combina os três blocos: percorrer vários arquivos (repetição), checar a qualidade de cada um (decisão) e gravar o resultado em ordem (sequência).',
    code: `# Problema: decidir se uma carga de dados pode seguir adiante
linhas_lidas = 1200
linhas_com_erro = 30

# 1) Sequência: calcular a taxa de erro em porcentagem
taxa_erro = linhas_com_erro / linhas_lidas * 100

# 2) Decisão: reprovar a carga se houver erro demais
if taxa_erro > 5:
    print("Carga reprovada: erros acima do limite")
else:
    print("Carga aprovada")

# 3) Repetição: fazer a mesma coisa para cada arquivo
for arquivo in ["vendas.csv", "clientes.csv"]:
    print("Processando", arquivo)`,
    professional: 'Antes de carregar dados em um data warehouse, os pipelines conferem a taxa de linhas com erro. Se passar do limite, a carga é interrompida e a equipe é avisada, o que evita que dados ruins cheguem aos relatórios da empresa.',
    challenge: 'Escreva, em português e em passos numerados, o algoritmo de um programa que recebe 3 arquivos de vendas, confere se cada um tem mais de 0 linhas e avisa quais estão vazios. Use pelo menos uma decisão e uma repetição.',
    quiz: [
      { q: 'Quais são os três blocos básicos de qualquer algoritmo?', options: ['Entrada, saída e erro', 'Sequência, decisão e repetição', 'Variável, função e classe', 'Banco de dados, arquivo e gráfico'], answer: 1, explain: 'Sequência, decisão e repetição combinados resolvem a grande maioria dos problemas.' },
      { q: 'Em "se a taxa de erro passar de 5%, reprovar a carga", qual bloco está sendo usado?', options: ['Decisão', 'Repetição', 'Sequência apenas', 'Declaração de uma variável'], answer: 0, explain: 'Há uma condição (passar de 5%) que define se uma ação acontece. Isso é uma decisão.' },
      { q: 'Por que pensar na lógica antes de escrever código?', options: ['Porque o computador entende português', 'Porque o computador faz exatamente o que foi escrito, então os passos precisam estar certos', 'Porque assim o código fica mais curto automaticamente', 'Porque a lógica dispensa testar o programa'], answer: 1, explain: 'O computador não adivinha intenções. Passos mal pensados viram erros no código.' },
    ],
  },
};

/* --------------------------------------------------------------------------
   3. EXERCÍCIOS
   Tipos: choice (múltipla escolha), bool (verdadeiro/falso),
          code (completar código), error (identificar erro), script (escrever)
   -------------------------------------------------------------------------- */
DATA.exercises = [
  {
    id: 'ex-logica-1', lesson: 'l-logica', type: 'choice', level: 'Fácil',
    prompt: 'Qual é a melhor definição de algoritmo?',
    options: ['Um programa escrito em Python', 'Uma sequência finita de passos que resolve um problema', 'Um tipo de banco de dados', 'Uma lista de comandos sem objetivo definido'],
    answer: 1,
    explain: 'Algoritmo é a ideia, os passos. O Python é só uma das linguagens em que podemos escrevê-lo.',
  },
  {
    id: 'ex-logica-2', lesson: 'l-logica', type: 'bool', level: 'Fácil',
    prompt: 'Em uma decisão (if), os comandos dentro do bloco sempre são executados.',
    answer: 1,
    explain: 'Falso. O bloco só roda quando a condição é verdadeira. Se for falsa, ele é ignorado (ou roda o else).',
  },
  {
    id: 'ex-logica-3', lesson: 'l-logica', type: 'code', level: 'Médio',
    prompt: 'Complete o espaço para reprovar a carga quando a taxa de erro for MAIOR que 5. Digite apenas o operador.',
    code: 'if taxa_erro ___ 5:\n    print("Carga reprovada")',
    accept: ['>'],
    explain: 'O operador ">" significa "maior que". Já ">=" incluiria o valor 5, o que muda a regra.',
  },
  {
    id: 'ex-logica-4', lesson: 'l-logica', type: 'error', level: 'Médio',
    prompt: 'O código abaixo nunca termina. Por quê?',
    code: 'contador = 0\nwhile contador < 3:\n    print(contador)',
    options: ['O print está escrito errado', 'O valor de contador nunca muda, então a condição fica sempre verdadeira', 'O while não existe em Python', 'A variável contador começa com zero'],
    answer: 1,
    explain: 'Faltou atualizar o contador dentro do laço (por exemplo, contador = contador + 1). Sem isso a condição nunca fica falsa.',
  },
  {
    id: 'ex-logica-5', lesson: 'l-logica', type: 'script', level: 'Difícil',
    prompt: 'Escreva um laço for que imprima os números de 1 a 3, um por linha.',
    checks: ['for\\s+\\w+\\s+in\\s+range\\(\\s*1\\s*,\\s*4\\s*\\)', 'print\\s*\\('],
    explain: 'Uma solução possível:\nfor numero in range(1, 4):\n    print(numero)\nO range(1, 4) começa em 1 e para antes do 4.',
  },
];

/* --------------------------------------------------------------------------
   4. PROVAS (5 a 10 questões; aprovação com 70 pontos)
   -------------------------------------------------------------------------- */
DATA.exams = {
  'f1-m1': [
    { q: 'O que é um algoritmo?', options: ['Uma linguagem de programação', 'Uma sequência de passos que resolve um problema', 'Um arquivo de dados', 'Um dispositivo que executa instruções'], answer: 1, explain: 'Algoritmo é a lista de passos, independente da linguagem usada para escrevê-lo.' },
    { q: 'Qual bloco permite executar o mesmo passo para cada arquivo de uma lista?', options: ['Decisão', 'Repetição', 'Comentário', 'Atribuição'], answer: 1, explain: 'A repetição (for) aplica o mesmo bloco a cada item da lista.' },
    { q: 'O que o código abaixo mostra?', code: 'nota = 6\nif nota >= 7:\n    print("Aprovado")\nelse:\n    print("Recuperação")', options: ['Aprovado', 'Recuperação', 'Nada', 'Ocorre um erro de sintaxe'], answer: 1, explain: '6 não é maior ou igual a 7, então a condição é falsa e o else é executado.' },
    { q: 'Por que a ordem dos passos importa em uma sequência?', options: ['Porque o computador executa de cima para baixo, e um passo pode depender do anterior', 'Porque o computador escolhe a ordem sozinho', 'Não importa, o resultado é o mesmo', 'Porque o computador executa todas as instruções ao mesmo tempo'], answer: 0, explain: 'Calcular a média antes de ler as notas, por exemplo, gera resultado errado.' },
    { q: 'Quantas vezes o print roda no código abaixo?', code: 'for numero in [10, 20, 30]:\n    print(numero)', options: ['1 vez', '3 vezes', 'Infinitas vezes', '2 vezes'], answer: 1, explain: 'O laço roda uma vez para cada item da lista, e a lista tem 3 itens.' },
  ],
};

/* --------------------------------------------------------------------------
   5. PROJETOS PRÁTICOS (progressivos)
   -------------------------------------------------------------------------- */
DATA.projects = [
  {
    id: 'p1', title: 'Limpeza de um CSV de vendas',
    problem: 'Uma loja exporta vendas em CSV com datas em formatos diferentes, valores vazios e linhas duplicadas.',
    goal: 'Gerar um arquivo limpo e padronizado, pronto para análise.',
    techs: ['Python', 'CSV', 'Pandas'],
    steps: ['Ler o arquivo', 'Identificar problemas', 'Padronizar datas e valores', 'Remover duplicados', 'Salvar o resultado'],
    challenges: 'Decidir o que fazer com valores ausentes sem distorcer os totais.',
    criteria: ['O arquivo final não tem duplicados', 'Datas no mesmo formato', 'Script roda do início ao fim sem intervenção'],
    skills: ['a-python', 'e-python', 'a-pandas'],
  },
  {
    id: 'p2', title: 'Coletor de dados de uma API pública',
    problem: 'Uma equipe precisa de dados atualizados de uma API, mas hoje copia tudo à mão.',
    goal: 'Automatizar a coleta com paginação e salvar o resultado em JSON.',
    techs: ['Python', 'Requests', 'JSON'],
    steps: ['Estudar a documentação da API', 'Fazer a primeira requisição', 'Percorrer as páginas', 'Tratar erros e limites', 'Salvar em JSON'],
    challenges: 'Lidar com falhas de rede e limite de requisições.',
    criteria: ['Coleta todas as páginas', 'Trata erros sem quebrar', 'Código separado em funções'],
    skills: ['e-apis', 'e-python'],
  },
  {
    id: 'p3', title: 'Análise de vendas com SQL e Pandas',
    problem: 'A diretoria quer saber quais produtos e regiões geram mais receita.',
    goal: 'Responder perguntas de negócio com consultas SQL e gráficos.',
    techs: ['SQL', 'PostgreSQL', 'Pandas', 'Matplotlib'],
    steps: ['Modelar as tabelas', 'Carregar os dados', 'Escrever as consultas', 'Visualizar os resultados', 'Escrever as conclusões'],
    challenges: 'Usar JOIN e agregações sem duplicar valores.',
    criteria: ['Pelo menos 5 consultas respondendo perguntas reais', 'Gráficos legíveis', 'Conclusões escritas em linguagem simples'],
    skills: ['a-sql', 'e-sql', 'a-eda', 'a-viz'],
  },
  {
    id: 'p4', title: 'Pipeline ETL completo',
    problem: 'Dados chegam de fontes diferentes e precisam ser organizados todo dia em um banco analítico.',
    goal: 'Construir um pipeline que extrai, transforma e carrega dados de forma automática.',
    techs: ['Python', 'SQL', 'Docker', 'Airflow'],
    steps: ['Desenhar a arquitetura', 'Extrair das fontes', 'Transformar e validar', 'Carregar no banco', 'Orquestrar e agendar', 'Documentar'],
    challenges: 'Garantir que reexecutar o pipeline não duplique dados.',
    criteria: ['Roda agendado', 'Tem validação de qualidade', 'README explica como executar'],
    skills: ['e-etl', 'e-pipelines', 'e-docker', 'e-airflow'],
  },
];

/* --------------------------------------------------------------------------
   6. CARREIRAS E COMPETÊNCIAS
   -------------------------------------------------------------------------- */
DATA.careers = [
  {
    id: 'engineering', name: 'Engenharia de Dados',
    skills: [
      ['e-python', 'Python'], ['e-sql', 'SQL'], ['e-db', 'Bancos de dados'], ['e-apis', 'APIs'], ['e-etl', 'ETL/ELT'], ['e-pipelines', 'Pipelines'],
      ['e-docker', 'Docker'], ['e-airflow', 'Airflow'], ['e-pyspark', 'PySpark'], ['e-cloud', 'Cloud'], ['e-arch', 'Arquitetura de dados'],
    ],
  },
  {
    id: 'analysis', name: 'Análise de Dados',
    skills: [
      ['a-excel', 'Excel'], ['a-sql', 'SQL'], ['a-python', 'Python'], ['a-pandas', 'Pandas'], ['a-stats', 'Estatística'],
      ['a-powerbi', 'Power BI'], ['a-viz', 'Visualização'], ['a-eda', 'Análise exploratória'], ['a-comm', 'Comunicação de resultados'],
    ],
  },
];

DATA.skillStatus = [
  { id: 'nao-iniciado', label: 'Não iniciado', points: 0 },
  { id: 'aprendizado', label: 'Em aprendizado', points: 0.25 },
  { id: 'pratica', label: 'Em prática', points: 0.6 },
  { id: 'dominado', label: 'Dominado', points: 1 },
];

/* --------------------------------------------------------------------------
   7. MATERIAIS COMPLEMENTARES (somente links oficiais e conhecidos)
   Antes de publicar, confira cada link no navegador.
   -------------------------------------------------------------------------- */
DATA.materials = {
  'l-logica': [
    { type: 'Documentação', title: 'Tutorial oficial do Python: uma introdução informal', url: 'https://docs.python.org/pt-br/3/tutorial/introduction.html', lang: 'Português' },
    { type: 'Documentação', title: 'Tutorial oficial do Python: ferramentas de controle de fluxo', url: 'https://docs.python.org/pt-br/3/tutorial/controlflow.html', lang: 'Português' },
    { type: 'Vídeo', title: 'Canal Curso em Vídeo (procure a playlist do curso de Python 3)', url: 'https://www.youtube.com/@cursoemvideo', lang: 'Português' },
  ],
};

/* --------------------------------------------------------------------------
   8. LIGAÇÃO ENTRE MÓDULOS, AULAS E COMPETÊNCIAS
   -------------------------------------------------------------------------- */
(function linkModules() {
  const module1 = DATA.phases[0].modules[0];
  module1.lessons = ['l-logica'];
  module1.skills = ['a-python', 'e-python'];   // competências que a aprovação na prova desbloqueia
})();
