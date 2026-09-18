/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'saare-bg': '#030712',
        'saare-surface': '#0A101E',
        'saare-surface-2': '#121A2D',
        'saare-line': '#232E42',
        'saare-line-hi': '#394A65',
        'saare-ink': '#EDF2F8',
        'saare-ink-dim': '#98A6B7',
        'saare-ink-faint': '#606D7E',
        'saare-allow': '#1EB968',
        'saare-deny': '#EF4444',
        'saare-seal': '#D4AF37',
        'saare-accent': '#38BDDB',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}