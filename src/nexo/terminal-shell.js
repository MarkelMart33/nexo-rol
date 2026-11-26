(() => {
  const start = () => {
    if (document.getElementById('nexoSystems')) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './src/nexo/terminal-shell.css?v=1';
    const table = document.createElement('link');
    table.rel = 'stylesheet';
    table.href = './src/nexo/mesa.css?v=16';
    document.head.append(stylesheet, table);

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const hub = document.createElement('section');
    hub.id = 'nexoSystems';
    hub.className = 'nexo-systems';
    hub.hidden = true;
    hub.setAttribute('aria-label', 'Selector de sistemas NEXO');
    document.body.append(hub);
    const labels = { dnd: 'NEXO D&D', vampire: 'NEXO VAMPIRO', tormentas: 'NEXO TORMENTAS', cthulhu: 'NEXO CTHULHU', pathfinder: 'NEXO PATHFINDER' };

    // El botón «atrás» del navegador vuelve a la mesa en lugar de salir de NEXO.
    // Dentro de un sistema, las vistas (pestañas, campañas, manual, fichas) apilan cómo volver a la anterior
    // sobre una sola entrada «sub» del historial; al vaciarse la pila, «atrás» vuelve a la mesa.
    let top = history.state?.nexo || null;
    let skipPop = false;
    let stack = [];
    const away = () => { if (history.state?.nexo !== 'away') { history.pushState({ nexo: 'away' }, ''); top = 'away'; } };
    const sub = back => { stack.push(back); if (top !== 'sub') { history.pushState({ nexo: 'sub' }, ''); top = 'sub'; } };
    const drop = () => { stack.pop(); if (!stack.length && top === 'sub') { skipPop = true; history.back(); } };
    const reset = () => { stack = []; };
    // Cambia el último paso de «atrás» por otro sin tocar el historial del navegador.
    const swap = back => { if (stack.length) stack[stack.length - 1] = back; else sub(back); };
    window.NEXO_NAV = { away, sub, drop, reset, swap };
    window.addEventListener('popstate', event => {
      const left = top;
      top = event.state?.nexo || null;
      if (skipPop) { skipPop = false; return; }
      if (left === 'sub') {
        const back = stack.pop();
        if (back) {
          if (stack.length) { history.pushState({ nexo: 'sub' }, ''); top = 'sub'; }
          back();
        }
        return;
      }
      const root = document.documentElement.classList;
      if (root.contains('nexo-vampire-open')) window.NEXO_VAMPIRE?.close();
      else if (root.contains('nexo-dnd-open')) window.NEXO_DND?.close();
      else if (root.contains('nexo-tormentas-open')) window.NEXO_TORMENTAS?.close();
      else if (root.contains('nexo-cthulhu-open')) window.NEXO_CTHULHU?.close();
      else if (root.contains('nexo-pathfinder-open')) window.NEXO_PATHFINDER?.close();
      else if (document.querySelector('.nexo-profile:not([hidden])')) window.NEXO_PROFILE?.close();
      else if (hub.hidden && document.getElementById('authGate')?.hidden !== false) openHub();
    });

    function openHub() {
      window.NEXO_DICE?.close();
      stack = [];
      if (history.state?.nexo === 'sub') { skipPop = true; history.go(-2); }
      else if (history.state?.nexo === 'away') history.back();
      render('home');
      hub.hidden = false;
      document.documentElement.classList.remove('nexo-system-selected');
    }

    function render(view = 'home') {
      if (view === 'home') {
        const icons = window.NEXO_ICONS || {};
        const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        const user = window.NEXO_CLOUD?.user;
        const name = String(user?.user_metadata?.display_name || '').trim();
        const profileName = user ? name || 'Tu perfil' : 'Sin cuenta';
        const initials = Array.from((name || user?.email?.trim() || 'N').toLocaleUpperCase('es')).slice(0, 2).join('');
        const now = new Date();
        const clock = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const date = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        hub.innerHTML = `<div class="mesa">
          <div class="mesa-vine vine-left" aria-hidden="true"></div><div class="mesa-vine vine-right" aria-hidden="true"></div><div class="mesa-light" aria-hidden="true"></div>
          <header class="mesa-head">
            <div class="mesa-note"><span class="mesa-tape" aria-hidden="true"></span><h1>¿A qué jugamos esta noche?</h1><p data-note>Coge uno de la mesa.</p></div>
            <span class="dc dc-tintero" data-egg="pluma" aria-hidden="true"><span class="tintero"><i class="tintero-blot"></i><i class="tintero-bottle"></i><i class="tintero-quill"></i></span></span>
            <button class="mesa-tag" type="button" data-profile aria-label="Abrir tu perfil">
              <span class="mesa-tag-hole" aria-hidden="true"></span>
              <b class="mesa-tag-monogram" aria-hidden="true">${esc(initials)}</b>
              <span class="mesa-tag-copy"><span class="mesa-tag-name" dir="auto">${esc(profileName)}</span><small class="mesa-tag-caption">Perfil</small></span>
              <span class="mesa-tag-arrow" aria-hidden="true"></span>
            </button>
          </header>
          <div class="mesa-objects">
            <button class="obj obj-pda" data-system="traveller" style="--rest:-7deg;--d:0s" aria-label="Abrir Traveller">
              <span class="pda"><span class="pda-antenna" aria-hidden="true"></span><span class="pda-led" aria-hidden="true"></span>
                <span class="pda-screen"><span class="pda-emblem">${icons.traveller || ''}</span><b>TRAVELLER</b><small>Comercio, naves y mapa estelar</small><span class="pda-prompt">&gt; abrir<i>_</i></span></span>
                <span class="pda-keys" aria-hidden="true"><i></i><i></i><i></i></span></span>
            </button>
            <button class="obj obj-book" data-system="dnd" style="--rest:3deg;--d:.07s" aria-label="Abrir Dungeons and Dragons">
              <span class="book"><span class="book-pages" aria-hidden="true"><span>Tus aventureros<br>te esperan junto al fuego.</span></span>
                <span class="book-cover"><span class="book-emblem">${icons.dnd || ''}</span><b>Dungeons<br>&amp; Dragons</b><small>Reglas de 2024</small></span>
                <span class="book-strap" aria-hidden="true"></span></span>
            </button>
            <button class="obj obj-phone" data-system="vampire" style="--rest:9deg;--d:.14s" aria-label="Abrir Vampiro: La Mascarada">
              <span class="phone"><span class="phone-notch" aria-hidden="true"></span>
                <span class="phone-screen"><span class="phone-time" data-clock>${clock}</span><span class="phone-date">${date}</span>
                  <span class="phone-notif"><span class="phone-app">${icons.vampire || ''}</span><span><b>Vampiro: La Mascarada</b><small>Tus vástagos te esperan.</small></span></span>
                  <span class="phone-bar" aria-hidden="true"></span></span></span>
            </button>
            <button class="obj obj-codex" data-system="vampire-da" style="--rest:-4deg;--d:.21s" aria-label="Abrir Vampiro: Edad Oscura">
              <span class="codex"><span class="codex-page"><span class="codex-cap" aria-hidden="true">V</span><b>Edad Oscura</b><small>Anno Domini MCCXLII</small><span class="codex-lines" aria-hidden="true"></span></span>
                <span class="codex-seal">${icons.vampire || ''}</span><span class="codex-ribbon" aria-hidden="true"></span></span>
            </button>
            <button class="obj obj-reed" data-system="tormentas" style="--rest:-5deg;--d:.28s" aria-label="Abrir El Archivo de las Tormentas">
              <span class="reed"><span class="reed-paper"><span class="reed-emblem">${icons.tormentas || ''}</span><b>El Archivo<br>de las Tormentas</b><small>Juego de rol del Cosmere</small>
                <span class="reed-msg">Se acerca una alta tormenta.<br>¿Pronunciarás las palabras?</span></span>
                <span class="reed-pen" aria-hidden="true"><i></i></span><span class="reed-gem" aria-hidden="true"></span></span>
            </button>
            <button class="obj obj-file" data-system="cthulhu" style="--rest:6deg;--d:.35s" aria-label="Abrir La llamada de Cthulhu">
              <span class="file"><span class="file-photo" aria-hidden="true"><i>${icons.cthulhu || ''}</i></span><span class="file-clip" aria-hidden="true"></span>
                <span class="file-cover"><span class="file-tab">EXP. 1925-03</span><span class="file-label"><b>La llamada<br>de Cthulhu</b><small>Arkham · Massachusetts</small></span>
                  <span class="file-emblem" aria-hidden="true">${icons.cthulhu || ''}</span><span class="file-note">No lo leas<br>en voz alta.</span><span class="file-stamp">ARCHIVADO</span></span></span>
            </button>
            <button class="obj obj-wayfinder" data-system="pathfinder" style="--rest:-6deg;--d:.42s" aria-label="Abrir Pathfinder">
              <span class="wf"><span class="wf-map"><b>Pathfinder</b><small>Segunda edición</small><span class="wf-sea" aria-hidden="true">Mar Interior</span><span class="wf-route" aria-hidden="true"></span><span class="wf-label" aria-hidden="true">Absalom</span><span class="wf-note">Explora, informa,<br>coopera.</span></span>
                <span class="wf-chain" aria-hidden="true"></span><span class="wf-case" aria-hidden="true"><span class="wf-face"><span class="wf-needle"></span><span class="wf-stone"></span></span></span></span>
            </button>
          </div>
          <div class="mesa-decor" aria-label="Objetos de la mesa">
            <span class="dc dc-jarra" data-egg="jarra"><span class="jarra"><i class="jarra-handle"></i><i class="jarra-body"></i><i class="jarra-inside"></i><i class="jarra-foam"></i><i class="jarra-band"></i><i class="jarra-rivets"></i></span></span>
            <span class="dc dc-vela" data-egg="vela"><span class="vela"><i class="vela-glow"></i><i class="vela-plate"></i><i class="vela-shadow"></i><i class="vela-wax"></i><i class="vela-pool"></i><i class="vela-wick"></i><i class="vela-flame"></i><i class="vela-smoke"></i></span></span>
            <span class="dc dc-esferas" data-egg="esferas"><span class="sphere-pouch"><i class="pouch-body"></i><i class="pouch-mouth"></i><i class="pouch-cord cord-left"></i><i class="pouch-cord cord-right"></i><i class="storm-sphere sphere-0" style="--gem:#9be5ff;--phase:0s"><span class="sphere-gem"></span></i><i class="storm-sphere sphere-1" style="--gem:#ffd783;--phase:0.23s"><span class="sphere-gem"></span></i><i class="storm-sphere sphere-2" style="--gem:#a8f0bf;--phase:0.46s"><span class="sphere-gem"></span></i><i class="storm-sphere sphere-3" style="--gem:#c4acff;--phase:0.6900000000000001s"><span class="sphere-gem"></span></i><i class="storm-sphere sphere-4" style="--gem:#9be5ff;--phase:0.92s"><span class="sphere-gem"></span></i><i class="storm-sphere sphere-5" style="--gem:#ffd783;--phase:1.1500000000000001s"><span class="sphere-gem"></span></i><i class="storm-sphere sphere-6" style="--gem:#b2efff;--phase:1.3800000000000001s"><span class="sphere-gem"></span></i><i class="pouch-lip"></i></span></span>
            <span class="dc dc-pergamino" data-egg="pergamino"><span class="pergamino"><i class="pergamino-sheet"></i><i class="pergamino-roll"></i><i class="pergamino-seal"></i></span></span>
            <span class="dc dc-bolsa" data-egg="bolsa" aria-haspopup="dialog"><span class="bolsa"><i class="bolsa-cuerpo"></i><i class="bolsa-cuello"></i><i class="bolsa-cordon"></i></span></span>
            <span class="mesa-eyes"><i></i><i></i></span>
          </div>
        </div>`;
        decorate(hub.querySelector('.mesa'));
        const layout = hub.querySelector('.mesa-objects');
        [['jarra','dnd'],['vela','vampire-da'],['esferas','tormentas'],['bolsa','pathfinder'],['pergamino','cthulhu']].forEach(([egg,system]) => {
          layout.querySelector('[data-system="'+system+'"]').after(hub.querySelector('[data-egg="'+egg+'"]'));
        });
        // Cada objeto conserva un espacio propio, también durante su animación.
        [...layout.children].forEach(object => {
          const slot = document.createElement('div');
          slot.className = 'mesa-slot' + (object.matches('.dc') ? ' mesa-slot-decor' : '');
          object.before(slot); slot.append(object);
        });
        const decorationTable = hub.querySelector('.mesa');
        import('./decor-models.js?v=3').then(module => { if (decorationTable.isConnected) module.mount(decorationTable); }).catch(error => console.warn('Atrezo 3D no disponible; se conserva la vista compatible.', error));
        hub.querySelector('[data-profile]').addEventListener('click', () => {
          away();
          if (window.NEXO_PROFILE) window.NEXO_PROFILE.open({ onExit: openHub });
        });
        const launch = {
          traveller: () => { hub.hidden = true; document.documentElement.classList.add('nexo-system-selected'); },
          dnd: () => window.NEXO_DND ? window.NEXO_DND.open({ onExit: openHub }) : render('dnd'),
          vampire: () => window.NEXO_VAMPIRE ? window.NEXO_VAMPIRE.open({ era: 'v20', onExit: openHub }) : render('vampire'),
          'vampire-da': () => window.NEXO_VAMPIRE ? window.NEXO_VAMPIRE.open({ era: 'da', onExit: openHub }) : render('vampire'),
          tormentas: () => window.NEXO_TORMENTAS ? window.NEXO_TORMENTAS.open({ onExit: openHub }) : render('tormentas'),
          cthulhu: () => window.NEXO_CTHULHU ? window.NEXO_CTHULHU.open({ onExit: openHub }) : render('cthulhu'),
          pathfinder: () => window.NEXO_PATHFINDER ? window.NEXO_PATHFINDER.open({ onExit: openHub }) : render('pathfinder')
        };
        for (const button of layout.querySelectorAll('[data-system]')) {
          let reflectionFrame = 0;
          button.addEventListener('pointermove', event => {
            if (event.pointerType !== 'mouse' || reducedMotion.matches || decorationTable.classList.contains('is-picking')) return;
            cancelAnimationFrame(reflectionFrame);
            reflectionFrame = requestAnimationFrame(() => {
              if (!button.isConnected) return;
              const rect = button.getBoundingClientRect();
              const x = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
              const y = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
              button.style.setProperty('--tilt-x', (y * -4).toFixed(2) + 'deg');
              button.style.setProperty('--tilt-y', (x * 5).toFixed(2) + 'deg');
              button.style.setProperty('--glint-x', (26 + x * 24).toFixed(1) + '%');
              button.style.setProperty('--glint-y', (17 + y * 18).toFixed(1) + '%');
            });
          }, { passive: true });
          button.addEventListener('pointerleave', () => {
            cancelAnimationFrame(reflectionFrame);
            for (const property of ['--tilt-x', '--tilt-y', '--glint-x', '--glint-y']) button.style.removeProperty(property);
          });
          button.addEventListener('click', () => {
            if (decorationTable.classList.contains('is-picking')) return;
            const open = () => {
              if (!button.isConnected || hub.hidden) return;
              away();
              launch[button.dataset.system]();
            };
            if (reducedMotion.matches) { open(); return; }
            cancelAnimationFrame(reflectionFrame);
            button.classList.add('is-picked');
            decorationTable.classList.add('is-picking');
            const lift = button.getAnimations?.().find(animation => animation.animationName === 'mesa-pick');
            if (lift) lift.finished.then(open, open);
            else open();
          });
        }
        return;
      }
      hub.innerHTML = '<header class="sys-top"><button class="sys-brand" data-home aria-label="Volver al selector de universos"><span class="sys-orbit">N</span><span><b>NEXO</b><small>TERMINAL DE SISTEMAS DE ROL</small></span></button><span class="sys-status"><i></i> EN PREPARACIÓN</span></header><main class="sys-main sys-coming"><p class="sys-kicker">NEXO / ' + labels[view] + '</p><span class="sys-icon">⌑</span><h1>' + labels[view] + '</h1><p class="sys-intro">Este módulo aún no está instalado. Aquí añadiremos sus herramientas cuando empecemos ese reglamento.</p><button class="sys-back" data-home>← VOLVER A SISTEMAS</button></main>';
      hub.querySelectorAll('[data-home]').forEach(button => button.addEventListener('click', openHub));
    }

    // Atrezo de la mesa: objetos de adorno que esconden pequeñas sorpresas al tocarlos.
    // No abren nada ni salen de la mesa; con movimiento reducido cambian de estado sin animarse.
    const pick = list => list[Math.floor(Math.random() * list.length)];
    const NOTES = ['Coge uno de la mesa.', 'Tira iniciativa.', 'El máster siempre tiene razón.', 'Nadie se separa del grupo.', '¿Quién trae los aperitivos?', 'No abras esa puerta.', 'Un natural 20 lo arregla todo.', 'Las fichas, a lápiz.'];
    const RUMORS = ['Dicen que el posadero fue aventurero.', 'Hay un dragón al norte. O eso dicen.', 'No te fíes del bardo.', 'El mapa está mal a propósito.', 'Alguien ha visto luces en la cripta.'];
    // Bolsa de dados: una ventana para juntar en la mano los dados que se quieren tirar
    // (tipo y cantidad, y un modificador) y lanzarlos con el lanzador común de NEXO_DICE.
    const BAG_SIDES = [4, 6, 8, 10, 12, 20, 100];
    const BAG_MAX = 40;
    const DIE_SHAPES = {
      4: '<polygon points="20,4 36,34 4,34"/><path d="M20 4 20 24M4 34 20 24 36 34"/>',
      6: '<rect x="6" y="6" width="28" height="28" rx="5"/><path d="M12 12h0M28 28h0M20 20h0" stroke-width="5" stroke-linecap="round"/>',
      8: '<polygon points="20,3 36,20 20,37 4,20"/><path d="M4 20h32"/>',
      10: '<polygon points="20,3 35,17 20,37 5,17"/><path d="M5 17 20 23 35 17M20 23v14"/>',
      12: '<polygon points="20,3 37,15 30,35 10,35 3,15"/><polygon points="20,11 28,17 25,27 15,27 12,17"/>',
      20: '<polygon points="20,2 36,11 36,29 20,38 4,29 4,11"/><polygon points="20,9 30,26 10,26"/><path d="M20 2v7M4 29l6-3M36 29l-6-3"/>',
      100: '<polygon points="20,3 35,17 20,37 5,17"/><path d="M5 17 20 23 35 17M20 23v14"/>'
    };
    const dieSvg = sides => `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">${DIE_SHAPES[sides]}</svg>`;
    const bag = { counts: Object.fromEntries(BAG_SIDES.map(sides => [sides, 0])), mod: 0 };
    bag.counts[20] = 1;
    let bagDialog = null;
    function openBag(origin) {
      if (!bagDialog) bagDialog = buildBag();
      if (bagDialog.open) return;
      paintBag();
      bagDialog.returnValue = '';
      bagDialog.showModal();
      bagDialog.querySelector('[data-add="20"]').focus();
      // «Atrás» cierra la bolsa antes de salir de la mesa.
      bagDialog.dataset.byBack = '';
      window.NEXO_NAV.sub(() => { bagDialog.dataset.byBack = '1'; bagDialog.close(); });
      bagDialog.origin = origin;
    }
    function buildBag() {
      const dialog = document.createElement('dialog');
      dialog.className = 'mesa-bolsa';
      dialog.setAttribute('aria-labelledby', 'mesaBolsaTitulo');
      dialog.innerHTML = `<div class="bolsa-panel">
        <header class="bolsa-head"><div><h2 id="mesaBolsaTitulo">Bolsa de dados</h2><p>Toca un dado para cogerlo. Tócalo en la mano para soltarlo.</p></div>
          <button type="button" class="bolsa-cerrar" data-close aria-label="Cerrar la bolsa">×</button></header>
        <ul class="bolsa-dados">${BAG_SIDES.map((sides, i) => `<li style="--i:${i}">
          <button type="button" class="bolsa-dado" data-add="${sides}">${dieSvg(sides)}<b>d${sides === 100 ? '%' : sides}</b><span class="bolsa-cuenta" data-count="${sides}" aria-hidden="true"></span></button>
          <button type="button" class="bolsa-quitar" data-remove="${sides}" aria-label="Soltar un d${sides}">−</button></li>`).join('')}</ul>
        <div class="bolsa-mano" aria-label="Dados en la mano" role="group" data-hand></div>
        <div class="bolsa-pie">
          <div class="bolsa-mod" role="group" aria-label="Modificador"><span>Modificador</span>
            <button type="button" data-mod="-1" aria-label="Restar uno al modificador">−</button><output data-mod-value>+0</output><button type="button" data-mod="1" aria-label="Sumar uno al modificador">+</button></div>
          <p class="bolsa-formula" data-formula aria-live="polite"></p>
          <div class="bolsa-acciones"><button type="button" class="bolsa-vaciar" data-clear>Vaciar</button><button type="button" class="bolsa-tirar" data-throw>Tirar</button></div>
        </div></div>`;
      document.body.append(dialog);
      const total = () => BAG_SIDES.reduce((sum, sides) => sum + bag.counts[sides], 0);
      const change = (sides, delta) => {
        const next = Math.max(0, bag.counts[sides] + delta);
        if (delta > 0 && total() >= BAG_MAX) return;
        bag.counts[sides] = next;
        paintBag(delta > 0 ? sides : null);
      };
      dialog.addEventListener('click', event => {
        const target = event.target.closest('button');
        if (event.target === dialog) { dialog.close(); return; }
        if (!target) return;
        if (target.dataset.add) change(Number(target.dataset.add), 1);
        else if (target.dataset.remove) change(Number(target.dataset.remove), -1);
        else if (target.dataset.drop) change(Number(target.dataset.drop), -1);
        else if (target.dataset.mod) { bag.mod = Math.max(-20, Math.min(20, bag.mod + Number(target.dataset.mod))); paintBag(); }
        else if ('clear' in target.dataset) { BAG_SIDES.forEach(sides => { bag.counts[sides] = 0; }); bag.mod = 0; paintBag(); }
        else if ('close' in target.dataset) dialog.close();
        else if ('throw' in target.dataset) throwBag();
        // Si el botón pulsado desaparece al repintar, el foco vuelve al dado de la bolsa.
        const sides = target.dataset.drop || target.dataset.remove;
        if (sides && (!target.isConnected || target.hidden)) dialog.querySelector(`[data-add="${sides}"]`).focus();
      });
      dialog.addEventListener('close', () => {
        if (!dialog.dataset.byBack) window.NEXO_NAV.drop();
        dialog.dataset.byBack = '';
      });
      return dialog;
    }
    function bagFormula() {
      const parts = BAG_SIDES.filter(sides => bag.counts[sides]).map(sides => `${bag.counts[sides]}d${sides}`);
      if (bag.mod) parts.push(String(Math.abs(bag.mod)));
      return parts.map((part, i) => (i === parts.length - 1 && bag.mod && parts.length > 1 ? (bag.mod < 0 ? ' − ' : ' + ') : i ? ' + ' : '') + part).join('');
    }
    function paintBag(added = null) {
      const dialog = bagDialog;
      const count = BAG_SIDES.reduce((sum, sides) => sum + bag.counts[sides], 0);
      for (const sides of BAG_SIDES) {
        const n = bag.counts[sides];
        const badge = dialog.querySelector(`[data-count="${sides}"]`);
        badge.textContent = n ? '×' + n : '';
        const tile = dialog.querySelector(`[data-add="${sides}"]`);
        tile.classList.toggle('is-picked', n > 0);
        tile.disabled = count >= BAG_MAX;
        tile.setAttribute('aria-label', `Coger un d${sides}${n ? `, llevas ${n}` : ''}`);
        dialog.querySelector(`[data-remove="${sides}"]`).hidden = !n;
      }
      const hand = dialog.querySelector('[data-hand]');
      hand.innerHTML = count ? BAG_SIDES.flatMap(sides => Array.from({ length: bag.counts[sides] }, (_, i) =>
        `<button type="button" class="bolsa-chip${added === sides && i === bag.counts[sides] - 1 ? ' is-new' : ''}" data-drop="${sides}" aria-label="Soltar un d${sides}">${dieSvg(sides)}<small>${sides === 100 ? '%' : sides}</small></button>`)).join('')
        : '<p class="bolsa-vacia">La mano está vacía.</p>';
      dialog.querySelector('[data-mod-value]').textContent = (bag.mod < 0 ? '−' : '+') + Math.abs(bag.mod);
      const formula = bagFormula();
      dialog.querySelector('[data-formula]').textContent = count ? formula : 'Elige al menos un dado.';
      const button = dialog.querySelector('[data-throw]');
      button.disabled = !count;
      button.textContent = count === 1 ? 'Tirar el dado' : count ? `Tirar ${count} dados` : 'Tirar';
    }
    function throwBag() {
      const expr = BAG_SIDES.filter(sides => bag.counts[sides]).map(sides => `${bag.counts[sides]}d${sides}`).join('+')
        + (bag.mod ? (bag.mod > 0 ? '+' : '-') + Math.abs(bag.mod) : '');
      if (!expr || /^[+-]/.test(expr)) return;
      bagDialog.close();
      window.NEXO_DICE?.roll('mesa', { expr, label: 'Bolsa de dados' }, { theme: 'mesa' });
    }

    function decorate(table) {
      const timers = new WeakMap();
      const say = (item, text) => {
        let bubble = item.querySelector('.dc-say');
        if (!bubble) { bubble = document.createElement('span'); bubble.className = 'dc-say'; bubble.setAttribute('role', 'status'); item.append(bubble); }
        bubble.textContent = text;
        bubble.classList.remove('is-on'); void bubble.offsetWidth; bubble.classList.add('is-on');
        clearTimeout(timers.get(item));
        timers.set(item, setTimeout(() => bubble.classList.remove('is-on'), 2400));
      };
      const poke = item => { item.classList.remove('is-poke'); void item.offsetWidth; item.classList.add('is-poke'); };
      let sips = 0, rumor = -1;
      const eggs = {
        esferas(item) {
          const charged = item.classList.toggle('is-infused');
          item.setAttribute('aria-pressed', String(charged));
          say(item, charged ? 'Vida antes que muerte. Fuerza antes que debilidad. Viaje antes que destino.' : 'La luz tormentosa se desvanece…');
        },
        jarra(item) {
          poke(item);
          if (item.classList.contains('is-empty')) { item.classList.remove('is-empty'); sips = 0; say(item, 'Otra ronda, posadero.'); return; }
          sips += 1;
          if (sips >= 3) { item.classList.add('is-empty'); say(item, '¡Hip!'); }
          else say(item, sips === 1 ? '¡Salud!' : '¡Por la compañía!');
        },
        vela(item) {
          const out = item.classList.toggle('is-out');
          table.classList.toggle('is-dark', out);
          table.querySelector('.mesa-eyes')?.classList.remove('is-gone');
          say(item, out ? 'Fuuu…' : 'Que se haga la luz.');
        },
        bolsa(item) {
          poke(item);
          openBag(item);
        },
        pergamino(item) {
          poke(item);
          rumor = (rumor + 1) % RUMORS.length;
          say(item, RUMORS[rumor]);
        },
        pluma(item) {
          poke(item);
          const note = table.querySelector('[data-note]');
          if (note) note.textContent = pick(NOTES.filter(text => text !== note.textContent));
        }
      };
      const names = {esferas:'Infundir luz tormentosa en las esferas', jarra:'Beber de la jarra', vela:'Encender o apagar la vela', bolsa:'Abrir la bolsa de dados', planta:'Explorar la planta', monedas:'Lanzar una moneda', pergamino:'Leer un rumor', pluma:'Escribir con la pluma'};
      table.querySelectorAll('[data-egg]').forEach(item => {
        item.removeAttribute('aria-hidden'); item.tabIndex = 0; item.setAttribute('role', 'button');
        item.setAttribute('aria-label', names[item.dataset.egg]);
        if (item.dataset.egg === 'esferas') item.setAttribute('aria-pressed', 'false');
        item.addEventListener('click', () => eggs[item.dataset.egg](item));
        item.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); item.click(); } });
      });
      const eyes = table.querySelector('.mesa-eyes');
      eyes?.addEventListener('click', () => { eyes.classList.add('is-gone'); say(eyes, '…'); });
      table.addEventListener('animationend', event => { if (event.animationName.startsWith('dc-')) event.target.closest('.dc')?.classList.remove('is-poke'); });
    }

    // El reloj del móvil marca la hora real.
    setInterval(() => {
      const clock = hub.querySelector('[data-clock]');
      if (clock) clock.textContent = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }, 20000);

    render();
    // Actualiza el estado de la cuenta y las iniciales del perfil al iniciar sesión.
    document.addEventListener('nexo:account-ready', () => render());
    // La mesa está lista bajo la pantalla de carga, así que nunca asoma el listado de Traveller.
    // La pantalla de cuenta queda por encima y, al cerrarse, deja ver la mesa.
    hub.hidden = false;
    // Los objetos esperan a que se desvanezca la carga para caer sobre la mesa.
    const intro = document.getElementById('introScreen');
    if (intro) {
      hub.style.setProperty('--intro-wait', '1.75s');
      new MutationObserver((_, observer) => {
        if (intro.isConnected) return;
        observer.disconnect();
        setTimeout(() => hub.style.removeProperty('--intro-wait'), 1500);
      }).observe(document.body, { childList: true });
    }
    const authGate = document.getElementById('authGate');
    if (authGate) new MutationObserver(([change]) => {
      if (change.oldValue === null && authGate.hidden) openHub();
    }).observe(authGate, { attributes: true, attributeFilter: ['hidden'], attributeOldValue: true });

    const homeBrand = document.getElementById('nexoHome');
    if (homeBrand) {
      homeBrand.addEventListener('click', event => {
        if (hub.hidden) {
          event.preventDefault();
          openHub();
        }
      });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
