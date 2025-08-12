#!/usr/bin/env bash
set -euo pipefail

THIS_DIR="$(cd "$(dirname "$0")" && pwd)"
CLIENT_DIR="$(cd "$THIS_DIR/.." && pwd)"
SERVER_DIR="$(cd "$CLIENT_DIR/../KC-MVP-server" && pwd)"
SERVER_PORT=${PORT:-3001}
EXPO_PORT=${EXPO_PORT:-8081}

cleanup() {
  echo "\n🧹 Stopping local server..."
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

# helper to free port
kill_port() {
  local port="$1"
  local pids
  pids=$(lsof -ti tcp:"$port" || true)
  if [[ -n "$pids" ]]; then
    echo "🔧 Freeing port $port (PIDs: $pids)"
    kill -9 $pids >/dev/null 2>&1 || true
  fi
}

# free critical ports
kill_port "$SERVER_PORT"
kill_port "$EXPO_PORT"

# 0) Start Postgres + Redis via docker if available (or FORCE_DOCKER=1)
if command -v docker >/dev/null 2>&1; then
  if docker compose version >/dev/null 2>&1; then
    echo "🐳 docker compose up -d (Postgres & Redis)"
    (cd "$SERVER_DIR" && docker compose up -d || true)
  elif command -v docker-compose >/dev/null 2>&1; then
    echo "🐳 docker-compose up -d (Postgres & Redis)"
    (cd "$SERVER_DIR" && docker-compose up -d || true)
  else
    echo "⚠️  docker compose not found. Assuming local Postgres/Redis are running."
  fi
else
  echo "⚠️  Docker not found. Assuming local Postgres/Redis are running."
fi

# 1) Build server (with diagnostics & error report)
cd "$SERVER_DIR"
echo "\n🔨 Building server..."
{
  if [[ ! -d node_modules ]]; then echo "📥 Installing server deps..."; npm ci || npm install; fi
  npm run build 2>build.err.log || true
  if [[ ! -f "$SERVER_DIR/dist/main.js" ]]; then
    echo "⚠️  nest build missed dist. Running tsc fallback..."
    ./node_modules/.bin/tsc -p tsconfig.build.json 2>>build.err.log || true
  fi
} || true

# Fallback if dist missing despite success exit code
if [[ ! -f "$SERVER_DIR/dist/main.js" ]]; then
  echo "⚠️  dist/main.js missing after nest build. Running tsc fallback..."
  ./node_modules/.bin/tsc -p tsconfig.build.json || true
fi

REQUIRED_JS=(
  "$SERVER_DIR/dist/main.js"
  "$SERVER_DIR/dist/app.module.js"
  "$SERVER_DIR/dist/controllers/health.controller.js"
  "$SERVER_DIR/dist/controllers/chat.controller.js"
)

MISSING_ANY=0
for f in "${REQUIRED_JS[@]}"; do
  if [[ ! -f "$f" ]]; then MISSING_ANY=1; fi
done

if [[ $MISSING_ANY -eq 1 ]]; then
  echo "\n⚠️  Build output incomplete — switching to ts-node runtime." >&2
  FALLBACK_SERVER_JS=1
fi

# 2) Start server
export REDIS_URL=${REDIS_URL:-redis://localhost:6379}
export POSTGRES_HOST=${POSTGRES_HOST:-localhost}
export POSTGRES_PORT=${POSTGRES_PORT:-5432}
export POSTGRES_USER=${POSTGRES_USER:-kc}
export POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-kc_password}
export POSTGRES_DB=${POSTGRES_DB:-kc_db}
export PORT="$SERVER_PORT"

echo "\n🗄️  Ensuring DB tables (init script)..."
NODE_OPTIONS= npx ts-node -r tsconfig-paths/register src/scripts/init-db.ts || true

echo "\n🚀 Starting server on http://localhost:$SERVER_PORT ..."
if [[ -n "${FALLBACK_SERVER_JS:-}" ]]; then
  echo "(fallback) running TS directly via ts-node"
  # ensure dev deps
  if [[ ! -d node_modules ]]; then npm ci || npm install; fi
  node -r ts-node/register -r tsconfig-paths/register src/main.ts &
else
  node dist/main.js &
fi
SERVER_PID=$!

# Wait for server health
ATTEMPTS=0
until curl -s http://localhost:"$SERVER_PORT"/ >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [[ $ATTEMPTS -gt 80 ]]; then
    echo "❌ Server did not start in time" >&2
    exit 1
  fi
  sleep 0.25
done

echo "✅ Server is up."

# 3) Start client (Expo) pointing to local API (with deps ensure)
cd "$CLIENT_DIR"
echo "\n🖥️  Starting Expo (API=http://localhost:$SERVER_PORT)"
if [[ ! -d node_modules ]]; then echo "📥 Installing client deps..."; npm ci || npm install; fi
export EXPO_PUBLIC_API_BASE_URL=http://localhost:"$SERVER_PORT"
export EXPO_PUBLIC_USE_BACKEND=1
export EXPO_PUBLIC_USE_FIRESTORE=0

# Run Expo on specific port without prompts
EXPO_DEV_SERVER_PORT="$EXPO_PORT" npx expo start --port "$EXPO_PORT"


