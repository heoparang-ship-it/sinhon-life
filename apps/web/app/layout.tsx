import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "신혼생활 · sinhon.life",
    template: "%s · 신혼생활"
  },
  description: "예비부부와 신혼부부를 위한 정책 톡과 공식 인스타 아카이브",
  metadataBase: new URL("https://sinhon.life"),
  openGraph: {
    description: "예비부부와 신혼부부를 위한 정책 톡과 공식 인스타 아카이브",
    locale: "ko_KR",
    siteName: "신혼생활",
    title: "신혼생활",
    type: "website",
    url: "https://sinhon.life"
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
