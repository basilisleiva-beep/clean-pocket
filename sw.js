// Clean Pocket service worker. Cache-first for the app shell, network-only for open-meteo,
// cache-first (runtime, opaque responses allowed) for the Google Fonts CSS + font files so the
// app still renders in Fira Sans/Fira Sans Condensed offline after the first online load.
// Bump CACHE_VERSION on every release; the app shows a refresh banner when a new one installs.
var CACHE_VERSION = "clean-pocket-v3.1.10";
var FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];
var SHELL = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/app.js",
  "./js/calc.js",
  "./js/csv.js",
  "./js/i18n.js",
  "./js/store.js",
  "./js/tax.js",
  "./manifest.webmanifest",
  "./privacy.html",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-180.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    // cache: "reload" skips the browser's HTTP cache (GitHub Pages sends max-age=600), otherwise a
    // new worker can precache stale files next to fresh ones and ship a mixed-version shell.
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(SHELL.map(function (u) { return new Request(u, { cache: "reload" }); }));
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("message", function (event) {
  if (event.data === "skipWaiting") self.skipWaiting();
});

function isFontRequest(url) {
  return FONT_HOSTS.some(function (h) { return url.indexOf(h) !== -1; });
}

self.addEventListener("fetch", function (event) {
  var url = event.request.url;
  if (url.indexOf("open-meteo.com") !== -1) return; // network-only, never cached
  if (event.request.method !== "GET") return;

  if (isFontRequest(url)) {
    // Cache-first: font CSS and font files rarely change and are cross-origin, so the response
    // is opaque (status 0) - cache it anyway, that is the only way to have fonts offline.
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        return fetch(event.request).then(function (resp) {
          if (resp) {
            var copy = resp.clone();
            caches.open(CACHE_VERSION).then(function (cache) { cache.put(event.request, copy); });
          }
          return resp;
        }).catch(function () { return cached; });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (resp) {
        if (resp && resp.status === 200 && resp.type === "basic") {
          var copy = resp.clone();
          caches.open(CACHE_VERSION).then(function (cache) { cache.put(event.request, copy); });
        }
        return resp;
      }).catch(function () { return cached; });
    })
  );
});
