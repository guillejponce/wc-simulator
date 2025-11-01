/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wc-black': 'var(--wc-black)',
        'wc-white': 'var(--wc-white)',
        'wc-gold': 'var(--wc-gold)',
        'wc-light-gray': 'var(--wc-light-gray)',
        'wc-dark-gray': 'var(--wc-dark-gray)',
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        accent: 'var(--accent-color)',
        text: 'var(--text-color)',
        'text-light': 'var(--light-text)',
        background: 'var(--background-color)',
      },
      fontFamily: {
        'sans': ['Noto Sans', 'sans-serif'],
        'bebas': ['Bebas Neue', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} 