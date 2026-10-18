#!/bin/bash
# Backup script para dados da cozinha antes de migrações

BACKUP_FILE="database/backup-$(date +%Y%m%d-%H%M%S).sql"

echo "Fazendo backup do banco de dados..."

if [ "$DATABASE_CLIENT" = "sqlite" ]; then
  sqlite3 database/dev.sqlite ".dump" > "$BACKUP_FILE"
  echo "✓ Backup SQLite salvo em: $BACKUP_FILE"
else
  pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
  echo "✓ Backup PostgreSQL salvo em: $BACKUP_FILE"
fi

echo ""
echo "Comando para restaurar:"
echo "  sqlite3 database/dev.sqlite < $BACKUP_FILE"
