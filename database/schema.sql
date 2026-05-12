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
  preco numeric(10, 2) not null check (preco >= 0),
  categoria varchar(80) not null,
  disponivel boolean not null default true,
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
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists itens_pedido (
  id bigserial primary key,
  pedido_id bigint not null references pedidos(id) on delete cascade,
  item_cardapio_id bigint not null references itens_cardapio(id),
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(10, 2) not null check (preco_unitario >= 0),
  observacao text
);

create table if not exists pagamentos (
  id bigserial primary key,
  comanda_id bigint not null references comandas(id),
  valor numeric(10, 2) not null check (valor >= 0),
  status varchar(30) not null default 'pendente',
  criado_em timestamptz not null default now()
);

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
