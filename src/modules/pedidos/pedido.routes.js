import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { pedidoController } from './pedido.controller.js';

export const pedidoRoutes = Router();

pedidoRoutes.get('/mesa/:mesaToken', pedidoController.listByMesa);
pedidoRoutes.get(
  '/operacao',
  requireAuth,
  requireRole('admin', 'cozinha', 'garcom'),
  pedidoController.listOperation,
);
pedidoRoutes.post('/', pedidoController.create);
pedidoRoutes.post(
  '/operacao',
  requireAuth,
  requireRole('admin', 'garcom'),
  pedidoController.createOperation,
);
pedidoRoutes.patch(
  '/operacao/:id',
  requireAuth,
  requireRole('admin', 'garcom'),
  pedidoController.updateOperation,
);
pedidoRoutes.delete(
  '/operacao/:id',
  requireAuth,
  requireRole('admin', 'garcom'),
  pedidoController.deleteOperation,
);
pedidoRoutes.delete('/:id', pedidoController.delete);
pedidoRoutes.patch(
  '/:id/status',
  requireAuth,
  requireRole('admin', 'cozinha', 'garcom'),
  pedidoController.updateStatus,
);
