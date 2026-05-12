import { AppError } from '../../utils/AppError.js';

export function validateLogin(body) {
  if (!body.email || !body.senha) {
    throw new AppError('E-mail e senha são obrigatórios.');
  }
}
