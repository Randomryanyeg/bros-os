/**
 * PM2 Ecosystem Configuration for Debian Deployment
 * Used to manage the three main components of the Scotiabank PWA:
 * 1. Node.js Orchestrator (Vite + Express)
 * 2. Python Status Helper (Flask)
 * 3. PHP Router Helper
 */

module.exports = {
  apps: [
    {
      name: "scotia-node",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        SKIP_HELPERS: "true"
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: "scotia-php",
      script: "php",
      args: "-S 127.0.0.1:8000 server/router.php",
      interpreter: "none",
      cwd: "./",
      autorestart: true
    },
    {
      name: "scotia-python",
      script: "python3",
      args: "server/main.py",
      interpreter: "none",
      autorestart: true,
      error_file: "server/python_core.log",
      out_file: "server/python_core.log"
    },
    {
      name: "scotia-tunnel",
      script: "cloudflared",
      args: "tunnel --url http://127.0.0.1:3000",
      interpreter: "none",
      autorestart: true
    }
  ]
};
