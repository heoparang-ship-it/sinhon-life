import type { CategoryMeta } from "./types_v2";

/**
 * 9개 카테고리 고정 메타.
 * - avg(평균): 한국 결혼 비용 외부 검색 기반 추정치(2025 기준).
 *   사용자 데이터가 충분히 쌓이면 서버에서 실제 평균을 내려준다.
 * - icon: 이모지(폰트 변경에도 깨지지 않게).
 * - color: 카테고리 카드 배경 토큰. Tailwind safelist 또는 inline style 로 사용.
 */
export const CATEGORIES_V2: CategoryMeta[] = [
  { id: "venue", name: "예식장", icon: "🏛", color: "#dde3ec", avg: 15_000_000 },
  { id: "studio", name: "스드메", icon: "💄", color: "#e8dfe4", avg: 3_600_000 },
  { id: "hanbok", name: "예복·한복", icon: "🤵", color: "#e6e0d4", avg: 1_500_000 },
  { id: "gift", name: "예물·예단", icon: "💍", color: "#dfe5ea", avg: 3_000_000 },
  { id: "appliance", name: "혼수가전", icon: "🛋", color: "#e0e4d8", avg: 4_000_000 },
  { id: "newhome", name: "신혼집", icon: "🏠", color: "#d9e6ee", avg: null },
  { id: "travel", name: "신혼여행", icon: "✈", color: "#dde7df", avg: 5_000_000 },
  { id: "cash", name: "본식현금", icon: "💵", color: "#e6eaef", avg: 1_000_000 },
  { id: "etc", name: "기타", icon: "✦", color: "#e2e4ee", avg: 1_000_000 },
];

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES_V2.map((c) => [c.id, c]),
) as Record<CategoryMeta["id"], CategoryMeta>;
