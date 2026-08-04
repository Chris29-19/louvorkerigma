const CACHE_NAME = 'louvorapp-v9';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './css/variables.css',
    './css/layout.css',
    './css/components.css',
    './js/app.js',
    './js/controllers/MainController.js',
    './js/models/SongModel.js',
    './js/views/HomeView.js',
    './js/views/SongFormView.js',
    './js/db/firebase.js',
    './js/utils/helpers.js',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://unpkg.com/@phosphor-icons/web'
];

// Instalação: cacheia os arquivos e ativa imediatamente
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting()) // Ativa imediatamente sem fechar a aba
    );
});

// Ativação: limpa caches antigos e toma controle imediato de todas as abas
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            ))
            .then(() => self.clients.claim()) // Controla abas abertas sem precisar de F5
    );
});

// Interceptador: Stale While Revalidate para HTML (navegação)
// Network First para assets locais (JS, CSS)
// Cache First para fontes/ícones externos
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    const isLocalAsset = url.origin === self.location.origin;
    const isNavigation = event.request.mode === 'navigate';
    const isAsset = event.request.destination === 'script' || 
                    event.request.destination === 'style' ||
                    event.request.destination === 'image' ||
                    event.request.destination === 'font';

    if (isNavigation) {
        // NAVIGATION (HTML): Network First with cache fallback
        // Always try network first for fresh HTML on F5
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        const clone = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(event.request))
        );
    } else if (isLocalAsset && isAsset) {
        // LOCAL ASSETS (JS, CSS, images): Stale While Revalidate
        // Serve from cache immediately, update in background
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                    return cachedResponse || fetchPromise;
                });
            })
        );
    } else if (isLocalAsset) {
        // OTHER LOCAL (JSON, etc): Network First
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        const clone = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(event.request))
        );
    } else {
        // EXTERNAL (fonts, icons): Cache First
        event.respondWith(
            caches.match(event.request)
                .then(cached => cached || fetch(event.request))
        );
    }
});
