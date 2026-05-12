import crypto from 'crypto';
import { AppError } from '../../utils/AppError.js';
import { obterMesaPorToken } from '../mesas/mesa.service.js';
import {
  createComanda,
  findComandaById,
  listComandasByMesa,
  renameComanda,
  transferComanda,
} from './comanda.repository.js';

export async function listarComandasDaMesa(mesaToken) {
  const mesa = await obterMesaPorToken(mesaToken);
  return listComandasByMesa(mesa.id);
}

export async function criarComanda({ mesaToken, nomeCliente }) {
  const mesa = await obterMesaPorToken(mesaToken);
  const codigoCliente = crypto.randomUUID();

  return createComanda({
    mesaId: mesa.id,
    nomeCliente: nomeCliente.trim(),
    codigoCliente,
  });
}

export async function renomearComanda(id, { nomeCliente, codigoCliente }) {
  const comanda = await findComandaById(id);

  if (!comanda) {
    throw new AppError('Comanda não encontrada.', 404);
  }

  if (comanda.codigo_cliente !== codigoCliente) {
    throw new AppError('Cliente não tem permissão para renomear esta comanda.', 403);
  }

  return renameComanda(id, nomeCliente.trim());
}

export async function transferirComanda(id, mesaId) {
  const comanda = await findComandaById(id);

  if (!comanda) {
    throw new AppError('Comanda não encontrada.', 404);
  }

  if (comanda.status !== 'aberta') {
    throw new AppError('Somente comandas abertas podem ser transferidas.');
  }

  return transferComanda(id, mesaId);
}
