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
- `src/nexo/`: terminal multisistema (selector de sistemas de rol), perfil y sincronización en la nube.
- `src/traveller/`: apartado Traveller (aplicación principal, índice del manual, visor PDF, hangar, personajes y estilos generales).
- `src/vampiro/`: apartado Vampiro: La Mascarada.
- `src/dnd/`: apartado Dungeons & Dragons 5.5 y sus datos de progresión.
- `assets/iconos/` y `assets/fondos/`: iconos de la app e imágenes de fondo.
- `supabase/`: esquema de base de datos y configuración de la conexión en la nube.
- Si añades o mueves un archivo, actualiza también la lista `FILES` de `sw.js` y sube el número de `CACHE` para que los dispositivos instalados reciban el cambio.

## Partidas y datos

Al abrir NEXO aparece el selector de sistemas de rol. Traveller abre el selector de partidas; Vampiro y D&D abren cada uno su propio apartado. Dentro de una partida hay aplicaciones separadas para comercio, inventario, cartera, notas, mapa estelar, historial, hangar, personajes y un acceso al asistente de ChatGPT. En PERSONAJES puedes crear fichas editables ilimitadas para la partida, con datos personales, biométricos, vitales, habilidades y semanas; los campos son opcionales y las fichas se guardan automáticamente. Desde el logo NEXO se vuelve al selector de sistemas y el botón de cuadrícula permite cambiar de aplicación. Las operaciones confirmadas producen un pulso verde en cartera, inventario e historial. En Notas puedes crear, editar y eliminar apuntes con confirmación; se conservan por partida. La partida inicial conserva la cartera sembrada de 4.060.000 Cr.; las partidas nuevas empiezan con 0 Cr. y categorías vacías.

La aplicación de Mapa busca mundos y sistemas en Traveller Map, conserva el mundo elegido en cada partida y centra el mapa en su hexágono con un acercamiento local; muestra los datos de mundo disponibles y permite abrir el mapa incrustado o completo. El buscador y los datos requieren conexión a Internet; Traveller Map ofrece estos datos mediante su API pública.

La aplicación Traveller conserva un índice temático conciso del manual con referencias de página. Incluye un enlace al PDF compartido en Google Drive y cada resultado abre ese visor en la página correspondiente. El archivo permanece alojado en Drive; quienes lo consulten necesitarán permisos sobre el enlace compartido.

## Vampiro: La Mascarada

El apartado Vampiro tiene estética gótica propia (negro y rojo) y un creador de personajes basado en V20: concepto, clan con sus disciplinas y debilidad, atributos 7/5/3, habilidades 13/9/5 (máximo 3 en el reparto inicial), 3 puntos de disciplinas de clan, 5 de trasfondos, 7 de virtudes y 15 puntos gratuitos (atributo 5, habilidad 2, disciplina 7, trasfondo 1, virtud 2, Humanidad 2, Voluntad 1). Los defectos dan hasta 7 puntos extra. La Humanidad y la Fuerza de Voluntad se derivan de las virtudes, y el trasfondo Generación ajusta la generación y la reserva de sangre. Las fichas se guardan en este dispositivo (`localStorage`, clave `nexo-vampire-v1`), separadas de las partidas de Traveller, y con cuenta también en la nube.

Vampiro tiene dos apartados separados: las noches modernas (V20), que se abren desde el móvil de la mesa, y Edad Oscura (V20 Dark Ages: sus clanes, habilidades, trasfondos y sendas), que se abre desde el manuscrito y usa un estilo de códice iluminado en pergamino. Cada apartado solo muestra sus propias fichas. La generación base puede ser la 13ª o la 12ª (Edad Oscura parte de la 12ª). Las disciplinas de otros clanes se añaden desde la propia ficha y solo se compran con puntos gratuitos o experiencia. El número de puntos gratuitos y los PX iniciales son configurables, y se pueden añadir PX después con un motivo; la pestaña «Experiencia» aplica los costes de V20 (atributo ×4, habilidad ×2 o 3 nueva, disciplina de clan ×5, de otro clan ×7, Caitiff ×6 o 10 nueva, virtud ×2, Humanidad o Senda ×2, Voluntad ×1; trasfondo ×3 a criterio del Narrador).

La ficha incluye un apartado de diablerie (Amaranto en Edad Oscura) con explicación narrativa y mecánica, un tirador de Fuerza (dificultad 9) que acumula éxitos hasta la Fuerza de Voluntad de la víctima, y un registro de almas devoradas. Cada registro baja la generación (1 paso por defecto, más si lo concede el Narrador, nunca por debajo de la de la víctima), puede restar 1 de Humanidad o Senda si falla la degeneración y puede dar 1 punto gratuito en una disciplina de la víctima. Borrar un registro deshace sus efectos. Por diablerie se puede llegar hasta la 4ª generación, con su reserva de sangre y su máximo de rasgos.

## Dungeons & Dragons 5.5

