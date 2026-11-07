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

---

## 9. Novedades (versión 1.2)

- **Calculadora** con estilo Halloween: Inicio → **Más** → **Calculadora**.
- **Notas:** al tocar una nota se ve en modo lectura con un botón **Editar**; ahí se cambian el texto y los colores.
- **Icono nuevo** de la app (calabaza).

**Actualizar más adelante:** sube los archivos cambiados a GitHub (dentro de la carpeta `rihito-notes`, y las imágenes dentro de `icons`) y cambia el número de `rihito-notes-v4` en `sw.js` por `v5`, `v6`… para que el teléfono cargue la versión nueva.

---

## 10. Novedades (versión 1.4)

- **Perfil** rediseñado (tarjeta con estadísticas y secciones ordenadas).
- **Borrar todos los datos** ahora pide tu **contraseña** (además de la confirmación).
- Calculadora tipo teléfono: la cuenta se ve seguida y al dar `=` queda sólo el resultado.
- Ojo para ver/ocultar la contraseña; menú ⚙ dentro de cada nota.
- En `sw.js` el número de versión ahora es `rihito-notes-v12`; súbelo a `v13`, `v14`… en cada cambio.

## 11. Novedades (versión 1.5)

- **La app ya no pide contraseña por defecto.** Entra directo.
- Perfil → **Contraseña**: si no hay, sólo aparece **Poner contraseña**; si ya hay, aparecen **Cambiar** y **Quitar** (Quitar pide la contraseña actual).
- Sin contraseña, borrar una nota o todos los datos pide sólo confirmación; con contraseña la sigue pidiendo.
- Si ya tenías contraseña, se conserva hasta que la quites.
- Al actualizar, cambia en `sw.js` a `rihito-notes-v13`.

## 12. Novedades (versión 1.6)

- **Nota de cálculo:** al tocar **+ / Crear Nota** eliges *Nota normal* o *Nota de cálculo*. La de cálculo tiene título, descripción y líneas **Descripción | Número | Moneda (CUP, SM, $)**, con **+ Agregar línea** y **Quitar** (muestra una ✕ en cada línea). Se edita y cambia de color como las demás; borrarla pide la contraseña si tienes una.
- En **Mis Notas** el lápiz de arriba ahora es un **+**.
- En `sw.js` el número de versión es `rihito-notes-v15`; súbelo en cada cambio.

## 13. Versión 1.7

- Nota de cálculo: **Editar → Color de las líneas**; caja de moneda **cuadrada y en negrita**, con la moneda centrada. Nuevas notas de cálculo empiezan en morado.
- Número centrado (v1.8). `sw.js`: `rihito-notes-v17`.
- Descripción de cada línea en negrita (v1.9). `sw.js`: `rihito-notes-v18`.

## 14. Versión 2.0

- **Perfil:** nombre de usuario y foto de perfil (redonda, sin borde, con un lápiz). Toca la foto o el nombre → Tomar foto / Elegir de la galería / Cambiar nombre / Quitar foto. La foto se reduce (320 px) y entra en la copia de seguridad.
- `sw.js`: `rihito-notes-v19`.

## 15. Versión 2.1

- "Borrar todos los datos" ya no está en el Perfil: ahora está en **Perfil → Seguridad → Contraseña**, y solo aparece si tienes contraseña puesta. Pide confirmación y la contraseña. `sw.js`: `rihito-notes-v20`.

## 16. Versión 2.2

- Nueva imagen de portada (Inicio y pantalla de contraseña), a su tamaño original 1254×1254.
- Calculadora: marco de la pantalla de borde a borde y pantalla más baja. `sw.js`: `rihito-notes-v21`.

## 17. Versión 3.0 — Editar App
- Perfil → **Editar App** → **CAMBIAR COLOR** (14 colores: Morado, Verde limón, Rojo vino 🍷, Rojo, Azul, Celeste, Turquesa, Verde, Dorado, Naranja, Rosa, Magenta, Chocolate, Plata) y **CAMBIAR LETRA** (20 tipos + interruptor Negrita).
- Las letras se descargan de internet la primera vez (después quedan guardadas por el teléfono).
- El banner, el encabezado de la calculadora y el icono de la app mantienen sus colores originales.
- Estilo Purple Glass Premium, mosaico Calculadora en Inicio, sin botón "Crear Nota" (solo el +).
- Borrar todos los datos restablece el color y la letra.

## 18. Versión 3.1 — Sin brillo
- Se quitaron todos los resplandores; solo quedan las líneas del color elegido.
- Fondo y tarjetas casi negros: cada color queda como "color con negro".

## 19. Versión 3.2 — Paletas y mezclador
- Cambiar color: interruptor "Fondo negro puro", 10 paletas color + negro, cuadro para mezclar cualquier color (cuadro + barra de tono) y los 14 colores.

## 20. Versión 3.3 — Estilo limpio
- Misma forma de siempre; interior grafito/negro y un solo color de acento (bordes, rayas, iconos).
- Todas las letras y números en blanco.
- Fondo siempre negro (se quitó el interruptor de fondo negro).

## 21. Versión 3.4
- **Ventas** (menú de abajo): anota cliente, producto, compra, venta y cantidad; totales de hoy, 7 días y mes; compartir por WhatsApp. Estadísticas se abre desde Ventas o desde "Más".
- **Papelera** (Perfil): las notas borradas se guardan 30 días; recuperar, eliminar para siempre o vaciar.
- **Fijar arriba** y **Compartir por WhatsApp** en el menú de cada nota.
- **Recordatorio de copia de seguridad**: al abrir la app, si llevas 7+ días sin copia (o 2 días de uso sin ninguna).
- **Huella**: Perfil → Seguridad → Entrar con huella (solo aparece si tienes contraseña). La contraseña siempre sigue funcionando.

## 22. Versión 3.5 — Carpetas de Cuentas FF
- Al crear una carpeta eliges el tipo: **Ofertas** (como siempre) o **Cuentas FF**.
- Cada cuenta guarda correo, contraseña, códigos de 8 dígitos, moneda (CUP, SM, $), precio de compra, precio de venta y ganancia (se calcula sola). Botones para copiar cada dato.
- Resumen de la carpeta: cuentas guardadas, invertido y ganancia total por moneda.
- Las contraseñas se guardan en el teléfono sin cifrar, igual que las notas.
