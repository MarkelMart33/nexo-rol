/*
 * NEXO · Manual de Traveller: habilidades, equipo, naves, mundos y psiónica (versión Mongoose).
 * Resúmenes y explicaciones propias. Varios nombres de habilidades y códigos son traducciones propias.
 * traveller-manual.js añade estos capítulos antes del índice del PDF.
 */
(() => {
  const list = items => items.filter(Boolean).map(item => `- ${item}`).join('\n');

  const SKILLS = [
    ['administracion', 'Administración', 'EDU o INT', 'Burocracia, papeleo, permisos y aduanas.'],
    ['abogacia', 'Abogacía', 'EDU o SOC', 'Leyes y pleitos, de mundo en mundo.'],
    ['animales', 'Animales', 'INT o DES', 'Montar, adiestrar y cuidar animales.'],
    ['astrogacion', 'Astrogación', 'EDU', 'Calcular saltos: fallar puede dejar la nave lejos de su destino.'],
    ['atletismo', 'Atletismo', 'FUE, DES o RES', 'Correr, saltar, trepar, nadar y aguantar.'],
    ['callejeo', 'Callejeo', 'INT', 'Moverse en los bajos fondos y encontrar contactos.'],
    ['combate-cuerpo', 'Combate cuerpo a cuerpo', 'FUE o DES', 'Cuchillos, espadas, porras y puños.'],
    ['corretaje', 'Corretaje', 'INT o SOC', 'Negociar compras y ventas: clave en el comercio especulativo.'],
    ['diplomacia', 'Diplomacia', 'SOC', 'Negociar con gobiernos y gente poderosa.'],
    ['electronica', 'Electrónica', 'EDU o INT', 'Sensores, comunicaciones y ordenadores.'],
    ['enganio', 'Engaño', 'INT o SOC', 'Mentir, disfrazarse y engañar.'],
    ['ingenieria', 'Ingeniería', 'EDU o INT', 'Motores de maniobra, de salto y plantas de energía.'],
    ['armas-fuego', 'Armas de fuego', 'DES', 'Pistolas, rifles y escopetas.'],
    ['artilleria', 'Artillería', 'DES', 'Torretas y armas de las naves.'],
    ['liderazgo', 'Liderazgo', 'SOC', 'Dirigir a otros en momentos de tensión.'],
    ['mecanica', 'Mecánica', 'EDU o INT', 'Reparar casi cualquier cosa con las manos.'],
    ['medicina', 'Medicina', 'EDU', 'Primeros auxilios, cirugía y tratamientos.'],
    ['navegacion', 'Navegación', 'INT o EDU', 'Orientarse en la superficie de un mundo.'],
    ['persuasion', 'Persuasión', 'INT o SOC', 'Convencer, regatear y caer bien.'],
    ['pilotaje', 'Pilotaje', 'DES', 'Llevar naves pequeñas, cargueros o naves de combate.'],
    ['reconocimiento', 'Reconocimiento', 'INT', 'Detectar emboscadas y vigilar.'],
    ['sigilo', 'Sigilo', 'DES', 'Moverse sin ser visto.'],
    ['sobrecargo', 'Sobrecargo', 'SOC o EDU', 'Atender a los pasajeros de una nave: sin él no hay pasaje alto.'],
    ['traje-vacio', 'Traje de vacío', 'DES', 'Moverse y trabajar en el vacío.'],
    ['todoterreno', 'Todoterreno', '—', 'Un poco de todo: reduce la penalización por [[trv-sin-entrenar|no estar entrenado]].']
  ].map(([k, name, ch, text]) => ({ id: `trv-hab-${k}`, title: name, summary: text, narr: text, mech: `Característica habitual: **${ch}**. Se tira como cualquier [[trv-tarea|tarea]]: 2D + nivel + [[trv-md|MD]].` }));

  const GEAR = [
    { id: 'trv-nt', title: 'Nivel tecnológico', aka: ['NT'], summary: 'Del 0 (edad de piedra) al 15 o más (lo más avanzado del Imperio).',
      narr: 'En un mundo de NT 3 hay mosquetes; en uno de NT 12, armas de plasma y gravedad artificial.',
      mech: 'Cada objeto tiene su NT. Un mundo solo fabrica lo de su nivel o menor, y reparar algo de un NT superior al del mundo es difícil. Aparece en el [[trv-perfil-mundo|perfil del mundo]].' },
    { id: 'trv-armaduras', title: 'Armaduras', aka: ['Protección'], summary: 'Restan su protección al daño de cada impacto.',
      mech: 'Cada armadura tiene un valor de **protección** que se resta al [[trv-dano|daño]]. Algunas exigen la habilidad [[trv-hab-traje-vacio|Traje de vacío]] o dan ventajas en ciertos entornos. Los rasgos **PA** (penetración de armadura) de algunas armas reducen la protección.' },
    { id: 'trv-armas', title: 'Armas', aka: ['Auto', 'PA', 'Ráfaga'], summary: 'Daño en dados de seis y rasgos especiales.',
      mech: list(['El daño se da en dados (2D, 3D…) y se le suma el [[trv-efecto|efecto]] del ataque.', '**PA**: ignora parte de la armadura.', '**Auto**: permite disparar ráfagas que suman daño o atacan a varios objetivos, gastando más munición.', 'Las armas cuerpo a cuerpo usan [[trv-hab-combate-cuerpo|Combate cuerpo a cuerpo]]; las de fuego, [[trv-hab-armas-fuego|Armas de fuego]].']) }
  ];

  const SHIPS = [
    { id: 'trv-tonelaje', title: 'Tonelaje', aka: ['Toneladas de desplazamiento'], summary: 'El tamaño de una nave se mide en toneladas de desplazamiento.',
      narr: 'Un explorador tiene 100 toneladas; un carguero libre, 200; un crucero, miles.',
      mech: 'Una tonelada de desplazamiento es el volumen que ocupa una tonelada de hidrógeno líquido (unos 14 m³). Todo se mide así: bodega, camarotes, motores y [[trv-combustible|combustible]].' },
    { id: 'trv-motores', title: 'Motores y energía', aka: ['Motor de maniobra', 'Motor de salto', 'Planta de energía'], summary: 'Tres sistemas que mueven la nave.',
      mech: list(['**Motor de maniobra**: aceleración en G para viajar dentro de un sistema.', '**Motor de [[trv-salto|salto]]**: distancia en pársecs por salto.', '**Planta de energía**: alimenta todo; si falla, nada funciona.']) + '\n\nLos repara la habilidad [[trv-hab-ingenieria|Ingeniería]].' },
    { id: 'trv-economia-nave', title: 'Hipoteca, tripulación y mantenimiento', summary: 'Los gastos que todo capitán debe cubrir cada mes.',
      narr: 'Las naves no se pagan solas: la hipoteca del banco es la gran motivación de muchos viajeros.',
      mech: list(['**Hipoteca**: un pago mensual de 1/240 del precio de la nave durante 40 años.', '**Mantenimiento**: una milésima parte del precio al año, en pagos mensuales.', '**Salarios** de la tripulación.', '**Combustible** y tasas de puerto.']) + '\n\nSe cubren con [[trv-pasajeros|pasajeros, carga y correo]] y con el [[trv-comercio|comercio especulativo]].' },
    { id: 'trv-pasajeros', title: 'Pasajeros, carga y correo', aka: ['Pasaje alto', 'Pasaje medio', 'Pasaje bajo'], summary: 'Los ingresos fijos de un carguero.',
      mech: list(['**Pasaje alto**: camarote y atención de un [[trv-hab-sobrecargo|sobrecargo]].', '**Pasaje medio**: camarote sin lujos.', '**Pasaje bajo**: viajar en criosueño, con riesgo de no despertar.', '**Carga**: se cobra por tonelada y pársec.', '**Correo**: contratos de correo para naves armadas y fiables.']) + '\n\nLa cantidad disponible depende de la población de los mundos y de las tiradas de [[trv-hab-corretaje|Corretaje]] o Callejeo.' },
    { id: 'trv-combate-espacial', title: 'Combate espacial', summary: 'Sensores, maniobras y artilleros.',
      narr: 'Piratas en el borde del sistema, un corsario o una patrulla demasiado celosa.',
      mech: 'Se lucha por **alcances** (de adyacente a distante). El piloto maniobra, el operador de sensores busca y bloquea, y los artilleros disparan con [[trv-hab-artilleria|Artillería]]. El daño de nave baja el casco y puede inutilizar sistemas.' }
  ];

  const WORLDS = [
    { id: 'trv-perfil-mundo', title: 'Perfil universal del mundo', aka: ['PUM', 'UWP'], summary: 'Un código de ocho cifras que resume un mundo.',
      narr: 'Con un vistazo a «A788899-C» un viajero sabe que hay un gran puerto, aire respirable, mucha agua y mil millones de personas.',
      mech: 'En orden: **puerto** (A a X, ver [[trv-puertos|puertos]]), **tamaño**, **atmósfera**, **hidrografía**, **población**, **gobierno**, **nivel de ley** y, tras el guion, **[[trv-nt|nivel tecnológico]]**. Las cifras pasan de 9 a letras (A = 10). La aplicación de Mapa de NEXO lo muestra para cada mundo.' },
    { id: 'trv-codigos-comercio', title: 'Códigos comerciales', aka: ['Ag', 'In', 'Ri', 'Po', 'Hi', 'Lo'], summary: 'Etiquetas que dicen qué produce y qué necesita un mundo.',
      mech: list(['**Ag** agrícola, **Na** no agrícola.', '**In** industrial, **Ni** no industrial.', '**Ri** rico, **Po** pobre.', '**Hi** alta población, **Lo** baja población.', 'Otras: acuático, desierto, jardín, hielo, vacío…']) + '\n\nModifican la disponibilidad y los precios del [[trv-comercio|comercio]].' },
    { id: 'trv-zonas', title: 'Zonas de viaje', aka: ['Zona ámbar', 'Zona roja'], summary: 'Avisos del Imperio sobre mundos peligrosos.',
      narr: 'Una zona ámbar pide cautela; una roja está prohibida, y hay patrullas para recordarlo.',
      mech: '**Ámbar**: peligro por guerra, leyes extrañas o entorno hostil. **Roja**: viajar allí está prohibido; puede costar la licencia o la nave.' }
  ];

  const PSI = [
    { id: 'trv-psionica', title: 'Psiónica', aka: ['PSI', 'Instituto psiónico'], summary: 'Poderes mentales mal vistos en el Imperio.',
      narr: 'Tras las Supresiones Psiónicas, los psiónicos son temidos y perseguidos en el Tercer Imperio; solo institutos clandestinos los entrenan.',
      mech: 'PSI es una característica más (2D, que baja con la edad). Entrenarse exige encontrar un instituto. Usar un talento cuesta **puntos de PSI**, que se recuperan descansando.' },
    { id: 'trv-talentos', title: 'Talentos psiónicos', aka: ['Telepatía', 'Clarividencia', 'Telequinesis', 'Teletransporte', 'Consciencia'], summary: 'Las cinco grandes ramas de la psiónica.',
      mech: list(['**Telepatía**: leer y enviar pensamientos, sentir vida.', '**Clarividencia**: ver y oír a distancia.', '**Telequinesis**: mover objetos con la mente.', '**Teletransporte**: desplazarse al instante.', '**Consciencia**: control del propio cuerpo, como aguantar sin dormir o curarse.']) + '\n\nCada talento se tira como una [[trv-tarea|tarea]] con PSI.' }
  ];

  window.NEXO_MANUALS = window.NEXO_MANUALS || {};
  window.NEXO_MANUALS.travellerReglas = [
    { id: 'trv-cap-habilidades', title: 'Habilidades', intro: 'Las habilidades más usadas y su característica habitual. Varios nombres son traducciones propias.', entries: SKILLS },
    { id: 'trv-cap-equipo', title: 'Equipo', intro: 'Nivel tecnológico, armaduras y armas.', entries: GEAR },
    { id: 'trv-cap-naves-dentro', title: 'Naves por dentro', intro: 'Tonelaje, motores, gastos, pasajeros y combate espacial.', entries: SHIPS },
    { id: 'trv-cap-mundos', title: 'Mundos', intro: 'Cómo leer el perfil de un mundo y sus avisos.', entries: WORLDS },
    { id: 'trv-cap-psionica', title: 'Psiónica', intro: 'La característica PSI y sus talentos.', entries: PSI }
  ];
})();
