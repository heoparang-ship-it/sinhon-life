import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import PushNotificationInit from "@/components/PushNotificationInit";

export const metadata: Metadata = {
  title: "신혼생활 - 신혼부부 정책·혜택 AI 상담",
  description: "청약, 출산장려금, 전세대출 등 신혼부부가 꼭 알아야 할 정책을 AI가 맞춤 안내합니다.",
  manifest: "/manifest.json",
  openGraph: {
    title: "신혼생활 - 신혼부부 정책·혜택 AI 상담",
    description: "청약, 출산장려금, 전세대출 등 신혼부부가 꼭 알아야 할 정책을 AI가 맞춤 안내합니다.",
    url: "https://sinhon.life",
    siteName: "신혼생활",
    locale: "ko_KR",
    type: "website",
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-warm-bg text-warm-text">
        <ServiceWorkerRegister />
        <PushNotificationInit />
        <main className="max-w-lg mx-auto min-h-screen pb-16">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
