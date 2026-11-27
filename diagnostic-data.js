/* ==========================================================================
   DATA JOURNEY ACADEMY — diagnostic-data.js
   Banco de questões do "Avaliar meu conhecimento".

   Estrutura:  área -> tópicos -> 2 questões por tópico
     c = questão de CONCEITO (teoria)
     k = questão de INTERPRETAÇÃO DE CÓDIGO (prática)
   Questões de múltipla escolha têm quatro opções; a interface embaralha a
   apresentação e equilibra a posição correta entre A e D em cada avaliação.
   Dois tipos por tópico existem de propósito: uma única resposta certa
   nunca basta para considerar um assunto demonstrado.

   Para ampliar: adicione tópicos (sempre com c e k) ou novas áreas.
   "module" liga o tópico ao módulo da trilha usado nas recomendações
   (null = assunto ainda sem aula na trilha).
   "prereq" lista áreas que precisam estar sólidas antes.
   "skills" são as competências da página Minha Carreira alimentadas pela área.
   ========================================================================== */

(function buildDiagnostics() {
  // Atalho para criar uma questão: q(texto, opções, índice da certa, explicação, código opcional)
  const q = (text, options, answer, explain, code) => ({ q: text, options, answer, explain, code });

  const AREAS = [
    {
      id: 'python', name: 'Python', prereq: [], skills: ['a-python', 'e-python'],
      topics: [
        { id: 'py-logic', title: 'Lógica de programação', module: 'f1-m1',
          c: q('Quais são os três blocos básicos de um algoritmo?', ['Sequência, decisão e repetição', 'Variável, classe e banco de dados', 'Entrada, tela e teclado', 'Variável, constante e operador'], 0,
            'Algoritmos combinam passos em sequência, decisões condicionais e repetições.'),
          k: q('Quando a mensagem é exibida?', ['Sempre', 'Quando errors for maior que zero', 'Nunca', 'Quando a variável errors é criada'], 1,
            'O bloco só executa quando a condição errors > 0 é verdadeira.',
            'if errors > 0:\n    print("revisar")') },
        { id: 'py-vars', title: 'Variáveis e tipos de dados', module: 'f1-m2',
          c: q('Qual é o tipo do valor `3.14` em Python?', ['int (inteiro)', 'float (decimal)', 'str (texto)', 'decimal (tipo nativo de ponto fixo)'], 1,
            'Números com parte decimal são do tipo float. Inteiros (int) não têm casas decimais, e texto (str) fica entre aspas.'),
          k: q('O que acontece ao executar este código?', ['Mostra 31', 'Mostra 301', 'Dá erro de tipo (TypeError)', 'Mostra 30 e depois 1 em linhas separadas'], 2,
            '"30" está entre aspas, então é texto. Somar texto com número gera TypeError. Seria preciso converter antes, com int(idade).',
            'idade = "30"\nprint(idade + 1)') },
        { id: 'py-conditions', title: 'Condicionais', module: 'f1-m3',
          c: q('Qual estrutura executa um bloco somente quando uma condição é verdadeira?', ['if', 'for', 'def', 'try'], 0,
            'if avalia uma condição. for repete ações, e def define uma função.'),
          k: q('O que será exibido?', ['Aprovado', 'Reprovado', 'Nada', 'Aprovado e depois Reprovado'], 0,
            'A condição nota >= 7 é verdadeira para nota igual a 8.',
            'nota = 8\nif nota >= 7:\n    print("Aprovado")\nelse:\n    print("Reprovado")') },
        { id: 'py-loops', title: 'Loops', module: 'f1-m4',
          c: q('Qual estrutura percorre cada item de uma sequência?', ['for', 'if', 'def', 'return'], 0,
            'for repete um bloco para cada item da sequência.'),
          k: q('Qual valor será exibido?', ['3', '6', '123', '6.0'], 1,
            'O laço soma 1 + 2 + 3, resultando em 6.',
            'total = 0\nfor n in [1, 2, 3]:\n    total += n\nprint(total)') },
        { id: 'py-lists', title: 'Listas', module: 'f1-m5',
          c: q('Qual é o índice do primeiro item de uma lista em Python?', ['0', '1', '-1', '2'], 0,
            'Os índices começam em 0; o índice -1 representa o último item.'),
          k: q('O que é exibido?', ['azul', 'verde', 'roxo', 'A lista inteira'], 1,
            'cores[1] acessa o segundo item, pois o primeiro está no índice 0.',
            'cores = ["azul", "verde", "roxo"]\nprint(cores[1])') },
        { id: 'py-tuples', title: 'Tuplas', module: 'f1-m6',
          c: q('Qual característica diferencia uma tupla de uma lista?', ['A tupla não pode ser alterada depois de criada', 'A tupla só aceita texto', 'A tupla sempre tem um único item', 'A tupla só pode ser acessada por chaves de texto'], 0,
            'Tuplas são sequências imutáveis; listas podem ser alteradas.'),
          k: q('Qual valor é exibido?', ['2', '4', '6', 'O tamanho da tupla'], 1,
            'O índice 1 é o segundo item da tupla.',
            'valores = (2, 4, 6)\nprint(valores[1])') },
        { id: 'py-dicts', title: 'Dicionários', module: 'f1-m7',
          c: q("Como acessar o valor da chave `'nome'` no dicionário `d`?", ["d['nome']", 'd.nome', 'd(nome)', 'd->nome'], 0,
            "Dicionários usam colchetes com a chave: d['nome']."),
          k: q('O que será exibido?', ['True', 'False', 'nome', 'ativo'], 0,
            'A chave "ativo" está associada ao valor booleano True.',
            'registro = {"ativo": True}\nprint(registro["ativo"])') },
        { id: 'py-functions', title: 'Funções', module: 'f1-m8',
          c: q('Para que serve `return` em uma função?', ['Devolver um resultado para quem chamou a função', 'Repetir a função para sempre', 'Mostrar automaticamente o resultado na tela', 'Reiniciar a execução do programa'], 0,
            'return entrega um valor ao código que chamou a função; print apenas exibe uma mensagem.'),
          k: q('Qual valor será exibido?', ['8', '4', 'Nada', '12'], 0,
            'dobro(4) devolve 4 * 2, então o print exibe 8.',
            'def dobro(n):\n    return n * 2\nprint(dobro(4))') },
        { id: 'py-errors', title: 'Tratamento de erros', module: 'f1-m9',
          c: q('Qual bloco permite tratar uma exceção sem encerrar o programa?', ['try/except', 'for/in', 'if/else', 'try/finally'], 0,
            'try/except captura erros esperados e permite definir uma resposta.'),
          k: q('O que será exibido?', ['erro', '10', 'O programa sempre encerra', 'ValueError'], 0,
            'int("x") gera ValueError, que é capturado pelo bloco except.',
            'try:\n    int("x")\nexcept ValueError:\n    print("erro")') },
        { id: 'py-files', title: 'Manipulação de arquivos', module: 'f1-m10',
          c: q('Qual padrão fecha o arquivo automaticamente, inclusive se ocorrer um erro?', ['with open(...) as arquivo', 'open(...) sem guardar o resultado', 'print(open(...))', 'open(..., close=True)'], 0,
            'O gerenciador de contexto with fecha o arquivo ao sair do bloco.'),
          k: q('O que o código garante ao terminar o bloco?', ['O arquivo é fechado automaticamente', 'O arquivo é apagado', 'O arquivo é convertido para JSON', 'O arquivo é compactado'], 0,
            'with gerencia o ciclo do arquivo e fecha o recurso automaticamente.',
            'with open("dados.txt", encoding="utf-8") as arquivo:\n    conteudo = arquivo.read()') },
      ],
    },
    {
      id: 'pandas', name: 'Pandas', prereq: ['python'], skills: ['a-pandas'],
      topics: [
        { id: 'pd-df', title: 'DataFrame e leitura de arquivos', module: 'f2-m3',
          c: q('O que é um DataFrame no Pandas?', ['Uma tabela com linhas e colunas', 'Um tipo de gráfico', 'Uma função para ler arquivos', 'Um vetor numérico de uma dimensão'], 0,
            'DataFrame é a estrutura de tabela do Pandas: linhas, colunas e rótulos.'),
          k: q('O que `df.shape` mostra?', ['Os nomes das colunas', 'Uma tupla (número de linhas, número de colunas)', 'As 5 primeiras linhas', 'A média dos valores de cada coluna'], 1,
            'shape devolve (linhas, colunas). Os nomes das colunas ficam em df.columns, e as primeiras linhas em df.head().',
            'import pandas as pd\ndf = pd.read_csv("vendas.csv")\nprint(df.shape)') },
        { id: 'pd-clean', title: 'Limpeza e valores ausentes', module: 'f2-m4',
          c: q('Qual expressão conta quantos valores ausentes existem em cada coluna?', ['df.isna().sum()', 'df.head()', 'df.sort_values()', 'df.drop_duplicates()'], 0,
            'isna() marca os ausentes com True, e sum() soma esses True por coluna.'),
          k: q('Qual valor é mostrado?', ['3.0', '4.0', 'NaN', '2.0'], 1,
            'fillna(0) troca o valor ausente por 0, ficando [1.0, 0.0, 3.0]. A soma é 4.0.',
            'df = pd.DataFrame({"a": [1, None, 3]})\nprint(df["a"].fillna(0).sum())') },
        { id: 'pd-group', title: 'Agrupamentos', module: 'f2-m5',
          c: q('Qual operação resume dados por categoria, como vendas totais por região?', ['groupby', 'merge', 'sort_values', 'concat'], 0,
            'groupby separa as linhas por categoria e permite aplicar uma agregação (soma, média, contagem).'),
          k: q('O que esse comando devolve?', ['Um único número com a soma de tudo', 'A soma de valor para cada região', 'O DataFrame original sem alterações', 'A média de valor para cada região'], 1,
            'Agrupa por região e soma a coluna valor em cada grupo, devolvendo uma soma por região.',
            'df.groupby("regiao")["valor"].sum()') },
      ],
    },
    {
      id: 'sql', name: 'SQL', prereq: [], skills: ['a-sql', 'e-sql', 'e-db'],
      topics: [
        { id: 'sql-select', title: 'SELECT, WHERE e ORDER BY', module: 'f3-m1',
          c: q('Qual cláusula filtra as linhas de uma consulta?', ['WHERE', 'FROM', 'ORDER BY', 'HAVING'], 0,
            'WHERE filtra linhas. FROM indica a tabela e ORDER BY apenas ordena o resultado.'),
          k: q('O que essa consulta retorna?', ['Os nomes de todos os clientes', 'Os nomes dos clientes de Campinas', 'As cidades de todos os clientes', 'Os nomes dos clientes de São Paulo'], 1,
            'SELECT escolhe a coluna nome e o WHERE mantém só as linhas em que a cidade é Campinas.',
            "SELECT nome\nFROM clientes\nWHERE cidade = 'Campinas';") },
        { id: 'sql-group', title: 'GROUP BY e HAVING', module: 'f3-m2',
          c: q('Para filtrar grupos pelo resultado de uma agregação (soma maior que 1000, por exemplo), qual cláusula usar?', ['WHERE', 'HAVING', 'LIMIT', 'ORDER BY'], 1,
            'WHERE filtra linhas antes do agrupamento. HAVING filtra os grupos depois da agregação.'),
          k: q('O que essa consulta retorna?', ['O total de pedidos em uma única linha', 'A quantidade de pedidos de cada região', 'A lista de todos os pedidos', 'A soma do valor dos pedidos por região'], 1,
            'GROUP BY forma um grupo por região, e COUNT(*) conta as linhas de cada grupo.',
            'SELECT regiao, COUNT(*)\nFROM pedidos\nGROUP BY regiao;') },
        { id: 'sql-join', title: 'JOIN', module: 'f3-m2',
          c: q('O que um INNER JOIN retorna?', ['Apenas as linhas com correspondência nas duas tabelas', 'Todas as linhas da tabela da esquerda, com ou sem correspondência', 'Todas as combinações possíveis entre as tabelas', 'Apenas as linhas sem correspondência na tabela da direita'], 0,
            'INNER JOIN mantém só quem tem par nas duas tabelas. O que descreve a segunda opção é o LEFT JOIN.'),
          k: q('O que essa consulta retorna?', ['Ana e Bia', 'Ana, Ana (duas linhas)', 'Apenas Bia', 'Uma linha para Ana e uma para Bia'], 1,
            'Ana tem 2 pedidos, então aparece 2 vezes. Bia não tem pedidos e fica de fora do INNER JOIN.',
            '-- clientes: (1, Ana), (2, Bia)\n-- pedidos:  (cliente_id 1), (cliente_id 1)\nSELECT c.nome\nFROM clientes c\nINNER JOIN pedidos p ON p.cliente_id = c.id;') },
      ],
    },
    {
      id: 'excel', name: 'Excel', prereq: [], skills: ['a-excel'],
      topics: [
        { id: 'xl-ref', title: 'Fórmulas e referências', module: null,
          c: q('O que o símbolo `$` faz em `$A$1`?', ['Converte o valor em moeda', 'Fixa a referência ao copiar a fórmula', 'Apaga o conteúdo da célula', 'Oculta a célula na planilha'], 1,
            'O $ trava a coluna e/ou a linha. Assim a referência não muda quando a fórmula é copiada para outras células.'),
          k: q('Qual resultado a fórmula mostra?', ['Maior', 'Menor', '#VALOR!', 'Igual'], 0,
            'A1 (10) é maior que B1 (5), então a condição é verdadeira e a fórmula devolve "Maior".',
            'A1 = 10     B1 = 5\n=SE(A1>B1; "Maior"; "Menor")') },
        { id: 'xl-lookup', title: 'Busca e contagem', module: null,
          c: q('Qual função busca um valor em uma tabela e traz o dado de outra coluna?', ['SOMA', 'PROCV (ou PROCX)', 'MÉDIA', 'CONT.SE'], 1,
            'PROCV e PROCX procuram um valor e devolvem o dado correspondente. SOMA e MÉDIA só calculam.'),
          k: q('Qual resultado a fórmula mostra?', ['2', '3', '5', '4'], 1,
            'CONT.SE conta as células iguais a "ok". Há três: A1, A3 e A4.',
            'A1:A5 = ok, erro, ok, ok, erro\n=CONT.SE(A1:A5; "ok")') },
        { id: 'xl-pivot', title: 'Resumo de dados', module: null,
          c: q('Qual recurso resume vendas por mês sem fórmulas manuais?', ['Tabela dinâmica', 'Mesclar células', 'Proteger planilha', 'Validação de dados'], 0,
            'A tabela dinâmica agrupa e resume grandes volumes de dados arrastando campos, sem escrever fórmulas.'),
          k: q('Qual resultado a fórmula mostra?', ['60', '80', '100', '90'], 1,
            'SOMASE soma os valores de B onde A é "Sul": 10 + 30 + 40 = 80.',
            'A1:A4 = Sul, Norte, Sul, Sul\nB1:B4 = 10, 20, 30, 40\n=SOMASE(A1:A4; "Sul"; B1:B4)') },
      ],
    },
    {
      id: 'powerbi', name: 'Power BI', prereq: ['excel'], skills: ['a-powerbi'],
      topics: [
        { id: 'pbi-model', title: 'Modelo de dados', module: null,
          c: q('Em um modelo estrela, o que fica na tabela fato?', ['Os valores medidos (como vendas) e as chaves das dimensões', 'Apenas os nomes dos clientes', 'Somente imagens e logotipos', 'Somente medidas calculadas do relatório'], 0,
            'A tabela fato guarda os eventos e números (vendas, quantidades) e as chaves que ligam às tabelas de dimensão.'),
          k: q('O que essa expressão DAX cria?', ['Uma medida que soma a coluna Valor', 'Uma coluna que copia os valores linha a linha', 'Um filtro de página', 'Uma contagem de linhas da tabela'], 0,
            'Uma expressão com SUM, criada como medida, calcula a soma conforme os filtros do relatório.',
            'Total Vendas = SUM(Vendas[Valor])') },
        { id: 'pbi-dax', title: 'Medidas e contexto (DAX)', module: null,
          c: q('Qual a principal diferença entre medida e coluna calculada?', ['A medida é recalculada conforme os filtros do relatório; a coluna é calculada linha a linha e armazenada', 'Não há diferença', 'A coluna calculada muda com os filtros; a medida não', 'A medida é armazenada linha a linha; a coluna depende dos filtros'], 0,
            'A medida reage ao contexto (filtros e segmentações). A coluna calculada é resolvida linha a linha ao carregar o modelo.'),
          k: q('O que essa medida calcula?', ['A soma das vendas apenas da região Sul', 'A soma de todas as vendas', 'A contagem de regiões', 'A média das vendas da região Sul'], 0,
            'CALCULATE aplica o filtro Regiao = "Sul" antes de somar o valor.',
            'Vendas Sul =\nCALCULATE(\n    SUM(Vendas[Valor]),\n    Vendas[Regiao] = "Sul"\n)') },
        { id: 'pbi-pq', title: 'Power Query', module: null,
          c: q('Onde normalmente se limpa e transforma os dados antes de carregá-los no modelo?', ['No Power Query', 'Em um visual de cartão', 'Na formatação condicional', 'Na exibição de relatório, depois de criar os gráficos'], 0,
            'O Power Query é a etapa de extração e transformação: limpar, filtrar, tipar e combinar dados antes de ir ao modelo.'),
          k: q('O que essa etapa faz?', ['Mantém só as linhas com Valor maior que 100', 'Remove a coluna Valor', 'Soma todos os valores', 'Mantém só as linhas com Valor igual a 100'], 0,
            'Table.SelectRows seleciona as linhas que atendem à condição, no caso Valor > 100.',
            '= Table.SelectRows(Fonte, each [Valor] > 100)') },
      ],
    },
    {
      id: 'engenharia', name: 'Engenharia de Dados', prereq: ['python', 'sql'], skills: ['e-etl', 'e-pipelines', 'e-arch'],
      topics: [
        { id: 'de-etl', title: 'ETL e ELT', module: 'f6-m1',
          c: q('Qual a principal diferença entre ETL e ELT?', ['No ETL os dados são transformados antes de carregar; no ELT são carregados primeiro e transformados no destino', 'Não há diferença', 'ELT só funciona com arquivos CSV', 'No ELT os dados são transformados antes de serem extraídos'], 0,
            'A ordem das etapas muda: ETL = extrair, transformar, carregar. ELT = extrair, carregar, transformar.'),
          k: q('Esse fluxo segue qual padrão?', ['ETL', 'ELT', 'Nenhum dos dois', 'Streaming'], 0,
            'Os dados são limpos (transformados) antes de serem carregados no destino. Isso é ETL.',
            'dados = extrair("api")\ndados = limpar(dados)\ncarregar(dados, "warehouse")') },
        { id: 'de-pipe', title: 'Pipelines e idempotência', module: 'f6-m2',
          c: q('O que significa um pipeline ser idempotente?', ['Rodar de novo gera o mesmo resultado, sem duplicar dados', 'Rodar mais rápido a cada execução', 'Nunca apresentar erros', 'Executar apenas uma vez e nunca mais ser repetido'], 0,
            'Idempotência permite reexecutar o pipeline com segurança, por exemplo depois de uma falha, sem corromper ou duplicar dados.'),
          k: q('Se este pipeline rodar duas vezes sem nenhum cuidado, o que acontece?', ['As linhas são duplicadas', 'Nada muda na segunda vez', 'A tabela é apagada', 'A tabela é substituída automaticamente'], 0,
            'Cada execução insere de novo as mesmas linhas. Para evitar, usa-se carga incremental, upsert ou limpeza da janela antes de inserir.',
            'INSERT INTO vendas_dw\nSELECT * FROM vendas_staging;') },
        { id: 'de-dw', title: 'Data Warehouse e modelagem', module: 'f6-m3',
          c: q('Para que serve um Data Warehouse?', ['Guardar dados organizados e históricos para análise', 'Hospedar sites', 'Executar aplicativos móveis', 'Armazenar temporariamente chamadas de uma API'], 0,
            'O Data Warehouse centraliza dados tratados de várias fontes, organizados para consultas analíticas.'),
          k: q('Que tipo de modelagem é essa?', ['Esquema estrela', 'Banco de documentos', 'Planilha única', 'Esquema floco de neve'], 0,
            'Uma tabela fato no centro, ligada a tabelas de dimensão, forma o esquema estrela.',
            'fato_vendas(id_produto, id_cliente, valor)\ndim_produto(id_produto, nome)\ndim_cliente(id_cliente, cidade)') },
      ],
    },
  ];

  // Dá ids e tipos às questões (ex.: "py-vars-c" e "py-vars-k")
  AREAS.forEach((area) => area.topics.forEach((topic) => {
    topic.c.id = `${topic.id}-c`; topic.c.kind = 'conceito';
    topic.k.id = `${topic.id}-k`; topic.k.kind = 'codigo';
  }));

  DATA.diagnostics = AREAS;
})();
