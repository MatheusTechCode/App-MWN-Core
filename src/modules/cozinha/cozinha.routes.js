import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { cozinhaController } from './cozinha.controller.js';

export const cozinhaRoutes = Router();

cozinhaRoutes.get(
  '/config',
  requireAuth,
  requireRole('admin', 'cozinha', 'garcom'),
  cozinhaController.getConfig,
);
cozinhaRoutes.put(
  '/config',
  requireAuth,
  requireRole('admin'),
  cozinhaController.updateConfig,
);
cozinhaRoutes.post(
  '/estacoes',
  requireAuth,
  requireRole('admin'),
  cozinhaController.createStation,
);
cozinhaRoutes.put(
  '/estacoes/:id',
  requireAuth,
  requireRole('admin'),
  cozinhaController.updateStation,
);
cozinhaRoutes.delete(
  '/estacoes/:id',
  requireAuth,
  requireRole('admin'),
  cozinhaController.deleteStation,
);
