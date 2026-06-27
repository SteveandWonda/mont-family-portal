/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dce7ff',
          500: '#4f72e3',
          600: '#3b5bd9',
          700: '#2d48c4',
          900: '#1a2d7a',
        },
      },
    },
  },
  plugins: [],
}
