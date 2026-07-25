import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://trackme.gevorkmanukyan.com";

// The landing page (/) and login are public and meant to be found; everything
// else is the private app, so keep crawlers out of it. Longest-match wins, so the
// specific Disallow entries override the broad Allow.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login"],
      disallow: ["/c/", "/api/", "/auth/", "/offline"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
