const BASE_CACHE = "drills-pwa";
const CORE_ASSETS = [
  "index.html",
  "drill.html",
  "styles.css",
  "app.js",
  "drill.js",
  "drills.json",
  "manifest.webmanifest",
  "version.json",
  "assets/icon-192.png",
  "assets/icon-512.png"
];


// This will be set during install/activate
let CACHE_NAME = `${BASE_CACHE}-0.0.0`;

async function readVersion() {
  // IMPORTANT: do not use no-store here; we only read at install/activate
  const res = await fetch("version.json");
  const data = await res.json();
  return data.version || "0.0.0";
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const version = await readVersion();
    CACHE_NAME = `${BASE_CACHE}-${version}`;

    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);

    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // Re-read version on activate so the expected cache aligns with latest deploy
    const version = await readVersion();
    CACHE_NAME = `${BASE_CACHE}-${version}`;

    const keys = await caches.keys();
    await Promise.all(
      keys.map(k => (k.startsWith(`${BASE_CACHE}-`) && k !== CACHE_NAME) ? caches.delete(k) : null)
    );

    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Same-origin only
  if (url.origin !== self.location.origin) return;

  // Prevent recursion / oddness: always go to network for version.json
  if (url.pathname.endsWith("/version.json") || url.pathname.endsWith("version.json")) {
    event.respondWith(fetch(req));
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    const cached = await cache.match(req);
    if (cached) return cached;

    const res = await fetch(req);

    // Cache successful GETs (e.g., assets/*.gif)
    if (req.method === "GET" && res.ok) {
      cache.put(req, res.clone());
    }

    return res;
  })());
});
