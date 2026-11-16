/*
 * NEXO · El Archivo de las Tormentas (juego de rol del Cosmere, Manual de Stormlight).
 * Creador de personajes: ascendencia, culturas, camino heroico, 12 puntos de atributo, 4 rangos
 * de habilidad, pericias y camino radiante, y subida de nivel del 1 al 20 con la tabla de
 * progresión. Los textos son resúmenes propios.
 */
(() => {
  const KEY = 'nexo-tormentas-v1';
  const GAME = 'tormentas';
  const ATTR_POINTS = 12;
  const SKILL_RANKS = 4;
  const CULTURE_PICKS = 2;
  const MAX_LEVEL = 20;
  const MAX_IDEAL = 5;
  // Tabla de progresión (resumen propio): lo que da cada nivel por encima del 1. Cada cinco niveles
  // empieza un escalón, que sube el rango máximo de las habilidades y vuelve a sumar la Fuerza a la salud.
  const ATTR_LEVELS = [3, 6, 9, 12, 15, 18];
  const LEVEL_RANKS = 2;
  const TIER_HEALTH = [5, 4, 3, 2];
  const TIER_RANK = [2, 3, 4, 5];
  const ATTR_MAX = 10;
  const RANK_MAX = 5;
  const EXTRAS = [['attrBonus', 'Puntos de atributo', 20], ['rankBonus', 'Rangos de habilidad', 80], ['healthBonus', 'Salud', 300]];
  const tierOf = level => Math.min(TIER_RANK.length, Math.ceil(level / 5));
  const tierStart = level => level > 1 && level % 5 === 1;
  const tableAttrs = level => ATTR_LEVELS.filter(l => l <= level).length;
  const tableRanks = level => LEVEL_RANKS * (level - 1);
  const tableHealth = level => { let total = 0; for (let l = 2; l <= level; l += 1) total += TIER_HEALTH[tierOf(l) - 1]; return total; };
  // A nivel 1 los botones no dejan pasar de 3 en un atributo ni de rango 2 en una habilidad. Después
  // la tabla marca 5 en los atributos y el rango del escalón en las habilidades, pero eso solo avisa:
  // una forma de cantor o una decisión de la mesa pueden pasarlo.
  const ATTR_TABLE = 5;
  const attrCap = ch => (ch.level > 1 ? ATTR_MAX : 3);
  const rankCap = ch => TIER_RANK[tierOf(ch.level) - 1];
  const rankLimit = ch => (ch.level > 1 ? RANK_MAX : TIER_RANK[0]);

  const REALMS = [['fisico', 'Físico', 'Defensa física'], ['cognitivo', 'Cognitivo', 'Defensa cognitiva'], ['espiritual', 'Espiritual', 'Defensa espiritual']];
  const ATTRS = [['fue', 'Fuerza', 'FUE', 'fisico'], ['vel', 'Velocidad', 'VEL', 'fisico'], ['int', 'Intelecto', 'INT', 'cognitivo'], ['vol', 'Voluntad', 'VOL', 'cognitivo'], ['cns', 'Consciencia', 'CNS', 'espiritual'], ['pre', 'Presencia', 'PRE', 'espiritual']];
  const AT = Object.fromEntries(ATTRS.map(([k, name, short, realm]) => [k, { name, short, realm }]));
  const SKILLS = {
    agilidad: ['Agilidad', 'vel'], atletismo: ['Atletismo', 'fue'], armas_pesadas: ['Armas pesadas', 'fue'], armas_ligeras: ['Armas ligeras', 'vel'], sigilo: ['Sigilo', 'vel'], latrocinio: ['Latrocinio', 'vel'],
    artesania: ['Artesanía', 'int'], deduccion: ['Deducción', 'int'], disciplina: ['Disciplina', 'vol'], intimidacion: ['Intimidación', 'vol'], saber: ['Saber', 'int'], medicina: ['Medicina', 'int'],
    engano: ['Engaño', 'pre'], perspicacia: ['Perspicacia', 'cns'], liderazgo: ['Liderazgo', 'pre'], percepcion: ['Percepción', 'cns'], persuasion: ['Persuasión', 'pre'], supervivencia: ['Supervivencia', 'cns']
  };

  const ANCESTRIES = {
    humano: { name: 'Humano', traits: 'Talento adicional: a nivel 1 eliges un talento más de tu camino heroico. Los humanos de Roshar son tan diversos como sus culturas.' },
    cantor: { name: 'Cantor', traits: 'Cambiar de forma: durante una alta tormenta puedes adoptar una forma nueva. Empiezas con la forma torpe y la forma de pareja; otras formas se aprenden con talentos. Oyes los ritmos de Roshar.' }
  };
  const CULTURES = {
    alezi: ['Alezi', 'Guerreros y señores de Alezkar, con su código de honor y sus príncipes.'],
    azish: ['Azishiano', 'Burócratas de Azir, donde todo se resuelve con ensayos y formularios.'],
    escuchador: ['Escuchador', 'Cantores libres de las Llanuras Quebradas que cantan con los ritmos.'],
    herdaziano: ['Herdaziano', 'Gente de Herdaz, risueña y tenaz, con uñas de cristal.'],
    iriali: ['Iriali', 'Pueblo dorado de Iri que busca la experiencia de la Unidad.'],
    kharbranthiano: ['Kharbranthiano', 'Ciudad de sanadores y del gran Palaneo.'],
    natano: ['Natano', 'Habitantes de Nueva Natanan, en las costas del este.'],
    reshi: ['Reshi', 'Isleños que viven sobre grandes caparazones vivientes.'],
    shin: ['Shin', 'De Shinovar, al otro lado de las montañas, donde no soplan las tormentas.'],
    thayleno: ['Thayleño', 'Mercaderes y marinos de Thaylenah, de cejas largas.'],
    unkalaki: ['Unkalaki', 'Comecuernos de los Picos, cazadores, cocineros y familias grandes.'],
    veden: ['Veden', 'Gente de Jah Keved, tierra de guerras de sucesión.']
  };
  const PATHS = {
    agente: { name: 'Agente', skill: 'perspicacia', talent: 'Oportunista', story: 'Trabajas desde las sombras: investigas, espías o te llevas lo que otros vigilan.', talentText: 'Sabes aprovechar los descuidos y la suerte ajena para darle la vuelta a una situación.', specs: ['Investigador', 'Espía', 'Ladrón'] },
    cazador: { name: 'Cazador', skill: 'percepcion', talent: 'Buscar presa', story: 'Rastreas y abates a tus objetivos, ya sean bestias de las tierras salvajes o personas.', talentText: 'Marcas a un objetivo y concentras en él tu atención y tus ataques.', specs: ['Arquero', 'Asesino', 'Rastreador'] },
    enviado: { name: 'Enviado', skill: 'disciplina', talent: 'Presencia enardecedora', story: 'Hablas por otros: diplomáticos, fervorosos y mentores que mueven a la gente con palabras.', talentText: 'Tus palabras dan ánimo y determinación a tus aliados.', specs: ['Diplomático', 'Fervoroso', 'Mentor'] },
    erudito: { name: 'Erudito', skill: 'saber', talent: 'Erudición', story: 'El conocimiento es tu arma: artifabrianos, estrategas y cirujanos.', talentText: 'Dominas temporalmente conocimientos y habilidades que de otro modo no tendrías.', specs: ['Artifabriano', 'Estratega', 'Cirujano'] },
    guerrero: { name: 'Guerrero', skill: 'atletismo', talent: 'Guardia vigilante', story: 'Vives para el combate: duelistas, portadores de esquirlada y soldados curtidos.', talentText: 'Adoptas posturas de combate y reaccionas antes de que el enemigo te alcance.', specs: ['Duelista', 'Portador de esquirlada', 'Soldado'] },
    lider: { name: 'Líder', skill: 'liderazgo', talent: 'Orden decisiva', story: 'Diriges a otros: campeones, oficiales y políticos que inspiran y organizan.', talentText: 'Das órdenes que permiten a tus aliados actuar mejor y más rápido.', specs: ['Campeón', 'Oficial', 'Político'] }
  };
  const SURGES = {
    adhesion: ['Adhesión', 'Unir objetos y superficies con presión y vacío.'],
    gravitacion: ['Gravitación', 'Cambiar la dirección y la fuerza de la gravedad.'],
    division: ['División', 'Destruir y descomponer la materia: quemarla o desmoronarla.'],
    abrasion: ['Abrasión', 'Eliminar la fricción para deslizarte o quitársela a lo que tocas.'],
    progresion: ['Progresión', 'Hacer crecer plantas y sanar heridas.'],
    iluminacion: ['Iluminación', 'Crear ilusiones de luz y sonido.'],
    transformacion: ['Transformación', 'Transmutar la materia, el antiguo moldeado de almas.'],
    transporte: ['Transporte', 'Moverse entre el reino físico y el cognitivo.'],
    cohesion: ['Cohesión', 'Moldear la piedra y la materia como si fuera arcilla.'],
    tension: ['Tensión', 'Endurecer o ablandar objetos flexibles.']
  };
  const ORDERS = {
    corredores: { name: 'Corredores del Viento', surges: ['adhesion', 'gravitacion'], spren: 'honorspren', theme: 'Proteger a quienes no pueden protegerse.' },
    rompedores: { name: 'Rompedores del Cielo', surges: ['gravitacion', 'division'], spren: 'altospren', theme: 'Buscar la justicia y obedecer la ley.' },
    portadores: { name: 'Portadores del Polvo', surges: ['division', 'abrasion'], spren: 'cenizaspren', theme: 'Dominar un poder destructivo y responder de él.' },
    danzantes: { name: 'Danzantes del Filo', surges: ['abrasion', 'progresion'], spren: 'cultivaspren', theme: 'Recordar y cuidar a los olvidados.' },
    vigilantes: { name: 'Vigilantes de la Verdad', surges: ['progresion', 'iluminacion'], spren: 'nieblaspren', theme: 'Buscar la verdad y compartirla.' },
    tejedores: { name: 'Tejedores de Luz', surges: ['iluminacion', 'transformacion'], spren: 'crípticos', theme: 'Aceptar verdades sobre uno mismo; arte e ilusión.' },
    nominadores: { name: 'Nominadores de lo Otro', surges: ['transformacion', 'transporte'], spren: 'tintaspren', theme: 'Conocimiento, propósito y potencial.' },
    moldeadores: { name: 'Moldeadores de Voluntades', surges: ['transporte', 'cohesion'], spren: 'alcanzadores', theme: 'Defender la libertad propia y ajena.' },
    custodios: { name: 'Custodios de la Piedra', surges: ['cohesion', 'tension'], spren: 'cumbrespren', theme: 'Estar ahí cuando los demás te necesitan.' }
  };
  // Tablas por puntuación de atributo: 0, 1-2, 3-4, 5-6, 7-8, 9+.
  const band = n => (n <= 0 ? 0 : n >= 9 ? 5 : Math.ceil(n / 2));
  const MOVE = [20, 25, 30, 40, 60, 80];
  const RECOVERY = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
  const SENSES = ['5 pies', '10 pies', '20 pies', '50 pies', '100 pies', 'Sin límite por oscuridad'];
  const LIFT = [[100, 50], [200, 100], [500, 250], [1000, 500], [5000, 2500], [10000, 5000]];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

  let host = null;
  let store = load();
  let current = null;
  let exitHandler = null;
  let saveTimer = 0;
  let manualBook = null;
  // Desplegables del panel de nivel que están abiertos: la ficha se repinta con cada cambio.
  const lvOpen = { list: false, extras: false };

  // Apartados: Personajes, Campañas y Manual (src/nexo/apartados.js y el manual de este sistema).
  // Tarjeta de una ficha, propia o recibida de otro jugador: nombre, resumen e iniciativa.
  const cardOf = ch => ({ id: ch.id, name: ch.name || 'Héroe sin nombre', summary: describe(ch) });
  const ap = window.NEXO_APARTADOS?.create({
    prefix: 'tor', system: () => GAME, home: true, frame: body => frame(body),
    leave: () => { flushSave(); current = null; }, renderCharacters: () => renderList(),
    characters: () => store.characters.map(cardOf),
    // Campaña compartida (src/nexo/grupo.js): la ficha que se deja ver y cómo se lee la de otro jugador.
    shared: { raw: id => store.characters.find(ch => ch.id === id) || null, card: ch => ({ ...cardOf(ch), play: juego?.brief(ch) || '' }), accept: raw => window.NEXO_FICHA.accept(GAME, raw), view: (ch, opts) => kit?.view(ch, opts) },
    openCharacter: id => { const ch = store.characters.find(item => item.id === id); if (ch) openEditor(ch); else renderList(); },
    currentId: () => current?.id,
    manual: () => manualBook || (manualBook = window.NEXO_MANUALS?.tormentas?.({ REALMS, AT, SKILLS, ANCESTRIES, CULTURES, PATHS, SURGES, ORDERS }) || null),
    words: { characters: 'héroes', character: 'héroe' }
  });
  const manualLink = (id, label) => ap?.link(id, label) || '';
  // Nombre de un rasgo que, al tocarlo, asoma su regla del manual.
  const term = (id, text) => ap?.term(id, text) || esc(text);

  // Exportar, importar e imprimir la ficha (src/nexo/ficha.js).
  const kit = window.NEXO_FICHA?.create({
    prefix: 'tor', system: GAME, label: 'El Archivo de las Tormentas',
    current: () => current, sheet: ch => sheetData(ch), template: newCharacter, before: () => flushSave(), flash: text => flash(text),
    accept: ch => accept(ch), exists: id => store.characters.some(ch => ch.id === id),
    put: ch => { store.characters = [ch, ...store.characters.filter(item => item.id !== ch.id)]; persist(); renderList(); }
  });

  // En juego: salud, concentración, investidura, estados y descansos (src/nexo/juego.js).
  const juego = window.NEXO_JUEGO?.create({
    prefix: 'tor', title: '<span>✦</span> En juego <small>salud, concentración e investidura</small>',
    current: () => current, model: ch => playModel(ch), save: () => scheduleSave(), term, ready: ch => isComplete(ch),
    act: (id, a, done, before) => { if (id === 'luz') { a.set('investidura', a.max('investidura')); done('Absorbes luz tormentosa: investidura al máximo.', before); } }
  });
  const PLAY_CONDITIONS = [
    ['aturdido', 'Aturdido', 'Pierdes acciones o la reacción mientras dure, y eres más fácil de golpear.'],
    ['derribado', 'Derribado', 'Levantarte cuesta movimiento. Tus ataques cuerpo a cuerpo son más difíciles.'],
    ['inmovilizado', 'Inmovilizado', 'Tu movimiento es 0 hasta que te liberes.'],
    ['sorprendido', 'Sorprendido', 'No actúas en el primer asalto ni usas reacciones hasta que acabe.'],
    ['inconsciente', 'Inconsciente', 'No actúas y caes derribado.']
  ];
  function playModel(ch) {
    const inv = investiture(ch);
    const die = RECOVERY[band(attr(ch, 'vol'))];
    return {
      counters: [
        { id: 'salud', label: 'Salud', max: health(ch), big: true, verbs: ['Daño', 'Curar'], term: 'tor-recursos', rest: { largo: 'all' }, zero: 'A 0 de salud quedas inconsciente y sufres una lesión.' },
        { id: 'concentracion', label: 'Concentración', max: focus(ch), term: 'tor-recursos', rest: { largo: 'all' }, group: 'Reservas' },
        inv ? { id: 'investidura', label: 'Investidura', max: inv, term: 'tor-luz-tormentosa', group: 'Reservas', actions: [{ id: 'luz', label: 'Absorber luz' }] } : null,
        { id: 'lesiones', label: 'Lesiones', kind: 'value', start: 0, cap: 20, pips: false, term: 'tor-heridas', group: 'Reservas' }
      ],
      conditions: [
        { id: 'agotado', label: 'Agotado', max: 9, term: 'tor-estado-agotado', rest: { largo: -1 }, effect: n => `−${n} a todas tus pruebas. Baja un punto con cada descanso largo.` },
        ...PLAY_CONDITIONS.map(([k, label, effect]) => ({ id: k, label, effect, term: `tor-estado-${k}` }))
      ],
      rests: [
        { id: 'breve', label: 'Descanso breve', hint: `una hora · tiras tu dado de recuperación (${die})`, run: a => shortRest(a, die) },
        { id: 'largo', label: 'Descanso largo', hint: 'una noche · toda la salud y la concentración' }
      ]
    };
  }
  // Descanso breve: el dado de recuperación cura primero la salud y lo que sobre va a la concentración.
  function shortRest(a, die) {
    const sides = Number(die.slice(1)) || 6;
    const rolled = window.NEXO_DICE?.roll('tormentas', { mode: 'damage', expr: `1${die}`, label: 'Dado de recuperación' });
    let left = Number.isFinite(Number(rolled?.total)) ? Number(rolled.total) : 1 + Math.floor(Math.random() * sides);
    const toHealth = Math.min(left, a.max('salud') - a.get('salud'));
    a.add('salud', toHealth);
    left -= toHealth;
    a.add('concentracion', Math.min(left, a.max('concentracion') - a.get('concentracion')));
  }

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
      return { characters: Array.isArray(parsed.characters) ? parsed.characters.map(normalize) : [] };
    } catch { return { characters: [] }; }
  }
  function normalize(ch) {
    const fresh = newCharacter();
    const out = { ...fresh, ...ch };
    out.attrs = { ...fresh.attrs, ...(ch.attrs || {}) };
    out.ranks = { ...(ch.ranks || {}) };
    out.cultures = Array.isArray(ch.cultures) ? ch.cultures : [];
    if (!ch.adv) migrateAdvance(out);
    out.adv = 1;
    return out;
  }
  // Fichas anteriores a la subida automática: lo ganado por nivel se apuntaba a mano y ahora lo suma
  // la tabla. De lo apuntado solo se conserva lo que pasa de la tabla, para no contarlo dos veces.
  function migrateAdvance(ch) {
    const int = v => Math.max(0, Math.trunc(Number(v)) || 0);
    const level = Math.max(1, Math.min(MAX_LEVEL, int(ch.level) || 1));
    ch.attrBonus = Math.max(0, int(ch.attrBonus) - tableAttrs(level));
    ch.rankBonus = Math.max(0, int(ch.rankBonus) - tableRanks(level));
    ch.healthBonus = Math.max(0, int(ch.healthBonus) - tableHealth(level) - int(ch.attrs?.fue) * (tierOf(level) - 1));
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
  const signed = n => (n < 0 ? '−' + Math.abs(n) : '+' + n);

  function newCharacter() {
    return {
      id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      name: '', player: '', campaign: '', purpose: '', obstacle: '', goals: '',
      level: 1, adv: 1, ancestry: '', cultures: [], path: '', spec: '',
      attrs: Object.fromEntries(ATTRS.map(([k]) => [k, 0])), attrBonus: 0, ranks: {}, rankBonus: 0,
      expertises: '', radiant: false, order: '', ideal: 0, spren: '', talents: '', healthBonus: 0, notes: ''
    };
  }

  // Valores derivados
  const attr = (ch, key) => ch.attrs[key] || 0;
  const pathSkill = ch => PATHS[ch.path]?.skill || '';
  const rank = (ch, skill) => (ch.ranks[skill] || 0) + (pathSkill(ch) === skill ? 1 : 0);
  const skillMod = (ch, skill) => attr(ch, SKILLS[skill][1]) + rank(ch, skill);
  const attrSpent = ch => ATTRS.reduce((t, [k]) => t + attr(ch, k), 0);
  // Lo que quien dirige da fuera de la tabla de progresión.
  const extra = (ch, key) => Math.max(0, Math.trunc(Number(ch[key])) || 0);
  const attrBudget = ch => ATTR_POINTS + tableAttrs(ch.level) + extra(ch, 'attrBonus');
  const rankSpent = ch => Object.values(ch.ranks).reduce((t, n) => t + n, 0);
  const rankBudget = ch => SKILL_RANKS + tableRanks(ch.level) + extra(ch, 'rankBonus');
  const overAttrs = ch => ATTRS.filter(([k]) => attr(ch, k) > attrCap(ch)).length;
  const overRanks = ch => Object.keys(SKILLS).filter(k => rank(ch, k) > rankLimit(ch)).length;
  function defense(ch, realm) {
    return 10 + ATTRS.filter(a => a[3] === realm).reduce((t, [k]) => t + attr(ch, k), 0);
  }
  // La Fuerza cuenta una vez por escalón alcanzado; cada nivel suma lo que marca su escalón.
  const health = ch => 10 + attr(ch, 'fue') * tier(ch) + tableHealth(ch.level) + extra(ch, 'healthBonus');
  const focus = ch => 2 + attr(ch, 'vol');
  const investiture = ch => (ch.radiant && ch.ideal >= 1 ? 2 + Math.max(attr(ch, 'cns'), attr(ch, 'pre')) : 0);
  const tier = ch => tierOf(ch.level);
  const extraExpertises = ch => ch.expertises.split(',').map(s => s.trim()).filter(Boolean);
  const talentLines = ch => String(ch.talents || '').split('\n').filter(line => line.trim()).length;
  // Lo que da un nivel, en frases cortas.
  function levelGains(l) {
    const t = tierOf(l);
    const start = tierStart(l);
    return [
      `+${TIER_HEALTH[t - 1]} de salud${start ? ' y otra vez tu Fuerza' : ''}`,
      `+${LEVEL_RANKS} rangos de habilidad`,
      ATTR_LEVELS.includes(l) ? '+1 punto de atributo' : '',
      start ? '1 talento y otro por tu ascendencia' : '1 talento',
      start ? `escalón ${t}: las habilidades llegan a rango ${TIER_RANK[t - 1]}` : ''
    ].filter(Boolean);
  }

  function sanitize(ch) {
    ch.level = Math.max(1, Math.min(MAX_LEVEL, Math.trunc(Number(ch.level)) || 1));
    if (!ANCESTRIES[ch.ancestry]) ch.ancestry = '';
    ch.cultures = ch.cultures.filter(k => CULTURES[k]).slice(0, CULTURE_PICKS);
    if (!PATHS[ch.path]) ch.path = '';
    if (!PATHS[ch.path]?.specs.includes(ch.spec)) ch.spec = '';
    // Los topes del nivel los vigilan los botones y el seguimiento: aquí no se recorta lo repartido,
    // para que bajar de nivel o abrir una ficha antigua no borre puntos.
    ATTRS.forEach(([k]) => { ch.attrs[k] = Math.max(0, Math.min(ATTR_MAX, Math.trunc(ch.attrs[k]) || 0)); });
    Object.keys(ch.ranks).forEach(k => {
      const bonus = pathSkill(ch) === k ? 1 : 0;
      ch.ranks[k] = Math.max(0, Math.min(RANK_MAX - bonus, Math.trunc(ch.ranks[k]) || 0));
      if (!SKILLS[k] || !ch.ranks[k]) delete ch.ranks[k];
    });
    EXTRAS.forEach(([k, , max]) => { ch[k] = Math.min(max, extra(ch, k)); });
    if (!ORDERS[ch.order]) ch.order = '';
    ch.ideal = Math.max(0, Math.min(MAX_IDEAL, Math.trunc(ch.ideal) || 0));
  }

  // Ficha que llega de un archivo: se completa y se deja solo lo que el creador entiende.
  function accept(raw) {
    const ch = normalize(raw);
    const int = (v, max) => Math.max(0, Math.min(max, Math.trunc(Number(v)) || 0));
    const obj = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
    ch.attrBonus = int(ch.attrBonus, 20);
    ch.rankBonus = int(ch.rankBonus, 80);
    ch.healthBonus = int(ch.healthBonus, 300);
    ch.level = int(ch.level, MAX_LEVEL) || 1;
    ch.attrs = Object.fromEntries(ATTRS.map(([k]) => [k, int(obj(ch.attrs)[k], 10)]));
    ch.ranks = Object.fromEntries(Object.keys(SKILLS).map(k => [k, int(obj(ch.ranks)[k], 5)]).filter(([, n]) => n));
    ch.cultures = ch.cultures.filter(k => typeof k === 'string');
    ch.radiant = Boolean(ch.radiant);
    sanitize(ch);
    return ch;
  }

  // La ficha como datos para la hoja de solo lectura: lo que se imprime o se guarda como PDF.
  function sheetData(ch) {
    const a = ANCESTRIES[ch.ancestry];
    const path = PATHS[ch.path];
    const order = ch.radiant ? ORDERS[ch.order] : null;
    const fue = band(attr(ch, 'fue'));
    const inv = investiture(ch);
    const expertises = [...ch.cultures.map(k => `Cultura ${CULTURES[k][0].toLowerCase()}`), ...extraExpertises(ch)];
    return {
      system: 'El Archivo de las Tormentas · Juego de rol del Cosmere', accent: '#1d4f7c',
      name: ch.name || 'Héroe sin nombre', subtitle: describe(ch),
      meta: [['Nivel', `${ch.level} · escalón ${tier(ch)}`], ['Jugador', ch.player], ['Campaña', ch.campaign]],
      blocks: [
        { title: 'Identidad', kind: 'pairs', items: [['Ascendencia', a?.name], ['Culturas', ch.cultures.map(k => CULTURES[k][0]).join(', ')], ['Camino heroico', path?.name], ['Especialidad', ch.spec], ['Propósito', ch.purpose], ['Obstáculo', ch.obstacle], ['Metas', ch.goals]] },
        { title: 'Atributos', kind: 'stats', items: ATTRS.map(([k, name, short]) => ({ label: name, value: attr(ch, k), sub: short })) },
        { title: 'Defensas y valores', kind: 'stats', items: [
          { label: 'Defensa física', value: defense(ch, 'fisico') }, { label: 'Defensa cognitiva', value: defense(ch, 'cognitivo') }, { label: 'Defensa espiritual', value: defense(ch, 'espiritual') },
          { label: 'Salud', value: health(ch) }, { label: 'Concentración', value: focus(ch) }, { label: 'Investidura', value: inv || '—' },
          { label: 'Movimiento', value: MOVE[band(attr(ch, 'vel'))], sub: 'pies' }, { label: 'Recuperación', value: RECOVERY[band(attr(ch, 'vol'))], sub: 'dado' },
          { label: 'Carga', value: LIFT[fue][1], sub: 'libras' }, { label: 'Levantar', value: LIFT[fue][0], sub: 'libras' }
        ], note: `Sentidos: ${SENSES[band(attr(ch, 'cns'))].toLowerCase()}.` },
        { title: 'Habilidades', kind: 'columns', note: 'El punto marca las habilidades con rango. El modificador es el atributo más el rango.', items: REALMS.map(([realm, name]) => ({
          label: name,
          items: Object.entries(SKILLS).filter(([, [, at]]) => AT[at].realm === realm).map(([k, [n, at]]) => ({ name: `${n} (${AT[at].short})${rank(ch, k) ? ` · rango ${rank(ch, k)}` : ''}`, value: signed(skillMod(ch, k)), mark: rank(ch, k) > 0 }))
        })) },
        { title: 'En partida', kind: 'tracks', items: [
          { label: 'Salud', value: '', max: health(ch) }, { label: 'Concentración', value: '', max: focus(ch), boxes: focus(ch) }, inv ? { label: 'Investidura', value: '', max: inv, boxes: inv } : null
        ] },
        expertises.length ? { title: 'Pericias', kind: 'text', text: expertises.join(', ') } : null,
        { title: 'Origen y camino', kind: 'features', items: [
          a ? { name: a.name, tag: 'Ascendencia', text: a.traits } : null,
          path ? { name: path.talent, tag: `Talento clave · ${path.name}`, text: path.talentText } : null
        ] },
        order ? { title: 'Camino radiante', kind: 'features', items: [
          { name: order.name, tag: `Spren: ${ch.spren || order.spren}`, text: `${order.theme} Ideales pronunciados: ${ch.ideal} de ${MAX_IDEAL}.` },
          ...order.surges.map(k => ({ name: SURGES[k][0], tag: 'Potencia', text: SURGES[k][1] }))
        ] } : null,
        { title: 'Talentos', kind: 'text', text: ch.talents },
        ch.level > 1 ? { title: 'Progresión', kind: 'pairs', items: [
          ['Nivel', `${ch.level} · escalón ${tier(ch)}`], ['Puntos de atributo', attrBudget(ch)], ['Rangos de habilidad', `${rankBudget(ch)} · rango máximo ${rankCap(ch)}`],
          ['Salud', `10 + Fuerza × ${tier(ch)} + ${tableHealth(ch.level)} por nivel${extra(ch, 'healthBonus') ? ` + ${extra(ch, 'healthBonus')} de ajuste` : ''}`],
          ['Talentos', `el clave, ${ch.level - 1} por nivel y ${tier(ch)} por la ascendencia`]
        ] } : null,
        { title: 'Equipo y notas', kind: 'text', text: ch.notes }
      ]
    };
  }

  function summary(ch) {
    const rows = [
      { label: 'Ascendencia', left: ch.ancestry ? 0 : 1, budget: 1 },
      { label: 'Culturas', left: CULTURE_PICKS - ch.cultures.length, budget: CULTURE_PICKS },
      { label: 'Camino heroico', left: ch.path ? 0 : 1, budget: 1 },
      { label: 'Atributos', left: attrBudget(ch) - attrSpent(ch), budget: attrBudget(ch) },
      { label: 'Habilidades', left: rankBudget(ch) - rankSpent(ch), budget: rankBudget(ch) }
    ];
    if (attr(ch, 'int') > 0) rows.push({ label: 'Pericias', left: Math.max(0, attr(ch, 'int') - extraExpertises(ch).length), budget: attr(ch, 'int') });
    if (ch.radiant) rows.push({ label: 'Orden radiante', left: ch.order ? 0 : 1, budget: 1 });
    // Lo que queda por encima del tope del nivel (al bajar de nivel o en una ficha antigua).
    if (overAttrs(ch)) rows.push({ label: `Atributos por encima de ${attrCap(ch)}`, left: -overAttrs(ch), show: overAttrs(ch) });
    if (overRanks(ch)) rows.push({ label: `Habilidades por encima de rango ${rankLimit(ch)}`, left: -overRanks(ch), show: overRanks(ch) });
    return rows;
  }
  const isComplete = ch => summary(ch).every(row => row.left === 0);
  function describe(ch) {
    const parts = [ANCESTRIES[ch.ancestry]?.name, PATHS[ch.path] ? `${PATHS[ch.path].name} ${ch.level}` : '', ch.radiant && ORDERS[ch.order] ? ORDERS[ch.order].name : ''].filter(Boolean);
    return parts.length ? parts.join(' · ') : 'Sin camino elegido';
  }

  // Acciones
  function stepAttr(key, delta) {
    const ch = current;
    const next = attr(ch, key) + delta;
    if (next < 0) return;
    if (delta > 0 && next > attrCap(ch)) return flash(ch.level > 1 ? `Los atributos no pasan de ${attrCap(ch)}.` : 'A nivel 1 ningún atributo puede pasar de 3.');
    if (delta > 0 && attrSpent(ch) >= attrBudget(ch)) return flash(`Ya has repartido tus ${attrBudget(ch)} puntos de atributo. Baja otro para subir este.`);
    ch.attrs[key] = next;
    changed();
    if (delta > 0 && next > ATTR_TABLE) flash(`Subiendo de nivel, un atributo llega como mucho a ${ATTR_TABLE}. Por encima solo se pasa con formas de cantor, armaduras esquirladas u otros efectos.`);
  }
  function stepRank(skill, delta) {
    const ch = current;
    const own = ch.ranks[skill] || 0;
    const next = own + delta;
    if (next < 0) return;
    const total = next + (pathSkill(ch) === skill ? 1 : 0);
    if (delta > 0 && total > rankLimit(ch)) return flash(ch.level > 1 ? `Ninguna habilidad pasa de rango ${RANK_MAX}.` : `A nivel 1 ninguna habilidad pasa de rango 2${pathSkill(ch) === skill ? ' (tu camino ya te da uno aquí)' : ''}.`);
    if (delta > 0 && rankSpent(ch) >= rankBudget(ch)) return flash(`Ya has repartido tus ${rankBudget(ch)} rangos de habilidad. Quita uno para ponerlo aquí.`);
    ch.ranks[skill] = next;
    changed();
    if (delta > 0 && total > rankCap(ch)) flash(`La tabla marca rango ${rankCap(ch)} como máximo en el escalón ${tier(ch)} (sube en el nivel ${tier(ch) * 5 + 1}). Queda señalado en rojo por si tu mesa lo permite.`);
  }
  // Subir y bajar de nivel. Al bajar no se borra lo repartido: el seguimiento avisa de lo que sobra.
  function levelUp() {
    const ch = current;
    if (!ch.ancestry || !ch.path) return flash('Elige primero una ascendencia y un camino heroico para poder subir de nivel.');
    if (ch.level >= MAX_LEVEL) return flash(`Ya estás en el nivel ${MAX_LEVEL}, el máximo.`);
    ch.level += 1;
    changed();
    flash(`Nivel ${ch.level}: ${levelGains(ch.level).join(', ')}.`);
  }
  function levelDown() {
    if (current.level <= 1) return;
    current.level -= 1;
    changed();
    flash(`Nivel ${current.level}. Lo que hubieras repartido de más sale en rojo en el seguimiento.`);
  }
  // Al cambiar de camino, su rango gratuito no puede dejar la habilidad por encima del tope.
  function fitPathSkill(ch) {
    const k = pathSkill(ch);
    if (k && (ch.ranks[k] || 0) + 1 > rankLimit(ch)) ch.ranks[k] = Math.max(0, rankLimit(ch) - 1);
  }
  function toggleCulture(key) {
    const list = current.cultures;
    if (list.includes(key)) list.splice(list.indexOf(key), 1);
    else if (list.length >= CULTURE_PICKS) return flash(`Empiezas con pericia en ${CULTURE_PICKS} culturas. Quita una para cambiarla.`);
    else list.push(key);
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
  function frame(body, status = 'VIDA ANTES QUE MUERTE') {
    host.innerHTML = `<div class="tor-storm" aria-hidden="true"></div><header class="tor-top"><button class="tor-brand" data-exit aria-label="Volver a la mesa"><span class="tor-sphere">${window.NEXO_ICONS?.tormentas || ''}</span><span><b>NEXO</b><small>EL ARCHIVO DE LAS TORMENTAS</small></span></button><span class="tor-status" data-save-status>${esc(status)}</span></header><main class="tor-main">${body}</main><button class="nd-fab" data-dice aria-label="Abrir los dados"><span aria-hidden="true">⚄</span><b>Dados</b></button><div class="tor-flash" data-flash hidden role="status"></div>`;
    host.querySelectorAll('[data-exit]').forEach(button => button.addEventListener('click', close));
    host.querySelector('[data-dice]').addEventListener('click', () => window.NEXO_DICE?.tray('tormentas', { sources: diceSources }));
  }
  // Dados: pruebas de habilidad con el modificador de la ficha (atributo + rango).
  const diceItems = ch => Object.entries(SKILLS).map(([k, [n]]) => [k, n, skillMod(ch, k)]).sort((a, b) => a[1].localeCompare(b[1], 'es'));
  function diceSources() { return current ? [{ label: 'Habilidad de la ficha', items: diceItems(current), show: signed }] : []; }
  function rollSkill(key) {
    const item = diceItems(current).find(([k]) => k === key);
    if (!item) return;
    const tired = juego?.cond(current, 'agotado') || 0;
    window.NEXO_DICE?.roll('tormentas', { mod: item[2] - tired, label: item[1], note: tired ? `Agotado ${tired}: −${tired}.` : '' });
  }

  function renderList() {
    flushSave();
    current = null;
    const rows = store.characters;
    const cards = rows.length ? rows.map(ch => {
      const done = isComplete(ch);
      return `<button class="tor-card" data-open="${esc(ch.id)}"><span class="tor-card-gem">${esc((ch.name || '?').trim().charAt(0).toUpperCase() || '?')}</span><span class="tor-card-copy"><b>${esc(ch.name || 'Héroe sin nombre')}</b><small>${esc(describe(ch))}</small></span><span class="tor-badge ${done ? 'is-done' : ''}">${done ? 'LISTO' : 'EN CREACIÓN'}</span></button>`;
    }).join('') : '<div class="tor-empty"><span aria-hidden="true">✦</span><b>Las Llanuras están en calma</b><small>Pulsa «Despertar a un héroe» para crear tu primer personaje.</small></div>';
    frame(`${ap?.tabs('personajes') || ''}<p class="tor-kicker">NEXO / JUEGO DE ROL DEL COSMERE · MANUAL DE STORMLIGHT</p><h1>Tus <em>héroes</em> de Roshar</h1><p class="tor-intro">Crea héroes de nivel 1 y súbelos hasta el 20: ascendencia, dos culturas, un camino heroico, 12 puntos de atributo, 4 rangos de habilidad y lo que da cada nivel. NEXO calcula defensas, salud, concentración, investidura, movimiento y sentidos, y guarda las fichas en este dispositivo y en tu cuenta.</p><div class="tor-actions"><button class="tor-button" data-new>✦ DESPERTAR A UN HÉROE</button>${kit?.importButton() || ''}<button class="tor-button ghost" data-exit>← VOLVER A LA MESA</button></div><div class="tor-list">${cards}</div>`);
    host.querySelector('[data-new]').addEventListener('click', () => openEditor(newCharacter()));
    host.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => {
      const ch = store.characters.find(item => item.id === button.dataset.open);
      if (ch) openEditor(ch);
    }));
    host.scrollTop = 0;
  }

  function field(label, prop, opts = {}) {
    if (opts.area) return `<label class="tor-field"><span>${label}</span><textarea data-prop="${prop}" rows="2" maxlength="400" placeholder="${esc(opts.placeholder || '')}">${esc(current[prop])}</textarea></label>`;
    return `<label class="tor-field"><span>${label}</span><input data-prop="${prop}" value="${esc(current[prop])}" maxlength="80" autocomplete="off" placeholder="${esc(opts.placeholder || '')}"></label>`;
  }
  function options(entries, selected, empty) {
    return (empty ? `<option value="" ${selected ? '' : 'selected'}>${esc(empty)}</option>` : '') + entries.map(([value, label]) => `<option value="${esc(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${esc(label)}</option>`).join('');
  }
  const sorted = obj => Object.entries(obj).map(([k, v]) => [k, v.name]).sort((a, b) => a[1].localeCompare(b[1], 'es'));
  const heading = (n, title, small = '') => `<h2><span>${ROMAN[n - 1]}</span> ${title}${small ? ` <small>${small}</small>` : ''}</h2>`;
  function info(rows) {
    return `<dl class="tor-info">${rows.filter(Boolean).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  }

  function openEditor(ch) {
    current = ch;
    lvOpen.list = false;
    lvOpen.extras = false;
    const saved = store.characters.some(item => item.id === ch.id);
    frame(`<div class="tor-editor-head"><button class="tor-button ghost" data-back>← TUS HÉROES</button>${kit?.tools() || ''}<button class="tor-button danger" data-delete ${saved ? '' : 'hidden'}>ELIMINAR</button></div>
      <div data-play></div>
      <section class="tor-panel">${heading(1, 'Identidad', 'concepto del personaje')}<div class="tor-fields">
        ${field('Nombre', 'name', { placeholder: 'Nombre del personaje' })}${field('Jugador', 'player')}${field('Campaña', 'campaign')}
      </div><div class="tor-fields tor-fields-3">
        ${field('Propósito', 'purpose', { area: true, placeholder: 'Qué te impulsa a actuar' })}${field('Obstáculo', 'obstacle', { area: true, placeholder: 'Qué te frena por dentro o por fuera' })}${field('Metas', 'goals', { area: true, placeholder: 'Lo que quieres lograr' })}
      </div></section>
      <div data-sheet></div>
      <section class="tor-panel">${heading(9, 'Talentos, equipo y notas')}<p class="tor-note">Anota los talentos que elijas en tus caminos, tu equipo inicial (armas, armadura, esferas) y la historia de tu personaje.</p>
        <label class="tor-field"><span>Talentos</span><textarea data-prop="talents" rows="4" placeholder="Un talento por línea">${esc(ch.talents)}</textarea></label>
        <label class="tor-field"><span>Equipo y notas</span><textarea data-prop="notes" rows="6" placeholder="Equipo, esferas, historia…">${esc(ch.notes)}</textarea></label></section>
      <div class="tor-modal" data-modal hidden><div class="tor-modal-card" role="alertdialog" aria-modal="true" aria-labelledby="torDelTitle"><h3 id="torDelTitle">¿Dejar que la tormenta se lleve a este héroe?</h3><p>La ficha se borrará de este dispositivo y de tu cuenta, y no se podrá recuperar.</p><div class="tor-actions"><button class="tor-button ghost" data-cancel>CANCELAR</button><button class="tor-button danger" data-confirm>ELIMINAR FICHA</button></div></div></div>`, saved ? 'GUARDADO EN ESTE DISPOSITIVO' : 'FICHA NUEVA · SIN GUARDAR');

    host.querySelector('[data-back]').addEventListener('click', renderList);
    host.querySelectorAll('[data-prop]').forEach(input => input.addEventListener('input', () => {
      current[input.dataset.prop] = input.value;
      scheduleSave();
      host.querySelector('[data-delete]').hidden = false;
      if (input.dataset.prop === 'talents') host.querySelectorAll('[data-talent-count]').forEach(node => { node.textContent = talentCount(current); });
    }));
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

  function originPanel(ch) {
    const anc = ANCESTRIES[ch.ancestry];
    const path = PATHS[ch.path];
    const chips = Object.entries(CULTURES).map(([k, [name, text]]) => `<button class="tor-chip ${ch.cultures.includes(k) ? 'is-on' : ''}" data-culture="${k}" aria-pressed="${ch.cultures.includes(k)}" title="${esc(text)}">${esc(name)}</button>`).join('');
    const left = CULTURE_PICKS - ch.cultures.length;
    return `<section class="tor-panel">${heading(2, 'Origen', 'ascendencia · culturas · camino')}<div class="tor-cols">
      <div class="tor-col"><h3>Ascendencia</h3>
        <label class="tor-field"><span>Ascendencia</span><select data-choice="ancestry">${options(sorted(ANCESTRIES), ch.ancestry, 'Elige una ascendencia…')}</select></label>
        ${anc ? `<p class="tor-narr">${esc(anc.traits)} ${manualLink(`tor-anc-${ch.ancestry}`, 'Ascendencia en el manual')}</p>` : '<p class="tor-note">Humano o cantor. Los cantores cambian de forma con las altas tormentas.</p>'}
        <h3>Culturas <span class="tor-left ${left === 0 ? 'is-done' : ''}">${left === 0 ? 'Completo' : `Elige ${left} más`}</span></h3>
        <div class="tor-chips">${chips}</div>
        ${ch.cultures.length ? `<p class="tor-note">${ch.cultures.map(k => `<b>${esc(CULTURES[k][0])}:</b> ${esc(CULTURES[k][1])}`).join('<br>')}</p>` : '<p class="tor-note">Cada cultura te da una pericia: conoces sus costumbres, su idioma y su historia.</p>'}
      </div>
      <div class="tor-col"><h3>Camino heroico</h3>
        <label class="tor-field"><span>Camino</span><select data-choice="path">${options(sorted(PATHS), ch.path, 'Elige un camino…')}</select></label>
        ${path ? `<label class="tor-field"><span>Especialidad (opcional)</span><select data-choice="spec">${options(path.specs.map(s => [s, s]), ch.spec, 'Sin especialidad todavía')}</select></label>
          <p class="tor-narr">${esc(path.story)} ${manualLink(`tor-cam-${ch.path}`, 'Camino en el manual')}</p>${info([['Habilidad del camino', `${SKILLS[path.skill][0]} (+1 rango)`], ['Talento clave', path.talent], ['Efecto', path.talentText]])}` : '<p class="tor-note">El camino te da un talento clave, un rango en su habilidad y el árbol de talentos que irás desbloqueando.</p>'}
      </div>
    </div></section>`;
  }

  function attributesPanel(ch) {
    const left = attrBudget(ch) - attrSpent(ch);
    const cols = REALMS.map(([realm, name, def]) => {
      const rows = ATTRS.filter(a => a[3] === realm).map(([k, n]) => `<div class="tor-attr"><span class="tor-attr-name">${n}</span><span class="tor-stepper"><button data-attr="${k}" data-d="-1" aria-label="Bajar ${n}" ${attr(ch, k) <= 0 ? 'disabled' : ''}>−</button><b>${attr(ch, k)}</b><button data-attr="${k}" data-d="1" aria-label="Subir ${n}">+</button></span></div>`).join('');
      return `<div class="tor-realm is-${realm}"><div class="tor-realm-head"><b>${name}</b><span class="tor-def"><small>${term('tor-defensas', def)}</small><b>${defense(ch, realm)}</b></span></div>${rows}</div>`;
    }).join('');
    return `<section class="tor-panel">${heading(3, term('tor-atributos', 'Atributos'), `${attrBudget(ch)} puntos`)}<p class="tor-note">Reparte ${attrBudget(ch)} puntos entre los seis atributos (todos empiezan en 0, máximo ${ch.level === 1 ? '3 a nivel 1' : `${ATTR_TABLE} subiendo de nivel`})${attrBudget(ch) > ATTR_POINTS ? `: ${ATTR_POINTS} al crear el personaje y ${attrBudget(ch) - ATTR_POINTS} por tus niveles` : ''}. Cada pareja forma la defensa de su reino: 10 + los dos atributos. <span class="tor-left ${left === 0 ? 'is-done' : left < 0 ? 'is-over' : ''}">${left === 0 ? 'Todo repartido' : left > 0 ? `Te quedan ${left}` : `Te pasas en ${-left}`}</span></p><div class="tor-realms">${cols}</div></section>`;
  }

  function skillsPanel(ch) {
    const left = rankBudget(ch) - rankSpent(ch);
    const cap = rankCap(ch);
    const cols = REALMS.map(([realm, name]) => {
      const rows = Object.entries(SKILLS).filter(([, [, a]]) => AT[a].realm === realm).map(([k, [n, a]]) => {
        const r = rank(ch, k);
        const fromPath = pathSkill(ch) === k;
        const pips = Array.from({ length: Math.max(cap, r) }, (_, i) => `<i class="${i < r ? (fromPath && i === 0 ? 'is-path' : i >= cap ? 'is-over' : 'is-on') : ''}"></i>`).join('');
        return `<li class="${r ? 'is-ranked' : ''}"><span class="tor-skill-name">${term(`tor-hab-${k}`, n)} <small>${AT[a].short}</small></span><span class="tor-pips" aria-label="Rango ${r}${r > cap ? `, por encima del máximo ${cap}` : ''}">${pips}</span><span class="tor-mini"><button data-rank="${k}" data-d="-1" aria-label="Quitar rango a ${esc(n)}" ${(ch.ranks[k] || 0) <= 0 ? 'disabled' : ''}>−</button><button data-rank="${k}" data-d="1" aria-label="Añadir rango a ${esc(n)}">+</button></span><button class="nd-roll-btn tor-skill-mod" data-tor-roll="${k}" aria-label="Tirar ${esc(n)}"><b>${signed(skillMod(ch, k))}</b></button></li>`;
      }).join('');
      return `<div class="tor-col"><h3>${name}</h3><ul class="tor-skills">${rows}</ul></div>`;
    }).join('');
    return `<section class="tor-panel">${heading(4, 'Habilidades', `${rankBudget(ch)} rangos`)}<p class="tor-note">Reparte ${rankBudget(ch)} rangos (máximo ${cap} por habilidad${ch.level === 1 ? ' a nivel 1' : tier(ch) < TIER_RANK.length ? ` en el escalón ${tier(ch)}` : ''})${ch.level > 1 ? `: ${SKILL_RANKS} al crear el personaje y ${rankBudget(ch) - SKILL_RANKS} por tus niveles` : ''}. Tu camino heroico añade uno más en su habilidad, marcado en dorado. El modificador es el atributo más el rango. <span class="tor-left ${left === 0 ? 'is-done' : left < 0 ? 'is-over' : ''}">${left === 0 ? 'Todo repartido' : left > 0 ? `Te quedan ${left}` : `Te pasas en ${-left}`}</span></p><div class="tor-cols">${cols}</div></section>`;
  }

  function expertisePanel(ch) {
    const need = attr(ch, 'int');
    const extra = extraExpertises(ch);
    const cultural = ch.cultures.map(k => CULTURES[k][0]);
    const left = need - extra.length;
    return `<section class="tor-panel">${heading(5, 'Pericias', 'culturas e Intelecto')}<p class="tor-note">Tienes una pericia por cada cultura y tantas pericias adicionales como tu Intelecto (${need}): oficios, armas, armaduras, idiomas o temas de saber.</p>
      <div class="tor-chips">${cultural.map(c => `<span class="tor-chip is-on is-fixed">Cultura ${esc(c)}</span>`).join('') || '<span class="tor-note">Elige tus culturas en el Origen.</span>'}</div>
      <label class="tor-field"><span>Pericias adicionales, separadas por comas ${need ? `<em class="tor-left ${left === 0 ? 'is-done' : left < 0 ? 'is-over' : ''}">${left === 0 ? 'Completo' : left > 0 ? `Faltan ${left}` : `Sobran ${-left}`}</em>` : ''}</span><input data-expertise value="${esc(ch.expertises)}" maxlength="300" placeholder="Ej.: Armadura ligera, Fabriales, Historia vorin"></label></section>`;
  }

  // Casillas de la hoja calculada que asoman su regla al tocarlas.
  const STAT_RULES = { 'Defensa física': 'tor-defensas', 'Defensa cognitiva': 'tor-defensas', 'Defensa espiritual': 'tor-defensas', 'Salud': 'tor-recursos', 'Concentración': 'tor-recursos', 'Investidura': 'tor-recursos', 'Dado de recuperación': 'tor-descanso' };
  function sheetPanel(ch) {
    const fue = band(attr(ch, 'fue'));
    const stats = [
      ['Defensa física', defense(ch, 'fisico')], ['Defensa cognitiva', defense(ch, 'cognitivo')], ['Defensa espiritual', defense(ch, 'espiritual')],
      ['Salud', health(ch)], ['Concentración', focus(ch)], ['Investidura', investiture(ch) || '—'],
      ['Movimiento', MOVE[band(attr(ch, 'vel'))] + ' pies'], ['Sentidos', SENSES[band(attr(ch, 'cns'))]], ['Dado de recuperación', RECOVERY[band(attr(ch, 'vol'))]],
      ['Capacidad de carga', `${LIFT[fue][1]} lb`], ['Levantar', `${LIFT[fue][0]} lb`], ['Nivel', `${ch.level} · escalón ${tier(ch)}`]
    ];
    return `<section class="tor-panel">${heading(6, 'Hoja calculada', esc(describe(ch)))}
      <div class="tor-stats">${stats.map(([k, v]) => `<div><small>${term(STAT_RULES[k], k)}</small><b>${esc(v)}</b></div>`).join('')}</div>
      <p class="tor-note">Salud: 10 + Fuerza${tier(ch) > 1 ? ` una vez por escalón (× ${tier(ch)})` : ''}${ch.level > 1 ? ` + ${tableHealth(ch.level)} de tus niveles` : ''}${extra(ch, 'healthBonus') ? ` + ${extra(ch, 'healthBonus')} de ajuste` : ''}. Concentración: 2 + Voluntad. Investidura: 2 + el mayor entre Consciencia y Presencia, solo tras pronunciar el Primer Ideal. Movimiento, carga, sentidos y dado de recuperación salen de Velocidad, Fuerza, Consciencia y Voluntad.</p></section>`;
  }

  function radiantPanel(ch) {
    const order = ORDERS[ch.order];
    const surges = order ? order.surges.map(k => `<div class="tor-surge"><b>${term(`tor-pot-${k}`, SURGES[k][0])}</b><small>${esc(SURGES[k][1])}</small></div>`).join('') : '';
    const ideals = Array.from({ length: MAX_IDEAL }, (_, i) => `<button class="tor-ideal ${i < ch.ideal ? 'is-on' : ''}" data-ideal="${i + 1}" aria-pressed="${i < ch.ideal}" aria-label="${i + 1}º Ideal">${ROMAN[i]}</button>`).join('');
    return `<section class="tor-panel tor-radiant ${ch.radiant ? 'is-active' : ''}">${heading(7, 'Camino radiante', 'vínculo náhel')}
      <label class="tor-switch"><input type="checkbox" data-radiant ${ch.radiant ? 'checked' : ''}><span>Mi personaje sigue el camino radiante</span></label>
      ${ch.radiant ? `<div class="tor-cols tor-cols-2"><div class="tor-col">
          <label class="tor-field"><span>Orden</span><select data-choice="order">${options(sorted(ORDERS), ch.order, 'Elige una orden…')}</select></label>
          <label class="tor-field"><span>Nombre del spren</span><input data-prop="spren" value="${esc(ch.spren)}" maxlength="40" placeholder="${esc(order ? 'Tu ' + order.spren : 'Tu spren')}"></label>
          ${order ? info([['Spren', order.spren], ['Ideales', order.theme]]) + manualLink(`tor-ord-${ch.order}`, 'Orden en el manual') : '<p class="tor-note">Cada orden tiene su spren, su forma de entender los Ideales y dos potencias.</p>'}
        </div><div class="tor-col"><h3>Ideales pronunciados</h3><div class="tor-ideals">${ideals}</div>
          <p class="tor-note">${ch.ideal ? `Has pronunciado ${ch.ideal === 1 ? 'el Primer Ideal' : `${ch.ideal} Ideales`}: tienes investidura y puedes absorber luz tormentosa.` : 'Aún no has pronunciado el Primer Ideal: «Vida antes que muerte. Fuerza antes que debilidad. Viaje antes que destino.»'}</p>
          ${order ? `<h3>Potencias</h3><div class="tor-surges">${surges}</div>` : ''}
        </div></div>` : '<p class="tor-note">Se puede empezar sin vínculo y descubrirlo en partida. Al activarlo eliges orden, spren y los Ideales que has pronunciado.</p>'}</section>`;
  }

  const talentCount = ch => {
    const n = talentLines(ch);
    return n === 1 ? 'En «Talentos» tienes 1 línea apuntada.' : `En «Talentos» tienes ${n} líneas apuntadas.`;
  };
  function levelPanel(ch) {
    const L = ch.level;
    const T = tier(ch);
    const adj = (key, unit) => (extra(ch, key) ? ` + ${extra(ch, key)} de ajuste${unit}` : '');
    const rows = [
      ['Atributos', `${attrBudget(ch)} puntos: ${ATTR_POINTS} al crear${tableAttrs(L) ? ` + ${tableAttrs(L)} por nivel` : ''}${adj('attrBonus', '')}. Ganas uno en los niveles ${ATTR_LEVELS.slice(0, -1).join(', ')} y ${ATTR_LEVELS[ATTR_LEVELS.length - 1]}.`],
      ['Habilidades', `${rankBudget(ch)} rangos: ${SKILL_RANKS} al crear${L > 1 ? ` + ${tableRanks(L)} por nivel` : ''}${adj('rankBonus', '')}. Rango máximo ${rankCap(ch)}${T < TIER_RANK.length ? ` hasta el nivel ${T * 5}` : ''}.`],
      ['Salud', `${health(ch)}: 10 + Fuerza${T > 1 ? ` × ${T} escalones` : ''}${L > 1 ? ` + ${tableHealth(L)} por nivel` : ''}${adj('healthBonus', '')}.`],
      ['Talentos', `El talento clave de tu camino${L > 1 ? `, ${L - 1} por nivel` : ''} y ${T} por tu ascendencia.`]
    ];
    const done = L > 1 ? `<details class="tor-fold" data-lvfold="list" ${lvOpen.list ? 'open' : ''}><summary>Lo que te ha dado cada nivel</summary><div class="tor-fold-body"><ul class="tor-lvlist">${Array.from({ length: L - 1 }, (_, i) => L - i).map(l => `<li><b>Nivel ${l}</b><span>${esc(levelGains(l).join(' · '))}</span></li>`).join('')}</ul></div></details>` : '';
    const anyExtra = EXTRAS.some(([k]) => extra(ch, k));
    return `<section class="tor-panel tor-levels" data-levels>${heading(8, 'Nivel y progresión', `nivel ${L} · escalón ${T}`)}
      <div class="tor-level"><div class="tor-level-num"><small>NIVEL</small><b>${L}</b></div><span class="tor-tier">Escalón ${T} de ${TIER_RANK.length}</span>
        <div class="tor-level-actions"><button type="button" class="tor-button" data-levelup ${L >= MAX_LEVEL ? 'disabled' : ''}>${L >= MAX_LEVEL ? 'NIVEL MÁXIMO' : `▲ SUBIR AL NIVEL ${L + 1}`}</button><button type="button" class="tor-button ghost" data-leveldown ${L <= 1 ? 'disabled' : ''}>BAJAR UN NIVEL</button></div></div>
      <p class="tor-note">Al subir, NEXO suma lo que da la tabla de progresión: los puntos de atributo y los rangos nuevos quedan por repartir arriba, y la salud sube sola. ${manualLink('tor-subir-nivel', 'Subir de nivel en el manual')}</p>
      ${L < MAX_LEVEL ? `<div class="tor-next"><b>El nivel ${L + 1} te dará</b><span>${esc(levelGains(L + 1).join(' · '))}</span></div>` : ''}
      ${info(rows)}
      <p class="tor-note" data-talent-count>${esc(talentCount(ch))}</p>
      ${done}
      <details class="tor-fold" data-lvfold="extras" ${lvOpen.extras || anyExtra ? 'open' : ''}><summary>Ajustes de quien dirige</summary><div class="tor-fold-body"><p class="tor-note">Si tu mesa da algo fuera de la tabla (una recompensa, una regla de la casa), apúntalo aquí y se suma a lo anterior.</p>
        <div class="tor-fields tor-fields-3 tor-advance">${EXTRAS.map(([k, label, max]) => `<label class="tor-field"><span>${label} extra</span><input type="number" min="0" max="${max}" data-num="${k}" value="${extra(ch, k)}"></label>`).join('')}</div></div></details>
    </section>`;
  }

  function renderSheet() {
    const ch = current;
    const sheet = host?.querySelector('[data-sheet]');
    if (!ch || !sheet) return;
    sanitize(ch);
    const rows = summary(ch);
    const pending = rows.reduce((t, r) => t + Math.max(0, r.left), 0);
    sheet.innerHTML = `
      <section class="tor-tracker"><div class="tor-tracker-head"><b>${pending > 1 ? `Te quedan ${pending} elecciones` : pending ? 'Te queda 1 elección' : rows.some(r => r.left < 0) ? 'Revisa lo marcado en rojo' : 'Héroe completo'}</b><span>Nivel ${ch.level} · escalón ${tier(ch)}${ch.ancestry && ch.path && ch.level < MAX_LEVEL ? ' <button type="button" class="tor-tracker-up" data-levelup aria-label="Subir de nivel">▲ SUBIR</button>' : ''}</span></div>
        <ul class="tor-pools">${rows.map(r => `<li class="${r.left === 0 ? 'is-done' : r.left < 0 ? 'is-over' : ''}"><span>${r.label}</span><b>${r.show ?? (r.left === 0 ? '✓' : r.left)}</b>${r.show ? '' : `<small>/ ${r.budget}</small>`}</li>`).join('')}</ul></section>
      ${originPanel(ch)}${attributesPanel(ch)}${skillsPanel(ch)}${expertisePanel(ch)}${sheetPanel(ch)}${radiantPanel(ch)}${levelPanel(ch)}`;

    sheet.querySelectorAll('[data-choice]').forEach(select => select.addEventListener('change', () => { current[select.dataset.choice] = select.value; if (select.dataset.choice === 'path') fitPathSkill(current); changed(); }));
    // Subir o bajar repinta la ficha: el foco vuelve al botón pulsado, esté en el seguimiento o en el panel.
    const again = (button, name) => host.querySelector(`${button.closest('[data-levels]') ? '[data-levels]' : '.tor-tracker'} [data-${name}]`)?.focus({ preventScroll: true });
    sheet.querySelectorAll('[data-levelup]').forEach(button => button.addEventListener('click', () => { levelUp(); again(button, 'levelup'); }));
    sheet.querySelectorAll('[data-leveldown]').forEach(button => button.addEventListener('click', () => { levelDown(); again(button, 'leveldown'); }));
    sheet.querySelectorAll('[data-lvfold]').forEach(fold => fold.addEventListener('toggle', () => { lvOpen[fold.dataset.lvfold] = fold.open; }));
    sheet.querySelectorAll('[data-num]').forEach(input => input.addEventListener('change', () => { current[input.dataset.num] = Math.max(0, Math.trunc(Number(input.value)) || 0); changed(); }));
    sheet.querySelectorAll('[data-culture]').forEach(button => button.addEventListener('click', () => toggleCulture(button.dataset.culture)));
    sheet.querySelectorAll('[data-attr]').forEach(button => button.addEventListener('click', () => stepAttr(button.dataset.attr, Number(button.dataset.d))));
    sheet.querySelectorAll('[data-tor-roll]').forEach(button => button.addEventListener('click', () => rollSkill(button.dataset.torRoll)));
    sheet.querySelectorAll('[data-rank]').forEach(button => button.addEventListener('click', () => stepRank(button.dataset.rank, Number(button.dataset.d))));
    const expertise = sheet.querySelector('[data-expertise]');
    expertise.addEventListener('input', () => { current.expertises = expertise.value; scheduleSave(); });
    expertise.addEventListener('change', () => changed());
    sheet.querySelector('[data-radiant]').addEventListener('change', event => { current.radiant = event.target.checked; changed(); });
    sheet.querySelectorAll('[data-ideal]').forEach(button => button.addEventListener('click', () => {
      const n = Number(button.dataset.ideal);
      current.ideal = current.ideal === n ? n - 1 : n;
      changed();
    }));
    sheet.querySelectorAll('[data-prop]').forEach(input => input.addEventListener('input', () => { current[input.dataset.prop] = input.value; scheduleSave(); }));
    if (store.characters.some(item => item.id === ch.id)) host.querySelector('[data-delete]').hidden = false;
    juego?.render(host.querySelector('[data-play]'));
  }

  function ensureHost() {
    if (host) return;
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Spectral:ital,wght@0,400;0,600;1,400&display=swap';
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './src/tormentas/tormentas.css?v=3';
    document.head.append(fonts, stylesheet);
    host = document.createElement('section');
    host.id = 'nexoTormentas';
    host.className = 'tor';
    host.hidden = true;
    host.setAttribute('aria-label', 'NEXO El Archivo de las Tormentas');
    document.body.append(host);
    ap?.mount(host);
    kit?.mount(host);
    host.addEventListener('keydown', event => {
      if (event.key === 'Escape') host.querySelectorAll('.tor-modal').forEach(modal => { modal.hidden = true; });
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
    document.documentElement.classList.add('nexo-tormentas-open');
  }
  function close() {
    flushSave();
    window.NEXO_DICE?.close();
    window.NEXO_NAV?.reset?.();
    current = null;
    host.hidden = true;
    document.documentElement.classList.remove('nexo-tormentas-open');
    if (exitHandler) exitHandler();
  }
  window.addEventListener('pagehide', flushSave);

  // Resumen de las fichas para el perfil.
  const list = () => load().characters.map(ch => ({ id: ch.id, name: ch.name, summary: describe(ch) }));

  window.NEXO_TORMENTAS = { open, close, list };
})();
