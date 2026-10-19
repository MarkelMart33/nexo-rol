const CACHE = 'nexo-static-v44';
const FILES = [
  './', './index.html', './styles.css?v=41', './app.js?v=40', './traveller-index.js?v=38', './traveller-pdf.js?v=38', './hangar.js?v=38', './characters.js?v=2', './terminal-shell.js?v=41', './terminal-shell.css?v=1', './vampire.js?v=1', './vampire.css?v=1', './dnd.js?v=1', './dnd.css?v=1', './manifest.webmanifest',
  './icon.svg', './icon-192.png', './icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then(cached => {
    if (cached) return cached;
    return fetch(request).then(response => {
      if (response.ok) caches.open(CACHE).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(() => request.mode === 'navigate' ? caches.match('./index.html') : Response.error());
  }));
});
