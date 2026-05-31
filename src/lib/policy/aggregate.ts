/**
 * 정책 소스 통합 — "모든 수단을 가리지 말고 정책 체크".
 *
 * 큐레이트 11종(`data.ts`)은 신뢰도 '확인' 등급이라 답변 컨텍스트에서
 * 우선순위를 가지며, 본 aggregator는 그 외 정부/공공 소스를 병렬로
 * 긁어서 중복 제거 후 통합한다.
 *
 * 현재 소스
 *  - 보조금24 (행안부, gov24.ts) — 인천+신혼부부 키워드 기본
 *  - 온통청년 (youthcenter.go.kr, youth.ts) — 인천 zipCd 기본
 *
 * 새 소스 추가 패턴
 *  1. `src/lib/policy/<source>.ts` 에 클라이언트 + 정규화
 *  2. 본 파일 `aggregatePolicies` 의 Promise.all 에 호출 추가
 *  3. 결과를 `UnifiedPolicy` 형태로 매핑해 push
 *
 * 각 소스는 키 미설정 시 graceful (빈 배열). 새 소스가 망가져도
 * 다른 소스 결과는 그대로 제공된다.
 */

import { searchGov24Services, type Gov24Service } from "@/lib/policy/gov24";
import { searchYouthServices, type YouthService } from "@/lib/policy/youth";

export type UnifiedPolicy = {
  source: "gov24" | "youth";
  id: string;
  name: string;
  summary: string;
  org: string;
  level: "central" | "city" | "district" | "unknown";
  url: string | null;
  amountText: string | null;
  targetText: string | null;
};

function fromGov24(s: Gov24Service): UnifiedPolicy {
  return {
    source: "gov24",
    id: `gov24:${s.id}`,
    name: s.name,
    summary: s.summary,
    org: s.org,
    level: s.level,
    url: s.url,
    amountText: s.amountText,
    targetText: s.targetText,
  };
}

function fromYouth(s: YouthService): UnifiedPolicy {
  return {
    source: "youth",
    id: `youth:${s.id}`,
    name: s.name,
    summary: s.summary,
    org: s.org,
    level: s.level,
    url: s.url,
    amountText: s.amountText,
    targetText: s.targetText,
  };
}

const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();

/**
 * 모든 등록 소스를 병렬 조회해 통합. 큐레이트 이름은 제외.
 *
 * @param opts.keyword       검색 키워드 (보조금24·온통청년 공통). 기본 "신혼부부"
 * @param opts.excludeNames  큐레이트 정책 이름 배열 (중복 제외)
 * @param opts.perSource     소스당 최대 개수 (기본 30)
 */
export async function aggregatePolicies(opts: {
  keyword?: string;
  excludeNames?: string[];
  perSource?: number;
} = {}): Promise<UnifiedPolicy[]> {
  const keyword = opts.keyword ?? "신혼부부";
  const perPage = opts.perSource ?? 30;

  const [gov24, youth] = await Promise.all([
    searchGov24Services({ keyword, region: "인천광역시", perPage }),
    // 온통청년은 "신혼부부" 키워드보다 "주거"·"결혼" 키워드가 더 잘 잡힘 — 둘 다 시도
    searchYouthServices({ keyword, perPage }),
  ]);

  const merged: UnifiedPolicy[] = [...gov24.map(fromGov24), ...youth.map(fromYouth)];

  // 이름 기준 dedupe (큐레이트 + 소스 간 중복)
  const excludeSet = new Set((opts.excludeNames ?? []).map(norm));
  const seen = new Set<string>();
  const out: UnifiedPolicy[] = [];
  for (const p of merged) {
    const k = norm(p.name);
    if (excludeSet.has(k) || seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out;
}

/** 통합 결과 → AI 시스템 컨텍스트 문자열 */
export function aggregateContext(items: UnifiedPolicy[], limit = 10): string | null {
  if (items.length === 0) return null;
  const lines = items.slice(0, limit).map((it) => {
    const levelTag =
      it.level === "district" ? "군구" : it.level === "city" ? "지자체" : it.level === "central" ? "중앙" : "기관";
    const src = it.source === "gov24" ? "보조금24" : "온통청년";
    const summary = it.summary ? ` — ${it.summary.slice(0, 80)}` : "";
    const org = it.org ? ` (${it.org})` : "";
    return `- [${src}/${levelTag}] ${it.name}${org}${summary}`;
  });
  return [
    "★정부·공공 정책 통합검색에서 방금 가져온 추가 후보(인천·신혼/청년, 큐레이트 11종 외):",
    ...lines,
    "안내 원칙: 위 후보는 정부 등록 메타데이터예요. 세부 자격은 별도 확인이 필요하다고 사용자에게 솔직히 안내하고, 가능하면 \"자세한 자격은 보조금24/온통청년/소관기관에서 확인해요\" 톤으로 답해요.",
  ].join("\n");
}
