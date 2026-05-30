import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  atualizarCardapio,
  atualizarItem,
  criarCardapio,
  criarItem,
  excluirCardapio,
  excluirItem,
  listarCardapiosAdmin,
  listarItensAdmin,
  obterCardapioAtivo,
  vincularItem,
} from './cardapio.service.js';
import { validateCardapio, validateItemCardapio } from './cardapio.validation.js';

export const cardapioController = {
  list: asyncHandler(async (req, res) => {
    res.json(await obterCardapioAtivo());
  }),

  listAdmin: asyncHandler(async (req, res) => {
    res.json(await listarCardapiosAdmin());
  }),

  create: asyncHandler(async (req, res) => {
    validateCardapio(req.body);
    res.status(201).json(await criarCardapio(req.body));
  }),

  update: asyncHandler(async (req, res) => {
    validateCardapio(req.body);
    res.json(await atualizarCardapio(req.params.id, req.body));
  }),

  updateStatus: asyncHandler(async (req, res) => {
    res.json(await atualizarCardapio(req.params.id, req.body));
  }),

  delete: asyncHandler(async (req, res) => {
    res.json(await excluirCardapio(req.params.id));
  }),

  listItems: asyncHandler(async (req, res) => {
    res.json(await listarItensAdmin());
  }),

  createItem: asyncHandler(async (req, res) => {
    validateItemCardapio(req.body);
    res.status(201).json(await criarItem(req.body));
  }),

  updateItem: asyncHandler(async (req, res) => {
    validateItemCardapio(req.body);
    res.json(await atualizarItem(req.params.id, req.body));
  }),

  deleteItem: asyncHandler(async (req, res) => {
    res.json(await excluirItem(req.params.id));
  }),

  linkItem: asyncHandler(async (req, res) => {
    res.json(await vincularItem(req.body));
  }),
};
