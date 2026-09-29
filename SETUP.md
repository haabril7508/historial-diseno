# Configuración — Historial de Diseño (PWA + Google Drive)

## Qué es cada archivo

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Estructura de la página y carga de los scripts |
| `styles.css` | Estilos, incluida la capa responsive para teléfono |
| `app.js` | Toda la lógica del dashboard (proyectos, pestañas, armado del Excel) |
| `template.js` | La plantilla maestra `.xlsx` en base64 |
| `config.js` | **Lo único que hay que editar tras la configuración**: Client ID y carpeta raíz |
| `storage.js` | Guardado local en el dispositivo (`localStorage`) |
| `drive.js` | Login de Google y sincronización con Drive |
| `sw.js`, `register-sw.js`, `manifest.webmanifest`, `icons/` | Lo que hace que sea instalable como app |

---

## 1. Google Cloud Console

Todo con la cuenta de Gmail que es **dueña de la carpeta de Drive**.

1. **Crear proyecto** en <https://console.cloud.google.com> → nombre: `Historial Diseño App`.
2. **Habilitar la API**: *APIs & Services → Library* → buscar `Google Drive API` → **Enable**.
3. **Pantalla de consentimiento** (*APIs & Services → OAuth consent screen*):
   - Tipo de usuario: **External**.
   - Nombre de la app, correo de soporte, correo del desarrollador.
   - Scope: `https://www.googleapis.com/auth/drive`.
   - **Test users**: el correo de cada persona del equipo que vaya a usar la app (hasta 100).
   - Dejar la app en modo **Testing** (no publicar, no pedir verificación).
4. **Credenciales** (*APIs & Services → Credentials → Create Credentials → OAuth Client ID*):
   - Tipo: **Web application**.
   - *Authorized JavaScript origins*:
     - `http://localhost:8080` (para probar en el PC)
     - `https://haabril7508.github.io` (para GitHub Pages)
   - *Authorized redirect URIs* (necesarias para que la sesión se renueve
     sola, ver "Sesión de Drive" más abajo — **escribirlas exactamente así,
     con la barra final**):
     - `http://localhost:8080/`
     - `https://haabril7508.github.io/historial-diseno/`
   - Copiar el **Client ID** (termina en `.apps.googleusercontent.com`).

> Si la app ya estaba configurada antes y solo falta este paso: *APIs &
> Services → Credentials →* clic en el OAuth Client existente → agregar
> las dos *Authorized redirect URIs* → **Save**. Google puede tardar unos
> minutos en aplicarlo. Hacerlo **antes** de publicar la versión v5; si
> no, al vencer la sesión la app mostrará un error de Google
> (`redirect_uri_mismatch`) en vez de volver sola. Como plan B, en
> `config.js` se puede poner `RENOVACION_AUTOMATICA: false`.

> **Sobre la advertencia de Google:** el scope `drive` está clasificado como
> *restringido*. Aunque la app esté en modo Testing, a los usuarios de prueba
> les aparecerá la pantalla *"Google no ha verificado esta aplicación"*.
> Hay que entrar por **Configuración avanzada → Ir a Historial Diseño App**.
> Es esperado y solo pasa la primera vez por dispositivo.

## 2. Pegar el Client ID

En `config.js`, reemplazar el valor de `CLIENT_ID`.
`ROOT_FOLDER_ID` ya está puesto: es el tramo del link de la carpeta después de `/folders/`.

## 3. Compartir la carpeta

La carpeta raíz `Historial de Diseño` debe estar compartida como **Editor**
con el correo de cada persona del equipo.

## 4. Probar en local

```powershell
cd d:\User22\Documentos\historial-diseno-app
python -m http.server 8080
```

Abrir <http://localhost:8080>. No sirve abrir `index.html` con doble clic:
Google exige un origen `http`/`https` real.

## 5. Publicar en GitHub Pages

En este PC **git no está instalado**, así que la vía más corta es la web:

1. En GitHub: *New repository* → nombre `historial-diseno` → **Public** → *Create*.
2. En el repo vacío: *uploading an existing file* → arrastrar **el contenido** de
   `d:\User22\Documentos\historial-diseno-app` (los archivos y la carpeta `icons`,
   no la carpeta contenedora) → *Commit changes*.
3. *Settings → Pages → Source: Deploy from a branch → `main` / `(root)`* → *Save*.
4. A los ~2 minutos queda en `https://haabril7508.github.io/historial-diseno/`.

> **Sobre quién puede tocar este repositorio:** en el plan gratuito de GitHub,
> Pages necesita que el repo sea **público** (cualquiera puede *ver* el
> código). Eso no es un problema de seguridad por sí solo — no hay llaves ni
> secretos en este código — pero sí importa **quién tiene permiso de
> escritura** (colaborador). El scope de Drive que usa la app da acceso a
> *todo* el Drive de quien inicia sesión, no solo a la carpeta del proyecto,
> así que solo agrega como colaborador a gente de confianza en
> *Settings → Collaborators*. Nadie más puede modificar el código aunque lo
> vea.

Para actualizar después: volver a subir los archivos cambiados y **subir el
número de `VERSION` en `sw.js`**, si no los teléfonos siguen con la copia vieja.

Si prefieres línea de comandos, instala git desde <https://git-scm.com> y luego:

```powershell
cd d:\User22\Documentos\historial-diseno-app
git init
git add .
git commit -m "App de historial de diseño con sincronización a Drive"
git branch -M main
git remote add origin https://github.com/haabril7508/historial-diseno.git
git push -u origin main
```

## 6. Instalar en el teléfono

