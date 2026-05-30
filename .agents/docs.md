# Documentação do projeto COMANDA X

## 1. Definição do Problema e da Solução

**Objetivo da etapa**
Entender:

- o problema real;
- o contexto do sistema;
- quem usaria a solução;
- qual valor seria entregue.

### Perguntas a serem respondidas a respeito de definição do problema e da solução

1. **Qual problema o sistema resolve?**
  A proposta atual resolve principalmente três problemas:
    - Diminuição de erros em pedidos;
    - Aumento da eficiência operacional.
    - Redução de dependência de garçons;

2. **Quem são os usuários?**
  Administradores, Garçons, funcionários da cozinha e clientes de estabelecimento que possuem atendimento na mesa como:
    - Restaurantes;
    - Hamburguerias;
    - Padarias;
    - Lanchonetes;
    - E etc.

3. **Como funciona o atendimento atualmente?**
  Os garçons anotam os pedidos dos clientes em uma folha de papel, fazem uma cópia para o cliente e encaminham a outra cópia para a cozinha.

4. Quais dores operacionais existem?
  Erros em pedidos, confusão ao entregar pedidos nas mesas, demora no atendimento, sobrecarga dos garçons em horarios de pico ou em recebimento de grupos grandes de clientes ou excursões, perda da comanda por parte dos clientes, dificuldade para cobrar, dificuldade para entender o que está escrito no papel, fragilidade do papel com relação a liquidos, dificuldade de fazer auditorias e cruzar os pedidos produzidos pela cozinha e pagos no caixa, dificuldade para medir o desempenho dos garçons individualmente.

5. O que diferencia a solução?
  Capacidade de diminuir a dependencia de garçons, aumento da eficiencia operacional, diminuição de erros em pedidos, auditabilidade pela gerencia.

6. O sistema será web, mobile ou híbrido?
  O sistema será web responsivo para todos os stakeholders.

7. O cliente precisará instalar aplicativo?
  Não, o cliente terá acesso ao sistema web responsivo mobile.

8. O sistema precisa funcionar em tempo real?
  Sim, os pedidos feitos pelos clientes precisam aparecer rápido para a cozinha e os garçons, algo como um polling deve ser suficiente para o mvp.

9. Quais funcionalidades são essenciais no MVP?
    - Visualização do cardápio digital;
    - Realização de pedidos (cliente e garçom);
    - Recebimento e visualização de pedidos pela cozinha;
    - Atualização de status e baixa de pedidos;
    - Acompanhamento do status do pedido pelo cliente;
    - Visualizar relatórios diarios pela gerencia.

**Resultado da etapa**
Definição do:

- SaaS de cardápio digital;
- QR Code;
- comandas digitais;
- pedidos em tempo real;
- MVP inicial.

## 2. Definição da Plataforma e Arquitetura

**Objetivo da etapa**
Escolher tecnologias e estrutura do sistema.

### Perguntas a serem respondidas pela definição da plataforma e arquitetura

1. Qual plataforma será usada?
    - Frontend Cliente e Garçom (Web Mobile) React
    - Frontend Cozinha e Gestor (Web Desktop) React
    - API Central (regra de negócio) Nodejs + Express
    - Banco de Dados PostgreSql

1. O time consegue manter essa stack?
    Sim, o time está apto a manter a stack.

1. O sistema será monolítico ou microserviços?
  Sistema monolítico modular
    - API central (Node + Express)
    - Módulos internos organizados:
        - cardápio
        - comandas
        - pedidos
        - relatórios
        - usuários (garçom/cozinha/gestor)
        - Frontends separados (cliente, cozinha, garçom, gestor)

1. O sistema precisa escalar?
    escalar somente no futuro.

1. Como o sistema vai se comunicar?
    Monolito modular

1. O frontend será PWA?
    Sim

1. O backend centralizará regras?
    Sim

1. O tempo real será polling ou websocket?
    Polling, sistemas de acompanhamento em tempo real pela cozinha, garçons e clientes

**Resultado da etapa**
Definição de:

- React PWA;
- Node.js + Express;
- PostgreSQL;
- monolito modular;
- polling no MVP.

## 3. Escolha da Metodologia

**Objetivo da etapa**
Definir como o time trabalharia.

**Perguntas respondidas**

1. O time é experiente?
Não, o time é formado majoritariamente por desenvolvedores junior.

1. O escopo muda muito?
Não o escopo é bem definido enquanto é um MVP

1. O prazo é curto?
Sim, prazo é curto para a apresentação do MVP do projeto na feira de statups.

1. O projeto precisa de flexibilidade?
Pouca, como se trata de poucas funcionalidades ele não precisa ser tão flexivel.

1. Qual metodologia reduz burocracia?
Uma metodologia agil, com base no Scrum adaptado para poucas semanas

**Resultado da etapa**
Escolha de:

- Scrum adaptado;
- modelo iterativo incremental;
- sprints curtas;
- foco em MVP.

## 4. Ciclo de Vida do Software

**Objetivo da etapa**
Organizar as fases do projeto.

### Perguntas respondidas sobre ciclo de vida do software

1. **Como o projeto evoluirá?**
O ciclo de vida do software adotado no projeto está diretamente alinhado à metodologia ágil previamente definida. Dessa forma, optou-se por um modelo iterativo e incremental, no qual o sistema é desenvolvido em ciclos curtos, permitindo evolução contínua e entregas frequentes de valor.

2. **Como as entregas serão organizadas?**

- **Levantamento e análise de requisitos**
  - Nesta fase, são identificadas as necessidades do sistema, os atores envolvidos e as funcionalidades esperadas. Os requisitos são definidos de forma inicial e organizados em um backlog, que será continuamente refinado ao longo do projeto.
  - Resultado esperado:
    - Lista de requisitos funcionais e não funcionais
    - Definição do MVP
- **Planejamento (Sprint Planning)**
  - Nesta etapa, a equipe seleciona os itens prioritários do backlog que serão desenvolvidos na sprint. Também são definidas as tarefas e estimativas necessárias para a implementação.
  - Resultado esperado:
    - Escopo da sprint definido
    - Tarefas organizadas
- **Desenvolvimento (Implementação)**
  - Fase em que as funcionalidades são efetivamente desenvolvidas. A equipe implementa o código, integra os componentes do sistema e aplica as regras de negócio definidas.
  - Resultado esperado:
    - Funcionalidades implementadas
    - Integração entre módulos.
- **Testes e validação**
  - As funcionalidades desenvolvidas são testadas para garantir que atendem aos requisitos definidos. Essa etapa inclui validação funcional e verificação de possíveis falhas.
  - Resultado esperado:
    - Correção de erros
    - Garantia de funcionamento do sistema.
- **Entrega (Release da Sprint)**
  - Ao final de cada sprint, as funcionalidades concluídas são disponibilizadas para validação. No contexto do projeto, essa entrega pode ser apresentada ao cliente ou utilizada para validação interna.
  - Resultado esperado:
    - Incremento funcional do sistema
    - Feedback sobre a solução

