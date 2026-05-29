"use client";
import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T, G } from "@/lib/design/tokens";
import {
  MicroLabel,
  GlassBubble,
  CharacterBubble,
} from "@/components/legacy/Primitives";
import { signOut, useSession } from "@/lib/supabase/useSession";
import { useUserProfile, type DecisionCategory } from "@/lib/profile/useUserProfile";

const DECISION_LABEL: Record<DecisionCategory, string> = {
  sdm: "스드메",
  venue: "예식장",
  interior: "신혼집",
  goods: "혼수",
  honeymoon: "신혼여행",
};

function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const d = new Date(date + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

export function MyScreen() {
  const session = useSession();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const { profile } = useUserProfile();
  const dday = useMemo(() => daysUntil(profile.weddingDate), [profile.weddingDate]);
  const completed = profile.completedDecisions.length;
  const ratio = Math.round((completed / 5) * 100);

  const handleSignOut = async () => {
    if (typeof window !== "undefined" && !window.confirm("로그아웃할까요?")) return;
    setSigningOut(true);
    try {
      await signOut();
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  const displayName =
    session.user?.user_metadata?.name ||
    session.user?.user_metadata?.full_name ||
    session.user?.email?.split("@")[0] ||
    "닉네임 자리";
  const avatar = session.user?.user_metadata?.avatar_url as string | undefined;
  const isAuthed = session.status === "authenticated";

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: T.white,
        fontFamily: T.font,
        color: T.ink,
        paddingBottom: 140,
      }}
    >
      {/* Hero */}
      <div style={{ paddingTop: 54, background: T.blueSoft }}>
        <div
          style={{
            position: "relative",
            background: G.heroSky,
            paddingTop: 18,
            paddingBottom: 56,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            overflow: "hidden",
          }}
        >
          <GlassBubble
            size={48}
            top={30}
            right={-12}
            opacity={0.18}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.4" />
                <path
                  d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
          <div style={{ padding: "20px 28px 0" }}>
            <MicroLabel color={T.onBlueFaint}>My Profile · 05</MicroLabel>
            <div
              style={{
                marginTop: 28,
                display: "flex",
                alignItems: "center",
                gap: 18,
              }}
            >
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt={displayName}
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: "50%",
                    objectFit: "cover",
                    boxShadow:
                      "0 22px 40px -18px rgba(20,40,80,0.40), inset 0 1px 0 rgba(255,255,255,0.45)",
                  }}
                />
              ) : (
                <CharacterBubble size={84} label={"캐릭터\n만들기"} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "-0.035em",
                    color: T.onBlue,
                    lineHeight: 1.2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12.5,
                    color: T.onBlueMute,
                  }}
                >
                  {isAuthed
                    ? `kakao · ${session.user?.email ?? ""}`
                    : "로그인 전 · 둘이서 시작해요"}
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: 26,
                padding: "16px 18px",
                borderRadius: 18,
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
              }}
            >
              {[
                {
                  label: "결정 진행률",
                  value: `${completed}/5`,
                },
                {
                  label: "예식 D-day",
                  value: dday !== null && dday >= 0 ? `D-${dday}` : "—",
                },
                {
                  label: "Choice Share",
                  value: ratio + "%",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    borderLeft:
                      i === 0 ? "none" : "1px solid rgba(255,255,255,0.22)",
                    paddingLeft: i === 0 ? 0 : 14,
                    paddingRight: i === 2 ? 0 : 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: T.onBlue,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 10.5,
                      fontWeight: 500,
                      color: T.onBlueMute,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {!isAuthed && session.status !== "loading" && (
              <Link
                href="/login"
                style={{
                  marginTop: 22,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  height: 44,
                  padding: "0 18px",
                  borderRadius: 999,
                  background: T.white,
                  color: T.accentDeep,
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                  boxShadow: "0 10px 24px -12px rgba(0,0,0,0.25)",
                }}
              >
                카카오로 시작하기 →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Decision Portfolio */}
      <div style={{ padding: "28px 28px 0" }}>
        <MicroLabel>My Decision Portfolio</MicroLabel>
        <div
          style={{
            marginTop: 12,
            padding: "14px 16px",
            borderRadius: 16,
            border: "1px solid #E8EFF6",
            background: "#FFF",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(["sdm", "venue", "interior", "goods", "honeymoon"] as DecisionCategory[]).map(
              (c) => {
                const done = profile.completedDecisions.includes(c);
                return (
                  <span
                    key={c}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "5px 10px",
                      borderRadius: 999,
                      fontSize: 11.5,
                      fontWeight: 700,
                      background: done ? "#3B8BCF" : "#F1F5FA",
                      color: done ? "#FFF" : T.mute,
                    }}
                  >
                    {done ? "✓" : "○"} {DECISION_LABEL[c]}
                  </span>
                );
              },
            )}
          </div>
          <div style={{ marginTop: 10, fontSize: 11.5, color: T.mute }}>
            홈에서 카테고리별로 ‘결정 완료’ 표시할 수 있어요.
          </div>
        </div>
      </div>

      {/* Menu */}
      <div style={{ padding: "28px 28px 0" }}>
        <MicroLabel>Account</MicroLabel>
        <div style={{ marginTop: 14 }}>
          <MenuRow
            href="/my"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            }
            title="내 정보"
            sub="닉네임, 결혼 시기, 알림 설정"
          />
          <MenuRow
            href="/"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            }
            title="저장한 영상"
            sub="나중에 다시 볼 영상 모음"
          />
          <MenuRow
            href="/budget"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            }
            title="가계부 설정"
            sub="예산, 카테고리, 함께 쓰는 파트너"
          />
          <MenuRow
            href="/checklist"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12l4 4 10-10"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            title="결혼 체크리스트"
            sub="9그룹 95개 항목"
          />
        </div>

        <div style={{ marginTop: 36 }}>
          <MicroLabel>Support</MicroLabel>
          <div style={{ marginTop: 14 }}>
            <MenuRow
              href="/my"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="M10 9.5a2 2 0 113 1.7c-.6.3-1 .8-1 1.5v.3M12 16.2v.3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              }
              title="도움말 & 문의"
            />
            <MenuRow
              href="/my"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 7h14M5 12h14M5 17h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              }
              title="약관 및 정책"
            />
          </div>
        </div>

        <div style={{ marginTop: 40, marginBottom: 160, textAlign: "center" }}>
          {isAuthed && (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                background: "none",
                border: "none",
                fontSize: 12,
                color: T.faint,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: T.font,
              }}
            >
              {signingOut ? "로그아웃 중…" : "로그아웃"}
            </button>
          )}
          <div
            style={{
              marginTop: 18,
              fontSize: 11,
              color: T.faint,
              letterSpacing: "0.02em",
            }}
          >
            sinhon.life · v0.1.0
          </div>
        </div>
      </div>
    </main>
  );
}

function MenuRow({
  href,
  icon,
  title,
  sub,
  badge,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  sub?: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 4px",
        borderBottom: "1px solid rgba(120,140,170,0.10)",
        textDecoration: "none",
        color: T.ink,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: G.pillIdleOnWhite,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T.accentDeep,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{title}</div>
        {sub && (
          <div style={{ marginTop: 3, fontSize: 11.5, color: T.mute }}>
            {sub}
          </div>
        )}
      </div>
      {badge && (
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 999,
            background: G.pillIdleOnWhite,
            color: T.accentDeep,
          }}
        >
          {badge}
        </span>
      )}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 5l7 7-7 7"
          stroke={T.faint}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
