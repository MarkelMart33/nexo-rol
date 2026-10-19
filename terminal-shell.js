(() => {
  const start = () => {
    if (document.getElementById('nexoSystems')) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './terminal-shell.css?v=1';
    document.head.append(stylesheet);

    const hub = document.createElement('section');
    hub.id = 'nexoSystems';
    hub.className = 'nexo-systems';
    hub.hidden = true;
    hub.setAttribute('aria-label', 'Selector de sistemas NEXO');
    document.body.append(hub);
    const labels = { dnd: 'NEXO D&D', vampire: 'NEXO VAMPIRO' };

    function openHub() {
      render('home');
      hub.hidden = false;
      document.documentElement.classList.remove('nexo-system-selected');
    }

    function render(view = 'home') {
      if (view === 'home') {
        hub.innerHTML = '<header class="sys-top"><div class="sys-brand"><span class="sys-orbit">N</span><span><b>NEXO</b><small>TERMINAL DE SISTEMAS DE ROL</small></span></div><span class="sys-status"><i></i> TERMINAL LOCAL</span></header><main class="sys-main"><p class="sys-kicker">PLATAFORMA DE CAMPAÑA · MULTISISTEMA</p><h1>Un terminal.<br><em>Todos tus universos.</em></h1><p class="sys-intro">Elige el sistema de juego para abrir las herramientas de tu campaña.</p><div class="sys-grid"><button class="sys-card sys-traveller" data-system="traveller"><span class="sys-icon">⌖</span><span class="sys-tag">SISTEMA DISPONIBLE</span><b>NEXO TRAVELLER</b><small>Comercio, partidas, inventario, mapa y reglas.</small><span class="sys-open">ABRIR SISTEMA →</span></button><button class="sys-card sys-dnd" data-system="dnd"><span class="sys-icon">✧</span><span class="sys-tag">MÓDULO EN PREPARACIÓN</span><b>NEXO D&amp;D</b><small>Un espacio para tus aventuras de fantasía.</small><span class="sys-open">VER MÓDULO →</span></button><button class="sys-card sys-vampire" data-system="vampire"><span class="sys-icon">◈</span><span class="sys-tag">SISTEMA DISPONIBLE</span><b>NEXO VAMPIRO</b><small>Creador de personajes de La Mascarada 20º Aniversario.</small><span class="sys-open">ABRIR SISTEMA →</span></button></div><footer class="sys-footer"><span>NEXO · SISTEMAS DE ROL</span><span>SELECCIONA UN MÓDULO</span></footer></main>';
        hub.querySelector('[data-system="traveller"]').addEventListener('click', () => {
          hub.hidden = true;
          document.documentElement.classList.add('nexo-system-selected');
        });
        hub.querySelector('[data-system="dnd"]').addEventListener('click', () => render('dnd'));
        hub.querySelector('[data-system="vampire"]').addEventListener('click', () => {
          if (window.NEXO_VAMPIRE) window.NEXO_VAMPIRE.open({ onExit: openHub });
          else render('vampire');
        });
        return;
      }
      hub.innerHTML = '<header class="sys-top"><button class="sys-brand" data-home aria-label="Volver al selector de universos"><span class="sys-orbit">N</span><span><b>NEXO</b><small>TERMINAL DE SISTEMAS DE ROL</small></span></button><span class="sys-status"><i></i> EN PREPARACIÓN</span></header><main class="sys-main sys-coming"><p class="sys-kicker">NEXO / ' + labels[view] + '</p><span class="sys-icon">⌑</span><h1>' + labels[view] + '</h1><p class="sys-intro">Este módulo aún no está instalado. Aquí añadiremos sus herramientas cuando empecemos ese reglamento.</p><button class="sys-back" data-home>← VOLVER A SISTEMAS</button></main>';
      hub.querySelectorAll('[data-home]').forEach(button => button.addEventListener('click', openHub));
    }

    render();
    let initialHubShown = false;
    const showHub = () => {
      if (initialHubShown || document.getElementById('introScreen')) return;
      initialHubShown = true;
      hub.hidden = false;
    };
    new MutationObserver(showHub).observe(document.body, { childList: true, subtree: true });
    window.setTimeout(showHub, 2400);

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
