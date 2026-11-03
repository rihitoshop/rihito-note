# RIHITO NOTES 💎 — Guía paso a paso

Es una **app web instalable (PWA)**: se instala en el Samsung Galaxy A07 como una app normal (icono en la pantalla de inicio, pantalla completa, funciona sin internet) y guarda todo en el propio teléfono.

---

## 1. Qué hay en la carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Página base de la app |
| `styles.css` | Colores y diseño (negro/morado/neón) |
| `app.js` | Toda la lógica: carpetas, ofertas, notas, contraseña, copias |
| `manifest.webmanifest` | Nombre e iconos de la app instalada |
| `sw.js` | Hace que la app abra sin internet |
| `icons/` | Iconos y la imagen del banner (recortada de tu maqueta) |

---

## 2. Probarla en la computadora (2 minutos)

**Forma fácil:** descomprime el ZIP, abre la carpeta `rihito-notes` y haz **doble clic en `index.html`**. Se abre en Chrome. Crea una contraseña y pruébala.
> Así sirve para probar, pero **no se puede instalar ni funciona sin internet**. Para eso sigue el paso 3.

Para ver cómo se vería en el teléfono: en Chrome pulsa **F12**, luego el icono de móvil/tablet (arriba a la izquierda del panel) y elige un teléfono.

---

## 3. Instalarla en tu Samsung Galaxy A07 (la forma recomendada)

Android sólo permite instalar una PWA si está en una dirección **https**. La forma más sencilla y gratis es **GitHub Pages** (ya usas GitHub para RIHITO SHOP):

1. Entra a **github.com** → botón verde **New** (nuevo repositorio).
2. Nombre: `rihito-notes`. Déjalo **Public**. Pulsa **Create repository**.
3. En la página del repositorio pulsa **uploading an existing file**.
4. Abre la carpeta `rihito-notes` de tu computadora, selecciona **todo su contenido** (los archivos y la carpeta `icons`, **sin** `LEEME.md` si no quieres) y arrástralo a la página. Pulsa **Commit changes**.
5. Ve a **Settings → Pages**. En *Branch* elige `main` y carpeta `/ (root)` → **Save**.
6. Espera 1–2 minutos. Aparecerá la dirección, algo como `https://TU-USUARIO.github.io/rihito-notes/`.
7. En el teléfono abre **Chrome** y entra a esa dirección.
8. Crea tu contraseña.
9. Toca los **⋮ tres puntos** de Chrome → **Instalar aplicación** (o **Añadir a la pantalla de inicio**) → **Instalar**.

Ya tienes el icono **RIHITO NOTES** en el teléfono. Ábrelo desde ahí.

> Tus notas **no** se suben a GitHub. El repositorio sólo contiene el código; tus datos se quedan en el teléfono.

**Alternativa sin GitHub:** entra a **app.netlify.com/drop**, arrastra la carpeta `rihito-notes` y te da una dirección https.

### ¿Y un APK?
No pude generar un APK desde aquí (no hay herramientas de Android disponibles en mi entorno), así que **no te prometo uno**. Si de verdad lo quieres:
1. Publica la app como en el paso 3.
2. Entra a **pwabuilder.com**, pega tu dirección → **Package for stores → Android**.
3. Descarga el paquete. Para instalar el `.apk` en tu teléfono tendrás que permitir “instalar apps de origen desconocido”.

⚠ **Un APK guarda sus datos aparte** de la versión instalada desde Chrome. Si cambias de una a otra, exporta una copia en la primera e impórtala en la segunda.

---

## 4. Cómo se usa

- **Inicio:** acceso a Notas, Carpetas, Diamantes Free Fire y “Más”. Botones rápidos para nueva nota, nueva carpeta y copias.
- **Carpetas:** toca una para abrirla. Los **⋮** permiten abrir, cambiar nombre o eliminar. Viene con **Diamantes Free Fire** (110, 220, 341, 572), todo editable o borrable.
- **Ofertas:** dentro de una carpeta, **Añadir Oferta**, escribe cualquier nombre y los precios. La ganancia es **venta − compra**, y el porcentaje es ganancia ÷ compra. Toca una oferta para ver su ficha; ahí **Editar** o **Eliminar**. Si borras todas, la carpeta queda vacía con sólo el botón Añadir Oferta.
- **Notas:** título, contenido, color de fondo y de texto. Se guardan solas mientras escribes (y con el botón **Guardar**).
- **Estadísticas:** totales y ganancias por carpeta.
- **Perfil:** copias de seguridad, cambiar contraseña, bloquear, borrar datos.

