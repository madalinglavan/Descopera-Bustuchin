/* Only the local reading shell is cached; maps, audio and video stay online. */
const CACHE = "bustuchin-reading-v12";
const ROOT = new URL("./", self.location.href);
const SHELL = ["index.html", "style.css", "script.js", "pwa.js", "manifest.webmanifest", "css/01-foundation-components.css", "css/02-map.css", "css/03-editorial-chapters.css", "css/04-responsive.css", "css/05-refinements.css", "css/06-install.css", "css/07-photography.css", "css/08-reading-accessibility.css", "js/content-status.js", "js/search.js", "js/galleries.js", "js/audio.js", "js/map.js", "js/weather.js", "js/reading.js", "js/materials.js", "vendor/leaflet/leaflet.css", "vendor/leaflet/leaflet.js", "vendor/leaflet/images/layers.png", "vendor/leaflet/images/layers-2x.png", "vendor/leaflet/images/marker-icon.png", "vendor/leaflet/images/marker-icon-2x.png", "vendor/leaflet/images/marker-shadow.png", "data/bustuchin-boundary.geojson", "img/logo.png", "img/app-icon-180.png", "img/app-icon-192.png", "img/app-icon-512.png"].map(path => new URL(path, ROOT).href);
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("bustuchin-reading-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== ROOT.origin || !url.href.startsWith(ROOT.href)) return;
  if (!SHELL.includes(url.href) && !(request.mode === "navigate" && (url.pathname === ROOT.pathname || url.pathname === new URL("index.html", ROOT).pathname))) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === "navigate") {
        const page = await cache.match(new URL("index.html", ROOT).href);
        if (page) return page;
      }
      throw error;
    }
  })());
});
