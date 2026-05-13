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
app.use(
  cors({
    origin(origin, callback) {
      const viteLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):517\d$/;
      const vitePrivateNetwork =
        /^http:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):517\d$/;

      if (!origin || origin === env.clientUrl || viteLocalhost.test(origin) || vitePrivateNetwork.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origem não permitida pelo CORS.'));
    },
  }),
);
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
