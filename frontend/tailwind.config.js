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
        accent: {
          DEFAULT: "#00BFFF",
          dark: "#0099CC",
          light: "#33CCFF",
          foreground: "#FFFFFF",
        },
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
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      animation: {
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 4s infinite',
        'fade-in': 'fadeIn 1.2s ease-out forwards',
        'silk-float': 'silkFloat 20s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        silkFloat: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '100%': { transform: 'translate(20px, 30px) scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
}
