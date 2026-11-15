/*
 * NEXO · Ficha: lo que comparten las fichas de todos los sistemas.
 * - Hoja de solo lectura: cada sistema describe su ficha como datos (título, bloques de valores, listas,
 *   puntos y textos) y aquí se pinta igual para todos. Es lo que se imprime o se guarda como PDF, y lo que
 *   ve el narrador de una campaña compartida.
 * - Botones de la ficha: exportar a un archivo e imprimir. En la lista de personajes, importar una ficha.
 * Cada sistema crea su «kit» con NEXO_FICHA.create(cfg) y lo monta sobre su apartado.
 */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const filled = value => value !== undefined && value !== null && String(value).trim() !== '';
  const nav = () => window.NEXO_NAV || { sub() {}, drop() {} };

  // ───────────── Hoja de solo lectura ─────────────
  /*
   * data: { system, accent, name, subtitle, meta: [[etiqueta, valor]], blocks: [bloque] }
   * bloque: { title, note, kind, items | text, cols }
   *   stats    items: [{ label, value, sub }]            casillas con un valor grande
   *   list     items: [{ name, value, mark }]            filas «nombre ……… valor» en columnas
   *   dots     items: [{ name, value, max }]             puntos rellenos, como en Vampiro
   *   pairs    items: [[etiqueta, valor]]                datos sueltos
   *   features items: [{ name, text, tag }]              rasgos con su explicación
   *   tracks   items: [{ label, value, max, boxes }]     contadores para llevar a mano en papel
   *   text     text: '…'                                 notas tal cual
   */
  function blockHtml(block) {
    if (!block) return '';
    const items = (block.items || []).filter(Boolean);
    let body = '';
    if (block.kind === 'stats') {
      body = `<div class="nf-stats">${items.map(it => `<div><small>${esc(it.label)}</small><b>${esc(filled(it.value) ? it.value : '—')}</b>${filled(it.sub) ? `<i>${esc(it.sub)}</i>` : ''}</div>`).join('')}</div>`;
    } else if (block.kind === 'list') {
      body = `<ul class="nf-list" style="--nf-cols:${block.cols || 3}">${items.map(it => `<li class="${it.mark ? 'is-marked' : ''}"><span>${it.mark ? '<i aria-hidden="true">●</i>' : ''}${esc(it.name)}</span><b>${esc(it.value)}</b></li>`).join('')}</ul>`;
    } else if (block.kind === 'dots') {
      body = `<ul class="nf-list nf-dotlist" style="--nf-cols:${block.cols || 3}">${items.map(it => `<li><span>${esc(it.name)}</span><b class="nf-dots" aria-label="${esc(it.value)} de ${esc(it.max)}">${Array.from({ length: Math.max(it.max || 5, it.value || 0) }, (_, i) => `<i class="${i < it.value ? 'is-on' : ''}"></i>`).join('')}</b></li>`).join('')}</ul>`;
    } else if (block.kind === 'pairs') {
      body = `<dl class="nf-pairs">${items.filter(([, v]) => filled(v)).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
    } else if (block.kind === 'features') {
      body = `<ul class="nf-features">${items.map(it => `<li><b>${esc(it.name)}</b>${filled(it.tag) ? ` <small>${esc(it.tag)}</small>` : ''}${filled(it.text) ? `<p>${esc(it.text)}</p>` : ''}</li>`).join('')}</ul>`;
    } else if (block.kind === 'tracks') {
      body = `<div class="nf-tracks">${items.map(it => `<div><small>${esc(it.label)}</small><b>${filled(it.value) ? esc(it.value) : '&nbsp;'}${filled(it.max) ? `<span> / ${esc(it.max)}</span>` : ''}</b>${it.boxes ? `<span class="nf-boxes" aria-hidden="true">${Array.from({ length: Math.min(40, it.boxes) }, (_, i) => `<i class="${i < (it.marked || 0) ? 'is-on' : ''}"></i>`).join('')}</span>` : ''}</div>`).join('')}</div>`;
    } else if (block.kind === 'text') {
      if (!filled(block.text)) return '';
      body = `<p class="nf-text">${esc(block.text)}</p>`;
    }
    if (block.kind !== 'text' && !items.length) return '';
    if (block.kind === 'pairs' && !items.some(([, v]) => filled(v))) return '';
    return `<section class="nf-block is-${esc(block.kind)}"><h2>${esc(block.title)}</h2>${body}${filled(block.note) ? `<p class="nf-note">${esc(block.note)}</p>` : ''}</section>`;
  }
  function sheetHtml(data) {
    const meta = (data.meta || []).filter(([, v]) => filled(v));
    return `<article class="nf-sheet" style="--nf-accent:${esc(data.accent || '#7a4a12')}">
      <header class="nf-sheet-head"><div><p class="nf-system">${esc(data.system || 'NEXO')}</p><h1>${esc(data.name || 'Sin nombre')}</h1>${filled(data.subtitle) ? `<p class="nf-subtitle">${esc(data.subtitle)}</p>` : ''}</div>
        ${meta.length ? `<dl class="nf-meta">${meta.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}</header>
      ${(data.blocks || []).map(blockHtml).join('')}
      <footer class="nf-foot">NEXO · ${esc(data.system || '')} · ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</footer>
    </article>`;
  }

  // Ventana con la hoja: se abre sobre el apartado, y al imprimir solo sale ella.
  let overlay = null;
  let overlayNav = false;
  function ensureStyles() {
    if (document.getElementById('nfStyles')) return;
    const link = document.createElement('link');
    link.id = 'nfStyles';
    link.rel = 'stylesheet';
    link.href = './src/nexo/ficha.css?v=1';
    document.head.append(link);
  }
  function closeView(fromBack = false) {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.documentElement.classList.remove('nf-open');
    if (overlayNav && !fromBack) nav().drop();
    overlayNav = false;
  }
  /*
   * opts: { print: imprime nada más abrir, note: aviso bajo la barra, actions: [{ label, run }], history: false para
   * no apilar un paso de «atrás» (cuando quien abre ya gestiona su historial) }
   */
  function view(data, opts = {}) {
    ensureStyles();
    closeView();
    overlay = document.createElement('div');
    overlay.className = 'nf-view';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', `Ficha de ${data.name || 'personaje'}`);
    const extra = (opts.actions || []).map((a, i) => `<button type="button" class="nf-bar-button" data-nf-action="${i}">${esc(a.label)}</button>`).join('');
    overlay.innerHTML = `<div class="nf-bar"><button type="button" class="nf-bar-button is-ghost" data-nf-close>← Volver</button><span class="nf-bar-title">${esc(opts.title || 'Vista de la ficha')}</span>${extra}<button type="button" class="nf-bar-button" data-nf-print>Imprimir o guardar como PDF</button></div>
      ${filled(opts.note) ? `<p class="nf-bar-note">${esc(opts.note)}</p>` : ''}<div class="nf-paper">${sheetHtml(data)}</div>`;
    document.body.append(overlay);
    document.documentElement.classList.add('nf-open');
    overlay.querySelector('[data-nf-close]').addEventListener('click', () => closeView());
    overlay.querySelector('[data-nf-print]').addEventListener('click', () => window.print());
    overlay.querySelectorAll('[data-nf-action]').forEach(button => button.addEventListener('click', () => opts.actions[Number(button.dataset.nfAction)].run()));
    overlay.addEventListener('keydown', event => { if (event.key === 'Escape') { event.stopPropagation(); closeView(); } });
    overlay.tabIndex = -1;
    overlay.focus({ preventScroll: true });
    if (opts.history !== false) { overlayNav = true; nav().sub(() => closeView(true)); }
    if (opts.print) setTimeout(() => window.print(), 250);
    return overlay;
  }

  // ───────────── Importación segura ─────────────
  // Un archivo importado viene de fuera: se le quitan los caracteres de marcado y se ajustan los tipos
  // a los de una ficha nueva, para que nada de lo que traiga pueda acabar como código en la página.
  function scrub(value, depth = 0) {
    if (depth > 12) return null;
    if (typeof value === 'string') return value.replace(/[<>]/g, '').slice(0, 20000);
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value === 'boolean' || value === null) return value;
    if (Array.isArray(value)) return value.slice(0, 2000).map(item => scrub(item, depth + 1));
    if (typeof value === 'object') {
      const out = {};
      Object.keys(value).slice(0, 2000).forEach(key => {
        if (/[<>"'&`\s]/.test(key) || key === '__proto__' || key === 'constructor' || key === 'prototype') return;
        out[key] = scrub(value[key], depth + 1);
      });
      return out;
    }
    return null;
  }
  function conform(raw, template) {
    const clean = scrub(raw) || {};
    Object.keys(template).forEach(key => {
      const model = template[key];
      const got = clean[key];
      if (typeof model === 'number') clean[key] = Number.isFinite(Number(got)) && got !== '' && got !== null ? Number(got) : model;
      else if (typeof model === 'boolean') clean[key] = Boolean(got);
      else if (typeof model === 'string') clean[key] = typeof got === 'string' ? got : typeof got === 'number' ? String(got) : model;
      else if (Array.isArray(model)) clean[key] = Array.isArray(got) ? got : model;
      else if (model && typeof model === 'object') clean[key] = got && typeof got === 'object' && !Array.isArray(got) ? got : model;
    });
    return clean;
  }

  // ───────────── Kit de un sistema ─────────────
  /*
   * cfg: {
   *   prefix: 'dnd', system: 'dnd', label: 'Dungeons & Dragons',
   *   current: () => ficha abierta, sheet: ch => datos de la hoja,
   *   template: () => ficha nueva (para ajustar tipos al importar),
   *   accept: ch => ch | lanza Error       (el sistema completa y valida la ficha importada)
   *   exists: id => bool, put: (ch) => void (guarda la ficha y repinta la lista), flash: texto => void
   *   before: () => void                   (guardar lo pendiente antes de exportar)
   * }
   */
  function create(cfg) {
    const p = cfg.prefix;
    let host = null;

    function exportCurrent() {
      const ch = cfg.current();
      if (!ch) return;
      cfg.before?.();
      window.NEXO_COPIAS?.exportCharacter(cfg.system, ch, ch.name);
      cfg.flash?.('Ficha exportada. Guarda el archivo: sirve de copia y para pasarla a otro dispositivo o cuenta.');
    }
    function printCurrent() {
      const ch = cfg.current();
      if (!ch) return;
      view(cfg.sheet(ch), { title: 'Vista para imprimir' });
    }

    function ask(title, text, buttons) {
      return new Promise(resolve => {
        const modal = document.createElement('div');
        modal.className = `${p}-modal nf-ask`;
        modal.innerHTML = `<div class="${p}-modal-card" role="alertdialog" aria-modal="true"><h3>${esc(title)}</h3><p>${esc(text)}</p><div class="${p}-actions">${buttons.map(([value, label, kind]) => `<button type="button" class="${p}-button ${kind || ''}" data-nf-answer="${esc(value)}">${esc(label)}</button>`).join('')}</div></div>`;
        const done = value => { modal.remove(); resolve(value); };
        modal.addEventListener('click', event => {
          const button = event.target.closest('[data-nf-answer]');
          if (button) done(button.dataset.nfAnswer);
        });
        modal.addEventListener('keydown', event => { if (event.key === 'Escape') { event.stopPropagation(); done(''); } });
        host.append(modal);
        modal.querySelector('button')?.focus();
      });
    }

    async function importOne() {
      let parsed;
      try { parsed = await window.NEXO_COPIAS.pick(); } catch (error) { cfg.flash?.(error.message); return; }
      if (!parsed) return;
      let ch;
      try {
        const raw = window.NEXO_COPIAS.characterFrom(parsed, cfg.system, cfg.label);
        ch = cfg.accept(conform(raw, cfg.template()));
      } catch (error) { cfg.flash?.(error.message || 'No se pudo importar la ficha.'); return; }
      if (!ch.id || typeof ch.id !== 'string') ch.id = crypto.randomUUID();
      if (cfg.exists(ch.id)) {
        const answer = await ask('Ya tienes esta ficha', `«${ch.name || 'Sin nombre'}» ya está en este dispositivo. Puedes sustituirla por la del archivo o importarla como una copia aparte.`, [['', 'CANCELAR', 'ghost'], ['copy', 'IMPORTAR COMO COPIA', 'ghost'], ['replace', 'SUSTITUIR']]);
        if (!answer) return;
        if (answer === 'copy') { ch.id = crypto.randomUUID(); ch.name = `${ch.name || 'Sin nombre'} (copia)`; ch.createdAt = new Date().toISOString(); }
      }
      ch.updatedAt = new Date().toISOString();
      const message = cfg.put(ch);
      cfg.flash?.(message || `«${ch.name || 'Sin nombre'}» importada.`);
    }

    function onClick(event) {
      const t = event.target.closest('[data-nf-export],[data-nf-print],[data-nf-import]');
      if (!t || !host.contains(t)) return;
      event.preventDefault();
      if (t.hasAttribute('data-nf-export')) exportCurrent();
      else if (t.hasAttribute('data-nf-print')) printCurrent();
      else importOne();
    }

    return {
      mount(element) {
        if (host === element) return;
        host = element;
        ensureStyles();
        host.addEventListener('click', onClick);
      },
      // Botones para la cabecera de la ficha abierta.
      tools() { return `<span class="nf-tools"><button type="button" class="${p}-button ghost" data-nf-export title="Guardar esta ficha en un archivo">⇩ EXPORTAR</button><button type="button" class="${p}-button ghost" data-nf-print title="Ver la ficha lista para imprimir o guardar como PDF">⎙ IMPRIMIR</button></span>`; },
      // Botón para la lista de personajes.
      importButton() { return `<button type="button" class="${p}-button ghost" data-nf-import title="Añadir una ficha exportada desde NEXO">⇧ IMPORTAR FICHA</button>`; },
      view: (ch, opts) => view(cfg.sheet(ch), opts),
      sheet: ch => cfg.sheet(ch)
    };
  }

  window.NEXO_FICHA = { create, view, close: closeView, sheetHtml, scrub, conform, esc };
})();
