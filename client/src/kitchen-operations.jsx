import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  Clock3,
  RefreshCcw,
} from 'lucide-react';
import React from 'react';

const ORDER_STATUSES = ['Na fila', 'Em preparo', 'Pronto'];

export function KitchenOperationsPage({
  panel,
  orders = [],
  user,
  notificationPermission,
  onEnableNotifications,
  onRefresh,
  onOrderStatus,
  onDeliverMesa,
  onEditOrder,
}) {
  if (!panel) {
    return (
      <section className="operation-orders-page">
        <div className="admin-panel wide">
          <p className="muted">Carregando operacao da cozinha...</p>
        </div>
      </section>
    );
  }

  return <KitchenOperationsPageContent
    panel={panel}
    orders={orders}
    user={user}
    notificationPermission={notificationPermission}
    onEnableNotifications={onEnableNotifications}
    onRefresh={onRefresh}
    onOrderStatus={onOrderStatus}
    onDeliverMesa={onDeliverMesa}
    onEditOrder={onEditOrder}
  />;
}

function KitchenOperationsPageContent({
  panel,
  orders,
  user,
  notificationPermission,
  onEnableNotifications,
  onRefresh,
  onOrderStatus,
  onDeliverMesa,
  onEditOrder,
}) {
  const [statusFilter, setStatusFilter] = React.useState('todos');
  const [now, setNow] = React.useState(() => Date.now());
  const groupedOrders = React.useMemo(() => groupOrdersByStatus(orders), [orders]);
  const visibleStatuses = statusFilter === 'todos' ? ORDER_STATUSES : [statusFilter];
  const boardLanes = visibleStatuses.map((status) => ({
    status,
    pedidos: groupedOrders[status] || [],
  }));
  const totalOrders = ORDER_STATUSES.reduce(
    (total, status) => total + (groupedOrders[status]?.length || 0),
    0,
  );
  const canShowStations = panel.configuracao?.modoOperacao === 'avancado' && panel.estacoes.length > 0;

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="operation-orders-page">
      <header className="page-heading orders-operation-heading">
        <div>
          <h1>Cozinha Inteligente</h1>
          <p>Fila por status, observacoes visiveis e retirada consolidada por mesa.</p>
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
            {notificationPermission === 'granted' ? 'Notificacoes ativas' : 'Ativar notificacoes'}
          </button>
        </div>
      </header>

      <nav className="kitchen-status-tabs" aria-label="Filtros da cozinha">
        {[
          { value: 'todos', label: 'Todos', count: totalOrders },
          { value: 'Na fila', label: 'Na fila', count: panel.resumo.pedidosNaFila },
          { value: 'Em preparo', label: 'Em preparo', count: panel.resumo.pedidosEmPreparo },
          { value: 'Pronto', label: 'Prontos', count: panel.resumo.pedidosProntos },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={statusFilter === tab.value ? 'active' : ''}
            onClick={() => setStatusFilter(tab.value)}
          >
            <span>{tab.label}</span>
            <strong>{tab.count}</strong>
          </button>
        ))}
      </nav>

      {boardLanes.every((lane) => lane.pedidos.length === 0) ? (
        <section className="admin-panel wide">
          <h2>Nenhum pedido em exibicao</h2>
          <p className="muted">Assim que houver pedidos na fila, eles vao aparecer aqui por status.</p>
        </section>
      ) : null}

      <section className={`kitchen-board ${statusFilter === 'todos' ? 'multi' : 'single'}`}>
        {boardLanes.map((lane) => (
          <section className="admin-panel kitchen-lane" key={lane.status}>
            <header className="kitchen-lane-header">
              <div>
                <h2>{lane.status}</h2>
                <p className="muted">{lane.pedidos.length} pedido(s)</p>
              </div>
            </header>

            <div className="kitchen-order-list">
              {lane.pedidos.length === 0 ? <p className="muted">Nenhum pedido nesta coluna.</p> : null}
              {lane.pedidos.map((pedido) => (
                <KitchenOrderCard
                  key={pedido.id}
                  pedido={pedido}
                  itens={pedido.itens || []}
                  now={now}
                  user={user}
                  onEditOrder={onEditOrder}
                  onOrderStatus={onOrderStatus}
                />
              ))}
            </div>
          </section>
        ))}
      </section>

      {canShowStations ? (
        <section className="admin-panel wide kitchen-station-panel">
          <header className="kitchen-panel-header">
            <div>
              <h2>Producao por estacao</h2>
              <p className="muted">{panel.estacoes.length} estacao(oes) visiveis no modo avancado.</p>
            </div>
          </header>

          <div className="kitchen-station-grid">
            {panel.estacoes.map((estacao) => (
              <section className="kitchen-station-column" key={estacao.slug}>
                <header className="kitchen-lane-header">
                  <div>
                    <h3>{estacao.nome}</h3>
                    <p className="muted">{estacao.pedidos.length} pedido(s) visiveis nesta estacao.</p>
                  </div>
                </header>

                {estacao.agrupamentosSemelhantes.length > 0 ? (
                  <div className="kitchen-batch-suggestions">
                    {estacao.agrupamentosSemelhantes.map((grupo) => (
                      <div className="kitchen-batch-pill" key={`${estacao.slug}-${grupo.itemCardapioId}`}>
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
                  {estacao.pedidos.length === 0 ? <p className="muted">Nenhum item para esta estacao.</p> : null}
                  {estacao.pedidos.map((pedido) => (
                    <KitchenOrderCard
                      key={`${estacao.slug}-${pedido.id}`}
                      pedido={pedido}
                      itens={pedido.itensEstacao || []}
                      now={now}
                      user={user}
                      onEditOrder={onEditOrder}
                      onOrderStatus={onOrderStatus}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      ) : null}

      {panel.visaoConsolidada.habilitadaParaPerfil ? (
        <section className="admin-panel wide kitchen-summary-panel">
          <header className="kitchen-panel-header">
            <div>
              <h2>Retirada e entrega</h2>
              <p className="muted">Visao consolidada por mesa para cozinha, garcom e perfis liberados.</p>
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
                      ? (mesa.cronometroCozinha ? `Cronometro ${formatTime(mesa.cronometroCozinha)}` : 'Sem cronometro')
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
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="admin-panel wide">
        <header className="kitchen-panel-header">
          <div>
            <h2>Historico recente</h2>
            <p className="muted">Pedidos entregues para consulta rapida da operacao.</p>
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

function KitchenOrderCard({ pedido, itens, now, user, onEditOrder, onOrderStatus }) {
  const perfil = user?.perfil;
  const showPreparationTime = user?.perfil === 'cozinha';
  const summary = buildOrderSummary(itens);
  const primaryAction = getOrderPrimaryAction(pedido, perfil);

  return (
    <article className={`kitchen-order-card${pedido.atencao ? ' attention' : ''}`}>
      <header>
        <div>
          <strong>Mesa {pedido.mesa_numero} · Pedido #{pedido.id}</strong>
          <span>{pedido.nome_cliente}</span>
          <div className="kitchen-order-chips">
            {summary.map((chip) => (
              <span className={`kitchen-chip ${chip.tone}`} key={`${pedido.id}-${chip.label}`}>
                <strong>{chip.value}</strong>
                <small>{chip.label}</small>
              </span>
            ))}
          </div>
        </div>
        <div className="kitchen-card-badges">
          {pedido.alertaFila || pedido.alertaPreparo ? (
            <span className="kitchen-badge danger">
              <AlertTriangle size={14} /> Alerta
            </span>
          ) : null}
          {pedido.atencao ? (
            <span className="kitchen-badge attention">
              <Clock3 size={14} /> Atenção
            </span>
          ) : null}
        </div>
      </header>

      <div className="kitchen-order-meta">
        <span>{getOrderTimeLabel(pedido, now)}</span>
        <span>{getDeliveryTimeLabel(pedido, now, showPreparationTime)}</span>
      </div>

      {pedido.observacao ? (
        <div className="kitchen-order-note">
          <strong>Observacao do pedido</strong>
          <p>{pedido.observacao}</p>
        </div>
      ) : null}

      <div className="kitchen-item-list">
        {itens.map((item) => (
          <div className="kitchen-item-row" key={item.id}>
            <div>
              <strong>{item.quantidade}x {item.nome}</strong>
              <small>
                {item.tempoPreparoMinutos > 0 ? `${item.tempoPreparoMinutos} min` : 'Sem tempo configurado'}
                {item.status === 'Em preparo' ? ` · resta ${formatDuration(item.restanteSegundos)}` : ''}
              </small>
              {item.observacao ? <small className="kitchen-item-note">Obs.: {item.observacao}</small> : null}
              {item.alertaFila ? <small className="text-warning">Esperando demais para entrar em preparo</small> : null}
              {item.alertaPreparo ? <small className="text-danger">Ultrapassou o tempo estimado</small> : null}
            </div>
            <div className="kitchen-item-actions">
              <span className={`status ${toStatusClass(item.status)}`}>{item.status}</span>
              {renderItemAction(item, perfil, onItemStatus)}
            </div>
          </div>
        ))}
      </div>

      {canEditOrder(pedido, user) ? (
        <div className="kitchen-order-actions">
          <button type="button" className="ghost" onClick={() => onEditOrder(pedido)}>
            Editar pedido
          </button>
        </div>
      ) : null}
    </article>
  );
}

function groupOrdersByStatus(orders) {
  return orders.reduce(
    (accumulator, pedido) => {
      if (accumulator[pedido.status]) {
        accumulator[pedido.status].push(pedido);
      }

      return accumulator;
    },
    Object.fromEntries(ORDER_STATUSES.map((status) => [status, []])),
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

function renderItemAction(item, perfil, onItemStatus) {
  if (item.status === 'Na fila' && ['admin', 'cozinha'].includes(perfil)) {
    return (
      <button type="button" onClick={() => onItemStatus(item, 'Em preparo')}>
        Iniciar preparo
      </button>
    );
  }

  if (item.status === 'Em preparo' && ['admin', 'cozinha'].includes(perfil)) {
    return (
      <button type="button" onClick={() => onItemStatus(item, 'Pronto')}>
        Marcar como pronto
      </button>
    );
  }

  return null;
}

function canEditOrder(pedido, user) {
  if (user?.perfil === 'admin') {
    return pedido.status !== 'Entregue';
  }

  if (user?.perfil === 'garcom') {
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

function getOrderTimeLabel(pedido, now) {
  const statusStart = parseTimestamp(pedido.status_desde) || parseTimestamp(pedido.criado_em);
  const elapsed = statusStart ? Math.max(0, Math.floor((now - statusStart.getTime()) / 1000)) : 0;

  if (pedido.status === 'Em preparo') {
    return `Em preparo há ${formatDuration(elapsed)}`;
  }

  if (pedido.status === 'Pronto') {
    return `Pronto há ${formatDuration(elapsed)}`;
  }

  return `Na fila há ${formatDuration(elapsed)}`;
}

function getDeliveryTimeLabel(pedido, now, showPreparationTime) {
  if (showPreparationTime) {
    const timestamp = parseTimestamp(pedido.cronometroCozinha?.previstoPara);

    if (!timestamp) {
      return 'Sem cronometro';
    }

    const remaining = Math.max(0, Math.floor((timestamp.getTime() - now) / 1000));
    return remaining > 0 ? `Preparo termina em ${formatDuration(remaining)}` : 'Preparo finalizado';
  }

  const timestamp = parseTimestamp(pedido.estimativaEntrega?.previstoPara);

  if (!timestamp) {
    return 'Sem estimativa';
  }

  const remaining = Math.max(0, Math.floor((timestamp.getTime() - now) / 1000));
  return remaining > 0 ? `Entrega em ${formatDuration(remaining)}` : 'Entrega pronta';
}

function parseTimestamp(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
}

function toStatusClass(status) {
  return String(status || '').toLowerCase().replaceAll(' ', '-');
}
