"use client";

/**
 * 헤이딜러(heydealer) 스타일 온보딩.
 * - 전체화면, "한 화면에 질문 하나"
 * - 상단 얇은 진행바 + 뒤로가기
 * - 타이핑 최소화 — 큰 선택 카드 위주
 * - 하단 풀폭 단일 CTA
 * - 인트로(가치 제안) → 질문들 → 완료(보상) 흐름
 */

import { useEffect, useMemo, useState } from "react";
import { useUserProfile, type Region, type DecisionCategory } from "@/lib/profile/useUserProfile";
import { track } from "@/lib/analytics/track";

const REGIONS: { value: Region; label: string; sub: string }[] = [
  { value: "incheon-etc", label: "인천", sub: "현재 서비스 지역" },
];

const DECISIONS: { value: DecisionCategory; label: string; emoji: string }[] = [
  { value: "sdm", label: "스드메", emoji: "📸" },
  { value: "venue", label: "예식장", emoji: "💒" },
  { value: "interior", label: "신혼집", emoji: "🏠" },
  { value: "goods", label: "혼수·가전", emoji: "🛋️" },
  { value: "honeymoon", label: "신혼여행", emoji: "✈️" },
];

// 질문 단계 수 (인트로/완료 제외) — 진행바 계산용
const QUESTION_STEPS = 4;

type Step = 0 | 1 | 2 | 3 | 4 | 5; // 0 인트로 / 1~4 질문 / 5 완료