- **Revisão e retrospectiva**
  - A equipe analisa os resultados da sprint, identifica pontos de melhoria e ajusta o processo para os próximos ciclos.
  - Resultado esperado:
    - Melhoria contínua do processo
    - Ajustes no planejamento futuro.

- **Manutenção e evolução**
  - Após a entrega do MVP, o sistema continua evoluindo com a inclusão de novas funcionalidades, correções e melhorias baseadas no uso real.
  - Resultado esperado:
    - Sistema atualizado
    - Evolução contínua da solução

3. **Como ocorrerá validação?**

A validação ocorrerá principalmente através de testes de integração

4. **Como o sistema será mantido?**
Após a apresentação do MVP do projeto como uma startup, o sistema continuará em evolução e as features e insights que surgirem durante o projeto serão transformados em novos requisitos e o processo recomeça.

**Resultado da etapa**
Definição das fases:

- requisitos;
- planejamento;
- implementação;
- testes;
- entrega;
- retrospectiva;
- manutenção.

## 5. Técnicas de Levantamento de Requisitos

**Objetivo da etapa**
Definir como descobrir as necessidades do sistema.

### Perguntas respondidas na etapa de tecnicas de levantamento de requisitos

- **Como validar necessidades sem cliente real?**
A definição das técnicas de levantamento de requisitos adotadas no projeto foi realizada considerando a ausência de um cliente formal, o contexto acadêmico da equipe e a necessidade de obter informações relevantes de forma prática e acessível. Dessa forma, optou-se por uma combinação de técnicas que permitem explorar tanto o conhecimento prévio da equipe quanto experiências reais de usuários.
- **Como coletar informações?**
  - Brainstorming
  A técnica de brainstorming será utilizada para levantar ideias iniciais sobre funcionalidades, fluxos e melhorias do sistema, com base na experiência dos integrantes da equipe como usuários de estabelecimentos do tipo.
    - Justificativa:
      O uso do brainstorming permite explorar o conhecimento empírico da equipe, incentivando a geração de ideias de forma colaborativa e rápida. Essa abordagem é especialmente útil em fases iniciais do projeto, onde ainda não há restrições rígidas definidas.

  - Entrevistas informais
  Serão realizadas entrevistas informais com amigos, familiares e conhecidos que frequentam restaurantes, com o objetivo de compreender suas experiências, dificuldades e expectativas.
    - Justificativa
      Mesmo na ausência de stakeholders formais, a coleta de relatos reais permite identificar problemas recorrentes no atendimento e validar hipóteses levantadas pela equipe. Essa técnica contribui para aproximar o sistema das necessidades reais dos usuários.

  - Observação indireta (experiência do usuário)
    A equipe utilizará sua própria vivência em estabelecimentos para observar e analisar o fluxo de atendimento, identificando pontos de melhoria no processo atual.
    - Justificativa
      A observação indireta permite identificar requisitos implícitos, muitas vezes não verbalizados pelos usuários. Considerando que os integrantes já possuem experiência como clientes, essa abordagem se torna uma fonte relevante de insights para o projeto.

  - Prototipagem (baixa fidelidade)
    Serão desenvolvidos protótipos iniciais (wireframes) para validar a usabilidade e o fluxo do sistema antes da implementação.
    - Justificativa
      A prototipagem permite validar rapidamente ideias e identificar problemas de usabilidade, reduzindo retrabalho nas fases de desenvolvimento. Além disso, facilita a comunicação entre os membros da equipe, tornando os requisitos mais tangíveis.
    - Ferramentas sugeridas:
      - Figma
      - Penpot

  - Análise de sistemas existentes
    A equipe analisará soluções similares disponíveis no mercado para identificar boas práticas e possíveis diferenciais competitivos.
    - Justificativa
      A análise de sistemas existentes permite compreender padrões já consolidados no mercado, reduzindo riscos de decisões inadequadas e contribuindo para a construção de uma solução mais alinhada às expectativas dos usuários.

- **Como reduzir suposições?**
  A combinação das técnicas selecionadas busca equilibrar viabilidade prática e qualidade das informações obtidas. Diante da ausência de um cliente formal, a equipe optou por utilizar fontes alternativas de conhecimento, como experiências próprias e entrevistas informais, garantindo que o sistema seja desenvolvido com base em necessidades reais. Além disso, o uso de prototipagem e análise de sistemas existentes contribui para reduzir incertezas e melhorar a qualidade das decisões de projeto.

**Resultado da etapa**
Escolha de:

- brainstorming;
- entrevistas informais;
- observação;
- prototipagem;
- análise de sistemas existentes.

## 6. Engenharia de Requisitos

## 6.1 Requisitos de Negócio

- Perguntas respondidas
- Por que o sistema existe?
  - Agilização do atendimento
  - Redução de erros operacionais
  - Redução do uso de papel
  - Suporte à especialização operacional
  - Aumento da eficiência operacional
  - Melhoria da experiência do cliente
  - Suporte à tomada de decisão

- Qual transformação o sistema gera?
  - Ao estabelecer metas como agilidade no atendimento, redução de erros e melhoria da experiência do cliente, o projeto deixa de ser apenas uma implementação técnica e passa a atuar como um instrumento de transformação operacional.

- Quais resultados o negócio espera?
  - agilizar atendimento;
  - reduzir erros;
   reduzir papel;
  - gerar métricas;
  - identificar gargalos.

**Resultado**
Definição de:

- agilizar atendimento;
- reduzir erros;
- reduzir papel;
- gerar métricas;
- identificar gargalos.

### Lista dos requisitos de negócios

RN01 – Agilização do atendimento

O sistema deve possibilitar que clientes realizem seus pedidos diretamente pelo dispositivo móvel, reduzindo a dependência do atendimento inicial por garçons e diminuindo o tempo de espera.

RN02 – Redução de erros operacionais

O sistema deve minimizar erros no registro e entrega de pedidos, garantindo que cada solicitação seja associada corretamente à mesa e à comanda correspondente.

RN03 – Redução do uso de papel

O sistema deve contribuir para a diminuição do uso de papel nos processos operacionais, substituindo comandas físicas e reduzindo a necessidade de impressões.

RN04 – Suporte à especialização operacional

O sistema deve permitir a organização do trabalho em funções especializadas, possibilitando a separação de responsabilidades entre atendimento, preparo e entrega de pedidos.

RN05 – Aumento da eficiência operacional

O sistema deve otimizar o fluxo de pedidos entre clientes, cozinha e atendimento, reduzindo o tempo total de processamento.

RN06 – Melhoria da experiência do cliente

O sistema deve proporcionar uma experiência de consumo mais autônoma, rápida e transparente, permitindo acompanhamento em tempo real dos pedidos.

RN07 – Suporte à tomada de decisão

O sistema deve fornecer informações que auxiliem a gestão do estabelecimento na análise de desempenho e comportamento de vendas.

RN08 – Identificação de gargalos operacionais

O sistema deve permitir a coleta e análise de dados relacionados ao tempo de processamento dos pedidos, possibilitando a identificação de gargalos no fluxo de produção e atendimento.

