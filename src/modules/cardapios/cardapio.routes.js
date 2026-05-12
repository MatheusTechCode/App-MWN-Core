import { Router } from 'express';
import { cardapioController } from './cardapio.controller.js';

export const cardapioRoutes = Router();

cardapioRoutes.get('/', cardapioController.list);
