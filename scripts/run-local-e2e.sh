#!/usr/bin/env bash
# File overview:
# - Purpose: One-command local spin-up for backend (DB+Redis via Docker) and Expo client with API pointing to localhost.
# - Steps: Free ports, docker compose up, build server, ensure DB schema via ts-node, start server, smoke-test APIs, start Expo.
# - Inputs: PORT (server), EXPO_PORT (Expo dev server). Exports EXPO_PUBLIC_API_BASE_URL and flags.
set -euo pipefail

THIS_DIR="$(cd "$(dirname "$0")" && pwd)"
CLIENT_DIR="$(cd "$THIS_DIR/.." && pwd)"
SERVER_DIR="$(cd "$CLIENT_DIR/../KC-MVP-server" && pwd)"
SERVER_PORT=${PORT:-3001}
EXPO_PORT=${EXPO_PORT:-8081}

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
  echo "ℹ️  $1"
}

log_success() {
  echo "✅ $1"
}

log_error() {
  echo "❌ $1" >&2
}

log_warning() {
  echo "⚠️  $1"
}

# Check if port is available
is_port_available() {
  local port="$1"
  ! lsof -ti tcp:"$port" >/dev/null 2>&1
}

# Helper to free port
kill_port() {
  local port="$1"
  local pids
  pids=$(lsof -ti tcp:"$port" || true)
  if [[ -n "$pids" ]]; then
    log_info "Freeing port $port (PIDs: $pids)"
    kill -9 $pids >/dev/null 2>&1 || true
  fi
}

# Test endpoint with retry logic
test_endpoint_with_retry() {
  local url="$1"
  local max_attempts="${2:-3}"
  local attempt=1
  
  while [[ $attempt -le $max_attempts ]]; do
    if curl -sf "$url" >/dev/null 2>&1; then
      return 0
    fi
    if [[ $attempt -lt $max_attempts ]]; then
      sleep 1
    fi
    attempt=$((attempt + 1))
  done
  return 1
}

# ============================================================================
# Cleanup Function
# ============================================================================

cleanup() {
  echo ""
  log_info "Cleaning up..."
  
  # Stop server
  if [[ -n "${SERVER_PID:-}" ]]; then
    log_info "Stopping server (PID: $SERVER_PID)..."
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  
  # Optionally stop Docker (if SKIP_DOCKER_CLEANUP is not set)
  if [[ -z "${SKIP_DOCKER_CLEANUP:-}" ]]; then
    log_info "Stopping Docker containers..."
    (cd "$SERVER_DIR" && docker compose down >/dev/null 2>&1 || true)
  fi
  
  log_success "Cleanup complete"
}
trap cleanup EXIT INT TERM

# ============================================================================
# Pre-flight Checks
# ============================================================================

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 Starting Local E2E Environment Setup"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check Node.js version
log_info "Checking Node.js version..."
REQUIRED_NODE_VERSION="18.0.0"
CURRENT_NODE_VERSION=$(node -v | sed 's/v//')
if ! node -e "const required = '$REQUIRED_NODE_VERSION'.split('.').map(Number); const current = '$CURRENT_NODE_VERSION'.split('.').map(Number); if (current[0] < required[0] || (current[0] === required[0] && current[1] < required[1])) process.exit(1);" 2>/dev/null; then
  log_error "Node.js version $CURRENT_NODE_VERSION is too old. Required: >= $REQUIRED_NODE_VERSION"
  exit 1
fi
log_success "Node.js version: $CURRENT_NODE_VERSION"

# Check required files
log_info "Checking required files..."
if [[ ! -f "$SERVER_DIR/package.json" ]]; then
  log_error "package.json not found in $SERVER_DIR"
  exit 1
fi

if [[ ! -f "$CLIENT_DIR/package.json" ]]; then
  log_error "package.json not found in $CLIENT_DIR"
  exit 1
fi
log_success "Required files found"

