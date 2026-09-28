/* ==================== CONFIG ESTÁTICA ==================== */

const DELIVERY_TYPES = {
  EE:  {label:'Entrega Estructural (EE)', startRow:9,  cols:{fecha:'E',obs:'F',obs2:'G',fechaEnvio:'H',entregaCompleta:'I',debidaForma:'J',fechaRadicacion:'K'}, obsLabel:'Observaciones de entrega', obs2Label:'Observaciones diagramación', envioLabel:'Fecha de envío', extraEE:true},
  RAC: {label:'Revit Arquitectónico - Construcción (RAC)', startRow:16, cols:{fecha:'E',obs:'F',obs2:'G',fechaEnvio:'H'}, obsLabel:'Descripción de versión', obs2Label:'Observaciones / faltantes', envioLabel:'Fecha de envío'},
  RAP: {label:'Revit Arquitectónico - Planeación (RAP)', startRow:23, cols:{fecha:'E',obs:'F',obs2:'G',fechaEnvio:'H'}, obsLabel:'Descripción de versión', obs2Label:'Observaciones / faltantes', envioLabel:'Fecha de envío'},
  REC: {label:'Revit Estructural - Construcción (REC)', startRow:30, cols:{fecha:'E',obs:'F',obs2:'G',fechaEnvio:'H'}, obsLabel:'Descripción de versión', obs2Label:'Observaciones / faltantes', envioLabel:'Fecha de envío'},
  REP: {label:'Revit Estructural - Planeación (REP)', startRow:37, cols:{fecha:'E',obs:'F',obs2:'G',fechaEnvio:'H'}, obsLabel:'Descripción de versión', obs2Label:'Observaciones / faltantes', envioLabel:'Fecha de envío'},
  EC:  {label:'ETABS - Construcción (EC)', startRow:44, cols:{fecha:'E',obs:'F',obs2:'G',fechaEnvio:'H'}, obsLabel:'Descripción de versión', obs2Label:'Observaciones / faltantes', envioLabel:'Versión definitiva'},
  EP:  {label:'ETABS - Planeación (EP)', startRow:51, cols:{fecha:'E',obs:'F',obs2:'G',fechaEnvio:'H'}, obsLabel:'Descripción de versión', obs2Label:'Observaciones / faltantes', envioLabel:'Versión definitiva'},
  ES:  {label:'Estudio de Suelos (ES)', startRow:58, cols:{fecha:'E',obs:'F',obs2:'G',fechaEnvio:'H'}, obsLabel:'Descripción de versión', obs2Label:'Observaciones / faltantes', envioLabel:'Fecha de envío'},
  HH:  {label:'Entrega Hidrosanitaria (HH)', startRow:65, cols:{fecha:'E',obs:'F',obs2:'G',fechaEnvio:'H',entregaCompleta:'I',debidaForma:'J',fechaRadicacion:'K'}, obsLabel:'Observaciones de entrega', obs2Label:'Observaciones diagramación', envioLabel:'Fecha de envío', extraEE:true},
  RHC: {label:'Revit Hidrosanitario - Construcción (RHC)', startRow:72, cols:{fecha:'E',obs:'F',obs2:'G',fechaEnvio:'H'}, obsLabel:'Descripción de versión', obs2Label:'Observaciones / faltantes', envioLabel:'Fecha de envío'},
  DH:  {label:'Diseño Hidrosanitario (DH)', startRow:79, cols:{fecha:'E',obs:'F',obs2:'G',fechaEnvio:'H'}, obsLabel:'Descripción de versión', obs2Label:'Observaciones / faltantes', envioLabel:'Fecha de envío'}
};
const DELIVERY_SLOTS = 5;

// Checklist estructural en orden (etapa, fila real en la hoja 'DISEÑO ESTRUCTURAL', descripción)
const STRUCT_STAGES = [
 {stage:'1. PREDIMENSIONAMIENTO', items:[
   [8,'Revisión de predimensionamiento de vigas'],[9,'Revisión de cumplimiento de Ldh'],
   [10,'Revisión de excentricidad'],[11,'Chequear voladizos de grandes longitudes o sin continuidad'],
   [12,'Chequear elementos sometidos a grandes torsiones']]},
 {stage:'2. MODELO ETABS', items:[
   [16,'Modelación de geometría (Grid - Reference planes)'],[17,'Empotramiento de puntos (Restraints Joints)'],
   [18,'Aplicación de Insertion point para pequeños desplazamientos'],[19,'Zonas rígidas en nudos (End length offset)'],
   [20,'Definir diafragmas'],[21,'Auto Mesh en losas/muros y Pier Labels en muros']]},
 {stage:'3. APLICACIÓN DE CARGAS - TÍTULO B', items:[
   [25,'Carga muerta'],[26,'Carga viva'],[27,'Carga superimpuesta (SD)'],[28,'Carga de viento'],
   [29,'Carga de granizo'],[30,'Carga de empuje de tierras (muros de contención)'],
   [31,'Carga de escaleras o rampas'],[32,'Carga de pérgolas / estructuras ancladas']]},
 {stage:'4. ESPECTRO ELÁSTICO - A.2', items:[
   [36,'Definir ubicación del proyecto'],[37,'Definir zona de amenaza sísmica'],[38,'Definir sistema estructural'],
   [39,'Definir tipo de perfil de suelo'],[40,'Definir parámetros sísmicos (Aa, Av, Ae, Ad, Fa, Fv, I, Ct, α)'],
   [41,'Agregar espectro elástico al software (Etabs)'],[42,'Chequear modos de vibración'],
   [43,'Chequear periodo de software (Etabs)'],[44,'Calcular aceleración de diseño para periodo (T, Sa)']]},
 {stage:'5. AJUSTE SÍSMICO - A.3', items:[
   [48,'Definir coeficiente de disipación de energía Ro'],[49,'Chequear irregularidad en planta'],
   [50,'Chequear irregularidad en altura'],[51,'Chequear ausencia de redundancia'],
   [52,'Calcular coeficiente de disipación de energía R'],[53,'Agregar R al modelo (Etabs)'],
   [54,'Chequeo de deriva antes del ajuste'],[55,'Realizar ajuste y volver a chequear derivas']]},
 {stage:'6. DERIVAS Y PARTICIPACIÓN DE MASA', items:[
   [59,'Chequear y exportar datos de derivas'],[60,'Exportar participación de masa']]},
 {stage:'6b. MATERIAL Y SISTEMA', items:[
   [63,'Definir material de la construcción'],[64,'Definir sistema de muros o pórticos']]},
 {stage:'7. EXPORTACIÓN A SOFTWARE DC-CAD', items:[
   [67,'Agregar 11 estaciones de salida a cada frame'],[68,'Crear Pier Labels para cada muro'],
   [69,'Exportar archivo E2K con geometría'],[70,'Exportar archivo XML con solicitaciones']]},
 {stage:'8. DESPIECE DE VIGAS DC-CAD', items:[
   [74,'Ajustar prefijos por grupos y niveles'],[75,'Numerar vigas según ejes arquitectónicos'],
   [76,'Modificar variables de diseño según la estructura']]},
 {stage:'8.1 REFUERZO ACERO VIGAS DE FUNDACIÓN', items:[
   [80,'Verificar recubrimiento de concreto'],[81,'Verificar refuerzo transversal'],
   [82,'Verificar refuerzo longitudinal'],[83,'Distanciamiento entre barras longitudinales'],
   [84,'Verificación de traslapos']]},
 {stage:'8.2 REFUERZO / DISEÑO VIGAS AÉREAS', items:[
   [88,'Recubrimiento / longitud, momento y cortante últimos'],[89,'Refuerzo transversal / compacidad y esbeltez'],
   [90,'Refuerzo longitudinal / diseño a flexión F.2'],[91,'Distanciamiento barras / diseño a cortante F.2'],
   [92,'Verificación de traslapos / provisiones sísmicas F.3']]},
 {stage:'9. DESPIECE DE MUROS / COLUMNAS DC-CAD', items:[
   [96,'Distancia hasta cimentación según estudio geotécnico definitivo'],
   [97,'Ajustar tamaño de muro real / numerar columnas']]},
 {stage:'9.1 REFUERZO DE ACERO MUROS / COLUMNAS', items:[
   [101,'Modificar variables de diseño según la estructura'],[102,'Refuerzo longitudinal y recubrimiento / esbeltez'],
   [103,'Distanciamiento barras / diseño a compresión F.2'],[104,'Refuerzo transversal / diseño a flexión F.2'],
   [105,'Estribos de borde / interacción flexo-compresión'],[106,'Verificación de traslapos / diseño a cortante F.2'],
   [107,'Exportar DXF muros / columna fuerte-viga débil / provisiones sísmicas F.3']]},
 {stage:'10. DISEÑO DE FUNDACIONES', items:[
   [111,'Chequeo de capacidad portante según estudio de suelos'],[112,'Extraer cargas de la estructura (Etabs)'],
   [113,'Diseño de cimentaciones'],[114,'Tipificación de cimentaciones diseñadas']]},
 {stage:'11. ELEMENTOS NO ESTRUCTURALES', items:[
   [133,'Totalidad de elementos no estructurales']]},
 {stage:'12. MEMORIAS DE CÁLCULO', items:[
   [137,'Generación de memorias de cálculo']]}
];
const STRUCT_FLAT = [];
STRUCT_STAGES.forEach(st => st.items.forEach(it => STRUCT_FLAT.push({row:it[0], label:it[1], stage:st.stage})));

