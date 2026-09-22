import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  appType: 'spa',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    cors: true,
    proxy: {
      '/v1': {
        target: 'https://api.saare.es',
        changeOrigin: true,
        secure: true
      },
      '/api': {
        target: 'http://127.0.0.1:8787', // Cambia a 'https://api.saare.es' si prefieres apuntar directamente a producción
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});