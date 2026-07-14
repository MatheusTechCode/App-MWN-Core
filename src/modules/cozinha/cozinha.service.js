import { AppError } from '../../utils/AppError.js';
import {
  createCozinhaEstacao,
  deleteCozinhaEstacao,
  getCozinhaConfiguracao,
  listCozinhaEstacoes,
  updateCozinhaConfiguracao,
  updateCozinhaEstacao,
} from './cozinha.repository.js';

const PERFIS_VALIDOS = ['admin', 'cozinha', 'garcom'];

export async function obterConfiguracaoCozinha() {
  const [configuracao, estacoes] = await Promise.all([
    getCozinhaConfiguracao(),
    listCozinhaEstacoes(),
  ]);

  return {
    ...(normalizarConfiguracao(configuracao)),
    estacoes: estacoes.map(normalizarEstacao),
  };
}

export async function salvarConfiguracaoCozinha(body) {
  const saved = await updateCozinhaConfiguracao({
    modoOperacao: body.modoOperacao,
    agruparEntregaMesa: Boolean(body.agruparEntregaMesa),
    agruparProducaoSemelhantes: Boolean(body.agruparProducaoSemelhantes),
    toleranciaMinutos: Number(body.toleranciaMinutos),
    alertaFilaMinutos: Number(body.alertaFilaMinutos),
    perfisVisaoConsolidada: normalizarPerfis(body.perfisVisaoConsolidada).join(','),
  });

  return {
    ...normalizarConfiguracao(saved),
    estacoes: (await listCozinhaEstacoes()).map(normalizarEstacao),
  };
}

export async function criarEstacaoCozinha(body) {
  const created = await createCozinhaEstacao({
    nome: body.nome.trim(),
    slug: criarSlug(body.nome),
  });

  return normalizarEstacao(created);
}

export async function atualizarEstacaoCozinha(id, body) {
  const updated = await updateCozinhaEstacao(id, {
    nome: body.nome.trim(),
    slug: criarSlug(body.nome),
    ativo: body.ativo !== false,
  });

  if (!updated) {
    throw new AppError('Estação não encontrada.', 404);
  }

  return normalizarEstacao(updated);
}

export async function excluirEstacaoCozinha(id) {
  const deleted = await deleteCozinhaEstacao(id);

  if (!deleted) {
    throw new AppError('Estação não encontrada.', 404);
  }

  return deleted;
}

export function normalizarConfiguracao(configuracao) {
  const base = configuracao || {
    modo_operacao: 'simples',
    agrupar_entrega_mesa: true,
    agrupar_producao_semelhantes: true,
    tolerancia_minutos: 3,
    alerta_fila_minutos: 10,
    perfis_visao_consolidada: 'garcom,cozinha',
  };

  return {
    modoOperacao: base.modo_operacao || 'simples',
    agruparEntregaMesa: Boolean(base.agrupar_entrega_mesa),
    agruparProducaoSemelhantes: Boolean(base.agrupar_producao_semelhantes),
    toleranciaMinutos: Number(base.tolerancia_minutos ?? 3),
    alertaFilaMinutos: Number(base.alerta_fila_minutos ?? 10),
    perfisVisaoConsolidada: normalizarPerfis(base.perfis_visao_consolidada),
    criadoEm: base.criado_em || null,
    atualizadoEm: base.atualizado_em || null,
  };
}

function normalizarPerfis(value) {
  const perfis = Array.isArray(value)
    ? value
    : String(value || 'garcom,cozinha')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const validos = perfis.filter((perfil) => PERFIS_VALIDOS.includes(perfil));
  return validos.length > 0 ? Array.from(new Set(validos)) : ['garcom'];
}

function normalizarEstacao(estacao) {
  return {
    id: estacao.id,
    nome: estacao.nome,
    slug: estacao.slug,
    ativo: Boolean(estacao.ativo),
    criadoEm: estacao.criado_em || null,
    atualizadoEm: estacao.atualizado_em || null,
  };
}

function criarSlug(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
