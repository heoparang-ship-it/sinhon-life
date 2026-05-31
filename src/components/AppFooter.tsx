"use client";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

/**
 * 사이트 푸터.
 *
 * 정책:
 * - 풀스크린 페이지(자체 내부 스크롤 보유: /, /ai, /budget, /my, /checklist, /partners,
 *   /policy, /support, /lp/*, /index/*) 에서는 **null** 반환.
 *   이유: 풀스크린 페이지가 100dvh 를 차지하는데, 그 *밖*에 푸터를 또 박으면
 *   body 자체 높이가 100dvh + 푸터 가 되어 모바일에서 body 스크롤이 활성화되고,
 *   사용자가 살짝 스크롤 했다가 올리면 푸터가 "따라오는" 현상이 발생함.
 *   풀스크린 페이지의 법적 정보는 페이지 내부에서 CompactLegalRow 로 직접 노출.
 * - 그 외 페이지(/terms, /privacy, /business, /login 등)에서는 풀 사업자정보 푸터.
 */
export function AppFooter() {
  const pathname = usePathname() || "/";
  const isFullScreenPage =
    pathname === "/" ||
    pathname.startsWith("/ai") ||
    pathname.startsWith("/budget") ||
    pathname.startsWith("/my") ||
    pathname.startsWith("/checklist") ||
    pathname.startsWith("/partners") ||
    pathname.startsWith("/policy") ||
    pathname.startsWith("/support") ||
    pathname.startsWith("/lp/") ||
    pathname.startsWith("/index/");
  if (isFullScreenPage) return null;
  return <Footer />;
}
