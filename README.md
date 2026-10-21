# NEXO · Traveller Trade Terminal

Terminal multiverso para NEXO, con el módulo Traveller como sistema disponible.

## Abrir y publicar

- Para consultar el proyecto en tu ordenador, abre `index.html`; el guardado local funciona en ese modo. Este modo no permite instalar NEXO ni habilita el servicio offline.
- NEXO ya incluye manifiesto de instalación, iconos de 192 y 512 px y caché de recursos. Las cuentas personales usan Supabase para autenticación y sincronización privada; sin cuenta, todo se guarda en el navegador. Para instalarlo en móvil/ordenador y usar la interfaz sin conexión, publica el contenido de esta carpeta en un alojamiento web con HTTPS.
- En desarrollo, sirve esta carpeta con cualquier servidor HTTP estático. La app de Mapa necesita conexión incluso cuando la interfaz está instalada.
- La versión pública necesitará un dominio o una dirección web del alojamiento. Después se podrá verificar el sitio en Google Search Console y enviar el sitemap; Google decide cuándo indexarlo y en qué posición mostrarlo.
- Al pasar del archivo local al dominio, el navegador lo considera otra instalación. En el primer acceso a una cuenta vacía, NEXO copia las partidas locales encontradas en ese navegador a la cuenta. Conserva una copia JSON como respaldo.

## Estructura del proyecto

- `index.html`, `sw.js` y `manifest.webmanifest` quedan en la raíz: son la página de entrada, el servicio offline y el manifiesto de instalación, y necesitan estar ahí para que la app funcione e instale bien.
- `src/nexo/`: terminal multisistema (selector de sistemas de rol), perfil, sincronización en la nube el lanzador de dados común a todos los sistemas (`dice.js` y `dice.css`) y los apartados de cada sistema (`apartados.js` y `apartados.css`: pestañas, campañas y lector del manual).
- `src/traveller/`: apartado Traveller (aplicación principal, índice del manual, visor PDF, hangar, personajes, manual de consulta, pestañas del selector de partidas y estilos generales).
- `src/vampiro/`: apartado Vampiro: La Mascarada.
- `src/dnd/`: apartado Dungeons & Dragons 5.5 y sus datos de progresión.
- `src/tormentas/`: apartado El Archivo de las Tormentas y su vinculacaña de la mesa.
- `src/cthulhu/`: apartado La llamada de Cthulhu y su expediente de la mesa.
- `src/pathfinder/`: apartado Pathfinder 2ª edición y su brújula de la mesa.
- Cada sistema tiene su manual de consulta en su carpeta: `vampiro-manual.js` (con `vampiro-manual-reglas.js`: combate y salud, sangre y alimentación, y sociedad), `dnd-manual.js` (con `dnd-manual-reglas.js`: combate, magia, estados y equipo), `tormentas-manual.js`, `cthulhu-manual.js`, `pathfinder-manual.js` (con `pathfinder-manual-reglas.js`: combate, estados, magia y descanso) y `traveller-manual.js`.
- `assets/iconos/` y `assets/fondos/`: iconos de la app e imágenes de fondo.
- `supabase/`: esquema de base de datos y configuración de la conexión en la nube.
- Si añades o mueves un archivo, actualiza también la lista `FILES` de `sw.js` y sube el número de `CACHE` para que los dispositivos instalados reciban el cambio.

## Partidas y datos

