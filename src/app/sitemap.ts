import type { MetadataRoute } from "next";
import { POLICIES, VENDORS } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://sinhon.life";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/chat`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const policyPages: MetadataRoute.Sitemap = POLICIES.map((p) => ({
    url: `${baseUrl}/policy/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const vendorPages: MetadataRoute.Sitemap = VENDORS.map((v) => ({
    url: `${baseUrl}/vendor/${v.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...policyPages, ...vendorPages];
}
