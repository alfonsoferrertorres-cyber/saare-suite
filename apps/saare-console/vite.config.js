// saare-console/vite.config.js — Configuración de empaquetado optimizada para Cloudflare Pages
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true // Obliga a Vite a usar el puerto 3000 y fallar si está ocupado
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1000, // Umbral de advertencia elevado a 1000 kB
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Normalizar separadores de ruta en la entrada para compatibilidad Windows / Linux / macOS
          const normalizedId = id.replace(/\\/g, '/');

          if (normalizedId.includes('node_modules')) {
            // Agrupación estricta del núcleo de React y sus dependencias internas
            if (
              normalizedId.includes('/node_modules/react/') ||
              normalizedId.includes('/node_modules/react-dom/') ||
              normalizedId.includes('/node_modules/scheduler/') ||
              normalizedId.includes('/node_modules/use-sync-external-store/') ||
              normalizedId.includes('/node_modules/react-is/')
            ) {
              return 'vendor-react';
            }

            // Librerías pesadas de exportación documental y procesamiento
            if (
              normalizedId.includes('jspdf') ||
              normalizedId.includes('html2canvas') ||
              normalizedId.includes('jszip') ||
              normalizedId.includes('dompurify') ||
              normalizedId.includes('purify')
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