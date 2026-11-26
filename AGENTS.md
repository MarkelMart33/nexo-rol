# Guía de trabajo para IA · NEXO

Esta guía es para cualquier asistente de IA (Claude Code, Codex, Copilot, Cursor…) que toque este repositorio. `CLAUDE.md` solo apunta aquí: si cambias una regla, cámbiala en este archivo. Lo que cuenta la app a quien la usa está en `README.md`; aquí está cómo trabajar en el código sin romperla.

Escribe en español: la interfaz, los mensajes de commit, los PR y los comentarios nuevos del código.

## Qué es

NEXO es una PWA de rol en español, sin framework, sin dependencias de npm y sin paso de compilación. Lo que hay en el repositorio es lo que se publica. Al abrirla aparece una mesa de madera con un objeto por sistema de juego; cada sistema tiene creador de personajes, pestañas Personajes / Campañas / Manual y lanzador de dados 3D. Sin cuenta todo se guarda en el navegador; con cuenta se sincroniza con Supabase.

Sistemas y edición de referencia (no mezcles ediciones):

| Sistema | Carpeta | Objeto de la mesa | Edición |
| --- | --- | --- | --- |
| Traveller | `src/traveller/` | PDA | Traveller (comercio, naves, mapa estelar con la API pública de Traveller Map) |
| Vampiro: La Mascarada | `src/vampiro/` | móvil (noches modernas) y manuscrito (Edad Oscura) | V20 y V20 Dark Ages |
| Dungeons & Dragons | `src/dnd/` | cuaderno de cuero | 5.5, Manual del Jugador 2024 |
| El Archivo de las Tormentas | `src/tormentas/` | vinculacaña | Cosmere RPG (Stormlight, 2024) |
| La llamada de Cthulhu | `src/cthulhu/` | expediente | 7ª edición (Edge) |
| Pathfinder | `src/pathfinder/` | brújula sobre un mapa | 2ª edición Remaster (Player Core 1 y 2), términos de Devir |

## Cómo probarla

- Sirve la carpeta con cualquier servidor estático, por ejemplo `python -m http.server 8080`, y abre `http://localhost:8080/`. Abrir `index.html` como archivo funciona para el guardado local, pero sin service worker ni instalación.
- No hay tests ni linter. Como mínimo, pasa `node --check` a cada JS que toques y abre la app en el navegador sin errores en la consola.
- El service worker sirve primero lo que tiene en caché. Si pruebas en un navegador que ya tenía NEXO, borra la caché o anula el registro del service worker, o verás la versión anterior.
- Prueba con «Continuar solo en este dispositivo» (sin cuenta). El guardado con cuenta necesita las credenciales de Markel: si tocas cuentas o sincronización y no puedes probarlo con una cuenta real, dilo en el PR.

## Estructura

