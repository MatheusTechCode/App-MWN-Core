import {
  createCardapio,
  createItemCardapio,
  deleteCardapio,
  disableItemCardapio,
  listCardapios,
  listItensAtivos,
  listItensCardapioAdmin,
  setCardapioItem,
  updateCardapio,
  updateItemCardapio,
} from './cardapio.repository.js';

export async function obterCardapioAtivo() {
  const itens = await listItensAtivos();

  return itens.reduce((categorias, item) => {
    const categoria = item.categoria || 'Outros';
    const grupo = categorias.find((entry) => entry.categoria === categoria);

    if (grupo) {
      grupo.itens.push(item);
      return categorias;
    }

    categorias.push({ categoria, itens: [item] });
    return categorias;
  }, []);
}

export async function listarCardapiosAdmin() {
  return listCardapios();
}

export async function criarCardapio({ nome, ativo = true }) {
  return createCardapio({ nome: nome.trim(), ativo: Boolean(ativo) });
}

export async function atualizarCardapio(id, { nome, ativo = true }) {
  return updateCardapio(id, { nome: nome.trim(), ativo: Boolean(ativo) });
}

export async function excluirCardapio(id) {
  return deleteCardapio(id);
}

export async function listarItensAdmin() {
  return listItensCardapioAdmin();
}

export async function criarItem(body) {
  return createItemCardapio(normalizarItem(body));
}

export async function atualizarItem(id, body) {
  return updateItemCardapio(id, normalizarItem(body));
}

export async function excluirItem(id) {
  return disableItemCardapio(id);
}

export async function vincularItem({ cardapioId, itemCardapioId, vinculado }) {
  return setCardapioItem(cardapioId, itemCardapioId, Boolean(vinculado));
}

function normalizarItem(body) {
  return {
    nome: body.nome.trim(),
    descricao: body.descricao?.trim() || null,
    imagem: body.imagem || null,
    preco: Number(body.preco),
    categoria: body.categoria.trim(),
    disponivel: body.disponivel !== false,
    cardapioId: body.cardapioId || null,
  };
}
