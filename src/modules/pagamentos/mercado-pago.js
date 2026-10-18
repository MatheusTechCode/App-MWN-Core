import crypto from 'node:crypto';
import { AppError } from '../../utils/AppError.js';

const apiBase = 'https://api.mercadopago.com';

export async function criarPagamentoPixMercadoPago({ paymentId, comanda, email, valor, idempotencyKey }) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new AppError('Pix online ainda não está configurado. Cadastre MERCADO_PAGO_ACCESS_TOKEN no Render.', 503);
  }
  const baseUrl = (process.env.APP_PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || '').replace(/\/$/, '');
  const response = await fetch(`${apiBase}/v1/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      transaction_amount: Number(valor),
      description: `Comanda ${comanda.id} - ${comanda.nome_cliente}`,
      payment_method_id: 'pix',
      external_reference: String(paymentId),
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      payer: { email },
      ...(baseUrl ? { notification_url: `${baseUrl}/api/pagamentos/mercado-pago/webhook` } : {}),
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('Mercado Pago recusou a criação do Pix:', response.status, data.message || data.error || 'erro');
    throw new AppError('O Mercado Pago não conseguiu criar o Pix. Confira as credenciais e os dados do pagador.', 502);
  }
  if (!data.id || !data.point_of_interaction?.transaction_data?.qr_code) {
    throw new AppError('Mercado Pago não retornou os dados do QR Code Pix.', 502);
  }
  return data;
}

export async function consultarPagamentoMercadoPago(paymentId) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) throw new AppError('Credencial Mercado Pago não configurada.', 503);
  const response = await fetch(`${apiBase}/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new AppError('Não foi possível consultar o pagamento no Mercado Pago.', 502);
  return response.json();
}

export function validarAssinaturaWebhook({ signature, requestId, dataId, secret }) {
  if (!signature || !requestId || !dataId || !secret) return false;
  const parts = Object.fromEntries(signature.split(',').map((part) => part.trim().split('=')));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const received = parts.v1;
  return received.length === expected.length && crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}
