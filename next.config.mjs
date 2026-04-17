import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    // src/instrumentation.ts 훅 활성화 (Sentry 서버/엣지 초기화)
    instrumentationHook: true,
  },
};

// Sentry DSN 미설정 시 withSentryConfig는 no-op으로 동작 (빌드는 통과)
const sentryOptions = {
  silent: true,
  // 업로드 인증 토큰 (CI·Amplify에서 SENTRY_AUTH_TOKEN로 주입)
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // 소스맵 업로드는 토큰이 있을 때만 시도
  disableSourceMapUpload: !process.env.SENTRY_AUTH_TOKEN,
  // /monitoring 경로로 터널링 → 애드블록 회피
  tunnelRoute: "/monitoring",
  // 빌드 시 SDK 파일 숨김 (번들 크기 최소화)
  hideSourceMaps: true,
};

export default withSentryConfig(nextConfig, sentryOptions);
