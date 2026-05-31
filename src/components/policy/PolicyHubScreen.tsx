"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  POLICIES,
  matchPolicies,
  LIFE_STAGE_LABELS,
  POLICY_CATEGORY_LABELS,
  type LifeStage,
  type Policy,
} from "@/lib/policy/data";
import { track } from "@/lib/analytics/track";

type Phase = "intro" | "diagnose" | "result";

// 정책으로 아낀 돈을 쓰는 다음 결정 (= 수익 브릿지)
const SPEND_BRIDGE: { label: string; emoji: string; seed: string }[] = [
  { label: "스드메 알아보기", emoji: "📸", seed: "인천 스드메 견적 알아보고 싶어요" },
  { label: "예식장 비교", emoji: "💒", seed: "인천 예식장 추천해줘" },
  { label: "신혼집 인테리어", emoji: "🛋️", seed: "인천 신혼집 인테리어 알아보고 싶어요" },
  { label: "혼수 가전·가구", emoji: "🧺", seed: "혼수 가전 가구 추천해줘" },
];

export function PolicyHubScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [stages, setStages] = useState<LifeStage[]>([]);

  const matched = useMemo(() => (phase === "result" ? matchPolicies({ stages }) : []), [phase, stages]);

  const knownSaving = useMemo(
    () => matched.reduce((sum, p) => sum + (p.estSavingManwon ?? 0), 0),
    [matched],
  );

  const toggle = (s: LifeStage) =>
    setStages((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const runDiagnosis = () => {
    track("onboarding_step", { step: "policy_diagnose", stages: stages.join(",") });
    setPhase("result");
  };

  return (
    <main className="min-h-screen bg-white pb-[120px]">
      {/* 헤더 */}
      <header className="px-5 pt-[max(28px,env(safe-area-inset-top))] pb-3">
        <p className="text-[12px] font-extrabold tracking-tight text-blue-deepest">인천 신혼·청년 정책</p>
        <h1 className="mt-1 text-[24px] font-extrabold leading-tight tracking-tight text-ink">
          내가 받을 수 있는
          <br />
          정책부터 챙기세요
        </h1>
        <p className="mt-2 text-[13px] font-medium leading-relaxed text-mute">
          인천 신혼부부가 바로 신청할 수 있는 검증된 정책 {POLICIES.length}개.
          <br />
          예식·집·출산까지 묶어서 알려드려요.
        </p>
      </header>

      {phase === "intro" && <Intro onStart={() => setPhase("diagnose")} />}

      {phase === "diagnose" && (
        <section className="px-5">
          <div className="rounded-3xl border border-hairline bg-paper p-5">
            <h2 className="text-[17px] font-extrabold text-ink">우리 부부는 지금?</h2>
            <p className="mt-1 text-[12.5px] font-medium text-mute">해당되는 걸 모두 골라주세요. (복수 선택)</p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {LIFE_STAGE_LABELS.map((s) => {
                const active = stages.includes(s.value);
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggle(s.value)}
                    className={`flex items-center gap-2 rounded-2xl border px-3.5 py-3.5 text-left transition active:scale-[0.98] ${
                      active ? "border-blue-accent bg-[#EAF3FB]" : "border-hairline bg-white"
                    }`}
                  >
                    <span className="text-[18px] leading-none">{s.emoji}</span>
                    <span className="text-[13px] font-bold text-ink">{s.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={runDiagnosis}
              disabled={stages.length === 0}
              className="mt-5 w-full rounded-2xl py-4 text-[15px] font-extrabold text-white shadow-[0_10px_22px_-10px_rgba(43,123,207,0.6)] transition active:scale-[0.99] disabled:opacity-35"
              style={{ background: "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)" }}
            >
              내 정책 찾기
            </button>
          </div>
          <AllPoliciesList />
        </section>
      )}

      {phase === "result" && (
        <section className="px-5">
          {/* 가치 각인 — 절감액 */}
          <div
            className="rounded-3xl p-5 text-white"
            style={{ background: "linear-gradient(135deg,#2566A8,#3B8BCF)" }}
          >
            <p className="text-[12.5px] font-bold text-on-blue-mute">예상 매칭 정책</p>
            <p className="mt-1 text-[28px] font-extrabold leading-none">{matched.length}개</p>
            {knownSaving > 0 && (
              <p className="mt-2 text-[13.5px] font-semibold text-on-blue-mute">
                현금성 지원만 모아도 약{" "}
                <b className="text-white">{knownSaving.toLocaleString()}만원</b> +
                저리대출 우대까지
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setPhase("diagnose");
              }}
              className="mt-3 rounded-full bg-white/18 px-3 py-1.5 text-[12px] font-bold backdrop-blur"
            >
              조건 다시 고르기
            </button>
          </div>

          {/* 매칭 정책 리스트 */}
          <div className="mt-4 space-y-3">
            {matched.map((p) => (
              <PolicyCard key={p.id} policy={p} />
            ))}
          </div>

          {/* ★ 수익 브릿지: 아낀 돈을 어디에 쓸까 → 5대 결정 리드 */}
          <div className="mt-7 rounded-3xl border border-hairline bg-paper p-5">
            <h2 className="text-[16px] font-extrabold text-ink">아낀 돈, 어디에 쓰면 좋을까요?</h2>
            <p className="mt-1 text-[12.5px] font-medium text-mute">
              비슷한 인천 신혼부부들이 다음으로 결정한 것들. AI톡이 시세까지 같이 알려드려요.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {SPEND_BRIDGE.map((b) => (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => {
                    track("decision_card_click", { from: "policy_result", to: b.label });
                    router.push(`/ai?seed=${encodeURIComponent(b.seed)}`);
                  }}
                  className="flex items-center gap-2 rounded-2xl border border-hairline bg-white px-3.5 py-3.5 text-left transition active:scale-[0.98]"
                >
                  <span className="text-[18px] leading-none">{b.emoji}</span>
                  <span className="text-[13px] font-bold text-ink">{b.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <section className="px-5">
      <div className="rounded-3xl border border-hairline bg-paper p-5">
        <div className="space-y-3">
          {[
            { emoji: "🏠", t: "천원주택", s: "하루 1천원으로 사는 인천형 임대" },
            { emoji: "👶", t: "신생아 특례대출", s: "출산가구 최대 4억, 연 1.8%~" },
            { emoji: "💸", t: "전세보증료·산후조리비", s: "현금성 지원 최대 190만원" },
          ].map((x) => (
            <div key={x.t} className="flex items-center gap-3.5 rounded-2xl bg-white px-4 py-3.5">
              <span className="text-[22px]">{x.emoji}</span>
              <div>
                <div className="text-[14.5px] font-extrabold text-ink">{x.t}</div>
                <div className="text-[12px] font-medium text-mute">{x.s}</div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onStart}
          className="mt-5 w-full rounded-2xl py-4 text-[15px] font-extrabold text-white shadow-[0_10px_22px_-10px_rgba(43,123,207,0.6)] transition active:scale-[0.99]"
          style={{ background: "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)" }}
        >
          1분 자가진단으로 내 정책 찾기
        </button>
        <p className="mt-3 text-center text-[11px] font-medium text-mute">
          공식 출처 검증 완료 · 신청은 각 기관에서
        </p>
      </div>
      <AllPoliciesList />
    </section>
  );
}

function AllPoliciesList() {
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-[15px] font-extrabold text-ink">전체 정책 한눈에</h2>
      <div className="space-y-3">
        {POLICIES.map((p) => (
          <PolicyCard key={p.id} policy={p} />
        ))}
      </div>
    </div>
  );
}

function PolicyCard({ policy }: { policy: Policy }) {
  return (
    <Link
      href={`/policy/${policy.id}`}
      onClick={() => track("decision_card_click", { policy: policy.id })}
      className="block rounded-2xl border border-hairline bg-white p-4 transition active:scale-[0.99]"
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-surface px-2 py-0.5 text-[10.5px] font-bold text-blue-deepest">
          {POLICY_CATEGORY_LABELS[policy.category]}
        </span>
        <span className="rounded-full bg-[#F1F5FA] px-2 py-0.5 text-[10.5px] font-bold text-mute">
          {policy.level === "central" ? "중앙" : policy.level === "city" ? "인천시" : "군·구"}
        </span>
      </div>
      <h3 className="mt-2 text-[15.5px] font-extrabold leading-snug text-ink">{policy.name}</h3>
      <p className="mt-1 text-[12.5px] font-medium leading-snug text-mute">{policy.oneLiner}</p>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[13px] font-extrabold text-blue-deepest">{policy.amountOrRate}</span>
        <span className="text-[12px] font-bold text-mute">자세히 →</span>
      </div>
    </Link>
  );
}
