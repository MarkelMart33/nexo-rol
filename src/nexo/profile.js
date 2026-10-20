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
    stylesheet.href = './src/nexo/profile.css?v=3';
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
      return `<section class="prf-panel prf-account"><h2>Cuenta</h2><p class="prf-note">Estás usando NEXO sin cuenta: tus partidas y fichas se guardan solo en este dispositivo. Con una cuenta se sincronizan entre tus dispositivos.</p><button class="prf-button" data-sign-in>Iniciar sesión o crear cuenta</button></section>`;
    }
    return `<section class="prf-panel prf-account"><h2>Cuenta</h2>
      <div class="prf-identity"><span><b>${esc(displayName(u) || 'Sin nombre de usuario')}</b><small>${esc(u.email)}</small></span></div>
      <form class="prf-form" data-name-form><label class="prf-field"><span>Nombre de usuario</span><input name="name" maxlength="24" autocomplete="nickname" value="${esc(displayName(u))}" placeholder="Cómo quieres que te vean"></label><button class="prf-button" type="submit">Guardar nombre de usuario</button></form>
      <form class="prf-form" data-password-form><label class="prf-field"><span>Contraseña nueva</span><input name="password" type="password" minlength="8" autocomplete="new-password" placeholder="Mínimo 8 caracteres" required></label><label class="prf-field"><span>Repítela</span><input name="confirm" type="password" minlength="8" autocomplete="new-password" required></label><button class="prf-button" type="submit">Cambiar contraseña</button></form>
      <p class="prf-message" data-account-message aria-live="polite"></p>
      <button class="prf-button ghost" data-sign-out>Cerrar sesión</button></section>`;
  }

  function campaignsPanel() {
    const campaigns = window.NEXO_TRAVELLER?.campaigns() || [];
    const rows = campaigns.map(c => `<button class="prf-row" data-campaign="${esc(c.id)}"><span class="prf-mark is-traveller">${window.NEXO_ICONS?.traveller || ''}</span><span class="prf-copy"><b>${esc(c.name)}</b><small>${esc(c.wallet)} Cr · ${c.characters} ${c.characters === 1 ? 'personaje' : 'personajes'}</small></span><span class="prf-go">Entrar</span></button>`).join('');
    return `<section class="prf-panel"><h2>Campañas de Traveller</h2>${rows || '<p class="prf-note">Aún no tienes campañas.</p>'}<button class="prf-button ghost" data-traveller>${rows ? 'Gestionar campañas' : 'Crear una campaña'}</button></section>`;
  }

  function charactersPanel() {
    const group = (key, title, api, mark) => {
      const items = api?.list() || [];
      const rows = items.map(ch => `<button class="prf-row" data-character="${key}" data-id="${esc(ch.id)}"><span class="prf-mark is-${key}">${mark}</span><span class="prf-copy"><b>${esc(ch.name || 'Sin nombre')}</b><small>${esc(ch.summary)}</small></span><span class="prf-go">Abrir</span></button>`).join('');
      return `<h3>${title}</h3>${rows || '<p class="prf-note">Sin personajes todavía.</p>'}`;
    };
    return `<section class="prf-panel"><h2>Personajes</h2>${group('vampire', 'Vampiro: La Mascarada', window.NEXO_VAMPIRE, window.NEXO_ICONS?.vampire || '')}${group('dnd', 'Dungeons &amp; Dragons', window.NEXO_DND, window.NEXO_ICONS?.dnd || '')}<p class="prf-note">Los personajes de Traveller están dentro de cada campaña.</p></section>`;
  }

  function render() {
    const u = user();
    host.innerHTML = `<div class="prf-wrap"><button class="prf-back" data-back>← Volver a la mesa</button>
      <header class="prf-title"><span class="nexo-seal prf-seal" aria-hidden="true">${esc(initials(u))}</span><div><h1>Tu perfil</h1><p>${u ? 'Tus partidas y fichas se sincronizan con tu cuenta.' : 'Sin cuenta: todo se guarda en este dispositivo.'}</p></div></header>
      <div class="prf-grid">${accountPanel()}<div class="prf-stack">${campaignsPanel()}${charactersPanel()}</div></div></div>`;
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
    if (!/^[\p{L}\p{N}_.-]{3,24}$/u.test(name)) { message('El nombre de usuario debe tener entre 3 y 24 letras, números, puntos, guiones o guiones bajos, sin espacios.', true); return; }
    const { data, error } = await client().auth.updateUser({ data: { display_name: name } });
    if (error) { message('No se pudo guardar el nombre. Comprueba la conexión.', true); return; }
    host.querySelector('.prf-identity b').textContent = displayName(data.user) || 'Sin nombre de usuario';
    host.querySelector('.prf-seal').textContent = initials(data.user);
    message('Nombre de usuario guardado.');
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
