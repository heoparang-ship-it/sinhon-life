"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Eyebrow from "@/components/design/Eyebrow";
import {
  BENEFIT_CATEGORIES,
  REGION_LABELS,
  formatMan,
  sumCategory,
  sumRegion,
  type RegionId,
} from "@/lib/design/benefits100m";
import { getProfile, type Region } from "@/lib/profile";

const REGION_COLORS: Record<string, string> = {
  coral: "bg-coral-500",
  mint: "bg-mint-500",
  honey: "bg-honey-300",
  ink: "bg-ink",
};

function mapRegion(r?: Region): RegionId {
  if (r === "incheon" || r === "seoul" || r === "gyeonggi" || r === "busan" || r === "daegu") return r;
  return "etc";
}

export default function HundredMillionGuide() {
  const [region, setRegion] = useState<RegionId>("seoul");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const p = getProfile();
    setRegion(mapRegion(p?.region));
    setMounted(true);
  }, []);

  const total = mounted ? sumRegion(region) : 0;
  const regionLabel = REGION_LABELS[region];

  return (
    <Link
      href="/guide/hundred-million"
      className="block mx-5 mb-8 rounded-2xl bg-paper-surface border border-paper-line overflow-hidden active:scale-[0.99] transition"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-coral-500 to-coral-700 px-5 pt-5 pb-4 text-white">
        <span
          aria-hidden
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-honey-300/30"
        />
        <div className="relative">
          <Eyebrow tone="paper">benefit stack · 최대 1억</Eyebrow>
          <h3 className="font-serif text-[22px] font-semibold tracking-tightest leading-snug mt-1.5 wb-keep">
            주거·대출·출산·세제·지역
            <br />
            <span className="italic">어디서 얼마나 나오나</span>
          </h3>
          {mounted && (
            <p className="text-[12.5px] text-white/90 mt-2 wb-keep">
              🎯 {regionLabel} 기준 최대{" "}
              <strong className="text-honey-300">{formatMan(total)}원</strong>까지 누적 가능
            </p>
          )}
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        {BENEFIT_CATEGORIES.map((c) => {
          const val = mounted ? sumCategory(region, c.id) : 0;
          const pct = total > 0 ? Math.max(4, Math.round((val / total) * 100)) : 4;
          return (
            <div key={c.id} className="flex items-center gap-2.5">
              <span className="w-6 shrink-0 text-[15px]" aria-hidden>
                {c.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12.5px] font-bold text-ink tracking-tight">
                    {c.title}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-ink-soft shrink-0">
                    {mounted ? formatMan(val) : "—"}
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-paper overflow-hidden">
                  <div
                    className={`h-full rounded-full ${REGION_COLORS[c.tone] ?? "bg-coral-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-[11px] text-ink-muted font-mono">
          <span>※ 조건 충족 시 최대 추정치 · 실제 수령은 달라요</span>
          <span className="inline-flex items-center gap-1 text-coral-700 font-bold">
            자세히 <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
