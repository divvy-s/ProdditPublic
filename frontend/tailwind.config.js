/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'proddit-orange': '#FF4500',
        'proddit-blue': '#0079D3',
        'proddit-dark': '#1A1A1B',
        'proddit-light': '#F8F9FA',
        // Dark mode colors
        'dark-bg': '#1a1a1b',
        'dark-card': '#272729',
        'dark-border': '#343536',
        'dark-text': '#d7dadc',
        'dark-text-secondary': '#818384',
      }
    },
  },
  plugins: [],
}