# Check Docker availability
log_info "Checking Docker availability..."
if ! command -v docker >/dev/null 2>&1; then
  log_error "Docker not found. Please install Docker Desktop."
  exit 1
fi

# Check if Docker daemon is running
if ! docker info >/dev/null 2>&1; then
  log_error "Docker daemon is not running. Please start Docker Desktop."
  exit 1
fi
log_success "Docker is available and running"

# ============================================================================
# Port Management
# ============================================================================

log_info "Checking and freeing ports..."

# Check and free server port
if ! is_port_available "$SERVER_PORT"; then
  log_warning "Port $SERVER_PORT is in use. Attempting to free it..."
  kill_port "$SERVER_PORT"
  sleep 2
  if ! is_port_available "$SERVER_PORT"; then
    log_error "Port $SERVER_PORT is still in use. Please free it manually."
    exit 1
  fi
fi

# Check and free Expo port
if ! is_port_available "$EXPO_PORT"; then
  log_warning "Port $EXPO_PORT is in use. Attempting to free it..."
  kill_port "$EXPO_PORT"
  sleep 2
  if ! is_port_available "$EXPO_PORT"; then
    log_error "Port $EXPO_PORT is still in use. Please free it manually."
    exit 1
  fi
fi

# Free other common ports that might interfere
kill_port 8080
kill_port 3000

log_success "Ports are ready"

# ============================================================================
# Docker Services Setup
# ============================================================================

log_info "Starting Docker services (Postgres & Redis)..."

if docker compose version >/dev/null 2>&1; then
  (cd "$SERVER_DIR" && docker compose up -d || {
    log_error "Failed to start Docker Compose services"
    exit 1
  })
elif command -v docker-compose >/dev/null 2>&1; then
  (cd "$SERVER_DIR" && docker-compose up -d || {
    log_error "Failed to start Docker Compose services"
    exit 1
  })
else
  log_error "docker compose not found"
  exit 1
fi

# Wait for Postgres to be ready
log_info "Waiting for Postgres to be ready..."
POSTGRES_READY=0
for i in {1..30}; do
  POSTGRES_CONTAINER=$(docker ps -q -f name=postgres)
  if [[ -n "$POSTGRES_CONTAINER" ]] && docker exec "$POSTGRES_CONTAINER" pg_isready -U kc >/dev/null 2>&1; then
    POSTGRES_READY=1
    break
  fi
  if [[ $i -eq 30 ]]; then
    log_error "Postgres did not become ready in time"
    exit 1
  fi
  sleep 1
done
if [[ $POSTGRES_READY -eq 1 ]]; then
  log_success "Postgres is ready"
fi

# Wait for Redis to be ready
log_info "Waiting for Redis to be ready..."
REDIS_READY=0
for i in {1..30}; do
  REDIS_CONTAINER=$(docker ps -q -f name=redis)
  if [[ -n "$REDIS_CONTAINER" ]] && docker exec "$REDIS_CONTAINER" redis-cli ping >/dev/null 2>&1; then
    REDIS_READY=1
    break
  fi
  if [[ $i -eq 30 ]]; then
    log_error "Redis did not become ready in time"
    exit 1
  fi
  sleep 1
done
if [[ $REDIS_READY -eq 1 ]]; then
  log_success "Redis is ready"
fi

# ============================================================================
# Database Migration: UUID Conversion (run early, before init-db)
# ============================================================================

log_info "Running UUID conversion migration (if tables exist)..."
MIGRATION_FILE="$SERVER_DIR/src/database/migration-uuid-conversion.sql"
if [[ ! -f "$MIGRATION_FILE" ]]; then
  log_warning "Migration file not found: $MIGRATION_FILE - skipping migration"
