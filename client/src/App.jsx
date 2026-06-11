import { BarChart3, BookOpen, Check, ClipboardList, Clock3, CreditCard, ImagePlus, Minus, Plus, ReceiptText, RefreshCcw, Search, Settings, ShoppingCart, Table2, Trash2, Users, Utensils, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api.js';

const fallbackMesaToken = new URLSearchParams(window.location.search).get('mesa') || 'mwn_qr_a8F3kP7xQ2L9';
const initialRoute = getRouteFromPath();

export function App() {
  const [route, setRoute] = useState(initialRoute);
  const [clientScreen, setClientScreen] = useState('comanda');
  const [mesaToken] = useState(initialRoute.mesaToken || fallbackMesaToken);
  const [mesa, setMesa] = useState(null);
  const [cardapio, setCardapio] = useState([]);
  const [comandas, setComandas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [operacao, setOperacao] = useState([]);
  const [comandasOperacao, setComandasOperacao] = useState([]);
  const [mesasOperacao, setMesasOperacao] = useState([]);
  const [garcons, setGarcons] = useState([]);
  const [cardapiosAdmin, setCardapiosAdmin] = useState([]);
  const [itensAdmin, setItensAdmin] = useState([]);
  const [relatorioVendas, setRelatorioVendas] = useState(null);
  const [selectedComanda, setSelectedComanda] = useState(null);
  const [cart, setCart] = useState([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [cartFeedback, setCartFeedback] = useState(null);
  const cartFeedbackTimer = useRef(null);
  const cartFeedbackSequence = useRef(0);
  const [nomeCliente, setNomeCliente] = useState('');
  const [showNewComanda, setShowNewComanda] = useState(false);
  const [novaComandaOperacao, setNovaComandaOperacao] = useState({ mesaToken: '', nomeCliente: '' });
  const [login, setLogin] = useState({ login: '', senha: '' });
  const [recoverAdmin, setRecoverAdmin] = useState({ login: '', codigoRecuperacao: '', novaSenha: '' });
  const [showRecovery, setShowRecovery] = useState(false);
  const [passwordReset, setPasswordReset] = useState({ email: '', novaSenha: '' });
  const [garcomForm, setGarcomForm] = useState({ id: null, nome: '', email: '', senha: '' });
  const [mesaForm, setMesaForm] = useState({ id: null, numero: '', status: 'ativa' });
  const [cardapioForm, setCardapioForm] = useState({ id: null, nome: '', ativo: true });
  const [itemForm, setItemForm] = useState({
    id: null,
    nome: '',
    descricao: '',
    imagem: '',
    preco: '',
    categoria: '',
    disponivel: true,
    cardapioId: '',
  });
  const [user, setUser] = useState(readStoredUser);
  const [message, setMessage] = useState('');
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  const isAdminRoute = route.type === 'admin';
  const isClientRoute = route.type === 'cliente';
  const isLoginRoute = isAdminRoute && !user;
  const adminPage = route.adminPage || 'pedidos';
  const adminNavItems = [
    { id: 'pedidos', label: 'Pedidos', icon: ClipboardList, perfis: ['admin', 'garcom', 'cozinha'] },
    { id: 'comandas', label: 'Comandas', icon: CreditCard, perfis: ['admin', 'garcom'] },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3, perfis: ['admin'] },
    { id: 'cardapios', label: 'Cardápios', icon: BookOpen, perfis: ['admin', 'garcom', 'cozinha'] },
    { id: 'mesas', label: 'Mesas', icon: Table2, perfis: ['admin'] },
    { id: 'garcons', label: 'Garçons', icon: Users, perfis: ['admin'] },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, perfis: ['admin'] },
  ].filter((item) => !user || item.perfis.includes(user.perfil));

  function navigate(path) {
    window.history.pushState({}, '', path);
    setRoute(getRouteFromPath());
  }

  async function loadCliente() {
    const [mesaData, cardapioData, comandasData, pedidosData] = await Promise.all([
      api(`/mesas/qr/${mesaToken}`),
      api('/cardapios'),
      api(`/comandas/mesa/${mesaToken}`),
      api(`/pedidos/mesa/${mesaToken}`),
    ]);

    setMesa(mesaData);
    const listaCardapio = asArray(cardapioData);
    const listaComandas = asArray(comandasData);
    const listaPedidos = asArray(pedidosData);

    setCardapio(listaCardapio);
    setComandas(listaComandas);
    setPedidos(listaPedidos);
    if (!selectedComanda && listaComandas[0]) {
      setSelectedComanda(listaComandas[0].id);
    }
  }

  async function loadOperacao() {
    if (!user) return;
    const podeGerenciarComandas = ['admin', 'garcom'].includes(user.perfil);
    const podeVisualizarCardapio = ['admin', 'garcom', 'cozinha'].includes(user.perfil);
    const [
      pedidosOperacao,
      comandasAbertas,
      cardapioOperacao,
      mesasOperacaoData,
      garconsData,
      cardapiosAdminData,
      itensAdminData,
      relatorioVendasData,
    ] = await Promise.all([
      api('/pedidos/operacao'),
      podeGerenciarComandas ? api('/comandas') : Promise.resolve([]),
      podeVisualizarCardapio ? api('/cardapios') : Promise.resolve([]),
      podeGerenciarComandas ? api('/mesas') : Promise.resolve([]),
      user.perfil === 'admin' ? api('/usuarios/garcons') : Promise.resolve([]),
      podeVisualizarCardapio ? api('/cardapios/admin') : Promise.resolve([]),
      podeVisualizarCardapio ? api('/cardapios/itens') : Promise.resolve([]),
      user.perfil === 'admin' ? api('/relatorios/vendas') : Promise.resolve(null),
    ]);
    setOperacao(asArray(pedidosOperacao));
    setComandasOperacao(asArray(comandasAbertas));
    setCardapio(asArray(cardapioOperacao));
    const mesas = asArray(mesasOperacaoData);
    setMesasOperacao(mesas);
    setGarcons(asArray(garconsData));
    const adminCardapios = asArray(cardapiosAdminData);
    setCardapiosAdmin(adminCardapios);
    setItensAdmin(asArray(itensAdminData));
    setRelatorioVendas(relatorioVendasData);
    setItemForm((current) => ({
      ...current,
      cardapioId: current.cardapioId || adminCardapios[0]?.id || '',
    }));
    setNovaComandaOperacao((current) => ({
      ...current,
      mesaToken: current.mesaToken || mesas[0]?.token_qr || '',
    }));
  }

  useEffect(() => {
    if (!isClientRoute) return;
    loadCliente().catch((error) => setMessage(error.message));
  }, [isClientRoute, mesaToken]);

  useEffect(() => {
    if (!isClientRoute) return undefined;
    const timer = setInterval(() => loadCliente().catch(() => {}), 5000);
    return () => clearInterval(timer);
  }, [isClientRoute, mesaToken]);

  useEffect(() => {
    if (!isAdminRoute) return undefined;
    loadOperacao().catch((error) => setMessage(error.message));
    const timer = setInterval(() => loadOperacao().catch(() => {}), 5000);
    return () => clearInterval(timer);
  }, [isAdminRoute, user]);

  useEffect(() => {
    const handlePopState = () => setRoute(getRouteFromPath());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => () => clearTimeout(cartFeedbackTimer.current), []);

  useEffect(() => {
    if (!productDetails) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setProductDetails(null);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [productDetails]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.preco) * item.quantidade, 0),
    [cart],
  );
  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.quantidade), 0),
    [cart],
  );
  const menuCategories = useMemo(
    () => ['Todos', ...cardapio.map((grupo) => grupo.categoria)],
    [cardapio],
  );
  const filteredMenu = useMemo(() => {
    const search = normalizeText(menuSearch);

    return cardapio
      .filter((grupo) => selectedCategory === 'Todos' || grupo.categoria === selectedCategory)
      .map((grupo) => ({
        ...grupo,
        itens: grupo.itens.filter((item) =>
          normalizeText(`${item.nome} ${item.descricao || ''}`).includes(search),
        ),
      }))
      .filter((grupo) => grupo.itens.length > 0);
  }, [cardapio, menuSearch, selectedCategory]);
  const comandaAtual = comandas.find((comanda) => Number(comanda.id) === Number(selectedComanda));
  const comandaItems = useMemo(() => {
    const items = new Map();

    pedidos
      .filter((pedido) => Number(pedido.comanda_id) === Number(selectedComanda))
      .flatMap((pedido) => pedido.itens || [])
      .forEach((item) => {
        const key = `${item.itemCardapioId}-${item.precoUnitario}`;
        const current = items.get(key);

        items.set(key, {
          ...item,
          quantidade: Number(item.quantidade) + Number(current?.quantidade || 0),
        });
      });

    return Array.from(items.values());
  }, [pedidos, selectedComanda]);

  function addToCart(item, quantity = 1, observation = '') {
    const normalizedObservation = observation.trim();

    setCart((current) => {
      const existing = current.find(
        (entry) =>
          entry.itemCardapioId === item.id &&
          (entry.observacao || '') === normalizedObservation,
      );

      if (existing) {
        return current.map((entry) =>
          entry.cartKey === existing.cartKey
            ? { ...entry, quantidade: entry.quantidade + quantity }
            : entry,
        );
      }

      return [
        ...current,
        {
          cartKey: `${item.id}-${Date.now()}`,
          itemCardapioId: item.id,
          nome: item.nome,
          preco: item.preco,
          quantidade: quantity,
          observacao: normalizedObservation || undefined,
        },
      ];
    });

    clearTimeout(cartFeedbackTimer.current);
    cartFeedbackSequence.current += 1;
    setCartFeedback({
      itemId: item.id,
      itemName: item.nome,
      sequence: cartFeedbackSequence.current,
    });
    cartFeedbackTimer.current = setTimeout(() => setCartFeedback(null), 900);
  }

  function openProductDetails(item) {
    setProductDetails({ item, quantidade: 1, observacao: '' });
  }

  function confirmProductDetails() {
    if (!productDetails) return;

    addToCart(
      productDetails.item,
      Number(productDetails.quantidade),
      productDetails.observacao,
    );
    setProductDetails(null);
  }

  function changeCartQuantity(cartKey, delta) {
    setCart((current) =>
      current
        .map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantidade: item.quantidade + delta }
            : item,
        )
        .filter((item) => item.quantidade > 0),
    );
  }

  async function createComanda(event) {
    event.preventDefault();
    const nova = await api('/comandas', {
      method: 'POST',
      body: JSON.stringify({ mesaToken, nomeCliente }),
    });
    localStorage.setItem(`comandax_codigo_${nova.id}`, nova.codigo_cliente);
    setNomeCliente('');
    setShowNewComanda(false);
    setSelectedComanda(nova.id);
    setMessage('Comanda criada com sucesso.');
    await loadCliente();
    setClientScreen('cardapio');
  }

  async function createPedido() {
    if (!selectedComanda || cart.length === 0) {
      setMessage('Selecione uma comanda e adicione itens ao pedido.');
      return;
    }

    await api('/pedidos', {
      method: 'POST',
      body: JSON.stringify({ comandaId: selectedComanda, mesaToken, itens: cart }),
    });
    setCart([]);
    setShowMobileCart(false);
    setMessage('Pedido enviado para a cozinha.');
    setOrderConfirmation({
      title: 'Pedido enviado',
      text: 'Seu pedido foi enviado para a cozinha. Acompanhe o andamento na tela de pedidos.',
    });
    await loadCliente();
  }

  async function submitLogin(event) {
    event.preventDefault();
    const result = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify(login),
    });
    localStorage.setItem('comandax_token', result.token);
    localStorage.setItem('comandax_user', JSON.stringify(result.usuario));
    setUser(result.usuario);
    setLogin({ login: '', senha: '' });
    setMessage(`Bem-vindo, ${result.usuario.nome}.`);
    await loadOperacao();
  }

  async function submitAdminRecovery(event) {
    event.preventDefault();
    await api('/auth/recover-admin-password', {
      method: 'PATCH',
      body: JSON.stringify(recoverAdmin),
    });
    setRecoverAdmin({ login: '', codigoRecuperacao: '', novaSenha: '' });
    setShowRecovery(false);
    setMessage('Senha do gestor redefinida. Entre com a nova senha.');
  }

  async function changeStatus(pedido, status) {
    await api(`/pedidos/${pedido.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await loadOperacao();
  }

  async function registrarPagamento(comanda, formaPagamento) {
    await api('/pagamentos', {
      method: 'POST',
      body: JSON.stringify({ comandaId: comanda.id, formaPagamento }),
    });
    setMessage(`Pagamento da comanda ${comanda.nome_cliente} confirmado.`);
    await loadOperacao();
  }

  async function transferirComanda(comanda, mesaId) {
    await api(`/comandas/${comanda.id}/transferir`, {
      method: 'PATCH',
      body: JSON.stringify({ mesaId }),
    });
    setMessage(`Comanda ${comanda.nome_cliente} transferida.`);
    await loadOperacao();
  }

  async function resetPassword(event) {
    event.preventDefault();
    await api('/auth/reset-password', {
      method: 'PATCH',
      body: JSON.stringify(passwordReset),
    });
    setPasswordReset({ email: '', novaSenha: '' });
    setMessage('Senha redefinida com sucesso.');
  }

  async function createPedidoOperacao({ comandaId, itemCardapioId, quantidade }) {
    await api('/pedidos/operacao', {
      method: 'POST',
      body: JSON.stringify({
        comandaId,
        itens: [{ itemCardapioId, quantidade }],
      }),
    });
    setMessage('Pedido lançado na comanda.');
    await loadOperacao();
  }

  async function updatePedidoOperacao(pedidoId, itens) {
    await api(`/pedidos/operacao/${pedidoId}`, {
      method: 'PATCH',
      body: JSON.stringify({ itens }),
    });
    setMessage('Pedido atualizado com sucesso.');
    await loadOperacao();
  }

  async function deletePedidoCliente(pedidoId) {
    await api(`/pedidos/${pedidoId}`, {
      method: 'DELETE',
      body: JSON.stringify({ mesaToken }),
    });
    setMessage('Pedido excluído com sucesso.');
    await loadCliente();
  }

  async function deletePedidoOperacao(pedidoId) {
    await api(`/pedidos/operacao/${pedidoId}`, {
      method: 'DELETE',
    });
    setMessage('Pedido excluído com sucesso.');
    await loadOperacao();
  }

  async function createComandaOperacao(event) {
    event.preventDefault();

    await api('/comandas', {
      method: 'POST',
      body: JSON.stringify(novaComandaOperacao),
    });

    setNovaComandaOperacao((current) => ({ ...current, nomeCliente: '' }));
    setMessage('Comanda aberta para a mesa.');
    await loadOperacao();
  }

  async function saveGarcom(event) {
    event.preventDefault();
    const body = {
      nome: garcomForm.nome,
      email: garcomForm.email,
    };

    if (garcomForm.senha) {
      body.senha = garcomForm.senha;
    }

    if (garcomForm.id) {
      await api(`/usuarios/garcons/${garcomForm.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      setMessage('Garçom atualizado com sucesso.');
    } else {
      await api('/usuarios/garcons', {
        method: 'POST',
        body: JSON.stringify({ ...body, senha: garcomForm.senha }),
      });
      setMessage('Garçom criado com sucesso.');
    }

    setGarcomForm({ id: null, nome: '', email: '', senha: '' });
    await loadOperacao();
  }

  async function deleteGarcom(garcom) {
    await api(`/usuarios/garcons/${garcom.id}`, {
      method: 'DELETE',
    });
    setMessage(`Garçom ${garcom.nome} excluído.`);
    await loadOperacao();
  }

  function editGarcom(garcom) {
    setGarcomForm({ id: garcom.id, nome: garcom.nome, email: garcom.email, senha: '' });
  }

  async function saveMesa(event) {
    event.preventDefault();
    const method = mesaForm.id ? 'PUT' : 'POST';
    const path = mesaForm.id ? `/mesas/${mesaForm.id}` : '/mesas';

    await api(path, {
      method,
      body: JSON.stringify({ numero: mesaForm.numero, status: mesaForm.status }),
    });

    setMesaForm({ id: null, numero: '', status: 'ativa' });
    setMessage('Mesa salva com sucesso.');
    await loadOperacao();
  }

  async function deleteMesa(mesaItem) {
    await api(`/mesas/${mesaItem.id}`, { method: 'DELETE' });
    setMessage(`Mesa ${mesaItem.numero} excluída.`);
    await loadOperacao();
  }

  function editMesa(mesaItem) {
    setMesaForm({ id: mesaItem.id, numero: mesaItem.numero, status: mesaItem.status });
  }

  async function saveCardapio(event) {
    event.preventDefault();
    const method = cardapioForm.id ? 'PUT' : 'POST';
    const path = cardapioForm.id ? `/cardapios/admin/${cardapioForm.id}` : '/cardapios/admin';

    await api(path, {
      method,
      body: JSON.stringify({ nome: cardapioForm.nome, ativo: cardapioForm.ativo }),
    });

    setCardapioForm({ id: null, nome: '', ativo: true });
    setMessage('Cardápio salvo com sucesso.');
    await loadOperacao();
  }

  async function deleteCardapioAdmin(cardapioItem) {
    await api(`/cardapios/admin/${cardapioItem.id}`, { method: 'DELETE' });
    setMessage(`Cardápio ${cardapioItem.nome} excluído.`);
    await loadOperacao();
  }

  async function toggleCardapioStatus(cardapioItem) {
    await api(`/cardapios/admin/${cardapioItem.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ nome: cardapioItem.nome, ativo: !cardapioItem.ativo }),
    });
    setMessage(`Cardápio ${cardapioItem.ativo ? 'inativado' : 'ativado'}.`);
    await loadOperacao();
  }

  async function saveItemCardapio(event) {
    event.preventDefault();
    const method = itemForm.id ? 'PUT' : 'POST';
    const path = itemForm.id ? `/cardapios/itens/${itemForm.id}` : '/cardapios/itens';

    await api(path, {
      method,
      body: JSON.stringify(itemForm),
    });

    setItemForm({ id: null, nome: '', descricao: '', imagem: '', preco: '', categoria: '', disponivel: true, cardapioId: itemForm.cardapioId });
    setMessage('Item de cardápio salvo com sucesso.');
    await loadOperacao();
  }

  async function selectItemImage(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    try {
      const imagem = await optimizeMenuImage(file);
      setItemForm((current) => ({ ...current, imagem }));
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteItemCardapio(item) {
    await api(`/cardapios/itens/${item.id}`, { method: 'DELETE' });
    setMessage(`Item ${item.nome} inativado.`);
    await loadOperacao();
  }

  async function toggleItemVinculo(cardapioId, itemCardapioId, vinculado) {
    await api('/cardapios/vinculos', {
      method: 'POST',
      body: JSON.stringify({ cardapioId, itemCardapioId, vinculado }),
    });
    await loadOperacao();
  }

  function logout() {
    localStorage.removeItem('comandax_token');
    localStorage.removeItem('comandax_user');
    setUser(null);
    setOperacao([]);
    setComandasOperacao([]);
    setRelatorioVendas(null);
    setMessage('Sessão encerrada.');
  }

  function changeClientScreen(screen) {
    if (screen === 'cardapio' && !selectedComanda) {
      setMessage('Crie ou selecione uma comanda antes de acessar o cardápio.');
      setClientScreen('comanda');
      return;
    }

    setClientScreen(screen);
  }

  return (
    <main className={`app-shell ${isClientRoute ? 'client-mode' : ''} ${isClientRoute && clientScreen === 'cardapio' ? 'menu-mode' : ''}`}>
      {!isLoginRoute ? (
        <header className="topbar">
          <div>
            <strong>ComandaX</strong>
            <span>{isAdminRoute ? 'Operação MWN CORE' : isClientRoute ? `Mesa ${mesa?.numero || '--'}` : 'MWN CORE'}</span>
          </div>
          {isAdminRoute ? (
            <nav aria-label="Navegação da operação">
              {user ? (
                <button className="ghost" type="button" onClick={logout}>
                  Sair
                </button>
              ) : null}
            </nav>
          ) : isClientRoute ? (
            <nav aria-label="Navegação do cliente">
              <button className={clientScreen === 'cardapio' ? 'active' : ''} type="button" onClick={() => changeClientScreen('cardapio')}>
                <Utensils size={18} /> Cardápio
              </button>
              <button className={clientScreen === 'comanda' ? 'active' : ''} type="button" onClick={() => changeClientScreen('comanda')}>
                <ReceiptText size={18} /> Comanda
              </button>
              <button className={clientScreen === 'pedidos' ? 'active' : ''} type="button" onClick={() => changeClientScreen('pedidos')}>
                <ClipboardList size={18} /> Pedidos
              </button>
            </nav>
          ) : null}
        </header>
      ) : null}

      {message && <p className="notice">{message}</p>}

      {isClientRoute ? (
        <section className="client-page">
          {clientScreen === 'comanda' ? (
            <section className="client-comanda-page">
              <div className="client-comanda-panel">
                <header className="comanda-toolbar">
                  <div className="comanda-table-badge">
                    <span>Mesa</span>
                    <strong>{mesa?.numero || '--'}</strong>
                  </div>
                  <button
                    className="comanda-new-button"
                    type="button"
                    onClick={() => setShowNewComanda((current) => !current)}
                    aria-expanded={showNewComanda}
                  >
                    {showNewComanda ? <X size={18} /> : <Plus size={18} />}
                    {showNewComanda ? 'Cancelar' : 'Nova comanda'}
                  </button>
                </header>

                {showNewComanda || comandas.length === 0 ? (
                  <form onSubmit={createComanda} className="comanda-create-form">
                    <label>
                      Nome do cliente
                      <input
                        autoFocus={showNewComanda}
                        placeholder="Digite seu nome"
                        value={nomeCliente}
                        onChange={(event) => setNomeCliente(event.target.value)}
                      />
                    </label>
                    <button type="submit" disabled={nomeCliente.trim().length < 2}>
                      <Plus size={18} /> Abrir comanda
                    </button>
                  </form>
                ) : null}

                {comandas.length > 1 ? (
                  <label className="comanda-selector">
                    Visualizando a comanda de
                    <select value={selectedComanda || ''} onChange={(event) => setSelectedComanda(Number(event.target.value))}>
                      {comandas.map((comanda) => (
                        <option key={comanda.id} value={comanda.id}>
                          {comanda.nome_cliente}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {comandaAtual ? (
                  <article className="client-comanda-card">
                    <header>
                      <div>
                        <ReceiptText size={20} />
                        <span>Comanda aberta</span>
                      </div>
                      <h1>{comandaAtual.nome_cliente}</h1>
                    </header>

                    <div className="comanda-items" aria-label="Itens da comanda">
                      {comandaItems.length > 0 ? comandaItems.map((item) => (
                        <div className="comanda-item-row" key={`${item.itemCardapioId}-${item.precoUnitario}`}>
                          <div>
                            <strong>{item.nome}</strong>
                            <small>{formatMoney(item.precoUnitario)} cada</small>
                          </div>
                          <span className="comanda-item-quantity">
                            <span aria-hidden="true">x</span> {item.quantidade}
                          </span>
                          <strong>{formatMoney(Number(item.precoUnitario) * Number(item.quantidade))}</strong>
                        </div>
                      )) : (
                        <div className="comanda-empty">
                          <ShoppingCart size={24} />
                          <strong>Sua comanda ainda está vazia</strong>
                          <span>Escolha os itens no cardápio para começar.</span>
                        </div>
                      )}
                    </div>

                    <footer className="comanda-total">
                      <span>Total</span>
                      <strong>{formatMoney(comandaAtual.total)}</strong>
                    </footer>

                    <div className="comanda-actions">
                      <button type="button" onClick={() => changeClientScreen('cardapio')}>
                        <Utensils size={18} /> Ver cardápio
                      </button>
                      {comandaItems.length > 0 ? (
                        <button
                          className="ghost"
                          type="button"
                          onClick={() => setMessage('Para fechar e pagar a comanda, solicite o atendimento do garçom.')}
                        >
                          <CreditCard size={18} /> Solicitar fechamento
                        </button>
                      ) : null}
                    </div>
                  </article>
                ) : (
                  <div className="comanda-welcome">
                    <ReceiptText size={30} />
                    <h1>Abra sua comanda</h1>
                    <p>Informe seu nome para acessar o cardápio e enviar pedidos.</p>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {clientScreen === 'cardapio' ? (
            <section className="client-menu-screen">
              <div className="menu-browser">
                <header className="menu-toolbar">
                  <div className="menu-title-row">
                    <h1>Cardápio</h1>
                    <span className="menu-table-badge">Mesa {mesa?.numero || '--'}</span>
                  </div>

                  <label className="menu-search">
                    <Search size={18} />
                    <input
                      aria-label="Buscar item no cardápio"
                      placeholder="Buscar item..."
                      value={menuSearch}
                      onChange={(event) => setMenuSearch(event.target.value)}
                    />
                  </label>

                  <div className="category-tabs" role="tablist" aria-label="Categorias do cardápio">
                    {menuCategories.map((category) => (
                      <button
                        key={category}
                        className={selectedCategory === category ? 'active' : ''}
                        role="tab"
                        type="button"
                        aria-selected={selectedCategory === category}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </header>

                <div className="menu-scroll">
                  {filteredMenu.length === 0 ? (
                    <div className="menu-empty">
                      <Search size={24} />
                      <p>Nenhum item encontrado.</p>
                    </div>
                  ) : null}
                  {filteredMenu.map((grupo) => (
                    <section key={grupo.categoria} className="menu-group">
                      {selectedCategory === 'Todos' ? <h2>{grupo.categoria}</h2> : null}
                      <div className="menu-list">
                        {grupo.itens.map((item) => {
                          const wasAdded = cartFeedback?.itemId === item.id;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              className={`menu-item-card ${wasAdded ? 'item-added' : ''}`}
                              aria-label={`Ver detalhes de ${item.nome}`}
                              onClick={() => openProductDetails(item)}
                            >
                              <div className={`menu-item-media ${item.imagem ? 'has-image' : ''}`} aria-hidden="true">
                                {item.imagem ? (
                                  <img src={item.imagem} alt="" />
                                ) : (
                                  <Utensils size={24} />
                                )}
                              </div>
                              <div className="menu-item-copy">
                                <h3>{item.nome}</h3>
                                <p>{item.descricao}</p>
                                <strong>{formatMoney(item.preco)}</strong>
                              </div>
                              <span
                                key={wasAdded ? cartFeedback.sequence : 'idle'}
                                className={`menu-add-button ${wasAdded ? 'added' : ''}`}
                                aria-hidden="true"
                              >
                                {wasAdded ? <Check size={19} /> : <Plus size={19} />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>

              <aside className={`menu-cart ${showMobileCart ? 'open' : ''} ${cartFeedback ? 'cart-updated' : ''}`}>
                <header>
                  <h2><ShoppingCart size={20} /> Seu pedido</h2>
                  <button
                    type="button"
                    className="cart-close"
                    aria-label="Fechar carrinho"
                    onClick={() => setShowMobileCart(false)}
                  >
                    <X size={20} />
                  </button>
                </header>
                <div className="menu-cart-items">
                  {cart.length === 0 ? <p className="muted">Seu carrinho está vazio.</p> : null}
                  {cart.map((item) => (
                    <div className="menu-cart-row" key={item.cartKey}>
                      <div>
                        <strong>{item.nome}</strong>
                        <small>{formatMoney(Number(item.preco) * item.quantidade)}</small>
                        {item.observacao ? <small>{item.observacao}</small> : null}
                      </div>
                      <div className="quantity-control">
                        <button
                          type="button"
                          aria-label={`Remover uma unidade de ${item.nome}`}
                          onClick={() => changeCartQuantity(item.cartKey, -1)}
                        >
                          <Minus size={15} />
                        </button>
                        <span>{item.quantidade}</span>
                        <button
                          type="button"
                          aria-label={`Adicionar uma unidade de ${item.nome}`}
                          onClick={() => changeCartQuantity(item.cartKey, 1)}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <footer>
                  <div className="total">
                    <span>Total</span>
                    <strong>{formatMoney(total)}</strong>
                  </div>
                  <button type="button" disabled={cart.length === 0} onClick={createPedido}>
                    Enviar pedido
                  </button>
                </footer>
              </aside>

              <button
                key={cartFeedback?.sequence || 'idle'}
                type="button"
                className={`mobile-cart-bar ${cartFeedback ? 'cart-updated' : ''}`}
                onClick={() => setShowMobileCart(true)}
              >
                <ShoppingCart size={19} />
                <span>Ver carrinho ({cartItemCount})</span>
                <strong>{formatMoney(total)}</strong>
              </button>
              <span className="sr-only" aria-live="polite">
                {cartFeedback ? `${cartFeedback.itemName} adicionado ao pedido.` : ''}
              </span>

              {productDetails ? (
                <div className="product-modal-backdrop" role="presentation">
                  <section
                    className="product-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="product-detail-title"
                  >
                    <div className={`product-hero ${productDetails.item.imagem ? 'has-image' : ''}`}>
                      {productDetails.item.imagem ? (
                        <img src={productDetails.item.imagem} alt={productDetails.item.nome} />
                      ) : (
                        <Utensils size={48} aria-hidden="true" />
                      )}
                      <button
                        type="button"
                        className="product-close"
                        aria-label="Fechar detalhes do produto"
                        onClick={() => setProductDetails(null)}
                      >
                        <X size={22} />
                      </button>
                    </div>

                    <div className="product-detail-scroll">
                      <header className="product-detail-header">
                        <div>
                          <span>{productDetails.item.categoria}</span>
                          <h2 id="product-detail-title">{productDetails.item.nome}</h2>
                        </div>
                        <strong>{formatMoney(productDetails.item.preco)}</strong>
                      </header>

                      {productDetails.item.descricao ? (
                        <p className="product-description">{productDetails.item.descricao}</p>
                      ) : null}

                      <section className="product-option-section">
                        <div>
                          <h3>Quantidade</h3>
                          <p>Escolha quantas unidades deseja adicionar.</p>
                        </div>
                        <div className="product-quantity">
                          <button
                            type="button"
                            aria-label="Diminuir quantidade"
                            disabled={productDetails.quantidade <= 1}
                            onClick={() =>
                              setProductDetails((current) => ({
                                ...current,
                                quantidade: current.quantidade - 1,
                              }))}
                          >
                            <Minus size={18} />
                          </button>
                          <strong>{productDetails.quantidade}</strong>
                          <button
                            type="button"
                            aria-label="Aumentar quantidade"
                            onClick={() =>
                              setProductDetails((current) => ({
                                ...current,
                                quantidade: current.quantidade + 1,
                              }))}
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </section>

                      <label className="product-observation">
                        Observações
                        <textarea
                          maxLength="240"
                          placeholder="Ex: sem cebola, ponto da carne..."
                          value={productDetails.observacao}
                          onChange={(event) =>
                            setProductDetails((current) => ({
                              ...current,
                              observacao: event.target.value,
                            }))}
                        />
                        <small>{productDetails.observacao.length}/240</small>
                      </label>
                    </div>

                    <footer className="product-modal-footer">
                      <button type="button" onClick={confirmProductDetails}>
                        Adicionar ao pedido
                        <strong>
                          {formatMoney(
                            Number(productDetails.item.preco) *
                              Number(productDetails.quantidade),
                          )}
                        </strong>
                      </button>
                    </footer>
                  </section>
                </div>
              ) : null}
            </section>
          ) : null}

          {clientScreen === 'pedidos' ? (
            <section className="client-orders-page">
              <header className="orders-page-header">
                <div>
                  <h1>Acompanhar pedidos</h1>
                  <span>Mesa {mesa?.numero || '--'}</span>
                </div>
                <button type="button" className="ghost" onClick={loadCliente}>
                  <RefreshCcw size={16} /> Atualizar
                </button>
              </header>

              {pedidos.length === 0 ? (
                <div className="orders-empty">
                  <ClipboardList size={30} />
                  <p>Nenhum pedido enviado nesta mesa.</p>
                </div>
              ) : null}

              <div className="client-orders-list">
                {pedidos.map((pedido) => (
                  <ClientOrderStatus
                    key={pedido.id}
                    pedido={pedido}
                    onDelete={async () => {
                      const confirmed = window.confirm(
                        `Excluir o pedido #${String(pedido.id).padStart(3, '0')}? Esta ação não poderá ser desfeita.`,
                      );

                      if (confirmed) {
                        await deletePedidoCliente(pedido.id);
                      }
                    }}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </section>
      ) : null}

      {isAdminRoute ? (
        <section className={isLoginRoute ? 'login-screen' : 'operation'}>
          {!user ? (
            <div className="login-card">
              {!showRecovery ? (
                <form className="stack login-form" onSubmit={submitLogin}>
                  <div className="login-brand">
                    <img
                      src="/comanda-x.png"
                      alt="Comanda X"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = '/comanda-x.jpeg';
                      }}
                    />
                  </div>
                  <label>
                    Usuário
                    <input
                      placeholder="Nome ou e-mail"
                      value={login.login}
                      onChange={(event) => setLogin({ ...login, login: event.target.value })}
                    />
                  </label>
                  <label>
                    Senha
                    <input
                      type="password"
                      placeholder="Sua senha"
                      value={login.senha}
                      onChange={(event) => setLogin({ ...login, senha: event.target.value })}
                    />
                  </label>
                  <button type="submit">Entrar</button>
                  <p className="login-recovery">
                    Esqueceu a senha?{' '}
                    <button type="button" className="link-button" onClick={() => setShowRecovery(true)}>
                      Recuperar
                    </button>
                  </p>
                </form>
              ) : (
                <form className="stack login-form" onSubmit={submitAdminRecovery}>
                  <div className="login-brand">
                    <img
                      src="/comanda-x.png"
                      alt="Comanda X"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = '/comanda-x.jpeg';
                      }}
                    />
                  </div>
                  <div className="login-copy">
                    <h1>Recuperar senha</h1>
                    <p>Informe os dados do gestor para redefinir o acesso</p>
                  </div>
                  <label>
                    Usuário
                    <input
                      placeholder="Login do gestor"
                      value={recoverAdmin.login}
                      onChange={(event) => setRecoverAdmin({ ...recoverAdmin, login: event.target.value })}
                    />
                  </label>
                  <label>
                    Código de recuperação
                    <input
                      placeholder="Código de recuperação"
                      type="password"
                      value={recoverAdmin.codigoRecuperacao}
                      onChange={(event) => setRecoverAdmin({ ...recoverAdmin, codigoRecuperacao: event.target.value })}
                    />
                  </label>
                  <label>
                    Nova senha
                    <input
                      placeholder="Nova senha"
                      type="password"
                      value={recoverAdmin.novaSenha}
                      onChange={(event) => setRecoverAdmin({ ...recoverAdmin, novaSenha: event.target.value })}
                    />
                  </label>
                  <button type="submit">Redefinir senha</button>
                  <button type="button" className="link-button" onClick={() => setShowRecovery(false)}>
                    Voltar ao login
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="operation-layout">
              <nav className="admin-nav" aria-label="Áreas administrativas">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      className={adminPage === item.id ? 'active' : ''}
                      type="button"
                      onClick={() => navigate(`/admin/${item.id}`)}
                    >
                      <Icon size={18} /> {item.label}
                    </button>
                  );
                })}
              </nav>

              <div className="operation-page">
                {!adminNavItems.some((item) => item.id === adminPage) ? (
                  <section className="admin-panel wide">
                    <h2>Sem permissão</h2>
                    <p className="muted">Seu perfil não possui acesso a esta área.</p>
                  </section>
                ) : null}

                {adminPage === 'pedidos' ? (
                  <div className="kanban">
                {['Na fila', 'Em preparo', 'Pronto'].map((status) => (
                  <section key={status} className="lane">
                    <h2>{status}</h2>
                    {operacao.filter((pedido) => pedido.status === status).map((pedido) => (
                      <article className="order-card" key={pedido.id}>
                        <strong>Mesa {pedido.mesa_numero} · #{pedido.id}</strong>
                        <span>{pedido.nome_cliente}</span>
                        <small>Há {formatDuration(pedido.tempo_status_atual_segundos)} em {pedido.status.toLowerCase()}</small>
                        <small>{pedido.itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ')}</small>
                        {canEditOrder(pedido, user) ? (
                          <button type="button" className="ghost" onClick={() => setEditingOrder(pedido)}>
                            Editar pedido
                          </button>
                        ) : null}
                        <StatusActions pedido={pedido} user={user} onChange={changeStatus} />
                      </article>
                    ))}
                  </section>
                ))}
                  </div>
                ) : null}

                {adminPage === 'comandas' && ['admin', 'garcom'].includes(user.perfil) ? (
                  <section className="comandas-page">
                    <aside className="lane accounts">
                  <form className="waiter-order" onSubmit={createComandaOperacao}>
                    <h2>Abrir comanda</h2>
                    <select
                      value={novaComandaOperacao.mesaToken}
                      onChange={(event) => setNovaComandaOperacao({ ...novaComandaOperacao, mesaToken: event.target.value })}
                    >
                      {mesasOperacao.map((mesaItem) => (
                        <option key={mesaItem.id} value={mesaItem.token_qr}>
                          Mesa {mesaItem.numero}
                        </option>
                      ))}
                    </select>
                    <input
                      placeholder="Nome ou apelido da comanda"
                      value={novaComandaOperacao.nomeCliente}
                      onChange={(event) => setNovaComandaOperacao({ ...novaComandaOperacao, nomeCliente: event.target.value })}
                    />
                    <button type="submit" disabled={!novaComandaOperacao.mesaToken || novaComandaOperacao.nomeCliente.trim().length < 2}>
                      Abrir comanda
                    </button>
                  </form>

                  <h2><CreditCard size={20} /> Comandas abertas</h2>
                  {comandasOperacao.length === 0 ? <p className="muted">Nenhuma comanda aberta.</p> : null}
                  {comandasOperacao.map((comanda) => (
                    <PaymentCard
                      key={comanda.id}
                      cardapio={cardapio}
                      comanda={comanda}
                      mesas={mesasOperacao}
                      user={user}
                      onCreateOrder={createPedidoOperacao}
                      onPay={registrarPagamento}
                      onTransfer={transferirComanda}
                    />
                  ))}
                    </aside>
                  </section>
                ) : null}

                {adminPage === 'relatorios' && user.perfil === 'admin' ? (
                  <SalesDashboard data={relatorioVendas} onRefresh={loadOperacao} />
                ) : null}

                {user.perfil === 'admin' && ['configuracoes', 'garcons', 'mesas', 'cardapios'].includes(adminPage) ? (
                  <section className="admin-panels single-page">
                    {adminPage === 'configuracoes' ? (
                      <form className="password-reset admin-panel" onSubmit={resetPassword}>
                    <h2>Redefinir senha</h2>
                    <input
                      type="email"
                      placeholder="E-mail do usuário"
                      value={passwordReset.email}
                      onChange={(event) => setPasswordReset({ ...passwordReset, email: event.target.value })}
                    />
                    <input
                      type="password"
                      placeholder="Nova senha"
                      value={passwordReset.novaSenha}
                      onChange={(event) => setPasswordReset({ ...passwordReset, novaSenha: event.target.value })}
                    />
                    <button type="submit">Redefinir senha</button>
                      </form>
                    ) : null}

                    {adminPage === 'garcons' ? (
                      <section className="staff-manager admin-panel">
                    <h2>Gerenciar garçons</h2>
                    <form className="waiter-order" onSubmit={saveGarcom}>
                      <input
                        placeholder="Nome do garçom"
                        value={garcomForm.nome}
                        onChange={(event) => setGarcomForm({ ...garcomForm, nome: event.target.value })}
                      />
                      <input
                        type="email"
                        placeholder="E-mail"
                        value={garcomForm.email}
                        onChange={(event) => setGarcomForm({ ...garcomForm, email: event.target.value })}
                      />
                      <input
                        type="password"
                        placeholder={garcomForm.id ? 'Nova senha opcional' : 'Senha inicial'}
                        value={garcomForm.senha}
                        onChange={(event) => setGarcomForm({ ...garcomForm, senha: event.target.value })}
                      />
                      <button
                        type="submit"
                        disabled={
                          garcomForm.nome.trim().length < 2 ||
                          !garcomForm.email ||
                          (!garcomForm.id && garcomForm.senha.length < 6)
                        }
                      >
                        {garcomForm.id ? 'Salvar garçom' : 'Criar garçom'}
                      </button>
                      {garcomForm.id ? (
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => setGarcomForm({ id: null, nome: '', email: '', senha: '' })}
                        >
                          Cancelar edição
                        </button>
                      ) : null}
                    </form>

                    {garcons.map((garcom) => (
                      <article className="staff-card" key={garcom.id}>
                        <div>
                          <strong>{garcom.nome}</strong>
                          <small>{garcom.email}</small>
                          <span className={`status ${garcom.ativo ? 'pronto' : 'entregue'}`}>
                            {garcom.ativo ? 'Ativo' : 'Excluído'}
                          </span>
                        </div>
                        <div className="staff-actions">
                          <button type="button" className="ghost" onClick={() => editGarcom(garcom)}>
                            Editar
                          </button>
                          <button type="button" disabled={!garcom.ativo} onClick={() => deleteGarcom(garcom)}>
                            Excluir
                          </button>
                        </div>
                      </article>
                    ))}
                      </section>
                    ) : null}

                    {adminPage === 'mesas' ? (
                      <section className="staff-manager admin-panel">
                    <h2>Gerenciar mesas</h2>
                    <form className="waiter-order" onSubmit={saveMesa}>
                      <input
                        min="1"
                        placeholder="Número da mesa"
                        type="number"
                        value={mesaForm.numero}
                        onChange={(event) => setMesaForm({ ...mesaForm, numero: event.target.value })}
                      />
                      <select
                        value={mesaForm.status}
                        onChange={(event) => setMesaForm({ ...mesaForm, status: event.target.value })}
                      >
                        <option value="ativa">Ativa</option>
                        <option value="inativa">Inativa</option>
                      </select>
                      <button type="submit" disabled={!mesaForm.numero || Number(mesaForm.numero) < 1}>
                        {mesaForm.id ? 'Salvar mesa' : 'Criar mesa'}
                      </button>
                      {mesaForm.id ? (
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => setMesaForm({ id: null, numero: '', status: 'ativa' })}
                        >
                          Cancelar edição
                        </button>
                      ) : null}
                    </form>

                    {mesasOperacao.map((mesaItem) => (
                      <article className="staff-card" key={mesaItem.id}>
                        <div>
                          <strong>Mesa {mesaItem.numero}</strong>
                          <small>{mesaItem.token_qr}</small>
                          <span className={`status ${mesaItem.status === 'ativa' ? 'pronto' : 'entregue'}`}>
                            {mesaItem.status === 'ativa' ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                        <div className="staff-actions">
                          <button type="button" className="ghost" onClick={() => editMesa(mesaItem)}>
                            Editar
                          </button>
                          <button type="button" disabled={mesaItem.status !== 'ativa'} onClick={() => deleteMesa(mesaItem)}>
                            Excluir
                          </button>
                        </div>
                      </article>
                    ))}
                      </section>
                    ) : null}

                    {adminPage === 'cardapios' ? (
                      <section className="staff-manager admin-panel">
                    <h2>Gerenciar cardápios</h2>
                    <form className="waiter-order" onSubmit={saveCardapio}>
                      <input
                        placeholder="Nome do cardápio"
                        value={cardapioForm.nome}
                        onChange={(event) => setCardapioForm({ ...cardapioForm, nome: event.target.value })}
                      />
                      <label className="check-row">
                        <input
                          checked={cardapioForm.ativo}
                          type="checkbox"
                          onChange={(event) => setCardapioForm({ ...cardapioForm, ativo: event.target.checked })}
                        />
                        Ativo
                      </label>
                      <button type="submit" disabled={cardapioForm.nome.trim().length < 2}>
                        {cardapioForm.id ? 'Salvar cardápio' : 'Criar cardápio'}
                      </button>
                    </form>

                    {cardapiosAdmin.map((cardapioItem) => (
                      <article className="staff-card" key={cardapioItem.id}>
                        <div>
                          <strong>{cardapioItem.nome}</strong>
                          <span className={`status ${cardapioItem.ativo ? 'pronto' : 'entregue'}`}>
                            {cardapioItem.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <div className="staff-actions">
                          <button type="button" className="ghost" onClick={() => setCardapioForm(cardapioItem)}>
                            Editar
                          </button>
                          <button type="button" onClick={() => deleteCardapioAdmin(cardapioItem)}>
                            Excluir
                          </button>
                        </div>
                      </article>
                    ))}
                      </section>
                    ) : null}

                    {adminPage === 'cardapios' ? (
                      <section className="staff-manager admin-panel wide">
                    <h2>Itens do cardápio</h2>
                    <form className="waiter-order" onSubmit={saveItemCardapio}>
                      <input
                        placeholder="Nome do item"
                        value={itemForm.nome}
                        onChange={(event) => setItemForm({ ...itemForm, nome: event.target.value })}
                      />
                      <input
                        placeholder="Descrição"
                        value={itemForm.descricao}
                        onChange={(event) => setItemForm({ ...itemForm, descricao: event.target.value })}
                      />
                      <div className="item-image-field">
                        <label className="image-picker">
                          <ImagePlus size={18} />
                          {itemForm.imagem ? 'Trocar foto' : 'Adicionar foto'}
                          <input
                            accept="image/jpeg,image/png,image/webp"
                            type="file"
                            onChange={selectItemImage}
                          />
                        </label>
                        {itemForm.imagem ? (
                          <div className="item-image-preview">
                            <img src={itemForm.imagem} alt="Prévia do item" />
                            <button
                              type="button"
                              className="ghost"
                              onClick={() => setItemForm({ ...itemForm, imagem: '' })}
                            >
                              <Trash2 size={17} /> Remover foto
                            </button>
                          </div>
                        ) : null}
                      </div>
                      <input
                        inputMode="decimal"
                        min="0"
                        placeholder="Preço"
                        step="0.01"
                        type="number"
                        value={itemForm.preco}
                        onChange={(event) => setItemForm({ ...itemForm, preco: event.target.value })}
                      />
                      <input
                        placeholder="Categoria"
                        value={itemForm.categoria}
                        onChange={(event) => setItemForm({ ...itemForm, categoria: event.target.value })}
                      />
                      <select
                        value={itemForm.cardapioId}
                        onChange={(event) => setItemForm({ ...itemForm, cardapioId: event.target.value })}
                      >
                        <option value="">Sem vínculo inicial</option>
                        {cardapiosAdmin.map((cardapioItem) => (
                          <option key={cardapioItem.id} value={cardapioItem.id}>
                            {cardapioItem.nome}
                          </option>
                        ))}
                      </select>
                      <label className="check-row">
                        <input
                          checked={itemForm.disponivel}
                          type="checkbox"
                          onChange={(event) => setItemForm({ ...itemForm, disponivel: event.target.checked })}
                        />
                        Disponível
                      </label>
                      <button
                        type="submit"
                        disabled={itemForm.nome.trim().length < 2 || itemForm.categoria.trim().length < 2 || !itemForm.preco}
                      >
                        {itemForm.id ? 'Salvar item' : 'Criar item'}
                      </button>
                      {itemForm.id ? (
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => setItemForm({ id: null, nome: '', descricao: '', imagem: '', preco: '', categoria: '', disponivel: true, cardapioId: itemForm.cardapioId })}
                        >
                          Cancelar edição
                        </button>
                      ) : null}
                    </form>

                    <div className="items-admin-grid">
                      {itensAdmin.map((item) => (
                        <article className="staff-card" key={item.id}>
                          {item.imagem ? <img className="staff-item-image" src={item.imagem} alt="" /> : null}
                          <div>
                            <strong>{item.nome}</strong>
                            <small>{item.categoria} · {formatMoney(item.preco)}</small>
                            <span className={`status ${item.disponivel ? 'pronto' : 'entregue'}`}>
                              {item.disponivel ? 'Disponível' : 'Indisponível'}
                            </span>
                          </div>
                          <div className="staff-actions">
                            <button
                              type="button"
                              className="ghost"
                              onClick={() => setItemForm({ ...item, cardapioId: itemForm.cardapioId })}
                            >
                              Editar
                            </button>
                            <button type="button" onClick={() => deleteItemCardapio(item)}>
                              Excluir
                            </button>
                          </div>
                          {cardapiosAdmin.length > 0 ? (
                            <div className="link-grid">
                              {cardapiosAdmin.map((cardapioItem) => {
                                const linked = cardapioItem.item_ids?.map(Number).includes(Number(item.id));
                                return (
                                  <label className="check-row" key={`${cardapioItem.id}-${item.id}`}>
                                    <input
                                      checked={linked}
                                      type="checkbox"
                                      onChange={(event) => toggleItemVinculo(cardapioItem.id, item.id, event.target.checked)}
                                    />
                                    {cardapioItem.nome}
                                  </label>
                                );
                              })}
                            </div>
                          ) : null}
                        </article>
                      ))}
                    </div>
                      </section>
                    ) : null}
                  </section>
                ) : null}

                {adminPage === 'cardapios' && ['garcom', 'cozinha'].includes(user.perfil) ? (
                  <section className="admin-panels single-page">
                  <section className="staff-manager admin-panel wide">
                    <h2>Cardápios da operação</h2>
                    {cardapiosAdmin.map((cardapioItem) => (
                      <article className="staff-card" key={cardapioItem.id}>
                        <div>
                          <strong>{cardapioItem.nome}</strong>
                          <span className={`status ${cardapioItem.ativo ? 'pronto' : 'entregue'}`}>
                            {cardapioItem.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <button type="button" className="ghost" onClick={() => toggleCardapioStatus(cardapioItem)}>
                          {cardapioItem.ativo ? 'Inativar cardápio' : 'Ativar cardápio'}
                        </button>
                      </article>
                    ))}
                  </section>

                  <section className="staff-manager admin-panel wide">
                    <h2>Itens do cardápio</h2>
                    <div className="items-admin-grid">
                      {itensAdmin.map((item) => (
                        <article className="staff-card" key={item.id}>
                          <div>
                            <strong>{item.nome}</strong>
                            <small>{item.categoria} · {formatMoney(item.preco)}</small>
                            <span className={`status ${item.disponivel ? 'pronto' : 'entregue'}`}>
                              {item.disponivel ? 'Disponível' : 'Indisponível'}
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                </section>
              ) : null}
              </div>
            </div>
          )}
        </section>
      ) : null}

      {route.type === 'home' ? (
        <section className="empty-route">
          <button type="button" onClick={() => navigate(`/${fallbackMesaToken}`)}>Abrir mesa de exemplo</button>
          <button type="button" className="ghost" onClick={() => navigate('/admin')}>Acessar operação</button>
        </section>
      ) : null}

      {orderConfirmation ? (
        <div className="modal-backdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="order-confirmation-title">
            <h2 id="order-confirmation-title">{orderConfirmation.title}</h2>
            <p>{orderConfirmation.text}</p>
            <button type="button" onClick={() => {
              setOrderConfirmation(null);
              setClientScreen('pedidos');
            }}>
              OK
            </button>
          </section>
        </div>
      ) : null}

      {editingOrder ? (
        <div className="modal-backdrop order-edit-backdrop" role="presentation">
          <section className="order-edit-modal" role="dialog" aria-modal="true" aria-labelledby="order-edit-title">
            <OrderEditForm
              cardapio={cardapio}
              pedido={editingOrder}
              onCancel={() => setEditingOrder(null)}
              onDelete={async (pedidoId) => {
                await deletePedidoOperacao(pedidoId);
                setEditingOrder(null);
              }}
              onSave={async (pedidoId, itens) => {
                await updatePedidoOperacao(pedidoId, itens);
                setEditingOrder(null);
              }}
            />
          </section>
        </div>
      ) : null}
    </main>
  );
}

