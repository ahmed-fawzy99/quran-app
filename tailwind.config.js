import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import colors from "tailwindcss/colors.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue, js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Segoe UI Symbol', ...defaultTheme.fontFamily.sans],
        kitab: ['kitab', 'sans'],
        rubik: ['Rubik', 'sans'],
      },
      colors: {
        base: colors.neutral,
        primary: colors.orange,
      },
    },
  },

  darkMode: "class",
  plugins: [
    forms,
  ],
};
