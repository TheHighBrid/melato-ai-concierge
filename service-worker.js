const CACHE = 'melato-ai-concierge-v1';
const ASSETS = [
  './',
  './index.html',
  './assets/app.css',
  './assets/app.js',
  './embed/melato-concierge-widget.js',
  './manifest.webmanifest',
  './assets/icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
