// Service worker unificado — cache (PWA shell) + FCM (push notifications).
// Registado em /sw.js a partir do index.html.

// ───── FCM background ──────────────────────────────────────────────────
// Tem de ser importado antes de qualquer outro código para apanhar messages.
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBGQGSSGthbIMUxHDefwWlarNR7c_Vjd3E",
  authDomain: "psicomotriclinic-app.firebaseapp.com",
  projectId: "psicomotriclinic-app",
  storageBucket: "psicomotriclinic-app.firebasestorage.app",
  messagingSenderId: "114979101363",
  appId: "1:114979101363:web:7e66962c231e12a66c2ec6",
});

const messaging = firebase.messaging();

// Recebe push quando a app está em background (ou separador inactivo).
messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = data.title || "Psicomotriclinic";
  const body = data.body || "";
  const url = data.url || "/";

  self.registration.showNotification(title, {
    body,
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: data.tag || "psm-notif",
    data: { url, ...data },
    requireInteraction: false,
  });
});

// Toque na notificação → abre/foca a app no URL alvo.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const sameOrigin = clients.find((c) => c.url.startsWith(self.location.origin));
    if (sameOrigin) {
      await sameOrigin.focus();
      sameOrigin.postMessage({ type: "navigate", url });
    } else {
      await self.clients.openWindow(url);
    }
  })());
});

// ───── Cache da shell PWA ──────────────────────────────────────────────
const CACHE_VERSION = "v3";
const CACHE_NAME = `psm-shell-${CACHE_VERSION}`;
const SHELL_URL = "/";

self.addEventListener("install", (event) => {
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
  if (url.origin !== self.location.origin) return; // ignora cross-origin

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(req));
    return;
  }
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }
});

// Assets são content-hashed (imutáveis) → cache-first. Limitamos o número de
// entradas para o cache não crescer sem limite através de vários deploys
// (hashes antigos acumulam-se). Prune simples FIFO acima de MAX_ASSET_ENTRIES.
const MAX_ASSET_ENTRIES = 80;
async function trimCache(cache) {
  const keys = await cache.keys();
  const assetKeys = keys.filter((r) => new URL(r.url).pathname.startsWith("/assets/"));
  if (assetKeys.length <= MAX_ASSET_ENTRIES) return;
  const excess = assetKeys.length - MAX_ASSET_ENTRIES;
  for (let i = 0; i < excess; i++) await cache.delete(assetKeys[i]);
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && res.ok) { await cache.put(req, res.clone()); trimCache(cache); }
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