- Raíz: `index.html` (entrada, carga todos los scripts en orden), `sw.js` (caché offline), `manifest.webmanifest`, `README.md`, esta guía.
- `src/nexo/`: lo común.
  - `terminal-shell.js` + `mesa.css`: la mesa (selector de sistemas) y `window.NEXO_NAV`, que gestiona el botón «atrás» del navegador.
  - `nexo.css`: madera, papel y cuero compartidos; define `--nexo-wood`.
  - `cloud-sync.js`: `window.NEXO_CLOUD`, guardado en la nube de las fichas y campañas de todos los sistemas salvo las partidas de Traveller.
  - `profile.js` / `profile.css`: perfil (cuenta, nombre de usuario, contraseña, accesos a campañas y personajes).
  - `apartados.js` / `apartados.css`: pestañas Personajes / Campañas / Manual comunes, campañas por sistema y lector del manual.
  - `dice.js` / `dice.css`: lanzador de dados 3D de todos los sistemas (`window.NEXO_DICE`).
  - `ficha.js` / `ficha.css`: lo común de las fichas (`window.NEXO_FICHA`): exportar, importar, hoja para imprimir y la ventanita de regla de `term(id, texto)`.
  - `copias.js`: archivos de ficha y copia de seguridad completa (`window.NEXO_COPIAS`).
  - `juego.js` / `juego.css`: panel «En juego» de las fichas (`window.NEXO_JUEGO`): contadores, estados y descansos.
  - `partida.js` / `partida.css`: modo partida (`window.NEXO_PARTIDA`), la ficha en pequeño para jugar en el móvil con la pantalla encendida (Wake Lock). Cada sistema le pasa `view(ch)` (título, números de un vistazo y grupos de tiradas, con `NEXO_PARTIDA.pick` para sacarlos de su `sheetData`) y `roll(clave, { adv })`; el panel «En juego» se monta dentro con `data-nj-open`, que lo deja siempre abierto.
  - `master.js` / `master.css`: herramientas de máster de las campañas (`window.NEXO_MASTER`): combate con iniciativa, PNJ y generadores. `master-datos.js` (`window.NEXO_MASTER_DATOS`) lleva las tablas de los generadores, una por ambientación, y el generador de mundos de Traveller.
  - `mundo.js` / `mundo.css`: notas de mundo enlazadas de cada campaña (`window.NEXO_MUNDO`): entradas con tipo y etiquetas, enlaces `[[Nombre]]` entre ellas y lo que de ellas leen los jugadores.
  - `grupo.js` / `grupo.css`: campañas compartidas (`window.NEXO_GRUPO`): código de invitación, grupo, ficha de cada jugador a la vista de quien dirige y tiradas en directo. Es el único módulo que habla con las tablas `shared_*`.
  - `icons.js`: emblemas SVG de cada sistema (`window.NEXO_ICONS`).
- `src/<sistema>/`: `<sistema>.js` (creador y fichas), `<sistema>.css`, `<sistema>-mesa.css` (su objeto en la mesa), `<sistema>-manual.js` y `<sistema>-manual-reglas.js` (manual de consulta). D&D y Pathfinder llevan además `<sistema>-progresion.js` con lo que da cada clase en cada nivel (`window.NEXO_DND_PROGRESSION`, `window.NEXO_PF_PROGRESSION`), que se carga antes que el script del sistema. Traveller es distinto: `app.js` es la aplicación de partidas (comercio, cartera, inventario, notas, mapa, hangar…) y gestiona también el inicio de sesión de toda NEXO.
- `assets/iconos/`, `assets/fondos/`: iconos de la app e imágenes.
- `supabase/schema.sql` (tablas y políticas RLS) y `supabase/cloud-config.js` (URL y clave publicable del proyecto).

## Cómo está hecho el código

