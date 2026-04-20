"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  completeOnboarding,
  type MaritalStage,
  type Region,
  type InterestTopic,
} from "@/lib/profile";
import KakaoCTAStep from "@/components/onboarding/KakaoCTAStep";

type Step = 1 | 2 | 3 | 4;

// 단계 1·2: 한 개 선택만으로 충분 → 클릭 즉시 다음 단계 자동 전환
const AUTO_ADVANCE_DELAY_MS = 220; // 선택 피드백을 잠깐 보여준 뒤 넘어감

const STAGES: { id: MaritalStage; title: string; emoji: string; desc: string }[] = [
  { id: "planning", title: "결혼 준비 중", emoji: "💍", desc: "예식·신혼집 준비 단계" },
  { id: "newly", title: "신혼부부", emoji: "💑", desc: "결혼 7년 이내" },
  { id: "parenting", title: "임신·출산·육아", emoji: "👶", desc: "아이가 생겼어요" },
];

const REGIONS: { id: Region; label: string }[] = [
  { id: "seoul", label: "서울" },
  { id: "incheon", label: "인천" },
  { id: "gyeonggi", label: "경기" },
  { id: "busan", label: "부산" },
  { id: "daegu", label: "대구" },
  { id: "etc", label: "그 외" },
];

const INTERESTS: { id: InterestTopic; label: string; emoji: string }[] = [
  { id: "housing", label: "신혼집·청약", emoji: "🏠" },
  { id: "finance", label: "절약·재테크", emoji: "💰" },
  { id: "tax", label: "세금·연말정산", emoji: "📑" },
  { id: "baby", label: "출산·육아", emoji: "👶" },
  { id: "wedding", label: "예식·스드메", emoji: "💒" },
  { id: "honeymoon", label: "신혼여행", emoji: "✈️" },
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [step, setStep] = useState<Step>(1);
  const [stage, setStage] = useState<MaritalStage | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [interests, setInterests] = useState<InterestTopic[]>([]);

  // 자동 전환 타이머 ref — 사용자가 빠르게 다른 옵션으로 바꾸면 cancel
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const scheduleAdvance = (target: Step) => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      setStep(target);
    }, AUTO_ADVANCE_DELAY_MS);
  };

  const handlePickStage = (id: MaritalStage) => {
    setStage(id);
    scheduleAdvance(2);
  };

  const handlePickRegion = (id: Region) => {
    setRegion(id);
    scheduleAdvance(3);
  };

  const toggleInterest = (id: InterestTopic) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    if (!stage) return;
    completeOnboarding({ stage, region: region || undefined, interests });
    setStep(4); // step 4: 카카오 저장 CTA (스킵 가능)
  };

  const canContinue =
    (step === 1 && stage) ||
    (step === 2 && region) ||
    (step === 3 && interests.length > 0);

  return (
    <div className="min-h-screen bg-warm-bg pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-white/95 backdrop-blur-xl border-b border-warm-border/50 sticky top-0 z-10">
        {step > 1 ? (
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
            className="text-warm-text-secondary active:scale-90 transition-transform"
            aria-label="이전 단계"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <Link
            href="/"
            className="text-warm-text-secondary active:scale-90 transition-transform"
            aria-label="닫기"
          >
            <ArrowLeft size={20} />
          </Link>
        )}
        <span className="text-xs font-medium text-warm-text-muted">
          {step} / 3
        </span>
        <Link href={next} className="text-xs font-medium text-warm-text-muted">
          건너뛰기
        </Link>
      </header>

      {/* Progress */}
      <div className="h-1 bg-warm-border/40">
        <div
          className="h-full bg-coral transition-all duration-500 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="px-5 pt-8">
        {step === 1 && (
          <section className="space-y-6 animate-fade-up">
            <div>
              <p className="text-[11px] font-bold text-coral uppercase tracking-wider">
                Step 1 / 3
              </p>
              <h2 className="text-[22px] font-extrabold leading-snug mt-2 tracking-tight">
                지금 어떤 단계에
                <br />
                계신가요?
              </h2>
              <p className="text-[13px] text-warm-text-muted mt-2 leading-relaxed">
                상황에 맞춰 가장 필요한 혜택부터 보여드려요.
              </p>
            </div>

            <div className="space-y-3">
              {STAGES.map((s) => {
                const isActive = stage === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handlePickStage(s.id)}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all active:scale-[0.99] ${
                      isActive
                        ? "bg-coral-50 border-coral"
                        : "bg-white border-warm-border"
                    }`}
                  >
                    <div className="text-3xl" aria-hidden>
                      {s.emoji}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-[15px]">{s.title}</p>
                      <p className="text-[11px] text-warm-text-muted mt-0.5">
                        {s.desc}
                      </p>
                    </div>
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-coral flex items-center justify-center">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-6 animate-fade-up">
            <div>
              <p className="text-[11px] font-bold text-coral uppercase tracking-wider">
                Step 2 / 3
              </p>
              <h2 className="text-[22px] font-extrabold leading-snug mt-2 tracking-tight">
                어느 지역에
                <br />
                살고 계세요?
              </h2>
              <p className="text-[13px] text-warm-text-muted mt-2 leading-relaxed">
                지역별 지원금·정책을 더 정확히 알려드려요.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {REGIONS.map((r) => {
                const isActive = region === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handlePickRegion(r.id)}
                    className={`py-5 rounded-2xl border-2 font-bold text-[14px] transition-all active:scale-[0.97] ${
                      isActive
                        ? "bg-mint-50 border-mint text-mint-700"
                        : "bg-white border-warm-border text-warm-text"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-6 animate-fade-up">
            <div>
              <p className="text-[11px] font-bold text-coral uppercase tracking-wider">
                Step 3 / 3
              </p>
              <h2 className="text-[22px] font-extrabold leading-snug mt-2 tracking-tight">
                어떤 정보가
                <br />
                가장 궁금하세요?
              </h2>
              <p className="text-[13px] text-warm-text-muted mt-2 leading-relaxed">
                여러 개 골라도 돼요. 홈 화면이 이 관심사 순으로 정리돼요.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map((i) => {
                const isActive = interests.includes(i.id);
                return (
                  <button
                    key={i.id}
                    onClick={() => toggleInterest(i.id)}
                    className={`relative flex flex-col items-start gap-2 p-4 rounded-2xl border-2 transition-all active:scale-[0.97] ${
                      isActive
                        ? "bg-coral-50 border-coral"
                        : "bg-white border-warm-border"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden>
                      {i.emoji}
                    </span>
                    <span className="font-bold text-[13px] text-left">{i.label}</span>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-coral flex items-center justify-center">
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {step === 4 && (
        <KakaoCTAStep onSkip={() => router.push(next)} />
      )}

      {/* 하단 Fixed CTA — Step 1·2는 자동 전환되므로 안내 문구만, Step 3는 다중 선택이라 버튼 노출 */}
      {step < 4 && <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-warm-border/50 pb-safe">
        <div className="max-w-lg mx-auto px-5 py-3">
          {step < 3 ? (
            <p className="text-center text-[12px] text-warm-text-muted py-3.5">
              {canContinue ? "다음 단계로 넘어가는 중…" : "선택하면 자동으로 다음으로 넘어가요"}
            </p>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canContinue}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
                canContinue
                  ? "bg-coral text-white shadow-lg shadow-coral/20"
                  : "bg-warm-border/60 text-warm-text-muted"
              }`}
            >
              맞춤 혜택 보러가기 <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}
