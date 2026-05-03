#!/bin/bash
set -e

echo "=========================================="
echo "Project Apex - One-Shot Deployment"
echo "=========================================="

# 1. Run Setup (includes cleanup and dependency sync)
echo "-> Starting Setup..."
./unified_setup.sh

# 2. Run Deployment
echo "-> Starting Deployment..."
./unified_deploy.sh

# 3. Launch
echo "-> Launching System..."
./launcher.sh --auto
