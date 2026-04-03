/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: "#00BFFF",
        background: {
          dark: "#1C1C1C",
          surface: "#262626",
          light: "#F7F7F7",
        },
        card: {
          dark: "#262626",
          metric: "#FFFFFF",
          border: "#333333",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
