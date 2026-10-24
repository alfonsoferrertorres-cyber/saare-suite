import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true // Obliga a Vite a usar el puerto 3000 y fallar si está ocupado
  },
  build: {
    chunkSizeWarningLimit: 1000, // Eleva el umbral de advertencia a 1000 kB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Agrupación estricta del núcleo de React y sus dependencias internas
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/scheduler/') ||
              id.includes('/use-sync-external-store/') ||
              id.includes('/react-is/')
            ) {
              return 'vendor-react';
            }
            // Librerías pesadas de exportación documental
            if (
              id.includes('jspdf') ||
              id.includes('html2canvas') ||
              id.includes('jszip') ||
              id.includes('purify')
            ) {
              return 'vendor-pdf-export';
            }
            // Resto de dependencias de terceros
            return 'vendor-deps';
          }
        }
      }
    }
  }
})