/* ====================================================================
   xlsxpatch.js — escribe valores en un .xlsx SIN perder el formato
   --------------------------------------------------------------------
   Un archivo .xlsx es un .zip con archivos XML adentro (uno por hoja).
   El color de relleno, la fuente y su color viven en "styles.xml" y
   cada celda solo guarda un NÚMERO que apunta a ese estilo (atributo
   s="12"). Librerías como SheetJS (usada antes) reconstruyen el libro
   entero al guardar y, en su versión gratuita, no vuelven a escribir
   ese número — por eso el Excel salía sin colores ni fuentes.

   Este módulo no reconstruye nada: abre el .zip, entra solo a la hoja
   que hay que tocar, busca la celda por su dirección (ej. "D2") y le
   cambia únicamente el contenido (<v>...</v>), dejando su atributo
   s="..." (el estilo) intacto. Todo lo demás del archivo —colores,
   fuentes, bordes, anchos de columna, hojas que no se tocan— queda
   byte por byte igual que en la plantilla.

   Para celdas nuevas (filas que la plantilla no traía, como trámites
   o entregas que superan los espacios previstos) se copia el estilo
   de una celda cercana en la misma columna, para que combine con el
   resto de la tabla en vez de salir sin formato.

   También lee (leerCeldas) los valores de un .xlsx existente, para
   importar a la app los historiales que ya estaban en Drive.

   Excepción: la hoja LISTADO DE PENDIENTES se regenera completa en cada
   guardado (ver aplicarListado), porque sus listas crecen y se achican.
   Lo mismo TRAMITES LICENCIA cuando la app tiene datos de licencia (ver
   aplicarHojaCalculada): es una calculadora con fórmulas.
   ==================================================================== */

