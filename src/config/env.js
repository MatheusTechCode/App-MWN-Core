import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

dotenv.config({ path: path.join(projectRoot, '.env') });

const databaseClient = (process.env.DATABASE_CLIENT || (process.env.DATABASE_URL ? 'postgres' : 'sqlite')).toLowerCase();
const clientPort = process.env.CLIENT_PORT || 5173;

export const env = {
  port: process.env.PORT || process.env.PORT_API || 3001,
  host: process.env.HOST || '0.0.0.0',
  databaseClient,
  databaseUrl: process.env.DATABASE_URL,
  databaseUrlUnpooled: process.env.DATABASE_URL_UNPOOLED,
  sqlitePath: path.resolve(projectRoot, process.env.SQLITE_PATH || 'database/demo.sqlite'),
  adminName: process.env.ADMIN_NAME || 'Admin',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@comandax.com',
  adminInitialPassword:
    process.env.ADMIN_INITIAL_PASSWORD || (process.env.NODE_ENV === 'production' ? null : 'admin123'),
  kitchenName: process.env.KITCHEN_NAME || 'Cozinha',
  kitchenEmail: process.env.KITCHEN_EMAIL || 'cozinha@comandax.com',
  kitchenInitialPassword:
    process.env.KITCHEN_INITIAL_PASSWORD || (process.env.NODE_ENV === 'production' ? null : 'cozinha123'),
  waiterName: process.env.WAITER_NAME || 'Garçom',
  waiterEmail: process.env.WAITER_EMAIL || 'garcom@comandax.com',
  waiterInitialPassword:
    process.env.WAITER_INITIAL_PASSWORD || (process.env.NODE_ENV === 'production' ? null : 'garcom123'),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  clientPort,
  clientUrl: process.env.CLIENT_URL || `http://localhost:${clientPort}`,
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  adminRecoveryCode: process.env.ADMIN_RECOVERY_CODE || 'comandax-admin-reset',
};
