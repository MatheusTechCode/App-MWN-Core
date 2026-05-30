import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { authController } from './auth.controller.js';

export const authRoutes = Router();

authRoutes.post('/login', authController.login);
authRoutes.patch('/recover-admin-password', authController.recoverAdminPassword);
authRoutes.patch('/reset-password', requireAuth, requireRole('admin'), authController.resetPassword);
