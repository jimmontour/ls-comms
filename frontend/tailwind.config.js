/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#030712',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155'
        },
        emerald: {
          400: '#34d399',
          600: '#059669',
          700: '#047857'
        }
      }
    }
  },
  plugins: []
};
