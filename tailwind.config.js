/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#0B1F3A',
        'brand-gold': '#C9A227',
        'brand-bg': '#F7F5F0',
        'brand-text': '#1A1A1A',
        'status-confirmed': '#3E7E57',
        'status-pending': '#B4882E',
        'status-rejected': '#A34A4A',
      },
    },
  },
  plugins: [],
}
