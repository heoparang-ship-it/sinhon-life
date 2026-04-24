// V4 — 캐릭터 시스템 (랑/봄/준/혜택카드)
// Geometric minimal SVG characters with dot-eyes

type CharWho = "rang" | "bom" | "jun" | "card";
type CharMood = "default" | "happy" | "confused";

interface CharProps {
  who?: CharWho;
  size?: number;
  mood?: CharMood;
}

const PALETTE: Record<CharWho, { body: string; accent: string; label: string }> = {
  rang: { body: "#2196F3", accent: "#fff", label: "랑" },
  bom: { body: "#FFB49D", accent: "#172033", label: "봄" },
  jun: { body: "#FFF7D6", accent: "#172033", label: "준" },
  card: { body: "#4CC9A3", accent: "#fff", label: "혜택" },
};

export default function Char({ who = "rang", size = 64, mood = "default" }: CharProps) {
  const p = PALETTE[who];

  if (who === "card") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <rect x="10" y="14" width="44" height="36" rx="6" fill={p.body} />
        <rect x="10" y="14" width="44" height="10" rx="6" fill="#172033" />
        <rect x="10" y="18" width="44" height="6" fill="#172033" />
        <circle cx="20" cy="36" r="2" fill={p.accent} />
        <circle cx="28" cy="36" r="2" fill={p.accent} />
        <path d="M20 42 Q24 46 28 42" stroke={p.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="36" y="34" width="14" height="3" rx="1.5" fill="#172033" />
        <rect x="36" y="40" width="10" height="3" rx="1.5" fill="#172033" opacity=".5" />
      </svg>
    );
  }

  const eyesOpen = mood !== "confused";

  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {/* body */}
      <rect x="14" y="36" width="36" height="24" rx="10" fill={p.body} />
      {/* head */}
      <circle cx="32" cy="26" r="16" fill={p.body} />
      {/* hair */}
      {who === "bom" && <path d="M16 22 Q32 10 48 22 Q44 18 32 18 Q20 18 16 22 Z" fill="#172033" />}
      {who === "jun" && <path d="M18 22 Q32 14 46 22 Q42 16 32 16 Q22 16 18 22 Z" fill="#172033" />}
      {who === "rang" && <circle cx="32" cy="12" r="4" fill="#172033" />}
      {/* eyes */}
      {eyesOpen ? (
        <>
          <circle cx="26" cy="27" r="1.8" fill={p.accent} />
          <circle cx="38" cy="27" r="1.8" fill={p.accent} />
        </>
      ) : (
        <>
          <path d="M23 27 L29 27" stroke={p.accent} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M35 27 L41 27" stroke={p.accent} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
      {/* mouth */}
      {mood === "happy" ? (
        <path d="M27 32 Q32 36 37 32" stroke={p.accent} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      ) : mood === "confused" ? (
        <path d="M28 33 Q32 31 36 33" stroke={p.accent} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M29 32 L35 32" stroke={p.accent} strokeWidth="1.8" strokeLinecap="round" />
      )}
      {/* name tag */}
      <rect x="24" y="52" width="16" height="8" rx="4" fill="#172033" />
      <text x="32" y="58" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700">
        {p.label}
      </text>
    </svg>
  );
}
