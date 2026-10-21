/*
 * NEXO · Manual de Dungeons & Dragons 5.5 (Manual del Jugador de 2024). Resúmenes y explicaciones propias.
 * Las clases, rasgos, subclases, especies, trasfondos y dotes salen de los datos del creador
 * (src/dnd/dnd.js y src/dnd/dnd-progresion.js); aquí se añaden las reglas básicas y los enlaces.
 */
(() => {
  const list = items => items.filter(Boolean).map(item => `- ${item}`).join('\n');
  const join = names => names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}` : names.join('');
  const slug = text => String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const SKILL_TEXT = {
    acrobacias: 'Mantener el equilibrio, dar volteretas y librarte de una presa con agilidad.',
    atletismo: 'Trepar, saltar, nadar y forcejear; también sirve para agarrar o empujar a una criatura.',
    arcano: 'Saber sobre conjuros, objetos mágicos, símbolos arcanos y los planos de existencia.',
    engano: 'Mentir de forma convincente, disfrazar tus intenciones y despistar.',
    historia: 'Recordar sucesos, reinos, guerras y personajes del pasado.',
    interpretacion: 'Entretener a un público con música, baile, teatro o relatos.',
    intimidacion: 'Influir en otros con amenazas, hostilidad o presencia física.',
    investigacion: 'Buscar pistas, deducir a partir de ellas y examinar con detalle.',
    juego_manos: 'Robar, ocultar objetos y cualquier truco que requiera manos rápidas.',
    medicina: 'Estabilizar a un moribundo y diagnosticar heridas o enfermedades.',
    naturaleza: 'Conocer el terreno, las plantas, los animales y el clima.',
    percepcion: 'Ver, oír y notar lo que pasa a tu alrededor; es la habilidad que más se tira.',
    perspicacia: 'Leer las intenciones y emociones de alguien: notar una mentira o adivinar el siguiente paso.',
    persuasion: 'Convencer con tacto, buenas maneras y argumentos.',
    religion: 'Saber sobre dioses, ritos, órdenes religiosas y criaturas sagradas o profanas.',
    sigilo: 'Esconderte y moverte sin que te vean ni te oigan.',
    supervivencia: 'Rastrear, cazar, orientarte y evitar los peligros de lo salvaje.',
    trato_animales: 'Calmar, adiestrar o montar animales y entender lo que quieren.'
  };

  const BASICS = [
    { id: 'dnd-prueba-d20', title: 'Pruebas d20', aka: ['Prueba de característica', 'CD', 'Clase de Dificultad'], summary: 'Tirada de ataque, prueba de característica y tirada de salvación: d20 + modificadores contra un número objetivo.',
      narr: 'Cuando el resultado de lo que intentas es incierto, el dado decide. El Máster describe la situación, tú dices qué haces y una tirada cuenta cómo sale.',
      mech: 'Tira 1d20, suma el modificador de la característica que corresponda y, si eres competente, tu [[dnd-competencia|bonificador de competencia]]. Igualar o superar el número objetivo es un éxito.\n\n' + list(['**Prueba de característica**: contra una CD (muy fácil 5, fácil 10, normal 15, difícil 20, muy difícil 25, casi imposible 30).', '**Tirada de ataque**: contra la [[dnd-clase-armadura|Clase de Armadura]] del objetivo. Un 20 natural es un crítico y siempre impacta; un 1 natural siempre falla.', '**Tirada de salvación**: contra la CD del efecto. Ver [[dnd-salvaciones|salvaciones]].', 'La [[dnd-ventaja|ventaja o desventaja]] cambia cuántos dados tiras.']) },
    { id: 'dnd-ventaja', title: 'Ventaja y desventaja', summary: 'Tira dos d20 y quédate con el mayor (ventaja) o con el menor (desventaja).',
      narr: 'Atacar a un enemigo derribado, esconderse en la niebla o luchar a ciegas: las circunstancias inclinan la balanza sin sumar números.',
      mech: 'Con **ventaja** tiras 2d20 y usas el mayor; con **desventaja**, el menor. No se acumulan: aunque tengas varias fuentes, solo tiras dos dados, y si tienes a la vez ventaja y desventaja se anulan. La [[dnd-inspiracion|Inspiración heroica]] permite repetir un dado.' },
    { id: 'dnd-competencia', title: 'Bonificador de competencia', aka: ['Competencia', 'Pericia'], summary: 'Un bonificador que crece con el nivel y se suma a lo que sabes hacer.',
      narr: 'Tu clase, tu trasfondo y tu especie te entrenan en armas, habilidades y herramientas. Con la experiencia, todo eso se afina.',
      mech: 'Es +2 de nivel 1 a 4, +3 de 5 a 8, +4 de 9 a 12, +5 de 13 a 16 y +6 de 17 a 20. Se suma a ataques con armas en las que eres competente, a las [[dnd-habilidades|habilidades]] y [[dnd-salvaciones|salvaciones]] competentes y a la CD de tus conjuros. Con **Pericia** se suma el doble. Nunca se suma dos veces a la misma tirada.' },
    { id: 'dnd-salvaciones', title: 'Tiradas de salvación', aka: ['Salvación'], summary: 'Resistir un efecto: d20 + característica (+ competencia si tu clase la da) contra la CD.',
      narr: 'Apartarse de una explosión, aguantar un veneno o resistirse a un hechizo que intenta doblegar tu voluntad.',
      mech: 'Cada característica tiene su salvación. Tu clase te hace competente en dos. La CD de un conjuro es 8 + modificador de la característica de conjuros + bonificador de competencia. Ver [[dnd-prueba-d20|pruebas d20]].' },
    { id: 'dnd-clase-armadura', title: 'Clase de Armadura', aka: ['CA'], summary: 'Lo difícil que es acertarte con un ataque.',
      narr: 'Armadura, escudo y reflejos: todo lo que se interpone entre la espada y tu piel.',
      mech: 'Sin armadura, CA = 10 + DES. Con armadura, la que indique (las intermedias suman como máximo +2 de DES y las pesadas no suman DES). Un escudo suma +2. Algunas clases calculan la CA sin armadura de otra forma (el bárbaro suma CON y el monje SAB).' },
    { id: 'dnd-acciones', title: 'Acciones en combate', aka: ['Acción', 'Acción adicional', 'Reacción', 'Turno'], summary: 'En tu turno: moverte, una acción y, si algo te lo da, una acción adicional; además una reacción por asalto.',
      narr: 'El combate se divide en asaltos de seis segundos. Cada criatura actúa en su turno siguiendo el orden de iniciativa.',
      mech: list(['**Movimiento**: hasta tu velocidad, que puedes repartir antes y después de actuar.', '**Acción**: Atacar, Lanzar un conjuro, Correr, Destrabarse, Esquivar, Ayudar, Esconderse, Buscar, Influir, Estudiar, Usar un objeto…', '**Acción adicional**: solo si un rasgo o conjuro te la da (por ejemplo la Furia del bárbaro).', '**Reacción**: una por asalto, en respuesta a un desencadenante, como el [[dnd-oportunidad|ataque de oportunidad]] cuando un enemigo sale de tu alcance.', 'Interactuar con un objeto (desenvainar, abrir una puerta) es gratis una vez por turno.']) },
    { id: 'dnd-descansos', title: 'Descansos', aka: ['Descanso corto', 'Descanso largo', 'Dados de golpe'], summary: 'Pausas para recuperar puntos de golpe y recursos.',
      narr: 'Vendarse las heridas junto al camino o dormir una noche entera al calor de una hoguera.',
      mech: list(['**Descanso corto** (1 hora): puedes gastar dados de golpe; por cada uno tiras el dado y sumas CON para recuperar PG. Algunos rasgos se recargan.', '**Descanso largo** (8 horas, como mucho 2 de guardia): recuperas todos los PG y todos los dados de golpe gastados, y la mayoría de recursos y espacios de conjuro.', 'Solo puedes hacer un descanso largo cada 24 horas.']) },
    { id: 'dnd-inspiracion', title: 'Inspiración heroica', summary: 'Un premio que permite repetir un dado.',
      narr: 'El Máster la concede por una buena interpretación, una idea brillante o un momento heroico.',
      mech: 'Mientras la tengas, puedes gastarla para repetir cualquier dado que acabes de tirar y quedarte con el nuevo resultado. No se acumula: o la tienes o no. Los humanos la recuperan al terminar un descanso largo.' },
    { id: 'dnd-habilidades', title: 'Habilidades', summary: 'Áreas de pericia ligadas a una característica.', narr: 'Cada habilidad es una forma de aplicar tu cuerpo o tu mente: trepar es Atletismo, mentir es Engaño.',
      mech: 'Una prueba de habilidad es una prueba de característica a la que sumas tu [[dnd-competencia|bonificador de competencia]] si eres competente. El Máster puede pedir otra característica si encaja mejor (Intimidación con Fuerza, por ejemplo). Ver el capítulo [[dnd-cap-habilidades|Habilidades]].' }
  ];

  window.NEXO_MANUALS = window.NEXO_MANUALS || {};
  window.NEXO_MANUALS.dnd = d => {
    const AB = k => d.AB[k]?.name || k;
    const featId = k => `dnd-dote-${k}`;
    const skillLink = k => `[[dnd-hab-${k}|${d.SKILLS[k]?.[0] || k}]]`;
    const species = Object.entries(d.SPECIES).map(([k, s]) => ({
      id: `dnd-esp-${k}`, title: s.name, summary: s.traits,
      mech: list([`**Tamaño**: ${join(s.sizes).toLowerCase()}.`, `**Velocidad**: ${s.speed} pies.`, `**Visión en la oscuridad**: ${s.dv ? `${s.dv} pies` : 'no'}.`, `**Rasgos**: ${s.traits}.`, s.variants ? `**${s.variantLabel || 'Variantes'}**: ${join(s.variants.map(v => v[1]))}.` : '']) + '\n\nEn las reglas de 2024 la especie no mejora características: eso lo hace el [[dnd-cap-trasfondos|trasfondo]].'
    }));
    const backgrounds = Object.entries(d.BACKGROUNDS).map(([k, b]) => ({
      id: `dnd-tra-${k}`, title: b.name, summary: `Dote de origen: ${d.FEATS[b.feat]?.[0] || b.feat}.`,
      mech: list([`**Características**: ${b.abil.map(AB).join(', ')}. Repartes +2 y +1, o +1 a las tres (máximo 20).`, `**Dote de origen**: [[${featId(b.feat)}|${d.FEATS[b.feat]?.[0] || b.feat}]].`, `**Habilidades**: ${b.skills.map(skillLink).join(' y ')}.`, `**Herramienta**: ${b.tool}.`]),
      see: [featId(b.feat)]
    }));
    const feats = Object.entries(d.FEATS).map(([k, [name, text]]) => ({ id: featId(k), title: name, summary: 'Dote de origen.', mech: text }));
    const skills = Object.entries(d.SKILLS).map(([k, [name, attr]]) => ({
      id: `dnd-hab-${k}`, title: name, summary: SKILL_TEXT[k] || '', narr: SKILL_TEXT[k] || '',
      mech: `Se basa en **${AB(attr)}**. Sumas tu [[dnd-competencia|bonificador de competencia]] si eres competente, y el doble con Pericia.`
    }));
    const classChapters = Object.entries(d.CLASSES).map(([k, c]) => {
      const feats = (d.P.features[k] || []).map(([level, name, narr, mech]) => ({ id: `dnd-${k}-${slug(name)}-${level}`, title: name, aka: [`Nivel ${level}`], summary: `${c.name}, nivel ${level}.`, narr, mech }));
      const subs = (d.P.subclasses[k] || []).map(sc => ({
        id: `dnd-${k}-sub-${sc.key}`, title: sc.name, summary: `Subclase de ${c.name.toLowerCase()} (nivel 3).`, narr: sc.story,
        mech: sc.features.map(([level, name, narr, mech]) => `**Nivel ${level} · ${name}.** ${mech}`).join('\n\n')
      }));
      const overview = {
        id: `dnd-cls-${k}`, title: c.name, summary: d.P.story[k] || '', narr: d.P.story[k] || '',
        mech: list([`**Dado de golpe**: d${c.die}.`, `**Característica principal**: ${c.primary}.`, `**Salvaciones**: ${c.saves.map(AB).join(' y ')}.`, `**Habilidades**: ${c.skills[0]} ${c.skills[1] ? `entre ${join(c.skills[1].map(skillLink))}` : 'cualesquiera'}.`, `**Armadura**: ${c.armor}. **Armas**: ${c.weapons}.`, c.cast ? `**Conjuros** con ${AB(c.cast)}.` : '']) +
          (feats.length ? `\n\n**Rasgos por nivel**\n\n${feats.map(f => `- Nivel ${f.aka[0].slice(6)}: [[${f.id}|${f.title}]]`).join('\n')}` : '') +
          (subs.length ? `\n\n**Subclases** (nivel 3): ${join(subs.map(s => `[[${s.id}|${s.title}]]`))}.` : '')
      };
      return { id: `dnd-cap-${k}`, title: c.name, intro: d.P.story[k] || '', entries: [overview, ...feats, ...subs] };
    });
    return {
      title: 'Manual de D&D 5.5',
      intro: 'Guía de consulta del Manual del Jugador de 2024: reglas básicas, combate, magia, estados, equipo, especies, trasfondos, dotes de origen, habilidades y las doce clases con sus rasgos y subclases. Cada entrada cuenta qué significa en la historia y cómo funciona en la mesa.',
      note: 'Los textos son resúmenes propios.',
      chapters: [
        { id: 'dnd-cap-reglas', title: 'Reglas básicas', intro: 'Cómo se tiran los dados y qué significan los números de la ficha.', entries: BASICS },
        ...(window.NEXO_MANUALS.dndReglas || []),
        { id: 'dnd-cap-especies', title: 'Especies', intro: 'Tu pueblo: tamaño, velocidad, sentidos y rasgos especiales.', entries: species },
        { id: 'dnd-cap-trasfondos', title: 'Trasfondos', intro: 'Tu vida antes de la aventura: mejoras de característica, dote de origen, habilidades y herramienta.', entries: backgrounds },
        { id: 'dnd-cap-dotes', title: 'Dotes de origen', intro: 'Las dotes que dan los trasfondos (y la que elige el humano).', entries: feats },
        { id: 'dnd-cap-habilidades', title: 'Habilidades', intro: 'Las dieciocho habilidades y su característica.', entries: skills },
        ...classChapters
      ]
    };
  };
})();
