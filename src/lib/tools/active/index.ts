/**
 * 14개 액티브 툴 (결혼 준비 + 신혼 1~2년차 대상).
 *
 * Phase 1: 모든 핸들러가 ToolDisabledError throw. 스키마만 Claude API에 전달 가능.
 * Phase 2+: docs/sinhon_chatbot_tools.md 로드맵에 따라 단계적으로 실구현.
 */

import type { SinhonTool, ToolContext, ToolInputSchema, ToolResult } from '../types';
import { ToolDisabledError } from '../types';

function disabledHandler(name: string) {
  return async (_input: Record<string, unknown>, _ctx: ToolContext): Promise<ToolResult> => {
    throw new ToolDisabledError(name, 'active');
  };
}

function tool(opts: {
  name: string;
  description: string;
  category: SinhonTool['category'];
  inputSchema: ToolInputSchema;
}): SinhonTool {
  return {
    ...opts,
    status: 'active',
    handler: disabledHandler(opts.name),
  };
}

// ============================================================
// 범주 A — 위치·경로 (Kakao API)
// ============================================================

export const kakao_local_address = tool({
  name: 'kakao_local_address',
  description:
    '주소 또는 장소 키워드를 위도/경도 좌표로 변환한다. 다른 위치 기반 툴의 전제 조건으로 먼저 호출. 예: "강남역", "서울시 송파구 잠실동", "판교테크노밸리".',
  category: 'location',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: '검색할 주소 또는 장소명',
      },
    },
    required: ['query'],
  },
});

export const kakao_mobility_route = tool({
  name: 'kakao_mobility_route',
  description:
    '출발지 좌표와 도착지 좌표 사이의 자동차 경로·소요시간·거리를 계산한다. 신혼집 후보 ↔ 회사 통근 시간 계산용. 좌표는 kakao_local_address로 먼저 얻는다.',
  category: 'location',
  inputSchema: {
    type: 'object',
    properties: {
      origin_x: { type: 'number', description: '출발지 경도 (longitude)' },
      origin_y: { type: 'number', description: '출발지 위도 (latitude)' },
      destination_x: { type: 'number', description: '도착지 경도' },
      destination_y: { type: 'number', description: '도착지 위도' },
      departure_time: {
        type: 'string',
        description: 'ISO 8601 출발 시각 (선택). 미지정 시 현재시각. 예: "2026-05-01T08:30:00+09:00"',
      },
    },
    required: ['origin_x', 'origin_y', 'destination_x', 'destination_y'],
  },
});

// ============================================================
// 범주 B — 주거 (내부 DB + 계산기)
// ============================================================

export const search_sinhon_housing_policies = tool({
  name: 'search_sinhon_housing_policies',
  description:
    '신혼부부 주거 정책을 검색한다. 청약·행복주택·신혼희망타운·매입임대·전세임대 등. 소득·지역·자녀 여부로 필터.',
  category: 'housing',
  inputSchema: {
    type: 'object',
    properties: {
      region: { type: 'string', description: '지역 (시/도 또는 시/군/구)' },
      income_level: {
        type: 'string',
        enum: ['low', 'mid', 'high'],
        description: '소득 수준 (low: 도시근로자 가구당 월평균소득 70%↓, mid: 100%↓, high: 130%↓)',
      },
      policy_type: {
        type: 'string',
        enum: ['cheongyak', 'happy_house', 'newlywed_hope', 'purchase_rental', 'jeonse_rental', 'any'],
        description: '정책 종류 필터 (기본 any)',
      },
    },
    required: [],
  },
});

export const calculate_cheongyak_score = tool({
  name: 'calculate_cheongyak_score',
  description:
    '청약 가점제 점수를 계산한다. 무주택 기간·부양가족 수·청약통장 가입기간으로 최대 84점 산출. 신혼부부 특별공급 가점 포함.',
  category: 'housing',
  inputSchema: {
    type: 'object',
    properties: {
      no_house_years: {
        type: 'number',
        description: '무주택 기간(년)',
      },
      dependents: {
        type: 'number',
        description: '부양가족 수 (본인 제외)',
      },
      account_years: {
        type: 'number',
        description: '청약통장 가입기간(년)',
      },
      children: {
        type: 'number',
        description: '미성년 자녀 수 (특별공급 가점용)',
      },
      marriage_years: {
        type: 'number',
        description: '혼인기간(년) (신혼부부 특별공급용, 7년 이내만 유효)',
      },
    },
    required: ['no_house_years', 'dependents', 'account_years'],
  },
});

