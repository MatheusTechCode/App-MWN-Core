import { asyncHandler } from '../../utils/asyncHandler.js';
import { obterCardapioAtivo } from './cardapio.service.js';

export const cardapioController = {
  list: asyncHandler(async (req, res) => {
    res.json(await obterCardapioAtivo());
  }),
};
