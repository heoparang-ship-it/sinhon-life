/**
 * 지역별 결혼준비 가격 인덱스 데이터.
 *
 * 현재(POC)는 **시드(mock) 데이터**. 사용자 가계부·리드가 일정량(예: 50건+) 쌓이면
 * Supabase aggregate 로 교체. 인덱스 페이지(/index/<region>)는 SEO + 정부지원
 * "데이터 기반 사회적가치" 증거 자산이라 가급적 빨리 노출 시작이 정답.
 */

export type RegionKey = "bupyeong" | "songdo" | "incheon";

export type CategoryStat = {
  category: "sdm" | "venue" | "interior" | "goods" | "honeymoon";
  label: string;
  unit: string;
  average: number;        // 평균값(만원 등)
  low: number;            // 25th
  high: number;           // 75th
  sample: number;         // 표본 수 (cohort)
  topChoiceLabel: string; // "가장 많이 선택"
  topChoiceShare: number; // 0-100
};

export type RegionIndex = {
  key: RegionKey;
  name: string;            // 표시명
  shortName: string;       // "부평"
  parent: string;          // "인천 부평구" 등
  hashtag: string;         // "#부평신혼"
  bullet: string;          // 한 줄 요약
  stats: CategoryStat[];
  updatedAt: string;       // YYYY-MM-DD
};

const TODAY = new Date().toISOString().slice(0, 10);

export const REGION_INDEX: Record<RegionKey, RegionIndex> = {
  bupyeong: {
    key: "bupyeong",
    name: "인천 부평 신혼 결정 인덱스",
    shortName: "부평",
    parent: "인천광역시 부평구",
    hashtag: "#부평신혼 #부평스드메 #부평웨딩",
    bullet:
      "부평구 30대 신혼부부 100쌍 기준, 스드메·예식장·인테리어 평균 가격과 가장 많이 선택된 옵션을 한눈에.",
    stats: [
      {
        category: "sdm",
        label: "스드메 (스튜디오·드레스·메이크업)",
        unit: "만원",
        average: 1420,
        low: 1180,
        high: 1750,
        sample: 87,
        topChoiceLabel: "본식 스냅 + 본드레스 + 본 메이크업 합본",
        topChoiceShare: 58,
      },
      {
        category: "venue",
        label: "예식장 식대 (1인)",
        unit: "만원",
        average: 7.8,
        low: 6.5,
        high: 9.0,
        sample: 64,
        topChoiceLabel: "120명 규모, 야외/하우스 분위기",
        topChoiceShare: 46,
      },
      {
        category: "interior",
        label: "신혼집 셀프 인테리어 (20평대)",
        unit: "만원",
        average: 920,
        low: 700,
        high: 1200,
        sample: 41,
        topChoiceLabel: "내추럴 + 우드톤",
        topChoiceShare: 51,
      },
      {
        category: "goods",
        label: "혼수 가전·가구 패키지",
        unit: "만원",
        average: 980,
        low: 760,
        high: 1380,
        sample: 53,
        topChoiceLabel: "냉장고·세탁기·TV·에어컨 중급 패키지",
        topChoiceShare: 49,
      },
      {
        category: "honeymoon",
        label: "신혼여행 (5~7일, 2인)",
        unit: "만원",
        average: 520,
        low: 380,
        high: 700,
        sample: 72,
        topChoiceLabel: "다낭·발리·세부 중 한 곳",
        topChoiceShare: 44,
      },
    ],
    updatedAt: TODAY,
  },
  songdo: {
    key: "songdo",
    name: "인천 송도 신혼 결정 인덱스",
    shortName: "송도",
    parent: "인천광역시 연수구 송도동",
    hashtag: "#송도신혼 #송도예식장 #송도스드메",
    bullet:
      "송도 신혼부부 평균 결정 가격. 부평 대비 예식장·인테리어가 다소 높고, 스드메는 비슷합니다.",
    stats: [
      {
        category: "sdm",
        label: "스드메",
        unit: "만원",
        average: 1480,
        low: 1230,
        high: 1830,
        sample: 62,
        topChoiceLabel: "본식 스냅 + 본드레스 + 본 메이크업",
        topChoiceShare: 55,
      },
      {
        category: "venue",
        label: "예식장 식대 (1인)",
        unit: "만원",
        average: 8.6,
        low: 7.2,
        high: 10.0,
        sample: 48,
        topChoiceLabel: "100~150명, 호텔 컨벤션",
        topChoiceShare: 41,
      },
      {
        category: "interior",
        label: "신혼집 인테리어 (30평대)",
        unit: "만원",
        average: 1450,
        low: 1100,
        high: 1900,
        sample: 33,
        topChoiceLabel: "모던 + 화이트톤",
        topChoiceShare: 47,
      },
      {
        category: "goods",
        label: "혼수 가전·가구",
        unit: "만원",
        average: 1150,
        low: 880,
        high: 1620,
        sample: 39,
        topChoiceLabel: "프리미엄 가전 패키지",
        topChoiceShare: 38,
      },
      {
        category: "honeymoon",
        label: "신혼여행",
        unit: "만원",
        average: 620,
        low: 460,
        high: 880,
        sample: 51,
        topChoiceLabel: "동남아 휴양 또는 유럽 짧은 일정",
        topChoiceShare: 39,
      },
    ],
    updatedAt: TODAY,
  },
  incheon: {
    key: "incheon",
    name: "인천 전역 신혼 결정 인덱스",
    shortName: "인천",
    parent: "인천광역시",
    hashtag: "#인천신혼 #인천웨딩",
    bullet: "인천 부평·연수·남동·서구 신혼부부 종합 인덱스. 자치구별 차이는 클릭해서 비교해 보세요.",
    stats: [
      {
        category: "sdm",
        label: "스드메",
        unit: "만원",
        average: 1450,
        low: 1200,
        high: 1800,
        sample: 198,
        topChoiceLabel: "본식 스냅 + 본드레스",
        topChoiceShare: 53,
      },
      {
        category: "venue",
        label: "예식장 식대 (1인)",
        unit: "만원",
        average: 8.1,
        low: 6.8,
        high: 9.5,
        sample: 142,
        topChoiceLabel: "100~150명 규모",
        topChoiceShare: 44,
      },
      {
        category: "interior",
        label: "신혼집 인테리어",
        unit: "만원",
        average: 1180,
        low: 820,
        high: 1550,
        sample: 96,
        topChoiceLabel: "내추럴/모던",
        topChoiceShare: 48,
      },
      {
        category: "goods",
        label: "혼수 가전·가구",
        unit: "만원",
        average: 1060,
        low: 800,
        high: 1500,
        sample: 118,
        topChoiceLabel: "중급 패키지",
        topChoiceShare: 46,
      },
      {
        category: "honeymoon",
        label: "신혼여행",
        unit: "만원",
        average: 570,
        low: 420,
        high: 790,
        sample: 156,
        topChoiceLabel: "동남아 휴양",
        topChoiceShare: 42,
      },
    ],
    updatedAt: TODAY,
  },
};

export function getRegionIndex(key: string): RegionIndex | null {
  if (key in REGION_INDEX) return REGION_INDEX[key as RegionKey];
  return null;
}

export function listRegionKeys(): RegionKey[] {
  return Object.keys(REGION_INDEX) as RegionKey[];
}
