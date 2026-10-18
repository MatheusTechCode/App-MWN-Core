import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './styles.css';

class AppRenderBoundary extends React.Component {
  state = { error: null, retryKey: 0 };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Falha ao renderizar o ComandaX:', error, info.componentStack);
  }

  retry = () => {
    this.setState((state) => ({ error: null, retryKey: state.retryKey + 1 }));
  };

  render() {
    if (this.state.error) {
      return (
        <main className="app-shell">
          <section className="login-screen">
            <div className="login-card" role="alert">
              <h1>Não foi possível abrir o painel</h1>
              <p>{this.state.error.message || 'Ocorreu um erro inesperado ao carregar a página.'}</p>
              <button type="button" onClick={this.retry}>Tentar novamente</button>
            </div>
          </section>
        </main>
      );
    }

    return <App key={this.state.retryKey} />;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRenderBoundary />
  </React.StrictMode>,
);
