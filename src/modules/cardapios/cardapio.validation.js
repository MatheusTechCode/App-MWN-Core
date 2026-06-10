import { AppError } from '../../utils/AppError.js';

export function validateCardapio(body) {
  if (!body.nome || body.nome.trim().length < 2) {
    throw new AppError('Nome do cardápio deve ter pelo menos 2 caracteres.');
  }
}

export function validateItemCardapio(body) {
  if (!body.nome || body.nome.trim().length < 2) {
    throw new AppError('Nome do item deve ter pelo menos 2 caracteres.');
  }

  if (!body.categoria || body.categoria.trim().length < 2) {
    throw new AppError('Categoria do item é obrigatória.');
  }

  if (Number.isNaN(Number(body.preco)) || Number(body.preco) < 0) {
    throw new AppError('Preço do item deve ser válido.');
  }

  if (body.imagem) {
    const supportedImage = /^data:image\/(jpeg|png|webp);base64,/i.test(body.imagem);
    if (!supportedImage) {
      throw new AppError('A foto deve estar nos formatos JPG, PNG ou WebP.');
    }

    if (body.imagem.length > 2_500_000) {
      throw new AppError('A foto do item é muito grande.');
    }
  }
}
