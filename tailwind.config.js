/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: '#faf9f7',
        'cream-dark': '#f0ede8',
        pastel: {
          purple:       '#e8e0f5',
          'purple-text':'#7c5cbf',
          blue:         '#ddeeff',
          'blue-text':  '#3b82c4',
          pink:         '#fce8f0',
          'pink-text':  '#c4517a',
          green:        '#e2f5e8',
          'green-text': '#3d9c5a',
          yellow:       '#fdf5d8',
          'yellow-text':'#b08a1e',
          coral:        '#ffe4e1',
          'coral-text': '#d95f5f',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(0,0,0,0.06)',
        card: '0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
      }
    }
  },
  plugins: []
}
