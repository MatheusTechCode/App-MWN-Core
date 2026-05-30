import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.port, env.host, () => {
  console.log(`ComandaX API rodando em http://${env.host}:${env.port}`);
});
