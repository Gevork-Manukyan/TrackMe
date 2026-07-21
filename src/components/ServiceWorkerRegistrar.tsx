"use client";

import { useEffect } from "react";

/** Registers the service worker once the page is interactive. Renders nothing. */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

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
