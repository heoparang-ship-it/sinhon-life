import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "신혼생활 · 신혼부부 정책 도우미",
    template: "%s · 신혼생활"
  },
  description: "신혼, 시작은 혜택부터. 전세대출·청약·출산지원 — 신혼부부 정책을 두리AI가 모아드려요.",
  metadataBase: new URL("https://sinhon.life"),
  openGraph: {
    description: "신혼, 시작은 혜택부터. 신혼부부 정책을 두리AI가 모아드려요.",
    locale: "ko_KR",
    siteName: "신혼생활",
    title: "신혼생활 · 신혼부부 정책 도우미",
    type: "website",
    url: "https://sinhon.life"
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
