"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

// V4 — Hero card: "우리 부부, 지금 받을 수 있는 혜택이 있을까요?"
export default function HeroCard() {
  return (
    <div className="px-4 pt-1.5 pb-1">
      <Link href="/quiz" className="block">
        <div className="rounded-[22px] p-5 bg-white border border-[#E6ECF2] active:scale-[.99] transition-transform">
          <span className="inline-flex items-center h-[22px] px-2.5 rounded-full bg-sky-card text-[11.5px] font-bold text-[#1478D4]">
            30초 진단
          </span>
          <h2 className="text-[22px] font-extrabold text-[#172033] leading-[1.3] tracking-tight mt-3">
            우리 부부, <span className="text-blue-500">지금 받을 수 있는</span>
            <br />혜택이 있을까요?
          </h2>
          <p className="text-[13px] text-[#667085] mt-2 leading-[1.55]">
            3개 질문으로 우리 부부 혜택을 오늘 할 일로 정리해드릴게요.
          </p>

          {/* sub-cards */}
          <div className="grid grid-cols-2 gap-2 mt-3.5">
            <div className="bg-sky-card rounded-xl p-3">
              <div className="text-[10.5px] text-[#1478D4] font-bold tracking-wide">정책 번역</div>
              <div className="text-[12.5px] text-[#172033] font-semibold mt-0.5 leading-[1.35]">
                어려운 용어를<br />쉬운 말로
              </div>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl p-3">
              <div className="text-[10.5px] text-[#C85A32] font-bold tracking-wide">4컷 만화</div>
              <div className="text-[12.5px] text-[#172033] font-semibold mt-0.5 leading-[1.35]">
                공문 말고<br />4컷으로 먼저
              </div>
            </div>
          </div>

          <button className="w-full h-11 mt-3.5 rounded-xl bg-blue-500 text-white text-[14.5px] font-bold flex items-center justify-center gap-1.5 active:bg-blue-600 transition-colors">
            <Sparkles size={14} />
            우리 혜택 30초만에 찾기
          </button>
        </div>
      </Link>
    </div>
  );
}
