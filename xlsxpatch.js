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

      while (cEl.firstChild) cEl.removeChild(cEl.firstChild);

      const valor = w.value;
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

  /* escrituras: { 'NOMBRE HOJA': [{addr:'D2', value:'...', type:'s'|'n'|'b'}, ...], ... } */
  async function patchXlsx(baseArrayBuffer, escrituras) {
    if (typeof JSZip === 'undefined') {
      throw new Error('La librería para leer archivos .xlsx no cargó (sin conexión a internet).');
    }
    const zip = await JSZip.loadAsync(baseArrayBuffer);
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

  return { patchXlsx };
})();