function ClientOrderStatus({ pedido, onDelete }) {
  const stages = [
    { status: 'Na fila', label: 'Pedido recebido' },
    { status: 'Em preparo', label: 'Em preparo' },
    { status: 'Pronto', label: 'Pronto' },
    { status: 'Entregue', label: 'Entregue na mesa' },
  ];
  const currentIndex = stages.findIndex((stage) => stage.status === pedido.status);
  const orderTotal = pedido.itens.reduce(
    (sum, item) => sum + Number(item.precoUnitario || 0) * Number(item.quantidade),
    0,
  );
  const firstStatus = pedido.tempos_status?.[0];
  const totalElapsed = firstStatus
    ? Math.max(0, Math.floor((Date.now() - new Date(firstStatus.iniciadoEm).getTime()) / 1000))
    : pedido.tempo_status_atual_segundos;

  return (
    <article className="client-order-status">
      <header className="client-order-header">
        <div>
          <h2>Pedido #{String(pedido.id).padStart(3, '0')}</h2>
          <span>{pedido.nome_cliente}</span>
        </div>
        <span className={`status ${slug(pedido.status)}`}>{pedido.status}</span>
      </header>

      <div className="order-time-summary">
        <Clock3 size={18} />
        <span>Em andamento há {formatDuration(totalElapsed)}</span>
      </div>

      <div className="order-timeline">
        {stages.map((stage, index) => {
          const history = pedido.tempos_status?.find((entry) => entry.status === stage.status);
          const completed = index < currentIndex;
          const current = index === currentIndex;

          return (
            <div
              className={`timeline-step ${completed ? 'completed' : ''} ${current ? 'current' : ''}`}
              key={stage.status}
            >
              <div className="timeline-marker" aria-hidden="true">
                {completed ? <Check size={14} /> : null}
              </div>
              <div>
                <strong>{stage.label}</strong>
                <small>
                  {history
                    ? formatStatusTime(history.iniciadoEm)
                    : current
                      ? 'Aguardando...'
                      : '—'}
                </small>
              </div>
            </div>
          );
        })}
      </div>

      <section className="order-items-summary">
        <h3>Itens do pedido</h3>
        {pedido.itens.map((item, index) => (
          <div key={`${pedido.id}-${item.itemCardapioId}-${index}`}>
            <span>{item.quantidade}× {item.nome}</span>
            <strong>{formatMoney(Number(item.precoUnitario || 0) * Number(item.quantidade))}</strong>
          </div>
        ))}
        <div className="order-items-total">
          <span>Total</span>
          <strong>{formatMoney(orderTotal)}</strong>
        </div>
      </section>

      {pedido.status === 'Na fila' ? (
        <button type="button" className="danger-button order-status-delete" onClick={onDelete}>
          <Trash2 size={18} /> Excluir pedido
        </button>
      ) : null}
    </article>
  );
}