---

## 5. Contraseña: qué protege y qué no

- Se pide al abrir la app y no se muestra nada antes de desbloquear.
- Se guarda **transformada (PBKDF2)**, no en texto legible.
- **Limitación importante:** es una contraseña **local**. Evita que alguien abra la app en tu teléfono, pero tus notas y ofertas se guardan **sin cifrar** dentro del navegador. Quien tenga acceso técnico al teléfono podría leerlas. No guardes información muy sensible (contraseñas de cuentas, datos bancarios).
- **Si la olvidas no se puede recuperar.** La opción “Olvidé mi contraseña” borra los datos del teléfono; podrás restaurar un archivo de copia si lo tienes.
- La app se bloquea sola si pasa más de 1 minuto en segundo plano.

---

## 6. Cómo no perder tus datos

- **Actualizar la app no borra nada:** los datos viven en el teléfono, separados de los archivos de la app.
- Se pierden sólo si: borras los datos del navegador/app (Ajustes de Android → Apps → Chrome → Almacenamiento → *Borrar*), desinstalas la app o cambias de teléfono.
- **Haz copias:** Perfil → **Exportar copia**. Se descarga un archivo `rihito-notes-copia-AAAA-MM-DD.json`. Guárdalo también en Google Drive o envíatelo por WhatsApp. Hazlo al menos una vez por semana y siempre **antes** de actualizar.
- **Restaurar:** Perfil → **Importar / restaurar copia** → elige el archivo. Antes de reemplazar, la app guarda una copia automática de lo que tenías.
- La copia **no incluye la contraseña** (tendrás que crear una al restaurar en un teléfono nuevo).

---

## 7. Cómo actualizar o modificar la app más adelante

1. Abre los archivos con un editor de texto (el Bloc de notas sirve; mejor **VS Code**, gratis).
2. Cambia lo que quieras y **guarda**.
3. Súbelos otra vez a GitHub (reemplazan a los anteriores).
4. **Importante:** en `sw.js`, cambia `rihito-notes-v1` por `rihito-notes-v2` (y así en cada actualización). Si no, el teléfono puede seguir mostrando la versión vieja.
5. Cierra y abre la app dos veces para que cargue la nueva.

**Cambios típicos**
- **Colores:** `styles.css`, las variables al inicio (`--neon`, `--purple`, `--bg`…).
- **Ofertas/carpeta de ejemplo:** `app.js`, función `defaultData()` (sólo afecta a instalaciones nuevas).
- **Mover botones del menú inferior:** `app.js`, función `nav()`.
- **Banner de inicio:** reemplaza `icons/hero.jpg` por otra imagen (mismo nombre).

---

## 8. Qué se probó y qué no (sin adornos)

**Probado automáticamente en Chrome con pantalla de 360 px de ancho (48 pruebas, todas correctas):** crear contraseña y entrar, rechazo de contraseña errónea; crear/renombrar/eliminar carpetas; crear/editar/eliminar ofertas y “Eliminar todas”; carpeta vacía con sólo “Añadir Oferta”; cálculo de ganancia (por ejemplo 110→150 = 40, 36.4 %); crear/editar/eliminar notas, colores, búsqueda y autoguardado; exportar e importar copias (y rechazo de archivos inválidos); persistencia tras cerrar y volver a abrir el navegador; sin desplazamiento horizontal; manifest y service worker válidos.

**No pude comprobar:**
- **En tu Samsung Galaxy A07 real.** La instalación y el aspecto final dependen de tu Chrome; si algo se ve raro, dímelo.
- **APK:** no generado (ver sección 3).
- **Parecido con la maqueta:** el banner de inicio es un recorte de tu propia imagen (personaje y logo), no un dibujo mío. El resto del diseño lo reproduje a mano siguiendo la maqueta (colores, tarjetas, bordes, iconos), pero no es idéntico píxel a píxel: los iconos son de estilo similar, no los mismos de la imagen.
- En la maqueta aparecen otras carpetas de ejemplo (Cuentas de FF, Recargas…); no las incluí porque pediste sólo la de Diamantes, pero puedes crearlas en 5 segundos.
