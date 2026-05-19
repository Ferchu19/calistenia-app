/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#22c55e",
        "primary-dark": "#16a34a",
        "bg-primary": "#0a0a0a",
        "bg-secondary": "#111111",
        "bg-card": "#1a1a1a",
        "border-dark": "#2a2a2a",
      }
    },
  },
  plugins: [],
}