export function OnboardingFlow({ onClose }: { onClose: () => void }) {
  const { profile, update, completeOnboarding } = useUserProfile();
  const [step, setStep] = useState<Step>(0);

  // 답변 상태
  const [dateUnknown, setDateUnknown] = useState(false);
  const [weddingDate, setWeddingDate] = useState<string>(profile.weddingDate ?? "");
  const [region, setRegion] = useState<Region | null>(profile.region);
  const [decisions, setDecisions] = useState<DecisionCategory[]>(profile.completedDecisions ?? []);
  const [userNickname, setUserNickname] = useState(profile.userNickname ?? "");
  const [partnerNickname, setPartnerNickname] = useState(profile.partnerNickname ?? "");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const progress = useMemo(() => {
    if (step === 0) return 0;
    if (step >= 5) return 1;
    return (step - 1 + 1) / QUESTION_STEPS; // step 1 → 1/4 ... step 4 → 4/4
  }, [step]);

  const skip = () => {
    track("onboarding_skip", { at_step: step });
    completeOnboarding(weddingDate || null, region ?? "incheon-etc");
    onClose();
  };

  const goNext = (next: Step) => {
    track("onboarding_step", { step });
    setStep(next);
  };

  const toggleDecision = (c: DecisionCategory) =>
    setDecisions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const finish = () => {
    update({
      weddingDate: dateUnknown ? null : weddingDate || null,
      region: region ?? "incheon-etc",
      completedDecisions: decisions,
      userNickname: userNickname.trim() || null,
      partnerNickname: partnerNickname.trim() || null,
      onboardedAt: new Date().toISOString(),
    });
    track("onboarding_complete", {
      has_wedding_date: !dateUnknown && !!weddingDate,
      region: region ?? "incheon-etc",
      decisions: decisions.length,
      has_nickname: !!userNickname.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] bg-white">
      <div className="mx-auto flex h-full max-w-[420px] flex-col">
        {/* 상단: 진행바 + 뒤로/건너뛰기 */}
        {step !== 5 && (
          <div className="px-5 pt-[max(14px,env(safe-area-inset-top))]">
            <div className="flex items-center justify-between py-2">
              {step > 0 ? (
                <button
                  type="button"
                  aria-label="이전"
                  onClick={() => setStep((s) => (s - 1) as Step)}
                  className="-ml-1 grid h-9 w-9 place-items-center rounded-full text-ink active:bg-[#F1F5FA]"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : (
                <span className="text-[15px] font-extrabold tracking-tight text-blue-deepest">신혼생활</span>
              )}
              <button
                type="button"
                onClick={skip}
                className="rounded-full px-2 py-1 text-[13px] font-bold text-mute active:bg-[#F1F5FA]"
              >
                {step === 0 ? "다음에 할게요" : "건너뛰기"}
              </button>
            </div>
            {step > 0 && (
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#EDF1F6]">
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{
                    width: `${Math.round(progress * 100)}%`,
                    background: "linear-gradient(90deg,#3B8BCF,#4F9CDB)",
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-6 pt-7">
          {step === 0 && (
            <Intro />
          )}

          {step === 1 && (
            <>
              <Q title={"예식 예정일이\n언제인가요?"} sub="비슷한 시기의 신혼부부 선택을 보여드릴게요." />
              <input
                type="date"
                value={weddingDate}
                disabled={dateUnknown}
                onChange={(e) => {
                  setWeddingDate(e.target.value);
                  setDateUnknown(false);
                }}
                className="mt-6 w-full rounded-2xl border border-[#D8E5F0] bg-white px-4 py-4 text-[16px] font-bold text-ink focus:outline-none focus:ring-2 focus:ring-[#9CC7EA] disabled:opacity-40"
              />
              <button
                type="button"
                onClick={() => setDateUnknown((v) => !v)}
                className={`mt-3 flex w-full items-center gap-2.5 rounded-2xl border px-4 py-4 text-left transition active:scale-[0.99] ${
                  dateUnknown ? "border-blue-accent bg-[#EAF3FB]" : "border-[#E2EBF3] bg-white"
                }`}
              >
                <Tick on={dateUnknown} />
                <span className="text-[15px] font-bold text-ink">아직 정하지 않았어요</span>
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <Q title={"어디서 결혼을\n준비하세요?"} sub="지금은 인천부터 시세·후기를 깊게 모으고 있어요." />
              <div className="mt-6 space-y-2.5">
                {REGIONS.map((r) => {
                  const active = region === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRegion(r.value)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition active:scale-[0.99] ${
                        active ? "border-blue-accent bg-[#EAF3FB] shadow-[0_6px_16px_-10px_rgba(43,123,197,0.5)]" : "border-[#E2EBF3] bg-white"
                      }`}
                    >
                      <div>
                        <div className="text-[16px] font-extrabold text-ink">{r.label}</div>
                        <div className="mt-0.5 text-[12px] font-medium text-mute">{r.sub}</div>
                      </div>
                      <Tick on={active} />
                    </button>
                  );
                })}
                <div
                  aria-disabled
                  className="flex w-full items-center justify-between rounded-2xl border border-dashed border-[#E2EBF3] bg-[#F7FAFC] px-4 py-4 text-left opacity-70"
                >
                  <div>
                    <div className="text-[16px] font-extrabold text-mute">그 외 지역</div>
                    <div className="mt-0.5 text-[12px] font-medium text-mute">서비스 오픈 준비 중</div>
                  </div>
                  <span className="rounded-full bg-[#E2EBF3] px-2.5 py-1 text-[10.5px] font-bold text-mute">
                    준비중
                  </span>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <Q title={"지금 어디까지\n정하셨어요?"} sub="여러 개 골라도 돼요. 정한 건 표시, 남은 건 도와드릴게요." />
              <div className="mt-6 grid grid-cols-2 gap-2.5">
                {DECISIONS.map((d) => {
                  const active = decisions.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDecision(d.value)}
                      className={`flex items-center gap-2.5 rounded-2xl border px-3.5 py-4 text-left transition active:scale-[0.98] ${
                        active ? "border-blue-accent bg-[#EAF3FB]" : "border-[#E2EBF3] bg-white"
                      }`}
                    >
                      <span className="text-[20px] leading-none">{d.emoji}</span>
                      <span className="text-[14px] font-bold text-ink">{d.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-center text-[12px] font-medium text-mute">
                아직 아무것도 안 정했다면 그냥 다음으로!
              </p>
            </>
          )}

          {step === 4 && (
            <>
              <Q title={"두 분을\n어떻게 부를까요?"} sub="안 적어도 괜찮아요. 나중에 MY에서 바꿀 수 있어요." />
              <div className="mt-6 space-y-3">
                <NameInput label="내 닉네임" value={userNickname} onChange={setUserNickname} placeholder="예: 신랑" />
                <NameInput label="파트너 닉네임" value={partnerNickname} onChange={setPartnerNickname} placeholder="예: 신부" />
              </div>
            </>
          )}

          {step === 5 && (
            <Done
              region={region}
              decisionsCount={decisions.length}
              userNickname={userNickname.trim()}
            />
          )}
        </div>

        {/* 하단 CTA */}
        <div className="px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-3">
          {step === 0 && (
            <Cta label="30초면 끝나요, 시작하기" onClick={() => goNext(1)} />
          )}
          {step === 1 && (
            <Cta label="다음" disabled={!dateUnknown && !weddingDate} onClick={() => goNext(2)} />
          )}
          {step === 2 && (
            <Cta label="다음" disabled={!region} onClick={() => goNext(3)} />
          )}
          {step === 3 && <Cta label="다음" onClick={() => goNext(4)} />}
          {step === 4 && <Cta label="거의 다 됐어요" onClick={() => goNext(5)} />}
          {step === 5 && <Cta label="신혼생활 시작하기" onClick={finish} />}
        </div>
      </div>
    </div>
  );
}

function Intro() {
  return (
    <div className="pt-6">
      <div className="text-[13px] font-extrabold tracking-tight text-blue-deepest">신혼생활에 오신 걸 환영해요</div>
      <h1 className="mt-3 text-[27px] font-extrabold leading-[1.25] tracking-tight text-ink">
        나와 비슷한 신혼부부는
        <br />
        뭘 어떻게 정했을까?
      </h1>
      <p className="mt-3 text-[15px] font-medium leading-relaxed text-mute">
        예산·지역·시기가 비슷한 부부들의 실제 선택을 보여드려요.
        <br />딱 3가지만 알려주시면 돼요.
      </p>

      <div className="mt-8 space-y-3">
        {[
          { emoji: "📅", t: "예식 시기", s: "비슷한 시기의 선택 비교" },
          { emoji: "📍", t: "준비 지역", s: "우리 동네 시세·후기" },
          { emoji: "✅", t: "결정 현황", s: "남은 건 AI톡이 도와줘요" },
        ].map((x) => (
          <div key={x.t} className="flex items-center gap-3.5 rounded-2xl bg-[#F5F9FD] px-4 py-3.5">
            <span className="text-[22px]">{x.emoji}</span>
            <div>
              <div className="text-[14.5px] font-extrabold text-ink">{x.t}</div>
              <div className="text-[12px] font-medium text-mute">{x.s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Done({
  region,
  decisionsCount,
  userNickname,
}: {
  region: Region | null;
  decisionsCount: number;
  userNickname: string;
}) {
  const regionLabel = REGIONS.find((r) => r.value === region)?.label ?? "인천";
  return (
    <div className="flex h-full flex-col items-center justify-center pb-10 text-center">
      <div
        className="grid h-20 w-20 place-items-center rounded-full"
        style={{ background: "linear-gradient(150deg,#4F9CDB,#2F77BE)", boxShadow: "0 16px 32px -14px rgba(47,119,190,0.6)" }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l4.5 4.5L19 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="mt-6 text-[24px] font-extrabold leading-snug tracking-tight text-ink">
        {userNickname ? `${userNickname}님, 준비 끝!` : "준비가 끝났어요!"}
      </h1>
      <p className="mt-3 text-[15px] font-medium leading-relaxed text-mute">
        이제 <b className="text-ink">{regionLabel}</b> 신혼부부들의 선택을
        <br />
        홈과 AI톡에서 바로 보여드릴게요.
      </p>
      {decisionsCount < 5 && (
        <div className="mt-7 w-full rounded-2xl bg-[#F5F9FD] px-5 py-4 text-left">
          <div className="text-[13px] font-extrabold text-blue-deepest">다음 추천</div>
          <div className="mt-1 text-[14px] font-bold leading-snug text-ink">
            아직 정할 게 {5 - decisionsCount}가지 남았어요.
            <br />
            AI톡에게 “{regionLabel}에서 뭐부터 정해?”라고 물어보세요.
          </div>
        </div>
      )}
    </div>
  );
}

function Q({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h1 className="whitespace-pre-line text-[26px] font-extrabold leading-[1.28] tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-3 text-[14.5px] font-medium leading-relaxed text-mute">{sub}</p>
    </div>
  );
}

function Cta({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl py-4 text-[15px] font-extrabold text-white shadow-[0_10px_22px_-10px_rgba(43,123,197,0.6)] transition active:scale-[0.99] disabled:opacity-35"
      style={{ background: "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)" }}
    >
      {label}
    </button>
  );
}

function Tick({ on }: { on: boolean }) {
  return (
    <span
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${
        on ? "border-blue-accent bg-blue-accent" : "border-[#CDD9E5] bg-white"
      }`}
    >
      {on && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l4.5 4.5L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

function NameInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-bold text-ink-soft">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={20}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#E2EBF3] bg-[#F8FAFC] px-4 py-4 text-[16px] font-semibold text-ink focus:border-blue-accent focus:bg-white focus:outline-none"
      />
    </label>
  );
}
