import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 한국어 도메인 (신혼생활.kr, 신혼생활.한국, 신혼생활.com)
const KOREAN_DOMAIN_HOSTS = [
  "xn--9g4bv0b284ayd.kr",       // 신혼생활.kr
  "xn--9g4bv0b284ayd.xn--3e0b707e", // 신혼생활.한국
  "xn--9g4bv0b284ayd.com",      // 신혼생활.com
  "www.xn--9g4bv0b284ayd.kr",
  "www.xn--9g4bv0b284ayd.xn--3e0b707e",
  "www.xn--9g4bv0b284ayd.com",
];

const PRIMARY_DOMAIN = "https://sinhon.life";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0] ?? "";

  // 한국어 도메인으로 접속 시 sinhon.life로 리다이렉트
  if (KOREAN_DOMAIN_HOSTS.includes(hostname)) {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, PRIMARY_DOMAIN);
    return NextResponse.redirect(url, 301);
  }

  const response = NextResponse.next();

  // 보안 헤더
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // API CORS
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin") ?? "";
    const allowed = [
      "https://sinhon.life",
      "https://www.sinhon.life",
      "https://xn--9g4bv0b284ayd.kr",
      "https://xn--9g4bv0b284ayd.xn--3e0b707e",
      "https://xn--9g4bv0b284ayd.com",
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
