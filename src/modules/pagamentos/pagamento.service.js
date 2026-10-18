import {
  atualizarPixNotificado,
  criarPixOnline as criarPixOnlineRepository,
  registrarPagamento as registrarPagamentoRepository,
  solicitarAtendimentoPagamento as solicitarAtendimentoPagamentoRepository,
} from './pagamento.repository.js';
import { consultarPagamentoMercadoPago, criarPagamentoPixMercadoPago } from './mercado-pago.js';

export async function registrarPagamento({ comandaId, formaPagamento, valor, usuario }) {
  return registrarPagamentoRepository({ comandaId, formaPagamento, valor, usuario });
}

export async function solicitarAtendimentoPagamento({ comandaId, mesaToken, codigoCliente }) {
  return solicitarAtendimentoPagamentoRepository({ comandaId, mesaToken, codigoCliente });
}

export async function criarPixOnline(input) {
  return criarPixOnlineRepository({ ...input, criarCobranca: criarPagamentoPixMercadoPago });
}

export async function processarWebhookMercadoPago(externalId) {
  const remote = await consultarPagamentoMercadoPago(externalId);
  await atualizarPixNotificado({
    externalId,
    statusProvider: remote.status,
    valorProvider: remote.transaction_amount,
    referencia: remote.external_reference,
  });
}
