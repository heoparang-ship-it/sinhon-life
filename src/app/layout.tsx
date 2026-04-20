import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import PushNotificationInit from "@/components/PushNotificationInit";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { ToastProvider } from "@/components/ui";
import AuthProvider from "@/components/AuthProvider";

// V3.1 redesign typography — serif headlines + mono eyebrow labels.
// Pretendard (body) is loaded via globals.css CDN import to avoid next/font build weight.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jbmono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = "https://sinhon.life";
const SITE_NAME = "신혼생활";
const SITE_TITLE = "신혼생활 — 신혼부부 정책·혜택 AI 상담 플랫폼";
const SITE_DESCRIPTION =
  "신혼생활은 결혼·신혼부부·신랑신부가 꼭 챙겨야 할 2026년 정부 지원, 신혼부부 특공, 공공임대, 출산지원금, 부모급여, 세액공제를 AI가 맞춤으로 알려주는 대한민국 대표 신혼생활 플랫폼입니다.";
const SITE_KEYWORDS = [
  "신혼생활",
  "신혼부부",
  "신랑",
  "신부",
  "신혼",
  "결혼",
  "결혼준비",
  "예비부부",
  "신혼여행",
  "예식준비",
  "웨딩홀",
  "스드메",
  "신혼부부 특공",
  "신혼부부 청약",
  "신생아 특공",
  "행복주택",
  "공공임대",
  "국민임대",
  "매입임대",
  "출산지원금",
  "부모급여",
  "첫만남이용권",
  "신혼부부 세금",
  "연말정산 신혼부부",
  "혼인신고",
  "신혼부부 혜택",
  "신혼부부 정책",
  "신혼부부 지원금",
  "2026 신혼부부",
  "신혼부부 AI",
  "sinhon life",
  "sinhon.life",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | 신혼생활",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: "신혼생활", url: SITE_URL }],
  creator: "신혼생활",
  publisher: "신혼생활",
  generator: "Next.js",
  category: "lifestyle",
  classification: "신혼부부 정책·혜택 플랫폼",
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.json",
  alternates: {
    canonical: SITE_URL,
    languages: {
      "ko-KR": SITE_URL,
      "x-default": SITE_URL,
    },
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", type: "image/svg+xml" },
      { url: "/icon-1024.png", sizes: "1024x1024", type: "image/png" },
    ],
    apple: [{ url: "/icon-1024.png", sizes: "1024x1024" }],
    shortcut: "/icon-192.svg",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/icon-1024.png",
        width: 1024,
        height: 1024,
        alt: "신혼생활 — 신혼부부 정책·혜택 AI 상담 플랫폼",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/icon-1024.png"],
    creator: "@sinhon_life",
    site: "@sinhon_life",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // HTML 파일 방식(public/google7e5f43628e481ad3.html)이 주 인증이며,
    // 메타 태그는 이중 안전장치 용도.
    google: "google7e5f43628e481ad3",
    other: {
      "naver-site-verification": "bfe6e4a7441c02afeaba07922965048ec0c23805",
    },
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "신혼생활",
    "mobile-web-app-capable": "yes",
    "format-detection": "telephone=no",
    // Naver 검색 최적화
    NaverBot: "All",
    Yeti: "All",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FDF8F1", // Rice Paper — 키컬러 시스템 배경
  viewportFit: "cover",
};

// 전역 Organization + WebSite + SearchAction 구조화 데이터
const GLOBAL_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "신혼생활",
      alternateName: ["sinhon.life", "Sinhon Life", "신혼부부 AI"],
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon-1024.png`,
        width: 1024,
        height: 1024,
      },
      sameAs: [
        "https://instagram.com/sinhon.life",
        "https://open.kakao.com/o/p10syHoi",
      ],
      description:
        "신혼부부·예비부부·신랑신부를 위한 정책·혜택 AI 상담 플랫폼. 청약, 공공임대, 출산지원금, 연말정산 등 결혼·신혼 관련 2026년 최신 정보를 맞춤으로 제공합니다.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "신혼생활",
      description: SITE_DESCRIPTION,
      inLanguage: "ko-KR",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/chat?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${fraunces.variable} ${jbmono.variable}`}>
      <head>
        <link rel="canonical" href={SITE_URL} />
        <meta name="subject" content="신혼부부 정책·혜택 AI 상담" />
        <meta name="rating" content="General" />
        <meta name="distribution" content="Global" />
        <meta name="revisit-after" content="1 days" />
        <meta name="copyright" content="신혼생활 (sinhon.life)" />
        <meta name="language" content="ko" />
        <meta name="geo.region" content="KR" />
        <meta name="geo.placename" content="대한민국" />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:site_name" content="신혼생활" />
      </head>
      <body className="antialiased bg-warm-bg text-warm-text">
        <Script
          id="ld-json-global"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(GLOBAL_JSONLD) }}
        />
        <ServiceWorkerRegister />
        <PushNotificationInit />
        <AuthProvider>
          <ToastProvider>
            <main className="max-w-lg mx-auto min-h-screen pb-16">{children}</main>
            <BottomNav />
            <PWAInstallPrompt />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
