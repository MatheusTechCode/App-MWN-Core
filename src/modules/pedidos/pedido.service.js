import { AppError } from '../../utils/AppError.js';
import { findComandaById } from '../comandas/comanda.repository.js';
import { obterMesaPorToken } from '../mesas/mesa.service.js';
import {
  createPedido,
  findPedidoById,
  listPedidosByMesaToken,
  listPedidosOperacao,
  updatePedidoStatus,
} from './pedido.repository.js';

const transitions = {
  cozinha: {
    'Na fila': ['Em preparo'],
    'Em preparo': ['Pronto'],
  },
  garcom: {
    Pronto: ['Entregue'],
  },
  admin: {
    'Na fila': ['Em preparo'],
    'Em preparo': ['Pronto'],
    Pronto: ['Entregue'],
  },
};

export async function listarPedidosCliente(mesaToken) {
  if (!mesaToken) {
    throw new AppError('Token da mesa é obrigatório.');
  }

  return listPedidosByMesaToken(mesaToken);
}

export async function listarPedidosParaOperacao() {
  return listPedidosOperacao();
}

export async function criarPedido({ comandaId, mesaToken, itens, observacao, criadoPor = 'cliente' }) {
  const comanda = await findComandaById(comandaId);

  if (!comanda || comanda.status !== 'aberta') {
    throw new AppError('Comanda aberta não encontrada.', 404);
  }

  const mesa = await obterMesaPorToken(mesaToken);

  if (Number(comanda.mesa_id) !== Number(mesa.id)) {
    throw new AppError('Comanda não pertence à mesa informada.', 403);
  }

  return createPedido({ comandaId, itens, observacao, criadoPor });
}

export async function alterarStatusPedido(id, status, usuario) {
  const pedido = await findPedidoById(id);

  if (!pedido) {
    throw new AppError('Pedido não encontrado.', 404);
  }

  const allowed = transitions[usuario.perfil]?.[pedido.status] || [];

  if (!allowed.includes(status)) {
    throw new AppError(`Perfil ${usuario.perfil} não pode alterar pedido de "${pedido.status}" para "${status}".`, 403);
  }

  return updatePedidoStatus(id, status, usuario.perfil);
}
