# AGENTS.md — MWN CORE

## Contexto do Projeto

A MWN CORE está desenvolvendo um SaaS de cardápio digital para hamburguerias, pizzarias, esfiharias e restaurantes.

O sistema permite que clientes acessem o cardápio por QR Code, criem comandas, façam pedidos, acompanhem o status dos pedidos e visualizem o valor parcial da conta. Também permite que garçons, cozinha e gestor acompanhem e gerenciem o fluxo operacional.

## Objetivo do Sistema

Criar uma aplicação Web + PWA simples, responsiva e eficiente, com foco em:

- agilizar o atendimento;
- reduzir erros operacionais;
- reduzir uso de papel;
- permitir acompanhamento de pedidos;
- registrar tempos de produção;
- gerar dados para análise operacional.

## Stack Tecnológica

- Backend: Node.js + Express
- Banco de Dados: PostgreSQL
- Frontend: Web responsivo / PWA
- Comunicação em tempo real no MVP: Polling
- Arquitetura: Monolito modular

## Perfis de Usuário

### Cliente

Acessa o sistema via QR Code, sem login obrigatório.

Pode:

- visualizar cardápio;
- criar ou selecionar comanda;
- fazer pedidos;
- visualizar status do pedido;
- visualizar comanda digital.

### Garçom

Usuário autenticado.

Pode:

- visualizar mesas;
- criar comandas;
- registrar pedidos;
- transferir comandas;
- marcar pedidos como entregues.

### Cozinha

Usuário autenticado.

Pode:

- visualizar pedidos;
- alterar status para “Em preparo” e “Pronto”;
- atualizar disponibilidade de itens.

### Gestor

Usuário autenticado.

Pode:

- gerenciar mesas;
- gerenciar garçons;
- gerenciar cardápios;
- gerenciar itens;
- visualizar histórico;
- visualizar indicadores operacionais.

## Regras Gerais de Desenvolvimento

1. O código deve ser simples, legível e adequado para uma equipe iniciante.
2. Evitar complexidade desnecessária.
3. Priorizar o MVP.
4. Não implementar funcionalidades fora do escopo sem validação.
5. Toda regra de negócio importante deve ficar no backend.
6. O frontend deve apenas consumir a API e exibir os dados.
7. O sistema deve ser responsivo e pensado primeiro para mobile.
8. O cliente não deve precisar criar conta para usar o sistema.
9. Usuários administrativos devem fazer login.
10. Senhas nunca devem ser armazenadas em texto puro.

## Regras de Pedido

Status possíveis:

- Na fila
- Em preparo
- Pronto
- Entregue

Regras:

- Cliente e garçom podem criar pedido.
- Cliente e garçom só podem alterar ou excluir pedido enquanto estiver “Na fila”.
- Cozinha pode alterar o status para “Em preparo” e “Pronto”.
- Garçom pode alterar o status para “Entregue”.
- O sistema deve registrar o tempo em cada status.

## Regras de Comanda

- Uma mesa pode ter várias comandas.
- Uma comanda pertence a uma mesa.
- Cliente pode criar comanda via QR Code.
- Cliente pode renomear apenas sua comanda.
- Garçom pode transferir comanda entre mesas.
- Comanda só pode ser excluída se não tiver pedidos associados.
- O sistema deve calcular o saldo parcial da comanda.

## Regras de Segurança

- Usar autenticação para gestor, garçom e cozinha.
- Usar controle de acesso por perfil.
- Usar hash para senhas.
- Não expor dados sensíveis na API.
- Validar permissões no backend.
- Garantir que cliente acesse apenas a mesa/comanda vinculada ao QR Code.

## Banco de Dados

Banco escolhido: PostgreSQL.

Entidades principais:

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

## Padrão de Código

- Usar nomes claros.
- Separar rotas, controllers, services e repositories.
- Evitar arquivos muito grandes.
- Preferir funções pequenas.
- Comentar apenas regras de negócio relevantes.
- Validar dados de entrada antes de salvar no banco.

## Estrutura Recomendada do Backend

```txt
src/
  config/
  modules/
    auth/
    usuarios/
    mesas/
    comandas/
    pedidos/
    cardapios/
    pagamentos/
    historicos/
  middlewares/
  database/
  utils/
  server.js
```
