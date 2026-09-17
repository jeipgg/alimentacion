// Sirve la app sin señal. Subir la versión obliga al teléfono a actualizarse.
const V = "alim-v2";
const SHELL = ["./", "index.html", "recetas.js", "manifest.webmanifest", "icono-180.png", "icono-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin === location.origin) {
    e.respondWith(fetch(req)
      .then(r => { const c = r.clone(); caches.open(V).then(k => k.put(req, c)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
  } else {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      const c = r.clone(); caches.open(V).then(k => k.put(req, c)); return r;
    }).catch(() => hit)));
  }
});
