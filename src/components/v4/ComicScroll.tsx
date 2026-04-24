"use client";

import Link from "next/link";
import Char from "./Char";

const COMICS = [
  { title: "신혼 전세대출", sub: "버팀목 편", ch: "bom" as const },
  { title: "신혼특공 청약", sub: "소득·자산 편", ch: "jun" as const },
  { title: "첫만남이용권", sub: "200만원 편", ch: "card" as const },
];

// V4 — 4컷만화 가로스크롤 섹션
export default function ComicScroll() {
  return (
    <section className="pt-5 pb-2">
      <div className="px-4 mb-3">
        <h3 className="text-[17px] font-extrabold text-[#172033] tracking-tight">
          공문 말고, 4컷으로 먼저 보기
        </h3>
        <p className="text-[12px] text-[#667085] mt-0.5">
          랑·봄·준이 쉬운말로 정리해드려요
        </p>
      </div>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide px-4 pb-1.5">
        {COMICS.map((c, i) => (
          <Link
            key={i}
            href="/policy/newlywed-jeonse"
            className="flex-shrink-0 w-[172px] rounded-2xl bg-peach-card p-3.5 active:scale-[.98] transition-transform"
          >
            <div className="text-[10px] font-bold text-[#C85A32] tracking-wide">{c.sub}</div>
            <div className="text-[14.5px] font-extrabold text-[#172033] mt-0.5 leading-[1.3]">
              {c.title}
            </div>
            <div className="text-[11px] text-[#2E3A52] mt-1.5 leading-[1.4]">4컷으로 3분 이해</div>
            <div className="flex justify-end mt-4">
              <Char who={c.ch} size={64} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
