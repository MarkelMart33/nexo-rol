/*
 * NEXO · Manual de El Archivo de las Tormentas (juego de rol del Cosmere, Manual de Stormlight).
 * Resúmenes y explicaciones propias. Ascendencias, culturas, caminos, órdenes y potencias salen
 * de los datos del creador (src/tormentas/tormentas.js). «Dado de trama» es una traducción propia.
 */
(() => {
  const list = items => items.filter(Boolean).map(item => `- ${item}`).join('\n');
  const join = names => names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}` : names.join('');

  const BASICS = [
    { id: 'tor-prueba', title: 'Pruebas de habilidad', aka: ['Tirada', 'CD'], summary: 'Un d20 más el modificador de la habilidad contra una dificultad.',
      narr: 'Saltar entre mesetas, convencer a un alto señor o leer las intenciones de un cantor: cuando el resultado está en duda, se tira.',
      mech: 'Tira 1d20 y suma el modificador de la habilidad: el valor de su [[tor-atributos|atributo]] más tus rangos en ella. Si igualas o superas la CD, lo consigues. Si el DJ cree que la escena lo merece, añade el [[tor-dado-trama|dado de trama]] para ver si surge una oportunidad o una complicación.' },
    { id: 'tor-dado-trama', title: 'Dado de trama', aka: ['Oportunidad', 'Complicación'], summary: 'Un dado especial que añade giros a una prueba, salga bien o mal.',
      narr: 'La historia no solo depende de acertar o fallar: puedes fallar pero encontrar algo útil, o acertar a costa de un problema nuevo.',
      mech: 'Se tira junto al d20 cuando la situación es arriesgada o interesante. Sus caras muestran **oportunidad** (algo bueno añadido, que puedes usar tú o un aliado), **complicación** (algo sale torcido; algunas caras dan un bonificador a la tirada a cambio) o nada. El resultado del d20 decide el éxito; el dado de trama decide los giros.' },
    { id: 'tor-ventaja', title: 'Ventajas y desventajas', summary: 'Tirar un dado de más y quedarte con el mejor o con el peor.',
      narr: 'Atacar desde lo alto, trabajar con buenas herramientas o pelear herido y a oscuras.',
      mech: 'Una **ventaja** te deja tirar otra vez un dado de la prueba (el d20, el [[tor-dado-trama|dado de trama]] o un dado de daño) y quedarte con el resultado que prefieras. Una **desventaja** obliga a quedarte con el peor. Cada una se anula con una de la otra clase.' },
    { id: 'tor-atributos', title: 'Atributos y reinos', aka: ['Físico', 'Cognitivo', 'Espiritual'], summary: 'Seis atributos repartidos en tres reinos: físico, cognitivo y espiritual.',
      narr: 'En el Cosmere todo existe en tres reinos: el cuerpo, la mente y el alma. Tus atributos describen cómo te desenvuelves en cada uno.',
      mech: list(['**Físico**: Fuerza y Velocidad.', '**Cognitivo**: Intelecto y Voluntad.', '**Espiritual**: Consciencia y Presencia.']) + '\n\nA nivel 1 repartes 12 puntos con un máximo de 3 en cada atributo. Cada reino da una [[tor-defensas|defensa]].' },
    { id: 'tor-defensas', title: 'Defensas', aka: ['Defensa física', 'Defensa cognitiva', 'Defensa espiritual'], summary: 'La CD que tienen que superar los ataques y efectos contra ti.',
      narr: 'Esquivar una lanza, no dejarte engañar o mantener tu identidad frente a una influencia extraña.',
      mech: 'Cada defensa es 10 + la suma de los dos [[tor-atributos|atributos]] de su reino. La armadura puede sumar a la física. Un ataque contra ti tira contra la defensa que corresponda: un golpe contra la física, una mentira contra la cognitiva…' },
    { id: 'tor-recursos', title: 'Salud, concentración e investidura', aka: ['Salud', 'Concentración', 'Investidura', 'Luz tormentosa'], summary: 'Los tres recursos que gastas y recuperas en la aventura.',
      narr: 'El cuerpo aguanta golpes, la mente aguanta presión y los Radiantes arden con luz tormentosa.',
      mech: list(['**Salud**: los golpes que aguantas antes de caer.', '**Concentración**: se gasta en talentos y reacciones y baja con el estrés; si llega a 0, no puedes usar lo que la requiere.', '**Investidura**: solo para quien la tiene, como los [[tor-radiantes|Radiantes]]; se llena con luz tormentosa y alimenta las [[tor-cap-potencias|potencias]].']) + '\n\nNEXO calcula los tres a partir de tus atributos y tu nivel.' },
    { id: 'tor-turnos', title: 'Turnos rápidos y lentos', aka: ['Acciones', 'Reacción'], summary: 'Cada asalto eliges actuar pronto con menos acciones o tarde con más.',
      narr: 'Lanzarte antes de que el enemigo reaccione o esperar el momento justo para un plan completo.',
      mech: 'Al empezar el asalto, cada personaje elige: un **turno rápido** (2 acciones, antes de que actúen los adversarios) o un **turno lento** (3 acciones, después de ellos). Además tienes una **reacción** por asalto para responder a lo que pase.' },
    { id: 'tor-radiantes', title: 'Radiantes e Ideales', aka: ['Ideales', 'Nahel', 'Spren'], summary: 'Un vínculo con un spren que crece al pronunciar Ideales.',
      narr: 'Un spren elige a alguien roto por dentro y lo une a él. Al pronunciar las Palabras de su orden, el vínculo y el poder crecen.',
      mech: 'Un personaje del camino radiante elige una [[tor-cap-ordenes|orden]], con su spren y sus dos [[tor-cap-potencias|potencias]]. Empieza con el Primer Ideal pronunciado; cada Ideal nuevo es un hito de la historia que desbloquea más poder. La luz tormentosa es su [[tor-recursos|investidura]].' }
  ];

  window.NEXO_MANUALS = window.NEXO_MANUALS || {};
  window.NEXO_MANUALS.tormentas = d => {
    const realmOf = k => d.REALMS.find(([id]) => id === d.AT[k]?.realm)?.[1] || '';
    const ancestries = Object.entries(d.ANCESTRIES).map(([k, a]) => ({ id: `tor-anc-${k}`, title: a.name, summary: a.traits.split('. ')[0] + '.', mech: a.traits }));
    const cultures = Object.entries(d.CULTURES).map(([k, [name, text]]) => ({ id: `tor-cul-${k}`, title: name, summary: text, narr: text, mech: 'A nivel 1 eliges dos culturas. Cada una te da una **pericia cultural**: conoces sus costumbres, su idioma y su gente, y el DJ puede facilitar o permitir pruebas relacionadas.' }));
    const paths = Object.entries(d.PATHS).map(([k, p]) => ({
      id: `tor-cam-${k}`, title: p.name, summary: p.story, narr: p.story,
      mech: list([`**Talento clave**: ${p.talent}. ${p.talentText}`, `**Habilidad**: un rango en [[tor-hab-${p.skill}|${d.SKILLS[p.skill]?.[0] || p.skill}]].`, `**Especialidades**: ${join(p.specs)}. Eliges una, que orienta los talentos que irás tomando.`])
    }));
    const skills = Object.entries(d.SKILLS).map(([k, [name, attr]]) => ({
      id: `tor-hab-${k}`, title: name, summary: `Habilidad de ${d.AT[attr]?.name || attr} (reino ${realmOf(attr).toLowerCase()}).`,
      mech: `Su modificador es tu **${d.AT[attr]?.name || attr}** más tus rangos (máximo 2 a nivel 1). Ver [[tor-prueba|pruebas de habilidad]].`
    }));
    const surges = Object.entries(d.SURGES).map(([k, [name, text]]) => ({
      id: `tor-pot-${k}`, title: name, summary: text, narr: text,
      mech: `La usan ${join(Object.entries(d.ORDERS).filter(([, o]) => o.surges.includes(k)).map(([ok, o]) => `[[tor-ord-${ok}|${o.name}]]`))}. Cada potencia funciona como una habilidad propia que mejora con rangos y gasta [[tor-recursos|investidura]].`
    }));
    const orders = Object.entries(d.ORDERS).map(([k, o]) => ({
      id: `tor-ord-${k}`, title: o.name, summary: o.theme, narr: `${o.theme} Su spren es el ${o.spren}.`,
      mech: list([`**Potencias**: ${o.surges.map(s => `[[tor-pot-${s}|${d.SURGES[s]?.[0] || s}]]`).join(' y ')}.`, `**Spren**: ${o.spren}.`, 'Empiezas con el Primer Ideal; los siguientes los marca la historia. Ver [[tor-radiantes|Radiantes e Ideales]].'])
    }));
    return {
      title: 'Manual de las Tormentas',
      intro: 'Guía de consulta del juego de rol del Cosmere con el Manual de Stormlight: cómo se resuelven las pruebas, los reinos y defensas, y los orígenes, caminos y órdenes radiantes de Roshar.',
      note: 'Los textos son resúmenes propios; «dado de trama» es una traducción propia.',
      chapters: [
        { id: 'tor-cap-reglas', title: 'Reglas básicas', intro: 'Pruebas, dado de trama, defensas, recursos y turnos.', entries: BASICS },
        { id: 'tor-cap-ascendencias', title: 'Ascendencias', intro: 'Humanos y cantores.', entries: ancestries },
        { id: 'tor-cap-culturas', title: 'Culturas', intro: 'Los pueblos de Roshar. Cada personaje elige dos.', entries: cultures },
        { id: 'tor-cap-caminos', title: 'Caminos heroicos', intro: 'Tu vocación: el talento clave, la habilidad y las especialidades.', entries: paths },
        { id: 'tor-cap-habilidades', title: 'Habilidades', intro: 'Las dieciocho habilidades y el atributo del que dependen.', entries: skills },
        { id: 'tor-cap-ordenes', title: 'Órdenes radiantes', intro: 'Las nueve órdenes de los Caballeros Radiantes, con su spren y sus potencias.', entries: orders },
        { id: 'tor-cap-potencias', title: 'Potencias', intro: 'Las diez potencias que la luz tormentosa permite manipular.', entries: surges }
      ]
    };
  };
})();
