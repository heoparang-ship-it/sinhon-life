"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Footer } from "@/components/Footer";

/**
 * 사이트 푸터.
 * - 풀스크린 모바일 화면: 컴팩트 푸터(이용약관·개인정보처리방침·사업자정보 링크) 노출 — 법적 접근성·신뢰 확보
 * - 그 외 화면: 풀 사이즈 사업자정보 푸터
 */
export function AppFooter() {
  const pathname = usePathname() || "/";
  const compact =
    pathname === "/" ||
    pathname.startsWith("/ai") ||
    pathname.startsWith("/budget") ||
    pathname.startsWith("/my") ||
    pathname.startsWith("/checklist") ||
    pathname.startsWith("/partners") ||
    pathname.startsWith("/policy") ||
    pathname.startsWith("/index/");
  if (compact) return <CompactLegalRow />;
  return <Footer />;
}

function CompactLegalRow() {
  return (
    <div
      aria-label="법적 안내"
      className="mx-auto mb-2 mt-6 flex max-w-[480px] flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 pb-[110px] text-[11px] text-faint"
    >
      <Link href="/terms" className="font-bold text-mute underline-offset-2 hover:underline">
        이용약관
      </Link>
      <span aria-hidden>·</span>
      <Link href="/privacy" className="font-bold text-mute underline-offset-2 hover:underline">
        <b>개인정보처리방침</b>
      </Link>
      <span aria-hidden>·</span>
      <Link href="/business" className="text-mute underline-offset-2 hover:underline">
        사업자정보
      </Link>
      <span className="basis-full text-center text-[10.5px] text-faint">
        © 2026 주식회사 엑스컴 · 사업자 715-81-03544
      </span>
    </div>
  );
}