- **Android (Chrome):** abrir la URL → menú → *Instalar aplicación*.
- **iOS (Safari):** abrir la URL → botón Compartir → *Añadir a pantalla de inicio*.

---

## Estructura que la app mantiene en Drive

```
Historial de Diseño/
├── 2025/
│   └── Historial_de_diseño - Edificio Los Alpes.xlsx
└── 2026/
    └── Historial_de_diseño - Puente La Vega.xlsx
```

Al pulsar **☁ Guardar en Drive**:

1. Crea la subcarpeta del año si no existe.
2. Busca el archivo del proyecto (por el id guardado, o por nombre).
3. Si existe, lo descarga y escribe encima **solo las celdas con valor**, así que
   lo que la app tenga vacío se conserva tal cual estaba en el archivo.
4. Si no existe, lo crea a partir de la plantilla maestra.
5. Si cambió el "Año del proyecto", mueve el archivo a la carpeta del año nuevo.
6. Si cambió el nombre del proyecto, renombra el archivo.

---

## Lista de proyectos compartida entre dispositivos

Además de los Excel por proyecto, la app guarda un archivo `historial-db.json`
en la carpeta raíz de Drive con la lista completa de proyectos de todo el
equipo. Con esto, cualquier persona conectada a Drive ve y puede editar los
mismos proyectos desde cualquier dispositivo, no solo los que creó ella.

- Al editar un proyecto (con sesión de Drive activa), el cambio se sube solo,
  unos 1.5 segundos después de dejar de escribir.
- Al abrir la app se actualiza sola, sin pulsar nada. Después revisa en
  silencio cada minuto (y al volver a la app) si el resto del equipo
  agregó o cambió algo.
- El botón 🔄, junto a "Sin conectar" / "Conectado" en la barra lateral,
  fuerza una actualización inmediata (y pide conectar con Drive si hace
  falta).
- **Historiales creados antes de la lista compartida:** al abrir la app y
  al pulsar 🔄 se revisan los Excel de las carpetas de año en Drive; cada
  Excel que la app aún no conozca se importa como proyecto (leyendo sus
  celdas), así no hay que volver a crearlo. Un proyecto eliminado desde el
  dashboard no se vuelve a importar aunque su Excel siga en Drive (salvo
  los eliminados antes de esta función, que pueden reaparecer una vez:
  basta con eliminarlos de nuevo).
- Los proyectos que solo existían en un dispositivo (creados antes de la
  lista compartida) se suben solos la primera vez que ese dispositivo se
  conecta.
- Si dos personas editan **el mismo proyecto** a la vez, gana quien guarde de
  último (igual que con el Excel). Si editan proyectos **distintos**, ambos
  cambios quedan, sin pisarse.
- Eliminar un proyecto desde el dashboard lo elimina para todo el equipo la
  próxima vez que cada dispositivo sincronice (no borra ningún Excel).
- Sin conexión a Drive, la app sigue funcionando con la última copia
  guardada en este dispositivo (`localStorage`), pero solo se ven los
  cambios de los demás una vez que se vuelva a conectar.

## Sesión de Drive

- La **primera vez** en cada dispositivo hay que pulsar 🔄 y autorizar con
  Google. Desde ahí la sesión se mantiene sola: al abrir la app ya queda
  "☁ Conectado", sin volver a iniciar sesión.
- Google entrega sesiones de ~1 hora. Cuando vence, la app va a Google y
  vuelve en un segundo con una sesión nueva, sin preguntar nada (se ve
  como una recarga rápida). Lo hace al abrir la app, al volver a ella, o
  mientras está abierta si no se está escribiendo nada en ese momento.
- Solo vuelve a pedir conectar (🔄) si se cerró la sesión de Google en ese
  navegador, si se revocó el permiso, o si Google exige autorizar de nuevo.

## Listado de pendientes

- La pestaña **Pendientes** tiene una lista por disciplina (estructural,
  geotecnia, informes y memorias de cálculo, arquitectura, hidrosanitario).
  Se agregan con **+** (o Enter) y, al completarlos, se quitan con **✓**.
- En el Excel van en la hoja **LISTADO DE PENDIENTES**. Si una lista pasa de 5,
  la hoja agrega las filas necesarias con el mismo formato; al completar
  pendientes, el bloque vuelve a su tamaño.
- Esa hoja la escribe la app completa en cada "Guardar en Drive" / "Descargar
  Excel": lo que se escriba a mano directamente en ella se pierde al guardar
  desde la app. Los pendientes se manejan desde la app.
- Los Excel creados antes de esta versión reciben la hoja (al final del libro)
  la próxima vez que se guarden desde la app.

## Limitaciones conocidas

- **Sincronización del Excel en un solo sentido** (app → Excel). Si dos
  personas editan el mismo proyecto a la vez, gana quien guarde de último
  en el Excel. No hay bloqueo ni aviso.
- **iOS instalado en pantalla de inicio:** ahí la renovación automática
  no se intenta (en iPhone, salir a Google desde la app instalada abre
  otra ventana y la sesión no vuelve). La sesión sí se conserva al cerrar
  y reabrir durante su hora de vigencia; pasada la hora hay que pulsar 🔄.
  En Safari normal (sin instalar) sí se renueva sola.
- **App en modo Testing en Google Cloud:** es posible que Google pida
  autorizar de nuevo cada cierto tiempo (del orden de una semana) por estar
  la app sin verificar; en ese caso basta pulsar 🔄 una vez.
- **Verificación de Google:** con el scope `drive` en modo Testing, a cada
  usuario le va a salir la pantalla "Google no ha verificado esta app" la
  primera vez. Es esperado — entran por *Configuración avanzada → Ir a
  Historial Diseño App*.
