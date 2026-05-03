#!/bin/bash
set -e

# Unified Setup, Test, and Deployment Script (Project Apex)

echo "=========================================="
echo "Project Apex - Unified Automation Suite"
echo "=========================================="

# 1. Dependency Alignment
echo "-> Aligning dependencies..."
npm install --quiet

# 2. Testing
echo "-> Running sanity checks..."
# Assuming 'lint' covers basic checks. Check package.json for test scripts.
npm run lint

# 3. Build
echo "-> Building production assets..."
npm run build

# 4. Deployment/Readying
echo "--------------------------------------------------------"
echo "System Ready for Deployment"
echo "To launch the full system (PHP Frontend / Python Backend):"
echo "  ./launcher.sh"
echo "--------------------------------------------------------"
echo "NOTE: Because this app uses distinct Frontend (PHP) and"
echo "Backend (Python) components, it requires TWO tunnels."
echo "One single URL cannot bridge both components simultaneously "
echo "without a proper API Gateway configuration."
echo "--------------------------------------------------------"
