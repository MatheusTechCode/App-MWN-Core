-- Dados restaurados: Sua cozinha industrial

-- Estações de cozinha
insert into cozinha_estacoes (nome, slug, ativo) values
  ('Chapa', 'chapa', 1),
  ('Fritadeira', 'fritadeira', 1),
  ('Bar', 'bar', 1);

-- Cardápios
insert into cardapios (nome, ativo) values
  ('Cardápio Principal', 1);

-- Itens com suas estações
insert into itens_cardapio (nome, descricao, preco, categoria, disponivel, tempo_preparo_minutos, cozinha_estacao_id) values
  ('Feijoada', 'Porção completa com acompanhamentos', 45.00, 'Pratos Principais', 1, 25, 1),
  ('Suco de Limão', 'Suco natural', 8.00, 'Bebidas', 1, 5, 3);

-- Vincular itens ao cardápio
insert into cardapio_itens (cardapio_id, item_cardapio_id)
select 1, id from itens_cardapio;
