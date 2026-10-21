/*
 * NEXO · Pathfinder 2ª edición (Remaster: Player Core 1 y 2).
 * Creador de personajes de nivel 1: ascendencia y herencia, bagaje, clase, mejoras de atributo,
 * habilidades entrenadas, idiomas y hoja calculada. Los textos son resúmenes propios.
 */
(() => {
  const KEY = 'nexo-pathfinder-v1';
  const GAME = 'pathfinder';
  const LEVEL = 1;
  const FREE_BOOSTS = 4;

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
    clerigo: { name: 'Clérigo', key: ['sab'], hp: 8, perc: 1, fort: 1, ref: 1, vol: 2, skills: ['religion'], free: 3, armor: 0, weapon: 1, spells: 'Divina', sub: 'Doctrina: sacerdote de claustro o sacerdote guerrero (suma armadura ligera y media)', text: 'Canaliza el poder de su dios para curar, proteger o castigar.' },
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
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

  let host = null;
  let store = load();
  let current = null;
  let exitHandler = null;
  let saveTimer = 0;
  let manualBook = null;

  // Apartados: Personajes, Campañas y Manual (src/nexo/apartados.js y src/pathfinder/pathfinder-manual.js).
  const ap = window.NEXO_APARTADOS?.create({
    prefix: 'pf', system: () => GAME, frame: body => frame(body),
    leave: () => { flushSave(); current = null; }, renderCharacters: () => renderList(),
    characters: () => store.characters.map(ch => ({ id: ch.id, name: ch.name || 'Aventurero sin nombre', summary: describe(ch) })),
    openCharacter: id => { const ch = store.characters.find(item => item.id === id); if (ch) openEditor(ch); else renderList(); },
    currentId: () => current?.id,
    manual: () => manualBook || (manualBook = window.NEXO_MANUALS?.pathfinder?.({ ATTR, RANKS, SKILLS, ANCESTRIES, BACKGROUNDS, CLASSES }) || null),
    words: { campaigns: 'Tus campañas', characters: 'aventureros', character: 'aventurero' }
  });
  const manualLink = (id, label) => ap?.link(id, label) || '';

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
      return { characters: Array.isArray(parsed.characters) ? parsed.characters.map(normalize) : [] };
    } catch { return { characters: [] }; }
  }
  function normalize(ch) {
    const out = { ...newCharacter(), ...ch };
    ['ancBoosts', 'bgBoosts', 'freeBoosts', 'freeSkills', 'lores'].forEach(k => { out[k] = Array.isArray(ch[k]) ? ch[k] : []; });
    return out;
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { return false; }
    window.NEXO_CLOUD?.save(GAME, KEY, store).then(ok => {
      if (ok !== null) setStatus(ok ? 'GUARDADO EN LA NUBE' : 'SIN CONEXIÓN · GUARDADO EN ESTE DISPOSITIVO');
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
      feats: '', gear: '', notes: ''
    };
  }

  // Valores derivados
  const anc = ch => ANCESTRIES[ch.ancestry];
  const bg = ch => BACKGROUNDS[ch.background];
  const cls = ch => CLASSES[ch.cls];
  const ancFixed = ch => (anc(ch) && !ch.altBoosts ? anc(ch).boosts : []);
  const ancFree = ch => (!anc(ch) ? 0 : ch.altBoosts ? 2 : anc(ch).free);
  const ancFlaw = ch => (anc(ch) && !ch.altBoosts ? anc(ch).flaw : '');
  function mod(ch, k) {
    let n = 0;
    if (ancFixed(ch).includes(k)) n++;
    if (ch.ancBoosts.includes(k)) n++;
    if (ch.bgBoosts.includes(k)) n++;
    if (ch.classBoost === k) n++;
    if (ch.freeBoosts.includes(k)) n++;
    if (ancFlaw(ch) === k) n--;
    return n;
  }
  const prof = rank => (rank ? rank * 2 + LEVEL : 0);
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
  const skillMod = (ch, k) => mod(ch, SKILLS[k][1]) + prof(skillSource(ch, k) ? 1 : 0);
  const loreMod = ch => mod(ch, 'int') + prof(1);
  const hp = ch => (anc(ch)?.hp || 0) + ((cls(ch)?.hp || 0) + mod(ch, 'con')) * LEVEL;
  const keyAttr = ch => cls(ch) ? (cls(ch).key.length === 1 ? cls(ch).key[0] : ch.classBoost || cls(ch).key[0]) : '';
  function armorClass(ch) {
    const a = ARMORS[ch.armor] || ARMORS.sin;
    const c = cls(ch);
    const rank = a.cat === 0 ? (c?.unarmored || 1) : (c && c.armor >= a.cat ? 1 : 0);
    const dex = a.cap === null ? mod(ch, 'des') : Math.min(mod(ch, 'des'), a.cap);
    return { total: 10 + dex + prof(rank) + a.ac, trained: rank > 0 };
  }
  function langCount(ch) {
    if (!anc(ch)) return 0;
    return Math.max(0, mod(ch, 'int')) + (anc(ch).extraLang || 0);
  }

  function sanitize(ch) {
    if (!ANCESTRIES[ch.ancestry]) ch.ancestry = '';
    if (!BACKGROUNDS[ch.background]) ch.background = '';
    if (!CLASSES[ch.cls]) ch.cls = '';
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
    const taken = new Set([...classSkills(ch), bgSkill(ch)]);
    ch.freeSkills = ch.freeSkills.filter((k, i) => SKILLS[k] && !taken.has(k) && ch.freeSkills.indexOf(k) === i);
    ch.lores = ch.lores.map(s => String(s).trim()).filter(Boolean);
    const room = skillPicks(ch);
    if (picksSpent(ch) > room) {
      ch.freeSkills = ch.freeSkills.slice(0, room);
      ch.lores = ch.lores.slice(0, Math.max(0, room - ch.freeSkills.length));
    }
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
    return rows;
  }
  const isComplete = ch => summary(ch).every(row => row.left === 0);
  function describe(ch) {
    const parts = [anc(ch)?.name, cls(ch)?.name, cls(ch) ? `nivel ${LEVEL}` : ''].filter(Boolean);
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
      items.push(['perc', 'Percepción', mod(ch, 'sab') + prof(c.perc)], ['fort', 'Fortaleza', mod(ch, 'con') + prof(c.fort)], ['ref', 'Reflejos', mod(ch, 'des') + prof(c.ref)], ['vol', 'Voluntad', mod(ch, 'sab') + prof(c.vol)],
        ['melee', 'Ataque cuerpo a cuerpo', mod(ch, 'fue') + prof(c.weapon)], ['ranged', 'Ataque a distancia', mod(ch, 'des') + prof(c.weapon)]);
      if (c.spells) items.push(['spell', 'Ataque de conjuro', mod(ch, keyAttr(ch)) + prof(1)]);
    }
    SKILL_KEYS.forEach(k => items.push(['sk:' + k, SKILLS[k][0], skillMod(ch, k)]));
    const bgLore = bg(ch) ? (ch.bgLore || bg(ch).lore) : '';
    [bgLore, ...ch.lores].filter(Boolean).forEach((name, i) => items.push(['lore:' + i, `Saber (${name})`, loreMod(ch)]));
    return items;
  }
  function diceSources() { return current ? [{ label: 'Tirada de la ficha', items: diceItems(current), show: signed }] : []; }
  function rollFromSheet(key) {
    const item = diceItems(current).find(([k]) => k === key);
    if (item) window.NEXO_DICE?.roll('pathfinder', { mod: item[2], label: item[1] });
  }

  function renderList() {
    flushSave();
    current = null;
    const rows = store.characters;
    const cards = rows.length ? rows.map(ch => {
      const done = isComplete(ch);
      return `<button class="pf-card" data-open="${esc(ch.id)}"><span class="pf-card-mark" aria-hidden="true">${window.NEXO_ICONS?.pathfinder || ''}</span><span class="pf-card-copy"><b>${esc(ch.name || 'Aventurero sin nombre')}</b><small>${esc(describe(ch))}</small></span><span class="pf-badge ${done ? 'is-done' : ''}">${done ? 'Listo' : 'En curso'}</span></button>`;
    }).join('') : `<div class="pf-empty"><span aria-hidden="true">${window.NEXO_ICONS?.pathfinder || ''}</span><b>Aún no hay aventureros</b><small>Pulsa «Nuevo aventurero» para crear tu primer personaje.</small></div>`;
    frame(`${ap?.tabs('personajes') || ''}<p class="pf-kicker">NEXO / PATHFINDER · 2ª EDICIÓN REMASTER</p><h1>Tus <em>aventureros</em></h1><p class="pf-intro">Crea personajes de nivel 1 para Golarion: ascendencia y herencia, bagaje, clase, mejoras de atributo y habilidades entrenadas. NEXO calcula puntos de golpe, Clase de Armadura, Percepción, salvaciones, CD de clase y de conjuros, y guarda las fichas en este dispositivo y en tu cuenta.</p><div class="pf-actions"><button class="pf-button" data-new>NUEVO AVENTURERO</button><button class="pf-button ghost" data-exit>← VOLVER A LA MESA</button></div><div class="pf-list">${cards}</div><p class="pf-quote">«Explora, informa, coopera.»</p>`);
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
    const saved = store.characters.some(item => item.id === ch.id);
    frame(`<div class="pf-editor-head"><button class="pf-button ghost" data-back>← TUS AVENTUREROS</button><button class="pf-button danger" data-delete ${saved ? '' : 'hidden'}>BORRAR FICHA</button></div>
      <section class="pf-panel">${heading(1, 'Aventurero', 'datos básicos')}<div class="pf-fields">
        ${field('Nombre', 'name', { placeholder: 'Nombre del personaje' })}${field('Jugador', 'player')}${field('Campaña', 'campaign')}
        ${field('Dios o filosofía', 'deity', { placeholder: 'Iomedae, Desna, ninguno…' })}${field('Edad', 'age')}${field('Edictos y anatemas', 'edicts', { placeholder: 'Lo que defiendes y lo que nunca harías' })}
      </div></section>
      <div data-sheet></div>
      <section class="pf-panel">${heading(9, 'Dotes, equipo y notas')}<div class="pf-fields pf-fields-3">
        ${field('Dotes y rasgos de nivel 1', 'feats', { area: true, rows: 6, placeholder: 'Dote de ascendencia, dote de clase, rasgos de la subclase…' })}${field('Equipo', 'gear', { area: true, rows: 6, placeholder: 'Empiezas con 15 po: armas, armadura, mochila, cuerda, raciones…' })}${field('Notas', 'notes', { area: true, rows: 6, placeholder: 'Historia, contactos, objetivos…' })}</div></section>
      <div class="pf-modal" data-modal hidden><div class="pf-modal-card" role="alertdialog" aria-modal="true" aria-labelledby="pfDelTitle"><h3 id="pfDelTitle">¿Borrar este aventurero?</h3><p>La ficha se borrará de este dispositivo y de tu cuenta, y no se podrá recuperar.</p><div class="pf-actions"><button class="pf-button ghost" data-cancel>CANCELAR</button><button class="pf-button danger" data-confirm>BORRAR FICHA</button></div></div></div>`, saved ? 'GUARDADO EN ESTE DISPOSITIVO' : 'FICHA NUEVA · SIN GUARDAR');

    host.querySelector('[data-back]').addEventListener('click', renderList);
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
      const rank = r => RANKS[r].toLowerCase();
      body = `<p class="pf-narr">${esc(c.text)} ${manualLink(`pf-cls-${ch.cls}`, 'Leer en el manual')}</p>
        <dl class="pf-info"><div><dt>Atributo clave</dt><dd>${c.key.map(k => ATTR[k].name).join(' o ')}</dd></div><div><dt>Puntos de golpe</dt><dd>${c.hp} + CON por nivel</dd></div>
          <div><dt>Percepción</dt><dd>${rank(c.perc)}</dd></div><div><dt>Salvaciones</dt><dd>Fortaleza ${rank(c.fort)}, Reflejos ${rank(c.ref)}, Voluntad ${rank(c.vol)}</dd></div>
          <div><dt>Habilidades</dt><dd>${[...c.skills.map(k => SKILLS[k][0]), `${c.free} más + INT`].join(', ')}</dd></div>
          <div><dt>Defensa</dt><dd>${c.armor ? `Armadura ${ARMOR_CATS.slice(1, c.armor + 1).join(', ').replace(/, ([^,]*)$/, ' y $1')} y sin armadura` : `Solo sin armadura${c.unarmored === 2 ? ' (experto)' : ''}`}</dd></div>
          ${c.spells ? `<div><dt>Conjuros</dt><dd>Tradición ${esc(c.spells.toLowerCase())}</dd></div>` : ''}</dl>
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
    const rows = ATTRS.map(([k, name, short]) => {
      const fixed = ancFixed(ch).includes(k);
      const flaw = ancFlaw(ch) === k;
      const ancCell = fixed ? '<span class="pf-boost is-on is-fixed" title="Mejora fija de la ascendencia">▲</span>'
        : flaw ? '<span class="pf-boost is-flaw" title="Defecto de la ascendencia">▼</span>'
        : ancFree(ch) ? cell('anc', k, ch.ancBoosts.includes(k), true, 'Mejora de ascendencia') : '<span class="pf-boost is-empty"></span>';
      const bgCell = b ? cell('bg', k, ch.bgBoosts.includes(k), true, 'Mejora de bagaje') : '<span class="pf-boost is-empty"></span>';
      const clsCell = c && c.key.includes(k) ? (c.key.length === 1 ? '<span class="pf-boost is-on is-fixed" title="Atributo clave">▲</span>' : cell('cls', k, ch.classBoost === k, true, 'Atributo clave')) : '<span class="pf-boost is-empty"></span>';
      const m = mod(ch, k);
      return `<div class="pf-attr-row ${b && b.attrs.includes(k) && b.attrs.length < 6 ? 'is-bg' : ''}"><span class="pf-attr-name"><b>${short}</b><small>${name}</small></span>${ancCell}${bgCell}${clsCell}${cell('free', k, ch.freeBoosts.includes(k), true, 'Mejora libre')}<b class="pf-attr-mod ${m > 0 ? 'is-up' : m < 0 ? 'is-down' : ''}">${signed(m)}</b></div>`;
    }).join('');
    return `<section class="pf-panel">${heading(5, 'Atributos', 'mejoras de nivel 1')}
      <p class="pf-note">Todos los modificadores empiezan en +0. Cada mejora suma +1 y el defecto resta 1; en un mismo apartado no puedes mejorar dos veces el mismo atributo. ${b && b.attrs.length < 6 ? `Una de las mejoras del bagaje va a ${boostList(b.attrs).replace(', ', ' o ')} (filas marcadas).` : ''}</p>
      <div class="pf-attrs"><div class="pf-attr-row pf-attr-head" aria-hidden="true"><span></span><span>Ascend.</span><span>Bagaje</span><span>Clase</span><span>Libres</span><span>Mod.</span></div>${rows}
        <div class="pf-attr-row pf-attr-foot"><span>Por repartir</span><span>${a ? leftBadge(ancFree(ch) - ch.ancBoosts.length, '✓') : '—'}</span><span>${b ? leftBadge(2 - ch.bgBoosts.length, '✓') : '—'}</span><span>${c ? leftBadge(ch.classBoost ? 0 : 1, '✓') : '—'}</span><span>${leftBadge(FREE_BOOSTS - ch.freeBoosts.length, '✓')}</span><span></span></div></div></section>`;
  }

  function skillsPanel(ch) {
    const c = cls(ch);
    const left = skillPicks(ch) - picksSpent(ch);
    const rows = SKILL_KEYS.map(k => {
      const source = skillSource(ch, k);
      const locked = source === 'clase' || source === 'bagaje';
      const total = skillMod(ch, k);
      return `<li class="${source ? 'is-trained' : ''}"><button class="pf-skill-pick" data-skill="${k}" aria-pressed="${Boolean(source)}" ${locked || !c ? 'disabled' : ''} title="${locked ? `Entrenada por ${source === 'clase' ? 'la clase' : 'el bagaje'}` : 'Entrenar esta habilidad'}">${source ? '●' : '○'}</button>
        <span class="pf-skill-name">${esc(SKILLS[k][0])} <small>${ATTR[SKILLS[k][1]].short}</small></span><span class="pf-skill-src">${source ? `${RANK_SHORT[1]} · ${source}` : 'N'}</span><button class="nd-roll-btn pf-skill-roll" data-pf-roll="sk:${k}" aria-label="Tirar ${esc(SKILLS[k][0])}"><b class="pf-skill-total">${signed(total)}</b></button></li>`;
    }).join('');
    const bgLore = bg(ch) ? (ch.bgLore || bg(ch).lore) : '';
    const lores = [
      ...(bgLore ? [`<li class="is-trained"><span class="pf-skill-pick is-fixed">●</span><span class="pf-skill-name">Saber (${esc(bgLore)}) <small>INT</small></span><span class="pf-skill-src">E · bagaje</span><button class="nd-roll-btn pf-skill-roll" data-pf-roll="lore:0" aria-label="Tirar Saber (${esc(bgLore)})"><b class="pf-skill-total">${signed(loreMod(ch))}</b></button></li>`] : []),
      ...ch.lores.map((name, i) => `<li class="is-trained"><button class="pf-skill-pick" data-lore-del="${i}" aria-label="Quitar Saber (${esc(name)})">×</button><span class="pf-skill-name">Saber (${esc(name)}) <small>INT</small></span><span class="pf-skill-src">E · elegida</span><button class="nd-roll-btn pf-skill-roll" data-pf-roll="lore:${i + (bgLore ? 1 : 0)}" aria-label="Tirar Saber (${esc(name)})"><b class="pf-skill-total">${signed(loreMod(ch))}</b></button></li>`)
    ].join('');
    return `<section class="pf-panel">${heading(6, 'Habilidades', 'entrenadas a nivel 1')}
      <p class="pf-note">${c ? `Tu clase te deja entrenar ${skillPicks(ch)} habilidades más (${c.free} ${mod(ch, 'int') >= 0 ? '+' : '−'} ${Math.abs(mod(ch, 'int'))} por INT${bgSkill(ch) && classSkills(ch).includes(bgSkill(ch)) ? ', +1 porque el bagaje repite una de clase' : ''}${ch.heritage === 'Humano habilidoso' ? ', +1 por humano habilidoso' : ''}). Pulsa el círculo para entrenarla; también puedes gastar una en un Saber.` : 'Elige una clase para repartir habilidades.'} Entrenado suma +2 más el nivel; sin entrenar solo cuenta el atributo.
        ${c ? `<span class="pf-pool">${leftBadge(left, 'Todo repartido')}</span>` : ''}</p>
      <ul class="pf-skills">${rows}</ul>
      <h3>Saberes</h3><ul class="pf-skills pf-lores">${lores || '<li class="pf-none">Sin Saberes todavía.</li>'}</ul>
      ${c ? '<div class="pf-lore-add"><input data-lore-name maxlength="40" placeholder="Saber nuevo: Absalom, Ingeniería…" aria-label="Nombre del Saber"><button class="pf-button ghost" data-lore-add>AÑADIR SABER</button></div>' : ''}</section>`;
  }

  const ROLLABLE = { 'Percepción': 'perc', 'Fortaleza': 'fort', 'Reflejos': 'ref', 'Voluntad': 'vol', 'Cuerpo a cuerpo': 'melee', 'A distancia': 'ranged', 'Ataque de conjuro': 'spell' };
  function sheetPanel(ch) {
    const c = cls(ch);
    const a = anc(ch);
    const save = (attr, rank) => (c ? signed(mod(ch, attr) + prof(rank)) : '—');
    const ac = armorClass(ch);
    const key = keyAttr(ch);
    const fue = mod(ch, 'fue');
    const stats = [
      ['Puntos de golpe', a && c ? hp(ch) : '—'], ['Clase de Armadura', c ? ac.total : '—'], ['Percepción', save('sab', c?.perc)],
      ['Fortaleza', save('con', c?.fort)], ['Reflejos', save('des', c?.ref)], ['Voluntad', save('sab', c?.vol)],
      ['Velocidad', a ? `${a.speed} pies` : '—'], ['CD de clase', c ? 10 + mod(ch, key) + prof(1) : '—'],
      ...(c?.spells ? [['Ataque de conjuro', signed(mod(ch, key) + prof(1))], ['CD de conjuros', 10 + mod(ch, key) + prof(1)]] : []),
      ['Cuerpo a cuerpo', c ? signed(fue + prof(c.weapon)) : '—'], ['A distancia', c ? signed(mod(ch, 'des') + prof(c.weapon)) : '—'],
      ['Impedimenta', `${5 + fue} / ${10 + fue}`], ['Puntos de héroe', 1], ['Tamaño', a?.size || '—'], ['Sentidos', a?.vision || '—']
    ];
    const armors = Object.entries(ARMORS).map(([k, v]) => [k, `${v.name}${v.ac ? ` (+${v.ac}, DES máx. ${v.cap})` : ''}${v.cat ? ` · ${ARMOR_CATS[v.cat]}` : ''}`]);
    return `<section class="pf-panel pf-sheet">${heading(7, 'Hoja calculada', esc(describe(ch)))}
      <div class="pf-stats">${stats.map(([k, v]) => { const roll = c && ROLLABLE[k]; return `<div><small>${k}</small>${roll ? `<button class="nd-roll-btn" data-pf-roll="${roll}" aria-label="Tirar ${k}"><b>${esc(v)}</b></button>` : `<b>${esc(v)}</b>`}</div>`; }).join('')}</div>
      <label class="pf-field pf-field-wide"><span>Armadura</span><select data-choice="armor">${options(armors, ch.armor)}</select></label>
      ${c && !ac.trained ? '<p class="pf-note pf-warn">Tu clase no está entrenada en esa armadura: no sumas competencia a la CA.</p>' : ''}
      <p class="pf-note">Competencia: entrenado +2, experto +4, maestro +6 y legendario +8, más el nivel; sin entrenar, +0. Puntos de golpe: los de la ascendencia más los de la clase y CON por nivel. CA: 10 + DES (hasta el máximo de la armadura) + competencia + armadura; un escudo alzado suma su bonificador. CD de clase: 10 + atributo clave + competencia. Impedimenta: impedido a partir de 5 + FUE y máximo 10 + FUE.</p><p class="pf-note">${manualLink('pf-competencia', 'Competencia')} ${manualLink('pf-clase-armadura', 'Clase de Armadura')} ${manualLink('pf-salvaciones', 'Salvaciones')} ${manualLink('pf-grados-exito', 'Grados de éxito')}</p></section>`;
  }

  function languagesPanel(ch) {
    const a = anc(ch);
    const extra = langCount(ch);
    return `<section class="pf-panel">${heading(8, 'Idiomas')}
      <p class="pf-note">${a ? `Hablas ${a.langs.join(', ').replace(/, ([^,]*)$/, ' y $1')}. ${extra ? `Puedes añadir ${extra} ${extra === 1 ? 'idioma' : 'idiomas'} más${a.extraLang ? ' (uno por ser humano y el resto por INT)' : ' por tu INT'}: ${LANGS.filter(l => !a.langs.includes(l)).join(', ').toLowerCase()}…` : 'Con más INT podrías aprender otros idiomas.'}` : 'Elige una ascendencia para ver tus idiomas.'}</p>
      <label class="pf-field pf-field-wide"><span>Idiomas adicionales</span><input data-text="languages" value="${esc(ch.languages)}" maxlength="120" placeholder="Separados por comas"></label></section>`;
  }

  function renderTracker() {
    const node = host?.querySelector('[data-tracker]');
    if (!node || !current) return;
    const rows = summary(current);
    const pending = rows.filter(r => r.left !== 0).length;
    node.innerHTML = `<div class="pf-tracker-head"><b>${pending > 1 ? `Quedan ${pending} apartados` : pending ? 'Queda 1 apartado' : 'Aventurero listo'}</b><span>Nivel ${LEVEL}</span></div>
      <ul class="pf-pools">${rows.map(r => `<li class="${r.left === 0 ? 'is-done' : r.left < 0 ? 'is-over' : ''}"><span>${r.label}</span><b>${r.left === 0 ? '✓' : r.left}</b><small>/ ${r.budget}</small></li>`).join('')}</ul>`;
  }

  function renderSheet() {
    const ch = current;
    const sheet = host?.querySelector('[data-sheet]');
    if (!ch || !sheet) return;
    sanitize(ch);
    sheet.innerHTML = `<section class="pf-tracker" data-tracker></section>${ancestryPanel(ch)}${backgroundPanel(ch)}${classPanel(ch)}${attrsPanel(ch)}${skillsPanel(ch)}${sheetPanel(ch)}${languagesPanel(ch)}`;
    renderTracker();

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
  }

  function ensureHost() {
    if (host) return;
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Alegreya:ital,wght@0,400;0,700;1,400&display=swap';
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './src/pathfinder/pathfinder.css?v=1';
    document.head.append(fonts, stylesheet);
    host = document.createElement('section');
    host.id = 'nexoPathfinder';
    host.className = 'pf';
    host.hidden = true;
    host.setAttribute('aria-label', 'NEXO Pathfinder');
    document.body.append(host);
    ap?.mount(host);
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
