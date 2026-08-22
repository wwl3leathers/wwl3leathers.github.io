"use strict";
const BASE_URL = new URL("./", self.location.href);
const SCOPE_KEY = new URL(self.registration.scope).pathname.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root";
const CACHE_PREFIX = `talvaren-studios-${SCOPE_KEY}-`;
const CACHE_NAME = `${CACHE_PREFIX}r45`;
const scopedUrl = path => new URL(path, BASE_URL).href;
const CORE = [
  "", "index.html", "404.html", "manifest.webmanifest",
  "css/base.css?v=20260821-1", "css/shell.css", "css/responsive.css?v=20260814-1",
  "css/components/navigation.css", "css/components/documents.css?v=20260814-1", "css/components/media.css", "css/components/viewer.css",
  "js/navigation.js?v=20260821-3", "js/site-shell.js?v=20260821-2", "js/components/modal-viewer.js",
  "data/navigation.json",
  "images/branding/Logo-min.PNG", "images/branding/Talvaren_Banner.PNG", "images/wallpaper/Talvaren_Wallpaper.PNG"
].map(scopedUrl);
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || (event.request.mode === "navigate" ? caches.match(scopedUrl("index.html")) : Response.error()))));
});
