import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { cardapioRoutes } from './modules/cardapios/cardapio.routes.js';
import { comandaRoutes } from './modules/comandas/comanda.routes.js';
import { mesaRoutes } from './modules/mesas/mesa.routes.js';
import { pagamentoRoutes } from './modules/pagamentos/pagamento.routes.js';
import { pedidoRoutes } from './modules/pedidos/pedido.routes.js';
import { usuarioRoutes } from './modules/usuarios/usuario.routes.js';

export const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '..', 'dist');

app.use(helmet());

function apiCors(req, res, next) {
  return cors({
    origin(origin, callback) {
      const allowedOrigins = new Set([env.clientUrl, ...env.corsOrigins]);
      const localhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
      const privateNetwork =
        /^https?:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;
      const sameHost = origin && getOriginHost(origin) === req.get('host');

      if (!origin || sameHost || allowedOrigins.has(origin) || localhost.test(origin) || privateNetwork.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origem não permitida pelo CORS.'));
    },
  })(req, res, next);
}

function getOriginHost(origin) {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

app.use('/api', apiCors);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'ComandaX' });
});

app.use('/api/auth', authRoutes);
app.use('/api/mesas', mesaRoutes);
app.use('/api/cardapios', cardapioRoutes);
app.use('/api/comandas', comandaRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/pagamentos', pagamentoRoutes);
app.use('/api/usuarios', usuarioRoutes);

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      next();
      return;
    }

    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(errorHandler);