else
  POSTGRES_CONTAINER=$(docker ps -q -f name=postgres)
  if [[ -n "$POSTGRES_CONTAINER" ]]; then
    # Check if tables exist before running migration
    TABLES_EXIST=$(docker exec "$POSTGRES_CONTAINER" psql -U kc -d kc_db -tAc \
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('chat_messages', 'message_read_receipts', 'chat_conversations');" 2>/dev/null || echo "0")
    
    if [[ "$TABLES_EXIST" -gt "0" ]]; then
      # Run migration with error handling - ignore errors if columns are already UUID
      if docker exec -i "$POSTGRES_CONTAINER" psql -U kc -d kc_db < "$MIGRATION_FILE" 2>/dev/null; then
        log_success "UUID conversion migration completed"
      else
        # Check if error is because columns are already UUID (which is fine)
        SENDER_ID_TYPE=$(docker exec "$POSTGRES_CONTAINER" psql -U kc -d kc_db -tAc \
          "SELECT data_type FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='sender_id';" 2>/dev/null || echo "")
        if [[ "$SENDER_ID_TYPE" == "uuid" ]]; then
          log_success "UUID conversion migration skipped (columns already UUID)"
        else
          log_warning "UUID conversion migration had errors (will retry after init-db)"
        fi
      fi
    else
      log_info "Tables don't exist yet - migration will run after init-db"
    fi
  else
    log_warning "Postgres container not found - skipping UUID migration"
  fi
fi

# ============================================================================
# Server Build
# ============================================================================

cd "$SERVER_DIR"
log_info "Building server..."

# Clean old build artifacts
log_info "Cleaning old build artifacts..."
rm -rf "$SERVER_DIR/dist" "$SERVER_DIR/build.err.log" 2>/dev/null || true

# Ensure dependencies are installed
if [[ ! -d node_modules ]]; then 
  log_info "Installing server dependencies (node_modules missing)..."
  npm ci || npm install
elif [[ ! -f node_modules/body-parser/package.json ]]; then
  log_info "Installing server dependencies (body-parser missing)..."
  npm install
fi

# Verify critical dependencies are installed
if [[ ! -f node_modules/body-parser/package.json ]]; then
  log_warning "Critical dependency 'body-parser' not found. Installing..."
  npm install body-parser
  if [[ ! -f node_modules/body-parser/package.json ]]; then
    log_error "Failed to install body-parser. Aborting."
    exit 1
  fi
fi

# Build with error logging
log_info "Running npm run build..."
if ! npm run build 2>build.err.log; then
  log_error "Build failed. Errors:"
  if [[ -f build.err.log ]]; then
    tail -100 build.err.log
  fi
  log_error "TSC fallback attempt..."
  if ! ./node_modules/.bin/tsc -p tsconfig.build.json 2>>build.err.log; then
    log_error "TSC fallback also failed. Aborting."
    exit 1
  fi
fi

# Verify build output
if [[ ! -f "$SERVER_DIR/dist/main.js" ]]; then
  log_error "Build output missing: dist/main.js"
  log_warning "Running tsc fallback..."
  if ! ./node_modules/.bin/tsc -p tsconfig.build.json; then
    log_error "TSC fallback failed. Aborting."
    exit 1
  fi
  if [[ ! -f "$SERVER_DIR/dist/main.js" ]]; then
    log_error "Build output still missing after fallback. Aborting."
    exit 1
  fi
fi

log_success "Server build completed"

# Check for required build files
REQUIRED_JS=(
  "$SERVER_DIR/dist/main.js"
  "$SERVER_DIR/dist/app.module.js"
  "$SERVER_DIR/dist/controllers/health.controller.js"
  "$SERVER_DIR/dist/controllers/chat.controller.js"
  "$SERVER_DIR/dist/items/items.controller.js"
  "$SERVER_DIR/dist/items/items.module.js"
)

MISSING_ANY=0
for f in "${REQUIRED_JS[@]}"; do
  if [[ ! -f "$f" ]]; then MISSING_ANY=1; fi
done

if [[ $MISSING_ANY -eq 1 ]]; then
  log_warning "Build output incomplete — switching to ts-node runtime."
  FALLBACK_SERVER_JS=1
fi

# ============================================================================
# Environment Configuration
# ============================================================================

log_info "Configuring environment variables..."

# Database configuration
export REDIS_URL=${REDIS_URL:-redis://localhost:6379}
export POSTGRES_HOST=${POSTGRES_HOST:-localhost}
export POSTGRES_PORT=${POSTGRES_PORT:-5432}
export POSTGRES_USER=${POSTGRES_USER:-kc}
export POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-kc_password}
export POSTGRES_DB=${POSTGRES_DB:-kc_db}
export PORT="$SERVER_PORT"
export DATABASE_URL=${DATABASE_URL:-postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB}

# Environment configuration (CRITICAL)
export ENVIRONMENT=${ENVIRONMENT:-development}
export NODE_ENV=${NODE_ENV:-development}

# CORS configuration (IMPORTANT)
export CORS_ORIGIN=${CORS_ORIGIN:-"http://localhost:8081,http://localhost:3000,http://localhost:19006"}

# JWT Secret (CRITICAL - required by server)
if [[ -z "${JWT_SECRET:-}" ]]; then
  log_info "Generating JWT_SECRET for local development..."
  export JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  log_success "JWT_SECRET generated: ${JWT_SECRET:0:20}..."
else
  if [[ ${#JWT_SECRET} -lt 32 ]]; then
    log_error "JWT_SECRET must be at least 32 characters long (current: ${#JWT_SECRET})"
    log_error "Generate a new one: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    exit 1
  fi
  log_success "Using provided JWT_SECRET: ${JWT_SECRET:0:20}..."
fi

# Google OAuth Configuration (CRITICAL for auth to work)
export GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-430191522654-o70t2qnqc4bvpvmbpak7unog7pvp9c95.apps.googleusercontent.com}
export EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=${EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:-430191522654-o70t2qnqc4bvpvmbpak7unog7pvp9c95.apps.googleusercontent.com}
export EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=${EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:-430191522654-q05j71a8lu3e1vgf75c2r2jscgckb4mm.apps.googleusercontent.com}
export EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=${EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID:-430191522654-jno2tkl1dotil0mkf4h4hahfk4e4gas8.apps.googleusercontent.com}

echo ""
log_info "Environment Configuration:"
echo "   Environment: $ENVIRONMENT"
echo "   Node Env: $NODE_ENV"
echo "   CORS Origin: $CORS_ORIGIN"
echo "   GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:0:20}..."
echo "   Web Client ID: ${EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:0:20}..."

# ============================================================================
# Database Initialization
# ============================================================================

log_info "Ensuring DB tables (init script)..."
if ! SKIP_FULL_SCHEMA=1 NODE_OPTIONS= \
  POSTGRES_HOST="$POSTGRES_HOST" \
  POSTGRES_PORT="$POSTGRES_PORT" \
  POSTGRES_USER="$POSTGRES_USER" \
  POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  POSTGRES_DB="$POSTGRES_DB" \
  DATABASE_URL="$DATABASE_URL" \
  npx ts-node -r tsconfig-paths/register src/scripts/init-db.ts; then
  log_error "DB init failed. Aborting."
  exit 1
fi
log_success "Database initialized"

# ============================================================================
# Database Migration: UUID Conversion (retry after init-db if needed)
# ============================================================================

log_info "Ensuring UUID conversion migration is applied..."
MIGRATION_FILE="$SERVER_DIR/src/database/migration-uuid-conversion.sql"
if [[ ! -f "$MIGRATION_FILE" ]]; then
  log_warning "Migration file not found: $MIGRATION_FILE - skipping migration"
else
  POSTGRES_CONTAINER=$(docker ps -q -f name=postgres)
  if [[ -n "$POSTGRES_CONTAINER" ]]; then
    # Check if columns are already UUID
    SENDER_ID_TYPE=$(docker exec "$POSTGRES_CONTAINER" psql -U kc -d kc_db -tAc \
      "SELECT data_type FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='sender_id';" 2>/dev/null || echo "")
    
    if [[ "$SENDER_ID_TYPE" != "uuid" ]] && [[ -n "$SENDER_ID_TYPE" ]]; then
      # Run migration
      if docker exec -i "$POSTGRES_CONTAINER" psql -U kc -d kc_db < "$MIGRATION_FILE" 2>/dev/null; then
        log_success "UUID conversion migration completed"
      else
        log_warning "UUID conversion migration had errors (columns may already be UUID or tables may not exist)"
      fi
    else
      log_success "UUID conversion already applied (columns are UUID)"
    fi
  else
    log_warning "Postgres container not found - skipping UUID migration"
  fi
fi

# Final check: ensure dependencies are installed before starting server
cd "$SERVER_DIR"
if [[ ! -f node_modules/body-parser/package.json ]]; then
  log_warning "body-parser not found. Installing dependencies..."
  npm install
  if [[ ! -f node_modules/body-parser/package.json ]]; then
    log_error "Failed to install dependencies. Aborting."
    exit 1
  fi
fi

# ============================================================================
# Server Startup
# ============================================================================

log_info "Starting server on http://localhost:$SERVER_PORT ..."
if [[ -n "${FALLBACK_SERVER_JS:-}" ]]; then
  log_warning "Using fallback: running TS directly via ts-node"
  # ensure dev deps
  if [[ ! -d node_modules ]]; then npm ci || npm install; fi
  SKIP_FULL_SCHEMA=1 \
  GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="$EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID" \
  DATABASE_URL="$DATABASE_URL" \
  REDIS_URL="$REDIS_URL" \
  NODE_ENV="$NODE_ENV" \
  ENVIRONMENT="$ENVIRONMENT" \
  CORS_ORIGIN="$CORS_ORIGIN" \
  JWT_SECRET="$JWT_SECRET" \
  PORT="$PORT" \
  node -r ts-node/register -r tsconfig-paths/register src/main.ts &
else
  SKIP_FULL_SCHEMA=1 \
  GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="$EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID" \
  DATABASE_URL="$DATABASE_URL" \
  REDIS_URL="$REDIS_URL" \
  NODE_ENV="$NODE_ENV" \
  ENVIRONMENT="$ENVIRONMENT" \
  CORS_ORIGIN="$CORS_ORIGIN" \
  JWT_SECRET="$JWT_SECRET" \
  PORT="$PORT" \
  node dist/main.js &
fi
SERVER_PID=$!

# Wait for server to be healthy
log_info "Waiting for server to be healthy..."
ATTEMPTS=0
MAX_ATTEMPTS=80
until curl -sf http://localhost:"$SERVER_PORT"/health >/dev/null 2>&1 || curl -sf http://localhost:"$SERVER_PORT"/ >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [[ $ATTEMPTS -gt $MAX_ATTEMPTS ]]; then
    log_error "Server did not become healthy in time"
    exit 1
  fi
  if [[ $((ATTEMPTS % 10)) -eq 0 ]]; then
    log_info "Still waiting... ($ATTEMPTS/$MAX_ATTEMPTS)"
  fi
  sleep 0.25
done
log_success "Server is up and healthy"

# ============================================================================
# API Tests
# ============================================================================

# Quick smoke-test critical endpoints before starting Expo
log_info "Running API smoke tests..."
set +e
curl -sf http://localhost:"$SERVER_PORT"/api/donations/categories >/dev/null
DONATIONS_OK=$?
curl -sf http://localhost:"$SERVER_PORT"/api/stats/analytics/categories >/dev/null
STATS_OK=$?
set -e
if [[ $DONATIONS_OK -ne 0 || $STATS_OK -ne 0 ]]; then
  log_error "API smoke tests failed (donations=$DONATIONS_OK, stats=$STATS_OK). Not starting Expo."
  exit 1
fi
log_success "API smoke tests passed"

# Extended API tests (non-flaky, no external keys required)
log_info "Running extended API tests..."
set +e

# Test health/redis endpoint
HEALTH_REDIS_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:"$SERVER_PORT"/health/redis)
HEALTH_REDIS_HTTP_CODE=$(echo "$HEALTH_REDIS_RESPONSE" | tail -n1)
HEALTH_REDIS_BODY=$(echo "$HEALTH_REDIS_RESPONSE" | sed '$d')
if [[ "$HEALTH_REDIS_HTTP_CODE" != "200" ]]; then
  log_error "Health/Redis test failed (HTTP $HEALTH_REDIS_HTTP_CODE)"
  echo "Response: $HEALTH_REDIS_BODY"
  HEALTH_REDIS_OK=1
else
  HEALTH_REDIS_OK=0
fi

# Test stats/community endpoint
COMMUNITY_STATS_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:"$SERVER_PORT"/api/stats/community)
COMMUNITY_STATS_HTTP_CODE=$(echo "$COMMUNITY_STATS_RESPONSE" | tail -n1)
COMMUNITY_STATS_BODY=$(echo "$COMMUNITY_STATS_RESPONSE" | sed '$d')
if [[ "$COMMUNITY_STATS_HTTP_CODE" != "200" ]]; then
  log_error "Community stats test failed (HTTP $COMMUNITY_STATS_HTTP_CODE)"
  echo "Response: $COMMUNITY_STATS_BODY"
  COMMUNITY_STATS_OK=1
else
  COMMUNITY_STATS_OK=0
fi

# Test donations/stats/summary endpoint
DONATION_STATS_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:"$SERVER_PORT"/api/donations/stats/summary)
DONATION_STATS_HTTP_CODE=$(echo "$DONATION_STATS_RESPONSE" | tail -n1)
DONATION_STATS_BODY=$(echo "$DONATION_STATS_RESPONSE" | sed '$d')
if [[ "$DONATION_STATS_HTTP_CODE" != "200" ]]; then
  log_error "Donation stats test failed (HTTP $DONATION_STATS_HTTP_CODE)"
  echo "Response: $DONATION_STATS_BODY"
  DONATION_STATS_OK=1
