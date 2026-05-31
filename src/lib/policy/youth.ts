/**
 * 온통청년 OpenAPI v3 클라이언트 (youthcenter.go.kr)
 *
 * 보조금24와 별개로, 청년(만 19~39세) 정책 통합 검색.
 * 신혼 청년에게 매칭되는 청년 한정 정책(청년월세지원·청년임차보증금 등)을
 * 보조금24가 놓치는 경우를 보완.
 *
 * 키 발급: youthcenter.go.kr 회원가입 → 마이페이지 > OPEN API 신청 (즉시).
 * 미설정 시 빈 배열 반환.
 */

export type YouthService = {
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
  source: "youth";
};

type RawItem = Record<string, unknown>;

const BASE = "https://www.youthcenter.go.kr/go/ythip/getPlcy";

/** 인천광역시 법정동 코드 (시도 단위, 8자리, 뒷자리 0) */
const INCHEON_ZIPCD = "28000000";

export async function searchYouthServices(opts: {
  keyword?: string | null;
  zipCd?: string | null;
  perPage?: number;
} = {}): Promise<YouthService[]> {
  const apiKey = process.env.YOUTH_API_KEY;
  if (!apiKey) return [];

  const perPage = Math.min(opts.perPage ?? 30, 100);
  const params = new URLSearchParams();
  params.set("apiKeyNm", apiKey);
  params.set("rtnType", "json");
  params.set("pageNum", "1");
  params.set("pageSize", String(perPage));
  const zipCd = opts.zipCd === undefined ? INCHEON_ZIPCD : opts.zipCd;
  if (zipCd) params.set("zipCd", zipCd);
  if (opts.keyword) params.set("plcyKywdNm", opts.keyword);

  let json: unknown;
  try {
    const res = await fetch(`${BASE}?${params.toString()}`, {
      next: { revalidate: 6 * 60 * 60, tags: ["youth"] },
    });
    if (!res.ok) return [];
    json = await res.json();
  } catch {
    return [];
  }

  const items = extract(json);
  return items.map(normalize).filter((x): x is YouthService => x !== null);
}

function extract(json: unknown): RawItem[] {
  if (!json || typeof json !== "object") return [];
  const j = json as Record<string, unknown>;
  const result = j.result as Record<string, unknown> | undefined;
  if (result && Array.isArray(result.youthPolicyList)) return result.youthPolicyList as RawItem[];
  if (Array.isArray(j.youthPolicyList)) return j.youthPolicyList as RawItem[];
  if (Array.isArray(j.data)) return j.data as RawItem[];
  return [];
}

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

function normalize(item: RawItem): YouthService | null {
  const id = str(item.plcyNo) ?? str(item.bizId) ?? str(item.polyBizSjnm);
  const name = str(item.plcyNm) ?? str(item.polyBizSjnm);
  if (!id || !name) return null;

  const summary = str(item.plcyExplnCn) ?? str(item.polyItcnCn) ?? "";
  const org = str(item.sprvsnInstCdNm) ?? str(item.cnsgNmor) ?? "";
  const district = str(item.rgtrInstCdNm);
  const level: YouthService["level"] = district
    ? "district"
    : org.includes("인천")
    ? "city"
    : org
    ? "central"
    : "unknown";

  return {
    id,
    name,
    summary,
    org,
    level,
    district,
    url: str(item.aplyUrlAddr) ?? str(item.refUrlAddr1) ?? str(item.rqutUrla) ?? null,
    amountText: str(item.plcySprtCn) ?? str(item.sporCn) ?? null,
    targetText:
      str(item.addAplyQlfcCndCn) ??
      str(item.majrRqisCn) ??
      ([str(item.sprtTrgtMinAge), str(item.sprtTrgtMaxAge)]
        .filter(Boolean)
        .join("~") || null),
    applyMethod: str(item.plcyAplyMthdCn) ?? null,
    deadline: str(item.aplyYmd) ?? str(item.rqutPrdCn) ?? null,
    source: "youth",
  };
}
