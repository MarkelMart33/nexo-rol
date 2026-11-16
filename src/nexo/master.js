/*
 * NEXO · Máster: herramientas de quien dirige, dentro de cada campaña.
 *   combate     lista de iniciativa con rondas y turnos, según las reglas de cada sistema
 *   pnj         personajes no jugadores de la campaña, con sus cifras rápidas
 *   generador   nombres, PNJ al vuelo, ganchos y lugares (tablas en master-datos.js)
 * Los datos viven en el objeto que diga quien lo monta (la campaña, o la partida de Traveller):
 *   { npcs: [{ id, name, role, hp, def, init, notes }], combat: { on, round, turn, rows: [...] } }
 * Los resultados de los generadores no se guardan: solo lo que se manda a las notas o a los PNJ.
 */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const int = (value, fallback = 0) => { const n = Math.trunc(Number(String(value ?? '').trim().replace('−', '-'))); return Number.isFinite(n) ? n : fallback; };
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const signed = n => (n < 0 ? `−${-n}` : `+${n}`);
  const text = (value, max) => (typeof value === 'string' || typeof value === 'number' ? String(value) : '').slice(0, max);
  const uid = () => crypto.randomUUID?.() || `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  const okId = id => (typeof id === 'string' && /^[\w-]{1,64}$/.test(id) ? id : uid());
  const die = sides => (window.NEXO_DICE?.die ? window.NEXO_DICE.die(sides) : 1 + Math.floor(Math.random() * sides));
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  // Cómo se ordena un combate en cada sistema y cómo llama a las cifras rápidas de un PNJ.
  const VAMPIRE = { hp: 'Salud', hpStart: 7, def: 'Absorción', init: { label: 'Des + Ast', short: 'Inic.', dice: [10] }, how: 'Cada uno tira 1d10 y suma Destreza + Astucia; las heridas restan su penalización. Actúa primero el resultado más alto.' };
  const SYSTEMS = {
    dnd: { pack: 'fantasia', hp: 'PG', def: 'CA', init: { label: 'Iniciativa', short: 'Inic.', dice: [20] }, how: 'Cada uno tira d20 y suma su iniciativa. Si hay empate, quien dirige ordena a los enemigos y los jugadores se ordenan entre ellos.' },
    pathfinder: { pack: 'fantasia', hp: 'PG', def: 'CA', init: { label: 'Percepción', short: 'Inic.', dice: [20], foesFirst: true }, how: 'Cada uno tira d20 y suma Percepción (u otra habilidad si la escena lo pide). Si hay empate, el enemigo va antes.' },
    'vampiro-v20': { pack: 'noche', ...VAMPIRE },
    'vampiro-da': { pack: 'medievo', ...VAMPIRE },
    cthulhu: { pack: 'veinte', hp: 'PV', def: 'Esquivar', init: { label: 'DES', short: 'DES', dice: [] }, how: 'No se tira: se actúa por orden de DES, de mayor a menor. Quien tiene un arma de fuego ya preparada suma 50 a su DES para el orden.' },
    tormentas: { pack: 'roshar', hp: 'Salud', def: 'Defensa', init: null, how: 'Cada ronda, cada uno elige turno rápido (2 acciones) o lento (3 acciones). Actúan primero los personajes rápidos, luego los enemigos rápidos, después los personajes lentos y al final los enemigos lentos.' },
    traveller: { pack: 'espacio', hp: 'Aguante', def: 'Armadura', init: { label: 'MD', short: 'Inic.', dice: [6, 6] }, how: 'Cada uno tira 2D y suma su MD de Destreza o de Intelecto. Actúa primero el total más alto; si hay empate, quien tenga más Destreza.' }
  };
  const KINDS = { pj: 'PJ', pnj: 'PNJ', otro: 'Otro' };

  // Lo guardado puede venir de un archivo o de otra versión: se rehace siempre con tipos sanos.
  function clean(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const npcs = (Array.isArray(src.npcs) ? src.npcs : []).filter(n => n && typeof n === 'object').slice(0, 200).map(n => ({
      id: okId(n.id), name: text(n.name, 60), role: text(n.role, 80), hp: clamp(int(n.hp), 0, 9999), def: text(n.def, 16),
      init: clamp(int(n.init), -99, 999), notes: text(n.notes, 3000)
    }));
    const c = src.combat && typeof src.combat === 'object' && !Array.isArray(src.combat) ? src.combat : {};
    const rows = (Array.isArray(c.rows) ? c.rows : []).filter(r => r && typeof r === 'object').slice(0, 80).map(r => ({
      id: okId(r.id), name: text(r.name, 60), kind: KINDS[r.kind] ? r.kind : 'otro', ref: text(r.ref, 64),
      mod: clamp(int(r.mod), -99, 999), init: r.init === null || r.init === undefined || r.init === '' ? null : clamp(int(r.init), -99, 9999), die: clamp(int(r.die), 0, 999),
      hp: clamp(int(r.hp), 0, 9999), max: clamp(int(r.max), 0, 9999), note: text(r.note, 120), out: Boolean(r.out), fast: Boolean(r.fast)
    }));
    return { npcs, combat: { on: Boolean(c.on), round: clamp(int(c.round, 1), 1, 999), turn: rows.some(r => r.id === c.turn) ? c.turn : '', rows } };
  }

  // Resumen para las baldosas del inicio de campaña: [id, nombre, detalle].
  function tools(data) {
    const d = data || {};
    const rows = d.combat?.rows?.length || 0;
    const npcs = d.npcs?.length || 0;
    return [
      ['combate', 'Combate', d.combat?.on ? `Ronda ${d.combat.round}` : rows ? plural(rows, 'en la lista', 'en la lista') : 'Iniciativa y turnos'],
      ['pnj', 'PNJ', npcs ? plural(npcs, 'guardado', 'guardados') : 'Aliados y enemigos'],
      ['generador', 'Generadores', 'Nombres, PNJ y ganchos']
    ];
  }

  const results = new Map();   // resultados de los generadores, por campaña, mientras la app sigue abierta
  document.addEventListener('nexo:signed-out', () => results.clear());
  const NAMES = { combate: 'Combate', pnj: 'PNJ', generador: 'Generadores' };

  /*
   * ctx: {
   *   system: 'dnd' | 'pathfinder' | 'vampiro-v20' | 'vampiro-da' | 'tormentas' | 'cthulhu' | 'traveller',
   *   prefix: 'dnd',                      clases de estilo del sistema (dnd-panel…) y paleta ap-dnd
   *   id: 'id de la campaña',             para recordar los resultados de los generadores
   *   data: objeto con npcs y combat,     se cambia en el sitio
   *   save: () => void,
   *   party: () => [{ id, name, init }],  personajes de la campaña (init: su modificador, si la ficha lo sabe)
   *   note: (título, texto) => mensaje    manda un texto a las notas de la campaña
   * }
   */
  function mount(tool, node, ctx) {
    const sys = SYSTEMS[ctx.system] || SYSTEMS.dnd;
    const p = ctx.prefix;
    const d = ctx.data;
    if (!Array.isArray(d.npcs) || !d.combat || !Array.isArray(d.combat.rows)) Object.assign(d, clean(d));
    const pack = window.NEXO_MASTER_DATOS?.packs?.[sys.pack] || null;
    let flash = '';
    let asking = '';
    const open = new Set();
    const shown = results.get(ctx.id) || [];
    results.set(ctx.id, shown);

    // ── Combate
    function ordered(rows) {
      const at = new Map(rows.map((r, i) => [r.id, i]));
      if (!sys.init) {
        const phase = r => (r.fast ? 0 : 2) + (r.kind === 'pj' ? 0 : 1);
        return [...rows].sort((a, b) => phase(a) - phase(b) || at.get(a.id) - at.get(b.id));
      }
      return [...rows].sort((a, b) => (b.init ?? -1e6) - (a.init ?? -1e6) || (sys.init.foesFirst ? (a.kind === 'pj') - (b.kind === 'pj') : 0) || b.mod - a.mod || at.get(a.id) - at.get(b.id));
    }
    function rollFor(r) {
      const dice = sys.init.dice.map(die);
      r.die = dice.reduce((sum, n) => sum + n, 0);
      r.init = r.die + r.mod;
    }
    function step(dir) {
      const cb = d.combat;
      const all = ordered(cb.rows);
      if (!all.some(r => !r.out)) return;
      let i = all.findIndex(r => r.id === cb.turn);
      if (i < 0) i = dir > 0 ? -1 : 0;
      let round = cb.round;
      for (let k = 0; k < all.length; k++) {
        i += dir;
        if (i >= all.length) { i = 0; round = Math.min(999, round + 1); }
        if (i < 0) { if (round <= 1) return; round -= 1; i = all.length - 1; }
        if (!all[i].out) { cb.turn = all[i].id; cb.round = round; return; }
      }
    }
    function addRows(base, count) {
      const cb = d.combat;
      const room = 80 - cb.rows.length;
      const n = clamp(count, 1, Math.min(12, room));
      if (room < 1) { flash = 'La lista está llena: quita a alguien antes de añadir más.'; return 0; }
      const taken = name => cb.rows.some(r => r.name === name);
      let number = 1;
      for (let i = 0; i < n; i++) {
        let name = base.name || 'Sin nombre';
        if (n > 1 || taken(name)) { while (taken(`${base.name || 'Sin nombre'} ${number}`)) number += 1; name = `${base.name || 'Sin nombre'} ${number}`; }
        cb.rows.push({ id: uid(), name: name.slice(0, 60), kind: base.kind, ref: base.ref || '', mod: base.mod || 0, init: null, die: 0, hp: base.hp || 0, max: base.hp || 0, note: base.note || '', out: false, fast: false });
      }
      return n;
    }
    function rowHtml(r, n, cb) {
      const turn = cb.on && r.id === cb.turn;
      const rolled = sys.init && r.init !== null && r.die ? `${sys.init.dice.length > 1 ? `${sys.init.dice.length}D` : `d${sys.init.dice[0]}`} ${r.die} ${signed(r.mod)}` : '';
      const order = sys.init
        ? `<label class="nm-init"><span>${esc(sys.init.short)}</span><input inputmode="numeric" maxlength="4" value="${r.init ?? ''}" placeholder="—" data-nm-init="${esc(r.id)}" data-nm-key="i:${esc(r.id)}" aria-label="${esc(sys.init.label)} de ${esc(r.name)}"></label>`
        : `<button type="button" class="nm-speed ${r.fast ? 'is-on' : ''}" data-nm-fast="${esc(r.id)}" data-nm-key="f:${esc(r.id)}" aria-pressed="${r.fast}" title="Cambiar entre turno rápido y lento">${r.fast ? 'RÁPIDO' : 'LENTO'}</button>`;
      const hp = r.max
        ? `<span class="nm-hp ${r.hp === 0 ? 'is-zero' : ''}"><button type="button" data-nm-hp="${esc(r.id)}" data-d="-1" data-nm-key="h-:${esc(r.id)}" aria-label="Quitar 1 de ${esc(sys.hp)} a ${esc(r.name)}">−</button><input inputmode="numeric" maxlength="5" value="${r.hp}" data-nm-hpset="${esc(r.id)}" data-nm-key="h:${esc(r.id)}" aria-label="${esc(sys.hp)} de ${esc(r.name)}; escribe −7 o +5 para restar o sumar"><small>/ ${r.max} ${esc(sys.hp)}</small><button type="button" data-nm-hp="${esc(r.id)}" data-d="1" data-nm-key="h+:${esc(r.id)}" aria-label="Sumar 1 de ${esc(sys.hp)} a ${esc(r.name)}">+</button></span>`
        : '';
      return `<li class="nm-row nm-${r.kind} ${turn ? 'is-turn' : ''} ${r.out ? 'is-out' : ''}">
        <button type="button" class="nm-turn" data-nm-turn="${esc(r.id)}" data-nm-key="t:${esc(r.id)}" ${turn ? 'aria-current="true"' : ''} aria-label="${turn ? `Turno de ${esc(r.name)}` : `Dar el turno a ${esc(r.name)}`}" title="${turn ? 'Tiene el turno' : 'Dar el turno'}">${turn ? '▶' : n}</button>
        <span class="nm-who"><b>${esc(r.name)}</b><small>${KINDS[r.kind]}${rolled ? ` · ${esc(rolled)}` : ''}${r.out ? ' · fuera de combate' : ''}</small></span>
        ${order}${hp}
        <input class="nm-note" maxlength="120" value="${esc(r.note)}" placeholder="Estados y apuntes" data-nm-note="${esc(r.id)}" data-nm-key="n:${esc(r.id)}" aria-label="Apuntes de ${esc(r.name)}">
        <span class="nm-ends"><button type="button" class="nm-mini ${r.out ? 'is-on' : ''}" data-nm-out="${esc(r.id)}" data-nm-key="o:${esc(r.id)}" aria-pressed="${r.out}">${r.out ? 'VUELVE' : 'CAE'}</button><button type="button" class="nm-x" data-nm-del="${esc(r.id)}" data-nm-key="x:${esc(r.id)}" aria-label="Quitar a ${esc(r.name)} de la lista">×</button></span>
      </li>`;
    }
    function combatHtml() {
      const cb = d.combat;
      const rows = ordered(cb.rows);
      const now = rows.find(r => r.id === cb.turn);
      const party = ctx.party();
      const missing = party.filter(ch => !cb.rows.some(r => r.kind === 'pj' && r.ref === ch.id));
      const lacking = sys.init ? cb.rows.filter(r => r.init === null).length : 0;
      const state = cb.on
        ? `<b>Ronda ${cb.round}</b>${now ? ` · turno de <b>${esc(now.name)}</b>` : ''}`
        : rows.length ? 'Preparando el combate' : 'Nadie en la lista todavía';
      const rollLabel = sys.init?.dice.length ? 'TIRAR LAS QUE FALTAN' : 'ORDENAR POR DES';
      const modLabel = sys.init ? sys.init.label : '';
      return `<section class="${p}-panel nm-panel ap-${p}">
        <h2>Combate</h2><p class="nm-how">${esc(sys.how)}</p>
        <div class="nm-bar"><p class="nm-state" role="status">${state}</p>
          ${cb.on ? `<button type="button" class="nm-btn" data-nm-step="-1" data-nm-key="prev" ${cb.round === 1 && rows.filter(r => !r.out)[0]?.id === cb.turn ? 'disabled' : ''}>◀ ANTERIOR</button><button type="button" class="nm-btn is-main" data-nm-step="1" data-nm-key="next">SIGUIENTE TURNO ▶</button>`
    : `<button type="button" class="nm-btn is-main" data-nm-start data-nm-key="start" ${rows.length ? '' : 'disabled'}>EMPEZAR EL COMBATE</button>`}
        </div>
        ${flash ? `<p class="nm-flash" role="status">${esc(flash)}</p>` : ''}
        ${rows.length ? `<ol class="nm-rows">${rows.map((r, i) => rowHtml(r, i + 1, cb)).join('')}</ol>` : `<p class="nm-none">Añade a los personajes de la campaña, a tus PNJ guardados o a cualquier otro combatiente.</p>`}
        ${rows.length ? `<div class="nm-actions">
          ${sys.init ? `<button type="button" class="nm-btn" data-nm-roll="missing" data-nm-key="roll" ${lacking ? '' : 'disabled'}>${rollLabel}${lacking ? ` (${lacking})` : ''}</button>${sys.init.dice.length ? '<button type="button" class="nm-btn" data-nm-roll="all" data-nm-key="rollall">TIRAR TODAS</button>' : ''}` : ''}
          ${cb.on ? '<button type="button" class="nm-btn" data-nm-end data-nm-key="end">TERMINAR EL COMBATE</button>' : ''}
          <button type="button" class="nm-btn ${asking === 'clear' ? 'is-sure' : ''}" data-nm-clear data-nm-key="clear">${asking === 'clear' ? '¿VACIAR? PULSA OTRA VEZ' : 'VACIAR LA LISTA'}</button>
        </div>` : ''}
        <div class="nm-add">
          <h3>Añadir a la lista</h3>
          ${missing.length ? `<button type="button" class="nm-btn" data-nm-party data-nm-key="party">＋ ${missing.length === party.length ? 'LOS PERSONAJES DE LA CAMPAÑA' : plural(missing.length, 'PERSONAJE QUE FALTA', 'PERSONAJES QUE FALTAN')}</button>` : party.length ? '' : `<p class="nm-none">Marca a los personajes de la campaña para añadirlos aquí de un toque.</p>`}
          ${d.npcs.length ? `<form class="nm-form" data-nm-addnpc><label><span>PNJ guardado</span><select name="npc" data-nm-key="addnpc">${d.npcs.map(n => `<option value="${esc(n.id)}">${esc(n.name || 'Sin nombre')}${n.role ? ` · ${esc(n.role)}` : ''}</option>`).join('')}</select></label><label class="nm-short"><span>Cuántos</span><input name="count" inputmode="numeric" maxlength="2" value="1" data-nm-key="addnpc-n"></label><button type="submit" class="nm-btn" data-nm-key="addnpc-go">＋ AÑADIR</button></form>` : ''}
          <form class="nm-form" data-nm-addother><label><span>Otro combatiente</span><input name="name" maxlength="60" required placeholder="Bandido, lobo, guardia…" data-nm-key="other"></label>${sys.init ? `<label class="nm-short"><span>${esc(modLabel)}</span><input name="mod" inputmode="numeric" maxlength="4" placeholder="0" data-nm-key="other-m"></label>` : ''}<label class="nm-short"><span>${esc(sys.hp)}</span><input name="hp" inputmode="numeric" maxlength="4" placeholder="—" data-nm-key="other-h"></label><label class="nm-short"><span>Cuántos</span><input name="count" inputmode="numeric" maxlength="2" value="1" data-nm-key="other-n"></label><button type="submit" class="nm-btn" data-nm-key="other-go">＋ AÑADIR</button></form>
        </div>
      </section>`;
    }
    function bindCombat() {
      const cb = d.combat;
      const row = id => cb.rows.find(r => r.id === id);
      on('[data-nm-start]', 'click', () => {
        // Al empezar, quien no tenga iniciativa y no sea un personaje la recibe sola; los jugadores dicen la suya.
        if (sys.init) cb.rows.forEach(r => { if (r.init === null && (r.kind !== 'pj' || !sys.init.dice.length)) rollFor(r); });
        cb.on = true; cb.round = 1;
        cb.turn = ordered(cb.rows).find(r => !r.out)?.id || '';
        const lack = sys.init ? cb.rows.filter(r => r.init === null).length : 0;
        commit(lack ? `Falta la iniciativa de ${plural(lack, 'personaje', 'personajes')}: escríbela o pulsa «Tirar las que faltan».` : '');
      });
      on('[data-nm-step]', 'click', node => { step(Number(node.dataset.nmStep)); commit(); });
      on('[data-nm-turn]', 'click', node => { cb.turn = node.dataset.nmTurn; if (!cb.on) { cb.on = true; cb.round = 1; } commit(); });
      on('[data-nm-roll]', 'click', node => {
        const all = node.dataset.nmRoll === 'all';
        let n = 0;
        cb.rows.forEach(r => { if (all || r.init === null) { rollFor(r); n += 1; } });
        if (cb.on && !row(cb.turn)) cb.turn = ordered(cb.rows).find(r => !r.out)?.id || '';
        commit(sys.init.dice.length ? `Iniciativa tirada para ${plural(n, 'combatiente', 'combatientes')}.` : 'Ordenados por DES.');
      });
      on('[data-nm-end]', 'click', () => {
        cb.on = false; cb.round = 1; cb.turn = '';
        cb.rows.forEach(r => { r.init = null; r.die = 0; });
        commit('Combate terminado. La lista se queda por si la necesitas; vacíala cuando quieras.');
      });
      on('[data-nm-clear]', 'click', () => {
        if (asking !== 'clear') { asking = 'clear'; paint(); return; }
        cb.rows = []; cb.on = false; cb.round = 1; cb.turn = '';
        commit('Lista vacía.');
      });
      on('[data-nm-init]', 'change', node => {
        const r = row(node.dataset.nmInit);
        if (!r) return;
        r.init = node.value.trim() === '' ? null : clamp(int(node.value), -99, 9999);
        r.die = 0;
        commit();
      });
      on('[data-nm-fast]', 'click', node => { const r = row(node.dataset.nmFast); if (r) { r.fast = !r.fast; commit(); } });
      const hurt = (r, value) => {
        const was = r.hp;
        r.hp = clamp(value, 0, 9999);
        if (r.hp === 0 && was > 0 && !r.out) { r.out = true; return `${r.name} cae.`; }
        return '';
      };
      on('[data-nm-hp]', 'click', node => { const r = row(node.dataset.nmHp); if (r) commit(hurt(r, r.hp + Number(node.dataset.d))); });
      on('[data-nm-hpset]', 'change', node => {
        const r = row(node.dataset.nmHpset);
        if (!r) return;
        const typed = node.value.trim().replace('−', '-');
        if (typed === '' || !Number.isFinite(Number(typed))) { commit(); return; }
        commit(hurt(r, /^[+-]/.test(typed) ? r.hp + int(typed) : int(typed)));
      });
      on('[data-nm-hpset]', 'keydown', (node, event) => { if (event.key === 'Enter') node.blur(); });
      on('[data-nm-init]', 'keydown', (node, event) => { if (event.key === 'Enter') node.blur(); });
      on('[data-nm-note]', 'input', node => { const r = row(node.dataset.nmNote); if (r) { r.note = node.value.slice(0, 120); ctx.save(); } });
      on('[data-nm-out]', 'click', node => {
        const r = row(node.dataset.nmOut);
        if (!r) return;
        r.out = !r.out;
        if (r.out && cb.on && cb.turn === r.id) step(1);
        commit();
      });
      on('[data-nm-del]', 'click', node => {
        const r = row(node.dataset.nmDel);
        if (!r) return;
        if (cb.on && cb.turn === r.id) { step(1); if (cb.turn === r.id) cb.turn = ''; }
        cb.rows = cb.rows.filter(x => x.id !== r.id);
        if (!cb.rows.length) { cb.on = false; cb.round = 1; cb.turn = ''; }
        commit();
      });
      on('[data-nm-party]', 'click', () => {
        let n = 0;
        ctx.party().forEach(ch => {
          if (cb.rows.some(r => r.kind === 'pj' && r.ref === ch.id) || cb.rows.length >= 80) return;
          cb.rows.push({ id: uid(), name: text(ch.name || 'Sin nombre', 60), kind: 'pj', ref: ch.id, mod: clamp(int(ch.init), -99, 999), init: null, die: 0, hp: 0, max: 0, note: '', out: false, fast: false });
          n += 1;
        });
        commit(n ? `${plural(n, 'personaje añadido', 'personajes añadidos')}.` : '');
      });
      on('[data-nm-addnpc]', 'submit', (form, event) => {
        event.preventDefault();
        const npc = d.npcs.find(n => n.id === form.elements.npc.value);
        if (!npc) return;
        const n = addRows({ name: npc.name, kind: 'pnj', ref: npc.id, mod: npc.init, hp: npc.hp, note: npc.def ? `${sys.def} ${npc.def}` : '' }, int(form.elements.count.value, 1));
        commit(n ? `${npc.name || 'PNJ'}: ${plural(n, 'añadido', 'añadidos')}.` : flash);
      });
      on('[data-nm-addother]', 'submit', (form, event) => {
        event.preventDefault();
        const name = form.elements.name.value.trim();
        if (!name) return;
        const n = addRows({ name, kind: 'otro', mod: clamp(int(form.elements.mod?.value), -99, 999), hp: clamp(int(form.elements.hp.value), 0, 9999) }, int(form.elements.count.value, 1));
        commit(n ? `${name}: ${plural(n, 'añadido', 'añadidos')}.` : flash);
      });
    }

    // ── PNJ
    const npcLine = n => [n.role, n.hp ? `${sys.hp} ${n.hp}` : '', n.def ? `${sys.def} ${n.def}` : ''].filter(Boolean).join(' · ');
    function npcHtml() {
      const cards = d.npcs.map(n => `<details class="nm-npc" data-nm-open="${esc(n.id)}" ${open.has(n.id) ? 'open' : ''}>
          <summary data-nm-key="s:${esc(n.id)}"><b data-nm-title>${esc(n.name || 'PNJ sin nombre')}</b><small data-nm-line>${esc(npcLine(n))}</small></summary>
          <div class="nm-fields">
            <label><span>Nombre</span><input maxlength="60" value="${esc(n.name)}" data-nm-npc="${esc(n.id)}" data-k="name" data-nm-key="name:${esc(n.id)}" autocomplete="off"></label>
            <label><span>Quién es</span><input maxlength="80" value="${esc(n.role)}" data-nm-npc="${esc(n.id)}" data-k="role" data-nm-key="role:${esc(n.id)}" placeholder="Posadera, capitán de la guardia, rival…" autocomplete="off"></label>
            <label class="nm-short"><span>${esc(sys.hp)}</span><input inputmode="numeric" maxlength="4" value="${n.hp || ''}" data-nm-npc="${esc(n.id)}" data-k="hp" data-nm-key="hp:${esc(n.id)}"></label>
            <label class="nm-short"><span>${esc(sys.def)}</span><input maxlength="16" value="${esc(n.def)}" data-nm-npc="${esc(n.id)}" data-k="def" data-nm-key="def:${esc(n.id)}"></label>
            ${sys.init ? `<label class="nm-short"><span>${esc(sys.init.label)}</span><input inputmode="numeric" maxlength="4" value="${n.init || ''}" placeholder="0" data-nm-npc="${esc(n.id)}" data-k="init" data-nm-key="init:${esc(n.id)}"></label>` : ''}
            <label class="nm-wide"><span>Rasgos y notas</span><textarea rows="4" maxlength="3000" data-nm-npc="${esc(n.id)}" data-k="notes" data-nm-key="notes:${esc(n.id)}" placeholder="Aspecto, forma de hablar, qué quiere, ataques, lo que sabe…">${esc(n.notes)}</textarea></label>
          </div>
          <div class="nm-actions"><button type="button" class="nm-btn" data-nm-fight="${esc(n.id)}" data-nm-key="fight:${esc(n.id)}">AL COMBATE</button><button type="button" class="nm-btn" data-nm-dup="${esc(n.id)}" data-nm-key="dup:${esc(n.id)}">DUPLICAR</button><button type="button" class="nm-btn ${asking === n.id ? 'is-sure' : ''}" data-nm-delnpc="${esc(n.id)}" data-nm-key="del:${esc(n.id)}">${asking === n.id ? '¿BORRAR? PULSA OTRA VEZ' : 'BORRAR'}</button></div>
        </details>`).join('');
      return `<section class="${p}-panel nm-panel ap-${p}">
        <h2>PNJ de la campaña <small>${d.npcs.length}</small></h2>
        <p class="nm-how">Aliados, rivales y criaturas con sus cifras rápidas. Desde aquí pasan a la lista de combate.</p>
        <div class="nm-actions"><button type="button" class="nm-btn is-main" data-nm-new data-nm-key="new">＋ NUEVO PNJ</button></div>
        ${flash ? `<p class="nm-flash" role="status">${esc(flash)}</p>` : ''}
        ${cards || '<p class="nm-none">Aún no hay PNJ. Crea uno aquí o guarda los que te salgan en los generadores.</p>'}
      </section>`;
    }
    function bindNpcs() {
      const npc = id => d.npcs.find(n => n.id === id);
      on('[data-nm-open]', 'toggle', node => { if (node.open) open.add(node.dataset.nmOpen); else open.delete(node.dataset.nmOpen); });
      on('[data-nm-new]', 'click', () => {
        if (d.npcs.length >= 200) { commit('Ya hay muchos PNJ: borra alguno antes de añadir otro.'); return; }
        const n = { id: uid(), name: '', role: '', hp: sys.hpStart || 0, def: '', init: 0, notes: '' };
        d.npcs.unshift(n);
        open.add(n.id);
        commit();
        node.querySelector(`[data-nm-key="name:${n.id}"]`)?.focus();
      });
      on('[data-nm-npc]', 'input', input => {
        const n = npc(input.dataset.nmNpc);
        if (!n) return;
        const k = input.dataset.k;
        if (k === 'hp') n.hp = clamp(int(input.value), 0, 9999);
        else if (k === 'init') n.init = clamp(int(input.value), -99, 999);
        else n[k] = input.value.slice(0, k === 'notes' ? 3000 : k === 'role' ? 80 : k === 'def' ? 16 : 60);
        const card = input.closest('.nm-npc');
        card.querySelector('[data-nm-title]').textContent = n.name || 'PNJ sin nombre';
        card.querySelector('[data-nm-line]').textContent = npcLine(n);
        ctx.save();
      });
      on('[data-nm-fight]', 'click', node => {
        const n = npc(node.dataset.nmFight);
        if (!n) return;
        const added = addRows({ name: n.name, kind: 'pnj', ref: n.id, mod: n.init, hp: n.hp, note: n.def ? `${sys.def} ${n.def}` : '' }, 1);
        commit(added ? `${n.name || 'PNJ'} ya está en la lista de combate.` : flash);
      });
      on('[data-nm-dup]', 'click', node => {
        const n = npc(node.dataset.nmDup);
        if (!n || d.npcs.length >= 200) return;
        const copy = { ...n, id: uid(), name: `${n.name || 'PNJ'} (copia)`.slice(0, 60) };
        d.npcs.splice(d.npcs.indexOf(n) + 1, 0, copy);
        open.add(copy.id);
        commit();
      });
      on('[data-nm-delnpc]', 'click', node => {
        const id = node.dataset.nmDelnpc;
        if (asking !== id) { asking = id; paint(); return; }
        d.npcs = d.npcs.filter(n => n.id !== id);
        open.delete(id);
        commit('PNJ borrado.');
      });
    }

    // ── Generadores
    function genHtml() {
      if (!pack) return `<section class="${p}-panel nm-panel ap-${p}"><h2>Generadores</h2><p class="nm-none">Los generadores no están disponibles ahora mismo.</p></section>`;
      const cards = shown.map(r => `<li class="nm-result"><p class="nm-kind">${esc(r.kind)}</p><h3>${esc(r.title)}</h3>${r.lines.map(line => `<p>${esc(line)}</p>`).join('')}
          <div class="nm-actions">${r.npc ? `<button type="button" class="nm-btn" data-nm-keep="${esc(r.id)}" data-nm-key="keep:${esc(r.id)}" ${r.kept ? 'disabled' : ''}>${r.kept ? '✓ EN TUS PNJ' : 'GUARDAR COMO PNJ'}</button>` : ''}<button type="button" class="nm-btn" data-nm-tonote="${esc(r.id)}" data-nm-key="note:${esc(r.id)}" ${r.noted ? 'disabled' : ''}>${r.noted ? '✓ EN LAS NOTAS' : 'A LAS NOTAS'}</button><button type="button" class="nm-x" data-nm-drop="${esc(r.id)}" data-nm-key="drop:${esc(r.id)}" aria-label="Descartar">×</button></div></li>`).join('');
      return `<section class="${p}-panel nm-panel ap-${p}">
        <h2>Generadores</h2><p class="nm-how">Ideas rápidas para improvisar. Lo que te sirva, guárdalo como PNJ o mándalo a las notas; lo demás se pierde al salir.</p>
        <div class="nm-gens">
          <form class="nm-form" data-nm-gen="nombre"><label><span>Nombre</span><select name="group" data-nm-key="g-group">${pack.names.map(g => `<option value="${esc(g.id)}">${esc(g.label)}</option>`).join('')}</select></label><button type="submit" class="nm-btn" data-nm-key="g-nombre">NOMBRES</button></form>
          <div class="nm-actions">
            <button type="button" class="nm-btn is-main" data-nm-gen="pnj" data-nm-key="g-pnj">PNJ AL VUELO</button>
            <button type="button" class="nm-btn" data-nm-gen="gancho" data-nm-key="g-gancho">GANCHO DE AVENTURA</button>
            <button type="button" class="nm-btn" data-nm-gen="lugar" data-nm-key="g-lugar">${esc(pack.place.label)}</button>
            ${pack.extra.map(x => `<button type="button" class="nm-btn" data-nm-gen="x:${esc(x.id)}" data-nm-key="g-${esc(x.id)}">${esc(x.label)}</button>`).join('')}
          </div>
        </div>
        ${flash ? `<p class="nm-flash" role="status">${esc(flash)}</p>` : ''}
        ${cards ? `<ol class="nm-results" aria-live="polite">${cards}</ol>` : '<p class="nm-none">Pulsa un generador y aquí irán saliendo los resultados.</p>'}
      </section>`;
    }
    function generate(kind, group) {
      let r = null;
      if (kind === 'nombre') {
        const g = pack.names.find(x => x.id === group) || pack.names[0];
        const list = Array.from({ length: 6 }, () => g.make());
        r = { kind: `Nombres · ${g.label}`, title: list[0], lines: [list.slice(1).join(' · ')] };
      } else if (kind === 'pnj') r = pack.npc();
      else if (kind === 'gancho') r = pack.hook();
      else if (kind === 'lugar') r = pack.place.make();
      else r = pack.extra.find(x => `x:${x.id}` === kind)?.make() || null;
      if (!r) return;
      shown.unshift({ id: uid(), kind: text(r.kind, 60), title: text(r.title, 90), lines: (r.lines || []).map(line => text(line, 400)).slice(0, 14), npc: r.npc || null });
      shown.length = Math.min(shown.length, 12);
    }
    function bindGen() {
      const find = id => shown.find(r => r.id === id);
      on('form[data-nm-gen]', 'submit', (form, event) => { event.preventDefault(); generate('nombre', form.elements.group.value); const g = form.elements.group.value; flash = ''; paint(); const select = node.querySelector('[data-nm-key="g-group"]'); if (select) select.value = g; });
      on('button[data-nm-gen]', 'click', button => { const g = node.querySelector('[data-nm-key="g-group"]')?.value; generate(button.dataset.nmGen); flash = ''; paint(); const select = node.querySelector('[data-nm-key="g-group"]'); if (select && g) select.value = g; });
      on('[data-nm-drop]', 'click', button => { const i = shown.findIndex(r => r.id === button.dataset.nmDrop); if (i >= 0) shown.splice(i, 1); flash = ''; paint(); });
      on('[data-nm-tonote]', 'click', button => {
        const r = find(button.dataset.nmTonote);
        if (!r) return;
        const done = ctx.note(`${r.kind}: ${r.title}`, r.lines.join('\n'));
        if (done?.ok !== false) r.noted = true;
        flash = done?.text || 'Apuntado en las notas.';
        paint();
      });
      on('[data-nm-keep]', 'click', button => {
        const r = find(button.dataset.nmKeep);
        if (!r?.npc) return;
        if (d.npcs.length >= 200) { flash = 'Ya hay muchos PNJ: borra alguno antes de guardar otro.'; paint(); return; }
        d.npcs.unshift({ id: uid(), name: text(r.npc.name, 60), role: text(r.npc.role, 80), hp: sys.hpStart || 0, def: '', init: 0, notes: text(r.npc.notes, 3000) });
        r.kept = true;
        commit(`${r.npc.name} está en los PNJ de la campaña.`);
      });
    }

    // ── Común
    function on(selector, type, fn) { node.querySelectorAll(selector).forEach(el => el.addEventListener(type, event => fn(el, event))); }
    function commit(message = '') {
      flash = message;
      asking = '';
      ctx.save();
      paint();
    }
    function paint() {
      if (!node.isConnected) return;
      const active = node.contains(document.activeElement) ? document.activeElement.dataset.nmKey : '';
      node.innerHTML = tool === 'combate' ? combatHtml() : tool === 'pnj' ? npcHtml() : genHtml();
      if (tool === 'combate') bindCombat(); else if (tool === 'pnj') bindNpcs(); else bindGen();
      if (active) node.querySelector(`[data-nm-key="${CSS.escape(active)}"]`)?.focus({ preventScroll: true });
    }
    paint();
    return { refresh: paint };
  }

  // Las tres herramientas juntas, con pestañas (la app Máster de Traveller), y el Mundo de la partida
  // (src/nexo/mundo.js) como una pestaña más.
  function mountAll(node, ctx, start = 'combate') {
    const names = { ...NAMES, ...(window.NEXO_MUNDO ? { mundo: 'Mundo' } : {}) };
    let tool = names[start] ? start : 'combate';
    function paint() {
      node.innerHTML = `<nav class="nm-tabs ap-${ctx.prefix}" aria-label="Herramientas de máster">${Object.entries(names).map(([id, label]) => `<button type="button" class="nm-tab ${id === tool ? 'is-active' : ''}" data-nm-tab="${id}" ${id === tool ? 'aria-current="page"' : ''}>${label}</button>`).join('')}</nav><div data-nm-body></div>`;
      node.querySelectorAll('[data-nm-tab]').forEach(button => button.addEventListener('click', () => { tool = button.dataset.nmTab; paint(); node.querySelector(`[data-nm-tab="${tool}"]`)?.focus({ preventScroll: true }); }));
      if (tool === 'mundo') window.NEXO_MUNDO.mount(node.querySelector('[data-nm-body]'), { prefix: ctx.prefix, id: ctx.id, data: ctx.data, save: ctx.save, sharing: 'no' });
      else mount(tool, node.querySelector('[data-nm-body]'), ctx);
    }
    paint();
  }

  // Traveller: la app «Máster» de cada partida. Los datos van dentro de la propia partida (data.master).
  window.NEXO_MASTER_UI = {
    open() {
      const root = document.getElementById('masterRoot');
      const api = window.NEXO_MASTER_API;
      if (!root || !api) return;
      const data = api.get();
      Object.assign(data, clean(data));
      if (window.NEXO_MUNDO) data.world = window.NEXO_MUNDO.clean(data.world);
      mountAll(root, { system: 'traveller', prefix: 'trv', id: api.id(), data, save: () => api.commit(), party: () => api.party(), note: (title, body) => api.note(title, body) });
    }
  };

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = './src/nexo/master.css?v=1';
  document.head.append(css);

  window.NEXO_MASTER = { clean, tools, mount, mountAll, systems: SYSTEMS };
})();
