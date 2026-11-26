/*
 * NEXO · Modo partida: la ficha en pequeño para jugar con el móvil en la mano.
 * Lleva solo lo que se usa en la mesa: los números de un vistazo (que se tiran al tocarlos), el panel
 * «En juego» del sistema (puntos de golpe, recursos, estados y descansos) y las tiradas de la ficha,
 * que van al lanzador de dados común. Mientras está abierto, la pantalla no se apaga (Wake Lock).
 *
 * Cada sistema describe qué enseña con view(ch) y cómo se tira con roll(clave, opciones); el estado de
 * la partida sigue viviendo en ch.play y lo pinta NEXO_JUEGO, como en la ficha.
 */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const AWAKE_KEY = 'nexo-partida-despierta';

  // Pantalla encendida: una sola petición para todo NEXO, que se repite al volver a la pestaña.
  const awake = {
    lock: null, wanted: false, failed: false,
    supported: () => 'wakeLock' in navigator && window.isSecureContext,
    pref() { try { return localStorage.getItem(AWAKE_KEY) !== 'no'; } catch { return true; } },
    setPref(on) { try { if (on) localStorage.removeItem(AWAKE_KEY); else localStorage.setItem(AWAKE_KEY, 'no'); } catch { /* sin sitio: dura esta vez */ } },
    async take() {
      this.wanted = true;
      if (!this.supported() || this.lock || document.visibilityState !== 'visible') return;
      try {
        this.lock = await navigator.wakeLock.request('screen');
        this.failed = false;
        this.lock.addEventListener('release', () => { this.lock = null; changed(); });
        if (!this.wanted) this.free();
      } catch { this.failed = true; }
      changed();
    },
    free() {
      this.wanted = false;
      const lock = this.lock;
      this.lock = null;
      lock?.release().catch(() => {});
      changed();
    }
  };
  const listeners = new Set();
  const changed = () => listeners.forEach(fn => fn());
  document.addEventListener('visibilitychange', () => { if (awake.wanted && document.visibilityState === 'visible') awake.take(); });

  /*
   * cfg: {
   *   prefix: 'dnd', host: () => nodo del sistema, juego: lo que devuelve NEXO_JUEGO.create, current: () => ficha abierta,
   *   view: ch => { title, sub, adv: bool (botón de ventaja/desventaja), stats: [{ label, value, roll, term, hint }],
   *                 rolls: [{ id, title, open, help: [[nombre, texto]], items: [{ key, label, value, prof, hint }] }],
   *                 guide: [{ title, open, lead | steps: [texto] | list: [texto] | gloss: [[nombre, texto]] }] },
   *   Las ayudas (hint, help, guide) son para quien empieza: explican qué es cada número y cómo se juega.
   *   roll: (clave, { adv: 'adv' | 'dis' | '' }) => void, back: () => void (vuelve a pintar el panel en la ficha),
   *   term: (id, texto) => html, can: ch => bool (si la ficha ya tiene con qué jugar)
   * }
   */
  function create(cfg) {
    const p = cfg.prefix;
    const term = (id, text) => (id && cfg.term ? cfg.term(id, text) : esc(text));
    let layer = null;
    let watch = null;
    let adv = '';
    const opened = new Map();

    const wakeHtml = () => {
      if (!awake.supported()) return '<span class="np-wake is-off" role="status">Este navegador no puede mantener la pantalla encendida</span>';
      const on = awake.pref();
      const label = !on ? 'Pantalla: se apaga sola' : awake.lock ? 'Pantalla siempre encendida' : awake.failed ? 'Pantalla: no se pudo mantener' : 'Pantalla: encendiendo…';
      return `<button type="button" class="np-wake ${on && awake.lock ? 'is-on' : ''}" data-np-wake aria-pressed="${on}"><i aria-hidden="true"></i>${label}</button>`;
    };
    const advHtml = () => `<div class="np-adv" role="group" aria-label="Próxima tirada de d20">${[['', 'Normal'], ['adv', 'Ventaja'], ['dis', 'Desventaja']].map(([id, label]) => `<button type="button" data-np-adv="${id}" aria-pressed="${adv === id}" class="${adv === id ? 'is-on' : ''}">${label}</button>`).join('')}</div>`;
    const value = v => esc(v ?? '—');
    function statHtml(s) {
      // Un número que se tira ya es un botón: su regla no puede ir dentro (sería un botón dentro de otro).
      const inner = `<small>${s.roll ? esc(s.label) : term(s.term, s.label)}</small><b>${value(s.value)}</b>${s.hint ? `<i>${esc(s.hint)}</i>` : ''}${s.roll ? '<em>toca para tirar</em>' : ''}`;
      return s.roll ? `<button type="button" class="np-stat is-roll" data-np-roll="${esc(s.roll)}" aria-label="Tirar ${esc(s.label)} (${esc(s.value)})">${inner}</button>` : `<div class="np-stat">${inner}</div>`;
    }
    function rollsHtml(group) {
      const open = opened.has(group.id) ? opened.get(group.id) : group.open !== false;
      const hints = group.items.some(item => item.hint);
      const help = group.help?.length ? `<details class="np-help"><summary>¿Qué significan?</summary>${group.help.map(([name, text]) => `<p><b>${esc(name)}.</b> ${esc(text)}</p>`).join('')}</details>` : '';
      return `<details class="np-rolls" data-np-group="${esc(group.id)}" ${open ? 'open' : ''}><summary><h3>${esc(group.title)}</h3><small>${group.items.length}</small></summary>
        ${group.note ? `<p class="np-note">${esc(group.note)}</p>` : ''}${help}
        <div class="np-roll-grid ${hints ? 'has-hints' : ''}">${group.items.map(item => `<button type="button" class="np-roll ${item.prof ? 'is-prof' : ''}" data-np-roll="${esc(item.key)}" aria-label="Tirar ${esc(item.label)} (${esc(item.value)})"><span>${esc(item.label)}${item.prof ? '<small class="np-prof">dominas</small>' : ''}${item.hint ? `<small>${esc(item.hint)}</small>` : ''}</span><b>${value(item.value)}</b></button>`).join('')}</div></details>`;
    }
    // Guía para quien empieza: su papel, su turno paso a paso y las reglas básicas, cada una plegable.
    const HOWTO = { title: 'Cómo usar el modo partida', list: [
      'El contador grande se cambia escribiendo la cantidad y pulsando restar o sumar. Cada cambio se puede deshacer.',
      'Toca un número con «toca para tirar» o cualquier tirada de la lista: va a los dados de NEXO.',
      'Recursos: toca las casillas para gastarlos; los descansos los recuperan.',
      'Estados: márcalos y verás qué significan. Las tiradas ya los tienen en cuenta.',
      'Las palabras subrayadas abren su regla del manual.'
    ] };
    function guideHtml(list) {
      list = [...(list || [])];
      if (!list.some(g => g.title === HOWTO.title)) list.splice(Math.max(0, list.length - 1), 0, HOWTO);
      return `<section class="np-guide"><h3 class="np-guide-title">Guía para jugar</h3>${list.map((g, i) => {
        const key = 'guide:' + i;
        const open = opened.has(key) ? opened.get(key) : Boolean(g.open);
        const body = g.lead ? `<p class="np-lead">${esc(g.lead)}</p>`
          : g.steps ? `<ol>${g.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`
          : g.list ? `<ul>${g.list.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`
          : g.gloss ? g.gloss.map(([name, text]) => `<details class="np-gloss"><summary>${esc(name)}</summary><p>${esc(text)}</p></details>`).join('') : '';
        return `<details class="np-rolls np-guide-part" data-np-group="${key}" ${open ? 'open' : ''}><summary><h3>${esc(g.title)}</h3></summary><div class="np-guide-body">${body}</div></details>`;
      }).join('')}</section>`;
    }

    function paint() {
      const ch = cfg.current();
      if (!layer || !ch) return;
      const v = cfg.view(ch) || {};
      const scroll = layer.scrollTop;
      layer.innerHTML = `<header class="np-bar"><button type="button" class="np-back" data-np-close aria-label="Volver a la ficha completa">←<span> Ficha</span></button><div class="np-who"><b>${esc(v.title || 'Personaje')}</b>${v.sub ? `<small>${esc(v.sub)}</small>` : ''}</div></header>
        <div class="np-body">
          <div class="np-tools"></div>
          ${v.stats?.length ? `<div class="np-stats">${v.stats.map(statHtml).join('')}</div>` : ''}
          <div class="np-cols"><div class="np-play" data-np-play data-nj-open="1"></div>
            ${v.rolls?.length || v.guide?.length ? `<div class="np-side">${(v.rolls || []).map(rollsHtml).join('')}${v.rolls?.length ? '<p class="np-hint">Toca un número para tirarlo con los dados de NEXO. Los estados activos ya se aplican y el resultado te dice por qué.</p>' : ''}${guideHtml(v.guide)}</div>` : ''}</div>
        </div>`;
      layer.scrollTop = scroll;
      cfg.juego?.render(layer.querySelector('[data-np-play]'));
      layer.querySelector('[data-np-close]').addEventListener('click', () => close());
      paintTools(v);
      layer.querySelectorAll('[data-np-group]').forEach(d => d.addEventListener('toggle', () => opened.set(d.dataset.npGroup, d.open)));
      layer.querySelectorAll('[data-np-roll]').forEach(b => b.addEventListener('click', () => {
        cfg.roll(b.dataset.npRoll, { adv });
        if (adv) { adv = ''; paintTools(); }
      }));
    }
    // Solo la fila de herramientas: así no se pierde lo que se está escribiendo en el panel.
    function paintTools(v) {
      const tools = layer?.querySelector('.np-tools');
      if (!tools || !cfg.current()) return;
      v ||= cfg.view(cfg.current()) || {};
      tools.innerHTML = wakeHtml() + (v.adv ? advHtml() : '');
      tools.querySelector('[data-np-wake]')?.addEventListener('click', () => {
        const on = !awake.pref();
        awake.setPref(on);
        if (on) awake.take(); else awake.free();
      });
      tools.querySelectorAll('[data-np-adv]').forEach(b => b.addEventListener('click', () => { adv = b.dataset.npAdv; paintTools(); }));
    }

    const repaintTools = () => paintTools();
    function open() {
      const host = cfg.host();
      if (!host || !cfg.current() || layer?.isConnected || (cfg.can && !cfg.can(cfg.current()))) return;
      adv = '';
      layer = document.createElement('div');
      layer.className = `np np-${p} ap-${p}`;
      layer.setAttribute('role', 'dialog');
      layer.setAttribute('aria-label', 'Modo partida');
      host.append(layer);
      document.documentElement.classList.add('nexo-partida-open');
      listeners.add(repaintTools);
      paint();
      layer.querySelector('[data-np-close]').focus({ preventScroll: true });
      window.NEXO_NAV?.sub(() => close(true));
      if (awake.pref()) awake.take();
      // Si el sistema repinta o se cierra por su cuenta (la nube, salir a la mesa), el modo partida se va con él.
      watch = new MutationObserver(() => { if (layer && !layer.isConnected) close(true, true); });
      watch.observe(host, { childList: true });
      if (!host.isConnected) close(true, true);
    }
    function close(fromNav = false, gone = false) {
      if (!layer) return;
      watch?.disconnect();
      watch = null;
      listeners.delete(repaintTools);
      awake.free();
      layer.remove();
      layer = null;
      document.documentElement.classList.remove('nexo-partida-open');
      if (!fromNav) window.NEXO_NAV?.drop();
      if (!gone) cfg.back?.();
    }

    return {
      // Botón para la cabecera de la ficha; quien lo pinta lo enlaza con bind().
      button: (cls = '') => `<button type="button" class="${esc(cls)} np-open" data-np-open aria-label="Abrir el modo partida: la ficha en pequeño para jugar"><span aria-hidden="true">▶</span> MODO PARTIDA</button>`,
      bind(root) { root?.querySelectorAll('[data-np-open]').forEach(b => b.addEventListener('click', open)); },
      open, close: () => close(),
      isOpen: () => Boolean(layer?.isConnected),
      refresh: () => { if (layer?.isConnected) paint(); }
    };
  }

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = './src/nexo/partida.css?v=1';
  document.head.append(css);

  // Saca valores de la hoja común (sheetData de cada sistema) por su etiqueta: [etiqueta, corta, clave de tirada, regla].
  function pick(data, list) {
    const items = (data?.blocks || []).flatMap(b => (b?.kind === 'stats' ? b.items : [])).filter(Boolean);
    return list.map(([label, short, roll, rule]) => {
      const item = items.find(i => i.label === label);
      if (!item || item.value == null || item.value === '' || item.value === '—') return null;
      return { label: short || label, value: item.sub === 'pies' ? `${item.value} p` : item.value, roll, term: rule };
    }).filter(Boolean);
  }

  window.NEXO_PARTIDA = { create, pick };
})();
