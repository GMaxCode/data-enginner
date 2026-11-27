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
  ['Fundamentos de Python', [
    'Introdução à programação e lógica', 'Variáveis e tipos de dados',
    'Operadores aritméticos, relacionais e lógicos', 'Estruturas condicionais',
    'Estruturas de repetição', 'Listas e tuplas', 'Dicionários e conjuntos',
    'Funções', 'Manipulação de arquivos e tratamento de exceções',
    'Programação aplicada e projeto de fundamentos',
  ]],
  ['Manipulação de Dados', [
    'Manipulação de Arquivos e Formatos de Dados', 'NumPy para Manipulação Numérica',
    'Pandas para Manipulação de Dados', 'Limpeza e Qualidade de Dados',
    'Agrupamento e Transformação de Dados',
  ]],
  ['SQL e Banco de Dados', [
    'Fundamentos de Banco de Dados', 'Consultas SQL e Filtragem',
    'Agrupamentos e Funções SQL', 'Relacionamentos e Manipulação de Dados',
    'Python Integrado a Bancos de Dados',
  ]],
  ['Coleta de Dados', [
    'Fundamentos de APIs e HTTP', 'Consumo e Integração de APIs',
    'Web Scraping com Python', 'Automação e Ingestão de Dados',
  ]],
  ['Análise de Dados', [
    'Fundamentos de Análise de Dados', 'Estatística Aplicada',
    'Análise Exploratória de Dados (EDA)', 'Visualização de Dados',
    'Indicadores e Relatórios Analíticos',
  ]],
  ['Engenharia de Dados', [
    'Fundamentos da Engenharia de Dados', 'Arquitetura e Armazenamento de Dados',
    'ETL e ELT na Prática', 'Processamento com Pandas e Polars',
    'Modelagem e Qualidade de Dados', 'Big Data e PySpark',
  ]],
  ['Orquestração e Infraestrutura', [
    'Fundamentos de Orquestração', 'Apache Airflow',
    'Docker para Engenharia de Dados', 'Testes, Código e Boas Práticas',
    'Infraestrutura, Monitoramento e Nuvem',
  ]],
  ['Portfólio Profissional', [
    'Git, GitHub e Organização de Projetos', 'Documentação e Apresentação Técnica',
    'Currículo, LinkedIn e Entrevistas',
  ]],
  ['Projetos Completos de Mercado', [
    'Projeto: Pipeline de Vendas', 'Projeto: Dados de Transporte Público',
    'Projeto: Pipeline Financeiro', 'Projeto: Data Lake e Arquitetura Medalhão',
    'Projeto: Big Data com PySpark', 'Projeto Final: Pipeline de Produção',
  ]],
];

DATA.phases = PHASE_DEFS.map(([title, modules], i) => ({
  id: `f${i + 1}`,
  title,
  modules: modules.map((moduleTitle, j) => ({ id: `f${i + 1}-m${j + 1}`, title: moduleTitle, lessons: [], skills: [] })),
}));

/* --------------------------------------------------------------------------
   2. AULAS
   -------------------------------------------------------------------------- */
