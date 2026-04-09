import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
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
