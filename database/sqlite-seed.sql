insert or ignore into mesas (numero, token_qr)
values
  (1, 'mwn_qr_a8F3kP7xQ2L9'),
  (2, 'mwn_qr_v6N9sT4bC1Z8'),
  (3, 'mwn_qr_r2H7dM5qW9Y3');

insert or ignore into cardapios (id, nome, ativo)
values (1, 'Cardápio principal', 1);

insert or ignore into itens_cardapio (id, nome, descricao, preco, categoria, disponivel)
values
  (1, 'X-Burger', 'Pão brioche, hambúrguer artesanal, queijo e molho da casa.', 24.90, 'Hambúrgueres', 1),
  (2, 'X-Salada', 'Hambúrguer artesanal, queijo, alface, tomate e maionese.', 27.90, 'Hambúrgueres', 1),
  (3, 'Pizza Calabresa', 'Massa fina, calabresa, cebola e muçarela.', 49.90, 'Pizzas', 1),
  (4, 'Batata Frita', 'Porção crocante para compartilhar.', 19.90, 'Porções', 1),
  (5, 'Refrigerante lata', '350 ml.', 6.90, 'Bebidas', 1),
  (6, 'Suco natural', 'Laranja, limão ou maracujá.', 9.90, 'Bebidas', 1);

insert or ignore into cardapio_itens (cardapio_id, item_cardapio_id)
select 1, id from itens_cardapio;
