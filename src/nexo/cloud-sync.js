/*
 * NEXO cloud saves for the character-based games (Vampiro, D&D, Tormentas, Cthulhu).
 * Each account keeps one private row per game in public.game_saves.
 * The browser copy stays as the working copy; "<key>-cloud" records whether
 * it has been uploaded ("clean") or still has changes the cloud lacks.
 */
(() => {
  const client = window.nexoSupabaseClient || null;
  const LOCAL_KEYS = ['nexo-vampire-v1', 'nexo-dnd-v1', 'nexo-tormentas-v1', 'nexo-cthulhu-v1'];
  const chains = {};
  let user = null;

  const mark = (key, state) => { try { localStorage.setItem(`${key}-cloud`, state); } catch {} };
  const isClean = key => { try { return localStorage.getItem(`${key}-cloud`) === 'clean'; } catch { return false; } };

  if (client) {
    client.auth.getSession().then(({ data }) => { user = data.session?.user || null; });
    client.auth.onAuthStateChange((event, session) => {
      user = session?.user || null;
      // Al cerrar sesión, este dispositivo deja de guardar las fichas de esa cuenta.
      if (event === 'SIGNED_OUT') LOCAL_KEYS.forEach(key => { localStorage.removeItem(key); localStorage.removeItem(`${key}-cloud`); });
    });
  }

  // Uploads the game's store. Resolves null without an account, otherwise whether it reached the cloud.
  function save(game, key, store) {
    mark(key, 'dirty');
    if (!client || !user) return Promise.resolve(null);
    const row = { owner_id: user.id, game, data: store };
    chains[game] = (chains[game] || Promise.resolve()).catch(() => {}).then(async () => {
      const { error } = await client.from('game_saves').upsert(row, { onConflict: 'owner_id,game' });
      if (error) throw error;
      mark(key, 'clean');
      return true;
    });
    return chains[game].catch(error => { console.error('NEXO sync error', error); return false; });
  }

  // Brings the local store in line with the cloud. Unuploaded local characters are
  // merged in (newest updatedAt wins); otherwise the cloud copy replaces the local one.
  async function syncCharacters(game, key, local) {
    if (!client || !user) return null;
    await chains[game]?.catch(() => {});
    const { data: row, error } = await client.from('game_saves').select('data').eq('game', game).maybeSingle();
    if (error) throw error;
    const remote = Array.isArray(row?.data?.characters) ? row.data.characters : [];
    if (row && isClean(key)) {
      const store = { characters: remote };
      localStorage.setItem(key, JSON.stringify(store));
      return store;
    }
    const byId = new Map(remote.map(ch => [ch.id, ch]));
    local.characters.forEach(ch => {
      const other = byId.get(ch.id);
      if (!other || String(ch.updatedAt || '') >= String(other.updatedAt || '')) byId.set(ch.id, ch);
    });
    const localIds = new Set(local.characters.map(ch => ch.id));
    const store = { characters: [...local.characters.map(ch => byId.get(ch.id)), ...remote.filter(ch => !localIds.has(ch.id))] };
    localStorage.setItem(key, JSON.stringify(store));
    await save(game, key, store);
    return store;
  }

  window.NEXO_CLOUD = { get signedIn() { return Boolean(client && user); }, get user() { return user; }, save, syncCharacters };
})();
