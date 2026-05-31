"use client";

/**
 * 지원금 카테고리 — 삼쩜삼식 라이브 카운터 진단 (Phase 1: "챙길 수 있는 N개")
 *
 * 정직성 원칙 (사장님 결정):
 * - "내 통장에 N만원" 같은 거짓 약속 금지
 * - 메인 단위는 "정책 개수"(N개). 금액은 보조(절감 가능액)
 * - 마감일 등 긴박 장치는 실제 사실(모집 공고일·자격 조건)에만 사용
 *
 * Phase 2(미래): 인천시·iH 협조 후 "대신 신청" 모드로 전환 — 그때 코드 구조 그대로 재사용
 *
 * 흐름:
 *   intro(즉시 평균 N개) → 3문항 라이브 카운터 → 카카오 게이트(블러 잠금) → 결과
 *   "나중에 할게요"로 게스트 결과도 진입 가능(다크패턴 회피)
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/useSession";
import {
  POLICIES,
  matchPolicies,
  type LifeStage,
  type Policy,
} from "@/lib/policy/data";
import { track } from "@/lib/analytics/track";

// ───────────────────────────── 진단 정의 ─────────────────────────────
// 정직 규칙: 각 답변이 매핑되는 LifeStage 는 data.ts 와 1:1
// 노출용 "추가 정책 +N개"는 stage 가산이 아니라 실제 matchPolicies 재계산 결과로 표시

type AnswerMap = {
  stage?: "engaged" | "married" | "newlyborn";
  housing?: ("rent" | "buy")[];
  youth?: "y" | "n" | "secret";
};

type QuizStep = {
  key: keyof AnswerMap;
  head: string;
  title: string;
  sub: string;
  single: boolean;
  opts: {
    id: string;
    em: string;
    ti: string;
    su?: string;
    /** 이 답이 부여하는 LifeStage 태그(매칭용) */
    stages: LifeStage[];
  }[];
};

const STEPS: QuizStep[] = [
  {
    key: "stage",
    head: "STEP 1 / 3",
    title: "지금 어떤 단계세요?",
    sub: "가장 가까운 걸 골라주세요.",
    single: true,
    opts: [
      { id: "engaged", em: "💍", ti: "결혼 예정", su: "3개월 내 · 7년 내 포함", stages: ["engaged"] },
      { id: "married", em: "💑", ti: "신혼 (7년 내)", su: "혼인신고 완료", stages: ["married"] },
      { id: "newlyborn", em: "👶", ti: "신혼 + 출산했어요", su: "2년 내 출산·입양", stages: ["married", "newborn"] },
    ],
  },
  {
    key: "housing",
    head: "STEP 2 / 3",
    title: "집은 어떻게 준비하세요?",
    sub: "해당되는 걸 모두 골라주세요. (복수)",
    single: false,
    opts: [
      { id: "rent", em: "🔑", ti: "전·월세로 살아요", su: "천원주택·전세보증료 대상", stages: ["renting"] },
      { id: "buy", em: "🏡", ti: "집을 살 계획", su: "구입자금·보금자리론 우대", stages: ["buying"] },
    ],
  },
  {
    key: "youth",
    head: "STEP 3 / 3",
    title: "마지막! 나이가 어떻게 되세요?",
    sub: "청년 한정 지원이 따로 있어요.",
    single: true,
    opts: [
      { id: "y", em: "🧑", ti: "19~39세 청년", su: "청년 임차보증금 이자지원", stages: ["youth"] },
      { id: "n", em: "🙂", ti: "40세 이상", stages: [] },
      { id: "secret", em: "🤫", ti: "비밀이에요", su: "평균으로 계산", stages: [] },
    ],
  },
];

/** 답변 → LifeStage 배열 */
function answersToStages(a: AnswerMap): LifeStage[] {
  const set = new Set<LifeStage>();
  STEPS.forEach((step) => {
    const v = a[step.key];
    const chosen = Array.isArray(v) ? v : v ? [v] : [];
    step.opts.forEach((o) => {
      if (chosen.includes(o.id as never)) o.stages.forEach((s) => set.add(s));
    });
  });
  return [...set];
}

/** 매칭된 정책의 정직한 절감액 합계 (만원, estSavingManwon 있는 것만) */
function knownSavingManwon(policies: Policy[]): number {
  return policies.reduce((sum, p) => sum + (p.estSavingManwon ?? 0), 0);
}

