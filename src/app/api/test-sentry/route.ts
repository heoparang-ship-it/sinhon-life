// Sentry 동작 확인용 테스트 엔드포인트
// 프로덕션에서도 접근 가능하나 에러 하나 던지고 끝 — 피해 없음
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  throw new Error("Sentry test: sinhon.life intentional error — " + new Date().toISOString());
}

// 빌드 경고 회피용 (Next가 export 없는 route를 싫어할 때 대비)
export async function POST() {
  return NextResponse.json({ ok: false, error: "Use GET to trigger test error." }, { status: 405 });
}