- Cada archivo es una IIFE que publica una API en `window`. Los módulos se hablan solo a través de esas APIs y de eventos del `document`, nunca leyendo variables internas de otro.
  - Cada sistema de fichas expone `window.NEXO_<SISTEMA> = { open, close, list }` (`NEXO_VAMPIRE`, `NEXO_DND`, `NEXO_TORMENTAS`, `NEXO_CTHULHU`, `NEXO_PATHFINDER`). `open({ onExit, characterId, era })` abre el apartado; `list()` resume las fichas para el perfil.
  - Traveller expone `window.NEXO_TRAVELLER` (`campaigns`, `openCampaign`, `showCampaigns`, `signIn`).
  - Las herramientas de máster no saben dónde se guardan: `NEXO_MASTER.mount(herramienta, nodo, ctx)` recibe en `ctx` el sistema, el objeto donde viven `npcs` y `combat`, y las funciones `save()`, `party()` y `note(título, texto)`. En las campañas se lo da `apartados.js`; en Traveller, `app.js` a través de `window.NEXO_MASTER_API`, y `NEXO_MASTER_UI.open()` pinta la aplicación «MÁSTER». Cada sistema tiene su entrada en `SYSTEMS` de `master.js` (nombres de sus puntos de golpe y su defensa, cómo va su iniciativa y qué tablas usa): un sistema nuevo necesita la suya, y su tabla en `master-datos.js` si no le vale ninguna.
  - El «Mundo» tampoco sabe dónde se guarda: `NEXO_MUNDO.mount(nodo, ctx)` recibe el objeto donde vive `world`, `save()`, la entrada abierta y las funciones `open`, `close` y `editing` con las que quien lo monta apila cada entrada en `NEXO_NAV` (sin ellas lleva la vista por dentro, como en Traveller). `mentions()` le da los textos de fuera donde buscar `[[Nombre]]` (el diario y las notas) y `sharing` dice si hay casilla para enseñar la entrada (`no`, `off`, `on`). La baldosa sale sola en las campañas de cualquier sistema: uno nuevo no tiene que registrar nada.
  - La función `characters()` que cada sistema pasa a `NEXO_APARTADOS` devuelve, además de `id`, `name` y `summary`, el modificador de iniciativa del personaje en `init`, que usa el combate.
  - Para las campañas compartidas, cada sistema pasa a `NEXO_APARTADOS` un `shared` con `raw(id)` (la ficha tal cual), `card(ch)` (nombre, resumen, iniciativa y estado de juego), `accept(raw)` (el mismo de las fichas importadas) y `view(ch, opts)` (la hoja de solo lectura). `apartados.js` pinta la baldosa «Grupo» y «Unirse con un código» solo donde existe, y `NEXO_GRUPO` hace el resto con `mountOwner`, `mountPlayer` y `mountJoin`. Un sistema nuevo necesita su `shared` y su entrada en `THEMES` y `SYSTEM_NAMES` de `grupo.js`.
  - Los manuales se registran en `window.NEXO_MANUALS.<sistema>`.
  - Cada sistema de fichas describe con datos lo que el código común pinta: `sheetData(ch)` para la hoja de imprimir, `accept(raw)` para revisar una ficha importada y `playModel(ch)` para el panel «En juego» (contadores, medidores, estados y descansos). Un estado que cambia las tiradas se aplica en el `rollFromSheet` del sistema, que pasa a los dados el modificador y una nota (`opts.note`).
- Eventos:
  - `nexo:account-ready`: lo lanza `app.js` cuando la cuenta ha cargado.
  - `nexo:cloud-pulled`: lo lanza `cloud-sync.js` cuando ha traído de la nube las fichas y campañas de todos los sistemas.
  - `nexo:signed-out`: lo lanza `cloud-sync.js` al cerrar sesión, después de borrar la copia local de esa cuenta. Si un módulo guarda datos de la cuenta en memoria, debe soltarlos con este evento.
  - `nexo:saved` (`detail: { game, key }`): lo lanza `cloud-sync.js` cada vez que un sistema guarda su almacén. `grupo.js` lo usa para poner al día la ficha y la campaña compartidas.
  - `nexo:roll` (`detail: { system, result }`): lo lanza `dice.js` con cada tirada. `grupo.js` la envía al grupo si la campaña va en directo.
  - `nexo:group-changed`: lo lanza `grupo.js` cuando cambia a qué campaña van las tiradas o qué ha sido de la última; `dice.js` repinta su ventana.
- Mientras un sistema está abierto, `<html>` lleva la clase `nexo-<sistema>-open`, y `nexo-system-selected` cuando la mesa está oculta.
- Cada módulo carga su propio CSS y sus fuentes desde el JS al abrirse (`link.href = './src/…css?v=N'`).
- Los textos de la interfaz se escriben en el código, en español, con tildes y signos de apertura (¿ ¡). Escapa todo lo que venga del usuario con la función `esc` del módulo antes de meterlo en `innerHTML`.

## Datos y sincronización

- Claves de `localStorage`:
  - `nexo-traveller-v1`: partidas de Traveller. Su lista `nexo-traveller-v1-dirty` guarda los ids de las partidas con cambios que la nube aún no tiene.
  - `nexo-vampire-v1`, `nexo-dnd-v1`, `nexo-tormentas-v1`, `nexo-cthulhu-v1` y `nexo-pathfinder-v1`: fichas de cada sistema.
  - `nexo-campanas-v1`: campañas de todos los sistemas.
  - `nexo-juego-plegado`: si el panel «En juego» de cada ficha está plegado. Es una preferencia del dispositivo: no se sincroniza ni toca `updatedAt`.
  - `nexo-partida-despierta`: vale `no` si en este dispositivo se ha pedido que el modo partida no mantenga la pantalla encendida. No se sincroniza.
  - `nexo-grupos-v1`: campañas de otras cuentas en las que se juega y, por sistema, la campaña a la que van las tiradas. Es una copia de lo que dice la nube y se borra al cerrar sesión.
  - Cada clave de fichas y campañas tiene su marca `<clave>-cloud` (`clean` o `dirty`).
