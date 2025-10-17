/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        estedad: ['EstedadFD', 'sans-serif'],
        parsagold: ['ParsagoldFont', 'sans-serif'],
      },
      colors: {
        // ✅ رنگ طلایی زردتر
        golden: {
          50: '#fffdf0',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',  // رنگ اصلی طلایی زرد
          500: '#eab308',  // زرد طلایی
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        }
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(-30px)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
}