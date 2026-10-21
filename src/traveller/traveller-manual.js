/*
 * NEXO · Manual de Traveller (versión Mongoose, con apuntes del clásico). Resúmenes y explicaciones propias.
 * El último capítulo recoge el índice del PDF (src/traveller/traveller-index.js) con sus páginas.
 * «Ventaja» y «desventaja» (boon y bane) y «licenciamiento» son traducciones propias.
 */
(() => {
  const list = items => items.filter(Boolean).map(item => `- ${item}`).join('\n');

  const BASICS = [
    { id: 'trv-tarea', title: 'Tareas', aka: ['Prueba', 'Tirada de habilidad', '2D'], summary: 'Dos dados de seis más modificadores; con 8 o más, lo consigues.',
      narr: 'Pilotar entre asteroides, regatear con un mercader de otro mundo o reparar el reactor antes del siguiente salto: cuando el resultado importa y no es seguro, se tira.',
      mech: 'Tira **2D** y suma el nivel de la habilidad y el [[trv-md|MD]] de la característica que pida el árbitro. La dificultad normal es **8+**. Ver [[trv-dificultad|dificultad]] y [[trv-efecto|efecto]].' },
    { id: 'trv-dificultad', title: 'Dificultad', summary: 'El número que hay que alcanzar, de 2+ a 16+.',
      narr: 'No es lo mismo atracar en un puerto de clase A que en una pista de tierra de un mundo fronterizo.',
      mech: list(['Sencilla: 2+.', 'Fácil: 4+.', 'Rutinaria: 6+.', '**Normal: 8+.**', 'Difícil: 10+.', 'Muy difícil: 12+.', 'Formidable: 14+.', 'Imposible: 16+.']) + '\n\nEl árbitro también puede aplicar MD por circunstancias, herramientas o prisas.' },
    { id: 'trv-efecto', title: 'Efecto', summary: 'Por cuánto superas o fallas la tarea.',
      narr: 'Un éxito por los pelos no es lo mismo que un trabajo impecable.',
      mech: 'Efecto = total − dificultad. Con efecto 0 o más, éxito; negativo, fallo. Un efecto de 6 o más es un **éxito excepcional**, y de −6 o menos, un **fallo excepcional**. En combate, el efecto de un ataque se suma al daño.' },
    { id: 'trv-md', title: 'Características y MD', aka: ['Modificador de dado', 'FUE', 'DES', 'RES', 'INT', 'EDU', 'SOC'], summary: 'Seis características de 2 a 15 que dan un modificador a las tareas.',
      narr: 'Fuerza, Destreza, Resistencia, Intelecto, Educación y Posición social describen al viajero. Se suelen escribir en hexadecimal en el PUP (perfil universal del personaje), como 7A8965.',
      mech: 'El modificador de dado (MD) de cada característica:\n\n' + list(['0: −3.', '1–2: −2.', '3–5: −1.', '6–8: +0.', '9–11: +1.', '12–14: +2.', '15 o más: +3.']) + '\n\nFUE, DES y RES absorben el [[trv-dano|daño]].' },
    { id: 'trv-ventaja', title: 'Ventaja y desventaja', aka: ['Boon', 'Bane'], summary: 'Tirar tres dados y quedarte con los dos mejores, o con los dos peores.',
      narr: 'Una herramienta perfecta, información privilegiada o, al revés, una tormenta de polvo que lo complica todo.',
      mech: 'Con **ventaja** tiras 3D y sumas los dos más altos; con **desventaja**, los dos más bajos. Una de cada se anulan.' },
    { id: 'trv-sin-entrenar', title: 'Sin entrenamiento', aka: ['Nivel 0'], summary: 'Intentar algo sin tener la habilidad cuesta −3.',
      narr: 'Cualquiera puede intentar disparar una pistola; pocos saben pilotar una nave de salto.',
      mech: 'Sin la habilidad, la tarea tiene MD −3. Con la habilidad a nivel 0 ya no hay penalización: sabes lo básico. Algunas tareas (como pilotar una nave) no se pueden intentar sin entrenamiento.' }
  ];
  const CHARACTERS = [
    { id: 'trv-carreras', title: 'Carreras y términos', aka: ['Creación de personajes', 'Término'], summary: 'Los viajeros se crean viviendo su vida previa en términos de cuatro años.',
      narr: 'Antes de lanzarse al espacio, el viajero sirvió en la Marina, comerció, exploró o vivió al margen de la ley. Su historia pasada explica lo que sabe hacer.',
      mech: 'Tira las [[trv-md|características]] (2D cada una), elige una carrera y tira para **ingresar**. Cada término de cuatro años tiras **supervivencia**, un **suceso**, habilidades y **ascenso**. Al fallar la supervivencia, sales con un percance. Después de cada término decides si sigues. Ver [[trv-envejecimiento|envejecimiento]] y [[trv-licenciamiento|licenciamiento]].' },
    { id: 'trv-envejecimiento', title: 'Envejecimiento', summary: 'Desde los 34 años, cada término puede restar características físicas.',
      narr: 'Las carreras largas dan experiencia pero desgastan el cuerpo.',
      mech: 'A partir del cuarto término se tira en la tabla de envejecimiento con un MD negativo por cada término servido. Los malos resultados reducen FUE, DES o RES, y más adelante INT. Los tratamientos médicos lo frenan, pero cuestan dinero.' },
    { id: 'trv-licenciamiento', title: 'Licenciamiento', aka: ['Beneficios', 'Mustering out'], summary: 'Al dejar las carreras se tiran beneficios: créditos y equipo, a veces una nave.',
      narr: 'Una pensión, unas acciones en una nave, una vieja arma reglamentaria o contactos en un puerto lejano.',
      mech: 'Ganas una tirada de beneficios por término y más por rango. Cada tirada va a la tabla de dinero (créditos) o a la de beneficios (equipo, características, partes de nave). El número de tiradas en la tabla de dinero está limitado.' },
    { id: 'trv-personajes-nexo', title: 'Personajes en NEXO', summary: 'Cada partida guarda sus fichas: datos personales, biometría, características, habilidades y semanas.',
      mech: 'Desde la pestaña Personajes ves los viajeros de todas tus partidas y abres su ficha. Dentro de una partida, la aplicación PERSONAJES permite crear fichas ilimitadas, que se guardan solas y se sincronizan con tu cuenta.' }
  ];
  const COMBAT = [
    { id: 'trv-iniciativa', title: 'Iniciativa y asaltos', summary: 'Asaltos de seis segundos; actúa antes quien saca más.',
      narr: 'Un tiroteo en una cantina estelar se decide en segundos.',
      mech: 'Cada participante tira 2D + MD de DES o INT (o Táctica). Se actúa de mayor a menor. Cada asalto dura 6 segundos.' },
    { id: 'trv-acciones', title: 'Acciones', summary: 'En tu turno: una acción significativa y una menor, o tres menores.',
      mech: list(['**Acción significativa**: atacar, curar a alguien, una tarea compleja.', '**Acción menor**: moverte 6 metros, desenfundar, apuntar, recargar.', '**Reacción**: esquivar o parar a cambio de un MD −1 en tu siguiente acción.']) + '\n\nUn ataque es una [[trv-tarea|tarea]] normal (8+); su [[trv-efecto|efecto]] suma al daño.' },
    { id: 'trv-dano', title: 'Daño y heridas', summary: 'El daño se resta primero a la Resistencia y después a FUE o DES.',
      narr: 'No hay puntos de vida: cada herida se nota en el cuerpo.',
      mech: 'El primer daño se resta de **RES**. Cuando llega a 0, el resto se reparte entre FUE y DES. Con dos características a 0 quedas inconsciente; con las tres, mueres. La armadura resta su protección al daño de cada impacto.' }
  ];
  const SHIPS = [
    { id: 'trv-salto', title: 'Salto', aka: ['Espacio de salto', 'Parsec'], summary: 'Una semana en el espacio de salto para cruzar entre 1 y 6 pársecs.',
      narr: 'Las naves no cruzan el espacio normal entre estrellas: lo saltan. Cada salto es una semana de aislamiento total, sin comunicaciones.',
      mech: 'El motor de salto determina la distancia: salto-1 cubre un pársec (un hexágono del mapa), salto-2 dos… Cualquier salto dura unos 7 días. Hay que salir del pozo gravitatorio (100 diámetros del planeta) antes de saltar, y el salto consume [[trv-combustible|combustible]]. Navegación y Astrogación son las habilidades clave.' },
    { id: 'trv-combustible', title: 'Combustible', summary: 'El salto consume un 10 % del casco por pársec.',
      mech: 'Cada pársec de salto gasta combustible igual al 10 % del tonelaje de la nave. El combustible refinado se compra en el puerto; el sin refinar puede extraerse de gigantes gaseosos o de agua, pero arriesga un fallo del salto.' },
    { id: 'trv-puertos', title: 'Puertos estelares', aka: ['Clase de puerto', 'A', 'B', 'C', 'D', 'E', 'X'], summary: 'La primera letra del perfil del mundo indica la calidad del puerto.',
      narr: 'Del gran puerto imperial con astilleros a una pista de tierra con una caseta.',
      mech: list(['**A**: excelente, combustible refinado y astillero.', '**B**: bueno, refinado y astillero de naves pequeñas.', '**C**: corriente, sin refinar y reparaciones.', '**D**: pobre, sin refinar.', '**E**: frontera, solo una zona de aterrizaje.', '**X**: sin puerto.']) + '\n\nNEXO muestra estos datos en la aplicación de Mapa con Traveller Map.' },
    { id: 'trv-comercio', title: 'Comercio especulativo', aka: ['Compra y venta', 'Tabla de precios modificados'], summary: 'Comprar barato en un mundo y vender caro en otro.',
      narr: 'El sueño de todo capitán independiente: llenar la bodega y saldar la hipoteca de la nave.',
      mech: 'Se busca un proveedor, se mira la disponibilidad y se tira para fijar el precio con la **tabla de precios modificados**: el resultado da un porcentaje del precio base. La aplicación COMERCIO de NEXO aplica esa tabla: precio base × porcentaje × packs × unidades por pack.' }
  ];

  window.NEXO_MANUALS = window.NEXO_MANUALS || {};
  window.NEXO_MANUALS.traveller = () => {
    const pages = (window.NEXO_TRAVELLER_INDEX || []).map((item, i) => ({
      id: `trv-pdf-${i}`, title: item.title, aka: [item.section], summary: item.summary,
      mech: `${item.summary}\n\n**Páginas ${item.pages}** del PDF (${item.edition === 'classic' ? 'Traveller clásico' : 'versión Mongoose'}). Ábrelo desde la aplicación TRAVELLER de cualquier partida.`
    }));
    return {
      title: 'Manual de Traveller',
      intro: 'Guía de consulta de Traveller: cómo se resuelven las tareas, la creación por carreras, el combate, el salto, los puertos y el comercio, las habilidades, el equipo, las naves por dentro, los mundos y la psiónica, más el índice del PDF con sus páginas.',
      note: 'Los textos son resúmenes propios; «ventaja», «desventaja» y «licenciamiento» son traducciones propias.',
      chapters: [
        { id: 'trv-cap-reglas', title: 'Reglas básicas', intro: 'Tareas, dificultad, efecto y características.', entries: BASICS },
        { id: 'trv-cap-personajes', title: 'Viajeros', intro: 'Cómo se crea un viajero viviendo su carrera.', entries: CHARACTERS },
        { id: 'trv-cap-combate', title: 'Combate', intro: 'Asaltos, acciones y heridas.', entries: COMBAT },
        { id: 'trv-cap-naves', title: 'Naves, salto y comercio', intro: 'Viajar entre estrellas y ganarse la vida haciéndolo.', entries: SHIPS },
        ...(window.NEXO_MANUALS.travellerReglas || []),
        { id: 'trv-cap-pdf', title: 'Índice del PDF', intro: 'Los temas del manual compartido con sus páginas.', entries: pages }
      ]
    };
  };
})();
