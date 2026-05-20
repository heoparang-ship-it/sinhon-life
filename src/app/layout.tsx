import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/ui/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "신혼생활 · sinhon.life",
    template: "%s · 신혼생활",
  },
  description: "결혼 준비부터 신혼 생활까지, 부부가 함께 쓰는 가계부·체크리스트·정책 알리미",
  metadataBase: new URL("https://sinhon.life"),
  applicationName: "신혼생활",
  keywords: [
    "신혼생활",
    "신혼부부",
    "결혼 준비",
    "결혼 체크리스트",
    "결혼 가계부",
    "스드메",
    "예식장",
    "혼수가전",
    "신혼집",
    "신혼여행",
    "본식현금",
    "예물예단",
  ],
  authors: [{ name: "주식회사 엑스컴" }],
  creator: "주식회사 엑스컴",
  publisher: "주식회사 엑스컴",
  openGraph: {
    title: "신혼생활 — 결혼 준비, 함께 시작",
    description: "신혼부부가 같이 쓰는 결혼 가계부·체크리스트·정책 알리미",
    type: "website",
    locale: "ko_KR",
    url: "https://sinhon.life",
    siteName: "신혼생활",
  },
  twitter: {
    card: "summary_large_image",
    title: "신혼생활 — 결혼 준비, 함께 시작",
    description: "신혼부부가 같이 쓰는 결혼 가계부·체크리스트·정책 알리미",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "신혼생활",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#6FB1EA",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-white text-ink flex flex-col">
        <div className="flex-1 max-w-[480px] mx-auto w-full relative">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
