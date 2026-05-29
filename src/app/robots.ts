import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/auth/", "/login"] },
    ],
    sitemap: "https://sinhon.life/sitemap.xml",
    host: "https://sinhon.life",
  };
}
