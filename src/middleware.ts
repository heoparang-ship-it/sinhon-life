import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_LOGIN_PATH,
  hashAdminToken,
} from "@/lib/adminAuth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ───────────── /admin 인증 게이트 ─────────────
  // /admin/login 과 /api/admin/login(+logout)은 예외.
  const isAdminArea =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLoginPage = pathname === ADMIN_LOGIN_PATH;

  if (isAdminArea && !isAdminLoginPage) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      // 환경변수 미설정 → 접근 자체 차단, 로그인 페이지로 안내 (에러 플래그)
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN_PATH;
      url.searchParams.set("e", "config");
      return NextResponse.redirect(url);
    }

    const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
    let authorized = false;
    if (cookie) {
      const expected = await hashAdminToken(adminPassword);
      authorized = cookie === expected;
    }

    if (!authorized) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN_PATH;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();

  // 보안 헤더
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // API CORS
  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin") ?? "";
    const allowed = [
      "https://sinhon.life",
      "https://www.sinhon.life",
    ];
    if (process.env.NODE_ENV === "development") {
      allowed.push("http://localhost:3000");
    }
    if (allowed.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon-).*)"],
};