const XlsxPatch = (function () {

  const NS_MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const NS_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

  function colLetters(addr) { return addr.match(/^[A-Z]+/)[0]; }
  function rowNumber(addr) { return parseInt(addr.match(/\d+/)[0], 10); }
  function colIndex(letters) {
    let n = 0;
    for (let i = 0; i < letters.length; i++) n = n * 26 + (letters.charCodeAt(i) - 64);
    return n;
  }

  function attrRid(el) {
    return el.getAttribute('r:id') || el.getAttributeNS(NS_REL, 'id');
  }

  async function leerMapaDeHojas(zip) {
    const wbXml = await zip.file('xl/workbook.xml').async('string');
    const relsFile = zip.file('xl/_rels/workbook.xml.rels');
    const relsXml = relsFile ? await relsFile.async('string') : '<Relationships/>';

    const parser = new DOMParser();
    const wbDoc = parser.parseFromString(wbXml, 'application/xml');
    const relsDoc = parser.parseFromString(relsXml, 'application/xml');

    const destinoPorId = {};
    Array.from(relsDoc.getElementsByTagName('Relationship')).forEach((r) => {
      destinoPorId[r.getAttribute('Id')] = r.getAttribute('Target');
    });

    const mapa = {};
    Array.from(wbDoc.getElementsByTagName('sheet')).forEach((s) => {
      const nombre = s.getAttribute('name');
      const rid = attrRid(s);
      let destino = destinoPorId[rid];
      if (!destino) return;
      if (destino.startsWith('/')) destino = destino.slice(1);
      else if (!destino.startsWith('xl/')) destino = 'xl/' + destino;
      mapa[nombre] = destino;
    });
    return mapa;
  }

  // Busca, en columnas cercanas de filas cercanas, un estilo ya usado
  // para aproximar el formato de una celda que la plantilla no traía.
  function estiloCercano(filas, colLetter, rNum) {
    const offsets = [];
    for (let d = 1; d <= 25; d++) offsets.push(-d, d);
    for (const off of offsets) {
      const fila = filas[rNum + off];
      if (!fila) continue;
      const celda = fila[colLetter + (rNum + off)];
      if (celda && celda.getAttribute('s')) return celda.getAttribute('s');
    }
    return null;
  }

  function indexarFilas(sheetData) {
    const filas = {};
    Array.from(sheetData.children).forEach((rowEl) => {
      if (rowEl.tagName !== 'row' && rowEl.localName !== 'row') return;
      const celdas = {};
      Array.from(rowEl.children).forEach((c) => {
        const r = c.getAttribute('r');
        if (r) celdas[r] = c;
      });
      filas[rowEl.getAttribute('r')] = celdas;
    });
    return filas;
  }

  function insertarOrdenado(padre, nuevo, comparar) {
    const existente = Array.from(padre.children).find((el) => comparar(el) > 0);
    if (existente) padre.insertBefore(nuevo, existente);
    else padre.appendChild(nuevo);
  }

  function parchearHojaXml(xmlTexto, escrituras, doc0) {
    const doc = doc0 || new DOMParser().parseFromString(xmlTexto, 'application/xml');
    const sheetData = doc.getElementsByTagName('sheetData')[0];
    if (!sheetData) throw new Error('Hoja sin <sheetData>: no se pudo interpretar el archivo.');

    const filas = indexarFilas(sheetData);

    escrituras.forEach((w) => {
      const addr = w.addr;
      const colLetter = colLetters(addr);
      const rNum = rowNumber(addr);
      const rNumStr = String(rNum);

      let rowEl = Array.from(sheetData.children)
        .find((el) => (el.tagName === 'row' || el.localName === 'row') && el.getAttribute('r') === rNumStr);
      if (!rowEl) {
        rowEl = doc.createElementNS(NS_MAIN, 'row');
        rowEl.setAttribute('r', rNumStr);
        insertarOrdenado(sheetData, rowEl, (el) => parseInt(el.getAttribute('r'), 10) - rNum);
        filas[rNumStr] = {};
      }

      let cEl = filas[rNumStr][addr];
      if (!cEl) {
        cEl = doc.createElementNS(NS_MAIN, 'c');
        cEl.setAttribute('r', addr);
        const estilo = estiloCercano(filas, colLetter, rNum);
        if (estilo) cEl.setAttribute('s', estilo);
        insertarOrdenado(rowEl, cEl, (el) => colIndex(colLetters(el.getAttribute('r'))) - colIndex(colLetter));
        filas[rNumStr][addr] = cEl;
      }

      const valor = w.value;

      // 'cache': celda con fórmula. Se conserva la fórmula y solo se cambia el
      // resultado guardado (<v>), que es lo que muestran los visores que no
      // recalculan. '' = la fórmula da texto vacío.
      if (w.type === 'cache') {
        Array.from(cEl.children).forEach((h) => { if (h.localName !== 'f') cEl.removeChild(h); });
        const v = doc.createElementNS(NS_MAIN, 'v');
        if (valor === '' || valor === null || valor === undefined) {
          cEl.setAttribute('t', 'str');
        } else {
          cEl.removeAttribute('t');
          v.textContent = String(valor);
        }
        cEl.appendChild(v);
        return;
      }

      while (cEl.firstChild) cEl.removeChild(cEl.firstChild);

      if (w.type === 'b') {
        cEl.setAttribute('t', 'b');
        const v = doc.createElementNS(NS_MAIN, 'v');
        v.textContent = valor ? '1' : '0';
        cEl.appendChild(v);
      } else if (w.type === 'n' || typeof valor === 'number') {
        cEl.removeAttribute('t');
        const v = doc.createElementNS(NS_MAIN, 'v');
        v.textContent = String(valor);
        cEl.appendChild(v);
      } else {
        cEl.setAttribute('t', 'inlineStr');
        const is = doc.createElementNS(NS_MAIN, 'is');
        const t = doc.createElementNS(NS_MAIN, 't');
        t.setAttribute('xml:space', 'preserve');
        t.textContent = String(valor);
        is.appendChild(t);
        cEl.appendChild(is);
      }
    });

    return new XMLSerializer().serializeToString(doc);
  }

  /* ---------- hoja de listados ampliables (LISTADO DE PENDIENTES) ----------
     A diferencia del resto del libro, esta hoja la maneja la app por
     completo: en cada guardado se toma limpia de la plantilla, se le
     agregan filas a los bloques que tengan más elementos que los que trae
     la plantilla, y se escriben los valores. Así una lista puede crecer o
     achicarse (pendientes completados) sin dejar restos de la vez anterior.
     Los Excel creados antes de que existiera la hoja no la tienen: se
     copia desde la plantilla junto con los estilos que usa.            */

  const NS_PKG_REL = 'http://schemas.openxmlformats.org/package/2006/relationships';
  const NS_CT = 'http://schemas.openxmlformats.org/package/2006/content-types';
  const REL_HOJA = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet';
  const CT_HOJA = 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml';
  // Orden obligatorio de las secciones de styles.xml
  const ORDEN_ESTILOS = ['numFmts', 'fonts', 'fills', 'borders', 'cellStyleXfs', 'cellXfs', 'cellStyles', 'dxfs', 'tableStyles', 'colors', 'extLst'];

  function parsear(xml) { return new DOMParser().parseFromString(xml, 'application/xml'); }
  function serializar(doc) { return new XMLSerializer().serializeToString(doc); }
  function hijos(el, nombre) { return el ? Array.from(el.children).filter((c) => c.localName === nombre) : []; }
  function todos(doc, nombre) { return Array.from(doc.getElementsByTagNameNS(NS_MAIN, nombre)); }
  function primero(doc, nombre) { return todos(doc, nombre)[0] || null; }
  function firma(el) { return serializar(el).replace(/\sxmlns(:\w+)?="[^"]*"/g, ''); }

  function asegurarSeccion(est, nombre) {
    const raiz = est.documentElement;
    let sec = hijos(raiz, nombre)[0];
    if (sec) return sec;
    sec = est.createElementNS(NS_MAIN, nombre);
    sec.setAttribute('count', '0');
    const despues = ORDEN_ESTILOS.slice(ORDEN_ESTILOS.indexOf(nombre) + 1);
    const ref = Array.from(raiz.children).find((c) => despues.includes(c.localName));
    raiz.insertBefore(sec, ref || null);
    return sec;
  }

  // Índice, dentro de `seccion`, de un nodo idéntico a `nodo`; si no hay, lo agrega.
  // Buscar antes de agregar evita que styles.xml crezca en cada guardado.
  function indiceEquivalente(est, seccion, nodo) {
    const f = firma(nodo);
    const existentes = hijos(seccion, nodo.localName);
    const i = existentes.findIndex((e) => firma(e) === f);
    if (i >= 0) return i;
    seccion.appendChild(est.importNode(nodo, true));
    seccion.setAttribute('count', String(existentes.length + 1));
    return existentes.length;
  }

  // Traductor de índices de estilo de la plantilla a índices del libro destino.
  function traductorDeEstilos(estBase, estPlant) {
    const sec = (n) => asegurarSeccion(estBase, n);
    const plant = (n) => hijos(estPlant.documentElement, n)[0];
    const xfs = {}, formatos = {};

    function formato(id) {
      id = Number(id);
      if (id < 164) return id; // formatos de número incorporados de Excel
      if (formatos[id] !== undefined) return formatos[id];
      const nf = hijos(plant('numFmts'), 'numFmt').find((n) => Number(n.getAttribute('numFmtId')) === id);
      if (!nf) return (formatos[id] = 0);
      const destino = sec('numFmts');
      const igual = hijos(destino, 'numFmt').find((n) => n.getAttribute('formatCode') === nf.getAttribute('formatCode'));
      if (igual) return (formatos[id] = Number(igual.getAttribute('numFmtId')));
      const nuevoId = Math.max(163, ...hijos(destino, 'numFmt').map((n) => Number(n.getAttribute('numFmtId')))) + 1;
      const copia = estBase.importNode(nf, true);
      copia.setAttribute('numFmtId', String(nuevoId));
      destino.appendChild(copia);
      destino.setAttribute('count', String(hijos(destino, 'numFmt').length));
      return (formatos[id] = nuevoId);
    }

    function xf(i) {
      if (xfs[i] !== undefined) return xfs[i];
      const orig = hijos(plant('cellXfs'), 'xf')[i];
      if (!orig) return (xfs[i] = 0);
      const x = orig.cloneNode(true);
      [['fontId', 'fonts', 'font'], ['fillId', 'fills', 'fill'], ['borderId', 'borders', 'border']].forEach(([attr, seccion, nodo]) => {
        const original = hijos(plant(seccion), nodo)[Number(x.getAttribute(attr) || 0)];
        if (original) x.setAttribute(attr, String(indiceEquivalente(estBase, sec(seccion), original)));
      });
      if (x.hasAttribute('numFmtId')) x.setAttribute('numFmtId', String(formato(x.getAttribute('numFmtId'))));
      x.setAttribute('xfId', '0'); // estilo de celda "Normal"
      return (xfs[i] = indiceEquivalente(estBase, sec('cellXfs'), x));
    }

    function dxf(i) {
      const original = hijos(plant('dxfs'), 'dxf')[i];
      return original ? indiceEquivalente(estBase, sec('dxfs'), original) : 0;
    }

    return { xf, dxf };
  }

  async function agregarHojaAlLibro(zip, nombreHoja) {
    const wb = parsear(await zip.file('xl/workbook.xml').async('string'));
    const rels = parsear(await zip.file('xl/_rels/workbook.xml.rels').async('string'));
    const ct = parsear(await zip.file('[Content_Types].xml').async('string'));

    let n = 1;
    while (zip.file('xl/worksheets/sheet' + n + '.xml')) n++;
    const ruta = 'xl/worksheets/sheet' + n + '.xml';

    const ids = Array.from(rels.documentElement.children).map((r) => r.getAttribute('Id'));
    let k = ids.length + 1;
    while (ids.includes('rId' + k)) k++;
    const rel = rels.createElementNS(NS_PKG_REL, 'Relationship');
    rel.setAttribute('Id', 'rId' + k);
    rel.setAttribute('Type', REL_HOJA);
    rel.setAttribute('Target', 'worksheets/sheet' + n + '.xml');
    rels.documentElement.appendChild(rel);

    // Se agrega al final: insertarla en medio correría los índices de los
    // nombres definidos por hoja (áreas de impresión, etc.).
    const sheets = primero(wb, 'sheets');
    const maxId = Math.max(0, ...hijos(sheets, 'sheet').map((s) => Number(s.getAttribute('sheetId')) || 0));
    const hoja = wb.createElementNS(NS_MAIN, 'sheet');
    hoja.setAttribute('name', nombreHoja);
    hoja.setAttribute('sheetId', String(maxId + 1));
    hoja.setAttributeNS(NS_REL, 'r:id', 'rId' + k);
    sheets.appendChild(hoja);

    const ov = ct.createElementNS(NS_CT, 'Override');
    ov.setAttribute('PartName', '/' + ruta);
    ov.setAttribute('ContentType', CT_HOJA);
    ct.documentElement.appendChild(ov);

    zip.file('xl/workbook.xml', serializar(wb));
    zip.file('xl/_rels/workbook.xml.rels', serializar(rels));
    zip.file('[Content_Types].xml', serializar(ct));
    return ruta;
  }

  // Toma la hoja limpia de la plantilla, con sus estilos traducidos al libro
  // destino, y la deja en el libro (reemplazando la que hubiera). Devuelve el
  // documento XML de la hoja para seguir trabajándolo.
  async function hojaLimpiaDesdePlantilla(zip, zipPlant, nombreHoja) {
    const rutaPlant = (await leerMapaDeHojas(zipPlant))[nombreHoja];
    if (!rutaPlant) throw new Error('La plantilla no tiene la hoja "' + nombreHoja + '".');
    const hoja = parsear(await zipPlant.file(rutaPlant).async('string'));
    const estBase = parsear(await zip.file('xl/styles.xml').async('string'));
    const estPlant = parsear(await zipPlant.file('xl/styles.xml').async('string'));
    const estilo = traductorDeEstilos(estBase, estPlant);

    let compartidas = [];
    const ss = zipPlant.file('xl/sharedStrings.xml');
    if (ss) compartidas = Array.from(parsear(await ss.async('string')).getElementsByTagName('si')).map(textoDe);

    todos(hoja, 'c').forEach((c) => {
      if (c.hasAttribute('s')) c.setAttribute('s', String(estilo.xf(Number(c.getAttribute('s')))));
      // Los textos de la plantilla pasan a la celda misma, para no tocar los textos compartidos del destino.
      if (c.getAttribute('t') === 's') {
        const v = hijos(c, 'v')[0];
        const texto = v ? (compartidas[Number(v.textContent)] || '') : '';
        while (c.firstChild) c.removeChild(c.firstChild);
        c.setAttribute('t', 'inlineStr');
        const is = hoja.createElementNS(NS_MAIN, 'is');
        const t = hoja.createElementNS(NS_MAIN, 't');
        t.setAttribute('xml:space', 'preserve');
        t.textContent = texto;
        is.appendChild(t);
        c.appendChild(is);
      }
    });
    todos(hoja, 'row').forEach((r) => { if (r.hasAttribute('s')) r.setAttribute('s', String(estilo.xf(Number(r.getAttribute('s'))))); });
    todos(hoja, 'col').forEach((c) => { if (c.hasAttribute('style')) c.setAttribute('style', String(estilo.xf(Number(c.getAttribute('style'))))); });
    todos(hoja, 'cfRule').forEach((r) => { if (r.hasAttribute('dxfId')) r.setAttribute('dxfId', String(estilo.dxf(Number(r.getAttribute('dxfId'))))); });

    // Sin vínculos a otras partes del archivo (impresora, dibujos) ni pestaña preseleccionada.
    todos(hoja, 'sheetView').forEach((v) => v.removeAttribute('tabSelected'));
    ['legacyDrawing', 'legacyDrawingHF', 'drawing', 'tableParts', 'picture', 'oleObjects', 'controls']
      .forEach((n) => todos(hoja, n).forEach((e) => e.parentNode.removeChild(e)));
    todos(hoja, 'pageSetup').forEach((e) => { e.removeAttributeNS(NS_REL, 'id'); });

    zip.file('xl/styles.xml', serializar(estBase));
    const ruta = (await leerMapaDeHojas(zip))[nombreHoja] || await agregarHojaAlLibro(zip, nombreHoja);
    return { ruta, doc: hoja };
  }

  // Corre una referencia ("B3", "B3:B8", "D4:D8 E4:E8") por la inserción de n
  // filas antes de la fila P. Un rango que cruza P se estira.
  function desplazarRef(ref, P, n) {
    return String(ref).split(/\s+/).filter(Boolean).map((rango) => rango.split(':').map((celda) => {
      const m = celda.match(/^(\$?[A-Z]+)(\$?)(\d+)$/);
      if (!m) return celda;
      const fila = Number(m[3]);
      return m[1] + m[2] + (fila >= P ? fila + n : fila);
    }).join(':')).join(' ');
  }

  // Inserta n filas antes de la fila P copiando el formato de la fila P-1.
  // Solo corre filas, celdas combinadas, formatos condicionales y validaciones:
  // suficiente para la hoja de listados, que no tiene fórmulas.
  function insertarFilas(doc, P, n) {
    if (n <= 0) return;
    const sheetData = primero(doc, 'sheetData');
    const filas = hijos(sheetData, 'row');
    const modelo = filas.find((r) => Number(r.getAttribute('r')) === P - 1);
    filas.forEach((row) => {
      const r = Number(row.getAttribute('r'));
      if (r < P) return;
      row.setAttribute('r', String(r + n));
      hijos(row, 'c').forEach((c) => c.setAttribute('r', desplazarRef(c.getAttribute('r'), P, n)));
    });
    const siguiente = filas.find((r) => Number(r.getAttribute('r')) >= P + n) || null;
    for (let i = 0; i < n; i++) {
      const fila = P + i;
      const nueva = modelo ? modelo.cloneNode(true) : doc.createElementNS(NS_MAIN, 'row');
      nueva.setAttribute('r', String(fila));
      hijos(nueva, 'c').forEach((c) => {
        c.setAttribute('r', c.getAttribute('r').replace(/\d+$/, String(fila)));
        c.removeAttribute('t');
        while (c.firstChild) c.removeChild(c.firstChild);
      });
      sheetData.insertBefore(nueva, siguiente);
    }
    todos(doc, 'mergeCell').forEach((m) => m.setAttribute('ref', desplazarRef(m.getAttribute('ref'), P, n)));
    todos(doc, 'dimension').forEach((d) => d.setAttribute('ref', desplazarRef(d.getAttribute('ref'), P, n)));
    todos(doc, 'conditionalFormatting').concat(todos(doc, 'dataValidation'))
      .forEach((e) => e.setAttribute('sqref', desplazarRef(e.getAttribute('sqref'), P, n)));
    Array.from(doc.getElementsByTagName('xm:sqref')).forEach((e) => { e.textContent = desplazarRef(e.textContent, P, n); });
  }

  /* listado: {
       hoja: 'LISTADO DE PENDIENTES',
       plantilla: ArrayBuffer del .xlsx maestro,
       columnas: ['D','E'],
       bloques: [{ filaTitulo: 3, filas: 5, valores: [['pendiente','descripción'], ...] }, ...]
     }
     Los datos de cada bloque van desde filaTitulo+1; si hay más valores que
     filas, se insertan las que falten antes de la última fila del bloque
     (así se conserva su borde inferior).                                */
  async function aplicarListado(zip, listado) {
    const zipPlant = await JSZip.loadAsync(listado.plantilla);
    const { ruta, doc } = await hojaLimpiaDesdePlantilla(zip, zipPlant, listado.hoja);

    const extra = listado.bloques.map((b) => Math.max(0, b.valores.length - b.filas));
    // De abajo hacia arriba, para que cada inserción no mueva los bloques aún por procesar.
    listado.bloques
      .map((b, i) => ({ b, i }))
      .sort((x, y) => y.b.filaTitulo - x.b.filaTitulo)
      .forEach(({ b, i }) => insertarFilas(doc, b.filaTitulo + b.filas, extra[i]));

    // Posiciones finales: cada bloque queda corrido por lo que creció lo de arriba.
    const escrituras = [];
    listado.bloques.forEach((b) => {
      const corrimiento = listado.bloques.reduce((s, otro, j) => s + (otro.filaTitulo < b.filaTitulo ? extra[j] : 0), 0);
      b.valores.forEach((fila, k) => {
        fila.forEach((valor, c) => {
          if (valor === undefined || valor === null || valor === '') return;
          escrituras.push({ addr: listado.columnas[c] + (b.filaTitulo + corrimiento + 1 + k), value: String(valor), type: 's' });
        });
      });
    });
    zip.file(ruta, parchearHojaXml(null, escrituras, doc));
  }

  /* ---------- hoja con fórmulas que maneja la app (TRAMITES LICENCIA) ----------
     hoja: { hoja, plantilla, regenerar, escrituras:[{addr, value, type}] }
     - regenerar (la app tiene datos): la hoja se toma limpia de la plantilla y
       se escriben los datos y los resultados ('cache').
     - sin datos: no se toca lo que el Excel ya tenga; si no tiene la hoja
       (Excel anterior a ella), se le agrega vacía.
     Las fórmulas cambian de resultado, así que se le pide a Excel que
     recalcule todo al abrir.                                              */
  async function aplicarHojaCalculada(zip, h) {
    const existe = !!(await leerMapaDeHojas(zip))[h.hoja];
    if (existe && !h.regenerar) return;
    const zipPlant = await JSZip.loadAsync(h.plantilla);
    const { ruta, doc } = await hojaLimpiaDesdePlantilla(zip, zipPlant, h.hoja);
    zip.file(ruta, parchearHojaXml(null, h.escrituras || [], doc));
    await recalcularAlAbrir(zip);
  }

  async function recalcularAlAbrir(zip) {
    const wb = parsear(await zip.file('xl/workbook.xml').async('string'));
    let calc = primero(wb, 'calcPr');
    if (!calc) {
      // calcPr va después de definedNames y antes de estas secciones (orden del esquema).
      calc = wb.createElementNS(NS_MAIN, 'calcPr');
      const despues = ['oleSize', 'customWorkbookViews', 'pivotCaches', 'smartTagPr', 'smartTagTypes',
        'webPublishing', 'fileRecoveryPr', 'webPublishObjects', 'extLst'];
      const ref = Array.from(wb.documentElement.children).find((c) => despues.includes(c.localName));
      wb.documentElement.insertBefore(calc, ref || null);
    }
    calc.setAttribute('fullCalcOnLoad', '1');
    zip.file('xl/workbook.xml', serializar(wb));
  }

  /* escrituras: { 'NOMBRE HOJA': [{addr:'D2', value:'...', type:'s'|'n'|'b'}, ...], ... }
     opciones.listado: ver aplicarListado. opciones.licencia: ver aplicarHojaCalculada. */
  async function patchXlsx(baseArrayBuffer, escrituras, opciones) {
    if (typeof JSZip === 'undefined') {
      throw new Error('La librería para leer archivos .xlsx no cargó (sin conexión a internet).');
    }
    const zip = await JSZip.loadAsync(baseArrayBuffer);
    if (opciones && opciones.listado) await aplicarListado(zip, opciones.listado);
    if (opciones && opciones.licencia) await aplicarHojaCalculada(zip, opciones.licencia);
    const mapaHojas = await leerMapaDeHojas(zip);

    for (const nombreHoja of Object.keys(escrituras)) {
      const lista = escrituras[nombreHoja];
      if (!lista || !lista.length) continue;
      const ruta = mapaHojas[nombreHoja];
      if (!ruta || !zip.file(ruta)) {
        console.warn('xlsxpatch: no se encontró la hoja "' + nombreHoja + '" en la plantilla.');
        continue;
      }
      const xml = await zip.file(ruta).async('string');
      const nuevoXml = parchearHojaXml(xml, lista);
      zip.file(ruta, nuevoXml);
    }

    return zip.generateAsync({ type: 'arraybuffer' });
  }

  /* ---------- lectura (lo contrario de patchXlsx) ----------
     Se usa para importar a la app los Excel que ya existen en Drive.
     Devuelve { 'NOMBRE HOJA': { 'D2': valor, ... }, ... } donde valor es
     texto, número (fechas de Excel llegan como número de serie) o
     booleano (casillas TRUE/FALSE).                                    */

  function textoDe(el) {
    // Concatena los <t> de un <si>/<is>, sin la guía fonética (<rPh>).
    return Array.from(el.getElementsByTagName('t'))
      .filter((t) => !(t.parentNode && t.parentNode.localName === 'rPh'))
      .map((t) => t.textContent).join('');
  }

  async function leerCeldas(baseArrayBuffer, hojas) {
    if (typeof JSZip === 'undefined') {
      throw new Error('La librería para leer archivos .xlsx no cargó (sin conexión a internet).');
    }
    const zip = await JSZip.loadAsync(baseArrayBuffer);
    const mapaHojas = await leerMapaDeHojas(zip);
    const parser = new DOMParser();

    let compartidas = [];
    const ssFile = zip.file('xl/sharedStrings.xml');
    if (ssFile) {
      const ssDoc = parser.parseFromString(await ssFile.async('string'), 'application/xml');
      compartidas = Array.from(ssDoc.getElementsByTagName('si')).map(textoDe);
    }

    const resultado = {};
    for (const nombreHoja of hojas) {
      const celdas = {};
      resultado[nombreHoja] = celdas;
      const ruta = mapaHojas[nombreHoja];
      if (!ruta || !zip.file(ruta)) continue;
      const doc = parser.parseFromString(await zip.file(ruta).async('string'), 'application/xml');
      Array.from(doc.getElementsByTagName('c')).forEach((c) => {
        const addr = c.getAttribute('r');
        if (!addr) return;
        const t = c.getAttribute('t');
        if (t === 'inlineStr') {
          const is = c.getElementsByTagName('is')[0];
          if (is) celdas[addr] = textoDe(is);
          return;
        }
        const v = c.getElementsByTagName('v')[0];
        if (!v) return;
        const x = v.textContent;
        if (t === 's') celdas[addr] = compartidas[parseInt(x, 10)] || '';
        else if (t === 'b') celdas[addr] = x === '1';
        else if (t === 'str' || t === 'e') celdas[addr] = x;
        else celdas[addr] = Number(x);
      });
    }
    return resultado;
  }

  return { patchXlsx, leerCeldas };
})();
