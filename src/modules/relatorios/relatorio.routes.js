import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { relatorioController } from './relatorio.controller.js';

export const relatorioRoutes = Router();

relatorioRoutes.get(
  '/vendas',
  requireAuth,
  requireRole('admin'),
  relatorioController.salesDashboard,
);
