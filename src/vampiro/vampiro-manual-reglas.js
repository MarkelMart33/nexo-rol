/*
 * NEXO · Manual de Vampiro: combate, salud, alimentación y sociedad (V20 y Edad Oscura V20).
 * Resúmenes y explicaciones propias. vampiro-manual.js añade estos capítulos según la ambientación.
 */
(() => {
  const list = items => items.filter(Boolean).map(item => `- ${item}`).join('\n');

  const combat = side => [
    { id: 'vtm-iniciativa', title: 'Iniciativa y turnos', summary: 'Destreza + Astucia + 1d10 decide quién actúa antes.',
      narr: 'Un enfrentamiento entre vástagos dura segundos: quien reacciona antes suele decidirlo.',
      mech: 'Cada turno se tira Destreza + Astucia + 1d10 (no es una reserva: se suma el resultado). Se declaran las acciones de menor a mayor iniciativa y se resuelven de mayor a menor, así el rápido ve venir al lento. Para hacer varias cosas en un turno se reparte la reserva entre ellas, salvo que la [[vtm-dis-celeridad|Celeridad]] dé acciones extra.' },
    { id: 'vtm-ataques', title: 'Ataques', aka: ['Pelea', 'Armas C.C.', side === 'da' ? 'Tiro con arco' : 'Armas de fuego'], summary: 'Una reserva de ataque y, si aciertas, una de daño.',
      narr: 'Colmillos, garras, espadas o balas: el Mundo de Tinieblas es violento y las heridas pesan.',
      mech: list(['**Ataque**: Destreza + Pelea (sin armas), Destreza + Armas C.C. o Destreza + ' + (side === 'da' ? 'Tiro con arco' : 'Armas de fuego') + ', a dificultad 6 normalmente.', '**Daño**: Fuerza + el arma (las de fuego y las flechas tienen daño fijo). Cada éxito de más en el ataque suma un dado de daño.', 'El defensor puede esquivar (Destreza + Atletismo), bloquear o parar: sus éxitos restan los del atacante.']) + '\n\nEl daño se reduce con la [[vtm-absorcion|absorción]] y se anota en los [[vtm-salud|niveles de salud]]. La [[vtm-dis-potencia|Potencia]] añade éxitos automáticos al daño.' },
    { id: 'vtm-absorcion', title: 'Tipos de daño y absorción', aka: ['Contundente', 'Letal', 'Agravado'], summary: 'Contundente, letal y agravado; la Resistencia absorbe los dos primeros.',
      narr: 'Un puñetazo apenas molesta a un cadáver; una espada sí; el fuego y las garras de un lobo pueden destruirlo para siempre.',
      mech: list(['**Contundente** (golpes): el vampiro lo absorbe con Resistencia y lo que pasa se reduce a la mitad.', '**Letal** (filos y balas): se absorbe con Resistencia.', '**Agravado** (fuego, sol, colmillos y garras sobrenaturales): solo se absorbe con [[vtm-dis-fortaleza|Fortaleza]].']) + '\n\nCada éxito en la tirada de absorción quita un nivel de daño.' },
    { id: 'vtm-salud', title: 'Niveles de salud', aka: ['Letargo', 'Muerte definitiva'], summary: 'Siete niveles con penalizadores, y después el letargo.',
      narr: 'El cuerpo del vampiro aguanta lo que mataría a un mortal, pero no es indestructible.',
      mech: list(['Magullado (0), Lastimado (−1), Lesionado (−1), Herido (−2), Malherido (−2), Tullido (−5) e Incapacitado.', 'El penalizador resta dados a todas las reservas.', 'Más allá de Incapacitado por daño contundente o letal, el vampiro cae en **letargo**; por daño agravado sufre la **Muerte definitiva**.']) + '\n\nVer [[vtm-curacion|curación]].' },
    { id: 'vtm-curacion', title: 'Curación con sangre', summary: 'La vitae cierra las heridas.',
      narr: 'Las heridas se cierran a ojos vista mientras la sangre arde en las venas, pero las quemaduras tardan noches en sanar.',
      mech: list(['1 punto de [[vtm-sangre|sangre]] cura un nivel de daño contundente o letal (como acción).', 'El daño agravado exige 5 puntos de sangre y un día entero de descanso por cada nivel (puede acelerarse con Fuerza de Voluntad).', 'Curarse en combate gasta del límite de sangre por turno de tu [[vtm-generacion|generación]].']) },
    { id: 'vtm-estaca', title: 'Estaca, fuego y sol', summary: 'Las tres amenazas clásicas del vampiro.',
      narr: 'La madera en el corazón no mata, pero deja al vampiro a merced de quien la clavó. El fuego y el sol, en cambio, destruyen.',
      mech: list(['**Estaca en el corazón**: el vampiro queda paralizado hasta que se la quiten. Para clavarla hay que apuntar al corazón (dificultad alta) y hacer al menos tres niveles de daño.', '**Fuego**: daño agravado según su tamaño, y obliga a tirar Coraje para no caer en el [[vtm-frenesi|Rötschreck]].', '**Sol**: daño agravado cada turno de exposición; se absorbe con Fortaleza.']) }
  ];

  const feeding = side => [
    { id: 'vtm-alimentacion', title: 'Alimentarse', aka: ['Beso', 'Caza'], summary: 'Cazar, morder y beber sin romper la Mascarada.',
      narr: 'El Beso produce placer en la víctima, que pocas veces recuerda lo que pasó. Cada vampiro tiene su forma de cazar, y algunas pesan en la conciencia.',
      mech: list(['Encontrar una presa es una tirada que depende del método (Percepción + Callejeo, Carisma + Subterfugio, etc.) y de la zona.', 'Se bebe hasta un punto de sangre por turno; un mortal tiene unos 10 y muere si pierde demasiados.', 'Lamer la herida la cierra.', 'Matar al beber cuenta como pecado contra la [[vtm-humanidad|Humanidad]].']) + '\n\nEl trasfondo Rebaño facilita encontrar presas. Ver [[vtm-sangre|reserva de sangre]].' },
    { id: 'vtm-vinculo', title: 'Vínculo de sangre', aka: ['Atadura de sangre'], summary: 'Beber tres veces de un mismo vampiro crea una lealtad sobrenatural.',
      narr: 'Es amor, devoción y esclavitud a la vez. Los ancianos lo usan para atar a sus chiquillos y servidores.',
      mech: list(['Primer trago (en una noche): sentimientos fuertes hacia ese vampiro.', 'Segundo trago (en otra noche): ese vampiro pesa mucho en tus decisiones.', 'Tercer trago: vínculo completo; es casi imposible actuar contra él.']) + `\n\nSe debilita si no se renueva durante mucho tiempo. ${side === 'da' ? 'En Edad Oscura los vínculos sostienen las cadenas de vasallaje.' : 'El Sabbat lo rompe con la Vaulderie.'}` },
    { id: 'vtm-ghouls', title: side === 'da' ? 'Siervos (ghouls)' : 'Ghouls', aka: ['Siervo', 'Ghoul'], summary: 'Mortales que beben sangre vampírica sin ser Abrazados.',
      narr: 'Criados, guardaespaldas y amantes que trabajan de día para su señor, adictos a su vitae.',
      mech: 'Un mortal que bebe sangre de vampiro cada mes se vuelve ghoul: no envejece, gana un punto de [[vtm-dis-potencia|Potencia]] y puede aprender disciplinas sencillas. Casi siempre está [[vtm-vinculo|vinculado]]. El trasfondo Criados los representa.' },
    { id: 'vtm-abrazo', title: 'El Abrazo', summary: 'Cómo un mortal se convierte en vampiro.',
      narr: 'El sire vacía al mortal y le devuelve un poco de su sangre. Lo que despierta ya no está vivo.',
      mech: `El chiquillo es una [[vtm-generacion|generación]] más alta que su sire y hereda su clan. Abrazar sin permiso ${side === 'da' ? 'del señor de la ciudad' : 'del Príncipe'} rompe las [[vtm-tradiciones|Tradiciones]].` }
  ];

  const society = side => side === 'da' ? [
    { id: 'vtm-tradiciones', title: 'Las Tradiciones', summary: 'Las seis leyes de los Cainitas, que se atribuyen a la Segunda Ciudad.',
      narr: 'Ocultarse, respetar al señor del lugar, no Abrazar sin permiso, responder por los chiquillos, la hospitalidad y no destruir a otros Cainitas.',
      mech: list(['**Ocultación**: no revelar la existencia de los Cainitas.', '**Dominio**: el señor de un territorio manda en él.', '**Progenie**: solo se Abraza con permiso.', '**Responsabilidad**: el sire responde de sus chiquillos.', '**Hospitalidad**: hay que presentarse al llegar a un dominio.', '**Destrucción**: solo el señor o el más antiguo pueden destruir a otro Cainita.']) },
    { id: 'vtm-alto-bajo-clan', title: 'Alto Clan y Bajo Clan', summary: 'El orden feudal de los Cainitas del siglo XIII.',
      narr: 'Como entre los mortales, hay nobles y villanos. Los clanes «altos» gobiernan; los «bajos» viven al margen o sirven.',
      mech: 'El Alto Clan reúne a los linajes que se ven como nobleza (como Ventrue, Lasombra, Toreador, Brujah o Capadocios); el Bajo Clan, al resto (como Nosferatu, Gangrel, Malkavian o Ravnos). La pertenencia pesa en el Estatus y en cómo te trata la corte. Las [[vtm-tradiciones|Tradiciones]] obligan a todos.' },
    { id: 'vtm-sendas-sociedad', title: 'Vasallaje y príncipes', summary: 'Señores, vasallos y juramentos de sangre.',
      narr: 'Cada ciudad tiene su Príncipe o señor, y bajo él una red de vasallos ligados por juramentos y por [[vtm-vinculo|vínculos de sangre]].',
      mech: 'El trasfondo Estatus mide tu lugar en esa jerarquía, y Dominio el territorio que controlas. Las [[vtm-cap-sendas|sendas]] ofrecen morales distintas a la Humanidad para quienes no pueden sostenerla.' }
  ] : [
    { id: 'vtm-mascarada', title: 'La Mascarada', summary: 'La gran ley: los mortales no deben saber que los vampiros existen.',
      narr: 'Tras la Inquisición, los vástagos se ocultaron. Hoy, con cámaras y redes sociales, mantener el secreto es más difícil que nunca.',
      mech: 'Romperla es el crimen más grave para la Camarilla y suele castigarse con la Muerte definitiva. Alimentarse con cuidado, borrar recuerdos con [[vtm-dis-dominacion|Dominación]] y ocultar los cuerpos son parte de la vida nocturna.' },
    { id: 'vtm-tradiciones', title: 'Las Tradiciones', summary: 'Las seis leyes de Caín que la Camarilla dice defender.',
      mech: list(['**Mascarada**: no revelarse a los mortales.', '**Dominio**: el Príncipe manda en su ciudad.', '**Progenie**: solo se Abraza con permiso.', '**Responsabilidad**: el sire responde de sus chiquillos.', '**Hospitalidad**: hay que presentarse al llegar a una ciudad.', '**Destrucción**: solo el Príncipe puede ordenar destruir a otro vástago.']) },
    { id: 'vtm-camarilla', title: 'Camarilla', summary: 'La secta que defiende la Mascarada y el orden de los ancianos.',
      narr: 'Una sociedad de cortes, favores y Príncipes, que se presenta como el orden civilizado de los vástagos.',
      mech: 'Su ley son las [[vtm-tradiciones|Tradiciones]]. Cada ciudad tiene un Príncipe, una Primogenitura con los representantes de los clanes y cargos como el Sheriff o el Azote. El trasfondo Estatus mide tu posición.' },
    { id: 'vtm-sabbat', title: 'Sabbat', summary: 'La Espada de Caín: vampiros que abrazan su naturaleza y odian a los Antediluvianos.',
      narr: 'Manadas fanáticas que creen que los ancianos usan a los jóvenes como peones y se preparan para la Gehena.',
      mech: 'Sus miembros forman manadas unidas por la Vaulderie, que sustituye los [[vtm-vinculo|vínculos de sangre]] por lealtad a la manada. Muchos siguen sendas de iluminación en lugar de la [[vtm-humanidad|Humanidad]]. Lasombra y Tzimisce son su núcleo.' },
    { id: 'vtm-anarquistas', title: 'Anarquistas', summary: 'Vástagos jóvenes que rechazan el poder de los ancianos.',
      narr: 'Rebeldes, idealistas y oportunistas que reclaman ciudades para sí, a menudo en la costa oeste de Norteamérica.',
      mech: 'Funcionan con barones locales en lugar de Príncipes. Muchos Brujah y Caitiff están entre ellos.' },
    { id: 'vtm-independientes', title: 'Independientes', summary: 'Clanes que no se someten a ninguna secta.',
      mech: 'Assamitas, Giovanni, Ravnos y Seguidores de Set negocian con todos y no se deben a nadie. Cada uno tiene su propia agenda.' }
  ];

  window.NEXO_MANUALS = window.NEXO_MANUALS || {};
  window.NEXO_MANUALS.vampiroReglas = side => [
    { id: 'vtm-cap-combate', title: 'Combate y salud', intro: 'Iniciativa, ataques, tipos de daño, niveles de salud y curación.', entries: combat(side) },
    { id: 'vtm-cap-alimentacion', title: 'Sangre y alimentación', intro: 'Cazar, el vínculo de sangre, los ghouls y el Abrazo.', entries: feeding(side) },
    { id: 'vtm-cap-sociedad', title: side === 'da' ? 'Sociedad cainita' : 'Sociedad vástaga', intro: side === 'da' ? 'Las Tradiciones y el orden feudal de la noche medieval.' : 'La Mascarada, las Tradiciones y las sectas.', entries: society(side) }
  ];
})();
