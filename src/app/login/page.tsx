"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginForm() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(
    params?.get("error") ? "로그인이 취소되었거나 실패했어요." : null,
  );

  const loginWithKakao = async () => {
    setLoading(true);
    setErr(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/my`,
        },
      });
      if (error) throw error;
    } catch (e) {
      setLoading(false);
      setErr(e instanceof Error ? e.message : "로그인에 실패했어요.");
    }
  };

  return (
    <section className="px-7 mt-8">
      <button
        type="button"
        onClick={loginWithKakao}
        disabled={loading}
        className="w-full h-14 rounded-2xl bg-kakao text-kakao-text font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-[0_10px_28px_-16px_rgba(254,229,0,0.6)] disabled:opacity-60"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2C5.6 2 2 4.8 2 8.2c0 2.2 1.5 4.1 3.7 5.2L4.8 17l3.6-2.3c.5.1 1.1.1 1.6.1 4.4 0 8-2.8 8-6.6S14.4 2 10 2z" />
        </svg>
        {loading ? "이동 중…" : "카카오로 시작하기"}
      </button>
      {err && <p className="mt-3 text-[12.5px] text-expense text-center">{err}</p>}

      <div className="mt-8 p-4 rounded-2xl bg-paper border border-hairline text-[12px] text-mute leading-relaxed">
        로그인하면{" "}
        <a href="/terms" className="underline">이용약관</a>·
        <a href="/privacy" className="underline">개인정보 처리방침</a>에 동의하게 됩니다.
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-[100dvh] pb-[140px] bg-white">
      <div className="bg-hero-sky pt-12 pb-10 px-7 rounded-b-[28px] text-on-blue">
        <MicroLabel className="text-on-blue-faint">Sign In</MicroLabel>
        <h1 className="mt-4 text-[26px] font-bold tracking-tightest leading-[1.15]">
          신혼생활에<br />
          <span className="text-on-blue-mute font-medium">함께 시작하기.</span>
        </h1>
        <p className="mt-3 text-[13px] text-on-blue-mute leading-relaxed">
          가계부·체크리스트가 폰을 바꿔도 그대로 유지돼요.
        </p>
      </div>
      <Suspense fallback={<div className="px-7 mt-8 text-mute">불러오는 중…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
