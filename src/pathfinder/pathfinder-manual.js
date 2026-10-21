/*
 * NEXO · Manual de Pathfinder 2ª edición (Remaster). Resúmenes y explicaciones propias, no texto del reglamento.
 * Términos de la edición de Devir donde se conocen; los demás nombres son traducciones propias.
 * Las ascendencias, bagajes y clases se construyen con los datos del creador (src/pathfinder/pathfinder.js).
 */
(() => {
  const list = items => items.filter(Boolean).map(item => `- ${item}`).join('\n');
  const join = names => names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}` : names.join('');

  const SKILL_TEXT = {
    acrobacias: ['Equilibrio, saltos, volteretas y escaparse de presas.', 'Sirve para **Mantener el equilibrio** en superficies estrechas, **Atravesar** el espacio de un enemigo, **Escapar** de una presa y caer sin hacerte daño.'],
    arcanos: ['El saber de la magia arcana, las criaturas mágicas y los planos.', 'Sirve para **Recordar conocimiento** sobre magia arcana, constructos y bestias, aprender conjuros arcanos y **Identificar magia**.'],
    artesania: ['Fabricar, reparar y entender objetos.', 'Sirve para **Reparar** objetos y escudos, **Fabricar** equipo durante el tiempo libre y **Recordar conocimiento** sobre construcciones y constructos.'],
    atletismo: ['Fuerza física aplicada: trepar, nadar, saltar y luchar a brazo partido.', 'Sirve para **Trepar**, **Nadar**, **Saltar**, **Agarrar**, **Empujar**, **Derribar** y **Desarmar**. Las maniobras de combate apuntan a una defensa del objetivo (Fortaleza o Reflejos) y cuentan para el [[pf-penalizador-multiple|penalizador por ataque múltiple]].'],
    diplomacia: ['Negociar, convencer y causar buena impresión.', 'Sirve para **Causar impresión** (mejorar la actitud de alguien), **Pedir** un favor y **Reunir información** por la ciudad.'],
    engano: ['Mentir, disfrazar intenciones y fintar.', 'Sirve para **Mentir**, **Crear una distracción** para esconderte y **Fintar** en combate para dejar [[pf-desprevenido|desprevenido]] al enemigo.'],
    interpretacion: ['Actuar, cantar, tocar o bailar ante un público.', 'Sirve para **Actuar** ante un público y ganarse la vida en el tiempo libre; muchas dotes de bardo se apoyan en ella.'],
    intimidacion: ['Imponerse por miedo o presencia.', 'Sirve para **Desmoralizar** (el objetivo queda [[pf-asustado|asustado]]) y **Coaccionar** a alguien para que haga lo que quieres.'],
    latrocinio: ['Juego de manos, cerraduras y trampas.', 'Sirve para **Robar** y **Escamotear** objetos, **Abrir cerraduras** y **Desactivar trampas**.'],
    medicina: ['Curar heridas, enfermedades y venenos.', 'Sirve para **Primeros auxilios** (estabilizar o cortar hemorragias), **Tratar heridas** durante el descanso y tratar enfermedades y venenos.'],
    naturaleza: ['La vida salvaje, el clima y la magia primigenia.', 'Sirve para **Recordar conocimiento** sobre animales, plantas y magia primigenia, **Mandar a un animal** e **Identificar magia** primigenia.'],
    ocultismo: ['Misterios, filosofías esotéricas y magia ocultista.', 'Sirve para **Recordar conocimiento** sobre aberraciones, espíritus y magia ocultista, e **Identificar magia** ocultista.'],
    religion: ['Dioses, fe, muertos vivientes y magia divina.', 'Sirve para **Recordar conocimiento** sobre dioses, celestiales, infernales y muertos vivientes, e **Identificar magia** divina.'],
    sigilo: ['Pasar desapercibido.', 'Sirve para **Esconderse**, **Moverse furtivamente** y **Evitar ser visto** mientras viajas. Si no te ven, quedas oculto o no detectado y los enemigos te atacan peor.'],
    sociedad: ['Ciudades, leyes, historia y costumbres de los pueblos civilizados.', 'Sirve para **Recordar conocimiento** sobre culturas, nobleza e historia, **Falsificar** documentos y **Descifrar escritura**.'],
    supervivencia: ['Orientarse, rastrear y vivir de la tierra.', 'Sirve para **Rastrear**, **Orientarse**, **Sobrevivir** en lo salvaje y **Cubrir el rastro**.']
  };

  const BASICS = [
    { id: 'pf-prueba', title: 'Pruebas y CD', aka: ['Tirada', 'Clase de Dificultad'], summary: 'Casi todo se resuelve con un d20 más un modificador contra una Clase de Dificultad.',
      narr: 'Cuando el resultado de lo que intentas no es obvio y fallar tendría consecuencias interesantes, el DJ pide una prueba. Saltar un abismo, convencer a un guardia o acertar con la espada: la tensión de la mesa sale de esa tirada.',
      mech: 'Tira 1d20 y suma el modificador que corresponda: atributo + [[pf-competencia|competencia]] + otros bonificadores y penalizadores. Compara el total con la **CD** (Clase de Dificultad) que fija el DJ o que da la defensa del objetivo.\n\n- Igualar o superar la CD es un éxito; quedarse por debajo, un fallo.\n- Además hay [[pf-grados-exito|grados de éxito]]: superar o fallar por 10 o más cambia el resultado.\n- Contra otra criatura, la CD es su defensa: [[pf-clase-armadura|Clase de Armadura]] para ataques, o 10 + su salvación o su Percepción.' },
    { id: 'pf-grados-exito', title: 'Grados de éxito', aka: ['Éxito crítico', 'Fallo crítico', '20 natural', '1 natural'], summary: 'Cuatro resultados posibles: éxito crítico, éxito, fallo y fallo crítico.',
      narr: 'Pathfinder no distingue solo entre acertar y fallar: un golpe magistral o un tropiezo desastroso cuentan su propia historia.',
      mech: list(['**Éxito crítico**: superas la CD por 10 o más.', '**Éxito**: igualas o superas la CD.', '**Fallo**: quedas por debajo de la CD.', '**Fallo crítico**: quedas 10 o más por debajo.', 'Un **20 natural** sube un grado el resultado y un **1 natural** lo baja un grado.']) + '\n\nCada efecto dice qué pasa en cada grado. En los ataques, el éxito crítico hace el doble de daño. En las [[pf-salvaciones|salvaciones]], el éxito crítico suele librarte por completo.' },
    { id: 'pf-competencia', title: 'Competencia', aka: ['Rangos de competencia', 'Entrenado', 'Experto', 'Maestro', 'Legendario'], summary: 'Lo bien entrenado que estás en algo suma a tus pruebas junto con tu nivel.',
      narr: 'La competencia mide la práctica: un guardia entrenado y un maestro de armas tiran el mismo dado, pero el maestro ha dedicado la vida a ello.',
      mech: 'Hay cinco rangos. A todos menos al primero se les suma tu nivel:\n\n' + list(['**No entrenado**: +0.', '**Entrenado**: +2 + nivel.', '**Experto**: +4 + nivel.', '**Maestro**: +6 + nivel.', '**Legendario**: +8 + nivel.']) + '\n\nTu clase fija la competencia en Percepción, [[pf-salvaciones|salvaciones]], armas y armaduras; las habilidades se entrenan con la clase, el bagaje y la Inteligencia. NEXO usa nivel 1, así que entrenado suma +3.' },
    { id: 'pf-atributos', title: 'Atributos y mejoras', aka: ['Modificadores de atributo', 'Mejora de atributo', 'Defecto'], summary: 'Seis atributos expresados directamente como modificadores, que suben con mejoras.',
      narr: 'Fuerza, Destreza, Constitución, Inteligencia, Sabiduría y Carisma describen el cuerpo y la mente del personaje. En el Remaster ya no hay puntuaciones: se trabaja directamente con el modificador.',
      mech: 'Todo empieza en +0. Cada **mejora** suma +1 y cada **defecto** resta 1. A nivel 1 recibes mejoras de la [[pf-ascendencias|ascendencia]], del [[pf-bagajes|bagaje]], de la [[pf-clases|clase]] (su atributo clave) y cuatro libres, sin repetir atributo dentro de un mismo grupo. Lo normal es empezar con +4 en el atributo principal.\n\nA niveles 5, 10, 15 y 20 recibes cuatro mejoras más; por encima de +4, una mejora solo da medio punto hasta completar el siguiente.' },
    { id: 'pf-acciones', title: 'Turno y acciones', aka: ['Tres acciones', 'Reacción', 'Acción gratuita'], summary: 'En tu turno tienes tres acciones y una reacción para usar cuando se cumpla su desencadenante.',
      narr: 'El combate se cuenta por asaltos de unos seis segundos. Cada personaje decide qué hace con su tiempo: moverse, golpear, levantar el escudo, lanzar un conjuro…',
      mech: 'Al empezar tu turno recuperas **3 acciones** y **1 reacción**.\n\n' + list(['Moverse (**Zancada**), atacar (**Golpe**), **Alzar un escudo** o sacar un objeto cuestan una acción cada uno.', 'Muchos conjuros cuestan dos acciones; algunas actividades, tres.', 'La **reacción** se usa fuera de tu turno cuando ocurre lo que indica, como el **Golpe reactivo** del guerrero.', 'Las acciones gratuitas no gastan nada.']) + '\n\nAtacar varias veces en el mismo turno tiene un [[pf-penalizador-multiple|penalizador por ataque múltiple]].' },
    { id: 'pf-penalizador-multiple', title: 'Penalizador por ataque múltiple', aka: ['PAM'], summary: 'Cada ataque después del primero en un turno es más difícil de acertar.',
      narr: 'Tras el primer golpe, el enemigo ya te ve venir y tú pierdes el equilibrio: encadenar ataques sale cada vez peor.',
      mech: list(['Segundo ataque del turno: −5 (−4 con un arma ágil).', 'Tercer ataque y siguientes: −10 (−8 con un arma ágil).']) + '\n\nCuenta cualquier acción con el rasgo de ataque, incluidas maniobras como **Agarrar** o **Derribar** de [[pf-hab-atletismo|Atletismo]]. Por eso suele compensar gastar la tercera acción en moverse, alzar el escudo o ayudar.' },
    { id: 'pf-clase-armadura', title: 'Clase de Armadura', aka: ['CA'], summary: 'La CD que tienen que superar los ataques contra ti.',
      narr: 'La CA resume lo difícil que es alcanzarte: armadura, reflejos y entrenamiento.',
      mech: 'CA = 10 + DES (hasta el tope de la armadura) + [[pf-competencia|competencia]] en esa armadura + bonificador de la armadura. Alzar un escudo (una acción) suma su bonificador hasta tu siguiente turno. Si quedas [[pf-desprevenido|desprevenido]], tu CA baja 2.' },
    { id: 'pf-salvaciones', title: 'Salvaciones y Percepción', aka: ['Fortaleza', 'Reflejos', 'Voluntad', 'Iniciativa'], summary: 'Tres defensas contra efectos y la Percepción, que además sirve de iniciativa.',
      narr: 'Resistir un veneno, apartarse de una bola de fuego o mantener la mente propia ante un hechizo.',
      mech: list(['**Fortaleza** (CON): venenos, enfermedades y efectos físicos.', '**Reflejos** (DES): áreas y trampas que se esquivan.', '**Voluntad** (SAB): efectos mentales y miedo.', '**Percepción** (SAB): darse cuenta de las cosas; normalmente es tu tirada de iniciativa.']) + '\n\nCada una suma el atributo y la [[pf-competencia|competencia]] que da tu clase. Los resultados siguen los [[pf-grados-exito|grados de éxito]].' },
    { id: 'pf-desprevenido', title: 'Desprevenido', aka: ['Flanqueado', 'Off-guard'], summary: 'Estado que resta 2 a la CA.',
      narr: 'Te atacan por dos lados, te pillan por sorpresa o te han engañado con una finta.',
      mech: 'Una criatura desprevenida sufre −2 a la [[pf-clase-armadura|CA]]. Lo provocan, entre otros, estar flanqueado (dos enemigos a lados opuestos), una finta de [[pf-hab-engano|Engaño]] o estar tumbado. Los pícaros hacen daño adicional a enemigos desprevenidos.' },
    { id: 'pf-asustado', title: 'Asustado', aka: ['Miedo'], summary: 'Estado con un valor que resta a casi todo y baja 1 al final de cada turno.',
      narr: 'El terror hace temblar las manos y nublar el juicio.',
      mech: 'Asustado X resta X a todas tus pruebas y CD. Al final de cada uno de tus turnos el valor baja 1 hasta desaparecer. Se suele causar con **Desmoralizar** de [[pf-hab-intimidacion|Intimidación]].' },
    { id: 'pf-puntos-heroe', title: 'Puntos de héroe', summary: 'Un recurso de la mesa para repetir una tirada o salvarse de la muerte.',
      narr: 'Los héroes tienen golpes de suerte cuando más falta hacen. El DJ los da al empezar la sesión y por momentos memorables.',
      mech: 'Empiezas cada sesión con 1 punto de héroe (máximo 3). Gasta 1 para repetir una prueba y quedarte con el nuevo resultado, o todos los que tengas para no morir: quedas estable con 0 PG.' }
  ];

  window.NEXO_MANUALS = window.NEXO_MANUALS || {};
  window.NEXO_MANUALS.pathfinder = d => {
    const A = k => d.ATTR[k]?.short || k;
    const rank = n => d.RANKS[n] || d.RANKS[0];
    const ancestries = Object.entries(d.ANCESTRIES).map(([k, a]) => ({
      id: `pf-anc-${k}`, title: a.name, summary: a.text,
      narr: a.text,
      mech: list([
        `**Puntos de golpe** de ascendencia: ${a.hp}.`,
        `**Tamaño** ${a.size.toLowerCase()} y **velocidad** de ${a.speed} pies.`,
        a.boosts.length ? `**Mejoras**: ${a.boosts.map(A).join(' y ')} y ${a.free} libre${a.free > 1 ? 's' : ''}; **defecto**: ${A(a.flaw)}.` : `**Mejoras**: ${a.free} libres, sin defecto.`,
        `**Sentidos**: ${a.vision}.`,
        `**Idiomas**: ${join(a.langs)}${a.extraLang ? ', más uno adicional' : ''}.`,
        `**Herencias**: ${join(a.heritages)}, o una herencia versátil.`
      ]) + '\n\nEn lugar de las mejoras y el defecto fijos puedes tomar dos mejoras libres. Ver [[pf-atributos|atributos y mejoras]].',
      see: ['pf-atributos']
    }));
    const backgrounds = Object.entries(d.BACKGROUNDS).map(([k, b]) => ({
      id: `pf-bag-${k}`, title: b.name, summary: b.text,
      narr: b.text,
      mech: list([
        `**Mejoras**: una a ${b.attrs.map(A).join(' o ')} y otra libre.`,
        b.skill ? `**Habilidad entrenada**: [[pf-hab-${b.skill}|${d.SKILLS[b.skill]?.[0] || b.skill}]].` : '',
        b.lore ? `**Saber** entrenado: ${b.lore}.` : '',
        b.feat ? `**Dote de habilidad**: ${b.feat}.` : ''
      ])
    }));
    const classes = Object.entries(d.CLASSES).map(([k, c]) => ({
      id: `pf-cls-${k}`, title: c.name, summary: c.text,
      narr: c.text,
      mech: list([
        `**Atributo clave**: ${c.key.map(A).join(' o ')}.`,
        `**Puntos de golpe**: ${c.hp} + CON por nivel.`,
        `**Percepción** ${rank(c.perc).toLowerCase()}; **Fortaleza** ${rank(c.fort).toLowerCase()}, **Reflejos** ${rank(c.ref).toLowerCase()}, **Voluntad** ${rank(c.vol).toLowerCase()}.`,
        `**Habilidades**: ${c.skills.length ? `${join(c.skills.map(s => `[[pf-hab-${s}|${d.SKILLS[s]?.[0] || s}]]`))} y ` : ''}${c.free} más a elegir (+ INT).`,
        `**Armadura**: ${c.armor ? `entrenado hasta armaduras ${['', 'ligeras', 'medias', 'pesadas'][c.armor]}` : 'sin armadura'}${c.unarmored ? ' (experto sin armadura)' : ''}; **armas**: ${c.weapon > 1 ? 'experto' : 'entrenado'}.`,
        c.spells ? `**Conjuros**: tradición ${c.spells.toLowerCase()}.` : '',
        c.sub ? `**Subclase**: ${c.sub}.` : ''
      ]) + '\n\nVer [[pf-competencia|competencia]] y [[pf-salvaciones|salvaciones]].'
    }));
    const skills = Object.entries(d.SKILLS).map(([k, [name, attr]]) => ({
      id: `pf-hab-${k}`, title: name, summary: SKILL_TEXT[k]?.[0] || '',
      narr: SKILL_TEXT[k]?.[0] || '',
      mech: `Se basa en **${d.ATTR[attr]?.name || attr}**. ${SKILL_TEXT[k]?.[1] || ''}\n\nSin entrenar solo sumas el atributo; entrenada suma además la [[pf-competencia|competencia]].`
    }));
    return {
      title: 'Manual de Pathfinder',
      intro: 'Guía de consulta del Remaster (Player Core 1 y 2): las reglas básicas, las ascendencias, los bagajes, las clases y las habilidades, cada una con lo que significa en la historia y cómo funciona en la mesa.',
      note: 'Los textos son resúmenes propios; los nombres de herencias, dotes y subclases son traducciones propias.',
      chapters: [
        { id: 'pf-basicas', title: 'Reglas básicas', intro: 'Cómo se resuelven las acciones y qué significan los números de la ficha.', entries: BASICS },
        { id: 'pf-ascendencias', title: 'Ascendencias', intro: 'Tu pueblo de origen: puntos de golpe, tamaño, velocidad, sentidos, idiomas y parte de tus mejoras.', entries: ancestries },
        { id: 'pf-bagajes', title: 'Bagajes', intro: 'Lo que hacías antes de ser aventurero: dos mejoras, una habilidad, un Saber y una dote de habilidad.', entries: backgrounds },
        { id: 'pf-clases', title: 'Clases', intro: 'Tu oficio de aventurero: atributo clave, puntos de golpe, competencias y rasgos.', entries: classes },
        { id: 'pf-habilidades', title: 'Habilidades', intro: 'Las dieciséis habilidades y para qué sirve cada una. Los Saberes son habilidades de Inteligencia sobre un tema concreto.', entries: skills }
      ]
    };
  };
})();
