/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saare: {
          dark: '#020617',
          card: '#0f172a',
          border: '#1e293b',
          accent: '#2563eb',
          cyan: '#38bdf8',
          gold: '#f59e0b'
        }
      }
    },
  },
  plugins: [],
}
