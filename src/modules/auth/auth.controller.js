import { asyncHandler } from '../../utils/asyncHandler.js';
import { login, recuperarSenhaAdmin, redefinirSenha } from './auth.service.js';
import { validateLogin, validateRecoverAdminPassword, validateResetPassword } from './auth.validation.js';

export const authController = {
  login: asyncHandler(async (req, res) => {
    validateLogin(req.body);
    const result = await login(req.body);
    res.json(result);
  }),

  resetPassword: asyncHandler(async (req, res) => {
    validateResetPassword(req.body);
    const usuario = await redefinirSenha(req.body);
    res.json({
      message: 'Senha redefinida com sucesso.',
      usuario,
    });
  }),

  recoverAdminPassword: asyncHandler(async (req, res) => {
    validateRecoverAdminPassword(req.body);
    const usuario = await recuperarSenhaAdmin(req.body);
    res.json({
      message: 'Senha do gestor recuperada com sucesso.',
      usuario,
    });
  }),
};
