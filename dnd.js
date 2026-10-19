(() => {
  const KEY = 'nexo-dnd-v1';
  const ARRAY = [15, 14, 13, 12, 10, 8];
  const BUY_BUDGET = 27;
  const BUY_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
  const SCORE_CAP = 20;
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

  const ABILITIES = [['fue', 'Fuerza', 'FUE'], ['des', 'Destreza', 'DES'], ['con', 'Constitución', 'CON'], ['int', 'Inteligencia', 'INT'], ['sab', 'Sabiduría', 'SAB'], ['car', 'Carisma', 'CAR']];
  const AB = Object.fromEntries(ABILITIES.map(([k, name, short]) => [k, { name, short }]));
  const SKILLS = {
    acrobacias: ['Acrobacias', 'des'], atletismo: ['Atletismo', 'fue'], arcano: ['Conocimiento Arcano', 'int'], engano: ['Engaño', 'car'],
    historia: ['Historia', 'int'], interpretacion: ['Interpretación', 'car'], intimidacion: ['Intimidación', 'car'], investigacion: ['Investigación', 'int'],
    juego_manos: ['Juego de Manos', 'des'], medicina: ['Medicina', 'sab'], naturaleza: ['Naturaleza', 'int'], percepcion: ['Percepción', 'sab'],
    perspicacia: ['Perspicacia', 'sab'], persuasion: ['Persuasión', 'car'], religion: ['Religión', 'int'], sigilo: ['Sigilo', 'des'],
    supervivencia: ['Supervivencia', 'sab'], trato_animales: ['Trato con Animales', 'sab']
  };
  const ALL_SKILLS = Object.keys(SKILLS).sort((a, b) => SKILLS[a][0].localeCompare(SKILLS[b][0], 'es'));

  // Clases del Player's Handbook 2024: dado de golpe, salvaciones, habilidades a elegir [cantidad, lista] y característica de conjuros.
  const CLASSES = {
    barbaro: { name: 'Bárbaro', die: 12, primary: 'Fuerza', saves: ['fue', 'con'], skills: [2, ['trato_animales', 'atletismo', 'intimidacion', 'naturaleza', 'percepcion', 'supervivencia']], armor: 'Ligera, intermedia y escudos', weapons: 'Sencillas y marciales', cast: null, unarmored: 'con', features: 'Furia, Defensa sin armadura, Maestría con armas' },
    bardo: { name: 'Bardo', die: 8, primary: 'Carisma', saves: ['des', 'car'], skills: [3, null], armor: 'Ligera', weapons: 'Sencillas', cast: 'car', features: 'Inspiración bárdica, Lanzamiento de conjuros' },
    brujo: { name: 'Brujo', die: 8, primary: 'Carisma', saves: ['sab', 'car'], skills: [2, ['arcano', 'engano', 'historia', 'intimidacion', 'investigacion', 'naturaleza', 'religion']], armor: 'Ligera', weapons: 'Sencillas', cast: 'car', features: 'Invocaciones sobrenaturales, Magia del pacto' },
    clerigo: { name: 'Clérigo', die: 8, primary: 'Sabiduría', saves: ['sab', 'car'], skills: [2, ['historia', 'perspicacia', 'medicina', 'persuasion', 'religion']], armor: 'Ligera, intermedia y escudos', weapons: 'Sencillas', cast: 'sab', features: 'Lanzamiento de conjuros, Orden divina' },
    druida: { name: 'Druida', die: 8, primary: 'Sabiduría', saves: ['int', 'sab'], skills: [2, ['arcano', 'trato_animales', 'perspicacia', 'medicina', 'naturaleza', 'percepcion', 'religion', 'supervivencia']], armor: 'Ligera y escudos', weapons: 'Sencillas', cast: 'sab', features: 'Lanzamiento de conjuros, Druídico, Orden primigenia' },
    explorador: { name: 'Explorador', die: 10, primary: 'Destreza y Sabiduría', saves: ['fue', 'des'], skills: [3, ['trato_animales', 'atletismo', 'perspicacia', 'investigacion', 'naturaleza', 'percepcion', 'sigilo', 'supervivencia']], armor: 'Ligera, intermedia y escudos', weapons: 'Sencillas y marciales', cast: 'sab', features: 'Lanzamiento de conjuros, Enemigo predilecto, Maestría con armas' },
    guerrero: { name: 'Guerrero', die: 10, primary: 'Fuerza o Destreza', saves: ['fue', 'con'], skills: [2, ['acrobacias', 'trato_animales', 'atletismo', 'historia', 'perspicacia', 'intimidacion', 'persuasion', 'percepcion', 'supervivencia']], armor: 'Todas y escudos', weapons: 'Sencillas y marciales', cast: null, features: 'Estilo de combate, Tomar aliento, Maestría con armas' },
    hechicero: { name: 'Hechicero', die: 6, primary: 'Carisma', saves: ['con', 'car'], skills: [2, ['arcano', 'engano', 'perspicacia', 'intimidacion', 'persuasion', 'religion']], armor: 'Ninguna', weapons: 'Sencillas', cast: 'car', features: 'Lanzamiento de conjuros, Hechicería innata' },
    mago: { name: 'Mago', die: 6, primary: 'Inteligencia', saves: ['int', 'sab'], skills: [2, ['arcano', 'historia', 'perspicacia', 'investigacion', 'medicina', 'naturaleza', 'religion']], armor: 'Ninguna', weapons: 'Sencillas', cast: 'int', features: 'Lanzamiento de conjuros, Ritualista, Recuperación arcana' },
    monje: { name: 'Monje', die: 8, primary: 'Destreza y Sabiduría', saves: ['fue', 'des'], skills: [2, ['acrobacias', 'atletismo', 'historia', 'perspicacia', 'religion', 'sigilo']], armor: 'Ninguna', weapons: 'Sencillas y marciales ligeras', cast: null, unarmored: 'sab', features: 'Artes marciales, Defensa sin armadura' },
    paladin: { name: 'Paladín', die: 10, primary: 'Fuerza y Carisma', saves: ['sab', 'car'], skills: [2, ['atletismo', 'perspicacia', 'intimidacion', 'medicina', 'persuasion', 'religion']], armor: 'Todas y escudos', weapons: 'Sencillas y marciales', cast: 'car', features: 'Imposición de manos, Lanzamiento de conjuros, Maestría con armas' },
    picaro: { name: 'Pícaro', die: 8, primary: 'Destreza', saves: ['des', 'int'], skills: [4, ['acrobacias', 'atletismo', 'engano', 'perspicacia', 'intimidacion', 'investigacion', 'percepcion', 'persuasion', 'juego_manos', 'sigilo']], armor: 'Ligera', weapons: 'Sencillas y marciales con Sutil o Ligera', cast: null, features: 'Pericia, Ataque furtivo, Jerga de ladrones, Maestría con armas' }
  };

  const FEATS = {
    alerta: ['Alerta', 'Suma tu bonificador de competencia a la iniciativa y puedes intercambiarla con un aliado.'],
    artesano: ['Artesano', 'Competencia con tres herramientas de artesano y un 20 % de descuento en objetos no mágicos.'],
    afortunado: ['Afortunado', 'Tienes tantos puntos de suerte como tu bonificador de competencia por descanso largo.'],
    atacante_salvaje: ['Atacante salvaje', 'Una vez por turno, tira dos veces los dados de daño de un arma y quédate con el mejor.'],
    camorrista: ['Camorrista de taberna', 'Golpe sin armas de 1d4 + FUE, repites los 1 de daño y puedes empujar al impactar.'],
    duro: ['Duro', 'Tus puntos de golpe máximos aumentan en 2 por cada nivel.'],
    habilidoso: ['Habilidoso', 'Competencia en tres habilidades o herramientas a tu elección.'],
    iniciado_clerigo: ['Iniciado en la magia (clérigo)', 'Dos trucos y un conjuro de nivel 1 de la lista de clérigo.'],
    iniciado_druida: ['Iniciado en la magia (druida)', 'Dos trucos y un conjuro de nivel 1 de la lista de druida.'],
    iniciado_mago: ['Iniciado en la magia (mago)', 'Dos trucos y un conjuro de nivel 1 de la lista de mago.'],
    musico: ['Músico', 'Competencia con tres instrumentos; tras un descanso das Inspiración heroica a aliados.'],
    sanador: ['Sanador', 'Usas un botiquín para curar con dados de golpe y repites los 1 al curar.']
  };

  // Trasfondos de 2024: las tres características que puede mejorar, su dote de origen, dos habilidades y una herramienta.
  const BACKGROUNDS = {
    acolito: { name: 'Acólito', abil: ['int', 'sab', 'car'], feat: 'iniciado_clerigo', skills: ['perspicacia', 'religion'], tool: 'Útiles de calígrafo' },
    artesano: { name: 'Artesano', abil: ['fue', 'des', 'int'], feat: 'artesano', skills: ['investigacion', 'persuasion'], tool: 'Unas herramientas de artesano' },
    artista: { name: 'Artista', abil: ['fue', 'des', 'car'], feat: 'musico', skills: ['acrobacias', 'interpretacion'], tool: 'Un instrumento musical' },
    charlatan: { name: 'Charlatán', abil: ['des', 'con', 'car'], feat: 'habilidoso', skills: ['engano', 'juego_manos'], tool: 'Útiles de falsificador' },
    criminal: { name: 'Criminal', abil: ['des', 'con', 'int'], feat: 'alerta', skills: ['juego_manos', 'sigilo'], tool: 'Herramientas de ladrón' },
    ermitano: { name: 'Ermitaño', abil: ['con', 'sab', 'car'], feat: 'sanador', skills: ['medicina', 'religion'], tool: 'Útiles de herborista' },
    escriba: { name: 'Escriba', abil: ['des', 'int', 'sab'], feat: 'habilidoso', skills: ['investigacion', 'percepcion'], tool: 'Útiles de calígrafo' },
    granjero: { name: 'Granjero', abil: ['fue', 'con', 'sab'], feat: 'duro', skills: ['trato_animales', 'naturaleza'], tool: 'Herramientas de carpintero' },
    guardia: { name: 'Guardia', abil: ['fue', 'int', 'sab'], feat: 'alerta', skills: ['atletismo', 'percepcion'], tool: 'Un juego' },
    guia: { name: 'Guía', abil: ['des', 'con', 'sab'], feat: 'iniciado_druida', skills: ['sigilo', 'supervivencia'], tool: 'Herramientas de cartógrafo' },
    marinero: { name: 'Marinero', abil: ['fue', 'des', 'sab'], feat: 'camorrista', skills: ['acrobacias', 'percepcion'], tool: 'Herramientas de navegante' },
    mercader: { name: 'Mercader', abil: ['con', 'int', 'car'], feat: 'afortunado', skills: ['trato_animales', 'persuasion'], tool: 'Herramientas de navegante' },
    noble: { name: 'Noble', abil: ['fue', 'int', 'car'], feat: 'habilidoso', skills: ['historia', 'persuasion'], tool: 'Un juego' },
    sabio: { name: 'Sabio', abil: ['con', 'int', 'sab'], feat: 'iniciado_mago', skills: ['arcano', 'historia'], tool: 'Útiles de calígrafo' },
    soldado: { name: 'Soldado', abil: ['fue', 'des', 'con'], feat: 'atacante_salvaje', skills: ['atletismo', 'intimidacion'], tool: 'Un juego' },
    vagabundo: { name: 'Vagabundo', abil: ['des', 'sab', 'car'], feat: 'afortunado', skills: ['perspicacia', 'sigilo'], tool: 'Herramientas de ladrón' }
  };

  const SPECIES = {
    aasimar: { name: 'Aasimar', sizes: ['Mediano', 'Pequeño'], speed: 30, dv: 60, traits: 'Resistencia celestial (necrótico y radiante), Manos curativas, Portador de luz, Revelación celestial (nivel 3)' },
    draconido: { name: 'Dracónido', sizes: ['Mediano'], speed: 30, dv: 60, variantLabel: 'Linaje dracónico', variants: [['negro', 'Negro · ácido'], ['azul', 'Azul · relámpago'], ['laton', 'Latón · fuego'], ['bronce', 'Bronce · relámpago'], ['cobre', 'Cobre · ácido'], ['oro', 'Oro · fuego'], ['verde', 'Verde · veneno'], ['rojo', 'Rojo · fuego'], ['plata', 'Plata · frío'], ['blanco', 'Blanco · frío']], traits: 'Arma de aliento, Resistencia al daño de tu linaje, Vuelo dracónico (nivel 5)' },
    elfo: { name: 'Elfo', sizes: ['Mediano'], speed: 30, dv: 60, variantLabel: 'Linaje élfico', variants: [['drow', 'Drow', { dv: 120 }], ['alto', 'Alto elfo'], ['silvano', 'Elfo silvano', { speed: 35 }]], skillPick: [1, ['perspicacia', 'percepcion', 'supervivencia']], traits: 'Ascendencia feérica, Sentidos agudos, Trance' },
    enano: { name: 'Enano', sizes: ['Mediano'], speed: 30, dv: 120, hpPerLevel: 1, traits: 'Resistencia enana (veneno), Dureza enana (+1 PG por nivel), Afinidad con la piedra' },
    gnomo: { name: 'Gnomo', sizes: ['Pequeño'], speed: 30, dv: 60, variantLabel: 'Linaje gnomo', variants: [['bosque', 'Gnomo de los bosques'], ['roca', 'Gnomo de las rocas']], traits: 'Astucia gnoma (ventaja en salvaciones de INT, SAB y CAR)' },
    goliat: { name: 'Goliat', sizes: ['Mediano'], speed: 35, dv: 0, variantLabel: 'Ascendencia gigante', variants: [['nube', 'Nube · salto de las nubes'], ['fuego', 'Fuego · ardor'], ['escarcha', 'Escarcha · frío glacial'], ['colina', 'Colina · derribo'], ['piedra', 'Piedra · aguante de la piedra'], ['tormenta', 'Tormenta · trueno']], traits: 'Forma grande (nivel 5), Complexión poderosa' },
    humano: { name: 'Humano', sizes: ['Mediano', 'Pequeño'], speed: 30, dv: 0, skillPick: [1, null], originFeat: true, traits: 'Ingenioso (Inspiración heroica tras un descanso largo), Hábil, Versátil' },
    mediano: { name: 'Mediano', sizes: ['Pequeño'], speed: 30, dv: 0, traits: 'Valiente, Agilidad mediana, Suerte, Sigilo natural' },
    orco: { name: 'Orco', sizes: ['Mediano'], speed: 30, dv: 120, traits: 'Descarga de adrenalina, Aguante incansable' },
    tiefling: { name: 'Tiefling', sizes: ['Mediano', 'Pequeño'], speed: 30, dv: 60, variantLabel: 'Legado infernal', variants: [['abisal', 'Abisal · veneno'], ['ctonico', 'Ctónico · necrótico'], ['infernal', 'Infernal · fuego']], traits: 'Presencia sobrenatural (Taumaturgia)' }
  };
  const LANGUAGES = ['Común de signos', 'Dracónico', 'Élfico', 'Enano', 'Gigante', 'Gnomo', 'Goblin', 'Mediano', 'Orco'];
  const LANG_PICKS = 2;
  const ALIGNMENTS = ['Legal bueno', 'Neutral bueno', 'Caótico bueno', 'Legal neutral', 'Neutral', 'Caótico neutral', 'Legal malvado', 'Neutral malvado', 'Caótico malvado'];

  let host = null;
  let store = load();
  let current = null;
  let exitHandler = null;
  let saveTimer = 0;

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
      return { characters: Array.isArray(parsed.characters) ? parsed.characters : [] };
    } catch { return { characters: [] }; }
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); return true; } catch { return false; }
  }
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  const signed = n => (n < 0 ? '−' + Math.abs(n) : '+' + n);

  function newCharacter() {
    return {
      id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      name: '', player: '', campaign: '', alignment: '', level: 1, cls: '', species: '', variant: '', size: '', bg: '',
      method: 'array', base: emptyBase('array'), bonusMode: '21', bonus2: '', bonus1: '',
      picks: { class: [], species: [], feat: [], featH: [] }, humanFeat: '', langs: [], notes: ''
    };
  }
  function emptyBase(method) {
    return Object.fromEntries(ABILITIES.map(([k]) => [k, method === 'buy' ? 8 : null]));
  }

  // Características y valores derivados
  function bonus(ch, key) {
    const bg = BACKGROUNDS[ch.bg];
    if (!bg || !bg.abil.includes(key)) return 0;
    if (ch.bonusMode === '111') return 1;
    return key === ch.bonus2 ? 2 : key === ch.bonus1 ? 1 : 0;
  }
  function score(ch, key) {
    const base = ch.base[key];
    return base == null ? null : Math.min(SCORE_CAP, base + bonus(ch, key));
  }
  function mod(ch, key) {
    const s = score(ch, key);
    return s == null ? 0 : Math.floor((s - 10) / 2);
  }
  const profBonus = ch => Math.ceil(ch.level / 4) + 1;
  function originFeats(ch) {
    const list = [];
    if (BACKGROUNDS[ch.bg]) list.push(BACKGROUNDS[ch.bg].feat);
    if (ch.species === 'humano' && ch.humanFeat) list.push(ch.humanFeat);
    return list;
  }
  const hasFeat = (ch, feat) => originFeats(ch).includes(feat);
  function speciesInfo(ch) {
    const sp = SPECIES[ch.species];
    if (!sp) return null;
    const variant = sp.variants?.find(([k]) => k === ch.variant);
    return { ...sp, ...(variant?.[2] || {}), variantName: variant?.[1] || '' };
  }
  function hitPoints(ch) {
    const cls = CLASSES[ch.cls];
    if (!cls) return null;
    const con = mod(ch, 'con');
    let hp = Math.max(1, cls.die + con);
    for (let l = 2; l <= ch.level; l += 1) hp += Math.max(1, cls.die / 2 + 1 + con);
    hp += (SPECIES[ch.species]?.hpPerLevel || 0) * ch.level;
    if (hasFeat(ch, 'duro')) hp += 2 * ch.level;
    return hp;
  }
  function armorClass(ch) {
    const extra = CLASSES[ch.cls]?.unarmored;
    return 10 + mod(ch, 'des') + (extra ? mod(ch, extra) : 0);
  }
  function proficientSkills(ch) {
    const set = new Set(BACKGROUNDS[ch.bg]?.skills || []);
    Object.values(ch.picks).forEach(list => list.forEach(k => set.add(k)));
    return set;
  }
  const skillTotal = (ch, key, prof) => mod(ch, SKILLS[key][1]) + (prof.has(key) ? profBonus(ch) : 0);

  // Elecciones de habilidades: cada fuente tiene un número de elecciones y una lista permitida.
  function pickSources(ch) {
    const out = [];
    const cls = CLASSES[ch.cls];
    if (cls) out.push({ id: 'class', label: 'Clase · ' + cls.name, count: cls.skills[0], list: cls.skills[1] || ALL_SKILLS });
    const sp = SPECIES[ch.species];
    if (sp?.skillPick) out.push({ id: 'species', label: 'Especie · ' + sp.name, count: sp.skillPick[0], list: sp.skillPick[1] || ALL_SKILLS });
    if (BACKGROUNDS[ch.bg]?.feat === 'habilidoso') out.push({ id: 'feat', label: 'Dote Habilidoso · trasfondo', count: 3, list: ALL_SKILLS });
    if (ch.species === 'humano' && ch.humanFeat === 'habilidoso') out.push({ id: 'featH', label: 'Dote Habilidoso · humano', count: 3, list: ALL_SKILLS });
    return out;
  }
  function sanitize(ch) {
    const sp = SPECIES[ch.species];
    if (!sp?.variants?.some(([k]) => k === ch.variant)) ch.variant = '';
    if (!sp) ch.size = '';
    else if (sp.sizes.length === 1) ch.size = sp.sizes[0];
    else if (!sp.sizes.includes(ch.size)) ch.size = '';
    if (ch.species !== 'humano') ch.humanFeat = '';
    const abil = BACKGROUNDS[ch.bg]?.abil || [];
    if (!abil.includes(ch.bonus2)) ch.bonus2 = '';
    if (!abil.includes(ch.bonus1) || ch.bonus1 === ch.bonus2) ch.bonus1 = '';
    const taken = new Set(BACKGROUNDS[ch.bg]?.skills || []);
    const sources = pickSources(ch);
    Object.keys(ch.picks).forEach(id => { if (!sources.some(s => s.id === id)) ch.picks[id] = []; });
    sources.forEach(s => {
      ch.picks[s.id] = ch.picks[s.id].filter(k => {
        if (!s.list.includes(k) || taken.has(k)) return false;
        taken.add(k);
        return true;
      }).slice(0, s.count);
    });
  }

  function buySpent(ch) {
    return ABILITIES.reduce((t, [k]) => t + (BUY_COST[ch.base[k]] ?? 0), 0);
  }
  function summary(ch) {
    const rows = [];
    rows.push({ label: 'Clase', left: ch.cls ? 0 : 1, budget: 1 });
    const sp = SPECIES[ch.species];
    const spNeeds = 1 + (sp?.variants ? 1 : 0) + (sp && sp.sizes.length > 1 ? 1 : 0);
    const spLeft = !sp ? 1 : (sp.variants && !ch.variant ? 1 : 0) + (sp.sizes.length > 1 && !ch.size ? 1 : 0);
    rows.push({ label: 'Especie', left: spLeft, budget: sp ? spNeeds : 1 });
    rows.push({ label: 'Trasfondo', left: ch.bg ? 0 : 1, budget: 1 });
    if (ch.method === 'buy') rows.push({ label: 'Compra de puntos', left: BUY_BUDGET - buySpent(ch), budget: BUY_BUDGET });
    else rows.push({ label: ch.method === 'array' ? 'Matriz estándar' : 'Tiradas', left: ABILITIES.filter(([k]) => ch.base[k] == null).length, budget: 6 });
    if (ch.bg) {
      const left = ch.bonusMode === '111' ? 0 : (ch.bonus2 ? 0 : 1) + (ch.bonus1 ? 0 : 1);
      rows.push({ label: 'Mejora de trasfondo', left, budget: ch.bonusMode === '111' ? 3 : 2 });
    }
    const sources = pickSources(ch);
    if (sources.length) {
      const budget = sources.reduce((t, s) => t + s.count, 0);
      rows.push({ label: 'Habilidades', left: budget - sources.reduce((t, s) => t + ch.picks[s.id].length, 0), budget });
    }
    if (ch.species === 'humano') rows.push({ label: 'Dote de origen', left: ch.humanFeat ? 0 : 1, budget: 1 });
    rows.push({ label: 'Idiomas', left: LANG_PICKS - ch.langs.length, budget: LANG_PICKS });
    return rows;
  }
  function isComplete(ch) { return summary(ch).every(row => row.left === 0); }

  // Acciones
  function update(fn) {
    fn(current);
    sanitize(current);
    changed();
  }
  function setBase(key, value) {
    const ch = current;
    if (ch.method === 'array') {
      const n = value === '' ? null : Number(value);
      const owner = ABILITIES.find(([k]) => k !== key && ch.base[k] === n);
      if (n != null && owner) ch.base[owner[0]] = ch.base[key];
      ch.base[key] = n;
    } else if (ch.method === 'roll') {
      const n = Math.trunc(Number(value));
      ch.base[key] = value === '' || !Number.isFinite(n) ? null : Math.max(3, Math.min(18, n));
    }
    changed();
  }
  function stepBuy(key, delta) {
    const ch = current;
    const next = ch.base[key] + delta;
    if (next < 8 || next > 15) return flash(next < 8 ? 'Con la compra de puntos ninguna característica baja de 8.' : 'Con la compra de puntos ninguna característica sube de 15 antes de la mejora del trasfondo.');
    const cost = BUY_COST[next] - BUY_COST[ch.base[key]];
    if (buySpent(ch) + cost > BUY_BUDGET) return flash(`Subir a ${next} cuesta ${cost} puntos y no te quedan suficientes.`);
    ch.base[key] = next;
    changed();
  }
  function roll4d6() {
    const dice = Array.from(crypto.getRandomValues(new Uint32Array(4)), n => (n % 6) + 1).sort((a, b) => b - a);
    return dice[0] + dice[1] + dice[2];
  }
  function setMethod(method) {
    if (current.method === method) return;
    current.method = method;
    current.base = emptyBase(method);
    changed();
  }
  function togglePick(sourceId, skill) {
    const ch = current;
    const source = pickSources(ch).find(s => s.id === sourceId);
    if (!source) return;
    const list = ch.picks[sourceId];
    if (list.includes(skill)) list.splice(list.indexOf(skill), 1);
    else if (proficientSkills(ch).has(skill)) return flash(`Ya eres competente en ${SKILLS[skill][0]}. Elige otra habilidad.`);
    else if (list.length >= source.count) return flash(`${source.label}: ya has elegido ${source.count}. Quita una para cambiarla.`);
    else list.push(skill);
    changed();
  }
  function toggleLang(lang) {
    const list = current.langs;
    if (list.includes(lang)) list.splice(list.indexOf(lang), 1);
    else if (list.length >= LANG_PICKS) return flash(`Empiezas con el Común y ${LANG_PICKS} idiomas más. Quita uno para cambiarlo.`);
    else list.push(lang);
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
  function frame(body, status = 'REINOS OLVIDADOS Y POR FORJAR') {
    host.innerHTML = `<header class="dnd-top"><button class="dnd-brand" data-exit aria-label="Volver al selector de sistemas"><span class="dnd-seal">N</span><span><b>NEXO</b><small>DUNGEONS &amp; DRAGONS · 5.5</small></span></button><span class="dnd-status" data-save-status>${esc(status)}</span></header><main class="dnd-main">${body}</main><div class="dnd-flash" data-flash hidden role="status"></div>`;
    host.querySelectorAll('[data-exit]').forEach(button => button.addEventListener('click', close));
  }

  function describe(ch) {
    const parts = [SPECIES[ch.species]?.name, CLASSES[ch.cls] ? CLASSES[ch.cls].name + ' ' + ch.level : '', BACKGROUNDS[ch.bg]?.name].filter(Boolean);
    return parts.length ? parts.join(' · ') : 'Sin origen elegido';
  }
  function renderList() {
    flushSave();
    current = null;
    const rows = store.characters;
    const cards = rows.length ? rows.map(ch => {
      const done = isComplete(ch);
      return `<button class="dnd-card" data-open="${esc(ch.id)}"><span class="dnd-card-seal">${esc((ch.name || '?').trim().charAt(0).toUpperCase() || '?')}</span><span class="dnd-card-copy"><b>${esc(ch.name || 'Aventurero sin nombre')}</b><small>${esc(describe(ch))}</small></span><span class="dnd-badge ${done ? 'is-done' : ''}">${done ? 'LISTO' : 'EN CREACIÓN'}</span></button>`;
    }).join('') : '<div class="dnd-empty"><span>⚔</span><b>La taberna está vacía</b><small>Pulsa «Forjar un nuevo aventurero» para crear tu primer personaje.</small></div>';
    frame(`<p class="dnd-kicker">NEXO / DUNGEONS &amp; DRAGONS · REGLAS DE 2024</p><h1>Tus <em>aventureros</em></h1><p class="dnd-intro">Crea personajes con el Manual del Jugador de 2024: clase, especie y trasfondo, puntuaciones de característica con su mejora de trasfondo, habilidades e idiomas. NEXO calcula modificadores, puntos de golpe, salvaciones y habilidades, y guarda las fichas en este dispositivo.</p><div class="dnd-actions"><button class="dnd-button" data-new>✚ FORJAR UN NUEVO AVENTURERO</button><button class="dnd-button ghost" data-exit>← VOLVER A SISTEMAS</button></div><div class="dnd-list">${cards}</div>`);
    host.querySelector('[data-new]').addEventListener('click', () => openEditor(newCharacter()));
    host.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => {
      const ch = store.characters.find(item => item.id === button.dataset.open);
      if (ch) openEditor(ch);
    }));
    host.scrollTop = 0;
  }

  function field(label, prop, opts = {}) {
    const list = opts.list ? ` list="${opts.list}"` : '';
    return `<label class="dnd-field"><span>${label}</span><input data-prop="${prop}" value="${esc(current[prop])}" maxlength="80" autocomplete="off"${list} placeholder="${esc(opts.placeholder || '')}"></label>`;
  }
  function options(entries, selected, empty) {
    return (empty ? `<option value="" ${selected ? '' : 'selected'}>${esc(empty)}</option>` : '') + entries.map(([value, label]) => `<option value="${esc(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${esc(label)}</option>`).join('');
  }
  const sorted = obj => Object.entries(obj).map(([k, v]) => [k, v.name]).sort((a, b) => a[1].localeCompare(b[1], 'es'));

  function openEditor(ch) {
    current = ch;
    const saved = store.characters.some(item => item.id === ch.id);
    frame(`<div class="dnd-editor-head"><button class="dnd-button ghost" data-back>← TUS AVENTUREROS</button><button class="dnd-button danger" data-delete ${saved ? '' : 'hidden'}>ELIMINAR</button></div>
      <section class="dnd-panel"><h2><span>I</span> Identidad</h2><div class="dnd-fields">
        ${field('Nombre', 'name', { placeholder: 'Nombre del personaje' })}${field('Jugador', 'player')}${field('Campaña', 'campaign')}${field('Alineamiento', 'alignment', { list: 'dndAlignments' })}
      </div><datalist id="dndAlignments">${ALIGNMENTS.map(a => `<option value="${esc(a)}">`).join('')}</datalist></section>
      <div data-sheet></div>
      <section class="dnd-panel"><h2><span>VII</span> Equipo y notas</h2><p class="dnd-note">El equipo inicial depende de la clase y el trasfondo (o 50 po del trasfondo en su lugar). Anota aquí lo que elijas, conjuros, rasgos de personalidad e historia.</p><textarea class="dnd-notes" data-prop="notes" rows="6" placeholder="Equipo, conjuros, historia…">${esc(ch.notes)}</textarea></section>
      <div class="dnd-modal" data-modal hidden><div class="dnd-modal-card" role="alertdialog" aria-modal="true" aria-labelledby="dndDelTitle"><h3 id="dndDelTitle">¿Retirar a este aventurero?</h3><p>La ficha se borrará de este dispositivo y no se podrá recuperar.</p><div class="dnd-actions"><button class="dnd-button ghost" data-cancel>CANCELAR</button><button class="dnd-button danger" data-confirm>ELIMINAR FICHA</button></div></div></div>`, saved ? 'GUARDADO EN ESTE DISPOSITIVO' : 'FICHA NUEVA · SIN GUARDAR');

    host.querySelector('[data-back]').addEventListener('click', renderList);
    host.querySelectorAll('[data-prop]').forEach(input => input.addEventListener('input', () => {
      current[input.dataset.prop] = input.value;
      scheduleSave();
      host.querySelector('[data-delete]').hidden = false;
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

  function info(rows) {
    return `<dl class="dnd-info">${rows.filter(Boolean).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  }
  function originPanel(ch) {
    const cls = CLASSES[ch.cls];
    const sp = speciesInfo(ch);
    const bg = BACKGROUNDS[ch.bg];
    const levels = Array.from({ length: 20 }, (_, i) => [i + 1, 'Nivel ' + (i + 1)]);
    const featChoices = Object.entries(FEATS).map(([k, [name]]) => [k, name]);
    return `<section class="dnd-panel"><h2><span>II</span> Origen <small>Clase · Especie · Trasfondo</small></h2><div class="dnd-cols">
      <div class="dnd-col"><div class="dnd-col-head"><h3>Clase</h3></div>
        <label class="dnd-field"><span>Clase</span><select data-choice="cls">${options(sorted(CLASSES), ch.cls, 'Elige una clase…')}</select></label>
        <label class="dnd-field"><span>Nivel</span><select data-choice="level">${options(levels, ch.level)}</select></label>
        ${cls ? info([['Dado de golpe', 'd' + cls.die], ['Característica principal', cls.primary], ['Salvaciones', cls.saves.map(k => AB[k].name).join(' y ')], ['Armadura', cls.armor], ['Armas', cls.weapons], ['Rasgos de nivel 1', cls.features]]) : '<p class="dnd-note">La clase fija tu dado de golpe, tus tiradas de salvación y las habilidades entre las que eliges.</p>'}
      </div>
      <div class="dnd-col"><div class="dnd-col-head"><h3>Especie</h3></div>
        <label class="dnd-field"><span>Especie</span><select data-choice="species">${options(sorted(SPECIES), ch.species, 'Elige una especie…')}</select></label>
        ${sp?.variants ? `<label class="dnd-field"><span>${esc(sp.variantLabel)}</span><select data-choice="variant">${options(sp.variants, ch.variant, 'Elige…')}</select></label>` : ''}
        ${sp && sp.sizes.length > 1 ? `<label class="dnd-field"><span>Tamaño</span><select data-choice="size">${options(sp.sizes.map(s => [s, s]), ch.size, 'Elige…')}</select></label>` : ''}
        ${ch.species === 'humano' ? `<label class="dnd-field"><span>Dote de origen (Versátil)</span><select data-choice="humanFeat">${options(featChoices, ch.humanFeat, 'Elige una dote…')}</select></label>` : ''}
        ${sp ? info([['Tamaño', ch.size || sp.sizes.join(' o ')], ['Velocidad', sp.speed + ' pies'], ['Visión en la oscuridad', sp.dv ? sp.dv + ' pies' : 'No'], ['Rasgos', sp.traits], ch.humanFeat && ['Dote', FEATS[ch.humanFeat][1]]]) : '<p class="dnd-note">En 2024 la especie no mejora características: da rasgos, tamaño, velocidad y visión.</p>'}
      </div>
      <div class="dnd-col"><div class="dnd-col-head"><h3>Trasfondo</h3></div>
        <label class="dnd-field"><span>Trasfondo</span><select data-choice="bg">${options(sorted(BACKGROUNDS), ch.bg, 'Elige un trasfondo…')}</select></label>
        ${bg ? info([['Características', bg.abil.map(k => AB[k].name).join(', ')], ['Dote de origen', FEATS[bg.feat][0]], ['Efecto', FEATS[bg.feat][1]], ['Habilidades', bg.skills.map(k => SKILLS[k][0]).join(' y ')], ['Herramienta', bg.tool]]) : '<p class="dnd-note">El trasfondo mejora tres características, da una dote de origen, dos habilidades y una herramienta.</p>'}
      </div>
    </div></section>`;
  }

  function abilityControl(ch, key) {
    const base = ch.base[key];
    if (ch.method === 'array') {
      return `<select class="dnd-base" data-base="${key}" aria-label="Puntuación base de ${AB[key].name}">${options(ARRAY.map(n => [n, ch.base[key] === n || !ABILITIES.some(([k]) => ch.base[k] === n) ? String(n) : n + ' (cambiar)']), base ?? '', '—')}</select>`;
    }
    if (ch.method === 'buy') {
      return `<span class="dnd-stepper"><button data-step="${key}" data-d="-1" aria-label="Bajar ${AB[key].name}">−</button><b>${base}</b><button data-step="${key}" data-d="1" aria-label="Subir ${AB[key].name}">+</button></span><small class="dnd-cost">coste ${BUY_COST[base]}</small>`;
    }
    return `<span class="dnd-roll"><input class="dnd-base" type="number" min="3" max="18" data-base="${key}" value="${base ?? ''}" aria-label="Tirada de ${AB[key].name}"><button data-roll="${key}" aria-label="Tirar 4d6 para ${AB[key].name}">🎲</button></span>`;
  }
  function abilitiesPanel(ch) {
    const bg = BACKGROUNDS[ch.bg];
    const methods = [['array', 'Matriz estándar'], ['buy', 'Compra de puntos'], ['roll', 'Tirar 4d6']];
    const help = { array: 'Asigna 15, 14, 13, 12, 10 y 8, una vez cada valor.', buy: `Todas empiezan en 8. Tienes ${BUY_BUDGET} puntos; el máximo antes de la mejora es 15 (13 cuesta 5, 14 cuesta 7 y 15 cuesta 9).`, roll: 'Tira 4d6 por característica y suma los tres más altos, o escribe tus tiradas.' }[ch.method];
    const bonusUi = bg ? `<div class="dnd-bonus"><span class="dnd-bonus-label">Mejora de ${esc(bg.name)}:</span><select data-choice="bonusMode" aria-label="Reparto de la mejora">${options([['21', '+2 y +1'], ['111', '+1, +1 y +1']], ch.bonusMode)}</select>${ch.bonusMode === '21' ? `<select data-choice="bonus2" aria-label="Característica con +2">${options(bg.abil.map(k => [k, '+2 a ' + AB[k].name]), ch.bonus2, '+2 a…')}</select><select data-choice="bonus1" aria-label="Característica con +1">${options(bg.abil.filter(k => k !== ch.bonus2).map(k => [k, '+1 a ' + AB[k].name]), ch.bonus1, '+1 a…')}</select>` : `<span class="dnd-note">+1 a ${bg.abil.map(k => AB[k].name).join(', ')}</span>`}</div>` : '<p class="dnd-note">Elige un trasfondo para aplicar su mejora de +2/+1 o +1/+1/+1 (máximo 20).</p>';
    const cards = ABILITIES.map(([key, name]) => {
      const s = score(ch, key);
      const b = bonus(ch, key);
      return `<div class="dnd-ability ${CLASSES[ch.cls]?.saves.includes(key) ? 'is-save' : ''}"><span class="dnd-ability-name">${name}</span><div class="dnd-ability-mod">${s == null ? '—' : signed(mod(ch, key))}</div><div class="dnd-ability-score">${s ?? '—'}${b ? `<i>+${b}</i>` : ''}</div><div class="dnd-ability-ctl">${abilityControl(ch, key)}</div></div>`;
    }).join('');
    return `<section class="dnd-panel"><h2><span>III</span> Características</h2>
      <div class="dnd-method" role="tablist" aria-label="Método de generación">${methods.map(([k, l]) => `<button role="tab" aria-selected="${ch.method === k}" data-method="${k}">${l}</button>`).join('')}</div>
      <p class="dnd-note dnd-method-help">${help}${ch.method === 'roll' ? ' <button class="dnd-link" data-roll-all>Tirar las seis</button>' : ''}</p>
      ${bonusUi}<div class="dnd-abilities">${cards}</div></section>`;
  }

  function proficiencyPanel(ch) {
    const sources = pickSources(ch);
    const bg = BACKGROUNDS[ch.bg];
    const prof = proficientSkills(ch);
    const blocks = sources.map(s => {
      const picked = ch.picks[s.id];
      const left = s.count - picked.length;
      const chips = s.list.map(k => {
        const mine = picked.includes(k);
        const other = !mine && prof.has(k);
        return `<button class="dnd-chip ${mine ? 'is-on' : ''}" data-pick="${s.id}" data-skill="${k}" ${other ? 'disabled title="Ya eres competente"' : ''} aria-pressed="${mine}">${esc(SKILLS[k][0])}</button>`;
      }).join('');
      return `<div class="dnd-pick"><div class="dnd-pick-head"><b>${esc(s.label)}</b><span class="dnd-left ${left === 0 ? 'is-done' : ''}">${left === 0 ? 'Completo' : `Elige ${left} más`}</span></div><div class="dnd-chips">${chips}</div></div>`;
    }).join('');
    const fixed = bg ? `<div class="dnd-pick"><div class="dnd-pick-head"><b>Trasfondo · ${esc(bg.name)}</b><span class="dnd-left is-done">Fijas</span></div><div class="dnd-chips">${bg.skills.map(k => `<span class="dnd-chip is-on is-fixed">${esc(SKILLS[k][0])}</span>`).join('')}</div></div>` : '';
    const langLeft = LANG_PICKS - ch.langs.length;
    const langs = `<div class="dnd-pick"><div class="dnd-pick-head"><b>Idiomas · Común y ${LANG_PICKS} más</b><span class="dnd-left ${langLeft === 0 ? 'is-done' : ''}">${langLeft === 0 ? 'Completo' : `Elige ${langLeft} más`}</span></div><div class="dnd-chips"><span class="dnd-chip is-on is-fixed">Común</span>${LANGUAGES.map(l => `<button class="dnd-chip ${ch.langs.includes(l) ? 'is-on' : ''}" data-lang="${esc(l)}" aria-pressed="${ch.langs.includes(l)}">${esc(l)}</button>`).join('')}</div></div>`;
    const hint = sources.length || bg ? '' : '<p class="dnd-note">Elige clase, especie y trasfondo para ver qué habilidades te corresponden.</p>';
    return `<section class="dnd-panel"><h2><span>IV</span> Competencias <small>habilidades e idiomas</small></h2>${hint}<div class="dnd-picks">${fixed}${blocks}${langs}</div></section>`;
  }

  function sheetPanel(ch) {
    const cls = CLASSES[ch.cls];
    const sp = speciesInfo(ch);
    const pb = profBonus(ch);
    const prof = proficientSkills(ch);
    const hp = hitPoints(ch);
    const perception = 10 + skillTotal(ch, 'percepcion', prof);
    const init = mod(ch, 'des') + (hasFeat(ch, 'alerta') ? pb : 0);
    const stats = [
      ['Bonif. competencia', signed(pb)], ['Puntos de golpe', hp ?? '—'], ['Dados de golpe', cls ? `${ch.level}d${cls.die}` : '—'],
      ['CA sin armadura', armorClass(ch)], ['Iniciativa', signed(init)], ['Velocidad', sp ? sp.speed + ' pies' : '—'],
      ['Percepción pasiva', perception], ['Visión oscuridad', sp ? (sp.dv ? sp.dv + ' pies' : 'No') : '—']
    ];
    if (cls?.cast) stats.push(['CD de conjuros', 8 + pb + mod(ch, cls.cast)], ['Ataque de conjuro', signed(pb + mod(ch, cls.cast))]);
    if (hasFeat(ch, 'afortunado')) stats.push(['Puntos de suerte', pb]);
    const saves = ABILITIES.map(([k, name]) => {
      const p = !!cls?.saves.includes(k);
      return `<li class="${p ? 'is-prof' : ''}"><i></i><span>${name}</span><b>${signed(mod(ch, k) + (p ? pb : 0))}</b></li>`;
    }).join('');
    const skills = ALL_SKILLS.map(k => `<li class="${prof.has(k) ? 'is-prof' : ''}"><i></i><span>${esc(SKILLS[k][0])} <small>${AB[SKILLS[k][1]].short}</small></span><b>${signed(skillTotal(ch, k, prof))}</b></li>`).join('');
    const unarmored = cls?.unarmored ? `Defensa sin armadura: 10 + DES + ${AB[cls.unarmored].short}.` : 'Sin armadura: 10 + DES.';
    return `<section class="dnd-panel"><h2><span>V</span> Hoja calculada <small>${esc(describe(ch))}</small></h2>
      <div class="dnd-stats">${stats.map(([k, v]) => `<div><small>${k}</small><b>${esc(v)}</b></div>`).join('')}</div>
      <p class="dnd-note dnd-stats-note">${unarmored} Puntos de golpe: máximo del dado + CON a nivel 1 y la media (${cls ? cls.die / 2 + 1 : '—'}) + CON por nivel${SPECIES[ch.species]?.hpPerLevel ? ', +1 por nivel (enano)' : ''}${hasFeat(ch, 'duro') ? ', +2 por nivel (Duro)' : ''}.</p>
      <div class="dnd-cols dnd-cols-2"><div class="dnd-col"><div class="dnd-col-head"><h3>Tiradas de salvación</h3></div><ul class="dnd-rolls">${saves}</ul></div><div class="dnd-col"><div class="dnd-col-head"><h3>Habilidades</h3></div><ul class="dnd-rolls dnd-rolls-2">${skills}</ul></div></div></section>`;
  }

  function renderSheet() {
    const ch = current;
    const sheet = host?.querySelector('[data-sheet]');
    if (!ch || !sheet) return;
    sanitize(ch);
    const rows = summary(ch);
    const pending = rows.reduce((t, r) => t + Math.max(0, r.left), 0);
    sheet.innerHTML = `
      <section class="dnd-tracker"><div class="dnd-tracker-head"><b>${pending ? `Te quedan ${pending} elecciones` : 'Personaje completo'}</b><span>Manual del Jugador 2024</span></div>
        <ul class="dnd-pools">${rows.map(r => `<li class="${r.left === 0 ? 'is-done' : r.left < 0 ? 'is-over' : ''}"><span>${r.label}</span><b>${r.left === 0 ? '✓' : r.left}</b><small>/ ${r.budget}</small></li>`).join('')}</ul></section>
      ${originPanel(ch)}${abilitiesPanel(ch)}${proficiencyPanel(ch)}${sheetPanel(ch)}`;

    sheet.querySelectorAll('[data-choice]').forEach(select => select.addEventListener('change', () => update(c => {
      const prop = select.dataset.choice;
      c[prop] = prop === 'level' ? Number(select.value) : select.value;
    })));
    sheet.querySelectorAll('[data-method]').forEach(button => button.addEventListener('click', () => setMethod(button.dataset.method)));
    sheet.querySelectorAll('select[data-base]').forEach(select => select.addEventListener('change', () => setBase(select.dataset.base, select.value)));
    sheet.querySelectorAll('input[data-base]').forEach(input => input.addEventListener('change', () => setBase(input.dataset.base, input.value)));
    sheet.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => stepBuy(button.dataset.step, Number(button.dataset.d))));
    sheet.querySelectorAll('[data-roll]').forEach(button => button.addEventListener('click', () => { current.base[button.dataset.roll] = roll4d6(); changed(); }));
    sheet.querySelector('[data-roll-all]')?.addEventListener('click', () => { ABILITIES.forEach(([k]) => { current.base[k] = roll4d6(); }); changed(); });
    sheet.querySelectorAll('[data-pick]').forEach(button => button.addEventListener('click', () => togglePick(button.dataset.pick, button.dataset.skill)));
    sheet.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => toggleLang(button.dataset.lang)));
    if (store.characters.some(item => item.id === ch.id)) host.querySelector('[data-delete]').hidden = false;
  }

  function ensureHost() {
    if (host) return;
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href = 'https://fonts.googleapis.com/css2?family=Alegreya+SC:wght@500;700&family=Alegreya:wght@400;600&display=swap';
    document.head.append(fonts);
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './dnd.css?v=2';
    document.head.append(stylesheet);
    host = document.createElement('section');
    host.id = 'nexoDnd';
    host.className = 'dnd';
    host.hidden = true;
    host.setAttribute('aria-label', 'NEXO Dungeons & Dragons');
    document.body.append(host);
    host.addEventListener('keydown', event => {
      const modal = host.querySelector('[data-modal]');
      if (event.key === 'Escape' && modal && !modal.hidden) modal.hidden = true;
    });
  }
  function open(options = {}) {
    ensureHost();
    exitHandler = options.onExit || null;
    store = load();
    renderList();
    host.hidden = false;
    document.documentElement.classList.add('nexo-dnd-open');
  }
  function close() {
    flushSave();
    current = null;
    host.hidden = true;
    document.documentElement.classList.remove('nexo-dnd-open');
    if (exitHandler) exitHandler();
  }
  window.addEventListener('pagehide', flushSave);

  window.NEXO_DND = { open, close };
})();