// Checklist de Estudio de Suelos en orden (etapa, fila real en la hoja 'ESTUDIOS DE SUELOS', descripción)
const GEO_STAGES = [
 {stage:'1. ASPECTOS GENERALES DEL PROYECTO', items:[
   [9,'Nombre del proyecto'],[10,'Descripción general del proyecto'],
   [11,'Planos de localización regional y local del proyecto'],
   [12,'Objetivo del estudio (Geológico - Geotécnico - Geomorfológico - Amenaza)'],
   [13,'Sistema estructural del proyecto'],
   [14,'Evaluación de cargas específicas de la estructura (no se permiten cargas preliminares)']]},
 {stage:'2. CARACTERÍSTICAS DEL SUBSUELO (GEOLOGÍA-GEOTECNIA-MORFOLOGÍA)', items:[
   [17,'Reconocimiento y recorrido de campo - caracterización física del terreno'],
   [18,'Cantidad mínima de sondeos'],
   [19,'Ubicación de las perforaciones realizadas (50% debe encontrarse sobre el proyecto)'],
   [20,'Detallamiento de la morfología del terreno'],
   [21,'Análisis y origen geológico de la zona'],
   [22,'Descripción y realización de perforaciones'],
   [23,'Ejecución de ensayos de laboratorio'],
   [24,'Descripción de las características físico-mecánicas del suelo'],
   [25,'Descripción de los niveles freáticos o aguas subterráneas']]},
 {stage:'3. CARACTERIZACIÓN POR UNIDAD GEOLÓGICA O DE SUELO', items:[
   [28,'Identificación y determinación del espesor y distribución del subsuelo'],
   [29,'Descripción de los parámetros obtenidos en las pruebas y ensayos de campo (H.3 NSR-10)'],
   [30,'Coeficientes espectrales para la definición del sismo de diseño (Aa, Av, Fa, Fv, I)'],
   [31,'Definición del tipo de perfil de suelo (A.2.4 NSR-10)']]},
 {stage:'4. ESTUDIO DE EFECTOS DE SUELOS CON CARACTERÍSTICAS ESPECIALES', items:[
   [34,'Chequeo de suelos expansivos y los efectos que pueden provocar a la estructura'],
   [35,'Chequeo de suelos colapsables y los efectos que pueden provocar a la estructura'],
   [36,'Chequeo de suelos licuables y los efectos que pueden provocar a la estructura'],
   [37,'Efectos de la presencia de vegetación o de cuerpos de agua cercanos']]},
 {stage:'5. ANÁLISIS GEOTÉCNICOS - PARÁMETROS Y CIMENTACIÓN', items:[
   [40,'Resumen de los análisis y justificación de los parámetros geotécnicos adoptados'],
   [41,'Definición y análisis de los problemas constructivos de las alternativas de cimentación'],
   [42,'Definición y análisis de los problemas constructivos de las alternativas de contención'],
   [43,'Definición de parámetros para análisis de interacción suelo-estructura (Módulo de balasto)']]},
 {stage:'6. DISEÑOS Y EVALUACIONES ADICIONALES', items:[
   [46,'Evaluación de la estabilidad de taludes temporales de corte'],
   [47,'Planteamiento de alternativas de excavación con sistemas de contención temporales'],
   [48,'Análisis de estabilidad de taludes en el proyecto (sismicidad y factores hidráulicos)'],
   [49,'Descripción de las condiciones de drenaje de la zona'],
   [50,'Diseño geotécnico de filtros, drenajes y/o obras de evacuación de aguas']]},
 {stage:'6b. RECOMENDACIONES PARA PROTECCIÓN DE EDIFICACIONES (SI SE REQUIERE)', items:[
   [53,'Estimativo de asentamientos originados en descenso del nivel freático'],
   [54,'Efectos de asentamientos sobre edificaciones vecinas'],
   [55,'Diseño de sistema de soportes que garantice la estabilidad en edificaciones vecinas'],
   [56,'Estimativo de asentamientos originados por el peso de la nueva edificación'],
   [57,'Cálculo de asentamientos y deformaciones producidos por excavaciones en edificaciones vecinas']]},
 {stage:'7. RECOMENDACIONES PARA CONSTRUCCIÓN', items:[
   [60,'Establecer las alternativas técnicamente factibles para solucionar los problemas geotécnicos de excavación y construcción que se puedan presentar durante la obra']]},
 {stage:'8. ANEXOS', items:[
   [63,'Ubicación de los trabajos de campo'],[64,'Registros de perforación'],
   [65,'Resultados de pruebas y ensayos de campo y laboratorio'],
   [66,'Memoria de cálculo con el resumen de la metodología seguida'],
   [67,'Una muestra de cálculo de cada tipo de problema analizado'],
   [68,'Resumen de resultados en forma de gráficos y tablas'],
   [69,'Fotografías de campo'],[70,'Fotografías de muestras analizadas']]}
];
const GEO_FLAT = [];
GEO_STAGES.forEach(st => st.items.forEach(it => GEO_FLAT.push({row:it[0], label:it[1], stage:st.stage})));
// Ítems que en la plantilla Excel ya vienen preconfigurados como "No aplica" (columna E)
const GEO_DEFAULT_NA = [13,14,18,19,34,35,36,42,49,50,53,54,55,56,57,63,64,69,70];

// "Información actualizada a última versión del proyecto" -> hoja GENERAL, filas 90-100
const ELEM_LEFT = [
 ['losas','Losas',90],['columnas','Columnas',91],['vigas','Vigas',92],['cimentaciones','Cimentaciones',93],
 ['piscina','Piscina',94],['jacuzzi','Jacuzzi',95],['pergola','Pérgola',96],
 ['elementosNoEstructurales','Elementos no estructurales',97],['nervios','Nervios',98],
 ['muroContencion','Muro de contención',99],['escaleras','Escaleras',100]
];
const ELEM_RIGHT = [
 ['detalleConexiones','Detalle de conexiones',90],['memoriasCalculo','Memorias de cálculo',91],
 ['murosEstructurales','Muros estructurales',92],['estructuraExteriorPergola','Estructura exterior pérgola',93],
 ['rampa','Rampa',94]
];
// "Contenido de las memorias de cálculo" -> hoja GENERAL, filas 104-111
const MEMORIAS_ITEMS = [
 ['a','(a) Descripción del sistema estructural usado',104],
 ['b','(b) Cargas verticales',105],
 ['c','(c) Grado de capacidad de disipación de energía del sistema de resistencia sísmica',106],
 ['d','(d) Cálculo de la fuerza sísmica',107],
 ['e','(e) Tipo de análisis estructural utilizado',108],
 ['f','(f) Verificación de que las derivas máximas no fueron excedidas',109],
 ['g','(g) Descripción de los principios del modelo digital y datos de entrada al procesador',110],
 ['h','(h) Datos de salida',111]
];

// Hoja "ARQUITECTURA": 27 ítems, cada uno con estado (Sí/No/No aplica, columna D) y comentario (E:J)
const ARQ_ITEMS = [
 ['loc_general','Localización general',5],['loc_especifica','Localización específica',6],
 ['seccion_vial_1','Sección vial 1',7],['seccion_vial_2','Sección vial 2',8],
 ['cuadro_areas','Cuadro de áreas',9],
 ['planta_nivel_1','Planta nivel 1',10],['planta_nivel_2','Planta nivel 2',11],
 ['planta_nivel_3','Planta nivel 3',12],['planta_nivel_4','Planta nivel 4',13],['planta_nivel_5','Planta nivel 5',14],
 ['planta_cubierta','Planta de cubierta',15],
 ['fachada_principal','Fachada principal',16],['fachada_posterior','Fachada posterior',17],
 ['fachada_lat_derecha','Fachada lateral derecha',18],['fachada_lat_izquierda','Fachada lateral izquierda',19],
 ['seccion_1','Sección 1',20],['seccion_2','Sección 2',21],['seccion_3','Sección 3',22],
 ['seccion_4','Sección 4',23],['seccion_5','Sección 5',24],
 ['explotado','Explotado',25],['render_3d','3D',26],['otro','Otro, ¿cuál?',27],
 ['cuadro_puertas','Cuadro de puertas',29],['cuadro_ventanas','Cuadro de ventanas',30],['renders','Renders',31],
 ['detalles','Detalles',33]
];

// Hoja "HIDROSANITARIO": elementos de diseño (filas 6-16) y memorias de cálculo (filas 20-38)
const HS_ELEM_ITEMS = [
 ['aguas_residuales','Aguas residuales',6],['aguas_lluvias','Aguas lluvias',7],['ventilacion','Ventilación',8],
 ['con_alcant_ar','Conexión alcantarillado A. Residuales',9],['con_alcant_all','Conexión alcantarillado A. Lluvias',10],
 ['con_alcant_tanque','Conexión alcantarillado tanque enterrado',11],
 ['agua_fria','Agua potable fría',12],['agua_caliente','Agua caliente',13],
 ['medidor_general','Medidor general',14],['micromedidores','Micromedidores',15],['sist_bombeo','Sistema de bombeo',16]
];
const HS_MEMORIAS_ITEMS = [
 ['a','(a) Descripción de uso de cada piso y sistema de abastecimiento de agua potable',20],
 ['b','(b) Cálculo de redes de abasto (cuadro de aparatos sanitarios con punto de abasto)',21],
 ['c','(c) Definición del caudal de diseño de agua potable',22],
 ['d','(d) Cálculo de la capacidad del tanque de almacenamiento',23],
 ['e','(e) Cálculo diámetro tallo de impulsión principal desde sistema de bombeo',24],
 ['f','(f) Definición de potencia del sistema de bombeo',25],
 ['g','(g) Especificación de la acometida de acueducto',26],
 ['h','(h) Diseño desagüe aguas residuales — Tabla 6 (aparatos y unidades de descarga)',27],
 ['i','(i) Chequeo de diámetro para bajantes — Tabla 8 (bajante crítico)',28],
 ['j','(j) Generación de imagen de ubicación del bajante crítico',29],
 ['k','(k) Definición de diámetro para tubería horizontal — Tabla 10',30],
 ['l','(l) Especificación de diámetro en plano horizontal crítico (1er nivel) vs. Tabla 10',31],
 ['m','(m) Especificación de la acometida de alcantarillado',32],
 ['n','(n) Diseño aguas lluvias — esquema de áreas de cubierta por tragante',33],
 ['o','(o) Tabla 11 — áreas aferentes de cubierta para dimensionamiento de bajantes',34],
 ['p','(p) Diámetro de tubería horizontal de aguas lluvias — Tablas 12 y 13',35],
 ['q','(q) Conclusión de diámetros para tuberías horizontal y vertical',36],
 ['r','(r) Definición de la acometida de aguas lluvias',37],
 ['s','(s) Actualización de tablas y portada de las memorias',38]
];

