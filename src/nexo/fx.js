/*
 * NEXO · Efectos comunes de todas las secciones (src/nexo/fx.css pone el aspecto).
 * - Entrada escalonada de cada vista nueva (lista, ficha, pestaña) y aparición al hacer scroll.
 * - Brillo que sigue al puntero e inclinación suave en tarjetas, casillas y botones.
 * - Onda al pulsar y sombra de la cabecera al desplazar la página.
 * - La lámpara de la mesa sigue al puntero.
 * Con movimiento reducido no se anima nada: solo quedan las sombras y el relieve del CSS.
 */
(() => {
  const root = document.documentElement;
  root.classList.add('fx');
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const PREFIXES = ['dnd', 'vtm', 'tor', 'cth', 'pf'];
  const HOSTS = PREFIXES.map(p => `.${p}`).join(',');
  const each = suffix => PREFIXES.map(p => `.${p}-${suffix}`).join(',');
  // Piezas que entran escalonadas al cambiar de vista.
  const PIECES = [each('editor-head'), each('panel'), each('card'), each('empty'), each('tracker'), '.ap-hero', '.ap-tile', '.ap-appbar', '.jg-panel', each('actions')].join(',');
  // Piezas con brillo bajo el puntero; las de TILT además se inclinan.
  const TILT = [each('card'), '.ap-tile', '.app-tile', '.trv-card'].join(',');
  const LIT = [TILT, each('button'), '.nd-fab', '.confirm-button', '.cancel-button', '.small-action', '.nexo-button'].join(',');
  const PRESS = [LIT, '.ap-tab', each('chip'), '.ap-appbar-home'].join(',');

  // ───────────── Entrada de vistas ─────────────
  const EASE = 'cubic-bezier(.16,.84,.24,1)';
  const seen = new WeakMap();
  let reveal = null;
  function signature(host) {
    const tab = host.querySelector('.ap-tab.is-active')?.dataset.apTab || '';
    const sheet = host.querySelector(each('editor-head')) ? 'ficha' : '';
    const tool = host.querySelector('.ap-appbar-copy b')?.textContent || (host.querySelector('.ap-hero') ? 'inicio' : '');
    return `${tab}|${sheet}|${tool}`;
  }
  function rise(node, delay) {
    node.animate([
      { opacity: 0, transform: 'translateY(22px) scale(.985)', filter: 'blur(3px)' },
      { opacity: 1, transform: 'none', filter: 'none' }
    ], { duration: 560, delay, easing: EASE, fill: 'backwards' });
  }
  function enter(host) {
    reveal?.disconnect();
    reveal = null;
    if (still.matches) return;
    const limit = host.clientHeight || innerHeight;
    const later = [];
    let n = 0;
    host.querySelectorAll(PIECES).forEach(node => {
      // Las piezas anidadas entran con su contenedor.
      if (node.parentElement?.closest(PIECES)) return;
      const top = node.getBoundingClientRect().top;
      if (top < limit) rise(node, Math.min(n++, 9) * 60);
      else later.push(node);
    });
    const title = host.querySelector('h1');
    title?.animate([
      { opacity: 0, letterSpacing: '.14em', filter: 'blur(8px)' },
      { opacity: 1, filter: 'none' }
    ], { duration: 700, easing: EASE });
    if (!later.length || !('IntersectionObserver' in window)) return;
    reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveal?.unobserve(entry.target);
      rise(entry.target, 0);
    }), { root: host, rootMargin: '0px 0px -8% 0px' });
    later.forEach(node => reveal.observe(node));
  }
  function watch(host) {
    if (seen.has(host)) return;
    seen.set(host, '');
    const check = () => {
      if (host.hidden) { seen.set(host, ''); return; }
      const now = signature(host);
      if (now === seen.get(host)) return;
      seen.set(host, now);
      enter(host);
    };
    // Las pestañas y herramientas cambian dentro de la página sin tocar los hijos directos.
    new MutationObserver(check).observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    check();
  }
  const scan = () => document.querySelectorAll(HOSTS).forEach(node => { if (node.parentElement === document.body) watch(node); });
  new MutationObserver(scan).observe(document.body, { childList: true });
  scan();

  // ───────────── Brillo e inclinación bajo el puntero ─────────────
  let lit = null;
  function unlight() {
    if (!lit) return;
    lit.node.querySelector(':scope > .fx-glare')?.remove();
    if (lit.tilt) lit.node.style.removeProperty('transform');
    lit = null;
  }
  function anchor(node) {
    if (getComputedStyle(node).position === 'static') node.style.position = 'relative';
  }
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !hover.matches || still.matches) return;
    root.style.setProperty('--fx-lx', `${(event.clientX / innerWidth * 100).toFixed(1)}%`);
    root.style.setProperty('--fx-ly', `${(event.clientY / innerHeight * 100).toFixed(1)}%`);
    const node = event.target.closest?.(LIT);
    if (node !== lit?.node) {
      unlight();
      if (node && !node.disabled) {
        anchor(node);
        const glare = document.createElement('span');
        glare.className = 'fx-glare';
        glare.setAttribute('aria-hidden', 'true');
        node.append(glare);
        lit = { node, glare, tilt: node.matches(TILT) };
      }
    }
    if (!lit) return;
    const box = lit.node.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    lit.glare.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
    lit.glare.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
    if (lit.tilt) lit.node.style.transform = `perspective(900px) rotateX(${((.5 - y) * 7).toFixed(2)}deg) rotateY(${((x - .5) * 7).toFixed(2)}deg) translateY(-4px)`;
  }, { passive: true });
  root.addEventListener('mouseleave', unlight);
  window.addEventListener('blur', unlight);

  // ───────────── Onda al pulsar ─────────────
  document.addEventListener('pointerdown', event => {
    if (still.matches || event.button > 0) return;
    const node = event.target.closest?.(PRESS);
    if (!node || node.disabled) return;
    anchor(node);
    const box = node.getBoundingClientRect();
    const wave = document.createElement('span');
    wave.className = 'fx-ripple';
    wave.setAttribute('aria-hidden', 'true');
    const size = Math.max(box.width, box.height) * 2.2;
    wave.style.setProperty('--rx', `${event.clientX - box.left}px`);
    wave.style.setProperty('--ry', `${event.clientY - box.top}px`);
    wave.style.setProperty('--rs', `${size}px`);
    node.append(wave);
    setTimeout(() => wave.remove(), 650);
  }, { passive: true });

  // ───────────── Cabecera con sombra al desplazar ─────────────
  document.addEventListener('scroll', event => {
    const node = event.target;
    if (node?.nodeType !== 1 || !node.matches(`${HOSTS},.nexo-profile`)) return;
    node.classList.toggle('fx-scrolled', node.scrollTop > 12);
  }, { capture: true, passive: true });
})();
