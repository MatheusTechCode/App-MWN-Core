import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  alterarStatusItemPedido,
  alterarStatusPedido,
  alterarUrgenciaItemPedido,
  alterarUrgenciaPedido,
  criarPedido,
  criarPedidoOperacao,
  editarPedidoOperacao,
  excluirPedidoCliente,
  excluirPedidoOperacao,
  listarPainelPedidosOperacao,
  listarPedidosCliente,
  listarPedidosParaOperacao,
  retornarItemParaFila,
  retornarPedidoParaFila,
} from './pedido.smart.service.js';
import {
  validateCreatePedido,
  validateCreatePedidoOperacao,
  validateRetornoFila,
  validateUpdatePedido,
  validateUpdateStatus,
  validateUrgencia,
} from './pedido.smart.validation.js';

export const pedidoController = {
  listByMesa: asyncHandler(async (req, res) => {
    res.json(await listarPedidosCliente(req.params.mesaToken));
  }),

  listOperation: asyncHandler(async (req, res) => {
    res.json(await listarPedidosParaOperacao());
  }),

  panelOperation: asyncHandler(async (req, res) => {
    res.json(await listarPainelPedidosOperacao(req.user));
  }),

  create: asyncHandler(async (req, res) => {
    validateCreatePedido(req.body);
    const criadoPor = req.user?.perfil || 'cliente';
    res.status(201).json(await criarPedido({ ...req.body, criadoPor }));
  }),

  createOperation: asyncHandler(async (req, res) => {
    validateCreatePedidoOperacao(req.body);
    res.status(201).json(await criarPedidoOperacao({ ...req.body, usuario: req.user }));
  }),

  updateOperation: asyncHandler(async (req, res) => {
    validateUpdatePedido(req.body);
    res.json(await editarPedidoOperacao(req.params.id, { ...req.body, usuario: req.user }));
  }),

  delete: asyncHandler(async (req, res) => {
    res.json(await excluirPedidoCliente(req.params.id, req.body));
  }),

  deleteOperation: asyncHandler(async (req, res) => {
    res.json(await excluirPedidoOperacao(req.params.id, req.user));
  }),

  updateStatus: asyncHandler(async (req, res) => {
    validateUpdateStatus(req.body);
    res.json(await alterarStatusPedido(req.params.id, req.body.status, req.user));
  }),

  updateItemStatus: asyncHandler(async (req, res) => {
    validateUpdateStatus(req.body);
    res.json(await alterarStatusItemPedido(req.params.itemId, req.body.status, req.user));
  }),

  updateUrgency: asyncHandler(async (req, res) => {
    validateUrgencia(req.body);
    res.json(await alterarUrgenciaPedido(req.params.id, req.body, req.user));
  }),

  updateItemUrgency: asyncHandler(async (req, res) => {
    validateUrgencia(req.body);
    res.json(await alterarUrgenciaItemPedido(req.params.itemId, req.body, req.user));
  }),

  returnToQueue: asyncHandler(async (req, res) => {
    validateRetornoFila(req.body);
    res.json(await retornarPedidoParaFila(req.params.id, req.body, req.user));
  }),

  returnItemToQueue: asyncHandler(async (req, res) => {
    validateRetornoFila(req.body);
    res.json(await retornarItemParaFila(req.params.itemId, req.body, req.user));
  }),
};
