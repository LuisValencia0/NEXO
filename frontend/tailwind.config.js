/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nexo-bg':        '#07080f',
        'nexo-surface':   '#0e1020',
        'nexo-border':    '#1a1d33',
        'nexo-text':      '#eef0f8',
        'nexo-muted':     '#8a8fb0',
        'nexo-accent':    '#6d8bff',
        'nexo-accent-2':  '#b06dff',
        'nexo-accent-3':  '#58e0ff',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}