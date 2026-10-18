import { AppError } from '../../utils/AppError.js';

export const FORMAS_PAGAMENTO = ['dinheiro', 'cartao_credito', 'cartao_debito', 'pix'];

export function validateRegistrarPagamento(body) {
  if (!body.comandaId) throw new AppError('Comanda é obrigatória.');
  if (!FORMAS_PAGAMENTO.includes(body.formaPagamento)) throw new AppError('Forma de pagamento inválida.');
  if (body.valor !== undefined && (!Number.isFinite(Number(body.valor)) || Number(body.valor) <= 0)) {
    throw new AppError('Valor de pagamento inválido.');
  }
}

export function validateSolicitarAtendimento(body) {
  if (!body.comandaId || !body.mesaToken || !body.codigoCliente) {
    throw new AppError('Comanda, mesa e código do cliente são obrigatórios.');
  }
}

export function validateCriarPix(body) {
  validateSolicitarAtendimento(body);
  if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    throw new AppError('Informe um e-mail válido para gerar o Pix.');
  }
}
