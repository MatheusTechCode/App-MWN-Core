# Migrações e persistência do banco

## O que aconteceu

Uma alteração anterior do schema coincidiu com a remoção ou recriação do arquivo SQLite; editar o schema não deveria apagar tabelas ou registros. O SQLite da aplicação é persistido no caminho configurado por `SQLITE_PATH` (por padrão, `database/demo.sqlite`) e esse caminho agora é ancorado na pasta do projeto, independentemente do diretório de onde o Node é iniciado.

## Como evitar no futuro

### 1. Sempre fazer backup antes de migrações

```bash
# Executar antes de qualquer alteração no schema
./scripts/backup-db.sh
```

### 2. Preserve o arquivo do banco

Não apague o arquivo `.sqlite` para aplicar mudanças no schema. O inicializador cria tabelas ausentes e adiciona colunas de compatibilidade sem remover registros existentes. Mudanças futuras devem preservar os dados e ser testadas em uma cópia de backup.

## Recriar seus dados

### Opção 1: Usar dados de exemplo (recomendado para teste)

```bash
npm run dev:sqlite
```

Depois acesse `http://localhost:5173/admin` e configure:
- Cardápios
- Estações de cozinha
- Itens do cardápio

### Opção 2: Restaurar de um backup anterior

Se você tiver um arquivo `.sql` de backup:

```bash
sqlite3 database/dev.sqlite < /caminho/do/backup.sql
```

## Estrutura de Migrações (novo padrão)

```
database/
├── schema.sql                    # Schema inicial (PostgreSQL)
├── sqlite-schema.sql             # Schema inicial (SQLite)
├── migrations/
│   ├── 001-add-agrupar-pedidos-fila.sql
│   └── 002-sua-proxima-migracao.sql
└── ...
```

**Importante**: a sintaxe de migração varia entre SQLite e PostgreSQL; não execute um arquivo de migração de um banco no outro sem adaptar e testar a sintaxe.

Se o arquivo de banco já foi apagado ou substituído, os dados reais só podem ser recuperados de um backup. Os seeds recriam dados de demonstração, mas não reconstroem pedidos, comandas ou cadastros anteriores.
