import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrackMe",
    short_name: "TrackMe",
    description: "Track the places you want to try, and check them off.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    // Matches the dark --ground so the splash screen doesn't flash white.
    background_color: "#0E1626",
    theme_color: "#16233B",
    orientation: "portrait",
    categories: ["food", "lifestyle", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
