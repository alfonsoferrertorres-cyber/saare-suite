import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

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
    strictPort: true, // Obliga a usar el puerto 3000 para no desalinear las redirecciones
    host: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787', // Worker local / Control Plane
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          graphics: ['three', '@react-three/fiber', '@react-three/drei']
        }
      }
    }
  }
});