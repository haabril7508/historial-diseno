/* Registro del service worker (instalación como app en iOS/Android).
   Solo se registra sobre https:// o localhost — el navegador lo exige. */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function (e) {
      console.warn('Service worker no registrado:', e.message);
    });
  });
}
