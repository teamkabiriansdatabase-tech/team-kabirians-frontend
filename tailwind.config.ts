import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            DEFAULT: '#1E3A8A', // Classic Deep Royal Blue
            light: '#3B82F6',
            dark: '#0F172A',
          },
          red: {
            DEFAULT: '#DC2626', // Primary Accent Red
            hover: '#B91C1C',
            light: '#FEE2E2',
          },
          white: '#FFFFFF',
          gray: {
            bg: '#F8FAFC',
            border: '#E2E8F0',
          }
        },
      },
    },
  },
  plugins: [],
};
export default config;