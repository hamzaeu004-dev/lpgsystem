/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f9f3',
          100: '#e2f2e4',
          200: '#c5e6c7',
          300: '#a5d6a7', // Primary Brand Color
          400: '#81c784',
          500: '#66bb6a',
          600: '#4caf50',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20',
          950: '#0f2912',
        },
        primary: {
          DEFAULT: '#A5D6A7',
          hover: '#92cd95',
          dark: '#2e7d32',
          text: '#0f2912',
          light: '#f2f9f3',
          border: '#cde9cf',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};