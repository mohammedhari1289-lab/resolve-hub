import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#ecf8f7", 100: "#d0eeec", 200: "#a3ddda", 300: "#6cc5c1", 400: "#3aa7a4",
          500: "#1f8b89", 600: "#0e7c7b", 700: "#0d6262", 800: "#0f4e4e", 900: "#10403f",
        },
        ink: { 800: "#14212e", 900: "#0c1620", 950: "#080f16" },
      },
    },
  },
  plugins: [],
};
export default config;
