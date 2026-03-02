const CACHE_NAME = 'notdeer-v2.0';
const RUNTIME_CACHE = 'notdeer-runtime-v2';
const AUDIO_CACHE = 'notdeer-audio-v2';
const IMAGE_CACHE = 'notdeer-images-v2';

// Archivos esenciales para offline
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalar y cachear archivos esenciales
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching essential files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Activar y limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE && 
              cacheName !== AUDIO_CACHE &&
              cacheName !== IMAGE_CACHE) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Estrategia de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API requests to backend
  if (url.hostname.includes('estudente.onrender.com') || 
      url.hostname.includes('groq.com')) {
    return;
  }

  // Estrategia para diferentes tipos de recursos
  if (request.destination === 'audio' || url.pathname.includes('audio')) {
    // Audio: Cache First (para reproducción offline)
    event.respondWith(cacheFirst(request, AUDIO_CACHE));
  } else if (request.destination === 'image' || 
             url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)) {
    // Images: Cache First
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (request.destination === 'script' || 
             request.destination === 'style' || 
             request.destination === 'font' ||
             request.destination === 'manifest') {
    // Assets estáticos: Cache First con Network Fallback
    event.respondWith(cacheFirst(request, CACHE_NAME));
  } else if (request.destination === 'document') {
    // HTML: Network First con Cache Fallback
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
  } else {
    // Otros: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
  }
});

// Cache First: Intenta cache primero, luego red
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      // Return cached and update in background
      fetchAndCache(request, cacheName);
      return cached;
    }
    
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Cache First error:', error);
    // Try to return cached version
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    
    // Return offline page for documents
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    throw error;
  }
}

// Network First: Intenta red primero, luego cache
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('Network First: Falling back to cache');
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    
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
    if (response.ok && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}

// Helper: Fetch and cache in background
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
  } catch (error) {
    // Silently fail
  }
}

// Limpiar cache de audio antiguo (más de 7 días)
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'cleanAudioCache') {
    event.waitUntil(cleanOldAudioCache());
  }
  
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

async function cleanOldAudioCache() {
  try {
    const cache = await caches.open(AUDIO_CACHE);
    const requests = await cache.keys();
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
    
    let deletedCount = 0;
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const age = now - new Date(dateHeader).getTime();
          if (age > maxAge) {
            await cache.delete(request);
            deletedCount++;
          }
        }
      }
    }
    console.log(`🗑️ Cleaned ${deletedCount} old audio files from cache`);
  } catch (error) {
    console.error('Error cleaning audio cache:', error);
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background Sync:', event.tag);
  if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});

async function syncNotes() {
  // Implement sync logic here
  console.log('📝 Syncing notes...');
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Notdeer';
  const options = {
    body: data.body || 'Nueva notificación',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Cerrar' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data || '/';
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});

console.log('✅ Service Worker loaded successfully');
