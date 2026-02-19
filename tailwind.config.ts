import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          500: '#737373',
          600: '#171717',
          700: '#0a0a0a',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
