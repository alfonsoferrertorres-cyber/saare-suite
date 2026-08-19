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
          gold: '#C5A059',
          cyan: '#00f0ff',
          dark: '#050811'
        }
      }
    },
  },
  plugins: [],
}