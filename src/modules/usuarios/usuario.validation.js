import { AppError } from '../../utils/AppError.js';

export function validateCreateGarcom(body) {
  if (!body.nome || body.nome.trim().length < 2) {
    throw new AppError('Nome do garçom deve ter pelo menos 2 caracteres.');
  }

  if (!body.email || !body.email.includes('@')) {
    throw new AppError('E-mail válido é obrigatório.');
  }

  if (!body.senha || body.senha.length < 6) {
    throw new AppError('Senha deve ter pelo menos 6 caracteres.');
  }
}

export function validateUpdateGarcom(body) {
  if (!body.nome || body.nome.trim().length < 2) {
    throw new AppError('Nome do garçom deve ter pelo menos 2 caracteres.');
  }

  if (!body.email || !body.email.includes('@')) {
    throw new AppError('E-mail válido é obrigatório.');
  }

  if (body.senha && body.senha.length < 6) {
    throw new AppError('Nova senha deve ter pelo menos 6 caracteres.');
  }
}
