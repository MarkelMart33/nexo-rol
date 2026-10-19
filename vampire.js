(() => {
  const KEY = 'nexo-vampire-v1';
  const FREEBIES = 15;
  const FLAW_CAP = 7;
  const COST = { attrs: 5, abil: 2, disc: 7, bg: 1, virt: 2, hum: 2, wp: 1 };
  const RANKS = ['Primarios', 'Secundarios', 'Terciarios'];
  const ATTR_POOLS = [7, 5, 3];
  const ABIL_POOLS = [13, 9, 5];
  const ABIL_BASE_MAX = 3;
  const slug = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const group = (id, label, names) => ({ id, label, traits: names.map(name => [slug(name), name]) });

  const ATTRS = [
    group('fisicos', 'Físicos', ['Fuerza', 'Destreza', 'Resistencia']),
    group('sociales', 'Sociales', ['Carisma', 'Manipulación', 'Apariencia']),
    group('mentales', 'Mentales', ['Percepción', 'Inteligencia', 'Astucia'])
  ];
  const ABILS = [
    group('talentos', 'Talentos', ['Alerta', 'Atletismo', 'Callejeo', 'Consciencia', 'Empatía', 'Expresión', 'Intimidación', 'Liderazgo', 'Pelea', 'Subterfugio']),
    group('tecnicas', 'Técnicas', ['Armas C.C.', 'Armas de fuego', 'Conducir', 'Etiqueta', 'Interpretación', 'Latrocinio', 'Pericias', 'Sigilo', 'Supervivencia', 'Trato con animales']),
    group('conocimientos', 'Conocimientos', ['Academicismo', 'Ciencias', 'Finanzas', 'Informática', 'Investigación', 'Leyes', 'Medicina', 'Ocultismo', 'Política', 'Tecnología'])
  ];
  const BACKGROUNDS = ['Aliados', 'Contactos', 'Criados', 'Dominio', 'Estatus', 'Fama', 'Generación', 'Identidad alternativa', 'Influencia', 'Mentor', 'Rebaño', 'Recursos'].map(name => [slug(name), name]);
  const VIRTUES = [['conciencia', 'Conciencia'], ['autocontrol', 'Autocontrol'], ['coraje', 'Coraje']];
  const COMMON_DISC = ['Animalismo', 'Auspex', 'Celeridad', 'Dominación', 'Fortaleza', 'Ofuscación', 'Potencia', 'Presencia'];
  const CLANS = {
    assamita: { name: 'Assamita', disc: ['Celeridad', 'Extinción', 'Ofuscación'], weak: 'Riesgo de adicción al beber la sangre de otros vástagos; el clan exige su diezmo de sangre.' },
    brujah: { name: 'Brujah', disc: ['Celeridad', 'Potencia', 'Presencia'], weak: 'La dificultad para resistir el frenesí aumenta en +2.' },
    gangrel: { name: 'Gangrel', disc: ['Animalismo', 'Fortaleza', 'Protean'], weak: 'Cada frenesí deja un rasgo animal permanente.' },
    giovanni: { name: 'Giovanni', disc: ['Dominación', 'Nigromancia', 'Potencia'], weak: 'Su Beso provoca un dolor atroz y el doble de daño a los mortales.' },
    lasombra: { name: 'Lasombra', disc: ['Dominación', 'Obtenebración', 'Potencia'], weak: 'No se reflejan en espejos ni superficies.' },
    malkavian: { name: 'Malkavian', disc: ['Auspex', 'Demencia', 'Ofuscación'], weak: 'Sufren al menos un trastorno mental permanente.' },
    nosferatu: { name: 'Nosferatu', disc: ['Animalismo', 'Ofuscación', 'Potencia'], weak: 'Su Apariencia es 0 y no puede aumentarse.' },
    ravnos: { name: 'Ravnos', disc: ['Animalismo', 'Fortaleza', 'Quimerismo'], weak: 'Cada uno arrastra un vicio o compulsión al que le cuesta resistirse.' },
    setita: { name: 'Seguidores de Set', disc: ['Ofuscación', 'Presencia', 'Serpentis'], weak: 'Sufren más daño por la luz solar y penalizaciones bajo luz intensa.' },
    toreador: { name: 'Toreador', disc: ['Auspex', 'Celeridad', 'Presencia'], weak: 'Pueden quedar absortos ante algo hermoso.' },
    tremere: { name: 'Tremere', disc: ['Auspex', 'Dominación', 'Taumaturgia'], weak: 'Llevan un paso del vínculo de sangre hacia los ancianos del clan.' },
    tzimisce: { name: 'Tzimisce', disc: ['Animalismo', 'Auspex', 'Vicisitud'], weak: 'Deben dormir junto a dos puñados de tierra de su patria.' },
    ventrue: { name: 'Ventrue', disc: ['Dominación', 'Fortaleza', 'Presencia'], weak: 'Solo pueden alimentarse de un tipo concreto de mortal.' },
    caitiff: { name: 'Caitiff', disc: COMMON_DISC, weak: 'Sin clan: eligen sus disciplinas, pero cargan con el desprecio de la sociedad vástaga.' }
  };
  const GENERATIONS = { 13: [10, 1], 12: [11, 1], 11: [12, 1], 10: [13, 1], 9: [14, 2], 8: [15, 3] };
  const ARCHETYPES = ['Arquitecto', 'Autócrata', 'Bon vivant', 'Bravucón', 'Cuidador', 'Celebrante', 'Conformista', 'Competidor', 'Desviado', 'Director', 'Fanático', 'Galante', 'Gruñón', 'Juez', 'Mártir', 'Masoquista', 'Monstruo', 'Pedagogo', 'Penitente', 'Perfeccionista', 'Rebelde', 'Pícaro', 'Solitario', 'Superviviente', 'Tradicionalista', 'Visionario'];

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

  function newCharacter() {
    return {
      id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      name: '', player: '', chronicle: '', concept: '', nature: '', demeanor: '', sire: '', sect: '', clan: 'brujah',
      attrPrio: { fisicos: 0, sociales: 1, mentales: 2 }, abilPrio: { talentos: 0, tecnicas: 1, conocimientos: 2 },
      attrs: {}, abil: {}, disc: {}, bg: {}, virt: {}, humF: 0, wpF: 0, merits: [], phase: 'base', notes: ''
    };
  }

  // Rasgos: cada uno guarda b (puntos del reparto inicial) y f (puntos gratuitos).
  function trait(ch, kind, key) {
    ch[kind] ||= {};
    return ch[kind][key] ||= { b: 0, f: 0 };
  }
  const isNosAppearance = (ch, kind, key) => kind === 'attrs' && key === 'apariencia' && ch.clan === 'nosferatu';
  function minOf(ch, kind, key) {
    if (isNosAppearance(ch, kind, key)) return 0;
    return kind === 'attrs' || kind === 'virt' ? 1 : 0;
  }
  function maxOf(ch, kind, key) { return isNosAppearance(ch, kind, key) ? 0 : 5; }
  function value(ch, kind, key) { const t = trait(ch, kind, key); return minOf(ch, kind, key) + t.b + t.f; }
  function sum(ch, kind, keys, field) { return keys.reduce((total, key) => total + trait(ch, kind, key)[field], 0); }

  function clanDisciplines(ch) { return (CLANS[ch.clan] || CLANS.caitiff).disc.map(name => [slug(name), name]); }
  function generation(ch) { return 13 - Math.min(5, value(ch, 'bg', 'generacion')); }
  function humanity(ch) { return value(ch, 'virt', 'conciencia') + value(ch, 'virt', 'autocontrol') + ch.humF; }
  function willpower(ch) { return value(ch, 'virt', 'coraje') + ch.wpF; }

  function pool(ch, kind, key) {
    if (kind === 'attrs' || kind === 'abil') {
      const groups = kind === 'attrs' ? ATTRS : ABILS;
      const g = groups.find(item => item.traits.some(([k]) => k === key));
      const budget = (kind === 'attrs' ? ATTR_POOLS : ABIL_POOLS)[(kind === 'attrs' ? ch.attrPrio : ch.abilPrio)[g.id]];
      return { budget, spent: sum(ch, kind, g.traits.map(([k]) => k), 'b') };
    }
    if (kind === 'disc') return { budget: 3, spent: sum(ch, 'disc', Object.keys(ch.disc || {}), 'b') };
    if (kind === 'bg') return { budget: 5, spent: sum(ch, 'bg', Object.keys(ch.bg || {}), 'b') };
    return { budget: 7, spent: sum(ch, 'virt', VIRTUES.map(([k]) => k), 'b') };
  }
  function flawBonus(ch) {
    const flaws = ch.merits.filter(m => m.type === 'defecto').reduce((t, m) => t + (Number(m.points) || 0), 0);
    return Math.min(FLAW_CAP, flaws);
  }
  function freebieBudget(ch) { return FREEBIES + flawBonus(ch); }
  function freebieSpent(ch) {
    let total = 0;
    ['attrs', 'abil', 'disc', 'bg', 'virt'].forEach(kind => {
      Object.values(ch[kind] || {}).forEach(t => { total += (t.f || 0) * COST[kind]; });
    });
    total += ch.humF * COST.hum + ch.wpF * COST.wp;
    total += ch.merits.filter(m => m.type === 'merito').reduce((t, m) => t + (Number(m.points) || 0), 0);
    return total;
  }

  function summary(ch) {
    const rows = [];
    ATTRS.forEach(g => {
      const p = pool(ch, 'attrs', g.traits[0][0]);
      rows.push({ label: 'Atributos ' + g.label.toLowerCase(), left: p.budget - p.spent, budget: p.budget });
    });
    ABILS.forEach(g => {
      const p = pool(ch, 'abil', g.traits[0][0]);
      rows.push({ label: g.label, left: p.budget - p.spent, budget: p.budget });
    });
    const d = pool(ch, 'disc'); rows.push({ label: 'Disciplinas', left: d.budget - d.spent, budget: d.budget });
    const b = pool(ch, 'bg'); rows.push({ label: 'Trasfondos', left: b.budget - b.spent, budget: b.budget });
    const v = pool(ch, 'virt'); rows.push({ label: 'Virtudes', left: v.budget - v.spent, budget: v.budget });
    rows.push({ label: 'Puntos gratuitos', left: freebieBudget(ch) - freebieSpent(ch), budget: freebieBudget(ch), freebie: true });
    return rows;
  }
  function isComplete(ch) { return summary(ch).every(row => row.left === 0); }

  // Interacción con los puntos
  function setDot(kind, key, n) {
    const ch = current;
    const t = trait(ch, kind, key);
    const min = minOf(ch, kind, key);
    const max = maxOf(ch, kind, key);
    const cur = value(ch, kind, key);
    const target = Math.max(min, Math.min(max, n === cur ? n - 1 : n));
    if (ch.phase === 'base') {
      const nextB = Math.max(0, target - min - t.f);
      const delta = nextB - t.b;
      if (delta > 0) {
        const p = pool(ch, kind, key);
        if (p.spent + delta > p.budget) return flash('No quedan puntos en este grupo. Pasa a «Puntos gratuitos» para seguir subiendo.');
        if (kind === 'abil' && min + nextB > ABIL_BASE_MAX) return flash('En el reparto inicial ninguna habilidad puede superar 3. Usa puntos gratuitos para llegar a 4 o 5.');
      }
      t.b = nextB;
    } else {
      const nextF = Math.max(0, target - min - t.b);
      const cost = (nextF - t.f) * COST[kind];
      if (cost > 0 && freebieSpent(ch) + cost > freebieBudget(ch)) return flash(`Necesitas ${cost} puntos gratuitos y no te quedan suficientes.`);
      t.f = nextF;
    }
    changed();
  }
  function setDerived(kind, n) {
    const ch = current;
    const field = kind === 'hum' ? 'humF' : 'wpF';
    const base = kind === 'hum' ? humanity(ch) - ch.humF : willpower(ch) - ch.wpF;
    const cur = base + ch[field];
    const target = Math.min(10, n === cur ? n - 1 : n);
    if (ch.phase === 'base') return flash(kind === 'hum' ? 'La Humanidad sale de Conciencia + Autocontrol. Súbela con puntos gratuitos.' : 'La Fuerza de Voluntad sale del Coraje. Súbela con puntos gratuitos.');
    const next = Math.max(0, target - base);
    const cost = (next - ch[field]) * COST[kind];
    if (cost > 0 && freebieSpent(ch) + cost > freebieBudget(ch)) return flash(`Necesitas ${cost} puntos gratuitos y no te quedan suficientes.`);
    ch[field] = next;
    changed();
  }
  function setClan(clan) {
    const ch = current;
    ch.clan = clan;
    const allowed = new Set(clanDisciplines(ch).map(([k]) => k));
    Object.keys(ch.disc).forEach(key => { if (!allowed.has(key)) delete ch.disc[key]; });
    if (clan === 'nosferatu') ch.attrs.apariencia = { b: 0, f: 0 };
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
    flashTimer = setTimeout(() => { node.hidden = true; }, 3800);
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
      const clan = CLANS[ch.clan]?.name || 'Sin clan';
      const done = isComplete(ch);
      return `<button class="vtm-card" data-open="${esc(ch.id)}"><span class="vtm-card-sigil">${esc((ch.name || '?').trim().charAt(0).toUpperCase() || '?')}</span><span class="vtm-card-copy"><b>${esc(ch.name || 'Vástago sin nombre')}</b><small>${esc(clan)} · ${generation(ch)}ª generación${ch.concept ? ' · ' + esc(ch.concept) : ''}</small></span><span class="vtm-badge ${done ? 'is-done' : ''}">${done ? 'COMPLETO' : 'EN CREACIÓN'}</span></button>`;
    }).join('') : '<div class="vtm-empty"><span>☩</span><b>La noche aún está vacía</b><small>Pulsa «Abrazar un nuevo vástago» para crear tu primer personaje.</small></div>';
    frame(`<p class="vtm-kicker">NEXO / VAMPIRO: LA MASCARADA · 20º ANIVERSARIO</p><h1>Tus <em>vástagos</em></h1><p class="vtm-intro">Crea personajes siguiendo las reglas de V20: prioridades de atributos y habilidades, disciplinas de clan, trasfondos, virtudes y 15 puntos gratuitos. Se guardan en este dispositivo.</p><div class="vtm-actions"><button class="vtm-button" data-new>✚ ABRAZAR UN NUEVO VÁSTAGO</button><button class="vtm-button ghost" data-exit>← VOLVER A SISTEMAS</button></div><div class="vtm-list">${cards}</div>`);
    host.querySelector('[data-new]').addEventListener('click', () => openEditor(newCharacter()));
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

  function openEditor(ch) {
    current = ch;
    const saved = store.characters.some(item => item.id === ch.id);
    const clanOptions = Object.entries(CLANS).map(([key, clan]) => `<option value="${key}" ${key === ch.clan ? 'selected' : ''}>${esc(clan.name)}</option>`).join('');
    frame(`<div class="vtm-editor-head"><button class="vtm-button ghost" data-back>← TUS VÁSTAGOS</button><button class="vtm-button danger" data-delete ${saved ? '' : 'hidden'}>ELIMINAR</button></div>
      <section class="vtm-panel"><h2><span>I</span> Concepto</h2><div class="vtm-fields">
        ${field('Nombre', 'name', { placeholder: 'Nombre del vástago' })}${field('Jugador', 'player')}${field('Crónica', 'chronicle')}
        ${field('Concepto', 'concept', { placeholder: 'Ej.: Detective caído en desgracia' })}${field('Naturaleza', 'nature', { list: 'vtmArchetypes' })}${field('Conducta', 'demeanor', { list: 'vtmArchetypes' })}
        <label class="vtm-field"><span>Clan</span><select data-clan>${clanOptions}</select></label>${field('Sire', 'sire')}${field('Secta', 'sect', { list: 'vtmSects' })}
      </div><datalist id="vtmArchetypes">${ARCHETYPES.map(a => `<option value="${esc(a)}">`).join('')}</datalist><datalist id="vtmSects"><option value="Camarilla"><option value="Sabbat"><option value="Anarquistas"><option value="Independiente"></datalist><p class="vtm-weak" data-weakness></p></section>
      <div data-sheet></div>
      <section class="vtm-panel"><h2><span>VII</span> Notas</h2><textarea class="vtm-notes" data-prop="notes" rows="5" placeholder="Historia, aspecto, refugio…">${esc(ch.notes)}</textarea></section>
      <div class="vtm-modal" data-modal hidden><div class="vtm-modal-card" role="alertdialog" aria-modal="true" aria-labelledby="vtmDelTitle"><h3 id="vtmDelTitle">¿Destruir a este vástago?</h3><p>La ficha se borrará de este dispositivo y no se podrá recuperar.</p><div class="vtm-actions"><button class="vtm-button ghost" data-cancel>CANCELAR</button><button class="vtm-button danger" data-confirm>ELIMINAR FICHA</button></div></div></div>`, saved ? 'GUARDADO EN ESTE DISPOSITIVO' : 'FICHA NUEVA · SIN GUARDAR');

    host.querySelector('[data-back]').addEventListener('click', renderList);
    host.querySelectorAll('[data-prop]').forEach(input => input.addEventListener('input', () => {
      current[input.dataset.prop] = input.value;
      scheduleSave();
      host.querySelector('[data-delete]').hidden = false;
    }));
    host.querySelector('[data-clan]').addEventListener('change', event => setClan(event.target.value));
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
    host.scrollTop = 0;
  }

  function dots(kind, key, label) {
    const ch = current;
    const t = trait(ch, kind, key);
    const min = minOf(ch, kind, key);
    const max = maxOf(ch, kind, key);
    let html = '';
    for (let i = 1; i <= 5; i += 1) {
      const cls = i <= min ? 'inn' : i <= min + t.b ? 'base' : i <= min + t.b + t.f ? 'free' : '';
      html += `<button class="vtm-dot ${cls}" data-dot="${kind}" data-key="${key}" data-n="${i}" ${i > max ? 'disabled' : ''} aria-label="${esc(label)} ${i}"></button>`;
    }
    return `<div class="vtm-trait"><span>${esc(label)}</span><span class="vtm-dots">${html}</span></div>`;
  }
  function track(kind, label, base, extra) {
    let html = '';
    for (let i = 1; i <= 10; i += 1) {
      const cls = i <= base ? 'base' : i <= base + extra ? 'free' : '';
      html += `<button class="vtm-dot ${cls}" data-track="${kind}" data-n="${i}" aria-label="${label} ${i}"></button>`;
    }
    return `<div class="vtm-track"><span>${label} <b>${base + extra}</b></span><span class="vtm-dots">${html}</span></div>`;
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

  function renderSheet() {
    const ch = current;
    const sheet = host?.querySelector('[data-sheet]');
    if (!ch || !sheet) return;
    const clan = CLANS[ch.clan] || CLANS.caitiff;
    host.querySelector('[data-weakness]').innerHTML = `<b>Debilidad del clan ${esc(clan.name)}:</b> ${esc(clan.weak)}`;
    const gen = generation(ch);
    const [blood, perTurn] = GENERATIONS[gen];
    const rows = summary(ch);
    const free = rows[rows.length - 1];
    const meritRows = ch.merits.map((m, i) => `<div class="vtm-merit"><select data-merit-type="${i}" aria-label="Tipo"><option value="merito" ${m.type === 'merito' ? 'selected' : ''}>Mérito</option><option value="defecto" ${m.type === 'defecto' ? 'selected' : ''}>Defecto</option></select><input data-merit-name="${i}" value="${esc(m.name)}" maxlength="60" placeholder="Nombre" aria-label="Nombre"><input data-merit-points="${i}" type="number" min="1" max="7" value="${esc(m.points)}" aria-label="Puntos"><button class="vtm-x" data-merit-del="${i}" aria-label="Quitar">×</button></div>`).join('');
    const flaws = ch.merits.filter(m => m.type === 'defecto').reduce((t, m) => t + (Number(m.points) || 0), 0);

    sheet.innerHTML = `
      <section class="vtm-tracker">
        <div class="vtm-phase" role="tablist" aria-label="Fase de creación"><button role="tab" aria-selected="${ch.phase === 'base'}" data-phase="base">1 · Reparto inicial</button><button role="tab" aria-selected="${ch.phase === 'freebie'}" data-phase="freebie">2 · Puntos gratuitos <b>${free.left}</b></button></div>
        <p class="vtm-phase-help">${ch.phase === 'base' ? 'Reparte los puntos de cada grupo. Las habilidades no pueden pasar de 3 en esta fase.' : 'Cada punto cuesta: atributo 5 · habilidad 2 · disciplina 7 · trasfondo 1 · virtud 2 · Humanidad 2 · Voluntad 1.'}</p>
        <ul class="vtm-pools">${rows.map(r => `<li class="${r.left === 0 ? 'is-done' : r.left < 0 ? 'is-over' : ''}${r.freebie ? ' is-free' : ''}"><span>${r.label}</span><b>${r.left < 0 ? '+' + (-r.left) : r.left}</b><small>/ ${r.budget}</small></li>`).join('')}</ul>
        <p class="vtm-legend"><i class="vtm-dot inn"></i> Base <i class="vtm-dot base"></i> Reparto inicial <i class="vtm-dot free"></i> Puntos gratuitos</p>
      </section>
      <section class="vtm-panel"><h2><span>II</span> Atributos <small>7 / 5 / 3</small></h2><div class="vtm-cols">${ATTRS.map(g => `<div class="vtm-col"><div class="vtm-col-head"><h3>${g.label}</h3>${prioSelect('attrs', g)}${left('attrs', g.traits[0][0])}</div>${g.traits.map(([k, l]) => dots('attrs', k, l)).join('')}</div>`).join('')}</div></section>
      <section class="vtm-panel"><h2><span>III</span> Habilidades <small>13 / 9 / 5</small></h2><div class="vtm-cols">${ABILS.map(g => `<div class="vtm-col"><div class="vtm-col-head"><h3>${g.label}</h3>${prioSelect('abil', g)}${left('abil', g.traits[0][0])}</div>${g.traits.map(([k, l]) => dots('abil', k, l)).join('')}</div>`).join('')}</div></section>
      <section class="vtm-panel"><h2><span>IV</span> Ventajas</h2><div class="vtm-cols">
        <div class="vtm-col"><div class="vtm-col-head"><h3>Disciplinas</h3><span class="vtm-note">3 puntos${ch.clan === 'caitiff' ? ' · libres' : ' · de clan'}</span>${left('disc')}</div>${clanDisciplines(ch).map(([k, l]) => dots('disc', k, l)).join('')}</div>
        <div class="vtm-col"><div class="vtm-col-head"><h3>Trasfondos</h3><span class="vtm-note">5 puntos</span>${left('bg')}</div>${BACKGROUNDS.map(([k, l]) => dots('bg', k, l)).join('')}</div>
        <div class="vtm-col"><div class="vtm-col-head"><h3>Virtudes</h3><span class="vtm-note">7 puntos</span>${left('virt')}</div>${VIRTUES.map(([k, l]) => dots('virt', k, l)).join('')}
          <div class="vtm-derived">${track('hum', 'Humanidad', humanity(ch) - ch.humF, ch.humF)}${track('wp', 'Fuerza de Voluntad', willpower(ch) - ch.wpF, ch.wpF)}</div></div>
      </div></section>
      <section class="vtm-panel"><h2><span>V</span> Méritos y defectos</h2><p class="vtm-note">Los méritos se pagan con puntos gratuitos. Los defectos dan puntos extra, hasta un máximo de ${FLAW_CAP} (llevas ${Math.min(flaws, FLAW_CAP)}${flaws > FLAW_CAP ? ', el resto no cuenta' : ''}).</p><div class="vtm-merits">${meritRows}</div><button class="vtm-button ghost" data-merit-add>✚ AÑADIR MÉRITO O DEFECTO</button></section>
      <section class="vtm-panel"><h2><span>VI</span> La sangre</h2><div class="vtm-stats">
        <div><small>Generación</small><b>${gen}ª</b></div><div><small>Reserva de sangre máx.</small><b>${blood}</b></div><div><small>Sangre por turno</small><b>${perTurn}</b></div><div><small>Humanidad</small><b>${humanity(ch)}</b></div><div><small>Fuerza de Voluntad</small><b>${willpower(ch)}</b></div>
      </div><div class="vtm-blood" aria-label="Reserva de sangre máxima: ${blood}">${'<i></i>'.repeat(blood)}</div><p class="vtm-note">La reserva inicial se determina tirando un dado de diez caras. Sube el trasfondo Generación para bajar de la 13ª.</p></section>`;

    sheet.querySelectorAll('[data-dot]').forEach(button => button.addEventListener('click', () => setDot(button.dataset.dot, button.dataset.key, Number(button.dataset.n))));
    sheet.querySelectorAll('[data-track]').forEach(button => button.addEventListener('click', () => setDerived(button.dataset.track, Number(button.dataset.n))));
    sheet.querySelectorAll('[data-phase]').forEach(button => button.addEventListener('click', () => {
      ch.phase = button.dataset.phase;
      if (store.characters.some(item => item.id === ch.id)) scheduleSave();
      renderSheet();
    }));
    sheet.querySelectorAll('[data-prio]').forEach(select => select.addEventListener('change', () => setPriority(select.dataset.prio, select.dataset.group, Number(select.value))));
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
    if (host.querySelector('[data-delete]') && store.characters.some(item => item.id === ch.id)) host.querySelector('[data-delete]').hidden = false;
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
    stylesheet.href = './vampire.css?v=1';
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
