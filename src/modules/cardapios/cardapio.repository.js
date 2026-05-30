import { query } from '../../database/pool.js';

export async function listItensAtivos() {
  const result = await query(
    `select i.id, i.nome, i.descricao, i.preco, i.categoria, i.disponivel
     from itens_cardapio i
     join cardapio_itens ci on ci.item_cardapio_id = i.id
     join cardapios c on c.id = ci.cardapio_id
     where i.disponivel = true and c.ativo = true
     group by i.id, i.nome, i.descricao, i.preco, i.categoria, i.disponivel
     order by i.categoria, i.nome`,
  );

  return result.rows;
}

export async function listCardapios() {
  const result = await query(
    `select c.id, c.nome, c.ativo, c.criado_em, ci.item_cardapio_id
     from cardapios c
     left join cardapio_itens ci on ci.cardapio_id = c.id
     order by c.ativo desc, c.nome`,
  );

  const cardapios = new Map();

  for (const row of result.rows) {
    if (!cardapios.has(row.id)) {
      cardapios.set(row.id, {
        id: row.id,
        nome: row.nome,
        ativo: Boolean(row.ativo),
        criado_em: row.criado_em,
        item_ids: [],
      });
    }

    if (row.item_cardapio_id) {
      cardapios.get(row.id).item_ids.push(row.item_cardapio_id);
    }
  }

  return Array.from(cardapios.values());
}

export async function createCardapio({ nome, ativo }) {
  const result = await query(
    `insert into cardapios (nome, ativo)
     values ($1, $2)
     returning id, nome, ativo, criado_em`,
    [nome, ativo],
  );

  return result.rows[0];
}

export async function updateCardapio(id, { nome, ativo }) {
  const result = await query(
    `update cardapios set nome = $2, ativo = $3
     where id = $1
     returning id, nome, ativo, criado_em`,
    [id, nome, ativo],
  );

  return result.rows[0];
}

export async function deleteCardapio(id) {
  await query('delete from cardapio_itens where cardapio_id = $1', [id]);
  const result = await query('delete from cardapios where id = $1 returning id', [id]);
  return result.rows[0];
}

export async function listItensCardapioAdmin() {
  const result = await query(
    `select id, nome, descricao, preco, categoria, disponivel, criado_em, atualizado_em
     from itens_cardapio
     order by disponivel desc, categoria, nome`,
  );

  return result.rows;
}

export async function createItemCardapio({ nome, descricao, preco, categoria, disponivel, cardapioId }) {
  const result = await query(
    `insert into itens_cardapio (nome, descricao, preco, categoria, disponivel)
     values ($1, $2, $3, $4, $5)
     returning id, nome, descricao, preco, categoria, disponivel, criado_em, atualizado_em`,
    [nome, descricao || null, preco, categoria, disponivel],
  );

  if (cardapioId) {
    await query(
      `insert into cardapio_itens (cardapio_id, item_cardapio_id)
       values ($1, $2)
       on conflict do nothing`,
      [cardapioId, result.rows[0].id],
    );
  }

  return result.rows[0];
}

export async function updateItemCardapio(id, { nome, descricao, preco, categoria, disponivel }) {
  const result = await query(
    `update itens_cardapio
     set nome = $2, descricao = $3, preco = $4, categoria = $5, disponivel = $6, atualizado_em = now()
     where id = $1
     returning id, nome, descricao, preco, categoria, disponivel, criado_em, atualizado_em`,
    [id, nome, descricao || null, preco, categoria, disponivel],
  );

  return result.rows[0];
}

export async function disableItemCardapio(id) {
  const result = await query(
    `update itens_cardapio set disponivel = false, atualizado_em = now()
     where id = $1
     returning id, nome, descricao, preco, categoria, disponivel, criado_em, atualizado_em`,
    [id],
  );

  return result.rows[0];
}

export async function setCardapioItem(cardapioId, itemCardapioId, vinculado) {
  if (vinculado) {
    const result = await query(
      `insert into cardapio_itens (cardapio_id, item_cardapio_id)
       values ($1, $2)
       on conflict do nothing
       returning cardapio_id, item_cardapio_id`,
      [cardapioId, itemCardapioId],
    );
    return result.rows[0] || { cardapio_id: cardapioId, item_cardapio_id: itemCardapioId };
  }

  const result = await query(
    `delete from cardapio_itens
     where cardapio_id = $1 and item_cardapio_id = $2
     returning cardapio_id, item_cardapio_id`,
    [cardapioId, itemCardapioId],
  );

  return result.rows[0] || { cardapio_id: cardapioId, item_cardapio_id: itemCardapioId };
}
