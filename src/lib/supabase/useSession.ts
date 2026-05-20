"use client";
import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "./client";

export type SessionState = {
  status: "loading" | "authenticated" | "unauthenticated" | "unconfigured";
  user: User | null;
  session: Session | null;
};

/**
 * 클라이언트 컴포넌트에서 현재 로그인 상태를 가져오는 훅.
 * - "loading": 초기 로딩
 * - "authenticated": 로그인됨
 * - "unauthenticated": 비로그인
 * - "unconfigured": Supabase 환경변수 미설정 (로컬 개발 초기)
 */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    status: "loading",
    user: null,
    session: null,
  });

  useEffect(() => {
    let supabase;
    try {
      supabase = createSupabaseBrowserClient();
    } catch {
      setState({ status: "unconfigured", user: null, session: null });
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const session = data.session;
      setState({
        status: session ? "authenticated" : "unauthenticated",
        user: session?.user ?? null,
        session,
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState({
        status: session ? "authenticated" : "unauthenticated",
        user: session?.user ?? null,
        session,
      });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signOut();
}
