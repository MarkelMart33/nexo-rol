/*
 * NEXO profile: account settings plus quick access to every campaign and character.
 * Opened from the system selector; reads the other modules through their public APIs.
 */
(() => {
  let host = null;
  let exitHandler = null;
  let returnAfterSignIn = false;

  const client = () => window.nexoSupabaseClient || null;
  const user = () => window.NEXO_CLOUD?.user || null;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const displayName = u => u?.user_metadata?.display_name || '';
  const initials = u => (displayName(u) || u?.email || 'N').trim().slice(0, 2).toLocaleUpperCase('es');

  function ensureHost() {
    if (host) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './src/nexo/profile.css?v=1';
    document.head.append(stylesheet);
    host = document.createElement('section');
    host.className = 'nexo-profile';
    host.hidden = true;
    host.setAttribute('aria-label', 'Perfil NEXO');
    document.body.append(host);
  }

  function accountPanel() {
    const u = user();
    if (!u) {
      return `<section class="prf-panel prf-account"><h2>Cuenta</h2><p class="prf-note">Estás usando NEXO sin cuenta: tus partidas y fichas se guardan solo en este dispositivo. Con una cuenta se sincronizan entre tus dispositivos.</p><button class="prf-button" data-sign-in>INICIAR SESIÓN O CREAR CUENTA</button></section>`;
    }
    return `<section class="prf-panel prf-account"><h2>Cuenta</h2>
      <div class="prf-identity"><span class="prf-avatar">${esc(initials(u))}</span><span><b>${esc(displayName(u) || 'Sin nombre visible')}</b><small>${esc(u.email)}</small></span></div>
      <form class="prf-form" data-name-form><label class="prf-field"><span>NOMBRE VISIBLE</span><input name="name" maxlength="40" autocomplete="nickname" value="${esc(displayName(u))}" placeholder="Cómo quieres que te vean"></label><button class="prf-button" type="submit">GUARDAR NOMBRE</button></form>
      <form class="prf-form" data-password-form><label class="prf-field"><span>CONTRASEÑA NUEVA</span><input name="password" type="password" minlength="8" autocomplete="new-password" placeholder="Mínimo 8 caracteres" required></label><label class="prf-field"><span>REPÍTELA</span><input name="confirm" type="password" minlength="8" autocomplete="new-password" required></label><button class="prf-button" type="submit">CAMBIAR CONTRASEÑA</button></form>
      <p class="prf-message" data-account-message aria-live="polite"></p>
      <button class="prf-button ghost" data-sign-out>CERRAR SESIÓN</button></section>`;
  }

  function campaignsPanel() {
    const campaigns = window.NEXO_TRAVELLER?.campaigns() || [];
    const rows = campaigns.map(c => `<button class="prf-row" data-campaign="${esc(c.id)}"><span class="prf-mark is-traveller">⌖</span><span class="prf-copy"><b>${esc(c.name)}</b><small>${esc(c.wallet)} Cr · ${c.characters} ${c.characters === 1 ? 'personaje' : 'personajes'}</small></span><span class="prf-go">ENTRAR →</span></button>`).join('');
    return `<section class="prf-panel"><h2>Campañas de Traveller</h2>${rows || '<p class="prf-note">Aún no tienes campañas.</p>'}<button class="prf-button ghost" data-traveller>${rows ? 'GESTIONAR CAMPAÑAS' : 'CREAR UNA CAMPAÑA'}</button></section>`;
  }

  function charactersPanel() {
    const group = (key, title, api, mark) => {
      const items = api?.list() || [];
      const rows = items.map(ch => `<button class="prf-row" data-character="${key}" data-id="${esc(ch.id)}"><span class="prf-mark is-${key}">${mark}</span><span class="prf-copy"><b>${esc(ch.name || 'Sin nombre')}</b><small>${esc(ch.summary)}</small></span><span class="prf-go">ABRIR →</span></button>`).join('');
      return `<h3>${title}</h3>${rows || '<p class="prf-note">Sin personajes todavía.</p>'}`;
    };
    return `<section class="prf-panel"><h2>Personajes</h2>${group('vampire', 'Vampiro: La Mascarada', window.NEXO_VAMPIRE, '◈')}${group('dnd', 'Dungeons &amp; Dragons', window.NEXO_DND, '✧')}<p class="prf-note">Los personajes de Traveller están dentro de cada campaña.</p></section>`;
  }

  function render() {
    const u = user();
    host.innerHTML = `<header class="sys-top"><button class="sys-brand" data-back aria-label="Volver al selector de sistemas"><span class="sys-orbit">N</span><span><b>NEXO</b><small>TERMINAL DE SISTEMAS DE ROL</small></span></button><span class="sys-status"><i></i> ${u ? 'CUENTA SINCRONIZADA' : 'SIN CUENTA · ESTE DISPOSITIVO'}</span></header>
      <main class="prf-main"><p class="sys-kicker">NEXO / PERFIL</p><h1>Tu <em>perfil</em></h1><div class="prf-grid">${accountPanel()}<div class="prf-stack">${campaignsPanel()}${charactersPanel()}</div></div><button class="sys-back" data-back>← VOLVER A SISTEMAS</button></main>`;
    host.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', close));
    host.querySelector('[data-sign-in]')?.addEventListener('click', signIn);
    host.querySelector('[data-sign-out]')?.addEventListener('click', signOut);
    host.querySelector('[data-name-form]')?.addEventListener('submit', saveName);
    host.querySelector('[data-password-form]')?.addEventListener('submit', savePassword);
    host.querySelector('[data-traveller]').addEventListener('click', () => { hide(); window.NEXO_TRAVELLER?.showCampaigns(); });
    host.querySelectorAll('[data-campaign]').forEach(button => button.addEventListener('click', () => { hide(); window.NEXO_TRAVELLER?.openCampaign(button.dataset.campaign); }));
    host.querySelectorAll('[data-character]').forEach(button => button.addEventListener('click', () => {
      const api = button.dataset.character === 'vampire' ? window.NEXO_VAMPIRE : window.NEXO_DND;
      hide();
      api?.open({ characterId: button.dataset.id, onExit: () => open({ onExit: exitHandler }) });
    }));
  }

  function message(text, error = false) {
    const node = host.querySelector('[data-account-message]');
    if (!node) return;
    node.textContent = text;
    node.classList.toggle('error', error);
  }

  async function saveName(event) {
    event.preventDefault();
    const name = event.target.elements.namedItem('name').value.trim();
    const { data, error } = await client().auth.updateUser({ data: { display_name: name } });
    if (error) { message('No se pudo guardar el nombre. Comprueba la conexión.', true); return; }
    host.querySelector('.prf-identity b').textContent = displayName(data.user) || 'Sin nombre visible';
    host.querySelector('.prf-avatar').textContent = initials(data.user);
    message('Nombre guardado.');
  }

  async function savePassword(event) {
    event.preventDefault();
    const { password, confirm } = event.target;
    if (password.value !== confirm.value) { message('Las contraseñas no coinciden.', true); return; }
    const { error } = await client().auth.updateUser({ password: password.value });
    if (error) { message(String(error.message || '').toLowerCase().includes('different') ? 'La contraseña nueva debe ser distinta de la actual.' : 'No se pudo cambiar la contraseña. Inténtalo de nuevo.', true); return; }
    event.target.reset();
    message('Contraseña actualizada.');
  }

  function hideSystems() {
    document.getElementById('nexoSystems')?.setAttribute('hidden', '');
    document.documentElement.classList.add('nexo-system-selected');
  }

  function signIn() {
    returnAfterSignIn = true;
    hide();
    hideSystems();
    window.NEXO_TRAVELLER?.signIn();
  }

  async function signOut() {
    if (!confirm('¿Cerrar sesión de NEXO en este dispositivo?')) return;
    hide();
    hideSystems();
    await client()?.auth.signOut();
  }

  // Al terminar de iniciar sesión desde el perfil, vuelve a él con los datos de la cuenta.
  document.addEventListener('nexo:account-ready', () => {
    if (returnAfterSignIn) { returnAfterSignIn = false; open({ onExit: exitHandler }); }
    else if (host && !host.hidden) render();
  });

  function open(options = {}) {
    ensureHost();
    exitHandler = options.onExit || exitHandler;
    render();
    host.hidden = false;
    host.scrollTop = 0;
  }
  function hide() { if (host) host.hidden = true; }
  function close() {
    hide();
    if (exitHandler) exitHandler();
  }

  window.NEXO_PROFILE = { open, close };
})();
