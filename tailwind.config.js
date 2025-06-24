/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // Tab button gradient backgrounds
    {
      pattern: /bg-gradient-to-r/,
    },
    {
      pattern: /from-(red|blue|green|yellow|purple|pink|indigo|gray|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-(400|500|600)/,
    },
    {
      pattern: /to-(red|blue|green|yellow|purple|pink|indigo|gray|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-(400|500|600)/,
    },
    {
      pattern: /shadow-(red|blue|green|yellow|purple|pink|indigo|gray|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-(400|500|600)\/25/,
    },
  ],
} 