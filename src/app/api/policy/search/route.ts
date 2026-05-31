/**
 * 정책 통합검색 라우트.
 *   GET /api/policy/search?keyword=신혼부부
 *
 * 모든 등록 정부/공공 소스(보조금24·온통청년)를 병렬 조회하여 통합 반환.
 * 큐레이트 11종은 별도로 클라이언트에서 노출(`/policy` 탭) — 본 라우트 결과와 분리.
 *
 * 키 미설정 소스는 자동 skip → 결과 비어도 200.
 */

import { NextResponse } from "next/server";
import { aggregatePolicies } from "@/lib/policy/aggregate";

export const runtime = "nodejs";
export const revalidate = 21600; // 6h

export async function GET(request: Request) {
  const url = new URL(request.url);
  const keyword = url.searchParams.get("keyword") ?? "신혼부부";
  const perPageRaw = Number(url.searchParams.get("perSource") ?? "30");
  const perSource = Number.isFinite(perPageRaw)
    ? Math.min(Math.max(Math.trunc(perPageRaw), 1), 100)
    : 30;

  const items = await aggregatePolicies({ keyword, perSource });

  return NextResponse.json({
    items,
    count: items.length,
    keyword,
    sources: {
      gov24: { configured: !!process.env.GOV24_API_KEY },
      youth: { configured: !!process.env.YOUTH_API_KEY },
    },
  });
}
