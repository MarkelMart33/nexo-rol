/*
 * NEXO · Copias: exportar e importar fichas y la copia de seguridad completa.
 * - Una ficha suelta: { app: 'NEXO', kind: 'ficha', system, character }.
 * - Copia completa: { app: 'NEXO', kind: 'copia', data: { <clave de localStorage>: almacén } }.
 * Al restaurar se mezcla por id y gana lo más reciente (updatedAt); nunca se borra nada de este dispositivo.
 * Con cuenta, lo restaurado se sube también a la nube.
 * Lo que llega de un archivo pasa por el mismo filtro que una ficha importada (NEXO_FICHA.accept).
 */
(() => {
  // Almacenes con una lista de registros con id: fichas de cada sistema y campañas de todos.
  const STORES = [
    { game: 'vampiro', key: 'nexo-vampire-v1', field: 'characters', label: 'Vampiro' },
    { game: 'dnd', key: 'nexo-dnd-v1', field: 'characters', label: 'Dungeons & Dragons' },
    { game: 'tormentas', key: 'nexo-tormentas-v1', field: 'characters', label: 'El Archivo de las Tormentas' },
    { game: 'cthulhu', key: 'nexo-cthulhu-v1', field: 'characters', label: 'La llamada de Cthulhu' },
    { game: 'pathfinder', key: 'nexo-pathfinder-v1', field: 'characters', label: 'Pathfinder' },
    { game: 'campanas', key: 'nexo-campanas-v1', field: 'campaigns', label: 'Campañas' }
  ];
  const TRAVELLER_KEY = 'nexo-traveller-v1';
  const stamp = () => new Date().toISOString().slice(0, 10);
  const slug = text => String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
  }
  function list(key, field) {
    const rows = read(key)?.[field];
    return Array.isArray(rows) ? rows.filter(row => row && typeof row === 'object' && row.id) : [];
  }

  function download(filename, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  // Abre el selector de archivos y devuelve el JSON leído (o null si se cancela).
  function pick() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.hidden = true;
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        input.remove();
        if (!file) { resolve(null); return; }
        try { resolve(JSON.parse(await file.text())); } catch { reject(new Error('El archivo no es una copia de NEXO válida.')); }
      });
      input.addEventListener('cancel', () => { input.remove(); resolve(null); });
      document.body.append(input);
      input.click();
    });
  }

  // ── Ficha suelta
  function exportCharacter(system, character, name) {
    download(`nexo-${slug(system)}-${slug(name || character.name) || 'ficha'}.json`, { app: 'NEXO', kind: 'ficha', version: 1, system, exportedAt: new Date().toISOString(), character });
  }
  // Devuelve la ficha de un archivo exportado si es de ese sistema; si no, lanza un error legible.
  function characterFrom(parsed, system, systemLabel) {
    if (!parsed || parsed.app !== 'NEXO') throw new Error('El archivo no es una copia de NEXO.');
    if (parsed.kind === 'copia') throw new Error('Ese archivo es una copia completa: restáurala desde tu perfil.');
    if (parsed.kind !== 'ficha' || !parsed.character || typeof parsed.character !== 'object') throw new Error('El archivo no contiene una ficha.');
    if (parsed.system !== system) throw new Error(`Esa ficha es de otro sistema, no de ${systemLabel}.`);
    return structuredClone(parsed.character);
  }

  // ── Copia completa
  function summary() {
    const rows = STORES.map(s => ({ label: s.label, count: list(s.key, s.field).length }));
    const traveller = read(TRAVELLER_KEY)?.campaigns;
    rows.unshift({ label: 'Partidas de Traveller', count: Array.isArray(traveller) ? traveller.length : 0 });
    return rows;
  }
  function exportAll() {
    window.NEXO_APARTADOS?.flush?.();
    const data = {};
    STORES.forEach(s => { data[s.key] = { [s.field]: list(s.key, s.field) }; });
    const traveller = read(TRAVELLER_KEY);
    if (traveller?.campaigns) data[TRAVELLER_KEY] = { campaigns: traveller.campaigns };
    download(`nexo-copia-${stamp()}.json`, { app: 'NEXO', kind: 'copia', version: 1, exportedAt: new Date().toISOString(), data });
    return summary();
  }

  // Mezcla por id: entra lo que falta y sustituye lo que en el archivo sea más reciente.
  function merge(local, incoming) {
    const byId = new Map(local.map(row => [row.id, row]));
    let added = 0, updated = 0;
    incoming.forEach(row => {
      const mine = byId.get(row.id);
      if (!mine) { byId.set(row.id, row); added += 1; }
      else if (String(row.updatedAt || '') > String(mine.updatedAt || '')) { byId.set(row.id, row); updated += 1; }
    });
    const localIds = new Set(local.map(row => row.id));
    return { rows: [...local.map(row => byId.get(row.id)), ...incoming.filter(row => !localIds.has(row.id))], added, updated };
  }

  // Texto de un archivo de fuera: sin los signos con los que se escribe marcado.
  function tame(value, depth = 0) {
    if (depth > 40) return null;
    if (typeof value === 'string') return value.replace(/</g, '‹').replace(/>/g, '›');
    if (Array.isArray(value)) return value.map(item => tame(item, depth + 1));
    if (value && typeof value === 'object') {
      const out = {};
      Object.keys(value).forEach(key => { if (!['__proto__', 'constructor', 'prototype'].includes(key)) out[tame(key)] = tame(value[key], depth + 1); });
      return out;
    }
    return value;
  }
  // Una fila del archivo, ya revisada por su sistema; lo que no se entiende se descarta.
  function cleanRow(s, row) {
    if (!row || typeof row !== 'object' || typeof row.id !== 'string' || !row.id) return null;
    try {
      return s.field === 'campaigns' ? window.NEXO_APARTADOS.cleanCampaign(window.NEXO_FICHA.scrub(row)) : window.NEXO_FICHA.accept(s.game, row);
    } catch { return null; }
  }

  async function restore(parsed) {
    if (!parsed || parsed.app !== 'NEXO') throw new Error('El archivo no es una copia de NEXO.');
    if (parsed.kind === 'ficha') throw new Error('Ese archivo es una sola ficha: impórtala desde la lista de personajes de su sistema.');
    if (parsed.kind !== 'copia' || !parsed.data || typeof parsed.data !== 'object') throw new Error('El archivo no es una copia completa de NEXO.');
    const result = [];
    window.NEXO_APARTADOS?.flush?.();
    for (const s of STORES) {
      const incoming = parsed.data[s.key]?.[s.field];
      if (!Array.isArray(incoming)) continue;
      const clean = incoming.map(row => cleanRow(s, row)).filter(Boolean);
      const { rows, added, updated } = merge(list(s.key, s.field), clean);
      if (!added && !updated) { result.push({ label: s.label, added, updated }); continue; }
      const store = { [s.field]: rows };
      localStorage.setItem(s.key, JSON.stringify(store));
      window.NEXO_CLOUD?.save(s.game, s.key, store);
      result.push({ label: s.label, added, updated });
    }
    // Las campañas viven en memoria en apartados.js: se le pide que vuelva a leerlas.
    window.NEXO_APARTADOS?.reload?.();
    const traveller = parsed.data[TRAVELLER_KEY]?.campaigns;
    if (Array.isArray(traveller) && window.NEXO_TRAVELLER?.restore) {
      const added = window.NEXO_TRAVELLER.restore(tame(traveller));
      result.unshift({ label: 'Partidas de Traveller', added, updated: 0 });
    }
    return result;
  }

  window.NEXO_COPIAS = { download, pick, exportCharacter, characterFrom, exportAll, restore, summary };
})();