Al abrir NEXO aparece el selector de sistemas de rol. Traveller abre el selector de partidas; Vampiro, D&D, El Archivo de las Tormentas, La llamada de Cthulhu y Pathfinder abren cada uno su propio apartado. Dentro de una partida hay aplicaciones separadas para comercio, inventario, cartera, notas, mapa estelar, historial, hangar, personajes y un acceso al asistente de ChatGPT. En PERSONAJES puedes crear fichas editables ilimitadas para la partida, con datos personales, biométricos, vitales, habilidades y semanas; los campos son opcionales y las fichas se guardan automáticamente. Desde el logo NEXO se vuelve al selector de sistemas y el botón de cuadrícula permite cambiar de aplicación. Las operaciones confirmadas producen un pulso verde en cartera, inventario e historial. En Notas puedes crear, editar y eliminar apuntes con confirmación; se conservan por partida. La partida inicial conserva la cartera sembrada de 4.060.000 Cr.; las partidas nuevas empiezan con 0 Cr. y categorías vacías.

La aplicación de Mapa busca mundos y sistemas en Traveller Map, conserva el mundo elegido en cada partida y centra el mapa en su hexágono con un acercamiento local; muestra los datos de mundo disponibles y permite abrir el mapa incrustado o completo. El buscador y los datos requieren conexión a Internet; Traveller Map ofrece estos datos mediante su API pública.

La aplicación Traveller conserva un índice temático conciso del manual con referencias de página. Incluye un enlace al PDF compartido en Google Drive y cada resultado abre ese visor en la página correspondiente. El archivo permanece alojado en Drive; quienes lo consulten necesitarán permisos sobre el enlace compartido.

## Apartados de cada sistema: Personajes, Campañas y Manual

Dentro de cada sistema hay tres pestañas con el estilo de ese sistema:

- **Personajes**: las fichas y el creador de siempre.
- **Campañas**: campañas propias del sistema (Vampiro y Edad Oscura van por separado) con nombre, narrador, premisa, los personajes que juegan en ella (marcados de entre las fichas del sistema, que se abren desde ahí), un diario de sesiones con fecha, título y resumen, y notas. Se guardan en este dispositivo (`localStorage`, clave `nexo-campanas-v1`) y, con cuenta, en la nube. En Traveller, Campañas son las partidas de siempre, y Personajes reúne los viajeros de todas las partidas.
- **Manual**: guía de consulta del reglamento por capítulos, con índice lateral (fila de capítulos en el móvil), buscador que ignora tildes y mayúsculas, ruta de navegación, entradas anterior y siguiente, y enlaces entre entradas y a las relacionadas. Cada entrada explica la idea en la historia (Narrativa) y cómo se juega (Mecánica). Las clases, clanes, ascendencias, ocupaciones y demás se construyen con los datos de cada creador, así que no se repiten; las reglas básicas se escriben en cada archivo de manual. Las fichas enlazan a su entrada (clase, clan, ascendencia, ocupación, camino, orden…). Los textos son resúmenes propios.

En los textos del manual, `[[id]]` o `[[id|texto]]` enlaza con otra entrada o capítulo, `**negrita**` resalta y las líneas que empiezan por «- » forman listas. Si un enlace no lleva a ninguna entrada, la consola del navegador lo avisa. El botón «atrás» del navegador recorre las vistas (entrada, capítulo, pestaña, ficha) antes de volver a la mesa.

## Vampiro: La Mascarada

El apartado Vampiro tiene estética gótica propia (negro y rojo) y un creador de personajes basado en V20: concepto, clan con sus disciplinas y debilidad, atributos 7/5/3, habilidades 13/9/5 (máximo 3 en el reparto inicial), 3 puntos de disciplinas de clan, 5 de trasfondos, 7 de virtudes y 15 puntos gratuitos (atributo 5, habilidad 2, disciplina 7, trasfondo 1, virtud 2, Humanidad 2, Voluntad 1). Los defectos dan hasta 7 puntos extra. La Humanidad y la Fuerza de Voluntad se derivan de las virtudes, y el trasfondo Generación ajusta la generación y la reserva de sangre. Las fichas se guardan en este dispositivo (`localStorage`, clave `nexo-vampire-v1`), separadas de las partidas de Traveller, y con cuenta también en la nube.

