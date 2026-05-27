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
    <div className="relative min-h-[100dvh] bg-white">
      <div className="px-5 pt-4 pb-[150px]">
        <span className="inline-flex items-center rounded-full bg-surface px-3 py-1.5 text-[11px] font-bold tracking-tight text-blue-accent">
          AI 정책 도우미
        </span>
        <h1 className="mt-3.5 text-[26px] font-extrabold leading-tight tracking-tight text-ink">
          정책 챗봇
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-mute">
          신혼부부가 받을 수 있는 정부·지자체 혜택을
          <br />
          쉽게 찾아드려요
        </p>

        <div className="mt-5 flex h-[210px] items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-b from-surface to-paper">
          {/* 디자인의 커플 일러스트 에셋으로 교체 예정 — 현재는 자리표시자 */}
          <CharacterBubble size={132} label={"COUPLE\n3D"} />
        </div>

        <h2 className="mt-8 text-center text-[19px] font-bold tracking-tight text-ink">
          어떤 지원이 궁금하세요?
        </h2>
        <p className="mt-2 text-center text-[12.5px] leading-relaxed text-mute">
          전세대출, 출산지원금, 청약, 우리 동네 혜택까지
          <br />
          바로 물어보세요
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {SUGGESTIONS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setDraft(label)}
              className="flex items-center gap-2.5 rounded-[16px] border border-hairline bg-white px-3.5 py-3.5 text-left shadow-[0_3px_12px_-7px_rgba(20,40,80,0.22)] transition active:scale-[0.98]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-blue-accent">
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <span className="text-[12.5px] font-semibold leading-tight text-ink-soft">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 입력바 — 하단 탭 네비 위에 고정 */}
      <div
        className="fixed inset-x-3.5 bottom-[92px] mx-auto max-w-[452px] lg:absolute lg:inset-x-4 lg:bottom-[88px] lg:max-w-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center gap-1 rounded-full border border-hairline bg-paper py-2 pl-4 pr-2 shadow-[0_10px_30px_-12px_rgba(20,40,80,0.28)]">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="궁금한 정책을 입력해보세요"
            className="min-w-0 flex-1 bg-transparent text-[13.5px] text-ink placeholder:text-faint focus:outline-none"
          />
          <button
            type="button"
            aria-label="음성 입력"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-mute"
          >
            <Mic size={18} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="전송"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-[0_6px_14px_-4px_rgba(43,123,197,0.5)]"
            style={{
              background:
                "linear-gradient(90deg,#2B7BC5 0%,#3B8BCF 60%,#5AA3DC 100%)",
            }}
          >
            <Send size={17} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
