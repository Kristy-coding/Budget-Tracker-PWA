const APP_PREFIX = 'Budget_Tracker-';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;


const FILES_TO_CACHE = [
  '/',
  './index.html',
  './manifest.json',
   './js/index.js',
   './js/idb.js',
   './css/styles.css',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png'
];

// // Install the service worker
// self.addEventListener('install', function(evt) {
//   evt.waitUntil(
//     caches.open(CACHE_NAME).then(cache => {
//       console.log('Your files were pre-cached successfully!');
//       return cache.addAll(FILES_TO_CACHE);
//     })
//   );

//   self.skipWaiting();
// });

// // Activate the service worker and remove old data from the cache
// //In the activation step, we clear out any old data from the cache and, in the same step, tell the service worker how to manage caches.
// self.addEventListener('activate', function(evt) {
//   evt.waitUntil(
//     caches.keys().then(keyList => {
//       return Promise.all(
//         keyList.map(key => {
//           if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
//             console.log('Removing old cache data', key);
//             return caches.delete(key);
//           }
//         })
//       );
//     })
//   );

//   self.clients.claim();
// });

// // Intercept fetch requests
// // For offline functionality, we'll tell the browser to check the cache when there's no network connection
// //Here, we listen for the fetch event, log the URL of the requested resource, and then begin to define how we will respond to the request.

// //Notice that we're using a method on the event object called respondWith to intercept the fetch request. In the code that we'll be writing next, the following lines will check to see if the request is stored in the cache or not. If it is stored in the cache, e.respondWith will deliver the resource directly from the cache; otherwise the resource will be retrieved normally.

// //First, we use .match() to determine if the resource already exists in caches. If it does, we'll log the URL to the console with a message and then return the cached resource, using the following code:

// self.addEventListener('fetch', function(evt) {
//   if (evt.request.url.includes('/api/')) {
//     evt.respondWith(
//       caches
//         .open(DATA_CACHE_NAME)
//         .then(cache => {
//           return fetch(evt.request)
//             .then(response => {
//               // If the response was good, clone it and store it in the cache.
//               if (response.status === 200) {
//                 cache.put(evt.request.url, response.clone());
//               }

//               return response;
//             })
//             .catch(err => {
//               // Network request failed, try to get it from the cache.
//               return cache.match(evt.request);
//             });
//         })
//         .catch(err => console.log(err))
//     );

//     return;
//   }

//   evt.respondWith(
//     fetch(evt.request).catch(function() {
//       return caches.match(evt.request).then(function(response) {
//         if (response) {
//           return response;
//         } else if (evt.request.headers.get('accept').includes('text/html')) {
//           // return the cached home page for all requests for html pages
//           return caches.match('/');
//         }
//       });
//     })
//   );
// });










//Install the service worker
self.addEventListener('install', function(evt) {
    evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log('Your files were pre-cached successfully!');
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });
  
  // Activate the service worker and remove old data from the cache
  self.addEventListener('activate', function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log('Removing old cache data', key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  
  // Intercept fetch requests
  self.addEventListener('fetch', function(evt) {
    if (evt.request.url.includes('/api/')) {
      evt.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then(cache => {
            return fetch(evt.request)
              .then(response => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
                }
  
                return response;
              })
              .catch(err => {
                // Network request failed, try to get it from the cache.
                return cache.match(evt.request);
              });
          })
          .catch(err => console.log(err))
      );
  
      return;
    }
  
    evt.respondWith(
      fetch(evt.request).catch(function() {
        return caches.match(evt.request).then(function(response) {
          if (response) {
            return response;
          } else if (evt.request.headers.get('accept').includes('text/html')) {
            // return the cached home page for all requests for html pages
            return caches.match('/');
          }
        });
      })
    );
  });