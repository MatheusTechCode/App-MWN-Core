import { pool, query } from '../../database/pool.js';
import { AppError } from '../../utils/AppError.js';
import { calcularStatusPedidoPorItens } from './pedido.inteligencia.js';

export async function findPedidoById(id) {
  const result = await query('select * from pedidos where id = $1 limit 1', [id]);
  return result.rows[0];
}

export async function findPedidoContextById(id) {
  const result = await query(
    `select p.id, p.comanda_id, p.status, c.mesa_id, c.status as comanda_status, m.token_qr, p.urgente
     from pedidos p
     join comandas c on c.id = p.comanda_id
     join mesas m on m.id = c.mesa_id
     where p.id = $1
     limit 1`,
    [id],
  );

  return result.rows[0];
}

export async function findItemPedidoById(id) {
  const result = await query(
    `select ip.id, ip.pedido_id, ip.status, ip.urgente, p.status as pedido_status,
       c.status as comanda_status, c.mesa_id, m.token_qr
     from itens_pedido ip
     join pedidos p on p.id = ip.pedido_id
     join comandas c on c.id = p.comanda_id
     join mesas m on m.id = c.mesa_id
     where ip.id = $1
     limit 1`,
    [id],
  );

  return result.rows[0];
}

export async function listPedidosByMesaToken(mesaToken) {
  const rows = await listPedidosBase(
    `where m.token_qr = $1
       and c.status = 'aberta'`,
    [mesaToken],
  );

  return attachStatusTimings(groupPedidos(rows));
}

export async function listPedidosOperacaoDetalhada() {
  const rows = await listPedidosBase('', []);
  return attachStatusTimings(groupPedidos(rows));
}

