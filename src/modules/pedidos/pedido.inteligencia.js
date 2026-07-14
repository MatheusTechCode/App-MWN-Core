import { normalizarConfiguracao } from '../cozinha/cozinha.service.js';

const STATUS_ORDER = {
  'Na fila': 0,
  'Em preparo': 1,
  Pronto: 2,
  Entregue: 3,
};

export function enriquecerPedidos(pedidos, configuracaoBruta) {
  const configuracao = normalizarConfiguracao(configuracaoBruta);
  const now = Date.now();

  return pedidos.map((pedido) => {
    const itens = (pedido.itens || []).map((item) => {
      const tempoPreparoMinutos = Number(item.tempoPreparoMinutos || 0);
      const tempoPreparoSegundos = tempoPreparoMinutos * 60;
      const iniciadoEm = parseDatabaseDate(item.iniciadoPreparoEm);
      const esperadoProntoEm = iniciadoEm && tempoPreparoSegundos > 0
        ? new Date(iniciadoEm.getTime() + tempoPreparoSegundos * 1000).toISOString()
        : null;
      const restanteSegundos = iniciadoEm && tempoPreparoSegundos > 0
        ? Math.max(0, tempoPreparoSegundos - Math.floor((now - iniciadoEm.getTime()) / 1000))
        : tempoPreparoSegundos;
      const aguardandoSegundos = item.status === 'Na fila'
        ? Math.max(0, Math.floor((now - parseDatabaseDate(pedido.criado_em).getTime()) / 1000))
        : 0;
      const atrasadoFila = item.status === 'Na fila' && aguardandoSegundos > configuracao.alertaFilaMinutos * 60;
      const atrasadoPreparo = item.status === 'Em preparo'
        && iniciadoEm
        && now > iniciadoEm.getTime() + (tempoPreparoMinutos + configuracao.toleranciaMinutos) * 60 * 1000;
      const atencao = !item.urgente && item.status === 'Na fila' && tempoPreparoMinutos >= 15;

      return {
        ...item,
        tempoPreparoMinutos,
        tempoPreparoSegundos,
        restanteSegundos,
        aguardandoSegundos,
        esperadoProntoEm,
        alertaFila: atrasadoFila,
        alertaPreparo: atrasadoPreparo,
        atencao,
        estacao: resolverEstacaoItem(item, configuracao),
      };
    });

    const itemUrgente = itens.some((item) => item.urgente);
    const alertaFila = itens.some((item) => item.alertaFila);
    const alertaPreparo = itens.some((item) => item.alertaPreparo);
    const atencao = itens.some((item) => item.atencao);
    const estimativaEntrega = calcularEstimativaPedido(itens, configuracao, now);
    const cronometroCozinha = calcularCronometroCozinha(itens, now);

    return {
      ...pedido,
      urgente: Boolean(pedido.urgente) || itemUrgente,
      alertaFila,
      alertaPreparo,
      atencao,
      estimativaEntrega,
      cronometroCozinha,
      itens,
    };
  });
}

export function montarPainelCozinha(pedidos, configuracaoBruta, usuario) {
  const configuracao = normalizarConfiguracao(configuracaoBruta);
  const enriquecidos = enriquecerPedidos(pedidos, configuracaoBruta);
  const ativos = enriquecidos.filter((pedido) => pedido.status !== 'Entregue');
  const historico = enriquecidos
    .filter((pedido) => pedido.status === 'Entregue')
    .sort((a, b) => new Date(b.atualizado_em).getTime() - new Date(a.atualizado_em).getTime())
    .slice(0, 30);
  const estacoes = construirEstacoes(ativos, configuracao);
  const mesas = construirVisaoConsolidada(ativos, configuracao);

  return {
    configuracao,
    resumo: {
      pedidosNaFila: ativos.filter((pedido) => pedido.status === 'Na fila').length,
      pedidosEmPreparo: ativos.filter((pedido) => pedido.status === 'Em preparo').length,
      pedidosProntos: ativos.filter((pedido) => pedido.status === 'Pronto').length,
      pedidosEntregues: historico.length,
      urgentes: ativos.filter((pedido) => pedido.urgente).length,
      alertasFila: ativos.filter((pedido) => pedido.alertaFila).length,
      alertasPreparo: ativos.filter((pedido) => pedido.alertaPreparo).length,
    },
    estacoes,
    visaoConsolidada: {
      habilitadaParaPerfil:
        configuracao.perfisVisaoConsolidada.includes(usuario.perfil) || usuario.perfil === 'cozinha',
      perfis: configuracao.perfisVisaoConsolidada,
      mesas,
    },
    historico,
  };
}

