import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          DEFAULT: "#D85A30",
          50: "#FEF3EE",
          100: "#FDE3D6",
          200: "#FBC4AD",
          300: "#F79C79",
          400: "#F27043",
          500: "#D85A30",
          600: "#C04A24",
          700: "#9F3A1E",
          800: "#7F311F",
          900: "#682B1D",
        },
        mint: {
          DEFAULT: "#1D9E75",
          50: "#EEFBF5",
          100: "#D5F6E6",
          200: "#AEEDD1",
          300: "#79DEB5",
          400: "#43C894",
          500: "#1D9E75",
          600: "#12885F",
          700: "#0E6D4E",
          800: "#0E573F",
          900: "#0C4735",
        },
        warm: {
          bg: "#FAFAF8",
          card: "#FFFFFF",
          border: "#E8E6E1",
          text: "#2C2C2A",
          "text-secondary": "#6B6B69",
          "text-muted": "#9C9C9A",
        },
      },
      fontFamily: {
        sans: ["Pretendard", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
