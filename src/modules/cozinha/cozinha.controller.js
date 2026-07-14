import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  atualizarEstacaoCozinha,
  criarEstacaoCozinha,
  excluirEstacaoCozinha,
  obterConfiguracaoCozinha,
  salvarConfiguracaoCozinha,
} from './cozinha.service.js';
import { validateCozinhaConfiguracao, validateCozinhaEstacao } from './cozinha.validation.js';

export const cozinhaController = {
  getConfig: asyncHandler(async (req, res) => {
    res.json(await obterConfiguracaoCozinha());
  }),

  updateConfig: asyncHandler(async (req, res) => {
    validateCozinhaConfiguracao(req.body);
    res.json(await salvarConfiguracaoCozinha(req.body));
  }),

  createStation: asyncHandler(async (req, res) => {
    validateCozinhaEstacao(req.body);
    res.status(201).json(await criarEstacaoCozinha(req.body));
  }),

  updateStation: asyncHandler(async (req, res) => {
    validateCozinhaEstacao(req.body);
    res.json(await atualizarEstacaoCozinha(req.params.id, req.body));
  }),

  deleteStation: asyncHandler(async (req, res) => {
    res.json(await excluirEstacaoCozinha(req.params.id));
  }),
};
