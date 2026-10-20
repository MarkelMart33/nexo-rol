// Progresión de clases de D&D 5.5 (Manual del Jugador de 2024), resumida con palabras propias.
// Cada rasgo: [nivel, nombre, explicación narrativa, explicación mecánica].
// Las mejoras de característica, el don épico y la elección de subclase los añade dnd.js.
(() => {
  const features = {
    barbaro: [
      [1, 'Furia', 'Una ira primigenia te inunda y te convierte en una fuerza de la naturaleza.', 'Acción adicional, sin armadura pesada: ventaja en pruebas y salvaciones de FUE, bonificador de daño de furia con ataques de FUE y resistencia al daño contundente, cortante y perforante. Se mantiene hasta 10 minutos atacando, obligando a salvar o con una acción adicional.'],
      [1, 'Defensa sin armadura', 'Tu piel curtida y tus reflejos bastan como coraza.', 'Sin armadura, tu CA es 10 + DES + CON. Puedes usar escudo.'],
      [1, 'Maestría con armas', 'Dominas tus armas como una extensión de tu cuerpo.', 'Usas la propiedad de maestría de dos tipos de armas cuerpo a cuerpo (más a niveles 4 y 10). Puedes cambiarlas tras un descanso largo.'],
      [2, 'Sentido del peligro', 'Presientes la trampa antes de que salte.', 'Ventaja en salvaciones de DES mientras no estés incapacitado.'],
      [2, 'Ataque temerario', 'Te lanzas sin pensar en la defensa.', 'Al atacar por primera vez en tu turno puedes tener ventaja en los ataques de FUE de ese turno; los ataques contra ti también tienen ventaja hasta tu próximo turno.'],
      [3, 'Conocimiento primigenio', 'La naturaleza te enseña sus secretos.', 'Ganas una habilidad de la lista de bárbaro. En furia puedes usar FUE para pruebas de Acrobacias, Intimidación, Percepción, Sigilo y Supervivencia.'],
      [5, 'Ataque adicional', 'Golpeas dos veces en el tiempo de uno.', 'Atacas dos veces cuando realizas la acción de Atacar.'],
      [5, 'Movimiento rápido', 'Corres como una bestia en campo abierto.', '+10 pies de velocidad si no llevas armadura pesada.'],
      [7, 'Instinto salvaje', 'Tus sentidos animales nunca duermen.', 'Ventaja en las tiradas de iniciativa.'],
      [7, 'Abalanzarse instintivo', 'Entras en furia saltando sobre la presa.', 'Al entrar en furia puedes moverte hasta la mitad de tu velocidad.'],
      [9, 'Golpe brutal', 'Sacrificas precisión por un golpe demoledor.', 'Con Ataque temerario puedes renunciar a la ventaja en un ataque de FUE: si impacta suma 1d10 de daño y un efecto, Golpe contundente (empujar 15 pies) o Golpe que entorpece (−15 pies de velocidad).'],
      [11, 'Furia implacable', 'Tu ira te mantiene en pie cuando deberías caer.', 'En furia, al caer a 0 PG haces una salvación de CON CD 10 (+5 por cada uso); si la superas, quedas con PG iguales al doble de tu nivel.'],
      [13, 'Golpe brutal mejorado', 'Tus golpes rompen guardias y voluntades.', 'Nuevos efectos de Golpe brutal: Golpe estremecedor (desventaja en su siguiente salvación) y Golpe desgarrador (+5 al siguiente ataque de un aliado contra él).'],
      [15, 'Furia persistente', 'Tu ira es una hoguera que no se apaga.', 'Al tirar iniciativa recuperas todos los usos de furia (una vez por descanso largo) y la furia dura 10 minutos sin necesidad de mantenerla.'],
      [17, 'Golpe brutal mejorado', 'Cada golpe es un terremoto.', 'Golpe brutal hace 2d10 de daño extra y aplica dos efectos distintos.'],
      [18, 'Poder indomable', 'Tu fuerza no conoce límites.', 'Si el total de una prueba o salvación de FUE es menor que tu puntuación de FUE, usas la puntuación.'],
      [20, 'Campeón primigenio', 'Encarnas la furia del mundo salvaje.', 'FUE y CON aumentan en 4, hasta un máximo de 25.']
    ],
    bardo: [
      [1, 'Inspiración bárdica', 'Tus palabras y tu música encienden el valor de los demás.', 'Acción adicional: una criatura a 60 pies gana un dado de inspiración que puede sumar a una prueba d20 en la siguiente hora. Dado d6 (d8 a nivel 5, d10 a 10, d12 a 15). Usos = CAR por descanso largo.'],
      [1, 'Lanzamiento de conjuros', 'La magia vibra en cada nota.', 'Lanzas conjuros de bardo con CAR y puedes usar un instrumento musical como canalizador.'],
      [2, 'Pericia', 'Perfeccionas los talentos que te definen.', 'Doble bonificador de competencia en dos habilidades en las que seas competente.'],
      [2, 'Aprendiz de mucho', 'Has aprendido un poco de todo en tus viajes.', 'Sumas la mitad de tu bonificador de competencia a las pruebas de habilidad en las que no eres competente.'],
      [5, 'Fuente de inspiración', 'Tu inspiración brota sin cesar.', 'Recuperas la Inspiración bárdica en descansos cortos y puedes gastar un espacio de conjuro para recuperar un uso.'],
      [7, 'Contraencanto', 'Tu canción rompe los hechizos que nublan la mente.', 'Reacción: si tú o un aliado a 30 pies falla una salvación contra hechizado o asustado, repite la tirada con ventaja.'],
      [9, 'Pericia', 'Tu repertorio se amplía.', 'Pericia en dos habilidades más.'],
      [10, 'Secretos mágicos', 'Has robado conocimientos a otras tradiciones.', 'Al preparar conjuros puedes elegirlos de las listas de bardo, clérigo, druida y mago.'],
      [18, 'Inspiración superior', 'Nunca te faltan palabras de aliento.', 'Al tirar iniciativa recuperas usos de Inspiración bárdica hasta tener al menos dos.'],
      [20, 'Palabras de creación', 'Conoces fragmentos del idioma que dio forma al mundo.', 'Siempre tienes preparados Palabra de poder: sanar y Palabra de poder: matar, y pueden afectar a una segunda criatura a 10 pies de la primera.']
    ],
    brujo: [
      [1, 'Invocaciones sobrenaturales', 'Tu patrón te otorga dones prohibidos.', 'Eliges invocaciones (1 a nivel 1, 3 a nivel 2 y más al subir) como Pacto del filo, Pacto del tomo, Pacto de la cadena o Explosión agonizante.'],
      [1, 'Magia del pacto', 'Tu poder es un préstamo de tu patrón.', 'Lanzas conjuros de brujo con CAR. Tus espacios de pacto son siempre del nivel más alto que tengas y se recuperan en descansos cortos.'],
      [2, 'Astucia mágica', 'Ruegas a tu patrón un poco más de poder.', 'Rito de 1 minuto: recuperas espacios de pacto hasta la mitad de tu máximo. Una vez por descanso largo.'],
      [9, 'Contactar con el patrón', 'Hablas cara a cara con tu patrón.', 'Siempre tienes preparado Contactar con otro plano y lo lanzas sin espacio para hablar con tu patrón una vez por descanso largo, superando la salvación automáticamente.'],
      [11, 'Arcano místico', 'Tu patrón te revela un secreto supremo.', 'Eliges un conjuro de nivel 6 que lanzas sin espacio una vez por descanso largo. Ganas otro de nivel 7 a nivel 13, de nivel 8 a 15 y de nivel 9 a 17.'],
      [20, 'Maestro sobrenatural', 'Tu patrón apenas puede negarte nada.', 'Astucia mágica te devuelve todos los espacios de pacto.']
    ],
    clerigo: [
      [1, 'Lanzamiento de conjuros', 'Tu dios responde a tus plegarias.', 'Lanzas conjuros de clérigo con SAB y usas un símbolo sagrado como canalizador.'],
      [1, 'Orden divina', 'Eliges cómo sirves a tu fe.', 'Protector: competencia con armas marciales y armadura pesada. Taumaturgo: un truco extra y sumas SAB a las pruebas de Conocimiento Arcano y Religión.'],
      [2, 'Canalizar divinidad', 'Canalizas directamente el poder de tu dios.', 'Chispa divina (curar o dañar 1d8 + SAB con daño radiante o necrótico) o Expulsar muertos vivientes. 2 usos (3 a nivel 6 y 4 a nivel 18); recuperas uno en descanso corto.'],
      [5, 'Abrasar muertos vivientes', 'La luz de tu fe consume a los no muertos.', 'Al usar Expulsar muertos vivientes, tiras tantos d8 como tu SAB y los infliges como daño radiante a los afectados.'],
      [7, 'Golpes benditos', 'Tu fe guía tus golpes o tus conjuros.', 'Golpe divino (+1d8 radiante o necrótico al impactar con un arma, una vez por turno) o Trucos potentes (sumas SAB al daño de tus trucos).'],
      [10, 'Intervención divina', 'Pides a tu dios que actúe en persona.', 'Acción mágica: lanzas cualquier conjuro de clérigo de nivel 5 o inferior sin gastar espacio ni componentes materiales. Una vez por descanso largo.'],
      [14, 'Golpes benditos mejorados', 'Tu bendición se intensifica.', 'Golpe divino pasa a 2d8. Con Trucos potentes, al dañar con un truco das PG temporales a una criatura.'],
      [20, 'Gran intervención divina', 'Tu dios mueve el cielo por ti.', 'Con Intervención divina puedes lanzar Deseo; después no puedes volver a usarla hasta pasados 2d4 descansos largos.']
    ],
    druida: [
      [1, 'Lanzamiento de conjuros', 'La naturaleza obedece tus ritos.', 'Lanzas conjuros de druida con SAB usando un foco druídico.'],
      [1, 'Druídico', 'Hablas la lengua secreta de los druidas.', 'Conoces el druídico y siempre tienes preparado Hablar con los animales.'],
      [1, 'Orden primigenia', 'Eliges tu papel en el círculo.', 'Mago: un truco extra y sumas SAB a las pruebas de Conocimiento Arcano y Naturaleza. Guardián: competencia con armas marciales y armadura intermedia.'],
      [2, 'Forma salvaje', 'Adoptas la forma de las bestias.', 'Acción adicional: te transformas en una bestia que conozcas (VD 1/4, 1/2 a nivel 4 y 1 a nivel 8). 2 usos (3 a nivel 6 y 4 a nivel 17); recuperas uno en descanso corto.'],
      [2, 'Compañero salvaje', 'Un espíritu animal acude a tu llamada.', 'Gastas un espacio o un uso de Forma salvaje para lanzar Encontrar familiar sin componentes; el familiar es feérico.'],
      [5, 'Resurgimiento salvaje', 'La magia y lo salvaje se alimentan mutuamente.', 'Sin usos de Forma salvaje, gastas un espacio para recuperar uno. Una vez por descanso largo conviertes un uso en un espacio de nivel 1.'],
      [7, 'Furia elemental', 'Los elementos responden a tu poder.', 'Golpe primigenio (+1d8 de frío, fuego, relámpago o trueno al atacar con arma o en forma de bestia) o Lanzamiento potente (sumas SAB al daño de tus trucos).'],
      [15, 'Furia elemental mejorada', 'Los elementos rugen contigo.', 'Golpe primigenio pasa a 2d8. Con Lanzamiento potente, el alcance de tus trucos de 10 pies o más aumenta 300 pies.'],
      [18, 'Conjuros de bestia', 'Incluso como bestia sigues siendo druida.', 'Puedes lanzar conjuros en Forma salvaje, salvo los que tengan componentes materiales con coste o que se consuman.'],
      [20, 'Archidruida', 'Eres uno con el ciclo de la vida.', 'Al tirar iniciativa recuperas un uso de Forma salvaje si no te quedan, puedes convertir usos en espacios de conjuro y solo envejeces un año por cada diez.']
    ],
    explorador: [
      [1, 'Lanzamiento de conjuros', 'La naturaleza salvaje te enseña su magia.', 'Lanzas conjuros de explorador con SAB.'],
      [1, 'Enemigo predilecto', 'Marcas a tu presa y no la sueltas.', 'Siempre tienes preparado Marca del cazador y lo lanzas sin espacio 2 veces por descanso largo (3 a nivel 5, 4 a 9, 5 a 13 y 6 a 17).'],
      [1, 'Maestría con armas', 'Dominas tus armas de caza.', 'Usas la propiedad de maestría de dos tipos de armas.'],
      [2, 'Explorador hábil', 'Recorres el mundo y aprendes sus lenguas.', 'Pericia en una habilidad y dos idiomas adicionales.'],
      [2, 'Estilo de combate', 'Te has entrenado para la caza.', 'Ganas una dote de Estilo de combate o el estilo Guerrero druídico (dos trucos de druida).'],
      [5, 'Ataque adicional', 'Disparas o golpeas dos veces.', 'Atacas dos veces cuando realizas la acción de Atacar.'],
      [6, 'Vagabundo', 'Ningún terreno te frena.', '+10 pies de velocidad sin armadura pesada, y velocidades de trepar y nadar iguales a tu velocidad.'],
      [9, 'Pericia', 'Perfeccionas tus artes de rastreo.', 'Pericia en dos habilidades más.'],
      [10, 'Incansable', 'Sigues adelante cuando otros caen.', 'Acción mágica: ganas 1d8 + SAB PG temporales (usos = SAB por descanso largo). Cada descanso corto reduce tu agotamiento en 1.'],
      [13, 'Cazador implacable', 'Nada aparta tu atención de la presa.', 'Recibir daño no rompe tu concentración en Marca del cazador.'],
      [14, 'Velo natural', 'Te fundes con el entorno.', 'Acción adicional: te vuelves invisible hasta el final de tu próximo turno. Usos = SAB por descanso largo.'],
      [17, 'Cazador preciso', 'Tu presa no tiene escapatoria.', 'Ventaja en ataques contra la criatura marcada con tu Marca del cazador.'],
      [18, 'Sentidos salvajes', 'Percibes lo que no ves.', 'Visión ciega de 30 pies.'],
      [20, 'Asesino de enemigos', 'Eres el terror de tu presa.', 'El dado de daño de Marca del cazador pasa a d10.']
    ],
    guerrero: [
      [1, 'Estilo de combate', 'Te has especializado en una forma de luchar.', 'Ganas una dote de Estilo de combate, como Arquería, Defensa o Combate con armas a dos manos.'],
      [1, 'Tomar aliento', 'Encuentras fuerzas en mitad del combate.', 'Acción adicional: recuperas 1d10 + tu nivel de guerrero en PG. 2 usos (3 a nivel 4 y 4 a nivel 10); recuperas uno en descanso corto.'],
      [1, 'Maestría con armas', 'Conoces cada arma a fondo.', 'Usas la maestría de tres tipos de armas (4 a nivel 4, 5 a nivel 10 y 6 a nivel 16).'],
      [2, 'Oleada de acción', 'Rompes el ritmo del combate con un esfuerzo extra.', 'Una vez por descanso corto ganas una acción más en tu turno (no para la acción Magia). Dos usos a nivel 17.'],
      [2, 'Mente táctica', 'Piensas como un estratega.', 'Al fallar una prueba de característica puedes gastar un uso de Tomar aliento para sumar 1d10; si aun así fallas, no pierdes el uso.'],
      [5, 'Ataque adicional', 'Tu técnica te permite golpear dos veces.', 'Atacas dos veces cuando realizas la acción de Atacar.'],
      [5, 'Desplazamiento táctico', 'Te recolocas mientras recuperas el aliento.', 'Al usar Tomar aliento te mueves hasta la mitad de tu velocidad sin provocar ataques de oportunidad.'],
      [9, 'Indomable', 'Te niegas a ceder.', 'Repites una salvación fallida sumando tu nivel de guerrero. Un uso por descanso largo (2 a nivel 13 y 3 a nivel 17).'],
      [9, 'Maestro táctico', 'Adaptas cada arma a la situación.', 'Al atacar con un arma cuya maestría usas, puedes cambiarla por Empujar, Socavar o Ralentizar en ese ataque.'],
      [11, 'Dos ataques adicionales', 'Tu acero es un torbellino.', 'Atacas tres veces cuando realizas la acción de Atacar.'],
      [13, 'Ataques estudiados', 'Aprendes de cada fallo.', 'Si fallas un ataque contra una criatura, tienes ventaja en el siguiente contra ella antes del final de tu próximo turno.'],
      [20, 'Tres ataques adicionales', 'Eres la cumbre del arte marcial.', 'Atacas cuatro veces cuando realizas la acción de Atacar.']
    ],
    hechicero: [
      [1, 'Lanzamiento de conjuros', 'La magia corre por tu sangre.', 'Lanzas conjuros de hechicero con CAR.'],
      [1, 'Hechicería innata', 'Liberas el poder que llevas dentro.', 'Acción adicional: durante 1 minuto, +1 a la CD de tus conjuros de hechicero y ventaja en sus tiradas de ataque. 2 usos por descanso largo.'],
      [2, 'Fuente de magia', 'Moldeas tu energía mágica.', 'Puntos de hechicería iguales a tu nivel. Puedes convertirlos en espacios de conjuro y viceversa.'],
      [2, 'Metamagia', 'Retuerces tus conjuros a voluntad.', 'Eliges dos opciones de Metamagia (más a niveles 10 y 17) y gastas puntos de hechicería para alterar tus conjuros.'],
      [5, 'Restauración hechicera', 'Tu fuente se rellena sola.', 'En un descanso corto recuperas puntos de hechicería hasta la mitad de tu nivel, una vez por descanso largo.'],
      [7, 'Hechicería encarnada', 'Tu poder te desborda.', 'Sin usos de Hechicería innata, gastas 2 puntos para activarla. Mientras está activa puedes usar dos Metamagias en el mismo conjuro.'],
      [20, 'Apoteosis arcana', 'Te conviertes en magia pura.', 'Con Hechicería innata activa, una vez por turno usas una Metamagia sin gastar puntos.']
    ],
    mago: [
      [1, 'Lanzamiento de conjuros', 'Tu libro guarda el poder del universo.', 'Lanzas conjuros de mago con INT a partir de tu libro de conjuros y añades dos conjuros al libro por nivel.'],
      [1, 'Ritualista', 'Conoces los rituales de memoria.', 'Lanzas como ritual cualquier conjuro ritual de tu libro sin tenerlo preparado.'],
      [1, 'Recuperación arcana', 'Recuperas energía meditando.', 'Una vez al día, tras un descanso corto, recuperas espacios cuya suma de niveles sea hasta la mitad de tu nivel de mago (ninguno de nivel 6 o más).'],
      [2, 'Erudito', 'Has estudiado a fondo un campo del saber.', 'Pericia en Conocimiento Arcano, Historia, Investigación, Medicina, Naturaleza o Religión.'],
      [5, 'Memorizar conjuro', 'Cambias de idea sin abrir el libro.', 'En un descanso corto sustituyes un conjuro preparado por otro de tu libro.'],
      [18, 'Maestría en conjuros', 'Algunos conjuros son ya instinto.', 'Eliges un conjuro de nivel 1 y otro de nivel 2 de tu libro y los lanzas a su nivel más bajo sin gastar espacio.'],
      [20, 'Conjuros distintivos', 'Dos conjuros llevan tu firma.', 'Dos conjuros de nivel 3 siempre preparados que lanzas una vez cada uno por descanso corto sin gastar espacio.']
    ],
    monje: [
      [1, 'Artes marciales', 'Tu cuerpo es tu mejor arma.', 'Sin armadura ni escudo usas DES con golpes sin armas y armas de monje, con tu dado de artes marciales (d6, d8 a nivel 5, d10 a 11 y d12 a 17), y haces un golpe sin armas como acción adicional.'],
      [1, 'Defensa sin armadura', 'Tu disciplina te protege mejor que el acero.', 'Sin armadura ni escudo, tu CA es 10 + DES + SAB.'],
      [2, 'Concentración del monje', 'Canalizas tu energía interior.', 'Puntos de concentración iguales a tu nivel para Ráfaga de golpes (dos golpes como acción adicional), Defensa paciente y Paso del viento. Se recuperan en descanso corto.'],
      [2, 'Movimiento sin armadura', 'Te mueves más rápido que el viento.', '+10 pies de velocidad sin armadura ni escudo (+15 a nivel 6, +20 a 10, +25 a 14 y +30 a 18).'],
      [2, 'Metabolismo asombroso', 'Tu cuerpo se recupera solo.', 'Al tirar iniciativa recuperas todos los puntos de concentración y curas tu dado de artes marciales + tu nivel. Una vez por descanso largo.'],
      [3, 'Desviar ataques', 'Apartas los golpes con las manos desnudas.', 'Reacción: reduces el daño contundente, cortante o perforante de un ataque en 1d10 + DES + tu nivel; si queda en 0, gastas 1 punto para devolverlo.'],
      [4, 'Caída lenta', 'Caes como una hoja.', 'Reacción: reduces el daño por caída en 5 × tu nivel de monje.'],
      [5, 'Ataque adicional', 'Encadenas golpes sin pausa.', 'Atacas dos veces cuando realizas la acción de Atacar.'],
      [5, 'Golpe aturdidor', 'Golpeas puntos vitales.', 'Una vez por turno, al impactar, gastas 1 punto: el objetivo salva CON o queda aturdido hasta tu próximo turno; si supera, su velocidad se reduce a la mitad y tienes ventaja contra él.'],
      [6, 'Golpes potenciados', 'Tu energía atraviesa cualquier defensa.', 'Tus golpes sin armas pueden hacer daño de fuerza en lugar de contundente.'],
      [7, 'Evasión', 'Esquivas lo inevitable.', 'En salvaciones de DES para recibir la mitad de daño, no recibes daño si superas y la mitad si fallas.'],
      [9, 'Movimiento acrobático', 'Corres por paredes y sobre el agua.', 'Sin armadura puedes moverte por superficies verticales y líquidos durante tu turno.'],
      [10, 'Concentración intensificada', 'Tu técnica se vuelve más poderosa.', 'Ráfaga de golpes da tres golpes, Defensa paciente da PG temporales y Paso del viento permite llevar a un aliado.'],
      [10, 'Autorrestauración', 'Tu cuerpo expulsa lo que lo daña.', 'Al final de cada turno te quitas hechizado, asustado o envenenado, y no sufres agotamiento por falta de comida o bebida.'],
      [13, 'Desviar energía', 'Desvías también la magia.', 'Desviar ataques funciona contra cualquier tipo de daño.'],
      [14, 'Superviviente disciplinado', 'Tu mente y tu cuerpo lo resisten todo.', 'Competencia en todas las salvaciones; gastas 1 punto para repetir una salvación fallida.'],
      [15, 'Concentración perfecta', 'Nunca te quedas vacío.', 'Al tirar iniciativa sin usar Metabolismo asombroso, si tienes 3 puntos o menos, recuperas hasta tener 4.'],
      [18, 'Defensa superior', 'Te vuelves casi intocable.', 'Gastas 3 puntos para tener resistencia a todo el daño salvo de fuerza durante 1 minuto.'],
      [20, 'Cuerpo y mente', 'Has alcanzado la perfección.', 'DES y SAB aumentan en 4, hasta un máximo de 25.']
    ],
    paladin: [
      [1, 'Imposición de manos', 'Tu tacto bendito cierra heridas.', 'Reserva de 5 × tu nivel PG por descanso largo. Acción adicional para curar, o gastar 5 puntos para quitar envenenado.'],
      [1, 'Lanzamiento de conjuros', 'Tu juramento te concede magia divina.', 'Lanzas conjuros de paladín con CAR.'],
      [1, 'Maestría con armas', 'Conoces tus armas como a tus votos.', 'Usas la propiedad de maestría de dos tipos de armas.'],
      [2, 'Estilo de combate', 'Te has entrenado para la guerra santa.', 'Ganas una dote de Estilo de combate o el estilo Campeón bendito (dos trucos de clérigo).'],
      [2, 'Castigo del paladín', 'Tu arma arde con poder divino.', 'Siempre tienes preparado Castigo divino y lo lanzas sin espacio una vez por descanso largo.'],
      [3, 'Canalizar divinidad', 'Tu juramento te deja canalizar poder divino.', 'Sentido divino (detectas celestiales, infernales y muertos vivientes) y las opciones de tu juramento. 2 usos (3 a nivel 11); recuperas uno en descanso corto.'],
      [5, 'Ataque adicional', 'Golpeas dos veces con la fuerza de tu fe.', 'Atacas dos veces cuando realizas la acción de Atacar.'],
      [5, 'Montura fiel', 'Una montura celestial acude a tu llamada.', 'Siempre tienes preparado Encontrar corcel y lo lanzas sin espacio una vez por descanso largo.'],
      [6, 'Aura de protección', 'Tu presencia ampara a quienes te rodean.', 'Tú y tus aliados a 10 pies sumáis tu CAR (mínimo +1) a las salvaciones.'],
      [9, 'Repudiar enemigos', 'Tu voz hace temblar a tus enemigos.', 'Canalizar divinidad: hasta CAR criaturas a 60 pies salvan SAB o quedan asustadas y limitadas a una acción o movimiento durante 1 minuto.'],
      [10, 'Aura de valor', 'Junto a ti nadie conoce el miedo.', 'Tú y tus aliados en tu aura sois inmunes a la condición asustado.'],
      [11, 'Golpes radiantes', 'Cada golpe lleva la luz de tu juramento.', 'Tus ataques cuerpo a cuerpo con arma o sin armas hacen 1d8 de daño radiante extra.'],
      [14, 'Toque restaurador', 'Tu tacto rompe maldiciones.', 'Con Imposición de manos gastas 5 puntos por condición para quitar cegado, hechizado, ensordecido, asustado, paralizado o aturdido.'],
      [18, 'Expansión del aura', 'Tu luz alcanza más lejos.', 'Tus auras se extienden a 30 pies.']
    ],
    picaro: [
      [1, 'Pericia', 'Eres un especialista en lo tuyo.', 'Pericia en dos habilidades en las que seas competente.'],
      [1, 'Ataque furtivo', 'Golpeas donde más duele.', 'Una vez por turno, +1d6 de daño (1d6 más cada dos niveles) con un arma sutil o a distancia si tienes ventaja o un aliado está junto al objetivo.'],
      [1, 'Jerga de ladrones', 'Hablas el código secreto de los bajos fondos.', 'Conoces la jerga de ladrones y un idioma adicional.'],
      [1, 'Maestría con armas', 'Tus armas son herramientas precisas.', 'Usas la propiedad de maestría de dos tipos de armas.'],
      [2, 'Acción astuta', 'Te mueves con rapidez y astucia.', 'Acción adicional para Correr, Destrabarse o Esconderse.'],
      [3, 'Puntería firme', 'Te tomas un instante para apuntar.', 'Acción adicional: ventaja en tu siguiente ataque si no te has movido; tu velocidad pasa a 0 hasta el final del turno.'],
      [5, 'Golpe astuto', 'Cambias daño por trucos sucios.', 'Al usar Ataque furtivo renuncias a dados para aplicar efectos: Veneno (1d6), Zancadilla (1d6) o Retirada (1d6).'],
      [5, 'Esquiva asombrosa', 'Te apartas en el último momento.', 'Reacción: reduces a la mitad el daño de un ataque de un atacante que puedas ver.'],
      [6, 'Pericia', 'Pules aún más tu oficio.', 'Pericia en dos habilidades más.'],
      [7, 'Evasión', 'Esquivas explosiones y trampas.', 'En salvaciones de DES para recibir la mitad de daño, no recibes daño si superas y la mitad si fallas.'],
      [7, 'Talento fiable', 'La práctica te hace infalible.', 'En pruebas de habilidades o herramientas en las que eres competente, un 9 o menos en el d20 cuenta como 10.'],
      [11, 'Golpe astuto mejorado', 'Encadenas trucos.', 'Puedes usar dos efectos de Golpe astuto en el mismo Ataque furtivo.'],
      [14, 'Golpes arteros', 'Tus trucos son más crueles.', 'Nuevos efectos de Golpe astuto: Aturdir (2d6), Dejar sin sentido (6d6) y Oscurecer (3d6).'],
      [15, 'Mente escurridiza', 'Tu mente es difícil de atrapar.', 'Competencia en salvaciones de SAB y CAR.'],
      [18, 'Escurridizo', 'Nadie consigue acorralarte.', 'Ninguna tirada de ataque tiene ventaja contra ti mientras no estés incapacitado.'],
      [20, 'Golpe de suerte', 'La suerte sonríe al audaz.', 'Una vez por descanso corto conviertes una prueba d20 fallida en un 20.']
    ]
  };

  // Subclases: todas se eligen a nivel 3 en las reglas de 2024.
  const S = (key, name, story, list) => ({ key, name, story, features: list });
  const subclasses = {
    barbaro: [
      S('berserker', 'Senda del Berserker', 'Te entregas a la violencia pura y disfrutas del caos del combate.', [
        [3, 'Frenesí', 'La sed de sangre guía tus golpes.', 'Con Ataque temerario en furia, tu primer impacto del turno suma tantos d6 como tu daño de furia.'],
        [6, 'Furia sin mente', 'Nada te distrae de la matanza.', 'En furia eres inmune a hechizado y asustado; si ya lo estabas, el efecto termina.'],
        [10, 'Represalia', 'Devuelves cada golpe.', 'Reacción: al recibir daño de una criatura a 5 pies, le haces un ataque cuerpo a cuerpo.'],
        [14, 'Presencia intimidante', 'Tu grito hace huir a los valientes.', 'Acción adicional: criaturas a 30 pies salvan SAB o quedan asustadas 1 minuto. Una vez por descanso largo o gastando una furia.']
      ]),
      S('corazon_salvaje', 'Senda del Corazón Salvaje', 'Tu furia se inspira en los espíritus de los animales.', [
        [3, 'Hablante animal', 'Las bestias te entienden.', 'Lanzas Sentido bestial y Hablar con los animales como rituales.'],
        [3, 'Furia de lo salvaje', 'Un espíritu animal te acompaña en la furia.', 'Al entrar en furia eliges Oso (resistencia a todo salvo fuerza, necrótico, psíquico y radiante), Águila (Correr y Destrabarse como acción adicional) o Lobo (tus aliados tienen ventaja contra enemigos a 5 pies de ti).'],
        [6, 'Aspecto de lo salvaje', 'Adoptas un rasgo animal permanente.', 'Eliges Búho (visión en la oscuridad), Pantera (velocidad de trepar) o Salmón (velocidad de nadar); puedes cambiarlo tras un descanso largo.'],
        [10, 'Hablante de la naturaleza', 'La naturaleza te escucha.', 'Lanzas Comunión con la naturaleza como ritual.'],
        [14, 'Poder de lo salvaje', 'Tu furia se vuelve más bestial.', 'Al entrar en furia eliges Halcón (vuelo), León (los enemigos a 5 pies tienen desventaja contra otros) o Carnero (derribas a criaturas grandes o menores al impactar).']
      ]),
      S('arbol_mundo', 'Senda del Árbol del Mundo', 'Tu furia te conecta con el árbol cósmico que une los planos.', [
        [3, 'Vitalidad del árbol', 'La savia del árbol te fortalece.', 'Al entrar en furia ganas PG temporales iguales a tu nivel, y en cada turno puedes dar PG temporales a un aliado a 10 pies.'],
        [6, 'Ramas del árbol', 'Raíces espectrales atrapan a tus enemigos.', 'Reacción en furia: una criatura a 30 pies salva FUE o es teletransportada junto a ti y su velocidad pasa a 0.'],
        [10, 'Raíces devastadoras', 'Tu alcance se extiende como raíces.', 'Tu alcance con armas pesadas o versátiles aumenta 10 pies y al impactar puedes aplicar Empujar o Derribar además de otra maestría.'],
        [14, 'Viajar por el árbol', 'Saltas entre las ramas del mundo.', 'En furia te teletransportas 60 pies como acción adicional; una vez por furia, 150 pies llevando hasta seis aliados.']
      ]),
      S('fanatico', 'Senda del Fanático', 'Tu furia es un fuego sagrado concedido por un dios.', [
        [3, 'Furia divina', 'Tu dios golpea a través de ti.', 'En furia, tu primer impacto del turno hace 1d6 + la mitad de tu nivel de daño necrótico o radiante.'],
        [3, 'Guerrero de los dioses', 'Tu dios te sana en plena batalla.', 'Reserva de 4d12 para curarte como acción adicional (5, 6 y 7 dados a niveles 6, 12 y 17).'],
        [6, 'Concentración fanática', 'Tu fe no se quiebra.', 'Una vez por furia repites una salvación fallida sumando tu daño de furia.'],
        [10, 'Presencia fervorosa', 'Tu grito de guerra enardece a tus aliados.', 'Acción adicional: hasta diez aliados a 60 pies tienen ventaja en ataques y salvaciones hasta tu próximo turno. Una vez por descanso largo o gastando una furia.'],
        [14, 'Furia de los dioses', 'Te conviertes en un avatar divino.', 'Al entrar en furia, durante 1 minuto vuelas, resistes el daño necrótico, psíquico y radiante, y puedes salvar a un aliado de caer a 0 PG.']
      ])
    ],
    bardo: [
      S('danza', 'Colegio de la Danza', 'Tu arte es el movimiento: bailas mientras luchas.', [
        [3, 'Paso deslumbrante', 'Tu danza es también tu arma.', 'Sin armadura ni escudo: ventaja en Interpretación al bailar, CA 10 + DES + CAR y golpes sin armas con DES que hacen el daño de tu dado de inspiración.'],
        [6, 'Movimiento inspirador', 'Arrastras a tus aliados en tu baile.', 'Reacción gastando Inspiración bárdica: tú y un aliado os movéis sin provocar ataques de oportunidad.'],
        [6, 'Danza en tándem', 'Marcas el ritmo de la batalla.', 'Al tirar iniciativa, gastas un uso de Inspiración bárdica para sumar el dado a tu iniciativa y a la de aliados cercanos.'],
        [14, 'Evasión guía', 'Enseñas a esquivar.', 'Tienes Evasión y la compartes con los aliados a 5 pies.']
      ]),
      S('glamour', 'Colegio del Glamour', 'Aprendiste tu arte entre los seres feéricos.', [
        [3, 'Magia cautivadora', 'Tu encanto es sobrenatural.', 'Siempre preparas Encantar persona e Imagen espejo; tras lanzar un encantamiento o ilusión puedes hechizar o asustar a una criatura.'],
        [3, 'Manto de inspiración', 'Tu presencia infunde vigor.', 'Acción adicional gastando Inspiración bárdica: varios aliados ganan PG temporales y se mueven sin provocar ataques de oportunidad.'],
        [6, 'Manto de majestad', 'Te vuelves imponente como un rey feérico.', 'Durante 1 minuto lanzas Orden como acción adicional sin gastar espacio.'],
        [14, 'Majestad inquebrantable', 'Nadie se atreve a alzar la mano contra ti.', 'Durante 1 minuto, quien te ataque debe salvar CAR o el ataque falla.']
      ]),
      S('saber', 'Colegio del Saber', 'Coleccionas conocimientos y secretos de todas partes.', [
        [3, 'Competencias adicionales', 'Has estudiado de todo.', 'Competencia en tres habilidades a tu elección.'],
        [3, 'Palabras cortantes', 'Tu ingenio desarma a los enemigos.', 'Reacción: restas tu dado de inspiración al ataque, la prueba o el daño de una criatura a 60 pies.'],
        [6, 'Descubrimientos mágicos', 'Has robado secretos de otras tradiciones.', 'Aprendes dos conjuros de las listas de clérigo, druida o mago.'],
        [14, 'Habilidad sin par', 'Ningún reto te supera.', 'Al fallar una prueba o un ataque sumas tu dado de inspiración; si sigue fallando, no gastas el uso.']
      ]),
      S('valor', 'Colegio del Valor', 'Cantas las gestas de los héroes y luchas a su lado.', [
        [3, 'Inspiración de combate', 'Tus versos dan fuerza a los guerreros.', 'Quien tenga tu inspiración puede sumarla al daño o a su CA contra un ataque.'],
        [3, 'Entrenamiento marcial', 'Has aprendido a luchar.', 'Competencia con armas marciales, armadura intermedia y escudos; puedes usar un arma como canalizador.'],
        [6, 'Ataque adicional', 'Combates como los héroes de tus canciones.', 'Atacas dos veces con la acción de Atacar y puedes sustituir un ataque por un truco.'],
        [14, 'Magia de batalla', 'Mezclas acero y magia.', 'Tras lanzar un conjuro con tu acción, haces un ataque con arma como acción adicional.']
      ])
    ],
    brujo: [
      S('archihada', 'Patrón Archihada', 'Tu patrón es un señor feérico caprichoso.', [
        [3, 'Conjuros de la Archihada', 'Tu patrón te enseña magia feérica.', 'Siempre preparas Calmar emociones, Fuego feérico, Paso brumoso y otros según el nivel.'],
        [3, 'Pasos feéricos', 'Te mueves como un feérico.', 'Lanzas Paso brumoso sin espacio (usos = CAR) con un efecto extra: refrescar, burlar, desaparecer o asustar.'],
        [6, 'Huida brumosa', 'Te esfumas cuando te hieren.', 'Lanzas Paso brumoso como reacción al recibir daño.'],
        [10, 'Defensas seductoras', 'Tu encanto te protege.', 'Inmunidad a hechizado; reacción para devolver daño psíquico a quien te hiera.'],
        [14, 'Magia hechicera', 'Tus conjuros se envuelven de niebla.', 'Tras lanzar un encantamiento o una ilusión, lanzas Paso brumoso sin gastar espacio.']
      ]),
      S('celestial', 'Patrón Celestial', 'Tu patrón es un ser de luz y bondad.', [
        [3, 'Conjuros celestiales', 'La luz divina te acompaña.', 'Siempre preparas Luz, Llama sagrada, Curar heridas y otros según el nivel.'],
        [3, 'Luz curativa', 'Tu patrón sana a través de ti.', 'Reserva de d6 igual a 1 + tu nivel para curar a distancia como acción adicional.'],
        [6, 'Alma radiante', 'Tu alma brilla con luz celestial.', 'Resistencia al daño radiante y sumas CAR al daño de fuego o radiante de tus conjuros.'],
        [10, 'Resiliencia celestial', 'La luz te reconforta.', 'Al usar Astucia mágica o descansar, tú y tus aliados ganáis PG temporales.'],
        [14, 'Venganza abrasadora', 'Te alzas envuelto en llamas.', 'Al hacer una salvación de muerte recuperas la mitad de tus PG y dañas y cegas a los enemigos cercanos.']
      ]),
      S('infernal', 'Patrón Infernal', 'Has pactado con un diablo o un demonio.', [
        [3, 'Bendición del oscuro', 'Tu patrón te recompensa por cada caído.', 'Al reducir a 0 PG a un enemigo ganas PG temporales iguales a CAR + tu nivel.'],
        [3, 'Conjuros infernales', 'Fuego infernal en tus manos.', 'Siempre preparas Manos ardientes, Orden, Bola de fuego y otros según el nivel.'],
        [6, 'Suerte del oscuro', 'Tu patrón hace trampas por ti.', 'Sumas 1d10 a una prueba o salvación. Usos = CAR por descanso largo.'],
        [10, 'Resiliencia infernal', 'Tu cuerpo resiste lo que elijas.', 'Tras cada descanso eliges un tipo de daño (salvo fuerza) al que tienes resistencia.'],
        [14, 'Arrojar al infierno', 'Envías al enemigo a los planos inferiores.', 'Al impactar, el objetivo desaparece por los infiernos y recibe 8d10 de daño psíquico. Una vez por descanso largo.']
      ]),
      S('primigenio', 'Patrón Gran Antiguo', 'Tu patrón es una entidad incomprensible de más allá de las estrellas.', [
        [3, 'Mente despierta', 'Tu mente toca otras mentes.', 'Conectas telepáticamente con una criatura a varias millas.'],
        [3, 'Conjuros del Gran Antiguo', 'Magia que roza la locura.', 'Siempre preparas Susurros disonantes, Risa horrible de Tasha y otros según el nivel.'],
        [3, 'Hechizos psíquicos', 'Tu magia ataca la mente.', 'Tus conjuros de brujo pueden hacer daño psíquico, y los de encantamiento o ilusión no necesitan componentes verbales ni somáticos.'],
        [6, 'Combatiente clarividente', 'Lees la mente de tu rival.', 'Al conectar telepáticamente, si falla una salvación de SAB tienes ventaja contra la criatura y ella desventaja contra ti.'],
        [10, 'Maleficio sobrenatural', 'Tu maleficio debilita.', 'El objetivo de tu Maleficio tiene desventaja en salvaciones de la característica elegida.'],
        [10, 'Escudo mental', 'Tu mente está sellada.', 'Nadie puede leer tus pensamientos, resistes el daño psíquico y lo reflejas al atacante.'],
        [14, 'Crear siervo', 'Esclavizas una mente ajena.', 'Siempre preparas Dominar monstruo y lo lanzas sin concentración sobre una criatura que se convierte en tu siervo.']
      ])
    ],
    clerigo: [
      S('vida', 'Dominio de la Vida', 'Tu dios protege la vida y combate a la muerte.', [
        [3, 'Discípulo de la vida', 'Tu magia curativa es más potente.', 'Tus conjuros de curación de nivel 1 o más curan 2 + el nivel del espacio extra.'],
        [3, 'Conjuros del dominio', 'Tu dios te concede conjuros de sanación.', 'Siempre preparas Bendición, Curar heridas, Ayuda, Restauración menor y otros según el nivel.'],
        [3, 'Preservar la vida', 'Tu fe aparta a los heridos de la muerte.', 'Canalizar divinidad: repartes 5 × tu nivel PG entre criaturas a 30 pies, hasta la mitad de su máximo.'],
        [6, 'Sanador bendito', 'Al curar a otros, te curas.', 'Al curar a otra criatura con un conjuro, recuperas 2 + el nivel del espacio.'],
        [17, 'Sanación suprema', 'Tu curación es absoluta.', 'Los dados de curación de tus conjuros y rasgos dan siempre el máximo.']
      ]),
      S('luz', 'Dominio de la Luz', 'Tu dios es la luz que destierra la oscuridad.', [
        [3, 'Conjuros del dominio', 'La luz arde en tus conjuros.', 'Siempre preparas Manos ardientes, Fuego feérico, Rayo abrasador, Ver invisibilidad y otros.'],
        [3, 'Resplandor del alba', 'Tu luz disipa las tinieblas.', 'Canalizar divinidad: disipas la oscuridad mágica a 30 pies y haces 2d10 + tu nivel de daño radiante (mitad si salvan CON).'],
        [3, 'Destello protector', 'Deslumbras a quien ataca.', 'Reacción: impones desventaja a un ataque contra ti o un aliado a 30 pies. Usos = SAB por descanso largo.'],
        [6, 'Destello protector mejorado', 'Tu luz protege y fortalece.', 'Recuperas los usos en descanso corto y el protegido gana PG temporales.'],
        [17, 'Corona de luz', 'Brillas como un sol.', 'Durante 1 minuto emites luz brillante y los enemigos tienen desventaja contra tus conjuros de fuego y radiante.']
      ]),
      S('engano', 'Dominio del Engaño', 'Sirves a un dios de la astucia y las travesuras.', [
        [3, 'Bendición del embaucador', 'Compartes tu talento para el engaño.', 'Una criatura gana ventaja en pruebas de Sigilo hasta tu próximo descanso largo.'],
        [3, 'Invocar duplicidad', 'Creas un doble ilusorio.', 'Canalizar divinidad: un duplicado tuyo durante 1 minuto desde el que puedes lanzar conjuros y que te da ventaja contra quienes estén a su lado.'],
        [3, 'Conjuros del dominio', 'Tu dios te enseña ilusiones y engaños.', 'Siempre preparas Encantar persona, Disfrazarse, Invisibilidad y otros.'],
        [6, 'Transposición del embaucador', 'Cambias de lugar con tu doble.', 'Al mover el duplicado puedes intercambiarte con él.'],
        [17, 'Duplicidad mejorada', 'Tu doble es casi tan real como tú.', 'Tus aliados también tienen ventaja junto al duplicado y, al desvanecerse, cura a un aliado.']
      ]),
      S('guerra', 'Dominio de la Guerra', 'Tu dios bendice a quienes luchan por una causa.', [
        [3, 'Golpe guiado', 'Tu dios guía el arma.', 'Canalizar divinidad: +10 a un ataque tuyo o de un aliado a 30 pies tras ver la tirada.'],
        [3, 'Conjuros del dominio', 'Conjuros para la batalla.', 'Siempre preparas Escudo de fe, Favor divino, Arma mágica y otros.'],
        [3, 'Sacerdote de guerra', 'Luchas tanto como rezas.', 'Acción adicional: un ataque con arma o golpe sin armas. Usos = SAB por descanso corto.'],
        [6, 'Bendición del dios de la guerra', 'Tu fe sostiene tu magia.', 'Gastas Canalizar divinidad para lanzar Escudo de fe o Arma espiritual sin espacio y sin concentración.'],
        [17, 'Avatar de la batalla', 'Eres el arma de tu dios.', 'Resistencia al daño contundente, cortante y perforante.']
      ])
    ],
    druida: [
      S('tierra', 'Círculo de la Tierra', 'Tus ritos ancestrales te unen a un tipo de terreno.', [
        [3, 'Conjuros del círculo', 'La tierra que eliges te da sus conjuros.', 'Eliges árida, polar, templada o tropical y tienes siempre preparados sus conjuros.'],
        [3, 'Ayuda de la tierra', 'La tierra cura y hiere a la vez.', 'Gastas Forma salvaje: esfera de 10 pies donde los enemigos sufren 2d6 de daño necrótico y un aliado recupera 2d6 PG (aumenta con el nivel).'],
        [6, 'Recuperación natural', 'Meditas y la tierra te repone.', 'Una vez por descanso largo recuperas espacios en un descanso corto y lanzas un conjuro del círculo sin espacio.'],
        [10, 'Protección de la naturaleza', 'La naturaleza te ampara.', 'Inmunidad a envenenado y resistencia al tipo de daño de tu terreno.'],
        [14, 'Santuario de la naturaleza', 'Haces brotar un bosque protector.', 'Gastas Forma salvaje: árboles espectrales dan media cobertura a ti y a tus aliados y comparten tu resistencia.']
      ]),
      S('luna', 'Círculo de la Luna', 'La luna te guía en tus transformaciones.', [
        [3, 'Formas del círculo', 'Te conviertes en bestias poderosas.', 'En Forma salvaje usas bestias de VD hasta un tercio de tu nivel, tu CA es al menos 13 + SAB y ganas más PG temporales.'],
        [3, 'Conjuros del círculo', 'La magia lunar te acompaña.', 'Siempre preparas Curar heridas, Rayo de luna y otros, y los lanzas en forma de bestia.'],
        [6, 'Formas del círculo mejoradas', 'Tu forma salvaje brilla con luz de luna.', 'Tus ataques en Forma salvaje pueden hacer daño radiante y sumas SAB a tus salvaciones de CON.'],
        [10, 'Paso lunar', 'Saltas entre rayos de luna.', 'Acción adicional: te teletransportas 30 pies y tienes ventaja en tu siguiente ataque. Usos = SAB por descanso largo.'],
        [14, 'Forma lunar', 'Eres la luna hecha bestia.', 'Una vez por turno haces 2d10 de daño radiante extra en Forma salvaje y Paso lunar puede llevar a un aliado.']
      ]),
      S('mar', 'Círculo del Mar', 'Canalizas la furia de las mareas y las tormentas.', [
        [3, 'Conjuros del círculo', 'El océano te da su magia.', 'Siempre preparas Nube de niebla, Ola atronadora y otros.'],
        [3, 'Ira del mar', 'Te rodea un aura de agua y viento.', 'Gastas Forma salvaje: durante 10 minutos un aura de 5 pies hace daño de frío y empuja a los enemigos.'],
        [6, 'Afinidad acuática', 'El agua es tu hogar.', 'Tu aura crece a 10 pies y ganas velocidad de nadar.'],
        [10, 'Nacido de la tormenta', 'Cabalgas el viento.', 'Con la Ira del mar activa vuelas y resistes el frío, el relámpago y el trueno.'],
        [14, 'Don oceánico', 'Compartes el poder del mar.', 'Puedes proyectar tu aura sobre un aliado o sobre ambos a la vez.']
      ]),
      S('estrellas', 'Círculo de las Estrellas', 'Lees el destino en las constelaciones.', [
        [3, 'Mapa estelar', 'Tu mapa del cielo es un foco mágico.', 'Siempre preparas Guía y Rayo guía, que lanzas sin espacio varias veces por descanso largo.'],
        [3, 'Forma estrellada', 'Te transformas en una constelación luminosa.', 'Gastas Forma salvaje: Arquero (ataque radiante como acción adicional), Cáliz (curaciones extra) o Dragón (mínimo 10 en pruebas de INT y SAB y en concentración).'],
        [6, 'Presagio cósmico', 'Las estrellas te dicen qué vendrá.', 'Tras un descanso largo puedes sumar o restar 1d6 a tiradas de otras criaturas con tu reacción.'],
        [10, 'Constelaciones titilantes', 'Tus constelaciones brillan más.', 'El daño y la curación de Forma estrellada pasan a 2d8, el Dragón te da vuelo y puedes cambiar de forma cada turno.'],
        [14, 'Lleno de estrellas', 'Eres medio luz.', 'En Forma estrellada resistes el daño contundente, cortante y perforante.']
      ])
    ],
    explorador: [
      S('senor_bestias', 'Señor de las Bestias', 'Luchas junto a una bestia que es tu compañera.', [
        [3, 'Compañero primigenio', 'Un espíritu animal te sigue.', 'Invocas una bestia de la tierra, el mar o el cielo que actúa en tu turno; le ordenas atacar con una acción adicional.'],
        [7, 'Entrenamiento excepcional', 'Tu bestia es más lista.', 'Tu bestia puede Correr, Destrabarse, Esquivar o Ayudar como acción adicional y sus ataques pueden hacer daño de fuerza.'],
        [11, 'Furia bestial', 'Tu compañera lucha con furia.', 'Tu bestia ataca dos veces y añade el daño de tu Marca del cazador.'],
        [15, 'Compartir conjuros', 'Tu magia alcanza a tu compañera.', 'Los conjuros que te lanzas a ti también afectan a tu bestia si está a 30 pies.']
      ]),
      S('feerico', 'Errante Feérico', 'Un vínculo con los feéricos te da un encanto inquietante.', [
        [3, 'Golpes temibles', 'Tus armas hieren la mente.', 'Una vez por turno, +1d4 de daño psíquico (1d6 a nivel 11).'],
        [3, 'Conjuros del errante feérico', 'La magia feérica te acompaña.', 'Siempre preparas Encantar persona, Paso brumoso y otros.'],
        [3, 'Encanto de otro mundo', 'Tu presencia es feérica.', 'Sumas SAB a las pruebas de CAR y ganas una competencia social.'],
        [7, 'Giro seductor', 'Devuelves los encantamientos.', 'Reacción: cuando una criatura supera una salvación contra hechizado o asustado, hechizas o asustas a otra.'],
        [11, 'Refuerzos feéricos', 'Los feéricos acuden a tu llamada.', 'Lanzas Invocar feérico sin componente material, una vez sin espacio.'],
        [15, 'Errante brumoso', 'Te mueves entre brumas.', 'Lanzas Paso brumoso sin espacio varias veces y puedes llevar a un aliado.']
      ]),
      S('acechador', 'Acechador de la Penumbra', 'Cazas en la oscuridad donde otros temen entrar.', [
        [3, 'Emboscador temible', 'Atacas desde la oscuridad.', 'Sumas SAB a la iniciativa, +10 pies de velocidad en el primer turno y 2d6 de daño psíquico extra al impactar (usos = SAB).'],
        [3, 'Conjuros del acechador', 'La sombra te da sus conjuros.', 'Siempre preparas Disfrazarse, Truco de la cuerda y otros.'],
        [3, 'Visión umbral', 'Ves en la oscuridad absoluta.', 'Visión en la oscuridad de 60 pies y eres invisible para quienes dependen de ella.'],
        [7, 'Mente de hierro', 'Tu mente es inquebrantable.', 'Competencia en salvaciones de SAB (o de INT o CAR si ya la tenías).'],
        [11, 'Ráfaga del acechador', 'Tus golpes encadenan el miedo.', 'El daño de Emboscador temible pasa a 2d8 y puede asustar o dañar a otra criatura.'],
        [15, 'Esquiva sombría', 'Te desvaneces ante el ataque.', 'Reacción: impones desventaja a un ataque contra ti y te teletransportas 30 pies.']
      ]),
      S('cazador', 'Cazador', 'Proteges la civilización de las amenazas salvajes.', [
        [3, 'Saber del cazador', 'Conoces a tu presa.', 'Al marcar con Marca del cazador conoces las inmunidades, resistencias y vulnerabilidades del objetivo.'],
        [3, 'Presa del cazador', 'Te especializas en un tipo de presa.', 'Asesino de colosos (+1d8 a criaturas heridas) o Destructor de hordas (un ataque extra contra otra criatura cercana).'],
        [7, 'Tácticas defensivas', 'Te defiendes como un veterano.', 'Escapar de la horda (ataques de oportunidad contra ti con desventaja) o Defensa contra ataques múltiples.'],
        [11, 'Presa superior', 'Tu marca se extiende.', 'Al dañar con Marca del cazador, haces el mismo daño a otra criatura a 30 pies.'],
        [15, 'Defensa superior', 'Resistes cualquier golpe.', 'Reacción: ganas resistencia al daño del ataque que recibes.']
      ])
    ],
    guerrero: [
      S('maestro_batalla', 'Maestro de Batalla', 'Estudias el combate como un arte y una ciencia.', [
        [3, 'Superioridad en combate', 'Dominas maniobras tácticas.', 'Aprendes tres maniobras y tienes cuatro dados de superioridad (d8) que recuperas en descanso corto; ganas más al subir.'],
        [3, 'Estudiante de la guerra', 'Has aprendido un oficio.', 'Competencia con unas herramientas de artesano y una habilidad de guerrero.'],
        [7, 'Conoce a tu enemigo', 'Calibras al rival de un vistazo.', 'Acción adicional: conoces las inmunidades, resistencias y vulnerabilidades de una criatura.'],
        [10, 'Superioridad mejorada', 'Tus maniobras son más letales.', 'Tus dados de superioridad pasan a d10.'],
        [15, 'Implacable', 'Nunca te quedas sin recursos.', 'Una vez por turno usas una maniobra con 1d8 en lugar de gastar un dado.'],
        [18, 'Superioridad definitiva', 'Eres un maestro entre maestros.', 'Tus dados de superioridad pasan a d12.']
      ]),
      S('campeon', 'Campeón', 'Persigues la excelencia física pura.', [
        [3, 'Crítico mejorado', 'Encuentras los puntos débiles.', 'Haces crítico con un 19 o un 20.'],
        [3, 'Atleta notable', 'Tu cuerpo está en su cénit.', 'Ventaja en iniciativa y en pruebas de Atletismo; tras un crítico te mueves sin provocar ataques de oportunidad.'],
        [7, 'Estilo de combate adicional', 'Dominas otro estilo.', 'Ganas otra dote de Estilo de combate.'],
        [10, 'Guerrero heroico', 'Siempre estás inspirado.', 'Si no tienes Inspiración heroica al empezar tu turno, la ganas.'],
        [15, 'Crítico superior', 'Tus golpes devastan.', 'Haces crítico con 18, 19 o 20.'],
        [18, 'Superviviente', 'Eres casi imposible de matar.', 'Ventaja en salvaciones de muerte y, con la mitad de tus PG o menos, recuperas 5 + CON PG cada turno.']
      ]),
      S('caballero_arcano', 'Caballero Arcano', 'Combinas la espada con la magia de mago.', [
        [3, 'Lanzamiento de conjuros', 'Has aprendido magia arcana.', 'Lanzas conjuros de mago con INT como lanzador de un tercio.'],
        [3, 'Vínculo de guerra', 'Tu arma es parte de ti.', 'Vinculas hasta dos armas: no te las pueden quitar y las invocas a tu mano.'],
        [7, 'Magia de guerra', 'Mezclas trucos y acero.', 'Puedes sustituir un ataque de la acción de Atacar por un truco.'],
        [10, 'Golpe sobrenatural', 'Tus golpes abren brechas mágicas.', 'Al impactar, el objetivo tiene desventaja en su siguiente salvación contra tus conjuros.'],
        [15, 'Carga arcana', 'Te teletransportas al lanzarte al ataque.', 'Al usar Oleada de acción te teletransportas 30 pies.'],
        [18, 'Magia de guerra mejorada', 'Conjuros y acero son lo mismo.', 'Puedes sustituir dos ataques por un conjuro de nivel 1 o 2.']
      ]),
      S('guerrero_psi', 'Guerrero Psiónico', 'Tu mente es un arma tan afilada como tu espada.', [
        [3, 'Poder psiónico', 'Tu energía psiónica protege y golpea.', 'Dados de energía psiónica (d6) para Campo protector (reducir daño), Golpe psiónico (daño de fuerza extra) y Movimiento telequinético.'],
        [7, 'Adepto telequinético', 'Tu mente mueve cuerpos.', 'Salto psiónico (vuelas un rato) y Empuje telequinético (derribas o mueves al golpear).'],
        [10, 'Mente protegida', 'Nadie entra en tu cabeza.', 'Resistencia al daño psíquico; gastas un dado para quitarte hechizado o asustado.'],
        [15, 'Baluarte de fuerza', 'Proteges a tus aliados con la mente.', 'Acción adicional: tú y varios aliados ganáis media cobertura durante 1 minuto.'],
        [18, 'Maestro telequinético', 'Mueves el mundo con el pensamiento.', 'Lanzas Telequinesis sin espacio y atacas como acción adicional mientras la mantienes.']
      ])
    ],
    hechicero: [
      S('aberrante', 'Hechicería Aberrante', 'Una influencia alienígena ha tocado tu mente.', [
        [3, 'Conjuros psiónicos', 'Tu mente desata poderes extraños.', 'Siempre preparas Brazos de Hadar, Susurros disonantes, Lanza mental y otros.'],
        [3, 'Habla telepática', 'Hablas con la mente.', 'Conectas telepáticamente con una criatura durante varios minutos.'],
        [6, 'Hechicería psiónica', 'Lanzas con el pensamiento.', 'Lanzas tus conjuros psiónicos con puntos de hechicería y sin componentes.'],
        [6, 'Defensas psíquicas', 'Tu mente resiste.', 'Resistencia al daño psíquico y ventaja contra hechizado y asustado.'],
        [14, 'Revelación en la carne', 'Tu cuerpo muta.', 'Gastas puntos para ver lo invisible, volar, nadar o deslizarte por huecos.'],
        [18, 'Implosión deformante', 'Desgarras el espacio.', 'Te teletransportas y las criaturas cercanas salvan FUE o reciben 3d10 de fuerza y son atraídas.']
      ]),
      S('mecanica', 'Hechicería Mecánica', 'El orden cósmico de Mechanus fluye por ti.', [
        [3, 'Conjuros mecánicos', 'La magia del orden te acompaña.', 'Siempre preparas Ayuda, Alarma, Protección contra el bien y el mal y otros.'],
        [3, 'Restablecer el equilibrio', 'Anulas la buena y la mala suerte.', 'Reacción: anulas la ventaja o desventaja de una tirada a 60 pies. Usos = CAR por descanso largo.'],
        [6, 'Bastión de la ley', 'Proteges con escudos de orden.', 'Gastas puntos para dar a una criatura una reserva de d8 que reduce el daño que recibe.'],
        [14, 'Trance del orden', 'Tu mente se vuelve un mecanismo.', 'Durante 1 minuto los ataques contra ti no tienen ventaja y tus d20 cuentan al menos como 10.'],
        [18, 'Cabalgata mecánica', 'Invocas espíritus del orden.', 'Un cubo de 30 pies cura, repara objetos y disipa conjuros de nivel 6 o inferior.']
      ]),
      S('draconica', 'Hechicería Dracónica', 'La sangre de un dragón corre por tus venas.', [
        [3, 'Resistencia dracónica', 'Tu piel se cubre de escamas.', '+3 PG y +1 por nivel de hechicero; sin armadura, CA 10 + DES + CAR.'],
        [3, 'Conjuros dracónicos', 'La magia del dragón te acompaña.', 'Siempre preparas Alterar el propio aspecto, Orden, Miedo y otros.'],
        [6, 'Afinidad elemental', 'Dominas el aliento de tu dragón.', 'Resistencia a un tipo de daño y sumas CAR al daño de ese tipo.'],
        [14, 'Alas de dragón', 'Te crecen alas.', 'Acción adicional: velocidad de vuelo de 60 pies durante 1 hora.'],
        [18, 'Compañero dragón', 'Un dragón responde a tu llamada.', 'Lanzas Invocar dragón sin componente material, una vez sin espacio.']
      ]),
      S('magia_salvaje', 'Magia Salvaje', 'Tu magia es caótica e impredecible.', [
        [3, 'Oleada de magia salvaje', 'El caos estalla a tu alrededor.', 'Al lanzar un conjuro de hechicero tiras un d20; con un 20 tiras en la tabla de Oleada de magia salvaje.'],
        [3, 'Mareas del caos', 'Manipulas la suerte.', 'Ganas ventaja en una tirada; tu siguiente conjuro provoca una oleada.'],
        [6, 'Torcer la suerte', 'Alteras el destino de otros.', 'Reacción: gastas 1 punto para sumar o restar 1d4 a la tirada de otra criatura.'],
        [14, 'Caos controlado', 'Domas el caos.', 'Al tirar en la tabla de oleada, tiras dos veces y eliges.'],
        [18, 'Oleada domada', 'Eliges tu caos.', 'Al lanzar un conjuro eliges un efecto de la tabla sin tirar. Una vez por descanso largo.']
      ])
    ],
    mago: [
      S('abjurador', 'Abjurador', 'Proteges con barreras mágicas y deshaces hechizos.', [
        [3, 'Erudito de la abjuración', 'Dominas la magia protectora.', 'Añades conjuros de abjuración gratis a tu libro.'],
        [3, 'Escudo arcano', 'Una barrera te protege.', 'Al lanzar abjuraciones creas una protección con PG = 2 × tu nivel + INT que absorbe el daño.'],
        [6, 'Escudo proyectado', 'Proteges a tus aliados.', 'Reacción: tu Escudo arcano absorbe el daño de un aliado a 30 pies.'],
        [10, 'Rompehechizos', 'Deshaces la magia ajena.', 'Siempre preparas Contraconjuro y Disipar magia y sumas tu competencia a sus pruebas.'],
        [14, 'Resistencia a los conjuros', 'La magia apenas te roza.', 'Ventaja en salvaciones contra conjuros y resistencia a su daño.']
      ]),
      S('adivino', 'Adivino', 'Vislumbras el futuro.', [
        [3, 'Erudito de la adivinación', 'Ves más allá.', 'Añades conjuros de adivinación gratis a tu libro.'],
        [3, 'Presagio', 'Ves el resultado antes de que ocurra.', 'Tras un descanso largo tiras dos d20 y puedes sustituir con ellos cualquier tirada que veas.'],
        [6, 'Adivinación experta', 'Tus visiones te recargan.', 'Al lanzar una adivinación de nivel 2 o más recuperas un espacio de nivel inferior.'],
        [10, 'El tercer ojo', 'Tu ojo interior se abre.', 'Eliges visión en la oscuridad, visión etérea, leer cualquier idioma o ver lo invisible.'],
        [14, 'Presagio mayor', 'Tus visiones se multiplican.', 'Tiras tres d20 para Presagio.']
      ]),
      S('evocador', 'Evocador', 'Desatas energía elemental destructiva.', [
        [3, 'Erudito de la evocación', 'Dominas la energía en bruto.', 'Añades conjuros de evocación gratis a tu libro.'],
        [3, 'Truco potente', 'Tus trucos nunca son en vano.', 'Si fallas o salvan contra tu truco de daño, el objetivo recibe la mitad.'],
        [6, 'Esculpir conjuros', 'Das forma a tus explosiones.', 'Tus aliados superan automáticamente las salvaciones de tus evocaciones y no reciben daño.'],
        [10, 'Evocación potenciada', 'Tu energía es más fuerte.', 'Sumas INT al daño de tus evocaciones.'],
        [14, 'Sobrecarga', 'Fuerzas tu magia al límite.', 'Un conjuro de nivel 1 a 5 hace el daño máximo; repetirlo antes de descansar te hiere.']
      ]),
      S('ilusionista', 'Ilusionista', 'Engañas los sentidos con ilusiones.', [
        [3, 'Erudito de la ilusión', 'Dominas el engaño mágico.', 'Añades conjuros de ilusión gratis a tu libro.'],
        [3, 'Ilusiones mejoradas', 'Tus ilusiones parecen más reales.', 'Lanzas ilusiones sin componentes verbales y con más alcance, e Ilusión menor como acción adicional.'],
        [6, 'Criaturas fantasmales', 'Tus ilusiones cobran vida.', 'Siempre preparas Invocar bestia e Invocar feérico como ilusiones, una vez cada uno sin espacio.'],
        [10, 'Yo ilusorio', 'Un doble recibe el golpe por ti.', 'Reacción: un ataque contra ti falla automáticamente. Una vez por descanso corto.'],
        [14, 'Realidad ilusoria', 'Tus ilusiones se vuelven reales.', 'Un objeto de tu ilusión se vuelve real durante 1 minuto.']
      ])
    ],
    monje: [
      S('misericordia', 'Guerrero de la Misericordia', 'Manipulas la fuerza vital para curar o dañar.', [
        [3, 'Mano dañina', 'Tu toque marchita la vida.', 'Una vez por turno, al impactar con un golpe sin armas, gastas 1 punto para añadir tu dado de artes marciales + SAB de daño necrótico.'],
        [3, 'Mano curativa', 'Tu toque restaura la vida.', 'Gastas 1 punto (o sustituyes un golpe de la ráfaga) para curar tu dado de artes marciales + SAB.'],
        [3, 'Útiles de la misericordia', 'Llevas máscara y saberes de sanador.', 'Competencia en Perspicacia, Medicina y útiles de herborista.'],
        [6, 'Toque del médico', 'Tu toque cura males y causa dolencias.', 'Mano curativa quita condiciones y Mano dañina envenena.'],
        [11, 'Ráfaga de curación y daño', 'Cada golpe cura o hiere.', 'Sustituyes golpes de la Ráfaga por Mano curativa sin gastar puntos y usas Mano dañina sin coste.'],
        [17, 'Mano de la misericordia definitiva', 'Devuelves la vida.', 'Una vez por descanso largo devuelves la vida a una criatura muerta hace menos de 24 horas.']
      ]),
      S('sombra', 'Guerrero de la Sombra', 'Te mueves entre las sombras como un espectro.', [
        [3, 'Artes de la sombra', 'La oscuridad es tu aliada.', 'Gastas 1 punto para lanzar Oscuridad y ver a través de ella; ganas visión en la oscuridad de 60 pies y el truco Ilusión menor.'],
        [6, 'Paso de sombra', 'Saltas de sombra en sombra.', 'Acción adicional: te teletransportas 60 pies entre zonas en penumbra y tienes ventaja en tu siguiente ataque.'],
        [11, 'Paso de sombra mejorado', 'Sales de la sombra golpeando.', 'Gastas 1 punto para usar Paso de sombra sin necesidad de oscuridad y atacar al llegar.'],
        [17, 'Manto de sombras', 'Te vuelves sombra.', 'Gastas 3 puntos: durante 1 minuto eres invisible en penumbra, atraviesas criaturas y objetos y tu ráfaga no gasta puntos.']
      ]),
      S('elementos', 'Guerrero de los Elementos', 'Dominas los cuatro elementos con tus golpes.', [
        [3, 'Sintonía elemental', 'Los elementos responden a tu energía.', 'Gastas 1 punto: durante 10 minutos tus golpes alcanzan 10 pies más, hacen daño elemental y pueden empujar o atraer.'],
        [3, 'Manipular elementos', 'Juegas con los elementos.', 'Conoces el truco Elementalismo.'],
        [6, 'Estallido elemental', 'Liberas una explosión elemental.', 'Gastas 2 puntos: esfera de 20 pies a 120 pies que hace tres dados de artes marciales de daño elemental (salvación de DES).'],
        [11, 'Zancada de los elementos', 'Los vientos te elevan.', 'Con Sintonía elemental activa ganas velocidad de vuelo y de nadar.'],
        [17, 'Epítome elemental', 'Eres un elemental encarnado.', 'Con Sintonía activa resistes un tipo de daño, Paso del viento es más rápido y tus golpes hacen daño extra.']
      ]),
      S('mano_abierta', 'Guerrero de la Mano Abierta', 'Eres maestro del combate sin armas tradicional.', [
        [3, 'Técnica de la mano abierta', 'Tus golpes desequilibran.', 'Al impactar con Ráfaga de golpes: impides sus reacciones, lo empujas 15 pies o lo derribas.'],
        [6, 'Plenitud del cuerpo', 'Te curas meditando.', 'Acción adicional: curas tu dado de artes marciales + SAB. Usos = SAB por descanso largo.'],
        [11, 'Paso veloz', 'Te mueves como un rayo.', 'Al usar otra acción adicional puedes usar también Paso del viento.'],
        [17, 'Palma temblorosa', 'Siembras vibraciones letales.', 'Gastas 4 puntos al impactar; después puedes detonar la vibración: salvación de CON o 10d12 de fuerza (mitad si supera).']
      ])
    ],
    paladin: [
      S('devocion', 'Juramento de Devoción', 'Encarnas el ideal del caballero honrado y justo.', [
        [3, 'Conjuros del juramento', 'Tu juramento te concede conjuros.', 'Siempre preparas Protección contra el bien y el mal, Escudo de fe y otros según el nivel.'],
        [3, 'Arma sagrada', 'Tu arma brilla con luz divina.', 'Canalizar divinidad: durante 10 minutos sumas CAR a los ataques con un arma, que emite luz y puede hacer daño radiante.'],
        [7, 'Aura de devoción', 'Nada corrompe tu voluntad.', 'Tú y tus aliados en tu aura sois inmunes a hechizado.'],
        [15, 'Castigo de protección', 'Tu castigo protege a los tuyos.', 'Al lanzar Castigo divino, tú y tus aliados en tu aura ganáis media cobertura.'],
        [20, 'Halo sagrado', 'Te envuelve una luz sagrada.', 'Acción adicional: durante 10 minutos un aura de luz daña a los enemigos, te da ventaja contra infernales y muertos vivientes y te cura.']
      ]),
      S('gloria', 'Juramento de Gloria', 'Crees que tus hazañas te harán legendario.', [
        [3, 'Castigo inspirador', 'Tus golpes enardecen a tus aliados.', 'Tras un Castigo divino repartes 2d8 + tu nivel PG temporales entre aliados.'],
        [3, 'Atleta sin par', 'Tu físico es heroico.', 'Canalizar divinidad: ventaja en Atletismo y Acrobacias y saltos más largos durante 1 hora.'],
        [3, 'Conjuros del juramento', 'Conjuros de gloria.', 'Siempre preparas Heroísmo, Rayo guía y otros.'],
        [7, 'Aura de presteza', 'Tu presencia acelera a todos.', '+10 pies de velocidad; los aliados que empiezan su turno en tu aura también la ganan.'],
        [15, 'Defensa gloriosa', 'Proteges y contraatacas.', 'Reacción: sumas CAR a la CA de un aliado; si el ataque falla, atacas al agresor.'],
        [20, 'Leyenda viviente', 'Tu leyenda te precede.', 'Acción adicional durante 10 minutos: ventaja en pruebas de CAR, conviertes un fallo en impacto y repites salvaciones fallidas.']
      ]),
      S('ancianos', 'Juramento de los Ancianos', 'Proteges la luz y la vida frente a la oscuridad.', [
        [3, 'Ira de la naturaleza', 'Las enredaderas atrapan a tus enemigos.', 'Canalizar divinidad: criaturas a 15 pies salvan FUE o quedan apresadas por vides espectrales.'],
        [3, 'Conjuros del juramento', 'La naturaleza te apoya.', 'Siempre preparas Golpe atrapador, Hablar con los animales y otros.'],
        [7, 'Aura de protección mágica', 'La magia apenas te toca.', 'Tú y tus aliados en tu aura resistís el daño de los conjuros.'],
        [15, 'Centinela inmortal', 'Te niegas a morir.', 'Una vez por descanso largo, al caer a 0 PG quedas con 3 × tu nivel PG. Además, no envejeces.'],
        [20, 'Campeón anciano', 'Eres un avatar de la naturaleza.', 'Acción adicional durante 1 minuto: recuperas PG cada turno, lanzas conjuros más rápido y los enemigos salvan con desventaja.']
      ]),
      S('venganza', 'Juramento de Venganza', 'Castigas a quienes cometen grandes males.', [
        [3, 'Juramento de enemistad', 'Juras perseguir a un enemigo.', 'Canalizar divinidad al atacar: ventaja en tus ataques contra esa criatura durante 1 minuto.'],
        [3, 'Conjuros del juramento', 'Conjuros para la caza.', 'Siempre preparas Perdición, Marca del cazador y otros.'],
        [7, 'Vengador implacable', 'Nadie escapa de ti.', 'Al impactar con un ataque de oportunidad, la velocidad del objetivo pasa a 0 y te mueves la mitad de tu velocidad.'],
        [15, 'Alma de la venganza', 'Respondes a cada golpe.', 'Reacción: si la criatura de tu enemistad ataca, le haces un ataque cuerpo a cuerpo.'],
        [20, 'Ángel vengador', 'Te alzas como un ángel vengador.', 'Acción adicional durante 10 minutos: vuelas 60 pies y un aura asusta a tus enemigos.']
      ])
    ],
    picaro: [
      S('embaucador_arcano', 'Embaucador Arcano', 'Mezclas la magia de ilusión con la astucia.', [
        [3, 'Lanzamiento de conjuros', 'Has aprendido magia arcana.', 'Lanzas conjuros de mago con INT como lanzador de un tercio.'],
        [3, 'Juego de manos mágico', 'Tu mano invisible roba y manipula.', 'Tu Mano de mago es invisible y puede robar, abrir cerraduras o usar herramientas a distancia.'],
        [9, 'Emboscada mágica', 'Tus conjuros llegan por sorpresa.', 'Si estás oculto, los enemigos tienen desventaja en las salvaciones contra tus conjuros.'],
        [13, 'Embaucador versátil', 'Tu mano distrae a los enemigos.', 'Acción adicional: ventaja en ataques contra una criatura junto a tu Mano de mago.'],
        [17, 'Ladrón de conjuros', 'Robas la magia de otros.', 'Reacción: al superar una salvación contra un conjuro, lo bloqueas y puedes lanzarlo tú durante 8 horas.']
      ]),
      S('asesino', 'Asesino', 'Eres experto en eliminar objetivos con rapidez.', [
        [3, 'Asesinar', 'Golpeas antes de que reaccionen.', 'Ventaja en iniciativa y en ataques contra criaturas que aún no han actuado; tu Ataque furtivo suma tu nivel de daño en el primer asalto.'],
        [3, 'Herramientas del asesino', 'Conoces disfraces y venenos.', 'Competencia con útiles de disfraz y de envenenador.'],
        [9, 'Experto en infiltración', 'Puedes ser cualquiera.', 'Imitas voces y modales tras estudiarlos, y Puntería firme no reduce tu velocidad.'],
        [13, 'Envenenar armas', 'Tus venenos son letales.', 'El efecto Veneno de Golpe astuto añade 2d6 de daño de veneno.'],
        [17, 'Golpe mortal', 'Tu primer golpe puede ser el último.', 'Al impactar en el primer asalto, el objetivo salva CON o el daño se duplica.']
      ]),
      S('cuchillo_alma', 'Cuchillo del Alma', 'Manifiestas cuchillas de energía psíquica.', [
        [3, 'Poder psiónico', 'Tu mente potencia tus habilidades.', 'Dados de energía psiónica (d6) para Golpe de fortuna en pruebas y Susurros psíquicos (telepatía con aliados).'],
        [3, 'Cuchillas psíquicas', 'Creas cuchillas con la mente.', 'Cuchillas de 1d6 de daño psíquico (y otra de 1d4 como acción adicional) que puedes lanzar a 60 pies.'],
        [9, 'Cuchillas del alma', 'Tus cuchillas buscan el objetivo.', 'Gastas dados para corregir ataques fallidos o teletransportarte al lanzar una cuchilla.'],
        [13, 'Velo psíquico', 'Te vuelves invisible con la mente.', 'Durante 1 hora eres invisible; una vez por descanso largo o gastando un dado.'],
        [17, 'Desgarrar mente', 'Rompes la mente del enemigo.', 'Al hacer Ataque furtivo con tus cuchillas, el objetivo salva SAB o queda aturdido 1 minuto.']
      ]),
      S('ladron', 'Ladrón', 'Eres un maestro del robo y la infiltración.', [
        [3, 'Manos rápidas', 'Tus manos son ágiles.', 'Acción astuta permite Juego de manos, usar herramientas de ladrón o usar un objeto.'],
        [3, 'Trabajo en altura', 'Trepas como un gato.', 'Velocidad de trepar igual a tu velocidad y saltas usando DES.'],
        [9, 'Sigilo supremo', 'Te mueves sin ser visto.', 'Nuevo efecto de Golpe astuto: Ataque sigiloso (1d6) para seguir oculto tras atacar.'],
        [13, 'Usar objeto mágico', 'Usas cualquier objeto mágico.', 'Puedes vincularte a cuatro objetos, ignoras restricciones de clase y a veces no gastas cargas.'],
        [17, 'Reflejos de ladrón', 'Actúas antes que nadie.', 'En el primer asalto juegas dos turnos, el segundo con iniciativa −10.']
      ])
    ]
  };

  const story = {
    barbaro: 'Un guerrero feroz alimentado por una furia primigenia.',
    bardo: 'Un artista cuya música y palabras moldean la magia.',
    brujo: 'Un lanzador que obtiene su poder de un pacto con un ser de otro mundo.',
    clerigo: 'Un sacerdote que canaliza el poder de los dioses.',
    druida: 'Un guardián de la naturaleza que adopta formas salvajes.',
    explorador: 'Un cazador de las fronteras que mezcla acero y magia natural.',
    guerrero: 'Un maestro de las armas y las tácticas de combate.',
    hechicero: 'Un lanzador cuya magia nace de su propia sangre o de un don.',
    mago: 'Un erudito que domina la magia mediante el estudio.',
    monje: 'Un artista marcial que canaliza su energía interior.',
    paladin: 'Un guerrero sagrado unido por un juramento.',
    picaro: 'Un especialista en sigilo, astucia y golpes precisos.'
  };

  window.NEXO_DND_PROGRESSION = { features, subclasses, story };
})();