Vampiro tiene dos apartados separados: las noches modernas (V20), que se abren desde el móvil de la mesa, y Edad Oscura (V20 Dark Ages: sus clanes, habilidades, trasfondos y sendas), que se abre desde el manuscrito y usa un estilo de códice iluminado en pergamino. Cada apartado solo muestra sus propias fichas. La generación base puede ser la 13ª o la 12ª (Edad Oscura parte de la 12ª). Las disciplinas de otros clanes se añaden desde la propia ficha y solo se compran con puntos gratuitos o experiencia. El número de puntos gratuitos y los PX iniciales son configurables, y se pueden añadir PX después con un motivo; la pestaña «Experiencia» aplica los costes de V20 (atributo ×4, habilidad ×2 o 3 nueva, disciplina de clan ×5, de otro clan ×7, Caitiff ×6 o 10 nueva, virtud ×2, Humanidad o Senda ×2, Voluntad ×1; trasfondo ×3 a criterio del Narrador).

La ficha incluye un apartado de diablerie (Amaranto en Edad Oscura) con explicación narrativa y mecánica, un tirador de Fuerza (dificultad 9) que acumula éxitos hasta la Fuerza de Voluntad de la víctima, y un registro de almas devoradas. Cada registro baja la generación (1 paso por defecto, más si lo concede el Narrador, nunca por debajo de la de la víctima), puede restar 1 de Humanidad o Senda si falla la degeneración y puede dar 1 punto gratuito en una disciplina de la víctima. Borrar un registro deshace sus efectos. Por diablerie se puede llegar hasta la 4ª generación, con su reserva de sangre y su máximo de rasgos.

## Dungeons & Dragons 5.5

El apartado D&D tiene estética medieval propia en tonos cálidos (ámbar, dorado y grises) y un creador de personajes basado en el Manual del Jugador de 2024: 12 clases, 10 especies (con su linaje y tamaño cuando corresponde) y 16 trasfondos. Las características se generan con matriz estándar (15, 14, 13, 12, 10, 8), compra de 27 puntos (de 8 a 15) o tiradas de 4d6 descartando el dado más bajo; el trasfondo aplica su mejora de +2/+1 o +1/+1/+1 a sus tres características, con un máximo de 20. Se eligen las habilidades de la clase, las de la especie (elfo y humano) y las de la dote Habilidoso, además de dos idiomas junto al Común; la dote de origen la da el trasfondo y el humano elige otra. NEXO calcula modificadores, bonificador de competencia, puntos de golpe por nivel (incluidos enano y Duro), CA sin armadura, iniciativa (con Alerta), percepción pasiva, salvaciones, habilidades y CD y ataque de conjuros, y muestra las elecciones pendientes. Con «Subir de nivel» el personaje avanza del nivel 1 al 20: en cada nivel se elige entre la media del dado de golpe o una tirada, a nivel 3 se elige subclase y en los niveles de Mejora de característica (y el Don épico a nivel 19) se reparte el +2/+1+1 o se anota una dote. El apartado muestra los rasgos de las 12 clases y sus 48 subclases del Manual de 2024, cada uno con una breve explicación narrativa y otra mecánica (`src/dnd/dnd-progresion.js`), y calcula recursos por nivel: furias, ataque furtivo, puntos de concentración y de hechicería, canalizar divinidad, ataques por acción y espacios de conjuro. Las fichas se guardan en este dispositivo (`localStorage`, clave `nexo-dnd-v1`) y, con cuenta, también en la nube.

