// V3.2 S1 · Hero Slider metadata.
// Spec: docs/2026-04-21_V3.2_S0_Hero_Slides_Copy.md
// Three slides: 1억 내러티브 (static) / 이번 주 마감 임박 (dynamic, S2) / AI 1차 점검 (static).
// Slide 2 dynamic fetch is stubbed in S1 and wired to sinhon-kstartup-matcher in S2.

export type HeroSlideTone = "blue" | "coral" | "honey" | "mint";
export type HeroVisualKind = "five-icons" | "dday" | "chat-preview";

export interface HeroIcon {
  emoji: string;
  label: string;
  subtext?: string;
}

export interface HeroSlideBase {
  id: "benefit-1e" | "deadline-week" | "ai-intake";
  tone: HeroSlideTone;
  eyebrow: string;
  headlineLines: [string, string]; // 2 lines, ≤15 chars each
  subcopy: string;
  ctaLabel: string;
  ctaHref: string;
  visual: HeroVisualKind;
  ariaLabel: string;
}

export interface HeroSlideFiveIcons extends HeroSlideBase {
  visual: "five-icons";
  icons: HeroIcon[]; // exactly 5
}

export interface HeroSlideDDay extends HeroSlideBase {
  visual: "dday";
  daysLeft: number;
  region: string;
  deadlineLabel: string; // "4월 24일(금)"
  maxBenefitLabel: string; // "최대 1억 2천만 원"
}

export interface HeroSlideChatPreview extends HeroSlideBase {
  visual: "chat-preview";
  previewItems: [string, string, string]; // three short bullets rendered inside speech bubble
  extraCount: number; // 뱃지 `+N개 더`
}

export type HeroSlide = HeroSlideFiveIcons | HeroSlideDDay | HeroSlideChatPreview;

// --- Static slides ----------------------------------------------------------

const SLIDE_BENEFIT_1E: HeroSlideFiveIcons = {
  id: "benefit-1e",
  tone: "blue",
  eyebrow: "WEDDING SUPPORT · 1억원",
  headlineLines: ["신랑·신부 부부,", "1억까지 받을 수 있어요."],
  subcopy: "주거·대출이자·출산·세제·지역 — 조건만 맞으면 누적 1.6억",
  ctaLabel: "내 혜택 받는 법 보기",
  ctaHref: "/guide/hundred-million",
  visual: "five-icons",
  icons: [
    { emoji: "🏠", label: "주거", subtext: "최대 9,000만" },
    { emoji: "💰", label: "대출이자", subtext: "최대 3,000만" },
    { emoji: "👶", label: "출산", subtext: "최대 2,500만" },
    { emoji: "📋", label: "세제", subtext: "연 500만+" },
    { emoji: "📍", label: "지역", subtext: "자치구별" },
  ],
  ariaLabel: "1 / 3: 1억까지 받는 신혼부부 지원금. 자세히 보려면 탭하세요.",
};

const SLIDE_AI_INTAKE: HeroSlideChatPreview = {
  id: "ai-intake",
  tone: "mint", // mint-card tint (#EAFBF4)
  eyebrow: "AI · 1차 점검",
  headlineLines: ["우리 결혼 준비,", "어디까지 됐는지 묻는 것부터."],
  subcopy: "AI가 50+ 항목을 정리해드려요. 한 번에 체크리스트에 담기",
  ctaLabel: "AI에게 물어보기",
  ctaHref: "/chat?q=결혼+준비+어디까지+됐는지+1차+점검해줘",
  visual: "chat-preview",
  previewItems: ["웨딩홀 예약", "드레스 피팅", "스튜디오 촬영"],
  extraCount: 47,
  ariaLabel: "3 / 3: AI가 결혼 준비 체크리스트를 만들어드려요. 탭하면 AI 대화로 이동.",
};

// --- Dynamic slide 2 (S2 wires this to real data) ---------------------------

export interface DynamicDeadlinePayload {
  daysLeft: number;
  region: string;
  policyTitle: string;
  maxBenefitLabel: string;
  deadlineLabel: string;
  slug?: string;
}

/**
 * In S1 this returns null so the Hero renders with slides 1·3 only. In S2 this
 * will read from the K-Startup matcher JSON or POLICIES. Keeping the signature
 * Promise-returning lets us switch without touching the Slider.
 */
export async function tryBuildDeadlineSlide(): Promise<HeroSlideDDay | null> {
  return null;
}

function buildDeadlineSlide(payload: DynamicDeadlinePayload): HeroSlideDDay {
  const href = payload.slug ? `/policy/${payload.slug}` : "/explore?tag=deadline";
  return {
    id: "deadline-week",
    tone: "honey",
    eyebrow: `THIS WEEK · D-${payload.daysLeft}`,
    headlineLines: [payload.region, payload.policyTitle],
    subcopy: `${payload.maxBenefitLabel} · 마감 ${payload.deadlineLabel}`,
    ctaLabel: "지금 확인하기",
    ctaHref: href,
    visual: "dday",
    daysLeft: payload.daysLeft,
    region: payload.region,
    deadlineLabel: payload.deadlineLabel,
    maxBenefitLabel: payload.maxBenefitLabel,
    ariaLabel: `2 / 3: ${payload.region} ${payload.policyTitle}, 마감 D-${payload.daysLeft}. 탭하면 상세로 이동.`,
  };
}

/**
 * Compose the hero slide list. The deadline slide is inserted between slides
 * 1 and 3 when data is available; otherwise the slider renders 2 slides.
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  const slides: HeroSlide[] = [SLIDE_BENEFIT_1E, SLIDE_AI_INTAKE];
  const deadline = await tryBuildDeadlineSlide();
  if (deadline) {
    slides.splice(1, 0, deadline);
  }
  return slides;
}

/**
 * Synchronous default for the initial render — no async data. The Slider calls
 * `getHeroSlides()` on mount to rehydrate with the dynamic slide if present.
 */
export function getInitialHeroSlides(): HeroSlide[] {
  return [SLIDE_BENEFIT_1E, SLIDE_AI_INTAKE];
}

// Exported for tests and for the hypothetical future "slide 2 failed" banner.
export { SLIDE_BENEFIT_1E, SLIDE_AI_INTAKE, buildDeadlineSlide };
