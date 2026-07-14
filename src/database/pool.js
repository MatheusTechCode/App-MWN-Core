import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

export const dbClient = env.databaseClient;

function createPostgresPool() {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL não configurado. Use DATABASE_CLIENT=sqlite para rodar a demo sem PostgreSQL.');
  }

  return new Pool({
    connectionString: env.databaseUrl,
  });
}

function normalizeSqliteValue(value) {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  return value;
}

function toSqliteQuery(text, params = []) {
  const values = [];
  const sql = text
    .replace(/\bnow\(\)/gi, 'current_timestamp')
    .replace(/\$(\d+)/g, (_, index) => {
      values.push(normalizeSqliteValue(params[Number(index) - 1]));
      return '?';
    });

  return { sql, values };
}

function hasReturning(text) {
  return /\breturning\b/i.test(text);
}

function createSqlitePool(DatabaseSync) {
  fs.mkdirSync(path.dirname(env.sqlitePath), { recursive: true });
  const database = new DatabaseSync(env.sqlitePath);
  database.exec('PRAGMA foreign_keys = ON');
  database.exec(fs.readFileSync('database/sqlite-schema.sql', 'utf8'));
  database.exec(fs.readFileSync('database/sqlite-seed.sql', 'utf8'));
  ensureSqliteColumns(database, 'itens_cardapio', [
    { name: 'imagem', sql: 'alter table itens_cardapio add column imagem text' },
    { name: 'tempo_preparo_minutos', sql: 'alter table itens_cardapio add column tempo_preparo_minutos integer not null default 0' },
    { name: 'cozinha_estacao_id', sql: 'alter table itens_cardapio add column cozinha_estacao_id integer references cozinha_estacoes(id)' },
  ]);
  ensureSqliteColumns(database, 'pedidos', [
    { name: 'urgente', sql: 'alter table pedidos add column urgente integer not null default 0' },
    { name: 'urgente_motivo', sql: 'alter table pedidos add column urgente_motivo text' },
    { name: 'urgente_em', sql: 'alter table pedidos add column urgente_em text' },
  ]);
  ensureSqliteColumns(database, 'itens_pedido', [
    { name: 'status', sql: "alter table itens_pedido add column status text not null default 'Na fila'" },
    { name: 'urgente', sql: 'alter table itens_pedido add column urgente integer not null default 0' },
    { name: 'urgente_motivo', sql: 'alter table itens_pedido add column urgente_motivo text' },
    { name: 'iniciado_preparo_em', sql: 'alter table itens_pedido add column iniciado_preparo_em text' },
    { name: 'pronto_em', sql: 'alter table itens_pedido add column pronto_em text' },
    { name: 'entregue_em', sql: 'alter table itens_pedido add column entregue_em text' },
    { name: 'atualizado_em', sql: 'alter table itens_pedido add column atualizado_em text not null default current_timestamp' },
  ]);
  database.exec(
    "update itens_pedido set status = (select status from pedidos where pedidos.id = itens_pedido.pedido_id) where status is null or status = ''",
  );
  database.exec(
    "insert into cozinha_configuracoes (modo_operacao, agrupar_entrega_mesa, agrupar_producao_semelhantes, tolerancia_minutos, alerta_fila_minutos, perfis_visao_consolidada) select 'simples', 1, 1, 3, 10, 'garcom' where not exists (select 1 from cozinha_configuracoes)",
  );

  async function sqliteQuery(text, params = []) {
    const { sql, values } = toSqliteQuery(text, params);
    const statement = database.prepare(sql);
    const command = text.trim().split(/\s+/)[0]?.toLowerCase();

    if (command === 'select' || hasReturning(text)) {
      return { rows: statement.all(...values) };
    }

    statement.run(...values);
    return { rows: [] };
  }

  return {
    async query(text, params) {
      return sqliteQuery(text, params);
    },

    async connect() {
      return {
        query: sqliteQuery,
        release() {},
      };
    },

    async end() {
      database.close();
    },
  };
}

const sqliteModule = env.databaseClient === 'sqlite' ? await import('node:sqlite') : null;

const databasePool =
  env.databaseClient === 'sqlite'
    ? createSqlitePool(sqliteModule.DatabaseSync)
    : createPostgresPool();

if (env.databaseClient === 'postgres') {
  await databasePool.query(fs.readFileSync('database/schema.sql', 'utf8'));
  await databasePool.query(
    `update itens_pedido ip
     set status = p.status
     from pedidos p
     where p.id = ip.pedido_id
       and (ip.status is null or ip.status = '')`,
  );
}

export const pool = databasePool;

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

function ensureSqliteColumns(database, tableName, columns) {
  const existingColumns = database.prepare(`pragma table_info(${tableName})`).all();
  const names = new Set(existingColumns.map((column) => column.name));

  for (const column of columns) {
    if (!names.has(column.name)) {
      database.exec(column.sql);
    }
  }
}
