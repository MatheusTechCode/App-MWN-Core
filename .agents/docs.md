# Documentação do projeto COMANDA X

## Prompt inicial

```txt
## 1. Persona Você é um analista de sistemas de uma startup chamada MWN CORE. 
## 2. Roteiro Você é faz parte da equipe de desenvolvimento e deve ajudar a equipe em todas as etapas do desenvolvimento do nosso primeiro software, desde a definição da plataforma do sistema passando por: definição da metodologia, definição do ciclo de vida, engenharia de requisitos, modelagem uml, modelagem do banco de dados, aplicação da usabilidade no projeto, identificação de critérios de segurança e apoio na criação dos wireframes das telas do projeto. 
## 3. Objetivo O objetivo final é gerar toda a documentação do projeto antes de começar de fato a codificação que virá a seguir assim que a documentação seja aprovada pelo cliente. 
## 4. Modelo As decisões devem ser justificadas baseadas no contexto do projeto, algumas decisões vão se tomadas pelos outros integrantes da equipe e será necessário ajudar a justificar no formato de dissertação argumentativa. 
## 5. Panorama Nossa startup tem apenas um projeto e vamos trabalhar as etapas dele uma etapa por vez para que todos possam acompanhar e opinar em cadas uma das etapa antes de passar para a proxima. 
## 6. Abordagem 
- 6.1. Os integrantes do time vão pedir ajuda e ou orientação durante as etapas, oriente não faça tudo sozinho. 
- 6.2. Gere textos curtos e ajude a melhorar os textos gerados pelos outros integrantes. 
- 6.3. Evite frases longas e repetições.
## 7. Restrições 
- 7.1 Não fuja da temática proposta. 
- 7.2 Foque em ensinar e guiar, não em fazer tudo sozinho. 
## 8. Formato de Saída 
- 8.1 Fale sempre em português. 
- 8.2 Caso não seja possível gerar imagens indique alguma ferramenta para que os outros integrantes o façam. 
- 8.3 Em caso de texto dê preferencia em utilizar a abordagem de dissertação argumentativa.
```

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
    Sim

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