El apartado El Archivo de las Tormentas (juego de rol del Cosmere, Manual de Stormlight de 2024) se abre desde la vinculacaña de la mesa y tiene su propio estilo de noche de alta tormenta, con luz tormentosa y latón. Su creador de personajes de nivel 1 cubre ascendencia (humano o cantor), dos culturas, camino heroico (agente, cazador, enviado, erudito, guerrero o líder, con su talento clave, su especialidad y un rango en su habilidad), 12 puntos de atributo (máximo 3), 4 rangos de habilidad (máximo 2), pericias según el Intelecto y, si se quiere, el camino radiante con orden, spren, Ideales pronunciados y potencias. NEXO calcula las tres defensas, salud, concentración, investidura, movimiento, sentidos, carga y dado de recuperación. Por encima del nivel 1 se anotan los atributos, rangos y salud ganados según la tabla del manual. Los textos son resúmenes propios en español. Las fichas se guardan en este dispositivo (`localStorage`, clave `nexo-tormentas-v1`) y, con cuenta, también en la nube.

El apartado La llamada de Cthulhu (7ª edición) se abre desde el expediente de la mesa y tiene su propio estilo de los años veinte: hojas mecanografiadas sobre la oscuridad del abismo, con verde espectral y sellos rojos. Su creador de investigadores genera las ocho características por tiradas (3D6×5 y (2D6+6)×5), valores rápidos (40, 50, 50, 50, 60, 60, 70, 80) o reparto de 460 puntos, y tira la Suerte aparte. La edad aplica sus efectos: pérdida a repartir entre FUE, CON y DES (o FUE y TAM de 15 a 19 años), penalización a APA y EDU, tiradas de mejora de EDU y reducción del movimiento. Hay 21 ocupaciones con su rango de Crédito, sus puntos de ocupación (EDU×4 o EDU×2 más la mejor característica que permitan) y sus habilidades, incluidas las interpersonales y las de libre elección, más una ocupación propia. Los puntos de ocupación e interés personal (INT×2) se reparten entre las habilidades con sus bases (Esquivar, DES/2; Lengua propia, EDU) y especialidades. NEXO calcula puntos de vida, Cordura y su máximo, puntos de magia, movimiento, bonificación al daño, corpulencia, nivel de vida y los valores difícil y extremo. La ficha incluye el trasfondo (descripción, ideología, allegados, lugares, posesiones y rasgos), equipo y notas. Las descripciones de ocupaciones son resúmenes propios. Las fichas se guardan en este dispositivo (`localStorage`, clave `nexo-cthulhu-v1`) y, con cuenta, también en la nube.

## Pathfinder 2ª edición

El apartado Pathfinder (2ª edición Remaster, clases del Player Core 1 y 2) se abre desde la brújula de explorador que descansa sobre un mapa del Mar Interior y tiene su propio estilo de carta de navegación bajo un cielo violeta, con latón, turquesa de piedra eón y bermellón. Su creador de personajes de nivel 1 cubre 8 ascendencias con su herencia (más changeling y nefilim como herencias versátiles), 23 bagajes y un bagaje propio, y 16 clases (alquimista, bárbaro, bardo, bruja, campeón, clérigo, druida, espadachín, explorador, guerrero, hechicero, investigador, mago, monje, oráculo y pícaro). Las mejoras de atributo siguen el Remaster: todo empieza en +0, la ascendencia da sus mejoras fijas y libres y su defecto (o dos libres con las mejoras alternativas), el bagaje da dos (una entre sus dos atributos), la clase el atributo clave y hay 4 libres, sin repetir atributo en un mismo apartado. Se entrenan las habilidades de la clase y del bagaje y se eligen las demás (las de la clase más INT, una más si el bagaje repite una de clase y otra por humano habilidoso), incluidos Saberes. NEXO calcula puntos de golpe, CA según la armadura y la competencia de la clase, Percepción, Fortaleza, Reflejos, Voluntad, velocidad, CD de clase, ataque y CD de conjuros, ataques cuerpo a cuerpo y a distancia, impedimenta e idiomas adicionales. La subclase (musa, doctrina, orden, truhanería…), las dotes y el equipo se anotan a mano. Los términos de la edición española de Devir se usan donde se conocen (bagaje, Saber, impedimenta, rangos de competencia); los nombres de herencias, dotes y subclases son traducciones propias, y los textos, resúmenes propios. Las fichas se guardan en este dispositivo (`localStorage`, clave `nexo-pathfinder-v1`) y, con cuenta, también en la nube.

