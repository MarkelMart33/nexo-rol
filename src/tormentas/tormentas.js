/*
 * NEXO · El Archivo de las Tormentas (juego de rol del Cosmere, Manual de Stormlight).
 * Creador de personajes de nivel 1: ascendencia, culturas, camino heroico, 12 puntos de
 * atributo, 4 rangos de habilidad, pericias y camino radiante. Los textos son resúmenes propios.
 */
(() => {
  const KEY = 'nexo-tormentas-v1';
  const GAME = 'tormentas';
  const ATTR_POINTS = 12;
  const SKILL_RANKS = 4;
  const CULTURE_PICKS = 2;
  const MAX_LEVEL = 20;
  const MAX_IDEAL = 5;
  // A nivel 1 ningún atributo pasa de 3 ni ninguna habilidad de rango 2; después, hasta 10 y 5.
  const attrCap = ch => (ch.level > 1 ? 10 : 3);
  const rankCap = ch => (ch.level > 1 ? 5 : 2);

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
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

  let host = null;
  let store = load();
  let current = null;
  let exitHandler = null;
  let saveTimer = 0;

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
  const signed = n => (n < 0 ? '−' + Math.abs(n) : '+' + n);

  function newCharacter() {
    return {
      id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      name: '', player: '', campaign: '', purpose: '', obstacle: '', goals: '',
      level: 1, ancestry: '', cultures: [], path: '', spec: '',
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
  const attrBudget = ch => ATTR_POINTS + Math.max(0, Number(ch.attrBonus) || 0);
  const rankSpent = ch => Object.values(ch.ranks).reduce((t, n) => t + n, 0);
  const rankBudget = ch => SKILL_RANKS + Math.max(0, Number(ch.rankBonus) || 0);
  function defense(ch, realm) {
    return 10 + ATTRS.filter(a => a[3] === realm).reduce((t, [k]) => t + attr(ch, k), 0);
  }
  const health = ch => 10 + attr(ch, 'fue') + Math.max(0, Number(ch.healthBonus) || 0);
  const focus = ch => 2 + attr(ch, 'vol');
  const investiture = ch => (ch.radiant && ch.ideal >= 1 ? 2 + Math.max(attr(ch, 'cns'), attr(ch, 'pre')) : 0);
  const tier = ch => Math.ceil(ch.level / 5);
  const extraExpertises = ch => ch.expertises.split(',').map(s => s.trim()).filter(Boolean);

  function sanitize(ch) {
    ch.level = Math.max(1, Math.min(MAX_LEVEL, Math.trunc(Number(ch.level)) || 1));
    if (!ANCESTRIES[ch.ancestry]) ch.ancestry = '';
    ch.cultures = ch.cultures.filter(k => CULTURES[k]).slice(0, CULTURE_PICKS);
    if (!PATHS[ch.path]) ch.path = '';
    if (!PATHS[ch.path]?.specs.includes(ch.spec)) ch.spec = '';
    ATTRS.forEach(([k]) => { ch.attrs[k] = Math.max(0, Math.min(attrCap(ch), Math.trunc(ch.attrs[k]) || 0)); });
    Object.keys(ch.ranks).forEach(k => {
      const bonus = pathSkill(ch) === k ? 1 : 0;
      ch.ranks[k] = Math.max(0, Math.min(rankCap(ch) - bonus, ch.ranks[k] || 0));
      if (!SKILLS[k] || !ch.ranks[k]) delete ch.ranks[k];
    });
    if (!ORDERS[ch.order]) ch.order = '';
    ch.ideal = Math.max(0, Math.min(MAX_IDEAL, Math.trunc(ch.ideal) || 0));
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
    if (next > attrCap(ch)) return flash(ch.level > 1 ? `Los atributos no pasan de ${attrCap(ch)}.` : 'A nivel 1 ningún atributo puede pasar de 3.');
    if (delta > 0 && attrSpent(ch) >= attrBudget(ch)) return flash(`Ya has repartido tus ${attrBudget(ch)} puntos de atributo. Baja otro para subir este.`);
    ch.attrs[key] = next;
    changed();
  }
  function stepRank(skill, delta) {
    const ch = current;
    const own = ch.ranks[skill] || 0;
    const next = own + delta;
    if (next < 0) return;
    if (next + (pathSkill(ch) === skill ? 1 : 0) > rankCap(ch)) return flash(ch.level > 1 ? `Ninguna habilidad pasa de rango ${rankCap(ch)}.` : `A nivel 1 ninguna habilidad pasa de rango 2${pathSkill(ch) === skill ? ' (tu camino ya te da uno aquí)' : ''}.`);
    if (delta > 0 && rankSpent(ch) >= rankBudget(ch)) return flash(`Ya has repartido tus ${rankBudget(ch)} rangos de habilidad. Quita uno para ponerlo aquí.`);
    ch.ranks[skill] = next;
    changed();
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
    host.innerHTML = `<div class="tor-storm" aria-hidden="true"></div><header class="tor-top"><button class="tor-brand" data-exit aria-label="Volver a la mesa"><span class="tor-sphere">${window.NEXO_ICONS?.tormentas || ''}</span><span><b>NEXO</b><small>EL ARCHIVO DE LAS TORMENTAS</small></span></button><span class="tor-status" data-save-status>${esc(status)}</span></header><main class="tor-main">${body}</main><div class="tor-flash" data-flash hidden role="status"></div>`;
    host.querySelectorAll('[data-exit]').forEach(button => button.addEventListener('click', close));
  }

  function renderList() {
    flushSave();
    current = null;
    const rows = store.characters;
    const cards = rows.length ? rows.map(ch => {
      const done = isComplete(ch);
      return `<button class="tor-card" data-open="${esc(ch.id)}"><span class="tor-card-gem">${esc((ch.name || '?').trim().charAt(0).toUpperCase() || '?')}</span><span class="tor-card-copy"><b>${esc(ch.name || 'Héroe sin nombre')}</b><small>${esc(describe(ch))}</small></span><span class="tor-badge ${done ? 'is-done' : ''}">${done ? 'LISTO' : 'EN CREACIÓN'}</span></button>`;
    }).join('') : '<div class="tor-empty"><span aria-hidden="true">✦</span><b>Las Llanuras están en calma</b><small>Pulsa «Despertar a un héroe» para crear tu primer personaje.</small></div>';
    frame(`<p class="tor-kicker">NEXO / JUEGO DE ROL DEL COSMERE · MANUAL DE STORMLIGHT</p><h1>Tus <em>héroes</em> de Roshar</h1><p class="tor-intro">Crea personajes de nivel 1: ascendencia, dos culturas, un camino heroico, 12 puntos de atributo y 4 rangos de habilidad. NEXO calcula defensas, salud, concentración, investidura, movimiento y sentidos, y guarda las fichas en este dispositivo y en tu cuenta.</p><div class="tor-actions"><button class="tor-button" data-new>✦ DESPERTAR A UN HÉROE</button><button class="tor-button ghost" data-exit>← VOLVER A LA MESA</button></div><div class="tor-list">${cards}</div>`);
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
    const saved = store.characters.some(item => item.id === ch.id);
    frame(`<div class="tor-editor-head"><button class="tor-button ghost" data-back>← TUS HÉROES</button><button class="tor-button danger" data-delete ${saved ? '' : 'hidden'}>ELIMINAR</button></div>
      <section class="tor-panel">${heading(1, 'Identidad', 'concepto del personaje')}<div class="tor-fields">
        ${field('Nombre', 'name', { placeholder: 'Nombre del personaje' })}${field('Jugador', 'player')}${field('Campaña', 'campaign')}
      </div><div class="tor-fields tor-fields-3">
        ${field('Propósito', 'purpose', { area: true, placeholder: 'Qué te impulsa a actuar' })}${field('Obstáculo', 'obstacle', { area: true, placeholder: 'Qué te frena por dentro o por fuera' })}${field('Metas', 'goals', { area: true, placeholder: 'Lo que quieres lograr' })}
      </div></section>
      <div data-sheet></div>
      <section class="tor-panel">${heading(8, 'Talentos, equipo y notas')}<p class="tor-note">Anota los talentos que elijas en tus caminos, tu equipo inicial (armas, armadura, esferas) y la historia de tu personaje.</p>
        <label class="tor-field"><span>Talentos</span><textarea data-prop="talents" rows="4" placeholder="Un talento por línea">${esc(ch.talents)}</textarea></label>
        <label class="tor-field"><span>Equipo y notas</span><textarea data-prop="notes" rows="6" placeholder="Equipo, esferas, historia…">${esc(ch.notes)}</textarea></label></section>
      <div class="tor-modal" data-modal hidden><div class="tor-modal-card" role="alertdialog" aria-modal="true" aria-labelledby="torDelTitle"><h3 id="torDelTitle">¿Dejar que la tormenta se lleve a este héroe?</h3><p>La ficha se borrará de este dispositivo y de tu cuenta, y no se podrá recuperar.</p><div class="tor-actions"><button class="tor-button ghost" data-cancel>CANCELAR</button><button class="tor-button danger" data-confirm>ELIMINAR FICHA</button></div></div></div>`, saved ? 'GUARDADO EN ESTE DISPOSITIVO' : 'FICHA NUEVA · SIN GUARDAR');

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

  function originPanel(ch) {
    const anc = ANCESTRIES[ch.ancestry];
    const path = PATHS[ch.path];
    const chips = Object.entries(CULTURES).map(([k, [name, text]]) => `<button class="tor-chip ${ch.cultures.includes(k) ? 'is-on' : ''}" data-culture="${k}" aria-pressed="${ch.cultures.includes(k)}" title="${esc(text)}">${esc(name)}</button>`).join('');
    const left = CULTURE_PICKS - ch.cultures.length;
    return `<section class="tor-panel">${heading(2, 'Origen', 'ascendencia · culturas · camino')}<div class="tor-cols">
      <div class="tor-col"><h3>Ascendencia</h3>
        <label class="tor-field"><span>Ascendencia</span><select data-choice="ancestry">${options(sorted(ANCESTRIES), ch.ancestry, 'Elige una ascendencia…')}</select></label>
        ${anc ? `<p class="tor-narr">${esc(anc.traits)}</p>` : '<p class="tor-note">Humano o cantor. Los cantores cambian de forma con las altas tormentas.</p>'}
        <h3>Culturas <span class="tor-left ${left === 0 ? 'is-done' : ''}">${left === 0 ? 'Completo' : `Elige ${left} más`}</span></h3>
        <div class="tor-chips">${chips}</div>
        ${ch.cultures.length ? `<p class="tor-note">${ch.cultures.map(k => `<b>${esc(CULTURES[k][0])}:</b> ${esc(CULTURES[k][1])}`).join('<br>')}</p>` : '<p class="tor-note">Cada cultura te da una pericia: conoces sus costumbres, su idioma y su historia.</p>'}
      </div>
      <div class="tor-col"><h3>Camino heroico</h3>
        <label class="tor-field"><span>Camino</span><select data-choice="path">${options(sorted(PATHS), ch.path, 'Elige un camino…')}</select></label>
        ${path ? `<label class="tor-field"><span>Especialidad (opcional)</span><select data-choice="spec">${options(path.specs.map(s => [s, s]), ch.spec, 'Sin especialidad todavía')}</select></label>
          <p class="tor-narr">${esc(path.story)}</p>${info([['Habilidad del camino', `${SKILLS[path.skill][0]} (+1 rango)`], ['Talento clave', path.talent], ['Efecto', path.talentText]])}` : '<p class="tor-note">El camino te da un talento clave, un rango en su habilidad y el árbol de talentos que irás desbloqueando.</p>'}
        <div class="tor-level"><label class="tor-field"><span>Nivel</span><input type="number" min="1" max="${MAX_LEVEL}" data-num="level" value="${ch.level}"></label><span class="tor-tier">Escalón ${tier(ch)}</span></div>
        ${ch.level > 1 ? `<div class="tor-fields tor-fields-3 tor-advance"><label class="tor-field"><span>Atributos ganados</span><input type="number" min="0" max="20" data-num="attrBonus" value="${ch.attrBonus}"></label><label class="tor-field"><span>Rangos ganados</span><input type="number" min="0" max="80" data-num="rankBonus" value="${ch.rankBonus}"></label><label class="tor-field"><span>Salud ganada</span><input type="number" min="0" max="300" data-num="healthBonus" value="${ch.healthBonus}"></label></div><p class="tor-note">Por encima del nivel 1, apunta lo que te da la tabla de progresión del manual y NEXO lo suma a tus repartos.</p>` : ''}
      </div>
    </div></section>`;
  }

  function attributesPanel(ch) {
    const left = attrBudget(ch) - attrSpent(ch);
    const cols = REALMS.map(([realm, name, def]) => {
      const rows = ATTRS.filter(a => a[3] === realm).map(([k, n]) => `<div class="tor-attr"><span class="tor-attr-name">${n}</span><span class="tor-stepper"><button data-attr="${k}" data-d="-1" aria-label="Bajar ${n}" ${attr(ch, k) <= 0 ? 'disabled' : ''}>−</button><b>${attr(ch, k)}</b><button data-attr="${k}" data-d="1" aria-label="Subir ${n}">+</button></span></div>`).join('');
      return `<div class="tor-realm is-${realm}"><div class="tor-realm-head"><b>${name}</b><span class="tor-def"><small>${def}</small><b>${defense(ch, realm)}</b></span></div>${rows}</div>`;
    }).join('');
    return `<section class="tor-panel">${heading(3, 'Atributos', `${attrBudget(ch)} puntos`)}<p class="tor-note">Reparte ${attrBudget(ch)} puntos entre los seis atributos (todos empiezan en 0${ch.level === 1 ? ', máximo 3 a nivel 1' : ''}). Cada pareja forma la defensa de su reino: 10 + los dos atributos. <span class="tor-left ${left === 0 ? 'is-done' : left < 0 ? 'is-over' : ''}">${left === 0 ? 'Todo repartido' : left > 0 ? `Te quedan ${left}` : `Te pasas en ${-left}`}</span></p><div class="tor-realms">${cols}</div></section>`;
  }

  function skillsPanel(ch) {
    const left = rankBudget(ch) - rankSpent(ch);
    const cap = rankCap(ch);
    const cols = REALMS.map(([realm, name]) => {
      const rows = Object.entries(SKILLS).filter(([, [, a]]) => AT[a].realm === realm).map(([k, [n, a]]) => {
        const r = rank(ch, k);
        const fromPath = pathSkill(ch) === k;
        const pips = Array.from({ length: cap }, (_, i) => `<i class="${i < r ? (fromPath && i === 0 ? 'is-path' : 'is-on') : ''}"></i>`).join('');
        return `<li class="${r ? 'is-ranked' : ''}"><span class="tor-skill-name">${esc(n)} <small>${AT[a].short}</small></span><span class="tor-pips" aria-label="Rango ${r}">${pips}</span><span class="tor-mini"><button data-rank="${k}" data-d="-1" aria-label="Quitar rango a ${esc(n)}" ${(ch.ranks[k] || 0) <= 0 ? 'disabled' : ''}>−</button><button data-rank="${k}" data-d="1" aria-label="Añadir rango a ${esc(n)}">+</button></span><b class="tor-skill-mod">${signed(skillMod(ch, k))}</b></li>`;
      }).join('');
      return `<div class="tor-col"><h3>${name}</h3><ul class="tor-skills">${rows}</ul></div>`;
    }).join('');
    return `<section class="tor-panel">${heading(4, 'Habilidades', `${rankBudget(ch)} rangos`)}<p class="tor-note">Reparte ${rankBudget(ch)} rangos (máximo ${cap} por habilidad${ch.level === 1 ? ' a nivel 1' : ''}). Tu camino heroico añade uno más en su habilidad, marcado en dorado. El modificador es el atributo más el rango. <span class="tor-left ${left === 0 ? 'is-done' : left < 0 ? 'is-over' : ''}">${left === 0 ? 'Todo repartido' : left > 0 ? `Te quedan ${left}` : `Te pasas en ${-left}`}</span></p><div class="tor-cols">${cols}</div></section>`;
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

  function sheetPanel(ch) {
    const fue = band(attr(ch, 'fue'));
    const stats = [
      ['Defensa física', defense(ch, 'fisico')], ['Defensa cognitiva', defense(ch, 'cognitivo')], ['Defensa espiritual', defense(ch, 'espiritual')],
      ['Salud', health(ch)], ['Concentración', focus(ch)], ['Investidura', investiture(ch) || '—'],
      ['Movimiento', MOVE[band(attr(ch, 'vel'))] + ' pies'], ['Sentidos', SENSES[band(attr(ch, 'cns'))]], ['Dado de recuperación', RECOVERY[band(attr(ch, 'vol'))]],
      ['Capacidad de carga', `${LIFT[fue][1]} lb`], ['Levantar', `${LIFT[fue][0]} lb`], ['Nivel', `${ch.level} · escalón ${tier(ch)}`]
    ];
    return `<section class="tor-panel">${heading(6, 'Hoja calculada', esc(describe(ch)))}
      <div class="tor-stats">${stats.map(([k, v]) => `<div><small>${k}</small><b>${esc(v)}</b></div>`).join('')}</div>
      <p class="tor-note">Salud: 10 + Fuerza${ch.healthBonus ? ' + lo ganado al subir de nivel' : ''}. Concentración: 2 + Voluntad. Investidura: 2 + el mayor entre Consciencia y Presencia, solo tras pronunciar el Primer Ideal. Movimiento, carga, sentidos y dado de recuperación salen de Velocidad, Fuerza, Consciencia y Voluntad.</p></section>`;
  }

  function radiantPanel(ch) {
    const order = ORDERS[ch.order];
    const surges = order ? order.surges.map(k => `<div class="tor-surge"><b>${esc(SURGES[k][0])}</b><small>${esc(SURGES[k][1])}</small></div>`).join('') : '';
    const ideals = Array.from({ length: MAX_IDEAL }, (_, i) => `<button class="tor-ideal ${i < ch.ideal ? 'is-on' : ''}" data-ideal="${i + 1}" aria-pressed="${i < ch.ideal}" aria-label="${i + 1}º Ideal">${ROMAN[i]}</button>`).join('');
    return `<section class="tor-panel tor-radiant ${ch.radiant ? 'is-active' : ''}">${heading(7, 'Camino radiante', 'vínculo náhel')}
      <label class="tor-switch"><input type="checkbox" data-radiant ${ch.radiant ? 'checked' : ''}><span>Mi personaje sigue el camino radiante</span></label>
      ${ch.radiant ? `<div class="tor-cols tor-cols-2"><div class="tor-col">
          <label class="tor-field"><span>Orden</span><select data-choice="order">${options(sorted(ORDERS), ch.order, 'Elige una orden…')}</select></label>
          <label class="tor-field"><span>Nombre del spren</span><input data-prop="spren" value="${esc(ch.spren)}" maxlength="40" placeholder="${esc(order ? 'Tu ' + order.spren : 'Tu spren')}"></label>
          ${order ? info([['Spren', order.spren], ['Ideales', order.theme]]) : '<p class="tor-note">Cada orden tiene su spren, su forma de entender los Ideales y dos potencias.</p>'}
        </div><div class="tor-col"><h3>Ideales pronunciados</h3><div class="tor-ideals">${ideals}</div>
          <p class="tor-note">${ch.ideal ? `Has pronunciado ${ch.ideal === 1 ? 'el Primer Ideal' : `${ch.ideal} Ideales`}: tienes investidura y puedes absorber luz tormentosa.` : 'Aún no has pronunciado el Primer Ideal: «Vida antes que muerte. Fuerza antes que debilidad. Viaje antes que destino.»'}</p>
          ${order ? `<h3>Potencias</h3><div class="tor-surges">${surges}</div>` : ''}
        </div></div>` : '<p class="tor-note">Se puede empezar sin vínculo y descubrirlo en partida. Al activarlo eliges orden, spren y los Ideales que has pronunciado.</p>'}</section>`;
  }

  function renderSheet() {
    const ch = current;
    const sheet = host?.querySelector('[data-sheet]');
    if (!ch || !sheet) return;
    sanitize(ch);
    const rows = summary(ch);
    const pending = rows.reduce((t, r) => t + Math.max(0, r.left), 0);
    sheet.innerHTML = `
      <section class="tor-tracker"><div class="tor-tracker-head"><b>${pending > 1 ? `Te quedan ${pending} elecciones` : pending ? 'Te queda 1 elección' : 'Héroe completo'}</b><span>Manual de Stormlight</span></div>
        <ul class="tor-pools">${rows.map(r => `<li class="${r.left === 0 ? 'is-done' : r.left < 0 ? 'is-over' : ''}"><span>${r.label}</span><b>${r.left === 0 ? '✓' : r.left}</b><small>/ ${r.budget}</small></li>`).join('')}</ul></section>
      ${originPanel(ch)}${attributesPanel(ch)}${skillsPanel(ch)}${expertisePanel(ch)}${sheetPanel(ch)}${radiantPanel(ch)}`;

    sheet.querySelectorAll('[data-choice]').forEach(select => select.addEventListener('change', () => { current[select.dataset.choice] = select.value; changed(); }));
    sheet.querySelectorAll('[data-num]').forEach(input => input.addEventListener('change', () => { current[input.dataset.num] = Math.max(0, Math.trunc(Number(input.value)) || 0); changed(); }));
    sheet.querySelectorAll('[data-culture]').forEach(button => button.addEventListener('click', () => toggleCulture(button.dataset.culture)));
    sheet.querySelectorAll('[data-attr]').forEach(button => button.addEventListener('click', () => stepAttr(button.dataset.attr, Number(button.dataset.d))));
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
  }

  function ensureHost() {
    if (host) return;
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Spectral:ital,wght@0,400;0,600;1,400&display=swap';
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './src/tormentas/tormentas.css?v=1';
    document.head.append(fonts, stylesheet);
    host = document.createElement('section');
    host.id = 'nexoTormentas';
    host.className = 'tor';
    host.hidden = true;
    host.setAttribute('aria-label', 'NEXO El Archivo de las Tormentas');
    document.body.append(host);
    host.addEventListener('keydown', event => {
      if (event.key === 'Escape') host.querySelectorAll('.tor-modal').forEach(modal => { modal.hidden = true; });
    });
  }
  function open(options = {}) {
    ensureHost();
    exitHandler = options.onExit || null;
    store = load();
    renderList();
    const requested = options.characterId && store.characters.find(ch => ch.id === options.characterId);
    if (requested) openEditor(requested);
    host.hidden = false;
    pullFromCloud();
    document.documentElement.classList.add('nexo-tormentas-open');
  }
  function close() {
    flushSave();
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
