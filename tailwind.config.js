/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#E85A1C", // Burnt Orange
          gold: "#D4AF37", // Midnight Gold
          navy: "#0D1B2A", // Midnight Blue
          ink: "#1A1A1A", // Ink
          muted: "#6B7280", // Muted
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
