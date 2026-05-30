import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { comandaController } from './comanda.controller.js';

export const comandaRoutes = Router();

comandaRoutes.get('/', requireAuth, requireRole('admin', 'garcom'), comandaController.listOpen);
comandaRoutes.get('/mesa/:mesaToken', comandaController.listByMesa);
comandaRoutes.post('/', comandaController.create);
comandaRoutes.patch('/:id/nome', comandaController.rename);
comandaRoutes.patch(
  '/:id/transferir',
  requireAuth,
  requireRole('admin', 'garcom'),
  comandaController.transfer,
);
