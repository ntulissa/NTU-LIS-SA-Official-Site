import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // 改用更安全的相對路徑，避開 __dirname 地雷
      '@': '/src',
    },
  },

  // 針對你現在的 Mac 本機環境優化（移除雲端專用的 hmr 與 0.0.0.0）
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: false, // 讓它如果 3000 被卡住會自動跳 3001，不會直接當掉
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],
})
