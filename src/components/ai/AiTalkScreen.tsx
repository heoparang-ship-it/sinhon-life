"use client";

import { useState } from "react";
import { Building2, Gift, Home, MapPin, Mic, Send } from "lucide-react";
import { CharacterBubble } from "@/components/legacy/Primitives";

const SUGGESTIONS = [
  { icon: Home, label: "신혼부부 전세대출" },
  { icon: Gift, label: "출산지원금" },
  { icon: Building2, label: "신혼희망타운" },
  { icon: MapPin, label: "우리 동네 혜택" },
] as const;

export function AiTalkScreen() {
  const [draft, setDraft] = useState("");

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-white lg:h-full">
      {/* 헤더 — 상단 고정 */}
      <header className="shrink-0 px-5 pt-4 pb-3">
        <span className="inline-flex items-center rounded-full bg-[#D8E9F8] px-3 py-1.5 text-[11px] font-bold tracking-tight text-[#2B6FB0]">
          AI 정책 도우미
        </span>
        <h1 className="mt-3 text-[26px] font-extrabold leading-tight tracking-tight text-ink">
          정책 챗봇
        </h1>
        <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-ink-soft">
          신혼부부가 받을 수 있는 정부·지자체 혜택을
          <br />
          쉽게 찾아드려요
        </p>
      </header>

      {/* 가운데 — 내용이 길면 이 영역만 스크롤 */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5">
        <div className="flex h-[180px] items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-b from-[#CFE4F6] to-[#E4F0FB] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
          {/* 디자인의 커플 일러스트 에셋으로 교체 예정 — 현재는 자리표시자 */}
          <CharacterBubble size={124} label={"COUPLE\n3D"} />
        </div>

        <h2 className="mt-6 text-center text-[19px] font-bold tracking-tight text-ink">
          무엇이든 편하게 물어보세요
        </h2>
        <p className="mt-1.5 text-center text-[12.5px] font-medium leading-relaxed text-ink-soft">
          전세대출부터 출산지원금까지,
          <br />
          우리 부부에게 딱 맞는 혜택을 함께 찾아드릴게요
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {SUGGESTIONS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setDraft(label)}
              className="flex items-center gap-2.5 rounded-[16px] border border-[#CFDDEB] bg-white px-3.5 py-3.5 text-left shadow-[0_4px_14px_-8px_rgba(20,50,90,0.32)] transition active:scale-[0.98]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DCEBF9] text-blue-deepest">
                <Icon size={16} strokeWidth={2} />
              </span>
              <span className="text-[12.5px] font-bold leading-tight text-ink">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 입력바 — 하단 고정 (탭 네비 위) */}
      <div
        className="shrink-0 px-3.5 pt-2"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 108px)" }}
      >
        <div className="flex items-center gap-1 rounded-full border border-[#CFDDEB] bg-white py-2 pl-4 pr-2 shadow-[0_8px_22px_-10px_rgba(20,50,90,0.3)]">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="궁금한 정책을 입력해보세요"
            className="min-w-0 flex-1 bg-transparent text-[13.5px] font-medium text-ink placeholder:text-mute focus:outline-none"
          />
          <button
            type="button"
            aria-label="음성 입력"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft"
          >
            <Mic size={18} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="전송"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-[0_6px_14px_-4px_rgba(43,123,197,0.55)]"
            style={{
              background:
                "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)",
            }}
          >
            <Send size={17} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}
