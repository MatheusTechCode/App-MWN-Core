import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { findUserByEmail } from './auth.repository.js';

export async function login({ email, senha }) {
  const user = await findUserByEmail(email);

  if (!user || !user.ativo) {
    throw new AppError('Credenciais inválidas.', 401);
  }

  const senhaValida = await bcrypt.compare(senha, user.senha_hash);

  if (!senhaValida) {
    throw new AppError('Credenciais inválidas.', 401);
  }

  const payload = { id: user.id, nome: user.nome, perfil: user.perfil };
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '8h' });

  return {
    token,
    usuario: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
    },
  };
}
