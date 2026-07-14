import { AppError } from '../../utils/AppError.js';

const PERFIS_VALIDOS = ['admin', 'cozinha', 'garcom'];

export function validateCozinhaConfiguracao(body) {
  if (!['simples', 'avancado'].includes(body.modoOperacao)) {
    throw new AppError('Modo de operação da cozinha inválido.');
  }

  if (!Number.isInteger(Number(body.toleranciaMinutos)) || Number(body.toleranciaMinutos) < 0) {
    throw new AppError('Tolerância da cozinha deve ser um número inteiro maior ou igual a zero.');
  }

  if (!Number.isInteger(Number(body.alertaFilaMinutos)) || Number(body.alertaFilaMinutos) < 1) {
    throw new AppError('Alerta de fila deve ser um número inteiro maior que zero.');
  }

  if (!Array.isArray(body.perfisVisaoConsolidada) || body.perfisVisaoConsolidada.length === 0) {
    throw new AppError('Selecione ao menos um perfil para visualizar o pedido consolidado.');
  }

  const perfisInvalidos = body.perfisVisaoConsolidada.filter((perfil) => !PERFIS_VALIDOS.includes(perfil));
  if (perfisInvalidos.length > 0) {
    throw new AppError('Perfis da visão consolidada inválidos.');
  }
}

export function validateCozinhaEstacao(body) {
  if (!body.nome || body.nome.trim().length < 2) {
    throw new AppError('Nome da estação deve ter pelo menos 2 caracteres.');
  }
}
