const CACHE_NAME = "portfolio-cache-v9";

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
  self.skipWaiting(); // Forces the waiting service worker to become the active one
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
      // Start the network request to update the cache
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache the new version if it's valid
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback if network fails and item isn't in cache
        return caches.match("./index.html");
      });

      // Return cached version immediately if we have it, else return the network request
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