- Supabase:
  - `public.campaigns` guarda una fila por partida de Traveller.
  - `public.game_saves` guarda una fila por cuenta y juego (`vampiro`, `dnd`, `tormentas`, `cthulhu`, `pathfinder`, `campanas`) con todo el almacén en `data`.
  - `public.usernames` asegura que cada nombre de usuario (`user_metadata.display_name`) sea de una sola cuenta, sin distinguir mayúsculas. La rellenan unos triggers sobre `auth.users`. La app consulta si un nombre está libre con la función `username_available(name)`, nunca leyendo la tabla.
  - `public.shared_campaigns` (una fila por campaña compartida, con lo que ven los jugadores en `info`), `public.shared_members` (un jugador por fila, con la ficha que deja ver) y `public.shared_rolls` (las últimas 100 tiradas de cada campaña, que llegan por Realtime y, si falla, preguntando cada pocos segundos). Desde la app solo se leen y se borran: se escribe con las funciones `share_campaign`, `update_shared_campaign`, `renew_share_code`, `join_campaign` y `share_sheet`, y los nombres del grupo se piden con `shared_party`. Las tiradas son la única inserción directa.
  - La seguridad depende de las políticas RLS de `schema.sql`. La clave de `cloud-config.js` es la publicable: nunca pongas una clave secreta ni una contraseña en archivos servidos.
- La copia local es la de trabajo. Al guardar se sube el almacén entero, y al abrir un sistema se mezcla con la nube. Gana el `updatedAt` más reciente si hay cambios sin subir; si no, manda la nube.
- Al cerrar sesión se borra la copia local de esa cuenta. No hay edición colaborativa: cada cuenta edita solo lo suyo. Lo único que cruza de una cuenta a otra son las campañas compartidas con código, y nunca para escribir en los datos de otro.
- Una campaña compartida lleva `shared: { id, code, diary }` (su fila en la nube, el código y si los jugadores leen el diario) y viaja con la campaña en `game_saves`. Las notas, los PNJ y el combate nunca se copian a las tablas `shared_*`: lo que sale es lo que arma `publicInfo` en `grupo.js`, que mide el resultado en octetos para que quepa en la fila (150000) y, si no cabe, suelta las sesiones más antiguas. Del mundo salen solo las entradas con `seen`, sin su `id`, a través de `NEXO_MUNDO.publicEntries`; quien las recibe las pinta con `NEXO_MUNDO.view`, que las rehace y lo escapa todo.
- Lo que cambia durante la partida vive en la propia ficha, en `ch.play` (`v` contadores, `mx` máximos editados, `c` estados, `m` marcas, `t` medidores, `custom` contadores propios). Solo se lee a través de `NEXO_JUEGO`, que lo rehace con tipos sanos la primera vez que toca una ficha (`clean`), venga de donde venga; no lo leas directamente desde un sistema. Los contadores guardan la diferencia con su valor por defecto, así que un personaje que cambia de nivel conserva lo gastado.
- Las herramientas de máster guardan en la propia campaña (`npcs`, `combat` y el enlace `vtt`) y, en Traveller, en `data.master` de la partida. `NEXO_MASTER.clean` las rehace con tipos y límites sanos cada vez que se carga la campaña. Los resultados de los generadores no se guardan: viven en memoria hasta que se mandan a los PNJ o a las notas.
- Las notas de mundo viven en la campaña, en `world` (una lista de `{ id, type, name, tags, text, seen, updatedAt }`), y en Traveller en `data.master.world`. `NEXO_MUNDO.clean` las rehace con tipos y límites sanos al cargar. Los enlaces van por nombre, sin distinguir tildes ni mayúsculas, no por `id`: por eso un nombre no lleva corchetes ni barras, y al cambiarlo se reescriben los enlaces de las demás entradas.
- El nivel de una ficha es `ch.level` y todo lo que depende de él se calcula al pintar, nunca se guarda sumado. Lo que se elige al subir se guarda por nivel y no se borra al bajar (en Pathfinder: `lvBoosts`, `skillUps`, `saveUps`, `lvFeats`, `variant` y `hpBonus`). En Tormentas, `attrBonus`, `rankBonus` y `healthBonus` son solo lo que la mesa da fuera de la tabla de progresión; la marca `adv` dice que la ficha ya no lleva dentro de esos campos lo que da la tabla (`migrateAdvance` lo descuenta una vez en las fichas antiguas).
- Si cambias la forma de los datos, añade la normalización en el `normalize`/`load` del módulo para que las fichas antiguas sigan abriendo. No cambies el nombre de una clave sin migrar los datos.