else
  DONATION_STATS_OK=0
fi

# Test chat conversations endpoint - CRITICAL: Check for errors in response body
CHAT_LIST_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:"$SERVER_PORT"/api/chat/conversations/user/550e8400-e29b-41d4-a716-446655440000)
CHAT_LIST_HTTP_CODE=$(echo "$CHAT_LIST_RESPONSE" | tail -n1)
CHAT_LIST_BODY=$(echo "$CHAT_LIST_RESPONSE" | sed '$d')
CHAT_LIST_OK=0
if [[ "$CHAT_LIST_HTTP_CODE" != "200" ]]; then
  log_error "Chat conversations test failed (HTTP $CHAT_LIST_HTTP_CODE)"
  echo "Response: $CHAT_LIST_BODY"
  CHAT_LIST_OK=1
else
  # Check if response contains error message
  if echo "$CHAT_LIST_BODY" | grep -qi '"error"\|"success":\s*false\|operator does not exist'; then
    log_error "Chat conversations test failed - Error in response body:"
    echo "$CHAT_LIST_BODY" | head -20
    CHAT_LIST_OK=1
  fi
fi

# Test notifications endpoint (should not return 404 - endpoint should exist)
NOTIFICATIONS_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:"$SERVER_PORT"/api/collections/notifications?userId=550e8400-e29b-41d4-a716-446655440000)
NOTIFICATIONS_HTTP_CODE=$(echo "$NOTIFICATIONS_RESPONSE" | tail -n1)
NOTIFICATIONS_BODY=$(echo "$NOTIFICATIONS_RESPONSE" | sed '$d')
if [[ "$NOTIFICATIONS_HTTP_CODE" == "404" ]]; then
  NOTIFICATIONS_OK=1
  log_warning "Notifications endpoint returned 404 - routing issue detected"
