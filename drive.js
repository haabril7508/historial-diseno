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
        esté vacío en la app). Excepción: la hoja LISTADO DE PENDIENTES
        se regenera completa (ver aplicarListado en xlsxpatch.js).
     5. Subirlo: actualizando el archivo existente o creando uno nuevo.
     6. Si cambió el año del proyecto, mover el archivo a la carpeta nueva.
        (Esto se hace antes del paso 3.)

   Nota: la sincronización es en un solo sentido (app -> Excel). Si dos
   personas editan el mismo proyecto a la vez, gana quien sincronice de
   último. La única lectura de Excel es la importación de historiales
   que ya estaban en Drive (listarExcelsDelHistorial + importarExcelsDeDrive
   en app.js).

   Sesión: ver el bloque "token" más abajo — el token se guarda entre
   aperturas y se renueva solo, sin volver a pedir login.
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

  /* ---------- token ----------
     Google entrega a una app sin servidor un token que dura ~1 hora y no
     da "refresh token". Para no tener que iniciar sesión cada vez que se
     abre la app:
       1. El token se guarda en localStorage, así sobrevive a cerrar y
          reabrir la app mientras no venza.
       2. Cuando vence, se renueva en silencio (renovarSilencioso): la
          página va a Google con prompt=none y vuelve de inmediato con un
          token nuevo, sin mostrar nada, siempre que la cuenta siga con
          sesión de Google en ese navegador y ya haya autorizado la app.
          Al ser una redirección y no un popup, el navegador no la
          bloquea aunque no la dispare un toque del usuario.
          Requiere registrar la URL de la app como "Authorized redirect
          URI" en Google Cloud Console (ver SETUP.md).
       3. Si Google no puede renovar en silencio (se cerró la sesión de
          Google, se revocó el permiso…), se deja de intentar hasta que
          alguien pulse 🔄 y vuelva a conectar a mano.                  */

  const K_TOKEN = 'hd:drive-token';
  const K_CUENTA = 'hd:drive-cuenta';            // correo que conectó (login_hint)
  const K_STATE = 'hd:oauth-state';              // anti-falsificación del retorno de Google
  const K_INTENTO = 'hd:oauth-intento';          // cuándo fue el último intento silencioso
  const K_REQUIERE = 'hd:oauth-requiere-login';  // la renovación silenciosa falló: esperar a 🔄

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function guardarToken(access, expiresIn) {
    token = access;
    tokenExp = Date.now() + (Number(expiresIn || 3600) - 120) * 1000;
    lsSet(K_TOKEN, JSON.stringify({ token, exp: tokenExp }));
    lsDel(K_REQUIERE);
  }

  function olvidarToken() {
    token = null; tokenExp = 0;
    lsDel(K_TOKEN);
  }

  function restaurarToken() {
    try {
      const raw = lsGet(K_TOKEN);
      if (!raw) return;
      const t = JSON.parse(raw);
      if (t && t.token && t.exp > Date.now()) { token = t.token; tokenExp = t.exp; }
    } catch (e) { /* token dañado: se pedirá de nuevo */ }
  }

  /* ---------- renovación silenciosa por redirección ---------- */

  let retorno = null; // resultado de la vuelta desde Google: 'ok', un código de error, o null

  // Al cargar la página: si venimos de Google, el token (o el error) llega
  // en el fragmento de la URL (#access_token=...). Se lee y se borra de la
  // barra de direcciones.
  function capturarRetornoOAuth() {
    const h = location.hash || '';
    if (!/(^#|&)(access_token|error)=/.test(h)) return;
    const p = new URLSearchParams(h.slice(1));
    const esperado = lsGet(K_STATE);
    lsDel(K_STATE);
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { location.hash = ''; }
    if (!esperado || p.get('state') !== esperado) {
      retorno = 'state_invalido';
      lsSet(K_REQUIERE, '1');
      return;
    }
    if (p.get('access_token')) {
      guardarToken(p.get('access_token'), p.get('expires_in'));
      retorno = 'ok';
    } else {
      retorno = p.get('error') || 'error';
      lsSet(K_REQUIERE, '1');
    }
  }

  function urlRetorno() { return new URL('./', location.href).href; }

  // En iPhone, con la app instalada en pantalla de inicio, salir a Google
  // abre otra ventana y el token no vuelve a la app: ahí no se intenta.
  function esIOSInstalada() { return window.navigator.standalone === true; }

  function puedeRenovarSilencioso() {
    if (!CONFIG.isReady() || !CONFIG.RENOVACION_AUTOMATICA) return false;
    if (!lsGet(K_CUENTA) || lsGet(K_REQUIERE)) return false;
    if (esIOSInstalada() || navigator.onLine === false) return false;
    // Evita rebotar contra Google en bucle si algo sale mal.
    return Date.now() - Number(lsGet(K_INTENTO) || 0) > 2 * 60 * 1000;
  }

  function renovarSilencioso() {
    const azar = new Uint32Array(4);
    crypto.getRandomValues(azar);
    const state = Array.from(azar, (n) => n.toString(36)).join('');
    lsSet(K_STATE, state);
    lsSet(K_INTENTO, String(Date.now()));
    const params = new URLSearchParams({
      client_id: CONFIG.CLIENT_ID,
      redirect_uri: urlRetorno(),
      response_type: 'token',
      scope: CONFIG.SCOPE,
      include_granted_scopes: 'true',
      prompt: 'none',
      login_hint: lsGet(K_CUENTA),
      state: state
    });
    location.assign('https://accounts.google.com/o/oauth2/v2/auth?' + params.toString());
  }

  /* ---------- conexión manual (popup) ---------- */

  function pedirToken(prompt) {
    return new Promise((resolve, reject) => {
      tokenClient.callback = (resp) => {
        if (resp.error) {
          return reject(new Error(resp.error_description || resp.error));
        }
        guardarToken(resp.access_token, resp.expires_in);
        resolve(token);
      };
      tokenClient.error_callback = (err) => {
        reject(new Error(err && err.type === 'popup_closed'
          ? 'Cerraste la ventana de Google sin autorizar.'
          : 'No se pudo abrir la ventana de Google.'));
      };
      const opciones = { prompt: prompt };
      const cuenta = lsGet(K_CUENTA);
      if (cuenta) opciones.login_hint = cuenta;
      tokenClient.requestAccessToken(opciones);
    });
  }

  function conectado() { return !!token && tokenExp > Date.now(); }

  // Guarda el correo de la cuenta conectada: es lo que permite luego
  // renovar en silencio sin preguntar "¿con qué cuenta?".
  async function recordarCuenta() {
    try {
      const r = await api(API + '/about?fields=user(emailAddress)');
      const d = await r.json();
      if (d.user && d.user.emailAddress) lsSet(K_CUENTA, d.user.emailAddress);
    } catch (e) { /* sin correo no hay renovación silenciosa, pero la app sigue */ }
  }

  async function conectar() {
    await init();
    // prompt '' = Google solo pide autorizar si hace falta (la primera vez);
    // el resto de las veces la ventana se abre y se cierra sola.
    await pedirToken('');
    await recordarCuenta();
    return true;
  }

  function desconectar() {
    if (token && window.google && google.accounts && google.accounts.oauth2) {
      google.accounts.oauth2.revoke(token, () => {});
    }
    olvidarToken();
    lsDel(K_CUENTA);
  }

  // Las llamadas a la API nunca abren la ventana de Google por su cuenta: muchas
  // corren en segundo plano (sincronización automática) y el navegador bloquea
  // ventanas que no vienen de un toque. Conectar es trabajo de conectar().
  async function asegurarToken() {
    if (conectado()) return token;
    throw new Error('La sesión de Google venció. Pulsa 🔄 para volver a conectar.');
  }

  /* ---------- llamadas a la API ---------- */

  async function api(url, opts) {
    opts = opts || {};
    const t = await asegurarToken();
    const headers = Object.assign({ Authorization: 'Bearer ' + t }, opts.headers || {});
    const r = await fetch(url, Object.assign({}, opts, { headers }));
    if (r.status === 401) {
      olvidarToken();
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

  // Como q(), pero recorre todas las páginas de resultados.
  async function listarTodo(consulta, campos) {
    let archivos = [];
    let pagina = '';
    do {
      const url = API + '/files?q=' + encodeURIComponent(consulta)
        + '&fields=' + encodeURIComponent('nextPageToken,files(' + campos + ')')
        + '&pageSize=1000&supportsAllDrives=true&includeItemsFromAllDrives=true'
        + (pagina ? '&pageToken=' + encodeURIComponent(pagina) : '');
      const d = await (await api(url)).json();
      archivos = archivos.concat(d.files || []);
      pagina = d.nextPageToken || '';
    } while (pagina);
    return archivos;
  }

  // Todos los .xlsx dentro de las carpetas de año (Historial de Diseño/2025/…),
  // con el año de la carpeta donde está cada uno. Lo usa la importación de
  // historiales creados antes de la base compartida.
  async function listarExcelsDelHistorial() {
    const carpetas = (await listarTodo(
      "'" + esc(CONFIG.ROOT_FOLDER_ID) + "' in parents and mimeType = '" + CONFIG.FOLDER_MIME + "' and trashed = false",
      'id,name'
    )).filter((c) => /^\d{4}$/.test(String(c.name).trim()));

    const anioPorCarpeta = {};
    carpetas.forEach((c) => { anioPorCarpeta[c.id] = String(c.name).trim(); });

    const resultado = [];
    // De a 20 carpetas por consulta, para no pasarse del largo que acepta la API.
    for (let i = 0; i < carpetas.length; i += 20) {
      const grupo = carpetas.slice(i, i + 20);
      const consulta = '(' + grupo.map((c) => "'" + esc(c.id) + "' in parents").join(' or ') + ')'
        + " and mimeType = '" + CONFIG.XLSX_MIME + "' and trashed = false";
      const archivos = await listarTodo(consulta, 'id,name,parents,modifiedTime');
      archivos.forEach((a) => {
        const padre = (a.parents || []).find((x) => anioPorCarpeta[x]);
        resultado.push({ id: a.id, name: a.name, modifiedTime: a.modifiedTime, carpetaId: padre, anio: anioPorCarpeta[padre] });
      });
    }
    return resultado;
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

    // Quien llama (sincronizarDrive en app.js) guarda esto en el proyecto: mientras
    // se subía, la sincronización con el equipo pudo reemplazar el objeto `p`.
    return {
      fileId: guardado.id,
      nombre: nombreArchivo,
      anio: anio,
      carpetaId: carpeta.id,
      syncedAt: new Date().toISOString()
    };
  }

  // Se ejecuta al cargar el script, antes que app.js: recupera el token
  // guardado y, si la página viene de vuelta de Google, el token nuevo.
  restaurarToken();
  capturarRetornoOAuth();

  return {
    init, conectar, desconectar, conectado,
    puedeRenovarSilencioso, renovarSilencioso,
    resultadoRetorno: () => retorno,
    carpetaDelAnio, sincronizarProyecto,
    descargarDB, subirDB,
    listarExcelsDelHistorial, descargar
  };
})();