## Reglas del repositorio

**Caché y versiones (obligatorio en cada cambio de un archivo servido)**
- Sube `CACHE` en `sw.js` (`nexo-static-vNN`) por encima del valor que tenga `main` en ese momento. Si otra rama lo ha subido antes que la tuya, vuelve a subirlo al fusionar.
- Sube el `?v=N` de cada JS o CSS que cambies en **todos** los sitios donde aparece: `index.html`, la lista `FILES` de `sw.js` y, para los CSS que se cargan desde JS, el `href` dentro de ese JS. Ese JS también cambia, así que sube también el suyo.
- Si añades, mueves o borras un archivo servido, actualiza `FILES` en `sw.js` (y `index.html` si es un script de arranque).

**Supabase**
- Añadir un sistema con guardado en la nube exige:
  - ampliar la lista `game in (...)` de `game_saves` en `supabase/schema.sql`, en el `create table` y en el `add constraint`;
  - añadir su clave a `LOCAL_KEYS` y a `GAMES` en `cloud-sync.js`.
- Después, **Markel tiene que volver a ejecutar `schema.sql`** en el SQL Editor de Supabase. Hasta entonces la nube rechaza ese sistema (error 23514) y la app avisa de que lo guarda solo en el dispositivo. Dilo en el PR.
- `schema.sql` debe poder ejecutarse varias veces sin romper nada (`if not exists`, `drop … if exists`).
- Campañas compartidas:
  - el código de invitación no se lee nunca de la tabla (la columna `code` no tiene permiso de lectura): solo lo devuelven `share_campaign`, `update_shared_campaign` y `renew_share_code` a quien dirige;
  - lo que llega de otra cuenta es texto ajeno: la ficha pasa por el `accept` de su sistema antes de pintarse y todo lo demás por `esc`; un enlace solo se pinta si es `http` o `https`;
  - si cambias una tabla o una función `shared_*`, Markel tiene que volver a ejecutar `schema.sql`. Hasta entonces la app avisa de que la nube aún no admite campañas compartidas.

**Mesa y navegación**
- Cada clic en un objeto de la mesa, o cualquier acción que salga de la mesa, llama a `window.NEXO_NAV.away()` antes de abrir. Dentro de un sistema, cada vista nueva (pestaña, ficha, entrada del manual) se apila con `NEXO_NAV.sub(volver)` y se quita con `NEXO_NAV.drop()`, para que «atrás» recorra las vistas antes de volver a la mesa.
- La mesa coloca los objetos en filas flex que envuelven (`.mesa-objects` en `src/nexo/mesa.css`): nada de posiciones absolutas que se solapen al cambiar el ancho.
- La madera es la textura compartida `--nexo-wood` de `src/nexo/nexo.css`. Úsala en lugar de crear otra.
- El objeto nuevo de un sistema va en `terminal-shell.js` (marcado y `launch`). Su estilo va en `src/<sistema>/<sistema>-mesa.css`, que se carga desde `index.html` (Vampiro lo carga desde `vampire.js`). Los objetos más antiguos (PDA, cuaderno, móvil) tienen su estilo en `mesa.css`.

