import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Token de autenticação não informado.', 401);
  }

  try {
    req.user = jwt.verify(header.replace('Bearer ', ''), env.jwtSecret);
    return next();
  } catch {
    throw new AppError('Token inválido ou expirado.', 401);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.perfil)) {
      throw new AppError('Usuário sem permissão para esta ação.', 403);
    }

    return next();
  };
}
