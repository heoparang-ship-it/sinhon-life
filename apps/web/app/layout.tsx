import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Noto_Serif_KR, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const serif = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap"
});

const sans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "신혼생활 · sinhon.life",
    template: "%s · 신혼생활"
  },
  description: "신혼을 준비하는 모든 순간 — 웨딩 매거진과 AI 정책 톡.",
  metadataBase: new URL("https://sinhon.life"),
  openGraph: {
    description: "신혼을 준비하는 모든 순간 — 웨딩 매거진과 AI 정책 톡.",
    locale: "ko_KR",
    siteName: "신혼생활",
    title: "신혼생활",
    type: "website",
    url: "https://sinhon.life"
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
