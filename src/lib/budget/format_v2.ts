// v2 가계부 포맷·NL 파싱 유틸. wedding-budget.html 의 fmtKRW / fmt만 / parseNL 이식.

import { CATEGORIES_V2, CATEGORY_BY_ID } from "./categories_v2";
import type { CategoryId, RecentExpense } from "./types_v2";

export const fmtKRW = (n: number): string =>
  Math.abs(Math.round(n)).toLocaleString("ko-KR");

export const fmt만 = (n: number): string => {
  const v = Math.round(n / 10000);
  return v.toLocaleString("ko-KR") + "만";
};

const CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
  venue: ["예식장", "컨벤션", "호텔", "본식장", "웨딩홀", "식장"],
  studio: ["스드메", "스튜디오", "드레스", "메이크업", "헤어", "촬영", "본식 스냅", "웨딩 촬영"],
  hanbok: ["한복", "예복", "양복", "턱시도", "폐백"],
  gift: ["예물", "예단", "커플링", "다이아", "반지", "목걸이", "시계"],
  appliance: ["가전", "냉장고", "TV", "소파", "세탁기", "에어컨", "에어드레서", "건조기"],
  newhome: ["신혼집", "전세", "월세", "보증금", "이사", "인테리어", "장판", "도배"],
  travel: ["신혼여행", "항공권", "푸켓", "발리", "유럽", "리조트", "호캉스"],
  cash: ["본식현금", "사례비", "축의금 봉투", "경비"],
  etc: ["청첩장", "답례품", "교통", "택시", "기타"],
};

export type Parsed = {
  amount: number;
  category: CategoryId;
  /** "오늘" | "어제" | "그제" | "M/D" */
  dateLabel: string;
  method: RecentExpense["method"];
  title: string;
  confidence: number;
};

/**
 * 자연어 한 줄 → 구조화 (mock — 실제론 Claude Haiku API 로 대체 예정).
 * v1 으로 충분히 동작하는 키워드·정규식 매칭.
 */
export function parseNL(text: string): Parsed {
  // 금액 파싱
  let amount = 0;
  const eok = text.match(/(\d+\.?\d*)\s*억/);
  const man = text.match(/(\d+\.?\d*)\s*만(?:원)?/);
  const won = text.match(/(\d[\d,]{2,})\s*원?/);
  if (eok) amount += parseFloat(eok[1]) * 100_000_000;
  if (man) amount += parseFloat(man[1]) * 10_000;
  if (!eok && !man && won) amount = parseInt(won[1].replace(/,/g, ""));

  // 카테고리 파싱
  let category: CategoryId = "etc";
  let confidence = 0.5;
  outer: for (const c of CATEGORIES_V2) {
    for (const kw of CATEGORY_KEYWORDS[c.id]) {
      if (text.includes(kw)) {
        category = c.id;
        confidence = 0.95;
        break outer;
      }
    }
  }

  // 날짜 파싱
  let dateLabel = "오늘";
  if (text.includes("어제")) dateLabel = "어제";
  else if (text.includes("그제")) dateLabel = "그제";
  const md = text.match(/(\d{1,2})\/(\d{1,2})/);
  if (md) dateLabel = `${md[1]}/${md[2]}`;

  // 결제수단
  let method: RecentExpense["method"] = "카드";
  if (text.includes("현금")) method = "현금";
  else if (text.includes("이체") || text.includes("계좌")) method = "이체";

  // 제목 (간단 추출 — 카테고리 키워드 빼고 남은 단어)
  const title =
    text
      .replace(/\d[\d,.]*[만원억]+/g, "")
      .replace(/오늘|어제|그제/g, "")
      .replace(/카드|현금|이체|계좌/g, "")
      .trim()
      .slice(0, 30) || CATEGORY_BY_ID[category].name;

  return { amount, category, dateLabel, method, title, confidence };
}

/** "오늘"|"어제"|"그제"|"M/D" → YYYY-MM-DD */
export function labelToDate(label: string, today: Date = new Date()): string {
  const d = new Date(today);
  if (label === "어제") d.setDate(d.getDate() - 1);
  else if (label === "그제") d.setDate(d.getDate() - 2);
  else {
    const m = label.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (m) {
      d.setMonth(parseInt(m[1]) - 1);
      d.setDate(parseInt(m[2]));
    }
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** D-day 계산. weddingDate 없으면 null */
export function calcDDay(weddingDate: string | null, today: Date = new Date()): number | null {
  if (!weddingDate) return null;
  const wd = new Date(weddingDate + "T00:00:00");
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((wd.getTime() - t0.getTime()) / 86_400_000);
  return diff;
}

export function formatWeddingDate(weddingDate: string | null): string {
  if (!weddingDate) return "결혼식 날짜 미설정";
  const d = new Date(weddingDate + "T00:00:00");
  const yoils = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${yoils[d.getDay()]})`;
}

/** recentExpense → "5/18 · 예식장" 형태의 부제목 */
export function recentSubLabel(entry: RecentExpense): string {
  const d = new Date(entry.date + "T00:00:00");
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const catName = CATEGORY_BY_ID[entry.categoryId]?.name ?? "기타";
  return `${mm}/${dd} · ${catName}`;
}
