-- Dados de exemplo para cozinha industrial

-- Inserir estações de cozinha
insert into cozinha_estacoes (nome, slug, ativo) values
  ('Chapa', 'chapa', 1),
  ('Fritadeira', 'fritadeira', 1),
  ('Montagem', 'montagem', 1),
  ('Bebidas', 'bebidas', 1);

-- Inserir cardápios
insert into cardapios (nome, ativo) values
  ('Cardápio Principal', 1),
  ('Bebidas', 1),
  ('Sobremesas', 1);

-- Inserir itens de cardápio com estações
insert into itens_cardapio (nome, descricao, preco, categoria, disponivel, tempo_preparo_minutos, cozinha_estacao_id) values
  ('Hambúrguer Clássico', 'Pão, carne 150g, alface, tomate', 35.00, 'Lanches', 1, 8, 1),
  ('Hambúrguer Duplo', 'Pão, 2x carne 150g, alface, tomate', 45.00, 'Lanches', 1, 10, 1),
  ('Batata Frita', 'Porção grande', 25.00, 'Acompanhamentos', 1, 5, 2),
  ('Anéis de Cebola', 'Crocante', 22.00, 'Acompanhamentos', 1, 6, 2),
  ('Refrigerante', 'Copo 350ml', 8.00, 'Bebidas', 1, 2, 4),
  ('Suco Natural', 'Laranja ou maçã', 12.00, 'Bebidas', 1, 3, 4),
  ('Pudim', 'Leite condensado', 15.00, 'Sobremesas', 1, 0, 0);

-- Vincular itens aos cardápios
insert into cardapio_itens (cardapio_id, item_cardapio_id) select
  1, id from itens_cardapio where categoria in ('Lanches', 'Acompanhamentos')
union all select
  2, id from itens_cardapio where categoria = 'Bebidas'
union all select
  3, id from itens_cardapio where categoria = 'Sobremesas';
