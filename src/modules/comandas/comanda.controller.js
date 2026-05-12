import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  criarComanda,
  listarComandasDaMesa,
  renomearComanda,
  transferirComanda,
} from './comanda.service.js';
import {
  validateCreateComanda,
  validateRenameComanda,
  validateTransferComanda,
} from './comanda.validation.js';

export const comandaController = {
  listByMesa: asyncHandler(async (req, res) => {
    res.json(await listarComandasDaMesa(req.params.mesaToken));
  }),

  create: asyncHandler(async (req, res) => {
    validateCreateComanda(req.body);
    res.status(201).json(await criarComanda(req.body));
  }),

  rename: asyncHandler(async (req, res) => {
    validateRenameComanda(req.body);
    res.json(await renomearComanda(req.params.id, req.body));
  }),

  transfer: asyncHandler(async (req, res) => {
    validateTransferComanda(req.body);
    res.json(await transferirComanda(req.params.id, req.body.mesaId));
  }),
};
