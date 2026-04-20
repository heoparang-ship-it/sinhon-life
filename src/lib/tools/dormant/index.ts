/**
 * 18개 휴면 툴 (육아·자녀 양육 대상).
 *
 * 현재 상태: 모든 핸들러 ToolDisabledError throw.
 * 활성화 조건:
 *   1. 환경변수 ENABLE_PARENTING_TOOLS=true
 *   2. 사용자 프로필에 has_child=true
 *   3. Phase 5 로드맵 진입 (docs/sinhon_chatbot_tools.md)
 *
 * kidshub MCP의 18개 툴에서 아이디어를 차용했지만, 실제 구현은 sinhon.life 코드베이스 안에서 자체 래핑한다.
 */

import type { SinhonTool, ToolContext, ToolInputSchema, ToolResult } from '../types';
import { ToolDisabledError } from '../types';

function disabledHandler(name: string) {
  return async (_input: Record<string, unknown>, _ctx: ToolContext): Promise<ToolResult> => {
    throw new ToolDisabledError(name, 'dormant');
  };
}

function tool(opts: {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
}): SinhonTool {
  return {
    ...opts,
    category: 'parenting',
    status: 'dormant',
    handler: disabledHandler(opts.name),
  };
}

// ============================================================
// 어린이집 / 유치원 (P01 ~ P05)
// ============================================================

export const find_daycare_by_coordinates = tool({
  name: 'find_daycare_by_coordinates',
  description: '[휴면] 좌표 주변 어린이집을 검색한다. 자녀 있는 가구 대상.',
  inputSchema: {
    type: 'object',
    properties: {
      latitude: { type: 'number' },
      longitude: { type: 'number' },
      radius_km: { type: 'number' },
    },
    required: ['latitude', 'longitude'],
  },
});

export const search_daycare_by_name = tool({
  name: 'search_daycare_by_name',
  description: '[휴면] 어린이집 이름으로 검색.',
  inputSchema: {
    type: 'object',
    properties: { name: { type: 'string' } },
    required: ['name'],
  },
});

export const find_kindergarten_by_coordinates = tool({
  name: 'find_kindergarten_by_coordinates',
  description: '[휴면] 좌표 주변 유치원을 검색한다.',
  inputSchema: {
    type: 'object',
    properties: {
      latitude: { type: 'number' },
      longitude: { type: 'number' },
      radius_km: { type: 'number' },
    },
    required: ['latitude', 'longitude'],
  },
});

export const get_kindergarten_details = tool({
  name: 'get_kindergarten_details',
  description: '[휴면] 유치원 상세 정보 조회 (학급·교사·비용).',
  inputSchema: {
    type: 'object',
    properties: { kindergarten_id: { type: 'string' } },
    required: ['kindergarten_id'],
  },
});

export const compare_kindergartens = tool({
  name: 'compare_kindergartens',
  description: '[휴면] 복수 유치원 비교표.',
  inputSchema: {
    type: 'object',
    properties: { kindergarten_ids: { type: 'array', items: { type: 'string' } } },
    required: ['kindergarten_ids'],
  },
});

// ============================================================
// 건강 / 예방접종 (P06 ~ P08, P18)
// ============================================================

export const get_vaccination_clinics = tool({
  name: 'get_vaccination_clinics',
  description: '[휴면] 영유아 예방접종 지정의료기관 검색.',
  inputSchema: {
    type: 'object',
    properties: {
      latitude: { type: 'number' },
      longitude: { type: 'number' },
      vaccine_type: { type: 'string' },
    },
    required: ['latitude', 'longitude'],
  },
});

export const list_vaccinations_by_age = tool({
  name: 'list_vaccinations_by_age',
  description: '[휴면] 연령별 권장 예방접종 스케줄.',
  inputSchema: {
    type: 'object',
    properties: { age_months: { type: 'number' } },
    required: ['age_months'],
  },
});

export const analyze_child_growth = tool({
  name: 'analyze_child_growth',
  description: '[휴면] 성장도표 기반 신장·체중 백분위 분석.',
  inputSchema: {
    type: 'object',
    properties: {
      age_months: { type: 'number' },
      sex: { type: 'string', enum: ['M', 'F'] },
      height_cm: { type: 'number' },
      weight_kg: { type: 'number' },
    },
    required: ['age_months', 'sex', 'height_cm', 'weight_kg'],
  },
});

