(() => {
  const start = () => {
    if (document.getElementById('nexoSystems')) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './src/nexo/terminal-shell.css?v=1';
    const table = document.createElement('link');
    table.rel = 'stylesheet';
    table.href = './src/nexo/mesa.css?v=4';
    document.head.append(stylesheet, table);

    const hub = document.createElement('section');
    hub.id = 'nexoSystems';
    hub.className = 'nexo-systems';
    hub.hidden = true;
    hub.setAttribute('aria-label', 'Selector de sistemas NEXO');
    document.body.append(hub);
    const labels = { dnd: 'NEXO D&D', vampire: 'NEXO VAMPIRO', tormentas: 'NEXO TORMENTAS', cthulhu: 'NEXO CTHULHU', pathfinder: 'NEXO PATHFINDER' };

    // El botón «atrás» del navegador vuelve a la mesa en lugar de salir de NEXO.
    const away = () => { if (history.state?.nexo !== 'away') history.pushState({ nexo: 'away' }, ''); };
    window.NEXO_NAV = { away };
    window.addEventListener('popstate', () => {
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
      if (history.state?.nexo === 'away') history.back();
      render('home');
      hub.hidden = false;
      document.documentElement.classList.remove('nexo-system-selected');
    }

    function render(view = 'home') {
      if (view === 'home') {
        const icons = window.NEXO_ICONS || {};
        const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        const user = window.NEXO_CLOUD?.user;
        const name = user?.user_metadata?.display_name || '';
        const initials = (name || user?.email || 'N').trim().slice(0, 2).toLocaleUpperCase('es');
        const now = new Date();
        const clock = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const date = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        hub.innerHTML = `<div class="mesa">
          <div class="mesa-light" aria-hidden="true"></div>
          <header class="mesa-head">
            <div class="mesa-note"><span class="mesa-tape" aria-hidden="true"></span><h1>¿A qué jugamos esta noche?</h1><p>Coge uno de la mesa.</p></div>
            <button class="mesa-tag" data-profile aria-label="Abrir tu perfil"><span class="mesa-tag-hole" aria-hidden="true"></span><b>${esc(initials)}</b><small>${esc(user ? (name || 'Tu perfil') : 'Sin cuenta')}</small></button>
          </header>
          <div class="mesa-objects">
            <button class="obj obj-pda" data-system="traveller" style="--rest:-7deg;--d:.05s" aria-label="Abrir Traveller">
              <span class="pda"><span class="pda-antenna" aria-hidden="true"></span><span class="pda-led" aria-hidden="true"></span>
                <span class="pda-screen"><span class="pda-emblem">${icons.traveller || ''}</span><b>TRAVELLER</b><small>Comercio, naves y mapa estelar</small><span class="pda-prompt">&gt; abrir<i>_</i></span></span>
                <span class="pda-keys" aria-hidden="true"><i></i><i></i><i></i></span></span>
            </button>
            <button class="obj obj-book" data-system="dnd" style="--rest:3deg;--d:.2s" aria-label="Abrir Dungeons and Dragons">
              <span class="book"><span class="book-pages" aria-hidden="true"><span>Tus aventureros<br>te esperan junto al fuego.</span></span>
                <span class="book-cover"><span class="book-emblem">${icons.dnd || ''}</span><b>Dungeons<br>&amp; Dragons</b><small>Reglas de 2024</small></span>
                <span class="book-strap" aria-hidden="true"></span></span>
            </button>
            <button class="obj obj-phone" data-system="vampire" style="--rest:9deg;--d:.35s" aria-label="Abrir Vampiro: La Mascarada">
              <span class="phone"><span class="phone-notch" aria-hidden="true"></span>
                <span class="phone-screen"><span class="phone-time" data-clock>${clock}</span><span class="phone-date">${date}</span>
                  <span class="phone-notif"><span class="phone-app">${icons.vampire || ''}</span><span><b>Vampiro: La Mascarada</b><small>Tus vástagos te esperan.</small></span></span>
                  <span class="phone-bar" aria-hidden="true"></span></span></span>
            </button>
            <button class="obj obj-codex" data-system="vampire-da" style="--rest:-4deg;--d:.5s" aria-label="Abrir Vampiro: Edad Oscura">
              <span class="codex"><span class="codex-page"><span class="codex-cap" aria-hidden="true">V</span><b>Edad Oscura</b><small>Anno Domini MCCXLII</small><span class="codex-lines" aria-hidden="true"></span></span>
                <span class="codex-seal">${icons.vampire || ''}</span><span class="codex-ribbon" aria-hidden="true"></span></span>
            </button>
            <button class="obj obj-reed" data-system="tormentas" style="--rest:-5deg;--d:.65s" aria-label="Abrir El Archivo de las Tormentas">
              <span class="reed"><span class="reed-paper"><span class="reed-emblem">${icons.tormentas || ''}</span><b>El Archivo<br>de las Tormentas</b><small>Juego de rol del Cosmere</small>
                <span class="reed-msg">Se acerca una alta tormenta.<br>¿Pronunciarás las palabras?</span></span>
                <span class="reed-pen" aria-hidden="true"><i></i></span><span class="reed-gem" aria-hidden="true"></span></span>
            </button>
            <button class="obj obj-file" data-system="cthulhu" style="--rest:6deg;--d:.8s" aria-label="Abrir La llamada de Cthulhu">
              <span class="file"><span class="file-photo" aria-hidden="true"><i>${icons.cthulhu || ''}</i></span><span class="file-clip" aria-hidden="true"></span>
                <span class="file-cover"><span class="file-tab">EXP. 1925-03</span><span class="file-label"><b>La llamada<br>de Cthulhu</b><small>Arkham · Massachusetts</small></span>
                  <span class="file-emblem" aria-hidden="true">${icons.cthulhu || ''}</span><span class="file-note">No lo leas<br>en voz alta.</span><span class="file-stamp">ARCHIVADO</span></span></span>
            </button>
            <button class="obj obj-wayfinder" data-system="pathfinder" style="--rest:-6deg;--d:.95s" aria-label="Abrir Pathfinder">
              <span class="wf"><span class="wf-map"><b>Pathfinder</b><small>Segunda edición</small><span class="wf-sea" aria-hidden="true">Mar Interior</span><span class="wf-route" aria-hidden="true"></span><span class="wf-label" aria-hidden="true">Absalom</span><span class="wf-note">Explora, informa,<br>coopera.</span></span>
                <span class="wf-chain" aria-hidden="true"></span><span class="wf-case" aria-hidden="true"><span class="wf-face"><span class="wf-needle"></span><span class="wf-stone"></span></span></span></span>
            </button>
          </div>
          <div class="mesa-props" aria-hidden="true"><span class="die die-a"><i></i><i></i><i></i><i></i><i></i></span><span class="die die-b"><i></i><i></i><i></i></span><span class="mesa-ring"></span></div>
        </div>`;
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
        // Al elegir, el objeto se acerca a la cámara antes de abrir su sistema.
        hub.querySelectorAll('[data-system]').forEach(button => button.addEventListener('click', () => {
          if (hub.querySelector('.obj.is-picked')) return;
          away();
          if (matchMedia('(prefers-reduced-motion: reduce)').matches) { launch[button.dataset.system](); return; }
          button.classList.add('is-picked');
          hub.querySelector('.mesa').classList.add('is-picking');
          setTimeout(() => launch[button.dataset.system](), 520);
        }));
        return;
      }
      hub.innerHTML = '<header class="sys-top"><button class="sys-brand" data-home aria-label="Volver al selector de universos"><span class="sys-orbit">N</span><span><b>NEXO</b><small>TERMINAL DE SISTEMAS DE ROL</small></span></button><span class="sys-status"><i></i> EN PREPARACIÓN</span></header><main class="sys-main sys-coming"><p class="sys-kicker">NEXO / ' + labels[view] + '</p><span class="sys-icon">⌑</span><h1>' + labels[view] + '</h1><p class="sys-intro">Este módulo aún no está instalado. Aquí añadiremos sus herramientas cuando empecemos ese reglamento.</p><button class="sys-back" data-home>← VOLVER A SISTEMAS</button></main>';
      hub.querySelectorAll('[data-home]').forEach(button => button.addEventListener('click', openHub));
    }

    // La mesa sigue ligeramente al puntero y el reloj del móvil marca la hora real.
    hub.addEventListener('pointermove', event => {
      const table = hub.querySelector('.mesa');
      if (!table || event.pointerType !== 'mouse') return;
      table.style.setProperty('--px', (event.clientX / innerWidth - .5).toFixed(3));
      table.style.setProperty('--py', (event.clientY / innerHeight - .5).toFixed(3));
    });
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
