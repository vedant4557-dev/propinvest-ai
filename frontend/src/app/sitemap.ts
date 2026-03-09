import type { MetadataRoute } from "next";
import projects from "@/data/projects";

const SITE_URL = "https://propinvest-ai-smoky.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Core pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                          lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/app`,                 lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE_URL}/projects`,            lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/emi-calculator`,      lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  // One page per project — these are the SEO money pages
  const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE_URL}/projects/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...projectPages];
}
