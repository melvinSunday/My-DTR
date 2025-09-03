const CACHE_NAME = "dtr-cache-v2";
const STATIC_CACHE = "dtr-static-v2";
const DYNAMIC_CACHE = "dtr-dynamic-v2";

// Essential files for offline functionality
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/mydtr.jpg",
  "/mydtr.ico",
  "/_next/static/css/app/layout.css",
  "/_next/static/css/app/globals.css",
];

// Network-first resources (for dynamic content)
const NETWORK_FIRST = ["/api/"];

// Cache-first resources (for static assets)
const CACHE_FIRST = [
  "/_next/static/",
  "/static/",
  ".js",
  ".css",
  ".woff2",
  ".woff",
  ".ttf",
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webp",
];

self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker");
  event.waitUntil(
    (async () => {
      try {
        const staticCache = await caches.open(STATIC_CACHE);

        // Cache essential static assets
        await staticCache.addAll(
          STATIC_ASSETS.map((url) => {
            return new Request(url, { cache: "reload" });
          })
        );

        console.log("[SW] Static assets cached");

        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error("[SW] Failed to cache static assets:", error);
      }
    })()
  );
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker");
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(
        (name) =>
          name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== CACHE_NAME
      );

      await Promise.all(
        oldCaches.map((name) => {
          console.log("[SW] Deleting old cache:", name);
          return caches.delete(name);
        })
      );

      // Take control of all clients immediately
      await self.clients.claim();
      console.log("[SW] Service worker activated and claimed clients");
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) return;

  // Handle navigation requests (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle API requests with network-first strategy
  if (NETWORK_FIRST.some((pattern) => url.pathname.startsWith(pattern))) {
    event.respondWith(handleNetworkFirst(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (
    CACHE_FIRST.some(
      (pattern) =>
        url.pathname.includes(pattern) || url.pathname.endsWith(pattern)
    )
  ) {
    event.respondWith(handleCacheFirst(request));
    return;
  }

  // Default: stale-while-revalidate for other requests
  event.respondWith(handleStaleWhileRevalidate(request));
});

// Navigation requests: Network first, fallback to cache, then offline page
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed for navigation, trying cache");

    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to root page for SPA routing
    const rootResponse = await caches.match("/");
    if (rootResponse) {
      return rootResponse;
    }

    // Last resort: return a basic offline page
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>DTR App - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              text-align: center; 
              padding: 2rem; 
              background: #f9fafb;
              color: #374151;
            }
            .container { max-width: 400px; margin: 0 auto; }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
            h1 { color: #8C1007; margin-bottom: 1rem; }
            p { margin-bottom: 1.5rem; line-height: 1.6; }
            button { 
              background: #8C1007; 
              color: white; 
              border: none; 
              padding: 0.75rem 1.5rem; 
              border-radius: 0.5rem; 
              cursor: pointer;
              font-size: 1rem;
            }
            button:hover { background: #7c0f06; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📱</div>
            <h1>DTR App</h1>
            <p>You're currently offline, but your DTR data is safely stored locally.</p>
            <p>The app will sync when you're back online.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>`,
      {
        headers: { "Content-Type": "text/html" },
        status: 200,
      }
    );
  }
}

// Network-first strategy for API calls
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed, trying cache for:", request.url);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Cache-first strategy for static assets
async function handleCacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Update cache in background
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const cache = caches.open(STATIC_CACHE);
          cache.then((c) => c.put(request, response));
        }
      })
      .catch(() => {
        // Ignore network errors for background updates
      });

    return cachedResponse;
  }

  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[SW] Failed to fetch static asset:", request.url);
    throw error;
  }
}

// Stale-while-revalidate strategy
async function handleStaleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const cache = caches.open(DYNAMIC_CACHE);
        cache.then((c) => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => {
      // Return cached response if network fails
      return cachedResponse;
    });

  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Handle background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag);

  if (event.tag === "dtr-sync") {
    event.waitUntil(syncDTRData());
  }
});

// Sync DTR data when back online
async function syncDTRData() {
  try {
    // This would typically sync with your backend
    // For now, we'll just log that sync is happening
    console.log("[SW] Syncing DTR data...");

    // You can implement actual sync logic here
    // For example, send pending changes to server

    return Promise.resolve();
  } catch (error) {
    console.error("[SW] Sync failed:", error);
    throw error;
  }
}

// Handle push notifications (for future use)
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || "DTR App notification",
    icon: "/mydtr.jpg",
    badge: "/mydtr.ico",
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "DTR App", options)
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
});

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] Received SKIP_WAITING message");
    self.skipWaiting();
  }
});
