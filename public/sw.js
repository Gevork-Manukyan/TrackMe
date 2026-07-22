/* TrackMe service worker.
 *
 * Pages now render their data from IndexedDB rather than from server-rendered
 * HTML, so the HTML is a user-agnostic shell and is finally safe to cache — the
 * reason Phase 3 refused to. Caching it is also what makes an offline launch
 * work at all: without it a cold navigation falls through to /offline even
 * though the data is sitting in IndexedDB.
 */

const VERSION = "trackme-v2";
const STATIC_CACHE = `${VERSION}-static`;
const SHELL_CACHE = `${VERSION}-shell`;

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

  // Sync must always reach the network. A cached response here would make the
  // client believe it had reconciled when it had not.
  if (url.pathname.startsWith("/api/")) return;

  // Page loads: network first so a fresh shell (and any redirect to /login) wins
  // when online. Offline, fall back to the cached shell — the page then renders
  // the user's lists from IndexedDB. Only if we have never cached this route do
  // we show the offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache real pages. Redirects (e.g. to /login) must not be stored,
          // or a signed-in visitor could be bounced by a stale cached redirect.
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
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