## 6.2 Requisitos de Domínio

Perguntas respondidas

- Como restaurantes funcionam?
  - Um restaurante funciona como um ecossistema integrado que transforma ingredientes em experiências. O processo é dividido em quatro pilares principais: Planejamento (cardápio e compras), Back-Office (estoque e finanças), Produção (pré-preparo na cozinha) e Serviço (salão e atendimento ao cliente).

- Como comandas se comportam?
  - As comandas funcionam como o cérebro operacional de um restaurante: elas registram tudo o que é consumido por uma mesa ou cliente. O processo conecta o salão, a cozinha e o caixa, garantindo que os pedidos sejam preparados corretamente e a conta seja fechada sem erros.

- Como pedidos transitam?
  - O trânsito de pedidos em restaurantes funciona como uma linha de montagem em tempo real. O fluxo começa no atendimento, passa pela comanda, é executado e dividido por setores na cozinha, e finalmente é despachado para a mesa.

- Quais regras operacionais existem?

**Resultado**
Definição de:

- múltiplas comandas;
- status de pedidos;
- saldo parcial;
- QR Code;
- tempo por status.

### Lista dos requisitos de domínio

#### RD01 – Criação de comanda

O sistema deve permitir a criação de comandas associadas a uma mesa, possibilitando o registro de pedidos. Deve ser permitido criar mais de uma comanda por mesa.

#### RD02 – Inclusão de pedidos

O sistema deve permitir a inclusão de pedidos em uma comanda, tanto pelo cliente quanto pelo garçom.

#### RD03 – Alteração de status do pedido

O sistema deve permitir que os atores responsáveis (cozinha e garçom) atualizem o status dos pedidos, considerando os seguintes estados:

Na fila
Em preparo
Pronto
Entregue

#### RD04 – Cálculo de saldo parcial

O sistema deve calcular automaticamente o valor total dos itens registrados na comanda, exibindo o saldo parcial atualizado em tempo real.

#### RD05 – Identificação da comanda

O sistema deve permitir a nomeação ou identificação das comandas, facilitando a distinção em mesas com múltiplas comandas.

#### RD06 – Associação com mesa (QR Code)

O sistema deve associar automaticamente a comanda a uma mesa a partir do acesso via QR Code.

#### RD07 – Agrupamento de pedidos por comanda

O sistema deve garantir que todos os pedidos realizados sejam vinculados corretamente à comanda ativa.

#### RD08 – Controle de múltiplos usuários na mesma comanda

O sistema deve permitir que múltiplos clientes realizem pedidos simultaneamente em uma mesma comanda.

#### RD09 – Bloqueio de comanda encerrada

O sistema deve impedir a inclusão de novos pedidos em comandas que já foram finalizadas.

#### RD10 – Registro de tempo por status

O sistema deve registrar automaticamente o tempo em que cada pedido permanece em cada status (na fila, em preparo, pronto, entregue).

## 6.3 Requisitos de sistemas

## 6.3.1 Requisitos Funcionais

Perguntas respondidas

- O que o sistema deve fazer?
- Quem pode fazer cada ação?
- Quais regras existem?
- Quais permissões existem?

**Resultado**
Definição completa de:

- mesas;
- comandas;
- pedidos;
- cardápios;
- pagamentos;
- histórico;
- login;
- status;
- dashboards.

### Lista de requisitos funcionais

#### RF001 – Gerenciar mesas

- Atores: Gestor e garçons
- Descrição: O sistema deve permitir o gerenciamento de mesas, incluindo criação, visualização, atualização e exclusão.
- Justificativa: Permite adequar a quantidade e o status das mesas conforme a operação do estabelecimento, incluindo expansões permanentes ou temporárias.
- Pré-condição: O usuário deve estar autenticado no sistema.
- Regras de acesso:
  - Criar: somente o gestor pode criar novas mesas.
  - Visualizar: gestor e garçom podem visualizar as mesas.
  - Atualizar: somente o gestor pode alterar os dados da mesa.
  - Excluir: somente o gestor pode excluir mesas.

#### RF002 – Gerenciar comandas

- Atores: Garçons e Clientes
- Descrição: O sistema deve permitir o gerenciamento de comandas incluindo criação, visualização, atualização e exclusão.
- Justificativa: Permite dividir pedidos por grupos ou pessoas da mesma mesa, facilitando contas separadas.
- Pré-condição: A mesa deve estar identificada no sistema.
- Regras de acesso:
  - Criar:
    - Cliente: pode criar a primeira comanda ao acessar a mesa por QR Code; em acessos posteriores, o sistema deve permitir reutilizar uma comanda existente ou criar uma nova.
    - Garçom: pode criar comandas manualmente.
  - Visualizar:
    - Cliente: pode visualizar apenas as comandas da mesa acessada por QR Code.
    - Garçom: pode visualizar as comandas de todas as mesas.
  - Atualizar:
    - Cliente: pode alterar apenas o apelido da própria comanda.
    - Garçom: pode alterar os dados da comanda e transferi-la para outra mesa.
  - Excluir:
    - A comanda só pode ser excluída se não possuir pedidos associados.

#### RF003 – Gerenciar pedidos

- Atores: Clientes, Garçons e cozinha
- Descrição: O sistema deve permitir o gerenciamento de pedidos, incluindo criação, visualização, atualização, exclusão e controle de status.
- Justificativa: Permite registrar corretamente o consumo, corrigir erros e ajustar pedidos antes do início do preparo.
- Pré-condição: O pedido só pode ser alterado pelo cliente ou garçom enquanto estiver com status “Na fila”.
- Regras de acesso:
  - Visualizar: cliente, garçom e cozinha podem visualizar os pedidos de acordo com seu contexto de uso.
  - Criar: Cliente e garçom podem criar novos pedidos
  - Excluir: cliente e garçom podem excluir o pedido apenas enquanto ele estiver com status “Na fila”.
  - Atualizar:
    - Cliente/garçom: pode cancelar o envio ou alterar o pedido enquanto o status for "na fila"
    - Cozinha: pode alterar o status do pedido entre as opções: "na fila",  "preparando" e "pronto"
    - Garçom: pode alterar o status para "entregue" quando ele estiver como "pronto"

#### RF004 – Gerenciar Cardápio

- Ator: Gestor, Garçom, Cozinha
- O sistema deve permitir o gerenciamento do cardápio digital, incluindo criação, edição, ativação/inativação e exclusão.
- Justificativa: Permite utilizar cardápios diferentes por dia, horário, turno ou contexto operacional.
- Pré-condição: O usuário deve estar autenticado no sistema.
- Regras de acesso:
  - Criar: somente o gestor pode criar novos cardápios.
  - Visualizar: gestor, garçom e cozinha podem visualizar os cardápios.
  - Atualizar: somente o gestor deve poder alterar dados estruturais do cardápio.
  - Alterar status: gestor, garçom e cozinha podem ativar ou inativar cardápios conforme a operação.
  - Excluir: somente o gestor pode excluir cardápios.

