const CACHE = 'nexo-static-v76';
const FILES = [
  './', './index.html', './src/traveller/styles.css?v=54', './supabase/cloud-config.js?v=2', './src/nexo/cloud-sync.js?v=6', './src/traveller/app.js?v=54', './src/traveller/traveller-index.js?v=38', './src/traveller/traveller-pdf.js?v=38', './src/traveller/hangar.js?v=38', './src/traveller/characters.js?v=4', './src/vampiro/vampire.js?v=9', './src/vampiro/vampire.css?v=5', './src/vampiro/vampire-mesa.css?v=1', './src/dnd/dnd-progresion.js?v=1', './src/dnd/dnd.js?v=9', './src/dnd/dnd.css?v=5', './src/tormentas/tormentas.js?v=3', './src/tormentas/tormentas.css?v=1', './src/tormentas/tormentas-mesa.css?v=2', './src/cthulhu/cthulhu.js?v=3', './src/cthulhu/cthulhu.css?v=1', './src/cthulhu/cthulhu-mesa.css?v=1', './src/pathfinder/pathfinder.js?v=3', './src/pathfinder/pathfinder.css?v=1', './src/pathfinder/pathfinder-mesa.css?v=1', './src/nexo/profile.js?v=7', './src/nexo/profile.css?v=6', './src/nexo/terminal-shell.js?v=53', './src/nexo/terminal-shell.css?v=1', './src/nexo/nexo.css?v=2', './src/nexo/mesa.css?v=4', './src/nexo/icons.js?v=4', './src/nexo/dice.js?v=2', './src/nexo/dice.css?v=2', './src/nexo/apartados.css?v=1', './src/nexo/apartados.js?v=1', './src/traveller/traveller-manual.js?v=1', './src/traveller/traveller-apartados.js?v=1', './src/vampiro/vampiro-manual-reglas.js?v=1', './src/vampiro/vampiro-manual.js?v=2', './src/dnd/dnd-manual-reglas.js?v=1', './src/dnd/dnd-manual.js?v=2', './src/tormentas/tormentas-manual-reglas.js?v=1', './src/tormentas/tormentas-manual.js?v=2', './src/cthulhu/cthulhu-manual-reglas.js?v=1', './src/cthulhu/cthulhu-manual.js?v=2', './src/pathfinder/pathfinder-manual-reglas.js?v=1', './src/pathfinder/pathfinder-manual.js?v=2', './manifest.webmanifest', './assets/fondos/nexo-bridge-background.jpg', './assets/fondos/nexo-home-planet.jpg',
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
