import { pool } from '../../database/pool.js';
import { AppError } from '../../utils/AppError.js';

export async function registrarPagamento({ comandaId, formaPagamento, usuario }) {
  const client = await pool.connect();

  try {
    await client.query('begin');

    const comandaResult = await client.query(
      `select c.id, c.mesa_id, c.nome_cliente, c.status, m.numero as mesa_numero
       from comandas c
       join mesas m on m.id = c.mesa_id
       where c.id = $1
       for update of c`,
      [comandaId],
    );
    const comanda = comandaResult.rows[0];

    if (!comanda) {
      throw new AppError('Comanda não encontrada.', 404);
    }

    if (comanda.status !== 'aberta') {
      throw new AppError('Comanda já está fechada.');
    }

    const totalResult = await client.query(
      `select coalesce(sum(ip.quantidade * ip.preco_unitario), 0) as total
       from pedidos p
       join itens_pedido ip on ip.pedido_id = p.id
       where p.comanda_id = $1`,
      [comanda.id],
    );
    const total = totalResult.rows[0].total;

    if (Number(total) <= 0) {
      throw new AppError('Comanda sem consumo não pode ser fechada.');
    }

    const pagamentoResult = await client.query(
      `insert into pagamentos (comanda_id, valor, forma_pagamento, status)
       values ($1, $2, $3, 'confirmado')
       returning id, comanda_id, valor, forma_pagamento, status, criado_em`,
      [comanda.id, total, formaPagamento],
    );

    await client.query(
      `update comandas set status = 'fechada', atualizado_em = now()
       where id = $1`,
      [comanda.id],
    );

    await client.query(
      `insert into historico_atendimento (mesa_id, comanda_id, acao, detalhes)
       values ($1, $2, 'PAGAMENTO_REGISTRADO', jsonb_build_object(
         'valor', $3::numeric,
         'formaPagamento', $4::text,
         'usuarioId', $5::bigint,
         'perfil', $6::text
       ))`,
      [comanda.mesa_id, comanda.id, total, formaPagamento, usuario.id, usuario.perfil],
    );

    await client.query('commit');

    return {
      pagamento: pagamentoResult.rows[0],
      comanda: { ...comanda, total, status: 'fechada' },
    };
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}
