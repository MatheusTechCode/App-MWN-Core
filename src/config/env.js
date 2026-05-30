import dotenv from 'dotenv';

dotenv.config();

const databaseClient = (process.env.DATABASE_CLIENT || (process.env.DATABASE_URL ? 'postgres' : 'sqlite')).toLowerCase();
const clientPort = process.env.CLIENT_PORT || 5173;

export const env = {
  port: process.env.PORT_API || 3001,
  host: process.env.HOST || '0.0.0.0',
  databaseClient,
  databaseUrl: process.env.DATABASE_URL,
  sqlitePath: process.env.SQLITE_PATH || 'database/demo.sqlite',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  clientPort,
  clientUrl: process.env.CLIENT_URL || `http://localhost:${clientPort}`,
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  adminRecoveryCode: process.env.ADMIN_RECOVERY_CODE || 'comandax-admin-reset',
};