export async function createPedido({ comandaId, itens, observacao, criadoPor }) {
  const client = await pool.connect();

  try {
    await client.query('begin');

    const pedidoResult = await client.query(
      `insert into pedidos (comanda_id, observacao, criado_por, status, urgente)
       values ($1, $2, $3, 'Na fila', false)
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
        `insert into itens_pedido (
           pedido_id, item_cardapio_id, quantidade, preco_unitario, observacao, status, urgente, atualizado_em
         )
         values ($1, $2, $3, $4, $5, 'Na fila', false, now())`,
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
    await applyBulkStatusToPedido(client, id, status);
    const pedido = await syncPedidoState(client, id, alteradoPor);
    await client.query('commit');
    return pedido;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateItemPedidoStatus(id, status, alteradoPor) {
  const client = await pool.connect();

  try {
    await client.query('begin');
    const item = await client.query('select id, pedido_id from itens_pedido where id = $1 limit 1', [id]);

    if (!item.rows[0]) {
      throw new AppError('Item do pedido não encontrado.', 404);
    }

    await client.query(buildItemStatusUpdateSql(status), [id]);
    const pedido = await syncPedidoState(client, item.rows[0].pedido_id, alteradoPor);
    await client.query('commit');
    return pedido;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function updatePedidoUrgencia(id, urgente, motivo, alteradoPor) {
  const client = await pool.connect();

  try {
    await client.query('begin');
    await client.query(
      `update pedidos
       set urgente = $2,
         urgente_motivo = $3,
         urgente_em = case when $2 then now() else null end,
         atualizado_em = now()
       where id = $1`,
      [id, urgente, motivo || null],
    );
    await client.query(
      `update itens_pedido
       set urgente = $2,
         urgente_motivo = $3,
         atualizado_em = now()
       where pedido_id = $1
         and status <> 'Entregue'`,
      [id, urgente, motivo || null],
    );
    const pedido = await syncPedidoState(client, id, alteradoPor);
    await client.query('commit');
    return pedido;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateItemUrgencia(id, urgente, motivo, alteradoPor) {
  const client = await pool.connect();

  try {
    await client.query('begin');
    const item = await client.query('select id, pedido_id from itens_pedido where id = $1 limit 1', [id]);

    if (!item.rows[0]) {
      throw new AppError('Item do pedido não encontrado.', 404);
    }

    await client.query(
      `update itens_pedido
       set urgente = $2,
         urgente_motivo = $3,
         atualizado_em = now()
       where id = $1`,
      [id, urgente, motivo || null],
    );
    const pedido = await syncPedidoState(client, item.rows[0].pedido_id, alteradoPor);
    await client.query('commit');
    return pedido;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function requeuePedido(id, motivo, alteradoPor) {
  const client = await pool.connect();

  try {
    await client.query('begin');
    await client.query(
      `update itens_pedido
       set status = 'Na fila',
         urgente = true,
         urgente_motivo = $2,
         iniciado_preparo_em = null,
         pronto_em = null,
         entregue_em = null,
         atualizado_em = now()
       where pedido_id = $1`,
      [id, motivo || 'Retorno urgente'],
    );
    await client.query(
      `update pedidos
       set urgente = true,
         urgente_motivo = $2,
         urgente_em = now(),
         atualizado_em = now()
       where id = $1`,
      [id, motivo || 'Retorno urgente'],
    );
    const pedido = await syncPedidoState(client, id, alteradoPor);
    await client.query('commit');
    return pedido;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function requeueItemPedido(id, motivo, alteradoPor) {
  const client = await pool.connect();

  try {
    await client.query('begin');
    const item = await client.query('select id, pedido_id from itens_pedido where id = $1 limit 1', [id]);

    if (!item.rows[0]) {
      throw new AppError('Item do pedido não encontrado.', 404);
    }

    await client.query(
      `update itens_pedido
       set status = 'Na fila',
         urgente = true,
         urgente_motivo = $2,
         iniciado_preparo_em = null,
         pronto_em = null,
         entregue_em = null,
         atualizado_em = now()
       where id = $1`,
      [id, motivo || 'Refazer urgente'],
    );
    const pedido = await syncPedidoState(client, item.rows[0].pedido_id, alteradoPor);
    await client.query('commit');
    return pedido;
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
        `insert into itens_pedido (
           pedido_id, item_cardapio_id, quantidade, preco_unitario, observacao, status, urgente, atualizado_em
         )
         values ($1, $2, $3, $4, $5, 'Na fila', false, now())`,
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
      `update pedidos
       set status = 'Na fila',
         urgente = false,
         urgente_motivo = null,
         urgente_em = null,
         atualizado_em = now()
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

async function listPedidosBase(whereClause, params) {
  const result = await query(
    `select p.id, p.comanda_id, p.status, p.observacao, p.criado_por, p.urgente, p.urgente_motivo, p.urgente_em,
       p.criado_em, p.atualizado_em, c.nome_cliente, c.mesa_id,
       m.numero as mesa_numero,
       ip.id as item_pedido_id, ip.status as item_status, ip.observacao as item_observacao,
       ip.urgente as item_urgente, ip.urgente_motivo as item_urgente_motivo, ip.iniciado_preparo_em,
       ip.pronto_em, ip.entregue_em, ip.atualizado_em as item_atualizado_em,
       ic.id as item_cardapio_id, ic.nome, ic.tempo_preparo_minutos, ic.cozinha_estacao_id,
       ce.nome as cozinha_estacao_nome, ce.slug as cozinha_estacao_slug,
       ip.quantidade, ip.preco_unitario
     from pedidos p
     join comandas c on c.id = p.comanda_id
     join mesas m on m.id = c.mesa_id
     left join itens_pedido ip on ip.pedido_id = p.id
     left join itens_cardapio ic on ic.id = ip.item_cardapio_id
     left join cozinha_estacoes ce on ce.id = ic.cozinha_estacao_id
     ${whereClause}
     order by
       case p.status
         when 'Entregue' then 1
         else 0
       end,
       p.criado_em,
       p.id,
       ip.id`,
    params,
  );

  return result.rows;
}

async function syncPedidoState(client, pedidoId, alteradoPor) {
  const pedidoAtual = await client.query('select id, status from pedidos where id = $1 limit 1', [pedidoId]);

  if (!pedidoAtual.rows[0]) {
    throw new AppError('Pedido não encontrado.', 404);
  }

  const itensResult = await client.query(
    `select status, urgente, urgente_motivo
     from itens_pedido
     where pedido_id = $1
     order by id`,
    [pedidoId],
  );
  const itens = itensResult.rows.map((row) => ({
    status: row.status,
    urgente: Boolean(row.urgente),
    urgente_motivo: row.urgente_motivo,
  }));
  const proximoStatus = calcularStatusPedidoPorItens(itens);
  const urgente = itens.some((item) => item.urgente);
  const motivoUrgente = itens.find((item) => item.urgente)?.urgente_motivo || null;

  const result = await client.query(
    `update pedidos
     set status = $2,
       urgente = $3,
       urgente_motivo = $4,
       urgente_em = case when $3 then coalesce(urgente_em, now()) else null end,
       atualizado_em = now()
     where id = $1
     returning id, status, urgente, atualizado_em`,
    [pedidoId, proximoStatus, urgente, motivoUrgente],
  );

  if (pedidoAtual.rows[0].status !== proximoStatus) {
    await client.query(
      `insert into historico_status_pedido (pedido_id, status, alterado_por)
       values ($1, $2, $3)`,
      [pedidoId, proximoStatus, alteradoPor],
    );
  }

  return result.rows[0];
}

async function applyBulkStatusToPedido(client, pedidoId, status) {
  if (status === 'Em preparo') {
    await client.query(
      `update itens_pedido
       set status = 'Em preparo',
         iniciado_preparo_em = coalesce(iniciado_preparo_em, now()),
         atualizado_em = now()
       where pedido_id = $1
         and status = 'Na fila'`,
      [pedidoId],
    );
    return;
  }

  if (status === 'Pronto') {
    await client.query(
      `update itens_pedido
       set status = 'Pronto',
         iniciado_preparo_em = coalesce(iniciado_preparo_em, now()),
         pronto_em = now(),
         atualizado_em = now()
       where pedido_id = $1
         and status in ('Na fila', 'Em preparo')`,
      [pedidoId],
    );
    return;
  }

  if (status === 'Entregue') {
    await client.query(
      `update itens_pedido
       set status = 'Entregue',
         iniciado_preparo_em = coalesce(iniciado_preparo_em, now()),
         pronto_em = coalesce(pronto_em, now()),
         entregue_em = now(),
         urgente = false,
         urgente_motivo = null,
         atualizado_em = now()
       where pedido_id = $1
         and status <> 'Entregue'`,
      [pedidoId],
    );
  }
}

function buildItemStatusUpdateSql(status) {
  if (status === 'Em preparo') {
    return `update itens_pedido
      set status = 'Em preparo',
        iniciado_preparo_em = coalesce(iniciado_preparo_em, now()),
        atualizado_em = now()
      where id = $1`;
  }

  if (status === 'Pronto') {
    return `update itens_pedido
      set status = 'Pronto',
        iniciado_preparo_em = coalesce(iniciado_preparo_em, now()),
        pronto_em = now(),
        atualizado_em = now()
      where id = $1`;
  }

  return `update itens_pedido
    set status = 'Entregue',
      iniciado_preparo_em = coalesce(iniciado_preparo_em, now()),
      pronto_em = coalesce(pronto_em, now()),
      entregue_em = now(),
      urgente = false,
      urgente_motivo = null,
      atualizado_em = now()
    where id = $1`;
}

function groupPedidos(rows) {
  const pedidos = new Map();

  for (const row of rows) {
    if (!pedidos.has(row.id)) {
      pedidos.set(row.id, {
        id: row.id,
        comanda_id: row.comanda_id,
        status: row.status,
        observacao: row.observacao,
        criado_por: row.criado_por,
        criado_em: row.criado_em,
        atualizado_em: row.atualizado_em,
        urgente: Boolean(row.urgente),
        urgente_motivo: row.urgente_motivo,
        urgente_em: row.urgente_em,
        nome_cliente: row.nome_cliente,
        mesa_id: row.mesa_id,
        mesa_numero: row.mesa_numero,
        itens: [],
      });
    }

    if (row.item_cardapio_id) {
      pedidos.get(row.id).itens.push({
        id: row.item_pedido_id,
        itemCardapioId: row.item_cardapio_id,
        nome: row.nome,
        quantidade: row.quantidade,
        precoUnitario: row.preco_unitario,
        observacao: row.item_observacao,
        status: row.item_status || row.status,
        urgente: Boolean(row.item_urgente),
        urgenteMotivo: row.item_urgente_motivo,
        iniciadoPreparoEm: row.iniciado_preparo_em,
        prontoEm: row.pronto_em,
        entregueEm: row.entregue_em,
        tempoPreparoMinutos: Number(row.tempo_preparo_minutos || 0),
        cozinhaEstacaoId: row.cozinha_estacao_id,
        cozinhaEstacaoNome: row.cozinha_estacao_nome,
        cozinhaEstacaoSlug: row.cozinha_estacao_slug,
      });
    }
  }

  return Array.from(pedidos.values());
}

async function attachStatusTimings(pedidos) {
  if (pedidos.length === 0) {
    return pedidos;
  }

  const placeholders = pedidos.map((_, index) => `$${index + 1}`).join(', ');
  const historyResult = await query(
    `select pedido_id, status, alterado_por, criado_em
     from historico_status_pedido
     where pedido_id in (${placeholders})
     order by pedido_id, criado_em, id`,
    pedidos.map((pedido) => pedido.id),
  );
  const historyByOrder = new Map();

  for (const entry of historyResult.rows) {
    const current = historyByOrder.get(Number(entry.pedido_id)) || [];
    current.push(entry);
    historyByOrder.set(Number(entry.pedido_id), current);
  }

  const now = Date.now();

  return pedidos.map((pedido) => {
    const history = historyByOrder.get(Number(pedido.id)) || [];
    const statusTimes = history.map((entry, index) => {
      const startedAt = parseDatabaseDate(entry.criado_em);
      const nextEntry = history[index + 1];
      const finishedAt = nextEntry ? parseDatabaseDate(nextEntry.criado_em) : null;
      const durationEnd = finishedAt?.getTime() || now;

      return {
        status: entry.status,
        alteradoPor: entry.alterado_por,
        iniciadoEm: startedAt.toISOString(),
        finalizadoEm: finishedAt?.toISOString() || null,
        duracaoSegundos: Math.max(0, Math.floor((durationEnd - startedAt.getTime()) / 1000)),
      };
    });
    const currentStatus = [...statusTimes].reverse().find((entry) => entry.status === pedido.status);

    return {
      ...pedido,
      status_desde: currentStatus?.iniciadoEm || pedido.atualizado_em || pedido.criado_em,
      tempo_status_atual_segundos: currentStatus?.duracaoSegundos || 0,
      tempos_status: statusTimes,
    };
  });
}

function parseDatabaseDate(value) {
  if (value instanceof Date) {
    return value;
  }

  const normalized = typeof value === 'string' && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(value)
    ? `${value.replace(' ', 'T')}Z`
    : value;

  return new Date(normalized);
}