export function calcularStatusPedidoPorItens(itens) {
  const statuses = itens.map((item) => item.status);

  if (statuses.length === 0) {
    return 'Na fila';
  }

  if (statuses.every((status) => status === 'Entregue')) {
    return 'Entregue';
  }

  if (statuses.every((status) => ['Pronto', 'Entregue'].includes(status))) {
    return 'Pronto';
  }

  if (statuses.some((status) => ['Em preparo', 'Pronto', 'Entregue'].includes(status))) {
    return 'Em preparo';
  }

  return 'Na fila';
}

function construirEstacoes(pedidos, configuracao) {
  const map = new Map();

  for (const pedido of pedidos) {
    for (const item of pedido.itens) {
      const stationKey = item.estacao.slug;
      const current = map.get(stationKey) || {
        id: item.estacao.id,
        nome: item.estacao.nome,
        slug: item.estacao.slug,
        pedidos: new Map(),
        agrupamentos: new Map(),
      };
      const pedidoAtual = current.pedidos.get(pedido.id) || {
        ...pedido,
        itensEstacao: [],
      };
      pedidoAtual.itensEstacao.push(item);
      current.pedidos.set(pedido.id, pedidoAtual);

      if (configuracao.agruparProducaoSemelhantes && item.status === 'Na fila') {
        const groupKey = `${item.itemCardapioId}`;
        const grouped = current.agrupamentos.get(groupKey) || {
          itemCardapioId: item.itemCardapioId,
          nome: item.nome,
          quantidade: 0,
          mesas: new Set(),
          pedidos: new Set(),
        };
        grouped.quantidade += Number(item.quantidade);
        grouped.mesas.add(pedido.mesa_numero);
        grouped.pedidos.add(pedido.id);
        current.agrupamentos.set(groupKey, grouped);
      }

      map.set(stationKey, current);
    }
  }

  return Array.from(map.values())
    .map((station) => ({
      id: station.id,
      nome: station.nome,
      slug: station.slug,
      pedidos: Array.from(station.pedidos.values()).sort(compararPedidoOperacao),
      agrupamentosSemelhantes: Array.from(station.agrupamentos.values())
        .filter((item) => item.quantidade > 1)
        .map((item) => ({
          ...item,
          mesas: Array.from(item.mesas).sort((a, b) => a - b),
          pedidos: item.pedidos.size,
        })),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

function construirVisaoConsolidada(pedidos, configuracao) {
  const map = new Map();

  for (const pedido of pedidos) {
    const mesaKey = String(pedido.mesa_numero);
    const current = map.get(mesaKey) || {
      mesaNumero: pedido.mesa_numero,
      nomeCliente: pedido.nome_cliente,
      pedidos: [],
      itens: [],
      estimativas: [],
      cronometros: [],
    };
    current.pedidos.push({
      id: pedido.id,
      status: pedido.status,
      urgente: pedido.urgente,
      alertaPreparo: pedido.alertaPreparo,
      alertaFila: pedido.alertaFila,
      estimativaEntrega: pedido.estimativaEntrega,
      itens: pedido.itens,
    });
    current.itens.push(...pedido.itens);
    if (pedido.estimativaEntrega?.previstoPara) {
      current.estimativas.push(new Date(pedido.estimativaEntrega.previstoPara).getTime());
    }
    if (pedido.cronometroCozinha?.previstoPara) {
      current.cronometros.push(new Date(pedido.cronometroCozinha.previstoPara).getTime());
    }
    map.set(mesaKey, current);
  }

  return Array.from(map.values())
    .map((mesa) => {
      const itensPendentes = mesa.itens.filter((item) => item.status !== 'Entregue');
      const itensProntos = itensPendentes.filter((item) => item.status === 'Pronto');
      const tudoPronto = itensPendentes.length > 0 && itensPendentes.every((item) => ['Pronto', 'Entregue'].includes(item.status));

      return {
        mesaNumero: mesa.mesaNumero,
        nomeCliente: mesa.nomeCliente,
        pedidos: mesa.pedidos.sort((a, b) => a.id - b.id),
        itens: mesa.itens,
        urgente: mesa.pedidos.some((pedido) => pedido.urgente),
        alertaFila: mesa.pedidos.some((pedido) => pedido.alertaFila),
        alertaPreparo: mesa.pedidos.some((pedido) => pedido.alertaPreparo),
        prontaParaRetirada: configuracao.agruparEntregaMesa ? tudoPronto : itensProntos.length > 0,
        itensProntos: itensProntos.length,
        estimativaEntrega: mesa.estimativas.length > 0
          ? new Date(Math.max(...mesa.estimativas)).toISOString()
          : null,
        cronometroCozinha: mesa.cronometros.length > 0
          ? new Date(Math.max(...mesa.cronometros)).toISOString()
          : null,
      };
    })
    .sort((a, b) => a.mesaNumero - b.mesaNumero);
}

function calcularEstimativaPedido(itens, configuracao, now) {
  const pendentes = itens.filter((item) => item.status !== 'Entregue');

  if (pendentes.length === 0) {
    return {
      previstoPara: null,
      restanteSegundos: 0,
    };
  }

  const timestamps = pendentes.map((item) => {
    if (item.status === 'Em preparo' && item.esperadoProntoEm) {
      return new Date(item.esperadoProntoEm).getTime();
    }

    return now + item.tempoPreparoMinutos * 60 * 1000;
  });
  const timestamp = Math.max(...timestamps) + configuracao.toleranciaMinutos * 60 * 1000;

  return {
    previstoPara: new Date(timestamp).toISOString(),
    restanteSegundos: Math.max(0, Math.floor((timestamp - now) / 1000)),
  };
}

function calcularCronometroCozinha(itens, now) {
  const pendentes = itens.filter((item) => item.status !== 'Entregue');

  if (pendentes.length === 0) {
    return {
      previstoPara: null,
      restanteSegundos: 0,
    };
  }

  const timestamps = pendentes.map((item) => {
    if (item.status === 'Em preparo' && item.esperadoProntoEm) {
      return new Date(item.esperadoProntoEm).getTime();
    }

    return now + item.tempoPreparoMinutos * 60 * 1000;
  });
  const timestamp = Math.max(...timestamps);

  return {
    previstoPara: new Date(timestamp).toISOString(),
    restanteSegundos: Math.max(0, Math.floor((timestamp - now) / 1000)),
  };
}

function compararPedidoOperacao(a, b) {
  if (Boolean(a.urgente) !== Boolean(b.urgente)) {
    return a.urgente ? -1 : 1;
  }

  if (Boolean(a.alertaPreparo || a.alertaFila) !== Boolean(b.alertaPreparo || b.alertaFila)) {
    return a.alertaPreparo || a.alertaFila ? -1 : 1;
  }

  if (Boolean(a.atencao) !== Boolean(b.atencao)) {
    return a.atencao ? -1 : 1;
  }

  return new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime();
}

function resolverEstacaoItem(item, configuracao) {
  if (configuracao.modoOperacao === 'avancado' && item.cozinhaEstacaoId) {
    return {
      id: item.cozinhaEstacaoId,
      nome: item.cozinhaEstacaoNome || 'Estação',
      slug: item.cozinhaEstacaoSlug || `estacao-${item.cozinhaEstacaoId}`,
    };
  }

  return {
    id: 'cozinha',
    nome: 'Cozinha',
    slug: 'cozinha',
  };
}

function parseDatabaseDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const normalized = typeof value === 'string' && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(value)
    ? `${value.replace(' ', 'T')}Z`
    : value;

  return new Date(normalized);
}

export function ordenarStatus(status) {
  return STATUS_ORDER[status] ?? 0;
}