export const search_child_medical = tool({
  name: 'search_child_medical',
  description: '[휴면] 영유아 건강검진 일정·지정의료기관 조회.',
  inputSchema: {
    type: 'object',
    properties: { age_months: { type: 'number' } },
    required: ['age_months'],
  },
});

// ============================================================
// 학습 / 문화 (P09 ~ P11)
// ============================================================

export const get_popular_books_by_age = tool({
  name: 'get_popular_books_by_age',
  description: '[휴면] 연령별 인기 아동 도서 목록.',
  inputSchema: {
    type: 'object',
    properties: { age_years: { type: 'number' } },
    required: ['age_years'],
  },
});

export const search_seoul_kids_cafes = tool({
  name: 'search_seoul_kids_cafes',
  description: '[휴면] 서울 키즈카페 검색.',
  inputSchema: {
    type: 'object',
    properties: { district: { type: 'string' } },
    required: [],
  },
});

export const get_museum_places = tool({
  name: 'get_museum_places',
  description: '[휴면] 어린이박물관·체험관 검색.',
  inputSchema: {
    type: 'object',
    properties: { region: { type: 'string' } },
    required: [],
  },
});

// ============================================================
// 학교 / 학원 (P12 ~ P14)
// ============================================================

export const search_academies = tool({
  name: 'search_academies',
  description: '[휴면] 학원(유아·초등 대상) 검색.',
  inputSchema: {
    type: 'object',
    properties: {
      region: { type: 'string' },
      subject: { type: 'string' },
    },
    required: ['region'],
  },
});

export const neis_school_schedule = tool({
  name: 'neis_school_schedule',
  description: '[휴면] NEIS 학사일정 조회.',
  inputSchema: {
    type: 'object',
    properties: {
      school_code: { type: 'string' },
      year_month: { type: 'string' },
    },
    required: ['school_code'],
  },
});

export const neis_school_search = tool({
  name: 'neis_school_search',
  description: '[휴면] NEIS 학교 검색.',
  inputSchema: {
    type: 'object',
    properties: { name: { type: 'string' } },
    required: ['name'],
  },
});

// ============================================================
// 복지 / 수당 (P15 ~ P17)
// ============================================================

export const search_welfare_services_parenting = tool({
  name: 'search_welfare_services_parenting',
  description: '[휴면] 육아 전용 복지서비스 검색 (보조금24 육아 필터).',
  inputSchema: {
    type: 'object',
    properties: { age_months: { type: 'number' } },
    required: [],
  },
});

export const calculate_child_benefit = tool({
  name: 'calculate_child_benefit',
  description: '[휴면] 아동수당·양육수당·부모급여 계산.',
  inputSchema: {
    type: 'object',
    properties: {
      child_age_months: { type: 'number' },
      household_income: { type: 'number' },
    },
    required: ['child_age_months'],
  },
});

export const search_childcare_leave = tool({
  name: 'search_childcare_leave',
  description: '[휴면] 육아휴직 급여·기간·조건 조회.',
  inputSchema: {
    type: 'object',
    properties: {
      leave_type: {
        type: 'string',
        enum: ['maternity', 'paternity', 'childcare', 'any'],
      },
      annual_income: { type: 'number' },
    },
    required: [],
  },
});

// ============================================================
// 내보내기
// ============================================================

export const DORMANT_TOOLS: SinhonTool[] = [
  find_daycare_by_coordinates,
  search_daycare_by_name,
  find_kindergarten_by_coordinates,
  get_kindergarten_details,
  compare_kindergartens,
  get_vaccination_clinics,
  list_vaccinations_by_age,
  analyze_child_growth,
  search_child_medical,
  get_popular_books_by_age,
  search_seoul_kids_cafes,
  get_museum_places,
  search_academies,
  neis_school_schedule,
  neis_school_search,
  search_welfare_services_parenting,
  calculate_child_benefit,
  search_childcare_leave,
];
