/*
 * NEXO · Manual de Pathfinder 2ª edición (Remaster): combate, estados, magia y descanso.
 * Resúmenes y explicaciones propias. Los nombres de acciones y estados que no salen en la ficha
 * son traducciones propias cuando no se conoce el término de Devir. pathfinder-manual.js los añade.
 */
(() => {
  const list = items => items.filter(Boolean).map(item => `- ${item}`).join('\n');

  const COMBAT = [
    { id: 'pf-iniciativa', title: 'Iniciativa', summary: 'Normalmente se tira Percepción; a veces otra habilidad, como Sigilo.',
      narr: 'Si estabas vigilando, Percepción; si te acercabas a escondidas, Sigilo; si estabas negociando, quizá Diplomacia.',
      mech: 'Al empezar un encuentro, cada uno tira la prueba que corresponda a lo que estaba haciendo (casi siempre [[pf-salvaciones|Percepción]]) y se actúa de mayor a menor. En cada turno tienes tres [[pf-acciones|acciones]] y una reacción.' },
    { id: 'pf-golpe', title: 'Golpe y daño', aka: ['Ataque', 'Crítico'], summary: 'Una acción para atacar con un arma o sin armas contra la CA.',
      narr: 'El tajo de la espada o la flecha que vuela: el ataque más básico, que repetirás a menudo.',
      mech: list(['**Ataque**: d20 + FUE (cuerpo a cuerpo) o DES (a distancia o con armas sutiles) + [[pf-competencia|competencia]] con el arma + bonificador de objeto, contra la [[pf-clase-armadura|CA]].', '**Daño**: el dado del arma + FUE en cuerpo a cuerpo y en armas arrojadizas (a distancia, normalmente no se suma).', '**Éxito crítico**: daño doble. Algunas armas añaden un efecto de especialización.']) + '\n\nCada Golpe de más en el turno sufre el [[pf-penalizador-multiple|penalizador por ataque múltiple]].' },
    { id: 'pf-acciones-basicas', title: 'Acciones básicas', aka: ['Zancada', 'Paso', 'Buscar', 'Interactuar', 'Alzar un escudo', 'Tomar cobertura', 'Preparar', 'Retrasar'], summary: 'Las acciones que cualquiera puede hacer.',
      mech: list(['**Zancada** (1): te mueves tu velocidad.', '**Paso** (1): 5 pies sin provocar reacciones.', '**Golpe** (1): ver [[pf-golpe|Golpe]].', '**Alzar un escudo** (1): sumas su bonificador a la CA hasta tu siguiente turno. Ver [[pf-escudos|escudos]].', '**Buscar** (1): examinar una zona con Percepción.', '**Interactuar** (1): sacar un arma, abrir una puerta, coger un objeto.', '**Tomar cobertura** (1): mejoras tu [[pf-cobertura|cobertura]].', '**Preparar** (2): eliges una acción y su desencadenante para hacerla como reacción.', '**Retrasar** (gratuita): actúas más tarde en el orden.', '**Levantarse**, **Soltar** y **Arrastrarse**, entre otras.']) },
    { id: 'pf-cobertura', title: 'Cobertura', summary: 'Estar parcialmente oculto tras algo mejora la CA, los Reflejos y el Sigilo.',
      mech: list(['**Cobertura menor** (otra criatura en medio): +1 a la CA.', '**Cobertura estándar**: +2 a la CA, a los Reflejos contra áreas y al Sigilo.', '**Cobertura mayor**: +4.']) + '\n\nCon **Tomar cobertura** la estándar pasa a mayor.' },
    { id: 'pf-escudos', title: 'Escudos', aka: ['Bloqueo con escudo', 'Dureza'], summary: 'Alzar el escudo sube la CA; bloquear con él reduce el daño.',
      narr: 'Un buen escudo para golpes que te habrían partido en dos, aunque acabe hecho astillas.',
      mech: '**Alzar un escudo** (1 acción) suma su bonificador a la CA. Con la reacción **Bloqueo con escudo** (dote general de muchas clases), cuando te impacta un ataque físico, el escudo resta su **Dureza** al daño, y tanto tú como el escudo recibís el resto. Si el escudo llega a su umbral de rotura, se rompe.' },
    { id: 'pf-moribundo', title: 'Moribundo y herido', aka: ['0 PG', 'Prueba de recuperación', 'Condenado'], summary: 'A 0 PG caes inconsciente y te acercas a la muerte paso a paso.',
      narr: 'El aventurero cae, pero sus compañeros aún pueden llegar a tiempo.',
      mech: list(['A 0 PG quedas inconsciente con **moribundo 1** (2 si fue un crítico), más tu valor de **herido**.', 'Al empezar tu turno haces una **prueba de recuperación**: prueba plana contra CD 10 + moribundo. Éxito: −1; éxito crítico: −2; fallo: +1; fallo crítico: +2.', 'Con **moribundo 4** mueres (menos si estás **condenado**).', 'Si te curan, te despiertas y tu valor de **herido** sube 1 hasta que descanses o te traten.']) + '\n\nLos [[pf-puntos-heroe|puntos de héroe]] pueden salvarte de la muerte.' },
    { id: 'pf-prueba-plana', title: 'Pruebas planas', aka: ['Oculto', 'Escondido'], summary: 'Un d20 sin modificadores, para la suerte pura.',
      narr: 'Disparar a una silueta entre la niebla depende más del azar que de la puntería.',
      mech: 'Se tira 1d20 sin sumar nada contra una CD fija. Atacar a una criatura **oculta** (niebla, oscuridad) exige superar CD 5 antes; a una **escondida** (sabes dónde está pero no la ves), CD 11. También se usa en las [[pf-moribundo|pruebas de recuperación]].' }
  ];

  const CONDITIONS = [
    ['agarrado', 'Agarrado', 'Alguien te sujeta.', 'Quedas [[pf-desprevenido|desprevenido]] e **inmovilizado**. Para manipular algo necesitas superar una prueba plana CD 5. Te liberas con **Huir** (Acrobacias, Atletismo o ataque desarmado contra su CD de Atletismo).'],
    ['inmovilizado', 'Inmovilizado', 'No te puedes desplazar.', 'No puedes usar acciones de movimiento que te cambien de sitio. Te pueden seguir moviendo otros.'],
    ['derribado', 'Derribado', 'Estás en el suelo.', 'Quedas [[pf-desprevenido|desprevenido]] y tienes −2 a los ataques. Solo puedes Arrastrarte o Levantarte (1 acción). Tumbado puedes Tomar cobertura.'],
    ['lento', 'Lento', 'Te mueves como en el barro.', 'Lento X: pierdes X acciones al empezar cada turno.'],
    ['acelerado', 'Acelerado', 'Una magia te da más velocidad.', 'Ganas una acción extra cada turno, solo para lo que indique el efecto (por ejemplo, Zancada o Golpe).'],
    ['aturdido', 'Aturdido', 'No reaccionas.', 'Aturdido X: pierdes X acciones en total (luego desaparece). Mientras lo estás, no puedes actuar. Es más grave que [[pf-estado-lento|lento]], que solo quita acciones de cada turno.'],
    ['debilitado', 'Debilitado', 'Te falla la fuerza.', 'Debilitado X: penalizador de estado igual a X a todo lo que use FUE (ataques cuerpo a cuerpo, daño y pruebas de Atletismo).'],
    ['torpe', 'Torpe', 'Tus movimientos son lentos e imprecisos.', 'Torpe X: penalizador igual a X a lo que use DES, incluidas la CA y los Reflejos.'],
    ['indispuesto', 'Indispuesto', 'Tienes náuseas.', 'Indispuesto X: penalizador igual a X a todas las pruebas y CD. No puedes comer ni beber voluntariamente. Puedes gastar una acción en vomitar para hacer una salvación de Fortaleza y bajarlo.'],
    ['fatigado', 'Fatigado', 'Estás agotado.', '−1 a la CA y a las salvaciones. Durante la exploración no puedes hacer actividades mientras viajas. Se quita con un descanso completo.'],
    ['inconsciente', 'Inconsciente', 'Has perdido el sentido.', 'No puedes actuar, quedas [[pf-desprevenido|desprevenido]] con −4 a la CA, a la Percepción y a los Reflejos, y te caes [[pf-estado-derribado|derribado]]. Ver [[pf-moribundo|moribundo]].']
  ].map(([k, title, narr, mech]) => ({ id: `pf-estado-${k}`, title, summary: narr, narr, mech }));

  const MAGIC = [
    { id: 'pf-tradiciones', title: 'Tradiciones mágicas', aka: ['Arcana', 'Divina', 'Ocultista', 'Primigenia'], summary: 'Cuatro fuentes de magia que deciden qué conjuros conoces.',
      narr: 'El mago estudia fórmulas, el clérigo reza, la bruja negocia con su patrón y el druida escucha a la naturaleza.',
      mech: list(['**Arcana**: magia de fórmulas y estudio (magos).', '**Divina**: el poder de los dioses (clérigos, oráculos).', '**Ocultista**: secretos y mente (bardos).', '**Primigenia**: la naturaleza y los elementos (druidas).']) + '\n\nCada [[pf-clases|clase]] lanzadora usa una; algunas dependen del patrón o del linaje.' },
    { id: 'pf-rangos-conjuro', title: 'Rangos de conjuro', aka: ['Potenciar', 'Espacios de conjuro'], summary: 'Los conjuros tienen rango del 1 al 10 y se pueden lanzar a uno mayor.',
      narr: 'El mismo hechizo crece en manos de un lanzador más poderoso.',
      mech: 'Cada lanzamiento gasta un espacio del rango del conjuro o superior. **Potenciar** un conjuro (lanzarlo con un espacio mayor) mejora sus efectos. Se ganan espacios de rango más alto cada dos niveles. Los [[pf-trucos|trucos]] no gastan espacios.' },
    { id: 'pf-trucos', title: 'Trucos', summary: 'Conjuros que se lanzan sin límite y se potencian solos.',
      mech: 'Se lanzan a voluntad y su rango es siempre la mitad de tu nivel redondeada hacia arriba, así que crecen contigo.' },
    { id: 'pf-preparados', title: 'Preparados y espontáneos', summary: 'Dos formas de lanzar: elegir cada mañana o improvisar con un repertorio.',
      narr: 'El mago planifica su día; el hechicero confía en lo que lleva en la sangre.',
      mech: list(['**Preparados** (mago, clérigo, druida, bruja): cada día asignas un conjuro concreto a cada espacio.', '**Espontáneos** (bardo, hechicero, oráculo): tienes un repertorio y eliges al lanzar qué espacio usar.']) },
    { id: 'pf-foco', title: 'Conjuros de foco', aka: ['Puntos de foco', 'Reenfocar'], summary: 'Poderes especiales de la clase que se pagan con puntos de foco.',
      mech: 'Tienes hasta 3 **puntos de foco**. Cada conjuro de foco gasta uno. Recuperas 1 punto con la actividad **Reenfocar** (10 minutos) y todos con el descanso. Se potencian solos como los [[pf-trucos|trucos]].' },
    { id: 'pf-cd-conjuro', title: 'CD y ataque de conjuro', summary: 'Los números de tu magia.',
      mech: list(['**CD de conjuro** = 10 + atributo de lanzamiento + [[pf-competencia|competencia]].', '**Ataque de conjuro** = atributo + competencia.']) + '\n\nLa competencia en conjuros sube con la clase. Los conjuros de ataque también sufren el [[pf-penalizador-multiple|penalizador por ataque múltiple]].' }
  ];

  const REST = [
    { id: 'pf-descanso', title: 'Descanso nocturno', summary: '8 horas de sueño para recuperar PG y preparar conjuros.',
      narr: 'Tras una jornada de aventuras, el campamento devuelve fuerzas y magia.',
      mech: 'Al dormir 8 horas recuperas PG iguales a tu modificador de CON × tu nivel (mínimo 1 × nivel). Además preparas tus conjuros diarios, recuperas los [[pf-foco|puntos de foco]] y se reduce la fatiga.' },
    { id: 'pf-tratar-heridas', title: 'Tratar heridas', summary: 'Curar con Medicina durante 10 minutos.',
      mech: 'Con una prueba de [[pf-hab-medicina|Medicina]] (CD 15, o más alta para curar más) curas 2d8 PG (4d8 con éxito crítico); con un fallo crítico haces 1d8 de daño. La misma criatura no se puede beneficiar otra vez hasta pasada 1 hora. También elimina el estado de herido.' },
    { id: 'pf-exploracion', title: 'Modo de exploración', aka: ['Actividades de exploración', 'Vigilar', 'Buscar', 'Defender'], summary: 'Lo que hace cada uno mientras el grupo viaja.',
      narr: 'Uno vigila, otro busca trampas, otro anda escondido: lo que hagas al viajar decide cómo empieza el siguiente combate.',
      mech: 'Cada personaje elige una actividad: **Avanzar con sigilo**, **Buscar**, **Defender** (con el escudo alzado), **Detectar magia**, **Explorar** (vigilar)… La actividad decide qué tiras como [[pf-iniciativa|iniciativa]] y qué cosas notas por el camino.' }
  ];

  window.NEXO_MANUALS = window.NEXO_MANUALS || {};
  window.NEXO_MANUALS.pathfinderReglas = [
    { id: 'pf-cap-combate', title: 'Combate', intro: 'Iniciativa, Golpe, acciones básicas, cobertura, escudos y caer a 0 PG.', entries: COMBAT },
    { id: 'pf-cap-estados', title: 'Estados', intro: 'Además de desprevenido y asustado, que están en las reglas básicas.', entries: CONDITIONS },
    { id: 'pf-cap-magia', title: 'Magia', intro: 'Tradiciones, rangos, trucos, conjuros de foco y CD.', entries: MAGIC },
    { id: 'pf-cap-descanso', title: 'Descanso y exploración', intro: 'Recuperarse y viajar.', entries: REST }
  ];
})();