## Dados

Cada sistema tiene su lanzador de dados (`src/nexo/dice.js`), con el aspecto de su apartado. Se abre con el botón flotante «Dados» de abajo a la derecha (en Traveller, desde la aplicación Dados) y también se tira directamente desde la ficha pulsando una habilidad, salvación, característica o atributo. Los dados son poliedros en 3D (d4, d6, d8, d10, d12 y d20) que cruzan la pantalla rodando, rebotan y se paran con la cara del resultado hacia arriba; después aparece una ventana flotante con el resultado, el detalle y las últimas tiradas. Con «reducir movimiento» activado no hay animación y el resultado aparece directamente.

- Traveller: 2D + MD contra la dificultad (8+ por defecto) con el Efecto, ventaja y desventaja (3D, se quedan los dos mejores o peores), dados D6 libres y D66. Desde la ficha suma el MD del atributo y el nivel de la habilidad.
- Vampiro (noches modernas y Edad Oscura): reserva de d10 contra la dificultad; los 1 cancelan éxitos, sin éxitos y con algún 1 es un fracaso estrepitoso, la especialización cuenta los 10 como dos éxitos y la Fuerza de Voluntad da un éxito automático. La reserva se elige sumando un atributo y una habilidad, disciplina o virtud de la ficha. El tirador de Fuerza de la diablerie usa este lanzador.
- D&D 5.5: d20 + modificador con ventaja o desventaja y CD opcional; en los ataques el 20 natural es crítico y el 1 falla. Tiradas de daño con dados doblados en el crítico.
- El Archivo de las Tormentas: d20 + modificador con ventaja o desventaja, el dado de trama (complicación de +2 o +4, oportunidad o nada) y el 20 y el 1 naturales como oportunidad y complicación; con dificultad indica «Sí, y además…», «Sí, pero…», «No, pero…» o «No, y además…».
- La llamada de Cthulhu: d100 contra la habilidad con éxito normal, difícil (mitad), extremo (quinto) y crítico (01), dados de bonificación y penalización y pifias (100, o de 96 a 100 con menos de 50).
- Pathfinder 2ª edición: d20 + modificador contra la CD con cuatro grados de éxito (±10 marca el crítico) y el 20 o el 1 naturales subiendo o bajando un grado; fortuna e infortunio y daño doble en el crítico.

## Vista principal

El selector de sistemas (`src/nexo/terminal-shell.js` y `mesa.css`) es una mesa de madera con un objeto por sistema: una PDA para Traveller, un cuaderno de cuero para D&D, un móvil para Vampiro, un manuscrito para Vampiro: Edad Oscura, una vinculacaña para El Archivo de las Tormentas y un expediente para La llamada de Cthulhu y una brújula de explorador sobre un mapa para Pathfinder. Los objetos llegan a la mesa con una animación, se levantan al pasar por encima (el cuaderno se entreabre, la PDA ilumina la pantalla, el móvil vibra del expediente asoma una fotografía y la aguja de la brújula da la vuelta hasta el norte) y se acercan al elegirlos. Con «reducir movimiento» activado no hay animaciones. Los emblemas de cada sistema están en `src/nexo/icons.js`. La pantalla de carga, la de cuenta y el perfil comparten la misma madera, papel y cuero (`src/nexo/nexo.css`).

## Perfil

El botón «Perfil» del selector de sistemas abre `src/nexo/profile.js`. Con cuenta muestra el correo y permite cambiar el nombre de usuario (que se elige al registrarse), cambiar la contraseña y cerrar sesión; sin cuenta ofrece iniciar sesión o crear una. También lista las campañas de Traveller y los personajes de Vampiro, D&D, El Archivo de las Tormentas, La llamada de Cthulhu y Pathfinder, y cada uno se abre directamente desde ahí; al salir del personaje se vuelve al perfil.

