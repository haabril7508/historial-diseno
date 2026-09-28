/* ====================================================================
   CONFIGURACIÓN — rellenar con los datos de Google Cloud Console
   ==================================================================== */

const CONFIG = {

  /* Paso 4 del brief: Credentials → OAuth Client ID → Web application.
     Google entrega un valor que termina en .apps.googleusercontent.com  */
  CLIENT_ID: '1025904173273-22nph9h9vvcfb5e6ji68ltj3oostf2u3.apps.googleusercontent.com',

  /* Carpeta raíz "Historial de Diseño" en Drive.
     Es el tramo del link después de /folders/                          */
  ROOT_FOLDER_ID: '1swXIwerRIckf-AQGiF2TW78bgcpUdP7P',

  /* Scope elegido: acceso completo a Drive.
     Permite abrir la carpeta raíz existente directamente por su ID.
     (Con 'drive.file' Google solo daría acceso a archivos creados por
     la app o abiertos con el selector, y la carpeta ya existía.)        */
  SCOPE: 'https://www.googleapis.com/auth/drive',

  /* Nombre del archivo Excel de un proyecto.
     El dashboard original nombraba el archivo con la DESCRIPCIÓN, aunque
     en pantalla los proyectos se identifican por el campo "Nombre del
     proyecto". Aquí se usa el mismo orden que la interfaz. Si necesitas
     que coincida con archivos ya subidos con el nombre viejo, quita
     "g.nombre ||" de la línea de abajo.                                 */
  fileName(p){
    const g = (p && p.general) || {};
    const base = String(g.nombre || g.descripcion || g.ruta || 'proyecto').slice(0, 60).trim();
    return 'Historial_de_diseño - ' + base.replace(/[\\/:*?"<>|]/g, '-') + '.xlsx';
  },

  XLSX_MIME: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  FOLDER_MIME: 'application/vnd.google-apps.folder',
  JSON_MIME: 'application/json',

  /* Archivo con la lista de proyectos de TODO el equipo, compartido vía
     Drive (en la carpeta raíz, junto a las carpetas de los años). Es lo
     que permite que cualquier dispositivo conectado vea y edite los
     mismos proyectos. Ver DB_SYNC en app.js y descargarDB/subirDB en
     drive.js.                                                          */
  DB_FILE_NAME: 'historial-db.json'
};

CONFIG.isReady = function(){
  return !/^PEGAR_AQUI/.test(CONFIG.CLIENT_ID);
};
