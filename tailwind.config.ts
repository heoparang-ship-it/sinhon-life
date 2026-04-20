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
        // V3.1 Redesign tokens — imported from design-source/tailwind.config.ref.ts
        // Scoped namespace so new components opt-in via `bg-paper`, `text-ink` without
        // touching legacy `warm-*` / `navy-*` usages in existing routes.
        ink: {
          DEFAULT: "#1E2A3A",
          soft: "#4A5568",
          muted: "#A0AEC0",
        },
        paper: {
          DEFAULT: "#FDF8F1",
          surface: "#FFFFFF",
          alt: "#FEEBC8",
          line: "#F0E4D2",
        },
      },
      fontFamily: {
        sans: ["Pretendard", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
        mono: ["var(--font-jbmono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
      // RFP §8.1 — 4px base grid. Names are semantic steps, not pixel values.
      spacing: {
        "4xs": "2px",
        "3xs": "4px",
        "2xs": "8px",
        xs: "12px",
        sm: "16px",
        md: "20px",
        lg: "24px",
        xl: "32px",
        "2xl": "40px",
        "3xl": "48px",
        "4xl": "64px",
        "5xl": "80px",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        pill: "9999px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(30,42,58,0.04)",
        sm: "0 2px 6px rgba(30,42,58,0.06)",
        md: "0 6px 16px rgba(30,42,58,0.08)",
        lg: "0 12px 28px rgba(30,42,58,0.10)",
        overlay: "0 -8px 24px rgba(30,42,58,0.08)",
        "ring-brand": "0 0 0 3px rgba(249,112,102,0.35)",
      },
      transitionDuration: {
        instant: "80ms",
        quick: "140ms",
        base: "220ms",
        slow: "360ms",
        page: "500ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.2, 0, 0, 1)",
        emphasized: "cubic-bezier(0.3, 0, 0, 1.2)",
        decelerate: "cubic-bezier(0, 0, 0.2, 1)",
        accelerate: "cubic-bezier(0.4, 0, 1, 1)",
      },
      fontSize: {
        // Semantic type scale — RFP §6 typography
        display: ["36px", { lineHeight: "1.15", letterSpacing: "-0.03em", fontWeight: "700" }],
        title: ["24px", { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "700" }],
        subtitle: ["20px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6" }],
        body: ["16px", { lineHeight: "1.55" }],
        caption: ["13px", { lineHeight: "1.4" }],
        overline: ["11px", { lineHeight: "1.2", letterSpacing: "0.08em", fontWeight: "600" }],
      },
      zIndex: {
        nav: "40",
        sheet: "50",
        modal: "60",
        toast: "70",
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
