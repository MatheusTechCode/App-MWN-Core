# ComandaX

MVP do SaaS de cardápio digital da MWN CORE para restaurantes e similares.

## Stack

- Backend: Node.js + Express
- Frontend: React + Vite + PWA
- Banco: PostgreSQL
- Arquitetura: monolito modular
- Tempo real no MVP: polling

## Como rodar

1. Crie o arquivo `.env` a partir de `.env.example`.
2. Crie o banco PostgreSQL `comandax`.
3. Execute o schema e os dados iniciais:

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```

4. Instale as dependências:

```bash
npm install
```

5. Crie usuários da equipe:

```bash
npm run create:user -- "Admin" admin@comandax.com admin123 admin
npm run create:user -- "Cozinha" cozinha@comandax.com cozinha123 cozinha
npm run create:user -- "Garçom" garcom@comandax.com garcom123 garcom
```

6. Inicie a aplicação:

```bash
npm run dev
```

Frontend: `http://localhost:5173`
API: `http://localhost:3001/api`

## Fluxos MVP implementados

- Cliente acessa a mesa por token de QR Code, exemplo: `?mesa=mwn_qr_v6N9sT4bC1Z8`.
- Cliente visualiza cardápio, cria comanda e envia pedido.
- Cliente acompanha status por atualização manual e recarregamento/polling da aplicação.
- Equipe acessa a tela de operação com login.
- Cozinha move pedidos de `Na fila` para `Em preparo` e de `Em preparo` para `Pronto`.
- Garçom move pedidos de `Pronto` para `Entregue`.
- Histórico de status é registrado em `historico_status_pedido`.

## Estrutura

```txt
src/
  config/
  database/
  middlewares/
  modules/
    auth/
    mesas/
    comandas/
    pedidos/
    cardapios/
  utils/
client/
  src/
database/
scripts/
```

## Decisões técnicas

- As regras de negócio ficam nos services para manter controllers simples.
- O cliente não precisa autenticar no MVP; ele é limitado pelo token da mesa.
- Usuários administrativos usam JWT e senha com hash bcrypt.
- Polling foi mantido no lugar de WebSocket para respeitar o escopo do MVP.
