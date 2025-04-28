import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: '#3b82f6',
              textDecoration: 'underline',
              '&:hover': {
                color: '#2563eb',
              },
            },
            p: {
              margin: '0',
            },
            ul: {
              margin: '0.5em 0',
            },
            li: {
              margin: '0.25em 0',
            },
            pre: {
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              padding: '1em',
              borderRadius: '0.5em',
              overflow: 'auto',
            },
            code: {
              color: 'inherit',
              padding: '0.2em 0.4em',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '0.25em',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
