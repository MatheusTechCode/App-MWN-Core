import crypto from 'crypto';
import { AppError } from '../../utils/AppError.js';
import {
  createMesa,
  disableMesa,
  findMesaById,
  findMesaByToken,
  listMesas,
  updateMesa,
} from './mesa.repository.js';

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

export async function criarMesa({ numero, status = 'ativa' }) {
  try {
    return await createMesa({
      numero: Number(numero),
      tokenQr: `mwn_qr_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`,
      status,
    });
  } catch (error) {
    handleMesaError(error);
  }
}

export async function atualizarMesa(id, { numero, status = 'ativa' }) {
  const mesa = await findMesaById(id);

  if (!mesa) {
    throw new AppError('Mesa não encontrada.', 404);
  }

  try {
    return await updateMesa(id, {
      numero: Number(numero),
      tokenQr: mesa.token_qr,
      status,
    });
  } catch (error) {
    handleMesaError(error);
  }
}

export async function excluirMesa(id) {
  const mesa = await findMesaById(id);

  if (!mesa) {
    throw new AppError('Mesa não encontrada.', 404);
  }

  return disableMesa(id);
}

function handleMesaError(error) {
  if (error.code === '23505') {
    throw new AppError('Já existe uma mesa com este número.');
  }

  throw error;
}
