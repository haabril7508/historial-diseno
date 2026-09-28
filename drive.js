/* ====================================================================
   Drive.js — sincronización con Google Drive
   --------------------------------------------------------------------
   Estructura en Drive:
     Historial de Diseño/            (CONFIG.ROOT_FOLDER_ID)
       2025/
       2026/
         Historial_de_diseño - {proyecto}.xlsx

   Flujo al sincronizar un proyecto:
     1. Asegurar que existe la subcarpeta del año.
     2. Buscar el archivo del proyecto (por id guardado, o por nombre).
     3. Si existe: descargarlo y usarlo como base.
        Si no existe: usar la plantilla maestra (TEMPLATE_B64).
     4. Escribir encima solo las celdas con valor (lo hace buildWorkbook,
        misma lógica de setCell que ya usaba exportExcel: no pisa lo que
        esté vacío en la app).
     5. Subirlo: actualizando el archivo existente o creando uno nuevo.
     6. Si cambió el año del proyecto, mover el archivo a la carpeta nueva.

   Nota: la sincronización es en un solo sentido (app -> Excel). Si dos
   personas editan el mismo proyecto a la vez, gana quien sincronice de
   último.
   ==================================================================== */

const Drive = (function () {

  const API = 'https://www.googleapis.com/drive/v3';
  const UPLOAD = 'https://www.googleapis.com/upload/drive/v3';

  let tokenClient = null;
  let token = null;
  let tokenExp = 0;

  /* ---------- carga de la librería de Google ---------- */

  function gisReady() {
    return new Promise((resolve, reject) => {
      if (window.google && google.accounts && google.accounts.oauth2) return resolve();
      let intentos = 0;
      const t = setInterval(() => {
        if (window.google && google.accounts && google.accounts.oauth2) {
          clearInterval(t); resolve();
        } else if (++intentos > 100) {
          clearInterval(t);
          reject(new Error('No se pudo cargar Google Identity Services (¿sin conexión?).'));
        }
      }, 100);
    });
  }

  async function init() {
    if (!CONFIG.isReady()) {
      throw new Error('Falta pegar el CLIENT_ID en config.js (paso 4 de la configuración).');
    }
    await gisReady();
    if (!tokenClient) {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.CLIENT_ID,
        scope: CONFIG.SCOPE,
        callback: () => {}
      });
    }
    restaurarToken();
  }

  /* ---------- token ---------- */

  function restaurarToken() {
    try {
      const raw = sessionStorage.getItem('hd:drive-token');
      if (!raw) return;
      const t = JSON.parse(raw);
      if (t && t.token && t.exp > Date.now()) { token = t.token; tokenExp = t.exp; }
    } catch (e) { /* sesión sin storage, se pedirá login */ }
  }

  function pedirToken(prompt) {
    return new Promise((resolve, reject) => {
      tokenClient.callback = (resp) => {
        if (resp.error) {
          return reject(new Error(resp.error_description || resp.error));
        }
        token = resp.access_token;
        tokenExp = Date.now() + (Number(resp.expires_in || 3600) - 120) * 1000;
        try {
          sessionStorage.setItem('hd:drive-token', JSON.stringify({ token, exp: tokenExp }));
        } catch (e) { /* sin sessionStorage: el token vive solo en memoria */ }
        resolve(token);
      };
      tokenClient.error_callback = (err) => {
        reject(new Error(err && err.type === 'popup_closed'
          ? 'Cerraste la ventana de Google sin autorizar.'
          : 'No se pudo abrir la ventana de Google.'));
      };
      tokenClient.requestAccessToken({ prompt: prompt });
    });
  }

  function conectado() { return !!token && tokenExp > Date.now(); }

  async function conectar() {
    await init();
    await pedirToken(conectado() ? '' : 'consent');
    return true;
  }

  function desconectar() {
    if (token && window.google && google.accounts && google.accounts.oauth2) {
      google.accounts.oauth2.revoke(token, () => {});
    }
    token = null; tokenExp = 0;
    try { sessionStorage.removeItem('hd:drive-token'); } catch (e) {}
  }

  async function asegurarToken() {
    if (conectado()) return token;
    await init();
    return pedirToken('');
  }

  /* ---------- llamadas a la API ---------- */

  async function api(url, opts) {
    opts = opts || {};
    const t = await asegurarToken();
    const headers = Object.assign({ Authorization: 'Bearer ' + t }, opts.headers || {});
    const r = await fetch(url, Object.assign({}, opts, { headers }));
    if (r.status === 401) {
      token = null; tokenExp = 0;
      throw new Error('La sesión de Google expiró. Vuelve a conectar.');
    }
    if (!r.ok) {
      const detalle = await r.text().catch(() => '');
      throw new Error('Drive respondió ' + r.status + '. ' + recorta(detalle));
    }
    return r;
  }

  function recorta(s) { return String(s).slice(0, 300); }

  // Escapa comillas y barras para los parámetros q de la API
  function esc(s) { return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }

  function q(consulta, campos) {
    return API + '/files?q=' + encodeURIComponent(consulta)
      + '&fields=' + encodeURIComponent(campos || 'files(id,name,parents,modifiedTime)')
      + '&pageSize=100'
      + '&supportsAllDrives=true&includeItemsFromAllDrives=true';
  }

  /* ---------- carpetas ---------- */

  async function buscarHijo(nombre, padreId, mime) {
    const consulta = "name = '" + esc(nombre) + "'"
      + " and '" + esc(padreId) + "' in parents"
      + (mime ? " and mimeType = '" + mime + "'" : '')
      + ' and trashed = false';
    const r = await api(q(consulta));
    const d = await r.json();
    return (d.files && d.files[0]) || null;
  }

  async function crearCarpeta(nombre, padreId) {
    const r = await api(API + '/files?fields=id,name,parents&supportsAllDrives=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nombre, mimeType: CONFIG.FOLDER_MIME, parents: [padreId] })
    });
    return r.json();
  }

  async function carpetaDelAnio(anio) {
    const nombre = String(anio || new Date().getFullYear());
    const existente = await buscarHijo(nombre, CONFIG.ROOT_FOLDER_ID, CONFIG.FOLDER_MIME);
    return existente || await crearCarpeta(nombre, CONFIG.ROOT_FOLDER_ID);
  }

  /* ---------- archivos ---------- */

  async function metadatos(fileId) {
    const r = await api(API + '/files/' + fileId
      + '?fields=id,name,parents,modifiedTime,trashed&supportsAllDrives=true');
    return r.json();
  }

  async function descargar(fileId) {
    const r = await api(API + '/files/' + fileId + '?alt=media&supportsAllDrives=true');
    return r.arrayBuffer();
  }

  async function subirNuevo(nombre, carpetaId, datos) {
    const meta = { name: nombre, parents: [carpetaId], mimeType: CONFIG.XLSX_MIME };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }));
    form.append('file', new Blob([datos], { type: CONFIG.XLSX_MIME }));
    const r = await api(UPLOAD + '/files?uploadType=multipart&fields=id,name,parents&supportsAllDrives=true', {
      method: 'POST',
      body: form
    });
    return r.json();
  }

  async function actualizarContenido(fileId, datos) {
    const r = await api(UPLOAD + '/files/' + fileId + '?uploadType=media&fields=id,name,parents&supportsAllDrives=true', {
      method: 'PATCH',
      headers: { 'Content-Type': CONFIG.XLSX_MIME },
      body: new Blob([datos], { type: CONFIG.XLSX_MIME })
    });
    return r.json();
  }

  async function renombrarYMover(fileId, nombre, nuevoPadre, viejoPadre) {
    let url = API + '/files/' + fileId + '?fields=id,name,parents&supportsAllDrives=true';
    if (nuevoPadre && nuevoPadre !== viejoPadre) {
      url += '&addParents=' + nuevoPadre + '&removeParents=' + viejoPadre;
    }
    const r = await api(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nombre })
    });
    return r.json();
  }

  /* ---------- base de datos compartida (lista de proyectos de todo el equipo) ---------- */

  // Busca el archivo historial-db.json en la carpeta raíz. Null si nunca se ha creado.
  async function buscarArchivoDB() {
    return buscarHijo(CONFIG.DB_FILE_NAME, CONFIG.ROOT_FOLDER_ID, null);
  }

  // Descarga y parsea la base compartida. Devuelve null si el archivo aún no existe en Drive
  // (primera vez que alguien del equipo usa esta función, o carpeta recién configurada).
  async function descargarDB() {
    const archivo = await buscarArchivoDB();
    if (!archivo) return null;
    const buf = await descargar(archivo.id);
    let datos;
    try {
      datos = JSON.parse(new TextDecoder('utf-8').decode(buf));
    } catch (e) {
      throw new Error('El archivo ' + CONFIG.DB_FILE_NAME + ' en Drive está dañado o no es JSON válido.');
    }
    return { id: archivo.id, data: datos };
  }

  // Sube la base compartida (crea el archivo la primera vez, lo sobreescribe después).
  // Devuelve el id del archivo en Drive.
  async function subirDB(datosDB, fileId) {
    const cuerpo = new Blob([JSON.stringify(datosDB)], { type: CONFIG.JSON_MIME });
    if (fileId) {
      const r = await api(UPLOAD + '/files/' + fileId + '?uploadType=media&fields=id&supportsAllDrives=true', {
        method: 'PATCH',
        headers: { 'Content-Type': CONFIG.JSON_MIME },
        body: cuerpo
      });
      const d = await r.json();
      return d.id;
    }
    const meta = { name: CONFIG.DB_FILE_NAME, parents: [CONFIG.ROOT_FOLDER_ID], mimeType: CONFIG.JSON_MIME };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }));
    form.append('file', cuerpo);
    const r = await api(UPLOAD + '/files?uploadType=multipart&fields=id&supportsAllDrives=true', {
      method: 'POST',
      body: form
    });
    const d = await r.json();
    return d.id;
  }

  /* ---------- sincronización de un proyecto ---------- */

  async function sincronizarProyecto(p, avisar) {
    const log = avisar || function () {};
    if (!p) throw new Error('No hay proyecto seleccionado.');
    const g = p.general || {};
    if (!g.nombre && !g.descripcion && !g.ruta) {
      throw new Error('Ponle nombre al proyecto antes de subirlo a Drive.');
    }

    const anio = String(g.anio || new Date().getFullYear());
    const nombreArchivo = CONFIG.fileName(p);

    log('Buscando carpeta ' + anio + '…');
    const carpeta = await carpetaDelAnio(anio);

    // ¿Ya conocemos el archivo?
    let archivo = null;
    if (p.drive && p.drive.fileId) {
      try {
        const m = await metadatos(p.drive.fileId);
        if (!m.trashed) archivo = m;
      } catch (e) {
        // el archivo fue borrado o ya no es accesible: se buscará por nombre
      }
    }
    if (!archivo) {
      log('Buscando el archivo del proyecto…');
      archivo = await buscarHijo(nombreArchivo, carpeta.id, null);
    }

    // Si cambió el año o el nombre del proyecto, mover/renombrar antes de escribir
    if (archivo) {
      const padreActual = (archivo.parents && archivo.parents[0]) || null;
      const cambioCarpeta = padreActual && padreActual !== carpeta.id;
      const cambioNombre = archivo.name !== nombreArchivo;
      if (cambioCarpeta || cambioNombre) {
        log(cambioCarpeta ? 'Moviendo el archivo a ' + anio + '…' : 'Renombrando el archivo…');
        archivo = await renombrarYMover(archivo.id, nombreArchivo, carpeta.id, padreActual);
      }
    }

    // Base: el archivo existente en Drive, o la plantilla maestra
    let base = null;
    if (archivo) {
      log('Descargando la versión en Drive…');
      base = await descargar(archivo.id);
    }

    log('Aplicando los datos del proyecto…');
    const datos = await buildWorkbook(p, base);

    log(archivo ? 'Subiendo cambios…' : 'Creando el archivo en Drive…');
    const guardado = archivo
      ? await actualizarContenido(archivo.id, datos)
      : await subirNuevo(nombreArchivo, carpeta.id, datos);

    p.drive = {
      fileId: guardado.id,
      nombre: nombreArchivo,
      anio: anio,
      carpetaId: carpeta.id,
      syncedAt: new Date().toISOString()
    };
    await saveDB();

    return p.drive;
  }

  return {
    init, conectar, desconectar, conectado,
    carpetaDelAnio, sincronizarProyecto,
    descargarDB, subirDB
  };
})();
