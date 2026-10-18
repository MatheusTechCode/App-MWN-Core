import { pool, query } from '../../database/pool.js';

export async function listComandasByMesa(mesaId, { comandaId, codigoCliente }) {
  if (!codigoCliente) return [];
  const commandIdFilter = comandaId ? 'and c.id = $3' : "and c.status = 'aberta'";
  const params = comandaId ? [mesaId, codigoCliente, comandaId] : [mesaId, codigoCliente];
  const result = await query(
    `select c.id, c.mesa_id, c.nome_cliente, c.status, c.criado_em,
       c.pagamento_solicitado_em,
       coalesce(sum(ip.quantidade * ip.preco_unitario), 0) as total
     from comandas c
     left join pedidos p on p.comanda_id = c.id
     left join itens_pedido ip on ip.pedido_id = p.id
     where c.mesa_id = $1
       and c.codigo_cliente = $2 ${commandIdFilter}
     group by c.id
     order by c.criado_em`,
    params,
  );

  return attachComandaDetails(result.rows, true);
}

export async function listComandasAbertas() {
  const result = await query(
    `select c.id, c.mesa_id, c.nome_cliente, c.status, c.criado_em,
       c.pagamento_solicitado_em,
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

  return attachComandaDetails(result.rows);
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

async function attachComandaDetails(comandas, includePix = false) {
  if (!comandas.length) return comandas;

  const ids = comandas.map((comanda) => comanda.id);
  const placeholders = ids.map((_, index) => `$${index + 1}`).join(', ');
  const [orderResult, paymentResult] = await Promise.all([
    query(
      `select p.id, p.comanda_id, p.status, p.observacao, p.criado_em,
         ip.item_cardapio_id, ic.nome as item_nome, ip.quantidade, ip.preco_unitario, ip.observacao as item_observacao
       from pedidos p
       left join itens_pedido ip on ip.pedido_id = p.id
       left join itens_cardapio ic on ic.id = ip.item_cardapio_id
       where p.comanda_id in (${placeholders})
       order by p.criado_em, p.id, ip.id`,
      ids,
    ),
    query(
      `select id, comanda_id, valor, forma_pagamento, status, criado_em, expira_em,
         ${includePix ? 'pix_copia_cola, pix_qr_code_base64, pix_ticket_url' : 'null as pix_copia_cola, null as pix_qr_code_base64, null as pix_ticket_url'}
       from pagamentos where comanda_id in (${placeholders}) order by criado_em, id`,
      ids,
    ),
  ]);

  const pedidosPorComanda = new Map();
  for (const row of orderResult.rows) {
    let pedido = pedidosPorComanda.get(row.comanda_id);
    if (!pedido) {
      pedido = [];
      pedidosPorComanda.set(row.comanda_id, pedido);
    }
    let atual = pedido.find((entry) => Number(entry.id) === Number(row.id));
    if (!atual) {
      atual = { id: row.id, status: row.status, observacao: row.observacao, criado_em: row.criado_em, itens: [] };
      pedido.push(atual);
    }
    if (row.item_cardapio_id) {
      atual.itens.push({
        itemCardapioId: row.item_cardapio_id,
        nome: row.item_nome,
        quantidade: row.quantidade,
        precoUnitario: row.preco_unitario,
        observacao: row.item_observacao,
      });
    }
  }

  const pagamentosPorComanda = new Map();
  for (const pagamento of paymentResult.rows) {
    const current = pagamentosPorComanda.get(pagamento.comanda_id) || [];
    current.push(pagamento);
    pagamentosPorComanda.set(pagamento.comanda_id, current);
  }

  return comandas.map((comanda) => {
    const pagamentos = pagamentosPorComanda.get(comanda.id) || [];
    const valorPago = pagamentos
      .filter((pagamento) => pagamento.status === 'confirmado')
      .reduce((total, pagamento) => total + Number(pagamento.valor), 0);
    const total = Number(comanda.total);

    return {
      ...comanda,
      total,
      valorPago,
      saldo: Math.max(0, Number((total - valorPago).toFixed(2))),
      pedidos: pedidosPorComanda.get(comanda.id) || [],
      pagamentos,
    };
  });
}
