#!/bin/bash

# Deployment Setup Script

echo "=========================================="
echo "Project Apex - Environment Setup Utility"
echo "=========================================="
echo "Select Setup Option:"
echo "1) Option A: Standard Node.js Full-Stack"
echo "2) Option B: Static Build for PHP Webroot (Requires API Proxy)"
echo "=========================================="

read -p "Enter your choice [1 or 2]: " choice

setup_node() {
    echo "--- Setting up Standard Node.js Environment ---"
    npm install
    npm run build
    echo "Setup Complete."
    echo "Run './launcher.sh' or 'npm start' to begin."
}

setup_php_webroot() {
    echo "--- Setting up for PHP Webroot ---"
    # Build the frontend to static files
    npm install
    npm run build
    
    read -p "Enter your target PHP webroot path (e.g., /var/www/html/app): " webroot
    
    if [ -d "$webroot" ]; then
        echo "Copying static build to $webroot..."
        cp -r dist/* "$webroot/"
        echo "Static files copied successfully."
        echo "--------------------------------------------------------"
        echo "REQUIRED NEXT STEP FOR OPTION B:"
        echo "Configure your Nginx/Apache to proxy '/api' requests to"
        echo "your node server running on the appropriate port."
        echo "Example Nginx snippet:"
        echo "location /api/ { proxy_pass http://localhost:3000; }"
        echo "--------------------------------------------------------"
    else
        echo "Error: Webroot path $webroot does not exist."
    fi
}

case $choice in
    1) setup_node ;;
    2) setup_php_webroot ;;
    *) echo "Invalid option selected." ;;
esac
