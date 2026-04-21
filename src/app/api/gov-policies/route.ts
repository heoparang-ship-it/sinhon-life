/**
 * /api/gov-policies
 *
 * 정부 공공 API에서 신혼부부 관련 혜택 정책을 수집·정규화해 반환합니다.
 *
 * 연동 소스 (우선순위 순):
 *   1. 행정안전부 공공서비스 정보 API (data.go.kr 15113968) — JSON·실시간·10,000회/일
 *   2. 사회보장정보원 지자체복지서비스 API (data.go.kr 15108347) — XML·지역별
 *   3. 국토교통부 마이홈포털 임대주택 API (data.go.kr 15110581) — XML·공고별
 *
 * serviceKey 설정 방법:
 *   Amplify 콘솔 → 환경 변수에 추가:
 *     GOV_POLICY_API_KEY=<data.go.kr 활용신청 후 발급된 인증키>
 *   발급 경로: https://www.data.go.kr → 원하는 API 검색 → 활용신청 (자동승인)
 *
 * serviceKey 미설정 시 → 빈 배열 반환 (앱은 constants.ts 정적 POLICIES만 표시)
 */

import { NextResponse } from "next/server";

// ── 타입 ────────────────────────────────────────────────────────────────────

export interface GovPolicy {
  /** 고유 ID (source + 원본 ID 조합) */
  id: string;
  /** 정책명 */
  title: string;
  /** 짧은 요약 (1줄) */
  summary: string;
  /** 카테고리 — POLICIES.category 와 동일 체계 */
  category: "housing" | "baby" | "finance" | "tax";
  /** 신청 URL */
  applyUrl?: string;
  /** 담당 부처명 */
  ministry?: string;
  /** 대상 조건 요약 */
  targetDesc?: string;
  /** 지원 내용 요약 */
  supportDesc?: string;
  /** 원본 데이터 출처 */
  source: "mois" | "ssis-local" | "myhome";
}

// ── 상수 ────────────────────────────────────────────────────────────────────

/** 신혼부부 관련성 판단 키워드 */
const NEWLYWED_KEYWORDS = [
  "신혼부부", "신혼", "결혼", "혼인", "신생아", "출산", "임신", "육아",
  "임대주택", "행복주택", "전세임대", "매입임대", "공공임대",
  "부모급여", "아이돌봄", "산모", "첫만남", "영아수당",
];

/** 제외 키워드 (대출·금융상품) — sinhon.life 방침 */
const EXCLUDE_KEYWORDS = [
  "대출", "디딤돌", "버팀목", "담보", "전세자금대출", "보금자리론",
];

/**
 * 행정안전부 공공서비스 정보 API 엔드포인트
 * 공식: https://www.data.go.kr/data/15113968/openapi.do
 */
const MOIS_API_BASE = "https://apis.data.go.kr/1741000/publicServiceList2/getPublicSvcList2";

/**
 * 사회보장정보원 지자체복지서비스 API 엔드포인트
 * 공식: https://www.data.go.kr/data/15108347/openapi.do
 */
const SSIS_LOCAL_API_BASE = "https://apis.data.go.kr/B554287/LocalGovWelfareInfoService2/getWelfareList";

/**
 * 국토교통부 마이홈포털 임대주택 API 엔드포인트
 * 공식: https://www.data.go.kr/data/15110581/openapi.do
 */
const MYHOME_API_BASE = "https://data.myhome.go.kr/rentalHouseList";

// ── 유틸 ────────────────────────────────────────────────────────────────────

function isNewlywedRelated(text: string): boolean {
  const lower = text.toLowerCase();
  if (EXCLUDE_KEYWORDS.some((kw) => lower.includes(kw))) return false;
  return NEWLYWED_KEYWORDS.some((kw) => text.includes(kw));
}

function inferCategory(text: string): GovPolicy["category"] {
  if (/임대|청약|주택|주거|행복주택|전세/.test(text)) return "housing";
  if (/출산|신생아|임신|육아|아동|부모급여|돌봄|산모/.test(text)) return "baby";
  if (/세금|세액|소득공제|취득세/.test(text)) return "tax";
  return "baby"; // 기본값: 복지 → baby 카테고리
}

// ── 행정안전부 API (JSON) ────────────────────────────────────────────────────

async function fetchMoisPolicies(apiKey: string): Promise<GovPolicy[]> {
  const params = new URLSearchParams({
    serviceKey: apiKey,
    pageNo: "1",
    numOfRows: "100",
    _type: "json",
  });

  const res = await fetch(`${MOIS_API_BASE}?${params}`, {
    next: { revalidate: 86400 }, // 24시간 캐시
  });

  if (!res.ok) return [];

  const json = await res.json();
  const items: Record<string, string>[] =
    json?.response?.body?.items?.item ?? [];

  return items
    .filter((item) =>
      isNewlywedRelated(
        `${item.svcNm ?? ""} ${item.svcSumry ?? ""} ${item.tgts ?? ""}`
      )
    )
    .map((item) => ({
      id: `mois-${item.svcId ?? Math.random()}`,
      title: item.svcNm ?? "정책명 없음",
      summary: item.svcSumry ?? "",
      category: inferCategory(`${item.svcNm ?? ""} ${item.svcSumry ?? ""}`),
      applyUrl: item.svcUrl ?? undefined,
      ministry: item.inqplCtadr ?? undefined,
      targetDesc: item.tgts ?? undefined,
      supportDesc: item.givCn ?? undefined,
      source: "mois",
    }));
}

// ── 사회보장정보원 API (XML 간이 파싱) ──────────────────────────────────────

/** XML 태그 내용 추출 (fast-xml-parser 불필요한 경량 버전) */
function extractXmlTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : "";
}

