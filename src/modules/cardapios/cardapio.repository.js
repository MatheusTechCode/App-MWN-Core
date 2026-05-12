import { query } from '../../database/pool.js';

export async function listItensAtivos() {
  const result = await query(
    `select id, nome, descricao, preco, categoria, disponivel
     from itens_cardapio
     where disponivel = true
     order by categoria, nome`,
  );

  return result.rows;
}
