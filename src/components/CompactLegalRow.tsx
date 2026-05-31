"use client";
import Link from "next/link";

/**
 * 풀스크린 페이지(자체 내부 스크롤을 가진) 내부에서 인라인으로 노출하는 컴팩트 법적 푸터.
 * - 외부 AppFooter 처럼 페이지 *밖*에 두면 body 스크롤이 따라오는 현상이 생김
 * - 그래서 풀스크린 페이지의 *내부 스크롤 컨테이너 마지막*에 직접 넣어 사용
 */
export function CompactLegalRow({ noBottomPad }: { noBottomPad?: boolean }) {
  return (
    <div
      aria-label="법적 안내"
      className={`mx-auto mb-2 mt-6 flex max-w-[420px] flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 text-[11px] text-faint ${
        noBottomPad ? "pb-6" : "pb-[110px]"
      }`}
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
