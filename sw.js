const CACHE = 'nexo-static-v57';
const FILES = [
  './', './index.html', './src/traveller/styles.css?v=52', './src/traveller/app.js?v=50', './src/traveller/traveller-index.js?v=38', './src/traveller/traveller-pdf.js?v=38', './src/traveller/hangar.js?v=38', './src/traveller/characters.js?v=2', './src/vampiro/vampire.js?v=3', './src/vampiro/vampire.css?v=3', './src/dnd/dnd-progresion.js?v=1', './src/dnd/dnd.js?v=3', './src/dnd/dnd.css?v=3', './src/nexo/terminal-shell.js?v=41', './src/nexo/terminal-shell.css?v=1', './manifest.webmanifest', './assets/fondos/nexo-bridge-background.jpg', './assets/fondos/nexo-home-planet.jpg',
  './assets/iconos/icon.svg', './assets/iconos/icon-192.png', './assets/iconos/icon-512.png'
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
