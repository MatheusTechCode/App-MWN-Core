import { asyncHandler } from '../../utils/asyncHandler.js';
import { criarPixOnline, processarWebhookMercadoPago, registrarPagamento, solicitarAtendimentoPagamento } from './pagamento.service.js';
import { validateCriarPix, validateRegistrarPagamento, validateSolicitarAtendimento } from './pagamento.validation.js';

export const pagamentoController = {
  create: asyncHandler(async (req, res) => {
    validateRegistrarPagamento(req.body);
    res.status(201).json(await registrarPagamento({ ...req.body, usuario: req.user }));
  }),
  requestWaiter: asyncHandler(async (req, res) => {
    validateSolicitarAtendimento(req.body);
    res.status(201).json(await solicitarAtendimentoPagamento(req.body));
  }),
  createPix: asyncHandler(async (req, res) => {
    validateCriarPix(req.body);
    res.status(201).json(await criarPixOnline({
      ...req.body,
      email: req.body.email.trim().toLowerCase(),
    }));
  }),
  mercadoPagoWebhook: asyncHandler(async (req, res) => {
    const { validarAssinaturaWebhook } = await import('./mercado-pago.js');
    const dataId = req.query['data.id'] || req.body?.data?.id;
    const valid = validarAssinaturaWebhook({
      signature: req.get('x-signature'),
      requestId: req.get('x-request-id'),
      dataId,
      secret: process.env.MERCADO_PAGO_WEBHOOK_SECRET,
    });
    if (!valid) return res.status(401).json({ message: 'Assinatura do webhook inválida.' });
    if (req.body?.type === 'payment' || req.query.type === 'payment') {
      await processarWebhookMercadoPago(dataId);
    }
    return res.sendStatus(200);
  }),
};
