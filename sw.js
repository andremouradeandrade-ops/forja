// Forja — service worker: funciona sem internet depois da primeira visita.
const CACHE = 'forja-v5';
const CORE = [
  './', './index.html', './styles.css', './app.js', './data.js', './manifest.webmanifest',
  './img/icon-192.png', './img/icon-512.png', './img/icon-maskable-512.png', './img/apple-touch-icon.png',
  './img/cat-peito.png', './img/cat-costas.png', './img/cat-ombros.png', './img/cat-bracos.png',
  './img/cat-pernas.png', './img/cat-abdomen.png', './img/cat-corrida.png',
  './img/ex-agachamento.png', './img/ex-legpress.png', './img/ex-extensora.png', './img/ex-stiff.png',
  './img/ex-mesaflexora.png', './img/ex-panturrilha.png', './img/ex-afundo.png', './img/ex-supino.png',
  './img/ex-crossover.png', './img/ex-crucifixo-maquina.png', './img/ex-encolhimento-halteres.png', './img/ex-flexao.png', './img/ex-hiperextensao.png', './img/ex-pulldown.png', './img/ex-puxada-frontal.png', './img/ex-remada-baixa.png', './img/ex-remada-curvada.png', './img/ex-supino-reto.png', './img/ex-triceps-corda.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !isFont) return;
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined));
      return hit || net;
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((list) => {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('./index.html');
  }));
});
