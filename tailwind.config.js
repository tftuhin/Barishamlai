/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#F8FFFE',  /* Off White */
          100: '#E1F5EE',  /* Soft Green */
          200: '#9FE1CB',  /* Pale Mint */
          300: '#5DCAA5',  /* Mint */
          400: '#1D9E75',  /* Brand Green */
          500: '#1D9E75',  /* Brand Green (primary) */
          600: '#0F6E56',  /* Forest Mid */
          700: '#085041',  /* Deep Forest */
          800: '#1A2E2A',  /* Brand Dark */
          900: '#0A1A14',
        },
        surface: {
          DEFAULT: '#F8FFFE',
          subtle:  '#E1F5EE',
          gray:    '#F5F5F3',
          border:  'rgba(0,0,0,0.08)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-8px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
