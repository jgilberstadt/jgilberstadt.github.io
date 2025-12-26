const CACHE_NAME = "portfolio-cache-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/assets/css/style.css",
  "/assets/js/menu.js",
  "/partials/header.html",
  "/partials/footer.html",
  "/manifest.json"
];

// Install the Service Worker and cache files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Serve cached content when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
