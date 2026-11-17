(() => {
  const start = () => {
    if (document.getElementById('nexoSystems')) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './src/nexo/terminal-shell.css?v=1';
    const table = document.createElement('link');
    table.rel = 'stylesheet';
    table.href = './src/nexo/mesa.css?v=9';
    document.head.append(stylesheet, table);

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
        const name = user?.user_metadata?.display_name || '';
        const initials = (name || user?.email || 'N').trim().slice(0, 2).toLocaleUpperCase('es');
        const now = new Date();
        const clock = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const date = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        hub.innerHTML = `<div class="mesa">
          <div class="mesa-light" aria-hidden="true"></div>
          <header class="mesa-head">
            <div class="mesa-note"><span class="mesa-tape" aria-hidden="true"></span><h1>¿A qué jugamos esta noche?</h1><p data-note>Coge uno de la mesa.</p></div>
            <span class="dc dc-tintero" data-egg="pluma" aria-hidden="true"><span class="tintero"><i class="tintero-blot"></i><i class="tintero-bottle"></i><i class="tintero-quill"></i></span></span>
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
          <div class="mesa-decor" aria-label="Objetos de la mesa">
            <span class="dc dc-jarra" data-egg="jarra"><span class="jarra"><i class="jarra-handle"></i><i class="jarra-body"></i><i class="jarra-inside"></i><i class="jarra-foam"></i><i class="jarra-band"></i><i class="jarra-rivets"></i></span></span>
            <span class="dc dc-vela" data-egg="vela"><span class="vela"><i class="vela-glow"></i><i class="vela-plate"></i><i class="vela-shadow"></i><i class="vela-wax"></i><i class="vela-pool"></i><i class="vela-wick"></i><i class="vela-flame"></i><i class="vela-smoke"></i></span></span>
            <span class="dc dc-esferas" data-egg="esferas"><span class="sphere-pouch"><i class="pouch-body"></i><i class="pouch-mouth"></i><i class="pouch-cord cord-left"></i><i class="pouch-cord cord-right"></i><i class="storm-sphere sphere-0" style="--gem:#9be5ff;--phase:0s"><span class="sphere-gem"></span></i><i class="storm-sphere sphere-1" style="--gem:#ffd783;--phase:0.23s"><span class="sphere-gem"></span></i><i class="storm-sphere sphere-2" style="--gem:#a8f0bf;--phase:0.46s"><span class="sphere-gem"></span></i><i class="storm-sphere sphere-3" style="--gem:#c4acff;--phase:0.6900000000000001s"><span class="sphere-gem"></span></i><i class="storm-sphere sphere-4" style="--gem:#9be5ff;--phase:0.92s"><span class="sphere-gem"></span></i><i class="storm-sphere sphere-5" style="--gem:#ffd783;--phase:1.1500000000000001s"><span class="sphere-gem"></span></i><i class="storm-sphere sphere-6" style="--gem:#b2efff;--phase:1.3800000000000001s"><span class="sphere-gem"></span></i><i class="pouch-lip"></i></span></span>
            <span class="dc dc-pergamino" data-egg="pergamino"><span class="pergamino"><i class="pergamino-roll"></i><i class="pergamino-seal"></i></span></span>
            <span class="dc dc-dados" data-egg="dados"><span class="poly-die poly-d20" data-sides="20"><b>20</b></span><span class="poly-die poly-d8" data-sides="8"><b>8</b></span><span class="poly-die poly-d4" data-sides="4"><b>4</b></span></span>
            <span class="mesa-eyes"><i></i><i></i></span>
          </div>
        </div>`;
        decorate(hub.querySelector('.mesa'));
        const layout = hub.querySelector('.mesa-objects');
        [['jarra','dnd'],['vela','vampire-da'],['esferas','tormentas'],['dados','pathfinder'],['pergamino','cthulhu']].forEach(([egg,system]) => {
          layout.querySelector('[data-system="'+system+'"]').after(hub.querySelector('[data-egg="'+egg+'"]'));
        });
        const currentTable = hub.querySelector('.mesa');
        import('./mesa-models.js?v=1').then(module => { if (currentTable.isConnected) module.mount(currentTable); }).catch(error => console.warn('Mesa 3D no disponible; se conserva la vista compatible.', error));
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

    // Atrezo de la mesa: objetos de adorno que esconden pequeñas sorpresas al tocarlos.
    // No abren nada ni salen de la mesa; con movimiento reducido cambian de estado sin animarse.
    const pick = list => list[Math.floor(Math.random() * list.length)];
    const NOTES = ['Coge uno de la mesa.', 'Tira iniciativa.', 'El máster siempre tiene razón.', 'Nadie se separa del grupo.', '¿Quién trae los aperitivos?', 'No abras esa puerta.', 'Un natural 20 lo arregla todo.', 'Las fichas, a lápiz.'];
    const RUMORS = ['Dicen que el posadero fue aventurero.', 'Hay un dragón al norte. O eso dicen.', 'No te fíes del bardo.', 'El mapa está mal a propósito.', 'Alguien ha visto luces en la cripta.'];
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
        dados(item) {
          const results = [...item.querySelectorAll('[data-sides]')].map(die => {
            const result = 1 + Math.floor(Math.random() * Number(die.dataset.sides));
            die.querySelector('b').textContent = result;
            return 'd' + die.dataset.sides + ': ' + result;
          });
          poke(item); say(item, results.join(' · '));
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
      const names = {esferas:'Infundir luz tormentosa en las esferas', jarra:'Beber de la jarra', vela:'Encender o apagar la vela', dados:'Lanzar los dados', planta:'Explorar la planta', monedas:'Lanzar una moneda', pergamino:'Leer un rumor', pluma:'Escribir con la pluma'};
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

    // La mesa sigue ligeramente al puntero y el reloj del móvil marca la hora real.
    hub.addEventListener('pointermove', event => {
      const table = hub.querySelector('.mesa');
      if (!table || event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
