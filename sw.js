let CACHE_NAME = "drills-pwa";

self.addEventListener("install", event => {
  event.waitUntil((async () => {

    const res = await fetch("version.json");
    const { version } = await res.json();

    CACHE_NAME = `drills-pwa-${version}`;

    const cache = await caches.open(CACHE_NAME);

    await cache.addAll([
      "index.html",
      "drill.html",
      "styles.css",
      "app.js",
      "drill.js",
      "drills.json",
      "manifest.webmanifest",
      "version.json"
    ]);

    self.skipWaiting();

  })());
});

const CORE_ASSETS = [
  "index.html",
  "drill.html",
  "styles.css",
  "app.js",
  "drill.js",
  "drills.json",
  "manifest.webmanifest"
];

// Install: cache core shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for same-origin assets, with runtime caching for GIFs
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;

    const res = await fetch(req);
    // Cache successful GETs (e.g., assets/*.gif)
    if (req.method === "GET" && res.ok) cache.put(req, res.clone());
    return res;
  })());
});
