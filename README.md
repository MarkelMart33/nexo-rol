# NEXO · Traveller Trade Terminal

MVP estático para llevar partidas comerciales de Traveller.

## Abrir y publicar

- Para consultar el proyecto en tu ordenador, abre `index.html`; el guardado local funciona en ese modo. Este modo no permite instalar NEXO ni habilita el servicio offline.
- NEXO ya incluye manifiesto de instalación, iconos de 192 y 512 px y caché de recursos. Las cuentas personales usan Supabase para autenticación y sincronización privada. Para instalarlo en móvil/ordenador y usar la interfaz sin conexión, publica el contenido de `outputs` en un alojamiento web con HTTPS.
- En desarrollo, sirve la carpeta `outputs` con cualquier servidor HTTP estático. La app de Mapa necesita conexión incluso cuando la interfaz está instalada.
- La versión pública necesitará un dominio o una dirección web del alojamiento. Después se podrá verificar el sitio en Google Search Console y enviar el sitemap; Google decide cuándo indexarlo y en qué posición mostrarlo.
- Al pasar del archivo local al dominio, el navegador lo considera otra instalación. En el primer acceso a una cuenta vacía, NEXO copia las partidas locales encontradas en ese navegador a la cuenta. Conserva una copia JSON como respaldo.

## Partidas y datos

Al entrar aparece la N durante dos segundos con una barra de carga; después se muestra directamente el selector de partidas. Elige una campaña para abrirla, renombrarla o crear una partida vacía. Al entrar en una partida aparece un lanzador estilo PDA con aplicaciones separadas para comercio, inventario, cartera, notas, mapa estelar, historial y un acceso externo al asistente de ChatGPT. Dentro de cada módulo, el logo NEXO de la esquina superior izquierda vuelve al inicio de la partida y el botón de cuadrícula abre un menú para cambiar de aplicación sin volver al inicio. En la app móvil de ChatGPT se puede activar «Iniciar con voz» en Ajustes → Voz; el arranque automático depende de que ChatGPT abra un chat nuevo o vacío. NEXO no controla ese ajuste ni puede iniciar el micrófono desde su enlace. Las transiciones de entrada a partidas y aplicaciones muestran una conexión de terminal de alrededor de un segundo; las operaciones confirmadas producen un pulso verde en cartera, inventario e historial. En Notas puedes crear varias notas con título y contenido, guardarlas, cerrarlas, reabrirlas para editarlas y eliminarlas con confirmación; se conservan por partida. Los textos antiguos del bloc se migran a una nota titulada «Nota de la partida». La partida inicial conserva la cartera sembrada de 4.060.000 Cr.; las partidas nuevas empiezan con 0 Cr. y categorías vacías.

La aplicación de Mapa busca sistemas en Traveller Map, conserva el sistema actual en cada partida, muestra los datos de mundo disponibles y permite abrir su mapa incrustado o completo. El buscador y los datos requieren conexión a Internet; Traveller Map ofrece estos datos mediante su API pública.

## Cuentas personales y sincronización

Cada jugador puede crear una cuenta con correo y contraseña. Si la confirmación de email está activada, se verifica una vez al registrarse; los siguientes inicios usan la contraseña y no envían un correo cada vez. La pantalla incluye recuperación de contraseña. Las partidas pertenecen a una sola cuenta y están protegidas por políticas de acceso de Supabase. Al iniciar sesión, NEXO carga las partidas de esa cuenta; los cambios se guardan en el servicio y el navegador mantiene una copia local. Cuando la app vuelve a primer plano, consulta los cambios recientes de otros dispositivos. La sincronización requiere conexión y puede tardar unos instantes; no es una edición colaborativa en directo. Compartir partidas entre cuentas no está incluido.

El proyecto Supabase debe tener la tabla `public.campaigns` y las políticas del archivo `supabase/schema.sql`. `cloud-config.js` contiene la URL del proyecto y una clave pública diseñada para usarse en el navegador; la protección depende de las políticas RLS. Nunca pongas una contraseña de base de datos ni una clave secreta en archivos web. El SMTP predeterminado de Supabase es limitado; para permitir registros por parte de otros jugadores habrá que configurar un proveedor SMTP propio.

La importación JSON reemplaza los datos de la partida abierta. Úsala como respaldo manual.

## Mercancías y cálculos

El inventario y el selector de compra/venta incluyen componentes básicos y avanzados, vehículos básicos y avanzados, minerales básicos y minerales preciosos. **Añadir ítem** permite crear categorías propias con nombre y cantidad; al volver a añadir un nombre existente, suma unidades al mismo registro. Las categorías personalizadas también aparecen en el selector de compra/venta. Un panel independiente permite añadir o quitar créditos por hallazgos, pérdidas u otros ajustes ajenos a las operaciones comerciales; requiere confirmación y queda en el historial.

El resultado introducido se interpreta como tirada total final y se trunca a entero; no se suman modificadores. El precio es `precio base por unidad × tarifa de la tabla × packs × unidades por pack`. La compra reduce créditos y aumenta inventario; la venta requiere existencias suficientes, suma créditos y reduce inventario. La app solicita confirmación antes de aplicar una operación o un ajuste de cartera.

## Estado inicial

- Cartera: 4.060.000 Cr.
- Las seis categorías de mercancía empiezan en 0 unidades.

## Alcance

Incluye selector y creación de partidas, calculadora, inventario, artículos personalizados, historial, deshacer la última operación, edición manual de cartera e inventario, importación/exportación JSON, visor y buscador de sistemas de Traveller Map, soporte PWA, cuentas personales y sincronización de partidas privadas.