## Cuentas personales y sincronización

Cada jugador puede crear una cuenta con correo y contraseña, o pulsar «Continuar solo en este dispositivo» para guardar únicamente en el navegador. Con cuenta, las partidas de Traveller y las fichas de Vampiro, D&D, El Archivo de las Tormentas, La llamada de Cthulhu y Pathfinder son privadas y se sincronizan entre dispositivos; el navegador conserva siempre una copia local. Al iniciar sesión por primera vez con una cuenta vacía se suben los datos que ya hubiera en ese dispositivo. Al cerrar sesión se borra la copia local de esa cuenta. La sincronización no es edición colaborativa en directo y compartir partidas entre cuentas no está incluido.

Para montarlo en un proyecto Supabase gratuito: crea el proyecto, ejecuta `supabase/schema.sql` en el SQL Editor (crea `public.campaigns` para Traveller y `public.game_saves` para Vampiro, D&D, El Archivo de las Tormentas, La llamada de Cthulhu y Pathfinder, y las campañas de todos los sistemas (`campanas`), con sus políticas RLS; si ya lo tenías, vuelve a ejecutarlo para que acepte las campañas), pon la URL del proyecto y la clave publicable en `supabase/cloud-config.js` y, en Authentication → URL Configuration, añade la dirección donde se publica la web como Site URL y Redirect URL. Los proyectos gratuitos se pausan tras una semana sin uso; se reactivan desde el panel sin perder datos.

El proyecto Supabase debe tener la tabla `public.campaigns` y las políticas del archivo `supabase/schema.sql`. `supabase/cloud-config.js` contiene la URL del proyecto y una clave pública diseñada para usarse en el navegador; la protección depende de las políticas RLS. Nunca pongas una contraseña de base de datos ni una clave secreta en archivos web. El SMTP predeterminado de Supabase es limitado; solo envía correos a los miembros del equipo del proyecto. Para que otros jugadores puedan registrarse, desactiva «Confirm email» en Authentication → Sign In / Providers → Email, o configura un SMTP gratuito propio (también necesario para que otros jugadores recuperen la contraseña).

La importación JSON reemplaza los datos de la partida abierta. Úsala como respaldo manual.

## Mercancías y cálculos

El inventario y el selector de compra/venta incluyen componentes básicos y avanzados, vehículos básicos y avanzados, minerales básicos y minerales preciosos. **Añadir ítem** permite crear categorías propias con nombre y cantidad; al volver a añadir un nombre existente, suma unidades al mismo registro. Las categorías personalizadas también aparecen en el selector de compra/venta. Un panel independiente permite añadir o quitar créditos por hallazgos, pérdidas u otros ajustes ajenos a las operaciones comerciales; requiere confirmación y queda en el historial.

El resultado introducido se interpreta como tirada total final y se trunca a entero; no se suman modificadores. El precio es `precio base por unidad × tarifa de la tabla × packs × unidades por pack`. La compra reduce créditos y aumenta inventario; la venta requiere existencias suficientes, suma créditos y reduce inventario. La app solicita confirmación antes de aplicar una operación o un ajuste de cartera.

## Estado inicial

- Cartera: 4.060.000 Cr.
- Las seis categorías de mercancía empiezan en 0 unidades.

## Alcance

Incluye selector de sistemas y partidas locales, calculadora, inventario, hangar, fichas de personajes, notas, historial, deshacer la última operación, edición manual de cartera e inventario, importación/exportación JSON, visor y buscador de Traveller Map y soporte PWA. La autenticación y sincronización están desactivadas en la beta.


La portada de Traveller usa ahora la identidad visual orbital NEXO (NEXO Traveller RPG, Bienvenido, explorador y accesos con iconos ilustrados). El resto del terminal multisistema mantiene sus apartados D&D y Vampiro.
