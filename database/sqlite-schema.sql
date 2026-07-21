create table if not exists usuarios (
  id integer primary key autoincrement,
  nome text not null,
  email text not null unique,
  senha_hash text not null,
  perfil text not null check (perfil in ('admin', 'garcom', 'cozinha')),
  ativo integer not null default 1,
  criado_em text not null default current_timestamp,
  atualizado_em text not null default current_timestamp
);

create table if not exists mesas (
  id integer primary key autoincrement,
  numero integer not null unique,
  token_qr text not null unique,
  status text not null default 'ativa',
  criado_em text not null default current_timestamp,
  atualizado_em text not null default current_timestamp
);

create table if not exists comandas (
  id integer primary key autoincrement,
  mesa_id integer not null references mesas(id),
  nome_cliente text not null,
  codigo_cliente text not null,
  status text not null default 'aberta' check (status in ('aberta', 'fechada')),
  criado_em text not null default current_timestamp,
  atualizado_em text not null default current_timestamp
);

create table if not exists cardapios (
  id integer primary key autoincrement,
  nome text not null,
  ativo integer not null default 1,
  criado_em text not null default current_timestamp
);

create table if not exists itens_cardapio (
  id integer primary key autoincrement,
  nome text not null,
  descricao text,
  imagem text,
  preco real not null check (preco >= 0),
  categoria text not null,
  disponivel integer not null default 1,
  tempo_preparo_minutos integer not null default 0 check (tempo_preparo_minutos >= 0),
  cozinha_estacao_id integer references cozinha_estacoes(id),
  criado_em text not null default current_timestamp,
  atualizado_em text not null default current_timestamp
);

create table if not exists cozinha_configuracoes (
  id integer primary key autoincrement,
  modo_operacao text not null default 'simples' check (modo_operacao in ('simples', 'avancado')),
  agrupar_entrega_mesa integer not null default 1,
  agrupar_producao_semelhantes integer not null default 1,
  tolerancia_minutos integer not null default 3 check (tolerancia_minutos >= 0),
  alerta_fila_minutos integer not null default 10 check (alerta_fila_minutos > 0),
  perfis_visao_consolidada text not null default 'garcom',
  criado_em text not null default current_timestamp,
  atualizado_em text not null default current_timestamp
);

create table if not exists cozinha_estacoes (
  id integer primary key autoincrement,
  nome text not null unique,
  slug text not null unique,
  ativo integer not null default 1,
  criado_em text not null default current_timestamp,
  atualizado_em text not null default current_timestamp
);

create table if not exists cardapio_itens (
  cardapio_id integer not null references cardapios(id),
  item_cardapio_id integer not null references itens_cardapio(id),
  primary key (cardapio_id, item_cardapio_id)
);

create table if not exists pedidos (
  id integer primary key autoincrement,
  comanda_id integer not null references comandas(id),
  status text not null check (status in ('Na fila', 'Em preparo', 'Pronto', 'Entregue')),
  observacao text,
  criado_por text not null default 'cliente',
  urgente integer not null default 0,
  urgente_motivo text,
  urgente_em text,
  criado_em text not null default current_timestamp,
  atualizado_em text not null default current_timestamp
);

create table if not exists itens_pedido (
  id integer primary key autoincrement,
  pedido_id integer not null references pedidos(id) on delete cascade,
  item_cardapio_id integer not null references itens_cardapio(id),
  quantidade integer not null check (quantidade > 0),
  preco_unitario real not null check (preco_unitario >= 0),
  observacao text,
  status text not null default 'Na fila' check (status in ('Na fila', 'Em preparo', 'Pronto', 'Entregue')),
  urgente integer not null default 0,
  urgente_motivo text,
  iniciado_preparo_em text,
  pronto_em text,
  entregue_em text,
  atualizado_em text not null default current_timestamp
);

create table if not exists pagamentos (
  id integer primary key autoincrement,
  comanda_id integer not null references comandas(id),
  valor real not null check (valor >= 0),
  forma_pagamento text not null default 'dinheiro',
  status text not null default 'pendente',
  criado_em text not null default current_timestamp
);

create table if not exists historico_status_pedido (
  id integer primary key autoincrement,
  pedido_id integer not null references pedidos(id) on delete cascade,
  status text not null,
  alterado_por text not null,
  criado_em text not null default current_timestamp
);

create table if not exists historico_atendimento (
  id integer primary key autoincrement,
  mesa_id integer references mesas(id),
  comanda_id integer references comandas(id),
  acao text not null,
  detalhes text,
  criado_em text not null default current_timestamp
);

create index if not exists idx_comandas_mesa_status on comandas(mesa_id, status);
create index if not exists idx_pedidos_status on pedidos(status);
create index if not exists idx_historico_status_pedido on historico_status_pedido(pedido_id, criado_em);

insert into cozinha_configuracoes (
  modo_operacao,
  agrupar_entrega_mesa,
  agrupar_producao_semelhantes,
  tolerancia_minutos,
  alerta_fila_minutos,
  perfis_visao_consolidada
)
select 'simples', 1, 1, 3, 10, 'garcom'
where not exists (select 1 from cozinha_configuracoes);
