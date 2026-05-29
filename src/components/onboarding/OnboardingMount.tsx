"use client";

import { useEffect, useState } from "react";
import { useUserProfile, type Region } from "@/lib/profile/useUserProfile";
import { initAnalytics, track } from "@/lib/analytics/track";

const REGIONS: { value: Region; label: string; sub: string }[] = [
  { value: "incheon-bupyeong", label: "인천 부평", sub: "현재 주력 지역" },
  { value: "incheon-songdo", label: "인천 송도", sub: "현재 주력 지역" },
  { value: "incheon-etc", label: "인천(기타)", sub: "데이터 적재 중" },
  { value: "etc", label: "기타 지역", sub: "확장 대기명단" },
];

export function OnboardingMount() {
  const { profile, hydrated, completeOnboarding } = useUserProfile();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [weddingDate, setWeddingDate] = useState<string>("");
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!profile.onboardedAt) {
      setOpen(true);
      track("onboarding_shown");
    }
  }, [hydrated, profile.onboardedAt]);

  if (!open) return null;

  const canNext1 = true; // 예식일은 선택값(모를 수 있음)
  const canFinish = region !== null;

  const finish = () => {
    if (!region) return;
    completeOnboarding(weddingDate || null, region);
    track("onboarding_complete", {
      has_wedding_date: !!weddingDate,
      region,
    });
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/35 backdrop-blur-[2px] sm:items-center">
      <div className="w-full max-w-[440px] rounded-t-[24px] bg-white px-5 pb-6 pt-5 shadow-[0_-24px_60px_-30px_rgba(20,40,80,0.4)] sm:rounded-[24px] sm:pb-5">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-tight text-blue-deepest">
          <span className={step === 1 ? "" : "opacity-50"}>1 · 예식일</span>
          <span className="opacity-30">›</span>
          <span className={step === 2 ? "" : "opacity-50"}>2 · 지역</span>
        </div>

        {step === 1 && (
          <>
            <h2 className="text-[20px] font-extrabold leading-tight text-ink">
              예식 예정일이 언제예요?
            </h2>
            <p className="mt-1 text-[13px] font-medium leading-snug text-mute">
              아직 정하지 않았어도 괜찮아요. 비워두고 다음으로 넘어가세요.
            </p>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="mt-4 w-full rounded-[14px] border border-[#D8E5F0] bg-white px-3.5 py-3 text-[15px] font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-[#9CC7EA]"
            />
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canNext1}
              className="mt-4 w-full rounded-full py-3 text-[14px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(43,123,197,0.55)] disabled:opacity-40"
              style={{
                background: "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)",
              }}
            >
              다음
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-[20px] font-extrabold leading-tight text-ink">
              어디서 결혼을 준비해요?
            </h2>
            <p className="mt-1 text-[13px] font-medium leading-snug text-mute">
              현재 인천 부평·송도부터 데이터를 깊게 쌓고 있어요. 기타 지역은 확장 알림을 드려요.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {REGIONS.map((r) => {
                const active = region === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRegion(r.value)}
                    className={`rounded-[14px] border px-3 py-3 text-left transition active:scale-[0.98] ${
                      active
                        ? "border-blue-accent bg-[#EAF3FB] shadow-[0_4px_12px_-6px_rgba(43,123,197,0.4)]"
                        : "border-[#D8E5F0] bg-white"
                    }`}
                  >
                    <div className="text-[14px] font-bold text-ink">{r.label}</div>
                    <div className="mt-0.5 text-[11px] font-medium text-mute">{r.sub}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-full border border-[#D8E5F0] bg-white px-4 py-3 text-[14px] font-bold text-ink-soft"
              >
                이전
              </button>
              <button
                type="button"
                disabled={!canFinish}
                onClick={finish}
                className="flex-1 rounded-full py-3 text-[14px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(43,123,197,0.55)] disabled:opacity-40"
                style={{
                  background: "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)",
                }}
              >
                시작하기
              </button>
            </div>
            <p className="mt-3 text-center text-[10.5px] font-medium text-mute">
              저장된 정보는 이 기기에만 보관돼요(서버에 전송되지 않아요).
            </p>
          </>
        )}
      </div>
    </div>
  );
}
