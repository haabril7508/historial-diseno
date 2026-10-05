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

// Hoja "LISTADO DE PENDIENTES": un bloque por disciplina. En la plantilla cada
// bloque tiene su título en la columna B (fila "fila") y 5 filas para datos
// (fila+1 a fila+5) con Pendiente en D y Descripción / observación en E. Si
// una lista tiene más de 5, al armar el Excel se insertan filas (ver
// aplicarListado en xlsxpatch.js).
const PEND_HOJA = 'LISTADO DE PENDIENTES';
const PEND_FILAS = 5;
const PEND_LISTAS = [
 {key:'estructural',    label:'Pendientes estructural', corto:'Estructural', fila:3},
 {key:'geotecnia',      label:'Pendientes geotecnia', corto:'Geotecnia', fila:10},
 {key:'memorias',       label:'Pendientes informes y memorias de cálculo', corto:'Informes y memorias', fila:17},
 {key:'arquitectura',   label:'Pendientes arquitectura', corto:'Arquitectura', fila:24},
 {key:'hidrosanitario', label:'Pendientes hidrosanitario', corto:'Hidrosanitario', fila:31}
];

// Valores de las casillas de Estructural (Información actualizada y Memorias).
// "No aplica" se escribe tal cual en el Excel, que lo resalta con su formato condicional.
const OPC_SNA = ['Sí','No','No aplica'];

const TABS = [
 {id:'general', label:'General'},
 {id:'pendientes', label:'Pendientes'},
 {id:'estructural', label:'Estructural'},
 {id:'geotecnico', label:'Geotécnico'},
 {id:'arquitectura', label:'Arquitectura'},
 {id:'hidrosanitario', label:'Hidrosanitario'},
 {id:'licencia', label:'Licencia'}
];

// Hoja "TRAMITES LICENCIA": cálculo del término para resolver la licencia de
// construcción (Decreto 1077 de 2015, Arts. 2.2.6.1.2.3.1 y 2.2.6.1.2.2.4).
// Datos en D6 (radicación), D7 (notificación del Acta de Observaciones), D8
// (respuesta del solicitante) y D9 (plazo en días hábiles); las fórmulas de
// C19:D28 hacen el cálculo con los festivos de M3:O21. La app escribe los datos,
// los festivos que correspondan y el resultado ya calculado (ver
// escriturasLicencia), y la hoja se regenera desde la plantilla en cada guardado.
const LIC_HOJA = 'TRAMITES LICENCIA';
const LIC_PLAZO = 45;          // plazo legal para resolver (días hábiles)
const LIC_RESPUESTA = 30;      // plazo del solicitante para responder el Acta (días hábiles)
const LIC_PRORROGA = 15;       // prórroga de ese plazo, a solicitud de parte (días hábiles)
const LIC_FESTIVOS = 19;       // filas de festivos de la hoja (M3:M21)
const LIC_EJEMPLO = ['2026-05-20','2026-06-16','2026-08-20']; // caso de ejemplo del Excel maestro: no se importa

