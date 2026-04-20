/**
 * sinhon.life 챗봇 Tool Calling 공통 타입.
 *
 * 맥락 경계: 이 디렉터리는 sinhon.life 앱의 B2C 챗봇 툴셋이다.
 * 운영자용 founder-gov-radar 스킬과는 완전히 분리된 코드베이스.
 * 자세한 설계: docs/sinhon_chatbot_tools.md
 */

export type ToolCategory = 'location' | 'housing' | 'finance' | 'wedding' | 'public' | 'profile' | 'parenting';

export type ToolStatus = 'active' | 'dormant';

/** Claude Messages API의 `tools` 파라미터와 호환되는 JSON Schema */
export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, unknown>;
  required?: string[];
}

/** 툴 실행 컨텍스트 (Phase 2+에서 사용). Phase 1에서는 참조만 있고 실행되지 않음. */
export interface ToolContext {
  /** 유저 요청 IP (rate limit 추적용) */
  ip: string;
  /** 클라이언트 사이드 프로필 (get_my_profile 전용) */
  profile?: Record<string, unknown>;
  /** 공공 API 키 (Phase 3+) */
  apiKeys?: {
    kakao?: string;
    dataGoKr?: string;
  };
}

/** 툴 실행 결과 (Phase 2+에서 사용) */
export interface ToolResult {
  /** 사람이 읽을 수 있는 결과 요약 (LLM에 주입됨) */
  summary: string;
  /** 구조화된 데이터 (LLM이 후속 툴 호출에 사용 가능) */
  data?: unknown;
  /** 답변 인용용 출처 URL (LLM이 답변에 포함해야 함) */
  sourceUrls?: string[];
  /** 캐시 히트 여부 (디버깅용) */
  cacheHit?: boolean;
}

/** sinhon.life 챗봇 툴의 정식 정의 */
export interface SinhonTool {
  /** Claude API에 전달되는 툴 이름 (영문 snake_case) */
  name: string;
  /** LLM이 이 툴을 언제 쓸지 판단하는 설명 (한국어 OK) */
  description: string;
  /** 카테고리 (디버깅/UI 분류용) */
  category: ToolCategory;
  /** active: 사용자에게 노출 / dormant: ENABLE_PARENTING_TOOLS 필요 */
  status: ToolStatus;
  /** JSON Schema — Claude API tools 파라미터로 직접 전달 */
  inputSchema: ToolInputSchema;
  /** 툴 실행 핸들러. Phase 1에서는 반드시 ToolDisabledError throw. */
  handler: (input: Record<string, unknown>, ctx: ToolContext) => Promise<ToolResult>;
}

/** Phase 1에서 모든 핸들러가 throw하는 에러 */
export class ToolDisabledError extends Error {
  constructor(toolName: string, status: ToolStatus) {
    super(
      status === 'dormant'
        ? `[${toolName}] 육아 관련 툴은 현재 휴면 상태입니다. ENABLE_PARENTING_TOOLS=true 설정 후 Phase 5에서 활성화 예정.`
        : `[${toolName}] 액티브 툴 스키마는 정의됐지만 구현은 Phase 2 이후 단계별 활성화됩니다 (docs/sinhon_chatbot_tools.md).`
    );
    this.name = 'ToolDisabledError';
  }
}
