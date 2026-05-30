import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { cardapioController } from './cardapio.controller.js';

export const cardapioRoutes = Router();

cardapioRoutes.get('/', cardapioController.list);
cardapioRoutes.get('/admin', requireAuth, requireRole('admin', 'garcom', 'cozinha'), cardapioController.listAdmin);
cardapioRoutes.post('/admin', requireAuth, requireRole('admin'), cardapioController.create);
cardapioRoutes.put('/admin/:id', requireAuth, requireRole('admin'), cardapioController.update);
cardapioRoutes.patch('/admin/:id/status', requireAuth, requireRole('admin', 'garcom', 'cozinha'), cardapioController.updateStatus);
cardapioRoutes.delete('/admin/:id', requireAuth, requireRole('admin'), cardapioController.delete);
cardapioRoutes.get('/itens', requireAuth, requireRole('admin', 'garcom', 'cozinha'), cardapioController.listItems);
cardapioRoutes.post('/itens', requireAuth, requireRole('admin'), cardapioController.createItem);
cardapioRoutes.put('/itens/:id', requireAuth, requireRole('admin'), cardapioController.updateItem);
cardapioRoutes.delete('/itens/:id', requireAuth, requireRole('admin'), cardapioController.deleteItem);
cardapioRoutes.post('/vinculos', requireAuth, requireRole('admin'), cardapioController.linkItem);
