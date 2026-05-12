import { asyncHandler } from '../../utils/asyncHandler.js';
import { login } from './auth.service.js';
import { validateLogin } from './auth.validation.js';

export const authController = {
  login: asyncHandler(async (req, res) => {
    validateLogin(req.body);
    const result = await login(req.body);
    res.json(result);
  }),
};
