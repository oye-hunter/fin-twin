import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#121718',
        paper: '#ffffff',
        linen: '#f6f3ef',
        parchment: '#e4e0dd',
        graphite: '#2f2f2f',
        slate: '#444444',
        honey: '#ffcd6d',
        apricot: '#ffe2aa',
      },
      borderRadius: {
        pill: '12px',
        card: '12px',
        btn: '12px',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
