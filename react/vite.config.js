import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // La API (server/) corre en 3002; ver AGENTS.md (Environment quirks).
      // Se puede sobreescribir: API_URL=http://localhost:3001 npm run dev
      '/api': {
        target: process.env.API_URL || 'http://localhost:3002',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.API_URL || 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
})
