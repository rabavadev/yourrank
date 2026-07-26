#!/usr/bin/env bash
# One-click local dev for YourRank
# Starts Docker Postgres, applies migrations, and runs the Workers locally.
# Usage: ./start-local.sh            (leaderboard only)
#        ./start-local.sh --bot      (leaderboard + bot)
#        ./start-local.sh --stop     (stop Postgres and running Workers)

set -euo pipefail

# Wrangler 4.x requires Node.js >= 22; make sure the n-managed Node is first.
export PATH="$HOME/.n/bin:$PATH"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$ROOT/.local/logs"
mkdir -p "$LOGS_DIR"

WITH_BOT=false
STOP=false

for arg in "$@"; do
  case "$arg" in
    --bot) WITH_BOT=true ;;
    --stop) STOP=true ;;
    *) echo "Unknown argument: $arg"; exit 1 ;;
  esac
done

if $STOP; then
  echo "[stop] Stopping local Workers..."
  pkill -f "wrangler dev" 2>/dev/null || true
  echo "[stop] Stopping Postgres..."
  cd "$ROOT" && docker compose down
  echo "[stop] Done."
  exit 0
fi

require() {
  command -v "$1" >/dev/null 2>&1 || { echo "Missing required tool: $1" >&2; exit 1; }
}

require bun
require docker

# 1. Start Postgres
echo "[db] Starting Postgres container..."
cd "$ROOT"
docker compose up -d

# 2. Wait until Postgres is ready
echo "[db] Waiting for Postgres..."
for _ in {1..60}; do
  if docker compose exec -T postgres pg_isready -U postgres -d yourrank >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
docker compose exec -T postgres pg_isready -U postgres -d yourrank >/dev/null 2>&1 || { echo "Postgres did not start"; exit 1; }

# 3. Ensure .dev.vars exist and point cookies to localhost
# Wrangler's Hyperdrive local emulation needs this as a shell env var,
# not just inside .dev.vars.
export CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="postgresql://postgres:postgres@localhost:5432/yourrank"
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/yourrank"

setup_dev_vars() {
  local app="$1"
  local dir="$ROOT/apps/$app"
  if [[ ! -f "$dir/.dev.vars" ]]; then
    echo "[setup] Creating $app/.dev.vars from example..."
    cp "$dir/.dev.vars.example" "$dir/.dev.vars"
  fi
  # Force local cookies so auth works on localhost
  sed -i.bak 's/^SESSION_COOKIE_DOMAIN=.*/SESSION_COOKIE_DOMAIN=localhost/' "$dir/.dev.vars"
  rm -f "$dir/.dev.vars.bak"
}

setup_dev_vars leaderboard
$WITH_BOT && setup_dev_vars bot

# 4. Reset local database so migrations apply cleanly (local dev only)
echo "[db] Resetting local database yourrank..."
docker compose exec -T postgres psql -U postgres -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
\set AUTOCOMMIT on
DROP DATABASE IF EXISTS yourrank;
CREATE DATABASE yourrank;
SQL

# 5. Apply migrations
echo "[db] Applying migrations..."
for f in $(ls "$ROOT"/supabase/migrations/*.sql 2>/dev/null | sort); do
  echo "  - $f"
  docker compose exec -T postgres psql -U postgres -d yourrank < "$f" >/dev/null
done

# 6. Start Workers
echo "[dev] Starting leaderboard Worker on http://localhost:8787"
cd "$ROOT/apps/leaderboard"
nohup bun run dev > "$LOGS_DIR/leaderboard.log" 2>&1 &
LB_PID=$!

if $WITH_BOT; then
  echo "[dev] Starting bot Worker on http://localhost:8788 (or next available)"
  cd "$ROOT/apps/bot"
  nohup bun run dev > "$LOGS_DIR/bot.log" 2>&1 &
  BOT_PID=$!
fi

# 7. Tail logs and clean up on exit
cleanup() {
  echo ""
  echo "[stop] Shutting down Workers..."
  kill "$LB_PID" 2>/dev/null || true
  if $WITH_BOT; then
    kill "$BOT_PID" 2>/dev/null || true
  fi
  wait 2>/dev/null || true
  echo "[stop] Workers stopped. Postgres is still running; use ./start-local.sh --stop to stop it."
}
trap cleanup EXIT INT TERM

echo ""
echo "[dev] Logs are in .local/logs/"
echo "[dev] Press Ctrl+C to stop Workers (Postgres stays up)."
echo ""

if $WITH_BOT; then
  tail -f "$LOGS_DIR/leaderboard.log" "$LOGS_DIR/bot.log"
else
  tail -f "$LOGS_DIR/leaderboard.log"
fi
