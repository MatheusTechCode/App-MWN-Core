import { listItensAtivos } from './cardapio.repository.js';

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
