import { AppError } from '../../utils/AppError.js';
import { findComandaById } from '../comandas/comanda.repository.js';
import { getCozinhaConfiguracao } from '../cozinha/cozinha.repository.js';
import { obterMesaPorToken } from '../mesas/mesa.service.js';
import { montarPainelCozinha, ordenarStatus } from './pedido.inteligencia.js';
import {
  createPedido,
  deletePedido,
  findItemPedidoById,
  findPedidoById,
  findPedidoContextById,
  listPedidosByMesaToken,
  listPedidosOperacaoDetalhada,
  requeueItemPedido,
  requeuePedido,
  updateItemPedidoStatus,
  updateItemUrgencia,
  updatePedidoItens,
  updatePedidoStatus,
  updatePedidoUrgencia,
} from './pedido.repository.smart.js';

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

const itemTransitions = {
  cozinha: {
    'Na fila': ['Em preparo', 'Pronto'],
    'Em preparo': ['Pronto'],
  },
  garcom: {
    Pronto: ['Entregue'],
  },
  admin: {
    'Na fila': ['Em preparo', 'Pronto'],
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
  return listPedidosOperacaoDetalhada();
}

export async function listarPainelPedidosOperacao(usuario) {
  const [pedidos, configuracao] = await Promise.all([
    listPedidosOperacaoDetalhada(),
    getCozinhaConfiguracao(),
  ]);

  return montarPainelCozinha(pedidos, configuracao, usuario);
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

export async function criarPedidoOperacao({ comandaId, itens, observacao, usuario }) {
  const comanda = await findComandaById(comandaId);

  if (!comanda || comanda.status !== 'aberta') {
    throw new AppError('Comanda aberta não encontrada.', 404);
  }

  return createPedido({ comandaId, itens, observacao, criadoPor: usuario.perfil });
}

export async function editarPedidoOperacao(id, { itens, usuario }) {
  const pedido = await findPedidoContextById(id);

  validarPedidoEditavelOperacao(pedido, usuario);

  return updatePedidoItens(id, itens, usuario.perfil);
}

export async function excluirPedidoCliente(id, { mesaToken }) {
  if (!mesaToken) {
    throw new AppError('Token da mesa é obrigatório.');
  }

  const pedido = await findPedidoContextById(id);

  validarPedidoEditavelCliente(pedido);

  if (pedido.token_qr !== mesaToken) {
    throw new AppError('Pedido não pertence à mesa informada.', 403);
  }

  return deletePedido(id, 'cliente');
}

export async function excluirPedidoOperacao(id, usuario) {
  const pedido = await findPedidoContextById(id);

  validarPedidoEditavelOperacao(pedido, usuario);

  return deletePedido(id, usuario.perfil);
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

export async function alterarStatusItemPedido(id, status, usuario) {
  const item = await findItemPedidoById(id);

  if (!item) {
    throw new AppError('Item do pedido não encontrado.', 404);
  }

  validarPedidoBase(item);
  const allowed = itemTransitions[usuario.perfil]?.[item.status] || [];

  if (!allowed.includes(status)) {
    throw new AppError(`Perfil ${usuario.perfil} não pode alterar item de "${item.status}" para "${status}".`, 403);
  }

  if (ordenarStatus(status) < ordenarStatus(item.status)) {
    throw new AppError('O fluxo operacional do item não pode retroceder por esta ação.', 403);
  }

  return updateItemPedidoStatus(id, status, usuario.perfil);
}

export async function alterarUrgenciaPedido(id, { urgente, motivo }, usuario) {
  const pedido = await findPedidoContextById(id);
  validarPedidoBase(pedido);
  return updatePedidoUrgencia(id, Boolean(urgente), motivo, usuario.perfil);
}

export async function alterarUrgenciaItemPedido(id, { urgente, motivo }, usuario) {
  const item = await findItemPedidoById(id);
  validarPedidoBase(item);
  return updateItemUrgencia(id, Boolean(urgente), motivo, usuario.perfil);
}

export async function retornarPedidoParaFila(id, { motivo }, usuario) {
  const pedido = await findPedidoContextById(id);
  validarPedidoBase(pedido);
  return requeuePedido(id, motivo, usuario.perfil);
}

export async function retornarItemParaFila(id, { motivo }, usuario) {
  const item = await findItemPedidoById(id);
  validarPedidoBase(item);
  return requeueItemPedido(id, motivo, usuario.perfil);
}

function validarPedidoBase(pedido) {
  if (!pedido) {
    throw new AppError('Pedido não encontrado.', 404);
  }

  if (pedido.comanda_status !== 'aberta') {
    throw new AppError('Pedidos de comandas fechadas não podem ser editados.');
  }
}

function validarPedidoEditavelCliente(pedido) {
  validarPedidoBase(pedido);

  if (pedido.status !== 'Na fila') {
    throw new AppError('Pedido só pode ser editado enquanto estiver na fila.');
  }
}

function validarPedidoEditavelOperacao(pedido, usuario) {
  validarPedidoBase(pedido);

  if (usuario.perfil === 'admin' && pedido.status !== 'Entregue') {
    return;
  }

  if (usuario.perfil === 'garcom' && pedido.status === 'Na fila') {
    return;
  }

  throw new AppError('Pedido só pode ser editado/excluído pelo garçom enquanto estiver na fila. Após isso, apenas o admin pode alterar.');
}
