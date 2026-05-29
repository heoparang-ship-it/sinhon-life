import type { MetadataRoute } from "next";
import { listRegionKeys } from "@/lib/index/regionData";

const BASE = "https://sinhon.life";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/ai",
    "/budget",
    "/checklist",
    "/archive",
    "/my",
    "/partners",
    "/privacy",
    "/terms",
  ].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "/" ? 1.0 : 0.7,
  }));

  const regionRoutes: MetadataRoute.Sitemap = listRegionKeys().map((k) => ({
    url: `${BASE}/index/${k}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticRoutes, ...regionRoutes];
}
