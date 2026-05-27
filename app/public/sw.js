// Service worker simples — install/activate + estratégias separadas:
// - HTML (navegação): network-first, com fallback ao index cacheado se offline
// - JS/CSS/imagens com hash em /assets/: cache-first (são imutáveis com Vite)
// - Restantes: pass-through
//
// O CACHE_NAME é versionado pela data de build (injectada em "%BUILD_DATE%"
// no Vite via plugin? — não temos plugin. Em alternativa, basta bumpar a
// constante abaixo quando o shell mudar significativamente). O cache antigo
// é apagado em activate.

const CACHE_VERSION = "v1";
const CACHE_NAME = `psm-shell-${CACHE_VERSION}`;
const SHELL_URL = "/";

self.addEventListener("install", (event) => {
  // Pré-cache do shell HTML para fallback offline
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(SHELL_URL)).catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Ignorar cross-origin (firebase, google fonts, etc.) — deixar passar
  if (url.origin !== self.location.origin) return;

  // Assets com hash de Vite — cache-first imutável
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Navegação (HTML) — network-first, fallback ao shell cacheado
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }
});

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (_) {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(SHELL_URL, res.clone());
    return res;
  } catch (_) {
    const shell = await cache.match(SHELL_URL);
    return shell || new Response("Offline", { status: 503 });
  }
}