else
  NOTIFICATIONS_OK=0
  log_success "Notifications endpoint exists (HTTP $NOTIFICATIONS_HTTP_CODE)"
fi

# Redis comprehensive test expects JSON with allTestsPassed=true
REDIS_COMP_RESPONSE=$(curl -s -X POST http://localhost:"$SERVER_PORT"/redis-test/comprehensive -H 'Content-Type: application/json')
if echo "$REDIS_COMP_RESPONSE" | grep -q '"allTestsPassed":true'; then
  REDIS_COMP_OK=0
else
  log_error "Redis comprehensive test failed"
  echo "Response: $REDIS_COMP_RESPONSE"
  REDIS_COMP_OK=1
fi

set -e

# Report failures and exit if any test failed
if [[ $HEALTH_REDIS_OK -ne 0 || $COMMUNITY_STATS_OK -ne 0 || $DONATION_STATS_OK -ne 0 || $CHAT_LIST_OK -ne 0 || $NOTIFICATIONS_OK -ne 0 || $REDIS_COMP_OK -ne 0 ]]; then
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  log_error "EXTENDED API TESTS FAILED - STOPPING SCRIPT"
  echo "═══════════════════════════════════════════════════════════════"
  echo "Test Results:"
  echo "  - Health/Redis: $([ $HEALTH_REDIS_OK -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
  echo "  - Community Stats: $([ $COMMUNITY_STATS_OK -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
  echo "  - Donation Stats: $([ $DONATION_STATS_OK -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
  echo "  - Chat Conversations: $([ $CHAT_LIST_OK -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
  echo "  - Notifications: $([ $NOTIFICATIONS_OK -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
  echo "  - Redis Comprehensive: $([ $REDIS_COMP_OK -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
  echo ""
  log_warning "Please fix the errors above before continuing."
  echo "═══════════════════════════════════════════════════════════════"
  exit 1
fi
log_success "Extended API tests passed"

# ============================================================================
# Client (Expo) Startup
# ============================================================================

cd "$CLIENT_DIR"
log_info "Starting Expo (API=http://localhost:$SERVER_PORT)"

# CRITICAL: Remove old static HTML file that interferes with Expo web
if [[ -f "$CLIENT_DIR/public/index.html" ]]; then
  log_warning "Removing old static HTML file (public/index.html) that interferes with Expo web"
  mv "$CLIENT_DIR/public/index.html" "$CLIENT_DIR/public/index.html.old" 2>/dev/null || true
fi

if [[ ! -d node_modules ]]; then 
  log_info "Installing client dependencies..."
  npm ci || npm install
fi

export EXPO_PUBLIC_API_BASE_URL=http://localhost:"$SERVER_PORT"
export EXPO_PUBLIC_USE_BACKEND=1
export EXPO_PUBLIC_USE_FIRESTORE=0

# Clear cache before starting to avoid circular dependency issues
log_info "Clearing Metro cache..."
rm -rf "$CLIENT_DIR/.expo" "$CLIENT_DIR/node_modules/.cache" 2>/dev/null || true

# ============================================================================
# Final User Message
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🎉 Local E2E Environment is Ready!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📍 Server: http://localhost:$SERVER_PORT"
echo "📍 Expo:   http://localhost:$EXPO_PORT"
echo ""
echo "🔧 Environment: $ENVIRONMENT"
echo "🗄️  Database: $POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB"
echo "📦 Redis: $REDIS_URL"
echo ""
echo "💡 Tips:"
echo "   - Press Ctrl+C to stop all services"
echo "   - Server logs: Check terminal output"
echo "   - Database: docker exec -it \$(docker ps -q -f name=postgres) psql -U kc -d kc_db"
echo "   - Redis: docker exec -it \$(docker ps -q -f name=redis) redis-cli"
echo ""
echo "⚠️  IMPORTANT: Open http://localhost:$EXPO_PORT in your browser"
echo "   (NOT http://localhost:3001 or any other port)"
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

# Start Expo
EXPO_DEV_SERVER_PORT="$EXPO_PORT" npx expo start --port "$EXPO_PORT" --web --clear
