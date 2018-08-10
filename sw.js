/*
This is a modified version of Ethan Marcotte's service worker (https://ethanmarcotte.com/theworkerofservices.js),
which is in turn a modified version of Jeremy Keith's service worker (https://adactio.com/serviceworker.js),
with a few additional edits borrowed from Filament Group's. (https://www.filamentgroup.com/sw.js)
*/

(function() {
  const version = 'v1';
  const cacheName = ':countdown:';

  const staticCacheName = version + cacheName + 'static';

  const staticAssets = [
    '/',
    '/countdown.mp3'
  ];

  function updateStaticCache() {
    return caches.open(staticCacheName)
    .then(cache => {
      return cache.addAll(staticAssets.map(url => new Request(url, {credentials: 'include'})));
    });
  }

  function trimCache(cacheName, maxItems) {
    caches.open(cacheName)
    .then(cache => {
      cache.keys()
      .then(keys => {
        if (keys.length > maxItems) {
          cache.delete(keys[ 0 ])
          .then(trimCache(cacheName, maxItems));
        }
      });
    });
  }

  function clearOldCaches() {
    return caches.keys()
    .then(keys => {
      return Promise.all(keys
        .filter(key => key.indexOf(version) !== 0)
        .map(key => caches.delete(key))
       );
    });
  }

  self.addEventListener('install', event => {
    event.waitUntil(updateStaticCache()
      .then(() => self.skipWaiting())
     );
  });

  self.addEventListener('activate', event => {
    event.waitUntil(clearOldCaches()
      .then(() => self.clients.claim())
     );
  });

  self.addEventListener('fetch', event => {
    const request = event.request;
    event.respondWith(
      caches.match(request)
        .then(res => {
          return res || fetch(request)
            .then(res => res)
            .catch(console.error);
        })
    );
  });
})();