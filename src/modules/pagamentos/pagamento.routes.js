import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { pagamentoController } from './pagamento.controller.js';

export const pagamentoRoutes = Router();

pagamentoRoutes.post(
  '/',
  requireAuth,
  requireRole('admin', 'garcom'),
  pagamentoController.create,
);
