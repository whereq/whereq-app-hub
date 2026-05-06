import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  assetsInclude: ["**/*.svg"], // Ensure SVGs are treated as assets
  optimizeDeps: {
    include: ['mathjax-full']
  },
  server: {
    proxy: {
      '/realms/whereq': {
        target: 'https://www.keytomarvel.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
