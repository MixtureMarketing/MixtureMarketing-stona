/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontSize: {
        xxs: '0.625rem', // 10px
        xxxs: '0.5rem', // 8px
      },
      colors: {
        gray: {
          400: '#4b5563', // Actually Tailwind's gray-600 (WCAG AA compliant on white)
          500: '#374151', // Actually Tailwind's gray-700
        },
      },
    },
  },
  plugins: [],
};
