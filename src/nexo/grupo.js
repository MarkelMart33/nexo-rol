/*
 * NEXO · Campañas compartidas (window.NEXO_GRUPO).
 * Quien dirige comparte una campaña con un código; los jugadores entran con él desde su cuenta, dejan su
 * ficha a la vista de quien dirige (solo lectura) y las tiradas de todos llegan en directo.
 * - Todo va por Supabase (tablas shared_* y sus funciones en supabase/schema.sql): hace falta cuenta.
 * - Las notas, los PNJ y el combate de quien dirige no se comparten. Los jugadores ven el nombre, quién
 *   narra, la premisa, el enlace a la mesa virtual y, si quien dirige quiere, el diario de sesiones.
 * - Lo que llega de otra cuenta (fichas, nombres, tiradas) se trata como texto ajeno: la ficha pasa por
 *   el «accept» de su sistema y todo lo demás se escapa antes de pintarlo.
 * - Este dispositivo recuerda en «nexo-grupos-v1» las campañas en las que juegas y a cuál van tus tiradas.
 */
(() => {
  'use strict';
  const client = window.nexoSupabaseClient || null;
  const KEY = 'nexo-grupos-v1';
  const COLS = 'id,owner_id,campaign_id,system,name,owner_name,info,updated_at';
  // Paleta de los avisos: la de los dados de cada sistema (dice.css).
  const THEMES = { dnd: 'dnd', pathfinder: 'pathfinder', 'vampiro-v20': 'vampiro', 'vampiro-da': 'vtm-da', tormentas: 'tormentas', cthulhu: 'cthulhu' };
  const SYSTEM_NAMES = { dnd: 'Dungeons & Dragons', pathfinder: 'Pathfinder', 'vampiro-v20': 'Vampiro: La Mascarada', 'vampiro-da': 'Vampiro: Edad Oscura', tormentas: 'El Archivo de las Tormentas', cthulhu: 'La llamada de Cthulhu' };

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const text = (value, max) => (typeof value === 'string' || typeof value === 'number' ? String(value) : '').slice(0, max);
  const webLink = value => { try { const url = new URL(String(value || '').trim()); return /^https?:$/.test(url.protocol) ? url.href : ''; } catch { return ''; } };
  const me = () => (client && window.NEXO_CLOUD?.user) || null;
  const signedIn = () => Boolean(me());
  const where = () => window.NEXO_APARTADOS?.where?.() || null;
  const showCode = code => (code ? `${code.slice(0, 4)}-${code.slice(4)}` : '');
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const hour = iso => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }); };
  function ago(iso) {
    const ms = Date.now() - new Date(iso).getTime();
    if (!Number.isFinite(ms)) return '';
    const min = Math.round(ms / 60000);
    if (min < 1) return 'ahora mismo';
    if (min < 60) return `hace ${min} min`;
    const hours = Math.round(min / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.round(hours / 24);
    return days === 1 ? 'ayer' : `hace ${days} días`;
  }

  // Qué decir cuando la nube responde con un error.
  const SETUP = 'La nube aún no admite campañas compartidas: falta volver a ejecutar supabase/schema.sql en Supabase.';
  const UNKNOWN = 'No se pudo completar. Inténtalo de nuevo.';
  function explain(error) {
    const message = String(error?.message || '');
    const code = String(error?.code || '');
    if (/code_not_found/.test(message)) return 'Ese código no es de ninguna campaña. Revísalo con quien dirige.';
    if (/campaign_full/.test(message)) return 'Esa campaña ya tiene 12 jugadores.';
    if (/too_many_joined/.test(message)) return 'Estás en demasiadas campañas: sal de alguna antes de entrar en otra.';
    if (/too_many_shared/.test(message)) return 'Compartes demasiadas campañas: deja de compartir alguna antes.';
    if (/not_signed_in/.test(message) || code === '28000') return 'Entra en tu cuenta para usar las campañas compartidas.';
    if (/not_owner/.test(message)) return 'Esta campaña ya no es tuya en la nube.';
    if (code === '42501') return 'Ya no tienes acceso a esa campaña.';
    if (['PGRST202', 'PGRST205', '42883', '42P01'].includes(code) || /schema cache|does not exist/i.test(message)) return SETUP;
    if (/failed to fetch|networkerror|load failed/i.test(message)) return 'Sin conexión: inténtalo cuando vuelva.';
    return UNKNOWN;
  }
  // Solo se deja rastro en la consola de lo inesperado; un código mal escrito o estar sin conexión no lo son.
  const fail = error => { const told = explain(error); if (told === UNKNOWN || told === SETUP) console.error('NEXO grupo', error); return told; };

  // ───────────── Lo que recuerda este dispositivo ─────────────
  // joined: campañas de otros en las que juegas; live: por sistema, la campaña a la que van tus tiradas.
  function clean(raw) {
    const d = raw && typeof raw === 'object' ? raw : {};
    const joined = (Array.isArray(d.joined) ? d.joined : []).filter(g => g && typeof g === 'object' && typeof g.id === 'string').slice(0, 60).map(g => ({
      id: text(g.id, 64), system: text(g.system, 24), name: text(g.name, 80), owner_name: text(g.owner_name, 40), sheet_id: text(g.sheet_id, 64), sheet_name: text(g.sheet_name, 80),
      info: g.info && typeof g.info === 'object' && !Array.isArray(g.info) ? g.info : {}
    }));
    const live = {};
    Object.entries(d.live && typeof d.live === 'object' ? d.live : {}).slice(0, 20).forEach(([system, l]) => {
      if (l && typeof l === 'object' && typeof l.id === 'string') live[text(system, 24)] = { id: text(l.id, 64), name: text(l.name, 80), muted: Boolean(l.muted) };
    });
    return { joined, live };
  }
  let cache = clean(null);
  try { cache = clean(JSON.parse(localStorage.getItem(KEY) || '{}')); } catch {}
  // El diario que comparte quien dirige se queda en memoria: en el dispositivo solo va lo ligero.
  const remember = () => { try { localStorage.setItem(KEY, JSON.stringify({ ...cache, joined: cache.joined.map(g => ({ ...g, info: { ...g.info, sessions: undefined } })) })); } catch {} };

  // En memoria, mientras la app sigue abierta.
  let owned = [];                    // campañas compartidas por esta cuenta: { id, campaign_id, system, name }
  const rosters = new Map();         // id → miembros con su ficha (solo quien dirige los recibe)
  const parties = new Map();         // id → nombres del grupo (para los jugadores)
  const feeds = new Map();           // id → últimas tiradas, la más reciente al final
  const watchers = new Map();        // id → { channel, timer, last, live, system, name }
  const listeners = new Set();       // vistas abiertas: { id, node, fn }
  const pushedSheet = new Map();     // id → updatedAt de la ficha que ya tiene la nube
  const pushedInfo = new Map();      // id → lo último que se mandó de la campaña (nombre e información)
  const sheetTimers = new Map();
  const cards = new Map();           // «usuario|fecha» → tarjeta de la ficha recibida
  let refreshedAt = 0;
  let refreshing = null;

  function forget() {
    cache = clean(null);
    try { localStorage.removeItem(KEY); } catch {}
    owned = [];
    [rosters, parties, feeds, pushedSheet, pushedInfo, cards].forEach(map => map.clear());
    sheetTimers.forEach(timer => clearTimeout(timer));
    sheetTimers.clear();
    [...watchers.keys()].forEach(unwatch);
    listeners.clear();
    refreshedAt = 0;
    document.querySelector('.ng-toasts')?.remove();
  }
  document.addEventListener('nexo:signed-out', forget);

  // ───────────── Nube ─────────────
  // Fichas de este dispositivo, por id, de cualquier sistema (cada apartado deja su «shared» en NEXO_APARTADOS).
  function localSheet(id) {
    if (!id) return null;
    for (const source of window.NEXO_APARTADOS?.sources?.() || []) {
      const raw = source.raw(id);
      if (raw) return { raw, source };
    }
    return null;
  }

  // Trae las campañas compartidas de la cuenta: las que dirige y aquellas en las que juega. Devuelve si algo cambió.
  function refresh(force = false) {
    if (!signedIn()) return Promise.resolve(false);
    if (refreshing) return refreshing;
    if (!force && Date.now() - refreshedAt < 10000) return Promise.resolve(false);
    const uid = me().id;
    refreshing = Promise.all([
      client.from('shared_campaigns').select(COLS),
      client.from('shared_members').select('campaign,sheet_id,sheet_name,updated_at').eq('user_id', uid)
    ]).then(([camps, own]) => {
      if (camps.error) throw camps.error;
      if (own.error) throw own.error;
      if (me()?.id !== uid) return false;
      refreshedAt = Date.now();
      const before = JSON.stringify([cache.joined, owned]);
      const rows = new Map((own.data || []).map(row => [row.campaign, row]));
      owned = (camps.data || []).filter(c => c.owner_id === uid).map(c => ({ id: c.id, campaign_id: c.campaign_id, system: c.system, name: c.name }));
      cache.joined = clean({ joined: (camps.data || []).filter(c => c.owner_id !== uid && rows.has(c.id)).map(c => ({ ...c, sheet_id: rows.get(c.id).sheet_id, sheet_name: rows.get(c.id).sheet_name })) }).joined;
      const alive = new Set([...owned, ...cache.joined].map(c => c.id));
      Object.keys(cache.live).forEach(system => { if (!alive.has(cache.live[system].id)) delete cache.live[system]; });
      remember();
      // Una ficha cambiada sin conexión (o antes de abrir la campaña) se pone al día ahora.
      cache.joined.forEach(g => {
        const mine = localSheet(g.sheet_id);
        const row = rows.get(g.id);
        if (!mine) return;
        if (new Date(mine.raw.updatedAt || 0).getTime() > new Date(row.updated_at || 0).getTime()) queueSheet(g.id);
        else if (!pushedSheet.has(g.id)) pushedSheet.set(g.id, mine.raw.updatedAt || '');
      });
      return JSON.stringify([cache.joined, owned]) !== before;
    }).finally(() => { refreshing = null; });
    return refreshing;
  }

  // Lo que los jugadores ven de la campaña de quien dirige.
  function publicInfo(c) {
    const info = { master: text(c.master, 60), premise: text(c.premise, 1200), vtt: webLink(c.vtt) };
    // Del mundo solo salen las entradas que quien dirige ha marcado como visibles (src/nexo/mundo.js).
    const world = window.NEXO_MUNDO?.publicEntries(c.world) || [];
    if (world.length) info.world = world;
    if (c.shared?.diary) {
      let room = 100000 - world.reduce((t, e) => t + e.name.length + e.text.length + 80, 0);
      info.sessions = [...(c.sessions || [])].sort((a, b) => String(b.date).localeCompare(String(a.date))).map(s => ({ date: text(s.date, 10), title: text(s.title, 80), text: text(s.text, 6000) }))
        .filter(s => (room -= s.text.length + s.title.length + 40) > 0).slice(0, 80);
    }
    // La fila admite 150000 octetos y una tilde ocupa dos: si aun así no cabe, se sueltan las sesiones más antiguas.
    const octets = () => new TextEncoder().encode(JSON.stringify(info)).length;
    while (octets() > 135000 && (info.sessions?.length || info.world?.length)) {
      if (info.sessions?.length) info.sessions.pop();
      else info.world.pop();
    }
    return info;
  }
  async function pushInfo(c) {
    if (!signedIn() || !c?.shared?.id) return null;
    const info = publicInfo(c);
    const stamp = JSON.stringify([c.name, info]);
    if (pushedInfo.get(c.shared.id) === stamp) return null;
    pushedInfo.set(c.shared.id, stamp);
    // Solo pone al día una campaña que sigue compartida: si ya no lo está, la nube no hace nada (devuelve nulo).
    const { data, error } = await client.rpc('update_shared_campaign', { p_id: c.shared.id, p_name: text(c.name, 80), p_info: info });
    if (error) { pushedInfo.delete(c.shared.id); throw error; }
    return typeof data === 'string' ? data : null;
  }
  // Al guardarse las campañas, las compartidas ponen al día lo que ven los jugadores; al guardarse las fichas,
  // la que se deja ver en cada campaña.
  let infoTimer = 0;
  document.addEventListener('nexo:saved', event => {
    if (!signedIn()) return;
    if (event.detail?.key === 'nexo-campanas-v1') {
      clearTimeout(infoTimer);
      infoTimer = setTimeout(() => {
        (window.NEXO_APARTADOS?.sharedCampaigns?.() || []).forEach(c => { pushInfo(c).catch(fail); });
      }, 4000);
      return;
    }
    cache.joined.forEach(g => {
      const mine = localSheet(g.sheet_id);
      if (mine && (mine.raw.updatedAt || '') !== pushedSheet.get(g.id)) queueSheet(g.id);
    });
  });

  // Deja (o pone al día) la ficha de este dispositivo en la campaña.
  function queueSheet(id) {
    clearTimeout(sheetTimers.get(id));
    sheetTimers.set(id, setTimeout(() => {
      sheetTimers.delete(id);
      const g = cache.joined.find(item => item.id === id);
      const mine = g && localSheet(g.sheet_id);
      if (mine) setSheet(id, mine.raw, mine.source).catch(fail);
    }, 2500));
  }
  async function setSheet(id, raw, source) {
    const g = cache.joined.find(item => item.id === id);
    if (!g || !signedIn()) return 'No estás en esa campaña.';
    let sheet = null;
    let card = null;
    if (raw) {
      sheet = JSON.parse(JSON.stringify(raw));
      if (JSON.stringify(sheet).length > 380000) return 'Esa ficha es demasiado grande para compartirla.';
      card = source.card(raw);
    }
    const { data, error } = await client.rpc('share_sheet', { p_campaign: id, p_sheet: sheet, p_name: text(card?.name, 80), p_summary: text([card?.summary, card?.play].filter(Boolean).join(' · '), 200) });
    if (error) return fail(error);
    if (data === false) { await refresh(true).catch(() => {}); return 'Ya no estás en esa campaña.'; }
    g.sheet_id = sheet ? text(sheet.id, 64) : '';
    g.sheet_name = text(card?.name, 80);
    pushedSheet.set(id, raw ? raw.updatedAt || '' : '');
    remember();
    return '';
  }

  // ───────────── Tiradas en directo ─────────────
  const campOf = id => cache.joined.find(g => g.id === id) || owned.find(c => c.id === id) || null;
  function nameOf(id, uid) {
    const row = (rosters.get(id) || []).find(m => m.user_id === uid) || (parties.get(id) || []).find(m => m.user_id === uid);
    if (row) return row.display_name || '';
    return uid === me()?.id ? text(me().user_metadata?.display_name, 40) : '';
  }
  function take(id, rows) {
    const w = watchers.get(id);
    // Hasta la primera carga no se apunta nada suelto: esa carga ya lo trae en su sitio.
    if (!feeds.has(id)) return;
    const feed = feeds.get(id);
    const fresh = rows.filter(r => r && Number(r.id) > (w?.last || 0) && !feed.some(f => f.id === r.id)).sort((a, b) => a.id - b.id);
    if (!fresh.length) return;
    feeds.set(id, [...feed, ...fresh].slice(-60));
    if (w) w.last = Number(fresh[fresh.length - 1].id);
    listeners.forEach(l => { if (l.id === id) l.fn('rolls'); });
    const camp = campOf(id);
    if (camp && where()?.system === camp.system) fresh.filter(r => r.user_id !== me()?.id && Date.now() - new Date(r.created_at).getTime() < 90000).slice(-3).forEach(r => toast(id, r));
  }
  async function loadRolls(id) {
    const { data, error } = await client.from('shared_rolls').select('id,user_id,who,title,total,detail,tone,created_at').eq('campaign', id).order('id', { ascending: false }).limit(40);
    if (error) throw error;
    const rows = (data || []).reverse();
    const w = watchers.get(id);
    if (!feeds.has(id)) {
      // La primera carga llena la lista sin avisos: son tiradas de antes.
      feeds.set(id, rows);
      if (w) w.last = rows.length ? Number(rows[rows.length - 1].id) : 0;
      listeners.forEach(l => { if (l.id === id) l.fn('rolls'); });
    } else take(id, rows);
  }
  const needed = id => {
    listeners.forEach(l => { if (!l.node.isConnected) listeners.delete(l); });
    if ([...listeners].some(l => l.id === id)) return true;
    const camp = campOf(id);
    return Boolean(camp && where()?.system === camp.system && cache.live[camp.system]?.id === id);
  };
  function watch(id) {
    if (!signedIn() || watchers.has(id)) return;
    const known = feeds.get(id) || [];
    const w = { channel: null, timer: 0, last: known.length ? Number(known[known.length - 1].id) : 0, live: false, ticks: 0, missed: 0 };
    watchers.set(id, w);
    loadRolls(id).catch(fail);
    // Nombres del grupo para decir de quién es cada tirada.
    if (!parties.has(id)) client.rpc('shared_party', { p_id: id }).then(({ data }) => { if (data?.length && !parties.has(id)) { parties.set(id, data); listeners.forEach(l => { if (l.id === id) l.fn('rolls'); }); } });
    try {
      w.channel = client.channel(`grupo-${id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shared_rolls', filter: `campaign=eq.${id}` }, payload => { if (watchers.get(id) === w) take(id, [payload.new]); })
        .subscribe(status => { w.live = status === 'SUBSCRIBED'; });
    } catch (error) { console.error('NEXO grupo', error); }
    // Red de seguridad: si el aviso en directo no llega, se pregunta de vez en cuando (más a menudo sin él).
    w.timer = setInterval(() => {
      if (!needed(id)) { unwatch(id); return; }
      w.ticks += 1;
      if (document.visibilityState !== 'visible' || (w.live && w.ticks % 3)) return;
      const before = w.last;
      loadRolls(id).then(() => { if (!w.live) return; w.missed = w.last !== before ? w.missed + 1 : 0; if (w.missed > 1) w.live = false; }).catch(() => {});
    }, 5000);
  }
  function unwatch(id) {
    const w = watchers.get(id);
    if (!w) return;
    clearInterval(w.timer);
    try { if (w.channel) client.removeChannel(w.channel); } catch {}
    watchers.delete(id);
  }
  function listen(id, node, fn) {
    listeners.forEach(l => { if (l.node === node) listeners.delete(l); });
    listeners.add({ id, node, fn });
    watch(id);
  }

  // Aviso de la tirada de otro jugador: abajo a la izquierda, lejos del botón de dados y del perfil.
  function toast(id, r) {
    let box = document.querySelector('.ng-toasts');
    if (!box) {
      box = document.createElement('div');
      box.className = 'ng-toasts';
      box.setAttribute('role', 'status');
      box.setAttribute('aria-live', 'polite');
      document.body.append(box);
    }
    box.dataset.ndTheme = THEMES[campOf(id)?.system] || '';
    const item = document.createElement('p');
    item.className = `ng-toast${reduced() ? '' : ' ng-in'}`;
    item.innerHTML = rollLine(id, r);
    box.append(item);
    while (box.children.length > 3) box.firstElementChild.remove();
    setTimeout(() => { item.remove(); if (!box.children.length) box.remove(); }, 7000);
  }
  function rollLine(id, r) {
    const account = nameOf(id, r.user_id);
    const who = r.who || account || 'Alguien';
    return `<span class="ng-roll-who"><b>${esc(who)}</b>${r.who && account && account !== r.who ? ` <small>(${esc(account)})</small>` : ''}</span><span class="ng-roll-what">${esc(r.title || 'Tirada')}</span><strong>${esc(r.total)}</strong>${r.detail ? `<small class="ng-roll-detail">${esc(r.detail)}</small>` : ''}`;
  }
  function feedHtml(id) {
    const feed = feeds.get(id);
    if (!feed) return '<p class="ng-none">Cargando las tiradas…</p>';
    if (!feed.length) return '<p class="ng-none">Aún no hay tiradas. Las de todo el grupo irán apareciendo aquí al momento.</p>';
    return `<ol class="ng-feed">${[...feed].reverse().slice(0, 30).map(r => `<li><time datetime="${esc(r.created_at)}">${esc(hour(r.created_at))}</time>${rollLine(id, r)}</li>`).join('')}</ol>`;
  }

  // Estado de cada tirada de la ventana de dados: enviándose, enviada, fallida u oculta.
  const sent = new WeakMap();
  const changed = () => document.dispatchEvent(new Event('nexo:group-changed'));
  function liveNow() {
    const at = where();
    const live = at && signedIn() ? cache.live[at.system] : null;
    return live ? { ...live, system: at.system, who: at.who || '' } : null;
  }
  async function sendRoll(live, r) {
    sent.set(r, 'sending');
    changed();
    const row = {
      campaign: live.id, who: text(live.who || cache.joined.find(g => g.id === live.id)?.sheet_name, 60), title: text(r.title, 120), total: text(`${r.total ?? ''}${r.unit ? ` ${r.unit}` : ''}`, 40),
      detail: text(`${r.verdict || ''}${r.badge ? ` (${r.badge})` : ''}${r.formula ? ` [${r.formula}]` : ''}`.trim(), 400), tone: /^[a-z-]{0,16}$/.test(r.tone || '') ? r.tone || '' : ''
    };
    const { error } = await client.from('shared_rolls').insert(row);
    if (error) fail(error);
    // Sin permiso: te han sacado de la campaña o ya no se comparte. Se pone al día la lista.
    if (error?.code === '42501') refresh(true).catch(() => {});
    sent.set(r, error ? 'failed' : 'sent');
    changed();
    if (!error && watchers.has(live.id)) loadRolls(live.id).catch(() => {});
  }
  document.addEventListener('nexo:roll', event => {
    const r = event.detail?.result;
    const live = liveNow();
    if (!r || r.error || !live) return;
    if (live.muted) sent.set(r, 'hidden');
    else sendRoll(live, r);
  });
  function setLive(system, camp, on) {
    if (on) cache.live[system] = { id: camp.id, name: text(camp.name, 80) || 'la campaña', muted: false };
    else if (cache.live[system]?.id === camp.id) delete cache.live[system];
    remember();
    if (on) watch(camp.id);
    changed();
  }

  // ───────────── Piezas comunes de las vistas ─────────────
  // Tarjeta de la ficha de un jugador, ya pasada por el «accept» de su sistema (o null si no se puede leer).
  function cardFor(m, shared) {
    if (!m.sheet || !shared) return null;
    const key = `${m.user_id}|${m.updated_at}`;
    if (!cards.has(key)) {
      try { const ch = shared.accept(JSON.parse(JSON.stringify(m.sheet))); cards.set(key, { ch, ...shared.card(ch) }); } catch (error) { console.error('NEXO grupo', error); cards.set(key, null); }
      if (cards.size > 200) cards.delete(cards.keys().next().value);
    }
    return cards.get(key);
  }
  const needAccount = p => `<section class="${p}-panel ap-panel ng-panel"><h2>Campaña compartida</h2><p class="${p}-note">Para compartir una campaña o entrar en la de otra persona hace falta una cuenta de NEXO, porque el grupo se reúne en la nube. Vuelve a la mesa, abre tu perfil y entra o crea una: es gratis.</p></section>`;
  const liveBox = (system, id) => `<label class="ap-check ng-live"><input type="checkbox" data-ng-live ${cache.live[system]?.id === id ? 'checked' : ''}><span><b>Mis tiradas van al grupo, en directo</b><small>Mientras esté marcado, lo que tires en ${esc(SYSTEM_NAMES[system] || 'este sistema')} le aparece a los demás al momento. En la ventana de dados puedes tirar en oculto.</small></span></label>`;
  const flashTo = (node, message) => { const box = node.querySelector('[data-ng-flash]'); if (box) { box.textContent = message || ''; box.hidden = !message; } };

  // ───────────── Quien dirige ─────────────
  /*
   * ctx: { system, prefix, campaign (la campaña local, se le escribe «shared»), shared (lo que el sistema sabe de
   * sus fichas: accept, card, view), save() }
   */
  function mountOwner(node, ctx) {
    const p = ctx.prefix;
    const c = ctx.campaign;
    let asking = '';
    let busy = false;
    let note = '';
    let timer = 0;

    const cardOf = m => cardFor(m, ctx.shared);
    async function loadMembers() {
      const id = c.shared?.id;
      if (!id) return;
      const { data, error } = await client.from('shared_members').select('user_id,display_name,sheet_id,sheet_name,summary,sheet,updated_at,joined_at').eq('campaign', id).order('joined_at');
      if (error) throw error;
      const before = JSON.stringify((rosters.get(id) || []).map(m => [m.user_id, m.updated_at]));
      rosters.set(id, data || []);
      if (JSON.stringify((data || []).map(m => [m.user_id, m.updated_at])) !== before && node.isConnected) paintMembers();
    }
    // La campaña puede haberse dejado de compartir desde otro dispositivo, o venir de una copia de otra cuenta.
    async function verify() {
      const id = c.shared.id;
      const { data, error } = await client.from('shared_campaigns').select(COLS).eq('id', id).maybeSingle();
      if (error) throw error;
      if (!data || data.owner_id !== me()?.id) {
        c.shared = null;
        ctx.save();
        note = 'Esta campaña ya no estaba compartida en la nube. Puedes volver a compartirla.';
        paint();
        return;
      }
      // Lo que ven los jugadores se pone al día, y de paso vuelve el código vigente (pudo cambiarse en otro dispositivo).
      pushedInfo.delete(id);
      pushInfo(c).then(code => {
        if (!code || !c.shared || code === c.shared.code) return;
        c.shared.code = text(code, 16);
        ctx.save();
        if (node.isConnected) paint();
      }).catch(fail);
      await loadMembers();
    }

    function membersHtml() {
      const list = rosters.get(c.shared.id);
      if (!list) return '<p class="ng-none">Cargando el grupo…</p>';
      if (!list.length) return `<p class="ng-none">Todavía no ha entrado nadie. Pasa el código a tus jugadores: lo escriben en la pestaña «Campañas» de ${esc(SYSTEM_NAMES[ctx.system] || 'este sistema')}, en «Unirse con un código».</p>`;
      return `<ul class="ng-members">${list.map(m => {
        const card = cardOf(m);
        const line = card ? [card.summary, card.play].filter(Boolean).join(' · ') : m.sheet ? 'No se pudo leer su ficha' : 'Aún no ha elegido personaje';
        return `<li><span class="ng-who"><b>${esc(card ? card.name : m.display_name || 'Jugador')}</b><small>${card ? `${esc(m.display_name || 'Jugador')} · ` : ''}${esc(line)}${card ? ` · ${esc(ago(m.updated_at))}` : ''}</small></span>
          <span class="ng-row-actions">${card ? `<button type="button" class="${p}-button ghost ap-mini" data-ng-view="${esc(m.user_id)}">VER FICHA</button>` : ''}<button type="button" class="${p}-button ${asking === `kick:${m.user_id}` ? 'danger' : 'ghost'} ap-mini" data-ng-kick="${esc(m.user_id)}">${asking === `kick:${m.user_id}` ? '¿SEGURO?' : 'EXPULSAR'}</button></span></li>`;
      }).join('')}</ul>`;
    }
    function paintMembers() {
      const box = node.querySelector('[data-ng-members]');
      if (!box || !c.shared) return;
      box.innerHTML = membersHtml();
      const count = node.querySelector('[data-ng-count]');
      if (count) count.textContent = String((rosters.get(c.shared.id) || []).length);
      box.querySelectorAll('[data-ng-view]').forEach(button => button.addEventListener('click', () => {
        const m = (rosters.get(c.shared.id) || []).find(item => item.user_id === button.dataset.ngView);
        const card = m && cardOf(m);
        if (card) ctx.shared.view(card.ch, { title: `Ficha de ${m.display_name || 'un jugador'}`, note: `Solo lectura: es la ficha de ${m.display_name || 'un jugador'}, tal como la tenía ${ago(m.updated_at)}. Se pone al día sola cuando la cambia.` });
      }));
      box.querySelectorAll('[data-ng-kick]').forEach(button => button.addEventListener('click', async () => {
        const uid = button.dataset.ngKick;
        if (asking !== `kick:${uid}`) { asking = `kick:${uid}`; paintMembers(); node.querySelector(`[data-ng-kick="${CSS.escape(uid)}"]`)?.focus(); return; }
        asking = '';
        const { error } = await client.from('shared_members').delete().eq('campaign', c.shared.id).eq('user_id', uid);
        if (error) { flashTo(node, fail(error)); return; }
        flashTo(node, 'Expulsado. Si no quieres que vuelva a entrar, cambia el código.');
        loadMembers().catch(fail);
      }));
    }

    function paint() {
      clearInterval(timer);
      if (!client || !signedIn()) { node.innerHTML = needAccount(p); return; }
      if (!c.shared) {
        node.innerHTML = `<section class="${p}-panel ap-panel ng-panel"><h2>Compartir la campaña</h2>
          <p class="${p}-note">Con un código, tus jugadores entran en la campaña desde su propia cuenta. Tú ves sus fichas, solo para leerlas, y las tiradas de todos aparecen al momento. Ellos ven el nombre, quién narra, la premisa y el enlace a la mesa virtual. Tus notas, tus PNJ y el combate no se comparten.</p>
          <p class="ng-flash" data-ng-flash role="status" ${note ? '' : 'hidden'}>${esc(note)}</p>
          <div class="${p}-actions"><button type="button" class="${p}-button" data-ng-share ${busy ? 'disabled' : ''}>${busy ? 'COMPARTIENDO…' : 'COMPARTIR CON UN CÓDIGO'}</button></div></section>`;
        node.querySelector('[data-ng-share]').addEventListener('click', async () => {
          if (busy) return;
          busy = true; note = ''; paint();
          try {
            const { data, error } = await client.rpc('share_campaign', { p_campaign: c.id, p_system: ctx.system, p_name: text(c.name, 80), p_info: publicInfo(c) });
            if (error || !data?.[0]?.id) throw error || new Error('sin respuesta');
            c.shared = { id: data[0].id, code: text(data[0].code, 16), diary: false };
            ctx.save();
            owned = [...owned.filter(o => o.id !== c.shared.id), { id: c.shared.id, campaign_id: c.id, system: ctx.system, name: c.name }];
            if (!rosters.has(c.shared.id)) rosters.set(c.shared.id, []);
            loadMembers().catch(() => {});
            setLive(ctx.system, { id: c.shared.id, name: c.name }, true);
          } catch (error) { c.shared = null; note = fail(error); }
          busy = false;
          if (node.isConnected) paint();
        });
        return;
      }
      const id = c.shared.id;
      node.innerHTML = `<section class="${p}-panel ap-panel ng-panel"><h2>Código de invitación</h2>
          <div class="ng-code"><output class="ng-code-value" aria-label="Código de invitación">${esc(showCode(c.shared.code)) || '········'}</output><button type="button" class="${p}-button" data-ng-copy>COPIAR</button><button type="button" class="${p}-button ${asking === 'renew' ? 'danger' : 'ghost'}" data-ng-renew>${asking === 'renew' ? '¿CAMBIARLO? PULSA OTRA VEZ' : 'CAMBIAR EL CÓDIGO'}</button></div>
          <p class="${p}-note">Tus jugadores lo escriben en la pestaña «Campañas» de ${esc(SYSTEM_NAMES[ctx.system] || 'este sistema')}, en «Unirse con un código». Si lo cambias, el anterior deja de servir; quien ya está dentro, sigue dentro.</p>
          <p class="ng-flash" data-ng-flash role="status" ${note ? '' : 'hidden'}>${esc(note)}</p>
          <label class="ap-check ng-live"><input type="checkbox" data-ng-diary ${c.shared.diary ? 'checked' : ''}><span><b>Los jugadores ven el diario de sesiones</b><small>Solo para leerlo. Tus notas, tus PNJ y el combate siguen siendo solo tuyos. Del «Mundo» ven solo las entradas que marques una a una.</small></span></label>
          ${liveBox(ctx.system, id)}</section>
        <section class="${p}-panel ap-panel ng-panel"><h2>Jugadores <small data-ng-count>${(rosters.get(id) || []).length}</small></h2><div data-ng-members>${membersHtml()}</div></section>
        <section class="${p}-panel ap-panel ng-panel"><h2>Tiradas en directo</h2><div data-ng-feed>${feedHtml(id)}</div></section>
        <div class="${p}-actions ap-danger-row"><button type="button" class="${p}-button danger" data-ng-stop>${asking === 'stop' ? '¿DEJAR DE COMPARTIR? PULSA OTRA VEZ' : 'DEJAR DE COMPARTIR'}</button></div>`;
      note = '';
      paintMembers();
      node.querySelector('[data-ng-copy]').addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(showCode(c.shared.code)); flashTo(node, 'Código copiado.'); } catch { flashTo(node, `Cópialo a mano: ${showCode(c.shared.code)}`); }
      });
      node.querySelector('[data-ng-renew]').addEventListener('click', async () => {
        if (asking !== 'renew') { asking = 'renew'; paint(); node.querySelector('[data-ng-renew]')?.focus(); return; }
        asking = '';
        const { data, error } = await client.rpc('renew_share_code', { p_id: id });
        if (error || typeof data !== 'string') note = fail(error || new Error('sin respuesta'));
        else { c.shared.code = text(data, 16); ctx.save(); note = 'Código nuevo. El anterior ya no sirve.'; }
        if (node.isConnected) paint();
      });
      node.querySelector('[data-ng-diary]').addEventListener('change', event => {
        c.shared.diary = event.target.checked;
        ctx.save();
        pushInfo(c).then(() => flashTo(node, c.shared?.diary ? 'Los jugadores ya pueden leer el diario.' : 'El diario vuelve a ser solo tuyo.')).catch(error => flashTo(node, fail(error)));
      });
      node.querySelector('[data-ng-live]').addEventListener('change', event => setLive(ctx.system, { id, name: c.name }, event.target.checked));
      node.querySelector('[data-ng-stop]').addEventListener('click', async () => {
        if (asking !== 'stop') { asking = 'stop'; paint(); node.querySelector('[data-ng-stop]')?.focus(); return; }
        asking = '';
        const failed = await unshare(c);
        if (failed) note = failed;
        else { ctx.save(); note = 'La campaña ha dejado de estar compartida. Los jugadores ya no la ven.'; }
        if (node.isConnected) paint();
      });
      listen(id, node, () => { const box = node.querySelector('[data-ng-feed]'); if (box) box.innerHTML = feedHtml(id); });
      // El grupo se mira de vez en cuando mientras el panel sigue abierto: quién ha entrado y cómo van sus fichas.
      timer = setInterval(() => {
        if (!node.isConnected || !c.shared) { clearInterval(timer); return; }
        if (document.visibilityState === 'visible') loadMembers().catch(() => {});
      }, 20000);
    }

    paint();
    if (client && signedIn() && c.shared?.id) verify().catch(error => flashTo(node, fail(error)));
  }

  // Deja de compartir una campaña propia. Devuelve un texto si falla.
  async function unshare(c) {
    const id = c?.shared?.id;
    if (!id) return '';
    if (!signedIn()) return 'Entra en tu cuenta para dejar de compartirla.';
    const { error } = await client.from('shared_campaigns').delete().eq('id', id);
    if (error) return fail(error);
    c.shared = null;
    owned = owned.filter(o => o.id !== id);
    Object.keys(cache.live).forEach(system => { if (cache.live[system].id === id) delete cache.live[system]; });
    remember();
    unwatch(id);
    [rosters, feeds, pushedInfo].forEach(map => map.delete(id));
    changed();
    return '';
  }

  // Jugadores de una campaña compartida para la lista de combate de quien dirige: [{ id, name, init }].
  function party(c, shared) {
    const list = c?.shared?.id ? rosters.get(c.shared.id) : null;
    if (!list || !shared) return [];
    return list.map(m => { const card = cardFor(m, shared); return card ? { id: `g:${m.user_id}`, name: card.name, init: card.init } : null; }).filter(Boolean);
  }
  // Al abrir una campaña compartida, se trae su grupo para que el combate pueda añadirlo.
  function warm(c) {
    const id = c?.shared?.id;
    if (!id || !signedIn() || rosters.has(id)) return;
    client.from('shared_members').select('user_id,display_name,sheet_id,sheet_name,summary,sheet,updated_at,joined_at').eq('campaign', id).order('joined_at')
      .then(({ data, error }) => { if (!error && !rosters.has(id)) rosters.set(id, data || []); });
  }

  // ───────────── Quien juega ─────────────
  /*
   * ctx: { system, prefix, id (campaña compartida), characters() fichas de este dispositivo, shared, gone(texto)
   * para volver a la lista cuando la campaña ya no está }
   */
  function mountPlayer(node, ctx) {
    const p = ctx.prefix;
    const id = ctx.id;
    let asking = false;
    let timer = 0;
    const camp = () => cache.joined.find(g => g.id === id) || null;

    async function loadParty() {
      const { data, error } = await client.rpc('shared_party', { p_id: id });
      if (error) throw error;
      // Sin filas: la campaña se dejó de compartir o te han sacado de ella.
      if (!data?.length) { await refresh(true).catch(() => {}); if (!camp() && node.isConnected) ctx.gone('Esa campaña ya no está compartida contigo.'); return; }
      const before = JSON.stringify(parties.get(id) || []);
      parties.set(id, data);
      if (JSON.stringify(data) !== before && node.isConnected) { paintParty(); const box = node.querySelector('[data-ng-feed]'); if (box) box.innerHTML = feedHtml(id); }
    }
    function partyHtml() {
      const list = parties.get(id);
      if (!list) return '<p class="ng-none">Cargando el grupo…</p>';
      return `<ul class="ng-members">${list.map(m => `<li><span class="ng-who"><b>${esc(m.is_owner ? m.display_name || 'Quien dirige' : m.sheet_name || m.display_name || 'Jugador')}</b><small>${m.is_owner ? 'Dirige la campaña' : `${m.sheet_name ? `${esc(m.display_name || 'Jugador')} · ` : ''}${esc(m.summary || (m.sheet_name ? '' : 'Aún sin personaje'))}`}${m.user_id === me()?.id ? ' · tú' : ''}</small></span></li>`).join('')}</ul>`;
    }
    function paintParty() { const box = node.querySelector('[data-ng-party]'); if (box) box.innerHTML = partyHtml(); }

    function paint() {
      clearInterval(timer);
      const g = camp();
      if (!client || !signedIn()) { node.innerHTML = needAccount(p); return; }
      if (!g) { ctx.gone('Esa campaña ya no está compartida contigo.'); return; }
      const info = g.info || {};
      const link = webLink(info.vtt);
      const mine = ctx.characters();
      const chosen = mine.some(ch => ch.id === g.sheet_id) ? g.sheet_id : '';
      const sessions = Array.isArray(info.sessions) ? info.sessions.filter(s => s && typeof s === 'object') : null;
      const world = window.NEXO_MUNDO && Array.isArray(info.world) ? info.world.filter(e => e && typeof e === 'object') : [];
      node.innerHTML = `<header class="ap-hero ng-hero"><span class="ap-hero-mark" aria-hidden="true">${esc((g.name || '?').trim().charAt(0).toUpperCase() || '?')}</span><p class="${p}-kicker">CAMPAÑA COMPARTIDA${info.master || g.owner_name ? ` · NARRA ${esc(String(info.master || g.owner_name).toLocaleUpperCase('es'))}` : ''}</p><h1>${esc(g.name || 'Campaña sin nombre')}</h1>${text(info.premise, 1200).trim() ? `<p class="ap-hero-premise">${esc(text(info.premise, 1200).trim())}</p>` : ''}
          ${link ? `<div class="${p}-actions"><a class="${p}-button" href="${esc(link)}" target="_blank" rel="noopener noreferrer">ABRIR LA MESA VIRTUAL</a></div>` : ''}</header>
        <section class="${p}-panel ap-panel ng-panel"><h2>Tu personaje</h2>
          ${mine.length ? `<div class="${p}-fields"><label class="${p}-field ap-wide"><span>Juegas con</span><select data-ng-sheet><option value="">— Ninguno por ahora —</option>${mine.map(ch => `<option value="${esc(ch.id)}" ${ch.id === chosen ? 'selected' : ''}>${esc(ch.name)}${ch.summary ? ` · ${esc(ch.summary)}` : ''}</option>`).join('')}</select></label></div>` : `<p class="${p}-note">Todavía no tienes fichas en este sistema. Crea tu personaje en la pestaña «Personajes» y vuelve para elegirlo.</p>`}
          <p class="${p}-note">${g.sheet_id && !chosen ? `Compartes «${esc(g.sheet_name || 'una ficha')}», que no está en este dispositivo. ` : ''}Quien dirige puede ver la ficha que elijas, solo para leerla. Se pone al día sola cada vez que la cambias con tu cuenta.</p>
          <p class="ng-flash" data-ng-flash role="status" hidden></p>
          ${liveBox(ctx.system, id)}</section>
        <section class="${p}-panel ap-panel ng-panel"><h2>El grupo</h2><div data-ng-party>${partyHtml()}</div></section>
        <section class="${p}-panel ap-panel ng-panel"><h2>Tiradas en directo</h2><div data-ng-feed>${feedHtml(id)}</div></section>
        ${sessions ? `<section class="${p}-panel ap-panel ng-panel"><h2>Diario de sesiones <small>${sessions.length}</small></h2>${sessions.length ? `<div class="ap-log">${sessions.map(s => `<details class="ap-session"><summary><span class="ap-session-date">${esc(s.date ? new Date(`${text(s.date, 10)}T12:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sin fecha')}</span><b>${esc(text(s.title, 80) || 'Sesión sin título')}</b></summary><p class="ng-session-text">${esc(text(s.text, 6000)) || 'Sin apuntes.'}</p></details>`).join('')}</div>` : `<p class="ng-none">Quien dirige aún no ha apuntado ninguna sesión.</p>`}</section>` : ''}
        ${world.length ? `<section class="${p}-panel ap-panel ng-panel"><h2>Mundo <small>${world.length}</small></h2><p class="${p}-note">Lo que quien dirige ha querido enseñaros de la campaña: gente, lugares y tramas.</p><div data-ng-world></div></section>` : ''}
        <div class="${p}-actions ap-danger-row"><button type="button" class="${p}-button danger" data-ng-leave>${asking ? '¿SALIR? PULSA OTRA VEZ' : 'SALIR DE LA CAMPAÑA'}</button></div>`;
      // Texto de otra cuenta: mundo.js lo rehace con tipos sanos y lo escapa todo antes de pintarlo.
      if (world.length) {
        const box = node.querySelector('[data-ng-world]');
        const shown = window.NEXO_MUNDO.view(box, world, { prefix: p });
        if (shown) box.parentNode.querySelector('h2 small').textContent = shown;
        else box.parentNode.remove();
      }
      node.querySelector('[data-ng-sheet]')?.addEventListener('change', async event => {
        const sid = event.target.value;
        const mineNow = sid ? ctx.shared.raw(sid) : null;
        flashTo(node, 'Guardando…');
        const failed = await setSheet(id, mineNow, ctx.shared);
        if (!node.isConnected) return;
        if (failed) { flashTo(node, failed); if (!camp()) ctx.gone(failed); return; }
        flashTo(node, mineNow ? 'Hecho: quien dirige ya puede ver tu ficha.' : 'Ya no compartes ninguna ficha en esta campaña.');
        loadParty().catch(() => {});
      });
      node.querySelector('[data-ng-live]').addEventListener('change', event => setLive(ctx.system, g, event.target.checked));
      node.querySelector('[data-ng-leave]').addEventListener('click', async () => {
        if (!asking) { asking = true; paint(); node.querySelector('[data-ng-leave]')?.focus(); return; }
        asking = false;
        const { error } = await client.from('shared_members').delete().eq('campaign', id).eq('user_id', me().id);
        if (error) { flashTo(node, fail(error)); return; }
        cache.joined = cache.joined.filter(item => item.id !== id);
        Object.keys(cache.live).forEach(system => { if (cache.live[system].id === id) delete cache.live[system]; });
        remember();
        unwatch(id);
        changed();
        ctx.gone('Has salido de la campaña.');
      });
      listen(id, node, () => { const box = node.querySelector('[data-ng-feed]'); if (box) box.innerHTML = feedHtml(id); });
      timer = setInterval(() => {
        if (!node.isConnected) { clearInterval(timer); return; }
        if (document.visibilityState === 'visible') loadParty().catch(() => {});
      }, 30000);
    }

    paint();
    if (client && signedIn() && camp()) {
      loadParty().catch(error => flashTo(node, fail(error)));
      // Lo que quien dirige haya cambiado (premisa, enlace, diario) se ve al entrar.
      refresh(true).then(moved => { if (moved && node.isConnected && camp()) paint(); }).catch(() => {});
    }
  }

  // Formulario para entrar con un código. ctx: { prefix, system, joined(resultado) }
  function mountJoin(node, ctx) {
    const p = ctx.prefix;
    if (!client || !signedIn()) { node.innerHTML = needAccount(p); return; }
    node.innerHTML = `<form class="${p}-panel ap-panel ng-panel ng-join" data-ng-join novalidate><h2>Unirse con un código</h2>
      <p class="${p}-note">Quien dirige te da un código de ocho letras y números. Al entrar podrás elegir con qué personaje juegas, y tus tiradas le llegarán al grupo.</p>
      <div class="ng-join-row"><label class="${p}-field"><span>Código</span><input data-ng-code maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD-2345"></label><button type="submit" class="${p}-button">ENTRAR</button></div>
      <p class="ng-flash" data-ng-flash role="status" hidden></p></form>`;
    const form = node.querySelector('[data-ng-join]');
    const input = node.querySelector('[data-ng-code]');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const code = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (code.length !== 8) { flashTo(node, 'El código tiene ocho letras y números.'); input.focus(); return; }
      flashTo(node, 'Buscando la campaña…');
      const { data, error } = await client.rpc('join_campaign', { p_code: code });
      if (error || !data?.id) { flashTo(node, fail(error || new Error('sin respuesta'))); return; }
      if (data.own) { flashTo(node, `«${data.name || 'Esa campaña'}» es tuya: la diriges tú.`); return; }
      await refresh(true).catch(() => {});
      if (!cache.live[data.system]) setLive(data.system, { id: data.id, name: data.name }, true);
      if (!node.isConnected) return;
      if (data.system !== ctx.system) { input.value = ''; flashTo(node, `Has entrado en «${data.name || 'la campaña'}», que es de ${SYSTEM_NAMES[data.system] || 'otro sistema'}. La tienes en la pestaña «Campañas» de su apartado.`); return; }
      ctx.joined(data);
    });
    input.focus();
  }

  // Ventana de dados: a qué campaña va la tirada y qué ha sido de ella.
  function dice(result) {
    const live = liveNow();
    if (!live || !result || result.error) return null;
    return { name: live.name || 'la campaña', muted: Boolean(live.muted), status: sent.get(result) || 'hidden' };
  }
  function diceAction(kind, result) {
    const live = liveNow();
    if (!live) return;
    if (kind === 'mute') { cache.live[live.system].muted = !live.muted; remember(); changed(); }
    else if (kind === 'send' && result && !result.error && sent.get(result) !== 'sent' && sent.get(result) !== 'sending') sendRoll(live, result);
  }

  // Al abrir un apartado: se traen sus campañas compartidas y se escuchan las tiradas de la que va en directo.
  function enter(system) {
    if (!signedIn()) return;
    refresh().catch(() => {}).then(() => { const live = cache.live[system]; if (live && where()?.system === system) watch(live.id); });
  }
  document.addEventListener('nexo:account-ready', () => { refresh(true).catch(() => {}); });

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = './src/nexo/grupo.css?v=1';
  document.head.append(css);

  window.NEXO_GRUPO = {
    get available() { return Boolean(client); },
    joined: system => cache.joined.filter(g => g.system === system).map(g => ({ ...g })),
    refresh, enter, mountOwner, mountPlayer, mountJoin, unshare, party, warm, dice, diceAction
  };
})();
