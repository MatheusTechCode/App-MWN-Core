import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  alterarStatusPedido,
  criarPedido,
  criarPedidoOperacao,
  editarPedidoCliente,
  editarPedidoOperacao,
  excluirPedidoCliente,
  excluirPedidoOperacao,
  listarPedidosCliente,
  listarPedidosParaOperacao,
} from './pedido.service.js';
import {
  validateCreatePedido,
  validateCreatePedidoOperacao,
  validateUpdatePedido,
  validateUpdateStatus,
} from './pedido.validation.js';

export const pedidoController = {
  listByMesa: asyncHandler(async (req, res) => {
    res.json(await listarPedidosCliente(req.params.mesaToken));
  }),

  listOperation: asyncHandler(async (req, res) => {
    res.json(await listarPedidosParaOperacao());
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

  update: asyncHandler(async (req, res) => {
    validateUpdatePedido(req.body);
    res.json(await editarPedidoCliente(req.params.id, req.body));
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
};
