// NEXO · Lanzador de dados común: reglas de cada sistema, dados que cruzan la pantalla y ventana flotante con el resultado.
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const signed = n => (n >= 0 ? '+' : '−') + Math.abs(n);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const int = (value, fallback = 0) => { const n = Math.trunc(Number(value)); return Number.isFinite(n) ? n : fallback; };
  const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Azar uniforme con el generador criptográfico del navegador.
  const buffer = new Uint32Array(1);
  function die(sides) {
    const limit = Math.floor(0x100000000 / sides) * sides;
    let n;
    do { crypto.getRandomValues(buffer); n = buffer[0]; } while (n >= limit);
    return (n % sides) + 1;
  }
  const many = (count, sides) => Array.from({ length: count }, () => die(sides));
  const shapeOf = sides => ({ 4: 'd4', 6: 'd6', 8: 'd8', 10: 'd10', 12: 'd12', 20: 'd20', 100: 'd10' })[sides] || 'd6';
  const face = (sides, value, tag = '', extra = {}) => ({ sides, value, face: String(value), shape: shapeOf(sides), tag, ...extra });

  // Expresiones de daño o tiradas libres: «2d6+1d4+3», «1D10», «3d6-1».
  function parseExpr(text) {
    const clean = String(text || '').replace(/\s+/g, '').replace(/[−–]/g, '-');
    if (!clean) return null;
    const parts = [];
    const re = /([+-]?)(\d*)[dD](\d+)|([+-]?)(\d+)/g;
    let match, used = 0, dice = 0;
    while ((match = re.exec(clean))) {
      if (match.index !== used) return null;
      used = re.lastIndex;
      if (match[3]) {
        const count = match[2] === '' ? 1 : int(match[2]);
        const sides = int(match[3]);
        if (count < 1 || sides < 2 || sides > 100) return null;
        dice += count;
        parts.push({ sign: match[1] === '-' ? -1 : 1, count, sides });
      } else parts.push({ sign: match[4] === '-' ? -1 : 1, flat: int(match[5]) });
    }
    if (used !== clean.length || !parts.length || dice > 40) return null;
    return parts;
  }
  const exprText = parts => parts.map((p, i) => (i || p.sign < 0 ? (p.sign < 0 ? ' − ' : ' + ') : '') + (p.flat != null ? p.flat : `${p.count}d${p.sides}`)).join('');
  function rollExpr(expr, { double = false, title = 'Tirada de daño' } = {}) {
    const parts = parseExpr(expr);
    if (!parts) return { error: 'Escribe los dados como 2d6+3 o 1d8+1d4.' };
    const dice = [];
    let total = 0;
    parts.forEach(p => {
      if (p.flat != null) { total += p.sign * p.flat; return; }
      many(p.count * (double ? 2 : 1), p.sides).forEach(v => { dice.push(face(p.sides, v)); total += p.sign * v; });
    });
    const shown = double ? exprText(parts.map(p => (p.flat != null ? p : { ...p, count: p.count * 2 }))) : exprText(parts);
    return { title, formula: shown + (double ? ' · crítico, dados dobles' : ''), dice, total, verdict: double ? 'Daño de crítico' : 'Total', tone: double ? 'crit' : 'neutral', detail: dice.length > 1 ? `Dados: ${dice.map(d => d.value).join(' + ')}` : '' };
  }

  // Reglas de cada sistema. Cada modo declara sus campos y cómo se resuelve la tirada.
  const TRAVELLER_TARGETS = [[2, 'Simple (2+)'], [4, 'Fácil (4+)'], [6, 'Rutinaria (6+)'], [8, 'Media (8+)'], [10, 'Difícil (10+)'], [12, 'Muy difícil (12+)'], [14, 'Formidable (14+)'], [16, 'Imposible (16+)']];
  const ADV = [['normal', 'Normal'], ['adv', 'Ventaja'], ['dis', 'Desventaja']];
  function d20(adv) {
    const rolls = many(adv === 'normal' ? 1 : 2, 20);
    const kept = adv === 'adv' ? Math.max(...rolls) : adv === 'dis' ? Math.min(...rolls) : rolls[0];
    let keptUsed = false;
    const dice = rolls.map(v => {
      const keep = !keptUsed && v === kept;
      if (keep) keptUsed = true;
      return face(20, v, keep ? (v === 20 ? 'crit' : v === 1 ? 'one' : 'kept') : 'drop');
    });
    return { kept, dice };
  }

  const RULES = {
    traveller: {
      name: 'Traveller',
      modes: {
        test: {
          label: 'Prueba 2D',
          fields: [
            { key: 'dm', label: 'MD total', type: 'number', min: -12, max: 12, def: 0, help: 'Característica + habilidad + otros' },
            { key: 'target', label: 'Dificultad', type: 'select', options: TRAVELLER_TARGETS, def: 8 },
            { key: 'boon', label: 'Ventaja', type: 'seg', options: [['none', 'Normal'], ['boon', 'Ventaja'], ['bane', 'Desventaja']], def: 'none' }
          ],
          roll(o) {
            const dm = int(o.dm), target = int(o.target, 8);
            const rolls = many(o.boon === 'none' || !o.boon ? 2 : 3, 6);
            const order = rolls.map((v, i) => [v, i]).sort((a, b) => (o.boon === 'bane' ? a[0] - b[0] : b[0] - a[0]));
            const keep = new Set(order.slice(0, 2).map(([, i]) => i));
            const dice = rolls.map((v, i) => face(6, v, keep.has(i) ? 'kept' : 'drop'));
            const natural = order.slice(0, 2).reduce((t, [v]) => t + v, 0);
            const total = natural + dm;
            const effect = total - target;
            const [verdict, tone] = effect >= 6 ? ['Éxito excepcional', 'crit'] : effect >= 1 ? ['Éxito', 'good'] : effect === 0 ? ['Éxito por los pelos', 'good'] : effect <= -6 ? ['Fallo excepcional', 'fumble'] : effect === -1 ? ['Fallo por poco', 'bad'] : ['Fallo', 'bad'];
            return {
              title: o.label || 'Prueba',
              formula: `${rolls.length === 3 ? `3D, se quedan los dos ${o.boon === 'bane' ? 'más bajos' : 'más altos'}` : '2D'}${dm ? ' ' + signed(dm) : ''} · dificultad ${target}+`,
              dice, total, verdict, tone,
              badge: `Efecto ${signed(effect)}`,
              detail: `Dados ${natural}${dm ? ` ${signed(dm)} MD` : ''} = ${total} contra ${target}+.`
            };
          }
        },
        free: {
          label: 'Dados D6',
          fields: [
            { key: 'count', label: 'Número de D6', type: 'number', min: 1, max: 20, def: 1 },
            { key: 'dm', label: 'Modificador', type: 'number', min: -50, max: 50, def: 0 }
          ],
          roll(o) {
            const count = clamp(int(o.count, 1), 1, 20), dm = int(o.dm);
            const dice = many(count, 6).map(v => face(6, v));
            const sum = dice.reduce((t, d) => t + d.value, 0);
            return { title: o.label || `${count}D`, formula: `${count}D${dm ? ' ' + signed(dm) : ''}`, dice, total: sum + dm, verdict: 'Total', tone: 'neutral', detail: count > 1 ? `Dados: ${dice.map(d => d.value).join(' + ')}` : '' };
          }
        },
        d66: {
          label: 'D66',
          fields: [],
          roll(o) {
            const [tens, units] = many(2, 6);
            return { title: o.label || 'Tirada D66', formula: 'D66 · el primer dado son las decenas', dice: [face(6, tens, 'kept', { label: 'decenas' }), face(6, units, 'kept', { label: 'unidades' })], total: `${tens}${units}`, verdict: 'Resultado de tabla', tone: 'neutral', detail: '' };
          }
        }
      }
    },

    vampiro: {
      name: 'Vampiro',
      modes: {
        test: {
          label: 'Reserva',
          fields: [
            { key: 'pool', label: 'Reserva de dados', type: 'number', min: 1, max: 30, def: 3, help: 'Atributo + habilidad' },
            { key: 'diff', label: 'Dificultad', type: 'number', min: 2, max: 10, def: 6 },
            { key: 'spec', label: 'Especialización: cada 10 cuenta como dos éxitos', type: 'check', def: false },
            { key: 'wp', label: 'Gastar Fuerza de Voluntad: +1 éxito automático', type: 'check', def: false }
          ],
          roll(o) {
            const pool = clamp(int(o.pool, 1), 1, 30), diff = clamp(int(o.diff, 6), 2, 10);
            const values = many(pool, 10);
            const dice = values.map(v => face(10, v, v === 1 ? 'one' : v >= diff ? (v === 10 && o.spec ? 'crit' : 'hit') : ''));
            const hits = values.reduce((t, v) => t + (v >= diff ? (v === 10 && o.spec ? 2 : 1) : 0), 0);
            const ones = values.filter(v => v === 1).length;
            const rolled = Math.max(0, hits - ones);
            const net = rolled + (o.wp ? 1 : 0);
            const botch = !o.wp && hits === 0 && ones > 0;
            const degree = ['', 'Éxito marginal', 'Éxito moderado', 'Éxito completo', 'Éxito excepcional'][net] || 'Éxito fenomenal';
            const [verdict, tone] = botch ? ['Fracaso estrepitoso', 'fumble'] : net === 0 ? ['Fallo', 'bad'] : [degree, net >= 4 ? 'crit' : 'good'];
            const parts = [`${plural(hits, 'éxito')} en los dados`];
            if (ones) parts.push(`${ones} uno${ones === 1 ? '' : 's'} ${botch ? 'sin éxitos que cancelar' : 'que cancela' + (ones === 1 ? '' : 'n')}`);
            if (o.wp) parts.push('1 éxito automático por Voluntad');
            return { title: o.label || 'Tirada', formula: `${pool}d10 · dificultad ${diff}${o.spec ? ' · especialización' : ''}`, dice, total: botch ? '✕' : net, unit: botch ? '' : net === 1 ? 'éxito' : 'éxitos', verdict, tone, detail: parts.join(' · ') + '.', successes: net, botch };
          }
        }
      }
    },

    dnd: {
      name: 'D&D',
      modes: {
        test: {
          label: 'Prueba d20',
          fields: [
            { key: 'mod', label: 'Modificador', type: 'number', min: -20, max: 30, def: 0 },
            { key: 'adv', label: 'Ventaja', type: 'seg', options: ADV, def: 'normal' },
            { key: 'kind', label: 'Tipo', type: 'seg', options: [['check', 'Prueba o salvación'], ['attack', 'Ataque']], def: 'check' },
            { key: 'dc', label: 'CD o CA (opcional)', type: 'number', min: 1, max: 40, def: '', optional: true }
          ],
          roll(o) {
            const mod = int(o.mod), dc = o.dc === '' || o.dc == null ? null : int(o.dc);
            const { kept, dice } = d20(o.adv || 'normal');
            const total = kept + mod;
            const attack = o.kind === 'attack';
            let verdict = 'Total', tone = 'neutral';
            if (attack && kept === 20) [verdict, tone] = ['¡Golpe crítico!', 'crit'];
            else if (attack && kept === 1) [verdict, tone] = ['Fallo automático', 'fumble'];
            else if (dc != null) [verdict, tone] = total >= dc ? ['Éxito', 'good'] : ['Fallo', 'bad'];
            else if (kept === 20) [verdict, tone] = ['20 natural', 'crit'];
            else if (kept === 1) [verdict, tone] = ['1 natural', 'bad'];
            const advText = { adv: ' con ventaja', dis: ' con desventaja' }[o.adv] || '';
            return { title: o.label || (attack ? 'Ataque' : 'Prueba'), formula: `d20${advText}${mod ? ' ' + signed(mod) : ''}${dc != null ? ` · ${attack ? 'CA' : 'CD'} ${dc}` : ''}`, dice, total, verdict, tone, detail: `Dado ${kept}${mod ? ` ${signed(mod)}` : ''} = ${total}.${attack && kept === 20 ? ' Tira el daño con los dados doblados.' : ''}` };
          }
        },
        damage: {
          label: 'Daño',
          fields: [
            { key: 'expr', label: 'Dados', type: 'text', def: '1d8+3', placeholder: '2d6+3' },
            { key: 'crit', label: 'Golpe crítico: dobla los dados', type: 'check', def: false }
          ],
          roll: o => rollExpr(o.expr, { double: Boolean(o.crit), title: o.label || 'Daño' })
        }
      }
    },

    tormentas: {
      name: 'Cosmere',
      modes: {
        test: {
          label: 'Prueba d20',
          fields: [
            { key: 'mod', label: 'Modificador de habilidad', type: 'number', min: -10, max: 30, def: 0 },
            { key: 'adv', label: 'Ventaja', type: 'seg', options: ADV, def: 'normal' },
            { key: 'plot', label: 'Dado de trama: lo que está en juego sube', type: 'check', def: false },
            { key: 'dc', label: 'Dificultad (opcional)', type: 'number', min: 1, max: 40, def: '', optional: true }
          ],
          roll(o) {
            const mod = int(o.mod), dc = o.dc === '' || o.dc == null ? null : int(o.dc);
            const { kept, dice } = d20(o.adv || 'normal');
            let bonus = 0, opportunity = kept === 20, complication = kept === 1;
            if (o.plot) {
              const side = die(6);
              const plot = [{ face: '+2', tag: 'one', comp: 2 }, { face: '+4', tag: 'one', comp: 4 }, { face: '', tag: '' }, { face: '', tag: '' }, { face: '✦', tag: 'crit', opp: true }, { face: '✦', tag: 'crit', opp: true }][side - 1];
              dice.push({ sides: 6, value: side, face: plot.face, shape: 'plot', tag: plot.tag, label: 'trama' });
              if (plot.comp) { complication = true; bonus = plot.comp; }
              if (plot.opp) opportunity = true;
            }
            const total = kept + mod + bonus;
            const pass = dc == null ? null : total >= dc;
            const twist = opportunity && complication ? 'con oportunidad y complicación' : opportunity ? 'con oportunidad' : complication ? 'con complicación' : '';
            let verdict, tone;
            if (pass == null) { verdict = twist ? twist.charAt(0).toUpperCase() + twist.slice(1) : 'Total'; tone = opportunity && !complication ? 'crit' : complication && !opportunity ? 'bad' : 'neutral'; }
            else {
              const phrase = pass ? (opportunity && !complication ? 'Sí, y además…' : complication && !opportunity ? 'Sí, pero…' : '') : (opportunity && !complication ? 'No, pero…' : complication && !opportunity ? 'No, y además…' : '');
              verdict = `${pass ? 'Éxito' : 'Fallo'}${twist ? ' ' + twist : ''}`;
              tone = pass ? (opportunity && !complication ? 'crit' : 'good') : 'bad';
              if (phrase) verdict += ` · ${phrase}`;
            }
            const notes = [`d20 ${kept}${mod ? ` ${signed(mod)}` : ''}${bonus ? ` +${bonus} por la complicación` : ''} = ${total}${dc != null ? ` contra ${dc}` : ''}.`];
            if (kept === 20) notes.push('El 20 natural da una oportunidad.');
            if (kept === 1) notes.push('El 1 natural trae una complicación.');
            const advText = { adv: ' con ventaja', dis: ' con desventaja' }[o.adv] || '';
            return { title: o.label || 'Prueba de habilidad', formula: `d20${advText}${mod ? ' ' + signed(mod) : ''}${o.plot ? ' + dado de trama' : ''}${dc != null ? ` · dificultad ${dc}` : ''}`, dice, total, verdict, tone, detail: notes.join(' ') };
          }
        },
        damage: {
          label: 'Daño',
          fields: [{ key: 'expr', label: 'Dados', type: 'text', def: '1d6+2', placeholder: '2d6+2' }],
          roll: o => rollExpr(o.expr, { title: o.label || 'Daño' })
        }
      }
    },

    cthulhu: {
      name: 'Cthulhu',
      modes: {
        test: {
          label: 'Prueba d100',
          fields: [
            { key: 'skill', label: 'Valor de habilidad', type: 'number', min: 1, max: 99, def: 50 },
            { key: 'bonus', label: 'Dados extra', type: 'seg', options: [['-2', '2 de penalización'], ['-1', '1 de penalización'], ['0', 'Ninguno'], ['1', '1 de bonificación'], ['2', '2 de bonificación']], def: '0' },
            { key: 'need', label: 'Dificultad', type: 'seg', options: [['regular', 'Normal'], ['hard', 'Difícil'], ['extreme', 'Extrema']], def: 'regular' }
          ],
          roll(o) {
            const skill = clamp(int(o.skill, 50), 1, 99), extra = clamp(int(o.bonus), -2, 2);
            const units = die(10) - 1;
            const tensRolls = many(1 + Math.abs(extra), 10).map(v => v - 1);
            const value = t => (t === 0 && units === 0 ? 100 : t * 10 + units);
            const results = tensRolls.map(value);
            const pick = extra > 0 ? Math.min(...results) : extra < 0 ? Math.max(...results) : results[0];
            const keptIndex = results.indexOf(pick);
            const roll = pick;
            const half = Math.floor(skill / 2), fifth = Math.floor(skill / 5);
            const fumble = roll === 100 || (skill < 50 && roll >= 96);
            const level = roll === 1 ? 4 : roll <= fifth ? 3 : roll <= half ? 2 : roll <= skill ? 1 : 0;
            const need = { regular: 1, hard: 2, extreme: 3 }[o.need] || 1;
            const names = ['Fallo', 'Éxito normal', 'Éxito difícil', 'Éxito extremo', '¡Éxito crítico!'];
            let verdict = names[level], tone = level >= 3 ? 'crit' : level >= 1 ? 'good' : 'bad';
            if (fumble) [verdict, tone] = ['¡Pifia!', 'fumble'];
            else if (level && level < need) [verdict, tone] = [`Fallo (${names[level].toLowerCase()}, no basta)`, 'bad'];
            const dice = tensRolls.map((t, i) => face(10, t, i === keptIndex ? (fumble ? 'one' : level === 4 ? 'crit' : 'kept') : 'drop', { face: t === 0 ? '00' : `${t}0`, label: 'decenas' }));
            dice.push(face(10, units, fumble ? 'one' : level === 4 ? 'crit' : 'kept', { face: String(units), label: 'unidades' }));
            const extraText = extra ? ` · ${Math.abs(extra)} dado${Math.abs(extra) === 1 ? '' : 's'} de ${extra > 0 ? 'bonificación' : 'penalización'}` : '';
            return { title: o.label || 'Prueba', formula: `d100 contra ${skill} (${half} · ${fifth})${extraText}`, dice, total: roll, verdict, tone, detail: `Normal ${skill} · difícil ${half} · extremo ${fifth}.${fumble ? (skill < 50 ? ' Con menos de 50, de 96 a 100 es pifia.' : ' Un 100 siempre es pifia.') : ''}${extra ? ` Decenas tiradas: ${tensRolls.map(t => (t === 0 ? '00' : t + '0')).join(', ')}; se queda la ${extra > 0 ? 'mejor' : 'peor'}.` : ''}` };
          }
        },
        damage: {
          label: 'Daño',
          fields: [{ key: 'expr', label: 'Dados', type: 'text', def: '1d10', placeholder: '1d6+1d4' }],
          roll: o => rollExpr(o.expr, { title: o.label || 'Daño' })
        }
      }
    }
  };
  RULES.pathfinder = {
    name: 'Pathfinder',
    modes: {
      test: {
        label: 'Prueba d20',
        fields: [
          { key: 'mod', label: 'Modificador', type: 'number', min: -20, max: 40, def: 0 },
          { key: 'adv', label: 'Fortuna', type: 'seg', options: [['normal', 'Normal'], ['adv', 'Fortuna'], ['dis', 'Infortunio']], def: 'normal' },
          { key: 'dc', label: 'CD (opcional)', type: 'number', min: 1, max: 60, def: '', optional: true }
        ],
        roll(o) {
          const mod = int(o.mod), dc = o.dc === '' || o.dc == null ? null : int(o.dc);
          const { kept, dice } = d20(o.adv || 'normal');
          const total = kept + mod;
          const names = ['Fallo crítico', 'Fallo', 'Éxito', 'Éxito crítico'];
          const tones = ['fumble', 'bad', 'good', 'crit'];
          let verdict = kept === 20 ? '20 natural' : kept === 1 ? '1 natural' : 'Total';
          let tone = kept === 20 ? 'crit' : kept === 1 ? 'bad' : 'neutral';
          let detail = `d20 ${kept}${mod ? ` ${signed(mod)}` : ''} = ${total}.`;
          if (dc != null) {
            const base = total >= dc + 10 ? 3 : total >= dc ? 2 : total <= dc - 10 ? 0 : 1;
            const degree = clamp(base + (kept === 20 ? 1 : kept === 1 ? -1 : 0), 0, 3);
            verdict = names[degree];
            tone = tones[degree];
            detail += ` Contra CD ${dc}: ${names[base].toLowerCase()} por el total${degree !== base ? `, y el ${kept} natural lo ${degree > base ? 'mejora' : 'empeora'} un grado` : ''}.`;
          }
          const advText = { adv: ' con fortuna', dis: ' con infortunio' }[o.adv] || '';
          return { title: o.label || 'Prueba', formula: `d20${advText}${mod ? ' ' + signed(mod) : ''}${dc != null ? ` · CD ${dc}` : ''}`, dice, total, verdict, tone, detail };
        }
      },
      damage: {
        label: 'Daño',
        fields: [
          { key: 'expr', label: 'Dados', type: 'text', def: '1d8+4', placeholder: '2d6+4' },
          { key: 'crit', label: 'Éxito crítico: daño doble', type: 'check', def: false }
        ],
        roll(o) {
          const r = rollExpr(o.expr, { title: o.label || 'Daño' });
          if (r.error || !o.crit) return r;
          return { ...r, formula: r.formula + ' · crítico, ×2', detail: `${r.total} × 2${r.detail ? ' · ' + r.detail : ''}`, total: r.total * 2, verdict: 'Daño de crítico', tone: 'crit' };
        }
      }
    }
  };

  // Estado de la ventana: un sistema activo, valores recordados por modo y un breve historial.
  const state = { system: null, theme: null, mode: 'test', values: {}, sources: null, history: [], last: null, lastOpts: null, label: '', picks: {}, formOpen: false };
  let win, stage, fadeTimer = 0;

  function ensure() {
    if (win) return;
    stage = document.createElement('div');
    stage.className = 'nd-stage';
    stage.setAttribute('aria-hidden', 'true');
    win = document.createElement('aside');
    win.className = 'nd-window';
    win.hidden = true;
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'Dados');
    document.body.append(stage, win);
    win.addEventListener('keydown', event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } });
  }

  const modeOf = () => RULES[state.system].modes[state.mode];
  function values() {
    const key = `${state.system}:${state.mode}`;
    if (!state.values[key]) state.values[key] = Object.fromEntries(modeOf().fields.map(f => [f.key, f.def]));
    return state.values[key];
  }
  const sourceList = () => (typeof state.sources === 'function' ? state.sources() : state.sources) || [];

  function shapeHtml(d, small = false) {
    return `<span class="nd-mini nd-${d.shape} ${d.tag ? 'is-' + d.tag : ''}" title="${esc(d.label ? `${d.label}: ${d.face}` : `d${d.sides}: ${d.face}`)}"><i></i><b>${esc(d.face)}</b></span>`;
  }

  function fieldHtml(f, v) {
    const id = `nd-${f.key}`;
    if (f.type === 'check') return `<label class="nd-check"><input type="checkbox" data-nd-field="${f.key}" ${v ? 'checked' : ''}><span>${esc(f.label)}</span></label>`;
    if (f.type === 'seg') return `<div class="nd-field nd-field-wide"><span>${esc(f.label)}</span><div class="nd-seg" role="group" aria-label="${esc(f.label)}">${f.options.map(([k, l]) => `<button type="button" data-nd-seg="${f.key}" data-v="${esc(k)}" aria-pressed="${String(v) === String(k)}">${esc(l)}</button>`).join('')}</div></div>`;
    if (f.type === 'select') return `<label class="nd-field"><span>${esc(f.label)}</span><select data-nd-field="${f.key}">${f.options.map(([k, l]) => `<option value="${esc(k)}" ${String(v) === String(k) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;
    if (f.type === 'text') return `<label class="nd-field nd-field-wide"><span>${esc(f.label)}</span><input data-nd-field="${f.key}" value="${esc(v)}" placeholder="${esc(f.placeholder || '')}" maxlength="40" autocomplete="off" spellcheck="false"></label>`;
    return `<label class="nd-field" for="${id}"><span>${esc(f.label)}</span><input id="${id}" type="number" inputmode="numeric" data-nd-field="${f.key}" min="${f.min}" max="${f.max}" value="${esc(v)}" ${f.optional ? 'placeholder="—"' : ''}>${f.help ? `<small>${esc(f.help)}</small>` : ''}</label>`;
  }

  function resultHtml(r) {
    if (!r) return '<p class="nd-empty">Elige qué tirar y pulsa «Tirar».</p>';
    if (r.error) return `<p class="nd-empty is-error">${esc(r.error)}</p>`;
    return `<div class="nd-result is-${r.tone}">
      <div class="nd-result-head"><b>${esc(r.title)}</b><small>${esc(r.formula)}</small></div>
      <div class="nd-result-body"><div class="nd-dice-row">${r.dice.map(d => shapeHtml(d)).join('')}</div><div class="nd-total"><strong>${esc(r.total)}</strong>${r.unit ? `<small>${esc(r.unit)}</small>` : ''}</div></div>
      <p class="nd-verdict">${esc(r.verdict)}${r.badge ? ` <span>${esc(r.badge)}</span>` : ''}</p>
      ${r.detail ? `<p class="nd-detail">${esc(r.detail)}</p>` : ''}
    </div>`;
  }

  function render() {
    const rules = RULES[state.system];
    const mode = modeOf();
    const v = values();
    const modes = Object.entries(rules.modes);
    const sources = state.mode === 'test' ? sourceList() : [];
    const picks = sources.map((s, i) => `<label class="nd-field"><span>${esc(s.label)}</span><select data-nd-source="${i}"><option value="">${s.none || '—'}</option>${s.items.map(([k, l, val]) => `<option value="${esc(k)}" ${state.picks[i] === k ? 'selected' : ''}>${esc(l)} (${esc(s.show ? s.show(val) : val)})</option>`).join('')}</select></label>`).join('');
    const history = state.history.slice(1, 5).map(r => `<li><span>${esc(r.title)}</span><b>${esc(r.total)}</b><small>${esc(r.verdict)}</small></li>`).join('');
    win.dataset.ndTheme = state.theme;
    win.innerHTML = `<header class="nd-head"><span class="nd-logo" aria-hidden="true">⚄</span><b>Dados · ${esc(rules.name)}</b><button type="button" class="nd-icon" data-nd-toggle aria-expanded="${state.formOpen}" aria-label="${state.formOpen ? 'Ocultar opciones' : 'Mostrar opciones'}">${state.formOpen ? '▾' : '▸'} Opciones</button><button type="button" class="nd-icon nd-close" data-nd-close aria-label="Cerrar dados">×</button></header>
      <div class="nd-live" aria-live="polite" aria-atomic="true">${resultHtml(state.last)}</div>
      <form class="nd-form" data-nd-form ${state.formOpen ? '' : 'hidden'}>
        ${modes.length > 1 ? `<div class="nd-tabs" role="group" aria-label="Tipo de tirada">${modes.map(([k, m]) => `<button type="button" data-nd-mode="${k}" aria-pressed="${k === state.mode}">${esc(m.label)}</button>`).join('')}</div>` : ''}
        ${picks ? `<div class="nd-grid">${picks}</div>` : ''}
        <div class="nd-grid">${mode.fields.map(f => fieldHtml(f, v[f.key])).join('')}</div>
      </form>
      <div class="nd-actions"><button type="button" class="nd-roll" data-nd-roll>⚄ ${state.formOpen || !state.lastOpts ? 'Tirar' : 'Repetir'}</button></div>
      ${history ? `<details class="nd-history"><summary>Tiradas anteriores</summary><ul>${history}</ul></details>` : ''}`;
    bind();
  }

  function bind() {
    const v = values();
    win.querySelector('[data-nd-close]').addEventListener('click', close);
    win.querySelector('[data-nd-toggle]').addEventListener('click', () => { state.formOpen = !state.formOpen; render(); });
    win.querySelectorAll('[data-nd-mode]').forEach(b => b.addEventListener('click', () => { state.mode = b.dataset.ndMode; state.label = ''; render(); }));
    win.querySelectorAll('[data-nd-seg]').forEach(b => b.addEventListener('click', () => {
      v[b.dataset.ndSeg] = b.dataset.v;
      win.querySelectorAll(`[data-nd-seg="${b.dataset.ndSeg}"]`).forEach(o => o.setAttribute('aria-pressed', String(o === b)));
    }));
    win.querySelectorAll('[data-nd-field]').forEach(input => input.addEventListener(input.type === 'checkbox' ? 'change' : 'input', () => {
      v[input.dataset.ndField] = input.type === 'checkbox' ? input.checked : input.value;
      if (input.dataset.ndField === modeOf().fields[0].key) state.label = '';
    }));
    win.querySelectorAll('[data-nd-source]').forEach(select => select.addEventListener('change', () => {
      state.picks[Number(select.dataset.ndSource)] = select.value;
      applySources(sourceList());
      render();
    }));
    win.querySelector('[data-nd-form]').addEventListener('submit', event => { event.preventDefault(); rollFromForm(); });
    win.querySelector('[data-nd-roll]').addEventListener('click', () => {
      if (state.formOpen || !state.lastOpts) return rollFromForm();
      state.mode = state.lastOpts.mode;
      execute(state.lastOpts);
      render();
      show(true);
    });
  }

  // Las listas de la ficha rellenan el primer campo (MD, reserva, modificador o valor) con la suma de lo elegido.
  function applySources(list) {
    const chosen = list.map((s, i) => s.items.find(([k]) => k === state.picks[i])).filter(Boolean);
    if (!chosen.length) { state.label = ''; return; }
    values()[modeOf().fields[0].key] = chosen.reduce((t, [, , val]) => t + Number(val), 0);
    state.label = chosen.map(([, l]) => l).join(' + ');
  }

  function rollFromForm() {
    const result = execute({ ...values(), label: state.label || '' });
    if (result && !result.error) state.formOpen = false;
    render();
    show(!result.error);
  }

  function execute(opts) {
    const result = modeOf().roll(opts);
    state.last = result;
    if (!result.error) {
      state.lastOpts = { ...opts, mode: state.mode };
      state.history.unshift(result);
      state.history.length = Math.min(state.history.length, 8);
      throwDice(result);
      opts.onResult?.(result);
    }
    return result;
  }

  function prepare(system, options = {}) {
    if (!RULES[system]) return false;
    ensure();
    if (state.system !== system) { state.last = null; state.lastOpts = null; state.history = []; state.label = ''; }
    state.system = system;
    state.theme = options.theme || system;
    if (state.sources !== (options.sources || null)) state.picks = {};
    state.sources = options.sources || null;
    state.mode = options.mode && RULES[system].modes[options.mode] ? options.mode : state.mode in RULES[system].modes ? state.mode : 'test';
    return true;
  }

  // API pública
  function tray(system, options = {}) {
    if (!prepare(system, options)) return;
    if (options.values) Object.assign(values(), options.values);
    state.label = options.label || '';
    state.formOpen = true;
    render();
    show();
    win.querySelector('[data-nd-form] input, [data-nd-form] select, [data-nd-roll]')?.focus({ preventScroll: true });
  }
  function roll(system, opts = {}, options = {}) {
    if (!prepare(system, { ...options, mode: opts.mode || 'test' })) return null;
    // Las tiradas desde la ficha no cambian lo que el jugador dejó escrito en las opciones.
    const defaults = Object.fromEntries(modeOf().fields.map(f => [f.key, f.def]));
    state.formOpen = false;
    const result = execute({ ...defaults, ...opts, label: opts.label || '' });
    render();
    show(!result.error);
    return result;
  }
  function show(delayed) {
    win.hidden = false;
    win.classList.toggle('is-waiting', Boolean(delayed) && !reduced());
  }
  function close() {
    if (!win) return;
    win.hidden = true;
    clearStage();
  }

  // Los dados cruzan la pantalla desde abajo a la izquierda, rebotan y se quedan mostrando su cara.
  function clearStage() {
    clearTimeout(fadeTimer);
    stage.getAnimations?.({ subtree: true }).forEach(a => a.cancel());
    stage.replaceChildren();
    stage.classList.remove('is-fading');
  }
  function throwDice(result) {
    clearStage();
    stage.dataset.ndTheme = state.theme;
    if (reduced() || !stage.animate) { win?.classList.remove('is-waiting'); return; }
    const vw = window.innerWidth, vh = window.innerHeight;
    const n = result.dice.length;
    const size = n <= 3 ? 76 : n <= 6 ? 64 : n <= 12 ? 52 : 42;
    const cols = Math.min(n, Math.max(1, Math.round(Math.sqrt(n * 1.8))));
    const rows = Math.ceil(n / cols);
    const narrow = vw < 720;
    const cx = narrow ? vw / 2 : Math.min(vw * 0.42, vw - 420 - (cols * size * 1.3) / 2);
    const cy = narrow ? vh * 0.3 : vh * 0.42;
    let longest = 0;
    result.dice.forEach((d, i) => {
      const el = document.createElement('div');
      el.className = `nd-die nd-${d.shape}`;
      el.style.setProperty('--s', size + 'px');
      el.innerHTML = '<i></i><b></b>';
      const label = el.querySelector('b');
      stage.append(el);
      const col = i % cols, row = Math.floor(i / cols);
      const tx = cx + (col - (cols - 1) / 2) * size * 1.3 + (Math.random() - 0.5) * size * 0.4 - size / 2;
      const ty = cy + (row - (rows - 1) / 2) * size * 1.3 + (Math.random() - 0.5) * size * 0.4 - size / 2;
      const sx = -size * 1.5 - Math.random() * 120, sy = vh * (0.65 + Math.random() * 0.3);
      const spin = (Math.random() < 0.5 ? -1 : 1) * 360 * (1 + Math.floor(Math.random() * 2));
      const rest = (Math.random() - 0.5) * 24;
      const midx = sx + (tx - sx) * 0.55, midy = Math.min(sy, ty) - vh * (0.12 + Math.random() * 0.1);
      const duration = 950 + Math.random() * 350, delay = i * Math.min(60, 420 / n);
      longest = Math.max(longest, duration + delay);
      el.animate([
        { transform: `translate(${sx}px,${sy}px) rotate(0deg) scale(.8)`, offset: 0 },
        { transform: `translate(${midx}px,${midy}px) rotate(${spin * 0.55}deg) scale(1.08)`, offset: 0.42 },
        { transform: `translate(${tx - 10}px,${ty}px) rotate(${spin * 0.92}deg) scale(1)`, offset: 0.72 },
        { transform: `translate(${tx + 4}px,${ty - size * 0.22}px) rotate(${spin + rest - 8}deg) scale(1.02)`, offset: 0.86 },
        { transform: `translate(${tx}px,${ty}px) rotate(${spin + rest}deg) scale(1)`, offset: 1 }
      ], { duration, delay, easing: 'cubic-bezier(.25,.7,.35,1)', fill: 'both' });
      const sides = d.shape === 'plot' ? 6 : d.sides;
      let ticks = 0;
      const flicker = setInterval(() => {
        ticks += 1;
        label.textContent = d.shape === 'plot' ? ['', '+2', '✦', '+4'][ticks % 4] : d.sides === 10 && d.label === 'decenas' ? `${die(10) - 1}0` : String(d.sides === 10 && d.label === 'unidades' ? die(10) - 1 : die(sides));
      }, 70);
      setTimeout(() => {
        clearInterval(flicker);
        label.textContent = d.face;
        el.classList.add('is-landed');
        if (d.tag) el.classList.add('is-' + d.tag);
      }, delay + duration * 0.8);
    });
    result.landsIn = Math.min(longest, 1500);
    setTimeout(() => win?.classList.remove('is-waiting'), result.landsIn);
    fadeTimer = setTimeout(() => {
      stage.classList.add('is-fading');
      fadeTimer = setTimeout(clearStage, 700);
    }, longest + 4200);
  }

  // Estilos del lanzador: se cargan una vez para todos los apartados.
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = './src/nexo/dice.css?v=1';
  document.head.append(css);

  window.NEXO_DICE = { tray, roll, close, die, rules: RULES };
})();
