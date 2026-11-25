import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { en: site.url, ru: `${site.url}/ru` };
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1, alternates: { languages } },
    { url: `${site.url}/ru`, changeFrequency: "monthly", priority: 0.9, alternates: { languages } },
  ];
}
