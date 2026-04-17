import { MetadataRoute } from "next";

const BASE_URL = "https://sinhon.life";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 모든 검색엔진 기본 규칙
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/chat", "/_next/", "/private/"],
      },
      // Google
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/chat"],
      },
      // Naver (가장 중요한 국내 검색엔진)
      {
        userAgent: "Yeti",
        allow: "/",
        disallow: ["/admin/", "/api/", "/chat"],
      },
      {
        userAgent: "NaverBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/chat"],
      },
      // Daum/Kakao
      {
        userAgent: "Daumoa",
        allow: "/",
        disallow: ["/admin/", "/api/", "/chat"],
      },
      // Bing
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/chat"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
