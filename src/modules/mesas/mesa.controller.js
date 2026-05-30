import { asyncHandler } from '../../utils/asyncHandler.js';
import { atualizarMesa, criarMesa, excluirMesa, obterMesaPorToken, obterMesas } from './mesa.service.js';
import { validateMesa } from './mesa.validation.js';

export const mesaController = {
  list: asyncHandler(async (req, res) => {
    res.json(await obterMesas());
  }),

  getByToken: asyncHandler(async (req, res) => {
    res.json(await obterMesaPorToken(req.params.tokenQr));
  }),

  create: asyncHandler(async (req, res) => {
    validateMesa(req.body);
    res.status(201).json(await criarMesa(req.body));
  }),

  update: asyncHandler(async (req, res) => {
    validateMesa(req.body);
    res.json(await atualizarMesa(req.params.id, req.body));
  }),

  delete: asyncHandler(async (req, res) => {
    res.json(await excluirMesa(req.params.id));
  }),
};
