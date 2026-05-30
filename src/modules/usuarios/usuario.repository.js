import { query } from '../../database/pool.js';

export async function listGarcons() {
  const result = await query(
    `select id, nome, email, perfil, ativo, criado_em, atualizado_em
     from usuarios
     where perfil = 'garcom'
     order by ativo desc, nome`,
  );

  return result.rows;
}

export async function findGarcomById(id) {
  const result = await query(
    `select id, nome, email, perfil, ativo
     from usuarios
     where id = $1 and perfil = 'garcom'
     limit 1`,
    [id],
  );

  return result.rows[0];
}

export async function createGarcom({ nome, email, senhaHash }) {
  const result = await query(
    `insert into usuarios (nome, email, senha_hash, perfil, ativo)
     values ($1, $2, $3, 'garcom', true)
     returning id, nome, email, perfil, ativo, criado_em, atualizado_em`,
    [nome, email, senhaHash],
  );

  return result.rows[0];
}

export async function updateGarcom({ id, nome, email, senhaHash }) {
  const params = [id, nome, email];
  let senhaSql = '';

  if (senhaHash) {
    params.push(senhaHash);
    senhaSql = ', senha_hash = $4';
  }

  const result = await query(
    `update usuarios
     set nome = $2, email = $3, ativo = true, atualizado_em = now()${senhaSql}
     where id = $1 and perfil = 'garcom'
     returning id, nome, email, perfil, ativo, criado_em, atualizado_em`,
    params,
  );

  return result.rows[0];
}

export async function disableGarcom(id) {
  const result = await query(
    `update usuarios
     set ativo = false, atualizado_em = now()
     where id = $1 and perfil = 'garcom'
     returning id, nome, email, perfil, ativo, criado_em, atualizado_em`,
    [id],
  );

  return result.rows[0];
}
