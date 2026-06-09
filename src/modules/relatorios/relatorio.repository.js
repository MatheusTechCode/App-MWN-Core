import { query } from '../../database/pool.js';

export async function findConfirmedSales() {
  const result = await query(
    `select pg.id, pg.comanda_id, pg.valor, pg.forma_pagamento, pg.criado_em,
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
    `select pg.criado_em, ic.id as item_id, ic.nome, ic.categoria,
            ip.quantidade, ip.preco_unitario
     from pagamentos pg
     join pedidos p on p.comanda_id = pg.comanda_id
     join itens_pedido ip on ip.pedido_id = p.id
     join itens_cardapio ic on ic.id = ip.item_cardapio_id
     where pg.status = 'confirmado'`,
  );

  return result.rows;
}
