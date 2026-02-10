/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#e0ebff',
          500: '#667eea',
          600: '#5b6fcf',
          700: '#4c5fb8',
        },
        secondary: {
          500: '#764ba2',
          600: '#6a4391',
        }
      }
    },
  },
  plugins: [],
}
