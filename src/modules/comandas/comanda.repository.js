import { pool, query } from '../../database/pool.js';

export async function listComandasByMesa(mesaId) {
  const result = await query(
    `select c.id, c.mesa_id, c.nome_cliente, c.status, c.criado_em,
       coalesce(sum(ip.quantidade * ip.preco_unitario), 0) as total
     from comandas c
     left join pedidos p on p.comanda_id = c.id
     left join itens_pedido ip on ip.pedido_id = p.id
     where c.mesa_id = $1 and c.status = 'aberta'
     group by c.id
     order by c.criado_em`,
    [mesaId],
  );

  return result.rows;
}

export async function listComandasAbertas() {
  const result = await query(
    `select c.id, c.mesa_id, c.nome_cliente, c.codigo_cliente, c.status, c.criado_em,
       m.numero as mesa_numero,
       coalesce(sum(ip.quantidade * ip.preco_unitario), 0) as total
     from comandas c
     join mesas m on m.id = c.mesa_id
     left join pedidos p on p.comanda_id = c.id
     left join itens_pedido ip on ip.pedido_id = p.id
     where c.status = 'aberta'
     group by c.id, m.numero
     order by m.numero, c.criado_em`,
  );

  return result.rows;
}

export async function findComandaById(id) {
  const result = await query('select * from comandas where id = $1 limit 1', [id]);
  return result.rows[0];
}

export async function createComanda({ mesaId, nomeCliente, codigoCliente }) {
  const result = await query(
    `insert into comandas (mesa_id, nome_cliente, codigo_cliente)
     values ($1, $2, $3)
     returning id, mesa_id, nome_cliente, codigo_cliente, status, criado_em`,
    [mesaId, nomeCliente, codigoCliente],
  );

  return result.rows[0];
}

export async function renameComanda(id, nomeCliente) {
  const result = await query(
    `update comandas set nome_cliente = $2, atualizado_em = now()
     where id = $1
     returning id, mesa_id, nome_cliente, codigo_cliente, status`,
    [id, nomeCliente],
  );

  return result.rows[0];
}

export async function transferComanda(id, mesaId) {
  const client = await pool.connect();

  try {
    await client.query('begin');

    const atualResult = await client.query('select id, mesa_id from comandas where id = $1', [id]);
    const atual = atualResult.rows[0];

    const result = await client.query(
      `update comandas set mesa_id = $2, atualizado_em = now()
       where id = $1
       returning id, mesa_id, nome_cliente, codigo_cliente, status`,
      [id, mesaId],
    );

    await client.query(
      `insert into historico_atendimento (mesa_id, comanda_id, acao, detalhes)
       values ($1, $2, 'COMANDA_TRANSFERIDA', $3)`,
      [
        mesaId,
        id,
        JSON.stringify({
          mesaOrigemId: atual?.mesa_id || null,
          mesaDestinoId: mesaId,
        }),
      ],
    );

    await client.query('commit');
    return result.rows[0];
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}
