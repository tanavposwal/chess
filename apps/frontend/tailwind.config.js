/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chess': {
          dark: "#739552",
          light: "#ebecd0"
        },
      },
    }
  },
  plugins: [],
}
