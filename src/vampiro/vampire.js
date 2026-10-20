(() => {
  const KEY = 'nexo-vampire-v1';
  const DEFAULT_FREEBIES = 15;
  const FLAW_CAP = 7;
  const COST = { attrs: 5, abil: 2, disc: 7, bg: 1, virt: 2, hum: 2, wp: 1 };
  const RANKS = ['Primarios', 'Secundarios', 'Terciarios'];
  const ATTR_POOLS = [7, 5, 3];
  const ABIL_POOLS = [13, 9, 5];
  const ABIL_BASE_MAX = 3;
  const slug = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const group = (id, label, names) => ({ id, label, traits: names.map(name => [slug(name), name]) });
  const named = names => names.map(name => [slug(name), name]);

  const ATTRS = [
    group('fisicos', 'Físicos', ['Fuerza', 'Destreza', 'Resistencia']),
    group('sociales', 'Sociales', ['Carisma', 'Manipulación', 'Apariencia']),
    group('mentales', 'Mentales', ['Percepción', 'Inteligencia', 'Astucia'])
  ];
  const DISCIPLINES = ['Animalismo', 'Auspex', 'Celeridad', 'Demencia', 'Dominación', 'Extinción', 'Fortaleza', 'Mortis', 'Nigromancia', 'Obtenebración', 'Ofuscación', 'Potencia', 'Presencia', 'Protean', 'Quimerismo', 'Serpentis', 'Taumaturgia', 'Valeren', 'Vicisitud'];
  const DISC_NAMES = Object.fromEntries(named(DISCIPLINES));
  const ROADS = {
    humanidad: { name: 'Humanidad', virtues: ['Conciencia', 'Autocontrol'] },
    reyes: { name: 'Senda de los Reyes', virtues: ['Convicción', 'Autocontrol'] },
    bestia: { name: 'Senda de la Bestia', virtues: ['Convicción', 'Instinto'] },
    cielo: { name: 'Senda del Cielo', virtues: ['Conciencia', 'Autocontrol'] },
    pecado: { name: 'Senda del Pecado', virtues: ['Convicción', 'Instinto'] }
  };
  const COMMON = {
    brujah: { name: 'Brujah', disc: ['Celeridad', 'Potencia', 'Presencia'], weak: 'La dificultad para resistir el frenesí aumenta en +2.' },
    gangrel: { name: 'Gangrel', disc: ['Animalismo', 'Fortaleza', 'Protean'], weak: 'Cada frenesí deja un rasgo animal permanente.' },
    lasombra: { name: 'Lasombra', disc: ['Dominación', 'Obtenebración', 'Potencia'], weak: 'No se reflejan en espejos ni superficies.' },
    malkavian: { name: 'Malkavian', disc: ['Auspex', 'Demencia', 'Ofuscación'], weak: 'Sufren al menos un trastorno mental permanente.' },
    nosferatu: { name: 'Nosferatu', disc: ['Animalismo', 'Ofuscación', 'Potencia'], weak: 'Su Apariencia es 0 y no puede aumentarse.' },
    ravnos: { name: 'Ravnos', disc: ['Animalismo', 'Fortaleza', 'Quimerismo'], weak: 'Cada uno arrastra un vicio o compulsión al que le cuesta resistirse.' },
    setita: { name: 'Seguidores de Set', disc: ['Ofuscación', 'Presencia', 'Serpentis'], weak: 'Sufren más daño por la luz solar y penalizaciones bajo luz intensa.' },
    toreador: { name: 'Toreador', disc: ['Auspex', 'Celeridad', 'Presencia'], weak: 'Pueden quedar absortos ante algo hermoso.' },
    tremere: { name: 'Tremere', disc: ['Auspex', 'Dominación', 'Taumaturgia'], weak: 'Llevan un paso del vínculo de sangre hacia los ancianos del clan.' },
    tzimisce: { name: 'Tzimisce', disc: ['Animalismo', 'Auspex', 'Vicisitud'], weak: 'Deben dormir junto a dos puñados de tierra de su patria.' },
    ventrue: { name: 'Ventrue', disc: ['Dominación', 'Fortaleza', 'Presencia'], weak: 'Solo pueden alimentarse de un tipo concreto de mortal.' },
    caitiff: { name: 'Caitiff', disc: [], weak: 'Sin clan: eligen libremente sus disciplinas, pero cargan con el desprecio de la sociedad vástaga.' }
  };
  const ERAS = {
    v20: {
      name: 'Noches modernas', short: 'V20',
      abilities: [
        group('talentos', 'Talentos', ['Alerta', 'Atletismo', 'Callejeo', 'Consciencia', 'Empatía', 'Expresión', 'Intimidación', 'Liderazgo', 'Pelea', 'Subterfugio']),
        group('tecnicas', 'Técnicas', ['Armas C.C.', 'Armas de fuego', 'Conducir', 'Etiqueta', 'Interpretación', 'Latrocinio', 'Pericias', 'Sigilo', 'Supervivencia', 'Trato con animales']),
        group('conocimientos', 'Conocimientos', ['Academicismo', 'Ciencias', 'Finanzas', 'Informática', 'Investigación', 'Leyes', 'Medicina', 'Ocultismo', 'Política', 'Tecnología'])
      ],
      backgrounds: named(['Aliados', 'Contactos', 'Criados', 'Dominio', 'Estatus', 'Fama', 'Generación', 'Identidad alternativa', 'Influencia', 'Mentor', 'Rebaño', 'Recursos']),
      clans: {
        assamita: { name: 'Assamita', disc: ['Celeridad', 'Extinción', 'Ofuscación'], weak: 'Riesgo de adicción al beber la sangre de otros vástagos; el clan exige su diezmo de sangre.' },
        brujah: COMMON.brujah, gangrel: COMMON.gangrel,
        giovanni: { name: 'Giovanni', disc: ['Dominación', 'Nigromancia', 'Potencia'], weak: 'Su Beso provoca un dolor atroz y el doble de daño a los mortales.' },
        lasombra: COMMON.lasombra, malkavian: COMMON.malkavian, nosferatu: COMMON.nosferatu, ravnos: COMMON.ravnos, setita: COMMON.setita,
        toreador: COMMON.toreador, tremere: COMMON.tremere, tzimisce: COMMON.tzimisce, ventrue: COMMON.ventrue, caitiff: COMMON.caitiff
      },
      roads: ['humanidad'], sects: ['Camarilla', 'Sabbat', 'Anarquistas', 'Independiente'], defaultGen: 13
    },
    da: {
      name: 'Edad Oscura', short: 'EDAD OSCURA',
      abilities: [
        group('talentos', 'Talentos', ['Alerta', 'Atletismo', 'Consciencia', 'Empatía', 'Expresión', 'Intimidación', 'Liderazgo', 'Pelea', 'Prestidigitación', 'Subterfugio']),
        group('tecnicas', 'Técnicas', ['Armas C.C.', 'Artesanía', 'Comercio', 'Etiqueta', 'Interpretación', 'Montar', 'Sigilo', 'Supervivencia', 'Tiro con arco', 'Trato con animales']),
        group('conocimientos', 'Conocimientos', ['Academicismo', 'Enigmas', 'Investigación', 'Leyes', 'Medicina', 'Ocultismo', 'Política', 'Sabiduría popular', 'Senescal', 'Teología'])
      ],
      backgrounds: named(['Aliados', 'Contactos', 'Criados', 'Dominio', 'Estatus', 'Generación', 'Influencia', 'Mentor', 'Rebaño', 'Recursos']),
      clans: {
        assamita: { name: 'Assamita', disc: ['Celeridad', 'Extinción', 'Ofuscación'], weak: 'La sangre de otros vástagos los tienta y los arrastra hacia la diablerie.' },
        brujah: COMMON.brujah,
        capadocio: { name: 'Capadocio', disc: ['Auspex', 'Fortaleza', 'Mortis'], weak: 'Su piel es pálida y fría como la de un cadáver, y no pueden ocultarlo ni con la sangre.' },
        gangrel: COMMON.gangrel, lasombra: COMMON.lasombra, malkavian: COMMON.malkavian, nosferatu: COMMON.nosferatu, ravnos: COMMON.ravnos,
        salubri: { name: 'Salubri', disc: ['Auspex', 'Fortaleza', 'Valeren'], weak: 'Pierden Fuerza de Voluntad al alimentarse de quien no lo consiente y llevan un tercer ojo en la frente.' },
        setita: COMMON.setita, toreador: COMMON.toreador, tremere: COMMON.tremere, tzimisce: COMMON.tzimisce, ventrue: COMMON.ventrue, caitiff: COMMON.caitiff
      },
      roads: ['humanidad', 'reyes', 'bestia', 'cielo', 'pecado'], sects: ['Alto Clan', 'Bajo Clan', 'Concilio de Sombras', 'Independiente'], defaultGen: 12
    }
  };
  const GENERATIONS = { 13: [10, 1], 12: [11, 1], 11: [12, 1], 10: [13, 1], 9: [14, 2], 8: [15, 3], 7: [20, 4], 6: [30, 6], 5: [40, 8], 4: [50, 10] };
  const TRAIT_MAX = { 7: 6, 6: 7, 5: 8, 4: 9 };
  const ARCHETYPES = ['Arquitecto', 'Autócrata', 'Bon vivant', 'Bravucón', 'Cuidador', 'Celebrante', 'Conformista', 'Competidor', 'Desviado', 'Director', 'Fanático', 'Galante', 'Gruñón', 'Juez', 'Mártir', 'Masoquista', 'Monstruo', 'Pedagogo', 'Penitente', 'Perfeccionista', 'Rebelde', 'Pícaro', 'Solitario', 'Superviviente', 'Tradicionalista', 'Visionario'];
  const PHASES = { base: 'b', freebie: 'f', xp: 'x' };

  let host = null;
  let store = load();
  let current = null;
  let dia = null;
  let exitHandler = null;
  let saveTimer = 0;

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
      return { characters: Array.isArray(parsed.characters) ? parsed.characters.map(normalize) : [] };
    } catch { return { characters: [] }; }
  }
  // Completa fichas creadas con versiones anteriores del creador.
  function normalize(ch) {
    ch.era = ERAS[ch.era] ? ch.era : 'v20';
    ch.baseGen = ch.baseGen === 12 ? 12 : ch.baseGen === 13 ? 13 : ERAS[ch.era].defaultGen;
    ch.freebies = Number.isFinite(ch.freebies) ? ch.freebies : DEFAULT_FREEBIES;
    ch.xpStart = Number.isFinite(ch.xpStart) ? ch.xpStart : 0;
    ch.xpLog = Array.isArray(ch.xpLog) ? ch.xpLog : [];
    ch.road = ROADS[ch.road] ? ch.road : 'humanidad';
    ch.attrs ||= {}; ch.abil ||= {}; ch.disc ||= {}; ch.bg ||= {}; ch.virt ||= {};
    ch.merits ||= [];
    ch.diablerie = Array.isArray(ch.diablerie) ? ch.diablerie : [];
    ch.humF ||= 0; ch.wpF ||= 0; ch.humX ||= 0; ch.wpX ||= 0;
    if (!Array.isArray(ch.extraDisc)) ch.extraDisc = ch.clan === 'caitiff' ? Object.keys(ch.disc) : [];
    if (!PHASES[ch.phase]) ch.phase = 'base';
    return ch;
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { return false; }
    window.NEXO_CLOUD?.save('vampiro', KEY, store).then(ok => {
      if (ok !== null) setStatus(ok ? 'GUARDADO EN LA NUBE' : 'SIN CONEXIÓN · GUARDADO EN ESTE DISPOSITIVO');
    });
    return true;
  }
  // Trae las fichas de la cuenta sin perder la que se esté editando.
  async function pullFromCloud() {
    const synced = await window.NEXO_CLOUD?.syncCharacters('vampiro', KEY, store).catch(error => { console.error('NEXO sync error', error); return null; });
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

  function newCharacter(era) {
    return normalize({
      id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), era,
      name: '', player: '', chronicle: '', concept: '', nature: '', demeanor: '', sire: '', sect: '', clan: 'brujah',
      attrPrio: { fisicos: 0, sociales: 1, mentales: 2 }, abilPrio: { talentos: 0, tecnicas: 1, conocimientos: 2 },
      phase: 'base', notes: ''
    });
  }

  const era = ch => ERAS[ch.era] || ERAS.v20;
  const clanOf = ch => era(ch).clans[ch.clan] || COMMON.caitiff;
  const road = ch => ROADS[ch.road] || ROADS.humanidad;
  const virtues = ch => [['conciencia', road(ch).virtues[0]], ['autocontrol', road(ch).virtues[1]], ['coraje', 'Coraje']];

  // Rasgos: b = reparto inicial, f = puntos gratuitos, x = experiencia.
  function trait(ch, kind, key) {
    const t = (ch[kind] ||= {})[key] ||= { b: 0, f: 0, x: 0 };
    t.x ||= 0;
    return t;
  }
  const isNosAppearance = (ch, kind, key) => kind === 'attrs' && key === 'apariencia' && ch.clan === 'nosferatu';
  function minOf(ch, kind, key) {
    if (isNosAppearance(ch, kind, key)) return 0;
    return kind === 'attrs' || kind === 'virt' ? 1 : 0;
  }
  function maxOf(ch, kind, key) {
    if (isNosAppearance(ch, kind, key)) return 0;
    return ['attrs', 'abil', 'disc'].includes(kind) ? TRAIT_MAX[generation(ch)] || 5 : 5;
  }
  // Puntos de disciplina obtenidos con la diablerie: no cuestan nada y cuentan como suelo del rasgo.
  function gift(ch, kind, key) { return kind === 'disc' ? ch.diablerie.filter(entry => entry.discGift === key).length : 0; }
  function floorOf(ch, kind, key) { return minOf(ch, kind, key) + gift(ch, kind, key); }
  function value(ch, kind, key) { const t = trait(ch, kind, key); return floorOf(ch, kind, key) + t.b + t.f + t.x; }
  function sum(ch, kind, keys, field) { return keys.reduce((total, key) => total + trait(ch, kind, key)[field], 0); }

  function clanDiscKeys(ch) { return clanOf(ch).disc.map(slug); }
  function inClan(ch, key) { return ch.clan === 'caitiff' || clanDiscKeys(ch).includes(key); }
  function shownDisciplines(ch) {
    const keys = [...clanDiscKeys(ch), ...ch.extraDisc.filter(key => !clanDiscKeys(ch).includes(key))];
    return keys.map(key => [key, DISC_NAMES[key] || key]);
  }
  function genDrop(ch) { return ch.diablerie.reduce((t, entry) => t + (Number(entry.genSteps) || 0), 0); }
  function humLoss(ch) { return ch.diablerie.reduce((t, entry) => t + (entry.humLoss ? 1 : 0), 0); }
  function generation(ch) { return Math.max(4, ch.baseGen - Math.min(5, value(ch, 'bg', 'generacion')) - genDrop(ch)); }
  // La Humanidad/Senda y la Voluntad salen de las virtudes de creación; la experiencia en virtudes no las sube.
  function virtueAtCreation(ch, key) { const t = trait(ch, 'virt', key); return 1 + t.b + t.f; }
  function humanityBase(ch) { return virtueAtCreation(ch, 'conciencia') + virtueAtCreation(ch, 'autocontrol'); }
  function willpowerBase(ch) { return virtueAtCreation(ch, 'coraje'); }
  function humanity(ch) { return Math.max(0, Math.min(10, humanityBase(ch) + ch.humF + ch.humX) - humLoss(ch)); }
  function willpower(ch) { return Math.min(10, willpowerBase(ch) + ch.wpF + ch.wpX); }

  function abilityGroups(ch) { return era(ch).abilities; }
  function pool(ch, kind, key) {
    if (kind === 'attrs' || kind === 'abil') {
      const groups = kind === 'attrs' ? ATTRS : abilityGroups(ch);
      const g = groups.find(item => item.traits.some(([k]) => k === key));
      const budget = (kind === 'attrs' ? ATTR_POOLS : ABIL_POOLS)[(kind === 'attrs' ? ch.attrPrio : ch.abilPrio)[g.id]];
      return { budget, spent: sum(ch, kind, g.traits.map(([k]) => k), 'b') };
    }
    if (kind === 'disc') return { budget: 3, spent: sum(ch, 'disc', Object.keys(ch.disc), 'b') };
    if (kind === 'bg') return { budget: 5, spent: sum(ch, 'bg', Object.keys(ch.bg), 'b') };
    return { budget: 7, spent: sum(ch, 'virt', ['conciencia', 'autocontrol', 'coraje'], 'b') };
  }
  function flawBonus(ch) {
    const flaws = ch.merits.filter(m => m.type === 'defecto').reduce((t, m) => t + (Number(m.points) || 0), 0);
    return Math.min(FLAW_CAP, flaws);
  }
  function freebieBudget(ch) { return ch.freebies + flawBonus(ch); }
  function freebieSpent(ch) {
    let total = 0;
    ['attrs', 'abil', 'disc', 'bg', 'virt'].forEach(kind => {
      Object.values(ch[kind]).forEach(t => { total += (t.f || 0) * COST[kind]; });
    });
    total += ch.humF * COST.hum + ch.wpF * COST.wp;
    total += ch.merits.filter(m => m.type === 'merito').reduce((t, m) => t + (Number(m.points) || 0), 0);
    return total;
  }

  // Experiencia según la tabla de V20: coste por subir desde el nivel actual.
  function stepCost(ch, kind, key, level) {
    if (kind === 'attrs') return level * 4;
    if (kind === 'abil') return level === 0 ? 3 : level * 2;
    if (kind === 'disc') return level === 0 ? 10 : level * (ch.clan === 'caitiff' ? 6 : inClan(ch, key) ? 5 : 7);
    if (kind === 'bg') return level === 0 ? 3 : level * 3;
    if (kind === 'virt' || kind === 'hum') return level * 2;
    return level;
  }
  function rangeCost(ch, kind, key, from, to) {
    let total = 0;
    for (let level = from; level < to; level += 1) total += stepCost(ch, kind, key, level);
    return total;
  }
  function xpBudget(ch) { return ch.xpStart + ch.xpLog.reduce((t, entry) => t + (Number(entry.amount) || 0), 0); }
  function xpSpent(ch) {
    let total = 0;
    ['attrs', 'abil', 'disc', 'bg', 'virt'].forEach(kind => {
      Object.entries(ch[kind]).forEach(([key, t]) => {
        if (!t.x) return;
        const start = floorOf(ch, kind, key) + t.b + t.f;
        total += rangeCost(ch, kind, key, start, start + t.x);
      });
    });
    const hum = humanityBase(ch) + ch.humF;
    const wp = willpowerBase(ch) + ch.wpF;
    return total + rangeCost(ch, 'hum', null, hum, hum + ch.humX) + rangeCost(ch, 'wp', null, wp, wp + ch.wpX);
  }

  function summary(ch) {
    const rows = [];
    ATTRS.forEach(g => {
      const p = pool(ch, 'attrs', g.traits[0][0]);
      rows.push({ label: 'Atributos ' + g.label.toLowerCase(), left: p.budget - p.spent, budget: p.budget });
    });
    abilityGroups(ch).forEach(g => {
      const p = pool(ch, 'abil', g.traits[0][0]);
      rows.push({ label: g.label, left: p.budget - p.spent, budget: p.budget });
    });
    const d = pool(ch, 'disc'); rows.push({ label: 'Disciplinas', left: d.budget - d.spent, budget: d.budget });
    const b = pool(ch, 'bg'); rows.push({ label: 'Trasfondos', left: b.budget - b.spent, budget: b.budget });
    const v = pool(ch, 'virt'); rows.push({ label: 'Virtudes', left: v.budget - v.spent, budget: v.budget });
    rows.push({ label: 'Puntos gratuitos', left: freebieBudget(ch) - freebieSpent(ch), budget: freebieBudget(ch), kind: 'free' });
    return rows;
  }
  function isComplete(ch) { return summary(ch).every(row => row.left === 0); }

  // Interacción con los puntos
  const phaseMessage = {
    poolEmpty: 'No quedan puntos en este grupo. Pasa a «Puntos gratuitos» para seguir subiendo.',
    abilCap: 'En el reparto inicial ninguna habilidad puede superar 3. Usa puntos gratuitos o experiencia para subirla más.',
    outOfClan: 'Las disciplinas de otros clanes no entran en el reparto inicial: cómpralas con puntos gratuitos o experiencia (con permiso del Narrador).'
  };
  function setDot(kind, key, n) {
    const ch = current;
    const t = trait(ch, kind, key);
    const min = floorOf(ch, kind, key);
    const max = maxOf(ch, kind, key);
    const cur = value(ch, kind, key);
    const target = Math.max(min, Math.min(max, n === cur ? n - 1 : n));
    const field = PHASES[ch.phase];
    const others = t.b + t.f + t.x - t[field];
    const next = Math.max(0, target - min - others);
    const delta = next - t[field];
    if (delta > 0) {
      if (field === 'b') {
        if (kind === 'disc' && !inClan(ch, key)) return flash(phaseMessage.outOfClan);
        const p = pool(ch, kind, key);
        if (p.spent + delta > p.budget) return flash(phaseMessage.poolEmpty);
        if (kind === 'abil' && minOf(ch, kind, key) + next > ABIL_BASE_MAX) return flash(phaseMessage.abilCap);
      } else if (field === 'f') {
        const cost = delta * COST[kind];
        if (freebieSpent(ch) + cost > freebieBudget(ch)) return flash(`Necesitas ${cost} puntos gratuitos y no te quedan suficientes.`);
      } else {
        const start = min + t.b + t.f;
        const cost = rangeCost(ch, kind, key, start + t.x, start + next);
        if (xpSpent(ch) + cost > xpBudget(ch)) return flash(`Necesitas ${cost} PX y solo te quedan ${xpBudget(ch) - xpSpent(ch)}.`);
      }
    }
    t[field] = next;
    changed();
  }
  function setDerived(kind, n) {
    const ch = current;
    const isHum = kind === 'hum';
    if (ch.phase === 'base') return flash(isHum ? `${road(ch).name} sale de ${road(ch).virtues.join(' + ')}. Súbela con puntos gratuitos o experiencia.` : 'La Fuerza de Voluntad sale del Coraje. Súbela con puntos gratuitos o experiencia.');
    const base = isHum ? humanityBase(ch) : willpowerBase(ch);
    const fField = isHum ? 'humF' : 'wpF';
    const xField = isHum ? 'humX' : 'wpX';
    const field = ch.phase === 'freebie' ? fField : xField;
    const cur = base + ch[fField] + ch[xField];
    const target = Math.min(10, n === cur ? n - 1 : n);
    const others = base + ch[fField] + ch[xField] - ch[field];
    const next = Math.max(0, target - others);
    if (next > ch[field]) {
      if (field === fField) {
        const cost = (next - ch[field]) * COST[kind];
        if (freebieSpent(ch) + cost > freebieBudget(ch)) return flash(`Necesitas ${cost} puntos gratuitos y no te quedan suficientes.`);
      } else {
        const start = base + ch[fField];
        const cost = rangeCost(ch, kind, null, start + ch[xField], start + next);
        if (xpSpent(ch) + cost > xpBudget(ch)) return flash(`Necesitas ${cost} PX y solo te quedan ${xpBudget(ch) - xpSpent(ch)}.`);
      }
    }
    ch[field] = next;
    changed();
  }
  function setClan(clan) {
    const ch = current;
    ch.clan = clan;
    const allowed = new Set([...clanDiscKeys(ch), ...ch.extraDisc]);
    Object.keys(ch.disc).forEach(key => {
      if (!allowed.has(key)) { delete ch.disc[key]; return; }
      // Al cambiar de clan, los puntos iniciales en disciplinas que ya no son de clan se devuelven.
      if (!inClan(ch, key)) ch.disc[key].b = 0;
    });
    if (clan === 'nosferatu') ch.attrs.apariencia = { b: 0, f: 0, x: 0 };
    changed();
  }
  function setEra(next) {
    const ch = current;
    ch.era = next;
    if (!era(ch).clans[ch.clan]) ch.clan = 'brujah';
    if (!era(ch).roads.includes(ch.road)) ch.road = 'humanidad';
    ch.baseGen = era(ch).defaultGen;
    // Las habilidades y trasfondos que no existen en la nueva ambientación se descartan para no cobrar puntos fantasma.
    const abilKeys = new Set(era(ch).abilities.flatMap(g => g.traits.map(([k]) => k)));
    const bgKeys = new Set(era(ch).backgrounds.map(([k]) => k));
    Object.keys(ch.abil).forEach(key => { if (!abilKeys.has(key)) delete ch.abil[key]; });
    Object.keys(ch.bg).forEach(key => { if (!bgKeys.has(key)) delete ch.bg[key]; });
    const discKeys = new Set([...clanDiscKeys(ch), ...ch.extraDisc]);
    Object.keys(ch.disc).forEach(key => { if (!discKeys.has(key)) delete ch.disc[key]; else if (!inClan(ch, key)) ch.disc[key].b = 0; });
    renderEditor();
    scheduleSave();
  }
  function addDiscipline(key) {
    const ch = current;
    if (!key || shownDisciplines(ch).some(([k]) => k === key)) return;
    ch.extraDisc.push(key);
    changed();
  }
  function removeDiscipline(key) {
    const ch = current;
    ch.extraDisc = ch.extraDisc.filter(k => k !== key);
    delete ch.disc[key];
    changed();
  }
  function setPriority(kind, groupId, rank) {
    const prio = kind === 'attrs' ? current.attrPrio : current.abilPrio;
    const other = Object.keys(prio).find(key => prio[key] === rank);
    if (other && other !== groupId) prio[other] = prio[groupId];
    prio[groupId] = rank;
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
    const del = host?.querySelector('[data-delete]');
    if (del) del.hidden = false;
    setStatus('GUARDANDO…');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => setStatus(persist() ? 'GUARDADO EN ESTE DISPOSITIVO' : 'NO SE PUDO GUARDAR'), 300);
  }
  function setStatus(text) { host?.querySelectorAll('[data-save-status]').forEach(node => { node.textContent = text; }); }
  let flashTimer = 0;
  function flash(text) {
    const node = host.querySelector('[data-flash]');
    if (!node) return;
    node.textContent = text;
    node.hidden = false;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => { node.hidden = true; }, 4200);
  }

  // Vistas
  function frame(body, status = 'MUNDO DE TINIEBLAS') {
    host.innerHTML = `<header class="vtm-top"><button class="vtm-brand" data-exit aria-label="Volver al selector de sistemas"><span class="vtm-sigil">N</span><span><b>NEXO</b><small>VAMPIRO · LA MASCARADA</small></span></button><span class="vtm-status" data-save-status>${esc(status)}</span></header><main class="vtm-main">${body}</main><div class="vtm-flash" data-flash hidden role="status"></div>`;
    host.querySelectorAll('[data-exit]').forEach(button => button.addEventListener('click', close));
  }

  function renderList() {
    flushSave();
    current = null;
    const rows = store.characters;
    const cards = rows.length ? rows.map(ch => {
      const done = isComplete(ch);
      return `<button class="vtm-card" data-open="${esc(ch.id)}"><span class="vtm-card-sigil">${esc((ch.name || '?').trim().charAt(0).toUpperCase() || '?')}</span><span class="vtm-card-copy"><b>${esc(ch.name || 'Vástago sin nombre')}</b><small>${esc(clanOf(ch).name)} · ${generation(ch)}ª generación${ch.concept ? ' · ' + esc(ch.concept) : ''}</small><em class="vtm-era">${esc(era(ch).name)}</em></span><span class="vtm-badge ${done ? 'is-done' : ''}">${done ? 'COMPLETO' : 'EN CREACIÓN'}</span></button>`;
    }).join('') : '<div class="vtm-empty"><span>☩</span><b>La noche aún está vacía</b><small>Abraza un nuevo vástago de las noches modernas o de la Edad Oscura.</small></div>';
    frame(`<p class="vtm-kicker">NEXO / VAMPIRO: LA MASCARADA · 20º ANIVERSARIO</p><h1>Tus <em>vástagos</em></h1><p class="vtm-intro">Crea personajes con las reglas de V20 o de Edad Oscura V20: prioridades de atributos y habilidades, disciplinas, trasfondos, virtudes, puntos gratuitos y experiencia. Se guardan en este dispositivo.</p><div class="vtm-actions"><button class="vtm-button" data-new="v20">✚ NOCHES MODERNAS</button><button class="vtm-button" data-new="da">✚ EDAD OSCURA</button><button class="vtm-button ghost" data-exit>← VOLVER A SISTEMAS</button></div><div class="vtm-list">${cards}</div>`);
    host.querySelectorAll('[data-new]').forEach(button => button.addEventListener('click', () => openEditor(newCharacter(button.dataset.new))));
    host.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => {
      const ch = store.characters.find(item => item.id === button.dataset.open);
      if (ch) openEditor(ch);
    }));
    host.scrollTop = 0;
  }

  function field(label, prop, opts = {}) {
    const list = opts.list ? ` list="${opts.list}"` : '';
    return `<label class="vtm-field"><span>${label}</span><input data-prop="${prop}" value="${esc(current[prop])}" maxlength="80" autocomplete="off"${list} placeholder="${esc(opts.placeholder || '')}"></label>`;
  }
  function numberField(label, prop, max) {
    return `<label class="vtm-field"><span>${label}</span><input type="number" inputmode="numeric" min="0" max="${max}" step="1" data-num="${prop}" value="${esc(current[prop])}"></label>`;
  }

  function openEditor(ch) {
    current = ch;
    dia = null;
    renderEditor();
    host.scrollTop = 0;
  }
  function renderEditor() {
    const ch = current;
    const saved = store.characters.some(item => item.id === ch.id);
    const e = era(ch);
    const options = (entries, selected) => entries.map(([key, label]) => `<option value="${key}" ${key === selected ? 'selected' : ''}>${esc(label)}</option>`).join('');
    const clanOptions = options(Object.entries(e.clans).map(([key, clan]) => [key, clan.name]), ch.clan);
    const roadOptions = options(e.roads.map(key => [key, ROADS[key].name]), ch.road);
    frame(`<div class="vtm-editor-head"><button class="vtm-button ghost" data-back>← TUS VÁSTAGOS</button><span class="vtm-era-tag">${esc(e.name)}</span><button class="vtm-button danger" data-delete ${saved ? '' : 'hidden'}>ELIMINAR</button></div>
      <section class="vtm-panel"><h2><span>I</span> Concepto</h2><div class="vtm-fields">
        ${field('Nombre', 'name', { placeholder: 'Nombre del vástago' })}${field('Jugador', 'player')}${field('Crónica', 'chronicle')}
        ${field('Concepto', 'concept', { placeholder: ch.era === 'da' ? 'Ej.: Caballero desheredado' : 'Ej.: Detective caído en desgracia' })}${field('Naturaleza', 'nature', { list: 'vtmArchetypes' })}${field('Conducta', 'demeanor', { list: 'vtmArchetypes' })}
        <label class="vtm-field"><span>Clan</span><select data-clan>${clanOptions}</select></label>${field('Sire', 'sire')}${field(ch.era === 'da' ? 'Facción' : 'Secta', 'sect', { list: 'vtmSects' })}
        ${e.roads.length > 1 ? `<label class="vtm-field"><span>Senda</span><select data-road>${roadOptions}</select></label>` : ''}
      </div><datalist id="vtmArchetypes">${ARCHETYPES.map(a => `<option value="${esc(a)}">`).join('')}</datalist><datalist id="vtmSects">${e.sects.map(s => `<option value="${esc(s)}">`).join('')}</datalist><p class="vtm-weak" data-weakness></p></section>
      <section class="vtm-panel"><h2><span>II</span> Reglas de creación</h2><div class="vtm-fields">
        <label class="vtm-field"><span>Ambientación</span><select data-era>${options(Object.entries(ERAS).map(([key, item]) => [key, item.name]), ch.era)}</select></label>
        <label class="vtm-field"><span>Generación base</span><select data-basegen>${options([['13', '13ª generación'], ['12', '12ª generación']], String(ch.baseGen))}</select></label>
        ${numberField('Puntos gratuitos', 'freebies', 99)}${numberField('PX iniciales', 'xpStart', 9999)}
      </div><p class="vtm-note">V20 parte de la 13ª generación y Edad Oscura de la 12ª; el trasfondo Generación baja desde ahí. Por defecto hay ${DEFAULT_FREEBIES} puntos gratuitos y 0 PX, pero tu Narrador puede dar otros valores.</p></section>
      <div data-sheet></div>
      <section class="vtm-panel"><h2><span>X</span> Notas</h2><textarea class="vtm-notes" data-prop="notes" rows="5" placeholder="Historia, aspecto, refugio…">${esc(ch.notes)}</textarea></section>
      <div class="vtm-modal" data-modal hidden><div class="vtm-modal-card" role="alertdialog" aria-modal="true" aria-labelledby="vtmDelTitle"><h3 id="vtmDelTitle">¿Destruir a este vástago?</h3><p>La ficha se borrará de este dispositivo y no se podrá recuperar.</p><div class="vtm-actions"><button class="vtm-button ghost" data-cancel>CANCELAR</button><button class="vtm-button danger" data-confirm>ELIMINAR FICHA</button></div></div></div>`, saved ? 'GUARDADO EN ESTE DISPOSITIVO' : 'FICHA NUEVA · SIN GUARDAR');

    host.querySelector('[data-back]').addEventListener('click', renderList);
    host.querySelectorAll('[data-prop]').forEach(input => input.addEventListener('input', () => {
      current[input.dataset.prop] = input.value;
      scheduleSave();
    }));
    host.querySelectorAll('[data-num]').forEach(input => input.addEventListener('change', () => {
      const n = Math.max(0, Math.min(Number(input.max), Math.trunc(Number(input.value)) || 0));
      input.value = n;
      current[input.dataset.num] = n;
      changed();
    }));
    host.querySelector('[data-clan]').addEventListener('change', event => setClan(event.target.value));
    host.querySelector('[data-road]')?.addEventListener('change', event => { current.road = event.target.value; changed(); });
    host.querySelector('[data-era]').addEventListener('change', event => setEra(event.target.value));
    host.querySelector('[data-basegen]').addEventListener('change', event => { current.baseGen = Number(event.target.value); changed(); });
    const modal = host.querySelector('[data-modal]');
    host.querySelector('[data-delete]').addEventListener('click', () => { modal.hidden = false; host.querySelector('[data-cancel]').focus(); });
    host.querySelector('[data-cancel]').addEventListener('click', () => { modal.hidden = true; });
    host.querySelector('[data-confirm]').addEventListener('click', () => {
      clearTimeout(saveTimer);
      store.characters = store.characters.filter(item => item.id !== current.id);
      persist();
      current = null;
      renderList();
    });
    renderSheet();
  }

  function dots(kind, key, label, extra = '') {
    const ch = current;
    const t = trait(ch, kind, key);
    const min = minOf(ch, kind, key);
    const g = gift(ch, kind, key);
    const max = maxOf(ch, kind, key);
    let html = '';
    for (let i = 1; i <= Math.max(5, max); i += 1) {
      const cls = i <= min ? 'inn' : i <= min + g ? 'dia' : i <= min + g + t.b ? 'base' : i <= min + g + t.b + t.f ? 'free' : i <= min + g + t.b + t.f + t.x ? 'xp' : '';
      html += `<button class="vtm-dot ${cls}" data-dot="${kind}" data-key="${key}" data-n="${i}" ${i > max ? 'disabled' : ''} aria-label="${esc(label)} ${i}"></button>`;
    }
    return `<div class="vtm-trait"><span>${esc(label)}${extra}</span><span class="vtm-dots">${html}</span></div>`;
  }
  function track(kind, label, base, free, xp, lost = 0) {
    const total = Math.min(10, base + free + xp);
    let html = '';
    for (let i = 1; i <= 10; i += 1) {
      const cls = i > total - lost && i <= total ? 'lost' : i <= base ? 'base' : i <= base + free ? 'free' : i <= base + free + xp ? 'xp' : '';
      html += `<button class="vtm-dot ${cls}" data-track="${kind}" data-n="${i}" aria-label="${esc(label)} ${i}"></button>`;
    }
    return `<div class="vtm-track"><span>${esc(label)} <b>${Math.max(0, total - lost)}</b>${lost ? ` <small class="vtm-out">−${lost} por ${current?.era === 'da' ? 'Amaranto' : 'diablerie'}</small>` : ''}</span><span class="vtm-dots">${html}</span></div>`;
  }
  function left(kind, key) {
    const p = pool(current, kind, key);
    const n = p.budget - p.spent;
    return `<span class="vtm-left ${n === 0 ? 'is-done' : n < 0 ? 'is-over' : ''}">${n < 0 ? 'Te pasas en ' + (-n) : n === 0 ? 'Completo' : 'Quedan ' + n}</span>`;
  }
  function prioSelect(kind, g) {
    const prio = kind === 'attrs' ? current.attrPrio : current.abilPrio;
    const pools = kind === 'attrs' ? ATTR_POOLS : ABIL_POOLS;
    return `<select class="vtm-prio" data-prio="${kind}" data-group="${g.id}" aria-label="Prioridad de ${esc(g.label)}">${RANKS.map((rank, i) => `<option value="${i}" ${prio[g.id] === i ? 'selected' : ''}>${rank} · ${pools[i]}</option>`).join('')}</select>`;
  }
  const PHASE_HELP = {
    base: 'Reparte los puntos de cada grupo. Las habilidades no pasan de 3 y las disciplinas iniciales deben ser de tu clan.',
    freebie: 'Cada punto cuesta: atributo 5 · habilidad 2 · disciplina 7 · trasfondo 1 · virtud 2 · Humanidad o Senda 2 · Voluntad 1.',
    xp: 'Coste en PX: atributo ×4 · habilidad ×2 (nueva 3) · disciplina de clan ×5, de otro clan ×7, Caitiff ×6 (nueva 10) · virtud ×2 · Humanidad o Senda ×2 · Voluntad ×1 · trasfondo ×3 (nuevo 3, si lo permite el Narrador). «×» es el nivel actual.'
  };

  function renderSheet() {
    const ch = current;
    const sheet = host?.querySelector('[data-sheet]');
    if (!ch || !sheet) return;
    const clan = clanOf(ch);
    host.querySelector('[data-weakness]').innerHTML = `<b>Debilidad del clan ${esc(clan.name)}:</b> ${esc(clan.weak)}`;
    const gen = generation(ch);
    const [blood, perTurn] = GENERATIONS[gen] || GENERATIONS[13];
    const rows = summary(ch);
    const free = rows[rows.length - 1];
    const xpLeft = xpBudget(ch) - xpSpent(ch);
    const meritRows = ch.merits.map((m, i) => `<div class="vtm-merit"><select data-merit-type="${i}" aria-label="Tipo"><option value="merito" ${m.type === 'merito' ? 'selected' : ''}>Mérito</option><option value="defecto" ${m.type === 'defecto' ? 'selected' : ''}>Defecto</option></select><input data-merit-name="${i}" value="${esc(m.name)}" maxlength="60" placeholder="Nombre" aria-label="Nombre"><input data-merit-points="${i}" type="number" min="1" max="7" value="${esc(m.points)}" aria-label="Puntos"><button class="vtm-x" data-merit-del="${i}" aria-label="Quitar">×</button></div>`).join('');
    const flaws = ch.merits.filter(m => m.type === 'defecto').reduce((t, m) => t + (Number(m.points) || 0), 0);
    const shown = shownDisciplines(ch);
    const addable = DISCIPLINES.map(name => [slug(name), name]).filter(([key]) => !shown.some(([k]) => k === key));
    const discRows = shown.map(([key, label]) => {
      const out = !inClan(ch, key);
      const extraMark = ch.extraDisc.includes(key) ? `${out ? ' <small class="vtm-out">otro clan</small>' : ''}<button class="vtm-x vtm-x-sm" data-disc-del="${key}" aria-label="Quitar ${esc(label)}">×</button>` : '';
      return dots('disc', key, label, extraMark);
    }).join('');
    const virt = virtues(ch);
    const logRows = ch.xpLog.map((entry, i) => `<li><b>+${esc(entry.amount)} PX</b><span>${esc(entry.note || 'Sin motivo')}</span><small>${esc(new Date(entry.at).toLocaleDateString('es-ES'))}</small><button class="vtm-x vtm-x-sm" data-xp-del="${i}" aria-label="Quitar entrada">×</button></li>`).join('');

    sheet.innerHTML = `
      <section class="vtm-tracker">
        <div class="vtm-phase" role="tablist" aria-label="Fase de creación"><button role="tab" aria-selected="${ch.phase === 'base'}" data-phase="base">1 · Reparto inicial</button><button role="tab" aria-selected="${ch.phase === 'freebie'}" data-phase="freebie">2 · Gratuitos <b>${free.left}</b></button><button role="tab" aria-selected="${ch.phase === 'xp'}" data-phase="xp">3 · Experiencia <b>${xpLeft}</b></button></div>
        <p class="vtm-phase-help">${PHASE_HELP[ch.phase]}</p>
        <ul class="vtm-pools">${rows.map(r => `<li class="${r.left === 0 ? 'is-done' : r.left < 0 ? 'is-over' : ''}${r.kind ? ' is-free' : ''}"><span>${r.label}</span><b>${r.left < 0 ? '+' + (-r.left) : r.left}</b><small>/ ${r.budget}</small></li>`).join('')}<li class="is-xp ${xpLeft < 0 ? 'is-over' : ''}"><span>PX disponibles</span><b>${xpLeft}</b><small>/ ${xpBudget(ch)}</small></li></ul>
        <p class="vtm-legend"><i class="vtm-dot inn"></i> Base <i class="vtm-dot base"></i> Reparto inicial <i class="vtm-dot free"></i> Puntos gratuitos <i class="vtm-dot xp"></i> Experiencia</p>
      </section>
      <section class="vtm-panel"><h2><span>III</span> Atributos <small>7 / 5 / 3</small></h2><div class="vtm-cols">${ATTRS.map(g => `<div class="vtm-col"><div class="vtm-col-head"><h3>${g.label}</h3>${prioSelect('attrs', g)}${left('attrs', g.traits[0][0])}</div>${g.traits.map(([k, l]) => dots('attrs', k, l)).join('')}</div>`).join('')}</div></section>
      <section class="vtm-panel"><h2><span>IV</span> Habilidades <small>13 / 9 / 5</small></h2><div class="vtm-cols">${abilityGroups(ch).map(g => `<div class="vtm-col"><div class="vtm-col-head"><h3>${g.label}</h3>${prioSelect('abil', g)}${left('abil', g.traits[0][0])}</div>${g.traits.map(([k, l]) => dots('abil', k, l)).join('')}</div>`).join('')}</div></section>
      <section class="vtm-panel"><h2><span>V</span> Ventajas</h2><div class="vtm-cols">
        <div class="vtm-col"><div class="vtm-col-head"><h3>Disciplinas</h3><span class="vtm-note">3 puntos${ch.clan === 'caitiff' ? ' · libres' : ' · de clan'}</span>${left('disc')}</div>${discRows || '<p class="vtm-note">Añade las disciplinas de tu vástago.</p>'}
          <div class="vtm-add"><select data-disc-add aria-label="Disciplina para añadir"><option value="">${ch.clan === 'caitiff' ? 'Añadir disciplina…' : 'Añadir de otro clan…'}</option>${addable.map(([k, l]) => `<option value="${k}">${esc(l)}</option>`).join('')}</select></div></div>
        <div class="vtm-col"><div class="vtm-col-head"><h3>Trasfondos</h3><span class="vtm-note">5 puntos</span>${left('bg')}</div>${era(ch).backgrounds.map(([k, l]) => dots('bg', k, l)).join('')}</div>
        <div class="vtm-col"><div class="vtm-col-head"><h3>Virtudes</h3><span class="vtm-note">7 puntos</span>${left('virt')}</div>${virt.map(([k, l]) => dots('virt', k, l)).join('')}
          <div class="vtm-derived">${track('hum', road(ch).name, humanityBase(ch), ch.humF, ch.humX, humLoss(ch))}${track('wp', 'Fuerza de Voluntad', willpowerBase(ch), ch.wpF, ch.wpX)}</div></div>
      </div></section>
      <section class="vtm-panel"><h2><span>VI</span> Méritos y defectos</h2><p class="vtm-note">Los méritos se pagan con puntos gratuitos. Los defectos dan puntos extra, hasta un máximo de ${FLAW_CAP} (llevas ${Math.min(flaws, FLAW_CAP)}${flaws > FLAW_CAP ? ', el resto no cuenta' : ''}).</p><div class="vtm-merits">${meritRows}</div><button class="vtm-button ghost" data-merit-add>✚ AÑADIR MÉRITO O DEFECTO</button></section>
      <section class="vtm-panel"><h2><span>VII</span> Experiencia</h2><div class="vtm-stats vtm-stats-xp">
        <div><small>PX ganados</small><b>${xpBudget(ch)}</b></div><div><small>PX gastados</small><b>${xpSpent(ch)}</b></div><div><small>PX disponibles</small><b>${xpLeft}</b></div>
      </div><form class="vtm-xp-form" data-xp-form><label class="vtm-field"><span>PX a añadir</span><input type="number" inputmode="numeric" min="1" max="999" step="1" name="amount" required placeholder="Ej.: 5"></label><label class="vtm-field"><span>Motivo</span><input name="note" maxlength="80" placeholder="Ej.: Fin de la sesión 3"></label><button class="vtm-button" type="submit">✚ AÑADIR PX</button></form>
      ${logRows ? `<ul class="vtm-xp-log">${logRows}</ul>` : '<p class="vtm-note">Aún no has añadido experiencia después de la creación. Gasta los PX en la pestaña «3 · Experiencia».</p>'}</section>
      <section class="vtm-panel"><h2><span>VIII</span> La sangre</h2><div class="vtm-stats">
        <div><small>Generación</small><b>${gen}ª</b></div><div><small>Reserva de sangre máx.</small><b>${blood}</b></div><div><small>Sangre por turno</small><b>${perTurn}</b></div><div><small>${esc(road(ch).name)}</small><b>${humanity(ch)}</b></div><div><small>Fuerza de Voluntad</small><b>${willpower(ch)}</b></div>
      </div><div class="vtm-blood" aria-label="Reserva de sangre máxima: ${blood}">${'<i></i>'.repeat(blood)}</div><p class="vtm-note">La reserva inicial se determina tirando un dado de diez caras. Sube el trasfondo Generación para bajar de la ${ch.baseGen}ª${TRAIT_MAX[gen] ? `; en la ${gen}ª generación los rasgos pueden llegar a ${TRAIT_MAX[gen]}` : ''}.</p></section>
      ${diablerieSection(ch)}`;

    sheet.querySelectorAll('[data-dot]').forEach(button => button.addEventListener('click', () => setDot(button.dataset.dot, button.dataset.key, Number(button.dataset.n))));
    sheet.querySelectorAll('[data-track]').forEach(button => button.addEventListener('click', () => setDerived(button.dataset.track, Number(button.dataset.n))));
    sheet.querySelectorAll('[data-phase]').forEach(button => button.addEventListener('click', () => {
      ch.phase = button.dataset.phase;
      if (store.characters.some(item => item.id === ch.id)) scheduleSave();
      renderSheet();
    }));
    sheet.querySelectorAll('[data-prio]').forEach(select => select.addEventListener('change', () => setPriority(select.dataset.prio, select.dataset.group, Number(select.value))));
    sheet.querySelector('[data-disc-add]').addEventListener('change', event => addDiscipline(event.target.value));
    sheet.querySelectorAll('[data-disc-del]').forEach(button => button.addEventListener('click', () => removeDiscipline(button.dataset.discDel)));
    sheet.querySelector('[data-merit-add]').addEventListener('click', () => { ch.merits.push({ type: 'merito', name: '', points: 1 }); changed(); });
    sheet.querySelectorAll('[data-merit-del]').forEach(button => button.addEventListener('click', () => { ch.merits.splice(Number(button.dataset.meritDel), 1); changed(); }));
    sheet.querySelectorAll('[data-merit-type]').forEach(select => select.addEventListener('change', () => { ch.merits[Number(select.dataset.meritType)].type = select.value; changed(); }));
    sheet.querySelectorAll('[data-merit-name]').forEach(input => input.addEventListener('input', () => { ch.merits[Number(input.dataset.meritName)].name = input.value; scheduleSave(); }));
    sheet.querySelectorAll('[data-merit-points]').forEach(input => input.addEventListener('change', () => {
      const m = ch.merits[Number(input.dataset.meritPoints)];
      const next = Math.max(1, Math.min(7, Math.trunc(Number(input.value)) || 1));
      const prev = m.points;
      m.points = next;
      if (m.type === 'merito' && freebieSpent(ch) > freebieBudget(ch)) { m.points = prev; flash('No te quedan puntos gratuitos para ese mérito.'); }
      changed();
    }));
    sheet.querySelector('[data-xp-form]').addEventListener('submit', event => {
      event.preventDefault();
      const form = event.target;
      const amount = Math.trunc(Number(form.amount.value));
      if (!(amount > 0)) return flash('Indica cuántos PX quieres añadir.');
      ch.xpLog.push({ amount: Math.min(999, amount), note: form.note.value.trim(), at: new Date().toISOString() });
      changed();
      flash(`Añadidos ${Math.min(999, amount)} PX. Gástalos en la pestaña «3 · Experiencia».`);
    });
    sheet.querySelectorAll('[data-xp-del]').forEach(button => button.addEventListener('click', () => {
      const entry = ch.xpLog[Number(button.dataset.xpDel)];
      ch.xpLog.splice(Number(button.dataset.xpDel), 1);
      if (xpSpent(ch) > xpBudget(ch)) { ch.xpLog.splice(Number(button.dataset.xpDel), 0, entry); return flash('No puedes quitar esos PX porque ya están gastados. Reduce antes algún rasgo comprado con experiencia.'); }
      changed();
    }));
    bindDiablerie(sheet, ch);
  }

  // Diablerie (Amaranto en Edad Oscura)
  function crimeName(ch) { return ch.era === 'da' ? 'Amaranto' : 'Diablerie'; }
  function diaDraft(ch) {
    if (!dia) {
      dia = { victim: '', victimGen: Math.max(4, generation(ch) - 1), victimWP: 5, difficulty: 9, steps: 1, humLoss: false, discGift: '', notes: '', successes: 0, turns: 0, rolls: [], failed: false };
    }
    return dia;
  }
  function suggestedSteps(ch, d) { return d.victimGen < generation(ch) ? 1 : 0; }
  function rollStrength(ch) {
    const d = diaDraft(ch);
    if (d.failed || d.successes >= d.victimWP) return;
    const dicePool = Math.max(1, value(ch, 'attrs', 'fuerza'));
    const dice = Array.from({ length: dicePool }, () => 1 + Math.floor(Math.random() * 10));
    const hits = dice.filter(n => n >= d.difficulty).length;
    const ones = dice.filter(n => n === 1).length;
    d.turns += 1;
    let text;
    if (hits === 0 && ones > 0) {
      d.failed = true;
      d.successes = 0;
      text = 'Pifia: el alma se resiste y se pierden los éxitos acumulados.';
    } else {
      const net = Math.max(0, hits - ones);
      d.successes += net;
      text = net ? `${net} éxito${net === 1 ? '' : 's'}` : 'Sin éxitos este turno';
    }
    d.rolls.unshift({ turn: d.turns, dice, text });
    renderSheet();
  }
  function resetAttempt() {
    Object.assign(diaDraft(current), { successes: 0, turns: 0, rolls: [], failed: false });
    renderSheet();
  }
  function commitDiablerie(ch) {
    const d = diaDraft(ch);
    const gen = generation(ch);
    const maxSteps = Math.max(0, gen - Math.max(4, d.victimGen));
    const steps = Math.min(Math.max(0, Math.trunc(d.steps) || 0), maxSteps);
    if (d.discGift && !shownDisciplines(ch).some(([k]) => k === d.discGift)) ch.extraDisc.push(d.discGift);
    ch.diablerie.push({
      id: crypto.randomUUID(), at: new Date().toISOString(), victim: d.victim.trim(), victimGen: d.victimGen, victimWP: d.victimWP,
      genBefore: gen, genSteps: steps, humLoss: Boolean(d.humLoss), discGift: d.discGift, notes: d.notes.trim(),
      rolled: d.turns ? { turns: d.turns, successes: d.successes } : null
    });
    dia = null;
    changed();
    const done = ch.era === 'da' ? 'Amaranto consumado' : 'Diablerie consumada';
    flash(steps ? `${done}: ahora eres de ${generation(ch)}ª generación.` : `${done}. Tu generación no cambia porque la víctima no era más antigua.`);
  }
  const LORE = {
    v20: 'La diablerie es el crimen supremo entre los Vástagos: beber a otro vampiro hasta devorar su alma. El diablerista roba la potencia de una sangre más cercana a Caín, pero su aura queda veteada de negro y la Camarilla lo castiga con la Muerte Definitiva. En el Sabbat es un rito aceptado.',
    da: 'El Amaranto es el pecado que los Cainitas solo susurran: beber a otro vampiro hasta devorar su alma. El devorador roba la potencia de una sangre más cercana a Caín, pero su aura queda veteada de negro y casi todos los príncipes lo castigan con la Muerte Definitiva.'
  };
  function diablerieSection(ch) {
    const d = diaDraft(ch);
    const name = crimeName(ch);
    const gen = generation(ch);
    const strength = value(ch, 'attrs', 'fuerza');
    const maxSteps = Math.max(0, gen - Math.max(4, d.victimGen));
    const done = d.successes >= d.victimWP;
    const discOptions = DISCIPLINES.map(n => [slug(n), n]).map(([k, l]) => `<option value="${k}" ${d.discGift === k ? 'selected' : ''}>${esc(l)} (+1)</option>`).join('');
    const rolls = d.rolls.slice(0, 6).map(r => `<li><b>Turno ${r.turn}</b><span class="vtm-dice">${r.dice.map(n => `<i class="${n >= d.difficulty ? 'hit' : n === 1 ? 'one' : ''}">${n}</i>`).join('')}</span><small>${esc(r.text)}</small></li>`).join('');
    const history = ch.diablerie.map((e, i) => {
      const parts = [`${e.victimGen}ª generación`, e.genSteps ? `de ${e.genBefore}ª a ${e.genBefore - e.genSteps}ª` : 'sin cambio de generación'];
      if (e.humLoss) parts.push(`−1 ${road(ch).name}`);
      if (e.discGift) parts.push(`+1 ${DISC_NAMES[e.discGift] || e.discGift}`);
      if (e.notes) parts.push(e.notes);
      return `<li><b>${esc(e.victim || 'Víctima sin nombre')}</b><span>${esc(parts.join(' · '))}</span><small>${esc(new Date(e.at).toLocaleDateString('es-ES'))}</small><button class="vtm-x vtm-x-sm" data-dia-del="${i}" aria-label="Deshacer este registro">×</button></li>`;
    }).join('');
    return `<section class="vtm-panel vtm-diablerie"><h2><span>IX</span> ${name}</h2>
      <p class="vtm-lore">${LORE[ch.era] || LORE.v20}</p>
      <ol class="vtm-steps">
        <li><b>Vaciar la sangre.</b> Primero bebes toda la reserva de sangre de la víctima.</li>
        <li><b>Devorar el alma.</b> Sigues bebiendo y tiras Fuerza cada turno (dificultad 9). Necesitas tantos éxitos acumulados como la Fuerza de Voluntad permanente de la víctima. Una pifia hace que se pierdan los éxitos.</li>
        <li><b>La recompensa.</b> Si la víctima era de generación más baja, la tuya baja un paso. Con víctimas mucho más antiguas el Narrador puede conceder más.</li>
        <li><b>El precio.</b> Es un pecado gravísimo: haz una tirada de degeneración. Las vetas negras en el aura delatan el crimen durante años.</li>
        <li><b>El regalo de la sangre.</b> El Narrador puede permitirte ganar un punto en una disciplina que la víctima dominara.</li>
      </ol>
      <div class="vtm-fields">
        <label class="vtm-field"><span>Víctima</span><input data-dia="victim" value="${esc(d.victim)}" maxlength="60" placeholder="Nombre del vástago"></label>
        <label class="vtm-field"><span>Generación de la víctima</span><input type="number" min="3" max="15" data-dia-num="victimGen" value="${d.victimGen}"></label>
        <label class="vtm-field"><span>Voluntad permanente de la víctima</span><input type="number" min="1" max="10" data-dia-num="victimWP" value="${d.victimWP}"></label>
      </div>
      <div class="vtm-attempt">
        <div class="vtm-attempt-head"><span>Fuerza: <b>${strength}</b> dados · dificultad <b>${d.difficulty}</b></span><span class="vtm-attempt-count ${done ? 'is-done' : d.failed ? 'is-over' : ''}">${d.failed ? 'El alma escapó' : `${d.successes} / ${d.victimWP} éxitos · ${d.turns} turno${d.turns === 1 ? '' : 's'}`}</span></div>
        <div class="vtm-actions"><button class="vtm-button" data-dia-roll ${d.failed || done ? 'disabled' : ''}>⚄ TIRAR FUERZA</button><button class="vtm-button ghost" data-dia-reset ${d.turns ? '' : 'disabled'}>REINICIAR INTENTO</button></div>
        ${rolls ? `<ul class="vtm-rolls">${rolls}</ul>` : '<p class="vtm-note">Puedes tirar aquí o con tus propios dados y registrar el resultado igualmente.</p>'}
      </div>
      <div class="vtm-fields">
        <label class="vtm-field"><span>Pasos de generación ganados</span><input type="number" min="0" max="${maxSteps}" data-dia-num="steps" value="${Math.min(d.steps, maxSteps)}"></label>
        <label class="vtm-field"><span>Disciplina aprendida de la víctima</span><select data-dia="discGift"><option value="">Ninguna</option>${discOptions}</select></label>
        <label class="vtm-check"><input type="checkbox" data-dia-check="humLoss" ${d.humLoss ? 'checked' : ''}><span>Falló la degeneración (−1 ${esc(road(ch).name)})</span></label>
        <label class="vtm-field vtm-wide"><span>Notas</span><input data-dia="notes" value="${esc(d.notes)}" maxlength="120" placeholder="Dónde, cómo, quién lo sabe…"></label>
      </div>
      <p class="vtm-note">Ahora eres de ${gen}ª generación. ${maxSteps ? `Con esta víctima puedes bajar hasta ${maxSteps} paso${maxSteps === 1 ? '' : 's'}; lo habitual es 1.` : 'Esta víctima no es más antigua que tú, así que tu generación no cambiaría.'}</p>
      <button class="vtm-button danger" data-dia-commit>☠ CONSUMAR ${name.toUpperCase()}</button>
      ${history ? `<h3 class="vtm-sub">Almas devoradas</h3><ul class="vtm-xp-log vtm-dia-log">${history}</ul>` : ''}
    </section>`;
  }
  function bindDiablerie(sheet, ch) {
    const d = diaDraft(ch);
    sheet.querySelectorAll('[data-dia]').forEach(input => input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', () => { d[input.dataset.dia] = input.value; }));
    sheet.querySelectorAll('[data-dia-num]').forEach(input => input.addEventListener('change', () => {
      const n = Math.max(Number(input.min), Math.min(Number(input.max), Math.trunc(Number(input.value)) || Number(input.min)));
      d[input.dataset.diaNum] = n;
      if (input.dataset.diaNum === 'victimGen') d.steps = suggestedSteps(ch, d);
      renderSheet();
    }));
    sheet.querySelectorAll('[data-dia-check]').forEach(input => input.addEventListener('change', () => { d[input.dataset.diaCheck] = input.checked; }));
    sheet.querySelector('[data-dia-roll]').addEventListener('click', () => rollStrength(ch));
    sheet.querySelector('[data-dia-reset]').addEventListener('click', resetAttempt);
    sheet.querySelector('[data-dia-commit]').addEventListener('click', () => commitDiablerie(ch));
    sheet.querySelectorAll('[data-dia-del]').forEach(button => button.addEventListener('click', () => {
      const index = Number(button.dataset.diaDel);
      const entry = ch.diablerie[index];
      ch.diablerie.splice(index, 1);
      if (xpSpent(ch) > xpBudget(ch) || freebieSpent(ch) > freebieBudget(ch)) {
        ch.diablerie.splice(index, 0, entry);
        return flash('No se puede deshacer: hay rasgos comprados que dependen de esta generación o disciplina.');
      }
      changed();
      flash('Registro deshecho: la generación, la Humanidad y las disciplinas vuelven a su estado anterior.');
    }));
  }

  function flushSave() {
    if (!saveTimer) return;
    clearTimeout(saveTimer);
    saveTimer = 0;
    persist();
  }

  function ensureHost() {
    if (host) return;
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=EB+Garamond:wght@400;600&display=swap';
    document.head.append(fonts);
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './src/vampiro/vampire.css?v=3';
    document.head.append(stylesheet);
    host = document.createElement('section');
    host.id = 'nexoVampire';
    host.className = 'vtm';
    host.hidden = true;
    host.setAttribute('aria-label', 'NEXO Vampiro: La Mascarada');
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
    pullFromCloud();
    document.documentElement.classList.add('nexo-vampire-open');
  }
  function close() {
    flushSave();
    current = null;
    host.hidden = true;
    document.documentElement.classList.remove('nexo-vampire-open');
    if (exitHandler) exitHandler();
  }
  window.addEventListener('pagehide', flushSave);

  window.NEXO_VAMPIRE = { open, close };
})();
