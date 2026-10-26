import { siteUrl } from "@/lib/site-url";
import { settings } from "@/lib/settings";
import type { MetadataRoute } from "next";
import { services, calculators } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const s = await settings();
  return [
    "",
    "about",
    "services",
    "pricing",
    "booking",
    "calculators",
    "articles",
    "faq",
    "contact",
    "privacy",
    "terms",
    ...services
      .filter(([id]) => !s.hiddenServices.includes(id))
      .map(([id]) => "services/" + id),
    ...s.customServices.map((a) => "services/" + a.slug),
    ...calculators.map(([id]) => "calculators/" + id),
    ...s.articles
      .filter((a) => a.published && a.reviewedAt)
      .map((a) => "articles/" + a.slug),
  ].map((path) => ({ url: `${base}/${path}` }));
}
