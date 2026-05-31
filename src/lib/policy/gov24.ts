/**
 * 보조금24 통합검색 API 클라이언트 (data.go.kr 행정안전부 데이터셋 15113968)
 *
 * 용도: 큐레이트한 인천 11종 정책(`data.ts`) 외에, **인천 신혼부부에게 매칭되는
 * 정부 등록 혜택 전체**를 AI 대화 흐름에서 실시간으로 끌어오기 위함.
 *
 * 설계 원칙
 *  - **큐레이트 우선**: 결과는 큐레이트 11종을 보완하는 후순위 컨텍스트로만 사용
 *  - **키 미설정 graceful**: GOV24_API_KEY 없으면 빈 배열 반환(에러 X) — 큐레이트만으로 동작
 *  - **Next fetch 캐시 6h**: 정책 데이터는 일~월 단위 갱신이라 6시간 캐시면 충분
 *
 * 참고: data.go.kr 활용신청 자동승인. 일 10,000건 한도.
 */

export type Gov24Service = {
  id: string;
  name: string;
  summary: string;
  org: string;
  level: "central" | "city" | "district" | "unknown";
  district: string | null;
  url: string | null;
  amountText: string | null;
  targetText: string | null;
  applyMethod: string | null;
  deadline: string | null;
};

type Gov24RawItem = Record<string, unknown>;

const BASE = "https://apis.data.go.kr/1383000/gov24/v3/serviceList";

/** 인천 신혼부부 매칭 쿼리 — 기본값. 호출 측에서 keyword 만 override */
const DEFAULT_REGION = "인천광역시";

/**
 * 보조금24 통합검색.
 *
 * @param opts.keyword  검색 키워드 (기본 "신혼부부")
 * @param opts.region   시도명 (기본 "인천광역시"). null 이면 지역 필터 없음
 * @param opts.perPage  페이지당 결과 수 (기본 20)
 * @returns 정규화된 서비스 배열. 키 미설정/네트워크 오류 시 빈 배열
 */
export async function searchGov24Services(opts: {
  keyword?: string;
  region?: string | null;
  perPage?: number;
} = {}): Promise<Gov24Service[]> {
  const apiKey = process.env.GOV24_API_KEY;
  if (!apiKey) return [];

  const keyword = opts.keyword ?? "신혼부부";
  const region = opts.region === undefined ? DEFAULT_REGION : opts.region;
  const perPage = opts.perPage ?? 20;

  const params = new URLSearchParams();
  params.set("serviceKey", apiKey);
  params.set("page", "1");
  params.set("perPage", String(perPage));
  params.set("returnType", "JSON");
  // v3 cond 필터 문법: cond[필드::연산자]=값
  params.set("cond[searchKeyword::EQ]", keyword);
  if (region) params.set("cond[ctpvNm::EQ]", region);

  const url = `${BASE}?${params.toString()}`;

  let json: unknown;
  try {
    const res = await fetch(url, {
      // 6시간 캐시 — 정책 데이터 갱신 주기 고려
      next: { revalidate: 6 * 60 * 60, tags: ["gov24"] },
    });
    if (!res.ok) return [];
    json = await res.json();
  } catch {
    return [];
  }

  const items = extractDataArray(json);
  return items.map(normalize).filter((s): s is Gov24Service => s !== null);
}

/** 응답 envelope 다양성 흡수 — data/items/response.body.items 등 */
function extractDataArray(json: unknown): Gov24RawItem[] {
  if (!json || typeof json !== "object") return [];
  const j = json as Record<string, unknown>;
  if (Array.isArray(j.data)) return j.data as Gov24RawItem[];
  if (Array.isArray((j as { items?: unknown }).items)) return j.items as Gov24RawItem[];
  const body = (j.response as Record<string, unknown> | undefined)?.body as
    | Record<string, unknown>
    | undefined;
  if (body) {
    if (Array.isArray(body.items)) return body.items as Gov24RawItem[];
    const inner = body.items as { item?: unknown } | undefined;
    if (inner && Array.isArray(inner.item)) return inner.item as Gov24RawItem[];
  }
  return [];
}

function s(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

function normalize(item: Gov24RawItem): Gov24Service | null {
  const id = s(item.serviceId) ?? s(item.svcId) ?? s(item.SVC_ID);
  const name = s(item.serviceName) ?? s(item.svcNm) ?? s(item.SVC_NM);
  if (!id || !name) return null;

  const summary =
    s(item.servDgst) ??
    s(item.serviceSummary) ??
    s(item.svcDgst) ??
    s(item.supportContent) ??
    "";

  const org =
    s(item.mngOrgNm) ??
    s(item.mngCentralOrgNm) ??
    s(item.aplyOrgNm) ??
    "";

  const sggNm = s(item.sggNm);
  const ctpvNm = s(item.ctpvNm);
  const level: Gov24Service["level"] = sggNm
    ? "district"
    : ctpvNm
    ? "city"
    : org
    ? "central"
    : "unknown";

  const url =
    s(item.servDtlLink) ??
    s(item.onlineApplicationUrl) ??
    s(item.svcUrl) ??
    null;

  return {
    id,
    name,
    summary,
    org,
    level,
    district: sggNm,
    url,
    amountText: s(item.supportContent) ?? s(item.amountOrRate) ?? null,
    targetText: s(item.supportTarget) ?? s(item.target) ?? null,
    applyMethod: s(item.applyMethod) ?? s(item.aplyMthd) ?? null,
    deadline: s(item.applyDeadline) ?? s(item.aplyEndDt) ?? null,
  };
}

/** 큐레이트 정책 이름과 중복되는 항목 제거 (대소문자/공백 무시) */
export function dedupeAgainst(
  services: Gov24Service[],
  curatedNames: string[],
): Gov24Service[] {
  const seen = new Set(curatedNames.map((n) => n.replace(/\s+/g, "").toLowerCase()));
  return services.filter((sv) => {
    const k = sv.name.replace(/\s+/g, "").toLowerCase();
    return !seen.has(k);
  });
}
