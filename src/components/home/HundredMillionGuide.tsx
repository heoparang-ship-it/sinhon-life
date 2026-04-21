"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Eyebrow from "@/components/design/Eyebrow";
import {
  REGION_LABELS,
  formatMan,
  sumRegion,
  type RegionId,
} from "@/lib/design/benefits100m";
import { getProfile, type Region } from "@/lib/profile";


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
      className="block mx-5 mb-5 rounded-xl overflow-hidden active:scale-[0.99] transition"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-coral-500 to-coral-700 px-5 py-3.5 text-white">
        <span
          aria-hidden
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-honey-300/30"
        />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Eyebrow tone="paper">benefit stack · 최대 1억</Eyebrow>
            <h3 className="font-serif text-[16px] font-semibold tracking-tightest leading-snug mt-1 wb-keep">
              주거·대출·출산·세제·지역{" "}
              <span className="italic font-normal">어디서 얼마나?</span>
            </h3>
            {mounted && (
              <p className="text-[11px] text-white/90 mt-1 wb-keep">
                🎯 {regionLabel} 기준 최대{" "}
                <strong className="text-honey-300">{formatMan(total)}원</strong> 누적 가능
              </p>
            )}
          </div>
          <ArrowRight size={18} className="text-white/70 shrink-0" />
        </div>
      </div>
    </Link>
  );
}
