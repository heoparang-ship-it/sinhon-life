import type { MetadataRoute } from "next";
import { listRegionKeys } from "@/lib/index/regionData";
import { listPolicyIds } from "@/lib/policy/data";

const BASE = "https://sinhon.life";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/ai",
    "/support",
    "/policy",
    "/budget",
    "/checklist",
    "/archive",
    "/my",
    "/partners",
    "/privacy",
    "/terms",
    "/business",
    "/lp/incheon-policy",
  ].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "/" ? 1.0 : p === "/support" || p === "/policy" ? 0.95 : 0.7,
  }));

  const regionRoutes: MetadataRoute.Sitemap = listRegionKeys().map((k) => ({
    url: `${BASE}/index/${k}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const policyRoutes: MetadataRoute.Sitemap = listPolicyIds().map((id) => ({
    url: `${BASE}/policy/${id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...regionRoutes, ...policyRoutes];
}
