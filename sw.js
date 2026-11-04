/* Roselle service worker */
const VERSION = 'roselle-v2';
const SHELL = `${VERSION}-shell`;
const MEDIA = `${VERSION}-media`;

/* App shell — precached so the UI opens offline */
const SHELL_FILES = [
  '/', '/index.html', '/offline.html', '/manifest.json',
  '/css/app.css', '/js/app.js', '/js/icons.js', '/js/supabase-client.js',
  '/images/logo.png',
  '/images/taif-rose.jpg', '/images/taif-rose-2.jpg', '/images/taif-rose-3.jpg',
  '/images/full-jasmine.jpg', '/images/rayhan.jpg', '/images/bougainvillea.jpg',
  '/icons/icon-192.png', '/icons/icon-512-any.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL)
      .then(c => Promise.allSettled(SHELL_FILES.map(f => c.add(f))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  /* Never cache the API: orders, carts and customer records must always be
     live, and caching them would leave personal data on the device. */
  if (url.hostname.endsWith('supabase.co')) return;

  /* Navigations: network first, fall back to the cached shell, then offline. */
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then(res => {
          caches.open(SHELL).then(c => c.put('/index.html', res.clone())).catch(() => {});
          return res;
        })
        .catch(() => caches.match('/index.html').then(r => r || caches.match('/offline.html')))
    );
    return;
  }

  /* Images: cache first, then network. */
  if (request.destination === 'image') {
    e.respondWith(
      caches.match(request).then(hit => hit || fetch(request).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(MEDIA).then(c => c.put(request, copy)).catch(() => {});
        }
        return res;
      }).catch(() => Response.error()))
    );
    return;
  }

  /* Everything else (css/js/fonts): cache first with background refresh. */
  e.respondWith(
    caches.match(request).then(hit => {
      const net = fetch(request).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(SHELL).then(c => c.put(request, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
