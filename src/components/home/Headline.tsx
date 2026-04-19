"use client";

import { useCoupleProfile } from "@/lib/design/useCoupleProfile";

export default function Headline() {
  const { names } = useCoupleProfile();

  return (
    <div className="px-5 pt-1 pb-5">
      <h1 className="text-[26px] font-extrabold text-ink tracking-tightest leading-[1.28] wb-keep text-balance">
        {names} 부부,
        <br />
        신혼부부 지원금
        <br />
        <span className="text-coral-500">1억원 받는 법</span>
      </h1>
      <p className="text-[13px] text-ink-soft mt-2.5 leading-relaxed wb-keep">
        주거·대출·출산·세제·지역 — 조건 맞추면 여기까지 가능해요.
      </p>
      <p className="text-[10.5px] text-ink-muted mt-1.5 font-mono">
        ※ 조건 충족 시 최대 추정치 · 지역·소득별로 달라져요
      </p>
    </div>
  );
}
