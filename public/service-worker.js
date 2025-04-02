const CACHE_NAME = 'bravo-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/Logo.png',
  '/background.jpg',
  '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
  // Ignorar requisições de extensões do Chrome
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retorna a resposta do cache
        if (response) {
          return response;
        }

        // Clone da requisição
        const fetchRequest = event.request.clone();

        // Faz a requisição à rede
        return fetch(fetchRequest).then(response => {
          // Verifica se recebemos uma resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone da resposta
          const responseToCache = response.clone();

          // Adiciona a resposta ao cache
          caches.open(CACHE_NAME)
            .then(cache => {
              // Não fazer cache de requisições de extensões
              if (!event.request.url.startsWith('chrome-extension://')) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        });
      })
  );
}); 