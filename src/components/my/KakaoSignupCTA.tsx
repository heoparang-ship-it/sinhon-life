"use client";

import { Sparkles } from "lucide-react";

// Placeholder — real Kakao OAuth plumbing lands in a follow-up. For now this
// routes to the Kakao open-chat so sign-up interest can be captured manually.
const KAKAO_JOIN_URL = "https://open.kakao.com/o/p10syHoi";

export default function KakaoSignupCTA() {
  return (
    <div className="mx-4 mb-5 rounded-3xl p-5 bg-gradient-to-br from-[#FEE500] via-[#FFE98C] to-[#FFF6C8] border border-[#EFC900] relative overflow-hidden">
      <span
        aria-hidden
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/40"
      />
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-2 text-[11px] font-mono uppercase tracking-wider text-[#3A2C00] font-bold">
          <Sparkles size={12} />
          Member · benefits
        </div>
        <h3 className="font-serif text-[20px] font-semibold text-[#2a1a10] tracking-tightest leading-snug mb-2 wb-keep">
          카카오로 가입하면 모두 열려요
        </h3>
        <ul className="text-[12.5px] text-[#3A2C00] leading-relaxed mb-4 space-y-0.5">
          <li>• 부부 프로필·결혼일 클라우드 동기화</li>
          <li>• 체크리스트·가계부 두 기기에서 공유</li>
          <li>• 맞춤 정책 마감 D-day 카톡 알림</li>
        </ul>
        <a
          href={KAKAO_JOIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#3C1E1E] text-[#FEE500] text-[13px] font-bold rounded-full active:scale-[0.97] transition"
        >
          카카오로 3초 가입하기
        </a>
        <p className="text-[10.5px] text-[#3A2C00]/70 mt-2 font-mono">
          beta · 당분간 오픈채팅 참여로 대체돼요
        </p>
      </div>
    </div>
  );
}
