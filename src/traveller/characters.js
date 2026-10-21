(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const panel = $('#charactersPanel');
  if (!panel) return;
  const listView = $('#charactersListView');
  const editorView = $('#characterEditorView');
  const list = $('#charactersList');
  const deleteDialog = $('#deleteCharacterDialog');
  const deleteConfirm = $('#confirmDeleteCharacter');
  const ranges = [
    { min: 0, max: 0, mod: -3 }, { min: 1, max: 2, mod: -2 },
    { min: 3, max: 5, mod: -1 }, { min: 6, max: 8, mod: 0 },
    { min: 9, max: 11, mod: 1 }, { min: 12, max: 14, mod: 2 },
    { min: 15, max: Infinity, mod: 3 }
  ];
  let draft = null;
  let saveTimer = 0;
  let pendingDeleteId = null;

  function storeApi() { return window.NEXO_CHARACTER_API; }
  function characters() { return storeApi()?.getCharacters() || []; }
  function commit() { storeApi()?.commitCharacters(); }
  function setSaveStatus(message) {
    editorView.querySelectorAll('[data-character-save-status]').forEach(node => { node.textContent = message; });
  }
  function newCharacter() {
    return {
      id: crypto.randomUUID(), createdAt: new Date().toISOString(),
      personal: {}, biometrics: {}, vitals: {}, skills: [], weeks: 0
    };
  }
  function savedDraft() { return Boolean(draft && characters().some(character => character.id === draft.id)); }
  function ensureSaved() {
    if (!draft) return;
    const rows = characters();
    if (!rows.some(character => character.id === draft.id)) rows.unshift(draft);
  }
  function flushSave(force = false) {
    clearTimeout(saveTimer);
    if (!draft) return;
    if (!force && !savedDraft()) return;
    ensureSaved();
    commit();
    setSaveStatus('GUARDADO EN ESTA PARTIDA');
  }
  function scheduleSave() {
    ensureSaved();
    const deleteButton = $('[data-delete-character]', editorView);
    if (deleteButton) deleteButton.hidden = false;
    setSaveStatus('GUARDANDO CAMBIOS…');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, 350);
  }
  function escapeText(value) {
    const node = document.createElement('span');
    node.textContent = String(value ?? '');
    return node.innerHTML;
  }
  function renderList() {
    list.replaceChildren();
    const rows = characters();
    if (!rows.length) {
      const empty = document.createElement('div');
      empty.className = 'characters-empty';
      empty.innerHTML = '<span>♙</span><b>Aún no hay personajes</b><small>Pulsa «Añadir personaje» para crear la primera ficha.</small>';
      list.append(empty);
      return;
    }
    rows.forEach(character => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'character-card';
      button.dataset.characterId = character.id;
      const glyph = document.createElement('span');
      glyph.className = 'character-card-glyph';
      glyph.textContent = '♙';
      const copy = document.createElement('span');
      copy.className = 'character-card-copy';
      const name = document.createElement('b');
      name.textContent = [character.personal?.name, character.personal?.surname].filter(Boolean).join(' ').trim() || 'PERSONAJE SIN NOMBRE';
      const details = document.createElement('small');
      details.textContent = [character.personal?.profession, character.personal?.player].filter(Boolean).join(' · ') || 'FICHA DE PERSONAJE';
      const arrow = document.createElement('span');
      arrow.className = 'character-card-arrow';
      arrow.textContent = '→';
      copy.append(name, details);
      button.append(glyph, copy, arrow);
      button.addEventListener('click', () => openEditor(character.id));
      list.append(button);
    });
  }
  function field(label, key, placeholder = '', type = 'text', extra = '') {
    return `<label class="field"><span>${label}</span><input type="${type}" data-cfield="${key}" placeholder="${placeholder}" ${extra}></label>`;
  }
  function editorMarkup() {
    return `<div class="character-editor-head"><div><span class="section-index">EDITOR DE PERSONAJE</span><h2>Ficha de personaje</h2></div><span class="character-save-status" data-character-save-status>CAMBIOS LOCALES</span></div>
      <section class="character-sheet-section"><div class="panel-title"><div><span class="section-index">01 / DATOS PERSONALES</span><h3>Identidad</h3></div><label class="field upp-field"><span>UPP</span><input data-cfield="personal.upp" aria-label="UPP del personaje" placeholder="Código UPP"></label></div>
        <div class="character-personal-grid">
          ${field('PERSONAJE', 'personal.name', 'Nombre')}${field('APELLIDO', 'personal.surname', 'Apellidos')}
          ${field('JUGADOR', 'personal.player', 'Nombre del jugador')}${field('FECHA DE NACIMIENTO', 'personal.birthDate', 'AAAA-MM-DD', 'date')}
          ${field('RAZA / ESPECIE', 'personal.race', 'Especie')}${field('SEXO', 'personal.sex', 'Sexo')}${field('EDAD', 'personal.age', 'Años', 'number', 'min="0"')}
          ${field('ALTURA', 'personal.height', 'cm', 'number', 'min="0"')}${field('PESO', 'personal.weight', 'kg', 'number', 'min="0"')}${field('MANO DOMINANTE', 'personal.hand', 'Mano')}
          <label class="field field-wide"><span>TRABAJO / OFICIO</span><input data-cfield="personal.profession" placeholder="Oficio del personaje"></label>
          <label class="field field-full"><span>DESCRIPCIÓN FÍSICA</span><textarea data-cfield="personal.description" placeholder="Rasgos, aspecto y detalles del personaje"></textarea></label>
        </div>
      </section>
      <section class="character-sheet-section"><div class="panel-title"><div><span class="section-index">02 / DATOS BIOMÉTRICOS</span><h3>Atributos</h3></div><span class="character-hint">3D6 · DESCARTA EL DADO MÁS BAJO</span></div>
        <div class="character-bio-grid">
          ${bioAttribute('FUE', 'FUERZA', 'strInitial', 'strCurrent', true)}
          ${bioAttribute('DES', 'DESTREZA', 'dexInitial', 'dexCurrent', true)}
          ${bioAttribute('RES', 'RESISTENCIA', 'endInitial', 'endCurrent', true)}
          ${bioAttribute('INT', 'INTELIGENCIA', 'intelligence')}
          ${bioAttribute('EDU', 'EDUCACIÓN', 'education')}
          ${bioAttribute('CAR', 'CARISMA', 'charisma')}
          ${bioAttribute('SOC', 'ESTATUS SOCIAL', 'social')}
        </div>
        <table class="character-mod-table" aria-label="Tabla de modificadores de atributos"><tbody><tr><th>MODIFICADOR</th><td data-mod-col="0">−3</td><td data-mod-col="1">−2</td><td data-mod-col="2">−1</td><td data-mod-col="3">0</td><td data-mod-col="4">+1</td><td data-mod-col="5">+2</td><td data-mod-col="6">+3</td></tr><tr><th>VALOR</th><td data-mod-col="0">0</td><td data-mod-col="1">1–2</td><td data-mod-col="2">3–5</td><td data-mod-col="3">6–8</td><td data-mod-col="4">9–11</td><td data-mod-col="5">12–14</td><td data-mod-col="6">15+</td></tr></tbody></table>
      </section>
      <section class="character-sheet-section"><div class="panel-title"><div><span class="section-index">03 / DATOS VITALES</span><h3>Estado físico</h3></div></div><div class="character-vitals-grid">
        ${field('PV · PUNTOS DE VIDA', 'vitals.pv', '', 'number', 'min="0"')}
        ${field('INCONSCIENTE · MARCADOR 1', 'vitals.unconscious1', '', 'number', 'min="0"')}
        ${field('INCONSCIENTE · MARCADOR 2', 'vitals.unconscious2', '', 'number', 'min="0"')}
        <label class="character-ko"><input type="checkbox" data-cfield="vitals.ko"> K.O.</label>
        <label class="field field-full"><span>ACTUALES</span><textarea data-cfield="vitals.current" placeholder="Daño, heridas o estado actual"></textarea></label>
      </div></section>
      <section class="character-sheet-section"><div class="panel-title"><div><span class="section-index">04 / DATOS DE HABILIDADES</span><h3>Habilidades</h3></div><div class="character-weeks"><span>SEMANAS</span><button type="button" data-week="-1" aria-label="Quitar una semana">−</button><output data-week-count>0</output><button type="button" data-week="1" aria-label="Añadir una semana">+</button></div></div>
        <div class="character-skills-head"><span>HABILIDAD</span><span>ESPECIALIDAD</span><span>ATR.</span><span>NIVEL</span><span></span><span></span></div><div class="character-skills" data-skill-list></div><button class="small-action character-add-skill" type="button" data-add-skill>＋ AÑADIR HABILIDAD</button>
      </section>
      <div class="character-editor-footer"><span data-character-save-status>CAMBIOS LOCALES</span><div><button type="button" class="cancel-button" data-back-to-characters>ATRÁS</button><button type="button" class="delete-character-button" data-delete-character ${savedDraft() ? '' : 'hidden'}>ELIMINAR</button><button type="button" class="confirm-button buy-confirm" data-save-character>GUARDAR</button></div></div>`;
  }
  function bioAttribute(shortName, label, ...args) {
    const paired = args.at(-1) === true;
    const keys = paired ? args.slice(0, -1) : args;
    const valueField = key => `<label class="character-bio-slot"><small>${paired ? (key.endsWith('Initial') ? 'INICIAL' : 'ACTUAL') : 'VALOR'}</small><span class="character-score-control"><span class="character-score-steps"><button type="button" data-score-step="-1" aria-label="Restar uno a ${label.toLocaleLowerCase('es')} ${paired ? (key.endsWith('Initial') ? 'inicial' : 'actual') : ''}">−</button><button type="button" data-score-step="1" aria-label="Sumar uno a ${label.toLocaleLowerCase('es')} ${paired ? (key.endsWith('Initial') ? 'inicial' : 'actual') : ''}">+</button></span><span class="character-hex"><input type="number" min="0" max="99" data-score="${key}" data-cfield="biometrics.${key}" aria-label="${label} ${key}"><output data-modifier><span>—</span></output></span></span></label>`;
    return `<div class="character-bio"><b>${shortName}<small>${label}</small><button type="button" class="character-char-roll" data-char-roll="${shortName}" aria-label="Tirar ${label.toLocaleLowerCase('es')}">⚄ TIRAR</button></b><div>${keys.map(valueField).join('')}</div></div>`;
  }
  // Prueba de Traveller desde la ficha: 2D + MD del atributo (valor actual si lo hay) + nivel de habilidad contra 8+.
  const ATTRIBUTE_FIELDS = { FUE: ['strCurrent', 'strInitial'], DES: ['dexCurrent', 'dexInitial'], RES: ['endCurrent', 'endInitial'], INT: ['intelligence'], EDU: ['education'], CAR: ['charisma'], SOC: ['social'] };
  function attributeDm(short) {
    const raw = (ATTRIBUTE_FIELDS[short] || []).map(key => draft?.biometrics?.[key]).find(value => value !== undefined && value !== null && value !== '');
    if (raw === undefined) return null;
    return ranges.find(range => Number(raw) >= range.min && Number(raw) <= range.max)?.mod ?? null;
  }
  function rollTraveller(short, level, name) {
    const dm = short ? attributeDm(short) : null;
    const parts = [short && dm !== null ? `${short} ${dm >= 0 ? '+' : '−'}${Math.abs(dm)}` : '', level ? `nivel ${level}` : ''].filter(Boolean);
    window.NEXO_DICE?.roll('traveller', { dm: (dm || 0) + level, target: 8, label: `${name}${parts.length ? ` (${parts.join(', ')})` : ''}` });
  }
  function setPath(object, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    let target = object;
    keys.forEach(key => { target[key] ||= {}; target = target[key]; });
    target[last] = value;
  }
  function getPath(object, path) { return path.split('.').reduce((target, key) => target?.[key], object); }
  function updateModifier(input) {
    const out = input.closest('.character-hex')?.querySelector('[data-modifier]');
    if (!out) return;
    const score = input.value === '' ? null : Number(input.value);
    const match = ranges.find(range => score !== null && score >= range.min && score <= range.max);
    out.querySelector('span').textContent = match ? `${match.mod > 0 ? '+' : ''}${match.mod}` : '—';
    editorView.querySelectorAll('[data-mod-col]').forEach(cell => cell.classList.remove('current-band'));
    if (match) editorView.querySelectorAll(`[data-mod-col="${ranges.indexOf(match)}"]`).forEach(cell => cell.classList.add('current-band'));
  }
  function renderSkills() {
    const host = $('[data-skill-list]', editorView);
    if (!host) return;
    host.replaceChildren();
    (draft.skills || []).forEach((skill, index) => {
      const row = document.createElement('div');
      row.className = 'character-skill-row';
      row.innerHTML = `<input data-skill-field="name" aria-label="Nombre de habilidad" placeholder="Habilidad"><input data-skill-field="specialty" aria-label="Especialidad" placeholder="Especialidad"><select data-skill-field="attribute" aria-label="Atributo relacionado"><option value="">—</option><option>FUE</option><option>DES</option><option>RES</option><option>INT</option><option>EDU</option><option>CAR</option><option>SOC</option></select><span class="character-skill-level"><button type="button" data-skill-step="-1" aria-label="Bajar nivel">−</button><output></output><button type="button" data-skill-step="1" aria-label="Subir nivel">+</button></span><button type="button" class="character-skill-roll" data-skill-roll aria-label="Tirar esta habilidad" title="Tirar 2D + atributo + nivel">⚄</button><button type="button" class="character-remove-skill" data-remove-skill aria-label="Quitar habilidad">×</button>`;
      row.dataset.skillIndex = String(index);
      row.querySelector('[data-skill-field="name"]').value = skill.name || '';
      row.querySelector('[data-skill-field="specialty"]').value = skill.specialty || '';
      row.querySelector('[data-skill-field="attribute"]').value = skill.attribute || '';
      row.querySelector('output').textContent = String(Number(skill.level) || 0);
      host.append(row);
    });
    const empty = $('[data-skill-empty]', editorView);
    if (empty) empty.hidden = (draft.skills || []).length > 0;
  }
  function hydrateEditor() {
    editorView.innerHTML = editorMarkup();
    editorView.hidden = false;
    listView.hidden = true;
    editorView.querySelectorAll('[data-cfield]').forEach(input => {
      const value = getPath(draft, input.dataset.cfield);
      if (input.type === 'checkbox') input.checked = Boolean(value);
      else if (value !== undefined && value !== null) input.value = String(value);
    });
    editorView.querySelectorAll('[data-score]').forEach(updateModifier);
    $('[data-week-count]', editorView).textContent = String(draft.weeks || 0);
    renderSkills();
  }
  function openEditor(id) {
    draft = id ? structuredClone(characters().find(character => character.id === id)) : newCharacter();
    if (!draft) return;
    hydrateEditor();
    editorView.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  function backToList() {
    flushSave(true);
    draft = null;
    editorView.hidden = true;
    listView.hidden = false;
    renderList();
    panel.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  function saveCharacter() {
    flushSave();
    const id = draft.id;
    draft = null;
    editorView.hidden = true;
    listView.hidden = false;
    renderList();
    panel.scrollIntoView({ block: 'start', behavior: 'smooth' });
    const card = [...list.querySelectorAll('.character-card')].find(button => button.dataset.characterId === id);
    card?.focus({ preventScroll: true });
  }
  function deleteCharacter() {
    if (!pendingDeleteId) return;
    const api = storeApi();
    const rows = api?.getCharacters() || [];
    const index = rows.findIndex(character => character.id === pendingDeleteId);
    if (index >= 0) rows.splice(index, 1);
    pendingDeleteId = null;
    draft = null;
    commit();
    editorView.hidden = true;
    listView.hidden = false;
    renderList();
  }
  function populateSkillRow(row) {
    const skill = draft.skills[Number(row.dataset.skillIndex)];
    if (!skill) return;
    row.querySelector('[data-skill-field="name"]').value = skill.name || '';
    row.querySelector('[data-skill-field="specialty"]').value = skill.specialty || '';
    row.querySelector('[data-skill-field="attribute"]').value = skill.attribute || '';
    row.querySelector('output').textContent = String(Number(skill.level) || 0);
  }

  $('#addCharacterButton').addEventListener('click', () => openEditor());
  editorView.addEventListener('input', event => {
    const input = event.target;
    if (input.matches('[data-cfield]')) {
      setPath(draft, input.dataset.cfield, input.type === 'checkbox' ? input.checked : input.value);
      if (input.matches('[data-score]')) updateModifier(input);
      scheduleSave();
    } else if (input.matches('[data-skill-field]')) {
      const row = input.closest('[data-skill-index]');
      const skill = draft.skills[Number(row.dataset.skillIndex)];
      skill[input.dataset.skillField] = input.value;
      scheduleSave();
    }
  });
  editorView.addEventListener('change', event => {
    const input = event.target;
    if (input.matches('[data-cfield]')) {
      setPath(draft, input.dataset.cfield, input.type === 'checkbox' ? input.checked : input.value);
      if (input.matches('[data-score]')) updateModifier(input);
      scheduleSave();
    } else if (input.matches('[data-skill-field]')) {
      const row = input.closest('[data-skill-index]');
      draft.skills[Number(row.dataset.skillIndex)][input.dataset.skillField] = input.value;
      scheduleSave();
    }
  });
  editorView.addEventListener('focusout', event => {
    if (event.target.matches('[data-cfield], [data-skill-field]')) flushSave();
  });
  editorView.addEventListener('click', event => {
    const addSkill = event.target.closest('[data-add-skill]');
    if (addSkill) {
      draft.skills.push({ name: '', specialty: '', attribute: '', level: 0 });
      ensureSaved(); commit(); renderSkills();
      editorView.querySelector('[data-skill-index]:last-child [data-skill-field="name"]')?.focus();
      return;
    }
    const week = event.target.closest('[data-week]');
    if (week) {
      draft.weeks = Math.max(0, (Number(draft.weeks) || 0) + Number(week.dataset.week));
      $('[data-week-count]', editorView).textContent = String(draft.weeks);
      scheduleSave(); return;
    }
    const scoreStep = event.target.closest('[data-score-step]');
    if (scoreStep) {
      const input = scoreStep.closest('.character-score-control')?.querySelector('[data-score]');
      if (!input) return;
      const next = Math.max(0, Math.min(99, (Number(input.value) || 0) + Number(scoreStep.dataset.scoreStep)));
      input.value = String(next);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
    const step = event.target.closest('[data-skill-step]');
    if (step) {
      const row = step.closest('[data-skill-index]');
      const skill = draft.skills[Number(row.dataset.skillIndex)];
      skill.level = Math.max(0, (Number(skill.level) || 0) + Number(step.dataset.skillStep));
      populateSkillRow(row); scheduleSave(); return;
    }
    const charRoll = event.target.closest('[data-char-roll]');
    if (charRoll) { rollTraveller(charRoll.dataset.charRoll, 0, charRoll.getAttribute('aria-label').replace('Tirar ', '').toLocaleUpperCase('es')); return; }
    const skillRoll = event.target.closest('[data-skill-roll]');
    if (skillRoll) {
      const skill = draft.skills[Number(skillRoll.closest('[data-skill-index]').dataset.skillIndex)];
      rollTraveller(skill.attribute, Number(skill.level) || 0, [skill.name || 'Habilidad', skill.specialty].filter(Boolean).join(' · '));
      return;
    }
    const removeSkill = event.target.closest('[data-remove-skill]');
    if (removeSkill) {
      draft.skills.splice(Number(removeSkill.closest('[data-skill-index]').dataset.skillIndex), 1);
      renderSkills(); scheduleSave(); return;
    }
    if (event.target.closest('[data-back-to-characters]')) { backToList(); return; }
    if (event.target.closest('[data-save-character]')) { saveCharacter(); return; }
    if (event.target.closest('[data-delete-character]')) {
      pendingDeleteId = draft.id;
      deleteDialog.showModal();
    }
  });
  deleteConfirm.addEventListener('click', event => {
    event.preventDefault();
    deleteDialog.close('delete');
  });
  deleteDialog.addEventListener('close', () => {
    if (deleteDialog.returnValue === 'delete') deleteCharacter();
    else pendingDeleteId = null;
  });
  window.addEventListener('beforeunload', () => flushSave());

  window.NEXO_CHARACTERS_UI = {
    open() { draft = null; editorView.hidden = true; listView.hidden = false; renderList(); },
    render() { if (!listView.hidden) renderList(); },
    // Abre una ficha concreta (desde la pestaña Personajes del selector de partidas).
    edit(id) { openEditor(id); }
  };
})();
