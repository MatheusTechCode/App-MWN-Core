import { pool, query } from '../../database/pool.js';
import { AppError } from '../../utils/AppError.js';

export async function findPedidoById(id) {
  const result = await query('select * from pedidos where id = $1 limit 1', [id]);
  return result.rows[0];
}

export async function findPedidoContextById(id) {
  const result = await query(
    `select p.id, p.comanda_id, p.status, c.mesa_id, c.status as comanda_status, m.token_qr
     from pedidos p
     join comandas c on c.id = p.comanda_id
     join mesas m on m.id = c.mesa_id
     where p.id = $1
     limit 1`,
    [id],
  );

  return result.rows[0];
}

export async function listPedidosByMesaToken(mesaToken) {
  const result = await query(
    `select p.id, p.status, p.observacao, p.criado_por, p.criado_em, p.atualizado_em,
       c.nome_cliente, m.numero as mesa_numero,
       ic.id as item_cardapio_id, ic.nome, ip.quantidade, ip.preco_unitario
     from pedidos p
     join comandas c on c.id = p.comanda_id
     join mesas m on m.id = c.mesa_id
     left join itens_pedido ip on ip.pedido_id = p.id
     left join itens_cardapio ic on ic.id = ip.item_cardapio_id
     where m.token_qr = $1
       and c.status = 'aberta'
     order by p.criado_em desc, p.id, ip.id`,
    [mesaToken],
  );

  return groupPedidos(result.rows);
}

export async function listPedidosOperacao() {
  const result = await query(
    `select p.id, p.status, p.observacao, p.criado_por, p.criado_em, c.nome_cliente,
       m.numero as mesa_numero,
       ic.id as item_cardapio_id, ic.nome, ip.quantidade, ip.preco_unitario
     from pedidos p
     join comandas c on c.id = p.comanda_id
     join mesas m on m.id = c.mesa_id
     left join itens_pedido ip on ip.pedido_id = p.id
     left join itens_cardapio ic on ic.id = ip.item_cardapio_id
     where p.status in ('Na fila', 'Em preparo', 'Pronto')
     order by p.criado_em, p.id, ip.id`,
  );

  return groupPedidos(result.rows);
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

export async function updatePedidoItens(id, itens, alteradoPor) {
  const client = await pool.connect();

  try {
    await client.query('begin');

    await client.query('delete from itens_pedido where pedido_id = $1', [id]);

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
          id,
          item.itemCardapioId,
          Number(item.quantidade),
          cardapioResult.rows[0].preco,
          item.observacao || null,
        ],
      );
    }

    const result = await client.query(
      `update pedidos set atualizado_em = now()
       where id = $1
       returning id, status, atualizado_em`,
      [id],
    );

    await client.query(
      `insert into historico_atendimento (comanda_id, acao, detalhes)
       select comanda_id, 'PEDIDO_EDITADO', $2
       from pedidos
       where id = $1`,
      [id, JSON.stringify({ pedidoId: id, alteradoPor })],
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

export async function deletePedido(id, alteradoPor) {
  const client = await pool.connect();

  try {
    await client.query('begin');

    await client.query(
      `insert into historico_atendimento (mesa_id, comanda_id, acao, detalhes)
       select c.mesa_id, p.comanda_id, 'PEDIDO_EXCLUIDO', $2
       from pedidos p
       join comandas c on c.id = p.comanda_id
       where p.id = $1`,
      [id, JSON.stringify({ pedidoId: id, alteradoPor })],
    );

    const result = await client.query(
      `delete from pedidos
       where id = $1
       returning id`,
      [id],
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

function groupPedidos(rows) {
  const pedidos = new Map();

  for (const row of rows) {
    if (!pedidos.has(row.id)) {
      pedidos.set(row.id, {
        id: row.id,
        status: row.status,
        observacao: row.observacao,
        criado_por: row.criado_por,
        criado_em: row.criado_em,
        atualizado_em: row.atualizado_em,
        nome_cliente: row.nome_cliente,
        mesa_numero: row.mesa_numero,
        itens: [],
      });
    }

    if (row.item_cardapio_id) {
      pedidos.get(row.id).itens.push({
        itemCardapioId: row.item_cardapio_id,
        nome: row.nome,
        quantidade: row.quantidade,
        precoUnitario: row.preco_unitario,
      });
    }
  }

  return Array.from(pedidos.values());
}
