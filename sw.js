const CACHE = 'gas-tracker-v2';

// Skip Firebase, CDN scripts, and external APIs — cache only same-origin assets
const SKIP = [
  'firebaseio.com', 'googleapis.com', 'gstatic.com',
  'cloudflare', 'tailwindcss.com', 'cdnjs.cloudflare.com'
];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (SKIP.some(s => e.request.url.includes(s))) return;

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const fresh = fetch(e.request).then(res => {
          if (res && res.status === 200 && res.type === 'basic') {
            cache.put(e.request, res.clone());
          }
          return res;
        }).catch(() => cached);
        return cached || fresh;
      })
    )
  );
});
