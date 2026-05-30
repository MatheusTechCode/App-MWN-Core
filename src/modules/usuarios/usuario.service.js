import bcrypt from 'bcryptjs';
import { AppError } from '../../utils/AppError.js';
import {
  createGarcom as createGarcomRepository,
  disableGarcom,
  findGarcomById,
  listGarcons,
  updateGarcom as updateGarcomRepository,
} from './usuario.repository.js';

export async function listarGarcons() {
  return listGarcons();
}

export async function criarGarcom({ nome, email, senha }) {
  const senhaHash = await bcrypt.hash(senha, 10);

  try {
    return await createGarcomRepository({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senhaHash,
    });
  } catch (error) {
    handleUsuarioError(error);
  }
}

export async function atualizarGarcom(id, { nome, email, senha }) {
  const garcom = await findGarcomById(id);

  if (!garcom) {
    throw new AppError('Garçom não encontrado.', 404);
  }

  const senhaHash = senha ? await bcrypt.hash(senha, 10) : null;

  try {
    return await updateGarcomRepository({
      id,
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senhaHash,
    });
  } catch (error) {
    handleUsuarioError(error);
  }
}

export async function excluirGarcom(id) {
  const garcom = await findGarcomById(id);

  if (!garcom) {
    throw new AppError('Garçom não encontrado.', 404);
  }

  return disableGarcom(id);
}

function handleUsuarioError(error) {
  if (error.code === '23505') {
    throw new AppError('Já existe um usuário com este e-mail.');
  }

  throw error;
}
