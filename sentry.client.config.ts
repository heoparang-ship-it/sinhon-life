// Sentry 브라우저 에러 추적 (클라이언트 사이드)
// NEXT_PUBLIC_SENTRY_DSN 미설정 시 no-op
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    // 개인정보 민감 서비스 — 세션 리플레이는 기본 OFF
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // 이메일·전화 등 PII 전송 차단
    sendDefaultPii: false,
    ignoreErrors: [
      // 흔한 브라우저 노이즈
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
    ],
  });
}