#### RF005 – Gerenciar itens do cardápio

- Atores: Gestor, Garçom, Cozinha, Cliente
- Descrição: O sistema deve permitir o gerenciamento dos itens do cardápio, incluindo nome, descrição, preço e disponibilidade.
- Justificativa: Permite manter o cardápio atualizado e adaptar a disponibilidade dos itens conforme estoque, ingredientes e operação.
- Pré-condição: Usuários administrativos devem estar autenticados no sistema.
- Regras de acesso:
  - Criar: gestor, garçom e cozinha podem cadastrar novos itens.
  - Visualizar:
    - Cliente: pode visualizar apenas itens com status ativo.
    - Gestor/Garçom/Cozinha: podem visualizar todos os itens.
  - Atualizar: gestor, garçom e cozinha podem atualizar dados e status dos itens.
  - Excluir: gestor pode excluir itens do cardápio.

#### RF006 – Gerenciar garçons

- Atores: Gestor
- Descrição: O sistema deve permitir criar, visualizar, atualizar e excluir registros de garçons.
- Justificativa: Permite administrar contratações, substituições e manutenção do quadro operacional.
- Pré-condição: O gestor deve estar autenticado no sistema.

#### RF007 – Autenticar usuários administrativos

- Atores: Gestor, Garçom, Cozinha
- Descrição: O sistema deve permitir a autenticação de usuários administrativos por meio de login e senha, identificar o perfil do usuário autenticado e liberar apenas as funcionalidades compatíveis com seu papel.
- Justificativa: Garante controle de acesso e restrição de funcionalidades conforme o perfil do usuário.
- Pré-condição: O usuário deve possuir credenciais previamente cadastradas.

#### RF008 – Transferir comanda entre mesas

- Atores: Garçom e Gestor
- Descrição: O sistema deve permitir transferir comandas entre mesas.
- Justificativa: Atende situações em que clientes trocam de mesa ou juntam grupos durante o atendimento.
- Pré-condição: O garçom deve estar autenticado no sistema e a comanda deve estar ativa.
- Regras de acesso:
  - Transferir: somente o garçom e gestor pode alterar a associação de uma comanda para outra mesa.

#### RF009 – Registrar histórico de atendimento

- Atores: Sistema, Gestor
- Descrição: O sistema deve registrar o histórico de pedidos e atendimentos realizados.
- Justificativa: Permite análise operacional, rastreabilidade e medição de desempenho.
- Pré-condição: Deve existir pelo menos um pedido registrado no sistema.
- Regras de acesso:
  - Sistema: registra automaticamente os eventos de atendimento.
  - Gestor: pode consultar os registros históricos.

#### RF010 – Visualizar status do pedido

- Atores: Cliente, Garçom, Cozinha, Gestor
- Descrição: O sistema deve permitir o acompanhamento do status dos pedidos em tempo real.
- Justificativa: Fornece transparência ao cliente e melhora o acompanhamento operacional do pedido.
- Pré-condição: Deve existir pedido associado à comanda.
- Regras de acesso:
  - Cliente: visualiza o status dos pedidos da própria comanda.
  - Garçom/Cozinha/Gestor: visualizam o status dos pedidos conforme seu escopo operacional.

#### RF011 – Exibir comanda digital

- Atores: Cliente, Garçom
- Descrição: O sistema deve permitir a visualização da comanda digital, incluindo itens consumidos e valor parcial acumulado.
- Justificativa: Permite acompanhamento claro da conta durante o atendimento.
- Pré-condição: Deve existir comanda ativa associada à mesa.
- Regras de acesso:
  - Cliente: pode visualizar a comanda vinculada à mesa acessada por QR Code.
  - Garçom: pode visualizar comandas de todas as mesas.

#### RF012 – Registrar tempo por status do pedido

- Atores: Sistema
- Descrição: O sistema deve registrar automaticamente o tempo de permanência de cada pedido em cada status do fluxo de atendimento.
- Justificativa: Permite identificar gargalos operacionais e medir o desempenho das etapas do processo.
- Pré-condição: O pedido deve sofrer alteração de status.

#### RF013 – Registrar pagamento da comanda

- Atores: Cliente, Garçom
- Descrição: O sistema deve permitir registrar o fechamento e pagamento da comanda.
- Justificativa: Conclui o fluxo operacional de atendimento bloqueia a comanda para novos pedidos e libera a mesa para novos clientes.
- Pre-condição: A comanda deve estar com status "Aberta" e possuir itens lançados.
- Regras de acesso:
  - Cliente: Apenas visualiza o extrato de consumo e solicita o fechamento.
  - Garçom: Seleciona a comanda, insere a forma de pagamento informada pelo cliente e confirma o encerramento no sistema.

#### RF014 – Notificar novos pedidos à cozinha

- Atores: Sistema, Cozinha
- Descrição: O sistema deve sinalizar à cozinha a existência de novos pedidos pendentes, por sinal sonoro e visual.
- Justificativa: Garante agilidade no início do preparo.

#### RF015 – Exibir indicadores operacionais

- Atores: Gestor
- Descrição: O sistema deve permitir a visualização de indicadores operacionais, como tempo médio por status, produtos mais vendidos e ticket médio.
- Justificativa: Apoia a gestão e reforça o valor analítico da solução.

#### RF016 - Gerenciar restaurantes

- Atores: Gestor, Sistema
- Descrição: O sistema deve permitir gerenciar mais de um restaurante, isso inclui a criação, visualização, editção e exclusão de restaurantes.
- Justificativa: Gestores de restaurantes de rede pode gerenciar mais de uma filial.

#### RF017 - Registrar histórico de transferência de comanda

- Atores: Sistema, Garçom
- Descrição: O sistema deve registrar o histórico de transferências de comandas entre mesas.
- Justificativa: Permite rastrear alterações no vínculo das comandas, garantindo maior controle operacional e apoio à auditoria de atendimento.
- Pré-condição: Deve existir uma transferência de comanda realizada no sistema.
- Regras de acesso:
  - Sistema: registra automaticamente a mesa de origem, a mesa de destino, a data/hora da transferência e o usuário responsável.
  - Gestor: pode consultar esse histórico, caso essa consulta exista no sistema.

## 6.3.2 Requisitos Não Funcionais

Perguntas respondidas

- Qual desempenho esperado?
- O sistema precisa ser responsivo?
- Qual segurança mínima?
- Qual tempo de resposta?
- O sistema precisa escalar?

**Resultado**
Definição de:

- performance;
- responsividade;
- segurança;
- disponibilidade;
- escalabilidade;
- integridade.

### Lista dos requisitos não funcionais

#### RNF – Desempenho

##### RNF001 – Tempo de resposta

O sistema deve responder às requisições do usuário em até 2 segundos em condições normais de uso.

**Justificativa:**
Ambientes de restaurante exigem rapidez; atrasos impactam diretamente a experiência do cliente e a operação.

##### RNF002 – Atualização quase em tempo real

O sistema deve atualizar informações críticas (status de pedidos, novos pedidos) em intervalos de no máximo 3 a 5 segundos.

