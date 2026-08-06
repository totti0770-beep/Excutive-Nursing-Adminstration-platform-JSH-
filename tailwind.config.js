/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/templates/**/*.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'sans-serif'],
      },
      colors: {
        brand: {
          gold: '#C9A227',
          dark: '#0f172a',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
