#!/bin/bash
set -e

# ==============================================================================
# PROJECT APEX: FULL-STACK DEPLOYMENT & TUNNELING ENGINE (WSL/DEBIAN)
# ==============================================================================

# ASCII Art
cat << "EOF"
    _    ____  _______  __
   / \  |  _ \| ____\ \/ /
  / _ \ | |_) |  _|  \  / 
 / ___ \|  __/| |___ /  \ 
/_/   \_\_|   |_____/_/\_\ 
==============================================================
EOF

# Progress Bar
load_bar() {
    local pid=$1
    local width=40
    while [ -d /proc/$pid ]; do
        for ((i=0; i<=width; i++)); do
            if [ ! -d /proc/$pid ]; then break; fi
            printf "\r["
            printf "%${i}s" | tr ' ' '='
            printf "%$((width-i))s" | tr ' ' ' '
            printf "] %d%%" $((i*100/width))
            sleep 0.05
        done
    done
    printf "\r[========================================] 100%%"
}

# 1. Dependency Installation (Debian/WSL)
echo -n "🔍 Installing system dependencies..."
sudo apt-get update -y > /dev/null 2>&1
sudo apt-get install -y nodejs npm nginx php-fpm curl > /dev/null 2>&1 &
load_bar $!
echo " Done."

# Install cloudflared if missing
if ! command -v cloudflared &> /dev/null; then
    echo -n "Installing cloudflared..."
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb > cloudflared.deb 2>/dev/null
    sudo dpkg -i cloudflared.deb > /dev/null 2>&1 &
    load_bar $!
    rm cloudflared.deb
    echo " Done."
fi

# 2. Setup & Build
echo -n "📦 Installing project dependencies..."
INSTALL_LOG="install_inspection.log"
if ! npm install --quiet > "$INSTALL_LOG" 2>&1; then
    echo " FAILED!"
    echo "==============================================="
    echo "INSTALL FAILED. INSPECTION LOG CREATED: $INSTALL_LOG"
    tail -n 20 "$INSTALL_LOG"
    echo "==============================================="
    exit 1
fi
echo " Done."

echo -n "🏗️ Building project..."
BUILD_LOG="build_inspection.log"
if ! npm run build > "$BUILD_LOG" 2>&1; then
    echo " FAILED!"
    echo "==============================================="
    echo "BUILD FAILED. INSPECTION LOG CREATED: $BUILD_LOG"
    tail -n 20 "$BUILD_LOG"
    echo "==============================================="
    exit 1
fi
echo " Done."

# 3. Setup Nginx & PHP
echo -n "🌐 Configuring Nginx for PHP-FPM..."
# Dynamically update the root path in the nginx config
sed -i "s|root /home/runner/work/scotia/scotia/dist;|root $(pwd)/dist;|" scotia_nginx.conf
sudo cp scotia_nginx.conf /etc/nginx/sites-available/default
sudo systemctl restart nginx
echo " Done."

# 4. Start Backend
echo -n "⚡ Starting API Backend..."
npm start > /dev/null 2>&1 &
API_PID=$!
sleep 2 # Let it start
echo " Done (PID: $API_PID)."

# 4. Tunnel
echo -n "🌉 Initiating Cloudflare Tunnel..."
TUNNEL_LOG=$(mktemp)
cloudflared tunnel --url http://localhost:80 > "$TUNNEL_LOG" 2>&1 &
TUNNEL_PID=$!
sleep 5 # Wait for tunnel
echo " Done."

# Extract Public URL
PUBLIC_URL=$(grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' "$TUNNEL_LOG" | head -n 1)

if [ -z "$PUBLIC_URL" ]; then
    PUBLIC_URL="[PENDING_TUNNEL_URL]"
fi

# 5. Clean Terminal
clear

# 6. Display Clean Info
cat << "EOF"
    _    ____  _______  __
   / \  |  _ \| ____\ \/ /
  / _ \ | |_) |  _|  \  / 
 / ___ \|  __/| |___ /  \ 
/_/   \_\_|   |_____/_/\_\ 
==============================================================
EOF
echo "LINK: ${PUBLIC_URL}/?token=projectsarah"
echo "USER: ${ADMIN_USER:-admin}"
echo "PASS: ${ADMIN_PASS:-password}"

# Keep alive
wait $API_PID $TUNNEL_PID
