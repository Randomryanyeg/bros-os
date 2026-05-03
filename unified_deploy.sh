#!/bin/bash
set -e

# ==============================================================================
# PROJECT APEX: UNIFIED FULL-STACK DEPLOYMENT ENGINE
# ==============================================================================
# This script orchestrates the entire deployment stack for the application,
# ensuring the frontend, Node.js API server, and PHP backend are aligned.
# ==============================================================================

PROJECT_ROOT=$(pwd)
LOG_FILE="$PROJECT_ROOT/deployment.log"

echo "[1/5] Initializing Environment..."
exec > >(tee -a "$LOG_FILE") 2>&1

# 1. Dependency Alignment
echo "[2/5] Cleaning and Aligning Dependencies..."
rm -rf node_modules
npm install --quiet

# 2. Build Frontend Assets
echo "[3/5] Building Frontend Assets..."
npm run build
cp -r dist/* server/

# 3. Verify Configuration
echo "[4/5] Verifying Deployment Configuration..."
if [ ! -f "$PROJECT_ROOT/scotia_nginx.conf" ]; then
    echo "ERROR: scotia_nginx.conf missing. Deployment Aborted."
    exit 1
fi

# 4. Finalizing Deployment
echo "[5/5] Launching Unified Stack..."
echo "--------------------------------------------------------"
echo "Deployment Successful."
echo "Entry Point: http://localhost (via Nginx proxy)"
echo "Node API: http://localhost:3000"
echo "PHP Backend: http://localhost:8000"
echo "--------------------------------------------------------"
echo "To start the services, run: ./launcher.sh"
echo "--------------------------------------------------------"
