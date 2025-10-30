const CACHE_NAME = 'brainandscalpel-v1';

// A list of all files to cache for offline use.
// We will cache the main pages and essential assets.
// Quiz files are loaded from the network first.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/bookmarks.html',
  '/performance.html',
  '/custom_quiz.html',
  '/custom_module.html',
  '/manifest.json',
  '/assets/background.jpg',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

// Install event: Fires when the service worker is first installed.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell...');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => {
        self.skipWaiting();
      })
  );
});

// Activate event: Fires when the service worker becomes active.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    // Clean up old caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Fires every time the app makes a network request.
self.addEventListener('fetch', (event) => {
  // We will use a "cache-first" strategy for our app shell files.
  // For all other requests (like quizzes), we'll go "network-first".

  const requestUrl = new URL(event.request.url);

  // Only cache requests for our own origin
  if (requestUrl.origin === location.origin) {
    // For HTML pages and our main assets, try cache first.
    if (URLS_TO_CACHE.includes(requestUrl.pathname)) {
      event.respondWith(
        caches.match(event.request).then((response) => {
          return response || fetch(event.request);
        })
      );
      return;
    }
  }

  // For all other requests (like quizzes, supabase, etc.), go network-first.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If the request is successful, cache it.
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Don't cache Supabase auth requests
        if (requestUrl.pathname.includes('/auth/v1/')) {
            return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // If the network fails, try to find a match in the cache.
        return caches.match(event.request);
      })
  );
});