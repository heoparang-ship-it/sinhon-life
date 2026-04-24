"use client";

import { ChevronRight } from "lucide-react";

const DEADLINES = [
  { title: "서울시 신혼부부 임차보증금 이자지원", dDay: "D-12", agency: "서울주거포털" },
  { title: "경기도 청년 월세 한시 지원", dDay: "D-23", agency: "경기도청" },
];

// V4 — 마감 임박 리스트
export default function DeadlineList() {
  return (
    <section className="px-4 pt-4.5 pb-1">
      <div className="flex items-center mb-2.5">
        <h3 className="text-[15px] font-extrabold text-[#172033]">곧 마감이에요</h3>
        <span className="ml-auto text-[12px] text-[#667085] flex items-center gap-0.5">
          전체 <ChevronRight size={10} />
        </span>
      </div>
      {DEADLINES.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 bg-white rounded-[14px] border border-[#E6ECF2] p-3 mb-2"
        >
          <div className="w-11 h-11 rounded-xl bg-butter-card flex items-center justify-center text-[12px] font-extrabold text-[#8A6A08] tracking-tight">
            {item.dDay}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-semibold text-[#172033] truncate">{item.title}</div>
            <div className="text-[11px] text-[#667085] mt-0.5">{item.agency} · 조건 충족 시</div>
          </div>
          <ChevronRight size={14} className="text-[#98A2B3] flex-shrink-0" />
        </div>
      ))}
    </section>
  );
}
