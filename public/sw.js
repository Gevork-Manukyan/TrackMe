/* TrackMe service worker — Phase 3 (app shell).
 *
 * Scope note: this deliberately does NOT cache authenticated page HTML. Those
 * pages contain one account's lists, and a cached copy could be served to a
 * different account signed in on the same device. Phase 4 makes the app work
 * offline properly by moving the data into IndexedDB (Dexie) and rendering
 * from there, at which point the HTML shell becomes user-agnostic and safe to
 * cache. Until then: static assets + an offline fallback.
 */

const VERSION = "trackme-v1";
const STATIC_CACHE = `${VERSION}-static`;

const PRECACHE = ["/offline", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only GETs are cacheable; server actions are POSTs and must always hit the network.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept auth: stale redirects or cached callbacks break sign-in.
  if (url.pathname.startsWith("/auth/")) return;

  // Page loads: always try the network so data is fresh. If the device is
  // offline, show the fallback rather than a browser error page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const fallback = await caches.match("/offline");
        return (
          fallback ??
          new Response("You are offline.", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          })
        );
      }),
    );
    return;
  }

  // Build output is content-hashed and immutable, and icons rarely change —
  // serve from cache first, populating it on the way past.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});

// Lets the app drop every cache on sign-out, so nothing from one account
// lingers for the next one.
self.addEventListener("message", (event) => {
  if (event.data?.type === "CLEAR_CACHES") {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))),
    );
  }
});
