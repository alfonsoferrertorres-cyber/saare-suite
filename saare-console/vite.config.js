import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true // Obliga a Vite a usar el 3000 y fallar si está ocupado, evitando que salte al 3001
  }
})