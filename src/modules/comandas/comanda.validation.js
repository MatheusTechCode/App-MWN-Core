import { AppError } from '../../utils/AppError.js';

export function validateCreateComanda(body) {
  if (!body.mesaToken) {
    throw new AppError('Token da mesa é obrigatório.');
  }

  if (!body.nomeCliente || body.nomeCliente.trim().length < 2) {
    throw new AppError('Nome da comanda deve ter pelo menos 2 caracteres.');
  }
}

export function validateRenameComanda(body) {
  if (!body.nomeCliente || body.nomeCliente.trim().length < 2) {
    throw new AppError('Novo nome da comanda deve ter pelo menos 2 caracteres.');
  }
}

export function validateTransferComanda(body) {
  if (!body.mesaId) {
    throw new AppError('Mesa de destino é obrigatória.');
  }
}
