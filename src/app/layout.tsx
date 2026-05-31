import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { BottomNav } from "@/components/ui/BottomNav";
import { LandingLeft } from "@/components/legacy/LandingLeft";
import { AppFooter } from "@/components/AppFooter";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

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
      <body className="min-h-full bg-white text-ink lg:h-[100dvh] lg:overflow-hidden lg:bg-[#F2F4F6]">
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_ID}', {anonymize_ip: true});window.gtag = gtag;`}
            </Script>
          </>
        )}
        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel-init" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                alt=""
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
        <div className="w-full flex justify-center desktop-shell">
          <LandingLeft />
          <div className="flex-1 max-w-[480px] w-full relative desktop-phone">
            <div className="lg:absolute lg:inset-0 lg:overflow-y-auto scrollbar-hide">
              {children}
              <AppFooter />
            </div>
            <BottomNav />
          </div>
        </div>
      </body>
    </html>
  );
}
