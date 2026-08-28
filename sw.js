/* ====================================================================
   Service worker — permite instalar la app y abrirla sin conexión.
   --------------------------------------------------------------------
   Estrategia:
     - Archivos propios de la app: se guardan en caché al instalar y se
       sirven desde ahí, pero se refrescan en segundo plano.
     - Google (login, APIs de Drive) y todo lo que no sea GET: nunca se
       cachea, siempre va a la red. Cachear tokens o respuestas de la
       API sería incorrecto y peligroso.
   Al cambiar archivos de la app, sube el número de VERSION para que los
   dispositivos recojan la versión nueva.
   ==================================================================== */

const VERSION = 'v2';
const CACHE = 'historial-diseno-' + VERSION;

const ARCHIVOS = [
  './',
  './index.html',
  './styles.css',
  './config.js',
  './storage.js',
  './xlsxpatch.js',
  './drive.js',
  './template.js',
  './app.js',
  './register-sw.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(
        claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Nada de Google pasa por caché: login, tokens y llamadas a Drive
  // deben ir siempre a la red.
  if (/(^|\.)google(apis)?\.com$/.test(url.hostname) ||
      url.hostname === 'accounts.google.com' ||
      url.hostname === 'apis.google.com') {
    return;
  }

  // Solo cacheamos lo que vive en el mismo origen que la app.
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then((cacheada) => {
      const red = fetch(req).then((resp) => {
        if (resp && resp.ok) {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, copia));
        }
        return resp;
      }).catch(() => cacheada);
      return cacheada || red;
    })
  );
});
