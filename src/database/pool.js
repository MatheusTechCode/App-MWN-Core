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

export const pool =
  env.databaseClient === 'sqlite'
    ? createSqlitePool(sqliteModule.DatabaseSync)
    : createPostgresPool();

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}
