"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production, and actively tears it down in
 * development. Renders nothing.
 *
 * Why the dev carve-out: sw.js serves /_next/static cache-first. In production
 * that is safe because Next content-hashes those filenames, so changed content
 * always means a new URL. The dev server reuses URLs whose contents change, so a
 * cache-first worker pins the first copy it sees and silently serves stale CSS
 * and JS — edits appear to do nothing, which is maddening to debug.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((r) => r.unregister())),
        )
        .then(() => caches?.keys())
        .then((keys) => Promise.all((keys ?? []).map((k) => caches.delete(k))))
        .catch(() => {
          // Nothing to clean up, or the browser denied it — either way, harmless.
        });
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        // Registration failing must never break the app — it only costs offline support.
        console.error("[TrackMe] service worker registration failed:", error);
      });
    };

    // Wait for load so registration doesn't compete with the first paint.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
