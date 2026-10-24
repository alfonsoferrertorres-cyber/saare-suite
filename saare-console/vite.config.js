import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true // Obliga a Vite a usar el 3000 y fallar si está ocupado
  },
  build: {
    chunkSizeWarningLimit: 1000, // Eleva el umbral de advertencia a 1000 kB
    rollupOptions: {
      output: {
        manualChunks(id) {
          // División estratégica de librerías vendor para optimizar la caché
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('jszip') || id.includes('purify')) {
              return 'vendor-pdf-export';
            }
            return 'vendor-deps';
          }
        }
      }
    }
  }
})