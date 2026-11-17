// The offline cache: every site file, kept under a versioned name. Change
// CACHE when any file changes, so the next visit installs the new set and
// activate clears the old one. A new version skips waiting and claims the
// open pages, so the next reload shows it without closing every window.
const CACHE = 'daylight-clock-v5';

const FILES = [
    './',
    'index.html',
    'about.html',
    'clock-core.js',
    'manifest.webmanifest',
    'icons/icon.svg',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then((names) =>
        Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name))))
        .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(caches.match(event.request).then((hit) => hit || fetch(event.request)));
});
