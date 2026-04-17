import type { Config } from "tailwindcss";

const config: Config = {
<<<<<<< Updated upstream
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
=======
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ============================================================
        // 신혼생활 브랜드 키컬러 — "해 질 녘의 부엌 · Warm Pragmatism"
        //
        // 2026-04-17 키컬러.rtf 제안서 반영:
        //   Primary  = Hearth Coral (#F97066) — 노을 든 부엌 벽 (CTA·강조)
        //   Secondary= Morning Mint (#5EC9A8) — 창가 바질 화분 (성공·체크)
        //   Accent   = Honey Butter (#FBD38D) — 갓 구운 빵 (배경 강조·배지)
        //   Anchor   = Ink Navy (#1E2A3A)     — 도심의 밤 (본문·헤더)
        //   Base     = Rice Paper (#FDF8F1)   — 순면 식탁보 (배경)
        //
        // 60-30-10 규칙: Rice+Navy 60% / Coral+Honey 25% / Mint 12% / Ember 3%
        // 접근성: 본문은 반드시 Ink Navy. Coral·Mint는 큰 제목·CTA·아이콘만.
        //
        // 클래스명은 기존 `coral-*`, `mint-*` 유지 (리팩토링 비용 회피).
        // Hearth Coral 기준 톤 램프는 문서 지정색을 앵커로 재구성:
        //   200 = Peach Blossom(#FFC9C2, 라이트 배경)
        //   500 = Hearth Coral(#F97066, DEFAULT)
        //   700 = Ember(#C8453D, Pressed·고위계 경고, AA 대비)
        // ============================================================
        coral: {
          DEFAULT: "#F97066",
          50: "#FFF1EF",
          100: "#FFDDD8",
          200: "#FFC9C2", // Peach Blossom — 호버·배경 강조
          300: "#FFA8A0",
          400: "#FD8A80",
          500: "#F97066", // Hearth Coral — 중심 CTA
          600: "#E55A51",
          700: "#C8453D", // Ember — Pressed·고위계 경고 (AA 5.9:1)
          800: "#9E332D",
          900: "#6F241F",
        },
        mint: {
          DEFAULT: "#5EC9A8",
          50: "#ECFAF4",
          100: "#D3F4E7",
          200: "#B8EADA", // Seafoam — 토스트·성공 배경
          300: "#93DDC5",
          400: "#78D1B6",
          500: "#5EC9A8", // Morning Mint — 보조 CTA
          600: "#46AA8E",
          700: "#2F8770", // Pine Kitchen — 링크 hover·다크모드 액센트 (AA 4.8:1)
          800: "#236856",
          900: "#174A3D",
        },
        // Honey Butter 계열 — 코럴과 민트 사이의 시각적 완충재
        // 300=DEFAULT(#FBD38D), 100=Cream Butter(#FEEBC8), 600=Baked Caramel(#D69E2E)
        honey: {
          DEFAULT: "#FBD38D",
          50: "#FFFCF4",
          100: "#FEEBC8", // Cream Butter — 섹션 구분 배경
          200: "#FDE1AE",
          300: "#FBD38D", // Honey Butter — 배지·하이라이트
          400: "#F9C168",
          500: "#F0AB48",
          600: "#D69E2E", // Baked Caramel — 정책 "꼭 맞음" 등급
          700: "#AA7E24",
          800: "#7D5C1A",
          900: "#513C10",
        },
        // Ink Navy 계열 — 본문·헤더·정보 밀도
        // 700=Ink Navy(#1E2A3A), 500=Twilight(#4A5568, 부제·메타), 300=Smoke(#A0AEC0, 구분선)
        navy: {
          DEFAULT: "#1E2A3A",
          50: "#F5F7FA",
          100: "#E4E8EE",
          200: "#CDD3DB",
          300: "#A0AEC0", // Smoke — 보조 텍스트·구분선
          400: "#718096",
          500: "#4A5568", // Twilight — 부제·메타 텍스트
          600: "#2D3748",
          700: "#1E2A3A", // Ink Navy — 본문 (AAA 12.8:1 on Rice Paper)
          800: "#141B27",
          900: "#0B1018",
        },
        // Warm 토큰 — Rice Paper 배경 + Ink Navy 텍스트 시스템
        warm: {
          bg: "#FDF8F1",          // Rice Paper — 전체 배경 (웜 언더톤 오프화이트)
          card: "#FFFFFF",         // 카드 바탕 — 깔끔한 분리
          border: "#EDE4D4",       // Rice Paper 한 단계 짙은 톤 — 구분선
          text: "#1E2A3A",         // Ink Navy — 본문 (AAA 대비)
          "text-secondary": "#4A5568", // Twilight — 부제·메타 (AA)
          "text-muted": "#A0AEC0",     // Smoke — 구분선·비활성 (아이콘/배경 전용)
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
>>>>>>> Stashed changes
    },
    plugins: [],
};
export default config;
