/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        rbk: {
          black: '#0A0A0A',
          dark: '#111111',
          card: '#1A1A1A',
          border: '#2A2A2A',
          gold: '#F5C518',
          'gold-light': '#FFD740',
          'gold-dark': '#C9A800',
          muted: '#888888',
          light: '#CCCCCC',
        },
      },
    },
  },
  plugins: [],
}