function SalesDashboard({ data, onRefresh }) {
  if (!data) {
    return (
      <section className="analytics-empty">
        <p className="muted">Carregando estatísticas de vendas...</p>
      </section>
    );
  }

  const maxDailySale = Math.max(...data.vendasUltimosSeteDias.map((day) => Number(day.total)), 1);
  const maxItemQuantity = Math.max(...data.itensMaisVendidos.map((item) => Number(item.quantidade)), 1);

  return (
    <section className="analytics-page">
      <header className="page-heading">
        <div>
          <h1>Estatísticas de vendas</h1>
          <p>Resumo das vendas confirmadas e do desempenho diário.</p>
        </div>
        <button type="button" className="ghost" onClick={onRefresh}>
          <RefreshCcw size={16} /> Atualizar
        </button>
      </header>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Vendas de hoje</span>
          <strong>{formatMoney(data.resumo.totalVendas)}</strong>
          <small>Pagamentos confirmados</small>
        </article>
        <article className="metric-card">
          <span>Ticket médio</span>
          <strong>{formatMoney(data.resumo.ticketMedio)}</strong>
          <small>Por comanda fechada</small>
        </article>
        <article className="metric-card">
          <span>Comandas fechadas</span>
          <strong>{data.resumo.comandasFechadas}</strong>
          <small>No dia de hoje</small>
        </article>
        <article className="metric-card">
          <span>Itens vendidos</span>
          <strong>{data.resumo.itensVendidos}</strong>
          <small>Quantidade total no dia</small>
        </article>
      </div>

      <div className="analytics-grid">
        <section className="analytics-panel analytics-wide">
          <h2>Vendas nos últimos 7 dias</h2>
          <div className="sales-chart">
            {data.vendasUltimosSeteDias.map((day) => (
              <div className="chart-column" key={day.data}>
                <strong>{formatMoney(day.total)}</strong>
                <div className="chart-track">
                  <span style={{ height: `${Math.max((Number(day.total) / maxDailySale) * 100, 3)}%` }} />
                </div>
                <small>{day.label}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-panel">
          <h2>Itens mais vendidos hoje</h2>
          {data.itensMaisVendidos.length === 0 ? <p className="muted">Nenhum item vendido hoje.</p> : null}
          <div className="ranking-list">
            {data.itensMaisVendidos.map((item, index) => (
              <div className="ranking-row" key={item.id}>
                <span className="ranking-position">{index + 1}</span>
                <div>
                  <strong>{item.nome}</strong>
                  <small>{item.categoria} · {item.quantidade} unidades</small>
                  <div className="ranking-track">
                    <span style={{ width: `${(Number(item.quantidade) / maxItemQuantity) * 100}%` }} />
                  </div>
                </div>
                <strong>{formatMoney(item.total)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-panel">
          <h2>Mesas com maior venda</h2>
          {data.mesasDestaque.length === 0 ? <p className="muted">Nenhuma mesa fechada hoje.</p> : null}
          <div className="summary-list">
            {data.mesasDestaque.map((table) => (
              <div className="summary-row" key={table.mesa}>
                <span>Mesa {table.mesa}</span>
                <small>{table.comandas} {table.comandas === 1 ? 'comanda' : 'comandas'}</small>
                <strong>{formatMoney(table.total)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-panel">
          <h2>Formas de pagamento</h2>
          {data.formasPagamento.length === 0 ? <p className="muted">Nenhum pagamento confirmado hoje.</p> : null}
          <div className="summary-list">
            {data.formasPagamento.map((payment) => (
              <div className="summary-row" key={payment.forma}>
                <span>{formatPaymentMethod(payment.forma)}</span>
                <strong>{formatMoney(payment.total)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-panel analytics-wide">
          <h2>Últimas vendas</h2>
          {data.ultimasVendas.length === 0 ? <p className="muted">Ainda não há vendas registradas.</p> : null}
          <div className="sales-table">
            {data.ultimasVendas.map((sale) => (
              <div className="sales-table-row" key={sale.id}>
                <div>
                  <strong>Mesa {sale.mesa} · {sale.cliente}</strong>
                  <small>{formatDateTime(sale.criadoEm)}</small>
                </div>
                <span>{formatPaymentMethod(sale.formaPagamento)}</span>
                <strong>{formatMoney(sale.valor)}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function PaymentCard({ cardapio, comanda, mesas, user, onCreateOrder, onPay, onTransfer }) {
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [mesaDestinoId, setMesaDestinoId] = useState('');
  const itensCardapio = cardapio.flatMap((grupo) => grupo.itens);
  const [pedido, setPedido] = useState({
    itemCardapioId: itensCardapio[0]?.id || '',
    quantidade: 1,
  });
  const canPay = ['admin', 'garcom'].includes(user.perfil) && Number(comanda.total) > 0;

  useEffect(() => {
    if (!pedido.itemCardapioId && itensCardapio[0]) {
      setPedido((current) => ({ ...current, itemCardapioId: itensCardapio[0].id }));
    }
  }, [itensCardapio, pedido.itemCardapioId]);

  return (
    <article className="order-card">
      <strong>Mesa {comanda.mesa_numero} · {comanda.nome_cliente}</strong>
      <div className="total">
        <span>Total</span>
        <strong>{formatMoney(comanda.total)}</strong>
      </div>
      <form
        className="waiter-order"
        onSubmit={(event) => {
          event.preventDefault();
          onCreateOrder({
            comandaId: comanda.id,
            itemCardapioId: pedido.itemCardapioId,
            quantidade: Number(pedido.quantidade),
          });
          setPedido({ ...pedido, quantidade: 1 });
        }}
      >
        <select
          value={pedido.itemCardapioId}
          onChange={(event) => setPedido({ ...pedido, itemCardapioId: event.target.value })}
        >
          <option value="">Selecionar item</option>
          {itensCardapio.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nome} · {formatMoney(item.preco)}
            </option>
          ))}
        </select>
        <input
          min="1"
          type="number"
          value={pedido.quantidade}
          onChange={(event) => setPedido({ ...pedido, quantidade: event.target.value })}
        />
        <button type="submit" disabled={!pedido.itemCardapioId}>
          Lançar pedido
        </button>
      </form>
      <select value={formaPagamento} onChange={(event) => setFormaPagamento(event.target.value)}>
        <option value="pix">Pix</option>
        <option value="cartao_debito">Cartão de débito</option>
        <option value="cartao_credito">Cartão de crédito</option>
        <option value="dinheiro">Dinheiro</option>
      </select>
      <button type="button" disabled={!canPay} onClick={() => onPay(comanda, formaPagamento)}>
        Confirmar pagamento
      </button>
      {['admin', 'garcom'].includes(user.perfil) ? (
        <form
          className="waiter-order"
          onSubmit={(event) => {
            event.preventDefault();
            onTransfer(comanda, mesaDestinoId);
            setMesaDestinoId('');
          }}
        >
          <strong>Transferir comanda</strong>
          <select value={mesaDestinoId} onChange={(event) => setMesaDestinoId(event.target.value)}>
            <option value="">Mesa de destino</option>
            {mesas
              .filter((mesa) => mesa.status === 'ativa' && Number(mesa.id) !== Number(comanda.mesa_id))
              .map((mesa) => (
                <option key={mesa.id} value={mesa.id}>
                  Mesa {mesa.numero}
                </option>
              ))}
          </select>
          <button type="submit" disabled={!mesaDestinoId}>
            Transferir
          </button>
        </form>
      ) : null}
    </article>
  );
}

function OrderEditForm({ cardapio, pedido, onCancel, onDelete, onSave }) {
  const itensCardapio = cardapio.flatMap((grupo) => grupo.itens);
  const firstItemId = itensCardapio[0]?.id || '';
  const [itens, setItens] = useState(
    pedido.itens.length > 0
      ? pedido.itens.map((item) => ({
          itemCardapioId: item.itemCardapioId || firstItemId,
          quantidade: item.quantidade,
        }))
      : [{ itemCardapioId: firstItemId, quantidade: 1 }],
  );
  const orderTotal = itens.reduce((sum, item) => {
    const cardapioItem = itensCardapio.find(
      (entry) => Number(entry.id) === Number(item.itemCardapioId),
    );
    return sum + Number(cardapioItem?.preco || 0) * Number(item.quantidade);
  }, 0);

  function updateItem(index, field, value) {
    setItens((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    );
  }

  function removeItem(index) {
    setItens((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <form
      className="order-edit"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(
          pedido.id,
          itens.map((item) => ({
            itemCardapioId: item.itemCardapioId,
            quantidade: Number(item.quantidade),
          })),
        );
      }}
    >
      <header className="order-edit-header">
        <div>
          <h2 id="order-edit-title">Editar pedido #{pedido.id}</h2>
          <span>{pedido.mesa_numero ? `Mesa ${pedido.mesa_numero}` : pedido.nome_cliente}</span>
        </div>
        <button type="button" className="order-edit-close" aria-label="Fechar edição" onClick={onCancel}>
          <X size={21} />
        </button>
      </header>

      <div className="order-edit-scroll">
        <div className="order-edit-items">
          {itens.map((item, index) => {
            const cardapioItem = itensCardapio.find(
              (entry) => Number(entry.id) === Number(item.itemCardapioId),
            );

            return (
              <article className="order-edit-item" key={`${pedido.id}-${index}`}>
                <div className={`order-edit-image ${cardapioItem?.imagem ? 'has-image' : ''}`}>
                  {cardapioItem?.imagem ? (
                    <img src={cardapioItem.imagem} alt="" />
                  ) : (
                    <Utensils size={24} />
                  )}
                </div>
                <div className="order-edit-item-content">
                  <select
                    aria-label={`Item ${index + 1}`}
                    value={item.itemCardapioId}
                    onChange={(event) => updateItem(index, 'itemCardapioId', event.target.value)}
                  >
                    {itensCardapio.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.nome}
                      </option>
                    ))}
                  </select>
                  <strong>{formatMoney(Number(cardapioItem?.preco || 0) * Number(item.quantidade))}</strong>
                  <div className="order-edit-item-actions">
                    <div className="quantity-control">
                      <button
                        type="button"
                        aria-label="Diminuir quantidade"
                        disabled={Number(item.quantidade) <= 1}
                        onClick={() => updateItem(index, 'quantidade', Number(item.quantidade) - 1)}
                      >
                        <Minus size={15} />
                      </button>
                      <span>{item.quantidade}</span>
                      <button
                        type="button"
                        aria-label="Aumentar quantidade"
                        onClick={() => updateItem(index, 'quantidade', Number(item.quantidade) + 1)}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                    <button type="button" className="order-item-remove" onClick={() => removeItem(index)}>
                      <Trash2 size={16} /> Remover
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          className="ghost order-add-item"
          disabled={!firstItemId}
          onClick={() => setItens((current) => [...current, { itemCardapioId: firstItemId, quantidade: 1 }])}
        >
          <Plus size={17} /> Adicionar outro item
        </button>

        <div className="order-edit-summary">
          <div>
            <span>Itens</span>
            <strong>{itens.reduce((sum, item) => sum + Number(item.quantidade), 0)}</strong>
          </div>
          <div className="order-edit-total">
            <span>Total</span>
            <strong>{formatMoney(orderTotal)}</strong>
          </div>
        </div>

        <button
          type="button"
          className="danger-button order-delete-button"
          onClick={() => {
            if (window.confirm(`Excluir o pedido #${pedido.id}? Esta ação não pode ser desfeita.`)) {
              onDelete(pedido.id);
            }
          }}
        >
          <Trash2 size={18} /> Excluir pedido
        </button>
      </div>

      <footer className="order-edit-footer">
        <button
          type="submit"
          disabled={
            itens.length === 0 ||
            itens.some((item) => !item.itemCardapioId || Number(item.quantidade) < 1)
          }
        >
          Salvar alterações
          <strong>{formatMoney(orderTotal)}</strong>
        </button>
        <button type="button" className="link-button" onClick={onCancel}>
          Voltar sem salvar
        </button>
      </footer>
    </form>
  );
}

function StatusActions({ pedido, user, onChange }) {
  const map = {
    cozinha: { 'Na fila': 'Em preparo', 'Em preparo': 'Pronto' },
    garcom: { Pronto: 'Entregue' },
    admin: { 'Na fila': 'Em preparo', 'Em preparo': 'Pronto', Pronto: 'Entregue' },
  };
  const next = map[user.perfil]?.[pedido.status];

  if (!next) return null;

  return <button type="button" onClick={() => onChange(pedido, next)}>Mover para {next}</button>;
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

function formatMoney(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatStatusTime(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
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

function formatPaymentMethod(value) {
  const labels = {
    cartao_credito: 'Cartão de crédito',
    cartao_debito: 'Cartão de débito',
    dinheiro: 'Dinheiro',
    pix: 'Pix',
  };

  return labels[value] || value || 'Não informado';
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

async function optimizeMenuImage(file) {
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!supportedTypes.includes(file.type)) {
    throw new Error('Selecione uma imagem JPG, PNG ou WebP.');
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error('A imagem original deve ter no máximo 8 MB.');
  }

  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const maxDimension = 1200;
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  const optimized = canvas.toDataURL('image/webp', 0.82);

  if (optimized.length > 2_500_000) {
    throw new Error('Não foi possível reduzir a foto. Escolha uma imagem menor.');
  }

  return optimized;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('O arquivo selecionado não é uma imagem válida.'));
    image.src = source;
  });
}

function slug(value) {
  return value.toLowerCase().replaceAll(' ', '-');
}

function readStoredUser() {
  const raw = localStorage.getItem('comandax_user');

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem('comandax_user');
    localStorage.removeItem('comandax_token');
    return null;
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getRouteFromPath() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');

  if (path === 'admin' || path === 'admin/login') {
    return { type: 'admin', adminPage: 'pedidos' };
  }

  if (path.startsWith('admin/')) {
    return { type: 'admin', adminPage: path.split('/')[1] || 'pedidos' };
  }

  if (!path) {
    return { type: 'home' };
  }

  return { type: 'cliente', mesaToken: path };
}
