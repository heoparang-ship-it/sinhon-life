"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

type PolicyItem = {
  slug: string;
  title: string;
  desc: string;
  amount: string;
  tier: "high" | "check" | "low";
};

const CONDITION_TAGS = ["혼인신고 완료", "연소득 합산 8천만원 이하", "무주택"];

const POLICIES: PolicyItem[] = [
  { slug: "dimdol-loan", title: "디딤돌 구입자금 대출", desc: "연 1.85~3.0% 최대 4억 원 대출", amount: "최대 4억", tier: "high" },
  { slug: "sinchon-jeonse", title: "신혼 전세자금 대출", desc: "연 1.2~2.7% 최대 3억 원 대출", amount: "최대 3억", tier: "high" },
  { slug: "birth-voucher", title: "첫만남이용권", desc: "출생 신고 후 200만원 바우처 지급", amount: "200만원", tier: "high" },
  { slug: "sinchon-special", title: "신혼부부 특별공급", desc: "소득 요건 충족 시 신청 가능", amount: "시세 70%", tier: "check" },
  { slug: "happy-housing", title: "행복주택", desc: "시세 60~80% 공공임대", amount: "시세 60%", tier: "check" },
  { slug: "birth-grant", title: "출산지원금 (지자체)", desc: "거주 지역별 상이, 확인 필요", amount: "지역별 상이", tier: "check" },
  { slug: "jeonse-guarantee", title: "전세보증보험", desc: "소득 초과로 조건 검토 필요", amount: "해당 없음", tier: "low" },
];

const TIER_CONFIG = {
  high: { label: "가능성 높음", bg: "var(--mint-card)", textColor: "#0D7A55", dotColor: "#22C55E", icon: "✅" },
  check: { label: "확인 필요", bg: "var(--butter-card)", textColor: "#92600A", dotColor: "#F59E0B", icon: "🔍" },
  low: { label: "조건 부족", bg: "var(--section, #F8FAFC)", textColor: "#667085", dotColor: "#98A2B3", icon: "⚪" },
} as const;

const grouped = {
  high: POLICIES.filter((p) => p.tier === "high"),
  check: POLICIES.filter((p) => p.tier === "check"),
  low: POLICIES.filter((p) => p.tier === "low"),
};

export default function ResultPage() {
  return (
    <div style={{ background: "#FFFFFF" }}>
      <header
        className="sticky top-0 z-10 flex items-center gap-3 px-5 py-3 border-b"
        style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)", borderColor: "#E6ECF2" }}
      >
        <Link href="/" style={{ color: "#667085" }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-base" style={{ color: "#172033" }}>우리 부부 맞춤 혜택</h1>
      </header>

      <div className="px-4 py-5 space-y-6">
        {/* 요약 카드 */}
        <div className="rounded-3xl p-5" style={{ background: "var(--sky-card, #EAF6FF)" }}>
          <div className="flex gap-2 flex-wrap mb-3">
            {CONDITION_TAGS.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: "white", color: "var(--primary, #2196F3)" }}
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[17px] font-bold" style={{ color: "#172033" }}>
            지금 챙길 수 있는 혜택{" "}
            <span style={{ color: "var(--primary, #2196F3)" }}>7개</span>를 찾았어요
          </p>
          <p className="text-sm mt-1" style={{ color: "#667085" }}>조건에 맞게 가능성 순으로 정렬했어요</p>
        </div>

        {/* 3칸 그리드 */}
        <div className="grid grid-cols-3 gap-2">
          {(["high", "check", "low"] as const).map((tier) => {
            const cfg = TIER_CONFIG[tier];
            return (
              <div key={tier} className="rounded-2xl p-3 text-center" style={{ background: cfg.bg }}>
                <p className="text-xl font-extrabold" style={{ color: cfg.textColor }}>{grouped[tier].length}</p>
                <p className="text-[10px] mt-1" style={{ color: "#667085" }}>{cfg.label}</p>
              </div>
            );
          })}
        </div>

        {/* 정책 리스트 */}
        {(["high", "check", "low"] as const).map((tier) => (
          <div key={tier}>
            <h3 className="font-bold text-sm mb-3" style={{ color: "#2E3A52" }}>
              {TIER_CONFIG[tier].icon} {TIER_CONFIG[tier].label}
            </h3>
            <div className="space-y-2.5">
              {grouped[tier].map((p) => {
                const cfg = TIER_CONFIG[p.tier];
                return (
                  <Link
                    key={p.slug}
                    href={`/policy/${p.slug}`}
                    className="flex items-center gap-3 p-4 rounded-2xl border bg-white transition-all active:scale-[0.98]"
                    style={{ borderColor: "#E6ECF2" }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: cfg.bg, color: cfg.textColor }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: "#172033" }}>{p.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#667085" }}>{p.desc}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold" style={{ color: "var(--primary, #2196F3)" }}>{p.amount}</p>
                      <ChevronRight size={14} style={{ color: "#98A2B3" }} className="mt-1 ml-auto" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
