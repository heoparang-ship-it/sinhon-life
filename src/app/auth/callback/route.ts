import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Supabase OAuth 콜백 라우트.
 * 카카오/구글 등 OAuth 인증이 완료되면 Supabase가 이 URL로 사용자를 보내고,
 * 여기서 code → session 교환을 수행해 쿠키를 심은 뒤 ?next 경로로 보낸다.
 *
 * Supabase 대시보드 설정에서 Redirect URLs에 추가 필요:
 *   - http://localhost:3000/auth/callback
 *   - https://sinhon.life/auth/callback
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/my";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
