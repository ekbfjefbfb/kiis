const CACHE_NAME = 'notdeer-v1.1';
const RUNTIME_CACHE = 'notdeer-runtime';
const AUDIO_CACHE = 'notdeer-audio';

// Archivos esenciales para offline
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// Instalar y cachear archivos esenciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activar y limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE && 
              cacheName !== AUDIO_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // Estrategia para diferentes tipos de recursos
  if (request.destination === 'audio' || url.pathname.includes('audio')) {
    // Audio: Cache First (para reproducción offline)
    event.respondWith(cacheFirst(request, AUDIO_CACHE));
  } else if (request.destination === 'script' || 
             request.destination === 'style' || 
             request.destination === 'font') {
    // Assets estáticos: Cache First con Network Fallback
    event.respondWith(cacheFirst(request, CACHE_NAME));
  } else if (request.destination === 'document' || 
             url.pathname.startsWith('/api/')) {
    // HTML y API: Network First con Cache Fallback
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
  } else {
    // Otros: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
  }
});

// Cache First: Intenta cache primero, luego red
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Si falla, devolver página offline si es HTML
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    throw error;
  }
}

// Network First: Intenta red primero, luego cache
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    // Fallback para documentos
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    throw error;
  }
}

// Stale While Revalidate: Devuelve cache y actualiza en background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}

// Limpiar cache de audio antiguo (más de 7 días)
self.addEventListener('message', (event) => {
  if (event.data.action === 'cleanAudioCache') {
    cleanOldAudioCache();
  }
});

async function cleanOldAudioCache() {
  const cache = await caches.open(AUDIO_CACHE);
  const requests = await cache.keys();
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
  
  for (const request of requests) {
    const response = await cache.match(request);
    const dateHeader = response.headers.get('date');
    if (dateHeader) {
      const age = now - new Date(dateHeader).getTime();
      if (age > maxAge) {
        await cache.delete(request);
      }
    }
  }
}
