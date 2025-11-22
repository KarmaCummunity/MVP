#!/usr/bin/env bash
# File overview:
# - Purpose: One-command local spin-up for backend (DB+Redis via Docker) and Expo client with API pointing to localhost.
# - Steps: Free ports, docker compose up, build server, ensure DB schema via ts-node, start server, smoke-test APIs, start Expo.
# - Inputs: PORT (server), EXPO_PORT (Expo dev server). Exports EXPO_PUBLIC_API_BASE_URL and flags.
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
# Also check for any other common web server ports that might serve the old static page
kill_port 8080
kill_port 3000

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

# Google OAuth Configuration (CRITICAL for auth to work)
export GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-430191522654-o70t2qnqc4bvpvmbpak7unog7pvp9c95.apps.googleusercontent.com}
export EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=${EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:-430191522654-o70t2qnqc4bvpvmbpak7unog7pvp9c95.apps.googleusercontent.com}
export EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=${EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:-430191522654-q05j71a8lu3e1vgf75c2r2jscgckb4mm.apps.googleusercontent.com}
export EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=${EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID:-430191522654-jno2tkl1dotil0mkf4h4hahfk4e4gas8.apps.googleusercontent.com}

# Environment configuration
export NODE_ENV=${NODE_ENV:-development}
export DATABASE_URL=${DATABASE_URL:-postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB}

echo "\n🔑 Google OAuth Configuration:"
echo "   GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:0:20}..."
echo "   Web Client ID: ${EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:0:20}..."
echo "   Environment: $NODE_ENV"

echo "\n🗄️  Ensuring DB tables (init script)..."
if ! SKIP_FULL_SCHEMA=1 NODE_OPTIONS= \
  POSTGRES_HOST="$POSTGRES_HOST" \
  POSTGRES_PORT="$POSTGRES_PORT" \
  POSTGRES_USER="$POSTGRES_USER" \
  POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  POSTGRES_DB="$POSTGRES_DB" \
  DATABASE_URL="$DATABASE_URL" \
  npx ts-node -r tsconfig-paths/register src/scripts/init-db.ts; then
  echo "❌ DB init failed. Aborting."
  exit 1
fi

echo "\n🚀 Starting server on http://localhost:$SERVER_PORT ..."
if [[ -n "${FALLBACK_SERVER_JS:-}" ]]; then
  echo "(fallback) running TS directly via ts-node"
  # ensure dev deps
  if [[ ! -d node_modules ]]; then npm ci || npm install; fi
  SKIP_FULL_SCHEMA=1 \
  GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="$EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID" \
  DATABASE_URL="$DATABASE_URL" \
  REDIS_URL="$REDIS_URL" \
  NODE_ENV="$NODE_ENV" \
  PORT="$PORT" \
  node -r ts-node/register -r tsconfig-paths/register src/main.ts &
else
  SKIP_FULL_SCHEMA=1 \
  GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="$EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID" \
  DATABASE_URL="$DATABASE_URL" \
  REDIS_URL="$REDIS_URL" \
  NODE_ENV="$NODE_ENV" \
  PORT="$PORT" \
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

# Quick smoke-test critical endpoints before starting Expo
echo "\n🔎 Running API smoke tests..."
set +e
curl -sf http://localhost:"$SERVER_PORT"/api/donations/categories >/dev/null
DONATIONS_OK=$?
curl -sf http://localhost:"$SERVER_PORT"/api/stats/analytics/categories >/dev/null
STATS_OK=$?
set -e
if [[ $DONATIONS_OK -ne 0 || $STATS_OK -ne 0 ]]; then
  echo "❌ API smoke tests failed (donations=$DONATIONS_OK, stats=$STATS_OK). Not starting Expo."
  exit 1
fi
echo "✅ API smoke tests passed."

# Extended API tests (non-flaky, no external keys required)
echo "\n🧪 Running extended API tests..."
set +e
curl -sf http://localhost:"$SERVER_PORT"/health/redis >/dev/null
HEALTH_REDIS_OK=$?
curl -sf http://localhost:"$SERVER_PORT"/api/stats/community >/dev/null
COMMUNITY_STATS_OK=$?
curl -sf http://localhost:"$SERVER_PORT"/api/donations/stats/summary >/dev/null
DONATION_STATS_OK=$?
curl -sf http://localhost:"$SERVER_PORT"/api/chat/conversations/user/550e8400-e29b-41d4-a716-446655440000 >/dev/null
CHAT_LIST_OK=$?

# Redis comprehensive test expects JSON with allTestsPassed=true
REDIS_COMP=$(curl -s -X POST http://localhost:"$SERVER_PORT"/redis-test/comprehensive -H 'Content-Type: application/json')
echo "$REDIS_COMP" | grep -q '"allTestsPassed":true'
REDIS_COMP_OK=$?

set -e
if [[ $HEALTH_REDIS_OK -ne 0 || $COMMUNITY_STATS_OK -ne 0 || $DONATION_STATS_OK -ne 0 || $CHAT_LIST_OK -ne 0 || $REDIS_COMP_OK -ne 0 ]]; then
  echo "❌ Extended API tests failed: health=$HEALTH_REDIS_OK community=$COMMUNITY_STATS_OK donationStats=$DONATION_STATS_OK chatList=$CHAT_LIST_OK redisComp=$REDIS_COMP_OK"
  exit 1
fi
echo "✅ Extended API tests passed."

# 3) Start client (Expo) pointing to local API (with deps ensure)
cd "$CLIENT_DIR"
echo "\n🖥️  Starting Expo (API=http://localhost:$SERVER_PORT)"

# CRITICAL: Remove old static HTML file that interferes with Expo web
if [[ -f "$CLIENT_DIR/public/index.html" ]]; then
  echo "⚠️  Removing old static HTML file (public/index.html) that interferes with Expo web"
  mv "$CLIENT_DIR/public/index.html" "$CLIENT_DIR/public/index.html.old" 2>/dev/null || true
fi

if [[ ! -d node_modules ]]; then echo "📥 Installing client deps..."; npm ci || npm install; fi
export EXPO_PUBLIC_API_BASE_URL=http://localhost:"$SERVER_PORT"
export EXPO_PUBLIC_USE_BACKEND=1
export EXPO_PUBLIC_USE_FIRESTORE=0

# Run Expo on specific port without prompts
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🌐 IMPORTANT: Open http://localhost:$EXPO_PORT in your browser"
echo "   (NOT http://localhost:3001 or any other port)"
echo ""
echo "⚠️  The 'coming soon' page is OLD and should NOT appear!"
echo ""
echo "   If you see the 'coming soon' page:"
echo "   1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   2. Make sure you're opening http://localhost:$EXPO_PORT"
echo "   3. Check browser console for errors (F12)"
echo "   4. Try incognito/private mode"
echo ""
echo "   The app should show either:"
echo "   - LandingSiteScreen (if web mode = 'site')"
echo "   - LoginScreen or HomeScreen (if web mode = 'app')"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Clear cache before starting to avoid circular dependency issues
echo "🧹 Clearing Metro cache..."
rm -rf "$CLIENT_DIR/.expo" "$CLIENT_DIR/node_modules/.cache" 2>/dev/null || true

EXPO_DEV_SERVER_PORT="$EXPO_PORT" npx expo start --port "$EXPO_PORT" --web --clear


