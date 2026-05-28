"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Building2,
  Gift,
  Home,
  MapPin,
  Mic,
  Send,
  Sparkles,
} from "lucide-react";

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
      {/* 채팅방 헤더 — 컴팩트 */}
      <header className="shrink-0 flex items-center gap-2.5 border-b border-[#EAF0F7] bg-white px-4 py-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-[0_4px_10px_-3px_rgba(43,123,197,0.5)]"
          style={{ background: "linear-gradient(135deg,#5AA3DC,#3B8BCF)" }}
        >
          <Sparkles size={16} strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14.5px] font-bold leading-tight text-ink">정책 챗봇</div>
          <div className="mt-0.5 text-[11px] font-medium leading-none text-mute">
            AI 정책 도우미
          </div>
        </div>
      </header>

      {/* 채팅 영역 — 가운데만 스크롤 */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#F4F8FC] px-4 py-4">
        {/* AI 첫 메시지 */}
        <div className="flex items-end gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-[0_3px_8px_-3px_rgba(43,123,197,0.45)]"
            style={{ background: "linear-gradient(135deg,#5AA3DC,#3B8BCF)" }}
          >
            <Sparkles size={13} strokeWidth={2.2} />
          </div>
          <div className="max-w-[78%] rounded-[18px] rounded-bl-[6px] border border-[#D8E5F0] bg-white p-2 shadow-[0_2px_10px_-5px_rgba(20,50,90,0.18)]">
            <div className="relative aspect-[1.9/1] w-full overflow-hidden rounded-[12px] bg-[#E3EEF8]">
              <Image
                src="/ai/couple.png"
                alt="신혼부부 캐릭터"
                width={836}
                height={440}
                priority
                className="h-full w-full object-cover"
              />
            </div>
            <div className="px-1.5 pb-1 pt-2">
              <p className="text-[13.5px] font-bold leading-tight text-ink">
                무엇이든 편하게 물어보세요
              </p>
              <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-ink-soft">
                전세대출부터 출산지원금까지,
                <br />
                우리 부부에게 딱 맞는 혜택을 함께 찾아드릴게요
              </p>
            </div>
          </div>
        </div>

        {/* 추천 칩 — 컴팩트 2x2 */}
        <div className="ml-10 mt-3 grid grid-cols-2 gap-2">
          {SUGGESTIONS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setDraft(label)}
              className="flex items-center gap-2 rounded-full border border-[#CFDDEB] bg-white px-3 py-2 text-left shadow-[0_2px_8px_-5px_rgba(20,50,90,0.2)] transition active:scale-[0.97]"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DCEBF9] text-blue-deepest">
                <Icon size={12} strokeWidth={2.2} />
              </span>
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[11.5px] font-bold text-ink">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 입력바 — 하단 고정 (탭 네비 위) */}
      <div
        className="shrink-0 bg-white px-3.5 pt-2"
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
