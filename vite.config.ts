import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Bind to 0.0.0.0 so GitHub Codespaces can forward the preview correctly.
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // Allow ANY host through Vite's host check (needed for tunnels like
    // cloudflared / trycloudflare.com, and for Codespaces).
    allowedHosts: true,
    // Let the HMR (hot-reload) websocket work through the Codespaces HTTPS proxy.
    hmr: {
      clientPort: 443,
    },
  },

  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true,
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})