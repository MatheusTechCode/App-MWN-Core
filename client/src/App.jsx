import { ChefHat, ClipboardList, LogIn, Plus, ReceiptText, RefreshCcw, Utensils } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

const defaultMesaToken = new URLSearchParams(window.location.search).get('mesa') || 'mwn_qr_a8F3kP7xQ2L9';

export function App() {
  const [view, setView] = useState('cliente');
  const [mesaToken, setMesaToken] = useState(defaultMesaToken);
  const [mesa, setMesa] = useState(null);
  const [cardapio, setCardapio] = useState([]);
  const [comandas, setComandas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [operacao, setOperacao] = useState([]);
  const [selectedComanda, setSelectedComanda] = useState(null);
  const [cart, setCart] = useState([]);
  const [nomeCliente, setNomeCliente] = useState('');
  const [login, setLogin] = useState({ email: '', senha: '' });
  const [user, setUser] = useState(readStoredUser);
  const [message, setMessage] = useState('');

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
    setOperacao(asArray(await api('/pedidos/operacao')));
  }

  useEffect(() => {
    loadCliente().catch((error) => setMessage(error.message));
  }, [mesaToken]);

  useEffect(() => {
    if (view !== 'cliente') return undefined;
    const timer = setInterval(() => loadCliente().catch(() => {}), 5000);
    return () => clearInterval(timer);
  }, [view, mesaToken]);

  useEffect(() => {
    if (view !== 'operacao') return undefined;
    loadOperacao().catch((error) => setMessage(error.message));
    const timer = setInterval(() => loadOperacao().catch(() => {}), 5000);
    return () => clearInterval(timer);
  }, [view, user]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.preco) * item.quantidade, 0),
    [cart],
  );

  function addToCart(item) {
    setCart((current) => {
      const existing = current.find((entry) => entry.itemCardapioId === item.id);
      if (existing) {
        return current.map((entry) =>
          entry.itemCardapioId === item.id ? { ...entry, quantidade: entry.quantidade + 1 } : entry,
        );
      }

      return [...current, { itemCardapioId: item.id, nome: item.nome, preco: item.preco, quantidade: 1 }];
    });
  }

  async function createComanda(event) {
    event.preventDefault();
    const nova = await api('/comandas', {
      method: 'POST',
      body: JSON.stringify({ mesaToken, nomeCliente }),
    });
    localStorage.setItem(`comandax_codigo_${nova.id}`, nova.codigo_cliente);
    setNomeCliente('');
    setSelectedComanda(nova.id);
    setMessage('Comanda criada com sucesso.');
    await loadCliente();
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
    setMessage('Pedido enviado para a cozinha.');
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
    setLogin({ email: '', senha: '' });
    setMessage(`Bem-vindo, ${result.usuario.nome}.`);
    await loadOperacao();
  }

  async function changeStatus(pedido, status) {
    await api(`/pedidos/${pedido.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await loadOperacao();
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <strong>ComandaX</strong>
          <span>MWN CORE</span>
        </div>
        <nav aria-label="Navegação principal">
          <button className={view === 'cliente' ? 'active' : ''} onClick={() => setView('cliente')}>
            <Utensils size={18} /> Cliente
          </button>
          <button className={view === 'operacao' ? 'active' : ''} onClick={() => setView('operacao')}>
            <ChefHat size={18} /> Operação
          </button>
        </nav>
      </header>

      {message && <p className="notice">{message}</p>}

      {view === 'cliente' ? (
        <section className="layout">
          <aside className="panel">
            <label>
              Token da mesa
              <input value={mesaToken} onChange={(event) => setMesaToken(event.target.value)} />
            </label>
            <div className="mesa-box">
              <span>Mesa</span>
              <strong>{mesa?.numero || '--'}</strong>
            </div>

            <form onSubmit={createComanda} className="stack">
              <label>
                Nova comanda
                <input
                  placeholder="Nome do cliente"
                  value={nomeCliente}
                  onChange={(event) => setNomeCliente(event.target.value)}
                />
              </label>
              <button type="submit">
                <Plus size={18} /> Criar
              </button>
            </form>

            <label>
              Comanda atual
              <select value={selectedComanda || ''} onChange={(event) => setSelectedComanda(Number(event.target.value))}>
                <option value="">Selecione</option>
                {comandas.map((comanda) => (
                  <option key={comanda.id} value={comanda.id}>
                    {comanda.nome_cliente}
                  </option>
                ))}
              </select>
            </label>
          </aside>

          <section className="menu-area">
            {cardapio.map((grupo) => (
              <div key={grupo.categoria} className="menu-group">
                <h2>{grupo.categoria}</h2>
                <div className="grid">
                  {grupo.itens.map((item) => (
                    <article className="item-card" key={item.id}>
                      <div>
                        <h3>{item.nome}</h3>
                        <p>{item.descricao}</p>
                        <strong>{formatMoney(item.preco)}</strong>
                      </div>
                      <button type="button" aria-label={`Adicionar ${item.nome}`} onClick={() => addToCart(item)}>
                        <Plus size={18} />
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <aside className="panel">
            <h2><ReceiptText size={20} /> Pedido</h2>
            {cart.length === 0 ? <p className="muted">Carrinho vazio.</p> : null}
            {cart.map((item) => (
              <div className="cart-row" key={item.itemCardapioId}>
                <span>{item.quantidade}x {item.nome}</span>
                <strong>{formatMoney(Number(item.preco) * item.quantidade)}</strong>
              </div>
            ))}
            <div className="total">
              <span>Total</span>
              <strong>{formatMoney(total)}</strong>
            </div>
            <button type="button" onClick={createPedido}>Enviar pedido</button>

            <h2><ClipboardList size={20} /> Status</h2>
            <button type="button" className="ghost" onClick={loadCliente}>
              <RefreshCcw size={16} /> Atualizar
            </button>
            {pedidos.map((pedido) => (
              <article className="order-card" key={pedido.id}>
                <strong>Pedido #{pedido.id}</strong>
                <span className={`status ${slug(pedido.status)}`}>{pedido.status}</span>
                <small>{pedido.itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ')}</small>
              </article>
            ))}
          </aside>
        </section>
      ) : (
        <section className="operation">
          {!user ? (
            <form className="login-card" onSubmit={submitLogin}>
              <h1><LogIn size={22} /> Acesso da equipe</h1>
              <input
                type="email"
                placeholder="E-mail"
                value={login.email}
                onChange={(event) => setLogin({ ...login, email: event.target.value })}
              />
              <input
                type="password"
                placeholder="Senha"
                value={login.senha}
                onChange={(event) => setLogin({ ...login, senha: event.target.value })}
              />
              <button type="submit">Entrar</button>
            </form>
          ) : (
            <div className="kanban">
              {['Na fila', 'Em preparo', 'Pronto'].map((status) => (
                <section key={status} className="lane">
                  <h2>{status}</h2>
                  {operacao.filter((pedido) => pedido.status === status).map((pedido) => (
                    <article className="order-card" key={pedido.id}>
                      <strong>Mesa {pedido.mesa_numero} · #{pedido.id}</strong>
                      <span>{pedido.nome_cliente}</span>
                      <small>{pedido.itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ')}</small>
                      <StatusActions pedido={pedido} user={user} onChange={changeStatus} />
                    </article>
                  ))}
                </section>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
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

function formatMoney(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
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
