import { AppError } from '../../utils/AppError.js';

export const FORMAS_PAGAMENTO = ['dinheiro', 'cartao_credito', 'cartao_debito', 'pix'];

export function validateRegistrarPagamento(body) {
  if (!body.comandaId) {
    throw new AppError('Comanda é obrigatória.');
  }

  if (!FORMAS_PAGAMENTO.includes(body.formaPagamento)) {
    throw new AppError('Forma de pagamento inválida.');
  }
}
