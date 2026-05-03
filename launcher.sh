#!/usr/bin/env bash
# ==============================================================================
# PROJECT APEX // SHΔDØW CORE // PRODUCTION LAUNCHER
# ==============================================================================
set -euo pipefail

# --- CONFIGURATION ---
UI_PORT=3002
PY_PORT=8081
LOG_DIR="$(pwd)/server/logs"
UI_LOG="${LOG_DIR}/ui.log"
PY_LOG="${LOG_DIR}/python.log"
CF_UI_LOG="${LOG_DIR}/cf_ui.log"
CF_GW_LOG="${LOG_DIR}/cf_gateway.log"
CF_URL_REGEX='https://[-a-zA-Z0-9]*\.trycloudflare\.com'

mkdir -p "$LOG_DIR"

# --- HELPERS ---
error() { echo -e "\n[!] ERROR: $1" >&2; exit 1; }
cleanup() {
    echo -e "\n[!] Shutting down..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# --- 1. ENVIRONMENT CLEANUP ---
fuser -k "${UI_PORT}/tcp" "${PY_PORT}/tcp" >/dev/null 2>&1 || true
rm -rf dist server/__pycache__ venv node_modules .vite-temp "${LOG_DIR:?}"/* /tmp/admin_initialized


# --- 2. DEPENDENCIES ---
npm install --no-audit --no-fund --quiet --prefer-offline --no-package-lock

cd server
[ ! -d "venv" ] && python3 -m venv venv
VENV_PYTHON="$(pwd)/venv/bin/python"
[ -f "requirements.txt" ] && "$VENV_PYTHON" -m pip install -r requirements.txt --quiet
cd ..

# --- 3. BUILD ---
npx vite build --emptyOutDir >/dev/null 2>&1

# --- 4. START SERVICES ---
# Python
SERVER_DIR="$(pwd)/server"
"$VENV_PYTHON" "${SERVER_DIR}/main.py" > "$PY_LOG" 2>&1 &
PY_PID=$!

# PHP
php -S 127.0.0.1:${UI_PORT} -t "$SERVER_DIR" "${SERVER_DIR}/router.php" > "$UI_LOG" 2>&1 &

# Wait for core
for i in {1..20}; do
    if curl -s "http://127.0.0.1:${PY_PORT}/health" >/dev/null 2>&1; then break; fi
    sleep 1
    if ! kill -0 $PY_PID 2>/dev/null; then error "Python core crashed. Check $PY_LOG"; fi
done

# --- 5. CLOUDFLARE ---
[ ! -x "./cloudflared" ] && curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared && chmod +x cloudflared

./cloudflared tunnel --url "http://127.0.0.1:${UI_PORT}" --no-autoupdate > "$CF_UI_LOG" 2>&1 &
./cloudflared tunnel --url "http://127.0.0.1:${PY_PORT}" --no-autoupdate > "$CF_GW_LOG" 2>&1 &

# Extract URLs
UI_URL=$(grep -oE "$CF_URL_REGEX" "$CF_UI_LOG" | head -n1 || echo "FAILED")
GW_URL=$(grep -oE "$CF_URL_REGEX" "$CF_GW_LOG" | head -n1 || echo "FAILED")

# --- OUTPUT ---
clear
echo ">> DEFAULT LOGIN: admin@scotia.com / Password123!"
echo ""
echo ">> SYSTEM READY"
echo "   UI:  ${UI_URL}"
echo "   API: ${GW_URL}"
echo ""
echo ">> Logs streaming (Ctrl+C to quit)..."
tail -f "$UI_LOG" "$PY_LOG" "$CF_UI_LOG" "$CF_GW_LOG"
