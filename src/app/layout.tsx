import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import PushNotificationInit from "@/components/PushNotificationInit";

export const metadata: Metadata = {
  title: "신혼생활 - 신혼부부 정책·혜택 AI 상담",
  description: "신혼생활 필수 정보! 청약, 출산장려금, 전세대출, 세금 감면 등 신혼부부가 꼭 알아야 할 정책을 AI가 맞춤 안내합니다.",
  keywords: ["신혼생활", "신혼부부", "신혼부부 혜택", "결혼 준비", "청약", "출산장려금", "전세대출", "신혼부부 정책", "결혼 혜택", "신혼"],
  manifest: "/manifest.json",
  metadataBase: new URL("https://sinhon.life"),
  alternates: {
    canonical: "https://sinhon.life",
  },
  openGraph: {
    title: "신혼생활 - 신혼부부 정책·혜택 AI 상담",
    description: "신혼생활 필수 정보! 청약, 출산장려금, 전세대출 등 신혼부부가 꼭 알아야 할 정책을 AI가 맞춤 안내합니다.",
    url: "https://sinhon.life",
    siteName: "신혼생활",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "신혼생활 - 신혼부부 정책·혜택 AI 상담",
    description: "신혼부부가 꼭 알아야 할 정책을 AI가 맞춤 안내합니다.",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      "naver-site-verification": process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ?? "",
    },
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "신혼생활",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAFAF8",
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "신혼생활",
  alternateName: ["sinhon.life", "신혼생활 AI", "신혼부부 혜택"],
  url: "https://sinhon.life",
  description: "신혼부부가 꼭 알아야 할 정책·혜택을 AI가 맞춤 안내합니다.",
  inLanguage: "ko",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://sinhon.life/chat?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-warm-bg text-warm-text">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ServiceWorkerRegister />
        <PushNotificationInit />
        <main className="max-w-lg mx-auto min-h-screen pb-16">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
