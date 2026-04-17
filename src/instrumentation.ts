// Next.js 14+ instrumentation hook — Sentry 서버/엣지 런타임 초기화
// next.config.mjs의 withSentryConfig가 자동 주입하지 못하는 경우를 대비한 명시적 훅
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}
