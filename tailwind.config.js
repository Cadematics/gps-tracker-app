/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#2563EB",
        "background-light": "#F8FAFC",
        "background-dark": "#111621",
        "card-light": "#FFFFFF",
        "card-dark": "#1E293B",
        "text-primary-light": "#1E293B",
        "text-primary-dark": "#F8FAFC",
        "text-secondary-light": "#64748B",
        "text-secondary-dark": "#94A3B8",
        "border-light": "#CBD5E1",
        "border-dark": "#475569",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px"},
    },
  },
  plugins: [],
}
