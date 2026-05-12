import { query } from '../../database/pool.js';

export async function findUserByEmail(email) {
  const result = await query(
    'select id, nome, email, senha_hash, perfil, ativo from usuarios where email = $1 limit 1',
    [email],
  );

  return result.rows[0];
}
