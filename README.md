# ComandaX

MVP do SaaS de cardápio digital da MWN CORE para restaurantes e similares.

## Stack

- Backend: Node.js + Express
- Frontend: React + Vite + PWA
- Banco: PostgreSQL
- Banco demo opcional: SQLite nativo do Node.js
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

No modo SQLite local, a primeira inicialização cria o administrador caso ainda não exista:

- Login: `admin@comandax.com`
- Senha inicial de desenvolvimento: `admin123`

Na primeira inicialização SQLite, também são criados os acessos de demonstração, caso os e-mails ainda não existam:

| Perfil | Login | Senha inicial de desenvolvimento |
| --- | --- | --- |
| Cozinha | `cozinha@comandax.com` | `cozinha123` |
| Garçom | `garcom@comandax.com` | `garcom123` |

Essas senhas são apenas para desenvolvimento local. Para produção, defina `ADMIN_*`, `KITCHEN_*` e `WAITER_*` no `.env` antes do primeiro início. Usuários existentes não têm a senha alterada nem são reativados automaticamente.

Usuários existentes nunca têm a senha redefinida automaticamente. Em produção, configure as senhas e os e-mails iniciais dos três perfis antes da primeira inicialização; não use as senhas de demonstração.

O caminho do banco SQLite é resolvido a partir da pasta do projeto, mesmo que o comando seja iniciado de outro diretório. Mantenha o arquivo indicado por `SQLITE_PATH` e faça backup antes de alterações; apagar esse arquivo remove os registros locais. O seed restaura somente dados de demonstração, não pedidos/comandas reais.

Frontend cliente local: `http://localhost:5173/mwn_qr_a8F3kP7xQ2L9`
Frontend operação local: `http://localhost:5173/admin`
API local: `http://localhost:3001/api`

Na tela de operação, o campo `Login` aceita o nome cadastrado ou o e-mail do usuário.

Para permitir recuperação de senha do gestor, configure no `.env`:

```env
ADMIN_RECOVERY_CODE=um-codigo-forte-para-recuperacao
```

Esse código é solicitado na opção `Recuperar senha do gestor` da tela de operação.

Para testar em celulares na mesma rede Wi-Fi, use o IP da máquina que está rodando o projeto:

```txt
http://SEU_IP_LOCAL:5173/mwn_qr_a8F3kP7xQ2L9
http://SEU_IP_LOCAL:5173/admin
http://SEU_IP_LOCAL:3001/api/health
```

Exemplo: se o Vite mostrar `Network: http://192.168.1.102:5173/`, use `http://192.168.1.102:5173/admin` no celular.

## Fluxos MVP implementados

- Cliente acessa a mesa por token de QR Code na rota, exemplo: `/mwn_qr_v6N9sT4bC1Z8`.
- Cliente alterna entre telas de cardápio, comanda e pedidos pelo topo.
- Cliente visualiza cardápio, cria comanda e envia pedido.
- Cliente acompanha status e total parcial da comanda por atualização manual e polling da aplicação.
- Equipe acessa a tela de operação por `/admin`.
- Cozinha move pedidos de `Na fila` para `Em preparo` e de `Em preparo` para `Pronto`.
- Garçom ou admin pode abrir comandas para mesas pela tela de operação.
- Garçom ou admin pode lançar novos pedidos nas comandas abertas dos clientes.
- Garçom ou admin pode transferir comandas abertas entre mesas.
- Cliente pode editar ou excluir itens de um pedido enquanto ele estiver `Na fila`.
- Garçom pode editar ou excluir pedidos enquanto estiverem `Na fila`.
- Admin pode editar ou excluir pedidos ainda não entregues.
- Garçom move pedidos de `Pronto` para `Entregue`.
- Garçom ou admin visualiza comandas abertas e registra pagamento, encerrando a comanda.
- Admin pode redefinir senha de usuários operacionais pela tela de operação.
- Admin pode recuperar a própria senha usando o código de recuperação configurado no `.env`.
- Admin pode gerenciar garçons: criar, editar e excluir/desativar.
- Ao criar um garçom na seção `Garçons` da tela de operação, o usuário e a senha são gravados no banco e podem ser usados imediatamente para entrar com o e-mail ou nome cadastrado.
- Admin pode gerenciar mesas: visualizar, criar, editar e excluir/inativar.
- Admin pode gerenciar cardápios e itens: criar, visualizar, editar, ativar/inativar, excluir e vincular itens a cardápios.
- Garçom e cozinha podem visualizar cardápios e ativar/inativar cardápios conforme a operação.
- Histórico de status é registrado em `historico_status_pedido`.
- Histórico de pagamento é registrado em `historico_atendimento`.

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
    pagamentos/
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

## Mesas criadas

- 1 - mwn_qr_a8F3kP7xQ2L9
- 2 - mwn_qr_v6N9sT4bC1Z8
- 3 - mwn_qr_r2H7dM5qW9Y3

Criar qr-code com o endereço de ip e com o codigo da mesa

## Publicar gratuitamente no Render + Neon

