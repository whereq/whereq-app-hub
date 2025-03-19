import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import yaml from '@rollup/plugin-yaml'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), tsconfigPaths(), yaml(), svgr()],
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  assetsInclude: ["**/*.svg"], // Ensure SVGs are treated as assets
  optimizeDeps: {
    include: ['mathjax-full']
  },
})
