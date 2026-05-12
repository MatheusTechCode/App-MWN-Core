import { AppError } from '../../utils/AppError.js';
import { findMesaByToken, listMesas } from './mesa.repository.js';

export async function obterMesas() {
  return listMesas();
}

export async function obterMesaPorToken(tokenQr) {
  if (!tokenQr) {
    throw new AppError('Token da mesa é obrigatório.');
  }

  const mesa = await findMesaByToken(tokenQr);

  if (!mesa) {
    throw new AppError('Mesa não encontrada.', 404);
  }

  return mesa;
}
