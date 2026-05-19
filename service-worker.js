// Self-destruct service worker.
// Replaces any previously installed SW for this origin: unregisters itself,
// clears all CacheStorage, then asks every controlled page to hard-reload.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (_) {}
    try { await self.registration.unregister(); } catch (_) {}
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    for (const c of clients) {
      try { c.navigate(c.url); } catch (_) {}
    }
  })());
});

// Never serve anything from cache — always fall through to network.
self.addEventListener('fetch', (event) => {});
