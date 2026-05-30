import { query } from '../../database/pool.js';

export async function findUserByEmail(email) {
  const result = await query(
    'select id, nome, email, senha_hash, perfil, ativo from usuarios where email = $1 limit 1',
    [email],
  );

  return result.rows[0];
}

export async function findUserByLogin(login) {
  const result = await query(
    `select id, nome, email, senha_hash, perfil, ativo
     from usuarios
     where lower(email) = lower($1) or lower(nome) = lower($1)
     limit 1`,
    [login],
  );

  return result.rows[0];
}

export async function updateUserPassword(userId, senhaHash) {
  const result = await query(
    `update usuarios set senha_hash = $2, atualizado_em = now()
     where id = $1
     returning id, nome, email, perfil, ativo`,
    [userId, senhaHash],
  );

  return result.rows[0];
}