const AVG_COUNT_INCHEON = 6; // 인천 신혼 평균 매칭 정책 수(표시용 시작값)
const TOTAL_POLICIES = POLICIES.length;

// ───────────────────────────── 메인 ─────────────────────────────

type Screen = "intro" | "quiz" | "gate" | "result";

export function SupportFlow() {
  const router = useRouter();
  const session = useSession();
  const isAuthed = session.status === "authenticated";

  const [screen, setScreen] = useState<Screen>("intro");
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [unlocked, setUnlocked] = useState(false); // 게스트가 "나중에"로 결과만 본 경우 false

  const stages = useMemo(() => answersToStages(answers), [answers]);
  const matched = useMemo(() => (stages.length ? matchPolicies({ stages }) : []), [stages]);
  const saving = useMemo(() => knownSavingManwon(matched), [matched]);
  const currentCount = matched.length || AVG_COUNT_INCHEON;

  // 진행률(시각): 0~80% 진단, 게이트 90%, 결과 100%
  const progress = useMemo(() => {
    if (screen === "intro") return 0;
    if (screen === "quiz") return 25 + (stepIdx / STEPS.length) * 55;
    if (screen === "gate") return 90;
    return 100;
  }, [screen, stepIdx]);

  // 인증되면 자동 잠금 해제
  useEffect(() => {
    if (isAuthed) setUnlocked(true);
  }, [isAuthed]);

  // 결과 진입 시 1회 트래킹
  useEffect(() => {
    if (screen === "result") {
      track("support_result_shown", {
        matched: matched.length,
        saving_manwon: saving,
        authed: isAuthed,
        unlocked,
      });
    }
  }, [screen, matched.length, saving, isAuthed, unlocked]);

  const handleIntroStart = useCallback(() => {
    setScreen("quiz");
    setStepIdx(0);
    track("support_step", { step: 0, from: "intro" });
  }, []);

  const handleAnswer = useCallback(
    (step: QuizStep, optId: string) => {
      setAnswers((prev) => {
        const next: AnswerMap = { ...prev };
        if (step.single) {
          (next as Record<string, unknown>)[step.key] = optId;
        } else {
          const cur = new Set(((prev[step.key] as string[]) ?? []) as string[]);
          if (cur.has(optId)) cur.delete(optId);
          else cur.add(optId);
          (next as Record<string, unknown>)[step.key] = [...cur];
        }
        return next;
      });
      track("support_answer", { step: step.key, opt: optId });
    },
    [],
  );

  const goNext = useCallback(() => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx((i) => i + 1);
      track("support_step", { step: stepIdx + 1 });
    } else {
      setScreen("gate");
      track("support_gate_shown", { matched: matched.length });
    }
  }, [stepIdx, matched.length]);

  const goBack = useCallback(() => {
    if (screen === "quiz" && stepIdx > 0) setStepIdx((i) => i - 1);
    else if (screen === "quiz") setScreen("intro");
    else if (screen === "gate") setScreen("quiz");
    else if (screen === "result") setScreen("gate");
  }, [screen, stepIdx]);

  const handleKakao = useCallback(async () => {
    track("support_gate_kakao", { matched: matched.length });
    try {
      const supabase = createSupabaseBrowserClient();
      // 진단 답변을 임시 저장(콜백 후 결과로 복귀)
      try {
        sessionStorage.setItem(
          "sinhon.support.answers",
          JSON.stringify({ answers, ts: Date.now() }),
        );
      } catch {}
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/support%3Funlock%3D1`,
          scopes: "profile_nickname profile_image",
        },
      });
      if (error) throw error;
    } catch {
      // OAuth 미설정/실패 시: 게스트 결과로라도 진입
      setUnlocked(false);
      setScreen("result");
    }
  }, [answers, matched.length]);

  const handleLater = useCallback(() => {
    track("support_gate_later", { matched: matched.length });
    setUnlocked(false);
    setScreen("result");
  }, [matched.length]);

  // URL ?unlock=1 (카카오 콜백 후) → 결과로 직행 + answers 복원
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("unlock") === "1") {
      try {
        const raw = sessionStorage.getItem("sinhon.support.answers");
        if (raw) {
          const parsed = JSON.parse(raw) as { answers?: AnswerMap };
          if (parsed.answers) setAnswers(parsed.answers);
        }
      } catch {}
      setUnlocked(true);
      setScreen("result");
      // 깨끗하게 정리
      window.history.replaceState({}, "", "/support");
    }
  }, []);

  return (
    <main className="min-h-[100dvh] bg-white text-ink pb-[120px]">
      {/* 상단: 뒤로/타이틀 + 진행바 */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-5 pt-[max(14px,env(safe-area-inset-top))] pb-2">
          {screen === "intro" ? (
            <Link href="/" className="-ml-1 grid h-9 w-9 place-items-center text-ink active:bg-[#F1F5FA] rounded-full">
              <BackIcon />
            </Link>
          ) : (
            <button
              type="button"
              onClick={goBack}
              aria-label="이전"
              className="-ml-1 grid h-9 w-9 place-items-center text-ink active:bg-[#F1F5FA] rounded-full"
            >
              <BackIcon />
            </button>
          )}
          <span className="text-[14px] font-extrabold tracking-tight">지원금</span>
          <span className="w-9 text-right text-[11.5px] font-bold text-mute">
            {screen === "intro" ? "" : screen === "result" ? (unlocked ? "잠금해제 ✓" : "게스트") : ""}
          </span>
        </div>
        {screen !== "intro" && (
          <div className="px-5 pb-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EDF1F6]">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg,#3B8BCF,#4F9CDB)",
                }}
              />
            </div>
          </div>
        )}
      </header>

      {screen === "intro" && <IntroScreen onStart={handleIntroStart} />}

      {screen === "quiz" && (
        <QuizScreen
          step={STEPS[stepIdx]}
          stepIdx={stepIdx}
          chosen={answersOf(answers, STEPS[stepIdx])}
          countNow={currentCount}
          matchedCount={matched.length}
          onAnswer={handleAnswer}
          onNext={goNext}
        />
      )}

      {screen === "gate" && (
        <GateScreen
          matchedCount={matched.length || AVG_COUNT_INCHEON}
          saving={saving}
          onKakao={handleKakao}
          onLater={handleLater}
        />
      )}

      {screen === "result" && (
        <ResultScreen
          matched={matched}
          saving={saving}
          unlocked={unlocked}
          onKakao={handleKakao}
        />
      )}
    </main>
  );
}

function answersOf(a: AnswerMap, step: QuizStep): string[] {
  const v = a[step.key];
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

// ───────────────────────────── 화면들 ─────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="px-5 pt-2">
      <div className="rounded-3xl bg-gradient-to-br from-[#1E5A9E] via-[#3B8BCF] to-[#4F9CDB] p-6 text-white shadow-[0_18px_40px_-16px_rgba(30,90,158,0.5)]">
        <p className="text-[12px] font-bold text-on-blue-mute">인천 신혼이면 챙길 수 있는</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-[58px] font-extrabold leading-none tracking-[-0.045em] tabular-nums">
            {AVG_COUNT_INCHEON}
          </span>
          <span className="mb-1.5 text-[24px] font-extrabold leading-none">+개</span>
        </div>
        <p className="mt-3 text-[13px] font-semibold leading-snug text-on-blue-mute">
          정부·인천 공식 정책 <b className="text-white">{TOTAL_POLICIES}개</b> 중<br />
          내가 챙길 수 있는 걸 1분 만에 확인해요.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/18 px-2.5 py-1 text-[10.5px] font-bold backdrop-blur">
          <CheckIcon />
          정부24 · 인천주거포털 검증
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { em: "🏠", t: "천원주택", s: "월 3만원" },
          { em: "👶", t: "신생아 대출", s: "연 1.8%~" },
          { em: "💸", t: "보증료 지원", s: "최대 40만원" },
        ].map((x) => (
          <div key={x.t} className="rounded-2xl border border-hairline bg-paper p-3 text-center">
            <div className="text-[22px]">{x.em}</div>
            <div className="mt-1 text-[12px] font-extrabold text-ink leading-tight">{x.t}</div>
            <div className="mt-0.5 text-[10.5px] font-semibold text-mute">{x.s}</div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-5 w-full rounded-2xl py-4 text-[15px] font-extrabold text-white shadow-[0_12px_26px_-10px_rgba(43,123,207,0.65)] transition active:scale-[0.99]"
        style={{ background: "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)" }}
      >
        내가 챙길 수 있는 거 확인하기
        <span className="mt-0.5 block text-[11px] font-semibold text-on-blue-mute">
          3가지만 답하면 끝 · 무료 · 가입 없음
        </span>
      </button>
      <p className="mt-3 text-center text-[10.5px] font-medium text-faint">
        지원금 정보는 참고용이며 신청은 각 기관 공식 채널에서 확인해 주세요.
      </p>
    </section>
  );
}

function QuizScreen({
  step,
  stepIdx,
  chosen,
  countNow,
  matchedCount,
  onAnswer,
  onNext,
}: {
  step: QuizStep;
  stepIdx: number;
  chosen: string[];
  countNow: number;
  matchedCount: number;
  onAnswer: (step: QuizStep, optId: string) => void;
  onNext: () => void;
}) {
  const isLast = stepIdx === STEPS.length - 1;

  return (
    <section className="px-5 pt-3">
      {/* 라이브 카운터 패널 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E5A9E] to-[#3B8BCF] p-5 text-white shadow-[0_18px_40px_-16px_rgba(30,90,158,0.5)]">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.2),transparent_70%)]" />
        <p className="text-[12px] font-bold text-on-blue-mute">
          지금 챙길 수 있는 정책
          <span className="ml-2 rounded-full bg-white/18 px-2 py-0.5 text-[9.5px] font-extrabold backdrop-blur">
            진단 중
          </span>
        </p>
        <div className="mt-1.5 flex items-end gap-2">
          <CountUp
            value={countNow}
            className="text-[52px] font-extrabold leading-none tracking-[-0.045em] tabular-nums"
          />
          <span className="mb-1.5 text-[22px] font-extrabold leading-none">개</span>
        </div>
        <p className="mt-2 text-[11.5px] font-semibold text-on-blue-mute">
          매칭 정책 <b className="text-white">{matchedCount}</b>개 · 답할수록 정확해져요
        </p>
      </div>

      {/* 질문 */}
      <div className="mt-5">
        <p className="text-[11px] font-extrabold tracking-wide text-blue-deepest">{step.head}</p>
        <h1 className="mt-1.5 text-[22px] font-extrabold leading-snug tracking-tight text-ink">
          {step.title}
        </h1>
        <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-mute">{step.sub}</p>

        <div className="mt-4 space-y-2.5">
          {step.opts.map((o) => {
            const active = chosen.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onAnswer(step, o.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition active:scale-[0.99] ${
                  active
                    ? "border-blue-accent bg-[#EAF3FB] shadow-[0_8px_18px_-10px_rgba(43,123,197,0.5)]"
                    : "border-hairline bg-white"
                }`}
              >
                <span className="text-[22px] leading-none">{o.em}</span>
                <span className="flex-1">
                  <span className="block text-[14.5px] font-extrabold text-ink">{o.ti}</span>
                  {o.su && <span className="mt-0.5 block text-[11.5px] font-semibold text-mute">{o.su}</span>}
                </span>
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
                    active ? "border-blue-accent bg-blue-accent" : "border-[#CDD9E5] bg-white"
                  }`}
                >
                  {active && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l4.5 4.5L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 CTA — sticky */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 bg-gradient-to-t from-white via-white/95 to-white/0">
        <button
          type="button"
          onClick={onNext}
          disabled={chosen.length === 0}
          className="w-full rounded-2xl py-4 text-[15px] font-extrabold text-white shadow-[0_12px_26px_-10px_rgba(43,123,207,0.65)] transition active:scale-[0.99] disabled:opacity-40"
          style={{ background: "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)" }}
        >
          {isLast ? "카카오로 내 정책 받기" : "다음"}
          {chosen.length === 0 && (
            <span className="mt-0.5 block text-[11px] font-semibold text-on-blue-mute">
              위에서 골라주세요
            </span>
          )}
        </button>
      </div>
    </section>
  );
}

function GateScreen({
  matchedCount,
  saving,
  onKakao,
  onLater,
}: {
  matchedCount: number;
  saving: number;
  onKakao: () => void;
  onLater: () => void;
}) {
  return (
    <section className="flex min-h-[80vh] flex-col px-5 pt-3">
      {/* 블러 잠금 패널 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E5A9E] to-[#3B8BCF] p-6 text-center text-white">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.2),transparent_70%)]" />
        <p className="text-[12px] font-bold text-on-blue-mute">당신의 맞춤 체크리스트</p>
        <div className="mt-1.5 flex items-end justify-center gap-2 select-none">
          <span className="text-[50px] font-extrabold leading-none tracking-[-0.04em] tabular-nums [filter:blur(10px)]">
            {matchedCount}
          </span>
          <span className="mb-1 text-[22px] font-extrabold leading-none [filter:blur(6px)]">개</span>
        </div>
        <span className="relative -mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-[12px] font-extrabold text-blue-deepest">
          <LockIcon />
          카카오로 1초면 공개
        </span>
      </div>

      <div className="mt-5">
        <h1 className="text-[20px] font-extrabold leading-snug tracking-tight text-ink">
          내 맞춤 체크리스트와 마감일,
          <br />
          카카오로 바로 받아보세요
        </h1>
        <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-mute">
          진단 결과를 저장하고, 마감·새 지원금을 놓치지 않게 알려드릴게요.
        </p>
      </div>

      <div className="mt-4 space-y-2">
        {[
          { e: "🎯", t: "내 조건 맞춤 체크리스트", b: "평균이 아닌 내 답변 기준" },
          { e: "🔔", t: "마감 임박 알림", b: "천원주택 모집 등 놓치지 않게" },
          { e: "💾", t: "결과 저장·이어보기", b: "다음에 와도 그대로" },
        ].map((x) => (
          <div key={x.t} className="flex items-center gap-3 rounded-2xl border border-hairline bg-paper px-4 py-3">
            <span className="text-[18px]">{x.e}</span>
            <span className="text-[12.5px] font-bold text-ink-soft">
              <b className="text-ink">{x.t}</b> · {x.b}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={onKakao}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-kakao py-4 text-[15px] font-extrabold text-kakao-text shadow-[0_12px_26px_-10px_rgba(254,229,0,0.6)] transition active:scale-[0.99]"
        >
          <KakaoIcon />
          카카오로 내 체크리스트 받기
        </button>
        <button
          type="button"
          onClick={onLater}
          className="mt-2 block w-full py-2.5 text-[13px] font-bold text-mute underline underline-offset-[3px]"
        >
          아니요, 예상 정책만 볼게요
        </button>
        <p className="mt-2 text-center text-[10.5px] font-medium text-faint leading-snug">
          가입은 결과 저장·알림용입니다.
          {saving > 0 && <> · 검증 정책 기준 최대 약 {saving.toLocaleString()}만원 절감 가능</>}
        </p>
      </div>
    </section>
  );
}

function ResultScreen({
  matched,
  saving,
  unlocked,
  onKakao,
}: {
  matched: Policy[];
  saving: number;
  unlocked: boolean;
  onKakao: () => void;
}) {
  const list = matched.length > 0 ? matched : POLICIES.slice(0, 6);
  const visible = unlocked ? list : list.slice(0, 2);
  const hidden = unlocked ? [] : list.slice(2);

  const onShare = useCallback(() => {
    track("support_share_click", { matched: matched.length });
    const url = `${typeof window !== "undefined" ? window.location.origin : "https://sinhon.life"}/support?utm_source=share&utm_medium=kakao`;
    const text = `인천 신혼이면 챙길 수 있는 정책 ${matched.length || POLICIES.length}가지. 너도 챙길 거 있는지 1분이면 봐.`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({ title: "신혼생활 지원금", text, url })
        .catch(() => copyFallback(url, text));
    } else {
      copyFallback(url, text);
    }
  }, [matched.length]);

  return (
    <section className="px-5 pt-3">
      {/* 결과 패널 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E5A9E] to-[#3B8BCF] p-6 text-center text-white">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.2),transparent_70%)]" />
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/18 px-2.5 py-1 text-[10px] font-extrabold backdrop-blur">
          <CheckIcon /> 정부24 · 인천주거포털 검증
        </div>
        <p className="mt-3 text-[12px] font-bold text-on-blue-mute">
          {unlocked ? "내가 챙길 수 있는 정책" : "예상 매칭 정책 (게스트)"}
        </p>
        <div className="mt-1 flex items-end justify-center gap-2">
          <CountUp
            value={matched.length}
            from={0}
            duration={1100}
            className="text-[58px] font-extrabold leading-none tracking-[-0.045em] tabular-nums"
          />
          <span className="mb-1.5 text-[24px] font-extrabold leading-none">개</span>
        </div>
        {saving > 0 && (
          <p className="mt-2 text-[11.5px] font-semibold text-on-blue-mute">
            검증 정책 기준 최대 약 <b className="text-white">{saving.toLocaleString()}만원</b> 절감 가능
          </p>
        )}
        {unlocked && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/18 px-3 py-1 text-[11px] font-bold backdrop-blur">
            💾 결과 저장됨 · 🔔 마감 알림 ON
          </div>
        )}
      </div>

      {!unlocked && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-hairline bg-paper px-3.5 py-3">
          <span className="text-[16px]">💛</span>
          <span className="flex-1 text-[11.5px] font-semibold text-ink-soft">
            카카오로 가입하면 정책을 모두 볼 수 있어요
          </span>
          <button
            type="button"
            onClick={onKakao}
            className="rounded-full bg-kakao px-3 py-1.5 text-[11px] font-extrabold text-kakao-text"
          >
            카카오로 받기
          </button>
        </div>
      )}

      <h2 className="mx-1 mt-5 text-[14px] font-extrabold text-ink">
        {unlocked ? "내가 챙길 수 있는 정책" : "먼저 보여드리는 핵심"}{" "}
        <span className="font-bold text-mute">({matched.length}개 매칭)</span>
      </h2>

      <div className="mt-3 space-y-2">
        {visible.map((p) => (
          <PolicyItem key={p.id} policy={p} />
        ))}
        {hidden.length > 0 && (
          <div className="rounded-2xl border border-hairline bg-paper p-4 text-center">
            <p className="text-[13px] font-bold text-ink">
              💛 {hidden.length}개 정책을 더 보여드려요
            </p>
            <p className="mt-1 text-[11.5px] font-medium text-mute">
              카카오로 가입하면 마감일·신청처까지 한 번에 챙길 수 있어요
            </p>
            <button
              type="button"
              onClick={onKakao}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-kakao px-4 py-2 text-[12px] font-extrabold text-kakao-text"
            >
              <KakaoIcon />
              카카오로 받기
            </button>
          </div>
        )}
      </div>

      {/* 공유 FAB */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 bg-gradient-to-t from-white via-white/95 to-white/0">
        <button
          type="button"
          onClick={onShare}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-kakao py-4 text-[15px] font-extrabold text-kakao-text shadow-[0_14px_30px_-12px_rgba(0,0,0,0.35)] transition active:scale-[0.99]"
        >
          <KakaoIcon />
          친구도 챙길 거 있는지 보내주기
        </button>
      </div>

      <p className="mt-4 mb-2 text-center text-[10.5px] font-medium text-faint">
        본 정보는 참고용이며 자격 여부·신청은 각 기관 공식 공고에서 확인해 주세요.
      </p>
    </section>
  );
}

function PolicyItem({ policy }: { policy: Policy }) {
  return (
    <Link
      href={`/policy/${policy.id}`}
      onClick={() => track("support_policy_click", { policy: policy.id })}
      className="block rounded-2xl border border-hairline bg-white p-3.5 transition active:scale-[0.99]"
    >
      <div className="flex items-center gap-1.5">
        <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-extrabold text-blue-deepest">
          {policy.category === "housing-loan"
            ? "주택대출"
            : policy.category === "housing-rent"
              ? "전·월세"
              : policy.category === "birth"
                ? "출산"
                : "청년"}
        </span>
        <span className="rounded-full bg-[#F1F5FA] px-2 py-0.5 text-[10px] font-bold text-mute">
          {policy.level === "central" ? "중앙" : policy.level === "city" ? "인천시" : "군·구"}
        </span>
      </div>
      <h3 className="mt-1.5 text-[14px] font-extrabold leading-snug tracking-tight text-ink">
        {policy.name}
      </h3>
      <p className="mt-1 text-[11.5px] font-medium leading-snug text-mute">{policy.oneLiner}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[12px] font-extrabold text-blue-deepest">{policy.amountOrRate}</span>
        <span className="text-[11px] font-bold text-mute">자세히 →</span>
      </div>
    </Link>
  );
}

// ───────────────────────────── 유틸 컴포넌트 ─────────────────────────────

/** 부드러운 숫자 카운트업 (정수). value 가 바뀌면 이전 값에서 새 값으로 애니메이션 */
function CountUp({
  value,
  from,
  duration = 600,
  className,
}: {
  value: number;
  from?: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(from ?? value);
  useEffect(() => {
    const start = display;
    const end = value;
    if (start === end) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span className={className}>{display.toLocaleString("ko-KR")}</span>;
}

function copyFallback(url: string, text: string) {
  try {
    navigator.clipboard.writeText(`${text} ${url}`);
    alert("링크를 복사했어요. 카톡에 붙여넣어 주세요.");
  } catch {}
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2C5.6 2 2 4.8 2 8.2c0 2.2 1.5 4.1 3.7 5.2L4.8 17l3.6-2.3c.5.1 1.1.1 1.6.1 4.4 0 8-2.8 8-6.6S14.4 2 10 2z" />
    </svg>
  );
}