**Justificativa:**
Como será utilizado polling no MVP, esse intervalo garante percepção de tempo real sem aumentar a complexidade.

##### RNF003 – Suporte a múltiplos usuários simultâneos

O sistema deve suportar múltiplos acessos simultâneos por mesa, incluindo vários clientes interagindo com a mesma comanda.

**Justificativa:**
Mesas com grupos exigem concorrência segura e consistente.

#### RNF – Segurança

##### RNF004 – Autenticação de usuários administrativos

O sistema deve garantir autenticação segura para usuários administrativos (gestor, garçom e cozinha).

##### RNF005 – Controle de acesso por perfil

O sistema deve restringir funcionalidades com base no perfil do usuário (gestor, garçom, cozinha, cliente).

##### RNF006 – Proteção de dados sensíveis

O sistema deve proteger dados sensíveis, como credenciais de login, utilizando técnicas como criptografia.

##### RNF007 – Isolamento por mesa/comanda

O sistema deve garantir que clientes só tenham acesso às comandas vinculadas à mesa acessada via QR Code.

**Justificativa:**
Evita acesso indevido e garante privacidade entre mesas.

#### RNF – Usabilidade

##### RNF008 – Interface responsiva

O sistema deve ser responsivo, adaptando-se a diferentes tamanhos de tela (smartphones, tablets e desktops).

##### RNF009 – Facilidade de uso

O sistema deve permitir que um usuário realize um pedido em no máximo 3 interações principais (ex: escolher item → adicionar → confirmar).

##### RNF010 – Acesso sem instalação

O sistema deve ser acessível diretamente via navegador, sem necessidade de instalação, por meio de QR Code.

#### RNF – Disponibilidade

##### RNF011 – Disponibilidade do sistema

O sistema deve estar disponível durante o horário de funcionamento do estabelecimento, com tolerância mínima a indisponibilidades.

##### RNF012 – Tolerância a falhas de conexão

O sistema deve lidar de forma controlada com falhas de conexão, evitando perda de dados durante a criação de pedidos.

#### RNF – Escalabilidade

##### RNF013 – Escalabilidade vertical

O sistema deve permitir aumento de capacidade por meio da melhoria de recursos do servidor (CPU, memória).

##### RNF014 – Escalabilidade horizontal

O sistema deve permitir evolução futura para múltiplas instâncias da aplicação.

#### RNF – Manutenibilidade

##### RNF015 – Organização modular

O sistema deve ser desenvolvido de forma modular, facilitando manutenção e evolução.

##### RNF016 – Padronização de código

O código deve seguir padrões definidos pela equipe, garantindo legibilidade e consistência.

#### RNF – Confiabilidade

##### RNF017 – Integridade dos dados

O sistema deve garantir que pedidos, comandas e status não sejam perdidos ou corrompidos durante o uso.

##### RNF018 – Persistência de dados

Todos os dados relevantes (pedidos, comandas, tempos de status) devem ser armazenados de forma persistente.

#### RNF – Monitoramento

##### RNF019 – Registro de eventos

O sistema deve registrar eventos importantes, como criação de pedidos e mudanças de status.

##### RNF020 – Coleta de métricas

O sistema deve permitir coleta de dados para geração de métricas operacionais.

## 7. UML

### 7.1 Casos de Uso

Perguntas respondidas

- Quem usa o sistema?
- O que cada ator faz?
- Como os usuários interagem?

**Resultado**
Mapeamento de:

- cliente;
- garçom;
- cozinha;
- gestor;
- sistema.

### 7.2 Atores do sistema

Com base nos requisitos levantados, os principais atores do sistema são:

- Cliente
- Garçom
- Cozinha
- Gestor
- Sistema (ator secundário para ações automáticas, como registro de tempo e histórico)

### 7.3 Casos de uso principais

- Cliente
  - Acessar mesa via QR Code
  - Criar comanda
  - Visualizar comandas da mesa
  - Renomear comanda
  - Visualizar cardápio
  - Visualizar itens disponíveis
  - Criar pedido
  - Atualizar pedido enquanto estiver “Na fila”
  - Excluir pedido enquanto estiver “Na fila”
  - Visualizar status do pedido
  - Visualizar comanda digital
  - Efetuar pagamento
- Garçom
  - Fazer login
  - Visualizar mesas
  - Visualizar comandas
  - Criar comanda
  - Atualizar comanda
  - Transferir comanda entre mesas
  - Criar pedido
  - Atualizar pedido enquanto estiver “Na fila”
  - Excluir pedido enquanto estiver “Na fila”
  - Marcar pedido como entregue
  - Visualizar cardápio
  - Visualizar itens do cardápio
  - Atualizar disponibilidade de cardápios
  - Atualizar disponibilidade de itens
  - Visualizar comanda digital
- Cozinha
  - Fazer login
  - Visualizar pedidos
  - Atualizar status do pedido para “Em preparo”
  - Atualizar status do pedido para “Pronto”
  - Visualizar cardápio
  - Visualizar itens do cardápio
  - Atualizar disponibilidade de cardápios
  - Atualizar disponibilidade de itens
- Gestor
  - Fazer login
  - Gerenciar mesas
  - Gerenciar garçons
  - Gerenciar cardápios
  - Gerenciar itens do cardápio
  - Visualizar histórico de atendimento
  - Visualizar indicadores operacionais
  - Visualizar status dos pedidos
- Sistema
  - Registrar histórico de atendimento
  - Registrar tempo por status do pedido
  - Atualizar saldo parcial da comanda
  - Notificar novos pedidos para a cozinha

### 7.4 Diagrama de Classes

Perguntas respondidas

- Quais entidades existem?
- Como elas se relacionam?
- Quais atributos e métodos existem?

**Resultado**
Estruturação das classes:

- usuário;
- pedido;
- comanda;
- item;
- pagamento;
- histórico.

### 7.5 Principais classes do sistema

Com base nos requisitos definidos, as classes principais do sistema são:

- Usuario
- Cliente
- Funcionario
- Gestor
- Garcom
- Cozinha
- Mesa
- Comanda
- Pedido
- ItemPedido
- Cardapio
- ItemCardapio
- Pagamento
- HistoricoStatusPedido
- HistoricoAtendimento

### 7.6 Classes, atributos e métodos

Abaixo está uma versão inicial, já adequada para documentação.

- **Classe: Usuario**
  - Atributos
    - id: int
    - nome: string
    - login: string
    - senhaHash: string
    - perfil: string
    - ativo: boolean
  - Métodos
    - autenticar()
    - logout()

- **Classe: Funcionario**
  - Herda de: Usuario
  - Atributos
    - matricula: string
  - Métodos
    - visualizarPedidos()

- **Classe: Gestor**
  - Herda de: Funcionario
  - Métodos
    - criarMesa()
    - atualizarMesa()
    - excluirMesa()
    - criarGarcom()
    - atualizarGarcom()
    - excluirGarcom()
    - criarCardapio()
    - excluirCardapio()
    - visualizarIndicadores()

