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
                            // 브랜드 키컬러: 2026-04-17 coral(#D85A30) → warm yellow(amber-500 #F59E0B)로 리브랜딩.
                    // 코드 전체가 `bg-coral`, `text-coral`, `border-coral-50` 등 `coral-*` 클래스명에
                    // 묶여있어 토큰 이름은 유지한 채 값만 교체. 후속 리팩토링 시 `brand-*`로 리네이밍 예정.
                    coral: {
                                DEFAULT: "#F59E0B",
                                50: "#FFFBEB",
                                100: "#FEF3C7",
                                200: "#FDE68A",
                                300: "#FCD34D",
                                400: "#FBBF24",
                                500: "#F59E0B",
                                600: "#D97706",
                                700: "#B45309",
                                800: "#92400E",
                                900: "#78350F",
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
