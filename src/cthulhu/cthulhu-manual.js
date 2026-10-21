/*
 * NEXO · Manual de La llamada de Cthulhu (7ª edición). Resúmenes y explicaciones propias.
 * Características, ocupaciones, habilidades y edad salen de los datos del creador (src/cthulhu/cthulhu.js).
 */
(() => {
  const list = items => items.filter(Boolean).map(item => `- ${item}`).join('\n');
  const join = names => names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}` : names.join('');

  const CHAR_TEXT = {
    fue: ['Fuerza bruta: levantar, empujar, golpear.', 'Cuenta para la bonificación al daño, la corpulencia y el movimiento.'],
    con: ['Salud, aguante y resistencia a enfermedades y venenos.', 'Con TAM da los puntos de vida: (CON + TAM) / 10.'],
    tam: ['Altura y peso: lo que ocupa el cuerpo.', 'Cuenta para los puntos de vida, la bonificación al daño, la corpulencia y el movimiento.'],
    des: ['Agilidad, rapidez y coordinación.', 'Da la base de Esquivar (DES/2) y decide quién actúa antes en combate.'],
    apa: ['Atractivo físico y presencia en el trato social.', 'Ayuda en el primer contacto: Encanto y otras relaciones dependen de cómo te perciben.'],
    int: ['Capacidad de razonar, aprender y relacionar ideas.', 'Da los puntos de interés personal (INT×2). Una tirada de **Idea** es INT.'],
    pod: ['Fuerza de voluntad, espíritu y afinidad con lo mágico.', 'Da la Cordura inicial (igual a POD) y los puntos de magia (POD/5).'],
    edu: ['Conocimientos formales y experiencia del mundo.', 'Da la base de Lengua propia y casi siempre los puntos de ocupación (EDU×4). Una tirada de **Conocimiento** es EDU.']
  };

  const BASICS = [
    { id: 'cth-tirada', title: 'Tiradas de habilidad', aka: ['Tirada porcentual', 'd100'], summary: 'Se tira 1d100 y hay que sacar igual o menos que el valor de la habilidad.',
      narr: 'Los investigadores son gente corriente. Lo que saben hacer se mide en porcentajes: un 60 % en Descubrir significa que suelen encontrar lo que buscan.',
      mech: 'Tira dos dados de diez (decenas y unidades) para obtener un número del 01 al 100. Si sacas igual o menos que la habilidad o característica, tienes éxito. El Guardián puede pedir un [[cth-grados|nivel de éxito]] más alto si la tarea es difícil.' },
    { id: 'cth-grados', title: 'Niveles de éxito', aka: ['Éxito difícil', 'Éxito extremo', 'Crítico', 'Pifia'], summary: 'Normal, difícil (la mitad) y extremo (la quinta parte), más críticos y pifias.',
      narr: 'No es lo mismo abrir una cerradura oxidada que una de seguridad: la dificultad cambia el número que necesitas.',
      mech: list(['**Éxito normal**: igual o menos que el valor.', '**Éxito difícil**: igual o menos que la mitad.', '**Éxito extremo**: igual o menos que la quinta parte.', '**Crítico**: un 01.', '**Pifia**: un 100, o del 96 al 100 si el valor es menor de 50.']) + '\n\nLa ficha de NEXO muestra al lado de cada valor su mitad y su quinta parte.' },
    { id: 'cth-forzar', title: 'Forzar la tirada', summary: 'Repetir una tirada fallida a cambio de arriesgarse a algo peor.',
      narr: 'Si no encuentras el libro en la biblioteca, puedes vaciar las estanterías… y que te descubra el bibliotecario.',
      mech: 'Tras fallar, el jugador puede justificar un esfuerzo extra y repetir la tirada una vez. Antes se acuerda qué pasará si vuelve a fallar: el Guardián puede imponer una consecuencia grave. No se pueden forzar tiradas de combate, de Cordura ni de Suerte.' },
    { id: 'cth-dados-bonificacion', title: 'Dados de bonificación y penalización', summary: 'Tirar un dado de decenas de más y quedarse con el mejor o el peor.',
      narr: 'Tener tiempo, buenas herramientas o información privilegiada ayuda; las prisas, la oscuridad o las heridas estorban.',
      mech: 'Con un **dado de bonificación** tiras un dado de decenas extra y usas el que dé el resultado más bajo; con uno de **penalización**, el más alto. Un dado de cada clase se anula entre sí. Como mucho, dos de cada.' },
    { id: 'cth-enfrentadas', title: 'Tiradas enfrentadas', summary: 'Dos personajes tiran y gana el mejor nivel de éxito.',
      narr: 'Un forcejeo, una persecución o un intento de engañar a alguien que está atento.',
      mech: 'Cada uno tira su habilidad y compara el [[cth-grados|nivel de éxito]]: gana el más alto. En caso de empate, gana quien tenga la habilidad más alta (en combate, el defensor si esquiva).' },
    { id: 'cth-cordura', title: 'Cordura', aka: ['COR', 'Locura temporal', 'Locura indefinida'], summary: 'La estabilidad mental del investigador, que se va perdiendo ante los horrores.',
      narr: 'Ver un cadáver mutilado o leer un tomo prohibido deja huella. Cuanto más sabe un investigador de los Mitos, menos queda de su mente sana.',
      mech: 'Empieza igual que el [[cth-car-pod|POD]] y su máximo es 99 menos [[cth-hab-mitos|Mitos de Cthulhu]]. Ante algo terrible se tira COR: con éxito pierdes poco (o nada); con fallo, más. Perder 5 o más de golpe obliga a una tirada de INT: si la pasas, comprendes lo que has visto y sufres una **locura temporal**. Perder una quinta parte de tu COR en un día provoca una **locura indefinida**. A 0, la locura es permanente.' },
    { id: 'cth-suerte', title: 'Suerte', summary: 'Una característica aparte que se tira para el azar puro y se puede gastar.',
      narr: '¿Pasa un taxi justo ahora? ¿Te toca la bala perdida? La Suerte decide lo que no depende del investigador.',
      mech: 'Se tira al crear el personaje (3D6×5). El Guardián pide tiradas de Suerte para el azar. Con la regla opcional de gastar Suerte, puedes restar puntos para convertir un fallo en éxito (no en tiradas de Cordura ni de Suerte); se recupera poco a poco.' },
    { id: 'cth-vida', title: 'Puntos de vida y heridas', aka: ['PV', 'Herida grave', 'Moribundo'], summary: 'Lo que aguanta el cuerpo antes de caer.',
      narr: 'Una sola bala puede matar. En Cthulhu, la violencia es rápida y peligrosa.',
      mech: 'Puntos de vida = ([[cth-car-con|CON]] + [[cth-car-tam|TAM]]) / 10. Si un solo golpe quita la mitad de tus PV máximos o más, es una **herida grave**: tira CON para no quedar inconsciente. A 0 PV con una herida grave estás **moribundo** y necesitas Primeros auxilios enseguida.' },
    { id: 'cth-mejora', title: 'Tiradas de mejora', summary: 'Al final de una aventura, las habilidades usadas con éxito pueden subir.',
      narr: 'Se aprende sobreviviendo: lo que funcionó cuando más importaba se queda grabado.',
      mech: 'Marca cada habilidad con la que tengas éxito en un momento importante. Al terminar la aventura, tira 1d100 por cada una: si sacas más que su valor (o más de 95), sube 1D10. La EDU también se mejora así con la [[cth-edad|edad]].' },
    { id: 'cth-edad', title: 'Edad', summary: 'La edad del investigador cambia sus características y su movimiento.',
      narr: 'Un estudiante de 18 años y un catedrático de 65 viven el horror de forma distinta: uno es ágil, el otro sabe más.',
      mech: '' }
  ];

  window.NEXO_MANUALS = window.NEXO_MANUALS || {};
  window.NEXO_MANUALS.cthulhu = d => {
    const edad = BASICS.find(e => e.id === 'cth-edad');
    edad.mech = d.AGES.map(a => `- **${a.min} a ${a.max} años**: ${a.text}`).join('\n');
    const chars = d.CHARS.map(([k, name, short, roll]) => ({
      id: `cth-car-${k}`, title: `${name} (${short})`, aka: [short], summary: CHAR_TEXT[k]?.[0] || '', narr: CHAR_TEXT[k]?.[0] || '',
      mech: `Se genera con ${roll === '3d6' ? '3D6×5' : '(2D6+6)×5'}. ${CHAR_TEXT[k]?.[1] || ''}\n\nTambién se puede tirar directamente contra su valor, con sus [[cth-grados|niveles de éxito]].`
    }));
    const skillName = k => d.SKILLS[k]?.[0] || k;
    const occupations = Object.entries(d.OCCUPATIONS).map(([k, o]) => ({
      id: `cth-ocu-${k}`, title: o.name, summary: o.text, narr: o.text,
      mech: list([
        `**Crédito**: de ${o.credit[0]} a ${o.credit[1]}.`,
        `**Puntos de ocupación**: ${o.alt.length ? `EDU×2 + ${o.alt.map(a => d.CH[a]?.short || a).join(' o ')}×2` : 'EDU×4'}.`,
        o.skills.length ? `**Habilidades**: ${join(o.skills.map(s => `[[cth-hab-${s}|${skillName(s)}]]`))}.` : '',
        o.social ? `Más ${o.social} interpersonal${o.social > 1 ? 'es' : ''} (Charlatanería, Encanto, Intimidar o Persuasión).` : '',
        o.any ? `Más ${o.any} a elegir libremente.` : ''
      ]) + '\n\nEl Crédito también sale de estos puntos. Ver [[cth-hab-credito|Crédito]].'
    }));
    const skills = Object.entries(d.SKILLS).map(([k, [name, base, spec]]) => ({
      id: `cth-hab-${k}`, title: name,
      summary: `Base: ${k === 'esquivar' ? 'la mitad de DES' : k === 'lenguaPropia' ? 'igual a EDU' : `${base} %`}.`,
      mech: `**Valor base**: ${k === 'esquivar' ? 'DES/2' : k === 'lenguaPropia' ? 'EDU' : `${base} %`}.${spec ? ` Tiene especialidades: ${spec}` : ''}${k === 'mitos' ? ' No se puede subir al crear el investigador y resta del máximo de [[cth-cordura|Cordura]].' : ''}${k === 'credito' ? ' Mide tu posición económica y social; solo sube con puntos de ocupación, dentro del rango de tu ocupación.' : ''}\n\nSe tira con 1d100 contra su valor. Ver [[cth-tirada|tiradas de habilidad]].`
    }));
    return {
      title: 'Manual de Cthulhu',
      intro: 'Guía de consulta de la 7ª edición: cómo se tiran los dados, la Cordura y la Suerte, las ocho características, las ocupaciones de los años veinte y las habilidades.',
      note: 'Los textos son resúmenes propios.',
      chapters: [
        { id: 'cth-cap-reglas', title: 'Reglas básicas', intro: 'Tiradas, niveles de éxito, Cordura, Suerte y heridas.', entries: BASICS },
        { id: 'cth-cap-caracteristicas', title: 'Características', intro: 'Las ocho características y lo que se deriva de ellas.', entries: chars },
        { id: 'cth-cap-ocupaciones', title: 'Ocupaciones', intro: 'A qué se dedica el investigador: su Crédito, sus puntos y sus habilidades.', entries: occupations },
        { id: 'cth-cap-habilidades', title: 'Habilidades', intro: 'Todas las habilidades con su valor base.', entries: skills }
      ]
    };
  };
})();