- **Classe: Garcom**
  - Herda de: Funcionario
  - Métodos
    - criarComanda()
    - transferirComanda()
    - criarPedido()
    - atualizarPedido()
    - entregarPedido()

- **Classe: Cozinha**
  - Herda de: Funcionario
  - Métodos
    - visualizarFila()
    - iniciarPreparo()
    - finalizarPreparo()
    - atualizarDisponibilidadeItem()

- **Classe: Cliente**
  - Atributos
    - idSessao: string
    - mesaAtual: int
  - Métodos
    - acessarMesaPorQrCode()
    - criarComanda()
    - renomearComanda()
    - criarPedido()
    - atualizarPedido()
    - excluirPedido()
    - visualizarComanda()
    - acompanharPedido()

- **Classe: Mesa**
  - Atributos
    - id: int
    - numero: int
    - status: string
    - ativa: boolean
  - Métodos
    - ativar()
    - inativar()

- **Classe: Comanda**
  - Atributos
    - id: int
    - apelido: string
    - saldoParcial: decimal
    - status: string
    - dataAbertura: datetime
  - Métodos
    - adicionarPedido()
    - removerPedido()
    - calcularSaldo()
    - encerrar()

- **Classe: Pedido**
  - Atributos
    - id: int
    - status: string
    - dataCriacao: datetime
    - dataUltimaAtualizacao: datetime
    - valorTotal: decimal
  - Métodos
    - adicionarItem()
    - removerItem()
    - calcularTotal()
    - atualizarStatus()

- **Classe: ItemPedido**
  - Atributos
    - id: int
    - quantidade: int
    - precoUnitario: decimal
    - observacao: string
    - subtotal: decimal
  - Métodos
    - calcularSubtotal()

- **Classe: Cardapio**
  - Atributos
    - id: int
    - nome: string
    - descricao: string
    - status: string
    - horarioInicio: time
    - horarioFim: time
  - Métodos
    - ativar()
    - inativar()
    - adicionarItem()
    - removerItem()

- **Classe: ItemCardapio**
  - Atributos
    - id: int
    - nome: string
    - descricao: string
    - preco: decimal
    - disponibilidade: boolean
    - categoria: string
  - Métodos
    - ativar()
    - inativar()
    - atualizarPreco()

- **Classe: Pagamento**
  - Atributos
    - id: int
    - valor: decimal
    - formaPagamento: string
    - status: string
    - dataPagamento: datetime
  - Métodos
    - registrarPagamento()
    - confirmarPagamento()
    - cancelarPagamento()

- **Classe: HistoricoStatusPedido**
  - Atributos
    - id: int
    - statusAnterior: string
    - statusNovo: string
    - dataHoraMudanca: datetime
    - tempoNoStatusAnterior: int
  - Métodos
    - registrarMudanca()

- **Classe: HistoricoAtendimento**
  - Atributos
    - id: int
    - acao: string
    - dataHora: datetime
    - ator: string
    - descricao: string
  - Métodos
    - registrarEvento()

### 7.7 Diagrama de Atividades

Justificativa:
O sistema possui um fluxo muito claro e central:

- Cliente acessa a mesa
- Cria ou seleciona comanda
- Faz pedido
- Cozinha recebe
- Cozinha prepara
- Garçom entrega
- Cliente acompanha
- Comanda é paga e encerrada

*obs: Esse fluxo é muito adequado para um Diagrama de Atividades, porque ele mostra a sequência operacional do pedido de ponta a ponta.*
**Fluxo sugerido**

- Início
- Ler QR Code
- Selecionar ou criar comanda
- Visualizar cardápio
- Escolher itens
- Criar pedido
- Enviar pedido
- Cozinha recebe pedido
- Atualizar status para “Em preparo”
- Atualizar status para “Pronto”
- Garçom entrega
- Atualizar status para “Entregue”
- Atualizar saldo/comanda
- Realizar pagamento
- Encerrar comanda
- Fim

## 8. Banco de Dados

Perguntas respondidas

- Relacional ou NoSQL?
- O sistema exige integridade forte?
- Como armazenar relacionamentos?
- Como manter consistência?

**Resultado**
Escolha de:

- PostgreSQL;
- modelagem relacional;
- DER;
- MER;
- SQL físico inicial.

### 8.1 Modelagem do banco de dados

Como a escolha mais adequada é relacional, o ideal é apresentar:

- Modelo conceitual
- DER/MER
- Modelo lógico
- Modelo físico inicial

### 8.2 Principais entidades do sistema

Com base no diagrama de classes e nos requisitos, as principais entidades são:

- Usuário
- Mesa
- Comanda
- Pedido
- ItemPedido
- Cardápio
- ItemCardápio
- Pagamento
- HistóricoStatusPedido
- HistóricoAtendimento

### 8.3 Modelo Conceitual

#### Entidades e relacionamentos

- Usuário
  Representa os usuários autenticados do sistema:
  - gestor
  - garçom
  - cozinha

**Mesa**
Representa as mesas físicas do estabelecimento.

**Comanda**
Representa a conta aberta associada a uma mesa.

**Pedido**
Representa um conjunto de itens solicitados dentro de uma comanda.

**ItemPedido**
Representa cada item incluído em um pedido.

**Cardápio**
Representa um cardápio disponível em determinado contexto.

**ItemCardápio**
Representa um produto disponível para venda.

**Pagamento**
Representa o registro de pagamento de uma comanda.

**HistóricoStatusPedido**
Representa as mudanças de status de um pedido ao longo do tempo.

**HistóricoAtendimento**
Representa registros de ações operacionais no sistema.

#### Relacionamentos principais

- Uma **mesa** pode possuir várias **comandas**
- Uma **comanda** pertence a uma única **mesa**
- Uma **comanda** pode possuir vários **pedidos**
- Um **pedido** pertence a uma única **comanda**
- Um **pedido** pode possuir vários **itens de pedido**
- Um **item de pedido** referencia um único **item do cardápio**
- Um **cardápio** pode possuir vários **itens do cardápio**
- Uma **comanda** pode possuir zero ou mais **pagamentos**
- Um **pedido** pode possuir vários registros em **histórico de status**
- Um **usuário** pode gerar vários registros em **histórico de atendimento**

### 8.4 DER textual

Vocês podem descrever o DER assim:

- **Tabelas:**
  - usuarios
  - mesas
  - comandas
  - pedidos
  - itens_pedido
  - cardapios
  - itens_cardapio
  - cardapio_itens
  - pagamentos
  - historico_status_pedido
  - historico_atendimento

- **Relacionamentos**
  - mesas (1) —— (N) comandas
  - comandas (1) —— (N) pedidos
  - pedidos (1) —— (N) itens_pedido
  - itens_cardapio (1) —— (N) itens_pedido
  - cardapios (N) —— (N) itens_cardapio
  - resolvido por cardapio_itens
  - comandas (1) —— (N) pagamentos
  - pedidos (1) —— (N) historico_status_pedido
  - usuarios (1) —— (N) historico_atendimento

### 8.5 Modelo Lógico