**Disposición de pantalla**
- El botón flotante «Dados» va abajo a la derecha (`.nd-fab` en `dice.css`). No pongas nada fijo en esa esquina.
- La esquina superior derecha de cada sección es del perfil (la etiqueta de la mesa) y debe quedar libre en todos los apartados.
- Todo debe funcionar en el móvil, con un ancho de 360 px y sin desplazamiento horizontal.

**Movimiento reducido**
- Con `prefers-reduced-motion: reduce` no hay animaciones: ni en la mesa, ni en los dados (el resultado aparece directamente), ni en las transiciones de los apartados. Cada CSS con animaciones lleva su bloque `@media (prefers-reduced-motion: reduce)`, y el JS lo comprueba con `matchMedia` antes de esperar a una animación.

**Estilo de cada sistema**
- Cada sistema tiene su paleta y no se mezclan:
  - D&D usa ámbar, oro y grises cálidos, **sin verde ni rojo**.
  - Vampiro usa negro y rojo, y Edad Oscura pergamino iluminado.
  - Tormentas usa noche de alta tormenta, luz tormentosa y latón.
  - Cthulhu usa hojas mecanografiadas, verde espectral y sellos rojos.
  - Pathfinder usa carta de navegación, cielo violeta, latón, turquesa y bermellón.
- Las clases CSS llevan el prefijo del sistema (`vtm-`, `dnd-`, `pf-`, …) y las comunes de los apartados, `ap-`.

**Contenido de reglas**
- Los textos de reglas, clases, clanes, ocupaciones, dotes, etc. son **resúmenes propios**. Nunca copies texto de los manuales oficiales, ni siquiera fragmentos. Los números de las reglas (costes, tablas, puntos) sí pueden usarse.
- En el manual, cada entrada lleva su parte Narrativa y su parte Mecánica. Para enlazar se usa `[[id]]` o `[[id|texto]]`, `**negrita**` resalta y `- ` abre una lista. Si un enlace no lleva a ninguna entrada, la consola avisa con «NEXO manual: enlaces sin entrada»: después de tocar un manual, ábrelo y comprueba que no sale ese aviso.
- No repitas en el manual lo que ya está en los datos del creador (clases, clanes…): el manual lo construye desde esos datos.

**README**
- Si cambias algo que ve quien usa la app (un sistema, una regla, el guardado), actualiza la sección correspondiente de `README.md` en el mismo cambio.

## Git y trabajo en paralelo

- El remoto es `nexo-rol` (`github.com/MarkelMart33/nexo-rol`) y la rama principal es `main`. El checkout principal (`Desktop\Nexo-rol\nexo-traveller`) se queda en `main`.
- Trabaja en tu propio worktree con tu rama, al lado del checkout principal, por ejemplo `git worktree add -b mi-rama ../nexo-traveller-mi-rama nexo-rol/main`. Después ejecuta `git config branch.mi-rama.merge refs/heads/mi-rama` para que no apunte a `main`.
- Hay varias ramas abiertas a la vez. Antes de abrir el PR, trae `main` y resuelve los choques, que casi siempre están en `sw.js`, en `index.html` y en los `?v=`: quédate siempre con el número más alto más uno.
- Abre un PR por tarea. **No fusiones un PR hasta que Markel lo diga explícitamente.**
- No hay `gh` CLI: los PR se crean con la API REST de GitHub. Si `git push` da 403, la credencial guardada en Windows es la de otra cuenta (`markelmartin06`); hay que borrarla (`cmdkey /delete:git:https://github.com`) y volver a entrar como `MarkelMart33`.

## Antes de dar un cambio por terminado

1. `node --check` en cada JS tocado.
2. Subidos `CACHE` en `sw.js` y todos los `?v=` de lo que hayas tocado.
3. La app abre sin errores en la consola, con y sin movimiento reducido, en escritorio y a 360 px de ancho.
4. El botón «atrás» del navegador vuelve por las vistas y, al final, a la mesa.
5. La esquina superior derecha queda libre y los dados siguen abajo a la derecha.
6. Si has tocado un manual, no sale el aviso de enlaces sin entrada.
7. Si has tocado Supabase, el PR dice si Markel tiene que volver a ejecutar `schema.sql`.
8. `README.md` está al día.