export const compare_housing_products = tool({
  name: 'compare_housing_products',
  description:
    '복수의 주거 상품(행복주택/신혼희망타운/매입임대 등)을 비교표로 반환한다. 입주 조건·임대료·면적·거주기간을 한눈에.',
  category: 'housing',
  inputSchema: {
    type: 'object',
    properties: {
      products: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['happy_house', 'newlywed_hope', 'purchase_rental', 'jeonse_rental', 'public_lease'],
        },
        description: '비교할 상품 2~5개',
      },
      region: { type: 'string', description: '비교 기준 지역' },
    },
    required: ['products'],
  },
});

// ============================================================
// 범주 C — 금융 (내부 DB + 계산기)
// ============================================================

export const search_sinhon_financial_support = tool({
  name: 'search_sinhon_financial_support',
  description:
    '신혼부부 금융 지원(버팀목·디딤돌·구입자금대출·보금자리론 등)을 검색한다. 소득·자산 조건으로 필터.',
  category: 'finance',
  inputSchema: {
    type: 'object',
    properties: {
      loan_type: {
        type: 'string',
        enum: ['rent_deposit', 'buy', 'both'],
        description: '전세보증금 대출 / 매매 구입 / 둘 다',
      },
      household_income: {
        type: 'number',
        description: '부부 합산 연소득(만원)',
      },
      asset: {
        type: 'number',
        description: '순자산(만원)',
      },
    },
    required: [],
  },
});

export const calculate_loan_eligibility = tool({
  name: 'calculate_loan_eligibility',
  description:
    '소득·자산 기준 대출 한도를 예측한다. 버팀목·디딤돌·보금자리론의 공식 산정식 기반. 실제 승인액은 다를 수 있음을 명시.',
  category: 'finance',
  inputSchema: {
    type: 'object',
    properties: {
      loan_product: {
        type: 'string',
        enum: ['beotimmok', 'didimdol', 'bogeumjari'],
        description: '대출 상품',
      },
      annual_income: { type: 'number', description: '부부 합산 연소득(만원)' },
      asset: { type: 'number', description: '순자산(만원)' },
      house_price: { type: 'number', description: '대상 주택 가격(만원, 해당 시)' },
      region: { type: 'string', description: '주택 소재 지역' },
    },
    required: ['loan_product', 'annual_income'],
  },
});

export const calculate_tax_benefits = tool({
  name: 'calculate_tax_benefits',
  description:
    '결혼·신혼 관련 세액 공제 예상액을 계산한다. 결혼세액공제(100만원 한도), 월세세액공제, 주택청약종합저축 공제, 장기주택저당차입금 이자상환액 공제 등.',
  category: 'finance',
  inputSchema: {
    type: 'object',
    properties: {
      annual_income: { type: 'number', description: '연소득(만원)' },
      marriage_year: { type: 'number', description: '혼인신고 연도 (결혼세액공제 대상 판단)' },
      monthly_rent: { type: 'number', description: '월세(만원, 해당 시)' },
      mortgage_interest: { type: 'number', description: '주담대 이자 납부액(만원, 해당 시)' },
    },
    required: ['annual_income'],
  },
});

// ============================================================
// 범주 D — 결혼 준비 & 신혼 혜택 (내부 DB)
// ============================================================

