/*
 * NEXO · Pathfinder 2ª edición (Remaster: Player Core 1 y 2).
 * Creador de personajes y subida de nivel (1 a 20): ascendencia y herencia, bagaje, clase, mejoras de
 * atributo, habilidades, idiomas y hoja calculada. La progresión de cada clase está en
 * pathfinder-progresion.js. Los textos son resúmenes propios.
 */
(() => {
  const KEY = 'nexo-pathfinder-v1';
  const GAME = 'pathfinder';
  const MAX_LEVEL = 20;
  const FREE_BOOSTS = 4;
  // Subir de nivel: cuatro mejoras de atributo en estos niveles y dotes generales y de ascendencia en estos otros.
  const BOOST_LEVELS = [5, 10, 15, 20];
  const LEVEL_BOOSTS = 4;
  const GENERAL_FEATS = [3, 7, 11, 15, 19];
  const ANCESTRY_FEATS = [5, 9, 13, 17];
  const SAVES = { fort: 'Fortaleza', ref: 'Reflejos', vol: 'Voluntad' };
  const TRACKS = { perc: 'Percepción', fort: 'Fortaleza', ref: 'Reflejos', vol: 'Voluntad', weapon: 'Armas', armor: 'Defensa, con armadura y sin ella', dc: 'CD de clase', spell: 'Conjuros, ataque y CD' };

  const ATTRS = [['fue', 'Fuerza', 'FUE'], ['des', 'Destreza', 'DES'], ['con', 'Constitución', 'CON'], ['int', 'Inteligencia', 'INT'], ['sab', 'Sabiduría', 'SAB'], ['car', 'Carisma', 'CAR']];
  const ATTR = Object.fromEntries(ATTRS.map(([k, name, short]) => [k, { name, short }]));
  const ALL = ATTRS.map(([k]) => k);
  const RANKS = ['No entrenado', 'Entrenado', 'Experto', 'Maestro', 'Legendario'];
  const RANK_SHORT = ['N', 'E', 'X', 'M', 'L'];

  const SKILLS = {
    acrobacias: ['Acrobacias', 'des'], arcanos: ['Arcanos', 'int'], artesania: ['Artesanía', 'int'], atletismo: ['Atletismo', 'fue'],
    diplomacia: ['Diplomacia', 'car'], engano: ['Engaño', 'car'], interpretacion: ['Interpretación', 'car'], intimidacion: ['Intimidación', 'car'],
    latrocinio: ['Latrocinio', 'des'], medicina: ['Medicina', 'sab'], naturaleza: ['Naturaleza', 'sab'], ocultismo: ['Ocultismo', 'int'],
    religion: ['Religión', 'sab'], sigilo: ['Sigilo', 'des'], sociedad: ['Sociedad', 'int'], supervivencia: ['Supervivencia', 'sab']
  };
  const SKILL_KEYS = Object.keys(SKILLS);

  // Herencias versátiles que cualquier ascendencia puede tomar.
  const VERSATILE = ['Changeling (herencia versátil)', 'Nefilim (herencia versátil)'];
  const ANCESTRIES = {
    enano: { name: 'Enano', hp: 10, size: 'Mediano', speed: 20, boosts: ['con', 'sab'], free: 1, flaw: 'car', vision: 'Visión en la oscuridad', langs: ['Común', 'Enano'], heritages: ['Enano de sangre antigua', 'Enano de la forja', 'Enano de las rocas', 'Enano guardián de la muerte', 'Enano de sangre fuerte'], text: 'Pueblo de las montañas, tenaz y orgulloso de sus clanes, su artesanía y su memoria larga.' },
    elfo: { name: 'Elfo', hp: 6, size: 'Mediano', speed: 30, boosts: ['des', 'int'], free: 1, flaw: 'con', vision: 'Visión en penumbra', langs: ['Común', 'Élfico'], heritages: ['Elfo ártico', 'Elfo de las cavernas', 'Elfo vidente', 'Elfo de los bosques', 'Elfo longevo'], text: 'Longevos y ágiles, cambian poco a poco para parecerse a la tierra donde viven.' },
    gnomo: { name: 'Gnomo', hp: 8, size: 'Pequeño', speed: 25, boosts: ['con', 'car'], free: 1, flaw: 'fue', vision: 'Visión en penumbra', langs: ['Común', 'Gnomo', 'Feérico'], heritages: ['Gnomo camaleónico', 'Gnomo tocado por las hadas', 'Gnomo sensitivo', 'Gnomo umbral', 'Gnomo manantial'], text: 'Llegados del Primer Mundo, necesitan experiencias nuevas para no apagarse.' },
    goblin: { name: 'Goblin', hp: 6, size: 'Pequeño', speed: 25, boosts: ['des', 'car'], free: 1, flaw: 'sab', vision: 'Visión en la oscuridad', langs: ['Común', 'Goblin'], heritages: ['Goblin piel tiznada', 'Goblin tripas de hierro', 'Goblin dientes de sierra', 'Goblin de las nieves', 'Goblin irrompible'], text: 'Inquietos, ingeniosos y caóticos, se ganan poco a poco un sitio en las ciudades.' },
    humano: { name: 'Humano', hp: 8, size: 'Mediano', speed: 25, boosts: [], free: 2, flaw: '', vision: 'Visión normal', langs: ['Común'], extraLang: 1, heritages: ['Humano habilidoso', 'Humano versátil', 'Aiuvarin (ascendencia élfica)', 'Dromaar (ascendencia orca)'], text: 'La ascendencia más numerosa y variada del Mar Interior, capaz de destacar en cualquier cosa.' },
    leshy: { name: 'Leshy', hp: 8, size: 'Pequeño', speed: 25, boosts: ['con', 'sab'], free: 1, flaw: 'int', vision: 'Visión en penumbra', langs: ['Común', 'Feérico'], heritages: ['Leshy cactus', 'Leshy fruto', 'Leshy hongo', 'Leshy calabaza', 'Leshy hoja', 'Leshy loto', 'Leshy raíz', 'Leshy enredadera'], text: 'Espíritus de la naturaleza con cuerpo de planta, curiosos por el mundo que guardan.' },
    mediano: { name: 'Mediano', hp: 6, size: 'Pequeño', speed: 25, boosts: ['des', 'sab'], free: 1, flaw: 'fue', vision: 'Visión normal y ojos agudos', langs: ['Común', 'Mediano'], heritages: ['Mediano valeroso', 'Mediano de las colinas', 'Mediano gafe', 'Mediano nómada', 'Mediano del crepúsculo', 'Mediano del bosque salvaje'], text: 'Optimistas y adaptables, con suerte para salir de líos y buen ojo para los detalles.' },
    orco: { name: 'Orco', hp: 10, size: 'Mediano', speed: 25, boosts: [], free: 2, flaw: '', vision: 'Visión en la oscuridad', langs: ['Común', 'Orco'], heritages: ['Orco de las tierras baldías', 'Orco curtido en batalla', 'Orco de las profundidades', 'Orco de las tumbas', 'Orco de cicatrices rituales', 'Orco de la lluvia', 'Orco del invierno'], text: 'Fuertes y resistentes, valoran la honra ganada y llevan sus cicatrices con orgullo.' }
  };

  // Bagajes: dos atributos (una mejora va a uno de ellos), habilidad, Saber y dote de habilidad.
  const BACKGROUNDS = {
    acolito: { name: 'Acólito', attrs: ['int', 'sab'], skill: 'religion', lore: 'Escrituras', feat: 'Estudiante del canon', text: 'Creciste en un templo o monasterio, entre rezos y textos sagrados.' },
    acrobata: { name: 'Acróbata', attrs: ['fue', 'des'], skill: 'acrobacias', lore: 'Circo', feat: 'Equilibrio firme', text: 'Actuabas en un circo o en las calles, haciendo piruetas imposibles.' },
    ambulante: { name: 'Artista ambulante', attrs: ['des', 'car'], skill: 'interpretacion', lore: 'Teatro', feat: 'Interpretación fascinante', text: 'Ibas de plaza en plaza con tu número, viviendo del aplauso.' },
    artesano: { name: 'Artesano', attrs: ['fue', 'int'], skill: 'artesania', lore: 'Gremios', feat: 'Artesanía especializada', text: 'Fuiste aprendiz en un taller y conoces bien tu oficio.' },
    artista: { name: 'Artista', attrs: ['des', 'car'], skill: 'artesania', lore: 'Arte', feat: 'Artesanía especializada', text: 'Pintor, escultor o escritor en busca de la obra que te haga inmortal.' },
    cazador: { name: 'Cazador', attrs: ['des', 'sab'], skill: 'supervivencia', lore: 'Curtido de pieles', feat: 'Observar la fauna', text: 'Vivías de lo que cazabas y sabes leer las huellas del monte.' },
    criminal: { name: 'Criminal', attrs: ['des', 'int'], skill: 'sigilo', lore: 'Bajos fondos', feat: 'Contrabandista experimentado', text: 'Te ganabas la vida al margen de la ley, y quizá aún te buscan.' },
    detective: { name: 'Detective', attrs: ['int', 'sab'], skill: 'sociedad', lore: 'Bajos fondos', feat: 'Conocedor de las calles', text: 'Resolvías misterios para la guardia o para quien pagara.' },
    emisario: { name: 'Emisario', attrs: ['int', 'car'], skill: 'sociedad', lore: 'Una ciudad', feat: 'Multilingüe', text: 'Llevabas mensajes y tratos entre gentes que no se entendían.' },
    ermitano: { name: 'Ermitaño', attrs: ['con', 'int'], skill: ['naturaleza', 'ocultismo'], lore: 'Un terreno', feat: 'Conocimiento dudoso', text: 'Viviste apartado del mundo, a solas con tus pensamientos y tus visiones.' },
    erudito: { name: 'Erudito', attrs: ['int', 'sab'], skill: ['arcanos', 'naturaleza', 'ocultismo', 'religion'], lore: 'Académico', feat: 'Garantía', text: 'Estudiaste en una academia o biblioteca y sabes dónde buscar respuestas.' },
    gladiador: { name: 'Gladiador', attrs: ['fue', 'car'], skill: 'interpretacion', lore: 'Gladiadores', feat: 'Interpretación impresionante', text: 'Luchabas en la arena para deleite del público.' },
    granja: { name: 'Peón de granja', attrs: ['con', 'sab'], skill: 'atletismo', lore: 'Agricultura', feat: 'Garantía (Atletismo)', text: 'Trabajaste la tierra de sol a sol antes de echarte al camino.' },
    guardia: { name: 'Guardia', attrs: ['fue', 'car'], skill: 'intimidacion', lore: 'Leyes', feat: 'Coacción rápida', text: 'Vigilabas murallas y calles, y sabes imponer respeto.' },
    guerrero: { name: 'Guerrero', attrs: ['fue', 'con'], skill: 'intimidacion', lore: 'Guerra', feat: 'Mirada intimidante', text: 'Serviste en un ejército o una compañía de mercenarios.' },
    herbolario: { name: 'Herbolario', attrs: ['con', 'sab'], skill: 'medicina', lore: 'Herboristería', feat: 'Medicina natural', text: 'Preparabas remedios con plantas y conoces sus secretos.' },
    jornalero: { name: 'Jornalero', attrs: ['fue', 'con'], skill: 'atletismo', lore: 'Trabajo', feat: 'Cargador fornido', text: 'Cargabas y descargabas en muelles, minas u obras.' },
    marinero: { name: 'Marinero', attrs: ['fue', 'des'], skill: 'atletismo', lore: 'Navegación', feat: 'Merodeador submarino', text: 'Navegaste por el Mar Interior y conoces cada puerto.' },
    medico: { name: 'Médico de campaña', attrs: ['con', 'sab'], skill: 'medicina', lore: 'Guerra', feat: 'Medicina de combate', text: 'Curabas heridas en el campo de batalla, bajo las flechas.' },
    mercader: { name: 'Mercader', attrs: ['int', 'car'], skill: 'diplomacia', lore: 'Comercio', feat: 'Cazador de gangas', text: 'Comprabas barato y vendías caro en mercados y caravanas.' },
    noble: { name: 'Noble', attrs: ['int', 'car'], skill: 'sociedad', lore: 'Genealogía', feat: 'Elegancia cortesana', text: 'Naciste entre privilegios, intrigas y bailes de salón.' },
    nomada: { name: 'Nómada', attrs: ['con', 'sab'], skill: 'supervivencia', lore: 'Un terreno', feat: 'Garantía (Supervivencia)', text: 'Tu pueblo nunca se quedaba mucho tiempo en el mismo sitio.' },
    pilluelo: { name: 'Pilluelo', attrs: ['des', 'con'], skill: 'latrocinio', lore: 'Tu ciudad', feat: 'Carterista', text: 'Creciste en la calle, robando para comer.' },
    propio: { name: 'Bagaje propio', attrs: ALL, skill: SKILL_KEYS, lore: '', feat: '', text: 'Pacta con quien dirija la partida un bagaje que no esté en la lista: dos mejoras, una habilidad, un Saber y una dote de habilidad.' }
  };

  // Clases: atributo clave, PG por nivel, rangos iniciales (1 entrenado, 2 experto), habilidades fijas,
  // habilidades a elegir antes de sumar INT (ya incluyen la que da la subclase), armadura y conjuros.
  const CLASSES = {
    alquimista: { name: 'Alquimista', key: ['int'], hp: 8, perc: 1, fort: 2, ref: 2, vol: 1, skills: ['artesania'], free: 4, armor: 2, weapon: 1, sub: 'Campo de investigación: bombardero, químico, mutagenista o toxicólogo', text: 'Crea bombas, elixires y venenos con reactivos que prepara cada día.' },
    barbaro: { name: 'Bárbaro', key: ['fue'], hp: 12, perc: 2, fort: 2, ref: 1, vol: 2, skills: ['atletismo'], free: 3, armor: 2, weapon: 1, sub: 'Instinto: animal, dragón, furia, gigante, espíritu o superstición', text: 'Entra en furia para golpear más fuerte y aguantar más castigo.' },
    bardo: { name: 'Bardo', key: ['car'], hp: 8, perc: 2, fort: 1, ref: 1, vol: 2, skills: ['ocultismo', 'interpretacion'], free: 4, armor: 1, weapon: 1, spells: 'Ocultismo', sub: 'Musa: enigma, maestra, polifacética o guerrera', text: 'Su arte es magia ocultista que inspira a sus aliados y confunde a sus enemigos.' },
    bruja: { name: 'Bruja', key: ['int'], hp: 6, perc: 1, fort: 1, ref: 1, vol: 2, skills: [], free: 4, armor: 0, weapon: 1, spells: 'Según el patrón', sub: 'Patrón y familiar', text: 'Un patrón misterioso le concede magia a través de su familiar.' },
    campeon: { name: 'Campeón', key: ['fue', 'des'], hp: 10, perc: 1, fort: 2, ref: 1, vol: 2, skills: ['religion'], free: 3, armor: 3, weapon: 1, sub: 'Causa y dios (santo o profano)', text: 'Guerrero sagrado que protege a sus aliados en nombre de su dios.' },
    clerigo: { name: 'Clérigo', key: ['sab'], hp: 8, perc: 1, fort: 1, ref: 1, vol: 2, skills: ['religion'], free: 3, armor: 0, weapon: 1, spells: 'Divina', sub: 'Dios, dominios y fuente divina: curar o dañar', text: 'Canaliza el poder de su dios para curar, proteger o castigar.' },
    druida: { name: 'Druida', key: ['sab'], hp: 8, perc: 1, fort: 1, ref: 1, vol: 2, skills: ['naturaleza'], free: 3, armor: 2, weapon: 1, spells: 'Primigenia', sub: 'Orden: animal, llama, hoja, tormenta o indómita', text: 'Guardián de la naturaleza que lanza magia primigenia.' },
    espadachin: { name: 'Espadachín', key: ['des'], hp: 10, perc: 2, fort: 1, ref: 2, vol: 2, skills: ['acrobacias'], free: 5, armor: 1, weapon: 1, sub: 'Estilo: bailarín de batalla, fanfarrón, esgrimista, gimnasta o ingenioso', text: 'Luchador vistoso que gana brío con sus fintas y acrobacias.' },
    explorador: { name: 'Explorador', key: ['fue', 'des'], hp: 10, perc: 2, fort: 2, ref: 2, vol: 1, skills: ['naturaleza', 'supervivencia'], free: 4, armor: 2, weapon: 1, sub: 'Ventaja del cazador: ráfaga, precisión o astucia', text: 'Rastreador que marca a su presa y la persigue sin descanso.' },
    guerrero: { name: 'Guerrero', key: ['fue', 'des'], hp: 10, perc: 2, fort: 2, ref: 2, vol: 1, skills: [], free: 4, armor: 3, weapon: 2, sub: 'Sin subclase: elige Acrobacias o Atletismo entre tus habilidades', text: 'Maestro de las armas y las armaduras, el mejor en el combate directo.' },
    hechicero: { name: 'Hechicero', key: ['car'], hp: 6, perc: 1, fort: 1, ref: 1, vol: 2, skills: [], free: 4, armor: 0, weapon: 1, spells: 'Según el linaje', sub: 'Linaje (sus dos habilidades van entre las elegidas)', text: 'La magia le corre por la sangre, herencia de un ser poderoso.' },
    investigador: { name: 'Investigador', key: ['int'], hp: 8, perc: 2, fort: 1, ref: 2, vol: 2, skills: ['sociedad'], free: 5, armor: 1, weapon: 1, sub: 'Metodología: alquímica, forense, empírica o interrogatorio', text: 'Resuelve misterios y prevé los golpes antes de darlos.' },
    mago: { name: 'Mago', key: ['int'], hp: 6, perc: 1, fort: 1, ref: 1, vol: 2, skills: ['arcanos'], free: 2, armor: 0, weapon: 1, spells: 'Arcana', sub: 'Escuela arcana y tesis arcana', text: 'Estudioso de la magia arcana, que prepara sus conjuros desde su libro.' },
    monje: { name: 'Monje', key: ['fue', 'des'], hp: 10, perc: 1, fort: 2, ref: 2, vol: 2, skills: [], free: 4, armor: 0, unarmored: 2, weapon: 1, sub: 'Sin subclase: elige posturas y dotes de ki', text: 'Lucha con el cuerpo como arma y se mueve más rápido que nadie.' },
    oraculo: { name: 'Oráculo', key: ['car'], hp: 8, perc: 1, fort: 1, ref: 1, vol: 2, skills: ['religion'], free: 4, armor: 1, weapon: 1, spells: 'Divina', sub: 'Misterio y su maldición', text: 'Toca un misterio divino que le da poder a cambio de una maldición.' },
    picaro: { name: 'Pícaro', key: ['des', 'fue', 'int', 'car'], hp: 8, perc: 2, fort: 1, ref: 2, vol: 2, skills: ['sigilo'], free: 8, armor: 1, weapon: 1, sub: 'Truhanería: matón (FUE), ladrón, sinvergüenza (CAR) o cerebro (INT); por defecto DES', text: 'Experto en mil habilidades que golpea donde más duele.' }
  };
  // Progresión del nivel 2 al 20 (datos en pathfinder-progresion.js).
  Object.entries(window.NEXO_PF_PROGRESSION?.classes || {}).forEach(([k, p]) => { if (CLASSES[k]) Object.assign(CLASSES[k], p); });
  const ARMORS = {
    sin: { name: 'Sin armadura', cat: 0, ac: 0, cap: null },
    acolchada: { name: 'Armadura acolchada', cat: 1, ac: 1, cap: 3 }, cuero: { name: 'Armadura de cuero', cat: 1, ac: 1, cap: 4 },
    tachonado: { name: 'Cuero tachonado', cat: 1, ac: 2, cap: 3 }, cadenas: { name: 'Camisa de cadenas', cat: 1, ac: 2, cap: 3 },
    pieles: { name: 'Armadura de pieles', cat: 2, ac: 3, cap: 2 }, escamas: { name: 'Cota de escamas', cat: 2, ac: 3, cap: 2 },
    mallas: { name: 'Cota de mallas', cat: 2, ac: 4, cap: 1 }, coraza: { name: 'Coraza', cat: 2, ac: 4, cap: 1 },
    bandas: { name: 'Armadura de bandas', cat: 3, ac: 5, cap: 1 }, placas: { name: 'Armadura completa', cat: 3, ac: 6, cap: 0 }
  };
  const LANGS = ['Dracónico', 'Enano', 'Élfico', 'Feérico', 'Gnomo', 'Goblin', 'Jotun', 'Mediano', 'Orco', 'Sakvroth'];
  const ARMOR_CATS = ['sin armadura', 'ligera', 'media', 'pesada'];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  let host = null;
  let store = load();
  let current = null;
  let exitHandler = null;
  let saveTimer = 0;
  let manualBook = null;
  const lvOpen = new Map();   // niveles de la progresión que se han abierto o cerrado a mano

  // Apartados: Personajes, Campañas y Manual (src/nexo/apartados.js y src/pathfinder/pathfinder-manual.js).
  // Tarjeta de una ficha, propia o recibida de otro jugador: nombre, resumen e iniciativa.
  const cardOf = ch => ({ id: ch.id, name: ch.name || 'Aventurero sin nombre', summary: describe(ch), init: cls(ch) ? bonus(ch, 'sab', 'perc') : 0 });
  const ap = window.NEXO_APARTADOS?.create({
    prefix: 'pf', system: () => GAME, home: true, frame: body => frame(body),
    leave: () => { flushSave(); current = null; }, renderCharacters: () => renderList(),
    characters: () => store.characters.map(cardOf),
    // Campaña compartida (src/nexo/grupo.js): la ficha que se deja ver y cómo se lee la de otro jugador.
    shared: { raw: id => store.characters.find(ch => ch.id === id) || null, card: ch => ({ ...cardOf(ch), play: juego?.brief(ch) || '' }), accept: raw => window.NEXO_FICHA.accept(GAME, raw), view: (ch, opts) => kit?.view(ch, opts) },
    openCharacter: id => { const ch = store.characters.find(item => item.id === id); if (ch) openEditor(ch); else renderList(); },
    currentId: () => current?.id,
    manual: () => manualBook || (manualBook = window.NEXO_MANUALS?.pathfinder?.({ ATTR, RANKS, SKILLS, ANCESTRIES, BACKGROUNDS, CLASSES }) || null),
    words: { campaigns: 'Tus campañas', characters: 'aventureros', character: 'aventurero' }
  });
  const manualLink = (id, label) => ap?.link(id, label) || '';
  // Nombre de un rasgo que, al tocarlo, asoma su regla del manual.
  const term = (id, text) => ap?.term(id, text) || esc(text);

  // Exportar, importar e imprimir la ficha (src/nexo/ficha.js).
  const kit = window.NEXO_FICHA?.create({
    prefix: 'pf', system: GAME, label: 'Pathfinder',
    current: () => current, sheet: ch => sheetData(ch), template: newCharacter, before: () => flushSave(), flash: text => flash(text),
    accept: ch => accept(ch), exists: id => store.characters.some(ch => ch.id === id),
    put: ch => { store.characters = [ch, ...store.characters.filter(item => item.id !== ch.id)]; persist(); renderList(); }
  });

  // En juego: puntos de golpe, puntos de héroe, foco, conjuros, estados y descansos (src/nexo/juego.js).
  const juego = window.NEXO_JUEGO?.create({
    prefix: 'pf', title: '<span>✧</span> En juego <small>lo que cambia durante la aventura</small>',
    current: () => current, model: ch => playModel(ch), save: () => scheduleSave(), term, ready: ch => isComplete(ch)
  });
  // Estados: [id, nombre, grado máximo (0 = sin grado), entrada del manual, efecto].
  const PLAY_CONDITIONS = [
    ['asustado', 'Asustado', 4, 'pf-asustado', n => `−${n} a todas tus pruebas y CD. Baja 1 al final de cada uno de tus turnos.`],
    ['indispuesto', 'Indispuesto', 4, 'pf-estado-indispuesto', n => `−${n} a todas tus pruebas y CD.`],
    ['torpe', 'Torpe', 4, 'pf-estado-torpe', n => `−${n} a lo que use Destreza: CA, Reflejos, ataques a distancia y sus habilidades.`],
    ['debilitado', 'Debilitado', 4, 'pf-estado-debilitado', n => `−${n} a lo que use Fuerza: ataques cuerpo a cuerpo, daño y Atletismo.`],
    ['drenado', 'Drenado', 4, '', n => `−${n} a Fortaleza y a lo que use Constitución, y ${n} × nivel menos de puntos de golpe máximos.`],
    ['estupefacto', 'Estupefacto', 4, '', n => `−${n} a lo que use Inteligencia, Sabiduría o Carisma: Voluntad, Percepción, conjuros y sus habilidades.`],
    ['fatigado', 'Fatigado', 0, 'pf-estado-fatigado', '−1 a la CA y a las salvaciones. Se quita con un descanso nocturno.'],
    ['desprevenido', 'Desprevenido', 0, 'pf-desprevenido', '−2 a tu CA.'],
    ['derribado', 'Derribado', 0, 'pf-estado-derribado', 'Desprevenido y −2 a tus ataques.'],
    ['agarrado', 'Agarrado', 0, 'pf-estado-agarrado', 'Desprevenido e inmovilizado.'],
    ['inmovilizado', 'Inmovilizado', 0, 'pf-estado-inmovilizado', 'No puedes desplazarte.'],
    ['lento', 'Lento', 3, 'pf-estado-lento', n => `Pierdes ${n} ${n === 1 ? 'acción' : 'acciones'} al empezar cada turno.`],
    ['aturdido', 'Aturdido', 4, 'pf-estado-aturdido', n => `Pierdes ${n} ${n === 1 ? 'acción' : 'acciones'} en total y, mientras, no puedes actuar.`],
    ['acelerado', 'Acelerado', 0, 'pf-estado-acelerado', 'Una acción extra cada turno, para lo que indique el efecto.'],
    ['moribundo', 'Moribundo', 4, 'pf-moribundo', n => `Inconsciente. Prueba de recuperación: prueba plana CD ${10 + n}. Con moribundo 4 mueres.`],
    ['herido', 'Herido', 4, 'pf-moribundo', n => `Si vuelves a quedar moribundo, súmale ${n}.`],
    ['condenado', 'Condenado', 3, '', n => `Mueres con moribundo ${4 - n} en vez de 4.`],
    ['inconsciente', 'Inconsciente', 0, 'pf-estado-inconsciente', 'No actúas. Desprevenido y −4 a la CA, la Percepción y los Reflejos.']
  ];
  const CONDITION_REST = { fatigado: { noche: 'clear' }, drenado: { noche: -1 }, condenado: { noche: -1 } };
  function playModel(ch) {
    const c = cls(ch);
    if (!c || !anc(ch)) return null;
    const drained = juego?.cond(ch, 'drenado') || 0;
    const L = level(ch);
    const magic = [{ id: 'foco', label: 'Puntos de foco', max: 1, editMax: true, term: 'pf-foco', group: 'Magia', rest: { reenfocar: 1, noche: 'all' } }];
    // Espacios de conjuro: un rango nuevo en cada nivel impar, con un espacio más al nivel siguiente; el rango 10, al 19.
    if (c.spells) {
      const slots = c.slots || [2, 3];
      for (let r = 1; r <= Math.min(9, Math.ceil(L / 2)); r++) magic.push({ id: `rango${r}`, label: `Espacios de rango ${r}`, max: L >= r * 2 ? slots[1] : slots[0], editMax: true, term: 'pf-rangos-conjuro', group: 'Magia', rest: { noche: 'all' } });
      if (L >= 19) magic.push({ id: 'rango10', label: 'Espacio de rango 10', max: 1, editMax: true, term: 'pf-rangos-conjuro', group: 'Magia', rest: { noche: 'all' } });
    }
    if (ch.cls === 'clerigo') magic.push({ id: 'fuente', label: 'Fuente divina', hint: 'curar o dañar', max: L >= 15 ? 6 : L >= 5 ? 5 : 4, editMax: true, group: 'Magia', rest: { noche: 'all' } });
    return {
      counters: [
        { id: 'pg', label: 'Puntos de golpe', max: Math.max(1, hp(ch) - drained * L), big: true, temp: 'pgt', verbs: ['Daño', 'Curar'], zero: 'A 0 PG caes inconsciente y quedas moribundo 1 (2 si fue un crítico), más tu valor de herido.' },
        { id: 'pgt', label: 'PG temporales', kind: 'value', start: 0, cap: 999, inside: 'pg', rest: { noche: { set: 0 } } },
        { id: 'heroe', label: 'Puntos de héroe', kind: 'value', start: 1, cap: 3, term: 'pf-puntos-heroe', group: 'General', rest: { sesion: { set: 1 } } },
        ...magic
      ],
      conditions: PLAY_CONDITIONS.map(([id, label, max, entry, effect]) => ({ id, label, max, term: entry, effect, rest: CONDITION_REST[id] })),
      rests: [
        { id: 'reenfocar', label: 'Reenfocar', hint: '10 minutos · recuperas 1 punto de foco' },
        { id: 'noche', label: 'Descanso nocturno', hint: '8 horas · puntos de golpe, foco y conjuros', run: a => { a.add('pg', Math.max(1, mod(ch, 'con')) * L); if (a.get('pg') >= a.max('pg')) a.setCond('herido', 0); } },
        { id: 'sesion', label: 'Nueva sesión', hint: 'los puntos de héroe vuelven a 1' }
      ]
    };
  }
  // Cómo cambian los estados una tirada de la ficha. De los penalizadores de estado solo cuenta el mayor.
  function rollEffects(ch, key) {
    const v = id => juego?.cond(ch, id) || 0;
    const attr = key === 'perc' || key === 'vol' ? 'sab' : key === 'fort' ? 'con' : key === 'ref' || key === 'ranged' ? 'des' : key === 'melee' ? 'fue' : key === 'spell' ? keyAttr(ch) : key.startsWith('sk:') ? SKILLS[key.slice(3)][1] : 'int';
    const status = [['Asustado', v('asustado'), true], ['Indispuesto', v('indispuesto'), true]];
    if (attr === 'des') status.push(['Torpe', v('torpe'), true]);
    if (attr === 'fue') status.push(['Debilitado', v('debilitado'), true]);
    if (attr === 'con') status.push(['Drenado', v('drenado'), true]);
    if (['int', 'sab', 'car'].includes(attr)) status.push(['Estupefacto', v('estupefacto'), true]);
    if (['fort', 'ref', 'vol'].includes(key)) status.push(['Fatigado', v('fatigado'), false]);
    const worst = status.filter(([, n]) => n).sort((a, b) => b[1] - a[1])[0];
    const notes = [];
    let bonus = 0;
    if (worst) { bonus -= worst[1]; notes.push(`${worst[0]}${worst[2] ? ' ' + worst[1] : ''}: −${worst[1]} de estado`); }
    if (['melee', 'ranged', 'spell'].includes(key) && v('derribado')) { bonus -= 2; notes.push('Derribado: −2 de circunstancia'); }
    return { bonus, note: notes.length ? notes.join('. ') + '.' : '' };
  }

  // Modo partida: la ficha en pequeño para jugar con el móvil, con la pantalla encendida (src/nexo/partida.js).
  const partida = window.NEXO_PARTIDA?.create({
    prefix: 'pf', host: () => host, juego, current: () => current, term,
    can: ch => Boolean(playModel(ch)), view: ch => partidaView(ch), roll: key => rollFromSheet(key),
    back: () => { if (current) juego?.render(host.querySelector('[data-play]')); }
  });
  // Reglas básicas para quien empieza, en el modo partida (resúmenes propios).
  const PARTIDA_RULES = [['Cómo se tira', 'd20 más tu modificador contra una CD. Si la superas por 10 o más, es un éxito crítico; si te quedas 10 o más por debajo, un fallo crítico. Un 20 natural mejora el resultado un grado y un 1 natural lo empeora.'], ['Tu turno', 'Tienes tres acciones y una reacción. Moverte, atacar o alzar un escudo cuesta una acción; la mayoría de conjuros, dos.'], ['Ataques seguidos', 'El segundo ataque del turno tiene −5 y el tercero −10 (−4 y −8 con armas ágiles). Suele compensar moverse o hacer otra cosa con la tercera acción.'], ['Salvaciones', 'Fortaleza resiste venenos y golpes al cuerpo, Reflejos sirve para esquivar y Voluntad protege la mente.'], ['Competencia', 'Sin entrenar suma +0; entrenado, tu nivel +2; experto +4, maestro +6 y legendario +8 sobre tu nivel.'], ['Puntos de héroe', 'Gasta uno para repetir una tirada y quedarte con el segundo resultado. Si gastas todos al estar moribundo, te salvas.'], ['Caer a 0 PG', 'Quedas inconsciente y moribundo 1 (más tu valor de herido). Al empezar tu turno, tirada de recuperación contra CD 10 + moribundo. Con moribundo 4, mueres.']];
  function partidaView(ch) {
    const data = sheetData(ch);
    const items = diceItems(ch);
    const roll = (title, id, test) => ({ id, title, items: items.filter(([k]) => test(k)).map(([key, label, value]) => ({ key, label, value: signed(value) })) });
    return {
      title: data.name, sub: data.subtitle,
      stats: window.NEXO_PARTIDA.pick(data, [['Clase de Armadura', 'CA'], ['Velocidad'], ['Percepción', '', 'perc'], ['Fortaleza', '', 'fort'], ['Reflejos', '', 'ref'], ['Voluntad', '', 'vol'], ['CD de clase'], ['CD de conjuros']]),
        guide: [{ title: 'Reglas básicas', gloss: PARTIDA_RULES }],
    rolls: [roll('Ataques', 'atk', k => ['melee', 'ranged', 'spell'].includes(k)), roll('Habilidades', 'sk', k => k.startsWith('sk:') || k.startsWith('lore:'))].filter(g => g.items.length)
    };
  }

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
      return { characters: Array.isArray(parsed.characters) ? parsed.characters.map(normalize) : [] };
    } catch { return { characters: [] }; }
  }
  function normalize(ch) {
    const out = { ...newCharacter(), ...ch };
    ['ancBoosts', 'bgBoosts', 'freeBoosts', 'freeSkills', 'lores'].forEach(k => { out[k] = Array.isArray(ch[k]) ? ch[k] : []; });
    // Subida de nivel: las fichas de antes no la traen y se quedan en el nivel 1.
    const obj = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
    out.level = Math.max(1, Math.min(MAX_LEVEL, Math.trunc(Number(ch.level)) || 1));
    out.variant = typeof ch.variant === 'string' ? ch.variant.slice(0, 20) : '';
    out.hpBonus = Math.max(0, Math.min(400, Math.trunc(Number(ch.hpBonus)) || 0));
    out.lvBoosts = Object.fromEntries(BOOST_LEVELS.map(l => [l, (Array.isArray(obj(ch.lvBoosts)[l]) ? obj(ch.lvBoosts)[l] : []).filter(k => typeof k === 'string')]));
    out.skillUps = Object.fromEntries(Object.entries(obj(ch.skillUps)).filter(([l, t]) => Number(l) >= 2 && Number(l) <= MAX_LEVEL && typeof t === 'string' && t).map(([l, t]) => [Number(l), t.slice(0, 60)]));
    out.saveUps = Object.fromEntries(Object.entries(obj(ch.saveUps)).filter(([l, t]) => Number(l) >= 2 && Number(l) <= MAX_LEVEL && typeof t === 'string' && SAVES[t]).map(([l, t]) => [Number(l), t]));
    out.lvFeats = Object.fromEntries(Object.entries(obj(ch.lvFeats)).filter(([slot, t]) => /^\d{1,2}:[a-z]{1,10}$/.test(slot) && typeof t === 'string' && t).slice(0, 80).map(([slot, t]) => [slot, t.slice(0, 80)]));
    return out;
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { return false; }
    window.NEXO_CLOUD?.save(GAME, KEY, store).then(ok => {
      if (ok !== null) setStatus(ok ? 'GUARDADO EN LA NUBE' : window.NEXO_CLOUD.failText(GAME));
    });
    return true;
  }
  // Trae las fichas de la cuenta sin perder la que se esté editando.
  async function pullFromCloud() {
    const synced = await window.NEXO_CLOUD?.syncCharacters(GAME, KEY, store).catch(error => { console.error('NEXO sync error', error); return null; });
    if (!synced) return;
    store = { characters: synced.characters.map(normalize) };
    if (current) {
      const index = store.characters.findIndex(ch => ch.id === current.id);
      if (index >= 0) store.characters[index] = current;
      else store.characters.unshift(current);
    } else if (host && !host.hidden) renderList();
  }
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  const signed = n => (n < 0 ? `−${-n}` : `+${n}`);

  function newCharacter() {
    return {
      id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      name: '', player: '', campaign: '', deity: '', age: '', edicts: '',
      ancestry: '', heritage: '', altBoosts: false, ancBoosts: [],
      background: '', bgSkill: '', bgLore: '', bgFeat: '', bgBoosts: [],
      cls: '', subclass: '', classBoost: '', freeBoosts: [],
      freeSkills: [], lores: [], languages: '', armor: 'sin',
      feats: '', gear: '', notes: '',
      level: 1, variant: '', hpBonus: 0, lvBoosts: Object.fromEntries(BOOST_LEVELS.map(l => [l, []])), skillUps: {}, saveUps: {}, lvFeats: {}
    };
  }

  // Valores derivados
  const level = ch => ch.level || 1;
  const anc = ch => ANCESTRIES[ch.ancestry];
  const bg = ch => BACKGROUNDS[ch.background];
  // La clase, con su variante aplicada si la tiene (la doctrina del clérigo cambia competencias).
  function cls(ch) {
    const c = CLASSES[ch.cls];
    const v = c?.variants && (c.variants[ch.variant] || Object.values(c.variants)[0]);
    return v ? { ...c, ...v.set, up: { ...c.up, ...v.up } } : c;
  }
  const ancFixed = ch => (anc(ch) && !ch.altBoosts ? anc(ch).boosts : []);
  const ancFree = ch => (!anc(ch) ? 0 : ch.altBoosts ? 2 : anc(ch).free);
  const ancFlaw = ch => (anc(ch) && !ch.altBoosts ? anc(ch).flaw : '');
  // Modificador de un atributo. Las mejoras de los niveles 5, 10, 15 y 20 suman +1, salvo que el modificador
  // ya sea +4 o más: entonces hacen falta dos mejoras para subirlo y la primera se queda a medias (half).
  function boosted(ch, k) {
    let n = 0;
    if (ancFixed(ch).includes(k)) n++;
    if (ch.ancBoosts.includes(k)) n++;
    if (ch.bgBoosts.includes(k)) n++;
    if (ch.classBoost === k) n++;
    if (ch.freeBoosts.includes(k)) n++;
    if (ancFlaw(ch) === k) n--;
    let half = false;
    let fromLevels = 0;
    BOOST_LEVELS.forEach(l => {
      if (l > level(ch) || !(ch.lvBoosts?.[l] || []).includes(k)) return;
      fromLevels++;
      if (n < 4) n++;
      else if (half) { n++; half = false; }
      else half = true;
    });
    return { mod: n, half, fromLevels };
  }
  const mod = (ch, k) => boosted(ch, k).mod;
  // Competencia: el rango (entrenado 1, experto 2, maestro 3, legendario 4) por 2, más el nivel.
  const prof = (ch, rank) => (rank ? rank * 2 + level(ch) : 0);
  const upsOf = (ch, track) => (cls(ch)?.up?.[track] || []).filter(l => l <= level(ch)).length;
  // Rango de la clase en Percepción, una salvación, las armas, la CD de clase o los conjuros, a su nivel.
  function rankOf(ch, track) {
    const c = cls(ch);
    if (!c) return 0;
    let rank = (track === 'dc' || track === 'spell' ? 1 : c[track] || 0) + upsOf(ch, track);
    if (c.paths && SAVES[track]) rank += c.paths.filter(l => l <= level(ch) && ch.saveUps?.[l] === track).length;
    return Math.min(4, rank);
  }
  // Rango con una categoría de armadura (0 es sin armadura): solo sube si la clase está entrenada en ella.
  function defenseRank(ch, cat) {
    const c = cls(ch);
    if (!c) return 0;
    const base = cat === 0 ? c.unarmored || 1 : c.armor >= cat ? 1 : 0;
    return base ? Math.min(4, base + upsOf(ch, 'armor')) : 0;
  }
  const bonus = (ch, attr, track) => mod(ch, attr) + prof(ch, rankOf(ch, track));
  function bgSkill(ch) {
    const b = bg(ch);
    if (!b) return '';
    return Array.isArray(b.skill) ? (b.skill.includes(ch.bgSkill) ? ch.bgSkill : '') : b.skill;
  }
  const classSkills = ch => cls(ch)?.skills || [];
  // Si el bagaje repite una habilidad de la clase, se gana otra a elección; el humano habilidoso suma una.
  function skillPicks(ch) {
    const c = cls(ch);
    if (!c) return 0;
    const overlap = bgSkill(ch) && classSkills(ch).includes(bgSkill(ch)) ? 1 : 0;
    const skilled = ch.heritage === 'Humano habilidoso' ? 1 : 0;
    return Math.max(0, c.free + mod(ch, 'int') + overlap + skilled);
  }
  const picksSpent = ch => ch.freeSkills.length + ch.lores.length;
  function skillSource(ch, k) {
    if (classSkills(ch).includes(k)) return 'clase';
    if (bgSkill(ch) === k) return 'bagaje';
    if (ch.freeSkills.includes(k)) return 'elegida';
    return '';
  }
  // Aumentos de habilidad: en los niveles impares desde el 3, o en todos desde el 2 (pícaro e investigador).
  // Cada uno sube un rango una habilidad o un Saber («lore:Nombre»); maestro pide nivel 7 y legendario, nivel 15.
  function upLevels(ch) {
    const c = cls(ch);
    const out = [];
    if (c) for (let l = c.skillful ? 2 : 3; l <= level(ch); l += c.skillful ? 1 : 2) out.push(l);
    return out;
  }
  const maxSkillRank = l => (l >= 15 ? 4 : l >= 7 ? 3 : 2);
  const loreNames = ch => [bg(ch) ? ch.bgLore || bg(ch).lore : '', ...ch.lores].filter(Boolean);
  const baseRank = (ch, t) => (t.startsWith('lore:') ? (loreNames(ch).includes(t.slice(5)) ? 1 : 0) : SKILLS[t] && skillSource(ch, t) ? 1 : 0);
  function skillRank(ch, t, upto = level(ch)) {
    let rank = baseRank(ch, t);
    upLevels(ch).forEach(l => { if (l <= upto && ch.skillUps?.[l] === t) rank++; });
    return Math.min(4, rank);
  }
  const skillMod = (ch, k) => mod(ch, SKILLS[k][1]) + prof(ch, skillRank(ch, k));
  const loreMod = (ch, name) => mod(ch, 'int') + prof(ch, skillRank(ch, 'lore:' + name));
  const hp = ch => (anc(ch)?.hp || 0) + ((cls(ch)?.hp || 0) + mod(ch, 'con')) * level(ch) + (ch.hpBonus || 0);
  // Dotes que toca elegir en un nivel por encima del 1: [tipo, nombre].
  function featSlots(ch, l) {
    const out = [];
    if (l % 2 === 0) out.push(['clase', 'Dote de clase'], ['hab', 'Dote de habilidad']);
    else if (cls(ch)?.skillFeats?.includes(l)) out.push(['hab', 'Dote de habilidad']);
    if (GENERAL_FEATS.includes(l)) out.push(['general', 'Dote general']);
    if (ANCESTRY_FEATS.includes(l)) out.push(['asc', 'Dote de ascendencia']);
    return out;
  }
  const keyAttr = ch => cls(ch) ? (cls(ch).key.length === 1 ? cls(ch).key[0] : ch.classBoost || cls(ch).key[0]) : '';
  function armorClass(ch) {
    const a = ARMORS[ch.armor] || ARMORS.sin;
    const rank = defenseRank(ch, a.cat);
    const dex = a.cap === null ? mod(ch, 'des') : Math.min(mod(ch, 'des'), a.cap);
    return { total: 10 + dex + prof(ch, rank) + a.ac, trained: rank > 0, rank };
  }
  function langCount(ch) {
    if (!anc(ch)) return 0;
    return Math.max(0, mod(ch, 'int')) + (anc(ch).extraLang || 0);
  }

  function sanitize(ch) {
    ['lvBoosts', 'skillUps', 'saveUps', 'lvFeats'].forEach(k => { if (!ch[k] || typeof ch[k] !== 'object') ch[k] = {}; });
    ch.level = Math.max(1, Math.min(MAX_LEVEL, Math.trunc(Number(ch.level)) || 1));
    if (!ANCESTRIES[ch.ancestry]) ch.ancestry = '';
    if (!BACKGROUNDS[ch.background]) ch.background = '';
    if (!CLASSES[ch.cls]) ch.cls = '';
    const variants = CLASSES[ch.cls]?.variants;
    if (!variants) ch.variant = '';
    else if (!variants[ch.variant]) ch.variant = Object.keys(variants)[0];
    if (!ARMORS[ch.armor]) ch.armor = 'sin';
    ch.altBoosts = Boolean(ch.altBoosts);
    const a = anc(ch);
    if (a && ch.heritage && !a.heritages.includes(ch.heritage) && !VERSATILE.includes(ch.heritage)) ch.heritage = '';
    if (!a) ch.heritage = '';
    const uniq = list => list.filter((k, i) => ALL.includes(k) && list.indexOf(k) === i);
    ch.ancBoosts = uniq(ch.ancBoosts).filter(k => !ancFixed(ch).includes(k)).slice(0, ancFree(ch));
    const b = bg(ch);
    ch.bgBoosts = b ? uniq(ch.bgBoosts).slice(0, 2) : [];
    if (b && ch.bgBoosts.length === 2 && !ch.bgBoosts.some(k => b.attrs.includes(k))) ch.bgBoosts.pop();
    if (b && Array.isArray(b.skill) && !b.skill.includes(ch.bgSkill)) ch.bgSkill = '';
    const c = cls(ch);
    if (!c) ch.classBoost = '';
    else if (c.key.length === 1) ch.classBoost = c.key[0];
    else if (!c.key.includes(ch.classBoost)) ch.classBoost = '';
    ch.freeBoosts = uniq(ch.freeBoosts).slice(0, FREE_BOOSTS);
    BOOST_LEVELS.forEach(l => { ch.lvBoosts[l] = uniq(Array.isArray(ch.lvBoosts[l]) ? ch.lvBoosts[l] : []).slice(0, LEVEL_BOOSTS); });
    const taken = new Set([...classSkills(ch), bgSkill(ch)]);
    ch.freeSkills = ch.freeSkills.filter((k, i) => SKILLS[k] && !taken.has(k) && ch.freeSkills.indexOf(k) === i);
    ch.lores = ch.lores.map(s => String(s).trim()).filter(Boolean);
    const room = skillPicks(ch);
    if (picksSpent(ch) > room) {
      ch.freeSkills = ch.freeSkills.slice(0, room);
      ch.lores = ch.lores.slice(0, Math.max(0, room - ch.freeSkills.length));
    }
    // Lo elegido al subir de nivel, hasta el nivel actual (lo de niveles más altos se guarda por si se vuelve a subir).
    if (c?.paths) {
      const [first, second, third] = c.paths;
      if (ch.saveUps[second] && ch.saveUps[second] === ch.saveUps[first]) delete ch.saveUps[second];
      if (ch.saveUps[third] && ![ch.saveUps[first], ch.saveUps[second]].includes(ch.saveUps[third])) delete ch.saveUps[third];
    }
    upLevels(ch).forEach(l => {
      const t = ch.skillUps[l];
      if (!t) return;
      const known = t.startsWith('lore:') ? baseRank(ch, t) > 0 : Boolean(SKILLS[t]);
      if (!known || skillRank(ch, t, l - 1) + 1 > maxSkillRank(l)) delete ch.skillUps[l];
    });
  }

  // Ficha que llega de un archivo: se completa y se deja solo lo que el creador entiende.
  function accept(raw) {
    const ch = normalize(raw);
    const strings = list => list.filter(k => typeof k === 'string');
    ['ancBoosts', 'bgBoosts', 'freeBoosts', 'freeSkills'].forEach(k => { ch[k] = strings(ch[k]); });
    ch.lores = strings(ch.lores).map(s => s.slice(0, 40)).slice(0, 30);
    sanitize(ch);
    return ch;
  }

  // La ficha como datos para la hoja de solo lectura: lo que se imprime o se guarda como PDF.
  function sheetData(ch) {
    const a = anc(ch);
    const b = bg(ch);
    const c = cls(ch);
    const save = (attr, track) => (c ? signed(bonus(ch, attr, track)) : '—');
    const ac = armorClass(ch);
    const key = keyAttr(ch);
    const fue = mod(ch, 'fue');
    const lores = loreNames(ch);
    const rankNote = r => (r > 1 ? ` · ${RANKS[r].toLowerCase()}` : '');
    const L = level(ch);
    const progress = [];
    for (let l = 2; l <= L && c; l++) {
      if (BOOST_LEVELS.includes(l) && ch.lvBoosts[l]?.length) progress.push([`Nivel ${l} · mejoras`, ch.lvBoosts[l].map(k => ATTR[k].short).join(', ')]);
      if (upLevels(ch).includes(l) && ch.skillUps[l]) progress.push([`Nivel ${l} · habilidad`, `${targetName(ch.skillUps[l])} a ${RANKS[skillRank(ch, ch.skillUps[l], l)].toLowerCase()}`]);
      if (c.paths?.includes(l) && ch.saveUps[l]) progress.push([`Nivel ${l} · camino a la perfección`, SAVES[ch.saveUps[l]]]);
      featSlots(ch, l).forEach(([kind, label]) => { if (ch.lvFeats[`${l}:${kind}`]) progress.push([`Nivel ${l} · ${label.toLowerCase()}`, ch.lvFeats[`${l}:${kind}`]]); });
    }
    const langs = [...(a?.langs || []), ...ch.languages.split(',').map(s => s.trim()).filter(Boolean)];
    const bgFeat = b ? (ch.background === 'propio' ? ch.bgFeat : b.feat) : '';
    return {
      system: 'Pathfinder · 2ª edición Remaster', accent: '#5b3a8c',
      name: ch.name || 'Aventurero sin nombre', subtitle: describe(ch),
      meta: [['Nivel', L], ['Jugador', ch.player], ['Campaña', ch.campaign]],
      blocks: [
        { title: 'Aventurero', kind: 'pairs', items: [
          ['Ascendencia', a?.name], ['Herencia', ch.heritage], ['Bagaje', b?.name], ['Dote del bagaje', bgFeat], ['Clase', c?.name], [c?.variantLabel || 'Doctrina', c?.variants?.[ch.variant]?.name], ['Subclase y elecciones', ch.subclass],
          ['Atributo clave', key ? ATTR[key].name : ''], ['Dios o filosofía', ch.deity], ['Edad', ch.age], ['Edictos y anatemas', ch.edicts],
          ['Tamaño', a?.size], ['Sentidos', a?.vision], ['Idiomas', langs.join(', ')], ['Armadura', (ARMORS[ch.armor] || ARMORS.sin).name]
        ] },
        { title: 'Atributos', kind: 'stats', items: ATTRS.map(([k, name, short]) => ({ label: name, value: signed(mod(ch, k)), sub: short })) },
        { title: 'Defensa', kind: 'stats', note: c && !ac.trained ? 'La clase no está entrenada en esa armadura: no suma competencia a la CA.' : '', items: [
          { label: 'Puntos de golpe', value: a && c ? hp(ch) : '—' }, { label: 'Clase de Armadura', value: c ? ac.total : '—' }, { label: 'Percepción', value: save('sab', 'perc') },
          { label: 'Fortaleza', value: save('con', 'fort') }, { label: 'Reflejos', value: save('des', 'ref') }, { label: 'Voluntad', value: save('sab', 'vol') },
          { label: 'Velocidad', value: a ? a.speed : '—', sub: a ? 'pies' : '' }
        ] },
        { title: 'Ataques y CD', kind: 'stats', items: [
          { label: 'Cuerpo a cuerpo', value: c ? signed(bonus(ch, 'fue', 'weapon')) : '—' }, { label: 'A distancia', value: c ? signed(bonus(ch, 'des', 'weapon')) : '—' },
          { label: 'CD de clase', value: c ? 10 + bonus(ch, key, 'dc') : '—' },
          c?.spells ? { label: 'Ataque de conjuro', value: signed(bonus(ch, key, 'spell')) } : null, c?.spells ? { label: 'CD de conjuros', value: 10 + bonus(ch, key, 'spell'), sub: c.spells } : null,
          { label: 'Impedimenta', value: `${5 + fue} / ${10 + fue}`, sub: 'impedido / máx.' }
        ] },
        { title: 'En partida', kind: 'tracks', items: [
          { label: 'Puntos de golpe', value: '', max: a && c ? hp(ch) : '' }, { label: 'Puntos de héroe', value: '', max: 3, boxes: 3, marked: 1 }, { label: 'Moribundo', value: '', max: 4, boxes: 4 }, { label: 'Herido', value: '', max: '' }
        ] },
        { title: 'Habilidades', kind: 'list', cols: 2, note: 'El punto marca las habilidades entrenadas (+2 más el nivel); experto suma +4, maestro +6 y legendario +8.', items: [
          ...SKILL_KEYS.map(k => ({ name: `${SKILLS[k][0]} (${ATTR[SKILLS[k][1]].short})${rankNote(skillRank(ch, k))}`, value: signed(skillMod(ch, k)), mark: skillRank(ch, k) > 0 })),
          ...lores.map(name => ({ name: `Saber: ${name} (INT)${rankNote(skillRank(ch, 'lore:' + name))}`, value: signed(loreMod(ch, name)), mark: true }))
        ] },
        { title: 'Dotes y rasgos', kind: 'text', text: ch.feats },
        ...(progress.length ? [{ title: 'Subida de nivel', kind: 'pairs', items: progress }] : []),
        { title: 'Equipo', kind: 'text', text: ch.gear },
        { title: 'Notas', kind: 'text', text: ch.notes }
      ]
    };
  }

  function summary(ch) {
    const b = bg(ch);
    const c = cls(ch);
    const rows = [{ label: 'Ascendencia', left: anc(ch) ? 0 : 1, budget: 1 }];
    if (anc(ch)) {
      rows.push({ label: 'Herencia', left: ch.heritage ? 0 : 1, budget: 1 });
      if (ancFree(ch)) rows.push({ label: 'Mejoras de ascendencia', left: ancFree(ch) - ch.ancBoosts.length, budget: ancFree(ch) });
    }
    rows.push({ label: 'Bagaje', left: b ? 0 : 1, budget: 1 });
    if (b) {
      rows.push({ label: 'Mejoras de bagaje', left: 2 - ch.bgBoosts.length, budget: 2 });
      if (Array.isArray(b.skill)) rows.push({ label: 'Habilidad del bagaje', left: bgSkill(ch) ? 0 : 1, budget: 1 });
    }
    rows.push({ label: 'Clase', left: c ? 0 : 1, budget: 1 });
    if (c && c.key.length > 1) rows.push({ label: 'Atributo clave', left: ch.classBoost ? 0 : 1, budget: 1 });
    rows.push({ label: 'Mejoras libres', left: FREE_BOOSTS - ch.freeBoosts.length, budget: FREE_BOOSTS });
    if (c) rows.push({ label: 'Habilidades', left: skillPicks(ch) - picksSpent(ch), budget: skillPicks(ch) });
    // Lo que queda por elegir de los niveles ya subidos.
    const L = level(ch);
    if (c && L > 1) {
      BOOST_LEVELS.filter(l => l <= L).forEach(l => rows.push({ label: `Mejoras del nivel ${l}`, left: LEVEL_BOOSTS - (ch.lvBoosts?.[l] || []).length, budget: LEVEL_BOOSTS }));
      const ups = upLevels(ch);
      if (ups.length) rows.push({ label: 'Aumentos de habilidad', left: ups.filter(l => !ch.skillUps?.[l]).length, budget: ups.length });
      const paths = (c.paths || []).filter(l => l <= L);
      if (paths.length) rows.push({ label: 'Caminos a la perfección', left: paths.filter(l => !ch.saveUps?.[l]).length, budget: paths.length });
    }
    return rows;
  }
  const isComplete = ch => summary(ch).every(row => row.left === 0);
  function describe(ch) {
    const parts = [anc(ch)?.name, cls(ch)?.name, cls(ch) ? `nivel ${level(ch)}` : ''].filter(Boolean);
    return parts.length ? parts.join(' · ') : 'Sin ascendencia ni clase';
  }

  // Acciones
  function toggleBoost(kind, k) {
    const ch = current;
    if (kind === 'cls') {
      if (!cls(ch) || !cls(ch).key.includes(k) || cls(ch).key.length === 1) return;
      ch.classBoost = ch.classBoost === k ? '' : k;
      return changed();
    }
    const list = { anc: ch.ancBoosts, bg: ch.bgBoosts, free: ch.freeBoosts }[kind];
    const max = { anc: ancFree(ch), bg: 2, free: FREE_BOOSTS }[kind];
    if (list.includes(k)) { list.splice(list.indexOf(k), 1); return changed(); }
    if (kind === 'anc' && ancFixed(ch).includes(k)) return;
    if (list.length >= max) return flash(`Ya has repartido ${max === 1 ? 'la mejora' : `las ${max} mejoras`} de este apartado. Quita una para moverla.`);
    if (kind === 'bg' && list.length === 1) {
      const pair = bg(ch).attrs;
      if (!pair.includes(list[0]) && !pair.includes(k)) return flash(`Una de las dos mejoras del bagaje tiene que ir a ${pair.map(a => ATTR[a].short).join(' o ')}.`);
    }
    list.push(k);
    changed();
  }
  function toggleSkill(k) {
    const ch = current;
    const list = ch.freeSkills;
    if (list.includes(k)) list.splice(list.indexOf(k), 1);
    else if (picksSpent(ch) >= skillPicks(ch)) return flash(`Ya has elegido tus ${skillPicks(ch)} habilidades. Quita una para cambiarla.`);
    else list.push(k);
    changed();
  }
  function addLore(name) {
    const ch = current;
    const value = name.trim();
    if (!value) return flash('Escribe de qué es el Saber: Absalom, Ingeniería, Dragones…');
    if (picksSpent(ch) >= skillPicks(ch)) return flash(`Ya has elegido tus ${skillPicks(ch)} habilidades. Quita una para añadir un Saber.`);
    ch.lores.push(value.slice(0, 40));
    changed();
  }

  // Subir y bajar de nivel. Al bajar no se borra lo elegido: vuelve si se sube otra vez.
  function levelUp() {
    const ch = current;
    if (!cls(ch) || !anc(ch)) return flash('Elige primero una ascendencia y una clase para poder subir de nivel.');
    if (level(ch) >= MAX_LEVEL) return flash('Ya estás en el nivel 20, el máximo.');
    ch.level = level(ch) + 1;
    lvOpen.set(ch.level, true);
    changed();
    const panel = host.querySelector('[data-levels]');
    panel?.scrollIntoView({ block: 'start', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    flash(`Nivel ${ch.level}. Abajo tienes lo que ganas y lo que te queda por elegir.`);
  }
  function levelDown() {
    if (level(current) <= 1) return;
    current.level = level(current) - 1;
    changed();
  }
  function toggleLevelBoost(l, k) {
    const list = current.lvBoosts[l] || (current.lvBoosts[l] = []);
    if (list.includes(k)) list.splice(list.indexOf(k), 1);
    else if (list.length >= LEVEL_BOOSTS) return flash(`Ya has repartido las ${LEVEL_BOOSTS} mejoras del nivel ${l}. Quita una para moverla.`);
    else list.push(k);
    lvOpen.set(l, true);
    changed();
  }

  function changed() {
    scheduleSave();
    renderSheet();
  }
  function scheduleSave() {
    if (!current) return;
    current.updatedAt = new Date().toISOString();
    if (!store.characters.some(ch => ch.id === current.id)) store.characters.unshift(current);
    setStatus('GUARDANDO…');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { saveTimer = 0; setStatus(persist() ? 'GUARDADO EN ESTE DISPOSITIVO' : 'NO SE PUDO GUARDAR'); }, 300);
    host.querySelector('[data-delete]')?.removeAttribute('hidden');
  }
  function flushSave() {
    if (!saveTimer) return;
    clearTimeout(saveTimer);
    saveTimer = 0;
    persist();
  }
  function setStatus(text) { host?.querySelectorAll('[data-save-status]').forEach(node => { node.textContent = text; }); }
  let flashTimer = 0;
  function flash(text) {
    const node = host.querySelector('[data-flash]');
    if (!node) return;
    node.textContent = text;
    node.hidden = false;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => { node.hidden = true; }, 3800);
  }

  // Vistas
  function frame(body, status = 'ABSALOM · MAR INTERIOR') {
    host.innerHTML = `<div class="pf-stars" aria-hidden="true"></div><header class="pf-top"><button class="pf-brand" data-exit aria-label="Volver a la mesa"><span class="pf-sign">${window.NEXO_ICONS?.pathfinder || ''}</span><span><b>NEXO</b><small>PATHFINDER · 2ª EDICIÓN</small></span></button><span class="pf-status" data-save-status>${esc(status)}</span></header><main class="pf-main">${body}</main><button class="nd-fab" data-dice aria-label="Abrir los dados"><span aria-hidden="true">⚄</span><b>Dados</b></button><div class="pf-flash" data-flash hidden role="status"></div>`;
    host.querySelectorAll('[data-exit]').forEach(button => button.addEventListener('click', close));
    host.querySelector('[data-dice]').addEventListener('click', () => window.NEXO_DICE?.tray('pathfinder', { sources: diceSources }));
  }
  // Dados: Percepción, salvaciones, ataques y habilidades de la ficha, contra la CD que diga el DJ.
  function diceItems(ch) {
    const c = cls(ch);
    const items = [];
    if (c) {
      items.push(['perc', 'Percepción', bonus(ch, 'sab', 'perc')], ['fort', 'Fortaleza', bonus(ch, 'con', 'fort')], ['ref', 'Reflejos', bonus(ch, 'des', 'ref')], ['vol', 'Voluntad', bonus(ch, 'sab', 'vol')],
        ['melee', 'Ataque cuerpo a cuerpo', bonus(ch, 'fue', 'weapon')], ['ranged', 'Ataque a distancia', bonus(ch, 'des', 'weapon')]);
      if (c.spells) items.push(['spell', 'Ataque de conjuro', bonus(ch, keyAttr(ch), 'spell')]);
    }
    SKILL_KEYS.forEach(k => items.push(['sk:' + k, SKILLS[k][0], skillMod(ch, k)]));
    loreNames(ch).forEach((name, i) => items.push(['lore:' + i, `Saber (${name})`, loreMod(ch, name)]));
    return items;
  }
  function diceSources() { return current ? [{ label: 'Tirada de la ficha', items: diceItems(current), show: signed }] : []; }
  function rollFromSheet(key) {
    const item = diceItems(current).find(([k]) => k === key);
    if (!item) return;
    const fx = rollEffects(current, key);
    window.NEXO_DICE?.roll('pathfinder', { mod: item[2] + fx.bonus, label: item[1], note: fx.note });
  }

  function renderList() {
    flushSave();
    current = null;
    const rows = store.characters;
    const cards = rows.length ? rows.map(ch => {
      const done = isComplete(ch);
      return `<button class="pf-card" data-open="${esc(ch.id)}"><span class="pf-card-mark" aria-hidden="true">${window.NEXO_ICONS?.pathfinder || ''}</span><span class="pf-card-copy"><b>${esc(ch.name || 'Aventurero sin nombre')}</b><small>${esc(describe(ch))}</small></span><span class="pf-badge ${done ? 'is-done' : ''}">${done ? 'Listo' : 'En curso'}</span></button>`;
    }).join('') : `<div class="pf-empty"><span aria-hidden="true">${window.NEXO_ICONS?.pathfinder || ''}</span><b>Aún no hay aventureros</b><small>Pulsa «Nuevo aventurero» para crear tu primer personaje.</small></div>`;
    frame(`${ap?.tabs('personajes') || ''}<p class="pf-kicker">NEXO / PATHFINDER · 2ª EDICIÓN REMASTER</p><h1>Tus <em>aventureros</em></h1><p class="pf-intro">Crea personajes para Golarion y súbelos del nivel 1 al 20: ascendencia y herencia, bagaje, clase, mejoras de atributo, habilidades y lo que da cada nivel. NEXO calcula puntos de golpe, Clase de Armadura, Percepción, salvaciones, CD de clase y de conjuros, y guarda las fichas en este dispositivo y en tu cuenta.</p><div class="pf-actions"><button class="pf-button" data-new>NUEVO AVENTURERO</button>${kit?.importButton() || ''}<button class="pf-button ghost" data-exit>← VOLVER A LA MESA</button></div><div class="pf-list">${cards}</div><p class="pf-quote">«Explora, informa, coopera.»</p>`);
    host.querySelector('[data-new]').addEventListener('click', () => openEditor(newCharacter()));
    host.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => {
      const ch = store.characters.find(item => item.id === button.dataset.open);
      if (ch) openEditor(ch);
    }));
    host.scrollTop = 0;
  }

  function field(label, prop, opts = {}) {
    if (opts.area) return `<label class="pf-field"><span>${label}</span><textarea data-prop="${prop}" rows="${opts.rows || 3}" maxlength="1200" placeholder="${esc(opts.placeholder || '')}">${esc(current[prop])}</textarea></label>`;
    return `<label class="pf-field"><span>${label}</span><input data-prop="${prop}" value="${esc(current[prop])}" maxlength="80" autocomplete="off" placeholder="${esc(opts.placeholder || '')}"></label>`;
  }
  function options(entries, selected, empty) {
    return (empty ? `<option value="" ${selected ? '' : 'selected'}>${esc(empty)}</option>` : '') + entries.map(([value, label]) => `<option value="${esc(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${esc(label)}</option>`).join('');
  }
  const sorted = obj => Object.entries(obj).map(([k, v]) => [k, v.name]).sort((a, b) => a[1].localeCompare(b[1], 'es'));
  const heading = (n, title, small = '') => `<h2><span>${ROMAN[n - 1]}</span> ${title}${small ? ` <small>${small}</small>` : ''}</h2>`;
  const leftBadge = (left, done = 'Completo') => `<span class="pf-left ${left === 0 ? 'is-done' : left < 0 ? 'is-over' : ''}">${left === 0 ? done : left > 0 ? `Quedan ${left}` : `Sobran ${-left}`}</span>`;

  function openEditor(ch) {
    current = ch;
    lvOpen.clear();
    const saved = store.characters.some(item => item.id === ch.id);
    frame(`<div class="pf-editor-head"><button class="pf-button ghost" data-back>← TUS AVENTUREROS</button>${partida?.button('pf-button') || ''}${kit?.tools() || ''}<button class="pf-button danger" data-delete ${saved ? '' : 'hidden'}>BORRAR FICHA</button></div>
      <div data-play></div>
      <section class="pf-panel">${heading(1, 'Aventurero', 'datos básicos')}<div class="pf-fields">
        ${field('Nombre', 'name', { placeholder: 'Nombre del personaje' })}${field('Jugador', 'player')}${field('Campaña', 'campaign')}
        ${field('Dios o filosofía', 'deity', { placeholder: 'Iomedae, Desna, ninguno…' })}${field('Edad', 'age')}${field('Edictos y anatemas', 'edicts', { placeholder: 'Lo que defiendes y lo que nunca harías' })}
      </div></section>
      <div data-sheet></div>
      <section class="pf-panel">${heading(10, 'Dotes, equipo y notas')}<div class="pf-fields pf-fields-3">
        ${field('Dotes y rasgos de nivel 1', 'feats', { area: true, rows: 6, placeholder: 'Dote de ascendencia, dote de clase, rasgos de la subclase…' })}${field('Equipo', 'gear', { area: true, rows: 6, placeholder: 'Empiezas con 15 po: armas, armadura, mochila, cuerda, raciones…' })}${field('Notas', 'notes', { area: true, rows: 6, placeholder: 'Historia, contactos, objetivos…' })}</div></section>
      <div class="pf-modal" data-modal hidden><div class="pf-modal-card" role="alertdialog" aria-modal="true" aria-labelledby="pfDelTitle"><h3 id="pfDelTitle">¿Borrar este aventurero?</h3><p>La ficha se borrará de este dispositivo y de tu cuenta, y no se podrá recuperar.</p><div class="pf-actions"><button class="pf-button ghost" data-cancel>CANCELAR</button><button class="pf-button danger" data-confirm>BORRAR FICHA</button></div></div></div>`, saved ? 'GUARDADO EN ESTE DISPOSITIVO' : 'FICHA NUEVA · SIN GUARDAR');

    host.querySelector('[data-back]').addEventListener('click', renderList);
    partida?.bind(host);
    host.querySelectorAll('.pf-main > .pf-panel [data-prop]').forEach(input => input.addEventListener('input', () => { current[input.dataset.prop] = input.value; scheduleSave(); }));
    const modal = host.querySelector('[data-modal]');
    host.querySelector('[data-delete]').addEventListener('click', () => { modal.hidden = false; host.querySelector('[data-cancel]').focus(); });
    host.querySelector('[data-cancel]').addEventListener('click', () => { modal.hidden = true; });
    host.querySelector('[data-confirm]').addEventListener('click', () => {
      clearTimeout(saveTimer);
      saveTimer = 0;
      store.characters = store.characters.filter(item => item.id !== current.id);
      persist();
      current = null;
      renderList();
    });
    renderSheet();
    host.scrollTop = 0;
  }

  const boostList = list => list.map(k => ATTR[k].short).join(', ');

  function ancestryPanel(ch) {
    const a = anc(ch);
    let body = '<p class="pf-note">La ascendencia fija tus puntos de golpe iniciales, tu tamaño, tu velocidad, tus sentidos, tus idiomas y parte de tus mejoras de atributo.</p>';
    if (a) {
      const heritages = [...a.heritages, ...VERSATILE].map(h => [h, h]);
      body = `<p class="pf-narr">${esc(a.text)} ${manualLink(`pf-anc-${ch.ancestry}`, `Leer sobre ${a.name.toLowerCase()}s`)}</p>
        <dl class="pf-info"><div><dt>Puntos de golpe</dt><dd>${a.hp}</dd></div><div><dt>Tamaño y velocidad</dt><dd>${a.size} · ${a.speed} pies</dd></div><div><dt>Sentidos</dt><dd>${a.vision}</dd></div>
          <div><dt>Mejoras</dt><dd>${ch.altBoosts ? 'Dos mejoras libres' : [boostList(a.boosts), a.free ? `${a.free > 1 ? `${a.free} libres` : 'una libre'}` : ''].filter(Boolean).join(' y ')}</dd></div>
          <div><dt>Defecto</dt><dd>${ch.altBoosts || !a.flaw ? 'Ninguno' : ATTR[a.flaw].name}</dd></div><div><dt>Idiomas</dt><dd>${a.langs.join(', ')}${a.extraLang ? ' y uno más' : ''}</dd></div></dl>
        ${a.boosts.length ? `<label class="pf-check"><input type="checkbox" data-alt ${ch.altBoosts ? 'checked' : ''}><span>Mejoras alternativas: dos mejoras libres, sin las fijas ni el defecto.</span></label>` : ''}
        <label class="pf-field pf-field-wide"><span>Herencia</span><select data-choice="heritage">${options(heritages, ch.heritage, 'Elige una herencia…')}</select></label>
        ${ch.heritage === 'Humano habilidoso' ? '<p class="pf-note">Humano habilidoso: quedas entrenado en una habilidad más, que se suma a las que eliges.</p>' : ''}`;
    }
    return `<section class="pf-panel">${heading(2, 'Ascendencia y herencia', a ? esc(a.name) : '')}
      <label class="pf-field pf-field-wide"><span>Ascendencia</span><select data-choice="ancestry">${options(sorted(ANCESTRIES), ch.ancestry, 'Elige una ascendencia…')}</select></label>${body}</section>`;
  }

  function backgroundPanel(ch) {
    const b = bg(ch);
    let body = '<p class="pf-note">El bagaje cuenta lo que hacías antes de aventurarte: da dos mejoras de atributo, una habilidad, un Saber y una dote de habilidad.</p>';
    if (b) {
      const custom = ch.background === 'propio';
      const skillPick = Array.isArray(b.skill)
        ? `<label class="pf-field pf-field-wide"><span>Habilidad del bagaje</span><select data-choice="bgSkill">${options(b.skill.map(k => [k, SKILLS[k][0]]), ch.bgSkill, 'Elige una habilidad…')}</select></label>`
        : '';
      body = `<p class="pf-narr">${esc(b.text)} ${manualLink(`pf-bag-${ch.background}`, 'Leer en el manual')}</p>
        <dl class="pf-info"><div><dt>Mejoras</dt><dd>${custom ? 'Dos a elegir' : `${boostList(b.attrs).replace(', ', ' o ')} y una libre`}</dd></div>
          <div><dt>Habilidad</dt><dd>${Array.isArray(b.skill) ? (custom ? 'A elegir' : b.skill.map(k => SKILLS[k][0]).join(', ').replace(/, ([^,]*)$/, ' o $1')) : SKILLS[b.skill][0]}</dd></div>
          ${custom ? '' : `<div><dt>Dote de habilidad</dt><dd>${esc(b.feat)}</dd></div>`}</dl>
        ${skillPick}
        <div class="pf-fields pf-fields-2"><label class="pf-field"><span>Saber del bagaje</span><input data-text="bgLore" value="${esc(ch.bgLore || b.lore)}" maxlength="40" placeholder="Saber (…)"></label>
          ${custom ? `<label class="pf-field"><span>Dote de habilidad</span><input data-text="bgFeat" value="${esc(ch.bgFeat)}" maxlength="60"></label>` : ''}</div>`;
    }
    return `<section class="pf-panel">${heading(3, 'Bagaje', b ? esc(b.name) : '')}
      <label class="pf-field pf-field-wide"><span>Bagaje</span><select data-choice="background">${options([...sorted(BACKGROUNDS).filter(([k]) => k !== 'propio'), ['propio', BACKGROUNDS.propio.name]], ch.background, 'Elige un bagaje…')}</select></label>${body}</section>`;
  }

  function classPanel(ch) {
    const c = cls(ch);
    let body = '<p class="pf-note">La clase da tu atributo clave, los puntos de golpe por nivel, tus competencias iniciales y tus habilidades.</p>';
    if (c) {
      const rank = track => RANKS[rankOf(ch, track)].toLowerCase();
      const defense = RANKS[defenseRank(ch, c.armor ? 1 : 0)].toLowerCase();
      const variants = CLASSES[ch.cls].variants;
      body = `<p class="pf-narr">${esc(c.text)} ${manualLink(`pf-cls-${ch.cls}`, 'Leer en el manual')}</p>
        ${variants ? `<label class="pf-field pf-field-wide"><span>Doctrina</span><select data-choice="variant">${options(Object.entries(variants).map(([k, v]) => [k, v.name]), ch.variant)}</select></label><p class="pf-note">${esc(variants[ch.variant]?.text || '')}</p>` : ''}
        <dl class="pf-info"><div><dt>Atributo clave</dt><dd>${c.key.map(k => ATTR[k].name).join(' o ')}</dd></div><div><dt>Puntos de golpe</dt><dd>${c.hp} + CON por nivel</dd></div>
          <div><dt>Percepción</dt><dd>${rank('perc')}</dd></div><div><dt>Salvaciones</dt><dd>Fortaleza ${rank('fort')}, Reflejos ${rank('ref')}, Voluntad ${rank('vol')}</dd></div>
          <div><dt>Habilidades</dt><dd>${[...c.skills.map(k => SKILLS[k][0]), `${c.free} más + INT`].join(', ')}</dd></div>
          <div><dt>Defensa</dt><dd>${c.armor ? `Armadura ${ARMOR_CATS.slice(1, c.armor + 1).join(', ').replace(/, ([^,]*)$/, ' y $1')} y sin armadura` : 'Solo sin armadura'} (${defense})</dd></div>
          <div><dt>Armas</dt><dd>${rank('weapon')}</dd></div>
          ${c.spells ? `<div><dt>Conjuros</dt><dd>Tradición ${esc(c.spells.toLowerCase())} (${rank('spell')})</dd></div>` : ''}</dl>
        ${level(ch) > 1 ? `<p class="pf-note">Las competencias son las de tu nivel ${level(ch)}.</p>` : ''}
        <label class="pf-field pf-field-wide"><span>Subclase y elecciones</span><input data-text="subclass" value="${esc(ch.subclass)}" maxlength="80" placeholder="${esc(c.sub)}"></label>`;
    }
    return `<section class="pf-panel">${heading(4, 'Clase', c ? esc(c.name) : '')}
      <label class="pf-field pf-field-wide"><span>Clase</span><select data-choice="cls">${options(sorted(CLASSES), ch.cls, 'Elige una clase…')}</select></label>${body}</section>`;
  }

  function attrsPanel(ch) {
    const a = anc(ch);
    const b = bg(ch);
    const c = cls(ch);
    const cell = (kind, k, on, can, label) => `<button class="pf-boost ${on ? 'is-on' : ''}" data-boost="${kind}" data-attr="${k}" aria-pressed="${on}" ${can ? '' : 'disabled'} aria-label="${label} a ${ATTR[k].name}">${on ? '▲' : ''}</button>`;
    const fromLevels = [];
    const rows = ATTRS.map(([k, name, short]) => {
      const fixed = ancFixed(ch).includes(k);
      const flaw = ancFlaw(ch) === k;
      const ancCell = fixed ? '<span class="pf-boost is-on is-fixed" title="Mejora fija de la ascendencia">▲</span>'
        : flaw ? '<span class="pf-boost is-flaw" title="Defecto de la ascendencia">▼</span>'
        : ancFree(ch) ? cell('anc', k, ch.ancBoosts.includes(k), true, 'Mejora de ascendencia') : '<span class="pf-boost is-empty"></span>';
      const bgCell = b ? cell('bg', k, ch.bgBoosts.includes(k), true, 'Mejora de bagaje') : '<span class="pf-boost is-empty"></span>';
      const clsCell = c && c.key.includes(k) ? (c.key.length === 1 ? '<span class="pf-boost is-on is-fixed" title="Atributo clave">▲</span>' : cell('cls', k, ch.classBoost === k, true, 'Atributo clave')) : '<span class="pf-boost is-empty"></span>';
      const m = mod(ch, k);
      const lv = boosted(ch, k);
      if (lv.fromLevels) fromLevels.push(`${short} ${lv.fromLevels > 1 ? `×${lv.fromLevels}` : ''}${lv.half ? ' (una a medias)' : ''}`.replace('  ', ' ').trim());
      return `<div class="pf-attr-row ${b && b.attrs.includes(k) && b.attrs.length < 6 ? 'is-bg' : ''}"><span class="pf-attr-name"><b>${short}</b><small>${name}</small></span>${ancCell}${bgCell}${clsCell}${cell('free', k, ch.freeBoosts.includes(k), true, 'Mejora libre')}<b class="pf-attr-mod ${m > 0 ? 'is-up' : m < 0 ? 'is-down' : ''}">${signed(m)}</b></div>`;
    }).join('');
    return `<section class="pf-panel">${heading(5, term('pf-atributos', 'Atributos'), 'mejoras de nivel 1')}
      <p class="pf-note">Todos los modificadores empiezan en +0. Cada mejora suma +1 y el defecto resta 1; en un mismo apartado no puedes mejorar dos veces el mismo atributo. ${b && b.attrs.length < 6 ? `Una de las mejoras del bagaje va a ${boostList(b.attrs).replace(', ', ' o ')} (filas marcadas).` : ''}</p>
      <div class="pf-attrs"><div class="pf-attr-row pf-attr-head" aria-hidden="true"><span></span><span>Ascend.</span><span>Bagaje</span><span>Clase</span><span>Libres</span><span>Mod.</span></div>${rows}
        <div class="pf-attr-row pf-attr-foot"><span>Por repartir</span><span>${a ? leftBadge(ancFree(ch) - ch.ancBoosts.length, '✓') : '—'}</span><span>${b ? leftBadge(2 - ch.bgBoosts.length, '✓') : '—'}</span><span>${c ? leftBadge(ch.classBoost ? 0 : 1, '✓') : '—'}</span><span>${leftBadge(FREE_BOOSTS - ch.freeBoosts.length, '✓')}</span><span></span></div></div>
      ${level(ch) >= BOOST_LEVELS[0] ? `<p class="pf-note">El modificador ya cuenta las mejoras de los niveles ${BOOST_LEVELS.filter(l => l <= level(ch)).join(', ').replace(/, ([^,]*)$/, ' y $1')}${fromLevels.length ? `: ${esc(fromLevels.join(', '))}` : ', que aún no has repartido'}. Se eligen en «Nivel y progresión».</p>` : ''}</section>`;
  }

  function skillsPanel(ch) {
    const c = cls(ch);
    const left = skillPicks(ch) - picksSpent(ch);
    const rows = SKILL_KEYS.map(k => {
      const source = skillSource(ch, k);
      const locked = source === 'clase' || source === 'bagaje';
      const total = skillMod(ch, k);
      const r = skillRank(ch, k);
      return `<li class="${r ? 'is-trained' : ''}"><button class="pf-skill-pick" data-skill="${k}" aria-pressed="${Boolean(source)}" ${locked || !c ? 'disabled' : ''} title="${locked ? `Entrenada por ${source === 'clase' ? 'la clase' : 'el bagaje'}` : 'Entrenar esta habilidad'}">${source ? '●' : '○'}</button>
        <span class="pf-skill-name">${term(`pf-hab-${k}`, SKILLS[k][0])} <small>${ATTR[SKILLS[k][1]].short}</small>${rankTag(r)}</span><span class="pf-skill-src">${r ? `${RANK_SHORT[r]} · ${source || 'nivel'}` : 'N'}</span><button class="nd-roll-btn pf-skill-roll" data-pf-roll="sk:${k}" aria-label="Tirar ${esc(SKILLS[k][0])}"><b class="pf-skill-total">${signed(total)}</b></button></li>`;
    }).join('');
    const bgLore = bg(ch) ? (ch.bgLore || bg(ch).lore) : '';
    const loreRank = name => skillRank(ch, 'lore:' + name);
    const lores = [
      ...(bgLore ? [`<li class="is-trained"><span class="pf-skill-pick is-fixed">●</span><span class="pf-skill-name">Saber (${esc(bgLore)}) <small>INT</small>${rankTag(loreRank(bgLore))}</span><span class="pf-skill-src">${RANK_SHORT[loreRank(bgLore)]} · bagaje</span><button class="nd-roll-btn pf-skill-roll" data-pf-roll="lore:0" aria-label="Tirar Saber (${esc(bgLore)})"><b class="pf-skill-total">${signed(loreMod(ch, bgLore))}</b></button></li>`] : []),
      ...ch.lores.map((name, i) => `<li class="is-trained"><button class="pf-skill-pick" data-lore-del="${i}" aria-label="Quitar Saber (${esc(name)})">×</button><span class="pf-skill-name">Saber (${esc(name)}) <small>INT</small>${rankTag(loreRank(name))}</span><span class="pf-skill-src">${RANK_SHORT[loreRank(name)]} · elegida</span><button class="nd-roll-btn pf-skill-roll" data-pf-roll="lore:${i + (bgLore ? 1 : 0)}" aria-label="Tirar Saber (${esc(name)})"><b class="pf-skill-total">${signed(loreMod(ch, name))}</b></button></li>`)
    ].join('');
    return `<section class="pf-panel">${heading(6, 'Habilidades', level(ch) > 1 ? `nivel ${level(ch)}` : 'entrenadas a nivel 1')}
      <p class="pf-note">${c ? `Tu clase te deja entrenar ${skillPicks(ch)} habilidades más (${c.free} ${mod(ch, 'int') >= 0 ? '+' : '−'} ${Math.abs(mod(ch, 'int'))} por INT${bgSkill(ch) && classSkills(ch).includes(bgSkill(ch)) ? ', +1 porque el bagaje repite una de clase' : ''}${ch.heritage === 'Humano habilidoso' ? ', +1 por humano habilidoso' : ''}). Pulsa el círculo para entrenarla; también puedes gastar una en un Saber.` : 'Elige una clase para repartir habilidades.'} Entrenado suma +2 más el nivel; sin entrenar solo cuenta el atributo.${level(ch) > 2 ? ' Los aumentos de habilidad (experto, maestro, legendario) se eligen en «Nivel y progresión».' : ''}
        ${c ? `<span class="pf-pool">${leftBadge(left, 'Todo repartido')}</span>` : ''}</p>
      <ul class="pf-skills">${rows}</ul>
      <h3>Saberes</h3><ul class="pf-skills pf-lores">${lores || '<li class="pf-none">Sin Saberes todavía.</li>'}</ul>
      ${c ? '<div class="pf-lore-add"><input data-lore-name maxlength="40" placeholder="Saber nuevo: Absalom, Ingeniería…" aria-label="Nombre del Saber"><button class="pf-button ghost" data-lore-add>AÑADIR SABER</button></div>' : ''}</section>`;
  }

  // Casillas de la hoja calculada que asoman su regla al tocarlas.
  const STAT_RULES = { 'Clase de Armadura': 'pf-clase-armadura', 'Fortaleza': 'pf-salvaciones', 'Reflejos': 'pf-salvaciones', 'Voluntad': 'pf-salvaciones', 'Puntos de héroe': 'pf-puntos-heroe', 'CD de conjuros': 'pf-cd-conjuro', 'Cuerpo a cuerpo': 'pf-golpe', 'A distancia': 'pf-golpe', 'Ataque de conjuro': 'pf-golpe' };
  const ROLLABLE = { 'Percepción': 'perc', 'Fortaleza': 'fort', 'Reflejos': 'ref', 'Voluntad': 'vol', 'Cuerpo a cuerpo': 'melee', 'A distancia': 'ranged', 'Ataque de conjuro': 'spell' };
  function sheetPanel(ch) {
    const c = cls(ch);
    const a = anc(ch);
    const save = (attr, track) => (c ? signed(bonus(ch, attr, track)) : '—');
    const ac = armorClass(ch);
    const key = keyAttr(ch);
    const fue = mod(ch, 'fue');
    const stats = [
      ['Puntos de golpe', a && c ? hp(ch) : '—'], ['Clase de Armadura', c ? ac.total : '—'], ['Percepción', save('sab', 'perc')],
      ['Fortaleza', save('con', 'fort')], ['Reflejos', save('des', 'ref')], ['Voluntad', save('sab', 'vol')],
      ['Velocidad', a ? `${a.speed} pies` : '—'], ['CD de clase', c ? 10 + bonus(ch, key, 'dc') : '—'],
      ...(c?.spells ? [['Ataque de conjuro', signed(bonus(ch, key, 'spell'))], ['CD de conjuros', 10 + bonus(ch, key, 'spell')]] : []),
      ['Cuerpo a cuerpo', c ? signed(bonus(ch, 'fue', 'weapon')) : '—'], ['A distancia', c ? signed(bonus(ch, 'des', 'weapon')) : '—'],
      ['Impedimenta', `${5 + fue} / ${10 + fue}`], ['Puntos de héroe', 1], ['Tamaño', a?.size || '—'], ['Sentidos', a?.vision || '—']
    ];
    const armors = Object.entries(ARMORS).map(([k, v]) => [k, `${v.name}${v.ac ? ` (+${v.ac}, DES máx. ${v.cap})` : ''}${v.cat ? ` · ${ARMOR_CATS[v.cat]}` : ''}`]);
    return `<section class="pf-panel pf-sheet">${heading(7, 'Hoja calculada', esc(describe(ch)))}
      <div class="pf-stats">${stats.map(([k, v]) => { const roll = c && ROLLABLE[k]; return `<div><small>${term(STAT_RULES[k], k)}</small>${roll ? `<button class="nd-roll-btn" data-pf-roll="${roll}" aria-label="Tirar ${k}"><b>${esc(v)}</b></button>` : `<b>${esc(v)}</b>`}</div>`; }).join('')}</div>
      <label class="pf-field pf-field-wide"><span>Armadura</span><select data-choice="armor">${options(armors, ch.armor)}</select></label>
      ${c && !ac.trained ? '<p class="pf-note pf-warn">Tu clase no está entrenada en esa armadura: no sumas competencia a la CA.</p>' : ''}
      <p class="pf-note">Competencia: entrenado +2, experto +4, maestro +6 y legendario +8, más el nivel; sin entrenar, +0. Puntos de golpe: los de la ascendencia más los de la clase y CON por cada nivel${ch.hpBonus ? `, y ${ch.hpBonus} más por dotes` : ''}. CA: 10 + DES (hasta el máximo de la armadura) + competencia + armadura; un escudo alzado suma su bonificador. CD de clase: 10 + atributo clave + competencia. Impedimenta: impedido a partir de 5 + FUE y máximo 10 + FUE.</p><p class="pf-note">${manualLink('pf-competencia', 'Competencia')} ${manualLink('pf-clase-armadura', 'Clase de Armadura')} ${manualLink('pf-salvaciones', 'Salvaciones')} ${manualLink('pf-grados-exito', 'Grados de éxito')}</p></section>`;
  }

  function languagesPanel(ch) {
    const a = anc(ch);
    const extra = langCount(ch);
    return `<section class="pf-panel">${heading(8, 'Idiomas')}
      <p class="pf-note">${a ? `Hablas ${a.langs.join(', ').replace(/, ([^,]*)$/, ' y $1')}. ${extra ? `Puedes añadir ${extra} ${extra === 1 ? 'idioma' : 'idiomas'} más${a.extraLang ? ' (uno por ser humano y el resto por INT)' : ' por tu INT'}: ${LANGS.filter(l => !a.langs.includes(l)).join(', ').toLowerCase()}…` : 'Con más INT podrías aprender otros idiomas.'}` : 'Elige una ascendencia para ver tus idiomas.'}</p>
      <label class="pf-field pf-field-wide"><span>Idiomas adicionales</span><input data-text="languages" value="${esc(ch.languages)}" maxlength="120" placeholder="Separados por comas"></label></section>`;
  }

  const rankTag = r => (r > 1 ? ` <em class="pf-rank">${RANKS[r].toLowerCase()}</em>` : '');
  const targetName = t => (t.startsWith('lore:') ? `Saber (${t.slice(5)})` : SKILLS[t]?.[0] || t);

  // Lo que da un nivel por sí solo: puntos de golpe, competencias de la clase, conjuros y rasgos.
  function levelGains(ch, l) {
    const c = cls(ch);
    const con = mod(ch, 'con');
    const out = [`<b>+${c.hp + con} puntos de golpe</b> (${c.hp} de la clase ${con < 0 ? '−' : '+'} ${Math.abs(con)} de CON) y +1 a todo aquello en lo que tienes competencia.`];
    Object.entries(c.up || {}).forEach(([track, levels]) => {
      const i = levels.indexOf(l);
      if (i < 0) return;
      const base = track === 'dc' || track === 'spell' ? 1 : track === 'armor' ? c.unarmored || 1 : c[track] || 0;
      out.push(`<b>${TRACKS[track]}</b>: pasa a ${RANKS[Math.min(4, base + i + 1)].toLowerCase()}.`);
    });
    if (c.spec === l) out.push('<b>Especialización con armas</b>: +2 al daño con las armas en las que eres experto, +3 si eres maestro y +4 si eres legendario.');
    if (c.gspec === l) out.push('<b>Especialización mayor con armas</b>: el daño extra sube a +4, +6 y +8.');
    if (c.spells && c.slots) {
      if (l % 2 && l <= 17) out.push(`<b>Conjuros de rango ${(l + 1) / 2}</b>: ${c.slots[0]} espacios al día. Tus trucos suben también de rango.`);
      else if (l % 2 === 0 && l <= 18) out.push(`<b>Un espacio más</b> de rango ${l / 2}: ${c.slots[1]} al día.`);
    }
    (c.features || []).filter(f => f[0] === l).forEach(f => out.push(`<b>${esc(f[1])}</b>: ${esc(f[2])}`));
    return out;
  }
  // Lo que queda por elegir en un nivel (las dotes se apuntan, pero no cuentan como pendientes).
  function levelPending(ch, l) {
    let n = 0;
    if (BOOST_LEVELS.includes(l)) n += LEVEL_BOOSTS - (ch.lvBoosts[l] || []).length;
    if (upLevels(ch).includes(l) && !ch.skillUps[l]) n++;
    if (cls(ch).paths?.includes(l) && !ch.saveUps[l]) n++;
    return n;
  }
  function levelChoices(ch, l) {
    const c = cls(ch);
    const parts = [];
    if (BOOST_LEVELS.includes(l)) {
      const list = ch.lvBoosts[l] || [];
      // Para saber si una mejora de este nivel se queda a medias hay que mirar el modificador justo antes.
      const before = k => boosted({ ...ch, level: l - 1 }, k);
      parts.push(`<div class="pf-pick"><span>Cuatro mejoras de atributo, a cuatro atributos distintos ${leftBadge(LEVEL_BOOSTS - list.length, '✓')}</span><div class="pf-chips">${ATTRS.map(([k, name, short]) => {
        const b = before(k);
        const partial = b.mod >= 4 && !b.half;
        return `<button type="button" class="pf-chip ${list.includes(k) ? 'is-on' : ''}" data-lvboost="${l}" data-attr="${k}" data-lvkey="b${l}${k}" aria-pressed="${list.includes(k)}" aria-label="Mejora del nivel ${l} a ${name}${partial ? ', a medias' : ''}">${short}${partial ? ' <small>½</small>' : ''}</button>`;
      }).join('')}</div><small class="pf-pick-note">Con +4 o más, una mejora se queda a medias (½): hace falta otra, en un nivel posterior, para sumar +1.</small></div>`);
    }
    if (upLevels(ch).includes(l)) {
      const cap = maxSkillRank(l);
      const row = (t, name) => {
        const r = skillRank(ch, t, l - 1);
        if (r >= 4) return '';
        return `<option value="${esc(t)}" ${ch.skillUps[l] === t ? 'selected' : ''} ${r + 1 > cap ? 'disabled' : ''}>${esc(name)}: ${RANKS[r].toLowerCase()} → ${RANKS[r + 1].toLowerCase()}</option>`;
      };
      parts.push(`<label class="pf-field pf-pick"><span>Aumento de habilidad ${leftBadge(ch.skillUps[l] ? 0 : 1, '✓')}</span><select data-skillup="${l}" data-lvkey="s${l}"><option value="">Elige una habilidad…</option>${SKILL_KEYS.map(k => row(k, SKILLS[k][0])).join('')}${loreNames(ch).map(name => row('lore:' + name, `Saber (${name})`)).join('')}</select>${cap < 4 ? `<small class="pf-pick-note">${cap < 3 ? 'Maestro pide nivel 7 y legendario, nivel 15.' : 'Legendario pide nivel 15.'}</small>` : ''}</label>`);
    }
    if (c.paths?.includes(l)) {
      const i = c.paths.indexOf(l);
      const first = ch.saveUps[c.paths[0]];
      const second = ch.saveUps[c.paths[1]];
      const can = k => (i === 0 ? true : i === 1 ? k !== first : k === first || k === second);
      parts.push(`<label class="pf-field pf-pick"><span>${i === 2 ? 'Salvación que pasa a legendario' : 'Salvación que pasa a maestro'} ${leftBadge(ch.saveUps[l] ? 0 : 1, '✓')}</span><select data-saveup="${l}" data-lvkey="p${l}"><option value="">Elige una salvación…</option>${Object.entries(SAVES).map(([k, name]) => `<option value="${k}" ${ch.saveUps[l] === k ? 'selected' : ''} ${can(k) ? '' : 'disabled'}>${name}</option>`).join('')}</select></label>`);
    }
    const feats = featSlots(ch, l);
    if (feats.length) parts.push(`<div class="pf-lv-feats">${feats.map(([kind, label]) => `<label class="pf-field"><span>${label}</span><input data-lvfeat="${l}:${kind}" value="${esc(ch.lvFeats[`${l}:${kind}`] || '')}" maxlength="80" autocomplete="off" placeholder="Apunta la que elijas"></label>`).join('')}</div>`);
    return parts.join('');
  }
  function levelPanel(ch) {
    const c = cls(ch);
    const L = level(ch);
    const ready = Boolean(c && anc(ch));
    let timeline = '';
    if (ready && L > 1) {
      const rows = [];
      for (let l = L; l >= 2; l--) {
        const left = levelPending(ch, l);
        const open = lvOpen.has(l) ? lvOpen.get(l) : l === L || left > 0;
        rows.push(`<li><details class="pf-lv" data-lv="${l}" ${open ? 'open' : ''}><summary><b>Nivel ${l}</b>${left ? leftBadge(left) : ''}</summary><div class="pf-lv-body"><ul class="pf-gains">${levelGains(ch, l).map(g => `<li>${g}</li>`).join('')}</ul>${levelChoices(ch, l)}</div></details></li>`);
      }
      timeline = `<ol class="pf-timeline">${rows.join('')}</ol>`;
    }
    return `<section class="pf-panel pf-levels" data-levels>${heading(9, 'Nivel y progresión', c ? `${esc(c.name)} · nivel ${L}` : '')}
      <div class="pf-level"><span class="pf-level-num"><small>Nivel</small><b>${L}</b></span><button type="button" class="pf-button" data-levelup data-lvkey="up" ${L >= MAX_LEVEL ? 'disabled' : ''}>▲ ${L >= MAX_LEVEL ? 'NIVEL MÁXIMO' : `SUBIR AL NIVEL ${L + 1}`}</button><button type="button" class="pf-button ghost" data-leveldown data-lvkey="down" ${L <= 1 ? 'disabled' : ''}>▼ BAJAR UN NIVEL</button></div>
      <p class="pf-note">${ready ? 'Cada nivel suma los puntos de golpe de tu clase más CON y +1 a todo aquello en lo que tienes competencia. NEXO aplica solo lo que sube tu clase (Percepción, salvaciones, armas, defensa, CD y conjuros) y te deja elegir lo demás: mejoras de atributo, aumentos de habilidad y dotes.' : 'Elige una ascendencia y una clase para poder subir de nivel.'} ${manualLink('pf-subir-nivel', 'Subir de nivel en el manual')}</p>
      ${L > 1 ? `<label class="pf-field pf-field-wide"><span>Puntos de golpe extra por dotes</span><input type="number" min="0" max="400" inputmode="numeric" data-hpbonus value="${ch.hpBonus || 0}"></label>` : ''}
      ${timeline}</section>`;
  }

  function renderTracker() {
    const node = host?.querySelector('[data-tracker]');
    if (!node || !current) return;
    const rows = summary(current);
    const pending = rows.filter(r => r.left !== 0).length;
    node.innerHTML = `<div class="pf-tracker-head"><b>${pending > 1 ? `Quedan ${pending} apartados` : pending ? 'Queda 1 apartado' : 'Aventurero listo'}</b><span>Nivel ${level(current)}${cls(current) && anc(current) && level(current) < MAX_LEVEL ? ' <button type="button" class="pf-tracker-up" data-levelup aria-label="Subir de nivel">▲ SUBIR</button>' : ''}</span></div>
      <ul class="pf-pools">${rows.map(r => `<li class="${r.left === 0 ? 'is-done' : r.left < 0 ? 'is-over' : ''}"><span>${r.label}</span><b>${r.left === 0 ? '✓' : r.left}</b><small>/ ${r.budget}</small></li>`).join('')}</ul>`;
  }

  function renderSheet() {
    const ch = current;
    const sheet = host?.querySelector('[data-sheet]');
    if (!ch || !sheet) return;
    sanitize(ch);
    // Tras repintar, el foco vuelve al control de la progresión que se estaba usando.
    const focused = sheet.contains(document.activeElement) ? document.activeElement.dataset.lvkey : '';
    sheet.innerHTML = `<section class="pf-tracker" data-tracker></section>${ancestryPanel(ch)}${backgroundPanel(ch)}${classPanel(ch)}${attrsPanel(ch)}${skillsPanel(ch)}${sheetPanel(ch)}${languagesPanel(ch)}${levelPanel(ch)}`;
    renderTracker();
    if (focused) sheet.querySelector(`[data-lvkey="${focused}"]`)?.focus({ preventScroll: true });

    sheet.querySelectorAll('[data-levelup]').forEach(button => button.addEventListener('click', levelUp));
    sheet.querySelector('[data-leveldown]')?.addEventListener('click', levelDown);
    sheet.querySelectorAll('[data-lv]').forEach(details => details.addEventListener('toggle', () => lvOpen.set(Number(details.dataset.lv), details.open)));
    sheet.querySelectorAll('[data-lvboost]').forEach(button => button.addEventListener('click', () => toggleLevelBoost(Number(button.dataset.lvboost), button.dataset.attr)));
    sheet.querySelectorAll('[data-skillup]').forEach(select => select.addEventListener('change', () => {
      const l = Number(select.dataset.skillup);
      if (select.value) current.skillUps[l] = select.value; else delete current.skillUps[l];
      lvOpen.set(l, true);
      changed();
    }));
    sheet.querySelectorAll('[data-saveup]').forEach(select => select.addEventListener('change', () => {
      const l = Number(select.dataset.saveup);
      if (select.value) current.saveUps[l] = select.value; else delete current.saveUps[l];
      lvOpen.set(l, true);
      changed();
    }));
    sheet.querySelectorAll('[data-lvfeat]').forEach(input => input.addEventListener('input', () => {
      const text = input.value.slice(0, 80);
      if (text.trim()) current.lvFeats[input.dataset.lvfeat] = text; else delete current.lvFeats[input.dataset.lvfeat];
      scheduleSave();
    }));
    sheet.querySelector('[data-hpbonus]')?.addEventListener('change', event => {
      current.hpBonus = Math.max(0, Math.min(400, Math.trunc(Number(event.target.value)) || 0));
      changed();
    });

    sheet.querySelectorAll('[data-choice]').forEach(select => select.addEventListener('change', () => {
      current[select.dataset.choice] = select.value;
      if (select.dataset.choice === 'background') { current.bgLore = ''; current.bgSkill = ''; current.bgBoosts = []; }
      changed();
    }));
    sheet.querySelector('[data-alt]')?.addEventListener('change', event => { current.altBoosts = event.target.checked; current.ancBoosts = []; changed(); });
    sheet.querySelectorAll('[data-text]').forEach(input => input.addEventListener('input', () => { current[input.dataset.text] = input.value; scheduleSave(); }));
    sheet.querySelector('[data-text="bgLore"]')?.addEventListener('change', () => changed());
    sheet.querySelectorAll('[data-boost]').forEach(button => button.addEventListener('click', () => toggleBoost(button.dataset.boost, button.dataset.attr)));
    sheet.querySelectorAll('[data-pf-roll]').forEach(button => button.addEventListener('click', () => rollFromSheet(button.dataset.pfRoll)));
    sheet.querySelectorAll('[data-skill]').forEach(button => button.addEventListener('click', () => toggleSkill(button.dataset.skill)));
    sheet.querySelectorAll('[data-lore-del]').forEach(button => button.addEventListener('click', () => { current.lores.splice(Number(button.dataset.loreDel), 1); changed(); }));
    const loreInput = sheet.querySelector('[data-lore-name]');
    sheet.querySelector('[data-lore-add]')?.addEventListener('click', () => addLore(loreInput.value));
    loreInput?.addEventListener('keydown', event => { if (event.key === 'Enter') addLore(loreInput.value); });
    juego?.render(host.querySelector('[data-play]'));
    host.querySelectorAll('[data-np-open]').forEach(button => { button.hidden = !playModel(ch); });
  }

  function ensureHost() {
    if (host) return;
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Alegreya:ital,wght@0,400;0,700;1,400&display=swap';
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './src/pathfinder/pathfinder.css?v=4';
    document.head.append(fonts, stylesheet);
    host = document.createElement('section');
    host.id = 'nexoPathfinder';
    host.className = 'pf';
    host.hidden = true;
    host.setAttribute('aria-label', 'NEXO Pathfinder');
    document.body.append(host);
    ap?.mount(host);
    kit?.mount(host);
    host.addEventListener('keydown', event => {
      if (event.key === 'Escape') host.querySelectorAll('.pf-modal').forEach(modal => { modal.hidden = true; });
    });
  }
  function open(options = {}) {
    ensureHost();
    exitHandler = options.onExit || null;
    store = load();
    ap?.reset();
    renderList();
    const requested = options.characterId && store.characters.find(ch => ch.id === options.characterId);
    if (requested) { openEditor(requested); ap?.at(requested.id); }
    host.hidden = false;
    pullFromCloud();
    document.documentElement.classList.add('nexo-pathfinder-open');
  }
  function close() {
    flushSave();
    window.NEXO_DICE?.close();
    window.NEXO_NAV?.reset?.();
    current = null;
    host.hidden = true;
    document.documentElement.classList.remove('nexo-pathfinder-open');
    if (exitHandler) exitHandler();
  }
  window.addEventListener('pagehide', flushSave);

  // Resumen de las fichas para el perfil.
  const list = () => load().characters.map(ch => ({ id: ch.id, name: ch.name, summary: describe(ch) }));

  window.NEXO_PATHFINDER = { open, close, list };
})();
