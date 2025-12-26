const CACHE_NAME = "portfolio-cache-v2";

// Add all your new icon files here so they work offline
const ASSETS = [
  "./",
  "./index.html",
  "./projects.html",
  "./contact.html",
  "./assets/css/style.css",
  "./assets/js/menu.js",
  "./partials/header.html",
  "./partials/footer.html",
  "./manifest.json",
  
  // Icons
  "./assets/images/favicon.svg",
  "./assets/icons/favicon.ico",
  "./assets/icons/favicon-32x32.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",

  // Local Images
  "./assets/images/Josh_Gilberstadt_Image.jpeg",
  "./assets/images/Blood_samples.jpeg",
  "./assets/images/Brain.jpeg",
  "./assets/images/Personal_website_template.jpg",
  "./assets/images/Stocks.jpeg"
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
      // Return cached version, or fetch from network
      return response || fetch(event.request);
    })
  );
});
