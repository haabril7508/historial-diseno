/* ====================================================================
   window.storage — reemplazo del API de almacenamiento del artifact
   --------------------------------------------------------------------
   El dashboard original corría dentro de Claude y usaba window.storage,
   que no existe en un navegador normal. Este shim mantiene la misma
   firma (get/set devuelven promesas, el segundo parámetro se ignora)
   pero guarda en localStorage del dispositivo.
   ==================================================================== */

(function () {
  if (window.storage && typeof window.storage.get === 'function') return;

  const PREFIX = 'hd:';

  window.storage = {
    async get(key) {
      try {
        const value = localStorage.getItem(PREFIX + key);
        return value === null ? null : { value };
      } catch (e) {
        console.error('storage.get', e);
        return null;
      }
    },

    async set(key, value) {
      try {
        localStorage.setItem(PREFIX + key, value);
        return true;
      } catch (e) {
        console.error('storage.set', e);
        throw e;
      }
    },

    async remove(key) {
      try { localStorage.removeItem(PREFIX + key); } catch (e) { console.error(e); }
    }
  };
})();
