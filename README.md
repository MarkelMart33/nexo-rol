# NEXO · Traveller Trade Terminal

MVP estático para llevar partidas comerciales de Traveller.

## Abrir y publicar

- Para consultar el proyecto en tu ordenador, abre `index.html`; el guardado local funciona en ese modo. Este modo no permite instalar NEXO ni habilita el servicio offline.
- NEXO ya incluye manifiesto de instalación, iconos de 192 y 512 px y caché de recursos. Para instalarlo en móvil/ordenador y usar la interfaz sin conexión, publica el contenido de `outputs` en un alojamiento web con HTTPS. No necesita backend para publicarse como PWA.
- En desarrollo, sirve la carpeta `outputs` con cualquier servidor HTTP estático. La app de Mapa necesita conexión incluso cuando la interfaz está instalada.
- La versión pública necesitará un dominio o una dirección web del alojamiento. Después se podrá verificar el sitio en Google Search Console y enviar el sitemap; Google decide cuándo indexarlo y en qué posición mostrarlo.
- Al pasar del archivo local al dominio, el navegador lo considera otra instalación y no traslada automáticamente los datos: exporta cada partida local e impórtala en la versión publicada. Los datos siguen siendo locales; la PWA no incorpora cuentas ni sincronización en la nube.

## Partidas y datos

Al entrar aparece la N durante dos segundos con una barra de carga; después se muestra directamente el selector de partidas. Elige una campaña para abrirla, renombrarla o crear una partida vacía. Al entrar en una partida aparece un lanzador estilo PDA con aplicaciones separadas para comercio, inventario, cartera, notas, mapa estelar, historial y un acceso externo al asistente de ChatGPT. Dentro de cada módulo, el logo NEXO de la esquina superior izquierda vuelve al inicio de la partida y el botón de cuadrícula abre un menú para cambiar de aplicación sin volver al inicio. En la app móvil de ChatGPT se puede activar «Iniciar con voz» en Ajustes → Voz; el arranque automático depende de que ChatGPT abra un chat nuevo o vacío. NEXO no controla ese ajuste ni puede iniciar el micrófono desde su enlace. Las transiciones de entrada a partidas y aplicaciones muestran una conexión de terminal de alrededor de un segundo; las operaciones confirmadas producen un pulso verde en cartera, inventario e historial. En Notas puedes crear varias notas con título y contenido, guardarlas, cerrarlas, reabrirlas para editarlas y eliminarlas con confirmación; se conservan por partida. Los textos antiguos del bloc se migran a una nota titulada «Nota de la partida». La partida inicial conserva la cartera sembrada de 4.060.000 Cr.; las partidas nuevas empiezan con 0 Cr. y categorías vacías.

La aplicación de Mapa busca sistemas en Traveller Map, conserva el sistema actual en cada partida, muestra los datos de mundo disponibles y permite abrir su mapa incrustado o completo. El buscador y los datos requieren conexión a Internet; Traveller Map ofrece estos datos mediante su API pública. Los datos de campaña se guardan en el almacenamiento local del navegador. No hay sincronización automática en la nube. Para mover una partida a otro dispositivo, entra en ella, exporta una copia JSON y después impórtala desde la otra instalación. La importación reemplaza los datos de la partida abierta.

## Mercancías y cálculos

El inventario y el selector de compra/venta incluyen componentes básicos y avanzados, vehículos básicos y avanzados, minerales básicos y minerales preciosos. **Añadir ítem** permite crear categorías propias con nombre y cantidad; al volver a añadir un nombre existente, suma unidades al mismo registro. Las categorías personalizadas también aparecen en el selector de compra/venta. Un panel independiente permite añadir o quitar créditos por hallazgos, pérdidas u otros ajustes ajenos a las operaciones comerciales; requiere confirmación y queda en el historial.

El resultado introducido se interpreta como tirada total final y se trunca a entero; no se suman modificadores. El precio es `precio base por unidad × tarifa de la tabla × packs × unidades por pack`. La compra reduce créditos y aumenta inventario; la venta requiere existencias suficientes, suma créditos y reduce inventario. La app solicita confirmación antes de aplicar una operación o un ajuste de cartera.

## Estado inicial

- Cartera: 4.060.000 Cr.
- Las seis categorías de mercancía empiezan en 0 unidades.

## Alcance

Incluye selector y creación de partidas, calculadora, inventario, artículos personalizados, historial, deshacer la última operación, edición manual de cartera e inventario, importación/exportación JSON y visor y buscador de sistemas de Traveller Map y soporte PWA. No incluye sincronización automática, autenticación ni base de datos remota.
