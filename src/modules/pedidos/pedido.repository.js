import { pool, query } from '../../database/pool.js';
import { AppError } from '../../utils/AppError.js';

export async function findPedidoById(id) {
  const result = await query('select * from pedidos where id = $1 limit 1', [id]);
  return result.rows[0];
}

export async function listPedidosByMesaToken(mesaToken) {
  const result = await query(
    `select p.id, p.status, p.observacao, p.criado_por, p.criado_em, p.atualizado_em,
       c.nome_cliente, m.numero as mesa_numero,
       coalesce(json_agg(json_build_object(
         'nome', ic.nome,
         'quantidade', ip.quantidade,
         'precoUnitario', ip.preco_unitario
       )) filter (where ip.id is not null), '[]') as itens
     from pedidos p
     join comandas c on c.id = p.comanda_id
     join mesas m on m.id = c.mesa_id
     left join itens_pedido ip on ip.pedido_id = p.id
     left join itens_cardapio ic on ic.id = ip.item_cardapio_id
     where m.token_qr = $1
     group by p.id, c.nome_cliente, m.numero
     order by p.criado_em desc`,
    [mesaToken],
  );

  return result.rows;
}

export async function listPedidosOperacao() {
  const result = await query(
    `select p.id, p.status, p.observacao, p.criado_por, p.criado_em, c.nome_cliente,
       m.numero as mesa_numero,
       coalesce(json_agg(json_build_object(
         'nome', ic.nome,
         'quantidade', ip.quantidade,
         'precoUnitario', ip.preco_unitario
       )) filter (where ip.id is not null), '[]') as itens
     from pedidos p
     join comandas c on c.id = p.comanda_id
     join mesas m on m.id = c.mesa_id
     left join itens_pedido ip on ip.pedido_id = p.id
     left join itens_cardapio ic on ic.id = ip.item_cardapio_id
     where p.status in ('Na fila', 'Em preparo', 'Pronto')
     group by p.id, c.nome_cliente, m.numero
     order by p.criado_em`,
  );

  return result.rows;
}

export async function createPedido({ comandaId, itens, observacao, criadoPor }) {
  const client = await pool.connect();

  try {
    await client.query('begin');

    const pedidoResult = await client.query(
      `insert into pedidos (comanda_id, observacao, criado_por, status)
       values ($1, $2, $3, 'Na fila')
       returning id, comanda_id, status, observacao, criado_por, criado_em`,
      [comandaId, observacao || null, criadoPor],
    );
    const pedido = pedidoResult.rows[0];

    for (const item of itens) {
      const cardapioResult = await client.query(
        'select id, preco from itens_cardapio where id = $1 and disponivel = true',
        [item.itemCardapioId],
      );

      if (!cardapioResult.rows[0]) {
        throw new AppError(`Item de cardápio indisponível: ${item.itemCardapioId}`);
      }

      await client.query(
        `insert into itens_pedido (pedido_id, item_cardapio_id, quantidade, preco_unitario, observacao)
         values ($1, $2, $3, $4, $5)`,
        [
          pedido.id,
          item.itemCardapioId,
          Number(item.quantidade),
          cardapioResult.rows[0].preco,
          item.observacao || null,
        ],
      );
    }

    await client.query(
      `insert into historico_status_pedido (pedido_id, status, alterado_por)
       values ($1, 'Na fila', $2)`,
      [pedido.id, criadoPor],
    );

    await client.query('commit');
    return pedido;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function updatePedidoStatus(id, status, alteradoPor) {
  const client = await pool.connect();

  try {
    await client.query('begin');
    const result = await client.query(
      `update pedidos set status = $2, atualizado_em = now()
       where id = $1
       returning id, status, atualizado_em`,
      [id, status],
    );

    await client.query(
      `insert into historico_status_pedido (pedido_id, status, alterado_por)
       values ($1, $2, $3)`,
      [id, status, alteradoPor],
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
