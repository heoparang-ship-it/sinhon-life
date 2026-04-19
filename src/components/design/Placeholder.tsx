"use client";

import { useId } from "react";

type Tone = "coral" | "mint" | "honey" | "navy" | "paper" | "warm" | "cool" | "mono";

const palette: Record<Tone, [string, string, string]> = {
  coral: ["#FFD9D2", "#FFC9C2", "#F97066"],
  mint: ["#D6F2E8", "#B8EADA", "#5EC9A8"],
  honey: ["#FEF0D4", "#FBD38D", "#D69E2E"],
  navy: ["#D6DDE8", "#A0AEC0", "#4A5568"],
  paper: ["#FDF8F1", "#F0E4D2", "#D6C9B0"],
  warm: ["#FFE8D9", "#FBD38D", "#C8453D"],
  cool: ["#D6F2E8", "#B8EADA", "#2F8770"],
  mono: ["#F0E4D2", "#E0D4C2", "#4A5568"],
};

export default function Placeholder({
  label,
  tone = "coral",
  className = "",
  aspect = "16/9",
  rounded = "rounded-xl",
}: {
  label?: string;
  tone?: Tone;
  className?: string;
  aspect?: string;
  rounded?: string;
}) {
  const [a, , c] = palette[tone];
  // useId keeps gradient IDs stable between SSR and CSR to avoid hydration mismatch.
  const gradientId = useId();

  return (
    <div
      className={`relative overflow-hidden ${rounded} ${className}`}
      style={{ aspectRatio: aspect }}
    >
      <svg
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 400 300"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor={c} />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#${gradientId})`} />
        <line x1="60" y1="40" x2="340" y2="40" stroke={c} strokeOpacity="0.15" strokeWidth="1" />
        <line x1="60" y1="260" x2="340" y2="260" stroke={c} strokeOpacity="0.15" strokeWidth="1" />
      </svg>
      {label && (
        <span
          className="absolute left-2.5 bottom-2.5 font-mono uppercase tracking-wider text-[9.5px] opacity-70"
          style={{ color: c }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
