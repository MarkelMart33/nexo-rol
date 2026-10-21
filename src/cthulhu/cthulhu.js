/*
 * NEXO · La llamada de Cthulhu (7ª edición).
 * Creador de investigadores: características (tiradas, valores rápidos o 460 puntos), edad,
 * Suerte, ocupación, puntos de ocupación e interés personal y trasfondo. Los textos son resúmenes propios.
 */
(() => {
  const KEY = 'nexo-cthulhu-v1';
  const GAME = 'cthulhu';
  const QUICK = [40, 50, 50, 50, 60, 60, 70, 80];
  const POINT_BUY = 460;
  const MAX_SKILL = 99;

  // [clave, nombre, abreviatura, tirada]
  const CHARS = [
    ['fue', 'Fuerza', 'FUE', '3d6'], ['con', 'Constitución', 'CON', '3d6'], ['tam', 'Tamaño', 'TAM', '2d6'], ['des', 'Destreza', 'DES', '3d6'],
    ['apa', 'Apariencia', 'APA', '3d6'], ['int', 'Inteligencia', 'INT', '2d6'], ['pod', 'Poder', 'POD', '3d6'], ['edu', 'Educación', 'EDU', '2d6']
  ];
  const CH = Object.fromEntries(CHARS.map(([k, name, short, roll]) => [k, { name, short, roll }]));
  const METHODS = {
    tiradas: ['Tiradas', 'FUE, CON, DES, APA y POD: 3D6×5. TAM, INT y EDU: (2D6+6)×5. Puedes tirar aquí o escribir lo que saques con tus dados.'],
    rapida: ['Valores rápidos', 'Reparte 40, 50, 50, 50, 60, 60, 70 y 80, un valor por característica.'],
    puntos: ['Reparto de puntos', `Reparte ${POINT_BUY} puntos entre las ocho características, entre 15 y 90 cada una.`]
  };

  // Habilidades: [nombre, base, especialidad]. La base de Esquivar es DES/2 y la de Lengua propia, EDU.
  const SKILLS = {
    antropologia: ['Antropología', 1], arqueologia: ['Arqueología', 1], arte: ['Arte/Artesanía', 5, 'Fotografía, Pintura, Actuar…'],
    armaCorta: ['Armas de fuego (Arma corta)', 20], fusil: ['Armas de fuego (Fusil/Escopeta)', 25], buscarLibros: ['Buscar libros', 20],
    cerrajeria: ['Cerrajería', 1], charlataneria: ['Charlatanería', 5], ciencia: ['Ciencia', 1, 'Biología, Química, Física…'],
    pelea: ['Combatir (Pelea)', 25], conducir: ['Conducir automóvil', 20], maquinaria: ['Conducir maquinaria', 1],
    contabilidad: ['Contabilidad', 5], credito: ['Crédito', 0], derecho: ['Derecho', 5], descubrir: ['Descubrir', 25],
    disfrazarse: ['Disfrazarse', 5], electricidad: ['Electricidad', 10], encanto: ['Encanto', 15], equitacion: ['Equitación', 5],
    escuchar: ['Escuchar', 20], esquivar: ['Esquivar', 0], historia: ['Historia', 5], intimidar: ['Intimidar', 15],
    juegoManos: ['Juego de manos', 10], lanzar: ['Lanzar', 20], lenguaPropia: ['Lengua propia', 0, 'Español, inglés…'],
    otrasLenguas: ['Otras lenguas', 1, 'Latín, francés…'], mecanica: ['Mecánica', 10], medicina: ['Medicina', 1],
    mitos: ['Mitos de Cthulhu', 0], nadar: ['Nadar', 20], naturaleza: ['Naturaleza', 10], ocultismo: ['Ocultismo', 5],
    orientarse: ['Orientarse', 10], persuasion: ['Persuasión', 10], pilotar: ['Pilotar', 1, 'Avión, barco…'],
    primerosAuxilios: ['Primeros auxilios', 30], psicoanalisis: ['Psicoanálisis', 1], psicologia: ['Psicología', 10],
    saltar: ['Saltar', 20], seguirRastros: ['Seguir rastros', 10], sigilo: ['Sigilo', 20], supervivencia: ['Supervivencia', 10, 'Desierto, mar, montaña…'],
    tasacion: ['Tasación', 5], trepar: ['Trepar', 20]
  };
  const SOCIAL = ['charlataneria', 'encanto', 'intimidar', 'persuasion'];
  // Mitos de Cthulhu no se puede subir al crear el investigador; Crédito sale solo de los puntos de ocupación.
  const NO_PERSONAL = ['mitos'];
  const ANY_PICK = Object.keys(SKILLS).filter(k => k !== 'mitos' && k !== 'credito');

  // Ocupaciones: crédito [mín, máx], puntos (EDU×4 o EDU×2 + la mejor de alt ×2), habilidades fijas,
  // cuántas interpersonales y cuántas a elección.
  const OCCUPATIONS = {
    anticuario: { name: 'Anticuario', credit: [30, 70], alt: [], skills: ['tasacion', 'arte', 'historia', 'buscarLibros', 'otrasLenguas', 'descubrir'], social: 1, any: 1, text: 'Coleccionista y estudioso de objetos antiguos, con tiempo y dinero para seguir cualquier rastro del pasado.' },
    arqueologo: { name: 'Arqueólogo', credit: [10, 40], alt: [], skills: ['tasacion', 'arqueologia', 'historia', 'otrasLenguas', 'buscarLibros', 'descubrir', 'mecanica', 'orientarse'], social: 0, any: 0, text: 'Excava ruinas y descifra culturas olvidadas; a veces desentierra lo que debía quedar enterrado.' },
    artista: { name: 'Artista', credit: [9, 50], alt: ['des', 'pod'], skills: ['arte', 'historia', 'otrasLenguas', 'psicologia', 'descubrir'], social: 1, any: 2, text: 'Pintor, escultor o fotógrafo, sensible a visiones que otros no perciben.' },
    atleta: { name: 'Atleta', credit: [9, 70], alt: ['des', 'fue'], skills: ['trepar', 'saltar', 'pelea', 'equitacion', 'nadar', 'lanzar'], social: 1, any: 1, text: 'Deportista profesional o aficionado de élite, en plena forma física.' },
    autor: { name: 'Autor', credit: [9, 30], alt: [], skills: ['arte', 'historia', 'buscarLibros', 'ocultismo', 'otrasLenguas', 'lenguaPropia', 'psicologia'], social: 0, any: 1, text: 'Novelista o ensayista que investiga para sus libros y encuentra más de lo que buscaba.' },
    bibliotecario: { name: 'Bibliotecario', credit: [9, 35], alt: [], skills: ['contabilidad', 'buscarLibros', 'otrasLenguas', 'lenguaPropia'], social: 0, any: 4, text: 'Guardián de archivos y colecciones, quizá con acceso a la sección restringida.' },
    clerigo: { name: 'Clérigo', credit: [9, 60], alt: [], skills: ['contabilidad', 'historia', 'buscarLibros', 'escuchar', 'otrasLenguas', 'psicologia'], social: 1, any: 1, text: 'Sacerdote, pastor o rabino, consejero de su comunidad y conocedor de sus secretos.' },
    delincuente: { name: 'Delincuente', credit: [5, 65], alt: ['des', 'fue'], skills: ['tasacion', 'pelea', 'armaCorta', 'cerrajeria', 'sigilo', 'psicologia', 'descubrir'], social: 1, any: 0, text: 'Ladrón, contrabandista o matón que vive al margen de la ley en plena Ley Seca.' },
    detectivePolicia: { name: 'Detective de policía', credit: [20, 50], alt: ['des', 'fue'], skills: ['disfrazarse', 'armaCorta', 'derecho', 'escuchar', 'psicologia', 'descubrir'], social: 1, any: 1, text: 'Investigador de homicidios y casos extraños, con placa y contactos.' },
    detectivePrivado: { name: 'Detective privado', credit: [9, 30], alt: ['des', 'fue'], skills: ['arte', 'disfrazarse', 'derecho', 'buscarLibros', 'psicologia', 'descubrir'], social: 1, any: 1, text: 'Sabueso a sueldo que sigue a maridos infieles hasta que un caso lo arrastra a otra cosa.' },
    diletante: { name: 'Diletante', credit: [50, 99], alt: ['apa'], skills: ['arte', 'armaCorta', 'otrasLenguas', 'equitacion'], social: 1, any: 3, text: 'Persona adinerada sin oficio fijo, libre para viajar y satisfacer su curiosidad.' },
    enfermero: { name: 'Enfermero', credit: [9, 30], alt: [], skills: ['primerosAuxilios', 'escuchar', 'medicina', 'psicologia', 'ciencia', 'descubrir'], social: 1, any: 1, text: 'Cuida de enfermos y heridos y ha visto de cerca la muerte y la locura.' },
    ingeniero: { name: 'Ingeniero', credit: [30, 60], alt: [], skills: ['arte', 'electricidad', 'buscarLibros', 'mecanica', 'maquinaria', 'ciencia'], social: 0, any: 2, text: 'Técnico de puentes, motores o radios que confía en lo que se puede medir.' },
    medico: { name: 'Médico', credit: [30, 80], alt: [], skills: ['primerosAuxilios', 'otrasLenguas', 'medicina', 'psicologia', 'ciencia'], social: 0, any: 3, text: 'Doctor en medicina, respetado y con acceso a hospitales y depósitos de cadáveres.' },
    militar: { name: 'Militar', credit: [9, 30], alt: ['des', 'fue'], skills: ['trepar', 'esquivar', 'pelea', 'fusil', 'sigilo', 'supervivencia', 'primerosAuxilios', 'mecanica'], social: 0, any: 0, text: 'Veterano de la Gran Guerra o soldado en activo, acostumbrado al horror de las trincheras.' },
    musico: { name: 'Músico', credit: [9, 30], alt: ['des', 'pod'], skills: ['arte', 'escuchar', 'psicologia'], social: 1, any: 4, text: 'Intérprete de jazz, de orquesta o de cabaret, que vive de noche.' },
    parapsicologo: { name: 'Parapsicólogo', credit: [9, 30], alt: [], skills: ['antropologia', 'arte', 'historia', 'buscarLibros', 'ocultismo', 'otrasLenguas', 'psicologia'], social: 0, any: 1, text: 'Estudia fenómenos paranormales con método científico, o lo intenta.' },
    periodista: { name: 'Periodista', credit: [9, 30], alt: [], skills: ['arte', 'historia', 'buscarLibros', 'lenguaPropia', 'psicologia'], social: 1, any: 2, text: 'Reportero en busca de la exclusiva, con olfato para las historias raras.' },
    policia: { name: 'Agente de policía', credit: [9, 30], alt: ['des', 'fue'], skills: ['pelea', 'armaCorta', 'primerosAuxilios', 'derecho', 'psicologia', 'descubrir', 'conducir'], social: 1, any: 0, text: 'Policía de calle que patrulla los barrios y conoce a sus vecinos.' },
    profesor: { name: 'Profesor', credit: [20, 70], alt: [], skills: ['buscarLibros', 'otrasLenguas', 'lenguaPropia', 'psicologia'], social: 0, any: 4, text: 'Catedrático universitario, quizá de la Universidad Miskatonic, experto en su campo.' },
    vagabundo: { name: 'Vagabundo', credit: [0, 5], alt: ['apa', 'des', 'fue'], skills: ['trepar', 'saltar', 'escuchar', 'orientarse', 'sigilo'], social: 1, any: 2, text: 'Va de pueblo en pueblo en trenes de mercancías, sin hogar ni ataduras.' },
    personalizada: { name: 'Ocupación propia', credit: [0, 99], alt: [], skills: [], social: 0, any: 8, text: 'Pacta con quien dirija la partida una ocupación que no esté en la lista: elige ocho habilidades y su rango de Crédito.' }
  };

  // Edad: pérdida a repartir, de qué características, penalización a APA y EDU, mejoras de EDU y movimiento.
  const AGES = [
    { min: 15, max: 19, loss: 5, from: ['fue', 'tam'], apa: 0, edu: 5, checks: 0, mov: 0, text: 'Resta 5 puntos entre FUE y TAM y 5 a EDU. Tiras la Suerte dos veces y te quedas con la mejor.' },
    { min: 20, max: 39, loss: 0, from: [], apa: 0, edu: 0, checks: 1, mov: 0, text: 'Haz una tirada de mejora de EDU.' },
    { min: 40, max: 49, loss: 5, from: ['fue', 'con', 'des'], apa: 5, edu: 0, checks: 2, mov: 1, text: 'Dos tiradas de mejora de EDU. Resta 5 puntos entre FUE, CON y DES y 5 a APA. MOV −1.' },
    { min: 50, max: 59, loss: 10, from: ['fue', 'con', 'des'], apa: 10, edu: 0, checks: 3, mov: 2, text: 'Tres tiradas de mejora de EDU. Resta 10 puntos entre FUE, CON y DES y 10 a APA. MOV −2.' },
    { min: 60, max: 69, loss: 20, from: ['fue', 'con', 'des'], apa: 15, edu: 0, checks: 4, mov: 3, text: 'Cuatro tiradas de mejora de EDU. Resta 20 puntos entre FUE, CON y DES y 15 a APA. MOV −3.' },
    { min: 70, max: 79, loss: 40, from: ['fue', 'con', 'des'], apa: 20, edu: 0, checks: 4, mov: 4, text: 'Cuatro tiradas de mejora de EDU. Resta 40 puntos entre FUE, CON y DES y 20 a APA. MOV −4.' },
    { min: 80, max: 89, loss: 80, from: ['fue', 'con', 'des'], apa: 25, edu: 0, checks: 4, mov: 5, text: 'Cuatro tiradas de mejora de EDU. Resta 80 puntos entre FUE, CON y DES y 25 a APA. MOV −5.' }
  ];
  const BACKGROUND = [
    ['descripcion', 'Descripción personal', 'Aspecto, gestos, forma de vestir…'], ['ideologia', 'Ideología y creencias', 'Fe, política, convicciones…'],
    ['allegados', 'Allegados', 'Personas importantes para ti y por qué'], ['lugares', 'Lugares significativos', 'Dónde te sientes en casa, o lo contrario'],
    ['posesiones', 'Posesiones preciadas', 'Lo que salvarías de un incendio'], ['rasgos', 'Rasgos', 'Cómo te describirían los demás']
  ];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

  let host = null;
  let store = load();
  let current = null;
  let exitHandler = null;
  let saveTimer = 0;
  let manualBook = null;

  // Apartados: Personajes, Campañas y Manual (src/nexo/apartados.js y el manual de este sistema).
  const ap = window.NEXO_APARTADOS?.create({
    prefix: 'cth', system: () => GAME, frame: body => frame(body),
    leave: () => { flushSave(); current = null; }, renderCharacters: () => renderList(),
    characters: () => store.characters.map(ch => ({ id: ch.id, name: ch.name || 'Investigador sin nombre', summary: describe(ch) })),
    openCharacter: id => { const ch = store.characters.find(item => item.id === id); if (ch) openEditor(ch); else renderList(); },
    currentId: () => current?.id,
    manual: () => manualBook || (manualBook = window.NEXO_MANUALS?.cthulhu?.({ CHARS, CH, SKILLS, OCCUPATIONS, AGES }) || null),
    words: { characters: 'investigadores', character: 'investigador' }
  });
  const manualLink = (id, label) => ap?.link(id, label) || '';

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
      return { characters: Array.isArray(parsed.characters) ? parsed.characters.map(normalize) : [] };
    } catch { return { characters: [] }; }
  }
  function normalize(ch) {
    const fresh = newCharacter();
    const out = { ...fresh, ...ch };
    out.chars = { ...fresh.chars, ...(ch.chars || {}) };
    out.ageLoss = { ...(ch.ageLoss || {}) };
    out.alloc = { ...(ch.alloc || {}) };
    out.specs = { ...(ch.specs || {}) };
    out.occSocial = Array.isArray(ch.occSocial) ? ch.occSocial : [];
    out.occAny = Array.isArray(ch.occAny) ? ch.occAny : [];
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
  const d = sides => 1 + Math.floor(Math.random() * sides);
  const rollChar = key => (CH[key].roll === '3d6' ? d(6) + d(6) + d(6) : d(6) + d(6) + 6) * 5;
  const rollLuck = () => (d(6) + d(6) + d(6)) * 5;

  function newCharacter() {
    return {
      id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      name: '', player: '', campaign: '', residence: '', birthplace: '', age: 25,
      method: 'tiradas', chars: Object.fromEntries(CHARS.map(([k]) => [k, 0])), luck: 0, ageLoss: {}, eduGain: 0, eduLog: '',
      occupation: '', occSocial: [], occAny: [], alloc: {}, specs: {},
      descripcion: '', ideologia: '', allegados: '', lugares: '', posesiones: '', rasgos: '', gear: '', notes: ''
    };
  }

  // Valores derivados
  const ageBand = ch => AGES.find(a => ch.age >= a.min && ch.age <= a.max) || AGES[1];
  const lossSpent = ch => Object.values(ch.ageLoss).reduce((t, n) => t + n, 0);
  function stat(ch, key) {
    const band = ageBand(ch);
    let v = ch.chars[key] || 0;
    if (!v) return 0;
    v -= ch.ageLoss[key] || 0;
    if (key === 'apa') v -= band.apa;
    if (key === 'edu') v = Math.min(99, v - band.edu + (Number(ch.eduGain) || 0));
    return Math.max(1, v);
  }
  const occ = ch => OCCUPATIONS[ch.occupation];
  function occPoints(ch) {
    const o = occ(ch);
    if (!o) return 0;
    if (!o.alt.length) return stat(ch, 'edu') * 4;
    return stat(ch, 'edu') * 2 + Math.max(...o.alt.map(k => stat(ch, k))) * 2;
  }
  const personalPoints = ch => stat(ch, 'int') * 2;
  const occSkills = ch => (occ(ch) ? new Set([...occ(ch).skills, ...ch.occSocial, ...ch.occAny, 'credito']) : new Set());
  function base(ch, key) {
    if (key === 'esquivar') return Math.floor(stat(ch, 'des') / 2);
    if (key === 'lenguaPropia') return stat(ch, 'edu');
    return SKILLS[key][1];
  }
  const alloc = (ch, key, kind) => ch.alloc[key]?.[kind] || 0;
  const skill = (ch, key) => base(ch, key) + alloc(ch, key, 'o') + alloc(ch, key, 'p');
  const spent = (ch, kind) => Object.keys(ch.alloc).reduce((t, k) => t + alloc(ch, k, kind), 0);
  const hp = ch => Math.floor((stat(ch, 'con') + stat(ch, 'tam')) / 10);
  const mp = ch => Math.floor(stat(ch, 'pod') / 5);
  function move(ch) {
    const fue = stat(ch, 'fue'), des = stat(ch, 'des'), tam = stat(ch, 'tam');
    const mov = fue < tam && des < tam ? 7 : fue > tam && des > tam ? 9 : 8;
    return Math.max(1, mov - ageBand(ch).mov);
  }
  function build(ch) {
    const sum = stat(ch, 'fue') + stat(ch, 'tam');
    if (sum <= 64) return ['−2', -2];
    if (sum <= 84) return ['−1', -1];
    if (sum <= 124) return ['Ninguna', 0];
    if (sum <= 164) return ['+1D4', 1];
    if (sum <= 204) return ['+1D6', 2];
    const steps = Math.floor((sum - 205) / 80) + 1;
    return [`+${steps + 1}D6`, steps + 2];
  }
  function living(credit) {
    if (credit <= 0) return 'Indigente';
    if (credit <= 9) return 'Pobre';
    if (credit <= 49) return 'Medio';
    if (credit <= 89) return 'Acomodado';
    if (credit <= 98) return 'Rico';
    return 'Inmensamente rico';
  }
  function charsCheck(ch) {
    const values = CHARS.map(([k]) => ch.chars[k] || 0);
    if (values.some(v => !v)) return { left: values.filter(v => !v).length, text: 'Faltan características por fijar.' };
    if (ch.method === 'rapida') {
      const ok = [...values].sort((a, b) => a - b).join() === QUICK.join();
      return { left: ok ? 0 : 1, text: ok ? '' : 'Usa cada valor de la lista una sola vez.' };
    }
    if (ch.method === 'puntos') {
      const total = values.reduce((t, v) => t + v, 0);
      const out = values.some(v => v < 15 || v > 90);
      return { left: out ? 1 : POINT_BUY - total, text: out ? 'Cada característica va de 15 a 90.' : '' };
    }
    const out = CHARS.some(([k, , , roll]) => ch.chars[k] < (roll === '3d6' ? 15 : 40) || ch.chars[k] > 90);
    return { left: out ? 1 : 0, text: out ? 'Algún valor no puede salir con esa tirada.' : '' };
  }

  function sanitize(ch) {
    ch.age = Math.max(15, Math.min(89, Math.trunc(Number(ch.age)) || 25));
    if (!METHODS[ch.method]) ch.method = 'tiradas';
    CHARS.forEach(([k]) => { ch.chars[k] = Math.max(0, Math.min(99, Math.trunc(Number(ch.chars[k])) || 0)); });
    ch.luck = Math.max(0, Math.min(99, Math.trunc(Number(ch.luck)) || 0));
    ch.eduGain = Math.max(0, Math.min(99, Math.trunc(Number(ch.eduGain)) || 0));
    const band = ageBand(ch);
    Object.keys(ch.ageLoss).forEach(k => { if (!band.from.includes(k) || !(ch.ageLoss[k] > 0)) delete ch.ageLoss[k]; });
    if (!OCCUPATIONS[ch.occupation]) ch.occupation = '';
    const o = occ(ch);
    ch.occSocial = o ? ch.occSocial.filter(k => SOCIAL.includes(k) && !o.skills.includes(k)).slice(0, o.social) : [];
    ch.occAny = o ? ch.occAny.filter(k => ANY_PICK.includes(k) && !o.skills.includes(k) && !ch.occSocial.includes(k)).slice(0, o.any) : [];
    const allowed = occSkills(ch);
    Object.keys(ch.alloc).forEach(k => {
      const a = ch.alloc[k];
      if (!SKILLS[k] || !a) { delete ch.alloc[k]; return; }
      a.o = allowed.has(k) ? Math.max(0, Math.trunc(a.o) || 0) : 0;
      a.p = NO_PERSONAL.includes(k) || k === 'credito' ? 0 : Math.max(0, Math.trunc(a.p) || 0);
      if (!a.o && !a.p) delete ch.alloc[k];
    });
  }

  function summary(ch) {
    const check = charsCheck(ch);
    const band = ageBand(ch);
    const o = occ(ch);
    const rows = [
      { label: 'Características', left: check.left, budget: ch.method === 'puntos' ? POINT_BUY : 8 },
      { label: 'Suerte', left: ch.luck ? 0 : 1, budget: 1 }
    ];
    if (band.loss) rows.push({ label: 'Pérdida por edad', left: band.loss - lossSpent(ch), budget: band.loss });
    rows.push({ label: 'Ocupación', left: o ? 0 : 1, budget: 1 });
    if (o && o.social + o.any) rows.push({ label: 'Habilidades de ocupación', left: o.social + o.any - ch.occSocial.length - ch.occAny.length, budget: o.social + o.any });
    if (o) {
      const credit = skill(ch, 'credito');
      rows.push({ label: 'Puntos de ocupación', left: occPoints(ch) - spent(ch, 'o'), budget: occPoints(ch) });
      rows.push({ label: 'Crédito', left: credit < o.credit[0] ? o.credit[0] - credit : credit > o.credit[1] ? o.credit[1] - credit : 0, budget: `${o.credit[0]}–${o.credit[1]}` });
    }
    if (stat(ch, 'int')) rows.push({ label: 'Interés personal', left: personalPoints(ch) - spent(ch, 'p'), budget: personalPoints(ch) });
    return rows;
  }
  const isComplete = ch => summary(ch).every(row => row.left === 0);
  function describe(ch) {
    const parts = [occ(ch)?.name, ch.age ? `${ch.age} años` : ''].filter(Boolean);
    return occ(ch) ? parts.join(' · ') : 'Sin ocupación elegida';
  }

  // Acciones
  function stepLoss(key, delta) {
    const ch = current;
    const band = ageBand(ch);
    const next = (ch.ageLoss[key] || 0) + delta;
    if (next < 0) return;
    if (delta > 0 && lossSpent(ch) >= band.loss) return flash(`Ya has restado los ${band.loss} puntos que pide tu edad.`);
    if (delta > 0 && (ch.chars[key] || 0) - next < 1) return flash('Esa característica no puede bajar más.');
    ch.ageLoss[key] = next;
    changed();
  }
  function rollAll() {
    const ch = current;
    const button = host.querySelector('[data-roll-all]');
    // Si ya hay valores, el primer clic solo pide confirmación.
    if (CHARS.some(([k]) => ch.chars[k]) && button && !button.dataset.armed) {
      button.dataset.armed = '1';
      button.textContent = '¿SEGURO? PULSA DE NUEVO PARA REPETIR';
      return;
    }
    CHARS.forEach(([k]) => { ch.chars[k] = rollChar(k); });
    ch.ageLoss = {};
    ch.eduGain = 0;
    ch.eduLog = '';
    changed();
  }
  function luck() {
    const ch = current;
    const first = rollLuck();
    if (ageBand(ch).min === 15) {
      const second = rollLuck();
      ch.luck = Math.max(first, second);
      flash(`Suerte: ${first} y ${second}. Te quedas con ${ch.luck}.`);
    } else ch.luck = first;
    changed();
  }
  function eduChecks() {
    const ch = current;
    const band = ageBand(ch);
    if (!ch.chars.edu) return flash('Fija primero tu EDU.');
    let gain = 0;
    const log = [];
    for (let i = 0; i < band.checks; i++) {
      const edu = Math.min(99, ch.chars.edu - band.edu + gain);
      const roll = d(100);
      if (roll > edu) {
        const up = d(10);
        gain += up;
        log.push(`${roll} > ${edu}: +${up}`);
      } else log.push(`${roll} ≤ ${edu}: sin mejora`);
    }
    ch.eduGain = gain;
    ch.eduLog = log.join(' · ');
    changed();
  }
  function togglePick(list, key, max, label) {
    const arr = current[list];
    if (arr.includes(key)) arr.splice(arr.indexOf(key), 1);
    else if (arr.length >= max) return flash(`Tu ocupación te deja elegir ${max} ${label}. Quita una para cambiarla.`);
    else arr.push(key);
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
  function frame(body, status = 'ARKHAM, MASSACHUSETTS · 1925') {
    host.innerHTML = `<div class="cth-fog" aria-hidden="true"></div><header class="cth-top"><button class="cth-brand" data-exit aria-label="Volver a la mesa"><span class="cth-sign">${window.NEXO_ICONS?.cthulhu || ''}</span><span><b>NEXO</b><small>LA LLAMADA DE CTHULHU</small></span></button><span class="cth-status" data-save-status>${esc(status)}</span></header><main class="cth-main">${body}</main><button class="nd-fab" data-dice aria-label="Abrir los dados"><span aria-hidden="true">⚄</span><b>Dados</b></button><div class="cth-flash" data-flash hidden role="status"></div>`;
    host.querySelectorAll('[data-exit]').forEach(button => button.addEventListener('click', close));
    host.querySelector('[data-dice]').addEventListener('click', () => window.NEXO_DICE?.tray('cthulhu', { sources: diceSources }));
  }
  // Dados: pruebas de d100 contra las habilidades, características, Suerte y Cordura de la ficha.
  function diceItems(ch) {
    const skills = Object.keys(SKILLS).map(k => ['sk:' + k, SKILLS[k][0] + (ch.specs[k] ? ` (${ch.specs[k]})` : ''), skill(ch, k)]).sort((a, b) => a[1].localeCompare(b[1], 'es'));
    const chars = CHARS.map(([k, name]) => ['ch:' + k, name, stat(ch, k)]);
    const extra = [['luck', 'Suerte', ch.luck || 0], ['san', 'Cordura', stat(ch, 'pod')]];
    return [...skills, ...chars, ...extra].filter(([, , v]) => v > 0);
  }
  function diceSources() { return current ? [{ label: 'Desde la ficha', items: diceItems(current) }] : []; }
  function rollFromSheet(key) {
    const item = diceItems(current).find(([k]) => k === key);
    if (item) window.NEXO_DICE?.roll('cthulhu', { skill: Math.min(99, item[2]), label: item[1] });
  }

  function renderList() {
    flushSave();
    current = null;
    const rows = store.characters;
    const cards = rows.length ? rows.map(ch => {
      const done = isComplete(ch);
      return `<button class="cth-card" data-open="${esc(ch.id)}"><span class="cth-card-tab">EXP. ${esc(ch.id.slice(0, 4).toUpperCase())}</span><span class="cth-card-copy"><b>${esc(ch.name || 'Investigador sin nombre')}</b><small>${esc(describe(ch))}</small></span><span class="cth-stamp ${done ? 'is-done' : ''}">${done ? 'COMPLETO' : 'EN CURSO'}</span></button>`;
    }).join('') : `<div class="cth-empty"><span aria-hidden="true">${window.NEXO_ICONS?.cthulhu || ''}</span><b>El archivo está vacío</b><small>Pulsa «Abrir un expediente» para crear tu primer investigador.</small></div>`;
    frame(`${ap?.tabs('personajes') || ''}<p class="cth-kicker">NEXO / LA LLAMADA DE CTHULHU · 7ª EDICIÓN</p><h1>Tus <em>investigadores</em></h1><p class="cth-intro">Crea investigadores de los años veinte: características, edad, Suerte, ocupación, puntos de habilidad y trasfondo. NEXO calcula puntos de vida, Cordura, puntos de magia, movimiento, bonificación al daño y corpulencia, y guarda las fichas en este dispositivo y en tu cuenta.</p><div class="cth-actions"><button class="cth-button" data-new>ABRIR UN EXPEDIENTE</button><button class="cth-button ghost" data-exit>← VOLVER A LA MESA</button></div><div class="cth-list">${cards}</div><p class="cth-quote">«Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn.»</p>`);
    host.querySelector('[data-new]').addEventListener('click', () => openEditor(newCharacter()));
    host.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => {
      const ch = store.characters.find(item => item.id === button.dataset.open);
      if (ch) openEditor(ch);
    }));
    host.scrollTop = 0;
  }

  function field(label, prop, opts = {}) {
    if (opts.area) return `<label class="cth-field"><span>${label}</span><textarea data-prop="${prop}" rows="${opts.rows || 2}" maxlength="600" placeholder="${esc(opts.placeholder || '')}">${esc(current[prop])}</textarea></label>`;
    return `<label class="cth-field"><span>${label}</span><input data-prop="${prop}" value="${esc(current[prop])}" maxlength="80" autocomplete="off" placeholder="${esc(opts.placeholder || '')}"></label>`;
  }
  function options(entries, selected, empty) {
    return (empty ? `<option value="" ${selected ? '' : 'selected'}>${esc(empty)}</option>` : '') + entries.map(([value, label]) => `<option value="${esc(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${esc(label)}</option>`).join('');
  }
  const heading = (n, title, small = '') => `<h2><span>${ROMAN[n - 1]}.</span> ${title}${small ? ` <small>${small}</small>` : ''}</h2>`;
  const leftBadge = (left, done = 'Completo') => `<span class="cth-left ${left === 0 ? 'is-done' : left < 0 ? 'is-over' : ''}">${left === 0 ? done : left > 0 ? `Quedan ${left}` : `Sobran ${-left}`}</span>`;
  const skillName = (ch, k) => SKILLS[k][2] && ch.specs[k] ? `${SKILLS[k][0]} (${ch.specs[k]})` : SKILLS[k][0];

  function openEditor(ch) {
    current = ch;
    const saved = store.characters.some(item => item.id === ch.id);
    frame(`<div class="cth-editor-head"><button class="cth-button ghost" data-back>← TUS INVESTIGADORES</button><button class="cth-button danger" data-delete ${saved ? '' : 'hidden'}>DESTRUIR EXPEDIENTE</button></div>
      <section class="cth-panel">${heading(1, 'Investigador', 'datos del expediente')}<div class="cth-fields">
        ${field('Nombre', 'name', { placeholder: 'Nombre del investigador' })}${field('Jugador', 'player')}${field('Campaña', 'campaign')}
        ${field('Residencia', 'residence', { placeholder: 'Arkham, Boston…' })}${field('Lugar de nacimiento', 'birthplace')}
        <label class="cth-field"><span>Edad</span><input type="number" min="15" max="89" data-num="age" value="${ch.age}"></label>
      </div></section>
      <div data-sheet></div>
      <section class="cth-panel">${heading(7, 'Trasfondo', 'quién eras antes de saber')}<div class="cth-fields cth-fields-2">
        ${BACKGROUND.map(([k, label, ph]) => field(label, k, { area: true, placeholder: ph })).join('')}</div></section>
      <section class="cth-panel">${heading(8, 'Equipo y notas')}<div class="cth-fields cth-fields-2">
        ${field('Equipo y posesiones', 'gear', { area: true, rows: 5, placeholder: 'Revólver del .38, linterna, cuaderno, dinero en efectivo…' })}${field('Notas', 'notes', { area: true, rows: 5, placeholder: 'Pistas, contactos, historia…' })}</div></section>
      <div class="cth-modal" data-modal hidden><div class="cth-modal-card" role="alertdialog" aria-modal="true" aria-labelledby="cthDelTitle"><h3 id="cthDelTitle">¿Quemar este expediente?</h3><p>La ficha se borrará de este dispositivo y de tu cuenta, y no se podrá recuperar.</p><div class="cth-actions"><button class="cth-button ghost" data-cancel>CANCELAR</button><button class="cth-button danger" data-confirm>DESTRUIR FICHA</button></div></div></div>`, saved ? 'GUARDADO EN ESTE DISPOSITIVO' : 'EXPEDIENTE NUEVO · SIN GUARDAR');

    host.querySelector('[data-back]').addEventListener('click', renderList);
    host.querySelectorAll('.cth-main > .cth-panel [data-prop]').forEach(input => input.addEventListener('input', () => { current[input.dataset.prop] = input.value; scheduleSave(); }));
    host.querySelector('[data-num="age"]').addEventListener('change', event => { current.age = event.target.value; changed(); });
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

  function charsPanel(ch) {
    const check = charsCheck(ch);
    const band = ageBand(ch);
    const total = CHARS.reduce((t, [k]) => t + (ch.chars[k] || 0), 0);
    const methodTabs = Object.entries(METHODS).map(([k, [name]]) => `<button class="cth-tab ${ch.method === k ? 'is-on' : ''}" data-method="${k}" aria-pressed="${ch.method === k}">${name}</button>`).join('');
    const quickLeft = ch.method === 'rapida' ? (() => { const pool = [...QUICK]; CHARS.forEach(([k]) => { const i = pool.indexOf(ch.chars[k]); if (i >= 0) pool.splice(i, 1); }); return pool; })() : [];
    const cells = CHARS.map(([k, name, short]) => {
      const final = stat(ch, k);
      const changedByAge = ch.chars[k] && final !== ch.chars[k];
      const input = ch.method === 'rapida'
        ? `<select data-char="${k}" aria-label="${name}">${options(QUICK.filter((v, i, a) => a.indexOf(v) === i).map(v => [v, v]), ch.chars[k] || '', '—')}</select>`
        : `<input type="number" min="0" max="99" data-char="${k}" value="${ch.chars[k] || ''}" placeholder="—" aria-label="${name}">`;
      return `<div class="cth-char"><span class="cth-char-head"><b>${short}</b><small>${name}</small></span>${input}
        <span class="cth-char-final ${changedByAge ? 'is-aged' : ''}" title="${changedByAge ? 'Valor tras aplicar la edad' : ''}">${final ? `<button class="nd-roll-btn" data-cth-roll="ch:${k}" aria-label="Tirar ${name}"><b>${final}</b></button>` : '<b>—</b>'}<small>${final ? `${Math.floor(final / 2)} · ${Math.floor(final / 5)}` : 'mitad · quinto'}</small></span></div>`;
    }).join('');
    const lossRows = band.loss ? band.from.map(k => `<div class="cth-loss"><span>${CH[k].name}</span><span class="cth-stepper"><button data-loss="${k}" data-d="-1" aria-label="Devolver punto a ${CH[k].name}" ${(ch.ageLoss[k] || 0) <= 0 ? 'disabled' : ''}>−</button><b>−${ch.ageLoss[k] || 0}</b><button data-loss="${k}" data-d="1" aria-label="Restar punto a ${CH[k].name}">+</button></span></div>`).join('') : '';
    return `<section class="cth-panel">${heading(2, 'Características', METHODS[ch.method][0])}
      <div class="cth-tabs" role="group" aria-label="Método de generación">${methodTabs}</div>
      <p class="cth-note">${METHODS[ch.method][1]} ${ch.method === 'puntos' ? leftBadge(POINT_BUY - total, 'Todo repartido') : ''}${ch.method === 'rapida' && quickLeft.length ? `<span class="cth-left">Sin usar: ${quickLeft.join(', ')}</span>` : ''}${check.text ? ` <span class="cth-left is-over">${check.text}</span>` : ''}</p>
      ${ch.method === 'tiradas' ? '<div class="cth-actions cth-actions-tight"><button class="cth-button" data-roll-all>TIRAR CARACTERÍSTICAS</button></div>' : ''}
      <div class="cth-chars">${cells}</div>
      <div class="cth-cols">
        <div class="cth-col"><h3>Edad: ${ch.age} años</h3><p class="cth-note">${band.text}</p>
          ${band.loss ? `<div class="cth-losses">${lossRows}</div><p class="cth-note">${leftBadge(band.loss - lossSpent(ch), 'Pérdida aplicada')}</p>` : ''}
          ${band.checks ? `<div class="cth-edu"><label class="cth-field"><span>Mejora de EDU</span><input type="number" min="0" max="99" data-num="eduGain" value="${ch.eduGain}"></label><button class="cth-button ghost" data-edu>TIRAR ${band.checks > 1 ? `${band.checks} MEJORAS` : 'MEJORA'}</button></div>
            <p class="cth-note">${ch.eduLog ? esc(ch.eduLog) : 'Por cada tirada: 1D100; si supera tu EDU, ganas 1D10 (máximo 99).'}</p>` : ''}
        </div>
        <div class="cth-col"><h3>Suerte</h3><div class="cth-edu"><label class="cth-field"><span>Suerte (3D6×5)</span><input type="number" min="0" max="99" data-num="luck" value="${ch.luck || ''}" placeholder="—"></label><button class="cth-button ghost" data-luck>TIRAR SUERTE</button></div>
          <p class="cth-note">La Suerte se tira aparte con cualquier método. Se gasta durante la partida para salvar tiradas.</p></div>
      </div></section>`;
  }

  function occupationPanel(ch) {
    const o = occ(ch);
    const list = Object.entries(OCCUPATIONS).filter(([k]) => k !== 'personalizada').map(([k, v]) => [k, v.name]).sort((a, b) => a[1].localeCompare(b[1], 'es'));
    list.push(['personalizada', OCCUPATIONS.personalizada.name]);
    let body = '<p class="cth-note">La ocupación fija tus habilidades de ocupación, cuántos puntos tienes para ellas y el rango de Crédito.</p>';
    if (o) {
      const formula = o.alt.length ? `EDU×2 + ${o.alt.map(k => CH[k].short + '×2').join(' o ')} (NEXO usa la más alta)` : 'EDU×4';
      const fixed = o.skills.map(k => `<span class="cth-chip is-on is-fixed">${esc(SKILLS[k][0])}</span>`).join('');
      const socialChips = o.social ? SOCIAL.filter(k => !o.skills.includes(k)).map(k => `<button class="cth-chip ${ch.occSocial.includes(k) ? 'is-on' : ''}" data-social="${k}" aria-pressed="${ch.occSocial.includes(k)}">${esc(SKILLS[k][0])}</button>`).join('') : '';
      const anyChips = o.any ? ANY_PICK.filter(k => !o.skills.includes(k) && !ch.occSocial.includes(k)).map(k => `<button class="cth-chip ${ch.occAny.includes(k) ? 'is-on' : ''}" data-any="${k}" aria-pressed="${ch.occAny.includes(k)}">${esc(SKILLS[k][0])}</button>`).join('') : '';
      body = `<p class="cth-narr">${esc(o.text)} ${manualLink(`cth-ocu-${ch.occupation}`, 'Ocupación en el manual')}</p>
        <dl class="cth-info"><div><dt>Puntos de ocupación</dt><dd>${formula} = <b>${occPoints(ch)}</b></dd></div><div><dt>Crédito</dt><dd>${o.credit[0]}–${o.credit[1]}</dd></div></dl>
        ${fixed ? `<h3>Habilidades de la ocupación</h3><div class="cth-chips">${fixed}<span class="cth-chip is-on is-fixed">Crédito</span></div>` : ''}
        ${o.social ? `<h3>${o.social > 1 ? `${o.social} habilidades interpersonales` : 'Una habilidad interpersonal'} ${leftBadge(o.social - ch.occSocial.length)}</h3><div class="cth-chips">${socialChips}</div>` : ''}
        ${o.any ? `<h3>${o.any > 1 ? `${o.any} habilidades a elegir` : 'Una habilidad a elegir'} ${leftBadge(o.any - ch.occAny.length)}</h3><p class="cth-note">Elige según la especialidad de tu investigador.</p><div class="cth-chips cth-chips-small">${anyChips}</div>` : ''}`;
    }
    return `<section class="cth-panel">${heading(3, 'Ocupación', o ? esc(o.name) : '')}
      <label class="cth-field cth-field-wide"><span>Ocupación</span><select data-choice="occupation">${options(list, ch.occupation, 'Elige una ocupación…')}</select></label>${body}</section>`;
  }

  function skillsPanel(ch) {
    const allowed = occSkills(ch);
    const oLeft = occPoints(ch) - spent(ch, 'o');
    const pLeft = personalPoints(ch) - spent(ch, 'p');
    const rows = Object.keys(SKILLS).sort((a, b) => SKILLS[a][0].localeCompare(SKILLS[b][0], 'es')).map(k => {
      const isOcc = allowed.has(k);
      const total = skill(ch, k);
      const spec = SKILLS[k][2] ? `<input class="cth-spec" data-spec="${k}" value="${esc(ch.specs[k] || '')}" maxlength="30" placeholder="${esc(SKILLS[k][2])}" aria-label="Especialidad de ${esc(SKILLS[k][0])}">` : '';
      const pDisabled = NO_PERSONAL.includes(k) || k === 'credito';
      return `<li class="${isOcc ? 'is-occ' : ''} ${total > base(ch, k) ? 'is-raised' : ''}" data-row="${k}">
        <span class="cth-skill-name">${isOcc ? '<i class="cth-occ-mark" title="Habilidad de ocupación">◆</i>' : ''}${esc(SKILLS[k][0])}${spec}</span>
        <span class="cth-skill-base">${base(ch, k)}</span>
        <input type="number" min="0" max="99" data-alloc="${k}" data-kind="o" value="${alloc(ch, k, 'o') || ''}" placeholder="${isOcc ? '0' : ''}" ${isOcc ? '' : 'disabled'} aria-label="Puntos de ocupación en ${esc(SKILLS[k][0])}">
        <input type="number" min="0" max="99" data-alloc="${k}" data-kind="p" value="${alloc(ch, k, 'p') || ''}" placeholder="${pDisabled ? '' : '0'}" ${pDisabled ? 'disabled' : ''} aria-label="Puntos de interés personal en ${esc(SKILLS[k][0])}">
        <button class="nd-roll-btn cth-skill-roll" data-cth-roll="sk:${k}" aria-label="Tirar ${esc(SKILLS[k][0])}"><b class="cth-skill-total" data-total>${total}</b></button><small class="cth-skill-split" data-split>${Math.floor(total / 2)} · ${Math.floor(total / 5)}</small></li>`;
    }).join('');
    return `<section class="cth-panel">${heading(4, 'Habilidades', 'ocupación e interés personal')}
      <p class="cth-note">Reparte los puntos de ocupación (${occPoints(ch)}) entre las habilidades marcadas con ◆, Crédito incluido, y los de interés personal (INT×2 = ${personalPoints(ch)}) en cualquiera salvo Mitos de Cthulhu. Ninguna habilidad pasa de ${MAX_SKILL}.
        <span class="cth-pool">Ocupación <span data-left="o">${leftBadge(oLeft, 'Todo repartido')}</span></span> <span class="cth-pool">Interés <span data-left="p">${leftBadge(pLeft, 'Todo repartido')}</span></span></p>
      <div class="cth-skill-head" aria-hidden="true"><span>Habilidad</span><span>Base</span><span>Ocup.</span><span>Interés</span><span>Total</span><span>½ · ⅕</span></div>
      <ul class="cth-skills">${rows}</ul></section>`;
  }

  function sheetPanel(ch) {
    const [bd, corp] = build(ch);
    const credit = skill(ch, 'credito');
    const stats = [
      ['Puntos de vida', hp(ch) || '—'], ['Cordura', stat(ch, 'pod') || '—'], ['Cordura máxima', 99 - skill(ch, 'mitos')], ['Puntos de magia', mp(ch) || '—'],
      ['Suerte', ch.luck || '—'], ['Movimiento', move(ch)], ['Bonificación al daño', bd], ['Corpulencia', corp],
      ['Esquivar', skill(ch, 'esquivar')], ['Crédito', credit], ['Nivel de vida', living(credit)], ['Edad', ch.age]
    ];
    return `<section class="cth-panel cth-sheet">${heading(5, 'Hoja calculada', esc(describe(ch)))}
      <div class="cth-stats">${stats.map(([k, v]) => `<div><small>${k}</small><b>${esc(v)}</b></div>`).join('')}</div>
      <p class="cth-note">Puntos de vida: (CON + TAM) / 10. Cordura inicial: POD; la máxima es 99 menos Mitos de Cthulhu. Puntos de magia: POD / 5. Movimiento: 7 si FUE y DES son menores que TAM, 9 si ambas son mayores y 8 en otro caso, menos lo que reste la edad. Bonificación al daño y corpulencia salen de FUE + TAM.</p><p class="cth-note">${manualLink('cth-cordura', 'Cordura')} ${manualLink('cth-vida', 'Puntos de vida')} ${manualLink('cth-suerte', 'Suerte')} ${manualLink('cth-grados', 'Niveles de éxito')}</p></section>`;
  }

  function combatPanel(ch) {
    const [bd] = build(ch);
    const weapons = [['Desarmado', 'pelea', bd === 'Ninguna' ? '1D3' : `1D3 ${bd.startsWith('−') ? '−' : '+'} ${bd.replace(/^[−+]/, '')}`], ['Arma corta (.38)', 'armaCorta', '1D10'], ['Escopeta (cal. 12)', 'fusil', '4D6/2D6/1D6']];
    return `<section class="cth-panel">${heading(6, 'Combate', 'referencia rápida')}
      <div class="cth-weapons">${weapons.map(([n, k, dmg]) => `<div><b>${n}</b><span>${skill(ch, k)} · ${Math.floor(skill(ch, k) / 2)} · ${Math.floor(skill(ch, k) / 5)}</span><small>Daño ${esc(dmg)}</small></div>`).join('')}</div>
      <p class="cth-note">Anota tus armas reales en «Equipo y notas». Los valores son normal, difícil (mitad) y extremo (quinto).</p></section>`;
  }

  function renderTracker() {
    const node = host?.querySelector('[data-tracker]');
    if (!node || !current) return;
    const rows = summary(current);
    const pending = rows.filter(r => r.left !== 0).length;
    node.innerHTML = `<div class="cth-tracker-head"><b>${pending > 1 ? `Quedan ${pending} apartados` : pending ? 'Queda 1 apartado' : 'Investigador listo'}</b><span>7ª edición</span></div>
      <ul class="cth-pools">${rows.map(r => `<li class="${r.left === 0 ? 'is-done' : r.left < 0 ? 'is-over' : ''}"><span>${r.label}</span><b>${r.left === 0 ? '✓' : r.left}</b><small>/ ${r.budget}</small></li>`).join('')}</ul>`;
  }

  function renderSheet() {
    const ch = current;
    const sheet = host?.querySelector('[data-sheet]');
    if (!ch || !sheet) return;
    sanitize(ch);
    sheet.innerHTML = `<section class="cth-tracker" data-tracker></section>${charsPanel(ch)}${occupationPanel(ch)}${skillsPanel(ch)}${sheetPanel(ch)}${combatPanel(ch)}`;
    renderTracker();

    sheet.querySelectorAll('[data-method]').forEach(button => button.addEventListener('click', () => {
      if (current.method === button.dataset.method) return;
      current.method = button.dataset.method;
      if (current.method === 'rapida') CHARS.forEach(([k]) => { if (!QUICK.includes(current.chars[k])) current.chars[k] = 0; });
      changed();
    }));
    sheet.querySelectorAll('[data-char]').forEach(input => input.addEventListener('change', () => { current.chars[input.dataset.char] = Number(input.value) || 0; changed(); }));
    sheet.querySelectorAll('[data-num]').forEach(input => input.addEventListener('change', () => { current[input.dataset.num] = Number(input.value) || 0; changed(); }));
    sheet.querySelectorAll('[data-cth-roll]').forEach(button => button.addEventListener('click', () => rollFromSheet(button.dataset.cthRoll)));
    sheet.querySelector('[data-roll-all]')?.addEventListener('click', rollAll);
    sheet.querySelector('[data-luck]').addEventListener('click', luck);
    sheet.querySelector('[data-edu]')?.addEventListener('click', eduChecks);
    sheet.querySelectorAll('[data-loss]').forEach(button => button.addEventListener('click', () => stepLoss(button.dataset.loss, Number(button.dataset.d))));
    sheet.querySelectorAll('[data-choice]').forEach(select => select.addEventListener('change', () => { current[select.dataset.choice] = select.value; changed(); }));
    sheet.querySelectorAll('[data-social]').forEach(button => button.addEventListener('click', () => togglePick('occSocial', button.dataset.social, occ(current).social, 'interpersonales')));
    sheet.querySelectorAll('[data-any]').forEach(button => button.addEventListener('click', () => togglePick('occAny', button.dataset.any, occ(current).any, 'a elegir')));
    sheet.querySelectorAll('[data-spec]').forEach(input => input.addEventListener('input', () => { current.specs[input.dataset.spec] = input.value; scheduleSave(); }));
    // Los puntos de habilidad se actualizan sin redibujar la hoja para no perder el foco.
    sheet.querySelectorAll('[data-alloc]').forEach(input => {
      input.addEventListener('input', () => {
        const k = input.dataset.alloc;
        const kind = input.dataset.kind;
        const other = kind === 'o' ? 'p' : 'o';
        const room = MAX_SKILL - base(current, k) - alloc(current, k, other);
        let value = Math.max(0, Math.trunc(Number(input.value)) || 0);
        if (value > room) { value = room; input.value = room; flash(`${SKILLS[k][0]} no puede pasar de ${MAX_SKILL}.`); }
        current.alloc[k] = { ...(current.alloc[k] || {}), [kind]: value };
        scheduleSave();
        const row = input.closest('[data-row]');
        const total = skill(current, k);
        row.querySelector('[data-total]').textContent = total;
        row.querySelector('[data-split]').textContent = `${Math.floor(total / 2)} · ${Math.floor(total / 5)}`;
        row.classList.toggle('is-raised', total > base(current, k));
        sheet.querySelector('[data-left="o"]').innerHTML = leftBadge(occPoints(current) - spent(current, 'o'), 'Todo repartido');
        sheet.querySelector('[data-left="p"]').innerHTML = leftBadge(personalPoints(current) - spent(current, 'p'), 'Todo repartido');
        renderTracker();
      });
      input.addEventListener('change', () => changed());
    });
  }

  function ensureHost() {
    if (host) return;
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href = 'https://fonts.googleapis.com/css2?family=Special+Elite&family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&display=swap';
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './src/cthulhu/cthulhu.css?v=1';
    document.head.append(fonts, stylesheet);
    host = document.createElement('section');
    host.id = 'nexoCthulhu';
    host.className = 'cth';
    host.hidden = true;
    host.setAttribute('aria-label', 'NEXO La llamada de Cthulhu');
    document.body.append(host);
    ap?.mount(host);
    host.addEventListener('keydown', event => {
      if (event.key === 'Escape') host.querySelectorAll('.cth-modal').forEach(modal => { modal.hidden = true; });
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
    document.documentElement.classList.add('nexo-cthulhu-open');
  }
  function close() {
    flushSave();
    window.NEXO_DICE?.close();
    window.NEXO_NAV?.reset?.();
    current = null;
    host.hidden = true;
    document.documentElement.classList.remove('nexo-cthulhu-open');
    if (exitHandler) exitHandler();
  }
  window.addEventListener('pagehide', flushSave);

  // Resumen de las fichas para el perfil.
  const list = () => load().characters.map(ch => ({ id: ch.id, name: ch.name, summary: describe(ch) }));

  window.NEXO_CTHULHU = { open, close, list };
})();
