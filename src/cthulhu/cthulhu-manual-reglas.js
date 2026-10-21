/*
 * NEXO · Manual de La llamada de Cthulhu (7ª edición): combate, persecuciones, locura y magia.
 * Resúmenes y explicaciones propias. cthulhu-manual.js añade estos capítulos tras las reglas básicas.
 */
(() => {
  const list = items => items.filter(Boolean).map(item => `- ${item}`).join('\n');

  const COMBAT = [
    { id: 'cth-orden-combate', title: 'Orden de actuación', summary: 'En combate se actúa de mayor a menor DES.',
      narr: 'El investigador más ágil dispara primero; el resto, rezando.',
      mech: 'Se actúa por orden de [[cth-car-des|DES]], de mayor a menor. Quien tiene un arma de fuego preparada y apuntada actúa como si tuviera 50 puntos más de DES. Cada asalto, cada personaje hace una acción: atacar, huir, lanzar un conjuro, usar una habilidad…' },
    { id: 'cth-cuerpo-a-cuerpo', title: 'Combate cuerpo a cuerpo', aka: ['Esquivar', 'Contraatacar', 'Pelea'], summary: 'Una tirada enfrentada: el atacante contra quien esquiva o contraataca.',
      narr: 'Puños, cuchillos y palos de golf: la violencia de cerca es torpe, rápida y muy peligrosa.',
      mech: list(['El atacante tira **Combatir (Pelea)** o la especialidad de su arma.', 'El defensor elige **Esquivar** (si empata, gana el defensor) o **contraatacar** con su habilidad de combate (si empata, gana el atacante).', 'Gana el mejor [[cth-grados|nivel de éxito]]; quien gana hace su daño.', 'Cada defensor solo puede responder una vez por asalto sin penalización: los siguientes atacantes ganan un [[cth-dados-bonificacion|dado de bonificación]] (**superado en número**).']) },
    { id: 'cth-armas-fuego', title: 'Armas de fuego', aka: ['Alcance', 'Quemarropa', 'Ráfaga'], summary: 'Disparar no es una tirada enfrentada: se tira contra la dificultad del alcance.',
      narr: 'Un revólver Smith & Wesson no detiene a un shoggoth, pero da cierta tranquilidad.',
      mech: list(['A **alcance normal**, basta con un éxito normal; a **largo** (hasta el doble), éxito difícil; a **muy largo** (hasta el cuádruple), éxito extremo.', 'A **quemarropa** (a un quinto de DES en pies) se gana un dado de bonificación.', 'Cobertura, objetivo en movimiento rápido o disparar con prisa dan dados de penalización.', 'Un objetivo solo puede esquivar disparos si se pone a cubierto antes.', 'Varios disparos en un asalto (o una ráfaga) suman un dado de penalización a cada uno.']) },
    { id: 'cth-dano', title: 'Daño, empalamiento y bonificación', aka: ['Empalar', 'Bonificación al daño'], summary: 'El daño del arma más la bonificación al daño; un éxito extremo empala.',
      mech: list(['**Daño**: el del arma; en cuerpo a cuerpo y armas arrojadizas se suma la **bonificación al daño** (según FUE + TAM).', '**Éxito extremo** con un arma que empala (cuchillos, balas, flechas): daño máximo más otra tirada de daño.', '**Éxito extremo** con un arma contundente: daño máximo.', 'La armadura resta su valor a cada impacto.']) + '\n\nVer [[cth-vida|puntos de vida y heridas]].' },
    { id: 'cth-maniobras', title: 'Maniobras de combate', aka: ['Corpulencia', 'Derribar', 'Desarmar', 'Agarrar'], summary: 'Derribar, desarmar o inmovilizar en lugar de hacer daño.',
      narr: 'A veces no se trata de herir, sino de quitarle la pistola al sectario.',
      mech: 'Se resuelven como un ataque cuerpo a cuerpo. Si el objetivo tiene más **corpulencia**, el atacante sufre un dado de penalización por cada punto de diferencia (con 3 o más, la maniobra es imposible). Si gana el atacante, consigue el efecto descrito en lugar de hacer daño.' },
    { id: 'cth-curacion', title: 'Curación', aka: ['Primeros auxilios', 'Medicina', 'Recuperación'], summary: 'Primeros auxilios, Medicina y semanas de reposo.',
      mech: list(['**Primeros auxilios**: 1 PV, o estabiliza a un moribundo; una vez por herida y dentro de la hora siguiente.', '**Medicina**: 1D3 PV más; requiere tiempo y material.', 'Sin herida grave se recupera 1 PV al día.', 'Con herida grave se hace una tirada de recuperación cada semana (CON): con éxito se recuperan 1D3 PV.']) + '\n\nVer [[cth-hab-primerosAuxilios|Primeros auxilios]] y [[cth-hab-medicina|Medicina]].' }
  ];

  const CHASES = [
    { id: 'cth-persecuciones', title: 'Persecuciones', aka: ['Tirada de velocidad', 'Ubicaciones'], summary: 'Huir o perseguir se juega por ubicaciones y acciones de movimiento.',
      narr: 'Callejones de Arkham, un tranvía en marcha y algo que respira detrás. Las persecuciones son pura tensión.',
      mech: list(['Al empezar, cada participante hace una **tirada de velocidad** (CON a pie, Conducir en coche): con éxito extremo su MOV sube 1; con fallo, baja 1.', 'Si el perseguido es más rápido que todos los perseguidores, escapa sin más.', 'La persecución se divide en **ubicaciones**. Cada participante tiene una acción de movimiento más por cada punto de MOV que supere al más lento.', 'Los **obstáculos** y **peligros** (una valla, una multitud) piden tiradas para superarlos; fallar cuesta movimiento o daño.']) + '\n\nVer [[cth-car-des|DES]] y el movimiento en la hoja.' }
  ];

  const MADNESS = [
    { id: 'cth-ataque-locura', title: 'Ataques de locura', summary: 'Al entrar en locura, el investigador pierde el control unos momentos.',
      narr: 'Gritos, risas histéricas, una huida sin sentido o un ataque de rabia: la mente se rompe delante de todos.',
      mech: 'Al sufrir una locura temporal o indefinida, el Guardián puede jugar el ataque en tiempo real (1D10 asaltos de comportamiento descontrolado) o resumirlo (1D10 horas después de las que el investigador despierta en otro sitio). Después viene la **locura subyacente**: cualquier pérdida de [[cth-cordura|Cordura]] puede desatar otro ataque.' },
    { id: 'cth-fobias', title: 'Fobias y manías', summary: 'Secuelas que la locura deja en el investigador.',
      narr: 'Miedo patológico a la oscuridad, al agua o a las multitudes; compulsiones que no se pueden controlar.',
      mech: 'Un ataque de locura puede dejar una fobia o una manía. Mientras el investigador esté expuesto a su fobia sufre un [[cth-dados-bonificacion|dado de penalización]] en sus tiradas. Se anotan en el trasfondo del personaje.' },
    { id: 'cth-recuperar-cordura', title: 'Recuperar Cordura', aka: ['Psicoanálisis', 'Tratamiento'], summary: 'Terapia, tiempo y victorias contra los Mitos.',
      mech: list(['Terminar una aventura con éxito da Cordura como recompensa.', 'Una tirada de **Psicoanálisis** puede devolver 1D3 COR (una vez al día) y calmar un ataque de locura.', 'Los tratamientos de un sanatorio pueden curar una locura indefinida con el tiempo.', 'Subir una habilidad a 90 o más en una [[cth-mejora|tirada de mejora]] da 2D6 COR.']) }
  ];

  const MYTHOS = [
    { id: 'cth-tomos', title: 'Tomos de los Mitos', aka: ['Lectura inicial', 'Estudio completo'], summary: 'Libros prohibidos que enseñan y destruyen a la vez.',
      narr: 'El Necronomicón, los Manuscritos Pnakóticos o el diario de un loco: cada página acerca a la verdad y aleja de la cordura.',
      mech: list(['La **lectura inicial** lleva semanas: se gana algo de [[cth-hab-mitos|Mitos de Cthulhu]] y se pierde Cordura.', 'El **estudio completo** lleva meses y da más Mitos.', 'Muchos tomos contienen conjuros que se pueden aprender.', 'Leerlos exige conocer su idioma (Otras lenguas).']) },
    { id: 'cth-conjuros', title: 'Conjuros', aka: ['Puntos de magia', 'Lanzar conjuros'], summary: 'Magia que cuesta puntos de magia, Cordura y a veces algo más.',
      narr: 'Hechizos sacados de tomos antiguos, que funcionan pero tienen un precio. No hay magia inocente en los Mitos.',
      mech: list(['Lanzar un conjuro gasta **puntos de magia** (POD/5; se recupera 1 por hora) y suele costar [[cth-cordura|Cordura]].', 'Si no quedan PM, se paga con PV.', 'La primera vez que se lanza un conjuro aprendido hay que tirar POD (difícil); fallar puede tener consecuencias.', 'Algunos conjuros piden sacrificios, componentes o POD permanente.']) },
    { id: 'cth-encuentros', title: 'Encuentros con los Mitos', aka: ['Pérdida de Cordura', '1/1D6'], summary: 'Ver una criatura de los Mitos cuesta Cordura.',
      narr: 'Un profundo saliendo del agua, un necrófago en el cementerio, o algo que no tiene forma. Los ojos no deberían ver eso.',
      mech: 'Cada horror tiene una pérdida escrita como «éxito/fallo», por ejemplo **1/1D6**: si superas la tirada de COR pierdes 1, si fallas pierdes 1D6. Ver la misma criatura otra vez en poco tiempo no vuelve a costar Cordura. La primera vez que se ve un horror concreto también puede dar algo de Mitos de Cthulhu.' }
  ];

  window.NEXO_MANUALS = window.NEXO_MANUALS || {};
  window.NEXO_MANUALS.cthulhuReglas = [
    { id: 'cth-cap-combate', title: 'Combate', intro: 'Orden de actuación, cuerpo a cuerpo, armas de fuego, daño, maniobras y curación.', entries: COMBAT },
    { id: 'cth-cap-persecuciones', title: 'Persecuciones', intro: 'Huir y perseguir por ubicaciones.', entries: CHASES },
    { id: 'cth-cap-locura', title: 'Locura', intro: 'Ataques de locura, fobias, manías y cómo recuperar Cordura.', entries: MADNESS },
    { id: 'cth-cap-mitos', title: 'Los Mitos', intro: 'Tomos, conjuros y encuentros con lo imposible.', entries: MYTHOS }
  ];
})();
