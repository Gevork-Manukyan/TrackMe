import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://trackme.gevorkmanukyan.com";

// Only the public landing is worth indexing — the rest is the auth-gated app.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
