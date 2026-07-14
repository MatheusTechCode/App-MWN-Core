import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { pedidoController } from './pedido.smart.controller.js';

export const pedidoRoutes = Router();

pedidoRoutes.get('/mesa/:mesaToken', pedidoController.listByMesa);
pedidoRoutes.get(
  '/operacao',
  requireAuth,
  requireRole('admin', 'cozinha', 'garcom'),
  pedidoController.listOperation,
);
pedidoRoutes.get(
  '/operacao/painel',
  requireAuth,
  requireRole('admin', 'cozinha', 'garcom'),
  pedidoController.panelOperation,
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
pedidoRoutes.patch(
  '/:id/urgencia',
  requireAuth,
  requireRole('admin', 'cozinha', 'garcom'),
  pedidoController.updateUrgency,
);
pedidoRoutes.patch(
  '/:id/retorno',
  requireAuth,
  requireRole('admin', 'cozinha', 'garcom'),
  pedidoController.returnToQueue,
);
pedidoRoutes.patch(
  '/itens/:itemId/status',
  requireAuth,
  requireRole('admin', 'cozinha', 'garcom'),
  pedidoController.updateItemStatus,
);
pedidoRoutes.patch(
  '/itens/:itemId/urgencia',
  requireAuth,
  requireRole('admin', 'cozinha', 'garcom'),
  pedidoController.updateItemUrgency,
);
pedidoRoutes.patch(
  '/itens/:itemId/retorno',
  requireAuth,
  requireRole('admin', 'cozinha', 'garcom'),
  pedidoController.returnItemToQueue,
);
