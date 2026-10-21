/*
 * NEXO · Manual de El Archivo de las Tormentas: combate, heridas, estados, luz tormentosa y Roshar.
 * Resúmenes y explicaciones propias. «Rozar» (graze), «desviar» (deflect) y los nombres de los
 * estados son traducciones propias. tormentas-manual.js añade estos capítulos tras las reglas básicas.
 */
(() => {
  const list = items => items.filter(Boolean).map(item => `- ${item}`).join('\n');

  const COMBAT = [
    { id: 'tor-ataques', title: 'Ataques', aka: ['Golpe', 'Rozar'], summary: 'Una prueba de habilidad de armas contra la defensa física del objetivo.',
      narr: 'Las lanzas de los puentes, los arcos de los cazadores y las Hojas esquirladas de los ojos claros.',
      mech: list(['Atacar es una [[tor-prueba|prueba]] de Armas ligeras o Armas pesadas (o la que pida el ataque) contra la [[tor-defensas|defensa]] física del objetivo.', 'Si aciertas, tiras el dado de daño del arma y sumas el atributo de la habilidad.', 'Si fallas, puedes gastar 1 de [[tor-recursos|concentración]] para **rozar**: haces el daño de los dados, sin sumar nada.', 'El [[tor-dado-trama|dado de trama]] puede añadir una oportunidad (por ejemplo, un golpe crítico) o una complicación.']) },
    { id: 'tor-desviar', title: 'Armadura y desviar', summary: 'La armadura resta daño a cada golpe.',
      narr: 'Cuero, cota o una Armadura esquirlada: cuanto mejor la protección, menos sangre.',
      mech: 'Cada armadura tiene un valor de **desviar** que se resta al daño de energía y físico que recibes. Algunos daños (como el espiritual o el que ignora armaduras) no se desvían. Las Armaduras esquirladas desvían muchísimo y se alimentan de luz tormentosa.' },
    { id: 'tor-reacciones', title: 'Reacciones', aka: ['Ataque reactivo', 'Esquivar'], summary: 'Una respuesta por asalto fuera de tu turno.',
      mech: 'Además de tus acciones de [[tor-turnos|turno]], tienes una reacción por asalto. Las más comunes son el **ataque reactivo** contra quien sale de tu alcance y esquivar o protegerse a cambio de [[tor-recursos|concentración]]. Muchos talentos añaden reacciones propias.' },
    { id: 'tor-heridas', title: 'Caer a 0 y lesiones', aka: ['Lesión', 'Inconsciente'], summary: 'Al llegar a 0 de salud quedas inconsciente y sufres una lesión.',
      narr: 'Las heridas graves de Roshar dejan cicatrices, cojeras o algo peor.',
      mech: list(['A 0 de [[tor-recursos|salud]] caes [[tor-estado-inconsciente|inconsciente]] y tiras en la tabla de **lesiones**.', 'Una lesión puede ser una herida leve que se cura en días, una grave que tarda semanas, una permanente o, con muy mala suerte, la muerte.', 'Las lesiones se tratan con Medicina; la luz tormentosa de los [[tor-radiantes|Radiantes]] cura incluso las permanentes.']) },
    { id: 'tor-descanso', title: 'Descanso', aka: ['Descanso breve', 'Descanso largo', 'Dado de recuperación'], summary: 'Recuperar salud y concentración.',
      mech: list(['**Descanso breve** (una hora más o menos): tiras tu dado de recuperación y lo repartes entre salud y concentración.', '**Descanso largo** (una noche): recuperas toda la salud y la concentración.']) + '\n\nEl dado de recuperación depende de tu Voluntad; NEXO lo muestra en la hoja.' }
  ];

  const CONDITIONS = [
    ['agotado', 'Agotado', 'Cansancio, hambre o frío acumulados.', 'Tiene un valor que se resta a todas tus pruebas. Baja con un [[tor-descanso|descanso largo]].'],
    ['aturdido', 'Aturdido', 'Un golpe te deja sin reaccionar.', 'Pierdes acciones o la reacción durante el tiempo que indique el efecto, y eres más fácil de golpear.'],
    ['derribado', 'Derribado', 'Estás en el suelo.', 'Levantarte cuesta movimiento. Los ataques cuerpo a cuerpo contra ti son más fáciles y los tuyos, más difíciles.'],
    ['inmovilizado', 'Inmovilizado', 'Algo te sujeta.', 'Tu movimiento es 0 hasta que te liberes con una prueba de Atletismo o Agilidad.'],
    ['sorprendido', 'Sorprendido', 'No te lo esperabas.', 'No puedes actuar en el primer asalto ni usar reacciones hasta que acabe.'],
    ['inconsciente', 'Inconsciente', 'Has perdido el sentido.', 'No actúas, caes [[tor-estado-derribado|derribado]] y los ataques contra ti son muy fáciles. Ver [[tor-heridas|lesiones]].']
  ].map(([k, title, narr, mech]) => ({ id: `tor-estado-${k}`, title, summary: narr, narr, mech: `${mech}\n\nResumen general: la duración y los detalles los fija el efecto que lo provoca.` }));

  const STORMLIGHT = [
    { id: 'tor-luz-tormentosa', title: 'Luz tormentosa', aka: ['Absorber luz', 'Investidura'], summary: 'La energía de las altas tormentas que llevan las esferas y respiran los Radiantes.',
      narr: 'Brilla dentro de las gemas, escapa de la piel como humo luminoso y convierte a un hombre corriente en algo más.',
      mech: list(['Un Radiante absorbe luz de esferas infundidas y la guarda como [[tor-recursos|investidura]].', 'Gasta investidura para usar sus [[tor-cap-potencias|potencias]] y para regenerarse: curar salud o incluso lesiones.', 'La luz se escapa poco a poco; hay que usarla o perderla.']) },
    { id: 'tor-esferas', title: 'Esferas y gemas', aka: ['Chip', 'Marco', 'Broam'], summary: 'La moneda de Roshar, que además guarda luz tormentosa.',
      narr: 'Gemas engastadas en cristal: chips, marcos y broams, que brillan si las ha cargado una alta tormenta.',
      mech: 'Hay tres tamaños (chip, marco y broam) y su valor depende de la gema: el diamante vale menos y la esmeralda, más. Una esfera infundida da luz para leer y luz tormentosa para un Radiante; con el tiempo se apaga.' },
    { id: 'tor-altas-tormentas', title: 'Altas tormentas', summary: 'Tempestades que cruzan Roshar de este a oeste cada pocos días.',
      narr: 'Arrancan árboles, despiertan a los spren y lo cubren todo de crem. Quien la pase a la intemperie rara vez sobrevive.',
      mech: 'Recargan las esferas que se dejan fuera y marcan el ritmo de la vida: refugiarse, cargar luz y esperar. Los cantores cambian de forma durante ellas (ver [[tor-anc-cantor|cantor]]).' },
    { id: 'tor-esquirladas', title: 'Hojas y Armaduras esquirladas', aka: ['Portador de esquirlada', 'Hoja esquirlada'], summary: 'Las armas y armaduras legendarias de los antiguos Radiantes.',
      narr: 'Una Hoja corta la piedra como mantequilla y mata el alma de quien atraviesa; una Armadura convierte a su dueño en un ejército.',
      mech: 'La Hoja atraviesa la armadura normal y hace un daño enorme; contra la carne, mata los miembros que toca. La Armadura da una defensa altísima, aumenta la fuerza y se alimenta de luz tormentosa. Los Radiantes invocan Hojas vivas, que son su spren.' },
    { id: 'tor-spren', title: 'Spren', summary: 'Seres de los reinos cognitivo y espiritual atraídos por emociones y fenómenos.',
      narr: 'Spren de dolor, de miedo, de viento o de gloria rodean a la gente de Roshar. Algunos, muy pocos, piensan y hablan.',
      mech: 'Los spren comunes son descriptivos. Los spren sapientes pueden formar un vínculo náhel y crear un [[tor-radiantes|Radiante]] de su [[tor-cap-ordenes|orden]].' }
  ];

  window.NEXO_MANUALS = window.NEXO_MANUALS || {};
  window.NEXO_MANUALS.tormentasReglas = [
    { id: 'tor-cap-combate', title: 'Combate', intro: 'Ataques, armadura, reacciones, lesiones y descanso.', entries: COMBAT },
    { id: 'tor-cap-estados', title: 'Estados', intro: 'Los estados más frecuentes, en resumen.', entries: CONDITIONS },
    { id: 'tor-cap-roshar', title: 'Luz tormentosa y Roshar', intro: 'La luz, las esferas, las tormentas, las esquirladas y los spren.', entries: STORMLIGHT }
  ];
})();
