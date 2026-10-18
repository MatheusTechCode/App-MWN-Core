import { query } from '../../database/pool.js';

export async function findConfirmedSales() {
  const result = await query(
    `select pg.id, pg.comanda_id, pg.valor, pg.forma_pagamento, pg.criado_em,
            c.status as comanda_status,
            c.nome_cliente, m.numero as mesa_numero
     from pagamentos pg
     join comandas c on c.id = pg.comanda_id
     join mesas m on m.id = c.mesa_id
     where pg.status = 'confirmado'
     order by pg.criado_em desc`,
  );

  return result.rows;
}

export async function findConfirmedSaleItems() {
  const result = await query(
    `with comandas_quitadas as (
       select c.id as comanda_id, max(pg.criado_em) as criado_em
       from comandas c
       join pagamentos pg on pg.comanda_id = c.id
       where c.status = 'fechada' and pg.status = 'confirmado'
       group by c.id
     )
     select cq.criado_em, ic.id as item_id, ic.nome, ic.categoria,
            ip.quantidade, ip.preco_unitario
     from comandas_quitadas cq
     join pedidos p on p.comanda_id = cq.comanda_id
     join itens_pedido ip on ip.pedido_id = p.id
     join itens_cardapio ic on ic.id = ip.item_cardapio_id
     order by cq.criado_em, cq.comanda_id, p.id, ip.id`,
  );

  return result.rows;
}
