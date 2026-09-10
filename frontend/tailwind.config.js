/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mine: {
          bg: "#0B0F17",
          card: "#131B2A",
          border: "#1E293B",
          accent: "#0284C7",
          warning: "#F59E0B",
          danger: "#EF4444",
          success: "#10B981",
          gold: "#EAB308",
          dark: "#080C14"
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