O `render.yaml` configura o ComandaX no plano gratuito do Render e usa PostgreSQL externo do Neon para manter os dados fora do disco temporário do serviço. É uma configuração para demonstração: o Render suspende o app após 15 minutos sem acesso e a primeira abertura pode levar cerca de um minuto. O Neon Free tem limites mensais de computação e armazenamento.

1. No Neon, crie um projeto PostgreSQL gratuito. Abra **Connect**, escolha a branch e guarde as duas connection strings, com pooling (`DATABASE_URL`) e direta (`DATABASE_URL_UNPOOLED`); ambas incluem `sslmode=require`.
2. Confirme que este repositório do GitHub contém o `render.yaml` na raiz do projeto `App-MWN-Core`. No painel do Render, use **New + → Blueprint** e conecte `MatheusTechCode/App-MWN-Core`.
3. Ao criar o Blueprint, preencha os campos secretos solicitados: `DATABASE_URL` e `DATABASE_URL_UNPOOLED` com as URLs correspondentes do Neon, os e-mails e senhas fortes do admin, cozinha e garçom, e `ADMIN_RECOVERY_CODE`. Não compartilhe esses segredos nem os salve no GitHub.
4. Aguarde o deploy. O schema e os três usuários iniciais são criados automaticamente na primeira inicialização. Usuários já existentes não têm a senha sobrescrita.
5. Abra `https://SEU-SERVICO.onrender.com/api/health`; o resultado esperado é `status: ok`. A URL `https://SEU-SERVICO.onrender.com/admin` abre a operação e os QR Codes do cliente usam a mesma base, por exemplo `/mwn_qr_a8F3kP7xQ2L9`.

O Render define a porta pública em `PORT`, que o servidor usa automaticamente. Para usar domínio próprio depois, adicione-o em **Settings → Custom Domains** e configure os DNS indicados; o domínio precisa ser registrado separadamente.
## Demo gratuita com SQLite

Para serviços gratuitos que não permitem instalar PostgreSQL, o projeto pode rodar em modo SQLite usando o SQLite nativo do Node.js.

Configure o `.env` da demo:

```env
DATABASE_CLIENT=sqlite
SQLITE_PATH=database/demo.sqlite
JWT_SECRET=troque-este-segredo
ADMIN_RECOVERY_CODE=um-codigo-forte-para-recuperacao
ADMIN_EMAIL=admin@comandax.com
ADMIN_INITIAL_PASSWORD=defina-uma-senha-forte
KITCHEN_EMAIL=cozinha@comandax.com
KITCHEN_INITIAL_PASSWORD=defina-uma-senha-forte
WAITER_EMAIL=garcom@comandax.com
WAITER_INITIAL_PASSWORD=defina-uma-senha-forte
```

Em desenvolvimento, se não houver configurações de senha inicial, a primeira inicialização SQLite cria os acessos padrão de admin (`admin123`), cozinha (`cozinha123`) e garçom (`garcom123`). Em produção, configure explicitamente `ADMIN_INITIAL_PASSWORD`, `KITCHEN_INITIAL_PASSWORD` e `WAITER_INITIAL_PASSWORD` (e os respectivos e-mails) antes de iniciar. Cada usuário só é criado se o e-mail ainda não existir; senhas, perfis e contas desativadas existentes não são substituídos.

O schema e os dados iniciais são aplicados automaticamente a partir de:

```txt
database/sqlite-schema.sql
database/sqlite-seed.sql
```

Crie os usuários normalmente, já usando o modo SQLite:

```bash
DATABASE_CLIENT=sqlite npm run create:user -- "Admin" admin@comandax.com admin123 admin
DATABASE_CLIENT=sqlite npm run create:user -- "Cozinha" cozinha@comandax.com cozinha123 cozinha
DATABASE_CLIENT=sqlite npm run create:user -- "Garçom" garcom@comandax.com garcom123 garcom
```

O admin também pode criar logins individuais para novos garçons na tela `/admin/garcons`. Informe nome, e-mail e senha inicial (mínimo de 6 caracteres) e clique em `Criar garçom`. O usuário fica salvo no mesmo banco SQLite/PostgreSQL e já pode entrar com o próprio e-mail ou nome e senha. Garçons adicionados por esse formulário são listados e administrados nessa mesma seção.

Para rodar localmente nesse modo:

```bash
npm run dev:sqlite
```

Para produção/demo em serviço gratuito, use o comando de inicialização:

```bash
npm run start:sqlite
```

No Render como Web Service, configure:

```txt
Build Command: npm install && npm run build
Start Command: npm run start:sqlite
```

O Express servirá a API em `/api` e o frontend React nas demais rotas, como `/admin` e `/mwn_qr_a8F3kP7xQ2L9`.

Se o frontend estiver em outro domínio diferente da API, libere a origem:

```env
CORS_ORIGINS=https://seu-front.com,https://outro-dominio.com
```

Quando frontend e API estão no mesmo Web Service do Render, não é necessário configurar CORS para a URL do próprio Render.

Ou configure a variável de ambiente abaixo e use `npm start`:

```env
DATABASE_CLIENT=sqlite
```

Se `DATABASE_URL` não existir, o sistema também assume SQLite automaticamente.

Observação: `node:sqlite` ainda emite aviso experimental em algumas versões do Node. Para demo é suficiente; para SaaS real, mantenha PostgreSQL.
