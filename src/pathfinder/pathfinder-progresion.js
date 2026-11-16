/*
 * NEXO · Progresión de las clases de Pathfinder 2ª edición (Remaster), del nivel 2 al 20.
 * Resúmenes propios; los nombres de los rasgos son traducciones propias. pathfinder.js lo aplica a la ficha.
 * - up: niveles en los que sube un rango cada competencia. perc, fort, ref y vol son la Percepción y las
 *   salvaciones; weapon, las armas en las que mejor se maneja la clase; armor, las armaduras en las que está
 *   entrenada y la defensa sin armadura; dc, la CD de clase; spell, los ataques y la CD de conjuros.
 * - spec / gspec: nivel de la especialización con armas y de la especialización mayor.
 * - slots: espacios de conjuro por rango, el nivel en que se gana ese rango y a partir del siguiente.
 * - skillful: aumento de habilidad en todos los niveles desde el 2 (lo normal es en los impares desde el 3).
 * - skillFeats: niveles impares con una dote de habilidad más. paths: caminos a la perfección del monje.
 * - features: [nivel, nombre, qué hace]. Las subidas de competencia no se repiten aquí: salen de «up».
 */
(() => {
  const ODD = [3, 5, 7, 9, 11, 13, 15, 17, 19];
  const classes = {
    alquimista: {
      up: { perc: [9], fort: [11], ref: [15], vol: [7], weapon: [7, 15], armor: [13, 19], dc: [9, 17] }, spec: 13,
      features: [
        [5, 'Descubrimiento de campo', 'Tu campo de investigación te da una ventaja nueva.'],
        [5, 'Alquimia potente', 'Los objetos que creas con Alquimia rápida usan tu CD de clase.'],
        [9, 'Doble elaboración', 'Con Alquimia rápida creas dos objetos a la vez.'],
        [13, 'Descubrimiento de campo mayor', 'Tu campo de investigación da su segundo salto.']
      ]
    },
    barbaro: {
      up: { perc: [17], fort: [7, 13], ref: [9], vol: [15], weapon: [5, 13], armor: [13, 19], dc: [11, 19] }, spec: 7, gspec: 15,
      features: [
        [3, 'Pisadas furiosas', 'Te mueves más deprisa, y más aún en furia.'],
        [5, 'Brutalidad', 'En furia aplicas la especialización crítica de tus armas.'],
        [9, 'Resistencia furiosa', 'En furia resistes el tipo de daño que marca tu instinto.'],
        [11, 'Furia poderosa', 'Al entrar en furia puedes usar al momento una acción de furia.'],
        [17, 'Furia sin tregua', 'Vuelves a entrar en furia sin tener que esperar.'],
        [19, 'Devastador', 'Tus golpes cuerpo a cuerpo ignoran parte de la resistencia al daño físico.']
      ]
    },
    bardo: {
      up: { perc: [11], fort: [9], ref: [3], vol: [9, 17], weapon: [11], armor: [13], spell: [7, 15, 19] }, spec: 13, slots: [2, 3],
      features: [
        [3, 'Conjuros insignia', 'Uno por rango, que puedes potenciar a cualquier rango que tengas.'],
        [19, 'Obra magna', 'Aprendes dos conjuros de rango 10 y ganas un espacio para lanzarlos.']
      ]
    },
    bruja: {
      up: { perc: [11], fort: [5], ref: [9], vol: [17], weapon: [11], armor: [13], spell: [7, 15, 19] }, spec: 13, slots: [2, 3],
      features: [[19, 'Don del patrón', 'Tu familiar aprende dos conjuros de rango 10 y ganas un espacio para lanzarlos.']]
    },
    campeon: {
      up: { perc: [11], fort: [9], ref: [9], vol: [11], weapon: [5, 13], armor: [7, 13, 17], dc: [9, 17] }, spec: 7, gspec: 15,
      features: [
        [3, 'Bendición del devoto', 'Eliges potenciar tu arma, tu escudo o tu velocidad.'],
        [9, 'Reacción implacable', 'Tu reacción de campeón deja además daño persistente.'],
        [11, 'Reacción exaltada', 'Tu reacción de campeón alcanza también a los aliados cercanos.'],
        [19, 'Desafío del héroe', 'Un conjuro de foco que te mantiene en pie cuando ibas a caer.']
      ]
    },
    clerigo: {
      up: { perc: [5], ref: [11], vol: [9], armor: [13] }, spec: 13, slots: [2, 3],
      // La doctrina cambia las competencias de partida y las que suben con los niveles.
      variants: {
        claustro: { name: 'Sacerdote de claustro', text: 'Más magia: los conjuros suben antes de rango de competencia.', set: {}, up: { fort: [3], weapon: [11], spell: [7, 15, 19] } },
        guerrero: { name: 'Sacerdote guerrero', text: 'Armadura ligera y media, Fortaleza experta y mejores armas; los conjuros suben más despacio.', set: { fort: 2, armor: 2 }, up: { fort: [15], weapon: [7, 19], spell: [11, 19] } }
      },
      features: [
        [5, 'Fuente divina', 'Un espacio más de curar o dañar: cinco al día.'],
        [15, 'Fuente divina', 'Otro espacio más de curar o dañar: seis al día.'],
        [19, 'Conjuro milagroso', 'Un espacio de rango 10.']
      ]
    },
    druida: {
      up: { perc: [3], fort: [3], ref: [5], vol: [11], weapon: [11], armor: [13], spell: [7, 15, 19] }, spec: 13, slots: [2, 3],
      features: [[19, 'Hierofante primigenio', 'Un espacio de rango 10.']]
    },
    espadachin: {
      up: { perc: [11], fort: [3], ref: [7, 13], vol: [17], weapon: [5, 13], armor: [13, 19], dc: [9, 19] }, spec: 7, gspec: 15, skillFeats: [3, 7, 15],
      features: [
        [3, 'Réplica oportuna', 'Reacción para golpear o desarmar a quien falla críticamente un ataque contra ti.'],
        [3, 'Velocidad vivaz', 'Más velocidad mientras tienes brío y la mitad sin él. Crece con los niveles.'],
        [3, 'Trucos con estilo', 'Una dote de habilidad más, de Acrobacias o de la habilidad de tu estilo. Otra a los niveles 7 y 15.'],
        [5, 'Golpe preciso', 'Sube a +3 de daño, 3d6 en los remates.'],
        [9, 'Golpe preciso', 'Sube a +4 de daño, 4d6 en los remates.'],
        [9, 'Remate ejemplar', 'Tus remates añaden un efecto propio de tu estilo.'],
        [13, 'Golpe preciso', 'Sube a +5 de daño, 5d6 en los remates.'],
        [17, 'Golpe preciso', 'Sube a +6 de daño, 6d6 en los remates.']
      ]
    },
    explorador: {
      up: { perc: [7, 15], fort: [11], ref: [7, 15], vol: [3], weapon: [5, 13], armor: [11, 19], dc: [11, 17] }, spec: 7, gspec: 15,
      features: [
        [5, 'Viaje sin rastro', 'No dejas huellas en la naturaleza si no quieres.'],
        [9, 'Ventaja del terreno', 'Los enemigos que están en terreno difícil natural quedan desprevenidos ante ti.'],
        [11, 'Paso sin obstáculos', 'Ignoras el terreno difícil que no sea mágico.'],
        [17, 'Cazador magistral', 'Tu ventaja del cazador mejora y disparas a tu presa a más distancia sin penalización.'],
        [19, 'Presa veloz', 'Dar caza no te cuesta acción si es lo primero que haces en tu turno.']
      ]
    },
    guerrero: {
      up: { perc: [7], fort: [9], ref: [15], vol: [3], weapon: [5, 13], armor: [11, 17], dc: [11, 19] }, spec: 7, gspec: 15,
      features: [
        [3, 'Valentía', 'Un éxito en una salvación de Voluntad contra el miedo pasa a crítico, y el asustado que recibes baja en 1.'],
        [5, 'Maestría con armas', 'Maestro con un grupo de armas a tu elección: el ataque de la ficha es el de ese grupo.'],
        [7, 'Vigía del campo de batalla', '+2 a la iniciativa cuando la tiras con Percepción.'],
        [9, 'Flexibilidad de combate', 'Cada día eliges una dote de guerrero de nivel 8 o menos.'],
        [13, 'Leyenda de las armas', 'Legendario con tu grupo de armas y maestro con las demás sencillas y marciales.'],
        [15, 'Flexibilidad mejorada', 'Una segunda dote diaria, de nivel 14 o menos.'],
        [19, 'Leyenda versátil', 'Legendario con todas las armas sencillas y marciales.']
      ]
    },
    hechicero: {
      up: { perc: [11], fort: [5], ref: [9], vol: [17], weapon: [11], armor: [13], spell: [7, 15, 19] }, spec: 13, slots: [3, 4],
      features: [
        [3, 'Conjuros insignia', 'Uno por rango, que puedes potenciar a cualquier rango que tengas.'],
        [19, 'Parangón del linaje', 'Un espacio de rango 10.']
      ]
    },
    investigador: {
      up: { perc: [7, 13], fort: [9], ref: [15], vol: [11, 17], weapon: [5, 13], armor: [13, 19], dc: [9, 19] }, spec: 7, gspec: 15, skillful: true, skillFeats: ODD,
      features: [
        [3, 'Recuerdo agudo', 'Sumas tu nivel a Recordar conocimiento con habilidades sin entrenar.'],
        [3, 'Lecciones hábiles', 'Una dote de habilidad más en cada nivel impar, de habilidades de INT, SAB o CAR.'],
        [5, 'Golpe estratégico', 'Sube a 2d6.'],
        [9, 'Golpe estratégico', 'Sube a 3d6.'],
        [11, 'Improvisación deductiva', 'Puedes intentar acciones de habilidad que piden más rango del que tienes.'],
        [13, 'Golpe estratégico', 'Sube a 4d6.'],
        [17, 'Golpe estratégico', 'Sube a 5d6.']
      ]
    },
    mago: {
      up: { perc: [11], fort: [9], ref: [5], vol: [17], weapon: [11], armor: [13], spell: [7, 15, 19] }, spec: 13, slots: [2, 3],
      features: [[19, 'Maestría del archimago', 'Un espacio de rango 10.']]
    },
    monje: {
      up: { perc: [5], weapon: [5, 13], armor: [13, 17], dc: [9, 17] }, spec: 7, gspec: 15, paths: [7, 11, 15],
      features: [
        [3, 'Golpes místicos', 'Tus ataques sin armas cuentan como mágicos.'],
        [3, 'Movimiento increíble', '+10 pies de velocidad sin armadura, y 5 más a los niveles 7, 11, 15 y 19.'],
        [7, 'Camino a la perfección', 'Una salvación a tu elección pasa a maestro.'],
        [9, 'Golpes de metal', 'Tus ataques sin armas cuentan como hierro frío y plata.'],
        [11, 'Segundo camino a la perfección', 'Otra salvación distinta pasa a maestro.'],
        [15, 'Tercer camino a la perfección', 'Una de tus salvaciones de maestro pasa a legendario.'],
        [17, 'Golpes de adamantina', 'Tus ataques sin armas cuentan como adamantina.'],
        [19, 'Forma perfeccionada', 'En tu primer Golpe de cada turno, un dado por debajo de 10 cuenta como 10.']
      ]
    },
    oraculo: {
      up: { perc: [11], fort: [9], ref: [13], vol: [7, 17], weapon: [11], armor: [13], spell: [7, 15, 19] }, spec: 13, slots: [3, 4],
      features: [
        [11, 'Maldición mayor', 'Tu maldición puede crecer un grado más.'],
        [17, 'Maldición extrema', 'Tu maldición alcanza su grado máximo.'],
        [19, 'Claridad oracular', 'Un espacio de rango 10.']
      ]
    },
    picaro: {
      up: { perc: [7, 13], fort: [9], ref: [7, 13], vol: [17], weapon: [5, 13], armor: [13, 19], dc: [11, 19] }, spec: 7, gspec: 15, skillful: true, skillFeats: ODD,
      features: [
        [3, 'Negar ventaja', 'No quedas desprevenido ante enemigos ocultos o que te flanquean si no te superan en nivel.'],
        [5, 'Ataque furtivo', 'Sube a 2d6.'],
        [9, 'Golpe debilitante', 'Tu ataque furtivo puede además frenar a tu víctima o dejarla desprevenida.'],
        [11, 'Ataque furtivo', 'Sube a 3d6.'],
        [15, 'Doble debilitación', 'Aplicas dos debilitaciones a la vez.'],
        [17, 'Ataque furtivo', 'Sube a 4d6.'],
        [19, 'Golpe maestro', 'Tu ataque furtivo puede paralizar, o algo peor, a quien falle su Fortaleza.']
      ]
    }
  };

  window.NEXO_PF_PROGRESSION = { classes };
})();
