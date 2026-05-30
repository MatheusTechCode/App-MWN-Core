import { asyncHandler } from '../../utils/asyncHandler.js';
import { atualizarGarcom, criarGarcom, excluirGarcom, listarGarcons } from './usuario.service.js';
import { validateCreateGarcom, validateUpdateGarcom } from './usuario.validation.js';

export const usuarioController = {
  listGarcons: asyncHandler(async (req, res) => {
    res.json(await listarGarcons());
  }),

  createGarcom: asyncHandler(async (req, res) => {
    validateCreateGarcom(req.body);
    res.status(201).json(await criarGarcom(req.body));
  }),

  updateGarcom: asyncHandler(async (req, res) => {
    validateUpdateGarcom(req.body);
    res.json(await atualizarGarcom(req.params.id, req.body));
  }),

  deleteGarcom: asyncHandler(async (req, res) => {
    res.json(await excluirGarcom(req.params.id));
  }),
};