const phase2QuizQuestion = (q, options, answer, explain) => ({ q, options, answer, explain });
const phase2FileLesson = (lesson) => ({
  level: 'Iniciante',
  estimatedMinutes: 40,
  video: null,
  ...lesson,
});

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
  'l-formatos-dados': phase2FileLesson({
    id: 'l-formatos-dados', title: 'Introdução aos formatos de dados',
    objective: 'Escolher formatos adequados para trocar, analisar e armazenar dados.',
    introduction: 'Um formato define como os dados são organizados em um arquivo. A extensão ajuda a identificar o formato, mas não garante sozinha que o conteúdo esteja válido.',
    concept: ['CSV representa tabelas em texto; JSON representa objetos e listas; XLSX é uma planilha; Parquet é um formato colunar binário usado em análise. Cada formato favorece usos diferentes.'],
    analogy: 'São como embalagens: todas podem transportar os mesmos produtos, mas algumas organizam melhor itens frágeis, outras ocupam menos espaço ou são mais fáceis de inspecionar.',
    commands: [{ name: 'Extensão e conteúdo', text: 'Confira a extensão e também tente ler uma amostra: arquivos renomeados podem não corresponder ao formato anunciado.' }],
    whenToUse: 'Use CSV para intercâmbio tabular simples, JSON para estruturas hierárquicas e Parquet para consultas analíticas eficientes.',
    code: 'formatos = {"tabela": "CSV", "hierarquia": "JSON", "analise": "Parquet"}\nfor uso, formato in formatos.items():\n    print(uso, "->", formato)',
    codeWalkthrough: ['A variável formatos relaciona cada necessidade a uma opção de formato.', 'O laço percorre os pares de chave e valor do dicionário.', 'print mostra a escolha para cada uso.'],
    professional: 'Uma ingestão pode receber JSON de uma API, normalizar os registros em uma tabela e gravar Parquet para processamento posterior.',
    commonErrors: ['Escolher um formato apenas pela extensão; inspecione o conteúdo antes de ler.', 'Tratar JSON como tabela plana; percorra e normalize objetos e listas aninhados.'],
    challenge: 'Para um catálogo de produtos recebido de uma API e um histórico de vendas tabular, escolha um formato de entrada e outro para análise. Justifique a decisão.',
    completionCriteria: ['Diferenciar formatos tabulares e hierárquicos.', 'Justificar uma escolha considerando legibilidade, estrutura e volume.'],
    quiz: [
      phase2QuizQuestion('Qual formato representa naturalmente objetos e listas aninhados?', ['CSV', 'JSON', 'Parquet', 'TXT sem estrutura'], 1, 'JSON representa objetos e listas hierárquicos.'),
      phase2QuizQuestion('Qual formato costuma ser conveniente para trocar tabelas simples em texto?', ['CSV', 'XLSX', 'Parquet', 'PNG'], 0, 'CSV é texto tabular simples e amplamente interoperável.'),
      phase2QuizQuestion('Qual afirmação sobre a extensão do arquivo é correta?', ['Ela prova que o conteúdo está válido', 'Ela não garante que o conteúdo corresponda ao formato', 'Ela converte o arquivo automaticamente', 'Ela informa o número de linhas'], 1, 'Renomear um arquivo não converte seu conteúdo.'),
      phase2QuizQuestion('Qual formato é colunar e comum em análise de dados?', ['Parquet', 'JSON', 'HTML', 'TXT'], 0, 'Parquet organiza dados por colunas e é adequado a leituras analíticas.'),
      phase2QuizQuestion('Para que serve conhecer o formato antes de ler um arquivo?', ['Para escolher uma ferramenta e interpretar a estrutura corretamente', 'Para evitar qualquer validação', 'Para aumentar automaticamente a qualidade', 'Para dispensar o esquema dos dados'], 0, 'A estrutura do formato determina como os dados devem ser interpretados.'),
    ],
  }),
  'l-csv': phase2FileLesson({
    id: 'l-csv', title: 'Trabalhando com arquivos CSV',
    objective: 'Ler e gravar tabelas CSV considerando cabeçalho, delimitador e codificação.',
    introduction: 'CSV armazena registros em linhas e campos separados por um delimitador. Em Python, o módulo csv oferece leitura e escrita sem exigir uma biblioteca externa.',
    concept: ['Cabeçalho nomeia as colunas. Delimitador, aspas e codificação precisam ser tratados de acordo com o arquivo real.', 'O módulo csv trabalha com linhas e dicionários, preservando valores como texto até que sejam convertidos.'],
    analogy: 'Uma tabela CSV é como uma planilha impressa em texto: cada linha é um registro e o separador indica onde termina uma célula.',
    commands: [{ name: 'csv.DictReader', text: 'Lê cada registro como um dicionário cujas chaves vêm do cabeçalho.' }, { name: 'encoding', text: 'Define a codificação; UTF-8 é uma escolha comum para textos.' }],
    whenToUse: 'Use CSV para intercâmbio de tabelas simples, verificando delimitador, cabeçalho e codificação antes de processar.',
    code: 'import csv\nwith open("vendas.csv", newline="", encoding="utf-8") as arquivo:\n    for linha in csv.DictReader(arquivo):\n        print(linha["produto"])',
    codeWalkthrough: ['import csv carrega as ferramentas do formato.', 'with abre o arquivo e garante seu fechamento.', 'DictReader associa campos às colunas do cabeçalho.', 'O laço percorre registros e acessa a coluna produto.'],
    professional: 'Em cargas de vendas, validar cabeçalhos e tipos antes de inserir registros evita que valores deslocados contaminem relatórios.',
    commonErrors: ['Esquecer encoding e obter caracteres corrompidos; informe encoding="utf-8".', 'Supor que todo CSV usa vírgula; confira o delimitador e configure o leitor.', 'Converter números com separadores locais sem normalizar; padronize o texto antes da conversão.'],
    challenge: 'Leia vendas.csv com DictReader, conte os registros e liste os produtos. Registre como você verificaria o delimitador e o cabeçalho.',
    completionCriteria: ['Ler CSV com DictReader e UTF-8.', 'Explicar delimitador, cabeçalho e fechamento seguro do arquivo.'],
    quiz: [
      phase2QuizQuestion('O que csv.DictReader usa como nomes das chaves?', ['O cabeçalho do arquivo', 'O número da linha', 'A extensão do arquivo', 'Os valores da última coluna'], 0, 'DictReader usa o cabeçalho para nomear os campos.'),
      phase2QuizQuestion('Por que usar newline="" ao abrir CSV para leitura?', ['Para evitar tratamento inconsistente de quebras de linha pelo módulo csv', 'Para remover linhas vazias sempre', 'Para converter o arquivo em JSON', 'Para limitar o número de registros'], 0, 'Essa configuração é recomendada pelo módulo csv para lidar com quebras de linha.'),
      phase2QuizQuestion('Qual parâmetro define como os bytes do arquivo viram texto?', ['encoding', 'delimiter', 'header', 'newline'], 0, 'encoding especifica a codificação de caracteres.'),
      phase2QuizQuestion('O que pode acontecer se o delimitador presumido estiver errado?', ['Campos podem ser lidos juntos ou separados incorretamente', 'O arquivo vira automaticamente Parquet', 'As linhas são ordenadas', 'O cabeçalho é corrigido sozinho'], 0, 'Um delimitador incorreto altera a divisão dos campos.'),
      phase2QuizQuestion('Qual é uma vantagem de DictReader?', ['Acessar campos pelo nome da coluna', 'Inferir todos os tipos com certeza', 'Ignorar linhas inválidas automaticamente', 'Substituir o cabeçalho por índices'], 0, 'DictReader facilita acessar cada campo pelo nome.'),
    ],
  }),
  'l-json': phase2FileLesson({
    id: 'l-json', title: 'Trabalhando com arquivos JSON',
    objective: 'Ler e gravar objetos JSON em Python e acessar dados aninhados com segurança.',
    introduction: 'JSON representa valores, listas e objetos aninhados. O módulo padrão json converte entre esse texto e estruturas Python.',
    concept: ['json.load lê de um arquivo; json.dump grava em um arquivo. json.loads e json.dumps trabalham com strings.', 'Objetos JSON viram dicionários e arrays viram listas.'],
    analogy: 'JSON é como uma ficha com campos que podem conter outras fichas ou listas, em vez de uma tabela retangular.',
    commands: [{ name: 'json.load', text: 'Lê um documento JSON de um objeto de arquivo.' }, { name: 'json.dump', text: 'Serializa um objeto Python para um arquivo JSON.' }],
    whenToUse: 'Use JSON para APIs, configurações e dados hierárquicos; valide chaves e tipos antes de consumi-los.',
    code: 'import json\nwith open("pedido.json", encoding="utf-8") as arquivo:\n    pedido = json.load(arquivo)\nprint(pedido["cliente"]["nome"])',
    codeWalkthrough: ['import json carrega o módulo padrão.', 'with abre o arquivo em texto.', 'json.load converte o documento em estruturas Python.', 'As chaves cliente e nome acessam níveis aninhados.'],
    professional: 'Respostas de APIs frequentemente contêm listas aninhadas; validar a estrutura evita falhas quando um campo opcional não vem.',
    commonErrors: ['Usar load com uma string; use loads para texto e load para arquivo.', 'Presumir que todas as chaves estão presentes; valide ou use get com valor padrão.', 'Usar aspas simples no documento JSON; grave strings com aspas duplas.'],
    challenge: 'Leia pedido.json, verifique se cliente existe e então mostre o nome; trate a ausência da chave sem interromper o processamento.',
    completionCriteria: ['Distinguir load de loads.', 'Acessar e validar campos aninhados antes do uso.'],
    quiz: [
      phase2QuizQuestion('Qual função lê JSON diretamente de um arquivo aberto?', ['json.load', 'json.loads', 'json.dump', 'json.dumps'], 0, 'load recebe um objeto de arquivo.'),
      phase2QuizQuestion('Qual estrutura Python normalmente representa um objeto JSON?', ['Dicionário', 'Tupla', 'Conjunto', 'Bytes'], 0, 'Objetos JSON são convertidos em dicionários Python.'),
      phase2QuizQuestion('O que json.loads recebe?', ['Uma string JSON', 'Um caminho de arquivo apenas', 'Um DataFrame', 'Uma conexão SQL'], 0, 'loads converte texto JSON em estrutura Python.'),
      phase2QuizQuestion('Como reduzir erro ao acessar uma chave que pode faltar?', ['Verificar a chave ou usar get com valor padrão', 'Assumir que sempre existe', 'Converter o dicionário em conjunto', 'Abrir o arquivo em modo binário'], 0, 'A validação ou get permite tratar campos opcionais.'),
      phase2QuizQuestion('Qual sintaxe é exigida para strings em JSON?', ['Aspas duplas', 'Aspas simples obrigatórias', 'Sem aspas', 'Crases'], 0, 'A especificação JSON exige aspas duplas para strings.'),
    ],
  }),
  'l-excel': phase2FileLesson({
    id: 'l-excel', title: 'Trabalhando com arquivos Excel',
    objective: 'Ler e gravar planilhas Excel com Pandas, escolhendo planilhas e colunas explicitamente.',
    introduction: 'Arquivos XLSX podem conter várias planilhas. Pandas oferece read_excel e to_excel; a leitura depende de um mecanismo compatível instalado.',
    concept: ['Use sheet_name para escolher uma planilha e usecols para limitar colunas. Inspecione as primeiras linhas e os tipos depois da leitura.', 'Escrever Excel pode exigir um mecanismo como openpyxl instalado no ambiente.'],
    analogy: 'Um arquivo Excel é um fichário: o arquivo é o fichário e cada worksheet é uma folha ou aba com uma tabela.',
    commands: [{ name: 'pd.read_excel', text: 'Lê uma planilha e devolve um DataFrame.' }, { name: 'sheet_name', text: 'Seleciona a aba pelo nome ou índice.' }],
    whenToUse: 'Use Excel quando a fonte for uma planilha de negócio; para pipelines, prefira explicitar a aba e validar colunas.',
    code: 'import pandas as pd\ndf = pd.read_excel("vendas.xlsx", sheet_name="Jan")\nprint(df.head())',
    codeWalkthrough: ['Importa Pandas com o alias convencional pd.', 'Lê a aba Jan como DataFrame.', 'head mostra uma amostra para inspeção.'],
    professional: 'Relatórios recebidos por e-mail podem ter abas mensais; selecionar a aba pelo nome evita processar uma tabela auxiliar por engano.',
    commonErrors: ['Ler a aba padrão por engano; informe sheet_name explicitamente.', 'Ignorar linhas de título antes do cabeçalho; ajuste header ou skiprows após inspecionar a planilha.', 'Supor que openpyxl está instalado; instale e declare o engine no ambiente do projeto.'],
    challenge: 'Leia a aba Vendas de um arquivo, confira as colunas esperadas e exporte uma amostra para outro arquivo XLSX.',
    completionCriteria: ['Selecionar a aba correta.', 'Inspecionar colunas e amostra antes de transformar dados.'],
    quiz: [
      phase2QuizQuestion('Qual argumento seleciona uma aba pelo nome em read_excel?', ['sheet_name', 'delimiter', 'encoding', 'orient'], 0, 'sheet_name define qual planilha será lida.'),
      phase2QuizQuestion('O que read_excel normalmente retorna?', ['DataFrame', 'Dicionário de bytes', 'Lista de nomes de arquivo', 'Conexão PostgreSQL'], 0, 'Pandas carrega a planilha em um DataFrame.'),
      phase2QuizQuestion('Por que inspecionar head após a leitura?', ['Para conferir amostra, cabeçalho e estrutura', 'Para instalar o mecanismo de leitura', 'Para excluir abas vazias', 'Para garantir que não há valores ausentes'], 0, 'A inspeção ajuda a detectar problemas antes do processamento.'),
      phase2QuizQuestion('O que fazer se a biblioteca de leitura necessária não estiver instalada?', ['Instalar o mecanismo compatível no ambiente do projeto', 'Renomear o XLSX para CSV', 'Trocar sheet_name por encoding', 'Ignorar a exceção'], 0, 'O leitor de XLSX requer um mecanismo compatível, como openpyxl.'),
      phase2QuizQuestion('Um XLSX pode conter:', ['Várias planilhas', 'Apenas uma tabela sempre', 'Somente imagens', 'Apenas texto sem células'], 0, 'Um arquivo Excel pode reunir várias abas.'),
    ],
  }),
  'l-parquet': phase2FileLesson({
    id: 'l-parquet', title: 'Trabalhando com arquivos Parquet',
    objective: 'Ler e gravar Parquet com Pandas e compreender seu formato colunar.',
    introduction: 'Parquet é um formato binário colunar que mantém tipos e permite leitura seletiva de colunas. Pandas precisa de um mecanismo como PyArrow ou fastparquet.',
    concept: ['Em uma leitura analítica, carregar somente colunas necessárias reduz I/O. Parquet não é texto legível como CSV.', 'O esquema armazena tipos e metadados; ainda assim, valide a origem e os dados.'],
    analogy: 'Em vez de guardar todos os campos de cada linha juntos, Parquet organiza valores por coluna, como um arquivo de fichas separado por atributo.',
    commands: [{ name: 'pd.read_parquet', text: 'Lê um arquivo Parquet em um DataFrame.' }, { name: 'columns', text: 'Limita a leitura às colunas necessárias.' }],
    whenToUse: 'Use Parquet em armazenamento e processamento analítico, principalmente quando ler apenas algumas colunas de grandes tabelas.',
    code: 'import pandas as pd\ndf = pd.read_parquet("vendas.parquet", columns=["data", "valor"])\nprint(df.dtypes)',
    codeWalkthrough: ['Importa Pandas.', 'Lê apenas as colunas data e valor.', 'dtypes permite conferir os tipos carregados.'],
    professional: 'Data lakes frequentemente guardam conjuntos particionados em Parquet para reduzir custo e tempo de consulta.',
    commonErrors: ['Tentar abrir Parquet em editor de texto; leia com uma biblioteca compatível.', 'Não instalar um engine; instale PyArrow ou fastparquet no ambiente.', 'Pedir colunas inexistentes; confira o esquema antes de usar columns.'],
    challenge: 'Leia duas colunas de um arquivo Parquet e compare os tipos com os dados equivalentes de um CSV.',
    completionCriteria: ['Explicar o armazenamento colunar.', 'Ler colunas selecionadas e inspecionar tipos.'],
    quiz: [
      phase2QuizQuestion('Parquet organiza dados principalmente por:', ['Coluna', 'Página de planilha', 'Parágrafo', 'Chave de API'], 0, 'Parquet é um formato colunar.'),
      phase2QuizQuestion('Qual biblioteca oferece read_parquet?', ['Pandas', 'csv', 'json', 'pathlib'], 0, 'Pandas expõe a leitura por read_parquet.'),
      phase2QuizQuestion('Por que selecionar colunas ao ler Parquet?', ['Para reduzir leitura desnecessária de dados', 'Para converter tudo em texto', 'Para ordenar automaticamente', 'Para remover duplicatas'], 0, 'Leitura seletiva economiza I/O e memória.'),
      phase2QuizQuestion('Como Parquet difere de CSV?', ['É binário e mantém esquema/tipos', 'É sempre texto separado por vírgula', 'Não pode armazenar tabelas', 'Só guarda uma linha'], 0, 'Parquet é binário e armazena metadados de esquema.'),
      phase2QuizQuestion('O que pode ser necessário para ler Parquet com Pandas?', ['PyArrow ou fastparquet', 'BeautifulSoup', 'Flask', 'openpyxl apenas'], 0, 'Pandas usa um engine compatível para Parquet.'),
    ],
  }),
  'l-conversao-formatos': phase2FileLesson({
    id: 'l-conversao-formatos', title: 'Conversão entre formatos de arquivos',
    objective: 'Converter arquivos entre CSV, JSON, Excel e Parquet com validação dos dados.',
    introduction: 'Converter é ler uma origem em uma estrutura intermediária, verificar a tabela e gravar no destino. A extensão do arquivo não faz a conversão.',
    concept: ['A estrutura intermediária deve ser validada para evitar perda de colunas, tipos ou registros.', 'CSV pode exigir parsing de datas e números; JSON pode representar hierarquia que precisa ser normalizada antes de virar tabela.'],
    analogy: 'A conversão é como transcrever uma receita para outro idioma: é preciso preservar o significado, não apenas trocar o nome do arquivo.',
    commands: [{ name: 'read_csv / to_parquet', text: 'Lê CSV e grava os dados no formato Parquet.' }, { name: 'shape', text: 'Compara dimensões antes e depois da gravação.' }],
    whenToUse: 'Converta formatos quando um sistema consumidor exigir uma estrutura diferente; compare esquema e quantidade de linhas.',
    code: 'import pandas as pd\ndf = pd.read_csv("entrada.csv")\ndf.to_parquet("saida.parquet", index=False)',
    codeWalkthrough: ['Lê o arquivo CSV em um DataFrame.', 'O DataFrame permite validar e transformar os dados.', 'Grava Parquet sem exportar o índice como coluna extra.'],
    professional: 'Uma rotina de ingestão pode receber CSV de um parceiro e publicar Parquet particionado para análise.',
    commonErrors: ['Renomear a extensão em vez de serializar; leia e grave com o formato de destino.', 'Exportar o índice sem querer; use index=False quando ele não fizer parte dos dados.', 'Não conferir contagem e tipos; compare dimensões, colunas e tipos após converter.'],
    challenge: 'Converta uma tabela CSV em Parquet e valide o número de linhas, nomes de colunas e tipos antes de considerar a carga concluída.',
    completionCriteria: ['Ler e gravar formatos diferentes.', 'Validar dimensões e esquema depois da conversão.'],
    quiz: [
      phase2QuizQuestion('Qual é a etapa intermediária comum ao converter CSV para Parquet com Pandas?', ['Ler os dados em um DataFrame', 'Renomear o arquivo', 'Apagar o cabeçalho', 'Compactar o texto manualmente'], 0, 'O DataFrame representa os dados entre leitura e gravação.'),
      phase2QuizQuestion('O que index=False evita em to_parquet?', ['Gravar o índice como coluna extra', 'Salvar os dados', 'Preservar nomes de coluna', 'Fechar o arquivo'], 0, 'index=False evita serializar o índice como dado.'),
      phase2QuizQuestion('Qual verificação ajuda a detectar perda de registros?', ['Comparar a quantidade de linhas antes e depois', 'Conferir apenas a extensão', 'Abrir o arquivo pelo nome', 'Verificar a cor da planilha'], 0, 'A contagem permite detectar diferenças na conversão.'),
      phase2QuizQuestion('Renomear entrada.csv para entrada.parquet:', ['Não converte os dados', 'Converte o conteúdo automaticamente', 'Valida o esquema', 'Normaliza datas'], 0, 'A conversão exige ler e gravar no formato de destino.'),
      phase2QuizQuestion('O que deve ser verificado além da contagem de linhas?', ['Colunas, tipos e valores relevantes', 'Somente a data de criação', 'O nome da pasta', 'A cor do ícone'], 0, 'Validar esquema e conteúdo preserva o significado dos dados.'),
    ],
  }),
  'l-projeto-central-arquivos': phase2FileLesson({
    id: 'l-projeto-central-arquivos', title: 'Projeto prático: Central de Arquivos',
    objective: 'Criar uma rotina que identifica, lê, valida e converte arquivos de dados para uma área de saída organizada.',
    introduction: 'O projeto reúne leitura de formatos, validação básica e conversão. Separe descoberta dos arquivos, processamento e registro de erros.',
    concept: ['Um pipeline confiável não presume que todo arquivo está correto: registra origem, formato, resultado e falhas.', 'Mantenha os originais e escreva as saídas em uma pasta separada para facilitar auditoria e reprocessamento.'],
    analogy: 'A central funciona como uma recepção: confere cada pacote, registra de onde veio e o encaminha para a prateleira correta.',
    commands: [{ name: 'pathlib.Path', text: 'Percorre caminhos e arquivos sem concatenar strings manualmente.' }, { name: 'try/except', text: 'Registra falha de um arquivo sem esconder o erro nem interromper toda a fila.' }],
    whenToUse: 'Use esse padrão para automatizar a padronização de arquivos recebidos por pastas ou lotes.',
    code: 'from pathlib import Path\nfor caminho in Path("entrada").glob("*.csv"):\n    print("A processar:", caminho.name)',
    codeWalkthrough: ['Path representa a pasta de entrada.', 'glob seleciona apenas os CSVs encontrados.', 'O laço processa cada caminho e mostra o nome para auditoria.'],
    professional: 'Uma central de arquivos prepara dados de diferentes fornecedores para que as etapas analíticas consumam uma saída consistente.',
    commonErrors: ['Misturar arquivos de entrada e saída; mantenha diretórios separados.', 'Ignorar erros sem identificar a origem; registre nome do arquivo e motivo.', 'Processar extensões não suportadas; filtre os arquivos aceitos antes de iniciar.'],
    challenge: 'Desenhe e implemente um fluxo que percorra CSVs, valide colunas obrigatórias, converta arquivos válidos para Parquet e registre falhas por nome de arquivo.',
    completionCriteria: ['Separar entrada, processamento e saída.', 'Validar colunas e registrar erros.', 'Explicar como evitar sobrescrever os originais.'],
    quiz: [
      phase2QuizQuestion('Por que separar as pastas de entrada e saída?', ['Para preservar originais e facilitar auditoria', 'Para impedir leitura dos arquivos', 'Para converter extensões sem código', 'Para apagar erros automaticamente'], 0, 'Separar originais e resultados evita sobrescrita acidental.'),
      phase2QuizQuestion('O que pathlib.Path ajuda a fazer?', ['Manipular caminhos e percorrer arquivos', 'Validar todos os dados automaticamente', 'Converter CSV para Parquet sem leitura', 'Criar consultas SQL'], 0, 'pathlib oferece operações de caminho portáveis.'),
      phase2QuizQuestion('O que registrar quando um arquivo falha?', ['Nome/origem e motivo da falha', 'Somente a hora do computador', 'A senha do usuário', 'Nada, para manter o log limpo'], 0, 'O registro permite diagnosticar e reprocessar a origem correta.'),
      phase2QuizQuestion('Qual deve ser validado antes de converter um CSV?', ['Colunas e estrutura esperadas', 'A cor do nome do arquivo', 'A ordem alfabética da pasta', 'O tamanho do monitor'], 0, 'Validar o esquema evita publicar arquivos incompatíveis.'),
      phase2QuizQuestion('Como tratar um arquivo inválido sem perder rastreabilidade?', ['Registrar a falha e seguir conforme a política do lote', 'Ignorar silenciosamente', 'Renomeá-lo como válido', 'Apagar o log'], 0, 'Falhas devem ser explícitas e rastreáveis.'),
    ],
  }),
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
  'f2-m1': [
    { q: 'Qual formato representa naturalmente objetos e listas aninhados?', options: ['CSV', 'JSON', 'Parquet', 'TXT sem estrutura'], answer: 1, explain: 'JSON representa estruturas hierárquicas.' },
    { q: 'Qual leitor do módulo csv facilita acessar campos pelo cabeçalho?', options: ['csv.DictReader', 'csv.BinaryReader', 'csv.HeaderWriter', 'csv.JsonReader'], answer: 0, explain: 'DictReader associa valores às chaves do cabeçalho.' },
    { q: 'Qual chamada seleciona uma aba Excel pelo nome?', options: ['pd.read_excel("vendas.xlsx", sheet_name="Vendas")', 'pd.read_excel("vendas.xlsx", delimiter=",")', 'pd.read_excel("vendas.xlsx", encoding="utf-8")', 'pd.read_excel("vendas.xlsx", orient="records")'], answer: 0, explain: 'sheet_name escolhe a aba a carregar.' },
    { q: 'Qual característica é típica do Parquet?', options: ['Armazenamento colunar e binário', 'Texto delimitado por vírgulas', 'Estrutura exclusiva de objetos aninhados', 'Planilhas com células mescladas'], answer: 0, explain: 'Parquet é binário, colunar e guarda metadados de esquema.' },
    { q: 'Qual validação é importante após converter CSV para Parquet?', options: ['Comparar contagem, colunas e tipos', 'Conferir se a extensão mudou', 'Apagar o arquivo original', 'Verificar a cor do ícone'], answer: 0, explain: 'A validação confirma que a conversão preservou os dados e o esquema.' },
    { q: 'Ao processar uma pasta de arquivos, como manter rastreabilidade de falhas?', options: ['Registrar o nome do arquivo e o motivo', 'Ignorar exceções sem log', 'Renomear todos como válidos', 'Parar de validar as entradas'], answer: 0, explain: 'O registro explícito permite diagnosticar e reprocessar arquivos.' },
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

  const fileFormats = DATA.phases[1].modules[0];
  fileFormats.lessons = [
    'l-formatos-dados', 'l-csv', 'l-json', 'l-excel', 'l-parquet',
    'l-conversao-formatos', 'l-projeto-central-arquivos',
  ];
  fileFormats.skills = ['a-python', 'e-python'];
})();
