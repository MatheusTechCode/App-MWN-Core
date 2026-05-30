import { asyncHandler } from '../../utils/asyncHandler.js';
import { registrarPagamento } from './pagamento.service.js';
import { validateRegistrarPagamento } from './pagamento.validation.js';

export const pagamentoController = {
  create: asyncHandler(async (req, res) => {
    validateRegistrarPagamento(req.body);
    res.status(201).json(await registrarPagamento({ ...req.body, usuario: req.user }));
  }),
};
