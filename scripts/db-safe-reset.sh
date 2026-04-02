#!/usr/bin/env bash
# Back up the local database, then reset it
set -euo pipefail

SCRIPT_DIR="$(dirname "$0")"

echo "Creating backup before reset..."
bash "$SCRIPT_DIR/db-backup.sh"

echo ""
echo "Running supabase db reset..."
supabase db reset
