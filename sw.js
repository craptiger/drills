const BASE_CACHE = "drills-pwa";
const CORE_ASSETS = [
  "index.html",
  "drill.html",
  "styles.css",
  "app.js",
  "drill.js",
  "drills.json",
  "manifest.webmanifest",
  "version.json"
];

async function getVersion() {
  const res = await fetch("version.json", { cache: "no-store" });
  const data = await res.json();
  return data.version || "0.0.0";
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const version = await getVersion();
    const cacheName = `${BASE_CACHE}-${version}`;

    const cache = await caches.open(cacheName);
    await cache.addAll(CORE_ASSETS);

    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const version = await getVersion();
    const expected = `${BASE_CACHE}-${version}`;

    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k === expected ? null : caches.delete(k))));

    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // same-origin only
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const version = await getVersion();
    const cacheName = `${BASE_CACHE}-${version}`;
    const cache = await caches.open(cacheName);

    const cached = await cache.match(req);
    if (cached) return cached;

    const res = await fetch(req);

    // Runtime cache successful GETs (e.g., assets/*.gif)
    if (req.method === "GET" && res.ok) {
      cache.put(req, res.clone());
    }

    return res;
  })());
});
