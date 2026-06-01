"use client";

/**
 * 인천 정책 콜드 광고 랜딩.
 *
 * 설계 원칙:
 * 1) 첫 화면 안에 가치 + CTA. 스크롤 없이도 행동 가능.
 * 2) 가입·연락처 강제 X — 트래픽 모으기 + 자가진단으로 자연 잔류.
 * 3) Meta Pixel: ViewContent(랜딩 진입) / Lead(자가진단 완료) / ViewContent(정책카드 클릭).
 * 4) UTM 파라미터는 sessionStorage에 보관 → 이후 리드 제출 시 함께 전송 가능.
 * 5) 모바일 100%.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  POLICIES,
  matchPolicies,
  LIFE_STAGE_LABELS,
  POLICY_CATEGORY_LABELS,
  type LifeStage,
} from "@/lib/policy/data";
import { track } from "@/lib/analytics/track";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

function persistUtm(searchParams: URLSearchParams | null) {
  if (typeof window === "undefined" || !searchParams) return;
  const utm: Record<string, string> = {};
  UTM_KEYS.forEach((k) => {
    const v = searchParams.get(k);
    if (v) utm[k] = v;
  });
  if (Object.keys(utm).length > 0) {
    try {
      window.sessionStorage.setItem("sinhon.utm", JSON.stringify(utm));
    } catch {
      /* noop */
    }
  }
}

