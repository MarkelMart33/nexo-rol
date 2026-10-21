/*
 * NEXO · Apartados de cada sistema: Personajes, Campañas y Manual.
 * - Pestañas comunes que cada sistema pinta con su propio estilo (clases <prefijo>-*).
 * - Campañas por sistema: personajes vinculados, diario de sesiones y notas.
 *   Se guardan en este dispositivo («nexo-campanas-v1») y, con cuenta, en game_saves (juego «campanas»).
 * - Manual: índice por capítulos, buscador y enlaces entre entradas, cada una con su
 *   explicación narrativa y mecánica. Los textos son resúmenes propios.
 * El botón «atrás» del navegador recorre las vistas (NEXO_NAV.sub) antes de volver a la mesa.
 */
(() => {
  const KEY = 'nexo-campanas-v1';
  const GAME = 'campanas';
  const TABS = [['personajes', 'Personajes'], ['campanas', 'Campañas'], ['manual', 'Manual']];

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fold = value => String(value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`);
  const today = () => new Date().toISOString().slice(0, 10);
  const nav = () => window.NEXO_NAV || { sub() {}, drop() {} };

  // ───────────── Campañas ─────────────
  let store = load();
  let saveTimer = 0;
  function normalizeCampaign(c) {
    return {
      id: c.id || uid(), system: String(c.system || ''), name: String(c.name || ''), master: String(c.master || ''),
      premise: String(c.premise || ''), notes: String(c.notes || ''),
      characterIds: Array.isArray(c.characterIds) ? c.characterIds.map(String) : [],
      sessions: Array.isArray(c.sessions) ? c.sessions.filter(s => s && typeof s === 'object').map(s => ({ id: s.id || uid(), date: String(s.date || ''), title: String(s.title || ''), text: String(s.text || '') })) : [],
      createdAt: c.createdAt || new Date().toISOString(), updatedAt: c.updatedAt || new Date().toISOString()
    };
  }
  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
      return { campaigns: Array.isArray(parsed.campaigns) ? parsed.campaigns.filter(c => c && typeof c === 'object').map(normalizeCampaign) : [] };
    } catch { return { campaigns: [] }; }
  }
  function persist(status) {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { status?.('NO SE PUDO GUARDAR'); return; }
    status?.('GUARDADO EN ESTE DISPOSITIVO');
    window.NEXO_CLOUD?.save(GAME, KEY, store).then(ok => {
      if (ok !== null) status?.(ok ? 'GUARDADO EN LA NUBE' : 'SIN CONEXIÓN · GUARDADO EN ESTE DISPOSITIVO');
    });
  }
  function scheduleSave(campaign, status) {
    campaign.updatedAt = new Date().toISOString();
    status?.('GUARDANDO…');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { saveTimer = 0; persist(status); }, 350);
  }
  function flush() {
    if (!saveTimer) return;
    clearTimeout(saveTimer);
    saveTimer = 0;
    persist();
  }
  window.addEventListener('pagehide', flush);
  async function pull() {
    flush();
    const synced = await window.NEXO_CLOUD?.syncCharacters?.(GAME, KEY, store, 'campaigns').catch(error => { console.error('NEXO sync error', error); return null; });
    if (synced) store = { campaigns: synced.campaigns.filter(c => c && typeof c === 'object').map(normalizeCampaign) };
    return Boolean(synced);
  }
  const campaignsOf = system => store.campaigns.filter(c => c.system === system);

  // ───────────── Texto del manual ─────────────
  // Formato mínimo: párrafos separados por línea en blanco, listas con «- », **negrita**
  // y enlaces a otras entradas con [[id]] o [[id|texto]].
  function inline(text, bk) {
    return esc(text)
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (all, id, label) => {
        const entry = bk.index.get(id.trim());
        const chapter = !entry && bk.chapters.find(ch => ch.id === id.trim());
        const shown = label || entry?.title || chapter?.title || id;
        if (entry) return `<a href="#" class="ap-link" data-ap-entry="${esc(entry.id)}">${shown}</a>`;
        return chapter ? `<a href="#" class="ap-link" data-ap-chapter="${esc(chapter.id)}">${shown}</a>` : shown;
      });
  }
  function rich(text, bk) {
    const blocks = String(text || '').trim().split(/\n\s*\n/);
    return blocks.filter(Boolean).map(block => {
      const lines = block.split('\n');
      if (lines.every(line => /^\s*- /.test(line))) return `<ul>${lines.map(line => `<li>${inline(line.replace(/^\s*- /, ''), bk)}</li>`).join('')}</ul>`;
      return `<p>${lines.map(line => inline(line, bk)).join('<br>')}</p>`;
    }).join('');
  }
  const plain = text => String(text || '').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (all, id, label) => label || id).replace(/\*\*/g, '').replace(/^\s*- /gm, '');

  // Prepara el manual: entradas con su capítulo, índice por id, textos para buscar y referencias inversas.
  function prepare(manual) {
    const chapters = (manual?.chapters || []).filter(ch => ch && ch.entries?.length);
    const index = new Map();
    chapters.forEach(ch => ch.entries.forEach(entry => { entry.chapter = ch; index.set(entry.id, entry); }));
    const backlinks = new Map();
    index.forEach(entry => {
      const refs = new Set([...(entry.see || [])]);
      `${entry.narr || ''} ${entry.mech || ''}`.replace(/\[\[([^\]|]+)/g, (all, id) => refs.add(id.trim()));
      refs.delete(entry.id);
      entry.refs = [...refs].filter(id => index.has(id));
      entry.refs.forEach(id => { if (!backlinks.has(id)) backlinks.set(id, new Set()); backlinks.get(id).add(entry.id); });
      entry.haystack = fold([entry.title, ...(entry.aka || []), entry.summary, plain(entry.narr), plain(entry.mech), entry.chapter.title].join(' '));
      entry.foldTitle = fold([entry.title, ...(entry.aka || [])].join(' '));
    });
    // Avisa en consola de enlaces [[id]] que no llevan a ninguna entrada ni capítulo.
    const ids = new Set([...index.keys(), ...chapters.map(ch => ch.id)]);
    const missing = new Set();
    [manual?.intro, ...chapters.map(ch => ch.intro), ...[...index.values()].flatMap(e => [e.summary, e.narr, e.mech])].forEach(text => String(text || '').replace(/\[\[([^\]|]+)/g, (all, id) => { if (!ids.has(id.trim())) missing.add(id.trim()); }));
    if (missing.size) console.warn('NEXO manual: enlaces sin entrada', [...missing]);
    index.forEach(entry => { entry.backs = [...(backlinks.get(entry.id) || [])].filter(id => !entry.refs.includes(id)); });
    return { title: manual?.title || 'Manual', intro: manual?.intro || '', note: manual?.note || '', chapters, index };
  }

  // ───────────── Apartados de un sistema ─────────────
  /*
   * cfg: {
   *   prefix: 'pf',                      clases de estilo del sistema (pf-panel, pf-button…)
   *   system: () => 'pathfinder',        id del sistema para las campañas
   *   frame: html => void,               pinta la página del sistema con su cabecera
   *   leave: () => void,                 guarda y suelta la ficha abierta
   *   renderCharacters: () => void,      vuelve a la lista de personajes (que llama a tabs('personajes'))
   *   characters: () => [{ id, name, summary }],
   *   openCharacter: id => void,
   *   currentId: () => id de la ficha abierta (o vacío),
   *   manual: () => ({ title, intro, chapters }),
   *   words: { campaign, campaigns, character, characters, newCampaign }  (opcional)
   *   start: pestaña inicial; custom: { pestaña: estado => void } para pintar una pestaña propia (opcionales)
   * }
   */
  function create(cfg) {
    const p = cfg.prefix;
    const words = { campaigns: 'Tus campañas', newCampaign: 'NUEVA CAMPAÑA', character: 'personaje', characters: 'personajes', ...(cfg.words || {}) };
    let host = null;
    const start = cfg.start || 'personajes';
    let state = { tab: start };
    let book = null;
    let bookSource = null;
    const status = text => host?.querySelectorAll('[data-save-status]').forEach(node => { node.textContent = text; });

    function getBook() {
      const source = cfg.manual?.() || null;
      if (source !== bookSource) { bookSource = source; book = prepare(source); }
      return book;
    }

    function tabs(active) {
      state = active === 'personajes' ? { tab: 'personajes' } : state;
      return `<nav class="ap-tabs ap-${p}" aria-label="Apartados">${TABS.map(([id, label]) => `<button type="button" class="ap-tab ${id === active ? 'is-active' : ''}" data-ap-tab="${id}" ${id === active ? 'aria-current="page"' : ''}>${label}</button>`).join('')}</nav>`;
    }

    // Cambia de vista recordando la anterior para el botón «atrás».
    function go(next) {
      const previous = { ...state };
      // La ficha abierta puede ser nueva: se recuerda por su id real para poder volver a ella.
      if (previous.tab === 'personajes' && previous.characterId) previous.characterId = cfg.currentId?.() || previous.characterId;
      nav().sub(() => apply(previous));
      apply(next);
    }
    function apply(next) {
      flush();
      state = { ...next };
      // Un sistema puede pintar una pestaña a su manera (Traveller usa sus partidas como campañas).
      if (cfg.custom?.[next.tab]) { cfg.custom[next.tab](next); return; }
      if (next.tab === 'personajes') {
        if (next.characterId) cfg.openCharacter(next.characterId);
        else cfg.renderCharacters();
        return;
      }
      cfg.leave();
      cfg.frame(`${tabs(next.tab)}<div class="ap-view ap-${p}" data-ap-view></div>`);
      const view = host.querySelector('[data-ap-view]');
      if (next.tab === 'campanas') next.campaignId ? renderCampaign(view, next.campaignId) : renderCampaigns(view);
      else renderManual(view, next);
      if (!next.keepScroll) host.scrollTop = 0;
    }

    // ── Campañas
    function renderCampaigns(view) {
      const rows = campaignsOf(cfg.system());
      const cards = rows.length ? rows.map(c => {
        const sessions = c.sessions.length;
        const people = c.characterIds.length;
        return `<button class="${p}-card ap-camp-card" data-ap-campaign="${esc(c.id)}"><span class="ap-camp-mark" aria-hidden="true">${esc((c.name || '?').trim().charAt(0).toUpperCase() || '?')}</span><span class="${p}-card-copy"><b>${esc(c.name || 'Campaña sin nombre')}</b><small>${people} ${people === 1 ? words.character : words.characters} · ${sessions} ${sessions === 1 ? 'sesión' : 'sesiones'}${c.master ? ` · Narra ${esc(c.master)}` : ''}</small></span></button>`;
      }).join('') : `<div class="${p}-empty"><span aria-hidden="true">✎</span><b>Aún no hay campañas</b><small>Crea una para reunir a tus ${words.characters}, apuntar cada sesión y guardar las notas de la mesa.</small></div>`;
      view.innerHTML = `<p class="${p}-kicker">CAMPAÑAS</p><h1>${esc(words.campaigns)}</h1><p class="${p}-intro">Cada campaña reúne a los ${words.characters} que juegan en ella, un diario de sesiones y las notas de la mesa. Se guardan en este dispositivo y, con cuenta, en la nube.</p>
        <div class="${p}-actions"><button class="${p}-button" data-ap-new>＋ ${esc(words.newCampaign)}</button></div><div class="${p}-list ap-camp-list">${cards}</div>`;
      view.querySelector('[data-ap-new]').addEventListener('click', () => {
        const campaign = normalizeCampaign({ system: cfg.system(), name: '' });
        store.campaigns.unshift(campaign);
        persist(status);
        go({ tab: 'campanas', campaignId: campaign.id });
        host.querySelector('[data-ap-prop="name"]')?.focus();
      });
      view.querySelectorAll('[data-ap-campaign]').forEach(button => button.addEventListener('click', () => go({ tab: 'campanas', campaignId: button.dataset.apCampaign })));
    }

    function renderCampaign(view, id) {
      const c = store.campaigns.find(item => item.id === id);
      if (!c) { renderCampaigns(view); return; }
      const all = cfg.characters();
      const known = new Set(all.map(ch => ch.id));
      const field = (label, prop, opts = {}) => opts.area
        ? `<label class="${p}-field ap-wide"><span>${label}</span><textarea data-ap-prop="${prop}" rows="${opts.rows || 4}" maxlength="${opts.max || 4000}" placeholder="${esc(opts.placeholder || '')}">${esc(c[prop])}</textarea></label>`
        : `<label class="${p}-field"><span>${label}</span><input data-ap-prop="${prop}" value="${esc(c[prop])}" maxlength="60" autocomplete="off" placeholder="${esc(opts.placeholder || '')}"></label>`;
      const roster = all.length ? `<ul class="ap-roster">${all.map(ch => `<li><label class="ap-check"><input type="checkbox" data-ap-member="${esc(ch.id)}" ${c.characterIds.includes(ch.id) ? 'checked' : ''}><span><b>${esc(ch.name || 'Sin nombre')}</b><small>${esc(ch.summary || '')}</small></span></label><button type="button" class="${p}-button ghost ap-mini" data-ap-sheet="${esc(ch.id)}">VER FICHA</button></li>`).join('')}</ul>`
        : `<p class="${p}-note">Todavía no hay ${words.characters} en este sistema. Créalos en la pestaña «Personajes» y márcalos aquí.</p>`;
      const lost = c.characterIds.filter(cid => !known.has(cid)).length;
      const sessions = [...c.sessions].sort((a, b) => String(b.date).localeCompare(String(a.date)));
      const log = sessions.length ? sessions.map(s => `<details class="ap-session"><summary><span class="ap-session-date">${esc(s.date ? new Date(`${s.date}T12:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sin fecha')}</span><b>${esc(s.title || 'Sesión sin título')}</b></summary>
          <div class="${p}-fields ap-session-body"><label class="${p}-field"><span>Fecha</span><input type="date" data-ap-session="${esc(s.id)}" data-ap-key="date" value="${esc(s.date)}"></label><label class="${p}-field"><span>Título</span><input data-ap-session="${esc(s.id)}" data-ap-key="title" value="${esc(s.title)}" maxlength="80"></label>
          <label class="${p}-field ap-wide"><span>Qué pasó</span><textarea data-ap-session="${esc(s.id)}" data-ap-key="text" rows="5" maxlength="6000">${esc(s.text)}</textarea></label></div>
          <div class="${p}-actions"><button type="button" class="${p}-button danger ap-mini" data-ap-del-session="${esc(s.id)}">BORRAR SESIÓN</button></div></details>`).join('')
        : `<p class="${p}-note">Apunta aquí lo que pasa en cada sesión: lo que descubrió el grupo, a quién conocisteis y qué quedó pendiente.</p>`;
      view.innerHTML = `<div class="ap-head-row"><button class="${p}-button ghost" data-ap-back>← ${esc(words.campaigns.toLocaleUpperCase('es'))}</button><button class="${p}-button danger" data-ap-delete>BORRAR CAMPAÑA</button></div>
        <section class="${p}-panel ap-panel"><h2>Campaña</h2><div class="${p}-fields">${field('Nombre', 'name', { placeholder: 'Nombre de la campaña' })}${field('Narrador', 'master', { placeholder: 'Quién dirige' })}${field('Premisa', 'premise', { area: true, rows: 3, max: 1200, placeholder: 'De qué va la campaña, dónde empieza, qué busca el grupo…' })}</div></section>
        <section class="${p}-panel ap-panel"><h2>${esc(words.characters.charAt(0).toUpperCase() + words.characters.slice(1))} de la campaña <small>${c.characterIds.filter(cid => known.has(cid)).length} de ${all.length}</small></h2>${roster}${lost ? `<p class="${p}-note">${lost === 1 ? 'Una ficha vinculada ya no existe' : `${lost} fichas vinculadas ya no existen`} en este dispositivo.</p>` : ''}</section>
        <section class="${p}-panel ap-panel"><h2>Diario de sesiones <small>${c.sessions.length}</small></h2><div class="${p}-actions"><button type="button" class="${p}-button" data-ap-add-session>＋ AÑADIR SESIÓN</button></div><div class="ap-log">${log}</div></section>
        <section class="${p}-panel ap-panel"><h2>Notas de la campaña</h2><div class="${p}-fields">${field('Notas', 'notes', { area: true, rows: 7, max: 12000, placeholder: 'Personajes no jugadores, lugares, pistas, deudas, ganchos…' })}</div></section>
        <div class="${p}-modal" data-ap-modal hidden><div class="${p}-modal-card" role="alertdialog" aria-modal="true" aria-labelledby="apDelTitle"><h3 id="apDelTitle">¿Borrar esta campaña?</h3><p>Se borrarán su diario y sus notas de este dispositivo y de tu cuenta. Las fichas de los ${words.characters} no se tocan.</p><div class="${p}-actions"><button class="${p}-button ghost" data-ap-cancel>CANCELAR</button><button class="${p}-button danger" data-ap-confirm>BORRAR CAMPAÑA</button></div></div></div>`;

      view.querySelector('[data-ap-back]').addEventListener('click', () => go({ tab: 'campanas' }));
      view.querySelectorAll('[data-ap-prop]').forEach(input => input.addEventListener('input', () => { c[input.dataset.apProp] = input.value; scheduleSave(c, status); }));
      view.querySelectorAll('[data-ap-member]').forEach(box => box.addEventListener('change', () => {
        const cid = box.dataset.apMember;
        c.characterIds = box.checked ? [...new Set([...c.characterIds, cid])] : c.characterIds.filter(x => x !== cid);
        scheduleSave(c, status);
        const small = view.querySelector('.ap-panel:nth-of-type(2) h2 small');
        if (small) small.textContent = `${c.characterIds.filter(x => known.has(x)).length} de ${all.length}`;
      }));
      view.querySelectorAll('[data-ap-sheet]').forEach(button => button.addEventListener('click', () => go({ tab: 'personajes', characterId: button.dataset.apSheet })));
      view.querySelector('[data-ap-add-session]').addEventListener('click', () => {
        const session = { id: uid(), date: today(), title: `Sesión ${c.sessions.length + 1}`, text: '' };
        c.sessions.push(session);
        scheduleSave(c, status);
        state = { ...state, keepScroll: true };
        apply(state);
        const open = host.querySelector(`[data-ap-session="${session.id}"][data-ap-key="text"]`);
        open?.closest('details')?.setAttribute('open', '');
        open?.focus();
      });
      view.querySelectorAll('[data-ap-session]').forEach(input => input.addEventListener('input', () => {
        const s = c.sessions.find(item => item.id === input.dataset.apSession);
        if (!s) return;
        s[input.dataset.apKey] = input.value;
        if (input.dataset.apKey === 'title') input.closest('details').querySelector('summary b').textContent = input.value || 'Sesión sin título';
        scheduleSave(c, status);
      }));
      view.querySelectorAll('[data-ap-del-session]').forEach(button => button.addEventListener('click', () => {
        if (!confirm('¿Borrar esta sesión del diario?')) return;
        c.sessions = c.sessions.filter(s => s.id !== button.dataset.apDelSession);
        scheduleSave(c, status);
        apply({ ...state, keepScroll: true });
      }));
      const modal = view.querySelector('[data-ap-modal]');
      view.querySelector('[data-ap-delete]').addEventListener('click', () => { modal.hidden = false; view.querySelector('[data-ap-cancel]').focus(); });
      view.querySelector('[data-ap-cancel]').addEventListener('click', () => { modal.hidden = true; });
      view.querySelector('[data-ap-confirm]').addEventListener('click', () => {
        store.campaigns = store.campaigns.filter(item => item.id !== c.id);
        clearTimeout(saveTimer);
        saveTimer = 0;
        persist(status);
        apply({ tab: 'campanas' });
      });
    }

    // ── Manual
    function search(bk, query) {
      const words = fold(query).split(/\s+/).filter(Boolean);
      if (!words.length) return [];
      const hits = [];
      bk.index.forEach(entry => {
        if (!words.every(w => entry.haystack.includes(w))) return;
        const score = words.reduce((n, w) => n + (entry.foldTitle.startsWith(w) ? 6 : entry.foldTitle.includes(w) ? 3 : 0), 0);
        hits.push([score, entry]);
      });
      return hits.sort((a, b) => b[0] - a[0] || a[1].title.localeCompare(b[1].title, 'es')).map(([, entry]) => entry);
    }
    function snippet(entry, query) {
      const text = plain(`${entry.summary || ''} ${entry.narr || ''} ${entry.mech || ''}`).replace(/\s+/g, ' ').trim();
      const first = fold(query).split(/\s+/).filter(Boolean)[0] || '';
      const at = first ? fold(text).indexOf(first) : -1;
      const start = Math.max(0, at - 50);
      let cut = text.slice(start, start + 170);
      if (start > 0) cut = `…${cut}`;
      if (start + 170 < text.length) cut += '…';
      let html = esc(cut);
      fold(query).split(/\s+/).filter(w => w.length > 1).forEach(w => {
        const folded = fold(cut);
        const pos = folded.indexOf(w);
        if (pos < 0) return;
        const raw = cut.slice(pos, pos + w.length);
        html = html.replace(esc(raw), `<mark>${esc(raw)}</mark>`);
      });
      return html;
    }

    function renderManual(view, st) {
      const bk = getBook();
      if (!bk.chapters.length) {
        view.innerHTML = `<p class="${p}-kicker">MANUAL</p><h1>${esc(bk.title)}</h1><div class="${p}-empty"><span aria-hidden="true">📖</span><b>El manual aún está en blanco</b><small>Pronto llegarán sus capítulos.</small></div>`;
        return;
      }
      const chapter = st.chapter ? bk.chapters.find(ch => ch.id === st.chapter) : null;
      const entry = st.entry ? bk.index.get(st.entry) : null;
      const activeChapter = entry?.chapter || chapter;
      const toc = bk.chapters.map(ch => `<li><button type="button" class="ap-toc-ch ${ch === activeChapter ? 'is-active' : ''}" data-ap-chapter="${esc(ch.id)}"><span>${esc(ch.title)}</span><small>${ch.entries.length}</small></button>${ch === activeChapter ? `<ul>${ch.entries.map(e => `<li><button type="button" class="ap-toc-entry ${e === entry ? 'is-active' : ''}" data-ap-entry="${esc(e.id)}">${esc(e.title)}</button></li>`).join('')}</ul>` : ''}</li>`).join('');
      const crumbs = (...parts) => `<nav class="ap-crumbs" aria-label="Ruta"><button type="button" data-ap-home>${esc(bk.title)}</button>${parts.map(([label, attr]) => `<span aria-hidden="true">›</span>${attr ? `<button type="button" ${attr}>${esc(label)}</button>` : `<b>${esc(label)}</b>`}`).join('')}</nav>`;
      let body;
      if (st.q) {
        const hits = search(bk, st.q);
        body = `${crumbs([`Buscar «${st.q}»`])}<h2 class="ap-title">${hits.length ? `${hits.length} ${hits.length === 1 ? 'resultado' : 'resultados'}` : 'Sin resultados'}</h2>
          ${hits.length ? `<ul class="ap-results">${hits.slice(0, 60).map(e => `<li><button type="button" data-ap-entry="${esc(e.id)}"><b>${esc(e.title)}</b><small>${esc(e.chapter.title)}</small><span>${snippet(e, st.q)}</span></button></li>`).join('')}</ul>` : `<p class="ap-lead">Prueba con otra palabra o con menos términos. El buscador mira títulos, otros nombres y el texto de cada entrada.</p>`}`;
      } else if (entry) {
        const list = entry.chapter.entries;
        const at = list.indexOf(entry);
        const prev = list[at - 1];
        const next = list[at + 1];
        const chip = id => { const e = bk.index.get(id); return e ? `<button type="button" class="ap-chip" data-ap-entry="${esc(e.id)}">${esc(e.title)}<small>${esc(e.chapter.title)}</small></button>` : ''; };
        body = `${crumbs([entry.chapter.title, `data-ap-chapter="${esc(entry.chapter.id)}"`], [entry.title])}
          <article class="ap-entry"><h2 class="ap-title">${esc(entry.title)}</h2>${entry.aka?.length ? `<p class="ap-aka">También: ${entry.aka.map(esc).join(' · ')}</p>` : ''}${entry.summary && entry.summary !== entry.narr ? `<p class="ap-lead">${inline(entry.summary, bk)}</p>` : ''}
          ${entry.narr ? `<section class="ap-block ap-narr"><h3><span aria-hidden="true">❦</span> Narrativa</h3>${rich(entry.narr, bk)}</section>` : ''}
          ${entry.mech ? `<section class="ap-block ap-mech"><h3><span aria-hidden="true">⚙</span> Mecánica</h3>${rich(entry.mech, bk)}</section>` : ''}
          ${entry.refs.length || entry.backs.length ? `<section class="ap-related"><h3>Relacionado</h3><div class="ap-chips">${[...entry.refs, ...entry.backs].map(chip).join('')}</div></section>` : ''}
          <nav class="ap-pager">${prev ? `<button type="button" data-ap-entry="${esc(prev.id)}"><small>← Anterior</small>${esc(prev.title)}</button>` : '<span></span>'}${next ? `<button type="button" data-ap-entry="${esc(next.id)}"><small>Siguiente →</small>${esc(next.title)}</button>` : '<span></span>'}</nav></article>`;
      } else if (chapter) {
        body = `${crumbs([chapter.title])}<h2 class="ap-title">${esc(chapter.title)}</h2>${chapter.intro ? `<div class="ap-lead">${rich(chapter.intro, bk)}</div>` : ''}
          <ul class="ap-entries">${chapter.entries.map(e => `<li><button type="button" data-ap-entry="${esc(e.id)}"><b>${esc(e.title)}</b>${e.summary ? `<span>${esc(plain(e.summary))}</span>` : ''}</button></li>`).join('')}</ul>`;
      } else {
        const total = bk.index.size;
        body = `<h2 class="ap-title">${esc(bk.title)}</h2>${bk.intro ? `<div class="ap-lead">${rich(bk.intro, bk)}</div>` : ''}
          <ol class="ap-chapters">${bk.chapters.map((ch, n) => `<li><button type="button" data-ap-chapter="${esc(ch.id)}"><span class="ap-num">${n + 1}</span><span><b>${esc(ch.title)}</b><small>${ch.entries.length} ${ch.entries.length === 1 ? 'entrada' : 'entradas'}${ch.intro ? ` · ${esc(plain(ch.intro).split(/(?<=\.)\s/)[0])}` : ''}</small></span></button></li>`).join('')}</ol>
          <p class="ap-foot">${total} entradas. Cada una explica la idea en la historia (narrativa) y cómo se juega (mecánica); los términos subrayados llevan a su propia entrada.${bk.note ? ` ${esc(bk.note)}` : ''}</p>`;
      }
      view.innerHTML = `<p class="${p}-kicker">MANUAL</p><div class="ap-search"><span aria-hidden="true">⌕</span><input type="search" data-ap-q placeholder="Buscar en el manual…" value="${esc(st.q || '')}" aria-label="Buscar en el manual" autocomplete="off"></div>
        <div class="ap-manual"><nav class="ap-toc" aria-label="Capítulos"><ul>${toc}</ul></nav><div class="${p}-panel ap-page">${body}</div></div>`;

      const input = view.querySelector('[data-ap-q]');
      let typing = 0;
      input.addEventListener('input', () => {
        clearTimeout(typing);
        typing = setTimeout(() => {
          const q = input.value.trim();
          // La primera letra de una búsqueda guarda la vista anterior; el resto la va afinando.
          if (q && !state.q) go({ tab: 'manual', q });
          else { state = q ? { tab: 'manual', q } : { tab: 'manual' }; apply(state); }
          const again = host.querySelector('[data-ap-q]');
          again.focus();
          again.setSelectionRange(again.value.length, again.value.length);
        }, 180);
      });
      if (st.focusPage) view.querySelector('.ap-page')?.scrollIntoView({ block: 'start' });
    }

    // Clics delegados: pestañas, enlaces del manual y apertura de fichas desde la lista.
    function onClick(event) {
      const t = event.target.closest('[data-ap-tab],[data-ap-entry],[data-ap-chapter],[data-ap-home],[data-manual]');
      if (t && host.contains(t)) {
        event.preventDefault();
        if (t.dataset.apTab) { if (t.dataset.apTab !== state.tab || state.campaignId || state.entry || state.chapter || state.q || state.characterId) go({ tab: t.dataset.apTab }); return; }
        if (t.dataset.apEntry || t.dataset.manual) { const id = t.dataset.apEntry || t.dataset.manual; if (getBook().index.has(id)) go({ tab: 'manual', entry: id, focusPage: true }); return; }
        if (t.dataset.apChapter) { go({ tab: 'manual', chapter: t.dataset.apChapter, focusPage: true }); return; }
        if (t.hasAttribute('data-ap-home')) { go({ tab: 'manual' }); return; }
      }
      if (state.tab !== 'personajes' || state.characterId) {
        // Volver de la ficha a la lista con el botón de la propia ficha.
        if (state.characterId && event.target.closest('[data-back]')) { nav().drop(); state = { tab: 'personajes' }; }
        return;
      }
      const open = event.target.closest('[data-open],[data-new]');
      if (open && open.closest(`.${p}-list,.${p}-actions,.${p}-empty`)) {
        nav().sub(() => apply({ tab: 'personajes' }));
        state = { tab: 'personajes', characterId: open.dataset.open || 'nueva' };
      }
    }

    return {
      tabs,
      mount(element) {
        if (host === element) return;
        host = element;
        host.addEventListener('click', onClick, true);
      },
      // Al abrir el sistema: lista de personajes y campañas al día con la cuenta.
      reset() {
        state = { tab: start };
        pull().then(changed => { if (changed && host && !host.hidden && state.tab === 'campanas' && !state.campaignId) apply({ ...state, keepScroll: true }); });
      },
      // La ficha se abrió desde fuera de la lista (por ejemplo, desde el perfil).
      at(id) { state = { tab: 'personajes', characterId: id }; },
      // Abre directamente una entrada del manual (por ejemplo, desde la ficha).
      openEntry(id) { if (getBook().index.has(id)) go({ tab: 'manual', entry: id }); },
      has: id => getBook().index.has(id),
      // Botón pequeño para enlazar desde la ficha a su entrada del manual.
      link(id, label = 'Manual') { return id && getBook().index.has(id) ? `<button type="button" class="ap-sheet-link" data-manual="${esc(id)}" title="Abrir en el manual">📖 ${esc(label)}</button>` : ''; },
      // Vuelve a pintar la vista actual sin tocar el historial.
      render() { apply({ ...state, keepScroll: true }); },
      get tab() { return state.tab; }
    };
  }

  window.NEXO_APARTADOS = { create, prepare, rich, campaigns: system => campaignsOf(system).map(c => ({ ...c })), pull, esc, fold };
})();