function extractXmlItems(xml: string): string[] {
  const items: string[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) !== null) items.push(m[1]);
  return items;
}

async function fetchSsisLocalPolicies(
  apiKey: string,
  brtcCode = "28" // 기본: 인천 (28) — 서울은 11
): Promise<GovPolicy[]> {
  const params = new URLSearchParams({
    serviceKey: apiKey,
    pageNo: "1",
    numOfRows: "100",
    brtcCode,
  });

  const res = await fetch(`${SSIS_LOCAL_API_BASE}?${params}`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];

  const xml = await res.text();
  const items = extractXmlItems(xml);

  return items
    .map((raw) => ({
      wlfareSvcId: extractXmlTag(raw, "wlfareSvcId"),
      wlfareSvcNm: extractXmlTag(raw, "wlfareSvcNm"),
      wlfareSvcCn: extractXmlTag(raw, "wlfareSvcCn"),
      lfcycTpCdNm: extractXmlTag(raw, "lfcycTpCdNm"),
      mngOrgnCdNm: extractXmlTag(raw, "mngOrgnCdNm"),
      trgtNm: extractXmlTag(raw, "trgtNm"),
    }))
    .filter((item) =>
      isNewlywedRelated(
        `${item.wlfareSvcNm} ${item.wlfareSvcCn} ${item.lfcycTpCdNm}`
      )
    )
    .map((item) => ({
      id: `ssis-${item.wlfareSvcId || Math.random()}`,
      title: item.wlfareSvcNm || "정책명 없음",
      summary: item.wlfareSvcCn.slice(0, 100),
      category: inferCategory(`${item.wlfareSvcNm} ${item.lfcycTpCdNm}`),
      ministry: item.mngOrgnCdNm || undefined,
      targetDesc: item.trgtNm || undefined,
      source: "ssis-local" as const,
    }));
}

// ── 마이홈포털 API (XML 간이 파싱) ──────────────────────────────────────────

async function fetchMyhomePolicies(apiKey: string): Promise<GovPolicy[]> {
  // 수도권(서울 11, 인천 28, 경기 41) 임대주택 공고 수집
  const regions = ["11", "28", "41"];
  const results: GovPolicy[] = [];

  for (const brtcCode of regions) {
    const params = new URLSearchParams({
      serviceKey: apiKey,
      pageNo: "1",
      numOfRows: "20",
      brtcCode,
    });

    try {
      const res = await fetch(`${MYHOME_API_BASE}?${params}`, {
        next: { revalidate: 21600 }, // 6시간 캐시 (공고는 수시 업데이트)
      });

      if (!res.ok) continue;

      const xml = await res.text();
      const items = extractXmlItems(xml);

      for (const raw of items) {
        const pblancNo = extractXmlTag(raw, "pblancNo");
        const pblancNm = extractXmlTag(raw, "pblancNm");
        const hssType = extractXmlTag(raw, "hssType");
        const signguNm = extractXmlTag(raw, "signguNm");
        const houseNm = extractXmlTag(raw, "houseNm");

        results.push({
          id: `myhome-${pblancNo || Math.random()}`,
          title: pblancNm || "임대주택 공고",
          summary: `${hssType} — ${signguNm} 신청 접수`.trim(),
          category: "housing",
          applyUrl: "https://www.myhome.go.kr",
          ministry: "국토교통부",
          targetDesc: houseNm || undefined,
          source: "myhome",
        });
      }
    } catch {
      continue;
    }
  }

  return results;
}

// ── 메인 핸들러 ──────────────────────────────────────────────────────────────

export async function GET() {
  const apiKey = process.env.GOV_POLICY_API_KEY;

  // serviceKey 미설정 → 빈 배열 반환 (앱이 정적 POLICIES 폴백)
  if (!apiKey) {
    return NextResponse.json({
      policies: [],
      meta: {
        status: "no_api_key",
        message:
          "GOV_POLICY_API_KEY 환경변수를 설정하면 실시간 정부 데이터가 표시됩니다. " +
          "발급: https://www.data.go.kr/data/15113968/openapi.do",
        count: 0,
      },
    });
  }

  // 세 소스 병렬 수집
  const [moisPolicies, ssisSeoul, ssisIncheon, myhomePolicies] = await Promise.allSettled([
      fetchMoisPolicies(apiKey),
      fetchSsisLocalPolicies(apiKey, "11"), // 서울
      fetchSsisLocalPolicies(apiKey, "28"), // 인천
      fetchMyhomePolicies(apiKey),
    ]);

  const all: GovPolicy[] = [
    ...(moisPolicies.status === "fulfilled" ? moisPolicies.value : []),
    ...(ssisSeoul.status === "fulfilled" ? ssisSeoul.value : []),
    ...(ssisIncheon.status === "fulfilled" ? ssisIncheon.value : []),
    ...(myhomePolicies.status === "fulfilled" ? myhomePolicies.value : []),
  ];

  // 중복 ID 제거
  const unique = Array.from(
    new Map(all.map((p) => [p.id, p])).values()
  );

  return NextResponse.json({
    policies: unique,
    meta: {
      status: "ok",
      count: unique.length,
      sources: {
        mois: moisPolicies.status === "fulfilled" ? moisPolicies.value.length : "error",
        ssisSeoul: ssisSeoul.status === "fulfilled" ? ssisSeoul.value.length : "error",
        ssisIncheon: ssisIncheon.status === "fulfilled" ? ssisIncheon.value.length : "error",
        myhome: myhomePolicies.status === "fulfilled" ? myhomePolicies.value.length : "error",
      },
      updatedAt: new Date().toISOString(),
    },
  });
}