export const search_wedding_checklist = tool({
  name: 'search_wedding_checklist',
  description:
    '결혼 준비 단계별 체크리스트를 반환한다. 혼인신고·예식장 예약·스드메·혼수·혼인신고 후 행정 처리까지. 타임라인 기준(D-180 / D-90 / D-30 / D+0 / D+30 등)으로 필터.',
  category: 'wedding',
  inputSchema: {
    type: 'object',
    properties: {
      phase: {
        type: 'string',
        enum: ['before_6m', 'before_3m', 'before_1m', 'd_day', 'after'],
        description: '단계 필터 (미지정 시 전체)',
      },
      category: {
        type: 'string',
        enum: ['admin', 'venue', 'wedding_items', 'honeymoon', 'post_admin'],
        description: '카테고리 필터',
      },
    },
    required: [],
  },
});

export const search_newlywed_benefits = tool({
  name: 'search_newlywed_benefits',
  description:
    '혼인신고 후 받을 수 있는 전국 공통 혜택을 검색한다. 결혼세액공제·신혼부부 특별공급 자격·보훈·공무원 결혼축하금 등.',
  category: 'wedding',
  inputSchema: {
    type: 'object',
    properties: {
      benefit_type: {
        type: 'string',
        enum: ['tax', 'housing_priority', 'cash', 'leave', 'any'],
        description: '혜택 종류',
      },
    },
    required: [],
  },
});

export const search_local_sinhon_support = tool({
  name: 'search_local_sinhon_support',
  description:
    '지자체별 신혼부부 지원 사업을 검색한다. 서울·인천·경기 우선. 결혼축하금·전세자금 이자지원·주택구입비 지원 등.',
  category: 'wedding',
  inputSchema: {
    type: 'object',
    properties: {
      region: { type: 'string', description: '시/도 또는 시/군/구. 예: "인천광역시", "서울시 송파구"' },
      support_type: {
        type: 'string',
        enum: ['cash', 'loan_interest', 'housing', 'medical', 'any'],
        description: '지원 종류',
      },
    },
    required: ['region'],
  },
});

// ============================================================
// 범주 E — 공공 서비스 (data.go.kr)
// ============================================================

export const search_welfare_services = tool({
  name: 'search_welfare_services',
  description:
    '보조금24(복지로)에서 신혼부부가 받을 수 있는 복지서비스를 검색한다. 국가·지자체·민간 제공 서비스 전수 검색.',
  category: 'public',
  inputSchema: {
    type: 'object',
    properties: {
      life_cycle: {
        type: 'string',
        enum: ['newlywed', 'pregnant', 'childbirth', 'any'],
        description: '생애주기 필터 (기본 newlywed)',
      },
      keyword: { type: 'string', description: '검색 키워드' },
    },
    required: [],
  },
});

export const find_emergency_room = tool({
  name: 'find_emergency_room',
  description:
    '좌표 주변 응급실 위치와 연락처를 반환한다. 신혼집 주변 응급의료 인프라 파악용. 좌표는 kakao_local_address로 먼저 얻는다.',
  category: 'public',
  inputSchema: {
    type: 'object',
    properties: {
      latitude: { type: 'number', description: '위도' },
      longitude: { type: 'number', description: '경도' },
      radius_km: { type: 'number', description: '검색 반경 km (기본 5)' },
    },
    required: ['latitude', 'longitude'],
  },
});

// ============================================================
// 범주 F — 개인화 (내부 프로필)
// ============================================================

export const get_my_profile = tool({
  name: 'get_my_profile',
  description:
    '사용자의 신혼생활 프로필을 조회한다. 지역·소득 구간·결혼 단계·관심 정책 등. 이 정보를 바탕으로 다른 툴의 파라미터를 자동 채운다.',
  category: 'profile',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
});

// ============================================================
// 내보내기
// ============================================================

export const ACTIVE_TOOLS: SinhonTool[] = [
  kakao_local_address,
  kakao_mobility_route,
  search_sinhon_housing_policies,
  calculate_cheongyak_score,
  compare_housing_products,
  search_sinhon_financial_support,
  calculate_loan_eligibility,
  calculate_tax_benefits,
  search_wedding_checklist,
  search_newlywed_benefits,
  search_local_sinhon_support,
  search_welfare_services,
  find_emergency_room,
  get_my_profile,
];
