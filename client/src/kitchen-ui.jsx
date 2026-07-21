import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  Clock3,
  Flame,
  RefreshCcw,
  RotateCcw,
} from 'lucide-react';
import React from 'react';

export function KitchenOperationsPage({
  panel,
  orders = [],
  user,
  notificationPermission,
  onEnableNotifications,
  onRefresh,
  onOrderStatus,
  onItemStatus,
  onDeliverMesa,
  onEditOrder,
}) {
  if (!panel) {
    return (
      <section className="operation-orders-page">
        <div className="admin-panel wide">
          <p className="muted">Carregando operação da cozinha...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="operation-orders-page">
      <header className="page-heading orders-operation-heading">
        <div>
          <h1>Cozinha Inteligente</h1>
          <p>Fila por estação, alertas e retirada consolidada por mesa.</p>
        </div>
        <div className="kitchen-header-actions">
          <button type="button" className="ghost" onClick={onRefresh}>
            <RefreshCcw size={16} /> Atualizar
          </button>
          <button
            className={notificationPermission === 'granted' ? 'notification-enabled' : 'ghost'}
            type="button"
            onClick={onEnableNotifications}
            disabled={notificationPermission === 'unsupported'}
          >
            {notificationPermission === 'granted' ? <BellRing size={18} /> : <Bell size={18} />}
            {notificationPermission === 'granted' ? 'Notificações ativas' : 'Ativar notificações'}
          </button>
        </div>
      </header>

      <div className="metric-grid kitchen-metric-grid">
        <MetricCard label="Na fila" value={panel.resumo.pedidosNaFila} tone="queue" />
        <MetricCard label="Em preparo" value={panel.resumo.pedidosEmPreparo} tone="preparing" />
        <MetricCard label="Prontos" value={panel.resumo.pedidosProntos} tone="ready" />
        <MetricCard label="Urgentes" value={panel.resumo.urgentes} tone="warning" />
        <MetricCard label="Alerta de fila" value={panel.resumo.alertasFila} tone="warning" />
        <MetricCard label="Atrasados" value={panel.resumo.alertasPreparo} tone="error" />
      </div>

      {panel.estacoes.length === 0 ? (
        <section className="admin-panel wide">
          <h2>Nenhum pedido em exibição</h2>
          <p className="muted">
            Assim que houver pedidos na fila, eles vão aparecer aqui por estação.
          </p>
        </section>
      ) : null}

      {panel.visaoConsolidada.habilitadaParaPerfil ? (
        <section className="admin-panel wide kitchen-summary-panel">
          <header className="kitchen-panel-header">
            <div>
              <h2>Retirada e entrega</h2>
              <p className="muted">Visão consolidada por mesa para cozinha, garçom e perfis liberados.</p>
            </div>
          </header>
          <div className="kitchen-mesa-grid">
            {panel.visaoConsolidada.mesas.length === 0 ? <p className="muted">Nenhuma mesa aguardando retirada.</p> : null}
            {panel.visaoConsolidada.mesas.map((mesa) => (
              <article className={`kitchen-mesa-card ${mesa.prontaParaRetirada ? 'ready' : ''}`} key={mesa.mesaNumero}>
                <header>
                  <div>
                    <strong>Mesa {mesa.mesaNumero}</strong>
                    <span>{mesa.nomeCliente}</span>
                  </div>
                  <span className={`status ${mesa.prontaParaRetirada ? 'pronto' : 'na-fila'}`}>
                    {mesa.prontaParaRetirada ? 'Pronta para retirada' : `${mesa.itensProntos} item(ns) prontos`}
                  </span>
                </header>
                <div className="kitchen-mesa-meta">
                  <span>Pedidos ativos: {mesa.pedidos.length}</span>
                  <span>
                    {user?.perfil === 'cozinha'
                      ? (mesa.cronometroCozinha ? `Cronômetro ${formatTime(mesa.cronometroCozinha)}` : 'Sem cronômetro')
                      : (mesa.estimativaEntrega ? `Estimativa ${formatTime(mesa.estimativaEntrega)}` : 'Sem estimativa')}
                  </span>
                </div>
                <div className="kitchen-mesa-items">
                  {mesa.itens.map((item) => (
                    <div key={item.id} className="kitchen-inline-item">
                      <span>{item.quantidade}x {item.nome}</span>
                      <strong className={`status ${toStatusClass(item.status)}`}>{item.status}</strong>
                    </div>
                  ))}
                </div>
                <div className="kitchen-mesa-actions">
                  <button
                    type="button"
                    disabled={!mesa.pedidos.some((pedido) => pedido.status === 'Pronto')}
                    onClick={() => onDeliverMesa(mesa)}
                  >
                    <CheckCircle2 size={16} /> Entregar pedidos prontos
                  </button>
                  {mesa.pedidos.some((pedido) => pedido.status !== 'Na fila') ? (
                    <button type="button" className="ghost" onClick={() => onOrderReturn(mesa.pedidos[0])}>
                      <RotateCcw size={16} /> Refazer pedido
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="kitchen-station-grid">
        {panel.estacoes.map((estacao) => (
          <section className="admin-panel kitchen-station-panel" key={estacao.slug}>
            <header className="kitchen-panel-header">
              <div>
                <h2>{estacao.nome}</h2>
                <p className="muted">{estacao.pedidos.length} pedido(s) visíveis nesta estação.</p>
              </div>
            </header>

            {estacao.agrupamentosSemelhantes.length > 0 ? (
              <div className="kitchen-batch-suggestions">
                {estacao.agrupamentosSemelhantes.map((grupo) => (
                  <div className="kitchen-batch-pill" key={`${estacao.slug}-${grupo.itemCardapioId}`}>
                    <Flame size={14} />
                    <span>{grupo.quantidade}x {grupo.nome}</span>
                    <small>
                      {grupo.pedidos > 1 ? `${grupo.pedidos} pedidos · ` : ''}
                      Mesas {grupo.mesas.join(', ')}
                    </small>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="kitchen-order-list">
              {estacao.pedidos.length === 0 ? <p className="muted">Nenhum item para esta estação.</p> : null}
              {estacao.pedidos.map((pedido) => (
                <article
                  className={`kitchen-order-card${pedido.urgente ? ' urgent' : ''}${pedido.atencao ? ' attention' : ''}`}
                  key={`${estacao.slug}-${pedido.id}`}
                >
                  <header>
                    <div>
                      <strong>Mesa {pedido.mesa_numero} · Pedido #{pedido.id}</strong>
                      <span>{pedido.nome_cliente}</span>
                      <div className="kitchen-order-chips">
                        {buildOrderSummary(pedido.itensEstacao).map((summary) => (
                          <span className={`kitchen-chip ${summary.tone}`} key={`${pedido.id}-${summary.label}`}>
                            <strong>{summary.value}</strong>
                            <small>{summary.label}</small>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="kitchen-card-badges">
                      {pedido.alertaFila || pedido.alertaPreparo ? (
                        <span className="kitchen-badge danger"><AlertTriangle size={14} /> Alerta</span>
                      ) : null}
                      {pedido.urgente ? <span className="kitchen-badge urgent"><Flame size={14} /> Urgente</span> : null}
                      {pedido.atencao ? <span className="kitchen-badge attention"><Clock3 size={14} /> Atenção</span> : null}
                    </div>
                  </header>

                  <div className="kitchen-order-meta">
                    <span>Status geral: {pedido.status}</span>
                    <span>
                      {user?.perfil === 'cozinha'
                        ? (pedido.cronometroCozinha?.previstoPara ? `Cronômetro ${formatTime(pedido.cronometroCozinha.previstoPara)}` : 'Sem cronômetro')
                        : (pedido.estimativaEntrega?.previstoPara ? `Entrega ${formatTime(pedido.estimativaEntrega.previstoPara)}` : 'Sem estimativa')}
                    </span>
                  </div>

                  <div className="kitchen-item-list">
                    {pedido.itensEstacao.map((item) => (
                      <div className="kitchen-item-row" key={item.id}>
                        <div>
                          <strong>{item.quantidade}x {item.nome}</strong>
                          <small>
                            {item.tempoPreparoMinutos > 0 ? `${item.tempoPreparoMinutos} min` : 'Sem tempo configurado'}
                            {item.status === 'Em preparo' ? ` · resta ${formatDuration(item.restanteSegundos)}` : ''}
                          </small>
                          {item.alertaFila ? <small className="text-warning">Esperando demais para entrar em preparo</small> : null}
                          {item.alertaPreparo ? <small className="text-danger">Ultrapassou o tempo estimado</small> : null}
                        </div>
                        <div className="kitchen-item-actions">
                          <span className={`status ${toStatusClass(item.status)}`}>{item.status}</span>
                          {renderItemAction(item, user, onItemStatus)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="kitchen-order-actions">
                    {canEditOrder(pedido, user) ? (
                      <button type="button" className="ghost" onClick={() => onEditOrder(pedido)}>
                        Editar pedido
                      </button>
                    ) : null}
                    {pedido.status !== 'Pronto' && pedido.status !== 'Entregue' && ['admin', 'cozinha'].includes(user.perfil) ? (
                      <button type="button" onClick={() => onOrderStatus(pedido, 'Pronto')}>
                        Marcar pedido como pronto
                      </button>
                    ) : null}
                    {pedido.status === 'Pronto' && ['admin', 'garcom'].includes(user.perfil) ? (
                      <button type="button" onClick={() => onOrderStatus(pedido, 'Entregue')}>
                        Liberar pedido
                      </button>
                    ) : null}
                    <button type="button" className="ghost" onClick={() => onOrderUrgency(pedido, !pedido.urgente)}>
                      <Flame size={14} /> {pedido.urgente ? 'Normalizar pedido' : 'Marcar urgente'}
                    </button>
                    {pedido.status !== 'Na fila' ? (
                      <button type="button" className="ghost" onClick={() => onOrderReturn(pedido)}>
                        <RotateCcw size={14} /> Retornar pedido
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="admin-panel wide">
        <header className="kitchen-panel-header">
          <div>
            <h2>Histórico recente</h2>
            <p className="muted">Pedidos entregues para consulta rápida da operação.</p>
          </div>
        </header>
        <div className="kitchen-history-list">
          {panel.historico.length === 0 ? (
            <p className="muted">Nenhum pedido entregue ainda. Quando houver, ele vai aparecer aqui.</p>
          ) : null}
          {panel.historico.map((pedido) => (
            <div className="kitchen-history-row" key={`history-${pedido.id}`}>
              <div>
                <strong>Mesa {pedido.mesa_numero} · Pedido #{pedido.id}</strong>
                <small>{pedido.itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ')}</small>
              </div>
              <span>{pedido.nome_cliente}</span>
              <strong>{formatDateTime(pedido.atualizado_em)}</strong>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export function KitchenConfigPage({
  config,
  cozinhaForm,
  setCozinhaForm,
  estacaoForm,
  setEstacaoForm,
  onSaveConfig,
  onSaveStation,
  onDeleteStation,
}) {
  if (!config) {
    return (
      <section className="admin-panels single-page">
        <section className="admin-panel wide">
          <p className="muted">Carregando configurações da cozinha...</p>
        </section>
      </section>
    );
  }

  return (
    <section className="admin-panels single-page">
      <form className="admin-panel wide kitchen-config-form" onSubmit={onSaveConfig}>
        <header className="kitchen-panel-header">
          <div>
            <h2>Configuração da cozinha</h2>
            <p className="muted">Defina modo, alertas, tolerância e quem enxerga o pedido total por mesa.</p>
          </div>
        </header>

        <div className="kitchen-config-grid">
          <label>
            Modo de operação
            <select
              value={cozinhaForm.modoOperacao}
              onChange={(event) => setCozinhaForm({ ...cozinhaForm, modoOperacao: event.target.value })}
            >
              <option value="simples">Simples</option>
              <option value="avancado">Avançado</option>
            </select>
          </label>
          <label>
            Tolerância da previsão
            <input
              min="0"
              type="number"
              value={cozinhaForm.toleranciaMinutos}
              onChange={(event) => setCozinhaForm({ ...cozinhaForm, toleranciaMinutos: event.target.value })}
            />
          </label>
          <label>
            Alerta de fila
            <input
              min="1"
              type="number"
              value={cozinhaForm.alertaFilaMinutos}
              onChange={(event) => setCozinhaForm({ ...cozinhaForm, alertaFilaMinutos: event.target.value })}
            />
          </label>
        </div>

        <div className="kitchen-config-grid">
          <label className="check-row">
            <input
              checked={cozinhaForm.agruparEntregaMesa}
              type="checkbox"
              onChange={(event) => setCozinhaForm({ ...cozinhaForm, agruparEntregaMesa: event.target.checked })}
            />
            Liberar pedidos da mesma mesa juntos
          </label>
          <label className="check-row">
            <input
              checked={cozinhaForm.agruparProducaoSemelhantes}
              type="checkbox"
              onChange={(event) => setCozinhaForm({ ...cozinhaForm, agruparProducaoSemelhantes: event.target.checked })}
            />
            Sugerir agrupamento de itens semelhantes
          </label>
        </div>

        <div className="kitchen-roles">
          <strong>Quem pode ver o pedido total da mesa</strong>
          {['garcom', 'cozinha', 'admin'].map((perfil) => (
            <label className="check-row" key={perfil}>
              <input
                checked={cozinhaForm.perfisVisaoConsolidada.includes(perfil)}
                type="checkbox"
                onChange={(event) => {
                  const current = new Set(cozinhaForm.perfisVisaoConsolidada);
                  if (event.target.checked) {
                    current.add(perfil);
                  } else {
                    current.delete(perfil);
                  }
                  setCozinhaForm({ ...cozinhaForm, perfisVisaoConsolidada: Array.from(current) });
                }}
              />
              {perfil}
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={cozinhaForm.perfisVisaoConsolidada.length === 0}
        >
          Salvar configuração da cozinha
        </button>
      </form>

      {cozinhaForm.modoOperacao === 'avancado' ? (
        <section className="admin-panel wide">
          <header className="kitchen-panel-header">
            <div>
              <h2>Estações</h2>
              <p className="muted">Cadastre as áreas de preparo para segmentar a operação.</p>
            </div>
          </header>

          <form className="waiter-order kitchen-station-form" onSubmit={onSaveStation}>
            <input
              placeholder="Nome da estação"
              value={estacaoForm.nome}
              onChange={(event) => setEstacaoForm({ ...estacaoForm, nome: event.target.value })}
            />
            <label className="check-row">
              <input
                checked={estacaoForm.ativo}
                type="checkbox"
                onChange={(event) => setEstacaoForm({ ...estacaoForm, ativo: event.target.checked })}
              />
              Ativa
            </label>
            <button type="submit" disabled={estacaoForm.nome.trim().length < 2}>
              {estacaoForm.id ? 'Salvar estação' : 'Criar estação'}
            </button>
            {estacaoForm.id ? (
              <button type="button" className="ghost" onClick={() => setEstacaoForm({ id: null, nome: '', ativo: true })}>
                Cancelar edição
              </button>
            ) : null}
          </form>

          <div className="kitchen-station-list">
            {config.estacoes.length === 0 ? <p className="muted">Nenhuma estação cadastrada.</p> : null}
            {config.estacoes.map((estacao) => (
              <article className="staff-card" key={estacao.id}>
                <div>
                  <strong>{estacao.nome}</strong>
                  <small>{estacao.slug}</small>
                  <span className={`status ${estacao.ativo ? 'pronto' : 'entregue'}`}>
                    {estacao.ativo ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <div className="staff-actions">
                  <button type="button" className="ghost" onClick={() => setEstacaoForm({ id: estacao.id, nome: estacao.nome, ativo: estacao.ativo })}>
                    Editar
                  </button>
                  <button type="button" onClick={() => onDeleteStation(estacao)}>
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function MetricCard({ label, value, tone }) {
  return (
    <article className={`metric-card kitchen-metric-card ${tone || ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function buildOrderSummary(items) {
  const totals = items.reduce(
    (accumulator, item) => {
      const quantidade = Number(item.quantidade || 0);
      accumulator.total += quantidade;

      if (item.status === 'Na fila') {
        accumulator.fila += quantidade;
      } else if (item.status === 'Em preparo') {
        accumulator.preparo += quantidade;
      } else if (item.status === 'Pronto') {
        accumulator.pronto += quantidade;
      }

      return accumulator;
    },
    { total: 0, fila: 0, preparo: 0, pronto: 0 },
  );

  return [
    { label: 'Itens', value: totals.total, tone: 'neutral' },
    { label: 'Fila', value: totals.fila, tone: totals.fila > 0 ? 'queue' : 'muted' },
    { label: 'Preparo', value: totals.preparo, tone: totals.preparo > 0 ? 'preparing' : 'muted' },
    { label: 'Prontos', value: totals.pronto, tone: totals.pronto > 0 ? 'ready' : 'muted' },
  ];
}

function renderItemAction(item, user, onItemStatus) {
  const perfil = user?.perfil;

  if (item.status === 'Na fila' && ['admin', 'cozinha'].includes(perfil)) {
    return (
      <button type="button" onClick={() => onItemStatus(item, 'Em preparo')}>
        Iniciar preparo
      </button>
    );
  }

  return null;
}

function canEditOrder(pedido, user) {
  if (user.perfil === 'admin') {
    return pedido.status !== 'Entregue';
  }

  if (user.perfil === 'garcom') {
    return pedido.status === 'Na fila';
  }

  return false;
}

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }

  if (minutes > 0) {
    return `${minutes}min`;
  }

  return 'menos de 1min';
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatTime(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function toStatusClass(status) {
  return String(status || '').toLowerCase().replaceAll(' ', '-');
}
