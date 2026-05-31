"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  type Policy,
  DISTRICT_CONTACTS,
  POLICY_CATEGORY_LABELS,
} from "@/lib/policy/data";
import { track } from "@/lib/analytics/track";

// 정책 카테고리별로 자연스럽게 이어지는 다음 결정(=리드 브릿지)
const NEXT_DECISION: Record<string, { label: string; seed: string }> = {
  "housing-loan": { label: "신혼집 인테리어 알아보기", seed: "인천 신혼집 인테리어 알아보고 싶어요" },
  "housing-rent": { label: "이사·신혼집 꾸미기 알아보기", seed: "인천 신혼집 인테리어와 이사 알아보고 싶어요" },
  birth: { label: "산후조리·육아 준비 물어보기", seed: "인천 산후조리원과 출산 준비 알려줘" },
  youth: { label: "전세·신혼집 알아보기", seed: "인천 신혼집 전세 알아보고 싶어요" },
};

export function PolicyDetailScreen({ policy }: { policy: Policy }) {
  const router = useRouter();
  const showDistrict =
    policy.applicationOrg.includes("군·구") || policy.id === "ic-jeonse-guarantee-fee" || policy.id === "ic-postpartum-care-voucher";
  const [district, setDistrict] = useState(DISTRICT_CONTACTS[7].code); // 부평 기본
  const contact = DISTRICT_CONTACTS.find((d) => d.code === district)!;
  const next = NEXT_DECISION[policy.category];

  return (
    <main className="min-h-screen bg-white pb-[120px]">
      <header className="flex items-center gap-1 px-3 pt-[max(14px,env(safe-area-inset-top))] pb-2">
        <Link href="/policy" aria-label="목록" className="grid h-10 w-10 place-items-center rounded-full text-ink active:bg-[#F1F5FA]">
          <ChevronLeft size={24} />
        </Link>
        <span className="text-[14px] font-bold text-mute">정책 상세</span>
      </header>

      <div className="px-5 pt-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold text-blue-deepest">
            {POLICY_CATEGORY_LABELS[policy.category]}
          </span>
          <span className="rounded-full bg-[#F1F5FA] px-2.5 py-1 text-[11px] font-bold text-mute">
            {policy.level === "central" ? "중앙정부" : policy.level === "city" ? "인천시" : "군·구"}
          </span>
        </div>
        <h1 className="mt-3 text-[23px] font-extrabold leading-tight tracking-tight text-ink">{policy.name}</h1>
        <p className="mt-2 text-[14px] font-medium leading-relaxed text-mute">{policy.oneLiner}</p>

        {/* 핵심 금액 */}
        <div className="mt-4 rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg,#2566A8,#3B8BCF)" }}>
          <p className="text-[12px] font-bold text-on-blue-mute">지원 내용</p>
          <p className="mt-1 text-[20px] font-extrabold leading-tight">{policy.amountOrRate}</p>
          <p className="mt-1 text-[12.5px] font-semibold text-on-blue-mute">{policy.supportSummary} · {policy.duration}</p>
        </div>

        {/* 조건 */}
        <Section title="신청 자격">
          <dl className="divide-y divide-hairline">
            {Object.entries(policy.eligibility).map(([k, v]) => (
              <div key={k} className="flex gap-4 py-2.5">
                <dt className="w-[88px] shrink-0 text-[12.5px] font-bold text-mute">{k}</dt>
                <dd className="text-[13px] font-semibold text-ink">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* 대상 */}
        <Section title="대상">
          <p className="text-[13.5px] font-medium leading-relaxed text-ink-soft">{policy.target}</p>
        </Section>

        {/* 군·구 접수처 (시 정책의 군구별 집행창구) */}
        {showDistrict && (
          <Section title="우리 동네 접수처">
            <p className="mb-2 text-[12px] font-medium text-mute">
              같은 인천시 정책이라도 접수·문의는 거주 군·구 창구로 해요.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {DISTRICT_CONTACTS.map((d) => (
                <button
                  key={d.code}
                  type="button"
                  onClick={() => setDistrict(d.code)}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition ${
                    district === d.code ? "bg-blue-accent text-white" : "bg-[#F1F5FA] text-mute"
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-2xl border border-hairline bg-paper p-4">
              <div className="text-[14px] font-extrabold text-ink">{contact.name}</div>
              {policy.id === "ic-postpartum-care-voucher" ? (
                <a href={`tel:${contact.postpartumPhone}`} className="mt-1 block text-[13px] font-semibold text-blue-deepest">
                  보건소 {contact.postpartumPhone}
                </a>
              ) : (
                <a href={`tel:${contact.jeonseGuaranteePhone}`} className="mt-1 block text-[13px] font-semibold text-blue-deepest">
                  {contact.jeonseGuaranteeDept} {contact.jeonseGuaranteePhone}
                </a>
              )}
            </div>
          </Section>
        )}

        {/* 공식 신청 링크 */}
        <a
          href={policy.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("feedback_click", { type: "policy_apply", policy: policy.id })}
          className="mt-6 block w-full rounded-2xl py-4 text-center text-[15px] font-extrabold text-white shadow-[0_10px_22px_-10px_rgba(43,123,207,0.6)] transition active:scale-[0.99]"
          style={{ background: "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)" }}
        >
          공식 페이지에서 신청하기 →
        </a>
        <p className="mt-2 text-center text-[11px] font-medium text-mute">
          {policy.applicationOrg}
        </p>

        {/* 출처·신뢰도 */}
        <div className="mt-5 rounded-2xl bg-paper p-3.5">
          <p className="text-[11.5px] font-medium leading-relaxed text-mute">
            <b className="text-ink-soft">출처</b> {policy.sourceTitle} · 확인일 {policy.verifiedAt} ·{" "}
            <span className={policy.confidence === "확인" ? "text-blue-deepest font-bold" : "text-expense font-bold"}>
              {policy.confidence}
            </span>
            {policy.note ? ` · ${policy.note}` : ""}
          </p>
        </div>

        {/* ★ 수익 브릿지: 다음 결정으로 */}
        {next && (
          <button
            type="button"
            onClick={() => {
              track("decision_card_click", { from: `policy:${policy.id}`, to: next.label });
              router.push(`/ai?seed=${encodeURIComponent(next.seed)}`);
            }}
            className="mt-6 flex w-full items-center justify-between rounded-2xl border border-hairline bg-white px-4 py-4 text-left transition active:scale-[0.99]"
          >
            <div>
              <div className="text-[11.5px] font-bold text-blue-deepest">이 정책 다음 단계</div>
              <div className="mt-0.5 text-[14.5px] font-extrabold text-ink">{next.label}</div>
            </div>
            <span className="text-[18px]">→</span>
          </button>
        )}
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="mb-2.5 text-[14px] font-extrabold text-ink">{title}</h2>
      {children}
    </div>
  );
}
