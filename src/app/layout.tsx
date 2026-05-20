import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/ui/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "신혼생활 · sinhon.life",
  description: "결혼 준비부터 신혼 생활까지, 부부가 함께 쓰는 가계부·체크리스트·정책 알리미",
  metadataBase: new URL("https://sinhon.life"),
  openGraph: {
    title: "신혼생활",
    description: "신혼부부가 함께 쓰는 결혼 준비 플랫폼",
    type: "website",
    locale: "ko_KR",
    url: "https://sinhon.life",
  },
  icons: { icon: "/favicon.ico" },
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
