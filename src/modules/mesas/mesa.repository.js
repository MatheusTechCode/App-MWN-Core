import { query } from '../../database/pool.js';

export async function listMesas() {
  const result = await query('select id, numero, token_qr, status from mesas order by numero');
  return result.rows;
}

export async function findMesaById(id) {
  const result = await query('select id, numero, token_qr, status from mesas where id = $1 limit 1', [id]);
  return result.rows[0];
}

export async function findMesaByToken(tokenQr) {
  const result = await query(
    'select id, numero, status from mesas where token_qr = $1 limit 1',
    [tokenQr],
  );

  return result.rows[0];
}

export async function createMesa({ numero, tokenQr, status }) {
  const result = await query(
    `insert into mesas (numero, token_qr, status)
     values ($1, $2, $3)
     returning id, numero, token_qr, status`,
    [numero, tokenQr, status],
  );

  return result.rows[0];
}

export async function updateMesa(id, { numero, tokenQr, status }) {
  const result = await query(
    `update mesas
     set numero = $2, token_qr = $3, status = $4, atualizado_em = now()
     where id = $1
     returning id, numero, token_qr, status`,
    [id, numero, tokenQr, status],
  );

  return result.rows[0];
}

export async function disableMesa(id) {
  const result = await query(
    `update mesas
     set status = 'inativa', atualizado_em = now()
     where id = $1
     returning id, numero, token_qr, status`,
    [id],
  );

  return result.rows[0];
}
