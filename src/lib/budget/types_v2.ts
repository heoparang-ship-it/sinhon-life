// ════════════════════════════════════════════════════════════════════════
// 신혼생활 가계부 v2 타입 정의
//
// v1(types.ts: LedgerEntry, BudgetMap) ─ "수입/지출 거래" 기반 일반 가계부
// v2(이 파일)                          ─ "결혼 누적 비용 + 축의금 상쇄" 결혼 전용
//
// 두 모델은 공존한다. v2 도입 후에도 v1 테이블/타입은 그대로 둔다.
// ════════════════════════════════════════════════════════════════════════

export type CategoryId =
  | "venue"
  | "studio"
  | "hanbok"
  | "gift"
  | "appliance"
  | "newhome"
  | "travel"
  | "cash"
  | "etc";

/** 카테고리 메타(고정값, DB에 저장하지 않음). lib/budget/categories_v2.ts 에서 export */
export type CategoryMeta = {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  /** 한국 평균값(원). 사용자 데이터 누적 전까지 외부 검색 기반. */
  avg: number | null;
};

/** 카테고리별 계획·실지출 — DB row 1:1 매핑 */
export type Expense = {
  categoryId: CategoryId;
  planned: number; // 계획 금액(원)
  spent: number; // 실제 지출(원)
};

/** 축의금 트래커. 3-tier (단일평균/그룹별/실수령) */
export type GiftTier = 1 | 2 | 3;

export type GiftGroupId = "친구" | "직장" | "가족";

export type GiftGroup = {
  count: number; // 인원
  avg: number; // 1인 평균 축의금(원)
};

export type Gifts = {
  tier: GiftTier;
  tier1: { headcount: number; avgAmount: number };
  tier2: Record<GiftGroupId, GiftGroup>;
  /** tier 3: 실제 받은 총액(수동 입력) */
  actual: number;
  sideSplit: boolean;
  sideBreakdown: { 신랑: number; 신부: number }; // 합 1.0
};

/** 최근 지출(NL 입력으로 생긴 항목). 카테고리별 expense.spent 와는 별개로 항목 단위 로그. */
export type RecentExpense = {
  id: string;
  title: string;
  /** "MM/DD · 카테고리명" 형태 표시용. raw 데이터는 date + categoryId 로 보관 */
  date: string; // YYYY-MM-DD
  categoryId: CategoryId;
  amount: number;
  method: "카드" | "이체" | "현금";
};

/** v2 가계부 전체 스냅샷 — 로컬·원격 모두 이 모양으로 직렬화 */
export type BudgetV2State = {
  weddingDate: string | null; // YYYY-MM-DD
  expenses: Expense[]; // 9개 카테고리 고정
  gifts: Gifts;
  recentExpenses: RecentExpense[];
};
