import { registrarPagamento as registrarPagamentoRepository } from './pagamento.repository.js';

export async function registrarPagamento({ comandaId, formaPagamento, usuario }) {
  return registrarPagamentoRepository({ comandaId, formaPagamento, usuario });
}