- **Tabela: usuarios**
  - id_usuario (PK)
  - nome
  - email
  - login
  - senha_hash
  - perfil
  - ativo
  - created_at
  - updated_at

**Observação**
O campo perfil pode assumir valores como:

- gestor
- garcom
- cozinha

- **Tabela: mesas**
  - id_mesa (PK)
  - numero
  - status
  - ativo
  - created_at
  - updated_at

- **Tabela: comandas**
  - id_comanda (PK)
  - id_mesa (FK)
  - apelido
  - saldo_parcial
  - status
  - data_abertura
  - data_fechamento
  - created_at
  - updated_at

- **Tabela: pedidos**
  - id_pedido (PK)
  - id_comanda (FK)
  - status
  - valor_total
  - observacao
  - criado_por_tipo
  - criado_por_id_usuario (nullable)
  - criado_em
  - atualizado_em

**Observação**
Como o cliente é anônimo, o pedido pode ter:

- sido criado por usuário autenticado
- ou por cliente via QR Code

Por isso o campo criado_por_id_usuario pode ser nulo.

- **Tabela: itens_cardapio**
  - id_item_cardapio (PK)
  - nome
  - descricao
  - preco
  - categoria
  - status
  - tempo_estimado_preparo
  - created_at
  - updated_at

- **Tabela: itens_pedido**
  - id_item_pedido (PK)
  - id_pedido (FK)
  - id_item_cardapio (FK)
  - quantidade
  - preco_unitario
  - subtotal
  - observacao

- **Tabela: cardapios**
  - id_cardapio (PK)
  - nome
  - descricao
  - status
  - horario_inicio
  - horario_fim
  - created_at
  - updated_at

- **Tabela: cardapio_itens**
  Tabela associativa para permitir que um item esteja em mais de um cardápio.
  - id_cardapio (FK)
  - id_item_cardapio (FK)
**Chave primária composta:**
  - (id_cardapio, id_item_cardapio)

- **Tabela: pagamentos**
  - id_pagamento (PK)
  - id_comanda (FK)
  - valor
  - forma_pagamento
  - status
  - data_pagamento
  - transaction_id
  - created_at

- **Tabela: historico_status_pedido**
  - id_historico_status (PK)
  - id_pedido (FK)
  - status_anterior
  - status_novo
  - data_hora_mudanca
  - tempo_no_status_anterior_segundos

- **Tabela: historico_atendimento**
  - id_historico_atendimento (PK)
  - id_usuario (FK, nullable)
  - id_pedido (FK, nullable)
  - id_comanda (FK, nullable)
  - acao
  - descricao
  - data_hora

### 8.5 Modelo Físico Inicial

``` sql
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE,
    login VARCHAR(60) NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('gestor', 'garcom', 'cozinha')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mesas (
    id_mesa SERIAL PRIMARY KEY,
    numero INT NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'livre',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comandas (
    id_comanda SERIAL PRIMARY KEY,
    id_mesa INT NOT NULL,
    apelido VARCHAR(80),
    saldo_parcial NUMERIC(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'aberta',
    data_abertura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_fechamento TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comanda_mesa
        FOREIGN KEY (id_mesa) REFERENCES mesas(id_mesa)
);

CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_comanda INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'na_fila',
    valor_total NUMERIC(10,2) NOT NULL DEFAULT 0,
    observacao TEXT,
    criado_por_tipo VARCHAR(20) NOT NULL CHECK (criado_por_tipo IN ('cliente', 'garcom')),
    criado_por_id_usuario INT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedido_comanda
        FOREIGN KEY (id_comanda) REFERENCES comandas(id_comanda),
    CONSTRAINT fk_pedido_usuario
        FOREIGN KEY (criado_por_id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE itens_cardapio (
    id_item_cardapio SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10,2) NOT NULL,
    categoria VARCHAR(60),
    status VARCHAR(20) NOT NULL DEFAULT 'ativo',
    tempo_estimado_preparo INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itens_pedido (
    id_item_pedido SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_item_cardapio INT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    observacao TEXT,
    CONSTRAINT fk_itempedido_pedido
        FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    CONSTRAINT fk_itempedido_itemcardapio
        FOREIGN KEY (id_item_cardapio) REFERENCES itens_cardapio(id_item_cardapio)
);

CREATE TABLE cardapios (
    id_cardapio SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    descricao TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo',
    horario_inicio TIME,
    horario_fim TIME,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cardapio_itens (
    id_cardapio INT NOT NULL,
    id_item_cardapio INT NOT NULL,
    PRIMARY KEY (id_cardapio, id_item_cardapio),
    CONSTRAINT fk_cardapioitens_cardapio
        FOREIGN KEY (id_cardapio) REFERENCES cardapios(id_cardapio),
    CONSTRAINT fk_cardapioitens_item
        FOREIGN KEY (id_item_cardapio) REFERENCES itens_cardapio(id_item_cardapio)
);

CREATE TABLE pagamentos (
    id_pagamento SERIAL PRIMARY KEY,
    id_comanda INT NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    forma_pagamento VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL,
    data_pagamento TIMESTAMP,
    transaction_id VARCHAR(120),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pagamento_comanda
        FOREIGN KEY (id_comanda) REFERENCES comandas(id_comanda)
);

CREATE TABLE historico_status_pedido (
    id_historico_status SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    status_anterior VARCHAR(20),
    status_novo VARCHAR(20) NOT NULL,
    data_hora_mudanca TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tempo_no_status_anterior_segundos INT,
    CONSTRAINT fk_historico_status_pedido
        FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
);

CREATE TABLE historico_atendimento (
    id_historico_atendimento SERIAL PRIMARY KEY,
    id_usuario INT,
    id_pedido INT,
    id_comanda INT,
    acao VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_histatendimento_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_histatendimento_pedido
        FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    CONSTRAINT fk_histatendimento_comanda
        FOREIGN KEY (id_comanda) REFERENCES comandas(id_comanda)
);
```

## 9. Usabilidade

Perguntas respondidas

- O sistema é fácil de usar?
- Quantos cliques o usuário faz?
- O fluxo é rápido?
- Como reduzir atrito?

**Resultado**
Definição de:

- UX mobile-first;
- métricas de usabilidade;
- tempo máximo por ação;
- fluxo simplificado.

### 9.1 Facilidade de aprendizado

O sistema deve ser intuitivo o suficiente para que um usuário consiga utilizá-lo **sem necessidade de treinamento prévio**.

- **Aplicação no projeto**
  - Cliente acessa via QR Code e já consegue navegar
  - Interface com poucos passos
  - Botões claros (“Adicionar”, “Confirmar pedido”)

- **Relação com requisitos**
  - RF002 (Gerenciar comandas)
  - RF003 (Gerenciar pedidos)
  - RF011 (Visualizar status)

### 9.2 Eficiência de uso

O sistema deve permitir que tarefas sejam realizadas **com o menor número possível de ações**.

- Aplicação no projeto
  - Fazer pedido em poucos cliques
  - Fluxo direto: escolher item → adicionar → confirmar

