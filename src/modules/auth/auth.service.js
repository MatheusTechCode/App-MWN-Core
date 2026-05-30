import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { findUserByEmail, findUserByLogin, updateUserPassword } from './auth.repository.js';

export async function login({ login: loginInput, email, senha }) {
  const identificador = loginInput || email;
  const user = await findUserByLogin(identificador);

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

export async function redefinirSenha({ email, novaSenha }) {
  const user = await findUserByEmail(email);

  if (!user || !user.ativo) {
    throw new AppError('Usuário ativo não encontrado.', 404);
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10);
  return updateUserPassword(user.id, senhaHash);
}

export async function recuperarSenhaAdmin({ login: loginInput, codigoRecuperacao, novaSenha }) {
  if (codigoRecuperacao !== env.adminRecoveryCode) {
    throw new AppError('Código de recuperação inválido.', 403);
  }

  const user = await findUserByLogin(loginInput);

  if (!user || !user.ativo || user.perfil !== 'admin') {
    throw new AppError('Gestor ativo não encontrado.', 404);
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10);
  return updateUserPassword(user.id, senhaHash);
}
