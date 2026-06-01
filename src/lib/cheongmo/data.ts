/**
 * 청모(청첩장 모임) 장소 데이터 타입.
 *
 * 핵심 차별점: 일반 맛집 데이터가 아니라 "청모 적합성" 큐레이션이다.
 * - mood/use_case/capacity 태그 = 사장님 문서의 청모 전용 태그 체계
 * - score = 청모 적합도 (대화 편의성·예약·접근성·분위기·가격·시설·사진 7항목 100점 만점,
 *           표시는 5점 환산)
 * - is_partner = 유료 제휴 업체 여부 (추후 상단 노출/예약 연결 가산)
 *
 * 초기 운영은 정책 큐레이트 11종과 동일하게 정적 JSON(places.json) → 빌드 시 prerender.
 * 100개 넘어가면 Supabase 테이블로 이전.
 */
export type CheongmoPlace = {
  id: string;
  slug: string;
  name: string;

  region1: "서울" | "인천" | "경기" | "부산" | "대구" | "기타";
  region2: string; // 구/군
  area: string; // 상권/동네
  address: string;

  category: string; // 브런치카페·한정식·이자카야 등

  moodTags: string[]; // 조용한·감성·격식 등
  useCaseTags: string[]; // 친구청모·직장동료·부모님 등
  capacityTags: string[]; // 2인·4인·6인·단체
  priceRange: string; // "1인 2만원대"

  parking: "가능" | "어려움" | "근처 공영" | "발렛";
  privateRoom: "있음" | "없음" | "반개별";
  reservation: "가능" | "불가" | "전화";

  naverUrl: string | null;
  kakaoUrl: string | null;
  instagramUrl: string | null;
  imageUrl: string | null;

  shortDesc: string;
  whyGood: string;
  caution: string | null;

  score: number; // 0~5, 청모 적합도
  isPartner: boolean;
  isFeatured: boolean;
};

import raw from "./places.json";

export const PLACES: CheongmoPlace[] = raw as CheongmoPlace[];

export function getPlaceBySlug(slug: string): CheongmoPlace | undefined {
  return PLACES.find((p) => p.slug === slug);
}

export function getPlacesByRegion(region1: CheongmoPlace["region1"]): CheongmoPlace[] {
  return PLACES.filter((p) => p.region1 === region1);
}