- Relação com requisitos
  - RF003 (Pedidos)
  - RF012 (Comanda digital)

### 9.3 Clareza e feedback visual

O sistema deve fornecer feedback claro sobre ações realizadas.

- Aplicação no projeto
  - Status do pedido visível (“Em preparo”, “Pronto”)
  - Confirmação visual ao adicionar item
  - Atualização do valor da comanda em tempo real

- Relação com requisitos
  - RF011 (Status do pedido)
  - RF010 (Histórico)
  - RNF002 (Tempo quase real)

### 9.4 Consistência da interface

Elementos visuais e comportamentos devem seguir padrões consistentes.

- Aplicação no projeto
  - Mesma lógica de botões em todas as telas
  - Padrão de cores para status:
    - amarelo → na fila
    - azul → preparo
    - verde → pronto

### 9.5 Responsividade e adaptação

O sistema deve funcionar corretamente em diferentes dispositivos.

- Aplicação no projeto
  - PWA responsivo
  - Uso otimizado em smartphones (principal canal)

- Relação com requisitos
  - RNF008 (Interface responsiva)

### 9.6 Prevenção de erros

O sistema deve evitar ações inválidas e reduzir erros do usuário.

- Aplicação no projeto
  - Bloquear edição de pedido após “em preparo”
  - Não permitir excluir comanda com pedidos

- Relação com requisitos
  - RF003 (Pedidos)
  - RF002 (Comandas)

### 9.7 Visibilidade do estado do sistema

O usuário deve sempre saber o que está acontecendo.

- Aplicação no projeto
  - Mostrar status do pedido
  - Mostrar tempo de espera (cronômetro)
  - Mostrar valor atualizado da comanda

### 9.8 Métricas de Usabilidade

Agora vem a parte que muita gente faz mal — vocês vão fazer bem.

**M1 – Tempo para realizar pedido**
Definição:
Tempo médio que o usuário leva para fazer um pedido completo.

Meta:
Até 30 segundos

**M2 – Número de interações por pedido**
Definição:
Quantidade de ações necessárias para finalizar um pedido.

Meta:
Máximo de 3 a 5 interações

**M3 – Taxa de erro do usuário**
Definição:
Quantidade de ações inválidas ou canceladas.

Meta:
Inferior a 5%

**M4 – Tempo de resposta percebido**
Definição:
Tempo entre ação do usuário e feedback do sistema.

Meta:
Até 3 segundos
(Relacionado ao RNF001)

**M5 – Taxa de sucesso na tarefa**
Definição:
Percentual de usuários que conseguem completar uma ação sem ajuda.

Meta:
Acima de 90%

**M6 – Satisfação do usuário (qualitativa)**
Definição:
Percepção do usuário sobre facilidade de uso.

Coleta:
Feedback simples:
“Foi fácil fazer seu pedido?”

**M7 – Tempo médio por status do pedido**
Definição:
Tempo médio em:

fila
preparo
pronto

Uso:
identificar gargalos

### 9.9 Relação com UML e Sistema

- **Casos de uso impactados**
  - Fazer pedido
  - Visualizar cardápio
  - Acompanhar pedido
  - Visualizar comanda

**Impacto nos wireframes**
Esses critérios devem orientar:

- Layout simples
- Hierarquia clara de informações
- Botões grandes e acessíveis
- Fluxo linear (sem telas desnecessárias)

## 10. Segurança Digital

Perguntas respondidas

- Quem pode acessar o quê?
- Como proteger dados?
- Como rastrear ações?
- Como evitar acesso indevido?

**Resultado**
Definição de:

- autenticação;
- autorização;
- criptografia;
- HTTPS;
- rastreabilidade;
- histórico.

### 10.1 Autenticação segura de usuários

O sistema deve garantir que apenas usuários autorizados (gestor, garçom e cozinha) possam acessar funcionalidades administrativas.

- Aplicação no projeto
  - Login com senha (RF007)
  - Senha armazenada com hash (não em texto puro)
- Relação com RNF
  - RNF004 (Autenticação)
  - RNF006 (Proteção de dados)

### 10.2 Controle de acesso por perfil (Autorização)

O sistema deve restringir funcionalidades com base no perfil do usuário.

- Aplicação no projeto
  - Gestor: acesso total
  - Garçom: operações de atendimento
  - Cozinha: controle de pedidos
  - Cliente: acesso restrito via QR Code
- Relação com RNF
  - RNF005 (Controle de acesso)

### 10.3 Proteção de dados sensíveis

O sistema deve proteger informações críticas contra acesso indevido.

- Aplicação no projeto
  - Senhas criptografadas
  - Dados de pagamento protegidos
  - Não expor dados internos via API

### 10.4 Integridade dos dados

O sistema deve garantir que os dados não sejam corrompidos ou inconsistentes.

- Aplicação no projeto
  - Transações no banco (ex: criação de pedido + itens)
  - Validação de status (não pular etapas)
- Relação com RNF
  - RNF017 (Integridade)

### 10.5 Registro e rastreabilidade (auditoria)

O sistema deve registrar ações relevantes para auditoria.

- Aplicação no projeto
  - Histórico de atendimento (RF010)
  - Histórico de status (RF012)
  - Transferência de comandas registrada

### 10.6 Comunicação segura

O sistema deve proteger os dados em trânsito.

- Aplicação no projeto
  - Uso de HTTPS
  - Evitar envio de dados sensíveis em URL

### 10.7 Backup e recuperação

O sistema deve garantir que os dados não sejam perdidos.

- Aplicação no projeto
  - Backup automático do banco
  - Possibilidade de restauração

### 10.8 Prevenção de acesso indevido por QR Code

O sistema deve evitar que usuários acessem dados de outras mesas.

- Aplicação no projeto
  - Sessão vinculada à mesa
  - Token de acesso por QR Code

### 10.9 Implementação na Modelagem do Banco

Agora conectando com o banco (PostgreSQL 👇)

- Criptografia de dados
  - senha_hash → armazenar com hash (bcrypt)
  - nunca salvar senha em texto puro

- Controle de acesso ao banco
  - Usuário do banco com permissões restritas
  - Separar:
    - leitura
    - escrita
    - administração

- Integridade referencial
  - uso de foreign keys
  - evitar:
    - pedidos sem comanda
    - itens sem pedido

- Backup
  - backups automáticos (diários)
  - retenção de histórico

- Logs e histórico
tabelas:
  - historico_atendimento
  - historico_status_pedido

### 10.10 Impacto na Experiência do Usuário

Aqui está o equilíbrio importante.

- **O que NÃO pode acontecer**
  - Login complicado demais
  - Excesso de validações travando fluxo
  - Lentidão por segurança mal implementada
- **Estratégia adotada**
  - Para clientes:
    - acesso simples via QR Code
    - sem login obrigatório
    - segurança invisível (sessão)
  - Para funcionários:
    - login simples e rápido
    - permissões automáticas por perfil
  - Resultado esperado
    - Sistema seguro sem atrito
    - Experiência rápida
    - Operação fluida no restaurante
