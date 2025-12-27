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
  "./assets/images/Stocks.jpeg",
  "./assets/files/Resume_Josh_Gilberstadt_Website.pdf"
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
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Update the cache with the new version from the network
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      });

      // Return the cached version immediately, or wait for the network if not cached
      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Clearing Old Cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
