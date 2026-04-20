"use client";

// 온보딩 4단계: 카카오 계정 저장 권장 CTA (스킵 가능)
// 클라이언트 컴포넌트로 분리 — onboarding/page.tsx 300줄 상한 유지

import { signIn, useSession } from "next-auth/react";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface Props {
  onSkip: () => void;
}

export default function KakaoCTAStep({ onSkip }: Props) {
  const { status } = useSession();

  // 이미 로그인된 상태면 스킵 처리
  if (status === "authenticated") {
    onSkip();
    return null;
  }

  return (
    <section className="space-y-6 animate-fade-up">
      <div>
        <p className="text-[11px] font-bold text-coral uppercase tracking-wider">
          마지막 · 선택사항
        </p>
        <h2 className="text-[22px] font-extrabold leading-snug mt-2 tracking-tight">
          프로필을 클라우드에
          <br />
          저장할까요?
        </h2>
        <p className="text-[13px] text-warm-text-muted mt-2 leading-relaxed">
          카카오 계정으로 저장하면 다른 기기에서도 그대로 이어 쓸 수 있어요.
        </p>
      </div>

      <ul className="space-y-2.5">
        {[
          "체크리스트·가계부 두 기기 동기화",
          "기기 바뀌어도 프로필 유지",
          "맞춤 혜택 마감 알림 (준비 중)",
        ].map((text) => (
          <li key={text} className="flex items-center gap-2.5 text-[13px] text-warm-text">
            <CheckCircle2 size={15} className="text-coral flex-shrink-0" />
            {text}
          </li>
        ))}
      </ul>

      <div className="space-y-3 pt-2">
        <button
          onClick={() => signIn("kakao")}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#FEE500] text-[#3C1E1E] font-bold text-sm shadow-sm active:scale-[0.98] transition-all"
        >
          카카오로 저장하기
        </button>
        <button
          onClick={onSkip}
          className="w-full flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-warm-text-muted text-sm font-medium active:scale-[0.98] transition-all"
        >
          지금은 건너뛰기 <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}
