import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { cardapioRoutes } from './modules/cardapios/cardapio.routes.js';
import { comandaRoutes } from './modules/comandas/comanda.routes.js';
import { mesaRoutes } from './modules/mesas/mesa.routes.js';
import { pedidoRoutes } from './modules/pedidos/pedido.routes.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'ComandaX' });
});

app.use('/api/auth', authRoutes);
app.use('/api/mesas', mesaRoutes);
app.use('/api/cardapios', cardapioRoutes);
app.use('/api/comandas', comandaRoutes);
app.use('/api/pedidos', pedidoRoutes);

app.use(errorHandler);