export function IncheonPolicyLP() {
  const sp = useSearchParams();
  const [phase, setPhase] = useState<"intro" | "diagnose" | "result">("intro");
  const [stages, setStages] = useState<LifeStage[]>([]);

  useEffect(() => {
    persistUtm(sp);
    track("decision_card_click", { from: "lp_incheon_policy", action: "view" });
  }, [sp]);

  const matched = useMemo(() => (phase === "result" ? matchPolicies({ stages }) : []), [phase, stages]);
  const knownSaving = useMemo(
    () => matched.reduce((sum, p) => sum + (p.estSavingManwon ?? 0), 0),
    [matched],
  );

  const toggle = (s: LifeStage) =>
    setStages((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const onDiagnose = () => {
    setPhase("result");
    track("lead_card_shown", { from: "lp_incheon_policy", stages: stages.join(",") });
    // 자가진단 완료 = 광고 최적화 신호
    try {
      window.fbq?.("track", "Lead", { content_name: "policy_diagnosis" });
    } catch {
      /* noop */
    }
  };

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Hero — ATF 가치 + CTA */}
      <section
        className="relative overflow-hidden px-5 pt-[max(36px,env(safe-area-inset-top))] pb-7"
        style={{ background: "linear-gradient(160deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)" }}
      >
        <p className="inline-block rounded-full bg-white/18 px-3 py-1 text-[11.5px] font-extrabold text-white backdrop-blur">
          인천 신혼 전용 · 무료
        </p>
        <h1 className="mt-4 text-[28px] font-extrabold leading-[1.18] tracking-tight text-white">
          인천 신혼이면 받는
          <br />
          정책, 1분이면 알아봐요
        </h1>
        <p className="mt-3 text-[14px] font-medium leading-relaxed text-white/90">
          천원주택 · 신생아 특례대출 · 전세보증료 · 산후조리비 등<br />
          공식 출처 검증 <b>{POLICIES.length}개</b>를 한 곳에서.
        </p>
        <button
          type="button"
          onClick={() => {
            setPhase("diagnose");
            track("decision_card_click", { from: "lp_hero_cta" });
          }}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-[16px] font-extrabold text-blue-deepest shadow-[0_18px_30px_-12px_rgba(0,0,0,0.35)] transition active:scale-[0.99]"
        >
          1분 자가진단 시작 →
        </button>
        <div className="mt-3 flex items-center gap-2 text-[11.5px] font-semibold text-white/80">
          <span>✓ 가입·연락처 불필요</span>
          <span>·</span>
          <span>✓ 공식 출처 링크</span>
        </div>
      </section>

      {phase === "intro" && (
        <>
          {/* 사회적 증명 = 정책 그 자체 */}
          <section className="px-5 pt-7">
            <h2 className="text-[18px] font-extrabold tracking-tight text-ink">
              이런 정책을 받을 수 있어요
            </h2>
            <div className="mt-4 space-y-2.5">
              <Highlight emoji="🏠" title="천원주택" body="하루 1천원으로 살 수 있는 인천형 임대(매입·전세)" />
              <Highlight emoji="👶" title="신생아 특례대출" body="2년 내 출산 가구 주택구입 최대 4억·연 1.8%~" />
              <Highlight emoji="🔑" title="전세보증료 지원" body="전세 보증보험 가입 보증료 최대 40만원" />
              <Highlight emoji="🤱" title="맘편한 산후조리비" body="산후조리비 인천e음 포인트 150만원" />
              <Highlight emoji="🧑" title="청년 임차보증금 이자" body="19~39세 청년 보증금 대출이자 지원" />
            </div>
            <button
              type="button"
              onClick={() => setPhase("diagnose")}
              className="mt-5 w-full rounded-2xl py-4 text-[15px] font-extrabold text-white shadow-[0_12px_22px_-10px_rgba(43,123,207,0.55)]"
              style={{ background: "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)" }}
            >
              내가 받을 수 있는 정책 찾기
            </button>
          </section>

          <FaqSection />
        </>
      )}

      {phase === "diagnose" && (
        <section className="px-5 pt-7">
          <h2 className="text-[20px] font-extrabold leading-tight tracking-tight text-ink">
            우리 부부는 지금?
          </h2>
          <p className="mt-1 text-[13px] font-medium text-mute">해당되는 걸 모두 골라주세요. 복수 선택 OK.</p>
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
            onClick={onDiagnose}
            disabled={stages.length === 0}
            className="mt-5 w-full rounded-2xl py-4 text-[15px] font-extrabold text-white shadow-[0_12px_22px_-10px_rgba(43,123,207,0.55)] transition active:scale-[0.99] disabled:opacity-35"
            style={{ background: "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)" }}
          >
            매칭 결과 보기
          </button>
          <p className="mt-3 text-center text-[11.5px] font-medium text-mute">
            결과는 즉시 보여드려요. 개인정보 저장 없음.
          </p>
        </section>
      )}

      {phase === "result" && (
        <section className="px-5 pt-7">
          <div className="rounded-3xl p-5 text-white" style={{ background: "linear-gradient(135deg,#2566A8,#3B8BCF)" }}>
            <p className="text-[12.5px] font-bold text-white/75">매칭된 정책</p>
            <p className="mt-1 text-[30px] font-extrabold leading-none">{matched.length}개</p>
            {knownSaving > 0 && (
              <p className="mt-2 text-[13.5px] font-semibold text-white/85">
                현금성 지원만 약 <b className="text-white">{knownSaving.toLocaleString()}만원</b> + 저리대출 우대까지
              </p>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {matched.map((p) => (
              <Link
                key={p.id}
                href={`/policy/${p.id}`}
                onClick={() => track("decision_card_click", { from: "lp_result", policy: p.id })}
                className="block rounded-2xl border border-hairline bg-white p-4 transition active:scale-[0.99]"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10.5px] font-bold text-blue-deepest">
                    {POLICY_CATEGORY_LABELS[p.category]}
                  </span>
                  <span className="rounded-full bg-[#F1F5FA] px-2 py-0.5 text-[10.5px] font-bold text-mute">
                    {p.level === "central" ? "중앙" : p.level === "city" ? "인천시" : "군·구"}
                  </span>
                </div>
                <h3 className="mt-2 text-[15.5px] font-extrabold leading-snug text-ink">{p.name}</h3>
                <p className="mt-1 text-[12.5px] font-medium leading-snug text-mute">{p.oneLiner}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[13px] font-extrabold text-blue-deepest">{p.amountOrRate}</span>
                  <span className="text-[12px] font-bold text-mute">자세히 →</span>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/policy"
            onClick={() => track("decision_card_click", { from: "lp_result_bottom_cta" })}
            className="mt-6 block w-full rounded-2xl py-4 text-center text-[15px] font-extrabold text-white shadow-[0_12px_22px_-10px_rgba(43,123,207,0.55)]"
            style={{ background: "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)" }}
          >
            정책 전체 보기 + AI톡 상담하기
          </Link>
          <p className="mt-3 text-center text-[11.5px] font-medium text-mute">
            본 정보는 참고용 · 신청은 각 기관 공식 페이지에서
          </p>
        </section>
      )}
    </main>
  );
}

function Highlight({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl bg-paper px-4 py-3.5">
      <span className="text-[22px]">{emoji}</span>
      <div>
        <div className="text-[14.5px] font-extrabold text-ink">{title}</div>
        <div className="text-[12px] font-medium text-mute">{body}</div>
      </div>
    </div>
  );
}

function FaqSection() {
  const faqs = [
    { q: "정말 무료인가요?", a: "네. 정책 정보 조회·자가진단·매칭 모두 무료예요. 신청도 각 기관 공식 페이지에서 무료로 진행해요." },
    { q: "회원가입 없이도 볼 수 있어요?", a: "네. 가입·연락처 입력 없이 자가진단까지 가능해요." },
    { q: "출처가 믿을만한가요?", a: "주택도시기금, 한국주택금융공사, 인천주거포털, 정부24 등 공식 페이지에서 직접 확인한 정보예요. 각 정책 상세에서 출처 링크를 볼 수 있어요." },
    { q: "인천 외 지역도 가능한가요?", a: "현재는 인천 중심이에요. 다른 지역은 곧 오픈 예정." },
  ];
  return (
    <section className="px-5 pt-8">
      <h2 className="text-[18px] font-extrabold tracking-tight text-ink">자주 묻는 질문</h2>
      <div className="mt-4 divide-y divide-hairline rounded-2xl border border-hairline bg-white">
        {faqs.map((f, i) => (
          <div key={i} className="p-4">
            <p className="text-[14px] font-extrabold text-ink">{f.q}</p>
            <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-mute">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
