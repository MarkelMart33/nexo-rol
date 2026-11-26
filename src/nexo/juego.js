/*
 * NEXO · Juego: el panel «En juego» de una ficha. Lleva lo que cambia durante la partida:
 * contadores (puntos de golpe, espacios, recursos), estados, contadores propios y descansos.
 * Cada sistema describe su modelo; aquí viven el estado (ch.play), el dibujo y la lógica común.
 *
 * ch.play = { v: { id: n }, mx: { id: n }, c: { id: n }, m: { id: 1 }, t: { id: { marca: n } }, custom: [{ id, name, max, rest }] }
 *   v:  lo que un contador se aparta de su valor de partida. Con máximo se guarda lo GASTADO (si el máximo sube,
 *       lo que queda sube con él); sin máximo, la diferencia con el valor inicial.
 *   mx: máximo que el jugador pone a mano en los contadores que lo permiten.
 *   c:  estados activos (1, o su grado).  m: marcas sueltas del sistema (casillas de mejora de Cthulhu).
 *   t:  casillas marcadas por tipo en un medidor (los niveles de salud de Vampiro).
 * Si el panel está plegado o no es cosa de cada dispositivo (localStorage), no de la ficha: así plegarlo no la cambia.
 */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const int = (value, fallback = 0) => { const n = Math.trunc(Number(String(value ?? '').replace('−', '-'))); return Number.isFinite(n) ? n : fallback; };
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const signed = n => (n < 0 ? `−${-n}` : `+${n}`);
  const uid = () => (crypto.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2)).replace(/[^\w-]/g, '').slice(0, 36);
  const LIMIT = 9999;
  const KEY = /^[\w:.-]{1,60}$/;
  let pressed = false;
  document.addEventListener('pointerdown', () => { pressed = true; }, true);
  ['pointerup', 'pointercancel'].forEach(type => document.addEventListener(type, () => { pressed = false; }, true));

  // El estado puede venir de un archivo importado o de otra versión: se rehace siempre con tipos sanos.
  function clean(ch) {
    const raw = ch.play && typeof ch.play === 'object' && !Array.isArray(ch.play) ? ch.play : {};
    const nums = (obj, lo, hi) => {
      const out = {};
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) Object.keys(obj).slice(0, 300).forEach(key => {
        const n = clamp(int(obj[key]), lo, hi);
        if (KEY.test(key) && n) out[key] = n;
      });
      return out;
    };
    const play = { v: nums(raw.v, -LIMIT, LIMIT), mx: {}, c: nums(raw.c, 0, 99), m: nums(raw.m, 0, 1), t: {}, custom: [] };
    if (raw.mx && typeof raw.mx === 'object' && !Array.isArray(raw.mx)) Object.keys(raw.mx).slice(0, 60).forEach(key => { if (KEY.test(key)) play.mx[key] = clamp(int(raw.mx[key]), 0, 99); });
    if (raw.t && typeof raw.t === 'object' && !Array.isArray(raw.t)) Object.keys(raw.t).slice(0, 20).forEach(key => { if (KEY.test(key)) play.t[key] = nums(raw.t[key], 0, 99); });
    if (Array.isArray(raw.custom)) raw.custom.slice(0, 24).forEach(item => {
      if (!item || typeof item !== 'object') return;
      play.custom.push({
        id: typeof item.id === 'string' && /^[\w-]{1,40}$/.test(item.id) ? item.id : uid(),
        name: String(item.name ?? '').slice(0, 40), max: clamp(int(item.max), 0, 999),
        rest: typeof item.rest === 'string' && /^[\w-]{0,20}$/.test(item.rest) ? item.rest : ''
      });
    });
    ch.play = play;
    return play;
  }
  const tidy = new WeakSet();
  function stateOf(ch) {
    if (!ch.play || !tidy.has(ch.play)) tidy.add(clean(ch));
    return ch.play;
  }

  // Panel plegado o abierto, por ficha y en este dispositivo.
  const FOLD_KEY = 'nexo-juego-plegado';
  function folds() {
    try { const map = JSON.parse(localStorage.getItem(FOLD_KEY) || '{}'); return map && typeof map === 'object' && !Array.isArray(map) ? map : {}; } catch { return {}; }
  }
  function setFold(id, open) {
    const map = folds();
    delete map[id];
    map[id] = open;
    const keys = Object.keys(map);
    keys.slice(0, Math.max(0, keys.length - 300)).forEach(key => delete map[key]);
    try { localStorage.setItem(FOLD_KEY, JSON.stringify(map)); } catch { /* sin sitio: se queda como esté */ }
  }

  // Valor actual de un contador y cómo se guarda.
  const maxOf = (play, c) => (c.editMax ? (play.mx[c.id] ?? c.max ?? 0) : c.max);
  function read(play, c) {
    if (c.kind === 'value') return clamp((c.start || 0) + (play.v[c.id] || 0), c.min ?? 0, c.cap ?? LIMIT);
    const max = maxOf(play, c);
    return clamp(max - (play.v[c.id] || 0), 0, max);
  }
  function write(play, c, value) {
    let stored;
    if (c.kind === 'value') stored = clamp(int(value), c.min ?? 0, c.cap ?? LIMIT) - (c.start || 0);
    else { const max = maxOf(play, c); stored = max - clamp(int(value), 0, max); }
    if (stored) play.v[c.id] = stored; else delete play.v[c.id];
  }

  /*
   * cfg: {
   *   prefix: 'dnd', title: html del encabezado, current: () => ficha abierta,
   *   model: ch => null | {
   *     counters: [{ id, label, name (para los avisos), max | (kind:'value', start, cap, min), big, verbs, temp, inside, pips, editMax, group, term,
   *                  zero, rest: { idDescanso: 'all' | n | { set } | { add } }, actions: [{ id, label }], showAt: { id, is } }],
   *     tracks:   [{ id, label, term, levels: [nombres], marks: [{ id, sign, label }] (del más grave al más leve), note: total => texto }],
   *     conditions: [{ id, label, max, term, effect, rest: { idDescanso: 'clear' | -1 } }],
   *     rests: [{ id, label, hint, covers: [ids], run: api => void }],
   *     groupTerms: { título: idManual }, effects: api => [líneas], extra: api => html, summary: api => texto
   *   },
   *   save: () => void (guardar sin repintar la ficha), term: (id, texto) => html, ready: ch => bool,
   *   act: (idAcción, api, hecho(texto)) => void, bindExtra: (nodo, api, hecho) => void, onChange: () => void
   * }
   */
  function create(cfg) {
    const p = cfg.prefix;
    const term = (id, text) => (id && cfg.term ? cfg.term(id, text) : esc(text));
    let mount = null;
    let notice = null;      // { id de ficha, text, undo }
    let asking = '';        // contador propio que espera confirmar su borrado
    const unfolded = new Set();

    function defs(ch) {
      const model = cfg.model(ch);
      if (!model) return null;
      const play = stateOf(ch);
      const rests = model.rests || [];
      const custom = play.custom.map(item => ({
        id: `x:${item.id}`, label: item.name || 'Contador', max: item.max, kind: item.max ? 'pool' : 'value', start: 0, cap: 999,
        group: 'Tus contadores', custom: item, rest: item.rest ? { [item.rest]: item.max ? 'all' : { set: 0 } } : null
      }));
      const counters = [...(model.counters || []).filter(Boolean), ...custom];
      const conditions = model.conditions || [];
      const tracks = model.tracks || [];
      // Lo guardado no puede pasar de lo que el sistema admite (un archivo editado a mano, una versión anterior).
      conditions.forEach(c => { if (play.c[c.id] > (c.max || 1)) play.c[c.id] = c.max || 1; });
      tracks.forEach(t => {
        const marks = play.t[t.id];
        if (!marks) return;
        Object.keys(marks).forEach(k => { if (!t.marks.some(m => m.id === k)) delete marks[k]; });
        let extra = Object.values(marks).reduce((sum, n) => sum + n, 0) - t.levels.length;
        [...t.marks].reverse().forEach(m => {
          const cut = Math.min(Math.max(extra, 0), marks[m.id] || 0);
          if (!cut) return;
          marks[m.id] -= cut; extra -= cut;
          if (!marks[m.id]) delete marks[m.id];
        });
      });
      return { ...model, rests, counters, tracks, conditions, byId: new Map(counters.map(c => [c.id, c])) };
    }
    function api(ch, model = defs(ch)) {
      const play = stateOf(ch);
      const counter = id => model?.byId.get(id);
      return {
        ch, play, model,
        get: id => (counter(id) ? read(play, counter(id)) : 0),
        max: id => (counter(id) ? maxOf(play, counter(id)) ?? 0 : 0),
        set: (id, n) => { if (counter(id)) write(play, counter(id), n); },
        add: (id, d) => { if (counter(id)) write(play, counter(id), read(play, counter(id)) + d); },
        cond: id => play.c[id] || 0,
        setCond: (id, n) => { if (n > 0) play.c[id] = clamp(int(n), 1, 99); else delete play.c[id]; },
        mark: id => Boolean(play.m[id]),
        setMark: (id, on) => { if (on) play.m[id] = 1; else delete play.m[id]; },
        marks: () => Object.keys(play.m),
        track: id => ({ ...(play.t[id] || {}) }),
        trackTotal: id => Object.values(play.t[id] || {}).reduce((t, n) => t + n, 0)
      };
    }

    // Guarda, avisa y repinta solo el panel.
    function commit(ch, text = '', undo = null) {
      notice = text ? { id: ch.id, text, undo } : null;
      asking = '';
      cfg.save();
      paint();
      cfg.onChange?.();
    }
    // Al salir de una casilla escrita se repinta después: así no se pierde el clic o el salto de foco que la hizo perder el foco.
    function commitSoon(ch) {
      notice = null;
      asking = '';
      cfg.save();
      cfg.onChange?.();
      if (!pressed) { setTimeout(paint, 0); return; }
      const go = () => { document.removeEventListener('pointerup', go, true); document.removeEventListener('pointercancel', go, true); setTimeout(paint, 0); };
      document.addEventListener('pointerup', go, true);
      document.addEventListener('pointercancel', go, true);
    }
    const snapshot = ch => JSON.stringify(stateOf(ch));

    // ── Dibujo
    const stepper = (c, cur, max) => `<span class="nj-stepper"><button type="button" data-nj-step="${esc(c.id)}" data-d="-1" data-nj-key="${esc(c.id)}:-" aria-label="Restar 1 a ${esc(c.label)}">−</button><input class="nj-num" inputmode="numeric" maxlength="4" value="${cur}" data-nj-set="${esc(c.id)}" data-nj-key="${esc(c.id)}:n" aria-label="${esc(c.label)}">${max != null ? `<small>/ ${max}</small>` : ''}<button type="button" data-nj-step="${esc(c.id)}" data-d="1" data-nj-key="${esc(c.id)}:+" aria-label="Sumar 1 a ${esc(c.label)}">+</button></span>`;
    const actionsHtml = c => (c.actions || []).map(a => `<button type="button" class="nj-act" data-nj-act="${esc(a.id)}" data-nj-key="act:${esc(a.id)}">${esc(a.label)}</button>`).join('');
    const maxEdit = (c, max) => (c.editMax ? `<label class="nj-max"><span>máx.</span><input inputmode="numeric" maxlength="2" value="${max}" data-nj-max="${esc(c.id)}" data-nj-key="${esc(c.id)}:mx" aria-label="Máximo de ${esc(c.label)}"></label>` : '');

    function bigHtml(c, a) {
      const play = a.play;
      const cur = read(play, c);
      const max = c.kind === 'value' ? null : maxOf(play, c);
      const inner = a.model.counters.filter(x => x.inside === c.id);
      const temp = c.temp ? a.get(c.temp) : 0;
      const verbs = c.verbs || ['Restar', 'Sumar'];
      const pct = max ? Math.round((cur / max) * 100) : 0;
      return `<div class="nj-big ${max != null && cur === 0 ? 'is-empty' : ''} ${max && cur <= max / 4 ? 'is-low' : ''}">
        <small class="nj-label">${term(c.term, c.label)}</small>
        <p class="nj-value"><b>${cur}</b>${max != null ? `<span>/ ${max}</span>` : ''}${temp ? `<em>+${temp}</em>` : ''}</p>
        ${max ? `<div class="nj-bar" aria-hidden="true"><i style="width:${pct}%"></i></div>` : ''}
        <form class="nj-delta" data-nj-delta="${esc(c.id)}"><input inputmode="numeric" maxlength="5" placeholder="1" data-nj-key="${esc(c.id)}:d" aria-label="Cantidad para ${esc(c.label)}"><button type="submit" class="nj-btn is-minus" data-nj-sign="-1" data-nj-key="${esc(c.id)}:d-">− ${esc(verbs[0])}</button><button type="submit" class="nj-btn is-plus" data-nj-sign="1" data-nj-key="${esc(c.id)}:d+">+ ${esc(verbs[1])}</button></form>
        ${inner.map(x => `<div class="nj-inner"><span class="nj-label">${term(x.term, x.label)}</span>${stepper(x, read(play, x), null)}</div>`).join('')}
        ${actionsHtml(c) ? `<div class="nj-acts">${actionsHtml(c)}</div>` : ''}
        ${c.zero && max != null && cur === 0 ? `<p class="nj-zero">${esc(c.zero)}</p>` : ''}
      </div>`;
    }
    function rowHtml(c, a) {
      const play = a.play;
      const cur = read(play, c);
      const max = c.kind === 'value' ? c.cap : maxOf(play, c);
      const usePips = c.pips ?? (max != null && max <= 10 && (c.kind !== 'value' || c.cap != null));
      const body = usePips && max > 0
        ? `<span class="nj-pips" role="group" aria-label="${esc(c.label)}: ${cur} de ${max}">${Array.from({ length: max }, (_, i) => `<button type="button" class="nj-pip ${i < cur ? 'is-on' : ''}" data-nj-pip="${esc(c.id)}" data-n="${i + 1}" data-nj-key="${esc(c.id)}:p${i + 1}" aria-pressed="${i < cur}" aria-label="${esc(c.label)}: dejar en ${i + 1}"></button>`).join('')}</span><b class="nj-count">${cur}/${max}</b>`
        : max === 0 && c.kind !== 'value' ? '<span class="nj-none">Sin usos</span>' : stepper(c, cur, c.kind === 'value' ? null : max);
      const del = c.custom ? (asking === c.id
        ? `<button type="button" class="nj-x is-sure" data-nj-del="${esc(c.id)}" data-nj-key="${esc(c.id)}:x">¿Borrar?</button>`
        : `<button type="button" class="nj-x" data-nj-ask="${esc(c.id)}" data-nj-key="${esc(c.id)}:x" aria-label="Borrar el contador ${esc(c.label)}">×</button>`) : '';
      return `<div class="nj-row"><span class="nj-label">${term(c.term, c.label)}${c.hint ? ` <small>${esc(c.hint)}</small>` : ''}</span>${body}${maxEdit(c, maxOf(play, c))}${actionsHtml(c)}${del}</div>`;
    }
    function trackHtml(t, a) {
      const marks = a.track(t.id);
      const total = Math.min(t.levels.length, a.trackTotal(t.id));
      const filled = t.marks.flatMap(m => Array.from({ length: marks[m.id] || 0 }, () => m)).slice(0, t.levels.length);
      const boxes = t.levels.map((name, i) => {
        const m = filled[i];
        return `<li class="${m ? 'is-on' : ''}"><button type="button" class="nj-box" ${m ? `data-nj-heal="${esc(t.id)}" data-m="${esc(m.id)}" aria-label="${esc(name)}: ${esc(m.label)}. Quitar"` : 'disabled aria-label="' + esc(name) + ': sin daño"'} data-nj-key="${esc(t.id)}:b${i}">${m ? esc(m.sign) : ''}</button><span>${esc(name)}</span></li>`;
      }).join('');
      return `<div class="nj-track"><h3>${term(t.term, t.label)} <small>${total}/${t.levels.length}</small></h3><ol class="nj-boxes">${boxes}</ol>
        <div class="nj-acts">${t.marks.map(m => `<button type="button" class="nj-act" data-nj-hurt="${esc(t.id)}" data-m="${esc(m.id)}" data-nj-key="${esc(t.id)}:+${esc(m.id)}">+ ${esc(m.label)} <b>${esc(m.sign)}</b></button>`).join('')}</div>
        ${t.note ? `<p class="nj-zero">${esc(t.note(total, marks))}</p>` : ''}</div>`;
    }
    function condsHtml(a) {
      const list = a.model.conditions;
      if (!list.length) return '';
      const active = list.filter(c => a.cond(c.id));
      const chips = active.map(c => {
        const n = a.cond(c.id);
        const grade = c.max ? `<button type="button" data-nj-cond-step="${esc(c.id)}" data-d="-1" data-nj-key="c:${esc(c.id)}:-" aria-label="Bajar ${esc(c.label)}">−</button><b>${n}</b><button type="button" data-nj-cond-step="${esc(c.id)}" data-d="1" data-nj-key="c:${esc(c.id)}:+" aria-label="Subir ${esc(c.label)}" ${n >= c.max ? 'disabled' : ''}>+</button>` : '';
        return `<span class="nj-chip"><span>${term(c.term, c.label)}</span>${grade}<button type="button" class="nj-chip-x" data-nj-cond="${esc(c.id)}" data-nj-key="c:${esc(c.id)}:x" aria-label="Quitar ${esc(c.label)}">×</button></span>`;
      }).join('');
      const lines = [...active.filter(c => c.effect).map(c => `<li><b>${esc(c.label)}${c.max ? ' ' + a.cond(c.id) : ''}.</b> ${esc(typeof c.effect === 'function' ? c.effect(a.cond(c.id)) : c.effect)}</li>`), ...(a.model.effects?.(a) || []).map(text => `<li>${esc(text)}</li>`)].join('');
      return `<div class="nj-conds"><h3>Estados</h3><div class="nj-chips">${chips || '<span class="nj-none">Ninguno ahora mismo</span>'}</div>
        <details class="nj-more" data-nj-fold="conds" ${unfolded.has('conds') ? 'open' : ''}><summary data-nj-key="fold:conds">＋ Añadir o quitar estados</summary><div class="nj-cond-list">${list.map(c => `<button type="button" class="nj-cond ${a.cond(c.id) ? 'is-on' : ''}" data-nj-cond="${esc(c.id)}" data-nj-key="cl:${esc(c.id)}" aria-pressed="${Boolean(a.cond(c.id))}">${esc(c.label)}</button>`).join('')}</div></details>
        ${lines ? `<ul class="nj-effects">${lines}</ul>` : ''}</div>`;
    }
    // En el modo partida (src/nexo/partida.js) el panel va siempre abierto y sin cabecera.
    const shownOpen = ch => { if (mount?.dataset.njOpen) return true; const saved = folds()[ch.id]; return typeof saved === 'boolean' ? saved : cfg.ready?.(ch) ?? true; };
    // Resumen de una línea: el contador principal y los estados activos (la cabecera del panel y la campaña compartida).
    function summaryOf(a, model) {
      const first = model.counters.find(c => c.big && !c.inside && (!c.showAt || a.get(c.showAt.id) === c.showAt.is));
      const states = model.conditions.filter(c => a.cond(c.id)).map(c => c.label + (c.max ? ' ' + a.cond(c.id) : ''));
      return model.summary?.(a) || [first ? `${first.label} ${read(a.play, first)}${first.kind === 'value' ? '' : '/' + maxOf(a.play, first)}` : '', states.join(', ')].filter(Boolean).join(' · ');
    }
    function panelHtml(ch) {
      const model = defs(ch);
      if (!model) return '';
      const a = api(ch, model);
      const play = a.play;
      const visible = c => !c.inside && (!c.showAt || a.get(c.showAt.id) === c.showAt.is);
      const big = model.counters.filter(c => c.big && visible(c));
      const groups = new Map();
      model.counters.filter(c => !c.big && visible(c)).forEach(c => {
        const title = c.group || model.groupTitle || 'Recursos';
        if (!groups.has(title)) groups.set(title, []);
        groups.get(title).push(c);
      });
      const summary = summaryOf(a, model);
      const isOpen = shownOpen(ch);
      const restOptions = model.rests.map(r => `<option value="${esc(r.id)}">Con ${esc(r.label.toLowerCase())}</option>`).join('');
      const note = notice && notice.id === ch.id ? `<p class="nj-notice" role="status"><span>${esc(notice.text)}</span>${notice.undo ? '<button type="button" class="nj-act" data-nj-undo data-nj-key="undo">DESHACER</button>' : ''}</p>` : '';
      return `<section class="${p}-panel nj-panel ap-${p}"><details class="nj-fold" data-nj-main ${isOpen ? 'open' : ''}>
        <summary class="nj-head" data-nj-key="main"><h2>${cfg.title}</h2><span class="nj-sum">${esc(summary)}</span></summary>
        <div class="nj-body">
          ${big.length || model.tracks.length ? `<div class="nj-bigs">${big.map(c => bigHtml(c, a)).join('')}${model.tracks.map(t => trackHtml(t, a)).join('')}</div>` : ''}
          ${note}
          ${[...groups].map(([title, rows]) => `<div class="nj-group"><h3>${term(model.groupTerms?.[title], title)}</h3>${rows.map(c => rowHtml(c, a)).join('')}</div>`).join('')}
          <details class="nj-more" data-nj-fold="add" ${unfolded.has('add') ? 'open' : ''}><summary data-nj-key="fold:add">＋ Contador propio</summary>
            <form class="nj-add" data-nj-add><label><span>Nombre</span><input name="name" maxlength="40" required placeholder="Flechas, cargas, antorchas…" data-nj-key="add:name"></label><label><span>Máximo</span><input name="max" inputmode="numeric" maxlength="3" placeholder="Sin máximo" data-nj-key="add:max"></label>${restOptions ? `<label><span>Se recupera</span><select name="rest" data-nj-key="add:rest"><option value="">A mano</option>${restOptions}</select></label>` : ''}<button type="submit" class="nj-btn" data-nj-key="add:go">AÑADIR</button></form></details>
          ${condsHtml(a)}
          ${model.extra ? `<div class="nj-extra" data-nj-extra>${model.extra(a)}</div>` : ''}
          ${model.rests.length ? `<div class="nj-rests">${model.rests.map(r => `<button type="button" class="nj-btn nj-rest" data-nj-rest="${esc(r.id)}" data-nj-key="rest:${esc(r.id)}"><b>${esc(r.label)}</b>${r.hint ? `<small>${esc(r.hint)}</small>` : ''}</button>`).join('')}</div>` : ''}
        </div></details></section>`;
    }

    // ── Acciones
    function applyDelta(ch, c, delta) {
      const model = defs(ch);
      const play = stateOf(ch);
      const before = snapshot(ch);
      let absorbed = 0;
      const shield = delta < 0 && c.temp ? model.byId.get(c.temp) : null;
      if (shield) {
        const have = read(play, shield);
        absorbed = Math.min(have, -delta);
        if (absorbed) { write(play, shield, have - absorbed); delta += absorbed; }
      }
      const was = read(play, c);
      write(play, c, was + delta);
      const now = read(play, c);
      if (now === was && !absorbed) { commit(ch); return; }
      const parts = [];
      if (absorbed) parts.push(`${shield.label}: −${absorbed}.`);
      if (now !== was) parts.push(`${c.label}: de ${was} a ${now}.`);
      commit(ch, parts.join(' '), before);
    }
    function rest(ch, id) {
      const model = defs(ch);
      const r = model.rests.find(x => x.id === id);
      if (!r) return;
      const play = stateOf(ch);
      const before = snapshot(ch);
      const a = api(ch, model);
      const was = new Map(model.counters.map(c => [c.id, read(play, c)]));
      const hadConds = new Map(model.conditions.map(c => [c.id, a.cond(c.id)]));
      const ruleFor = item => item.rest?.[r.id] ?? (r.covers || []).map(k => item.rest?.[k]).find(x => x != null);
      model.counters.forEach(c => {
        const rule = ruleFor(c);
        if (rule == null) return;
        if (rule === 'all') write(play, c, c.kind === 'value' ? c.start || 0 : maxOf(play, c));
        else if (rule === 'half') write(play, c, read(play, c) + Math.max(1, Math.floor(maxOf(play, c) / 2)));
        else if (typeof rule === 'number') write(play, c, read(play, c) + rule);
        else if (rule.set != null) write(play, c, rule.set);
        else if (rule.add != null) write(play, c, read(play, c) + rule.add);
      });
      model.conditions.forEach(c => {
        const rule = ruleFor(c);
        if (rule == null || !a.cond(c.id)) return;
        a.setCond(c.id, rule === 'clear' ? 0 : a.cond(c.id) + rule);
      });
      r.run?.(a);
      const changes = [];
      model.counters.forEach(c => { const d = read(play, c) - was.get(c.id); if (d) changes.push(`${c.name || c.label} ${signed(d)}`); });
      model.conditions.forEach(c => {
        const had = hadConds.get(c.id), has = a.cond(c.id);
        if (had && !has) changes.push(`sin ${c.label.toLowerCase()}`);
        else if (had !== has) changes.push(`${c.label} ${has}`);
      });
      const shown = changes.slice(0, 7).join(', ') + (changes.length > 7 ? ` y ${changes.length - 7} más` : '');
      commit(ch, changes.length ? `${r.label}: ${shown}.` : `${r.label}: no había nada que recuperar.`, changes.length ? before : null);
    }
    function hurt(ch, id, mark) {
      const model = defs(ch);
      const t = model.tracks.find(x => x.id === id);
      if (!t) return;
      const play = stateOf(ch);
      const marks = play.t[id] ||= {};
      const total = Object.values(marks).reduce((sum, n) => sum + n, 0);
      const order = t.marks.map(m => m.id);            // del más grave al más leve
      const at = order.indexOf(mark);
      if (at < 0) return;
      if (total < t.levels.length) marks[mark] = (marks[mark] || 0) + 1;
      else {
        // Medidor lleno: el daño nuevo sustituye a la casilla más leve; si ya todo es del más leve, una pasa al siguiente.
        const lighter = order.slice(at + 1).reverse().find(m => marks[m]);
        const [from, to] = lighter ? [lighter, mark] : at === order.length - 1 && at > 0 && marks[mark] ? [mark, order[at - 1]] : [];
        if (!from) { commit(ch, 'El medidor ya está lleno de un daño igual o peor.'); return; }
        marks[from] -= 1;
        marks[to] = (marks[to] || 0) + 1;
      }
      Object.keys(marks).forEach(k => { if (!marks[k]) delete marks[k]; });
      commit(ch);
    }

    function paint() {
      if (!mount || !mount.isConnected) return;
      const ch = cfg.current();
      const active = mount.contains(document.activeElement) ? document.activeElement.dataset.njKey : '';
      mount.innerHTML = ch ? panelHtml(ch) : '';
      if (!ch || !mount.firstChild) return;
      const model = defs(ch);
      const on = (selector, event, fn) => mount.querySelectorAll(selector).forEach(node => node.addEventListener(event, e => fn(node, e)));
      const counter = id => model.byId.get(id);
      const play = stateOf(ch);

      mount.querySelector('[data-nj-main]').addEventListener('toggle', event => { if (event.target.open !== shownOpen(ch)) setFold(ch.id, event.target.open); });
      on('[data-nj-fold]', 'toggle', node => { if (node.open) unfolded.add(node.dataset.njFold); else unfolded.delete(node.dataset.njFold); });
      on('[data-nj-step]', 'click', node => { const c = counter(node.dataset.njStep); write(play, c, read(play, c) + Number(node.dataset.d)); commit(ch); });
      on('[data-nj-set]', 'change', node => { write(play, counter(node.dataset.njSet), int(node.value)); commitSoon(ch); });
      on('[data-nj-max]', 'change', node => { play.mx[node.dataset.njMax] = clamp(int(node.value), 0, 99); commitSoon(ch); });
      on('[data-nj-pip]', 'click', node => { const c = counter(node.dataset.njPip); const n = Number(node.dataset.n); write(play, c, read(play, c) === n ? n - 1 : n); commit(ch); });
      on('[data-nj-delta]', 'submit', (form, event) => {
        event.preventDefault();
        const input = form.querySelector('input');
        const text = input.value.trim().replace('−', '-');
        const typed = /^[+-]/.test(text);
        const amount = text === '' ? 1 : Math.abs(int(text, NaN));
        if (!Number.isFinite(amount)) { input.select(); return; }
        // Con signo escrito («+5», «-7») manda el signo; sin él, el botón pulsado (Intro equivale a restar).
        const sign = typed ? (text.startsWith('+') ? 1 : -1) : Number(event.submitter?.dataset.njSign) || -1;
        applyDelta(ch, counter(form.dataset.njDelta), sign * amount);
      });
      on('[data-nj-hurt]', 'click', node => hurt(ch, node.dataset.njHurt, node.dataset.m));
      on('[data-nj-heal]', 'click', node => { const marks = play.t[node.dataset.njHeal] || {}; if (marks[node.dataset.m]) { marks[node.dataset.m] -= 1; if (!marks[node.dataset.m]) delete marks[node.dataset.m]; } commit(ch); });
      on('[data-nj-cond]', 'click', node => { const id = node.dataset.njCond; if (play.c[id]) delete play.c[id]; else play.c[id] = 1; commit(ch); });
      on('[data-nj-cond-step]', 'click', node => {
        const c = model.conditions.find(x => x.id === node.dataset.njCondStep);
        const n = clamp((play.c[c.id] || 0) + Number(node.dataset.d), 0, c.max || 1);
        if (n) play.c[c.id] = n; else delete play.c[c.id];
        commit(ch);
      });
      on('[data-nj-ask]', 'click', node => { asking = node.dataset.njAsk; paint(); });
      on('[data-nj-del]', 'click', node => {
        const id = node.dataset.njDel;
        play.custom = play.custom.filter(item => `x:${item.id}` !== id);
        delete play.v[id];
        commit(ch);
      });
      on('[data-nj-add]', 'submit', (form, event) => {
        event.preventDefault();
        const name = form.elements.name.value.trim();
        if (!name) return;
        if (play.custom.length >= 24) { commit(ch, 'Ya tienes muchos contadores propios: borra alguno antes de añadir otro.'); return; }
        play.custom.push({ id: uid(), name: name.slice(0, 40), max: clamp(int(form.elements.max.value), 0, 999), rest: form.elements.rest?.value || '' });
        unfolded.delete('add');
        commit(ch);
      });
      on('[data-nj-rest]', 'click', node => rest(ch, node.dataset.njRest));
      on('[data-nj-undo]', 'click', () => {
        if (!notice?.undo) return;
        try { ch.play = JSON.parse(notice.undo); } catch { return; }
        stateOf(ch);
        commit(ch, 'Deshecho.');
      });
      const done = (text = '', undo = null) => commit(ch, text, undo);
      on('[data-nj-act]', 'click', node => cfg.act?.(node.dataset.njAct, api(ch), done, snapshot(ch)));
      const extra = mount.querySelector('[data-nj-extra]');
      if (extra) cfg.bindExtra?.(extra, api(ch, model), done);
      if (active) mount.querySelector(`[data-nj-key="${CSS.escape(active)}"]`)?.focus({ preventScroll: true });
    }

    return {
      // Pinta el panel de la ficha abierta dentro de ese nodo (y lo recuerda para repintarlo).
      render(node) { mount = node || null; if (notice && notice.id !== cfg.current()?.id) notice = null; paint(); },
      refresh: paint,
      api: ch => api(ch),
      // Resumen de cualquier ficha del sistema (también la de otro jugador), o vacío si aún no tiene panel.
      brief(ch) { try { const model = defs(ch); return model ? summaryOf(api(ch, model), model) : ''; } catch { return ''; } },
      get: (ch, id) => api(ch).get(id),
      cond: (ch, id) => stateOf(ch).c[id] || 0,
      mark: (ch, id) => Boolean(stateOf(ch).m[id]),
      trackTotal: (ch, id) => Object.values(stateOf(ch).t[id] || {}).reduce((t, n) => t + n, 0),
      // Cambios hechos desde la ficha (una tirada que gasta o marca algo): se guardan y se repinta el panel.
      change(ch, fn, text = '') { const before = snapshot(ch); fn(api(ch)); commit(ch, text, text ? before : null); }
    };
  }

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = './src/nexo/juego.css?v=1';
  document.head.append(css);

  window.NEXO_JUEGO = { create, clean };
})();
