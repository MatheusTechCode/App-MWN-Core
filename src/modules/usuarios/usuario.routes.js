import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { usuarioController } from './usuario.controller.js';

export const usuarioRoutes = Router();

usuarioRoutes.use(requireAuth, requireRole('admin'));

usuarioRoutes.get('/garcons', usuarioController.listGarcons);
usuarioRoutes.post('/garcons', usuarioController.createGarcom);
usuarioRoutes.put('/garcons/:id', usuarioController.updateGarcom);
usuarioRoutes.delete('/garcons/:id', usuarioController.deleteGarcom);
