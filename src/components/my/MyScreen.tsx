"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { signOut, useSession } from "@/lib/supabase/useSession";

export function MyScreen() {
  const session = useSession();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

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
    "신혼부부";
  const avatar = session.user?.user_metadata?.avatar_url as string | undefined;

  return (
    <main className="min-h-[100dvh] pb-[140px] bg-white">
      <div className="bg-hero-sky pt-12 pb-10 px-7 rounded-b-[28px] text-on-blue">
        <MicroLabel className="text-on-blue-faint">MY · 05</MicroLabel>
        <h1 className="mt-4 text-[26px] font-bold tracking-tightest">내 정보</h1>

        {session.status === "loading" && (
          <p className="mt-3 text-[13px] text-on-blue-mute">불러오는 중…</p>
        )}

        {session.status === "authenticated" && (
          <div className="mt-6 p-5 rounded-2xl bg-white/95 backdrop-blur-xl shadow-[0_18px_40px_-18px_rgba(20,40,80,0.30)]">
            <div className="flex items-center gap-4">
              {avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={avatar}
                  alt={displayName}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-soft flex items-center justify-center text-2xl">
                  💑
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[16px] font-bold text-ink truncate">{displayName}</div>
                {session.user?.email && (
                  <div className="mt-0.5 text-[12px] text-mute truncate">{session.user.email}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {session.status === "unauthenticated" && (
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white text-blue-accent font-bold text-[13px] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.25)]"
            >
              카카오로 시작하기 →
            </Link>
            <p className="mt-3 text-[12px] text-on-blue-mute">
              로그인하면 가계부·체크리스트가 폰을 바꿔도 그대로 유지돼요.
            </p>
          </div>
        )}

        {session.status === "unconfigured" && (
          <p className="mt-3 text-[12px] text-on-blue-faint">
            로그인 준비 중 — 백엔드 연결이 곧 열려요.
          </p>
        )}
      </div>

      <section className="px-7 mt-7">
        <MicroLabel>내 데이터</MicroLabel>
        <div className="mt-3 grid grid-cols-1 gap-3">
          <RowLink href="/budget" label="가계부" desc="9개 카테고리로 결혼 예산 관리" />
          <RowLink href="/checklist" label="체크리스트" desc="9그룹 95개 항목" />
          <RowLink href="/archive" label="신혼 아카이브" desc="인스타 피드 모음" />
        </div>
      </section>

      {session.status === "authenticated" && (
        <section className="px-7 mt-8">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full h-12 border border-[rgba(224,82,99,0.30)] rounded-2xl bg-[rgba(224,82,99,0.06)] text-expense font-bold text-[13.5px] disabled:opacity-60"
          >
            {signingOut ? "로그아웃 중…" : "로그아웃"}
          </button>
        </section>
      )}
    </main>
  );
}

function RowLink({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-4 rounded-2xl bg-white border border-hairline"
    >
      <div className="min-w-0">
        <div className="text-[14.5px] font-bold text-ink tracking-tight">{label}</div>
        <div className="mt-0.5 text-[11.5px] text-mute truncate">{desc}</div>
      </div>
      <span className="text-faint">›</span>
    </Link>
  );
}
