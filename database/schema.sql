create table if not exists usuarios (
  id bigserial primary key,
  nome varchar(120) not null,
  email varchar(160) not null unique,
  senha_hash varchar(255) not null,
  perfil varchar(30) not null check (perfil in ('admin', 'garcom', 'cozinha')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists mesas (
  id bigserial primary key,
  numero integer not null unique,
  token_qr varchar(80) not null unique,
  status varchar(30) not null default 'ativa',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists comandas (
  id bigserial primary key,
  mesa_id bigint not null references mesas(id),
  nome_cliente varchar(120) not null,
  codigo_cliente uuid not null,
  status varchar(30) not null default 'aberta' check (status in ('aberta', 'fechada')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists cardapios (
  id bigserial primary key,
  nome varchar(120) not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table if not exists itens_cardapio (
  id bigserial primary key,
  nome varchar(120) not null,
  descricao text,
  imagem text,
  preco numeric(10, 2) not null check (preco >= 0),
  categoria varchar(80) not null,
  disponivel boolean not null default true,
  tempo_preparo_minutos integer not null default 0 check (tempo_preparo_minutos >= 0),
  cozinha_estacao_id bigint,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table itens_cardapio
  add column if not exists imagem text;

alter table itens_cardapio
  add column if not exists tempo_preparo_minutos integer not null default 0;

alter table itens_cardapio
  add column if not exists cozinha_estacao_id bigint;

create table if not exists cozinha_configuracoes (
  id bigserial primary key,
  modo_operacao varchar(20) not null default 'simples' check (modo_operacao in ('simples', 'avancado')),
  agrupar_entrega_mesa boolean not null default true,
  agrupar_producao_semelhantes boolean not null default true,
  tolerancia_minutos integer not null default 3 check (tolerancia_minutos >= 0),
  alerta_fila_minutos integer not null default 10 check (alerta_fila_minutos > 0),
  perfis_visao_consolidada text not null default 'garcom',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists cozinha_estacoes (
  id bigserial primary key,
  nome varchar(80) not null unique,
  slug varchar(80) not null unique,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists cardapio_itens (
  cardapio_id bigint not null references cardapios(id),
  item_cardapio_id bigint not null references itens_cardapio(id),
  primary key (cardapio_id, item_cardapio_id)
);

create table if not exists pedidos (
  id bigserial primary key,
  comanda_id bigint not null references comandas(id),
  status varchar(30) not null check (status in ('Na fila', 'Em preparo', 'Pronto', 'Entregue')),
  observacao text,
  criado_por varchar(30) not null default 'cliente',
  urgente boolean not null default false,
  urgente_motivo text,
  urgente_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table pedidos
  add column if not exists urgente boolean not null default false;

alter table pedidos
  add column if not exists urgente_motivo text;

alter table pedidos
  add column if not exists urgente_em timestamptz;

create table if not exists itens_pedido (
  id bigserial primary key,
  pedido_id bigint not null references pedidos(id) on delete cascade,
  item_cardapio_id bigint not null references itens_cardapio(id),
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(10, 2) not null check (preco_unitario >= 0),
  observacao text,
  status varchar(30) not null default 'Na fila' check (status in ('Na fila', 'Em preparo', 'Pronto', 'Entregue')),
  urgente boolean not null default false,
  urgente_motivo text,
  iniciado_preparo_em timestamptz,
  pronto_em timestamptz,
  entregue_em timestamptz,
  atualizado_em timestamptz not null default now()
);

alter table itens_pedido
  add column if not exists status varchar(30) not null default 'Na fila';

alter table itens_pedido
  add column if not exists urgente boolean not null default false;

alter table itens_pedido
  add column if not exists urgente_motivo text;

alter table itens_pedido
  add column if not exists iniciado_preparo_em timestamptz;

alter table itens_pedido
  add column if not exists pronto_em timestamptz;

alter table itens_pedido
  add column if not exists entregue_em timestamptz;

alter table itens_pedido
  add column if not exists atualizado_em timestamptz not null default now();

create table if not exists pagamentos (
  id bigserial primary key,
  comanda_id bigint not null references comandas(id),
  valor numeric(10, 2) not null check (valor >= 0),
  forma_pagamento varchar(40) not null default 'dinheiro',
  status varchar(30) not null default 'pendente',
  criado_em timestamptz not null default now()
);

alter table pagamentos
  add column if not exists forma_pagamento varchar(40) not null default 'dinheiro';

create table if not exists historico_status_pedido (
  id bigserial primary key,
  pedido_id bigint not null references pedidos(id) on delete cascade,
  status varchar(30) not null,
  alterado_por varchar(60) not null,
  criado_em timestamptz not null default now()
);

create table if not exists historico_atendimento (
  id bigserial primary key,
  mesa_id bigint references mesas(id),
  comanda_id bigint references comandas(id),
  acao varchar(120) not null,
  detalhes jsonb,
  criado_em timestamptz not null default now()
);

create index if not exists idx_comandas_mesa_status on comandas(mesa_id, status);
create index if not exists idx_pedidos_status on pedidos(status);
create index if not exists idx_historico_status_pedido on historico_status_pedido(pedido_id, criado_em);
create index if not exists idx_itens_pedido_status on itens_pedido(status);
create index if not exists idx_itens_cardapio_estacao on itens_cardapio(cozinha_estacao_id);

insert into cozinha_configuracoes (
  modo_operacao,
  agrupar_entrega_mesa,
  agrupar_producao_semelhantes,
  tolerancia_minutos,
  alerta_fila_minutos,
  perfis_visao_consolidada
)
select 'simples', true, true, 3, 10, 'garcom'
where not exists (select 1 from cozinha_configuracoes);
