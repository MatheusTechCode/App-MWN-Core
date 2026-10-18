import { dbClient, pool } from '../../database/pool.js';
import { AppError } from '../../utils/AppError.js';
import { randomUUID } from 'node:crypto';

export async function criarPixOnline({ comandaId, mesaToken, codigoCliente, email, criarCobranca }) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const comandaResult = await client.query(
      `select c.id, c.mesa_id, c.nome_cliente, c.status, m.numero as mesa_numero
       from comandas c join mesas m on m.id = c.mesa_id
       where c.id = $1 and c.codigo_cliente = $2 and c.status = 'aberta'
         and m.token_qr = $3${dbClient === 'postgres' ? ' for update of c' : ''}`,
      [comandaId, codigoCliente, mesaToken],
    );
    const comanda = comandaResult.rows[0];
    if (!comanda) throw new AppError('Comanda não encontrada para esta mesa ou dispositivo.', 404);

    const consumo = await client.query(
      `select coalesce(sum(ip.quantidade * ip.preco_unitario), 0) as total
       from pedidos p join itens_pedido ip on ip.pedido_id = p.id where p.comanda_id = $1`,
      [comanda.id],
    );
    const total = Number(consumo.rows[0].total);
    const pagamentos = await client.query(
      `select coalesce(sum(case when status = 'confirmado' then valor else 0 end), 0) as pago,
              coalesce(sum(case when status = 'pendente' and provedor = 'mercado_pago' and expira_em > now() then valor else 0 end), 0) as reservado
       from pagamentos where comanda_id = $1`,
      [comanda.id],
    );
    const pago = Number(pagamentos.rows[0].pago);
    const reservado = Number(pagamentos.rows[0].reservado);
    const saldo = Number((total - pago).toFixed(2));
    if (saldo <= 0.01) throw new AppError('Esta comanda já está paga.');

    const existente = await client.query(
      `select id, valor, status, pix_copia_cola, pix_qr_code_base64, pix_ticket_url
       from pagamentos where comanda_id = $1 and provedor = 'mercado_pago' and status = 'pendente' and expira_em > now()
       order by criado_em desc limit 1`,
      [comanda.id],
    );
    if (existente.rows[0]) {
      await client.query('commit');
      return existente.rows[0];
    }

    const valor = Number((saldo - reservado).toFixed(2));
    if (valor <= 0.01) throw new AppError('Já existe um Pix pendente para o saldo desta comanda.');
    const idempotencyKey = randomUUID();
    const inserted = await client.query(
      `insert into pagamentos (comanda_id, valor, forma_pagamento, status, provedor, chave_idempotencia)
       values ($1, $2, 'pix', 'pendente', 'mercado_pago', $3)
       returning id, comanda_id, valor, status`,
      [comanda.id, valor, idempotencyKey],
    );
    const payment = inserted.rows[0];
    const mp = await criarCobranca({
      paymentId: payment.id,
      comanda,
      email,
      valor,
      idempotencyKey,
    });
    const updated = await client.query(
      `update pagamentos set id_externo = $2, pix_copia_cola = $3,
         pix_qr_code_base64 = $4, pix_ticket_url = $5, expira_em = $6
       where id = $1
       returning id, comanda_id, valor, status, pix_copia_cola, pix_qr_code_base64, pix_ticket_url`,
      [payment.id, String(mp.id), mp.point_of_interaction?.transaction_data?.qr_code || null,
        mp.point_of_interaction?.transaction_data?.qr_code_base64 || null,
        mp.point_of_interaction?.transaction_data?.ticket_url || null,
        mp.date_of_expiration ? mp.date_of_expiration.replace('T', ' ').replace('Z', '') : null],
    );
    await client.query('commit');
    return updated.rows[0];
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function atualizarPixNotificado({ externalId, statusProvider, valorProvider, referencia }) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const result = await client.query(
      `select p.id, p.comanda_id, p.valor, p.status, c.mesa_id
       from pagamentos p join comandas c on c.id = p.comanda_id
       where p.id_externo = $1 and p.provedor = 'mercado_pago'${dbClient === 'postgres' ? ' for update of p, c' : ''}`,
      [String(externalId)],
    );
    const payment = result.rows[0];
    if (!payment || String(payment.id) !== String(referencia)) {
      await client.query('rollback');
      return false;
    }

    if (statusProvider === 'approved') {
      if (Math.abs(Number(payment.valor) - Number(valorProvider)) > 0.01) {
        throw new AppError('O valor confirmado pelo Mercado Pago não corresponde ao Pix registrado.', 409);
      }
      if (payment.status !== 'confirmado') {
        await client.query(`update pagamentos set status = 'confirmado' where id = $1`, [payment.id]);
      }
    } else if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(statusProvider)) {
      await client.query(`update pagamentos set status = 'falhou' where id = $1 and status = 'pendente'`, [payment.id]);
    }

    const totals = await client.query(
      `select coalesce(sum(ip.quantidade * ip.preco_unitario), 0) as total,
              (select coalesce(sum(valor), 0) from pagamentos where comanda_id = $1 and status = 'confirmado') as pago
       from pedidos p join itens_pedido ip on ip.pedido_id = p.id where p.comanda_id = $1`,
      [payment.comanda_id],
    );
    const total = Number(totals.rows[0].total);
    const pago = Number(totals.rows[0].pago);
    const statusComanda = total > 0 && pago >= total - 0.01 ? 'fechada' : 'aberta';
    await client.query(
      `update comandas set status = $2, pagamento_solicitado_em = null, atualizado_em = now() where id = $1`,
      [payment.comanda_id, statusComanda],
    );
    await client.query(
      `insert into historico_atendimento (mesa_id, comanda_id, acao, detalhes)
       values ($1, $2, 'PIX_MERCADO_PAGO_ATUALIZADO', $3)`,
      [payment.mesa_id, payment.comanda_id, JSON.stringify({ pagamentoId: payment.id, status: statusProvider })],
    );
    await client.query('commit');
    return true;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function registrarPagamento({ comandaId, formaPagamento, valor, usuario }) {
  const client = await pool.connect();

  try {
    await client.query('begin');

    const comandaResult = await client.query(
      `select c.id, c.mesa_id, c.nome_cliente, c.status, m.numero as mesa_numero
       from comandas c
       join mesas m on m.id = c.mesa_id
       where c.id = $1${dbClient === 'postgres' ? ' for update of c' : ''}`,
      [comandaId],
    );
    const comanda = comandaResult.rows[0];

    if (!comanda) throw new AppError('Comanda não encontrada.', 404);
    if (comanda.status !== 'aberta') throw new AppError('Comanda já está fechada.');

    const pixPendente = await client.query(
      `select id from pagamentos
       where comanda_id = $1 and provedor = 'mercado_pago' and status = 'pendente' and expira_em > now()
       limit 1`,
      [comanda.id],
    );
    if (pixPendente.rows[0]) {
      throw new AppError('Existe um Pix online aguardando pagamento. Aguarde a confirmação ou o vencimento do QR Code.');
    }

    const totalResult = await client.query(
      `select coalesce(sum(ip.quantidade * ip.preco_unitario), 0) as total
       from pedidos p
       join itens_pedido ip on ip.pedido_id = p.id
       where p.comanda_id = $1`,
      [comanda.id],
    );
    const total = Number(totalResult.rows[0].total);
    if (total <= 0) throw new AppError('Comanda sem consumo não pode ser fechada.');

    const pagamentosResult = await client.query(
      `select coalesce(sum(valor), 0) as pago
       from pagamentos where comanda_id = $1 and status = 'confirmado'`,
      [comanda.id],
    );
    const pago = Number(pagamentosResult.rows[0].pago);
    const saldo = Math.max(0, Number((total - pago).toFixed(2)));
    const valorPagamento = valor === undefined ? saldo : Number(valor);

    if (!Number.isFinite(valorPagamento) || valorPagamento <= 0) {
      throw new AppError('Informe um valor de pagamento maior que zero.');
    }
    if (valorPagamento > saldo + 0.01) {
      throw new AppError(`O valor ultrapassa o saldo de R$ ${saldo.toFixed(2)}.`);
    }

    const valorConfirmado = Number(valorPagamento.toFixed(2));
    const pagamentoResult = await client.query(
      `insert into pagamentos (comanda_id, valor, forma_pagamento, status)
       values ($1, $2, $3, 'confirmado')
       returning id, comanda_id, valor, forma_pagamento, status, criado_em`,
      [comanda.id, valorConfirmado, formaPagamento],
    );

    const totalPago = Number((pago + valorConfirmado).toFixed(2));
    const saldoRestante = Math.max(0, Number((total - totalPago).toFixed(2)));
    const statusComanda = saldoRestante <= 0.01 ? 'fechada' : 'aberta';
    await client.query(
      `update comandas set status = $2, pagamento_solicitado_em = null, atualizado_em = now()
       where id = $1`,
      [comanda.id, statusComanda],
    );

    await client.query(
      `insert into historico_atendimento (mesa_id, comanda_id, acao, detalhes)
       values ($1, $2, 'PAGAMENTO_REGISTRADO', $3)`,
      [
        comanda.mesa_id,
        comanda.id,
        JSON.stringify({
          valor: valorConfirmado,
          saldoRestante,
          formaPagamento,
          usuarioId: usuario.id,
          perfil: usuario.perfil,
        }),
      ],
    );

    await client.query('commit');

    return {
      pagamento: pagamentoResult.rows[0],
      comanda: { ...comanda, total, valorPago: totalPago, saldo: saldoRestante, status: statusComanda },
    };
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function solicitarAtendimentoPagamento({ comandaId, mesaToken, codigoCliente }) {
  const client = await pool.connect();

  try {
    await client.query('begin');
    const result = await client.query(
      `update comandas
       set pagamento_solicitado_em = coalesce(pagamento_solicitado_em, now()), atualizado_em = now()
       where id = $1 and codigo_cliente = $2 and status = 'aberta'
         and mesa_id = (select id from mesas where token_qr = $3)
       returning id, nome_cliente, pagamento_solicitado_em`,
      [comandaId, codigoCliente, mesaToken],
    );
    if (!result.rows[0]) throw new AppError('Comanda não encontrada para esta mesa ou dispositivo.', 404);
    await client.query(
      `insert into historico_atendimento (comanda_id, acao, detalhes)
       values ($1, 'PAGAMENTO_SOLICITADO', $2)`,
      [comandaId, JSON.stringify({ origem: 'cliente' })],
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
