import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  alterarStatusPedido,
  criarPedido,
  listarPedidosCliente,
  listarPedidosParaOperacao,
} from './pedido.service.js';
import { validateCreatePedido, validateUpdateStatus } from './pedido.validation.js';

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

  updateStatus: asyncHandler(async (req, res) => {
    validateUpdateStatus(req.body);
    res.json(await alterarStatusPedido(req.params.id, req.body.status, req.user));
  }),
};
