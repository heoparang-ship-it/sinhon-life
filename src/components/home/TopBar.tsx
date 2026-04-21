"use client";

export default function TopBar() {
  return (
    <div className="flex items-center px-5 pt-4 pb-2.5 gap-2.5">
      {/* sinhon.life 소형 로고 */}
      <span className="font-mono text-[10px] italic tracking-wide text-coral-500 leading-none select-none">
        sinhon<span className="not-italic font-bold text-coral-600">.</span>life
      </span>
      {/* 신혼생활 메인 타이틀 */}
      <h1 className="font-bold text-[20px] text-ink leading-none tracking-tight">
        신혼생활
      </h1>
    </div>
  );
}