/* ==================== ESTADO ==================== */
let DB = {projects:[]};
let currentId = null;   // null = vista de inicio: resumen de pendientes de todos los proyectos
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
// Festivos de un año con nombre y tipo, ordenados: [{fecha:'AAAA-MM-DD', nombre, tipo}].
// Los nombres son los de la hoja TRAMITES LICENCIA del Excel, que los lista.
const _festivosCache = {};
function festivosColombia(year){
  if(_festivosCache[year]) return _festivosCache[year];
  const lista = [];
  const F = (d, nombre, tipo)=> lista.push({fecha: dateKey(d), nombre, tipo});
  [[0,1,'Año Nuevo'],[4,1,'Día del Trabajo'],[6,20,'Día de la Independencia'],[7,7,'Batalla de Boyacá'],
   [11,8,'Inmaculada Concepción'],[11,25,'Navidad']].forEach(([m,d,n])=>F(new Date(year,m,d), n, 'Fijo'));
  // Ley Emiliani (Ley 51 de 1983): se trasladan al lunes siguiente
  const emiliani = [[0,6,'Reyes Magos (Epifanía, trasladado)'],[2,19,'San José (trasladado)'],[5,29,'San Pedro y San Pablo (trasladado)'],
   [7,15,'La Asunción de la Virgen (trasladado)'],[9,12,'Día de la Raza (trasladado)'],[10,1,'Todos los Santos (trasladado)'],
   [10,11,'Independencia de Cartagena (trasladado)']];
  if(year>=2026) emiliani.push([6,9,'Nuestra Señora del Rosario de Chiquinquirá (trasladado)']); // Ley 2578 de 2026
  emiliani.forEach(([m,d,n])=>F(toMonday(new Date(year,m,d)), n, 'Ley Emiliani'));
  const easter = easterSunday(year);
  F(addDays(easter,-3), 'Jueves Santo', 'Móvil'); F(addDays(easter,-2), 'Viernes Santo', 'Móvil'); // no se trasladan
  F(toMonday(addDays(easter,39)), 'Ascensión del Señor (trasladado)', 'Ley Emiliani');
  F(toMonday(addDays(easter,60)), 'Corpus Christi (trasladado)', 'Ley Emiliani');
  F(toMonday(addDays(easter,68)), 'Sagrado Corazón de Jesús (trasladado)', 'Ley Emiliani');
  lista.sort((a,b)=> a.fecha.localeCompare(b.fecha));
  return (_festivosCache[year] = lista);
}
const _holidayCache = {};
function colombianHolidays(year){
  if(!_holidayCache[year]) _holidayCache[year] = new Set(festivosColombia(year).map(f=>f.fecha));
  return _holidayCache[year];
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
function isoADate(iso){ const [y,m,d] = iso.split('-').map(Number); return new Date(y, m-1, d); }
// Días hábiles entre dos fechas 'AAAA-MM-DD', ambas incluidas (0 si la primera es posterior).
function diasHabilesEntre(desdeIso, hastaIso){
  if(!desdeIso || !hastaIso || desdeIso > hastaIso) return 0;
  let n = 0;
  for(let d = isoADate(desdeIso); dateKey(d) <= hastaIso; d = addDays(d,1)) if(isBusinessDay(d)) n++;
  return n;
}
function diaSiguiente(iso){ return dateKey(addDays(isoADate(iso), 1)); }
function diaAnterior(iso){ return dateKey(addDays(isoADate(iso), -1)); }
// Fecha local de hoy (todayISO usa la hora UTC y en Colombia cambia de día a las 7 p. m.).
function hoyLocal(){ return dateKey(new Date()); }
// Número de serie de Excel (días desde el 30/12/1899) de una fecha 'AAAA-MM-DD'.
function serialExcel(iso){
  const [y,m,d] = iso.split('-').map(Number);
  return Math.round((Date.UTC(y,m-1,d) - Date.UTC(1899,11,30)) / 86400000);
}
const DIAS_SEMANA = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
// '2026-09-30' -> '30/09/2026 (miércoles)', como lo muestra el Excel.
function fechaLarga(iso){
  if(!iso) return '';
  const [y,m,d] = iso.split('-');
  return d+'/'+m+'/'+y+' ('+DIAS_SEMANA[isoADate(iso).getDay()]+')';
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
    hidrosanitario:{elementos:{}, memorias:{}},
    pendientes: pendientesVacios(), // {estructural:[{pendiente,descripcion}], geotecnia:[...], ...}
    licencia: licenciaVacia()
  };
}
function licenciaVacia(){
  return {fechaRadicacion:'', fechaActa:'', fechaRespuesta:'', plazo:LIC_PLAZO};
}
// Los proyectos creados antes de la pestaña Licencia no traen el bloque.
function asegurarLicencia(p){
  if(!p.licencia) p.licencia = licenciaVacia();
  const n = Number(p.licencia.plazo);
  if(!(n>0)) p.licencia.plazo = LIC_PLAZO;
  return p.licencia;
}
function licenciaTieneDatos(p){
  const l = p.licencia;
  return !!l && !!(l.fechaRadicacion || l.fechaActa || l.fechaRespuesta);
}
function pendientesVacios(){
  const o = {};
  PEND_LISTAS.forEach(l=>{ o[l.key] = []; });
  return o;
}
// Los proyectos creados antes de la pestaña Pendientes no traen el bloque.
function asegurarPendientes(p){
  if(!p.pendientes) p.pendientes = pendientesVacios();
  PEND_LISTAS.forEach(l=>{ if(!Array.isArray(p.pendientes[l.key])) p.pendientes[l.key] = []; });
  return p.pendientes;
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
// Llamar SOLO cuando el proyecto abierto realmente cambió: marca su "updatedAt",
// y esa fecha decide qué versión gana al fusionar con el equipo. Marcarlo sin
// cambios reales haría que una copia vieja de este dispositivo pisara lo que
// otra persona guardó después.
async function saveDB(){
  const p = currentProject();
  if(p) p.updatedAt = new Date().toISOString();
  await guardarSinMarcar();
}
// Guarda y sincroniza sin tocar la fecha de ningún proyecto (ej. al eliminar uno).
async function guardarSinMarcar(){
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
  // Poda lápidas viejas para que el archivo no crezca indefinidamente. Las de
  // Excel importados ("x-…") se conservan: si se podaran, el Excel que sigue en
  // Drive se volvería a importar como proyecto nuevo.
  const limite = Date.now() - 180*24*60*60*1000;
  Object.keys(deletedIds).forEach(id=>{ if(!id.startsWith('x-') && new Date(deletedIds[id]).getTime() < limite) delete deletedIds[id]; });

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

  return { projects: deduplicarPorArchivo(projects, deletedIds), deletedIds };
}

// Un mismo Excel de Drive no puede quedar como dos proyectos. Pasa si un
// historial se importó desde Drive (id "x-…") y después llega el proyecto
// original desde el dispositivo donde se creó: se conserva la versión editada
// más recientemente (a igualdad, la original) y la otra queda como eliminada.
function deduplicarPorArchivo(projects, deletedIds){
  function preferido(a, b){
    if((a.updatedAt||'') !== (b.updatedAt||'')) return (a.updatedAt||'') > (b.updatedAt||'') ? a : b;
    const ax = a.id.startsWith('x-'), bx = b.id.startsWith('x-');
    if(ax !== bx) return ax ? b : a;
    return a.id < b.id ? a : b;
  }
  const porArchivo = new Map();
  const quedan = [];
  projects.forEach(p=>{
    const fid = p.drive && p.drive.fileId;
    const otro = fid && porArchivo.get(fid);
    if(!otro){
      if(fid) porArchivo.set(fid, p);
      quedan.push(p);
      return;
    }
    const gana = preferido(p, otro);
    const pierde = gana===p ? otro : p;
    deletedIds[pierde.id] = new Date().toISOString();
    porArchivo.set(fid, gana);
    quedan[quedan.indexOf(otro)] = gana;
  });
  return quedan;
}

// ¿La versión fusionada trae algo que el archivo de Drive todavía no tiene?
// (proyectos solo locales, ediciones más nuevas, eliminaciones, importaciones)
function difiereDeRemoto(fusion, remoto){
  if(!remoto) return fusion.projects.length>0 || Object.keys(fusion.deletedIds).length>0;
  const fechas = new Map((remoto.projects||[]).map(p=>[p.id, p.updatedAt||'']));
  if(fechas.size !== fusion.projects.length) return true;
  if(fusion.projects.some(p=> fechas.get(p.id) !== (p.updatedAt||''))) return true;
  const rd = remoto.deletedIds || {};
  return Object.keys(fusion.deletedIds).some(id=> rd[id] !== fusion.deletedIds[id]);
}

function scheduleDriveSync(){
  if(!Drive.conectado()) return; // no forzamos login en cada cambio, solo sincroniza si ya hay sesión abierta
  clearTimeout(syncTimer);
  syncTimer = setTimeout(pushLocalChange, 1500);
}

// Tras cada edición local (vía scheduleDriveSync).
function pushLocalChange(){ return sincronizarEquipo({silent:true}); }

let importPending = false;

// Sincronización completa con el equipo:
//   1. baja historial-db.json y lo fusiona con la copia local;
//   2. (opts.importar) agrega los Excel de Drive que aún no estén en la lista;
//   3. sube el resultado solo si trae algo que Drive no tenga (proyectos que
//      solo existían en este dispositivo, ediciones, eliminaciones, importados).
// opts.silent: sin mensajes salvo errores importantes o importaciones.
async function sincronizarEquipo(opts){
  opts = opts || {};
  if(!Drive.conectado()){
    if(!opts.silent) toast('Conéctate a Drive para ver los proyectos del equipo.');
    return;
  }
  if(syncBusy){
    syncPending = true;
    if(opts.importar) importPending = true;
    return;
  }
  syncBusy = true;
  setSyncStatus('sync');
  const idAntes = currentId;
  const objAntes = currentProject();
  const cuantosAntes = DB.projects.length;
  try{
    const remoto = await Drive.descargarDB();
    if(remoto) dbFileId = remoto.id;
    let fusion = mergeDB(DB, remoto ? remoto.data : null);

    let importados = 0;
    if(opts.importar){
      importados = await importarExcelsDeDrive(fusion);
      if(importados) fusion = mergeDB(fusion, null);
    }

    if(difiereDeRemoto(fusion, remoto ? remoto.data : null)){
      dbFileId = await Drive.subirDB(fusion, dbFileId);
    }

    // Se fusiona de nuevo con DB (no se reemplaza) por si el usuario editó algo
    // mientras se esperaba a Drive: esa edición es más reciente y se conserva.
    const resumenAntes = firmaResumen();
    DB = mergeDB(DB, fusion);
    // Si otro dispositivo eliminó el proyecto abierto, se vuelve al resumen de pendientes.
    if(currentId && !DB.projects.some(p=>p.id===currentId)) currentId = null;
    await persistLocalOnly();

    // El formulario abierto solo se redibuja si su proyecto se eliminó, o si lo
    // cambió OTRO dispositivo (llegó otra versión, con otra fecha) y no hay nada a
    // medio escribir. Las ediciones propias hechas mientras tanto no cuentan: ya
    // están en pantalla.
    const actual = currentProject();
    const cambioRemoto = !!actual && !!objAntes && actual!==objAntes && actual.updatedAt!==objAntes.updatedAt;
    if(currentId!==idAntes || (cambioRemoto && !editandoCampo() && !hayBorradorSinAgregar())) renderAll();
    else if(!currentId && firmaResumen()!==resumenAntes) renderAll(); // el resumen no tiene campos editables
    else { renderProjectList(); renderTabs(); }

    setSyncStatus('ok');
    if(importados){
      toast('✓ Se importaron '+importados+' historial(es) que ya estaban en Drive.');
    }else if(!opts.silent){
      const nuevos = DB.projects.length - cuantosAntes;
      toast(nuevos>0 ? ('✓ '+nuevos+' proyecto(s) nuevo(s) del equipo.') : '✓ Lista de proyectos actualizada.');
    }
  }catch(e){
    console.error('No se pudo sincronizar con Drive', e);
    setSyncStatus('error', e.message);
    if(!opts.silent) toast('⚠ '+e.message);
  }finally{
    syncBusy = false;
    if(syncPending){
      const importar = importPending;
      syncPending = false; importPending = false;
      sincronizarEquipo({silent:true, importar});
    }
  }
}

function editandoCampo(){
  const a = document.activeElement;
  return !!a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.id!=='searchBox';
}

// Handler del botón 🔄: conecta si hace falta, trae la lista del equipo y
// revisa si hay Excel en Drive que todavía no estén en la app.
async function manualSync(){
  const btn = document.getElementById('btnSync');
  if(btn) btn.disabled = true;
  try{
    if(!Drive.conectado()) await Drive.conectar();
    await sincronizarEquipo({importar:true});
  }catch(e){
    toast('⚠ '+e.message);
    setSyncStatus();
  }finally{
    if(btn) btn.disabled = false;
  }
}

function setSyncStatus(state, detail){
  const el = document.getElementById('syncStatus');
  if(!el) return;
  if(state==='sync'){ el.textContent = '⏳ Sincronizando…'; el.className = 'syncstatus'; el.title=''; return; }
  if(state==='conectando'){ el.textContent = '⏳ Conectando con Drive…'; el.className = 'syncstatus'; el.title=''; return; }
  if(state==='importando'){ el.textContent = '⏳ Importando historiales '+(detail||'')+'…'; el.className = 'syncstatus'; el.title=''; return; }
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

/* ==================== IMPORTAR HISTORIALES QUE YA ESTABAN EN DRIVE ====================
   Antes de la base compartida, cada proyecto vivía solo en el dispositivo
   donde se creó, pero su Excel sí se subía a Drive. Aquí se recorren los
   Excel de las carpetas de año y se crea un proyecto por cada uno que la app
   todavía no conozca, leyendo las celdas al revés de como las escribe
   buildWorkbook(). El id del proyecto importado es "x-" + id del archivo, así
   dos dispositivos que importen a la vez producen el mismo proyecto (no se
   duplica), y si alguien lo elimina, la lápida impide que se reimporte.     */
async function importarExcelsDeDrive(base){
  const archivos = await Drive.listarExcelsDelHistorial();
  const conocidos = new Set();
  const nombres = new Set();
  base.projects.forEach(p=>{
    if(p.drive && p.drive.fileId) conocidos.add(p.drive.fileId);
    nombres.add(String(p.general.anio||'')+'/'+CONFIG.fileName(p).normalize('NFC'));
  });
  const pendientes = archivos.filter(a=>
    !conocidos.has(a.id) &&
    !base.deletedIds['x-'+a.id] &&
    // Un proyecto con el mismo nombre y año que aún no subió su Excel: es el mismo,
    // se enlazará con el archivo la próxima vez que se pulse "Guardar en Drive".
    !nombres.has(String(a.anio||'')+'/'+String(a.name).normalize('NFC'))
  );
  let n = 0;
  for(const a of pendientes){
    setSyncStatus('importando', (n+1)+'/'+pendientes.length);
    try{
      const datos = await Drive.descargar(a.id);
      base.projects.push(await proyectoDesdeExcel(datos, a));
      n++;
    }catch(e){
      console.warn('No se pudo importar "'+a.name+'"', e);
    }
  }
  return n;
}

// --- lectura de celdas ---
function celTexto(hoja, addr){
  const v = hoja[addr];
  if(v===undefined || v===null) return '';
  if(typeof v==='boolean') return v ? 'Sí' : 'No';
  return String(v).trim();
}
function celMarcada(hoja, addr){
  const v = hoja[addr];
  if(typeof v==='boolean') return v;
  return ['si','true','verdadero','x','1'].includes(slugify(v));
}
function celSiNo(hoja, addr){
  const s = slugify(celTexto(hoja, addr));
  if(s==='si' || s==='true' || s==='verdadero') return 'Sí';
  if(s==='no' || s==='false' || s==='falso') return 'No';
  if(s==='no-aplica') return 'No aplica';
  return celTexto(hoja, addr);
}
// Fechas: la app las escribe como texto AAAA-MM-DD, pero si alguien editó el
// Excel a mano pueden venir como número de serie de Excel o como DD/MM/AAAA.
function celFecha(hoja, addr){
  const v = hoja[addr];
  if(typeof v==='number' && v>20000 && v<80000){
    return new Date(Date.UTC(1899,11,30) + Math.round(v)*86400000).toISOString().slice(0,10);
  }
  const s = celTexto(hoja, addr);
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if(m) return m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');
  return s;
}

function nombreDesdeArchivo(nombreArchivo){
  return String(nombreArchivo).normalize('NFC')
    .replace(/\.xlsx$/i,'')
    .replace(/^Historial_de_dise(ñ|n)o\s*-\s*/i,'')
    .trim();
}

async function proyectoDesdeExcel(datos, archivo){
  const E_NOMBRE = 'DISEÑO ESTRUCTURAL', GEO_NOMBRE = 'ESTUDIOS DE SUELOS';
  const H = await XlsxPatch.leerCeldas(datos, ['GENERAL', E_NOMBRE, GEO_NOMBRE, 'ARQUITECTURA', 'HIDROSANITARIO', PEND_HOJA, LIC_HOJA]);
  const G = H['GENERAL'], E = H[E_NOMBRE], GEO = H[GEO_NOMBRE], ARQ = H['ARQUITECTURA'], HS = H['HIDROSANITARIO'];
  // Sí / No / No aplica tal como vengan; cualquier otra cosa cuenta como No.
  const sna = (v)=> OPC_SNA.includes(v) ? v : 'No';

  const p = blankProject();
  p.id = 'x-' + archivo.id;
  p.updatedAt = archivo.modifiedTime || new Date().toISOString();
  p.drive = { fileId: archivo.id, nombre: archivo.name, anio: archivo.anio, carpetaId: archivo.carpetaId, syncedAt: archivo.modifiedTime || '' };

  /* ---- GENERAL ---- */
  const descripcion = celTexto(G,'D4');
  p.general = {
    nombre: nombreDesdeArchivo(archivo.name),
    ruta: celTexto(G,'D2'),
    descripcion: /^ejemplo/i.test(descripcion) ? '' : descripcion, // la plantilla trae "EJEMPLO: …"
    ubicacion: celTexto(G,'D6'),
    cliente: celTexto(G,'D7'),
    anio: archivo.anio || String(new Date().getFullYear())
  };

  // Trámites: desde la fila 115 hasta la primera vacía (la 130 ya es de elementos adicionales)
  for(let row=115; row<130; row++){
    const t = {
      fechaRadicacion: celFecha(G,'B'+row), tipo: celTexto(G,'D'+row), numero: celTexto(G,'E'+row),
      nroRadicado: celTexto(G,'F'+row), fechaActa: celFecha(G,'G'+row)
    };
    if(!t.fechaRadicacion && !t.tipo && !t.nroRadicado && !t.fechaActa) break;
    const tipo = slugify(t.tipo);
    t.tipo = tipo.startsWith('plan') ? 'Planeación' : 'Curaduría';
    if(t.tipo!=='Curaduría') t.numero = '';
    p.tramites.push(t);
  }

  // Entregas: cada bloque tiene 5 consecutivos. Los huecos (p. ej. EE-1 vacío y
  // EE-2 lleno) se conservan como entregas vacías para que cada una vuelva a su fila.
  Object.keys(DELIVERY_TYPES).forEach(type=>{
    const cfg = DELIVERY_TYPES[type];
    const bloque = [];
    for(let i=0; i<DELIVERY_SLOTS; i++){
      const row = cfg.startRow + i;
      const e = {
        type, fecha: celFecha(G, cfg.cols.fecha+row), obs: celTexto(G, cfg.cols.obs+row),
        obs2: celTexto(G, cfg.cols.obs2+row), fechaEnvio: celFecha(G, cfg.cols.fechaEnvio+row)
      };
      let tieneDatos = !!(e.fecha || e.obs || e.obs2 || e.fechaEnvio);
      if(cfg.extraEE){
        e.entregaCompleta = celSiNo(G, cfg.cols.entregaCompleta+row)==='Sí' ? 'Sí' : 'No';
        e.debidaForma = celSiNo(G, cfg.cols.debidaForma+row)==='Sí' ? 'Sí' : 'No';
        e.fechaRadicacion = celFecha(G, cfg.cols.fechaRadicacion+row);
        tieneDatos = tieneDatos || !!e.fechaRadicacion;
      }
      bloque.push(tieneDatos ? e : null);
    }
    while(bloque.length && !bloque[bloque.length-1]) bloque.pop();
    bloque.forEach(e=> p.entregas.push(e || {type, fecha:'', obs:'', obs2:'', fechaEnvio:''}));
  });

  // Información actualizada a última versión (filas 90-100) y memorias (104-111)
  ELEM_LEFT.forEach(([key,label,row])=>{
    const r = celSiNo(G,'D'+row), d = celSiNo(G,'E'+row);
    if(r || d) p.estructural.elementos[key] = {realizado: sna(r), diagramado: sna(d)};
  });
  ELEM_RIGHT.forEach(([key,label,row])=>{
    const r = celSiNo(G,'G'+row), d = celSiNo(G,'H'+row);
    if(r || d) p.estructural.elementosDer[key] = {realizado: sna(r), diagramado: sna(d)};
  });
  MEMORIAS_ITEMS.forEach(([key,label,row])=>{
    const r = celSiNo(G,'D'+row), s = celSiNo(G,'G'+row);
    if(r || s) p.estructural.memorias[key] = {radicacion: sna(r), subsanacion: sna(s)};
  });
  // Elementos adicionales (bloque que agrega la app desde la fila 130)
  if(/elementos adicionales/i.test(celTexto(G,'B130'))){
    for(let row=132; celTexto(G,'B'+row); row++){
      p.estructural.elementosExtra.push({
        label: celTexto(G,'B'+row),
        realizado: sna(celSiNo(G,'D'+row)),
        diagramado: sna(celSiNo(G,'E'+row))
      });
    }
  }

  /* ---- LISTADO DE PENDIENTES (los Excel viejos no tienen la hoja) ----
     Los bloques pueden tener más de 5 filas si la app las agregó: se ubican
     por su título en la columna B y se leen hasta el título siguiente. */
  const PH = H[PEND_HOJA] || {};
  const titulos = [];
  Object.keys(PH).forEach(addr=>{
    const m = addr.match(/^B(\d+)$/);
    if(!m) return;
    const t = slugify(celTexto(PH, addr));
    const l = PEND_LISTAS.find(x=> t===slugify(x.label) || (t.startsWith('pendientes-') && slugify(x.label).startsWith(t)));
    if(l) titulos.push({key:l.key, fila:Number(m[1])});
  });
  titulos.sort((a,b)=>a.fila-b.fila);
  titulos.forEach((t,i)=>{
    const hasta = i+1<titulos.length ? titulos[i+1].fila : t.fila + 200;
    for(let row=t.fila+1; row<hasta; row++){
      const pendiente = celTexto(PH,'D'+row), descripcion = celTexto(PH,'E'+row);
      if(pendiente || descripcion) p.pendientes[t.key].push({pendiente, descripcion});
    }
  });

  /* ---- TRAMITES LICENCIA (los Excel viejos no tienen la hoja) ----
     Se ignora el caso de ejemplo que trae el Excel maestro. */
  const LH = H[LIC_HOJA] || {};
  const fechaLic = (addr)=>{ const f = celFecha(LH, addr); return /^\d{4}-\d{2}-\d{2}$/.test(f) ? f : ''; };
  const lic = {fechaRadicacion: fechaLic('D6'), fechaActa: fechaLic('D7'), fechaRespuesta: fechaLic('D8'),
               plazo: Number(LH['D9']) > 0 ? Math.round(Number(LH['D9'])) : LIC_PLAZO};
  const esEjemplo = lic.fechaRadicacion===LIC_EJEMPLO[0] && lic.fechaActa===LIC_EJEMPLO[1] && lic.fechaRespuesta===LIC_EJEMPLO[2];
  if(!esEjemplo) p.licencia = lic;

  /* ---- DISEÑO ESTRUCTURAL: el último ítem marcado es el punto en que quedó ---- */
  let ultimo = null;
  STRUCT_FLAT.forEach(it=>{ if(celMarcada(E,'C'+it.row)) ultimo = it.row; });
  if(ultimo){
    p.estructural.lastItemRow = ultimo;
    p.estructural.fechaActualizacion = celFecha(E,'P2');
  }
  p.estructural.descripcion = celTexto(E,'B146');

  /* ---- ESTUDIOS DE SUELOS ---- */
  GEO_FLAT.forEach(it=>{
    const realizado = celMarcada(GEO,'C'+it.row) ? 'Sí' : 'No';
    const estado = celSiNo(GEO,'E'+it.row);
    const estadoPorDefecto = GEO_DEFAULT_NA.includes(it.row) ? 'No aplica' : '';
    if(realizado==='Sí' || estado!==estadoPorDefecto) p.geotecnico.items[it.row] = {realizado, estado};
  });
  p.geotecnico.fechaActualizacion = celFecha(GEO,'M2');
  p.geotecnico.descripcion = celTexto(GEO,'B73');

  /* ---- ARQUITECTURA (la plantilla trae "Si" y "Comentarios" de relleno) ---- */
  ARQ_ITEMS.forEach(([key,label,row])=>{
    const estado = celSiNo(ARQ,'D'+row) || 'Sí';
    let comentario = celTexto(ARQ,'E'+row);
    if(/^comentarios$/i.test(comentario)) comentario = '';
    if(estado!=='Sí' || comentario) p.arquitectura.items[row] = {estado, comentario};
  });

  /* ---- HIDROSANITARIO ---- */
  HS_ELEM_ITEMS.forEach(([key,label,row])=>{
    const r = celSiNo(HS,'C'+row), d = celSiNo(HS,'D'+row);
    if(r || d) p.hidrosanitario.elementos[key] = {realizado: r==='Sí'?'Sí':'No', diagramado: d==='Sí'?'Sí':'No'};
  });
  HS_MEMORIAS_ITEMS.forEach(([key,label,row])=>{
    const r = celSiNo(HS,'C'+row), s = celSiNo(HS,'D'+row);
    if(r || s) p.hidrosanitario.memorias[key] = {radicacion: r==='Sí'?'Sí':'No', subsanacion: s==='Sí'?'Sí':'No'};
  });

  return p;
}

/* ==================== UI: PROYECTOS ==================== */
function newProject(){
  const p = blankProject();
  DB.projects.unshift(p);
  currentId = p.id;
  currentTab = 'general';
  fijarAnioAbierto(anioDe(p), true); // que el proyecto nuevo se vea en la barra lateral
  saveDB();
  renderAll();
}

function selectProject(id){
  currentId = id;
  currentTab = 'general';
  renderAll();
}

// Vuelve a la vista de inicio (resumen de pendientes de todos los proyectos).
function abrirResumen(){
  currentId = null;
  renderAll();
}

// Desde el resumen: abre el proyecto directamente en su pestaña Pendientes.
function abrirPendientesDe(id){
  const p = DB.projects.find(x=>x.id===id);
  if(!p) return;
  currentId = id;
  currentTab = 'pendientes';
  fijarAnioAbierto(anioDe(p), true);
  renderAll();
}

/* Años plegados / desplegados en la barra lateral. Es una preferencia de cada
   dispositivo (localStorage), no un dato del proyecto: no pasa por saveDB().
   Un año que nadie ha tocado arranca desplegado solo si contiene el proyecto
   abierto; los demás arrancan plegados. */
const K_ANIOS = 'hd:anios-abiertos';
function anioDe(p){ return p.general.anio || 'Sin año'; }
function leerAniosAbiertos(){
  try{ return JSON.parse(localStorage.getItem(K_ANIOS) || '{}') || {}; }catch(e){ return {}; }
}
function anioAbierto(y){
  const guardado = leerAniosAbiertos()[y];
  if(typeof guardado==='boolean') return guardado;
  const p = currentProject();
  return !!p && anioDe(p)===y;
}
function fijarAnioAbierto(y, abierto){
  const anios = leerAniosAbiertos();
  anios[y] = abierto;
  try{ localStorage.setItem(K_ANIOS, JSON.stringify(anios)); }catch(e){}
}

function renderProjectList(){
  const list = document.getElementById('projList');
  const q = (document.getElementById('searchBox').value||'').toLowerCase();
  list.innerHTML = '';

  // Primera entrada fija: el resumen de pendientes de todos los proyectos.
  const total = DB.projects.reduce((s,p)=> s + totalPendientes(p), 0);
  const resumen = document.createElement('div');
  resumen.className = 'projitem resumenitem' + (currentId===null ? ' active' : '');
  resumen.title = 'Ver los pendientes de todos los proyectos';
  resumen.innerHTML = `<div class="pname">📋 Pendientes<small>Todos los proyectos</small></div>${total ? `<span class="rescount">${total}</span>` : ''}`;
  resumen.onclick = abrirResumen;
  list.appendChild(resumen);

  const projects = DB.projects.filter(p=>{
    const s = (p.general.ruta+' '+p.general.descripcion+' '+p.general.cliente+' '+p.general.ubicacion+' '+p.general.nombre).toLowerCase();
    return s.includes(q);
  });
  if(projects.length===0){
    list.insertAdjacentHTML('beforeend', '<div style="padding:14px;color:rgba(255,255,255,.5);font-size:12px;">' +
      (q ? 'Ningún proyecto coincide con la búsqueda.' : 'Sin proyectos aún. Crea uno con "+ Nuevo proyecto".') + '</div>');
    return;
  }
  // Agrupar como carpetas por año, desplegables (ver anioAbierto)
  const groups = {};
  projects.forEach(p=>{
    const y = anioDe(p);
    (groups[y] = groups[y]||[]).push(p);
  });
  const years = Object.keys(groups).sort((a,b)=> b.localeCompare(a,undefined,{numeric:true}));
  years.forEach(y=>{
    // Al buscar se muestran todos los años con resultados, aunque estén plegados.
    const abierto = q ? true : anioAbierto(y);
    const yearHead = document.createElement('button');
    yearHead.type = 'button';
    yearHead.className = 'yearHead' + (abierto ? ' abierto' : '');
    yearHead.title = abierto ? 'Plegar año' : 'Desplegar año';
    yearHead.innerHTML = `<span class="yflecha">${abierto?'▾':'▸'}</span>📁 ${escapeHtml(y)}<span class="ycount">${groups[y].length}</span>`;
    if(!q) yearHead.onclick = ()=>{ fijarAnioAbierto(y, !abierto); renderProjectList(); };
    list.appendChild(yearHead);
    if(!abierto) return;
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
  // Su Excel sigue en Drive: esta lápida evita que la importación lo traiga de vuelta.
  if(p.drive && p.drive.fileId) DB.deletedIds['x-'+p.drive.fileId] = DB.deletedIds[id];
  DB.projects = DB.projects.filter(x=>x.id!==id);
  if(currentId===id) currentId = null; // se vuelve al resumen de pendientes
  guardarSinMarcar(); // no saveDB(): marcaría como editado el proyecto que quedó abierto
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
  // "Guardar en Drive" y "Descargar Excel" son de un proyecto: en el resumen no aplican.
  const acciones = document.querySelector('.topbar .acciones');
  if(acciones) acciones.style.display = p ? '' : 'none';
  if(!p){
    const r = resumenPendientes();
    document.getElementById('projTitle').textContent = 'Pendientes';
    document.getElementById('projSub').textContent = r.total
      ? r.total+' pendiente(s) en '+r.proyectos+' proyecto(s)'
      : 'Resumen de los pendientes de todos los proyectos';
    return;
  }
  document.getElementById('projTitle').textContent = p.general.nombre || p.general.descripcion || p.general.ruta || 'Proyecto sin nombre';
  document.getElementById('projSub').textContent = p.general.ruta ? '📂 '+p.general.ruta : 'Sin ruta de carpeta asignada';
}

function renderTabs(){
  recordarVista();
  const bar = document.getElementById('tabsBar');
  bar.innerHTML = '';
  const p = currentProject();
  bar.style.display = p ? '' : 'none'; // el resumen de pendientes no tiene pestañas
  if(!p) return;
  TABS.forEach(t=>{
    const el = document.createElement('div');
    el.className = 'tab' + (currentTab===t.id?' active':'');
    el.textContent = t.label;
    if(t.id==='pendientes' && totalPendientes(p)){
      const n = document.createElement('span');
      n.className = 'tabcount';
      n.textContent = totalPendientes(p);
      el.appendChild(n);
    }
    el.onclick = ()=>{ currentTab=t.id; renderContent(); renderTabs(); };
    bar.appendChild(el);
  });
}

function renderContent(){
  const c = document.getElementById('content');
  const p = currentProject();
  if(!p) return renderResumen(c);
  if(currentTab==='general') return renderGeneral(p,c);
  if(currentTab==='estructural') return renderEstructural(p,c);
  if(currentTab==='geotecnico') return renderGeotecnico(p,c);
  if(currentTab==='arquitectura') return renderArquitectura(p,c);
  if(currentTab==='hidrosanitario') return renderHidrosanitario(p,c);
  if(currentTab==='pendientes') return renderPendientes(p,c);
  if(currentTab==='licencia') return renderLicencia(p,c);
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
       <thead><tr><th>Trámite ante</th><th>N.º radicado</th><th>Fecha radicación</th><th>Fecha acta</th><th>Vence obs. (30 días hábiles)</th><th>Prórroga (45 días hábiles)</th><th></th></tr></thead>
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

// ¿El proyecto tiene algo más que los datos generales? (para no descartar trabajo sin avisar)
function tieneDatos(p){
  const e = p.estructural || {}, g = p.geotecnico || {}, a = p.arquitectura || {}, h = p.hidrosanitario || {};
  return (p.tramites||[]).length>0 || (p.entregas||[]).length>0 || totalPendientes(p)>0 || licenciaTieneDatos(p) ||
    !!e.lastItemRow || !!e.descripcion || (e.elementosExtra||[]).length>0 ||
    [e.elementos, e.elementosDer, e.memorias, g.items, a.items, h.elementos, h.memorias].some(o=> o && Object.keys(o).length>0) ||
    !!g.descripcion;
}

function autoSaveGeneral(){
  const p = currentProject();
  if(!p) return;
  const nuevo = {
    nombre: document.getElementById('g_nombre').value,
    ruta: document.getElementById('g_ruta').value.trim(),
    cliente: document.getElementById('g_cliente').value,
    ubicacion: document.getElementById('g_ubicacion').value,
    descripcion: document.getElementById('g_descripcion').value,
    anio: document.getElementById('g_anio').value
  };
  // Salir de un campo sin cambiar nada no cuenta como edición.
  if(Object.keys(nuevo).every(k=> String(p.general[k]||'')===String(nuevo[k]||''))) return;

  const rutaCambio = slugify(nuevo.ruta)!==slugify(p.general.ruta);
  const dup = rutaCambio ? findProjectByRuta(nuevo.ruta, p.id) : null;
  if(dup){
    const nombreDup = dup.general.nombre||dup.general.descripcion||dup.general.ruta;
    const aviso = tieneDatos(p)
      ? '\n\n⚠ OJO: este proyecto ya tiene información (trámites, entregas, checklists o pendientes) que se PERDERÁ.'
      : '';
    const abrir = confirm('Ya existe un proyecto con esa ruta: "'+nombreDup+'".\n\n'+
      'Aceptar: abrir ese proyecto y descartar este.'+aviso+'\n\n'+
      'Cancelar: conservar los dos proyectos con la misma ruta.');
    if(abrir){
      // Solo se completan los datos que al existente le falten; nunca se borran los suyos.
      Object.keys(nuevo).forEach(k=>{ if(!String(dup.general[k]||'').trim() && String(nuevo[k]||'').trim()) dup.general[k] = nuevo[k]; });
      if(!DB.deletedIds) DB.deletedIds = {};
      DB.deletedIds[p.id] = new Date().toISOString(); // si no, la sincronización lo traería de vuelta
      DB.projects = DB.projects.filter(x=>x.id!==p.id);
      currentId = dup.id;
      fijarAnioAbierto(anioDe(dup), true);
      saveDB(); renderAll();
      return;
    }
  }
  // Si cambió de año, se despliega el año nuevo para no perderlo de vista.
  if(String(nuevo.anio||'')!==String(p.general.anio||'')) fijarAnioAbierto(nuevo.anio || 'Sin año', true);
  p.general = nuevo;
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
// Selector Sí / No / No aplica. `accion` es el llamado JS que recibe el valor
// elegido como último argumento (ej. "setElem('left','losas','realizado',").
function selSNA(valor, accion){
  return `<select class="sna" data-v="${valor}" onchange="this.dataset.v=this.value;${accion}this.value)">` +
    OPC_SNA.map(o=>`<option value="${o}" ${valor===o?'selected':''}>${o}</option>`).join('') + `</select>`;
}
function setElem(side, key, field, value){
  const p = currentProject();
  if(!p.estructural.elementos) p.estructural.elementos = {};
  if(!p.estructural.elementosDer) p.estructural.elementosDer = {};
  const store = side==='left' ? p.estructural.elementos : p.estructural.elementosDer;
  if(!store[key]) store[key] = {};
  store[key][field] = value;
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
function setElemExtra(i, field, value){
  const p = currentProject();
  if(!p.estructural.elementosExtra || !p.estructural.elementosExtra[i]) return;
  p.estructural.elementosExtra[i][field] = value;
  saveDB();
}
function removeElemExtra(i){
  const p = currentProject();
  p.estructural.elementosExtra.splice(i,1);
  saveDB();
  renderContent();
}
function setMemoria(key, field, value){
  const p = currentProject();
  if(!p.estructural.memorias) p.estructural.memorias = {};
  if(!p.estructural.memorias[key]) p.estructural.memorias[key] = {};
  p.estructural.memorias[key][field] = value;
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
    <div class="checkrow sel"><span>${label}</span>
      ${selSNA(elemVal(p,'left',key,'realizado'), `setElem('left','${key}','realizado',`)}
      ${selSNA(elemVal(p,'left',key,'diagramado'), `setElem('left','${key}','diagramado',`)}
    </div>`).join('');
  const rightRows = ELEM_RIGHT.map(([key,label])=>`
    <div class="checkrow sel"><span>${label}</span>
      ${selSNA(elemVal(p,'right',key,'realizado'), `setElem('right','${key}','realizado',`)}
      ${selSNA(elemVal(p,'right',key,'diagramado'), `setElem('right','${key}','diagramado',`)}
    </div>`).join('');
  const extraRows = p.estructural.elementosExtra.map((el,i)=>`
    <div class="checkrowx sel"><span>${escapeHtml(el.label)}</span>
      ${selSNA(el.realizado||'No', `setElemExtra(${i},'realizado',`)}
      ${selSNA(el.diagramado||'No', `setElemExtra(${i},'diagramado',`)}
      <button class="delbtnx" title="Quitar elemento" onclick="removeElemExtra(${i})">✕</button>
    </div>`).join('');
  const memRows = MEMORIAS_ITEMS.map(([key,label])=>`
    <div class="checkrow sel"><span>${label}</span>
      ${selSNA(memVal(p,key,'radicacion'), `setMemoria('${key}','radicacion',`)}
      ${selSNA(memVal(p,key,'subsanacion'), `setMemoria('${key}','subsanacion',`)}
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
     <div class="hint">Refleja el estado de "¿Realizado?" y "¿Diagramado?" de cada elemento, tal como aparece en la hoja GENERAL del Excel: Sí, No o No aplica. Cada cambio se guarda automáticamente.</div>
     <div class="checkcols">
       <div class="checkgrid">
         <div class="checkhead sel"><span>Elemento</span><span>¿Realizado?</span><span>¿Diagramado?</span></div>
         ${leftRows}
       </div>
       <div class="checkgrid">
         <div class="checkhead sel"><span>Elemento</span><span>¿Realizado?</span><span>¿Diagramado?</span></div>
         ${rightRows}
       </div>
     </div>
     <div class="stagegroup" style="margin-top:18px;margin-bottom:4px;">Elementos adicionales</div>
     <div class="hint">Elementos que no están en la lista estándar. Se crean como filas nuevas al final de la hoja GENERAL del Excel (a partir de la fila 130, dejando margen para la sección de Trámites), sin afectar ninguna celda existente.</div>
     <div class="checkgrid">
       <div class="checkrowx sel" style="border-bottom:1px solid var(--border);font-size:11px;font-weight:700;color:var(--muted);"><span>Elemento</span><span>¿Realizado?</span><span>¿Diagramado?</span><span></span></div>
       ${extraRows || '<div style="padding:8px 0;color:var(--muted);font-size:13px;">Sin elementos adicionales todavía.</div>'}
     </div>
     <div class="row-actions" style="margin-top:10px;">
       <input id="elem_extra_new" placeholder="Nombre del nuevo elemento (ej: Muro de contención en gaviones)" style="flex:1;min-width:220px;padding:9px 10px;border:1px solid var(--border);border-radius:6px;font-size:13px;">
       <button class="secondary" onclick="addElementoExtra()">+ Agregar elemento</button>
     </div>
   </div>

   <div class="card">
     <h3>Contenido de las memorias de cálculo</h3>
     <div class="hint">Estado de Radicación y Subsanación de cada punto exigido en las memorias de cálculo: Sí, No o No aplica. Se guarda automáticamente.</div>
     <div class="checkgrid">
       <div class="checkhead sel"><span>Punto</span><span>Radicación</span><span>Subsanación</span></div>
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
  const valor = document.getElementById('s_desc').value;
  if(!p || (p.estructural.descripcion||'')===valor) return; // salir del campo sin cambiar nada no guarda
  p.estructural.descripcion = valor;
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
  const valor = document.getElementById('geo_desc').value;
  if(!p || (p.geotecnico.descripcion||'')===valor) return;
  p.geotecnico.descripcion = valor;
  p.geotecnico.fechaActualizacion = todayISO();
  saveDB();
}

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
  if(!p || arqVal(p,row,'comentario')===value) return;
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

/* ---------- TAB PENDIENTES ---------- */
function totalPendientes(p){
  if(!p || !p.pendientes) return 0;
  return PEND_LISTAS.reduce((s,l)=> s + ((p.pendientes[l.key]||[]).length), 0);
}
function renderPendientes(p,c){
  const pend = asegurarPendientes(p);
  const bloques = PEND_LISTAS.map(l=>{
    const lista = pend[l.key];
    const filas = lista.map((it,i)=>`
      <div class="pendrow">
        <input value="${escapeHtml(it.pendiente)}" placeholder="Pendiente" onblur="setPendiente('${l.key}',${i},'pendiente',this.value)">
        <input value="${escapeHtml(it.descripcion)}" placeholder="Descripción / observación" onblur="setPendiente('${l.key}',${i},'descripcion',this.value)">
        <button class="pendok" title="Completado: quitar de la lista" onclick="completarPendiente('${l.key}',${i})">✓</button>
      </div>`).join('');
    return `
     <div class="card">
       <h3>${escapeHtml(l.label)} <span class="pendcount">${lista.length||''}</span></h3>
       <div class="pendgrid">
         <div class="pendhead"><span>Pendiente</span><span>Descripción / observación</span><span></span></div>
         ${filas || '<div class="pendvacio">Sin pendientes.</div>'}
       </div>
       <div class="pendrow pendnuevo">
         <input id="pn_${l.key}_p" data-borrador placeholder="Nuevo pendiente" onkeydown="if(event.key==='Enter')agregarPendiente('${l.key}')">
         <input id="pn_${l.key}_d" data-borrador placeholder="Descripción / observación" onkeydown="if(event.key==='Enter')agregarPendiente('${l.key}')">
         <button class="secondary" onclick="agregarPendiente('${l.key}')" title="Agregar pendiente">+</button>
       </div>
     </div>`;
  }).join('');
  c.innerHTML = `
   <div class="hint" style="margin:0 0 14px;">Refleja la hoja "LISTADO DE PENDIENTES" del Excel. Cada listado admite los pendientes que hagan falta (si pasan de 5, el Excel agrega las filas necesarias). Al completar uno, pulsa ✓ para quitarlo de la lista. Los cambios se guardan solos al salir de cada campo.</div>
   ${bloques}
  `;
}
function agregarPendiente(key){
  const p = currentProject();
  const inP = document.getElementById('pn_'+key+'_p');
  const inD = document.getElementById('pn_'+key+'_d');
  const pendiente = inP.value.trim(), descripcion = inD.value.trim();
  if(!pendiente && !descripcion){ toast('Escribe el pendiente antes de agregarlo.'); inP.focus(); return; }
  asegurarPendientes(p)[key].push({pendiente, descripcion});
  saveDB();
  renderContent();
  renderTabs();
  // Deja el cursor listo para escribir el siguiente
  const siguiente = document.getElementById('pn_'+key+'_p');
  if(siguiente) siguiente.focus();
}
function setPendiente(key, i, field, value){
  const p = currentProject();
  const it = asegurarPendientes(p)[key][i];
  if(!it || it[field]===value) return;
  it[field] = value;
  saveDB();
}
function completarPendiente(key, i){
  const p = currentProject();
  const lista = asegurarPendientes(p)[key];
  const it = lista[i];
  if(!it) return;
  if(!confirm('¿Marcar como completado y quitar de la lista?\n\n"'+(it.pendiente||it.descripcion)+'"')) return;
  lista.splice(i,1);
  saveDB();
  renderContent();
  renderTabs();
  toast('✓ Pendiente completado.');
}

/* ---------- TAB LICENCIA (hoja TRAMITES LICENCIA) ---------- */

// Como WORKDAY.INTL de Excel: n días hábiles después de la fecha (antes, si n < 0).
function diaHabilMas(iso, n){
  let d = isoADate(iso);
  const paso = n < 0 ? -1 : 1;
  for(let k = Math.abs(n); k > 0; ){
    d = addDays(d, paso);
    if(isBusinessDay(d)) k--;
  }
  return dateKey(d);
}

// Los 19 festivos (filas M3:M21 de la hoja) a partir de una fecha: con eso las
// fórmulas del Excel cubren todo el trámite, aunque pase de un año al siguiente.
function festivosDesde(iso, n){
  const out = [];
  for(let y = Number(iso.slice(0,4)); out.length < n; y++){
    festivosColombia(y).forEach(f=>{ if(f.fecha >= iso && out.length < n) out.push(f); });
  }
  return out;
}

/* Cálculo del término (mismas fórmulas que la hoja del Excel, filas 19 a 28):
     antes         C19  días hábiles entre la radicación y la notificación del Acta (ambas excluidas)
     calendario    C21  días calendario de suspensión (notificación -> respuesta, ambas incluidas)
     habilesResp   C22  días hábiles de suspensión (ambas incluidas)
     reanudacion   C23  día hábil siguiente a la respuesta
     pendientes    C24  plazo - antes
     vencimiento   D27  respuesta + pendientes días hábiles
     verificacion  D28  antes + pendientes
   Además cubre los casos que el Excel no muestra: solo radicación (término
   corriendo) y Acta sin respuesta todavía (término suspendido).            */
function calcularLicencia(l){
  const r = {rad:l.fechaRadicacion||'', acta:l.fechaActa||'', resp:l.fechaRespuesta||'',
             plazo:Number(l.plazo)||LIC_PLAZO, errores:[], avisos:[], completo:false};
  const hoy = hoyLocal();
  if(!r.rad && !r.acta && !r.resp){ r.estado = 'vacio'; return r; }
  if(!r.rad) r.errores.push('Falta la fecha de radicación.');
  if(r.resp && !r.acta) r.errores.push('Hay fecha de respuesta pero falta la de notificación del Acta de Observaciones.');
  if(r.rad && r.acta && r.acta < r.rad) r.errores.push('La notificación del Acta es anterior a la radicación.');
  if(r.acta && r.resp && r.resp < r.acta) r.errores.push('La respuesta es anterior a la notificación del Acta.');
  if(r.errores.length){ r.estado = 'error'; return r; }

  if(!r.acta){
    // Sin Acta de Observaciones el término corre sin suspensión.
    r.estado = 'sinActa';
    r.vencimiento = diaHabilMas(r.rad, r.plazo);
    r.transcurridos = diasHabilesEntre(diaSiguiente(r.rad), hoy < r.vencimiento ? hoy : r.vencimiento);
    return r;
  }

  r.antes = diasHabilesEntre(diaSiguiente(r.rad), diaAnterior(r.acta));
  r.pendientes = r.plazo - r.antes;
  r.venceRespuesta = diaHabilMas(r.acta, LIC_RESPUESTA);
  r.venceProrroga = diaHabilMas(r.acta, LIC_RESPUESTA + LIC_PRORROGA);
  if(r.pendientes < 0) r.avisos.push({tipo:'warn', texto:'El Acta se notificó después de vencidos los '+r.plazo+' días hábiles del término.'});

  if(!r.resp){
    r.estado = 'suspendido';
    r.usadosRespuesta = diasHabilesEntre(diaSiguiente(r.acta), hoy);
    if(hoy > r.venceProrroga){
      r.avisos.push({tipo:'warn', texto:'Venció el plazo máximo para responder el Acta (30 + 15 días hábiles de prórroga) el '+fechaLarga(r.venceProrroga)+'.'});
    }else if(hoy > r.venceRespuesta){
      r.avisos.push({tipo:'warn', texto:'Vencieron los 30 días hábiles para responder: solo se puede responder si se solicitó la prórroga (hasta el '+fechaLarga(r.venceProrroga)+').'});
    }
    return r;
  }

  r.estado = 'completo';
  r.completo = true;
  r.calendario = serialExcel(r.resp) - serialExcel(r.acta) + 1;
  r.habilesResp = diasHabilesEntre(r.acta, r.resp);
  r.reanudacion = diaHabilMas(r.resp, 1);
  r.vencimiento = diaHabilMas(r.resp, r.pendientes);
  r.verificacion = r.antes + r.pendientes;
  r.usadosRespuesta = diasHabilesEntre(diaSiguiente(r.acta), r.resp);
  if(r.usadosRespuesta > LIC_RESPUESTA + LIC_PRORROGA){
    r.avisos.push({tipo:'warn', texto:'La respuesta se entregó '+r.usadosRespuesta+' días hábiles después de la notificación: fuera del plazo máximo (30 + 15 de prórroga). Riesgo de que la solicitud se considere desistida.'});
  }else if(r.usadosRespuesta > LIC_RESPUESTA){
    r.avisos.push({tipo:'warn', texto:'La respuesta se entregó '+r.usadosRespuesta+' días hábiles después de la notificación: usó la prórroga de 15 días hábiles (debe haberse solicitado antes de vencer los 30).'});
  }else{
    r.avisos.push({tipo:'ok', texto:'La respuesta se entregó '+r.usadosRespuesta+' días hábiles después de la notificación: dentro de los 30 días hábiles.'});
  }
  return r;
}

// Celdas de la hoja TRAMITES LICENCIA: datos, festivos y el resultado ya
// calculado (para que se vea aunque el visor no recalcule, ej. la vista previa
// de Drive; Excel de todos modos recalcula al abrir).
function escriturasLicencia(p){
  const l = asegurarLicencia(p);
  const r = calcularLicencia(l);
  const w = [];
  const W = (addr, value, type)=> w.push({addr, value, type});
  if(l.fechaRadicacion) W('D6', serialExcel(l.fechaRadicacion), 'n');
  if(l.fechaActa) W('D7', serialExcel(l.fechaActa), 'n');
  if(l.fechaRespuesta) W('D8', serialExcel(l.fechaRespuesta), 'n');
  W('D9', r.plazo, 'n');

  const inicio = l.fechaRadicacion || l.fechaActa || l.fechaRespuesta;
  const festivos = festivosDesde(inicio, LIC_FESTIVOS);
  festivos.forEach((f,i)=>{
    W('M'+(3+i), serialExcel(f.fecha), 'n');
    W('N'+(3+i), f.nombre, 's');
    W('O'+(3+i), f.tipo, 's');
  });
  const y1 = festivos[0].fecha.slice(0,4), y2 = festivos[festivos.length-1].fecha.slice(0,4);
  W('M1', 'Días festivos oficiales de Colombia — ' + (y1===y2 ? y1 : y1+'–'+y2), 's');

  const C = (addr, v)=> W(addr, r.completo ? v : '', 'cache');
  C('C19', r.antes); C('C21', r.calendario); C('C22', r.habilesResp);
  C('C23', r.completo ? serialExcel(r.reanudacion) : ''); C('C24', r.pendientes);
  C('D27', r.completo ? serialExcel(r.vencimiento) : ''); C('D28', r.verificacion);
  return w;
}

function setLicencia(campo, valor){
  const p = currentProject();
  if(!p) return;
  const l = asegurarLicencia(p);
  if(campo==='plazo') valor = Math.max(1, Math.round(Number(valor))||LIC_PLAZO);
  if(l[campo]===valor) return;
  l[campo] = valor;
  saveDB();
  // Solo se redibuja el resultado: redibujar los campos cortaría la escritura de la fecha.
  const zona = document.getElementById('lic_calc');
  if(zona) zona.innerHTML = htmlCalculoLicencia(p);
  const acciones = document.getElementById('lic_acciones');
  if(acciones) acciones.innerHTML = htmlAccionesLicencia(p);
}

// El último trámite de la pestaña General que tenga fecha de radicación.
function tramiteParaLicencia(p){
  return (p.tramites||[]).slice().reverse().find(t=>t.fechaRadicacion) || null;
}
function tomarFechasDelTramite(){
  const p = currentProject();
  const t = p && tramiteParaLicencia(p);
  if(!t) return;
  const l = asegurarLicencia(p);
  if(licenciaTieneDatos(p) && !confirm('¿Reemplazar las fechas de radicación y del Acta por las del trámite "'+
      (t.tipo==='Curaduría' ? 'Curaduría '+(t.numero||'') : 'Planeación')+(t.nroRadicado ? ' · '+t.nroRadicado : '')+'"?')) return;
  if(l.fechaRadicacion===t.fechaRadicacion && l.fechaActa===(t.fechaActa||'')) return;
  l.fechaRadicacion = t.fechaRadicacion;
  l.fechaActa = t.fechaActa || '';
  saveDB();
  renderContent();
  toast('✓ Fechas tomadas del trámite.');
}
function borrarLicencia(){
  const p = currentProject();
  if(!p || !licenciaTieneDatos(p)) return;
  if(!confirm('¿Borrar las fechas del cálculo de licencia de este proyecto?')) return;
  p.licencia = licenciaVacia();
  saveDB();
  renderContent();
}

function htmlAccionesLicencia(p){
  const t = tramiteParaLicencia(p);
  return (t ? `<button class="secondary" onclick="tomarFechasDelTramite()" title="Copia la fecha de radicación y la del Acta del último trámite registrado en General">Tomar fechas del trámite</button>` : '') +
    (licenciaTieneDatos(p) ? `<button class="secondary" onclick="borrarLicencia()">Borrar fechas</button>` : '');
}

function htmlCalculoLicencia(p){
  const r = calcularLicencia(asegurarLicencia(p));
  const hoy = hoyLocal();
  const avisos = r.avisos.map(a=>`<div class="licaviso ${a.tipo}">${escapeHtml(a.texto)}</div>`).join('');
  if(r.estado==='vacio'){
    return `<div class="card"><div class="pendvacio">Escribe la fecha de radicación para calcular el término.</div></div>`;
  }
  if(r.estado==='error'){
    return `<div class="card">${r.errores.map(e=>`<div class="licaviso warn">${escapeHtml(e)}</div>`).join('')}</div>`;
  }

  // Cuántos días hábiles faltan (o hace cuánto venció) respecto de hoy.
  const faltan = (venc)=>{
    if(hoy <= venc){
      const n = diasHabilesEntre(diaSiguiente(hoy), venc);
      return n ? 'Faltan '+n+' día(s) hábil(es).' : 'Vence hoy.';
    }
    return 'Venció hace '+diasHabilesEntre(diaSiguiente(venc), hoy)+' día(s) hábil(es).';
  };

  let principal = '';
  if(r.estado==='sinActa'){
    principal = `
      <div class="licetiqueta">Vencimiento del término (si no se notifica Acta de Observaciones)</div>
      <div class="licvence">${fechaLarga(r.vencimiento)}</div>
      <div class="licsub">${r.transcurridos} de ${r.plazo} días hábiles transcurridos. ${faltan(r.vencimiento)}</div>`;
  }else if(r.estado==='suspendido'){
    principal = `
      <div class="licetiqueta">Término suspendido desde la notificación del Acta</div>
      <div class="licvence">Esperando la respuesta del solicitante</div>
      <div class="licsub">Plazo para responder: hasta el <b>${fechaLarga(r.venceRespuesta)}</b> (30 días hábiles);
        con prórroga, hasta el <b>${fechaLarga(r.venceProrroga)}</b> (45). Lleva ${r.usadosRespuesta} día(s) hábil(es).</div>
      <div class="licsub">Del término ya corrieron ${r.antes} día(s) hábil(es); al reanudarse quedarán ${r.pendientes}.</div>`;
  }else{
    principal = `
      <div class="licetiqueta">Fecha en que se cumplen los ${r.plazo} días hábiles (vencimiento del término)</div>
      <div class="licvence">${fechaLarga(r.vencimiento)}</div>
      <div class="licsub">${faltan(r.vencimiento)} Verificación: ${r.verificacion} días hábiles contados (${r.antes} + ${r.pendientes}).</div>`;
  }

  const filas = r.acta ? [
    ['Días hábiles transcurridos antes de la suspensión (radicación → día previo a la notificación del Acta)', r.antes],
    ['Días calendario en suspensión (informativo)', r.completo ? r.calendario : '—'],
    ['Días hábiles que el solicitante tomó para responder (informativo)', r.completo ? r.habilesResp : '—'],
    ['Fecha de reanudación del término (día hábil siguiente a la entrega de la respuesta)', r.completo ? fechaLarga(r.reanudacion) : '—'],
    ['Días hábiles pendientes por transcurrir (plazo total − días antes de la suspensión)', r.pendientes]
  ] : [];

  return `
   <div class="card licresultado">
     <h3>Resultado</h3>
     ${principal}
     ${avisos}
   </div>
   ${filas.length ? `
   <div class="card">
     <h3>Cálculo paso a paso</h3>
     <table class="mini lictabla"><thead><tr><th>Concepto</th><th>Fecha / valor</th></tr></thead>
       <tbody>${filas.map(([c,v])=>`<tr><td>${escapeHtml(c)}</td><td>${escapeHtml(String(v))}</td></tr>`).join('')}</tbody>
     </table>
   </div>` : ''}`;
}

function renderLicencia(p,c){
  const l = asegurarLicencia(p);
  c.innerHTML = `
   <div class="card">
     <h3>Datos del trámite de licencia</h3>
     <div class="hint">Refleja la hoja "TRAMITES LICENCIA" del Excel: cálculo del término para resolver la solicitud de licencia de construcción (Decreto 1077 de 2015). Cada fecha se guarda al cambiarla y el cálculo se actualiza al instante.</div>
     <div class="grid2">
       <div class="field"><label>Fecha de radicación de la solicitud (en legal y debida forma)</label>
         <input type="date" id="lic_rad" value="${escapeHtml(l.fechaRadicacion)}" onchange="setLicencia('fechaRadicacion',this.value)"></div>
       <div class="field"><label>Fecha de notificación del Acta de Observaciones y Correcciones</label>
         <input type="date" id="lic_acta" value="${escapeHtml(l.fechaActa)}" onchange="setLicencia('fechaActa',this.value)"></div>
     </div>
     <div class="grid2">
       <div class="field"><label>Fecha de entrega (respuesta) a las observaciones por el solicitante</label>
         <input type="date" id="lic_resp" value="${escapeHtml(l.fechaRespuesta)}" onchange="setLicencia('fechaRespuesta',this.value)"></div>
       <div class="field"><label>Plazo legal para resolver la solicitud (días hábiles)</label>
         <input type="number" id="lic_plazo" min="1" step="1" value="${escapeHtml(String(l.plazo))}" onchange="setLicencia('plazo',this.value)"></div>
     </div>
     <div class="row-actions" id="lic_acciones">${htmlAccionesLicencia(p)}</div>
   </div>
   <div id="lic_calc">${htmlCalculoLicencia(p)}</div>
   <div class="card">
     <details class="licnorma">
       <summary>Fundamento normativo y metodología</summary>
       <p><b>Art. 2.2.6.1.2.3.1 Decreto 1077 de 2015 (modif. Decreto 1203 de 2017).</b> Los curadores urbanos o la entidad municipal o distrital competente tienen un plazo máximo de cuarenta y cinco (45) días hábiles para resolver la solicitud de licencia, contados a partir de la radicación en legal y debida forma.</p>
       <p><b>Art. 2.2.6.1.2.2.4 Decreto 1077 de 2015 (modif. Decretos 1203/2017 y 1783/2021).</b> Efectuada la revisión, el curador levanta —por una sola vez— Acta de Observaciones y Correcciones. El solicitante cuenta con 30 días hábiles para responder (prorrogables 15 días hábiles más). Durante ese lapso se suspende el término de los 45 días, que se reanuda el día hábil siguiente a la entrega de la respuesta.</p>
       <p><b>Metodología.</b> El día de la radicación no se cuenta (el conteo inicia el día hábil siguiente). El día de notificación del Acta inicia la suspensión (no se cuenta), que se mantiene hasta el día de entrega de la respuesta inclusive. Se excluyen fines de semana y festivos de Colombia (Ley 51 de 1983 y Ley 2578 de 2026).</p>
     </details>
   </div>`;
}

/* ---------- INICIO: RESUMEN DE PENDIENTES DE TODOS LOS PROYECTOS ----------
   Es la vista que se ve al abrir la app (currentId === null) y la primera
   entrada de la barra lateral. Solo lee: los pendientes se editan y se
   completan en la pestaña Pendientes de cada proyecto (abrirPendientesDe). */
function nombreProyecto(p){
  return p.general.nombre || p.general.descripcion || p.general.ruta || '(Proyecto sin nombre)';
}

// { total, proyectos, listas:[{key, label, corto, total, grupos:[{p, items}]}] }
// Proyectos del año más reciente primero y, dentro del año, por nombre.
function resumenPendientes(){
  const orden = DB.projects.slice().sort((a,b)=>
    String(anioDe(b)).localeCompare(String(anioDe(a)), undefined, {numeric:true}) ||
    nombreProyecto(a).localeCompare(nombreProyecto(b), 'es', {sensitivity:'base'}));
  const conPendientes = new Set();
  const listas = PEND_LISTAS.map(l=>{
    const grupos = [];
    orden.forEach(p=>{
      const items = (p.pendientes && p.pendientes[l.key]) || [];
      if(items.length){ grupos.push({p, items}); conPendientes.add(p.id); }
    });
    return Object.assign({}, l, {grupos, total: grupos.reduce((s,g)=>s+g.items.length, 0)});
  });
  return { listas, total: listas.reduce((s,l)=>s+l.total, 0), proyectos: conPendientes.size };
}

// Huella de lo que muestra el resumen: si no cambia, la sincronización no lo redibuja.
function firmaResumen(){
  return JSON.stringify(DB.projects.map(p=>[p.id, nombreProyecto(p), p.general.anio, p.general.ubicacion, p.pendientes||null]));
}

// Filtro por disciplina del resumen: preferencia de cada dispositivo.
const K_FILTRO_RESUMEN = 'hd:filtro-pendientes';
function filtroResumen(){
  let f = 'todas';
  try{ f = localStorage.getItem(K_FILTRO_RESUMEN) || 'todas'; }catch(e){}
  return PEND_LISTAS.some(l=>l.key===f) ? f : 'todas';
}
function fijarFiltroResumen(f){
  try{ localStorage.setItem(K_FILTRO_RESUMEN, f); }catch(e){}
  renderContent();
}

function renderResumen(c){
  const r = resumenPendientes();
  if(!DB.projects.length){
    c.innerHTML = '<div class="empty">Aún no hay proyectos. Crea uno con "+ Nuevo proyecto" en la barra lateral.</div>';
    return;
  }
  if(!r.total){
    c.innerHTML = `<div class="card"><h3>Pendientes</h3><div class="pendvacio">No hay pendientes registrados en ningún proyecto.
      Se agregan desde la pestaña Pendientes de cada proyecto.</div></div>`;
    return;
  }
  const filtro = filtroResumen();
  const chip = (key, texto, n)=>
    `<button type="button" class="reschip${filtro===key?' active':''}" onclick="fijarFiltroResumen('${key}')">${escapeHtml(texto)}<span>${n}</span></button>`;
  const chips = chip('todas', 'Todas', r.total) + r.listas.map(l=>chip(l.key, l.corto, l.total)).join('');

  const tarjetas = r.listas.filter(l=> filtro==='todas' || l.key===filtro).map(l=>{
    const grupos = l.grupos.map(g=>{
      const meta = [anioDe(g.p), g.p.general.ubicacion].filter(Boolean).join(' · ');
      const items = g.items.map(it=>`
        <li><span class="respend">${escapeHtml(it.pendiente || '(sin título)')}</span>${it.descripcion ? `<span class="resdesc">${escapeHtml(it.descripcion)}</span>` : ''}</li>`).join('');
      return `
       <div class="resproy">
         <button type="button" class="resproyhead" onclick="abrirPendientesDe('${escapeHtml(g.p.id)}')" title="Abrir los pendientes de este proyecto">
           <span class="resnombre">${escapeHtml(nombreProyecto(g.p))}</span>
           <span class="resmeta">${escapeHtml(meta)}</span>
           <span class="resabrir">Abrir ›</span>
         </button>
         <ul class="reslista">${items}</ul>
       </div>`;
    }).join('');
    return `
     <div class="card">
       <h3>${escapeHtml(l.label)} <span class="pendcount">${l.total||''}</span></h3>
       ${grupos || '<div class="pendvacio">Sin pendientes.</div>'}
     </div>`;
  }).join('');

  c.innerHTML = `
   <div class="hint" style="margin:0 0 12px;">Pendientes registrados en todos los proyectos, por disciplina. Toca un proyecto para abrir su pestaña Pendientes, donde se editan o se marcan como completados (✓).</div>
   <div class="reschips">${chips}</div>
   ${tarjetas}
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

  // Información actualizada a última versión del proyecto (filas 90-100, ver ELEM_LEFT / ELEM_RIGHT)
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
  // Contenido de las memorias de cálculo (filas 104-111, ver MEMORIAS_ITEMS)
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

  /* ---- HOJA LISTADO DE PENDIENTES ----
     Se regenera completa en cada guardado desde la plantilla (así los
     pendientes completados desaparecen también del Excel), y se copia a los
     Excel creados antes de que existiera esta hoja. Ver aplicarListado en
     xlsxpatch.js. */
  const pend = asegurarPendientes(p);
  const plantilla = b64ToArrayBuffer(TEMPLATE_B64);
  const listado = {
    hoja: PEND_HOJA,
    plantilla,
    columnas: ['D','E'],
    bloques: PEND_LISTAS.map(l=>({
      filaTitulo: l.fila,
      filas: PEND_FILAS,
      valores: pend[l.key].map(it=>[it.pendiente||'', it.descripcion||''])
    }))
  };

  /* ---- HOJA TRAMITES LICENCIA ----
     Con datos en la app, se regenera desde la plantilla y se escriben datos,
     festivos y resultado (ver escriturasLicencia). Sin datos, no se toca lo
     que el Excel ya tenga; si el Excel es anterior a la hoja, se le agrega
     vacía. */
  const licencia = {
    hoja: LIC_HOJA,
    plantilla,
    regenerar: licenciaTieneDatos(p),
    escrituras: licenciaTieneDatos(p) ? escriturasLicencia(p) : []
  };

  return XlsxPatch.patchXlsx(base || plantilla, escrituras, {listado, licencia});
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
  const btn = document.getElementById('btnDrive');
  if(btn) btn.disabled = true;
  try{
    // Conectar primero, sin nada que esperar antes: el navegador solo permite abrir
    // la ventana de Google inmediatamente después del toque en el botón.
    if(!Drive.conectado()) await Drive.conectar();
    const info = await Drive.sincronizarProyecto(p, msg => toast('☁ '+msg));
    // Se guarda en la versión vigente del proyecto (la sincronización con el equipo
    // pudo reemplazar el objeto mientras se subía el archivo).
    const vigente = DB.projects.find(x=>x.id===p.id);
    if(vigente){
      const cambio = !vigente.drive || vigente.drive.fileId!==info.fileId || vigente.drive.nombre!==info.nombre || vigente.drive.anio!==info.anio;
      vigente.drive = info;
      if(cambio){ vigente.updatedAt = new Date().toISOString(); } // el enlace nuevo debe llegar al equipo
      await guardarSinMarcar();
    }
    toast('✓ Guardado en Drive: ' + info.nombre + ' (carpeta ' + info.anio + ')');
    renderAll();
  }catch(e){
    toast('⚠ ' + e.message);
  }finally{
    if(btn) btn.disabled = false;
  }
}

/* ==================== INIT ==================== */
// Proyecto y pestaña abiertos: se recuerdan porque la renovación de la sesión
// de Google recarga la página, y al volver debe quedar todo donde estaba. Van en
// sessionStorage (vive mientras la pestaña o la app sigan abiertas y sobrevive a
// esa recarga): al abrir la app de nuevo no hay vista guardada y se arranca en
// el resumen de pendientes.
function recordarVista(){
  try{ sessionStorage.setItem('hd:vista', JSON.stringify({currentId, currentTab})); }catch(e){}
}
function restaurarVista(){
  try{ localStorage.removeItem('hd:vista'); }catch(e){} // donde se guardaba antes
  try{
    const v = JSON.parse(sessionStorage.getItem('hd:vista') || 'null');
    if(v && DB.projects.some(p=>p.id===v.currentId)){
      currentId = v.currentId;
      currentTab = TABS.some(t=>t.id===v.currentTab) ? v.currentTab : 'general';
      return;
    }
  }catch(e){}
  currentId = null; // inicio: resumen de pendientes
}

// Algo escrito en los formularios de "agregar" (trámite, entrega, elemento) que
// todavía no se agregó: eso no está guardado y se perdería al recargar.
function hayBorradorSinAgregar(){
  const porId = ['tr_nro_radicado','tr_fecha_acta','e_obs','e_obs2','e_envio','elem_extra_new']
    .map(id=>document.getElementById(id));
  const marcados = Array.from(document.querySelectorAll('[data-borrador]'));
  return porId.concat(marcados).some(el=> el && el.value.trim()!=='');
}

// Si la sesión de Google venció, la renueva en silencio (la página va a Google
// y vuelve en ~1 s). Solo si no se está escribiendo nada, para no perderlo.
function renovarSesionSiHaceFalta(){
  if(Drive.conectado() || syncBusy) return false;
  if(!Drive.puedeRenovarSilencioso()) return false;
  if(editandoCampo() || hayBorradorSinAgregar()) return false;
  setSyncStatus('conectando');
  Drive.renovarSilencioso();
  return true;
}

(async function init(){
  await loadDB();
  restaurarVista();
  renderAll();
  setSyncStatus();

  // Sesión de Google vencida pero renovable: ir a Google y volver, sin preguntar nada.
  if(renovarSesionSiHaceFalta()) return;

  const retorno = Drive.resultadoRetorno();
  if(retorno && retorno!=='ok'){
    toast('No se pudo renovar la sesión de Drive automáticamente. Pulsa 🔄 para conectar.');
  }

  // Primera actualización automática al abrir: lista del equipo + Excel de Drive
  // que aún no estén en la app. Si nunca se ha conectado este dispositivo, queda
  // en "Sin conectar" hasta que alguien pulse 🔄 (la primera vez Google pide
  // autorizar; desde ahí la sesión se mantiene sola).
  if(Drive.conectado()) sincronizarEquipo({silent:true, importar:true});

  // Deja lista la librería de Google para el botón 🔄 (conexión manual por ventana).
  Drive.init().catch(()=>{ /* falta CLIENT_ID en config.js, o sin conexión: se sigue en modo local */ });

  // Sondeo cada minuto y al volver a la app: trae lo que cambió el equipo y, si la
  // sesión venció mientras la app estaba abierta, la renueva.
  setInterval(()=>{
    if(Drive.conectado()) sincronizarEquipo({silent:true});
    else if(document.visibilityState==='visible' && !renovarSesionSiHaceFalta()) setSyncStatus();
  }, 60000);

  let ultimaVuelta = 0;
  function alVolverALaApp(){
    if(document.visibilityState!=='visible' || Date.now()-ultimaVuelta < 5000) return;
    ultimaVuelta = Date.now();
    if(Drive.conectado()) sincronizarEquipo({silent:true});
    else renovarSesionSiHaceFalta();
  }
  window.addEventListener('focus', alVolverALaApp);
  document.addEventListener('visibilitychange', alVolverALaApp);
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
