import { asyncHandler } from '../../utils/asyncHandler.js';
import { obterMesaPorToken, obterMesas } from './mesa.service.js';

export const mesaController = {
  list: asyncHandler(async (req, res) => {
    res.json(await obterMesas());
  }),

  getByToken: asyncHandler(async (req, res) => {
    res.json(await obterMesaPorToken(req.params.tokenQr));
  }),
};
