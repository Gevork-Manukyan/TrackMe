import type { MetadataRoute } from "next";

// TrackMe is entirely behind auth — there is nothing for a crawler to index, and
// /login is the only public page. Disallow everything so the app stays out of
// search results. No sitemap, for the same reason.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
