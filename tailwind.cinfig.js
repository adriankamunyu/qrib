/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0f766e",
          dark: "#0b5a54",
          light: "#14b8a6",
        },
        ink: "#0f172a",
        muted: "#475569",
        faint: "#94a3b8",
        line: "#e2e8f0",
        panel: "#f8fafc",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};