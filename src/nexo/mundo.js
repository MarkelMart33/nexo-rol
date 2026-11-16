/*
 * NEXO · Mundo: las notas enlazadas de cada campaña (gente, lugares, facciones, objetos, tramas…).
 * Cada entrada tiene tipo, nombre, etiquetas y un texto que enlaza con otras escribiendo [[Nombre]].
 * Los datos viven en el objeto que diga quien lo monta (la campaña, o data.master en Traveller):
 *   { world: [{ id, type, name, tags: [], text, seen, updatedAt }] }
 * `seen` marca lo que pueden leer los jugadores de una campaña compartida: grupo.js publica solo
 * eso (publicEntries) y el jugador lo lee con view().
 */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const text = (value, max) => (typeof value === 'string' || typeof value === 'number' ? String(value) : '').slice(0, max);
  const uid = () => crypto.randomUUID?.() || `w${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  const okId = id => (typeof id === 'string' && /^[\w-]{1,64}$/.test(id) ? id : uid());
  const fold = value => String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  // Un nombre no lleva corchetes ni barras, para que [[Nombre]] y [[Nombre|texto]] se lean bien.
  const cleanName = value => text(value, 200).replace(/[[\]|\n\r]/g, ' ').replace(/\s{2,}/g, ' ').slice(0, MAX_NAME);
  const MAX_ENTRIES = 200;
  const MAX_NAME = 80;
  const MAX_TEXT = 6000;
  const MAX_TAGS = 8;
  const MAX_TAG = 24;
  // Tope de lo que se enseña a los jugadores, para que quepa con el diario en la fila de la campaña compartida.
  const PUBLIC_ROOM = 40000;
  const PUBLIC_MAX = 120;

  const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  // [id, singular, plural, icono]
  const TYPES = [
    ['personaje', 'Personaje', 'Personajes', svg('<circle cx="12" cy="8" r="3.4"/><path d="M5 20c.8-4 3.4-6 7-6s6.2 2 7 6"/>')],
    ['lugar', 'Lugar', 'Lugares', svg('<path d="M12 21s6.5-6.2 6.5-11a6.5 6.5 0 0 0-13 0c0 4.8 6.5 11 6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>')],
    ['faccion', 'Facción', 'Facciones', svg('<path d="M6 3.5v17"/><path d="M6 4.5h11.5l-2.5 4 2.5 4H6"/>')],
    ['objeto', 'Objeto', 'Objetos', svg('<path d="M7 4.5h10l3.5 5L12 20 3.5 9.5Z"/><path d="M3.5 9.5h17M9.5 4.5 8 9.5l4 10.5 4-10.5-1.5-5"/>')],
    ['trama', 'Trama', 'Tramas', svg('<circle cx="12" cy="12" r="8.5"/><path d="m15.8 8.2-2.3 5.3-5.3 2.3 2.3-5.3Z"/>')],
    ['suceso', 'Suceso', 'Sucesos', svg('<path d="M7 3.5h10M7 20.5h10"/><path d="M8 3.5c0 4.5 4 5.5 4 8.5s-4 4-4 8.5M16 3.5c0 4.5-4 5.5-4 8.5s4 4 4 8.5"/>')],
    ['nota', 'Nota', 'Notas', svg('<path d="M6 3.5h9l3.5 3.5v13.5H6Z"/><path d="M15 3.5V7h3.5"/><path d="M9 11h6.5M9 14h6.5M9 17h4"/>')]
  ];
  const TYPE = Object.fromEntries(TYPES.map(([id, one, many, icon]) => [id, { one, many, icon }]));
  const HINTS = {
    personaje: 'Quién es, qué quiere y qué sabe el grupo de él.', lugar: 'Cómo es, quién manda y qué se puede encontrar allí.', faccion: 'Qué busca, quién la dirige y con quién está enfrentada.',
    objeto: 'Qué hace, de quién fue y dónde está ahora.', trama: 'Qué está pasando, quién está detrás y qué pistas hay.', suceso: 'Qué ocurrió, cuándo y a quién cambió la vida.', nota: 'Lo que no encaja en lo demás.'
  };
  const EYE = svg('<path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.7"/>');

  // ── Datos
  function cleanTags(raw) {
    const list = Array.isArray(raw) ? raw : String(raw || '').split(',');
    const seen = new Set();
    const out = [];
    list.forEach(item => {
      const tag = text(item, 60).replace(/^[\s#]+/, '').replace(/\s+/g, ' ').trim().slice(0, MAX_TAG);
      if (!tag || seen.has(fold(tag)) || out.length >= MAX_TAGS) return;
      seen.add(fold(tag));
      out.push(tag);
    });
    return out;
  }
  // Lo guardado puede venir de un archivo o de otra versión: se rehace siempre con tipos sanos.
  function clean(raw) {
    const ids = new Set();
    return (Array.isArray(raw) ? raw : []).filter(e => e && typeof e === 'object').slice(0, MAX_ENTRIES).map(e => {
      let id = okId(e.id);
      if (ids.has(id)) id = uid();
      ids.add(id);
      return { id, type: TYPE[e.type] ? e.type : 'nota', name: cleanName(e.name), tags: cleanTags(e.tags), text: text(e.text, MAX_TEXT), seen: Boolean(e.seen), updatedAt: text(e.updatedAt, 30) };
    });
  }
  // Resumen para la baldosa del inicio de campaña: [id, nombre, detalle].
  function summary(data) {
    const n = Array.isArray(data?.world) ? data.world.length : 0;
    return ['mundo', 'Mundo', n ? plural(n, 'entrada', 'entradas') : 'Gente, lugares y tramas'];
  }
  // Lo que se publica en una campaña compartida: solo las entradas marcadas, sin ids y con un tope de tamaño.
  // Si no cabe todo, se quedan fuera las últimas que se tocaron: el aviso sale en la entrada que se acaba de marcar.
  function fitting(world, room = PUBLIC_ROOM) {
    let left = room;
    return clean(world).filter(e => e.seen && e.name.trim()).sort((a, b) => a.updatedAt.localeCompare(b.updatedAt)).filter(e => (left -= e.name.length + e.text.length + e.tags.join('').length + 60) > 0).slice(0, PUBLIC_MAX);
  }
  function publicEntries(world, room) {
    return fitting(world, room).map(e => ({ type: e.type, name: e.name.trim(), tags: e.tags, text: e.text }));
  }

  // ── Texto con enlaces: [[Nombre]] o [[Nombre|texto]], **negrita** y listas con «- ».
  const LINK = /\[\[([^[\]|\n]{1,80})(?:\|([^[\]\n]{1,80}))?\]\]/g;
  const fmt = raw => esc(raw).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  function inline(raw, link) {
    let out = '';
    let last = 0;
    raw.replace(LINK, (all, name, label, at) => {
      out += fmt(raw.slice(last, at)) + link(name.trim(), (label || name).trim());
      last = at + all.length;
      return all;
    });
    return out + fmt(raw.slice(last));
  }
  function rich(raw, link) {
    return String(raw || '').trim().split(/\n\s*\n/).filter(Boolean).map(block => {
      const lines = block.split('\n');
      if (lines.every(line => /^\s*- /.test(line))) return `<ul>${lines.map(line => `<li>${inline(line.replace(/^\s*- /, ''), link)}</li>`).join('')}</ul>`;
      return `<p>${lines.map(line => inline(line, link)).join('<br>')}</p>`;
    }).join('');
  }
  const plain = raw => String(raw || '').replace(LINK, (all, name, label) => label || name).replace(/\*\*/g, '').replace(/^\s*- /gm, '').replace(/\s+/g, ' ').trim();
  const linksOf = raw => { const out = new Set(); String(raw || '').replace(LINK, (all, name) => { out.add(fold(name)); return all; }); return out; };
  const excerpt = (raw, max = 110) => { const flat = plain(raw); return flat.length > max ? `${flat.slice(0, max).replace(/\s+\S*$/, '')}…` : flat; };

  // Filtro de la lista de cada campaña mientras la app sigue abierta.
  const filters = new Map();
  document.addEventListener('nexo:signed-out', () => filters.clear());

  /*
   * ctx: {
   *   prefix: 'dnd',                       clases de estilo del sistema (dnd-panel…) y paleta ap-dnd
   *   id: 'id de la campaña',              para recordar el filtro de la lista
   *   data: objeto con world,              se cambia en el sitio
   *   save: () => void,
   *   entry: 'id', edit: bool,             entrada abierta al montar (si quien monta lleva la navegación)
   *   open: (id, { edit }) => void,        abrir una entrada como vista nueva; sin ella, se pinta aquí mismo
   *   close: () => void,                   volver a la lista
   *   editing: (bool) => void,             avisa de que se entra o se sale de editar
   *   mentions: () => [{ label, text }],   otros textos de la campaña donde buscar [[Nombre]] (el diario)
   *   sharing: 'no' | 'off' | 'on'         si el sistema comparte campañas y si esta lo está
   * }
   */
  function mount(node, ctx) {
    const p = ctx.prefix;
    const d = ctx.data;
    if (!Array.isArray(d.world)) d.world = clean(d.world);
    const world = () => d.world;
    const filter = filters.get(ctx.id) || { q: '', type: '', tag: '' };
    filters.set(ctx.id, filter);
    let current = ctx.entry || '';
    let editing = Boolean(ctx.edit);
    let asking = false;
    let flash = '';

    const find = id => world().find(e => e.id === id) || null;
    const byName = () => { const map = new Map(); world().forEach(e => { const k = fold(e.name); if (k && !map.has(k)) map.set(k, e); }); return map; };
    const touch = e => { e.updatedAt = new Date().toISOString(); ctx.save(); };
    const open = (id, opts = {}) => { if (ctx.open) ctx.open(id, opts); else { current = id; editing = Boolean(opts.edit); asking = false; paint(); } };
    const close = () => { if (ctx.close) ctx.close(); else { current = ''; editing = false; asking = false; paint(); } };
    const setEditing = on => { editing = on; ctx.editing?.(on); };

    function create(name, type) {
      if (world().length >= MAX_ENTRIES) { flash = `El mundo de esta campaña está lleno (${MAX_ENTRIES} entradas): borra alguna antes de añadir más.`; paint(); return; }
      const entry = { id: uid(), type: TYPE[type] ? type : 'nota', name: cleanName(name).trim(), tags: [], text: '', seen: false, updatedAt: '' };
      world().unshift(entry);
      touch(entry);
      open(entry.id, { edit: true });
    }
    // Al cambiar el nombre de una entrada, los enlaces de las demás siguen apuntando a ella.
    function renameLinks(before, after, self) {
      const from = fold(before);
      if (!from || !after.trim() || from === fold(after) || world().some(e => e !== self && fold(e.name) === from)) return;
      world().forEach(e => {
        if (e === self) return;
        const next = e.text.replace(LINK, (all, name, label) => (fold(name) === from ? `[[${after.trim()}${label ? `|${label}` : ''}]]` : all)).slice(0, MAX_TEXT);
        if (next !== e.text) e.text = next;
      });
    }

    // ── Lista
    function matches() {
      const q = fold(filter.q);
      return world().filter(e => (!filter.type || e.type === filter.type) && (!filter.tag || e.tags.some(t => fold(t) === filter.tag))
        && (!q || fold(`${e.name} ${e.tags.join(' ')} ${plain(e.text)}`).includes(q)))
        .sort((a, b) => (a.name || '￿').localeCompare(b.name || '￿', 'es', { sensitivity: 'base' }));
    }
    function rowsHtml() {
      const rows = matches();
      if (!world().length) return `<p class="nw-none">Todavía no hay nada apuntado. Empieza por lo que ya ha salido en la mesa: la posada donde se conoció el grupo, quien les dio el primer encargo, el nombre que nadie se atreve a decir.</p>`;
      if (!rows.length) return '<p class="nw-none">Ninguna entrada coincide con lo que buscas.</p>';
      return `<ul class="nw-list">${rows.map(e => `<li><button type="button" class="nw-row" data-nw-open="${esc(e.id)}"><span class="nw-ico" title="${TYPE[e.type].one}">${TYPE[e.type].icon}</span><span class="nw-row-copy"><b>${esc(e.name || 'Sin nombre')}</b><small>${esc(excerpt(e.text) || TYPE[e.type].one)}</small></span>${e.seen && ctx.sharing !== 'no' ? `<span class="nw-seen" title="Los jugadores pueden leerla">${EYE}</span>` : ''}</button></li>`).join('')}</ul>`;
    }
    function listHtml() {
      const count = id => world().filter(e => e.type === id).length;
      const tags = new Map();
      world().forEach(e => e.tags.forEach(t => { if (!tags.has(fold(t))) tags.set(fold(t), t); }));
      if (filter.tag && !tags.has(filter.tag)) filter.tag = '';
      const chips = [['', 'Todo', world().length], ...TYPES.map(([id, , many]) => [id, many, count(id)])];
      return `<section class="${p}-panel nw-panel ap-${p}"><h2>Mundo <small>${plural(world().length, 'entrada', 'entradas')}</small></h2>
        <p class="nw-how">La gente, los lugares, las facciones y las tramas de la campaña, cada cosa en su entrada. Dentro de un texto, escribe <b>[[Nombre]]</b> para enlazar con otra; también vale en el diario de sesiones, y cada entrada dirá dónde aparece.</p>
        ${flash ? `<p class="nw-flash" role="status">${esc(flash)}</p>` : ''}
        <div class="nw-bar"><input type="search" data-nw-q value="${esc(filter.q)}" maxlength="60" placeholder="Buscar en el mundo…" aria-label="Buscar en el mundo" autocomplete="off"><button type="button" class="nw-btn is-main" data-nw-new>＋ NUEVA ENTRADA</button></div>
        <div class="nw-chips" role="group" aria-label="Filtrar por tipo">${chips.map(([id, label, n]) => `<button type="button" class="nw-chip ${filter.type === id ? 'is-on' : ''}" data-nw-type="${id}" aria-pressed="${filter.type === id}">${id ? TYPE[id].icon : ''}<span>${label}</span><small>${n}</small></button>`).join('')}</div>
        ${tags.size ? `<div class="nw-chips nw-tagbar" role="group" aria-label="Filtrar por etiqueta">${[...tags].sort((a, b) => a[1].localeCompare(b[1], 'es')).map(([k, t]) => `<button type="button" class="nw-tag ${filter.tag === k ? 'is-on' : ''}" data-nw-tag="${esc(k)}" aria-pressed="${filter.tag === k}">#${esc(t)}</button>`).join('')}</div>` : ''}
        <div data-nw-results>${rowsHtml()}</div></section>`;
    }
    function bindRows() {
      node.querySelectorAll('[data-nw-results] [data-nw-open]').forEach(button => button.addEventListener('click', () => open(button.dataset.nwOpen)));
    }
    function bindList() {
      const q = node.querySelector('[data-nw-q]');
      q.addEventListener('input', () => { filter.q = q.value; node.querySelector('[data-nw-results]').innerHTML = rowsHtml(); bindRows(); });
      node.querySelector('[data-nw-new]').addEventListener('click', () => create('', filter.type || 'nota'));
      node.querySelectorAll('[data-nw-type]').forEach(button => button.addEventListener('click', () => { filter.type = button.dataset.nwType; flash = ''; paint(); node.querySelector(`[data-nw-type="${filter.type}"]`)?.focus({ preventScroll: true }); }));
      node.querySelectorAll('[data-nw-tag]').forEach(button => button.addEventListener('click', () => { filter.tag = filter.tag === button.dataset.nwTag ? '' : button.dataset.nwTag; flash = ''; paint(); node.querySelector(`[data-nw-tag="${CSS.escape(button.dataset.nwTag)}"]`)?.focus({ preventScroll: true }); }));
      bindRows();
    }

    // ── Entrada
    function head(e) {
      return `<div class="nw-crumb"><button type="button" class="nw-btn" data-nw-close>← MUNDO</button><span class="nw-kind">${TYPE[e.type].icon}<span>${TYPE[e.type].one}</span></span>${e.seen && ctx.sharing !== 'no' ? `<span class="nw-kind nw-seen">${EYE}<span>A la vista de los jugadores</span></span>` : ''}</div>`;
    }
    function readHtml(e) {
      const names = byName();
      const link = (name, label) => {
        const target = names.get(fold(name));
        if (target === e) return esc(label);
        return target ? `<a href="#" class="nw-link" data-nw-open="${esc(target.id)}">${esc(label)}</a>` : `<a href="#" class="nw-link is-new" data-nw-make="${esc(name)}" title="Aún no existe: tócala para crearla">${esc(label)}</a>`;
      };
      const key = fold(e.name);
      const backs = key ? world().filter(o => o !== e && linksOf(o.text).has(key)) : [];
      const seenIn = key ? (ctx.mentions?.() || []).filter(m => linksOf(m.text).has(key)) : [];
      // Lo que se enseña tiene un tope de tamaño: si esta entrada se queda fuera, se dice aquí.
      const out = ctx.sharing !== 'no' && e.seen && !fitting(world()).some(o => o.id === e.id);
      const share = ctx.sharing === 'no' ? '' : `<label class="ap-check nw-share"><input type="checkbox" data-nw-seen ${e.seen ? 'checked' : ''}><span><b>Los jugadores pueden leer esta entrada</b><small>${ctx.sharing === 'on' ? 'La verán en la campaña compartida, solo para leerla. Lo demás del mundo sigue siendo tuyo.' : 'La verán cuando compartas la campaña desde «Grupo». Lo demás del mundo sigue siendo tuyo.'}</small></span></label>${out ? `<p class="nw-flash" data-nw-out role="status">${e.name.trim() ? 'Ya hay demasiado texto a la vista de los jugadores y esta entrada no les llega. Esconde otras entradas o acorta sus textos.' : 'Ponle un nombre para que los jugadores puedan leerla.'}</p>` : ''}`;
      return `<section class="${p}-panel nw-panel ap-${p}">${head(e)}
        <h2 class="nw-title">${esc(e.name || 'Sin nombre')}</h2>
        ${e.tags.length ? `<div class="nw-chips">${e.tags.map(t => `<button type="button" class="nw-tag" data-nw-totag="${esc(fold(t))}" title="Ver todo lo que lleva esta etiqueta">#${esc(t)}</button>`).join('')}</div>` : ''}
        <div class="nw-text">${e.text.trim() ? rich(e.text, link) : `<p class="nw-none">Sin texto todavía. ${esc(HINTS[e.type])}</p>`}</div>
        ${backs.length || seenIn.length ? `<div class="nw-backs"><h3>Aparece en</h3><ul>${backs.map(o => `<li><a href="#" class="nw-link" data-nw-open="${esc(o.id)}">${esc(o.name || 'Sin nombre')}</a> <small>${TYPE[o.type].one}</small></li>`).join('')}${seenIn.map(m => `<li>${esc(m.label)}</li>`).join('')}</ul></div>` : ''}
        ${share}
        <div class="nw-actions"><button type="button" class="nw-btn is-main" data-nw-edit>EDITAR</button><button type="button" class="nw-btn ${asking ? 'is-sure' : ''}" data-nw-del>${asking ? '¿BORRAR? PULSA OTRA VEZ' : 'BORRAR'}</button></div></section>`;
    }
    function editHtml(e) {
      const others = world().filter(o => o !== e && o.name.trim()).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
      return `<section class="${p}-panel nw-panel ap-${p}">${head(e)}
        <div class="nw-form">
          <label class="nw-field nw-wide"><span>Nombre</span><input data-nw-f="name" value="${esc(e.name)}" maxlength="${MAX_NAME}" autocomplete="off" placeholder="Cómo se llama"></label>
          <label class="nw-field"><span>Tipo</span><select data-nw-f="type">${TYPES.map(([id, one]) => `<option value="${id}" ${id === e.type ? 'selected' : ''}>${one}</option>`).join('')}</select></label>
          <label class="nw-field"><span>Etiquetas, separadas por comas</span><input data-nw-f="tags" value="${esc(e.tags.join(', '))}" maxlength="220" autocomplete="off" placeholder="aliado, capital, sin resolver"></label>
          <label class="nw-field nw-wide"><span>Texto</span><textarea data-nw-f="text" rows="10" maxlength="${MAX_TEXT}" placeholder="${esc(HINTS[e.type])}">${esc(e.text)}</textarea></label>
          <label class="nw-field nw-wide"><span>Enlazar con otra entrada</span><select data-nw-link ${others.length ? '' : 'disabled'}><option value="">${others.length ? 'Elige una y se escribe en el texto…' : 'Aún no hay más entradas'}</option>${others.map(o => `<option value="${esc(o.id)}">${esc(o.name)} · ${TYPE[o.type].one}</option>`).join('')}</select></label>
        </div>
        <p class="nw-how">También puedes escribir <b>[[Nombre]]</b> a mano: si la entrada no existe, podrás crearla desde el enlace. <b>**Negrita**</b> resalta y una línea que empieza por «- » abre una lista.</p>
        <p class="nw-flash" data-nw-dup role="status" hidden></p>
        <div class="nw-actions"><button type="button" class="nw-btn is-main" data-nw-done>HECHO</button></div></section>`;
    }
    function bindEntry(e) {
      node.querySelector('[data-nw-close]').addEventListener('click', close);
      node.querySelectorAll('a[data-nw-open]').forEach(a => a.addEventListener('click', event => { event.preventDefault(); open(a.dataset.nwOpen); }));
      node.querySelectorAll('[data-nw-make]').forEach(a => a.addEventListener('click', event => { event.preventDefault(); create(a.dataset.nwMake, 'nota'); }));
      node.querySelectorAll('[data-nw-totag]').forEach(button => button.addEventListener('click', () => { filter.tag = button.dataset.nwTotag; filter.type = ''; filter.q = ''; close(); }));
      node.querySelector('[data-nw-edit]')?.addEventListener('click', () => { asking = false; setEditing(true); paint(); node.querySelector('[data-nw-f="text"]')?.focus({ preventScroll: true }); });
      node.querySelector('[data-nw-seen]')?.addEventListener('change', event => { e.seen = event.target.checked; touch(e); asking = false; paint(); node.querySelector('[data-nw-seen]')?.focus({ preventScroll: true }); });
      node.querySelector('[data-nw-del]')?.addEventListener('click', () => {
        if (!asking) { asking = true; paint(); node.querySelector('[data-nw-del]')?.focus({ preventScroll: true }); return; }
        d.world = world().filter(o => o !== e);
        ctx.save();
        close();
      });
      // Edición: cada campo se guarda según se escribe.
      let nameBefore = e.name;
      const dup = node.querySelector('[data-nw-dup]');
      const warn = () => {
        if (!dup) return;
        const twin = fold(e.name) && world().some(o => o !== e && fold(o.name) === fold(e.name));
        dup.hidden = !twin;
        dup.textContent = twin ? 'Ya hay otra entrada con este nombre: los enlaces [[…]] irán a la primera.' : '';
      };
      warn();
      node.querySelectorAll('[data-nw-f]').forEach(input => {
        const key = input.dataset.nwF;
        input.addEventListener('input', () => {
          if (key === 'tags') e.tags = cleanTags(input.value);
          else if (key === 'type') e.type = TYPE[input.value] ? input.value : 'nota';
          else e[key] = key === 'name' ? cleanName(input.value) : text(input.value, MAX_TEXT);
          if (key === 'name') warn();
          touch(e);
        });
        if (key === 'name') input.addEventListener('change', () => { renameLinks(nameBefore, e.name, e); nameBefore = e.name; ctx.save(); });
        if (key === 'type') input.addEventListener('change', () => { const area = node.querySelector('[data-nw-f="text"]'); if (area) area.placeholder = HINTS[e.type]; });
      });
      node.querySelector('[data-nw-link]')?.addEventListener('change', event => {
        const target = find(event.target.value);
        const area = node.querySelector('[data-nw-f="text"]');
        event.target.value = '';
        if (!target || !area) return;
        const insert = `[[${target.name.trim()}]]`;
        const at = area.selectionStart ?? area.value.length;
        const end = area.selectionEnd ?? at;
        if (area.value.length - (end - at) + insert.length > MAX_TEXT) return;
        area.value = area.value.slice(0, at) + insert + area.value.slice(end);
        e.text = area.value;
        touch(e);
        area.focus({ preventScroll: true });
        area.setSelectionRange(at + insert.length, at + insert.length);
      });
      node.querySelector('[data-nw-done]')?.addEventListener('click', () => {
        renameLinks(nameBefore, e.name, e);
        ctx.save();
        setEditing(false);
        paint();
        node.querySelector('[data-nw-edit]')?.focus({ preventScroll: true });
      });
      if (editing && !e.name) node.querySelector('[data-nw-f="name"]')?.focus({ preventScroll: true });
    }

    function paint() {
      const e = current ? find(current) : null;
      if (current && !e) { current = ''; editing = false; }
      if (!e) { node.innerHTML = listHtml(); flash = ''; bindList(); return; }
      node.innerHTML = editing ? editHtml(e) : readHtml(e);
      bindEntry(e);
    }
    paint();
    return { refresh: paint };
  }

  // ── Lo que lee un jugador de una campaña compartida. Llega de otra cuenta: es texto ajeno.
  function view(node, raw, opts = {}) {
    const p = opts.prefix || 'ap';
    const list = (Array.isArray(raw) ? raw : []).filter(e => e && typeof e === 'object').slice(0, PUBLIC_MAX)
      .map(e => ({ type: TYPE[e.type] ? e.type : 'nota', name: cleanName(e.name).trim(), tags: cleanTags(e.tags), text: text(e.text, MAX_TEXT) })).filter(e => e.name)
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
    const at = new Map();
    list.forEach((e, i) => { if (!at.has(fold(e.name))) at.set(fold(e.name), i); });
    const link = (name, label) => (at.has(fold(name)) ? `<a href="#" class="nw-link" data-nw-jump="${at.get(fold(name))}">${esc(label)}</a>` : esc(label));
    let q = '';
    const rows = () => {
      const k = fold(q);
      const shown = list.map((e, i) => [e, i]).filter(([e]) => !k || fold(`${e.name} ${e.tags.join(' ')} ${plain(e.text)}`).includes(k));
      if (!shown.length) return '<p class="nw-none">Ninguna entrada coincide con lo que buscas.</p>';
      return shown.map(([e, i]) => `<details class="nw-entry" data-nw-entry="${i}"><summary><span class="nw-ico">${TYPE[e.type].icon}</span><b>${esc(e.name)}</b><small>${TYPE[e.type].one}${e.tags.length ? ` · ${e.tags.map(t => `#${esc(t)}`).join(' ')}` : ''}</small></summary><div class="nw-text">${e.text.trim() ? rich(e.text, link) : '<p class="nw-none">Sin texto.</p>'}</div></details>`).join('');
    };
    const bind = () => node.querySelectorAll('[data-nw-jump]').forEach(a => a.addEventListener('click', event => {
      event.preventDefault();
      if (q) { q = ''; const box = node.querySelector('[data-nw-q]'); if (box) box.value = ''; node.querySelector('[data-nw-results]').innerHTML = rows(); bind(); }
      const target = node.querySelector(`[data-nw-entry="${a.dataset.nwJump}"]`);
      if (!target) return;
      target.open = true;
      target.scrollIntoView({ block: 'nearest', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      target.querySelector('summary')?.focus({ preventScroll: true });
    }));
    node.innerHTML = `<div class="nw-panel nw-public ap-${esc(p)}">${list.length > 6 ? `<div class="nw-bar"><input type="search" data-nw-q maxlength="60" placeholder="Buscar en el mundo…" aria-label="Buscar en el mundo" autocomplete="off"></div>` : ''}<div data-nw-results>${rows()}</div></div>`;
    node.querySelector('[data-nw-q]')?.addEventListener('input', event => { q = event.target.value; node.querySelector('[data-nw-results]').innerHTML = rows(); bind(); });
    bind();
    return list.length;
  }

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = './src/nexo/mundo.css?v=1';
  document.head.append(css);

  window.NEXO_MUNDO = { clean, summary, mount, view, publicEntries, types: TYPES.map(([id, one, many]) => ({ id, one, many })) };
})();
