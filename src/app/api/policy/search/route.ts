/**
 * 보조금24 통합검색 라우트.
 *   GET /api/policy/search?keyword=신혼부부&region=인천광역시
 *
 * 큐레이트 11종(`/lib/policy/data`)과 별개로, 정부 등록 혜택 전체를 조회.
 * AI chat route 가 컨텍스트 주입용으로 우선 사용. 외부/디버그 호출도 가능.
 *
 * GOV24_API_KEY 미설정 시 `{ items: [], degraded: true }` 반환 (200).
 */

import { NextResponse } from "next/server";
import { searchGov24Services } from "@/lib/policy/gov24";

export const runtime = "nodejs";
// 라우트 자체도 6시간 캐시
export const revalidate = 21600;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const keyword = url.searchParams.get("keyword") ?? "신혼부부";
  const regionParam = url.searchParams.get("region");
  const region = regionParam === "all" ? null : regionParam ?? "인천광역시";
  const perPageRaw = Number(url.searchParams.get("perPage") ?? "20");
  const perPage = Number.isFinite(perPageRaw)
    ? Math.min(Math.max(Math.trunc(perPageRaw), 1), 50)
    : 20;

  const items = await searchGov24Services({ keyword, region, perPage });
  const degraded = !process.env.GOV24_API_KEY;

  return NextResponse.json({
    items,
    count: items.length,
    keyword,
    region,
    degraded,
  });
}
