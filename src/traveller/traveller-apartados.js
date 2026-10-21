/*
 * NEXO · Apartados de Traveller en el selector de partidas.
 * Campañas: las partidas de siempre. Personajes: los viajeros de todas las partidas.
 * Manual: src/traveller/traveller-manual.js con el lector común (src/nexo/apartados.js).
 */
(() => {
  const selector = document.getElementById('gameSelector');
  if (!selector || !window.NEXO_APARTADOS) return;
  const { esc } = window.NEXO_APARTADOS;
  const view = document.createElement('div');
  view.className = 'trv-apartados';
  selector.querySelector('.selector-heading').after(view);
  const partidas = [document.getElementById('campaignList'), document.getElementById('newCampaignForm')];
  const showPartidas = on => partidas.forEach(node => { if (node) node.hidden = !on; });
  let manualBook = null;

  // Las fichas viven dentro de cada partida; se leen de la copia del navegador, que app.js mantiene al día.
  function travellers() {
    let campaigns = [];
    try { campaigns = JSON.parse(localStorage.getItem('nexo-traveller-v1') || '{}').campaigns || []; } catch {}
    return campaigns.flatMap(c => (c.data?.characters || []).map(ch => {
      const p = ch.personal || {};
      return { id: ch.id, campaignId: c.id, campaign: c.name || 'Partida', name: [p.name, p.surname].filter(Boolean).join(' ') || 'Viajero sin nombre', summary: [p.profession, p.race, p.upp && `PUP ${p.upp}`].filter(Boolean).join(' · ') };
    }));
  }
  function openTraveller(id) {
    const ch = travellers().find(item => item.id === id);
    if (!ch) { renderPersonajes(); return; }
    window.NEXO_TRAVELLER?.openCampaign(ch.campaignId);
    document.querySelector('#appHome [data-open-app="characters"]')?.click();
    setTimeout(() => window.NEXO_CHARACTERS_UI?.edit(id), 320);
  }
  function ensureSelector() {
    if (selector.hidden) window.NEXO_TRAVELLER?.showCampaigns();
  }

  function renderPersonajes() {
    ensureSelector();
    showPartidas(false);
    const rows = travellers();
    const cards = rows.length ? rows.map(ch => `<button class="trv-card" data-trv-char="${esc(ch.id)}"><span class="trv-card-mark" aria-hidden="true">${esc(ch.name.charAt(0).toUpperCase())}</span><span class="trv-card-copy"><b>${esc(ch.name)}</b><small>${esc(ch.campaign)}${ch.summary ? ` · ${esc(ch.summary)}` : ''}</small></span><span class="trv-card-go">ABRIR →</span></button>`).join('')
      : '<div class="trv-empty"><b>Aún no hay viajeros</b><small>Entra en una partida y abre la aplicación PERSONAJES para crear sus fichas.</small></div>';
    view.innerHTML = `${ap.tabs('personajes')}<p class="trv-intro">Los viajeros de todas tus partidas. Cada ficha se abre dentro de su partida, en la aplicación PERSONAJES.</p><div class="trv-list">${cards}</div>`;
    view.querySelectorAll('[data-trv-char]').forEach(button => button.addEventListener('click', () => {
      window.NEXO_NAV?.sub(() => ap.render());
      openTraveller(button.dataset.trvChar);
    }));
  }

  const ap = window.NEXO_APARTADOS.create({
    prefix: 'trv', system: () => 'traveller', start: 'campanas',
    frame: body => { ensureSelector(); showPartidas(false); view.innerHTML = body; },
    leave: () => {}, renderCharacters: renderPersonajes, characters: travellers, openCharacter: openTraveller,
    manual: () => manualBook || (manualBook = window.NEXO_MANUALS?.traveller?.() || null),
    custom: { campanas: () => { view.innerHTML = ap.tabs('campanas'); showPartidas(true); } },
    words: { characters: 'viajeros', character: 'viajero' }
  });
  ap.mount(selector);
  ap.reset();
  ap.render();
})();
