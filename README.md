# NEXO · Traveller Trade Terminal

Terminal multiverso para NEXO, con el módulo Traveller como sistema disponible.

## Abrir y publicar

- Para consultar el proyecto en tu ordenador, abre `index.html`; el guardado local funciona en ese modo. Este modo no permite instalar NEXO ni habilita el servicio offline.
- NEXO ya incluye manifiesto de instalación, iconos de 192 y 512 px y caché de recursos. En esta beta, las partidas se guardan localmente por navegador y no requieren correo. El código de autenticación y sincronización se conserva para una futura activación. Para instalarlo en móvil/ordenador y usar la interfaz sin conexión, publica el contenido de `outputs` en un alojamiento web con HTTPS.
- En desarrollo, sirve la carpeta `outputs` con cualquier servidor HTTP estático. La app de Mapa necesita conexión incluso cuando la interfaz está instalada.
- La versión pública necesitará un dominio o una dirección web del alojamiento. Después se podrá verificar el sitio en Google Search Console y enviar el sitemap; Google decide cuándo indexarlo y en qué posición mostrarlo.
- Al pasar del archivo local al dominio, el navegador lo considera otra instalación. En el primer acceso a una cuenta vacía, NEXO copia las partidas locales encontradas en ese navegador a la cuenta. Conserva una copia JSON como respaldo.

## Partidas y datos

Al abrir NEXO aparece el selector de sistemas de rol. Traveller abre el selector de partidas; Vampiro y D&D abren cada uno su propio apartado. Dentro de una partida hay aplicaciones separadas para comercio, inventario, cartera, notas, mapa estelar, historial, hangar, personajes y un acceso al asistente de ChatGPT. En PERSONAJES puedes crear fichas editables ilimitadas para la partida, con datos personales, biométricos, vitales, habilidades y semanas; los campos son opcionales y las fichas se guardan automáticamente. Desde el logo NEXO se vuelve al selector de sistemas y el botón de cuadrícula permite cambiar de aplicación. Las operaciones confirmadas producen un pulso verde en cartera, inventario e historial. En Notas puedes crear, editar y eliminar apuntes con confirmación; se conservan por partida. La partida inicial conserva la cartera sembrada de 4.060.000 Cr.; las partidas nuevas empiezan con 0 Cr. y categorías vacías.

La aplicación de Mapa busca mundos y sistemas en Traveller Map, conserva el mundo elegido en cada partida y centra el mapa en su hexágono con un acercamiento local; muestra los datos de mundo disponibles y permite abrir el mapa incrustado o completo. El buscador y los datos requieren conexión a Internet; Traveller Map ofrece estos datos mediante su API pública.

La aplicación Traveller conserva un índice temático conciso del manual con referencias de página. Incluye un enlace al PDF compartido en Google Drive y cada resultado abre ese visor en la página correspondiente. El archivo permanece alojado en Drive; quienes lo consulten necesitarán permisos sobre el enlace compartido.

## Vampiro: La Mascarada

El apartado Vampiro tiene estética gótica propia (negro y rojo) y un creador de personajes basado en V20: concepto, clan con sus disciplinas y debilidad, atributos 7/5/3, habilidades 13/9/5 (máximo 3 en el reparto inicial), 3 puntos de disciplinas de clan, 5 de trasfondos, 7 de virtudes y 15 puntos gratuitos (atributo 5, habilidad 2, disciplina 7, trasfondo 1, virtud 2, Humanidad 2, Voluntad 1). Los defectos dan hasta 7 puntos extra. La Humanidad y la Fuerza de Voluntad se derivan de las virtudes, y el trasfondo Generación ajusta la generación y la reserva de sangre. Las fichas se guardan en este dispositivo (`localStorage`, clave `nexo-vampire-v1`), separadas de las partidas de Traveller.

## Dungeons & Dragons 5.5

El apartado D&D tiene estética medieval propia en tonos cálidos (amarillos, verdes y grises) y un creador de personajes basado en el Manual del Jugador de 2024: 12 clases, 10 especies (con su linaje y tamaño cuando corresponde) y 16 trasfondos. Las características se generan con matriz estándar (15, 14, 13, 12, 10, 8), compra de 27 puntos (de 8 a 15) o tiradas de 4d6 descartando el dado más bajo; el trasfondo aplica su mejora de +2/+1 o +1/+1/+1 a sus tres características, con un máximo de 20. Se eligen las habilidades de la clase, las de la especie (elfo y humano) y las de la dote Habilidoso, además de dos idiomas junto al Común; la dote de origen la da el trasfondo y el humano elige otra. NEXO calcula modificadores, bonificador de competencia, puntos de golpe por nivel (incluidos enano y Duro), CA sin armadura, iniciativa (con Alerta), percepción pasiva, salvaciones, habilidades y CD y ataque de conjuros, y muestra las elecciones pendientes. Las fichas se guardan en este dispositivo (`localStorage`, clave `nexo-dnd-v1`).

## Cuentas personales y sincronización

La autenticación y la sincronización con Supabase están desactivadas durante la beta. Cada navegador mantiene sus propias partidas locales; abrir NEXO desde otro teléfono u ordenador muestra un espacio independiente. Para mover una partida entre dispositivos, usa exportar/importar JSON. El código de cuentas personales se conserva para poder reactivar esta función más adelante. Compartir partidas entre cuentas no está incluido.

El proyecto Supabase debe tener la tabla `public.campaigns` y las políticas del archivo `supabase/schema.sql`. `cloud-config.js` contiene la URL del proyecto y una clave pública diseñada para usarse en el navegador; la protección depende de las políticas RLS. Nunca pongas una contraseña de base de datos ni una clave secreta en archivos web. El SMTP predeterminado de Supabase es limitado; para permitir registros por parte de otros jugadores habrá que configurar un proveedor SMTP propio.

La importación JSON reemplaza los datos de la partida abierta. Úsala como respaldo manual.

## Mercancías y cálculos

El inventario y el selector de compra/venta incluyen componentes básicos y avanzados, vehículos básicos y avanzados, minerales básicos y minerales preciosos. **Añadir ítem** permite crear categorías propias con nombre y cantidad; al volver a añadir un nombre existente, suma unidades al mismo registro. Las categorías personalizadas también aparecen en el selector de compra/venta. Un panel independiente permite añadir o quitar créditos por hallazgos, pérdidas u otros ajustes ajenos a las operaciones comerciales; requiere confirmación y queda en el historial.

El resultado introducido se interpreta como tirada total final y se trunca a entero; no se suman modificadores. El precio es `precio base por unidad × tarifa de la tabla × packs × unidades por pack`. La compra reduce créditos y aumenta inventario; la venta requiere existencias suficientes, suma créditos y reduce inventario. La app solicita confirmación antes de aplicar una operación o un ajuste de cartera.

## Estado inicial

- Cartera: 4.060.000 Cr.
- Las seis categorías de mercancía empiezan en 0 unidades.

## Alcance

Incluye selector de sistemas y partidas locales, calculadora, inventario, hangar, fichas de personajes, notas, historial, deshacer la última operación, edición manual de cartera e inventario, importación/exportación JSON, visor y buscador de Traveller Map y soporte PWA. La autenticación y sincronización están desactivadas en la beta.

