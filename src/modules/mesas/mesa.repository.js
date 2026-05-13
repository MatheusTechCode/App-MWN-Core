import { query } from '../../database/pool.js';

export async function listMesas() {
  const result = await query('select id, numero, token_qr, status from mesas order by numero');
  return result.rows;
}

export async function findMesaByToken(tokenQr) {
  const result = await query(
    'select id, numero, status from mesas where token_qr = $1 limit 1',
    [tokenQr],
  );

  return result.rows[0];
}
