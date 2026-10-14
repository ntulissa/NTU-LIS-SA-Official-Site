import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// 從模組路徑取出套件名稱（相容 pnpm 的 node_modules/.pnpm/... 結構）
function getPackageName(id) {
  const parts = id.split('node_modules/')
  const last = parts[parts.length - 1]
  const segs = last.split('/')
  return segs[0].startsWith('@') ? `${segs[0]}/${segs[1]}` : segs[0]
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },

  // 本機開發設定
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: false, // 3000 被佔用時自動改用 3001
  },

  build: {
    rollupOptions: {
      output: {
        // 把大型套件拆成獨立檔案：
        // 1. 單一檔案變小，手機載入更順
        // 2. 瀏覽器可以快取，網站更新時使用者不用重新下載這些套件
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          const pkg = getPackageName(id)

          if (['react', 'react-dom', 'scheduler', 'react-router'].includes(pkg)) {
            return 'react-vendor'
          }
          if (pkg.startsWith('@mui/') || pkg.startsWith('@emotion/')) {
            return 'mui'
          }
          if (pkg === 'recharts' || pkg.startsWith('d3-') || pkg === 'victory-vendor') {
            return 'charts'
          }
          if (pkg === 'motion' || pkg === 'framer-motion' || pkg.startsWith('motion-')) {
            return 'motion'
          }
          if (pkg.startsWith('@radix-ui/')) {
            return 'radix'
          }
          return 'vendor'
        },
      },
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],
})