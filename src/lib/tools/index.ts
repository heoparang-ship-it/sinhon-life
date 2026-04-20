/**
 * sinhon.life 챗봇 Tool Calling 진입점.
 *
 * 맥락 경계: 이 디렉터리는 sinhon.life 앱의 B2C 챗봇 툴셋이다.
 * 운영자용 founder-gov-radar 스킬과는 완전히 분리된 코드베이스.
 *
 * Phase 1 현재 상태:
 *   - 32개 툴의 JSON Schema 정의 완료 (active 14 + dormant 18)
 *   - 모든 핸들러는 ToolDisabledError throw
 *   - Claude API의 `tools` 파라미터에 스키마만 전달 가능 (LLM이 호출 계획 세우게만)
 *   - 실제 호출은 api/chat 쪽에서 try/catch 로 ToolDisabledError를 잡아 사용자에게 안내
 *
 * Phase 2+ 로드맵: docs/sinhon_chatbot_tools.md
 */

import type { SinhonTool } from './types';
import { ACTIVE_TOOLS } from './active';
import { DORMANT_TOOLS } from './dormant';

export { ToolDisabledError } from './types';
export type { SinhonTool, ToolContext, ToolResult, ToolCategory, ToolStatus } from './types';

/** Feature flag: 육아 관련 휴면 툴 활성화 여부 */
const ENABLE_PARENTING = process.env.ENABLE_PARENTING_TOOLS === 'true';

/** 현재 사용 가능한 툴 전체 목록 */
export function getEnabledTools(): SinhonTool[] {
  return ENABLE_PARENTING ? [...ACTIVE_TOOLS, ...DORMANT_TOOLS] : [...ACTIVE_TOOLS];
}

/** Claude Messages API에 넘길 `tools` 파라미터 형태로 변환 */
export function toAnthropicToolDefinitions(): Array<{
  name: string;
  description: string;
  input_schema: SinhonTool['inputSchema'];
}> {
  return getEnabledTools().map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema,
  }));
}

/** 이름으로 툴 조회 (Claude가 tool_use 블록을 보내면 이걸로 찾아서 실행 시도) */
export function findTool(name: string): SinhonTool | undefined {
  return [...ACTIVE_TOOLS, ...DORMANT_TOOLS].find((t) => t.name === name);
}

export { ACTIVE_TOOLS, DORMANT_TOOLS };
