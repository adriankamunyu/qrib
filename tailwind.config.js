/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#2563eb",
        ink: "#0f172a",
        muted: "#64748b",
        line: "#e2e8f0",
      },
    },
  },
  plugins: [],
};
