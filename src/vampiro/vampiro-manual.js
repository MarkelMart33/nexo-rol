/*
 * NEXO · Manual de Vampiro (V20: noches modernas y Edad Oscura). Resúmenes y explicaciones propias.
 * Clanes, disciplinas, sendas, rasgos y generaciones salen de los datos del creador (src/vampiro/vampire.js);
 * cada apartado (side 'v20' o 'da') ve solo lo de su ambientación.
 */
(() => {
  const list = items => items.filter(Boolean).map(item => `- ${item}`).join('\n');
  const join = names => names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}` : names.join('');

  const CLAN_TEXT = {
    assamita: 'Asesinos y eruditos de Alamut que cobran contratos en sangre y guardan una disciplina férrea.',
    brujah: 'Idealistas, rebeldes y filósofos de pasión desbordada; antaño reyes sabios, hoy agitadores.',
    capadocio: 'Clan de estudiosos de la muerte que buscan entender qué hay al otro lado.',
    gangrel: 'Vagabundos y supervivientes, más cerca de la Bestia y de los lobos que de la corte.',
    giovanni: 'Familia de banqueros venecianos y nigromantes que comercia con los muertos.',
    lasombra: 'Señores de la noche y de las sombras, orgullosos, ambiciosos y sin reflejo.',
    malkavian: 'Profetas locos cuya demencia esconde verdades que nadie más ve.',
    nosferatu: 'Monstruos deformes que viven en las cloacas y comercian con secretos.',
    ravnos: 'Embaucadores errantes y maestros de la ilusión, esclavos de sus vicios.',
    salubri: 'Sanadores y guerreros de tercer ojo, perseguidos y calumniados.',
    setita: 'Sacerdotes de un dios serpiente que tientan, corrompen y liberan.',
    toreador: 'Artistas y mecenas obsesionados con la belleza, pilares de la sociedad vástaga.',
    tremere: 'Hechiceros que robaron la inmortalidad y la defienden con una jerarquía de hierro.',
    tzimisce: 'Señores feudales del Este que moldean la carne como los escultores la arcilla.',
    ventrue: 'Aristócratas y gobernantes que dirigen a los demás clanes con mano firme.',
    caitiff: 'Vástagos sin clan, abandonados por su sire o de sangre demasiado débil para mostrar linaje.'
  };
  const DISC_TEXT = {
    Animalismo: ['Afinidad con las bestias y dominio sobre la Bestia propia y ajena.', 'Comunicarte con animales y llamarlos, calmarlos o enfurecerlos, compartir el cuerpo de uno y, en lo más alto, aplacar la Bestia de otros vampiros.'],
    Auspex: ['Sentidos más allá de lo humano y percepción de lo oculto.', 'Agudiza los sentidos, permite leer auras y las emociones que reflejan, leer las huellas de los objetos, leer mentes y viajar fuera del cuerpo. Sirve para descubrir a quien usa Ofuscación.'],
    Celeridad: ['Velocidad sobrenatural.', 'Cada punto suma un dado a las tiradas de Destreza; gastando 1 punto de sangre, ganas tantas acciones adicionales como tu puntuación en el turno.'],
    Demencia: ['El don malkavian de contagiar la locura.', 'Inflama pasiones, provoca visiones, confunde los sentidos y, en lo más alto, arrastra a la víctima a un trastorno pleno.'],
    Dominación: ['Imponer tu voluntad con la mirada y la voz.', 'Mirando a los ojos: órdenes de una palabra, sugestiones complejas, borrar o cambiar recuerdos, condicionar a largo plazo y, en lo más alto, poseer el cuerpo de un mortal.'],
    Extinción: ['El arte assamita de matar con la sangre.', 'Debilita a la víctima, vuelve venenosa la sangre propia, roba años de vida o envenena las armas con tu sangre.'],
    Fortaleza: ['Resistencia sobrenatural del cadáver.', 'Cada punto suma dados para absorber daño, y además te deja absorber daño agravado (fuego, sol, garras).'],
    Mortis: ['La disciplina capadocia de la muerte y la carne inerte.', 'Pone a los vivos a las puertas de la muerte, levanta y controla cadáveres, deteriora la carne y protege contra la decadencia.'],
    Nigromancia: ['Dominio sobre las almas de los muertos.', 'Se aprende por sendas: hablar con fantasmas, invocarlos y atarlos, o manipular los cuerpos. Funciona con rituales además de los poderes.'],
    Obtenebración: ['El poder sobre la oscuridad viva del Abismo.', 'Moldea sombras, envuelve zonas en oscuridad, crea tentáculos de sombra y, en lo más alto, convierte el cuerpo en sombra.'],
    Ofuscación: ['Pasar desapercibido aunque estés delante.', 'Permanecer oculto si no te mueves, caminar sin ser visto, adoptar otro rostro y ocultar a otros. Solo Auspex lo atraviesa.'],
    Potencia: ['Fuerza sobrenatural.', 'Cada punto es un éxito automático en las tiradas de Fuerza (incluido el daño cuerpo a cuerpo). Gastando sangre, los puntos se convierten en éxitos durante un turno.'],
    Presencia: ['Magnetismo que despierta admiración, miedo o devoción.', 'Fascinar a una multitud, imponer temor, atraer a alguien a tu lado, entrar en sus emociones y, en lo más alto, hacerse adorar.'],
    Protean: ['El cuerpo cambia como el de la Bestia.', 'Ojos que ven en la oscuridad, garras que causan daño agravado, fundirse con la tierra para dormir, adoptar formas animales y volverse niebla.'],
    Quimerismo: ['Ilusiones ravnos que engañan a los sentidos.', 'Crea imágenes, sonidos y, más adelante, ilusiones que duran o que llegan a hacer daño a quien cree en ellas.'],
    Serpentis: ['El legado de Set: la serpiente y la tentación.', 'Mirada hipnótica, lengua bífida, cuerpo de serpiente y arrancarse el corazón para protegerlo de la estaca.'],
    Taumaturgia: ['Hechicería de sangre de los Tremere.', 'Se aprende por sendas (la principal es la Senda de la Sangre) y se completa con rituales. Cada uso pide una tirada de Fuerza de Voluntad.'],
    Valeren: ['El don salubri del tercer ojo, para curar o para combatir.', 'La vía del sanador cierra heridas y calma el dolor; la vía guerrera intensifica el ataque y protege a los suyos.'],
    Vicisitud: ['Moldear carne y hueso, propios o ajenos.', 'Cambia rasgos, esculpe la carne y luego el hueso, adopta una forma de horror y, en lo más alto, se convierte en sangre.']
  };

  const basics = d => [
    { id: 'vtm-reservas', title: 'Reservas de dados', aka: ['Dificultad', 'Éxitos', 'Fracaso'], summary: 'Se tira un puñado de d10 y cuenta cuántos igualan o superan la dificultad.',
      narr: 'En el Mundo de Tinieblas no hay tiradas fáciles: el Narrador decide cuántos dados merece tu personaje y lo difícil que es la tarea.',
      mech: 'La reserva suele ser **atributo + habilidad** (por ejemplo Destreza + Pelea). La dificultad va de 2 a 10, normalmente 6.\n\n' + list(['Cada dado que iguala o supera la dificultad es un **éxito**.', 'Cada **1** anula un éxito.', 'Sin éxitos, la acción falla; sin éxitos y con algún 1, es un **fracaso**: algo sale mal de verdad.', 'Más éxitos, mejor resultado.']) + '\n\nPuedes gastar [[vtm-voluntad|Fuerza de Voluntad]] para ganar un éxito automático.' },
    { id: 'vtm-voluntad', title: 'Fuerza de Voluntad', summary: 'La determinación del vampiro, que se gasta para lograr lo imprescindible.',
      narr: 'Seguir adelante cuando el cuerpo y la Bestia piden rendirse.',
      mech: 'Gasta 1 punto para ganar un éxito automático en una tirada (uno por turno) o para resistir un impulso durante un turno. Se recupera con el descanso y cumpliendo tu Naturaleza. En la creación se deriva de las [[vtm-virtudes|virtudes]].' },
    { id: 'vtm-sangre', title: 'Reserva de sangre', aka: ['Vitae', 'Puntos de sangre'], summary: 'La vitae que lleva el vampiro y que alimenta sus poderes.',
      narr: 'La sangre es vida, poder y adicción. Sin ella, el vampiro se marchita y la Bestia despierta.',
      mech: list(['Gastas 1 punto al despertar cada noche.', '1 punto cura un nivel de daño contundente o letal (el agravado cuesta más y lleva tiempo).', '1 punto aumenta en uno un atributo físico durante la escena.', 'Muchas [[vtm-cap-disciplinas|disciplinas]] cuestan sangre.']) + '\n\nEl máximo y lo que puedes gastar por turno dependen de la [[vtm-generacion|generación]].' },
    { id: 'vtm-generacion', title: 'Generación', summary: 'La distancia de la sangre a Caín: cuanto más baja, más poder.',
      narr: 'Cada Abrazo diluye la sangre. Los ancianos de generaciones bajas son temibles; los neonatos de la 13ª apenas tienen poder.',
      mech: `Generación base: ${d.side === 'da' ? '12ª' : '13ª'}. El trasfondo Generación la baja un paso por punto, y la [[vtm-diablerie|${d.side === 'da' ? 'Amaranto' : 'diablerie'}]] también.\n\n` + Object.entries(d.GENERATIONS).sort((a, b) => b[0] - a[0]).map(([g, [blood, turn]]) => `- **${g}ª**: reserva de ${blood}, gasto de ${turn} por turno${d.TRAIT_MAX[g] ? `; rasgos hasta ${d.TRAIT_MAX[g]}` : ''}.`).join('\n') },
    { id: 'vtm-virtudes', title: 'Virtudes', aka: ['Conciencia', 'Convicción', 'Autocontrol', 'Instinto', 'Coraje'], summary: 'Las tres virtudes que sostienen la moral del vampiro.',
      narr: 'Lo que impide que el vampiro se convierta en un monstruo, o la forma que elige de serlo.',
      mech: list(['**Conciencia** (o **Convicción** en algunas sendas): resistir la degeneración.', '**Autocontrol** (o **Instinto**): resistir o dirigir el [[vtm-frenesi|frenesí]].', '**Coraje**: resistir el miedo al fuego y al sol.']) + `\n\nEmpiezan en 1 y repartes 7 puntos. ${d.side === 'da' ? 'La [[vtm-cap-sendas|senda]]' : 'La [[vtm-humanidad|Humanidad]]'} inicial es Conciencia + Autocontrol, y la Voluntad, igual a Coraje.` },
    { id: 'vtm-humanidad', title: d.side === 'da' ? 'Humanidad y sendas' : 'Humanidad', aka: ['Degeneración', 'Jerarquía de pecados'], summary: 'Lo que le queda de humano al vampiro, que se pierde al cometer pecados.',
      narr: 'Cada crimen erosiona el alma. Con poca Humanidad, el vampiro se vuelve frío, cruel y difícil de despertar.',
      mech: `Al cometer un acto que tu moral no tolera, tiras Conciencia${d.side === 'da' ? ' o Convicción' : ''}: si fallas, pierdes un punto. A 0, la Bestia se apodera del personaje. La Humanidad también limita las horas que puedes estar despierto de día y las tiradas para resistir el [[vtm-frenesi|frenesí]].${d.side === 'da' ? ' En Edad Oscura muchos Cainitas siguen otras [[vtm-cap-sendas|sendas]] con su propia jerarquía de pecados.' : ''}` },
    { id: 'vtm-frenesi', title: 'Frenesí y Rötschreck', aka: ['Bestia', 'Miedo rojo'], summary: 'Cuando la Bestia toma el control: por hambre, ira o terror.',
      narr: 'El hambre, la humillación o la visión del fuego pueden desatar a la Bestia, que actúa sin pensar en las consecuencias.',
      mech: 'Ante una provocación tiras **Autocontrol** (o Instinto); si no logras los éxitos que pide el Narrador, entras en frenesí y atacas lo que tengas delante. Ante el fuego o el sol tiras **Coraje**: fallar es el **Rötschreck**, una huida aterrada. Gastar [[vtm-voluntad|Fuerza de Voluntad]] puede contenerla un turno.' },
    { id: 'vtm-diablerie', title: d.side === 'da' ? 'Amaranto' : 'Diablerie', summary: d.side === 'da' ? 'Beber el alma de otro Cainita.' : 'Beber el alma de otro vampiro.',
      narr: d.LORE[d.side] || '',
      mech: 'Tras vaciar la sangre de la víctima, hay que superar su resistencia con tiradas de Fuerza (dificultad 9) hasta acumular tantos éxitos como su Fuerza de Voluntad. La [[vtm-generacion|generación]] baja (nunca por debajo de la de la víctima), la Humanidad puede caer y puede ganarse algo de sus [[vtm-cap-disciplinas|disciplinas]]. El aura queda marcada con vetas negras. La ficha de NEXO tiene un registro para llevarlo.' }
  ];

  window.NEXO_MANUALS = window.NEXO_MANUALS || {};
  window.NEXO_MANUALS.vampiro = d => {
    const era = d.ERAS[d.side];
    const discLink = name => `[[vtm-dis-${d.slug(name)}|${name}]]`;
    const clans = Object.entries(era.clans).map(([k, c]) => ({
      id: `vtm-clan-${k}`, title: c.name, summary: CLAN_TEXT[k] || '', narr: CLAN_TEXT[k] || '',
      mech: list([c.disc.length ? `**Disciplinas de clan**: ${join(c.disc.map(discLink))}.` : '**Disciplinas**: cualesquiera tres a elegir; las de otros clanes les cuestan menos que al resto.', `**Debilidad**: ${c.weak}`]) + '\n\nCon los 3 puntos de disciplinas iniciales solo se compran las del clan.'
    }));
    const used = new Set(Object.values(era.clans).flatMap(c => c.disc));
    const disciplines = d.DISCIPLINES.filter(name => used.has(name)).map(name => ({
      id: `vtm-dis-${d.slug(name)}`, title: name, summary: DISC_TEXT[name]?.[0] || '', narr: DISC_TEXT[name]?.[0] || '',
      mech: `${DISC_TEXT[name]?.[1] || ''}\n\nLa tienen como propia: ${join(Object.entries(era.clans).filter(([, c]) => c.disc.includes(name)).map(([k, c]) => `[[vtm-clan-${k}|${c.name}]]`)) || 'ningún clan de esta ambientación'}.`
    }));
    const traits = [
      ...d.ATTRS.map(g => ({ id: `vtm-atr-${g.id}`, title: `Atributos ${g.label.toLowerCase()}`, summary: join(g.traits.map(t => t[1])) + '.', mech: `${join(g.traits.map(t => `**${t[1]}**`))}. Empiezan en 1; repartes 7, 5 y 3 puntos según la prioridad de cada grupo. Ver [[vtm-reservas|reservas de dados]].` })),
      ...era.abilities.map(g => ({ id: `vtm-hab-${g.id}`, title: g.label, summary: join(g.traits.map(t => t[1])) + '.', mech: `${join(g.traits.map(t => t[1]))}.\n\nRepartes 13, 9 y 5 puntos según la prioridad, sin pasar de 3 al crear el personaje.` })),
      { id: 'vtm-trasfondos', title: 'Trasfondos', summary: join(era.backgrounds.map(b => b[1])) + '.', mech: `${join(era.backgrounds.map(b => b[1]))}.\n\nRepartes 5 puntos. **Generación** baja tu [[vtm-generacion|generación]] un paso por punto.` }
    ];
    const roads = era.roads.map(k => d.ROADS[k]).filter(Boolean).map((r, i) => ({
      id: `vtm-senda-${era.roads[i]}`, title: r.name, summary: `Virtudes: ${join(r.virtues)} y Coraje.`,
      mech: `Usa ${join(r.virtues)} y Coraje como [[vtm-virtudes|virtudes]]. Su valor inicial es la suma de las dos primeras. Ver [[vtm-humanidad|Humanidad y sendas]].`
    }));
    const chapters = [
      { id: 'vtm-cap-reglas', title: 'Reglas básicas', intro: 'Dados, sangre, generación, virtudes, Humanidad y la Bestia.', entries: basics(d) },
      { id: 'vtm-cap-clanes', title: 'Clanes', intro: 'Los linajes de Caín, con sus disciplinas y su debilidad.', entries: clans },
      { id: 'vtm-cap-disciplinas', title: 'Disciplinas', intro: 'Los poderes de la sangre.', entries: disciplines },
      { id: 'vtm-cap-rasgos', title: 'Rasgos', intro: 'Atributos, habilidades y trasfondos de esta ambientación.', entries: traits }
    ];
    if (d.side === 'da') chapters.push({ id: 'vtm-cap-sendas', title: 'Sendas', intro: 'Las morales que siguen los Cainitas del siglo XIII.', entries: roads });
    return {
      title: d.side === 'da' ? 'Manual de Edad Oscura' : 'Manual de Vampiro',
      intro: d.side === 'da' ? 'Guía de consulta de Vampiro: Edad Oscura (V20 Dark Ages): cómo se tiran los dados, la sangre y la moral, los clanes del siglo XIII, sus disciplinas y las sendas.' : 'Guía de consulta de Vampiro: La Mascarada, edición del 20º aniversario: cómo se tiran los dados, la sangre y la moral, los clanes y sus disciplinas.',
      note: 'Los textos son resúmenes propios.',
      chapters
    };
  };
})();
