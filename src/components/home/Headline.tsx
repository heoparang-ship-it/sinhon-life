"use client";

import { useCoupleProfile } from "@/lib/design/useCoupleProfile";

export default function Headline({
  benefitCount,
  maxAmountText,
}: {
  benefitCount: number;
  maxAmountText: string;
}) {
  const { names } = useCoupleProfile();

  return (
    <div className="px-5 pt-1 pb-5">
      <h1 className="text-[26px] font-extrabold text-ink tracking-tightest leading-[1.28] wb-keep text-balance">
        {names} 부부가 올해 받을 수 있는
        <br />
        <span className="text-coral-500">혜택 {benefitCount}건</span>
      </h1>
      <p className="text-[13px] text-ink-soft mt-2.5 leading-relaxed wb-keep">
        소득·거주·결혼일로 맞춤 — 최대{" "}
        <strong className="text-coral-700">{maxAmountText}</strong>
      </p>
    </div>
  );
}
