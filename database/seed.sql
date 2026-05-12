insert into mesas (numero, token_qr)
values (1, 'mesa-01'), (2, 'mesa-02'), (3, 'mesa-03')
on conflict (numero) do nothing;

insert into cardapios (nome, ativo)
values ('Cardápio principal', true)
on conflict do nothing;

insert into itens_cardapio (nome, descricao, preco, categoria, disponivel)
values
  ('X-Burger', 'Pão brioche, hambúrguer artesanal, queijo e molho da casa.', 24.90, 'Hambúrgueres', true),
  ('X-Salada', 'Hambúrguer artesanal, queijo, alface, tomate e maionese.', 27.90, 'Hambúrgueres', true),
  ('Pizza Calabresa', 'Massa fina, calabresa, cebola e muçarela.', 49.90, 'Pizzas', true),
  ('Batata Frita', 'Porção crocante para compartilhar.', 19.90, 'Porções', true),
  ('Refrigerante lata', '350 ml.', 6.90, 'Bebidas', true),
  ('Suco natural', 'Laranja, limão ou maracujá.', 9.90, 'Bebidas', true)
on conflict do nothing;

insert into cardapio_itens (cardapio_id, item_cardapio_id)
select c.id, i.id
from cardapios c
cross join itens_cardapio i
where c.nome = 'Cardápio principal'
on conflict do nothing;
