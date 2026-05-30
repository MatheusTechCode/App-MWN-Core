import { AppError } from '../../utils/AppError.js';

export function validateLogin(body) {
  if ((!body.login && !body.email) || !body.senha) {
    throw new AppError('Login e senha são obrigatórios.');
  }
}

export function validateResetPassword(body) {
  if (!body.email || !body.novaSenha) {
    throw new AppError('E-mail e nova senha são obrigatórios.');
  }

  if (body.novaSenha.length < 6) {
    throw new AppError('A nova senha deve ter pelo menos 6 caracteres.');
  }
}

export function validateRecoverAdminPassword(body) {
  if (!body.login || !body.codigoRecuperacao || !body.novaSenha) {
    throw new AppError('Login, código de recuperação e nova senha são obrigatórios.');
  }

  if (body.novaSenha.length < 6) {
    throw new AppError('A nova senha deve ter pelo menos 6 caracteres.');
  }
}
