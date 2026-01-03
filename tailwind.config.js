/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FFFEF0',
          100: '#FFF9D0',
          200: '#FFF2A0',
          300: '#FFEB70',
          400: '#FFE440',
          500: '#FFD700',
          600: '#D4AF37',
          700: '#B8860B',
          800: '#9B6E08',
          900: '#7D5606',
        },
        luxury: {
          dark: '#0F172A',
          darker: '#1E293B',
          light: '#334155',
          lighter: '#475569',
        }
      },
      fontFamily: {
        'luxury': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 10px 40px rgba(212, 175, 55, 0.4)',
      }
    },
  },
  plugins: [],
}