import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { mesaController } from './mesa.controller.js';

export const mesaRoutes = Router();

mesaRoutes.get('/qr/:tokenQr', mesaController.getByToken);
mesaRoutes.get('/', requireAuth, requireRole('admin', 'garcom'), mesaController.list);
mesaRoutes.post('/', requireAuth, requireRole('admin'), mesaController.create);
mesaRoutes.put('/:id', requireAuth, requireRole('admin'), mesaController.update);
mesaRoutes.delete('/:id', requireAuth, requireRole('admin'), mesaController.delete);
