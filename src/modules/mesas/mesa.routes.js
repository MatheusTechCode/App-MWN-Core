import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { mesaController } from './mesa.controller.js';

export const mesaRoutes = Router();

mesaRoutes.get('/qr/:tokenQr', mesaController.getByToken);
mesaRoutes.get('/', requireAuth, requireRole('admin', 'garcom'), mesaController.list);
