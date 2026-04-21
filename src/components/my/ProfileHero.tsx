"use client";

import { Pencil } from "lucide-react";

function daysSince(marriageDate: string): number | null {
  if (!marriageDate) return null;
  const d = new Date(marriageDate);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  return diff;
}

function formatKoreanDate(iso: string): string {
  if (!iso) return "결혼일을 입력해보세요";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. 결혼`;
}

// Each avatar shows ~1 character; trim gracefully so longer names don't
// overflow the 52px circle.
function shortLabel(name: string, fallback: string): string {
  const s = name.trim();
  if (!s) return fallback;
  return s.length > 2 ? s.slice(0, 2) : s;
}

export default function ProfileHero({
  partnerA,
  partnerB,
  marriageDate,
  onEdit,
}: {
  partnerA: string;
  partnerB: string;
  marriageDate: string;
  onEdit: () => void;
}) {
  const a = shortLabel(partnerA, "신랑");
  const b = shortLabel(partnerB, "신부");
  const days = daysSince(marriageDate);
  const dLabel = days !== null ? `D+${days}` : "Our Story";

  return (
    <div className="relative overflow-hidden mx-4 mb-5 p-6 rounded-3xl bg-gradient-to-br from-coral-200 via-honey-300 to-paper">
      <button
        onClick={onEdit}
        aria-label="프로필 편집"
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-coral-700 active:scale-90 transition"
      >
        <Pencil size={15} />
      </button>

      <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-[rgba(40,20,10,0.6)] mb-3 font-bold">
        {dLabel}
      </div>
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="rounded-full bg-white/85 flex items-center justify-center font-bold text-coral-700 text-[15px]"
          style={{ width: 52, height: 52 }}
        >
          {a}
        </div>
        <div className="font-serif text-[22px] font-medium text-[#2a1a10]">&amp;</div>
        <div
          className="rounded-full bg-white/85 flex items-center justify-center font-bold text-mint-700 text-[15px]"
          style={{ width: 52, height: 52 }}
        >
          {b}
        </div>
      </div>
      <div className="font-serif text-[20px] font-medium text-[#2a1a10] tracking-tight leading-snug">
        {formatKoreanDate(marriageDate)}
        {days !== null && (
          <>
            <br />
            <span className="text-[14px] text-[rgba(40,20,10,0.7)]">
              오늘로 {days}일째 함께
            </span>
          </>
        )}
      </div>
    </div>
  );
}
