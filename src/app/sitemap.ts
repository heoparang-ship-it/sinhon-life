import { MetadataRoute } from "next";
import { POLICIES, HUB_CATEGORIES } from "@/lib/constants";

const BASE_URL = "https://sinhon.life";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/explore`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/onboarding`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/my`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // 허브 카테고리 페이지 (6개)
  const hubPages: MetadataRoute.Sitemap = HUB_CATEGORIES.map((hub) => ({
    url: `${BASE_URL}/category/${hub.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // 정책 상세 페이지 (전체 POLICIES 자동 반영)
  const policyPages: MetadataRoute.Sitemap = POLICIES.map((p) => {
    const lastMod = p.updatedAt ? new Date(p.updatedAt) : now;
    return {
      url: `${BASE_URL}/policy/${p.slug}`,
      lastModified: lastMod,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    };
  });

  return [...staticPages, ...hubPages, ...policyPages];
}
