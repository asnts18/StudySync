/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        'primary-yellow': '#FFEB55',
        'dark-yellow': '#DECD4B',
        'light-orange': '#FFB07A'
      }
    },
  },
  plugins: [],
}