El apartado D&D tiene estética medieval propia en tonos cálidos (ámbar, dorado y grises) y un creador de personajes basado en el Manual del Jugador de 2024: 12 clases, 10 especies (con su linaje y tamaño cuando corresponde) y 16 trasfondos. Las características se generan con matriz estándar (15, 14, 13, 12, 10, 8), compra de 27 puntos (de 8 a 15) o tiradas de 4d6 descartando el dado más bajo; el trasfondo aplica su mejora de +2/+1 o +1/+1/+1 a sus tres características, con un máximo de 20. Se eligen las habilidades de la clase, las de la especie (elfo y humano) y las de la dote Habilidoso, además de dos idiomas junto al Común; la dote de origen la da el trasfondo y el humano elige otra. NEXO calcula modificadores, bonificador de competencia, puntos de golpe por nivel (incluidos enano y Duro), CA sin armadura, iniciativa (con Alerta), percepción pasiva, salvaciones, habilidades y CD y ataque de conjuros, y muestra las elecciones pendientes. Con «Subir de nivel» el personaje avanza del nivel 1 al 20: en cada nivel se elige entre la media del dado de golpe o una tirada, a nivel 3 se elige subclase y en los niveles de Mejora de característica (y el Don épico a nivel 19) se reparte el +2/+1+1 o se anota una dote. El apartado muestra los rasgos de las 12 clases y sus 48 subclases del Manual de 2024, cada uno con una breve explicación narrativa y otra mecánica (`src/dnd/dnd-progresion.js`), y calcula recursos por nivel: furias, ataque furtivo, puntos de concentración y de hechicería, canalizar divinidad, ataques por acción y espacios de conjuro. Las fichas se guardan en este dispositivo (`localStorage`, clave `nexo-dnd-v1`) y, con cuenta, también en la nube.

El apartado El Archivo de las Tormentas (juego de rol del Cosmere, Manual de Stormlight de 2024) se abre desde la vinculacaña de la mesa y tiene su propio estilo de noche de alta tormenta, con luz tormentosa y latón. Su creador de personajes de nivel 1 cubre ascendencia (humano o cantor), dos culturas, camino heroico (agente, cazador, enviado, erudito, guerrero o líder, con su talento clave, su especialidad y un rango en su habilidad), 12 puntos de atributo (máximo 3), 4 rangos de habilidad (máximo 2), pericias según el Intelecto y, si se quiere, el camino radiante con orden, spren, Ideales pronunciados y potencias. NEXO calcula las tres defensas, salud, concentración, investidura, movimiento, sentidos, carga y dado de recuperación. Por encima del nivel 1 se anotan los atributos, rangos y salud ganados según la tabla del manual. Los textos son resúmenes propios en español. Las fichas se guardan en este dispositivo (`localStorage`, clave `nexo-tormentas-v1`) y, con cuenta, también en la nube.

## Vista principal

El selector de sistemas (`src/nexo/terminal-shell.js` y `mesa.css`) es una mesa de madera con un objeto por sistema: una PDA para Traveller, un cuaderno de cuero para D&D y un móvil para Vampiro. Los objetos llegan a la mesa con una animación, se levantan al pasar por encima (el cuaderno se entreabre, la PDA ilumina la pantalla y el móvil vibra) y se acercan al elegirlos. Con «reducir movimiento» activado no hay animaciones. Los emblemas de cada sistema están en `src/nexo/icons.js`. La pantalla de carga, la de cuenta y el perfil comparten la misma madera, papel y cuero (`src/nexo/nexo.css`).

## Perfil

El botón «Perfil» del selector de sistemas abre `src/nexo/profile.js`. Con cuenta muestra el correo y permite cambiar el nombre de usuario (que se elige al registrarse), cambiar la contraseña y cerrar sesión; sin cuenta ofrece iniciar sesión o crear una. También lista las campañas de Traveller y los personajes de Vampiro y D&D, y cada uno se abre directamente desde ahí; al salir del personaje se vuelve al perfil.

## Cuentas personales y sincronización

Cada jugador puede crear una cuenta con correo y contraseña, o pulsar «Continuar solo en este dispositivo» para guardar únicamente en el navegador. Con cuenta, las partidas de Traveller y las fichas de Vampiro y D&D son privadas y se sincronizan entre dispositivos; el navegador conserva siempre una copia local. Al iniciar sesión por primera vez con una cuenta vacía se suben los datos que ya hubiera en ese dispositivo. Al cerrar sesión se borra la copia local de esa cuenta. La sincronización no es edición colaborativa en directo y compartir partidas entre cuentas no está incluido.

Para montarlo en un proyecto Supabase gratuito: crea el proyecto, ejecuta `supabase/schema.sql` en el SQL Editor (crea `public.campaigns` para Traveller y `public.game_saves` para Vampiro, D&D y El Archivo de las Tormentas, con sus políticas RLS), pon la URL del proyecto y la clave publicable en `supabase/cloud-config.js` y, en Authentication → URL Configuration, añade la dirección donde se publica la web como Site URL y Redirect URL. Los proyectos gratuitos se pausan tras una semana sin uso; se reactivan desde el panel sin perder datos.

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
