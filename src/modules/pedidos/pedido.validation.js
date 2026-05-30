import { AppError } from '../../utils/AppError.js';

export const STATUS_PEDIDO = ['Na fila', 'Em preparo', 'Pronto', 'Entregue'];

export function validateCreatePedido(body) {
  if (!body.comandaId) {
    throw new AppError('Comanda é obrigatória.');
  }

  if (!body.mesaToken) {
    throw new AppError('Token da mesa é obrigatório.');
  }

  validateItensPedido(body.itens);
}

export function validateCreatePedidoOperacao(body) {
  if (!body.comandaId) {
    throw new AppError('Comanda é obrigatória.');
  }

  validateItensPedido(body.itens);
}

export function validateUpdatePedido(body) {
  validateItensPedido(body.itens);
}

function validateItensPedido(itens) {
  if (!Array.isArray(itens) || itens.length === 0) {
    throw new AppError('Pedido deve possuir ao menos um item.');
  }

  itens.forEach((item) => {
    if (!item.itemCardapioId || !Number.isInteger(Number(item.quantidade)) || Number(item.quantidade) < 1) {
      throw new AppError('Itens do pedido devem informar item do cardápio e quantidade válida.');
    }
  });
}

export function validateUpdateStatus(body) {
  if (!STATUS_PEDIDO.includes(body.status)) {
    throw new AppError('Status do pedido inválido.');
  }
}
