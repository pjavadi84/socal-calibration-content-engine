#!/usr/bin/env bash
# Dump the local Supabase database to a timestamped SQL file in backups/
set -euo pipefail

BACKUP_DIR="$(dirname "$0")/../backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql"

pg_dump -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  --no-owner --no-privileges \
  -N auth -N storage -N supabase_functions -N extensions -N realtime \
  -N _realtime -N supabase_migrations -N vault -N pgsodium \
  > "$BACKUP_FILE"

echo "Backup saved to $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