const TABS = [
 {id:'general', label:'General'},
 {id:'estructural', label:'Estructural'},
 {id:'geotecnico', label:'Geotécnico'},
 {id:'arquitectura', label:'Arquitectura'},
 {id:'hidrosanitario', label:'Hidrosanitario'}
];

/* ==================== ESTADO ==================== */
let DB = {projects:[]};
let currentId = null;
let currentTab = 'general';

function slugify(s){
  return (s||'').toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}
function todayISO(){ return new Date().toISOString().slice(0,10); }

/* ==================== DÍAS HÁBILES (COLOMBIA) ==================== */
// Domingo de Pascua (algoritmo de Meeus/Jones/Butcher)
function easterSunday(year){
  const a=year%19, b=Math.floor(year/100), c=year%100, d=Math.floor(b/4), e=b%4,
        f=Math.floor((b+8)/25), g=Math.floor((b-f+1)/3), h=(19*a+b-d-g+15)%30,
        i=Math.floor(c/4), k=c%4, l=(32+2*e+2*i-h-k)%7, m=Math.floor((a+11*h+22*l)/451),
        month=Math.floor((h+l-7*m+114)/31), day=((h+l-7*m+114)%31)+1;
  return new Date(year, month-1, day);
}
function addDays(d,n){ const r=new Date(d.getTime()); r.setDate(r.getDate()+n); return r; }
// Ley Emiliani (Ley 51 de 1983): festivo se traslada al lunes siguiente si no cae en lunes
function toMonday(d){ const r=new Date(d.getTime()); const dow=r.getDay(); if(dow!==1) r.setDate(r.getDate()+((8-dow)%7)); return r; }
function dateKey(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
const _holidayCache = {};
function colombianHolidays(year){
  if(_holidayCache[year]) return _holidayCache[year];
  const fixed = [[0,1],[4,1],[6,20],[7,7],[11,8],[11,25]].map(([m,d])=>new Date(year,m,d));
  const movable = [[0,6],[2,19],[5,29],[7,15],[9,12],[10,1],[10,11]].map(([m,d])=>toMonday(new Date(year,m,d)));
  if(year>=2026) movable.push(toMonday(new Date(year,6,9))); // Virgen de Chiquinquirá (Ley 2578 de 2026)
  const easter = easterSunday(year);
  const holy = [addDays(easter,-3), addDays(easter,-2)]; // Jueves y Viernes Santo (no se trasladan)
  const movableEaster = [toMonday(addDays(easter,39)), toMonday(addDays(easter,60)), toMonday(addDays(easter,68))]; // Ascensión, Corpus Christi, Sagrado Corazón
  const set = new Set([...fixed,...movable,...holy,...movableEaster].map(dateKey));
  _holidayCache[year] = set;
  return set;
}
function isBusinessDay(d){
  const dow = d.getDay();
  if(dow===0||dow===6) return false;
  return !colombianHolidays(d.getFullYear()).has(dateKey(d));
}
// Suma N días hábiles a una fecha 'YYYY-MM-DD' (cuenta desde el día siguiente a la fecha dada)
function addBusinessDays(isoDateStr, n){
  if(!isoDateStr) return '';
  const [y,m,d] = isoDateStr.split('-').map(Number);
  let date = new Date(y, m-1, d);
  let count = 0;
  while(count<n){
    date = addDays(date,1);
    if(isBusinessDay(date)) count++;
  }
  return dateKey(date);
}

function fmtDate(d){ if(!d) return ''; return d; }
function uid(){ return 'p-' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

function blankProject(){
  return {
    id: uid(),
    createdAt: todayISO(),
    updatedAt: new Date().toISOString(),
    general:{nombre:'',ruta:'',descripcion:'',ubicacion:'',cliente:'',anio:String(new Date().getFullYear())},
    tramites: [], // [{fechaRadicacion,tipo,numero,nroRadicado,fechaActa}]
    entregas: [], // {type,fecha,obs,obs2,fechaEnvio,entregaCompleta,debidaForma,fechaRadicacion}
    estructural:{lastItemRow:null, fechaActualizacion:'', descripcion:'', elementos:{}, elementosDer:{}, memorias:{}, elementosExtra:[]},
    geotecnico:{items:{}, fechaActualizacion:'', descripcion:''},
    arquitectura:{items:{}},
    hidrosanitario:{elementos:{}, memorias:{}}
  };
}

/* ==================== PERSISTENCIA ====================
   Cada dispositivo guarda una copia local en localStorage (para abrir la
   app al instante y para que funcione sin conexión), pero la fuente de
   verdad compartida por todo el equipo es un archivo historial-db.json
   en la carpeta raíz de Drive (ver descargarDB/subirDB en drive.js).
   Cada proyecto lleva su propio "updatedAt"; al sincronizar se fusiona
   por proyecto (gana la versión más reciente), así que dos personas
   editando proyectos DISTINTOS al mismo tiempo no se pisan entre sí.
   Si editan el MISMO proyecto a la vez, sigue ganando quien guarde de
   último (igual que ya pasaba con el Excel).                          */
async function loadDB(){
  try{
    const res = await window.storage.get('historial-proyectos', false);
    if(res && res.value){ DB = JSON.parse(res.value); }
  }catch(e){ DB = {projects:[]}; }
  if(!DB.projects) DB.projects = [];
  if(!DB.deletedIds) DB.deletedIds = {};
}
async function persistLocalOnly(){
  try{
    await window.storage.set('historial-proyectos', JSON.stringify(DB), false);
  }catch(e){ console.error('Error guardando', e); toast('⚠ No se pudo guardar en el almacenamiento.'); }
}
async function saveDB(){
  const p = currentProject();
  if(p) p.updatedAt = new Date().toISOString();
  await persistLocalOnly();
  scheduleDriveSync();
}

/* ---------- sincronización con la base compartida en Drive ---------- */
let dbFileId = null;
let syncTimer = null;
let syncBusy = false;
let syncPending = false;

// Combina la copia local con la que baja de Drive: por cada proyecto se
// queda con el que tenga el "updatedAt" más reciente; las eliminaciones
// (deletedIds) se propagan igual, tomando la fecha de borrado más nueva.
function mergeDB(local, remote){
  local = local || {projects:[], deletedIds:{}};
  remote = remote || {projects:[], deletedIds:{}};

  const deletedIds = Object.assign({}, local.deletedIds);
  Object.keys(remote.deletedIds||{}).forEach(id=>{
    if(!deletedIds[id] || remote.deletedIds[id] > deletedIds[id]) deletedIds[id] = remote.deletedIds[id];
  });
  // Poda lápidas viejas para que el archivo no crezca indefinidamente.
  const limite = Date.now() - 180*24*60*60*1000;
  Object.keys(deletedIds).forEach(id=>{ if(new Date(deletedIds[id]).getTime() < limite) delete deletedIds[id]; });

  const map = new Map();
  (remote.projects||[]).forEach(p=> map.set(p.id, p));
  (local.projects||[]).forEach(p=>{
    const r = map.get(p.id);
    if(!r || !r.updatedAt || (p.updatedAt && p.updatedAt > r.updatedAt)) map.set(p.id, p);
  });

  const projects = Array.from(map.values()).filter(p=>{
    const borrado = deletedIds[p.id];
    if(!borrado) return true;
    // Si el proyecto se volvió a editar después de borrarse, se conserva (se "revivió").
    return p.updatedAt && p.updatedAt > borrado;
  });

  return { projects, deletedIds };
}

function scheduleDriveSync(){
  if(!Drive.conectado()) return; // no forzamos login en cada cambio, solo sincroniza si ya hay sesión abierta
  clearTimeout(syncTimer);
  syncTimer = setTimeout(pushLocalChange, 1500);
}

// Sube los cambios locales: descarga lo último de Drive, fusiona y vuelve a subir.
async function pushLocalChange(){
  if(!Drive.conectado()) return;
  if(syncBusy){ syncPending = true; return; }
  syncBusy = true;
  setSyncStatus('sync');
  try{
    const remoto = await Drive.descargarDB();
    if(remoto) dbFileId = remoto.id;
    const fusion = mergeDB(DB, remoto ? remoto.data : null);
    dbFileId = await Drive.subirDB(fusion, dbFileId);
    DB = fusion;
    await persistLocalOnly();
    renderProjectList();
    setSyncStatus('ok');
  }catch(e){
    console.error('No se pudo sincronizar con Drive', e);
    setSyncStatus('error', e.message);
  }finally{
    syncBusy = false;
    if(syncPending){ syncPending = false; pushLocalChange(); }
  }
}

// Trae los proyectos que hayan agregado o cambiado otras personas del equipo. No sube nada
// (eso ya lo hace pushLocalChange tras cada edición local), solo fusiona lo que baja de Drive.
async function pullFromDrive(opts){
  opts = opts || {};
  if(!Drive.conectado()){
    if(!opts.silent) toast('Conéctate a Drive para ver los proyectos del equipo.');
    return;
  }
  if(syncBusy) return;
  syncBusy = true;
  setSyncStatus('sync');
  try{
    const remoto = await Drive.descargarDB();
    if(remoto){
      dbFileId = remoto.id;
      const antes = DB.projects.length;
      DB = mergeDB(DB, remoto.data);
      await persistLocalOnly();
      renderProjectList();
      if(!opts.silent){
        const nuevos = DB.projects.length - antes;
        toast(nuevos>0 ? ('✓ '+nuevos+' proyecto(s) nuevo(s) del equipo.') : '✓ Lista de proyectos actualizada.');
      }
    }else if(!opts.silent){
      toast('Aún no hay proyectos compartidos en Drive. Se creará el archivo al guardar el primer cambio.');
    }
    setSyncStatus('ok');
  }catch(e){
    console.error('No se pudo actualizar desde Drive', e);
    setSyncStatus('error', e.message);
    if(!opts.silent) toast('⚠ '+e.message);
  }finally{
    syncBusy = false;
  }
}

// Handler del botón 🔄: conecta si hace falta y trae la lista del equipo.
async function manualSync(){
  const btn = document.getElementById('btnSync');
  if(btn) btn.disabled = true;
  try{
    if(!Drive.conectado()) await Drive.conectar();
    await pullFromDrive();
  }catch(e){
    toast('⚠ '+e.message);
  }finally{
    if(btn) btn.disabled = false;
    setSyncStatus();
  }
}

function setSyncStatus(state, detail){
  const el = document.getElementById('syncStatus');
  if(!el) return;
  if(state==='sync'){ el.textContent = '⏳ Sincronizando…'; el.className = 'syncstatus'; el.title=''; return; }
  if(state==='error'){ el.textContent = '⚠ Error al sincronizar'; el.className = 'syncstatus warn'; el.title = detail||''; return; }
  if(Drive.conectado()){
    el.textContent = '☁ Conectado';
    el.className = 'syncstatus ok';
    el.title = 'Viendo y editando los proyectos de todo el equipo.';
  }else{
    el.textContent = '○ Sin conectar';
    el.className = 'syncstatus';
    el.title = 'Solo ves tus proyectos locales. Pulsa 🔄 para conectar con Drive y ver los del equipo.';
  }
}

function findProjectByRuta(ruta, excludeId){
  const key = slugify(ruta);
  if(!key) return null;
  return DB.projects.find(p => p.id!==excludeId && slugify(p.general.ruta)===key);
}

/* ==================== UI: PROYECTOS ==================== */
function newProject(){
  const p = blankProject();
  DB.projects.unshift(p);
  currentId = p.id;
  currentTab = 'general';
  saveDB();
  renderAll();
}

function selectProject(id){
  currentId = id;
  currentTab = 'general';
  renderAll();
}

function renderProjectList(){
  const list = document.getElementById('projList');
  const q = (document.getElementById('searchBox').value||'').toLowerCase();
  list.innerHTML = '';
  const projects = DB.projects.filter(p=>{
    const s = (p.general.ruta+' '+p.general.descripcion+' '+p.general.cliente+' '+p.general.ubicacion+' '+p.general.nombre).toLowerCase();
    return s.includes(q);
  });
  if(projects.length===0){
    list.innerHTML = '<div style="padding:14px;color:rgba(255,255,255,.5);font-size:12px;">Sin proyectos aún. Crea uno con "+ Nuevo proyecto".</div>';
    return;
  }
  // Agrupar como carpetas por año
  const groups = {};
  projects.forEach(p=>{
    const y = p.general.anio || 'Sin año';
    (groups[y] = groups[y]||[]).push(p);
  });
  const years = Object.keys(groups).sort((a,b)=> b.localeCompare(a,undefined,{numeric:true}));
  years.forEach(y=>{
    const yearHead = document.createElement('div');
    yearHead.className = 'yearHead';
    yearHead.textContent = '📁 ' + y;
    list.appendChild(yearHead);
    groups[y].forEach(p=>{
      const div = document.createElement('div');
      div.className = 'projitem' + (p.id===currentId?' active':'');
      const name = p.general.nombre || p.general.descripcion || p.general.ruta || '(Proyecto sin nombre)';
      div.innerHTML = `<div class="pname" title="Abrir proyecto">${escapeHtml(name)}<small>${escapeHtml(p.general.ubicacion||'sin ubicación')}</small></div>
        <button class="delbtn" title="Eliminar proyecto del dashboard">✕</button>`;
      div.querySelector('.pname').onclick = ()=>selectProject(p.id);
      div.querySelector('.delbtn').onclick = (ev)=>{ ev.stopPropagation(); deleteProject(p.id); };
      list.appendChild(div);
    });
  });
}

function deleteProject(id){
  const p = DB.projects.find(x=>x.id===id);
  if(!p) return;
  const name = p.general.nombre || p.general.descripcion || p.general.ruta || '(Proyecto sin nombre)';
  const ok = confirm('¿Eliminar el proyecto "'+name+'" del dashboard?\n\nSi hay conexión con Drive, se elimina para todo el equipo. Esto solo borra el registro del dashboard: no elimina ni modifica ningún archivo Excel que ya hayas guardado en tu carpeta o Drive.');
  if(!ok) return;
  if(!DB.deletedIds) DB.deletedIds = {};
  DB.deletedIds[id] = new Date().toISOString();
  DB.projects = DB.projects.filter(x=>x.id!==id);
  if(currentId===id){
    currentId = DB.projects.length>0 ? DB.projects[0].id : null;
    currentTab = 'general';
  }
  saveDB();
  renderAll();
  toast('🗑 Proyecto "'+name+'" eliminado del dashboard.');
}

function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function currentProject(){ return DB.projects.find(p=>p.id===currentId); }

/* ==================== RENDER PRINCIPAL ==================== */
function renderAll(){
  renderProjectList();
  renderTopbar();
  renderTabs();
  renderContent();
}

function renderTopbar(){
  const p = currentProject();
  document.getElementById('projTitle').textContent = p ? (p.general.nombre || p.general.descripcion || p.general.ruta || 'Proyecto sin nombre') : 'Selecciona o crea un proyecto';
  document.getElementById('projSub').textContent = p ? (p.general.ruta ? '📂 '+p.general.ruta : 'Sin ruta de carpeta asignada') : '';
}

function renderTabs(){
  const bar = document.getElementById('tabsBar');
  bar.innerHTML = '';
  const p = currentProject();
  TABS.forEach(t=>{
    const el = document.createElement('div');
    el.className = 'tab' + (currentTab===t.id?' active':'');
    el.textContent = t.label;
    if(p) el.onclick = ()=>{ currentTab=t.id; renderContent(); renderTabs(); };
    else el.style.opacity = .4;
    bar.appendChild(el);
  });
}

function renderContent(){
  const c = document.getElementById('content');
  const p = currentProject();
  if(!p){
    c.innerHTML = '<div class="empty">Crea un proyecto nuevo o selecciona uno existente en la barra lateral para comenzar a diligenciar su historial.</div>';
    return;
  }
  if(currentTab==='general') return renderGeneral(p,c);
  if(currentTab==='estructural') return renderEstructural(p,c);
  if(currentTab==='geotecnico') return renderGeotecnico(p,c);
  if(currentTab==='arquitectura') return renderArquitectura(p,c);
  if(currentTab==='hidrosanitario') return renderHidrosanitario(p,c);
}

/* ---------- TAB GENERAL ---------- */
function renderGeneral(p,c){
  if(!Array.isArray(p.tramites)) p.tramites = [];
  const yearsOpts = (()=>{ const cur=new Date().getFullYear(); let o=''; for(let y=cur+2;y>=2018;y--) o+=`<option value="${y}" ${String(p.general.anio)===String(y)?'selected':''}>${y}</option>`; return o; })();
  c.innerHTML = `
   <div class="card">
     <h3>Información general del proyecto</h3>
     <div class="hint">Los cambios se guardan automáticamente al salir de cada campo.</div>
     <div class="grid2">
       <div class="field"><label>Nombre del proyecto</label><input id="g_nombre" value="${escapeHtml(p.general.nombre)}" placeholder="Ej: Edificio Los Alpes" onblur="autoSaveGeneral()"></div>
       <div class="field"><label>Cliente</label><input id="g_cliente" value="${escapeHtml(p.general.cliente)}" onblur="autoSaveGeneral()"></div>
     </div>
     <div class="grid2">
       <div class="field"><label>Ruta de la carpeta</label><input id="g_ruta" value="${escapeHtml(p.general.ruta)}" placeholder="\\\\servidor\\Proyectos\\2026\\..." onblur="autoSaveGeneral()"></div>
       <div class="field"><label>Ubicación (Municipio)</label><input id="g_ubicacion" value="${escapeHtml(p.general.ubicacion)}" onblur="autoSaveGeneral()"></div>
     </div>
     <div class="grid2">
       <div class="field"><label>Año del proyecto</label><select id="g_anio" onchange="autoSaveGeneral()">${yearsOpts}</select></div>
       <div class="field"><label>Descripción breve de la edificación</label><input id="g_descripcion" value="${escapeHtml(p.general.descripcion)}" placeholder="Ej: Vivienda de 1 nivel con sistema PRM en concreto en Rionegro" onblur="autoSaveGeneral()"></div>
     </div>
   </div>

   <div class="card">
     <h3>Trámites</h3>
     <div class="hint">Radicación ante Planeación o Curaduría. La plantilla del Excel trae 3 filas listas para esto; si necesitas registrar más de 3, se agregan igual, como filas adicionales. Las fechas de vencimiento y prórroga se calculan en días hábiles colombianos (excluyendo fines de semana y festivos, incluida Semana Santa) contados a partir del día siguiente al Acta de Observaciones.</div>
     <div class="grid3">
       <div class="field"><label>Fecha de radicación</label><input type="date" id="tr_fecha_rad" value="${todayISO()}"></div>
       <div class="field"><label>Trámite ante</label>
         <select id="tr_tipo" onchange="onTipoTramiteChange()">
           <option value="Curaduría">Curaduría</option>
           <option value="Planeación">Planeación</option>
         </select>
       </div>
       <div class="field" id="tr_numero_wrap"><label>N.º de curaduría</label>
         <select id="tr_numero">${[1,2,3,4].map(n=>`<option value="${n}">${n}</option>`).join('')}</select>
       </div>
     </div>
     <div class="grid2">
       <div class="field"><label>N.º de radicado</label><input id="tr_nro_radicado"></div>
       <div class="field"><label>Fecha de Acta de Observaciones</label><input type="date" id="tr_fecha_acta"></div>
     </div>
     <div class="row-actions"><button class="primary" onclick="addTramite()">+ Agregar trámite</button></div>
     <table class="mini">
       <thead><tr><th>Trámite ante</th><th>N.º radicado</th><th>Fecha radicación</th><th>Fecha acta</th><th>Vence obs. (30h)</th><th>Prórroga (45h)</th><th></th></tr></thead>
       <tbody>${p.tramites.map((t,i)=>{
          const venc = t.fechaActa ? addBusinessDays(t.fechaActa,30) : '';
          const pror = t.fechaActa ? addBusinessDays(t.fechaActa,45) : '';
          const tipoLabel = t.tipo==='Curaduría' ? ('Curaduría '+(t.numero||'')) : 'Planeación';
          return `<tr>
            <td>${escapeHtml(tipoLabel)}</td><td>${escapeHtml(t.nroRadicado||'')}</td><td>${t.fechaRadicacion||''}</td><td>${t.fechaActa||''}</td><td>${venc}</td><td>${pror}</td>
            <td><button class="secondary" onclick="removeTramite(${i})">✕</button></td>
          </tr>`;
       }).join('') || '<tr><td colspan="7" style="color:#999;">Sin trámites registrados todavía.</td></tr>'}</tbody>
     </table>
   </div>

   <div class="card">

     <h3>Registrar entrega</h3>
     <div class="hint">El tipo de entrega define automáticamente en qué bloque del Excel (EE, RAC, RAP, REC, REP, EC, EP, ES, DH) y en qué consecutivo (1 a 5) se ubicará.</div>
     <div class="grid3">
       <div class="field"><label>Tipo de entrega</label>
         <select id="e_tipo" onchange="renderEntregaExtra()">
           ${Object.keys(DELIVERY_TYPES).map(k=>`<option value="${k}">${DELIVERY_TYPES[k].label}</option>`).join('')}
         </select>
       </div>
       <div class="field"><label>Fecha</label><input type="date" id="e_fecha" value="${todayISO()}"></div>
       <div class="field" id="e_envio_wrap"><label id="e_envio_label">Fecha de envío</label><input type="date" id="e_envio"></div>
     </div>
     <div class="grid2">
       <div class="field" id="e_obs_wrap"><label id="e_obs_label">Observaciones de entrega</label><textarea id="e_obs"></textarea></div>
       <div class="field" id="e_obs2_wrap"><label id="e_obs2_label">Observaciones diagramación</label><textarea id="e_obs2"></textarea></div>
     </div>
     <div id="e_extra_ee" class="grid3" style="display:none;">
       <div class="field"><label>¿Entrega completa?</label><select id="e_completa"><option>No</option><option>Sí</option></select></div>
       <div class="field"><label>¿Debida forma?</label><select id="e_debida"><option>No</option><option>Sí</option></select></div>
       <div class="field"><label>Fecha de radicación</label><input type="date" id="e_radicacion"></div>
     </div>
     <div class="row-actions"><button class="primary" onclick="addEntrega()">+ Agregar entrega</button></div>
     <table class="mini">
       <thead><tr><th>Tipo</th><th>Consecutivo</th><th>Fecha</th><th>Observaciones</th><th></th></tr></thead>
       <tbody>${p.entregas.map((e,i)=>`<tr>
          <td>${e.type}</td><td>${slotLabel(p,e,i)}</td><td>${e.fecha||''}</td><td>${escapeHtml(e.obs||'')}</td>
          <td><button class="secondary" onclick="removeEntrega(${i})">✕</button></td>
       </tr>`).join('') || '<tr><td colspan="5" style="color:#999;">Sin entregas registradas todavía.</td></tr>'}</tbody>
     </table>
   </div>
  `;
  renderEntregaExtra();
}

function slotLabel(p,e,i){
  const sameType = p.entregas.filter(x=>x.type===e.type);
  const idx = sameType.indexOf(e);
  return e.type+'-'+(idx+1);
}

function renderEntregaExtra(){
  const tipo = document.getElementById('e_tipo').value;
  const cfg = DELIVERY_TYPES[tipo];
  document.getElementById('e_obs_label').textContent = cfg.obsLabel;
  document.getElementById('e_obs2_label').textContent = cfg.obs2Label;
  document.getElementById('e_envio_label').textContent = cfg.envioLabel;
  document.getElementById('e_extra_ee').style.display = cfg.extraEE ? 'grid' : 'none';
}

function autoSaveGeneral(){
  const p = currentProject();
  if(!p) return;
  const newRuta = document.getElementById('g_ruta').value.trim();
  const dup = findProjectByRuta(newRuta, p.id);
  if(dup){
    toast('⚠ Ya existe un proyecto con esa ruta: "'+ (dup.general.nombre||dup.general.descripcion||dup.general.ruta) +'". Se actualizará ese proyecto en su lugar.');
    dup.general = {nombre:document.getElementById('g_nombre').value, ruta:newRuta, cliente:document.getElementById('g_cliente').value, ubicacion:document.getElementById('g_ubicacion').value, descripcion:document.getElementById('g_descripcion').value, anio:document.getElementById('g_anio').value};
    DB.projects = DB.projects.filter(x=>x.id!==p.id);
    currentId = dup.id;
    saveDB(); renderAll();
    return;
  }
  p.general = {nombre:document.getElementById('g_nombre').value, ruta:newRuta, cliente:document.getElementById('g_cliente').value, ubicacion:document.getElementById('g_ubicacion').value, descripcion:document.getElementById('g_descripcion').value, anio:document.getElementById('g_anio').value};
  saveDB();
  renderProjectList();
  renderTopbar();
}

function onTipoTramiteChange(){
  const tipo = document.getElementById('tr_tipo').value;
  document.getElementById('tr_numero_wrap').style.display = tipo==='Curaduría' ? '' : 'none';
}
function addTramite(){
  const p = currentProject();
  if(!Array.isArray(p.tramites)) p.tramites = [];
  if(p.tramites.length>=3){
    if(!confirm('Ya hay 3 trámites registrados (las 3 filas que trae la plantilla del Excel para esta sección). ¿Deseas agregar uno más de todas formas? Se anexará como fila adicional debajo de esa sección.')) return;
  }
  const tipo = document.getElementById('tr_tipo').value;
  const t = {
    fechaRadicacion: document.getElementById('tr_fecha_rad').value,
    tipo: tipo,
    numero: tipo==='Curaduría' ? document.getElementById('tr_numero').value : '',
    nroRadicado: document.getElementById('tr_nro_radicado').value,
    fechaActa: document.getElementById('tr_fecha_acta').value
  };
  p.tramites.push(t);
  saveDB();
  toast('✓ Trámite agregado.');
  renderContent();
}
function removeTramite(i){
  const p = currentProject();
  p.tramites.splice(i,1);
  saveDB();
  renderContent();
}

function addEntrega(){
  const p = currentProject();
  const tipo = document.getElementById('e_tipo').value;
  const cfg = DELIVERY_TYPES[tipo];
  const countExisting = p.entregas.filter(e=>e.type===tipo).length;
  if(countExisting>=DELIVERY_SLOTS){
    if(!confirm('Ya existen '+DELIVERY_SLOTS+' entregas tipo '+tipo+' (se llenaron los consecutivos 1 a 5 del formato). ¿Deseas registrarla de todas formas? Se anexará como fila adicional en el Excel.')) return;
  }
  const e = {
    type:tipo, fecha:document.getElementById('e_fecha').value, obs:document.getElementById('e_obs').value,
    obs2:document.getElementById('e_obs2').value, fechaEnvio:document.getElementById('e_envio').value
  };
  if(cfg.extraEE){
    e.entregaCompleta = document.getElementById('e_completa').value;
    e.debidaForma = document.getElementById('e_debida').value;
    e.fechaRadicacion = document.getElementById('e_radicacion').value;
  }
  p.entregas.push(e);
  saveDB();
  toast('✓ Entrega '+tipo+'-'+(countExisting+1)+' agregada.');
  renderContent();
}
function removeEntrega(i){
  const p = currentProject();
  p.entregas.splice(i,1);
  saveDB(); renderContent();
}

/* ---------- TAB ESTRUCTURAL ---------- */
function elemVal(p, side, key, field){
  const store = side==='left' ? p.estructural.elementos : p.estructural.elementosDer;
  return (store && store[key] && store[key][field]) || 'No';
}
function memVal(p, key, field){
  return (p.estructural.memorias && p.estructural.memorias[key] && p.estructural.memorias[key][field]) || 'No';
}
function toggleElem(side, key, field, checked){
  const p = currentProject();
  if(!p.estructural.elementos) p.estructural.elementos = {};
  if(!p.estructural.elementosDer) p.estructural.elementosDer = {};
  const store = side==='left' ? p.estructural.elementos : p.estructural.elementosDer;
  if(!store[key]) store[key] = {};
  store[key][field] = checked ? 'Sí' : 'No';
  saveDB();
}
function addElementoExtra(){
  const p = currentProject();
  const input = document.getElementById('elem_extra_new');
  const label = input.value.trim();
  if(!label){ toast('Escribe el nombre del elemento antes de agregarlo.'); return; }
  if(!p.estructural.elementosExtra) p.estructural.elementosExtra = [];
  p.estructural.elementosExtra.push({label, realizado:'No', diagramado:'No'});
  saveDB();
  renderContent();
}
function toggleElemExtra(i, field, checked){
  const p = currentProject();
  if(!p.estructural.elementosExtra || !p.estructural.elementosExtra[i]) return;
  p.estructural.elementosExtra[i][field] = checked ? 'Sí' : 'No';
  saveDB();
}
function removeElemExtra(i){
  const p = currentProject();
  p.estructural.elementosExtra.splice(i,1);
  saveDB();
  renderContent();
}
function toggleMemoria(key, field, checked){
  const p = currentProject();
  if(!p.estructural.memorias) p.estructural.memorias = {};
  if(!p.estructural.memorias[key]) p.estructural.memorias[key] = {};
  p.estructural.memorias[key][field] = checked ? 'Sí' : 'No';
  saveDB();
}
function selEstado(row, value){
  const opts = ['', 'Falta', 'No aplica', 'No cumple'];
  return `<select onchange="setGeoEstado(${row},this.value)">` + opts.map(o=>`<option value="${o}" ${value===o?'selected':''}>${o===''?'—':o}</option>`).join('') + `</select>`;
}
function toggleGeoRealizado(row, checked){
  const p = currentProject();
  if(!p.geotecnico.items) p.geotecnico.items = {};
  if(!p.geotecnico.items[row]) p.geotecnico.items[row] = {realizado:'No', estado:geoVal(p,row,'estado')};
  p.geotecnico.items[row].realizado = checked ? 'Sí' : 'No';
  saveDB();
}
function setGeoEstado(row, value){
  const p = currentProject();
  if(!p.geotecnico.items) p.geotecnico.items = {};
  if(!p.geotecnico.items[row]) p.geotecnico.items[row] = {realizado:geoVal(p,row,'realizado'), estado:''};
  p.geotecnico.items[row].estado = value;
  saveDB();
}
function geoVal(p, row, field){
  const it = p.geotecnico.items && p.geotecnico.items[row];
  if(it && it[field]!==undefined && it[field]!==null) return it[field];
  if(field==='estado') return GEO_DEFAULT_NA.includes(row) ? 'No aplica' : '';
  return 'No';
}
function renderEstructural(p,c){
  if(!p.estructural.elementos) p.estructural.elementos = {};
  if(!p.estructural.elementosDer) p.estructural.elementosDer = {};
  if(!p.estructural.memorias) p.estructural.memorias = {};
  if(!p.estructural.elementosExtra) p.estructural.elementosExtra = [];
  const options = STRUCT_STAGES.map(st=>{
    return `<optgroup label="${escapeHtml(st.stage)}">` +
      st.items.map(it=>`<option value="${it[0]}" ${p.estructural.lastItemRow==it[0]?'selected':''}>${escapeHtml(it[1])}</option>`).join('') +
      `</optgroup>`;
  }).join('');

  const leftRows = ELEM_LEFT.map(([key,label])=>`
    <div class="checkrow"><span>${label}</span>
      <input type="checkbox" ${elemVal(p,'left',key,'realizado')==='Sí'?'checked':''} onchange="toggleElem('left','${key}','realizado',this.checked)">
      <input type="checkbox" ${elemVal(p,'left',key,'diagramado')==='Sí'?'checked':''} onchange="toggleElem('left','${key}','diagramado',this.checked)">
    </div>`).join('');
  const rightRows = ELEM_RIGHT.map(([key,label])=>`
    <div class="checkrow"><span>${label}</span>
      <input type="checkbox" ${elemVal(p,'right',key,'realizado')==='Sí'?'checked':''} onchange="toggleElem('right','${key}','realizado',this.checked)">
      <input type="checkbox" ${elemVal(p,'right',key,'diagramado')==='Sí'?'checked':''} onchange="toggleElem('right','${key}','diagramado',this.checked)">
    </div>`).join('');
  const extraRows = p.estructural.elementosExtra.map((el,i)=>`
    <div class="checkrowx"><span>${escapeHtml(el.label)}</span>
      <input type="checkbox" ${el.realizado==='Sí'?'checked':''} onchange="toggleElemExtra(${i},'realizado',this.checked)">
      <input type="checkbox" ${el.diagramado==='Sí'?'checked':''} onchange="toggleElemExtra(${i},'diagramado',this.checked)">
      <button class="delbtnx" title="Quitar elemento" onclick="removeElemExtra(${i})">✕</button>
    </div>`).join('');
  const memRows = MEMORIAS_ITEMS.map(([key,label])=>`
    <div class="checkrow"><span>${label}</span>
      <input type="checkbox" ${memVal(p,key,'radicacion')==='Sí'?'checked':''} onchange="toggleMemoria('${key}','radicacion',this.checked)">
      <input type="checkbox" ${memVal(p,key,'subsanacion')==='Sí'?'checked':''} onchange="toggleMemoria('${key}','subsanacion',this.checked)">
    </div>`).join('');

  c.innerHTML = `
   <div class="card">
     <h3>Punto en el que se dejó el diseño estructural</h3>
     <div class="hint">Selecciona el último ítem completado de la lista de chequeo. Se marcarán automáticamente como realizados (✔) todos los ítems anteriores y este mismo, guardando la fecha de actualización. Los cambios se guardan solos, al elegir el ítem o al salir del campo de descripción.</div>
     <div class="field"><label>Último ítem completado</label>
       <select id="s_item" onchange="autoSaveEstructuralItem()">${options}</select>
     </div>
     <div class="field"><label>Descripción estructural del proyecto</label>
       <textarea id="s_desc" style="min-height:110px;" placeholder="Describe el proyecto estructuralmente: sistema estructural, niveles, materiales, particularidades..." onblur="autoSaveEstructuralDesc()">${escapeHtml(p.estructural.descripcion)}</textarea>
     </div>
     ${p.estructural.fechaActualizacion ? `<div class="hint">Última actualización guardada: <b>${p.estructural.fechaActualizacion}</b></div>` : ''}
   </div>

   <div class="card">
     <h3>Información actualizada a última versión del proyecto</h3>
     <div class="hint">Refleja el estado de "¿Realizado?" y "¿Diagramado?" de cada elemento, tal como aparece en la hoja GENERAL del Excel. Cada casilla se guarda automáticamente al marcarla.</div>
     <div class="checkcols">
       <div class="checkgrid">
         <div class="checkhead"><span>Elemento</span><span>¿Realizado?</span><span>¿Diagramado?</span></div>
         ${leftRows}
       </div>
       <div class="checkgrid">
         <div class="checkhead"><span>Elemento</span><span>¿Realizado?</span><span>¿Diagramado?</span></div>
         ${rightRows}
       </div>
     </div>
     <div class="stagegroup" style="margin-top:18px;margin-bottom:4px;">Elementos adicionales</div>
     <div class="hint">Elementos que no están en la lista estándar. Se crean como filas nuevas al final de la hoja GENERAL del Excel (a partir de la fila 130, dejando margen para la sección de Trámites), sin afectar ninguna celda existente.</div>
     <div class="checkgrid">
       <div class="checkrowx" style="border-bottom:1px solid var(--border);font-size:11px;font-weight:700;color:var(--muted);"><span>Elemento</span><span>¿Realizado?</span><span>¿Diagramado?</span><span></span></div>
       ${extraRows || '<div style="padding:8px 0;color:var(--muted);font-size:13px;">Sin elementos adicionales todavía.</div>'}
     </div>
     <div class="row-actions" style="margin-top:10px;">
       <input id="elem_extra_new" placeholder="Nombre del nuevo elemento (ej: Muro de contención en gaviones)" style="flex:1;min-width:220px;padding:9px 10px;border:1px solid var(--border);border-radius:6px;font-size:13px;">
       <button class="secondary" onclick="addElementoExtra()">+ Agregar elemento</button>
     </div>
   </div>

   <div class="card">
     <h3>Contenido de las memorias de cálculo</h3>
     <div class="hint">Marca el estado de Radicación y Subsanación de cada punto exigido en las memorias de cálculo. Se guarda automáticamente al marcar cada casilla.</div>
     <div class="checkgrid">
       <div class="checkhead"><span>Punto</span><span>Radicación</span><span>Subsanación</span></div>
       ${memRows}
     </div>
   </div>
  `;
}
function autoSaveEstructuralItem(){
  const p = currentProject();
  p.estructural.lastItemRow = parseInt(document.getElementById('s_item').value,10);
  p.estructural.fechaActualizacion = todayISO();
  saveDB();
}
function autoSaveEstructuralDesc(){
  const p = currentProject();
  p.estructural.descripcion = document.getElementById('s_desc').value;
  p.estructural.fechaActualizacion = todayISO();
  saveDB();
}

/* ---------- TAB GEOTECNICO ---------- */
function renderGeotecnico(p,c){
  if(!p.geotecnico.items) p.geotecnico.items = {};
  const sections = GEO_STAGES.map(st=>{
    const rows = st.items.map(([row,label])=>`
      <div class="checkrow"><span>${escapeHtml(label)}</span>
        <input type="checkbox" ${geoVal(p,row,'realizado')==='Sí'?'checked':''} onchange="toggleGeoRealizado(${row},this.checked)">
        ${GEO_DEFAULT_NA.includes(row) ? selEstado(row, geoVal(p,row,'estado')) : '<span style="color:var(--muted);text-align:center;">—</span>'}
      </div>`).join('');
    return `
      <div class="stagegroup" style="margin-top:16px;margin-bottom:4px;">${escapeHtml(st.stage)}</div>
      <div class="checkgrid">
        <div class="checkhead3"><span>Ítem</span><span>¿Realizado?</span><span>Estado</span></div>
        ${rows}
      </div>`;
  }).join('');

  c.innerHTML = `
   <div class="card">
     <h3>Checklist de Estudio de Suelos</h3>
     <div class="hint">Refleja tal cual la hoja "ESTUDIOS DE SUELOS" del Excel: marca si cada ítem está realizado. El desplegable de Estado (Falta / No aplica / No cumple) solo aparece en los ítems que lo tienen en el archivo maestro; el resto no lo usa. Cada casilla y cada estado se guardan automáticamente al marcarlos.</div>
     ${sections}
     <div class="field" style="margin-top:16px;"><label>Descripción geotécnica del proyecto</label>
       <textarea id="geo_desc" style="min-height:110px;" placeholder="Tipo de suelo, capacidad portante, nivel freático, recomendaciones de cimentación..." onblur="autoSaveGeoDesc()">${escapeHtml(p.geotecnico.descripcion)}</textarea>
     </div>
     ${p.geotecnico.fechaActualizacion ? `<div class="hint">Última actualización guardada: <b>${p.geotecnico.fechaActualizacion}</b></div>` : ''}
   </div>
  `;
}
function autoSaveGeoDesc(){
  const p = currentProject();
  p.geotecnico.descripcion = document.getElementById('geo_desc').value;
  p.geotecnico.fechaActualizacion = todayISO();
  saveDB();
}

/* ---------- TAB ARQUITECTURA ---------- */
/* ---------- TAB ARQUITECTURA ---------- */
function arqVal(p, row, field){
  if(!p.arquitectura.items) p.arquitectura.items = {};
  const it = p.arquitectura.items[row];
  if(it && it[field]!==undefined && it[field]!==null) return it[field];
  return field==='estado' ? 'Sí' : '';
}
function selEstadoArq(row, value){
  const opts = ['Sí','No','No aplica'];
  return `<select onchange="setArqEstado(${row},this.value)">` + opts.map(o=>`<option value="${o}" ${value===o?'selected':''}>${o}</option>`).join('') + `</select>`;
}
function setArqEstado(row, value){
  const p = currentProject();
  if(!p.arquitectura.items) p.arquitectura.items = {};
  if(!p.arquitectura.items[row]) p.arquitectura.items[row] = {estado:'Sí', comentario:''};
  p.arquitectura.items[row].estado = value;
  saveDB();
}
function setArqComentario(row, value){
  const p = currentProject();
  if(!p.arquitectura.items) p.arquitectura.items = {};
  if(!p.arquitectura.items[row]) p.arquitectura.items[row] = {estado:'Sí', comentario:''};
  p.arquitectura.items[row].comentario = value;
  saveDB();
}
function renderArquitectura(p,c){
  if(!p.arquitectura.items) p.arquitectura.items = {};
  const rows = ARQ_ITEMS.map(([key,label,row])=>`
    <div class="checkrowarq"><span>${escapeHtml(label)}</span>
      ${selEstadoArq(row, arqVal(p,row,'estado'))}
      <input value="${escapeHtml(arqVal(p,row,'comentario'))}" placeholder="Comentarios" onblur="setArqComentario(${row},this.value)">
    </div>`).join('');
  c.innerHTML = `
   <div class="card">
     <h3>Historial de diseño arquitectónico</h3>
     <div class="hint">Refleja tal cual la hoja "ARQUITECTURA" del Excel: cada elemento tiene su estado (Sí / No / No aplica) y un comentario libre. Se guarda automáticamente al elegir el estado o al salir del campo de comentario.</div>
     <div class="checkgridarq">
       <div class="checkheadarq"><span>Elemento</span><span>Estado</span><span>Comentarios</span></div>
       ${rows}
     </div>
   </div>
  `;
}

/* ---------- TAB HIDROSANITARIO ---------- */
function hsVal(p, group, key, field){
  const store = group==='elem' ? p.hidrosanitario.elementos : p.hidrosanitario.memorias;
  const it = store && store[key];
  if(it && it[field]!==undefined && it[field]!==null) return it[field];
  return 'No';
}
function toggleHs(group, key, field, checked){
  const p = currentProject();
  if(!p.hidrosanitario.elementos) p.hidrosanitario.elementos = {};
  if(!p.hidrosanitario.memorias) p.hidrosanitario.memorias = {};
  const store = group==='elem' ? p.hidrosanitario.elementos : p.hidrosanitario.memorias;
  if(!store[key]) store[key] = {};
  store[key][field] = checked ? 'Sí' : 'No';
  saveDB();
}
function renderHidrosanitario(p,c){
  if(!p.hidrosanitario.elementos) p.hidrosanitario.elementos = {};
  if(!p.hidrosanitario.memorias) p.hidrosanitario.memorias = {};
  const elemRows = HS_ELEM_ITEMS.map(([key,label])=>`
    <div class="checkrow"><span>${escapeHtml(label)}</span>
      <input type="checkbox" ${hsVal(p,'elem',key,'realizado')==='Sí'?'checked':''} onchange="toggleHs('elem','${key}','realizado',this.checked)">
      <input type="checkbox" ${hsVal(p,'elem',key,'diagramado')==='Sí'?'checked':''} onchange="toggleHs('elem','${key}','diagramado',this.checked)">
    </div>`).join('');
  const memRows = HS_MEMORIAS_ITEMS.map(([key,label])=>`
    <div class="checkrow"><span>${escapeHtml(label)}</span>
      <input type="checkbox" ${hsVal(p,'mem',key,'radicacion')==='Sí'?'checked':''} onchange="toggleHs('mem','${key}','radicacion',this.checked)">
      <input type="checkbox" ${hsVal(p,'mem',key,'subsanacion')==='Sí'?'checked':''} onchange="toggleHs('mem','${key}','subsanacion',this.checked)">
    </div>`).join('');
  c.innerHTML = `
   <div class="card">
     <h3>Elementos de diseño hidrosanitario</h3>
     <div class="hint">Refleja tal cual la hoja "HIDROSANITARIO" del Excel. Cada casilla se guarda automáticamente al marcarla.</div>
     <div class="checkgrid">
       <div class="checkhead"><span>Actividad</span><span>¿Realizado?</span><span>¿Diagramado?</span></div>
       ${elemRows}
     </div>
   </div>
   <div class="card">
     <h3>Contenido de las memorias de cálculo</h3>
     <div class="hint">Marca el estado de Radicación y Subsanación de cada punto exigido en las memorias de cálculo hidrosanitario.</div>
     <div class="checkgrid">
       <div class="checkhead"><span>Punto</span><span>Radicación</span><span>Subsanación</span></div>
       ${memRows}
     </div>
   </div>
  `;
}

/* ==================== TOAST ==================== */
let toastTimer=null;
function toast(msg){
  let el = document.getElementById('toastEl');
  if(!el){ el=document.createElement('div'); el.id='toastEl'; el.className='toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.style.display='block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ el.style.display='none'; }, 4000);
}

/* ==================== EXPORTACIÓN A EXCEL ==================== */

function b64ToArrayBuffer(b64){
  const bin = atob(b64);
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for(let i=0;i<bin.length;i++) view[i]=bin.charCodeAt(i);
  return buf;
}

function boolToYesNo(v){ return v==='Sí' ? 'Sí' : 'No'; }

/* Arma un archivo .xlsx completo (ArrayBuffer) a partir de un proyecto.
   - p:    el proyecto
   - base: ArrayBuffer de un .xlsx ya existente (el que está en Drive), o
           null/omitido para partir de la plantilla maestra.
   Solo se escriben celdas con valor (igual que hacía el setCell()
   original), así que lo que la app tenga vacío no borra lo que ya haya
   en el archivo base. El formato (colores, fuentes, bordes) se conserva
   porque solo se toca el contenido de la celda, nunca su estilo — ver
   xlsxpatch.js. */
async function buildWorkbook(p, base){
  const escrituras = {}; // { 'NOMBRE HOJA': [{addr,value,type}, ...] }
  function W(hoja, addr, value, type){
    if(value===undefined || value===null || value==='') return;
    (escrituras[hoja] = escrituras[hoja] || []).push({addr, value, type});
  }

  /* ---- HOJA GENERAL ---- */
  const G = 'GENERAL';
  W(G,'D2', p.general.ruta||'');
  W(G,'D4', p.general.descripcion||'');
  W(G,'D6', p.general.ubicacion||'');
  W(G,'B7','CLIENTE');
  W(G,'D7', p.general.cliente||'');

  // Información actualizada a última versión del proyecto (filas 76-86)
  if(p.estructural.elementos){
    ELEM_LEFT.forEach(([key,label,row])=>{
      const v = p.estructural.elementos[key];
      if(v){ W(G,'D'+row, v.realizado||'No'); W(G,'E'+row, v.diagramado||'No'); }
    });
  }
  if(p.estructural.elementosDer){
    ELEM_RIGHT.forEach(([key,label,row])=>{
      const v = p.estructural.elementosDer[key];
      if(v){ W(G,'G'+row, v.realizado||'No'); W(G,'H'+row, v.diagramado||'No'); }
    });
  }
  // Contenido de las memorias de cálculo (filas 90-97)
  if(p.estructural.memorias){
    MEMORIAS_ITEMS.forEach(([key,label,row])=>{
      const v = p.estructural.memorias[key];
      if(v){ W(G,'D'+row, v.radicacion||'No'); W(G,'G'+row, v.subsanacion||'No'); }
    });
  }
  // Trámites (filas 115-117; si hay más de 3, se anexan filas adicionales debajo)
  if(Array.isArray(p.tramites)){
    p.tramites.forEach((t,i)=>{
      const row = 115+i;
      W(G,'B'+row, t.fechaRadicacion||'');
      W(G,'D'+row, t.tipo||'');
      if(t.tipo==='Curaduría') W(G,'E'+row, t.numero||'');
      W(G,'F'+row, t.nroRadicado||'');
      W(G,'G'+row, t.fechaActa||'');
      if(t.fechaActa){
        W(G,'H'+row, addBusinessDays(t.fechaActa,30));
        W(G,'J'+row, addBusinessDays(t.fechaActa,45));
      }
    });
  }
  // Elementos adicionales (no vienen en la plantilla original: se anexan como filas nuevas desde la fila 130,
  // dejando margen de sobra para la sección de Trámites)
  if(p.estructural.elementosExtra && p.estructural.elementosExtra.length){
    W(G,'B130','ELEMENTOS ADICIONALES');
    W(G,'B131','Elemento'); W(G,'D131','¿Realizado?'); W(G,'E131','¿Diagramado?');
    p.estructural.elementosExtra.forEach((el,i)=>{
      const row = 132+i;
      W(G,'B'+row, el.label||'');
      W(G,'D'+row, el.realizado||'No');
      W(G,'E'+row, el.diagramado||'No');
    });
  }

  // Entregas: agrupar por tipo y volcarlas en orden en su bloque
  const byType = {};
  p.entregas.forEach(e=>{ (byType[e.type] = byType[e.type]||[]).push(e); });
  Object.keys(byType).forEach(type=>{
    const cfg = DELIVERY_TYPES[type];
    byType[type].forEach((e,i)=>{
      const row = cfg.startRow + i; // si excede 5, se anexa fila adicional debajo del bloque
      W(G, cfg.cols.fecha+row, e.fecha||'');
      W(G, cfg.cols.obs+row, e.obs||'');
      W(G, cfg.cols.obs2+row, e.obs2||'');
      W(G, cfg.cols.fechaEnvio+row, e.fechaEnvio||'');
      if(cfg.extraEE){
        W(G, cfg.cols.entregaCompleta+row, boolToYesNo(e.entregaCompleta));
        W(G, cfg.cols.debidaForma+row, boolToYesNo(e.debidaForma));
        W(G, cfg.cols.fechaRadicacion+row, e.fechaRadicacion||'');
      }
      // Las primeras DELIVERY_SLOTS filas de cada bloque ya traen el
      // rótulo (ej. "EE-1") impreso en la plantilla; solo las filas
      // anexadas más allá de ese cupo necesitan uno puesto por la app.
      if(i>=DELIVERY_SLOTS) W(G,'D'+row, type+'-'+(i+1));
    });
  });

  /* ---- HOJA DISEÑO ESTRUCTURAL ---- */
  const E = 'DISEÑO ESTRUCTURAL';
  if(p.estructural.lastItemRow){
    const idx = STRUCT_FLAT.findIndex(it=>it.row===p.estructural.lastItemRow);
    STRUCT_FLAT.forEach((it,i)=>{
      W(E, 'C'+it.row, i<=idx, 'b');
    });
    W(E,'P1','FECHA DE ACTUALIZACIÓN');
    W(E,'P2', p.estructural.fechaActualizacion||todayISO());
    W(E,'B145','DESCRIPCIÓN ESTRUCTURAL DEL PROYECTO');
    W(E,'B146', p.estructural.descripcion||'');
  }

  /* ---- HOJA ESTUDIOS DE SUELOS ---- */
  const GEO = 'ESTUDIOS DE SUELOS';
  if(p.geotecnico.items){
    GEO_FLAT.forEach(it=>{
      const v = p.geotecnico.items[it.row];
      if(v){
        W(GEO, 'C'+it.row, v.realizado==='Sí', 'b');
        if(v.estado) W(GEO, 'E'+it.row, v.estado);
      }
    });
    W(GEO,'M1','FECHA DE ACTUALIZACIÓN');
    W(GEO,'M2', p.geotecnico.fechaActualizacion||todayISO());
    W(GEO,'B72','DESCRIPCIÓN GEOTÉCNICA DEL PROYECTO');
    W(GEO,'B73', p.geotecnico.descripcion||'');
  }

  /* ---- HOJA ARQUITECTURA ---- */
  const ARQ = 'ARQUITECTURA';
  if(p.arquitectura.items){
    ARQ_ITEMS.forEach(([key,label,row])=>{
      const v = p.arquitectura.items[row];
      if(v){
        if(v.estado) W(ARQ, 'D'+row, v.estado);
        if(v.comentario) W(ARQ, 'E'+row, v.comentario);
      }
    });
  }

  /* ---- HOJA HIDROSANITARIO ---- */
  const HS = 'HIDROSANITARIO';
  if(p.hidrosanitario.elementos){
    HS_ELEM_ITEMS.forEach(([key,label,row])=>{
      const v = p.hidrosanitario.elementos[key];
      if(v){ W(HS,'C'+row, v.realizado||'No'); W(HS,'D'+row, v.diagramado||'No'); }
    });
  }
  if(p.hidrosanitario.memorias){
    HS_MEMORIAS_ITEMS.forEach(([key,label,row])=>{
      const v = p.hidrosanitario.memorias[key];
      if(v){ W(HS,'C'+row, v.radicacion||'No'); W(HS,'D'+row, v.subsanacion||'No'); }
    });
  }

  return XlsxPatch.patchXlsx(base || b64ToArrayBuffer(TEMPLATE_B64), escrituras);
}

function descargarArchivo(datos, nombre, mime){
  const blob = new Blob([datos], {type:mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nombre;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 4000);
}

/* Descarga el Excel al dispositivo (comportamiento original). */
async function exportExcel(){
  const p = currentProject();
  if(!p){ toast('Selecciona un proyecto primero.'); return; }
  await saveDB();
  try{
    const datos = await buildWorkbook(p);
    const fname = CONFIG.fileName(p);
    descargarArchivo(datos, fname, CONFIG.XLSX_MIME);
    toast('✓ Excel generado: '+fname);
  }catch(e){ toast('⚠ '+e.message); }
}

/* Sube el proyecto a la carpeta del año en Google Drive. */
async function sincronizarDrive(){
  const p = currentProject();
  if(!p){ toast('Selecciona un proyecto primero.'); return; }
  await saveDB();
  const btn = document.getElementById('btnDrive');
  if(btn) btn.disabled = true;
  try{
    if(!Drive.conectado()) await Drive.conectar();
    const info = await Drive.sincronizarProyecto(p, msg => toast('☁ '+msg));
    toast('✓ Guardado en Drive: ' + info.nombre + ' (carpeta ' + info.anio + ')');
    renderAll();
  }catch(e){
    toast('⚠ ' + e.message);
  }finally{
    if(btn) btn.disabled = false;
  }
}

/* ==================== INIT ==================== */
(async function init(){
  await loadDB();
  if(DB.projects.length>0){ currentId = DB.projects[0].id; }
  renderAll();
  setSyncStatus();

  // Si ya había una sesión de Google abierta (token de la última hora, ver drive.js),
  // trae en silencio lo que el resto del equipo haya cambiado. Si no, el estado
  // queda en "Sin conectar" hasta que alguien pulse 🔄 o "Guardar en Drive".
  try{
    await Drive.init();
    if(Drive.conectado()) await pullFromDrive({silent:true});
  }catch(e){ /* falta configurar CLIENT_ID en config.js, o sin conexión: se sigue en modo local */ }
  setSyncStatus();

  // Sondeo periódico + al volver a la pestaña, para ver proyectos que agregó o cambió
  // otra persona mientras este dispositivo estaba abierto. Nunca re-renderiza el
  // formulario del proyecto abierto (solo la lista lateral), para no interrumpir lo
  // que se esté escribiendo.
  setInterval(()=>{ if(Drive.conectado()) pullFromDrive({silent:true}); }, 60000);
  window.addEventListener('focus', ()=>{ if(Drive.conectado()) pullFromDrive({silent:true}); });
})();

/* ==================== NAVEGACIÓN MÓVIL ==================== */
function toggleNav(forzar){
  const abrir = (forzar === undefined)
    ? !document.body.classList.contains('nav-open')
    : !!forzar;
  document.body.classList.toggle('nav-open', abrir);
}

/* Al tocar un proyecto en el teléfono, el cajón se cierra solo. */
document.addEventListener('click', function(e){
  if(window.innerWidth > 900) return;
  if(!e.target.closest) return;
  const item = e.target.closest('.projitem');
  if(item && !e.target.closest('.delbtn')) toggleNav(false);
});
