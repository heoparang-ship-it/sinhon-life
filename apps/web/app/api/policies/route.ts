import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 3600;

const ENDPOINT = "https://api.odcloud.kr/api/gov24/v3/serviceList";
const KEYWORDS = ["신혼", "혼인", "결혼", "출산", "육아", "난임", "신생아", "전세임대", "특별공급"];

type RawService = {
  서비스ID?: string;
  서비스명?: string;
  서비스목적요약?: string;
  지원대상?: string;
  지원내용?: string;
  신청방법?: string;
  신청기한?: string;
  소관기관명?: string;
  소관조직명?: string;
  상세조회URL?: string;
};

export type NormalizedPolicy = {
  id: string;
  title: string;
  dept: string;
  cat: string;
  icon: "b1" | "b2" | "b3" | "b4" | "b5" | "b6";
  summary: string;
  target: string;
  support: string;
  howTo: string;
  deadline: string;
  sourceUrl: string;
};

function categorize(text: string): { cat: string; icon: NormalizedPolicy["icon"] } {
  const t = text;
  if (/(전세|대출|디딤돌|버팀목|보금자리)/.test(t)) return { cat: "전세·대출", icon: "b2" };
  if (/(청약|특별공급|희망타운|임대주택|주거)/.test(t)) return { cat: "주거·청약", icon: "b1" };
  if (/(출산|신생아|첫만남|산후)/.test(t)) return { cat: "출산", icon: "b4" };
  if (/(육아|돌봄|보육|어린이집|아이|유아)/.test(t)) return { cat: "육아", icon: "b3" };
  if (/(난임|시술|건강|임신)/.test(t)) return { cat: "건강·난임", icon: "b6" };
  if (/(혼인|결혼|신혼|축하금|세제)/.test(t)) return { cat: "혼인·세제", icon: "b5" };
  return { cat: "혼인·세제", icon: "b5" };
}

function trimText(s: string | undefined, max = 160): string {
  if (!s) return "";
  const clean = s.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max) + "…" : clean;
}

async function fetchKeyword(key: string, keyword: string): Promise<RawService[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("page", "1");
  url.searchParams.set("perPage", "30");
  url.searchParams.set("serviceKey", key);
  url.searchParams.set("cond[서비스명::LIKE]", keyword);
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: RawService[] };
  return json.data ?? [];
}

export async function GET() {
  const key = process.env.GOV24_SERVICE_KEY;
  if (!key) {
    return NextResponse.json({ error: "GOV24_SERVICE_KEY not set", policies: [] }, { status: 500 });
  }

  try {
    const batches = await Promise.all(KEYWORDS.map((k) => fetchKeyword(key, k)));
    const seen = new Set<string>();
    const policies: NormalizedPolicy[] = [];

    for (const batch of batches) {
      for (const raw of batch) {
        const id = raw.서비스ID;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        const blob = `${raw.서비스명 ?? ""} ${raw.지원대상 ?? ""} ${raw.지원내용 ?? ""}`;
        const { cat, icon } = categorize(blob);
        policies.push({
          id,
          title: raw.서비스명?.trim() ?? "(이름 없음)",
          dept: raw.소관기관명?.trim() || raw.소관조직명?.trim() || "정부",
          cat,
          icon,
          summary: trimText(raw.서비스목적요약, 200),
          target: trimText(raw.지원대상, 140),
          support: trimText(raw.지원내용, 200),
          howTo: trimText(raw.신청방법, 140),
          deadline: trimText(raw.신청기한, 60) || "상시",
          sourceUrl:
            raw.상세조회URL?.trim() ?? "https://www.gov.kr/portal/onestopSvc/maritalSupport"
        });
      }
    }

    return NextResponse.json({ policies, updatedAt: new Date().toISOString() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "fetch failed";
    return NextResponse.json({ error: msg, policies: [] }, { status: 502 });
  }
}
