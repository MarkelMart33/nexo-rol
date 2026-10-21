/*
 * NEXO · Manual de D&D 5.5: capítulos de combate, magia, estados y equipo (reglas de 2024).
 * Resúmenes y explicaciones propias. Los nombres de las maestrías de armas son traducciones propias.
 * dnd-manual.js los añade detrás de las reglas básicas.
 */
(() => {
  const list = items => items.filter(Boolean).map(item => `- ${item}`).join('\n');

  const COMBAT = [
    { id: 'dnd-iniciativa', title: 'Iniciativa y sorpresa', aka: ['Orden de combate', 'Sorprendido'], summary: 'Al empezar el combate, cada uno tira Destreza para decidir el orden.',
      narr: 'La emboscada estalla, alguien desenvaina y todo pasa a la vez. La iniciativa decide quién reacciona antes.',
      mech: 'Cada participante hace una prueba de Destreza (iniciativa) y se actúa de mayor a menor. Quien es **sorprendido** tira la iniciativa con [[dnd-ventaja|desventaja]]. Los rasgos como Alerta suman a esta tirada. Ver [[dnd-acciones|acciones en combate]].' },
    { id: 'dnd-ataque', title: 'Ataques y daño', aka: ['Tirada de ataque', 'Crítico', 'Golpe crítico'], summary: 'd20 + modificador + competencia contra la CA; si impactas, tiras el daño.',
      narr: 'El choque del acero, la flecha que silba o el rayo que sale de la mano del mago.',
      mech: list(['**Cuerpo a cuerpo**: FUE (o DES con armas sutiles). **A distancia**: DES.', 'Suma tu [[dnd-competencia|bonificador de competencia]] si eres competente con el arma.', 'Impactas si igualas o superas la [[dnd-clase-armadura|CA]].', '**Daño**: el dado del arma + el mismo modificador de característica.', '**Crítico** (20 natural): tiras el doble de dados de daño; el modificador se suma una vez.']) + '\n\nAtacar a distancia teniendo a un enemigo al lado da [[dnd-ventaja|desventaja]].' },
    { id: 'dnd-oportunidad', title: 'Ataque de oportunidad', summary: 'Una reacción para golpear a quien sale de tu alcance.',
      narr: 'Huir de un luchador entrenado tiene un precio: te deja la espalda al descubierto.',
      mech: 'Cuando una criatura que ves sale de tu alcance, puedes usar tu reacción para hacerle un ataque cuerpo a cuerpo. No se provoca si se teletransporta, si la mueven sin su voluntad o si usa la acción **Destrabarse**.' },
    { id: 'dnd-cobertura', title: 'Cobertura', summary: 'Estar parapetado sube la CA y las salvaciones de Destreza.',
      narr: 'Un muro bajo, una columna o el cuerpo de otro combatiente se interponen entre tú y el golpe.',
      mech: list(['**Media cobertura**: +2 a la CA y a las salvaciones de DES.', '**Tres cuartos**: +5.', '**Cobertura total**: no se te puede apuntar directamente.']) },
    { id: 'dnd-salvaciones-muerte', title: '0 PG y salvaciones contra muerte', aka: ['Moribundo', 'Estabilizar', 'Muerte instantánea'], summary: 'A 0 puntos de golpe quedas inconsciente y tiras para no morir.',
      narr: 'Caer no es morir: hay unos segundos en los que la vida pende de un hilo y los compañeros pueden salvarte.',
      mech: 'A 0 PG quedas [[dnd-estado-inconsciente|inconsciente]]. Al empezar cada turno tiras 1d20 sin modificadores:\n\n' + list(['**10 o más**: un éxito. Con tres éxitos te estabilizas.', '**9 o menos**: un fallo. Con tres fallos mueres.', '**20 natural**: recuperas 1 PG.', '**1 natural**: cuenta como dos fallos.', 'Recibir daño a 0 PG es un fallo (dos si es un crítico).', 'Si el daño que sobra al caer a 0 iguala o supera tus PG máximos, mueres al instante.']) + '\n\nCualquier curación te despierta. Una prueba de Medicina CD 10 te estabiliza.' },
    { id: 'dnd-pg-temporales', title: 'Puntos de golpe temporales', summary: 'Un colchón de PG que se pierde antes que los reales.',
      narr: 'Valor, magia o pura adrenalina que te protegen un rato.',
      mech: 'El daño se resta primero de los PG temporales. No se suman entre sí: si recibes más, eliges quedarte con los que tenías o con los nuevos. Desaparecen tras un [[dnd-descansos|descanso largo]] si el efecto no dice otra cosa.' },
    { id: 'dnd-resistencia', title: 'Resistencia, vulnerabilidad e inmunidad', summary: 'Algunos tipos de daño se reducen a la mitad, se duplican o no afectan.',
      narr: 'El dragón rojo se ríe del fuego; el esqueleto se rompe con un martillo.',
      mech: list(['**Resistencia**: recibes la mitad de ese tipo de daño.', '**Vulnerabilidad**: recibes el doble.', '**Inmunidad**: no recibes daño de ese tipo.']) + '\n\nTipos de daño: contundente, cortante, perforante, ácido, frío, fuego, fuerza, necrótico, psíquico, radiante, relámpago, trueno y veneno.' },
    { id: 'dnd-dos-armas', title: 'Combate con dos armas', aka: ['Arma ligera'], summary: 'Atacar con un arma ligera en cada mano.',
      narr: 'Una daga en cada mano y golpes que no dan respiro.',
      mech: 'Cuando haces la acción de Atacar con un arma **ligera**, puedes usar tu acción adicional para atacar con otra arma ligera que lleves en la otra mano. A ese segundo daño no le sumas tu modificador de característica (salvo que sea negativo). La [[dnd-maestria|maestría]] Mellar permite hacer ese ataque sin gastar la acción adicional.' },
    { id: 'dnd-maestria', title: 'Maestría con armas', aka: ['Derribar', 'Empujar', 'Hendir', 'Mellar', 'Molestar', 'Rozar', 'Ralentizar', 'Socavar'], summary: 'Cada arma tiene una propiedad especial que usan quienes la dominan.',
      narr: 'Un guerrero no solo golpea: sabe derribar con el martillo, empujar con el escudo o cortar dos cuellos de un tajo.',
      mech: 'Si un rasgo te da la maestría con un tipo de arma, usas su propiedad:\n\n' + list(['**Derribar**: al impactar, el objetivo salva CON o queda [[dnd-estado-derribado|derribado]].', '**Empujar**: al impactar, lo apartas hasta 10 pies.', '**Hendir**: al impactar, puedes atacar a otra criatura a tu alcance (una vez por turno, sin modificador al daño).', '**Mellar**: el ataque extra del arma ligera se hace dentro de la acción de Atacar.', '**Molestar**: al impactar, tienes ventaja en tu siguiente ataque contra ese objetivo.', '**Rozar**: si fallas, haces igualmente el daño de tu modificador de característica.', '**Ralentizar**: al impactar, su velocidad baja 10 pies hasta tu siguiente turno.', '**Socavar**: al impactar, tiene desventaja en su siguiente ataque.']) + '\n\nLos nombres son traducciones propias.' }
  ];

  const MAGIC = [
    { id: 'dnd-espacios', title: 'Espacios de conjuro', aka: ['Nivel de conjuro', 'Lanzar a nivel superior'], summary: 'La energía mágica que gastas para lanzar conjuros de nivel 1 o más.',
      narr: 'Cada lanzador tiene un límite de magia antes de agotarse; un descanso le devuelve las fuerzas.',
      mech: 'Lanzar un conjuro gasta un espacio de su nivel o superior. Si usas un espacio más alto, muchos conjuros mejoran. Los espacios se recuperan con un [[dnd-descansos|descanso largo]] (los brujos, con uno corto). NEXO calcula los espacios por clase y nivel en la ficha.' },
    { id: 'dnd-trucos', title: 'Trucos', summary: 'Conjuros de nivel 0 que se lanzan sin gastar espacios.',
      narr: 'Una chispa, una luz, un susurro: magia tan practicada que sale sola.',
      mech: 'Se lanzan a voluntad. Muchos trucos de daño mejoran a niveles 5, 11 y 17 del personaje.' },
    { id: 'dnd-concentracion', title: 'Concentración', summary: 'Algunos conjuros duran mientras mantengas la mente en ellos.',
      narr: 'Sostener un hechizo mientras las espadas silban a tu alrededor exige temple.',
      mech: 'Solo puedes concentrarte en un conjuro a la vez. Al recibir daño haces una [[dnd-salvaciones|salvación]] de CON con CD 10 o la mitad del daño, si es mayor (máximo 30); si fallas, el conjuro termina. También termina si quedas [[dnd-estado-incapacitado|incapacitado]].' },
    { id: 'dnd-componentes', title: 'Componentes', aka: ['Verbal', 'Somático', 'Material', 'Canalizador'], summary: 'Palabras, gestos y materiales que pide cada conjuro.',
      narr: 'La magia se pronuncia, se dibuja en el aire o se ofrece en forma de objeto.',
      mech: list(['**V (verbal)**: hay que poder hablar.', '**S (somático)**: hace falta una mano libre.', '**M (material)**: un objeto concreto; si no tiene coste, sirve un canalizador mágico (varita, símbolo sagrado, instrumento…). Si tiene coste o se consume, hay que tenerlo.']) },
    { id: 'dnd-rituales', title: 'Rituales', summary: 'Lanzar ciertos conjuros sin gastar espacio, a cambio de 10 minutos más.',
      narr: 'Con calma y ceremonia, algunos hechizos no cuestan energía.',
      mech: 'Un conjuro con la etiqueta de ritual se puede lanzar tardando 10 minutos más sin gastar espacio, si tu clase lo permite y lo tienes preparado.' },
    { id: 'dnd-un-conjuro-turno', title: 'Un conjuro con espacio por turno', summary: 'En un mismo turno solo gastas un espacio de conjuro.',
      narr: 'Ni el archimago más rápido encadena dos grandes hechizos a la vez.',
      mech: 'Solo puedes gastar un espacio de conjuro por turno. Puedes combinarlo con trucos u objetos mágicos que no gasten espacios.' },
    { id: 'dnd-cd-conjuros', title: 'CD y ataque de conjuro', summary: 'Los números que usa tu magia contra los demás.',
      narr: 'Cuanto más dominas tu característica mágica, más difícil es resistirse.',
      mech: list(['**CD de salvación** = 8 + modificador de la característica de conjuros + bonificador de competencia.', '**Ataque de conjuro** = modificador de la característica + bonificador de competencia.']) + '\n\nLa característica depende de la clase: INT para magos, SAB para clérigos, druidas y exploradores, CAR para bardos, brujos, hechiceros y paladines.' }
  ];

  const CONDITIONS = [
    ['agarrado', 'Agarrado', 'Alguien te sujeta.', list(['Velocidad 0.', 'Desventaja en ataques contra cualquiera que no sea quien te agarra.', 'Quien te agarra puede moverte con él (le cuesta movimiento extra).', 'Te liberas con una acción: prueba de Atletismo o Acrobacias contra la CD del agarre (8 + FUE + competencia del que agarra).'])],
    ['apresado', 'Apresado', 'Redes, cadenas o raíces te inmovilizan.', list(['Velocidad 0.', 'Los ataques contra ti tienen ventaja y los tuyos, desventaja.', 'Desventaja en salvaciones de DES.'])],
    ['asustado', 'Asustado', 'El miedo te paraliza ante su origen.', list(['Desventaja en pruebas y ataques mientras veas la fuente del miedo.', 'No puedes acercarte a ella voluntariamente.'])],
    ['aturdido', 'Aturdido', 'Un golpe o un poder te deja aturdido.', list(['Estás [[dnd-estado-incapacitado|incapacitado]].', 'Fallas las salvaciones de FUE y DES.', 'Los ataques contra ti tienen ventaja.'])],
    ['cegado', 'Cegado', 'No ves nada.', list(['Fallas las pruebas que dependan de la vista.', 'Los ataques contra ti tienen ventaja y los tuyos, desventaja.'])],
    ['derribado', 'Derribado', 'Estás en el suelo.', list(['Solo te arrastras, o gastas la mitad de tu velocidad en levantarte.', 'Desventaja en tus ataques.', 'Los ataques contra ti a 5 pies tienen ventaja; desde más lejos, desventaja.'])],
    ['ensordecido', 'Ensordecido', 'No oyes nada.', 'Fallas las pruebas que dependan del oído.'],
    ['envenenado', 'Envenenado', 'El veneno te debilita.', 'Desventaja en tiradas de ataque y pruebas de característica.'],
    ['hechizado', 'Hechizado', 'Una magia te hace ver a alguien como amigo.', list(['No puedes atacar ni dañar a quien te hechiza.', 'Tiene ventaja en sus pruebas sociales contigo.'])],
    ['incapacitado', 'Incapacitado', 'No puedes actuar.', list(['Sin acciones, acciones adicionales ni reacciones.', 'Pierdes la [[dnd-concentracion|concentración]] y no puedes hablar.', 'Si tiras iniciativa, la tiras con desventaja.'])],
    ['inconsciente', 'Inconsciente', 'Has perdido el sentido.', list(['Estás [[dnd-estado-incapacitado|incapacitado]] y [[dnd-estado-derribado|derribado]], y sueltas lo que llevas.', 'Velocidad 0 y fallas las salvaciones de FUE y DES.', 'Los ataques contra ti tienen ventaja; los que impactan a 5 pies son críticos.'])],
    ['invisible', 'Invisible', 'Nadie te ve.', list(['Ventaja en la iniciativa.', 'Los ataques contra ti tienen desventaja y los tuyos, ventaja, salvo contra quien pueda verte.'])],
    ['paralizado', 'Paralizado', 'Tu cuerpo no responde.', list(['Estás [[dnd-estado-incapacitado|incapacitado]] y tu velocidad es 0.', 'Fallas las salvaciones de FUE y DES.', 'Los ataques contra ti tienen ventaja; los que impactan a 5 pies son críticos.'])],
    ['petrificado', 'Petrificado', 'Te has convertido en piedra.', list(['Estás [[dnd-estado-incapacitado|incapacitado]], velocidad 0, y fallas las salvaciones de FUE y DES.', 'Los ataques contra ti tienen ventaja.', 'Resistencia a todo el daño e inmunidad al veneno.'])],
    ['agotamiento', 'Agotamiento', 'Hambre, frío, marchas forzadas o magia oscura te desgastan.', list(['Se acumula en niveles del 1 al 6.', 'Cada nivel resta 2 a todas tus pruebas d20 y 5 pies a tu velocidad.', 'Con 6 niveles mueres.', 'Un [[dnd-descansos|descanso largo]] quita un nivel.'])]
  ].map(([k, title, narr, mech]) => ({ id: `dnd-estado-${k}`, title, summary: narr, narr, mech }));

  const EQUIPMENT = [
    { id: 'dnd-armaduras', title: 'Armaduras y escudos', summary: 'Ligeras, intermedias y pesadas, con su CA.',
      narr: 'Del jubón acolchado del explorador a la armadura de placas del paladín.',
      mech: '**Ligeras** (CA + todo DES): acolchada 11, cuero 11, cuero tachonado 12.\n\n**Intermedias** (CA + DES hasta +2): pieles 12, camisote de mallas 13, cota de escamas 14, coraza 14, media armadura 15.\n\n**Pesadas** (sin DES): cota de anillas 14, cota de mallas 16 (FUE 13), armadura de bandas 17 y de placas 18 (FUE 15).\n\n**Escudo**: +2.\n\nSin competencia en la armadura tienes desventaja en pruebas y ataques de FUE y DES y no puedes lanzar conjuros. Algunas dan desventaja en Sigilo. Ver [[dnd-clase-armadura|Clase de Armadura]].' },
    { id: 'dnd-propiedades-armas', title: 'Propiedades de las armas', aka: ['Sutil', 'Ligera', 'Pesada', 'Versátil', 'Arrojadiza', 'A dos manos', 'Alcance', 'Munición', 'Recarga'], summary: 'Lo que hace especial a cada arma.',
      mech: list(['**Sutil**: usas FUE o DES, la que prefieras.', '**Ligera**: permite el [[dnd-dos-armas|combate con dos armas]].', '**Pesada**: desventaja si tu FUE (cuerpo a cuerpo) o DES (distancia) es menor de 13.', '**Versátil**: a dos manos hace más daño.', '**Arrojadiza**: se lanza usando la misma característica.', '**A dos manos**: necesita ambas manos.', '**Alcance**: llega 5 pies más lejos.', '**Munición** y **alcance de disparo**: más allá del alcance normal, desventaja.', '**Recarga**: un solo disparo por acción, ataque adicional o reacción.']) + '\n\nCada arma tiene además su [[dnd-maestria|maestría]].' },
    { id: 'dnd-monedas', title: 'Monedas', aka: ['po', 'pp', 'pc', 'pe', 'ppt'], summary: 'Cobre, plata, electro, oro y platino.',
      narr: 'El oro abre puertas, pero el pan se paga en cobre.',
      mech: list(['10 piezas de cobre (pc) = 1 pieza de plata (pp).', '10 pp = 1 pieza de oro (po).', '1 pieza de electro (pe) = 5 pp.', '1 pieza de platino (ppt) = 10 po.', '50 monedas pesan una libra.']) }
  ];

  window.NEXO_MANUALS = window.NEXO_MANUALS || {};
  window.NEXO_MANUALS.dndReglas = [
    { id: 'dnd-cap-combate', title: 'Combate', intro: 'Iniciativa, ataques, cobertura, caer a 0 PG y maestría con armas.', entries: COMBAT },
    { id: 'dnd-cap-magia', title: 'Magia', intro: 'Espacios, trucos, concentración, componentes y rituales.', entries: MAGIC },
    { id: 'dnd-cap-estados', title: 'Estados', intro: 'Lo que significa estar derribado, asustado, agarrado o inconsciente.', entries: CONDITIONS },
    { id: 'dnd-cap-equipo', title: 'Equipo', intro: 'Armaduras, armas y monedas.', entries: EQUIPMENT }
  ];
})();
