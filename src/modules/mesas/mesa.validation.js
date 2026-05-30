import { AppError } from '../../utils/AppError.js';

export function validateMesa(body) {
  if (!Number.isInteger(Number(body.numero)) || Number(body.numero) < 1) {
    throw new AppError('Número da mesa deve ser um inteiro positivo.');
  }

  if (body.status && !['ativa', 'inativa'].includes(body.status)) {
    throw new AppError('Status da mesa inválido.');
  }
}
