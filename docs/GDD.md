<!-- Copia del GDD vivo: https://claude.ai/artifact/MTSn6XdYSzKmtpxk5Hm9Un · exportado el 2026-11-19 (rev 104). Se edita en el documento y esta copia se regenera. Los 3 diagramas (bucle, plan de producción, plano) solo se ven en el documento vivo. -->

# Noche de Ánimas — Documento de diseño del videojuego (GDD)

Nov 16, 2026 · @Jonathan · Versión 1.0 del GDD (tras el prototipo web v0.1)

## 1. Ficha y visión

*Noche de Ánimas* es un juego asimétrico de horror y deducción en 3D: hasta 4 investigadores tienen hasta el Alba para nombrar al ánima que habita una casona colonial, y el ánima, controlada por la IA o por una persona, trata de impedirlo.

| Dato | Valor |
| --- | --- |
| Género | Horror cooperativo y asimétrico, de deducción |
| Jugadores | 1 a 4 investigadores contra 1 ánima (IA o persona) |
| Partida | 15 min (meta de la v1); la demo v0.1 dura 3–5 min |
| Plataforma | PC (Windows) y navegador; consolas después |
| Motor | Unity 6 (URP) para producción; prototipos web para probar reglas |
| Público | 12 años en adelante; jugadores de *Phasmophobia*, *Among Us* y juegos de mesa de deducción |
| Tono | Folclor mexicano de Día de Muertos: inquietante y cálido, sin gore |
| Origen | Adaptación del juego de cartas *Noche de Ánimas* (Reglamento v5) |

### High concept

*Phasmophobia* en una casita de muñecas de papel picado, donde el fantasma puede ser tu amigo.

### Pilares

Todo lo que no sirva a uno de estos tres pilares se corta.

1. **Deducir con miedo.** Cada pista exige ir a donde pasa el ánima. Saber más siempre te acerca al peligro.
2. **La casa juega contra ti.** La luz, el sonido, los roperos y la distancia sustituyen al mazo del ánima de la mesa.
3. **Cada ánima es una leyenda.** Se reconoce por cómo se comporta, no por una tabla.
4. **Tensión, no sustos baratos.** Nada de *screamers*. El miedo nace de oír pasos arriba, perder la línea de vista, quedarse sin aliento y decidir dónde esconderse.

### La experiencia que buscamos

- **Investigador:** «Sé que está cerca, la vela se puso azul, me queda poca cordura… ¿leo una vez más o me escondo?»
- **Ánima:** «Me queda poca presencia. Si cazo ahora y fallo, vuelvo a mi cuarto y me encuentran. Si me retiro, recupero fuerza, pero les doy tiempo».

### Qué lo hace distinto

- **El ánima puede ser una persona** con reglas que la limitan: un temporizador de presencia, un cuarto al que debe volver y un perfil de visión, oído y velocidad que no puede cambiar.
- **Deducción por comportamiento.** Cada ánima ve, oye, se mueve y caza distinto, y tiene un *sello* sacado de su leyenda.
- **Un final de huida.** Nombrar al ánima no basta: hay que salir vivo de la casona.
- **Estética de diorama de papel** en lugar de horror realista, con el folclor mexicano en el centro.
- **Un juego de mesa equilibrado detrás.** Las reglas vienen de un juego de cartas medido con simulaciones y teoría de juegos.

### Referentes

| Juego | Qué tomamos | Qué evitamos |
| --- | --- | --- |
| *Phasmophobia* | Herramientas, evidencias, cordura y cacerías | Primera persona realista y partidas largas |
| *Dead by Daylight* | Asimetría 1 contra 4 con una persona como cazador | Que el cazador lo vea todo |
| *Among Us* | Deducción social y partidas cortas | Las votaciones |
| *Don't Starve* / *Tearaway* | Mundo de papel recortado | — |
| *Noche de Ánimas* (cartas) | Ánimas, evidencias, defensas, Alba y Espanto | El azar del dado como única fuente de duda |

## 2. Decisiones clave de esta versión

Esta versión del GDD fija seis decisiones: el juego es 3D, cada ánima es un perfil distinto sobre el Ánima en pena, no hay pruebas falsas, la cacería depende de la cordura del grupo, el Espanto es la huida final y la casona tiene dos pisos.

### 2.1 3D en tercera persona, no 2D cenital

El prototipo v0.1 fue 2D cenital a propósito: era la forma más rápida de probar si las reglas divierten. Para el juego, la mejor forma es **3D con cámara en tercera persona, alta y cercana (ángulo de 50–60°)**, como una casita de muñecas abierta que sigue al personaje.

| Opción | Miedo | Lectura de la casa | Costo de arte | Encaja con el ánima humana | Veredicto |
| --- | --- | --- | --- | --- | --- |
| 2D cenital (v0.1) | Bajo: ves a través de los muros | Excelente | Bajo | Mal: todo está a la vista | Solo para prototipos |
| **3D en tercera persona, cámara alta** | Alto: los muros tapan, la linterna es un cono con sombras | Buena | Medio | Bien: cada bando ve distinto | **Elegida** |
| 3D en primera persona | Muy alto | Pobre: te pierdes en la casa | Alto (manos, animaciones, mareo) | Bien | Para una futura versión VR |

- **El horror necesita oclusión.** En 3D un muro tapa de verdad y la linterna proyecta sombras.
- **Dos pisos solo se leen en 3D.** Las escaleras y el oído (pasos arriba de ti) dan miedo de verdad.
- **Se distingue de *Phasmophobia*.** La primera persona realista es su terreno; la casita de muñecas es el nuestro.
- **Abre la puerta a VR.** La misma casa sirve después para una versión en primera persona.

### 2.2 Un ánima base y variantes por perfil

El **Ánima en pena** es el ánima base: todo estándar y ninguna habilidad especial. Cada ánima nueva es un **perfil** que cambia algunos de sus valores (§6.1):

- **Visión:** cuánto ve de cerca y de lejos. Un ánima que ve muy bien de lejos pero mal de cerca pierde a su presa justo cuando la va a alcanzar; esa torpeza es una pista.
- **Oído, velocidad y aceleración** al ver a alguien.
- **Frecuencia de cada fenómeno**, incluso cero: Nachito nunca apaga una luz.
- **Regla de cacería, habilidad, sello y huida.**

Así, el comportamiento delata al ánima aunque la juegue una persona: puede elegir qué hacer, pero no puede ver, oír ni moverse distinto de como su perfil le permite.

### 2.3 Las herramientas fallan, pero no mienten

Desde el núcleo v2 (§2.7), las herramientas **fallan a veces y dan lecturas dudosas**, pero **nunca dan un positivo falso**: un EMF 5 siempre es real. En cambio, un intento sin resultado no prueba que el ánima no tenga esa evidencia.

- Cada ánima tiene un **sello**: un comportamiento que solo ella produce. No se marca como evidencia, pero es una pista que puede bastar para nombrarla (§5.10).
- Los **fenómenos compartidos** (apagar la luz, portazo, escalofrío…) los hacen casi todas y nunca dan evidencia. Un ánima humana puede abusar de ellos para parecer otra, pero no puede fingir un sello ni cambiar su perfil.
- Las lecturas son la *señal costosa*: cuestan tiempo y riesgo. Los fenómenos son *charla barata* (§10.3).

### 2.4 La cacería depende de la cordura del grupo

Por regla general, el ánima puede cazar cuando la **cordura promedio de los investigadores vivos** baja de su umbral (50 en la base). En la cacería cualquiera puede morir. Algunas ánimas cambian la regla y miran a una sola persona: la Matlacíhuatl, a quien anda solo; la Tlahuelpuchi, al más débil; la Planchada, al más sano.

### 2.5 El Espanto es la huida final

El Espanto ya no es un ataque a mitad de la noche. Cuando los investigadores **nombran al ánima en el altar** y aciertan, el ánima queda expuesta y empieza **la huida**: tienen que salir de la casona por el Zaguán mientras el ánima usa su Espanto para impedirlo (§5.11).

### 2.6 La casona tiene dos pisos

Se agrega una planta alta con 10 cuartos y una galería sobre el patio, unida por dos escaleras. Los escondites cambian en cada partida, con un mínimo garantizado (§8).

### 2.7 Núcleo v2: las pruebas se provocan y el ánima tiene hambre (aprobado el 17 de noviembre)

Dos reglas nuevas mandan sobre todo lo demás. **Lo que el ánima hace a propósito nunca es evidencia**: solo cuenta como comportamiento. **Las evidencias salen de su presencia**, en lecturas que a veces fallan y que solo ve quien sostiene la herramienta.

#### Objetivo de cada bando

- **Investigadores:** nombrarla en el altar y salir en la huida. Pueden nombrar cuando quieran: con 0 evidencias si la reconocen por su comportamiento, con 1 o 2 arriesgando, y con 3 es seguro.
- **Ánima:** engañar (que la nombren mal o que llegue el Alba sin nombrarla) o matar a todos.

#### De dónde salen las evidencias: el rastro

El ánima deja **rastro** en el cuarto donde pasa tiempo. Sube 1 por segundo mientras está dentro y baja 1 cada 3 s cuando se va (así una guarida abandonada se enfría en unos 2 minutos); en su guarida, descansando, sube al doble. Las herramientas leen el rastro y la cercanía del ánima, nunca sus acciones.

Cada herramienta, con su probabilidad y lo que muestra su pantalla, está en §5.3.

- **Lecturas dudosas.** Con cualquier ánima salen EMF 4, temperaturas de 1 a 3 °C y estática con sílabas sueltas. Se parecen a una evidencia, pero no lo son. **Nunca hay un positivo falso**: un EMF 5 siempre es real.
- **Sin avisos.** Nadie recibe un mensaje de «evidencia confirmada». La libreta se marca a mano; si marcas mal, nombras mal. Los bots sí marcan solos.
- **El número detrás.** Con 30 % por intento, la primera lectura positiva tarda en promedio 3,3 intentos. Por la regla de Bayes, si un ánima tiene 3 de 7 evidencias, cinco intentos fallidos en buenas condiciones dejan solo un 11 % de probabilidad de que sí la tenga: ese es el punto razonable para tacharla. Es un problema de detección de señales (Green y Swets, 1966): alta probabilidad de fallar, cero falsas alarmas. Meta: la segunda evidencia llega entre el minuto 7 y el 11.

#### Por qué el ánima actúa: presencia y hambre

- **La presencia baja 1 por segundo en todas partes**, no solo fuera de su cuarto.
- **Se rellena alimentándose:** cada punto de cordura que quita le da 1 de presencia. En su guarida el hambre se congela (ni baja ni sube), pero ahí deja rastro doble: solo comer la recupera.
- **Si llega a 0, se desvanece:** se manifiesta sin querer 3 s donde está (se ve y suena su sello) y queda 20 s inmóvil en su guarida.
- **El dilema:** asustar a la gente la mantiene fuerte y lejos de casa; esconderse la obliga a volver a su guarida, donde el rastro la delata. Sus fenómenos alcanzan de 4 a 10 m, así que un ánima hábil asusta sin dejarse leer.

#### Cómo engaña

- Usa los fenómenos compartidos para parecerse a otra ánima.
- Imita la voz de un compañero.
- Se muda de guarida; el rastro viejo se enfría en unos 2 minutos.
- **Interferencia:** hace fallar los aparatos a 6 m con lecturas dudosas (EMF 4, temperatura que salta). Nunca produce un positivo.

#### La guarida y tentar

- **La guarida se queda.** Da al equipo un lugar donde trabajar sin perseguir al ánima por toda la casa. No hay velas azules: se encuentra por el frío, los ruidos y las lecturas.
- **Tentar:** los investigadores atraen al ánima apagando la luz, quedándose pocos en un cuarto, hablando con la caja o dejando una ofrenda. El ánima tiene hambre y acude. Con uno o dos investigadores, la jugada es prepararse en un cuarto y hacerla venir, no correr tras ella.

#### Objetos

- **Nada tirado en el piso:** los consumibles están sobre mesas, repisas y burós; las herramientas, en el maletín sobre la mesa del Zaguán.
- Lo que el ánima tira se queda donde cae, y lo puede volver a agarrar y tirar.

#### Qué deja de valer

| Sección | Antes | Ahora |
| --- | --- | --- |
| §2.3 | Las herramientas nunca fallan | Fallan y dan lecturas dudosas, pero nunca un positivo falso |
| §5.3 | Reaccionan a las acciones del ánima y confirman solas | Leen rastro y cercanía; la libreta se marca a mano |
| §5.6 | La presencia solo se gasta fuera de su cuarto | Se gasta siempre; se recupera alimentándose |
| §4.3 | Sigilo | Sobra: las acciones ya no dan evidencia |
| Demo v0.5 | Aviso grande de «Evidencia» | Se quita; solo la pantalla de cada herramienta |

### 2.8 Identidad: roguelite de terror analógico con folclor mexicano (18 de noviembre)

Lo que distingue al juego de *Phasmophobia* y de *Dead by Daylight* se resume en tres ideas.

1. **Una persona juega el ánima.** El bot del ánima usa exactamente las mismas reglas: sirve de rival cuando no hay otra persona y para medir el balance.
2. **Cada noche es una tirada.** Al empezar, una **ruleta de la noche** muestra lo que cambió: dónde están el altar y la caja de fusibles y qué objetos hay en la casa (por ejemplo: «dos limpias y una tablilla, ningún rosario»). Las 7 herramientas del maletín no cambian: son la base fija para deducir. El reto es pensar con lo que tocaste, no reaccionar rápido.
3. **Terror analógico.** El ánima no solo asusta con sustos: engaña a los sentidos. Alucinaciones con la forma de un compañero que desaparece, fallas de imagen y de sonido, cosas que estaban y ya no están. Se apoya en el estilo de aristas duras: un polígono que no debería estar ahí.

#### El poder del ánima es saber y engañar, no perseguir

- **Saber:** ve a través de los muros y oye todo; los vivos no saben dónde está.
- **Controlar la casa:** luces, puertas, objetos y voces.
- **Engañar:** su victoria principal es que la nombren mal.
- **Ninguna cacería se desperdicia:** aunque no mate, el miedo que causa la alimenta. Las cacerías son cortas y decisivas, el clímax de la noche, no la rutina. Así el ánima pierde porque la dedujeron, no porque se le escaparon en un pasillo (el agobio que se sintió en *Dead by Daylight*).
- **Teoría del flujo (Chen, 2007):** el reto debe estar a la altura de la habilidad; si nos equivocamos, mejor un ánima un poco difícil que una aburrida.

#### Cada ánima está obligada a cazar a su manera

Para que nadie juegue solo a confundir, cada ánima tiene una **obligación de cacería**: una condición que, al cumplirse, la empuja a cazar dentro de un plazo. Por ejemplo, el Ánima en pena caza a más tardar 60 s después de que la cordura promedio baja de su umbral; otra caza en cuanto ve a alguien solo. Cuándo y a quién caza es comportamiento, y por eso también es pista para nombrarla.

#### Altar y campeo

- El altar está en un cuarto al azar y no cambia en toda la noche.
- No hay medidor de vigilia. El campeo lo castiga la IA: al acechar, el ánima prefiere a quien está quieto y solo, así que esperar junto al altar es más peligroso que investigar.

#### Escondites

- Siempre hay al menos un escondite a menos de unos 12 m de cualquier cuarto. La dificultad cambia qué tan seguros son, no cuántos hay.
- Dentro del ropero se mira por una rendija. La rendija no delata a quien se esconde; la linterna encendida sí: si te escondes con ella prendida, el ánima te encuentra y te mata.

### 2.9 Terror analógico: catálogo (18 de noviembre)

**Regla:** los aparatos no mienten; tus ojos y tus compañeros sí. Nada de esto cambia una lectura ni da una evidencia falsa. La sensación de «da cosa» nace de no saber si hay amenaza (McAndrew y Koehnke, 2016), así que cada efecto es impredecible y no se anuncia.

| Efecto | Quién lo provoca | Cómo funciona |
| --- | --- | --- |
| Posesión (P) | Ánima, a 6 m | Mueve el cuerpo de alguien unos 16 s: camina de espaldas, se detiene, avienta lo que hay en el cuarto. La única señal es que **no proyecta sombra**. Si poseen a quien juega, solo ve cómo lo mueven; si **reza** (pulsa una secuencia de 7 teclas), la saca antes. |
| Doble | Ánima (J) y la casa | Un compañero que no está, **idéntico**. Se queda quieto, se aleja, se acerca o copia tus movimientos; desaparece al mirarlo, al acercarte o cuando dejas de verlo. 1 de cada 10 veces es un doble deforme: brazos largos, colores invertidos o brillante. |
| Anomalía (Y) | Ánima, donde nadie mira | Aparece algo que no estaba (una muñeca, una calavera de azúcar, una foto, una silla), un objeto queda flotando, un cuadro se voltea o una puerta cambia. Si alguien la ve, la hace en otro lado. Notarla quita un poco de cordura. |
| Mensajes en los aparatos | La casa | La pantalla dice «NO VOLTEES», «DETRÁS DE TI» o «3:33». Si das la vuelta, aparece el ánima gigante con una falla de imagen. |
| Romper el estilo | Ánima al manifestarse | En un mundo mate, el ánima se ve brillante y lisa un instante. |
| Sonido | La casa | El ambiente se corta y luego: el eco de una frase de un compañero, un grito de lotería o un rezo al revés. |
| Sistema falso | La casa | «⚠ Rafael se desconectó» mientras su cuerpo sigue ahí. |
| Reloj | La casa | La hora salta a 3:33 a. m. unos segundos. |

**Dosis:** desde el 18 de noviembre, el ritmo lo lleva la casona con su dado (§2.11). Nunca hay terror durante una cacería. El disfrute crece con el miedo solo hasta un punto (Andersen y otros, 2020).

### 2.10 Habilidades del ánima (18 de noviembre)

**Regla de balance: lo más fuerte tiene más probabilidad de dejar pista.** Cada habilidad sirve para una de cinco cosas: **alimentar** (quitar cordura y comer), **engañar** (comprar tiempo o separar), **preparar** (dejar a alguien vulnerable), **proteger** (alejar a la gente de su guarida) o **cazar**. La pista siempre es real: los aparatos nunca mienten.

**Fuera:** imitar voces. El juego tiene chat de voz por proximidad, y las voces son de las personas.

#### Kit base: todas las ánimas, siempre

| Habilidad | Para qué le sirve | Espera | Pista (probabilidad) |
| --- | --- | --- | --- |
| Escalofrío | Alimentar poco: −3 de cordura a quien está a 4 m o menos | 15 s | 10 %: el termómetro marca frío un instante |
| Lamento | Alimentar poco: −2 a quien lo oye a 8 m o menos. Audio genérico de su género (§2.12) | 12 s | 100 %: se oye si es voz de hombre o de mujer |
| Aventar objeto | Alimentar poco (−5 a quien lo ve); el ruido atrae a la gente adonde ella quiere | 20 s | 30 %: huella UV en el objeto |
| Apagar foco | Preparar: a oscuras la cordura baja más rápido | 25 s | 20 %: EMF 2 en el apagador |
| Portazo de viento | Proteger y engañar: hace creer que se fue a otro lado | 30 s | 40 %: huella UV en la puerta |
| Manifestación | Alimentar mucho: −10 a −15 a quien la ve | 90 s | 100 %: la vieron |
| Mudanza | Proteger: cambia de guarida, 0 a 2 veces por noche según el ánima | — | 100 %: el rastro viejo sigue tibio |
| Cacería | Cazar. Es obligatoria (§2.8) | según el ánima | 100 % |

#### Habilidades que solo tienen algunas ánimas

Cada una la tienen unas 6 ánimas; quién tiene cuál está en §6.9. El doble, el señuelo, el eco y la anomalía **ya no son del ánima: son de la casona** (§2.11).

| Habilidad | Para qué le sirve | Espera | Pista |
| --- | --- | --- | --- |
| Posesión | Alimentar continuo y crear caos | 180 s | 100 %: el poseído no tiene sombra |
| Apagón | Preparar: toda la planta a oscuras; alguien tiene que ir solo a los fusibles | 150 s | 60 %: EMF 3 en la caja |
| Huellas descalzas | Preparar: huellas que avanzan hacia alguien que está solo (−4) | 60 s | 100 %: las huellas UV quedan |
| Interferencia | Proteger su guarida mientras la estudian | 60 s | 30 %: estática en la grabadora |
| Llevarse | Mover a la gente: toma un objeto o herramienta que nadie está viendo y lo deja **cerca** (mismo cuarto o el de al lado), a **media** distancia (mismo piso) o **lejos** (otro piso), según el ánima | 45 s | 30 %: huella UV en el objeto |

Regla de oro del lote: **a cada ánima se le reconoce solo por comportamiento**, nunca por algo visual. Solo las herramientas muestran evidencias.

#### Límite de luces

La instalación de la casona es vieja: **aguanta pocos focos encendidos a la vez** (fácil 5, normal 4, difícil 3). Si se enciende uno de más, se botan los fusibles y se apaga toda la casa. Al acercarse al límite, los focos encendidos parpadean.

Por qué funciona:

- Los investigadores administran la luz como un recurso.
- La oscuridad ayuda al ánima.
- La grabadora necesita oscuridad, así que la decisión de apagar tiene dos filos.

### 2.11 La casona, el otro ente (18 de noviembre)

La casona **siempre la controla un bot**, aparte del ánima. Así el ánima no carga sola con todo el terror ni se siente que juega sola. La casona no da evidencias ni hace daño directo: solo asusta y, a veces, delata a su huésped.

**El dado (1d100):** cada 60 s tira 1d100, con +10 si la cordura promedio está bajo 50. Durante una cacería no tira. Los marcados con ⭐ solo pasan una vez por noche; si se repiten, cuentan como ambiente. Cerca del 60 % de las tiradas trae algo: unos 9 sucesos en una noche de 15 minutos.

| 1d100 | Suceso (v1.6) |
| --- | --- |
| 1–38 | Nada. El silencio también da miedo |
| 39–44 | **Ambiente:** veladora que se apaga, olor a cempasúchil, campanadas, perro que aúlla, mecedora, lluvia dentro de un cuarto, niño jugando afuera o camino de pétalos |
| 45–50 | **Canicas o pasos** en el piso de arriba o en el techo |
| 51–57 | **Anomalía:** aparece aunque no haya nadie, en la guarida (50 %) o en cualquier cuarto donde nadie mire. Una vez vista, 1 de cada 10 se esfuma 8–20 s después, cuando nadie la mira |
| 58–61 | **Una puerta se cierra sola** |
| 62–64 | **Eco:** una frase robada del chat de voz (§2.12), desde otro cuarto |
| 65–67 | **Sombra sin dueño** en la pared (modelo invisible) |
| 68–71 | **Tocan el zaguán**, desesperados; se oye en toda la casa. Solo si nadie vivo está afuera y nadie está a menos de 16 m del zaguán: obliga a dispersarse. Detrás: nadie, una pista (verdad o mentira), una niña con veladora o tu doble |
| 72–73 | **Suena el teléfono** más cercano a la guarida y repite una frase grabada |
| 74–75 | **TV: noticiero** con reportera y recuadro de DESAPARECIDO; termina con ojos que siguen 5 s |
| 76 | **TV: cámara de vigilancia** invisible que los muestra ahora mismo |
| 77 | **TV: barras de color a las 3:33**; duran más y se pueden apagar |
| 78–79 | **Radio:** estática con grabaciones de los jugadores y lista de desaparecidos |
| 80–81 | **Silueta de un cadáver** con la ropa de uno de ustedes |
| 82–83 | **Doble:** un compañero idéntico que no existe; 1 de cada 10, deforme |
| 84–85 | **Alguien rezando** de rodillas con veladora, en el cuarto de junto, a la vista por la puerta; 40 s |
| 86–87 | **El retrato del cuarto cambia:** aparece uno de ustedes |
| 88–89 | **El clima falla:** relámpago blanco o la lluvia cambia (nunca cielo rojo) |
| 90–91 | **«Reconectando…»:** la imagen se congela 2 s mientras se oyen pasos |
| 92–94 | **Eco inmediato:** espera hasta 90 s a que hables y repite tu frase, entrecortada, en cuanto te callas |
| 95 | ⭐ **En la ofrenda aparece la foto** de uno de ustedes |
| 96–97 | ⭐ **El cuarto se repite (bucle):** solo en cuartos con 2 salidas o más. Si sales por otra puerta, vuelves a entrar por la original; 1 o 2 veces. Sales si regresas por donde entraste o cruzas el cuarto repetido |
| 98 | **Señuelo:** la silueta del ánima al fondo; se esfuma al acercarte (muy raro) |
| 99 | **Doble quieto (estatua)** de un compañero; grita si lo tocas (muy raro) |
| 100 | ⭐ **La casona elige** el suceso que más le falta a esta noche |

**Reglas del dado (v1.6):** si el suceso no puede hacerse, no pasa nada: la casona se queda en silencio, ya no vuelve a tirar. No repite un suceso de las últimas 2 tiradas; los ⭐ salen una vez por noche. Solo vuelve a tirar si el suceso pasó y nadie lo notó en 5 s. Teléfono, teles y radio usan el aparato más cercano a la guarida. Medido en 88 noches: unos 4,2 sucesos por noche, el primero hacia los 110 s. Quitados por desagradables: la sombra que se retrasa, la serenata y cualquier estática o luz roja.

**Pendiente:** reflejos (espejos y ventanas que reflejan) para que tu reflejo pueda no seguirte un instante.

**El tecolote:** cuando empieza la obligación de cazar, la casona tira 1d6; con 6 canta el tecolote, lejos. Es raro (1 de cada 6) y nunca miente: si canta, viene una cacería. «Cuando el tecolote canta, el indio muere.»

**Prueba de leyenda (1 entre 64):** cada vez que alguien graba con la grabadora o contesta el teléfono, hay 1 probabilidad entre 64 de oír la firma del ánima. Por ejemplo, el grito de La Llorona. Es una prueba definitiva, pero rara: con unas 12 grabaciones y llamadas por noche, sale en 1 de cada 6 noches (1 − (63/64)¹² ≈ 17 %). Las demás ánimas tendrán su propia firma.

**El ánima limita a la casona:** cada tipo de ánima le prohíbe 1 o 2 sucesos (la casona le teme). Si ese suceso sale, se cuenta como nada. Es otra pista, sutil. Se definirá en los perfiles de cada ánima.

**Voz grabada:** el teléfono usa las frases cortas que guarda el reconocimiento de voz (§2.12).

### 2.12 Voz: chat por cercanía y frases robadas (18 de noviembre)

**Chat de voz por cercanía.** Se oye más fuerte a quien está más cerca, hasta unos 15 m, y los muros lo apagan. Quien muere solo habla con los muertos.

**Frases robadas.** Un reconocimiento de voz que corre en el equipo de cada jugador busca solo frases cortas, de 3 s o menos:

- Nombres de los jugadores.
- Pedir ayuda: «¡ayuda!», «¡auxilio!».
- Llamar a alguien: «ven», «¿dónde estás?», «aquí».
- Avisos: «¡corre!», «¡está aquí!».
- Preguntas a la grabadora: «¿estás aquí?».

Guarda como máximo 5 frases por jugador, solo en memoria: la más vieja se borra y todo se borra al cerrar la sesión. Lo usan el Eco del ánima, el teléfono de la casona, el sello de Matlacíhuatl (dice el nombre de quien anda solo) y el efecto de sonido de §2.9.

**Consentimiento.** Al empezar se pide permiso para el micrófono, se explica que las frases no salen del equipo ni se guardan, y se puede desactivar. Sin micrófono, el juego usa voces genéricas. Si juegan menores de edad, hace falta el permiso de sus tutores.

**Técnica:**

- El chat necesita multijugador: WebRTC y un servidor que conecte a los jugadores.
- El reconocimiento debe correr en el dispositivo, con un modelo pequeño en español (por ejemplo, Vosk).
- Hay que evitar servicios que manden el audio a la nube.
- En la demo con bots, la voz que se roba es la tuya.

**Voz de las ánimas.** Solo hay dos bancos de audio genérico, de **hombre** y de **mujer**: lamentos, sollozos, risas malvadas, respiraciones y gemidos. Oír la voz dice el género del ánima, y nada más. Las únicas voces propias son:

- **El llanto de La Llorona**, con regla invertida: **si se oye lejos, está cerca; si se oye fuerte, está lejos.** A 4 m casi no se oye; a 20 m o más suena a todo volumen.
- Las firmas de 1 entre 64 (§6.7), raras a propósito.

### 2.13 Dinero, fotos y la tragamonedas de la noche (18 de noviembre)

El juego es medio roguelite: el dinero se acumula entre noches y sirve para cambiar la suerte al inicio de cada una, nunca para deducir mejor.

#### La tragamonedas

Al inicio de cada noche gira una tragamonedas de **3 carretes**. Cada carrete da una modificación:

| Carrete | Qué decide | Ejemplos |
| --- | --- | --- |
| 1. La casa | Los objetos de la casa (la ruleta de objetos, §2.8) | Radio, cámara instantánea extra, más veladoras, menos focos de repuesto |
| 2. La noche | Una condición de la casona | Tormenta (más ruido, menos oído del ánima), luna llena (más cacerías), niebla en el patio, instalación más vieja (un foco menos de límite) |
| 3. El trato | Una bendición o una maldición para el grupo | +1 rollo de fotos, empezar con un Copal, cordura inicial −10, el ánima empieza con más hambre |

**Volver a tirar** cuesta dinero y sube cada vez:

- Girar los 3 carretes de nuevo: $30 la primera vez, $60 la segunda, $120 la tercera.
- Girar un solo carrete: $20.

Lo que salga en el último giro se juega. Las maldiciones del carrete 3 pagan más al final de la noche (×1,2), así que a veces conviene aceptarlas.

#### El rollo de fotos

Cada investigador lleva una **cámara instantánea** con un **rollo de 6 fotos**. No es una de las 7 herramientas de evidencia: sirve para ganar dinero. La cámara nunca miente.

| Lo que captura | Paga |
| --- | --- |
| El ánima manifestada | $30 |
| El ánima cazando (si sobrevives) | $40 |
| Un poseído sin sombra | $25 |
| Una huella UV | $10 |
| Un objeto moviéndose o llevándoselo el ánima | $10 |
| Un suceso de la casona (doble, señuelo, anomalía, sombra sin dueño…) | $15 |

Una foto paga más si el objetivo está cerca y al centro (de 1 a 3 estrellas: ×1, ×1,5, ×2). **1 de cada 20 fotos sale maldita:** al revelarse aparece una sombra al fondo. Paga $15 y quita 5 de cordura a quien la mira.

#### Dinero al terminar la noche

| Concepto | Paga |
| --- | --- |
| Cada evidencia confirmada | $20 |
| Cada objetivo de la noche cumplido (3 al azar) | $25 |
| Sobrevivir | $15 |
| Fotos | Según la tabla |
| Nombrar bien | Multiplica todo: ×1 con 0 o 1 evidencia, ×1,5 con 2, ×2 con 3 |
| Nombrar mal | ×0,5 |
| Dificultad | Fácil ×0,75, normal ×1, difícil ×1,5 |

Quien muere conserva lo que ganó hasta ese momento. El dinero es del grupo en el modo en equipo.

#### En qué se gasta

- Volver a girar la tragamonedas.
- Consumibles: veladora $10, foco de repuesto $10, rollo de 6 fotos $15, Copal $25.

Las 7 herramientas son siempre las mismas: el dinero nunca compra ventaja en la deducción.

### 2.14 Decisiones para la versión en línea (18 de noviembre)

**Investigadores:**

- **Jugadores:** hasta 4 investigadores y 1 ánima. Por ahora el ánima siempre es bot; el control humano se programa, pero no se prueba todavía.
- **Cordura:** cada quien solo ve la suya.
- **Equipo:** 3 herramientas por persona. La linterna viene incluida. La cámara instantánea ocupa un lugar, para que alguien tome el papel del fotógrafo.
- **Libreta individual:** se ven las marcas y tachas de los demás, cada quien en su color.
- **Nombrar al ánima:** cualquiera puede hacerlo por su cuenta, aunque los demás no estén de acuerdo. El altar se revisa.
- **Correr cansa.**

**Muerte:**

- **El muerto es espíritu** y pasa a tercera persona con su modelo fantasmal.
- **Qué percibe:** casi nada; solo evidencias visuales.
- **Con quién habla:** con los muertos, y con el ánima si la juega una persona.
- **Puede ponerse frente al ánima:** ella lo atraviesa, pero frena un poco. Desde fuera no se sabe si fue un espíritu o un rasgo del ánima.

**Cacería:**

- **Aviso:** parpadean y se ven rojos solo los focos encendidos; lo demás queda a oscuras y los aparatos dan estática.
- **Puertas:** solo se traba la salida; las demás se quedan como estaban.
- **Qué percibe el ánima:** oye la voz, ve la linterna encendida y percibe los aparatos.
- **Esconderse con todo apagado salva siempre.** Si no apagas a tiempo, te encuentra.
- **El Rosario tiene 2 usos.**
- **Muerte instantánea.** Tiempo de gracia: 4 s en fácil, 3 s en normal, 2 s en difícil y 1 s en pesadilla.
- **Cuándo caza:** en cualquier momento, según la cordura.

**En línea y voz:**

- **Salas con código.**
- **Desconexión:** quien se desconecta desaparece y suelta todos sus objetos.
- **Voz por cercanía:** unos 15 m; atraviesa una pared con menos volumen.
- **Radio:** se mantiene pulsado un botón para hablar por radio; al soltarlo se vuelve a hablar normal.
- **Sin micrófono, no se escucha.**

**Balance:**

- **Noche de unos 10 minutos.**
- **El ánima humana gana cerca del 50 %.**
- **Una muerte por noche en promedio.**

**Error que corregir:** el espíritu se queda en una pose extraña y no gira con la cámara.

**Cómo termina la noche (sin altar ni acusación):**

- **Cada quien marca en su libreta** el ánima que cree que es. Durante la noche no se revela si acertó.
- **Para terminar, salen por el zaguán.** Quien sale ya no vuelve a entrar. La noche termina cuando todos los vivos salieron o murieron.
- **El resultado se revela afuera:** cada quien sabe si acertó, y el pago es por persona. Así nadie puede apostar para que los demás se enteren.
- **Si llega el alba con gente adentro, empieza la Hora del ánima (90 s):**
  - La salida se traba.
  - El ánima pierde sus restricciones: caza sin esperar, va más rápido y no hay tiempo de gracia.
  - Esconderse ya no es seguro: funciona la mitad de las veces.
  - Si alguien sobrevive, al salir el sol la puerta se abre y puede salir.
- **El ánima gana** si nadie que salió vivo acertó.

## 3. Bucles de juego

Los dos bandos repiten un bucle de 30 a 60 segundos que se cruza en un punto: para ganar, ambos tienen que acercarse al otro.

&#91;embedded content: bucle momento a momento · investigador y ánima\]

El investigador necesita estar a 4 m del ánima para leer; el ánima necesita acercarse para quitar cordura y cazar. Quien calcula mejor cuándo acercarse y cuándo retirarse, gana.

### 3.1 La partida (unos 15 min)

1. **Preparación (30 s):** cada quien elige rol; se sortean el ánima, su cuarto y los escondites activos; los investigadores entran por el Zaguán.
2. **Exploración (min 0–4):** encontrar el cuarto del ánima por sus velas azules, en cualquiera de los dos pisos, y juntar objetos.
3. **Investigación (min 4–11):** lecturas, sellos y las primeras cacerías. Se observa cómo ve, oye y persigue el ánima.
4. **Nombrar (min 11–14):** con 2 pruebas, alguien la nombra en el altar de la Capilla.
5. **Huida (hasta 90 s):** si acertaron, todos corren al Zaguán mientras el ánima usa su Espanto.
6. **Alba (min 15):** si nadie la nombró, última oportunidad con 1 prueba y una huida con el ánima debilitada.

### 3.2 La sesión

*Una tarde en la casona*, del juego de mesa: se juegan tantas noches como jugadores y el papel de ánima rota. Se cuentan almas: 2 por acusar bien, 1 por cada investigador al ganar como ánima. Gana la tarde quien junte más.

### 3.3 Progresión

Sin mejoras de estadísticas, para no romper el equilibrio:

- **Libro de leyendas:** al identificar a un ánima por primera vez se desbloquea su ficha (leyenda, sello y Espanto).
- **Cosméticos de papel:** linternas, rebozos y colores de papel picado.
- **Casas nuevas:** después de la v1.

### 3.4 Campaña: restaurar la casona (roguelite)

La casona empieza casi toda tapiada. Cada noche el equipo gana **veladoras** y con ellas **restaura un cuarto**; cada cuarto abierto agrega un **complemento** acorde a ese cuarto y una guarida posible más. La meta: restaurarla completa y ganar la **Noche grande** para liberarla. Es un *roguelite*: cada noche empieza de cero, pero la casona se queda como la dejaron.

**Lo que nunca cambia:** las 7 herramientas base siempre están en la camioneta, desde la primera noche. Restaurar no da poder: da opciones (consumibles, objetos malditos, rutas) y, a la vez, una casa más grande y más difícil de investigar.

El bucle entre noches (unos 13 min cada vuelta):

1. **Noche** (10 min): investigar, apostar, salir.
2. **Recuento** (30 s): se reparten las veladoras de la noche, ganen o pierdan.
3. **Restauración** (1 min): la casona ofrece 3 cuartos tapiados; el equipo escoge uno y lo paga, o ahorra.
4. **Lo nuevo**: una tarjeta muestra el complemento ganado y avisa qué ánima prefiere ese cuarto.
5. Vuelta a la noche, ahora con más casa.

**Por qué funciona:**

- Enseña de a poco: las primeras noches tienen 5 cuartos y pocos objetos; cada cosa nueva llega sola y con su tarjeta.
- La dificultad sube sola: con 5 cuartos la guarida se encuentra en menos de 1 min; con 22, los bots tardan unos 2 min (medido en v1.6).
- Perder también avanza: una mala noche da 1 a 3 veladoras, nunca cero.

#### Elegir el cuarto: 3 al azar, el equipo escoge

Ni todo al azar ni todo a elección: la casona saca **3 cuartos tapiados que tengan puerta con lo ya abierto** y el equipo escoge uno. Así cada campaña se arma distinta, pero la decisión es del equipo.

| Opción | A favor | En contra |
| --- | --- | --- |
| Todo al azar | Sorpresa; nada que discutir | Sin decisión: el avance se siente regalado |
| Escoger de todos | Control total | Siempre se abre lo mismo; todas las campañas iguales |
| **3 al azar, escoger 1** | Decisión con variedad; obliga a sacrificar algo | Un minuto de discusión entre noches |

- **Votación:** cada jugador vota una tarjeta; empate lo rompe el anfitrión. Jugando solo, escoges tú.
- **La tarjeta muestra** costo, complemento y el ícono del ánima que prefiere ese cuarto. Abrirlo hace más probable que esa ánima viva ahí: es parte de la decisión.
- **Ahorrar** está permitido: no abrir nada y guardar veladoras para un cuarto caro.
- **La escalera** es especial: siempre aparece como 4.ª opción desde que se abren 3 cuartos de la planta baja, y es la única puerta a la planta alta.

#### Qué da cada cuarto

Cada ánima tiene un **cuarto favorito**, pero no es una ley: si su favorito está abierto, hay **40 %** de que su guarida esté ahí; si no, vive en cualquier cuarto abierto. Las 22 ánimas pueden salir desde la primera noche.

**Abiertos desde el inicio:** Zaguán, Patio, Corredor y 5 cuartos: Comedor, Cocina, Despacho, Portería y Despensa seca.

| Cuarto | Piso | Complemento al restaurarlo | Tipo | Ánima favorita |
| --- | --- | --- | --- | --- |
| Comedor | PB | (abierto) | — | Ánima en pena |
| Cocina | PB | (abierto) | — | Chaneque |
| Despacho | PB | (abierto) | — | Charro Negro |
| Portería | PB | (abierto) | — | Aparecido |
| Despensa seca | PB | (abierto) | — | El Cucuy |
| Capilla | PB | Rosario y cruz de palma | Protección | Demonio |
| Botica | PB | Copal, ruda y limpia con huevo | Protección | El Mal Aire |
| Repostería | PB | Pan de muerto (atrae al ánima) | Apoyo | Nahual |
| Cuarto de aperos | PB | Focos de repuesto y +1 al límite de luces | Mapa | El Cadejo Negro |
| Planchaduría | PB | Armario escondite seguro | Mapa | La Planchada |
| Biblioteca | PB | Libro de leyendas: muestra el favorito de cada ánima | Información | Bruja |
| Traspatio | PB | Segunda salida para la huida | Mapa | — |
| Escalera principal | PB | Abre la planta alta (Rellano y Galería) | Mapa | — |
| Recámara de la abuela | PA | Té de tila | Apoyo | Guardián del Entierro |
| Cuarto de la nana | PA | Veladoras (luz sin fusibles) | Apoyo | Yohualtepuztli |
| Recámara principal | PA | Puño de ceniza | Apoyo | La Mulata de Córdoba |
| Recámara de la hija | PA | Cámara instantánea | Información | El Uay Chivo |
| Huéspedes | PA | Cama escondite y ruta por la galería | Mapa | Espíritu Chocarrero |
| Baño | PA | Espejo de plata | Maldito | La Llorona |
| Recámara de niños | PA | Tablilla espiritista | Maldito | Nachito |
| Sala de música | PA | Radio | Maldito | Xtabay |
| Costura | PA | Mano del mono | Maldito | Cihuateteo |
| Desván | PA | Muñeca de la isla | Maldito | Matlacíhuatl |
| Salón de estrado | PA | Tarot | Maldito | Tlahuelpuchi |
| Coro | PA | Pentagrama | Maldito | — |

Los **malditos** se quedan arriba a propósito: llegan cuando el equipo ya domina las herramientas y puede pagar su costo de cordura. El reparto de favoritos es una propuesta: cámbialo libremente.

#### Veladoras: ganar y gastar

Una buena noche da 6–9 veladoras y una mala 1–3; con cuartos de 3 a 6, la campaña completa dura **unas 19 noches (≈ 4 h)**: un cuarto por noche si se gana, uno cada dos si se pierde.

| Al terminar la noche | Veladoras |
| --- | --- |
| Por jugar la noche | 1 |
| Cada prueba correcta anotada en la libreta | 1 (máx. 3) |
| Alguien que salió vivo apostó por el ánima correcta | 3 |
| Salieron todos vivos / al menos la mitad | 2 / 1 |

| Cuartos restaurados (en orden de compra) | Costo cada uno |
| --- | --- |
| 1.º al 5.º | 3 |
| 6.º al 10.º | 4 |
| 11.º al 15.º | 5 |
| 16.º al 20.º | 6 |

Cuenta: 20 cuartos cuestan 90 veladoras; con los bots de v1.6 (≈ 50 % de aciertos) se ganan unas 4,75 por noche, así que 90 / 4,75 ≈ 19 noches. Las pruebas cuentan solo si están bien anotadas: así la libreta manual tiene valor.

#### El final: la Noche grande

Con los 20 cuartos restaurados se abre la **Noche grande**: 15 min, dificultad pesadilla, con un ánima que el equipo nunca haya identificado en la campaña. Si la nombran y salen, la casona queda liberada: créditos y modo libre con la casa completa. Si pierden, se repite la Noche grande; la casona no se pierde.

Opción de **modo duro**: si mueren todos en una noche, un cuarto abierto al azar se vuelve a tapiar (con su complemento).

#### Para quien rehace el mapa

- Diseñar por **alas**: cada cuarto debe poder tapiarse con una puerta de tablas sin romper el paso a los demás; el Corredor, el Patio y el Zaguán conectan todo lo inicial.
- Un cuarto tapiado no existe para el juego: no es guarida, no tiene escondites ni aparatos, la casona no hace sucesos ahí y los bots no lo exploran.
- Guardar la campaña en el navegador del anfitrión: cuartos abiertos, veladoras y ánimas identificadas. En línea manda la casona del anfitrión.
- El menú ofrece **Campaña** y **Noche libre** (casa completa, como hoy).

## 4. Roles

Hay dos bandos con objetivos opuestos y verbos distintos: los investigadores buscan y huyen; el ánima acecha y encierra.

### 4.1 Investigadores

**Ganan** si nombran al ánima correcta y escapa por el Zaguán al menos la mitad de quienes estaban vivos al nombrarla (mínimo 1).

**Pierden** si la nombran mal, si mueren todos, si no escapan suficientes o si llega el Alba sin nombrarla.

| Verbo | Qué hace | Costo o riesgo |
| --- | --- | --- |
| Moverse / correr | Recorre los dos pisos; correr dura 4 s | Correr y las escaleras hacen ruido |
| Usar herramienta | Sostiene o deja una de las 7 herramientas donde hay rastro; cada lectura tarda y puede fallar (§5.3) | Hay que ir a donde pasa el ánima; las electrónicas encendidas te delatan escondido |
| Dejar | Pone un objeto en el piso: una herramienta queda vigilando ese lugar, una veladora alumbra, un Rosario o una Ruda cuelgan de una puerta | Ocupa ranura menos, pero el ánima puede moverlo |
| Pasar / aventar | Lanza un objeto hasta 8 m: a un compañero, como Copal a distancia o como señuelo | Hace ruido que el ánima oye |
| Usar objeto | Té, Rosario, Copal (§5.8) | Se gastan |
| Encender o apagar la luz | Cambia la luz del cuarto | La oscuridad quita cordura |
| Tomar objeto | Del maletín o de la casa (4 ranuras) | Tiempo y desvíos |
| Esconderse | Entra a un escondite activo | No puede investigar; pierde cordura si hay cacería |
| Anotar en la libreta | Marca a mano evidencias, lecturas dudosas y sellos; nadie avisa si acertaste | Si marcas mal, nombras mal |
| Nombrar | Ritual de 6 s en el altar de la Capilla, con las pruebas que el equipo quiera arriesgar (§5.10) | Si falla, gana el ánima; si acierta, empieza la huida |
| Huir | Correr al Zaguán durante la huida | El ánima usa su Espanto |

### 4.2 Ánima

**Gana** si mueren todos, si la nombran mal, si llega el Alba sin que la nombren o si en la huida escapa menos de la mitad.

**Pierde** si la nombran bien y escapan suficientes investigadores.

| Verbo | Qué hace | Límite |
| --- | --- | --- |
| Deambular | Se mueve por la casa y sube o baja por las escaleras | Su presencia baja siempre; tiene que alimentarse de cordura |
| Fenómenos | Escalofrío, apagar la luz, portazo, mover un objeto del cuarto, susurro, interferencia | Espera por fenómeno; cada perfil los usa más, menos o nunca |
| Habilidad propia | Una por ánima (el Ánima en pena no tiene) | Espera larga |
| Cazar | Persigue y mata a quien alcance | Solo cuando se cumple su regla de cacería |
| Volver a la guarida | Recarga presencia despacio (1 por segundo) | Deja rastro doble: ahí las herramientas la leen mejor |
| Espanto | Un ataque único durante la huida | Solo después de que la nombran |

**Restricciones del ánima** (iguales para persona y bot; las aplica el motor):

1. **Perfil fijo.** Su visión, oído, velocidad y fenómenos permitidos no se pueden cambiar.
2. **Hambre.** Pierde 1 de presencia por segundo en cualquier lugar (1,5 cazando); cada punto de cordura que quita le devuelve 1.
3. **Se desvanece.** Si la presencia llega a 0, se manifiesta sin querer 3 s donde está (se ve y suena su sello) y queda 20 s inmóvil en su guarida, sin poder cazar.
4. **Guarida.** Se sortea al empezar, en cualquiera de los dos pisos; solo cambia con Mudanza (2 veces por noche).
5. **Sellos obligatorios.** Su sello aparece por reglas, no por decisión del jugador.

### 4.3 El ánima como poder (rediseño del 17 de noviembre)

En la primera prueba con persona, jugar de ánima se sintió como una pista de obstáculos: lenta, encerrada por puertas, sin forma de engañar y acorralada por pruebas. El rediseño busca que el ánima **domine la casa fuera de las cacerías y sea vulnerable solo cuando ataca**.

| Cambio | Qué hace | Por qué |
| --- | --- | --- |
| Atraviesa muros | Fuera de cacería pasa por muros, muebles, techo y piso; en cacería vuelve a usar puertas y escaleras | Se siente espíritu, no persona; las cacerías siguen siendo justas |
| Interferencia (G) | Hace fallar los aparatos a 6 m con lecturas dudosas (EMF 4, temperatura que salta); nunca produce un positivo | Sustituye al Sigilo: sus acciones ya no dan evidencia, así que su engaño es ensuciar las lecturas |
| Imitar voz (V) | Habla con la voz de un investigador que está lejos («¡Vengan, aquí!») para atraer a los demás | Engaño sin pruebas falsas: las herramientas fallan pero no mienten; las voces sí |
| Apagón (N) | Apaga toda la planta y hace fallar las linternas 4 s; 6 de presencia, cada 60 s | Un golpe de poder que se siente |
| Mudanza (M) | Cambia su guarida al cuarto donde está, 2 veces por noche; el rastro viejo se enfría en unos 2 min | Castiga que el equipo acampe en un cuarto |
| Sin velas azules | La guarida ya no se revela al entrar; se deduce por el frío, los ruidos y las lecturas | Encontrarlo era demasiado fácil |
| Ritual al nombrar | Nombrar tarda 6 s sin moverse del altar; el ánima recibe aviso y lo rompe si se acerca a 1,6 m o le quita 8 de cordura a quien nombra | La acusación era instantánea; ahora el clímax es una pelea en la Capilla |
| Retroalimentación | Cada fenómeno le dice al jugador del ánima a quién afectó y cuánto; los investigadores nunca reciben avisos | Saber qué hace cada cosa |

**Ahora el ánima solo mata en cacería**, al tocar a alguien expuesto. La condición de cacería de cada ánima se ve en su panel (por ejemplo, «cordura promedio 62 ≤ 50») para que el jugador sepa a qué aspirar.

**Equilibrio con bots** (15 noches por ánima, 3 investigadores, medido antes del núcleo v2): el ánima gana 39 % y las partidas duran 7–14 min. Hay que volver a simular con el rastro y el hambre.

## 5. Sistemas

Los sistemas giran en torno a dos recursos que se gastan: la **cordura** de los investigadores y la **presencia** del ánima. Los valores son los del Ánima en pena; cada perfil cambia algunos (§6), y la tabla del apéndice los reúne para ajustarlos.

### 5.1 Cordura (investigadores)

Empieza en 100 y no sube de 100. A 0 sigues vivo, pero no puedes usar herramientas.

| Fuente | Efecto |
| --- | --- |
| Cuarto a oscuras | −0,12 por segundo (corredor y galería: −0,05) |
| Ánima a 3 m o menos | −0,4 por segundo |
| Escalofrío | −10 a quien esté a 4 m o menos; lo oye como un aliento en la nuca |
| Usar una herramienta | Sin costo de cordura: el riesgo es acercarse a colocarla |
| Cuarto del ánima con ella dentro | −0,25 por segundo |
| Escondido durante una cacería | −0,3 por segundo |
| Té de tila | +25 |

Lo que quita el ánima se multiplica por la **fuerza de la mesa** (×0,2 con 1 investigador, ×1,1 con 2, ×2,4 con 3, ×3,4 con 4). Estos valores vienen del v0.1 y hay que volver a medirlos con la cacería por cordura del grupo.

Bajo 50 de cordura, el borde de la pantalla se oscurece, el sonido se atenúa y aparecen voces que no son pistas.

### 5.2 Luz

Cada cuarto tiene un apagador junto a su puerta. La luz protege la cordura y deja ver al ánima de reojo. Algunas ánimas apagan luces más seguido (el Cucuy), otras nunca (Nachito, que además las enciende). El patio siempre tiene luz de luna. La linterna de cada investigador es un cono de 5 m con sombras.

### 5.3 Herramientas y evidencias

Las herramientas **leen el rastro y la cercanía del ánima, no sus acciones** (§2.7). Cada ánima deja 3 de las 7 evidencias. Cada lectura tarda, puede fallar o salir dudosa, y solo la ve quien sostiene la herramienta o se acerca a mirarla. No cuestan cordura: el riesgo es pasar tiempo en un cuarto donde el ánima tiene hambre.

| Herramienta | Evidencia | Cómo se usa | Cuándo da positivo (solo si tiene esa evidencia) | Lo que ve quien la usa | Electrónica |
| --- | --- | --- | --- | --- | --- |
| Termómetro | Bajo cero | En mano; quieto 8 s para que se asiente | En el punto frío de un cuarto con rastro de 60 o más | Una cifra que baja poco a poco y oscila ±1,5 °C | Sí |
| Grabadora | Susurros | En mano: preguntar en voz alta, con la luz apagada, a lo más 2 personas en el cuarto y el ánima a 8 m o menos | 30 % por pregunta | Estática y una voz que solo se oye a 3 m | Sí |
| Espejo de mano | Marcas en el espejo | Dejado en un cuarto | Rastro de 40 o más: 25 % por minuto de una mano en el vaho, que dura 30 s | La marca, al mirarlo de cerca | No |
| Lámpara UV | Huellas de ceniza | En mano, alumbrando puertas, apagadores y ventanas | Rastro de 30 o más: 35 % por superficie; cada una se revisa una vez cada 2 min | Huellas que brillan solo bajo la luz | Sí |
| Cámara | Silueta en cámara | Dejada grabando un cuarto (cono de 6 m) | Rastro de 50 o más: 25 % por minuto de un objeto que flota solo | La foto en su pantalla; hay que ir por ella | Sí |
| Detector EMF | EMF 5 | En mano o dejado | Con el ánima a 3 m: cada segundo, 20 % de nivel 5 | LEDs de 1 a 5 | Sí |
| Sensor de gases | Olor a azufre | Dejado | Si el ánima suma 5 s a 3 m: 50 % de aguja en rojo, que dura 30 s | La aguja | Sí |

- **Lecturas dudosas:** con cualquier ánima salen EMF 4, de 1 a 3 °C y estática con sílabas sueltas. Nunca hay un positivo falso.
- **Confirmar:** nadie recibe aviso. Quien ve el positivo lo marca en la libreta; la cámara guarda la foto para revisarla después. Los bots marcan solos.
- **Descartar:** tras unos 5 intentos fallidos en buenas condiciones, la probabilidad de que sí la tenga baja a cerca del 11 % (§2.7). El jugador decide si la tacha.
- **La guarida y el frío:** la guarida se enfría mientras el ánima descansa ahí y se entibia cuando sale a merodear. Sin la evidencia baja hasta unos 8 °C, nunca de 0.
- **Una de cada una:** el equipo tiene una sola herramienta de cada tipo.

#### Qué cuenta como prueba (v1.6)

| Prueba | Herramienta | SÍ cuenta | NO cuenta (pasa con cualquier ánima) |
| --- | --- | --- | --- |
| Bajo cero | Termómetro | Menos de 0 °C, quieto 8 s | 1–9 °C: solo dice que anda cerca |
| Susurros | Grabadora | Una palabra clara (a oscuras, 1–2 personas, ánima a menos de 6 m) | Estática o sílabas sueltas |
| Marcas en el espejo | Espejo de mano | Una mano marcada en el vaho; se ve hasta a 9 m si nada tapa la vista | Solo vaho |
| Huellas de ceniza | Lámpara UV | Huellas que brillan | Ceniza pisada sin brillo |
| Silueta en cámara | Cámara de video | La silueta vista en la tele de la base | Fotos; ver al ánima o un objeto moverse en persona |
| EMF 5 | Detector EMF | Solo el 5 | EMF 2–4; luces que parpadean |
| Olor a azufre | Sensor de gases | Aguja en rojo | Aguja en amarillo |

**La libreta la llenas tú.** Cuando un bot ve una prueba la dice en voz alta y la persona decide si la anota. Opción del menú *Libreta → Los bots anotan lo que ven* para que la marquen solos (incluidos sus errores, que borran al corregirse).

### 5.4 Sellos y fenómenos

- **Sello:** un comportamiento que solo un ánima produce. Presenciarlo cuenta como prueba; la libreta lo registra sola si ocurre a la vista de un investigador vivo.
- **Parecido:** cada sello tiene un fenómeno compartido que se le parece. Distinguirlos es habilidad del jugador.
- **Disparador obligatorio:** cada sello ocurre por reglas. Un ánima humana puede retrasarlo, pero no evitarlo.
- **Fenómenos compartidos:** Escalofrío, Apagar la luz, Portazo, Mover un objeto y Susurro. Cada perfil los usa con una frecuencia distinta, y algunos nunca (§6.1).

### 5.5 Percepción del ánima

El ánima no lo ve todo: solo percibe lo que su perfil le deja. En pantalla, quien no percibe es invisible para ella, y la última posición conocida se desvanece en 3 s.

| Sentido | Cómo funciona | Ánima en pena |
| --- | --- | --- |
| Visión cercana | Ve en todas direcciones; los muros tapan | 5 m |
| Visión lejana | Ve en un cono de 120° hacia donde mira; los muros tapan | 5 a 14 m |
| Oído | Oye pasos, carreras, objetos aventados, puertas y **voces** a través de muros; entre pisos, a la mitad de distancia | 12 m |
| Miedo | Ve la silueta de quien tiene 25 o menos de cordura, en todo el piso | Sí |
| Escondidos | No percibe a nadie dentro de un escondite… **salvo que tenga en la mano un aparato electrónico encendido** (linterna incluida): entonces lo percibe a 6 m y el aparato parpadea | Igual en todas |
| Espíritus | Oye a los investigadores muertos siempre, en cualquier parte | Igual en todas |

Un hueco entre la visión cercana y la lejana es un **punto ciego**: el ánima pierde a quien está a media distancia. Los investigadores perciben al ánima de reojo en su linterna (2,5 m), 1 s tras un Escalofrío, como parpadeo durante la cacería y por las velas azules de su cuarto.

### 5.6 Presencia y hambre del ánima

1. **Hambre:** pierde 1 de presencia por segundo en cualquier lugar (1,5 cazando).
2. **Alimentarse:** cada punto de cordura que quita le devuelve 1 de presencia.
3. **Descansar:** en su guarida el hambre se congela, pero deja rastro doble; el bot acumula inquietud y termina saliendo a comer.
4. **Se desvanece:** al llegar a 0 termina cualquier cacería, se manifiesta 3 s donde está (se ve y suena su sello) y queda 20 s inmóvil en su guarida. Solo puede usar Escalofrío.

El dilema: asustar la mantiene fuerte y lejos de casa; esconderse la obliga a volver a la guarida, donde el rastro la delata. Desvanecerse es la ventana de los investigadores.

### 5.7 Cacería

- **Cuándo:** cuando se cumple la regla de su perfil. La base: la **cordura promedio de los vivos** es 50 o menos. Además necesita 8 s de presencia y 25 s desde la cacería anterior.
- **Duración:** 20 s. Las luces parpadean en rojo, los aparatos electrónicos cercanos titilan y suena el latido.
- **Persecución:** empieza a 2,4 m/s, más lento que caminar (2,6). **Cada segundo que ve a alguien gana +0,15 m/s, hasta un tope de 4,0.** Si lo pierde de vista 3 s, vuelve a 2,4. Por eso el ánima siempre quiere tenerlos a la vista, y la defensa principal es romper la línea de vista.
- **Aliento:** el investigador tiene 100 de aliento. Correr (3,7 m/s) gasta 20 por segundo: unos 5 s de carrera. Se recupera 10 por segundo caminando y 25 quieto o escondido; con el aliento en 0 no puede volver a correr hasta tener 40. Tras unos 9 s viéndote, el ánima ya corre más que tú: o rompes la vista, o llegas a un escondite antes de cansarte.
- **Muerte:** a quien alcanza, lo mata, tenga la cordura que tenga. Si lleva un Rosario, se activa solo: el ánima titila y queda ciega 5 s, sin poder matar (§5.8).
- **Duelo:** con 1 investigador, el umbral baja 10 puntos.

### 5.8 Equipo

El equipo base son las **7 herramientas de prueba** (en un maletín en el Zaguán) y una linterna por persona. Todo lo demás **se encuentra en la casa**, en los lugares donde tendría sentido que estuviera: «ve a la Cocina a ver si hay ruda». Cada investigador carga **4 ranuras** más su linterna, y cualquier objeto se puede usar, dejar en el piso, pasar o aventar hasta 8 m.

#### Lo que se encuentra en la casa

| Objeto | Efecto | Dónde suele estar |
| --- | --- | --- |
| Té de tila | +25 de cordura | Cocina, Comedor, Despensa |
| **Rosario** | Lo activas con el ánima a 3 m o menos, o **se activa solo si te alcanza**: el ánima **titila y queda ciega 5 s**, sin poder matar, y su aceleración vuelve a cero. Colgado en una puerta, se activa la primera vez que el ánima la cruza cazando | Capilla, Oratorio, burós de las recámaras |
| Ruda | Colgada en el marco de una puerta, el ánima no puede cruzar esa puerta durante 40 s, ni cazando | Cocina, Despensa, macetas del Patio y la Azotehuela |
| Copal | Nube de humo de 3 m durante 6 s donde lo enciendes o donde cae al aventarlo: el ánima no puede entrar, y si ya estaba dentro queda paralizada 3 s | Capilla, Oratorio, Desván |
| Veladora | Dejada, alumbra 3 m durante 90 s y protege la cordura como un cuarto con luz. El ánima la puede apagar (Nachito nunca) | Altar de la Capilla, Oratorio, Comedor |

Cada partida coloca los objetos al azar entre sus lugares posibles. Siempre hay al menos uno de cada tipo en la casa.

#### Cuánto hay

| Objeto | Costo | 1 inv. | 2 inv. | 3 inv. | 4 inv. |
| --- | --- | --- | --- | --- | --- |
| Té de tila | 1 | 3 | 4 | 6 | 8 |
| Rosario | 3 | 1 | 2 | 3 | 4 |
| Ruda | 2 | 1 | 1 | 2 | 2 |
| Copal | 2 | 1 | 2 | 2 | 3 |
| Veladora | 1 | 2 | 3 | 4 | 4 |
| **Total de puntos** |  | **12** | **19** | **27** | **34** |
| Ranuras del equipo |  | 4 | 8 | 12 | 16 |

Por qué estos números (punto de partida, a medir con el simulador):

- **Un Rosario por persona.** Cada quien sobrevive una vez a que lo alcancen, si lo encontró a tiempo.
- **Dos tés por persona, aproximadamente.** Un investigador pierde unos 6 a 10 puntos de cordura por minuto; dos tés le compran unos 5 minutos lejos del umbral de cacería.
- **Ruda y Copal son escasos y tácticos:** cierran una puerta o un pasillo, sobre todo en la huida.
- **Las ranuras obligan a elegir:** 7 herramientas no caben en las manos de una mesa chica; hay que dejarlas colocadas o volver al Zaguán.

#### Ajustes de la partida

- **Preajustes:** Escaso (60 % de los puntos), Normal y Abundante (150 %). El ánima se ajusta sola: ×1,15 de fuerza con Escaso y ×0,85 con Abundante (por medir).
- **Personalizado:** se elige la cantidad de cada objeto. Fuera del presupuesto la partida se marca como «libre» y no cuenta para estadísticas.
- **El simulador** muestra la victoria estimada del ánima con el equipo elegido.

#### El ánima y el equipo

- **Oye lo que se avienta** al 150 % de su oído: un objeto aventado es un señuelo.
- **Mover un objeto** puede tirar o desplazar una herramienta dejada; el Chocarrero las avienta y el Chaneque también roba lo que está en el piso.
- **No puede tomar ni usar** objetos.

### 5.9 Muerte y espíritus

Quien muere se vuelve espíritu y sigue jugando:

- **Ve al ánima siempre**, esté donde esté, y atraviesa muros y pisos.
- **Puede manifestarse para estorbarla:** toma cuerpo 3 s en un punto; si el ánima lo atraviesa, va a la mitad de velocidad durante 2 s. Espera de 30 s.
- **Habla con todos los muertos y con el ánima**, pero los vivos no lo oyen (§5.12). El ánima sí lo oye: un espíritu que grita «¡corre!» también le avisa a ella.

### 5.10 Nombrar y la huida

1. **Nombrar:** cuando el equipo quiera, un investigador vivo dice el nombre en el altar de la Capilla. No hay mínimo de pruebas: se puede nombrar con 0 evidencias (solo por comportamiento y sellos), con 1 o 2 arriesgando, y con 3 es seguro.
2. **Ritual:** dura 6 s sin moverse del altar y hace ruido. El ánima recibe aviso y lo rompe si se acerca a 1,6 m o le quita 8 de cordura a quien nombra.
3. **Nombre equivocado:** gana el ánima.
4. **Nombre correcto:** el ánima queda **expuesta**: se vuelve visible, su presencia se llena y deja de gastarse. Empieza **la huida**: 90 s para salir por el Zaguán.
5. **El Espanto:** durante la huida, el ánima puede usar una vez su Espanto (§6.4) y puede cazar sin importar la cordura.
6. **Resultado:** ganan los investigadores si escapa al menos la mitad de quienes estaban vivos al nombrarla (mínimo 1). Si no, gana el ánima.

### 5.11 El Alba

La noche dura 15 minutos reales: el reloj de la casa va de las 11 p. m. a las 6 a. m. Si al Alba nadie la ha nombrado, los vivos tienen una última oportunidad de nombrarla con lo que sepan. Si aciertan, la huida empieza con el ánima al 70 % de velocidad y sin Espanto. Si fallan o no nombran, gana el ánima.

### 5.12 Voz por proximidad

En el juego en línea la voz es parte del juego: hablar hace ruido. Se habla bajito porque el ánima escucha: «shh, nos puede oír».

| Quien habla | Lo oye |
| --- | --- |
| Investigador vivo | Los vivos, según distancia y volumen: susurro 3 m, voz normal 12 m, grito 25 m. Los muros atenúan y el otro piso oye a la mitad. **El ánima lo oye igual**, dentro de su oído. Los muertos lo oyen siempre |
| Investigador muerto | Todos los muertos y el ánima, siempre. Los vivos no |
| Ánima | Solo los muertos. Al principio no tiene con quién hablar |

- El volumen se mide con el micrófono; también hay botón de «hablar» y de «susurrar».
- El ánima humana ve las voces que oye como ondas que salen del lugar de quien habla.
- La demo web contra bots no tiene voz: los bots «hablan» con mensajes en pantalla que el ánima también percibe por cercanía.

### 5.13 Apagadores, objetos del cuarto y termómetro lento (aprobado)

Aprobado el 17 de noviembre. El termómetro lento ya está en §5.3 y mover objetos en §6.2; aquí queda el detalle.

#### A. Apagadores y focos que se funden

- **Cada cuarto tiene su apagador junto a la puerta principal** (el corredor y el patio, dos). Prender o apagar exige ir al apagador y pulsar E; ya no se hace desde cualquier punto del cuarto.
- **El ánima también usa el apagador.** Se ve la palanca moverse y suena el clic. Si el ánima tiene Huellas de ceniza, el apagador queda marcado para la UV.
- **Los focos se funden.** Cada cambio (de cualquiera) calienta el foco. El tercer cambio en menos de 30 s lo hace zumbar y parpadear como aviso; **el cuarto lo funde**: chispazo, se apaga y queda a oscuras el resto de la noche.
- **Foco de repuesto:** objeto que se encuentra en el Cuarto de servicio y la Despensa (1 por cada 2 investigadores). Cambiarlo toma 3 s parado bajo el candil.
- **Apagón = fusibles:** el Apagón del ánima bota los fusibles de la planta. Las luces vuelven solo si alguien sube la palanca de la caja de fusibles (Cuarto de servicio en la planta baja, Azotehuela en la alta).

Por qué: volver a prender en cuanto el ánima apaga ya no es gratis; si lo haces en caliente, pierdes el foco. Y el ánima gana una forma de dejar la casa a oscuras de verdad.

#### B. El ánima mueve lo que hay en el cuarto

- **Cada cuarto tiene de 3 a 6 objetos sueltos** acordes a su uso: sillas en el Comedor, jarrones y libros en la Biblioteca, juguetes en el Cuarto de juegos, cazuelas en la Cocina, cuadros en las paredes.
- **Mover objeto** actúa sobre el objeto suelto más cercano a 3 m. Si no hay ninguno, no se puede usar. El efecto depende del objeto:
  - una silla se arrastra 1 m;
  - un jarrón o un plato cae de la repisa y se rompe;
  - una pelota rueda;
  - un cuadro queda chueco.
- **Lo movido se queda movido** el resto de la noche. Es una pista para quien conoce el cuarto: «esa silla no estaba ahí».
- La cámara de video confirma Silueta en cámara solo cuando la silueta del ánima se ve en la tele de la base; ver al ánima o un objeto moverse en persona no cuenta.
- Las herramientas dejadas en el piso no cuentan como objetos sueltos, salvo para el Chocarrero (las avienta) y el Chaneque (las roba).

#### C. El termómetro tarda y hay que buscar el punto frío

- **La lectura se asienta poco a poco.** Al usarlo, el número baja desde la última lectura hacia la temperatura real durante unos 8 s. Hay que quedarse quieto: moverse lo reinicia.
- **El frío no es parejo.** Dentro del cuarto del ánima hay un **punto frío** de unos 2 m de radio, donde suele reposar. Ahí marca bajo cero (si tiene la evidencia); en el resto del cuarto, solo fresco (6 a 9 °C).
- **El frío depende de que esté.** El cuarto se enfría mientras el ánima está dentro y se calienta poco a poco cuando sale (unos 2 °C por minuto). Si sale mucho, el cuarto deja de delatarla. La Mudanza mueve el punto frío.
- **Pista rápida, no prueba:** bajo 5 °C se ve el vaho de tu aliento. Avisa que estás cerca del punto frío, pero no confirma la evidencia.

Por qué: hoy basta medir 2 s en cada cuarto para encontrarla. Con 8 s quietos más la búsqueda del punto frío, revisar un cuarto cuesta unos 15 s de exposición. Recorrer los 20 cuartos sin otras pistas tomaría más de 5 minutos, así que el equipo tiene que guiarse por ruidos, el EMF y lo que se mueve. Meta: encontrar el cuarto entre el minuto 3 y el 6.

## 6. Las ánimas

Todas las ánimas parten del **Ánima en pena**, el ánima base: valores estándar y ninguna habilidad especial. Cada variante es un perfil que cambia algunos valores y suma una pasiva, una habilidad, un sello y un Espanto sacados de su leyenda. La v0.2 trae 13: la base, una nueva (Nachito) y 11 del juego de cartas.

### 6.1 La ficha de un ánima

| Atributo | Qué controla | Ánima en pena (base) |
| --- | --- | --- |
| Evidencias | Lo que detectan las herramientas | Huellas de ceniza, Susurros, EMF 5 |
| Presencia y recarga | Cuánto aguanta fuera de su cuarto | 30 s; recarga 2 s por segundo |
| Velocidad | Al deambular | 2,2 m/s |
| Caza: inicio, aceleración, tope | Qué tan rápido se vuelve al ver a alguien | 2,4 m/s; +0,15 por segundo viendo; tope 4,0 |
| Visión cercana | Radio en el que ve en todas direcciones | 5 m |
| Visión lejana | Alcance de su cono de 120° | Hasta 14 m |
| Oído | Ruido que percibe a través de muros | 12 m |
| Regla de cacería | Qué cordura mira y con qué umbral | Promedio de los vivos, 50 o menos |
| Espera entre cacerías |  | 25 s |
| Frecuencia de fenómenos | Multiplica cuán seguido puede usar cada uno; ×0 = nunca | Todos ×1 |
| Pasiva y habilidad | Lo que la hace única | Ninguna |
| Sello | Comportamiento solo suyo | Rezo lejano: se oye un rosario rezado en voz baja |
| Espanto | Su arma en la huida | Penitencia |

Para un ánima humana, la frecuencia cambia la espera de cada fenómeno (×2 = la mitad de espera). Para un bot, cambia también la probabilidad de elegirlo.

### 6.2 Fenómenos compartidos

| Tecla | Fenómeno | Efecto | Espera base |
| --- | --- | --- | --- |
| Q | Escalofrío | −10 de cordura a 4 m; quien lo recibe oye un aliento en la nuca | 10 s |
| E | Apagar la luz | Apaga el cuarto donde está. Se vuelve a encender en su apagador; prender y apagar muchas veces funde el foco (§5.13) | 6 s |
| F | Portazo | Azota la puerta más cercana; −3 a quien esté en el cuarto | 8 s |
| C | Mover un objeto | Tira o avienta un objeto que ya está en el cuarto; puede volver a agarrar lo que tiró | 8 s |
| V | Susurro | Lamento: una voz genérica de hombre o de mujer, según el ánima, que se oye a 8 m (§2.12) | 12 s |
| G | Interferencia | Lecturas dudosas en los aparatos a 6 m; nunca un positivo | 20 s |
| H | Cazar | Ver §5.7 | 25 s |
| B | Volver a la guarida | Recarga despacio; deja rastro doble | — |

Ningún fenómeno produce evidencia: solo dicen cómo se comporta el ánima. Las evidencias salen del rastro (§2.7).

### 6.3 Los perfiles de la v0.2

Lo que no aparece en la tabla es igual a la base.

| Ánima | Evidencias | Visión cerca / lejos | Oído | Velocidad: normal · caza → tope | Caza cuando | Fenómenos distintos |
| --- | --- | --- | --- | --- | --- | --- |
| **Ánima en pena** (base) | Ceniza, Susurros, Luces | 5 / 14 m | 12 m | 2,2 · 2,4 → 4,0 | Promedio ≤ 50 | Ninguno |
| **Nachito** (nueva) | Susurros, Silueta en cámara, Espejo | 3 / 8 m | 14 m | 2,6 · 2,8 → 3,4 | Promedio ≤ 40 | Apagar la luz ×0; Encender la luz (solo él); Mover ×2 |
| **La Llorona** | Bajo cero, Susurros, Espejo | 4 / 18 m | 16 m | Base | Promedio ≤ 50 | Susurro ×2 (llanto) |
| **Chaneque** | Ceniza, Susurros, Objetos | 3 / 10 m | 20 m | 2,6 · 2,8 → 3,8 | Promedio ≤ 45 | Mover ×2; Apagar ×0,5 |
| **Matlacíhuatl** | Bajo cero, Ceniza, Espejo | 2 m / de 6 a 20 m (ciega entre 2 y 6) | 10 m | 2,3 · 2,4 → 3,8 | Alguien solo (nadie a 6 m) con ≤ 50 | Susurro ×1,5; Portazo ×0,5 |
| **El Cucuy** | Ceniza, Objetos, Espejo | A oscuras 6 / 16 m; con luz 3 / 4 m | 12 m | Base | Promedio ≤ 50 | Apagar ×2 |
| **El Guardián del Entierro** | Bajo cero, Susurros, Objetos | En su cuarto 8 / 20 m; fuera 3 / 6 m | 12 m | 1,8 fuera y 2,6 dentro · 2,4 → 3,6 | Alguien en su cuarto con ≤ 60, o promedio ≤ 45 | Portazo ×0,5 |
| **Nahual** | Ceniza, Objetos, Azufre | 6 / 8 m | 25 m (olfato) | 2,2 · 2,6 → 4,5 (+0,25/s) | Promedio ≤ 45 | Susurro ×0 (gruñe); Escalofrío ×1,5 |
| **Demonio** | Susurros, Luces, Azufre | Base | Base | Base | Promedio ≤ 60; espera 15 s | Escalofrío ×1,5 |
| **La Planchada** | Objetos, Luces, Espejo | Base | 8 m | 2,0 · 2,2 → 3,6 | El más sano con ≤ 60 | Portazo ×0; Mover ×0,5 |
| **Espíritu Chocarrero** | Susurros, Objetos, Luces | Base | Base | 2,4 · 2,4 → 3,6 | Promedio ≤ 45 | Portazo ×2; Mover ×3; Apagar ×1,5; Escalofrío ×0,5 |
| **Tlahuelpuchi** | Luces, Espejo, Azufre | 4 / 16 m; ve también el piso de abajo | Base | 2,2 · 2,6 → 3,8 | El más débil con ≤ 35 | Apagar ×1,5 |
| **El Mal Aire** | Bajo cero, Luces, Espejo | 6 / 6 m (no ve de lejos) | 10 m | 2,0 · 2,2 → 3,2 | Promedio ≤ 45 | Escalofrío ×2 |

| Ánima | Pasiva | Habilidad (R) | Sello | Se parece a | Disparador del sello |
| --- | --- | --- | --- | --- | --- |
| Ánima en pena | — | — | Rezo lejano | Susurro | Cada 60 s fuera de su cuarto |
| Nachito | Pavor a la oscuridad: solo entra a un cuarto oscuro encendiendo antes su luz (2 s); cazando no puede, y se detiene en la puerta | Juguetes: un juguete suena en otro cuarto del mismo piso (señuelo) | Una luz se enciende sola y se oye una risa de niño | EMF 5 | Cada vez que enciende una luz |
| La Llorona | Junto al agua: Escalofrío ×1,5 en Cocina, Baño, Baño alto y Patio | Llanto: −8 a 8 m; la delata | Charcos que van hacia el agua | Huellas de ceniza | Cada 45 s fuera de su cuarto |
| Chaneque | Travieso: roba un objeto al pasar y lo esconde | Esconderse en el monte: aparece en el cuarto de un investigador | El objeto robado aparece en otro cuarto, con una risita | Mover un objeto | Cada robo |
| Matlacíhuatl | Caza al que anda solo: doble efecto contra quien no tiene a nadie a 6 m | La red: inmoviliza 3 s, también cazando | Dice el nombre de quien anda solo | Susurro | Alguien pasa 10 s solo a 8 m o menos |
| El Cucuy | Desde la penumbra: cazando no se ve a oscuras; saca de un escondite a quien esté dentro si se queda 3 s junto a él | Apagón: apaga los cuartos a 10 m | Un escondite se abre solo y se ven ojos | Portazo | Al pasar junto a un escondite con más de la mitad de su presencia |
| El Guardián | Celoso de su oro: recarga ×2; su cuarto quita 0,4 por segundo | Flama azul: −6 y −0,3/s por 10 s | Suenan monedas y sale una flamita azul del piso | Velas azules de su cuarto | Alguien entra a su cuarto |
| Nahual | Bestia: no habla; oye y huele de lejos | Transformarse: 8 s a +40 % de velocidad, fuera de cacería | Gruñido y pisadas de animal | Pasos de cacería | Cada transformación |
| Demonio | El Rosario solo lo ciega 2 s | Infierno: −6 a todos los de su piso sin delatarlo | Las cuentas de un rosario se rompen | Mover un objeto | Pasa a 4 m de alguien con Rosario |
| La Planchada | Cuida a los enfermos: nunca mata a quien tiene 25 o menos; a su lado se recupera 1 por segundo | Ronda: aparece junto a quien tenga más cordura | Una cama se tiende sola y huele a almidón | Mover un objeto | Cada vez que entra a una recámara |
| Espíritu Chocarrero | Poltergeist: muchos fenómenos, pero su Escalofrío quita 6 | Tornado de objetos: −4 por objeto (hasta −12) a quienes estén en el cuarto | Tres o más objetos se mueven a la vez | Mover un objeto | Cada tercer fenómeno |
| Tlahuelpuchi | Vuela: cambia de piso por cualquier punto, sin escaleras | Vuelo: sube o baja al instante | Aleteo y plumas que caen del techo | Viento o portazo lejano | Cada cambio de piso |
| El Mal Aire | Invisible: nunca se ve, ni cazando; solo vaho | Soplo: apaga linternas 5 s a 6 m | Escarcha que crece en ventanas y espejos | Bajo cero | Cada 40 s en un cuarto con ventana |

**Nachito** es la primera ánima creada para el videojuego. Se basa en la leyenda de [Ignacio Torres Altamirano](https://www.aztecajalisco.com/tendenciayviral/leyenda-del-nino-nachito-en-guadalajara-el-panteon-belen-y-la-nictofobia/), el niño del Panteón de Belén de Guadalajara que, según la leyenda, murió en 1882 por su miedo a la oscuridad. Su tumba se llena de juguetes y se dice que de noche se le oye correr y reír. Por eso nunca apaga luces, las enciende, y su sello es una risa. Su combinación de evidencias (Susurros, Silueta en cámara y Marcas en el espejo) no la usa ninguna carta.

### 6.4 Espantos: el arma de la huida

Cada ánima tiene un Espanto que solo puede usar una vez, después de que la nombran (§5.10).

| Ánima | Espanto | Efecto en la huida |
| --- | --- | --- |
| Ánima en pena | Penitencia | Todos pierden 15 de cordura y oyen el rezo; empieza a cazar de inmediato |
| Nachito | Que no se apague | Enciende todas las luces y traba los apagadores; corre a su tope desde el inicio |
| La Llorona | Llanto eterno | Todos van 30 % más lento durante 6 s |
| Chaneque | Juego del monte | Cada investigador aparece en un cuarto al azar de su piso y suelta sus objetos |
| Matlacíhuatl | La red | Quien vaya solo queda atrapado 5 s |
| El Cucuy | Desde la penumbra | Apagón en toda la casa y saca a todos de los escondites |
| El Guardián | Maldición del entierro | Cierra la puerta del Zaguán 15 s |
| Nahual | La bestia | Caza a su velocidad tope desde el primer segundo |
| Demonio | Infierno | El Rosario y el Copal no sirven durante la huida |
| La Planchada | Ronda nocturna | Persigue al más sano y lo ve a través de los muros |
| Espíritu Chocarrero | Tornado | Azota y traba todas las puertas de un piso durante 10 s |
| Tlahuelpuchi | Vuelo de sangre | Aparece junto al más débil; si lo atrapa, salta al siguiente |
| El Mal Aire | Soplo del mal viento | Apaga todas las linternas 10 s |

### 6.5 Las que siguen

Las otras 9 ánimas del juego de cartas entran después de la v0.2. Cada una prueba una mecánica nueva:

| Ánima | Mecánica que probaría |
| --- | --- |
| Aparecido | Aparece y desaparece: salta entre su cuarto y el último lugar donde vio a alguien |
| Bruja | Deja un ojo de venado en un cuarto y ve a través de él |
| Yohualtepuztli | Un verbo nuevo, «Enfrentar»: quien lo encara a gritos detiene la cacería |
| Cihuateteo | Solo sale a corredor, galería y escaleras (las encrucijadas); caza dos veces seguidas |
| Charro Negro | Tratos: monedas que dan cordura, pero lo atraen hacia quien las lleva |
| Xtabay | Su canto atrae: quien lo oye camina hacia ella si no corre |
| El Cadejo Negro | Sigue el rastro de pasos; encadena a dos investigadores |
| La Mulata de Córdoba | Dibuja una puerta en un muro y lo atraviesa |
| El Uay Chivo | Su mirada marca a uno, que solo se salva con Rosario |

### 6.6 Cómo crear un ánima nueva

1. Copia la ficha del Ánima en pena.
2. Cambia como máximo 4 valores (visión, oído, velocidad, regla de cacería, presencia).
3. Ajusta la frecuencia de 1 o 2 fenómenos, o prohíbe uno, según su leyenda.
4. Escribe 1 pasiva y 1 habilidad.
5. Define su sello, el fenómeno con el que se confunde y su disparador obligatorio.
6. Escribe su Espanto para la huida.
7. Asígnale 3 evidencias.
8. Simula 200 noches por tamaño de mesa: debe ganar entre 45 y 55 %.

### 6.9 Lote de 22: base, comportamiento y leyenda (18 de noviembre)

Reemplaza a §6.3, §6.7 y §6.8.

- Las 21 ánimas del juego de cartas **conservan sus evidencias**. Nachito usa Susurros, Objetos y Espejo, la única combinación que ninguna carta usa.
- Con 2 evidencias quedan 3 ánimas posibles. Con Susurros+Objetos, Susurros+Espejo u Objetos+Espejo quedan 4, por Nachito.
- **Todo se nota por comportamiento.** Nada visual delata a un ánima.
- Cada ánima toma la mecánica de **un fantasma distinto de Phasmophobia** (22 de 27, sin repetir), la cambia y la justifica con su leyenda. Quedan libres Goryo, Onryo, Raiju, Obake y Obambo para futuras ánimas.
- Cada rasgo se confunde con al menos otra ánima.

#### A. En qué se basa cada una

| Ánima | Base (Phasmophobia) | Qué hace | Diferencia | Por su leyenda |
| --- | --- | --- | --- | --- |
| Ánima en pena | Spirit: el sahumerio le impide cazar más tiempo | Cuando la frenan con Rosario o Copal, tarda el doble en volver a cazar | Aquí cuenta cualquier objeto sagrado | Alma que pide oraciones: los rezos la calman |
| Nachito | Jinn: nunca apaga el cuadro de luz | Nunca apaga focos ni bota fusibles. Busca cuartos con luz; a oscuras se enoja, come más y hace más | El Jinn usa la luz para correr; Nachito la necesita para calmarse | Murió por miedo a la oscuridad |
| La Llorona | Myling: pasos casi inaudibles en cacería | Muy rara vez, en cacería, se oye lejos estando a tu lado | No es silenciosa: miente con la distancia | «Si la oyes lejos, está cerca» |
| Chaneque | The Twins: interacciones en dos lugares | Cuando alguien tira algo, cae otro objeto lejos. Se lleva objetos a otro piso. Muy raro: roba algo de tu equipo si no estás viendo tus objetos | Los gemelos son dos; aquí se sienten muchos, y roban | Seres pequeños que esconden cosas y extravían a la gente |
| Matlacíhuatl | Shade: casi no actúa con gente cerca | Con el grupo junto casi no hace nada; con alguien solo se activa y va por esa persona. Se lleva objetos dentro del piso para separarlos | El Shade evita a todos; ella espera a que te separes | Atrapa a quien anda solo de noche |
| El Cucuy | Mare: más fuerte a oscuras, apaga luces | Ve mejor a oscuras y apaga mucho. Muy rara vez caza desde un escondite y al terminar se mete en otro, camas incluidas | El Mare no usa escondites | Acecha en roperos y debajo de las camas |
| El Guardián | Oni: más activo con gente cerca | Nunca sale de su cuarto; entre más gente hay cerca, más hace y antes caza | El Oni deambula; él no deja su tesoro | Castiga a quien profana su entierro |
| Nahual | Revenant: lento sin verte, rapidísimo al verte | Cada cacería es una ruleta: normal, o bestia que sigue tu olor sin verte | Cambia de forma entre cacerías | Brujo que se transforma en animal |
| Demonio | Demon: caza pronto y seguido | Caza más y se repone rápido; el Rosario y el Copal le duran el doble | Casi igual, a propósito | Lo sagrado lo hiere más |
| La Planchada | Yurei, al revés: el Yurei drena cordura | Cerca de ella se recupera cordura; respeta a quien tiene 25 o menos y va por los sanos | Invierte la regla de cordura | Enfermera que cuida a los enfermos |
| Espíritu Chocarrero | Poltergeist: varios objetos a la vez | Avienta y mueve muchísimo, siempre cerca; muy rara vez, muchos objetos a la vez | Casi igual, a propósito | El poltergeist mexicano |
| Tlahuelpuchi | Moroi: más rápida con poca cordura | Va por el más débil y es más rápida contra quien tiene poca cordura; cambia de piso sin escaleras | El Moroi maldice por la caja de espíritus | Bruja que vuela y chupa la sangre de los más débiles |
| El Mal Aire | Phantom: casi no se ve en cacería | Cazando casi no se nota dónde está | Ningún cuerpo, solo vaho | Viento invisible que entra al cuerpo |
| Charro Negro | Hantu: velocidad según el ambiente | Muy rápido en línea recta y lento al dar vuelta | El Hantu depende del frío; él, del terreno | Jinete que galopa |
| Aparecido | The Mimic: copia rasgos de otros | Cada noche copia el rasgo de comportamiento de otra ánima al azar, nunca sus evidencias | Aquí nunca hay evidencia falsa | Muerto que vuelve con la cara de otro |
| Bruja | Gallu: se enfurece con las protecciones | Si usan Rosario, Ruda o Copal cerca, se enoja unos segundos (hace más y caza antes) y luego se debilita. Muy rara vez sabe quién está en un cuarto que «embrujó» | Lo detonan los remedios de las curanderas | La brujería se defiende del contrahechizo |
| Yohualtepuztli | Yokai: tu voz lo provoca | Si alguien le grita fuerte al micrófono durante la cacería, la detiene | Al revés: la voz lo frena | Quien enfrentaba al Hacha Nocturna le arrancaba el corazón |
| Cihuateteo | Thaye: se debilita con el tiempo | Muy activa al inicio de la noche y se calma después; solo ronda pasillos, galería y escaleras; rara vez caza dos veces seguidas | Cambia con la hora, no con la edad | Bajaban al atardecer a las encrucijadas |
| Xtabay | Dayan: más rápida si te mueves cerca | Si te quedas quieto oyendo su lamento, te jala hacia ella y se fortalece; si te mueves, se debilita | Al revés: castiga quedarse a escuchar | Atrae con su canto a quien se detiene |
| Cadejo Negro | Deogen: siempre sabe dónde estás | En cacería sigue las huellas recientes de quien caminó al último; rápido de lejos y lento al alcanzarte | Sigue el rastro, no lo sabe todo | Perro que sigue a los caminantes de noche |
| Mulata de Córdoba | Wraith: se teletransporta | Tiene dos puntos fijos e invisibles y salta entre ellos al instante; se lleva objetos lejos | Salta siempre entre los mismos dos lugares | Dibujó un barco en su celda y escapó por él |
| Uay Chivo | Banshee: un solo objetivo | Elige a una persona al inicio y va solo por ella; si muere, elige otra | Es la única con objetivo fijo | Su mirada marca y enferma a una persona |

#### B. Evidencias, voz y confusiones

Habilidades limitadas: Pos = posesión, Apa = apagón, Hue = huellas descalzas, Int = interferencia, Lle = llevarse (cerca, medio o lejos).

| Ánima | Evidencias | Voz | Se confunde con | Habilidades limitadas | Especial (rara) | La casona no puede |
| --- | --- | --- | --- | --- | --- | --- |
| Ánima en pena | Ceniza, Susurros, Luces | Al azar | Nachito tranquilo, Planchada | Int | Ninguna | El pasillo |
| Nachito | Susurros, Objetos, Espejo | Hombre | Pena; Cucuy (enojado) | — | Juguete que suena | Sombra sin dueño |
| La Llorona | Bajo cero, Susurros, Espejo | Mujer, llanto propio | Mal Aire, Cucuy | Hue | Llanto | La foto |
| Chaneque | Ceniza, Susurros, Objetos | Hombre | Mulata, Chocarrero | Lle lejos | Robo del equipo | TV noticiero |
| Matlacíhuatl | Bajo cero, Ceniza, Espejo | Mujer | Uay Chivo, Bruja | Pos, Lle medio | Posesión que aleja | La foto |
| El Cucuy | Ceniza, Objetos, Espejo | Hombre | Nachito, Mal Aire, Llorona | Apa | Cacería desde escondite | Doble |
| El Guardián | Bajo cero, Susurros, Objetos | Hombre | Demonio, Cihuateteo | Hue, Int | Flama azul | Canicas o pasos |
| Nahual | Ceniza, Objetos, Azufre | Hombre | Cadejo, Charro | Hue | Modo bestia | Teléfono |
| Demonio | Susurros, Luces, Azufre | Hombre | Guardián, Bruja, Cihuateteo | Pos, Int | Infierno | Zaguán |
| La Planchada | Objetos, Luces, Espejo | Mujer | Pena, Tlahuelpuchi | Hue, Lle cerca | Ronda | Silueta |
| Espíritu Chocarrero | Susurros, Objetos, Luces | Hombre | Chaneque | Apa, Lle cerca | Tornado de objetos | Los resultados 1–10 cuentan como ambiente |
| Tlahuelpuchi | Luces, Espejo, Azufre | Mujer | Planchada, Uay Chivo, Mulata | Pos, Apa | Vuelo | El tecolote |
| El Mal Aire | Bajo cero, Luces, Espejo | Al azar | Cucuy, Llorona | Pos, Int | Soplo | Sombra sin dueño |
| Charro Negro | Bajo cero, Ceniza, Azufre | Hombre | Nahual | Apa | Cabalgata | Pétalos |
| Aparecido | Bajo cero, Objetos, Luces | Al azar | La ánima que copia | Apa, Int | Copia | Doble |
| Bruja | Objetos, Espejo, Azufre | Mujer | Demonio, Matlacíhuatl | Int, Lle medio | Cuarto embrujado | Eco |
| Yohualtepuztli | Bajo cero, Objetos, Azufre | Hombre | Una cacería cortada por el Rosario | Hue | Hachazo | Serenata |
| Cihuateteo | Bajo cero, Ceniza, Luces | Mujer | Demonio, Guardián | Apa | Doble cacería | Ruidos de niños afuera |
| Xtabay | Ceniza, Susurros, Espejo | Mujer | Matlacíhuatl, Llorona | Pos | Canto | Señuelo |
| Cadejo Negro | Ceniza, Luces, Azufre | Hombre | Nahual | Hue | Rastreo | Anomalía |
| Mulata de Córdoba | Susurros, Espejo, Azufre | Mujer | Tlahuelpuchi, Aparecido, Chaneque | Int, Lle lejos | Portal | El pasillo |
| Uay Chivo | Bajo cero, Susurros, Azufre | Hombre | Matlacíhuatl, Tlahuelpuchi | Pos | Mirada | TV vigilancia |

## 7. Modos de juego e IA

La v1 tiene tres modos con las mismas reglas; cambia solo quién controla a cada personaje.

| Modo | Jugadores | Para qué sirve | Versión |
| --- | --- | --- | --- |
| Cooperativo contra la IA | 1 a 4 investigadores; bots completan la mesa | El modo principal | v0.2 (1 jugador), v1 (en línea) |
| Ánima jugable | 1 persona como ánima contra 1–4 investigadores | La asimetría que distingue al juego | v0.2 contra bots, v1 en línea |
| Práctica | 1 investigador; ánima elegida; sellos señalados | Aprender las leyendas y los perfiles | v1 |

Una misma pantalla no sirve para ánima contra investigadores humanos: cada bando vería lo que ve el otro. Ese modo necesita juego en línea.

### 7.1 Bot de investigador

Prioridades, de mayor a menor:

1. **Sobrevivir:** si empieza una cacería, reacciona en 0,4–1,4 s. Rompe la línea de vista y busca el escondite activo más cercano (85 %) o huye. Activa el Rosario si el ánima está a 2 m y no tiene escondite cerca; avienta Copal para cortarle el paso.
2. **Cuidarse:** toma Té bajo 45 de cordura y enciende luces al entrar.
3. **Leer:** si siente al ánima (velas azules, escalofrío, a 3 m), coloca la herramienta que mejor divide a las ánimas posibles donde suele pasar el ánima y la revisa después. Apaga sus aparatos antes de esconderse.
4. **Observar:** anota sellos con 70 % de acierto (a veces confunde el sello con su parecido) y anota rasgos del perfil («no entró al cuarto oscuro», «me perdió a media distancia»).
5. **Explorar:** recorre cuartos no visitados de los dos pisos.
6. **Nombrar y huir:** con 2 pruebas y una sola ánima posible va al altar; si hay un humano vivo, solo lo sugiere. En la huida corre al Zaguán por la ruta más corta que no pase junto al ánima.

**Bots investigadores v1.6:**

- **Equipo inicial:** cada bot toma justo la herramienta que le toca, en este reparto: termómetro, EMF, cámara, gases, espejo, grabadora, UV.
- **Búsqueda:** se reparten cuartos y pisos («Yo reviso la cocina») y van primero a donde se oyó algo o marcó el EMF. EMF 3 veces en el mismo cuarto = guarida; si otro cuarto marca más, cambian.
- **Herramienta siguiente:** la que más ánimas descarta con lo que ya saben. Si una herramienta pasa tiempo en la guarida sin resultado, descartan esa prueba (termómetro 80 s, cámara/EMF/UV 160–170 s, grabadora 160 s, gases 210 s, espejo 240 s).
- **Condiciones:** apagan la luz para la grabadora; al salir de un cuarto que queda vacío apagan la luz, y antes de prender una, si los fusibles están por botarse, apagan la de un cuarto vacío.
- **Hablan:** dicen qué revisan, qué leen, qué se llevan y cuánto falta.
- **Se equivocan:** 4 de cada 10 pueden creer ver una prueba falsa una vez por noche y la corrigen 75–135 s después.
- **No adivinan:** se van con 3 pruebas, o con 2 y una sola candidata; con 2 en el último minuto; si se acaba el tiempo, con su mejor opción.

### 7.2 Bot de ánima

Es una máquina de estados, **Descansar → Acechar → Atacar → Retirarse → Volver**, que siempre respeta su perfil:

- **Solo sabe lo que percibe.** Usa su visión y su oído igual que una persona; no hace trampa con el mapa.
- **Elige fenómenos con las frecuencias de su perfil.** Nachito nunca apaga una luz; el Chocarrero mueve cosas todo el tiempo.
- **Acecha fuera del alcance de las herramientas** y solo se acerca para un fenómeno o una cacería.
- **Calcula su regreso** para no quedar atrapada.
- **Caza** cuando se cumple su regla, con 30 % de probabilidad por segundo.
- **Imita a otra ánima** con 25 % de probabilidad, usando sus fenómenos favoritos (nunca su sello).
- **En la huida** se coloca entre los investigadores y el Zaguán y usa su Espanto cuando hay al menos dos a la vista.
- **Dificultad:** Fácil (sin imitar y sin aceleración), Normal, Pesadilla (imita 40 % y acelera ×1,5).

**Ánima territorial (v1.5):** solo acecha a quien esté a menos de 12 m de su guarida; ronda su cuarto y los que tienen puerta con él (15 %, o tras 60 s inquieta). El pan solo la atrae a menos de 14 m de su guarida. Entre acciones espera 10–16 s en normal (fácil 14–22, pesadilla 6–10). Cada 22–38 s hace un toque callado en su cuarto (EMF 2–3, o 5 con 30 % si tiene esa prueba). Resultado: pasa el 62 % del tiempo en su guarida (antes 29 %) y hace unas 1,5 acciones visibles por minuto (antes 3,4). Afuera no pasa nada ni se pierde cordura; tras cada cacería se apagan todas las luces de los cuartos.

## 8. La casona

Un solo mapa grande: una casona colonial de 60 × 40 m y dos pisos. Abajo, 12 cuartos alrededor de un patio con corredor; arriba, 10 cuartos alrededor de una galería que se asoma al patio.

&#91;embedded content: planta baja y planta alta · 22 cuartos, 2 escaleras, 28 escondites posibles\]

### 8.1 Zonas

| Zona | Cuartos | Papel en el juego |
| --- | --- | --- |
| Entrada | Zaguán (abajo), Rellano (arriba) | Inicio y salida de la huida; escalera principal |
| Centro | Patio y corredor (abajo), galería (arriba) | Luz de luna; el cruce más rápido y más expuesto; desde la galería se ve el patio |
| Ala norte | Capilla, Biblioteca, Sala, Recámara principal / Cuarto de juegos, Cuarto de costura, Sala de música, Recámara de huéspedes | La Capilla tiene el altar donde se nombra al ánima |
| Alas este y oeste | Comedor, Cocina, Recámara de niños, Baño / Recámara del abuelo, Baño alto, Oratorio, Cuarto de la nana | Cocina, Baño y Baño alto tienen agua (Llorona) |
| Ala sur | Despensa, Estudio, Cuarto de servicio / Desván, Archivo, Azotehuela | Esquinas sin salida; escalera de servicio entre Cuarto de servicio y Azotehuela |

### 8.2 Recorridos

- **Dos escaleras** forman un circuito: se puede subir por una y bajar por la otra para despistar al ánima.
- **El ruido cruza los pisos:** los pasos de arriba se oyen abajo a la mitad de distancia. Correr en la galería delata.
- **Del altar a la salida** hay unos 40 m por el corredor: unos 15 s caminando. La huida siempre cruza el centro de la casa.
- **Cuarto del ánima:** se sortea entre 21 cuartos (todos menos Zaguán, Rellano, Azotehuela, Patio, Corredor y Galería).

### 8.3 Escondites que cambian

Hay 28 escondites posibles, 14 por piso: roperos, baúles, alacenas y el hueco bajo las camas. En cada partida se activan entre 12 y 14 al azar, con estas garantías para que no se sienta injusto:

1. **Al menos 6 por piso.**
2. **Al menos 1 en cada ala** (norte, sur, este y oeste) de cada piso: nunca hay una zona sin dónde meterse.
3. **Desde cualquier punto de la casa hay uno activo a 18 m o menos** de camino.
4. **Nunca 2 activos en el mismo cuarto**, y ninguno en zonas de paso (Zaguán, Rellano, Patio, Corredor, Galería, escaleras).
5. **Cada escondite cabe 1 persona.**

Un escondite inactivo se ve como mueble normal: el ropero está cerrado con llave o la cama no tiene hueco. Uno activo tiene una seña discreta (la puerta entreabierta), así que conviene recorrer la casa antes de la primera cacería.

### 8.4 Luces

Un apagador por cuarto junto a la puerta principal. La galería y el corredor tienen un apagador en cada esquina.

### 8.5 Plano v2 de la casona (propuesta para la reestructuración gráfica)

**Estado:** diseño aprobado para planear, **sin implementar**. Reemplaza el plano de arriba cuando se haga la reestructuración; lo implementa otra IA con estas medidas y reglas.

**Idea arquitectónica.** Es una casa de patio novohispana de dos niveles, entre casas vecinas: zaguán → primer patio con corredor en los cuatro lados → crujías alrededor. La escalera principal está en un ángulo del patio, nunca en el zaguán. Los servicios (despensa, planchaduría, cocina, traspatio con lavaderos y aljibe) van al fondo. La familia vive en la planta alta, con balcones a la calle. La capilla doméstica queda al fondo del eje del zaguán. Los muros laterales son ciegos porque colindan con las casas vecinas: toda ventana da a la calle o al patio. Se basa en descripciones de casonas con zaguán, patio con corredor a los cuatro lados y escalera hacia las habitaciones altas (UNAM, *Anuario de Cultura y Arte*), escalera de dos tramos y crujías organizadas desde el corredor alto (UAEH), capilla al fondo de un corredor (UANL) y la tipología de casa de patio con aljibe en patio o traspatio (PEMP Cartagena).

**Retícula.** Igual que hoy: 60 × 40 casillas de 1 m por piso. El norte (y = 0) es el fondo y la calle está al sur (y = 39). Muros de 1 casilla. La base de afuera (y 40–59) se conserva; el portón pasa al centro (x 29–30), así que el camino de piedra se mueve a x 27–32.

#### Planta baja

```
############################################################
#..........h.#.......h.#....AAAA....#.========..#,,,,,,,,,,#
#.c..........#.........#...........c#...........#,~~~,,,,,,#
#............#.........#............#...........#,,,,,,,,,,#
#..DESPENSA..#.PLANCHA.#............#.COCINA....#,,,,,,,,,,#
#............+.........#..CAPILLA...#...........+,TRASPATIO#
#............#.........#h...........#..........h#,,,,,,,O,,#
#............#.........#............#.ff........#,,,,,,,,,,#
#.c..........#.c.......#............#.........c.#,,,,,,,,,,#
#............#.........#............#...........#,,,,,,,,,,#
######+###########+##########++#########+###########+#######
#..............#::::::::::::::::::::::::::::#..............#
#..............#::::::::::::::::::::::::::::#c.............#
#h.............#::i,,,i,,,i,,,i,,,i,,,i,,i::#..............#
#..............#::,,,,,,,,,,,,,,,,,,,,,,,,::#..............#
#......c.......+::,,,,PATIO,,,,,,,,,,,,,,,::+...mmmmmmmm...#
#..............#::,,,,,,,,,,,,,,,,,,,,,,,,::+...mmmmmmmm...#
#..BIBLIOTECA..#::i,,,,,,,,,,,,,,,,,,,,,,i::#..............#
#..............#::,,,,,,,,,,oooo,,,,,,,,,,::#.COMEDOR......#
#..............#::,,,,,,,,,,oooo,,,,,,,,,,::#..............#
#######+########::,,,,,,,,,,oooo,,,,,,,,,,::#..............#
#..............#::,,,,,,,,,,oooo,,,,,,,,,,::########+#######
#...^^^^^^^^^^.#::i,,,,,,,,,,,,,,,,,,,,,,i::#..............#
#...^^^^^^^^^^.#::,,,,,,,,,,,,,,,,,,,,,,,,::#.............c#
#.ESCALERA.....+::,,,,,,,,,,,,,,,,,,,,,,,,::#.REPOSTERIA...#
#..............+::,,,,,,,,,,,,,,,,,,,,,,,,::+..............#
#...==========.#::i,,,i,,,i,,,i,,,i,,,i,,i::#..............#
#...==========.#:::corredor:::::::::::::::::#c.............#
#..............#::::::::::::::::::::::::::::#............h.#
####################+########++######+#####+######+#########
#.............#...........#......#.......#.................#
#...........c.#..........c#......#.....h.#c...............c#
#...kkkkk.....#...........#......#.......#.................#
#...kkkkk.....#....c......#......+.......#....mmmmmmmmm....#
#...kkkkk.....+...........+......#.......#....m.......m....#
#.............#.DESPACHO..#ZAGUAN#PORTER.#.................#
#.COCHERA.....#...........#......#.......#..BOTICA.........#
#h............#h..........#......#c......#................h#
#.............#...........#......#.......#.................#
####v#XXXv########v###v######++#####v#########v###XX##v#####
```

#### Planta alta

```
############################################################
#............#.......h.#............#.========..#          #
#..c....c....#.........#.CORO ALTO..#...........#          #
#............#.........#............#...........#          #
#..DESVAN....#.COSTURA.#............#.NANA......#          #
#............+.........#____________#...........# (cielo)  #
#............#.........#            #...........#          #
#............#.........#  (capilla) #...........#          #
#h.........c.#.c.......#            #c........h.#          #
#............#.........#            #...........#          #
######+###########+##########++#########+###################
#..............#::::::::::::::::::::::::::::#..............#
#h......c......#::::::::::::::::::::::::::::#.............c#
#..............#::________________________::#..............#
#..............#::_                      _::#..............#
#..............+::_                      _::+..............#
#.REC.NINOS....#::_                      _::+.S.MUSICA.....#
#..............#::_                      _::#..............#
#..............#::_                      _::#..............#
#.............h#::_   (vacio del patio)  _::#..............#
################::_                      _::###########+####
#..............#::_                      _::#......#.......#
#...==========.#::_                      _::#.BANO.#......h#
#...==========.#::_                      _::#.~~~~.#.......#
#..............+::_                      _::#.~~~~.#HUESPED#
#.RELLANO......+::_                      _::+.~~~~.#.......#
#..............#::________________________::#......#.......#
#h..........c..#:::galeria::::::::::::::::::#.c....#.c.....#
#..............#::::::::::::::::::::::::::::#......#.......#
#######+############+############++########+################
#.............#............#.............#.................#
#h....c.......#h....c.....h#..c..........#........c.......h#
#.............#............#.............#.................#
#.............#............#.............#.................#
#.............+............+.............+.................#
#.REC.ABUELA..#.REC.PRINC..#..SALON......#..REC.HIJA.......#
#.............#............#.............#.................#
#............h#............#.............#h................#
#.............#............#.............#.................#
####B####B########B####B######BB#####B########B#######B#####
```

**Leyenda:** `#` muro · `.` piso · `,` a cielo abierto (patio, traspatio) · `:` corredor o galería · `+` puerta o arco · `h` escondite · `c` mueble que se abre · `=` escalera · `^` segundo tramo de la escalera, encima · `_` barandal · `i` pilar de arco · `o` fuente · `O` aljibe · `~` agua (lavaderos, tina) · `A` altar · `f` fogón · `m` mesa o mostrador (estorba) · `k` carruaje viejo (estorba) · `v` ventana con reja · `X` vano tapiado · `B` balcón.

#### Cuartos de la planta baja

| Cuarto | Casillas (x, y) | Qué era | Se abre / escondite | ¿Guarida? | En la persecución |
| --- | --- | --- | --- | --- | --- |
| Zaguán | 27–32 × 30–38 | entrada de carruajes y visitas; banca de piedra, nicho con la Virgen, portón con aldaba | — / — | No | Embudo: única salida a la base |
| Despacho | 15–25 × 30–38 | despacho del señor; ventana con reja a la calle | escritorio, archivero / armario | Sí | Escape lateral: puerta al zaguán y a la cochera |
| Cochera vieja | 1–13 × 30–38 | carruaje tapado con una sábana; portón tapiado | arcón de aperos / arcón grande | Sí | Mareo: rodear el carruaje |
| Portería | 34–40 × 30–38 | cuarto del portero | cajón de llaves / ropero | Sí | Trampa chica |
| Botica | 42–58 × 30–38 | antigua botica que daba a la calle; anaqueles con frascos | anaqueles, cajonera / armario de trastienda | Sí | Mareo: mostrador en U |
| Corredor | anillo de 2 casillas alrededor del patio | arcos sobre pilares cada 4 m, macetas, tinajero | — | No | Pista: tramos rectos de 24–28 m |
| Patio | 18–41 × 13–26 | fuente de cantera al centro, macetas | — | No | Mareo: pilares que cortan la vista; vueltas a la fuente |
| Biblioteca | 1–14 × 11–19 | libreros del piso al techo | escritorio / librero que gira (escondite secreto) | Sí | Dos puertas: corredor y escalera |
| Cubo de escalera | 1–14 × 21–28 | escalera principal de dos tramos con descanso | — / alacena bajo el tramo de arriba | No | Nudo vertical; arco doble al corredor |
| Despensa | 1–12 × 1–9 | costales y barriles | alacenas / alacena grande | Sí | Trampa (callejón) |
| Planchaduría | 14–22 × 1–9 | lavar y planchar la ropa | cómoda / ropero | Sí | Trampa |
| Capilla | 24–35 × 1–9, doble altura | altar mayor, bancas, confesionario; su puerta está en el eje del zaguán | cajonera de sacristía / confesionario | Sí | Fin del eje largo zaguán–patio–capilla; sin otra salida |
| Cocina | 37–47 × 1–9 | fogón, tinajero, alacena, escalera de servicio | alacena / despensero | Sí | Nudo vertical (escalera de servicio) |
| Traspatio | 49–58 × 1–9, cielo abierto | lavaderos, aljibe, tendedero | — | No | Atajo entre cocina y comedor |
| Comedor | 45–58 × 11–20 | mesa larga de 8 m, trinchero | trinchero / — | Sí | Mareo: rodear la mesa |
| Repostería | 45–58 × 22–28 | alacenas y vitrinas de vajilla | vitrinas / alacena | Sí | Nudo: comedor, corredor y botica |

#### Cuartos de la planta alta

| Cuarto | Casillas (x, y) | Qué era | Se abre / escondite | ¿Guarida? | En la persecución |
| --- | --- | --- | --- | --- | --- |
| Galería | anillo sobre el corredor, barandal al patio | — | — | No | Pista |
| Recámara de la abuela | 1–13 × 30–38 | cama con dosel, reclinatorio, balcón | cómoda / 2 roperos | Sí | Enfilada |
| Recámara principal | 15–26 × 30–38 | cama, tocador con espejo, vestidor, balcón | tocador / ropero y vestidor | Sí | Enfilada |
| Salón de estrado | 28–40 × 30–38 | sala de visitas, retratos, balcón central sobre el zaguán | vitrina / — | Sí | Enfilada; mareo entre los muebles |
| Recámara de la hija | 42–58 × 30–38 | tocador, espejo de cuerpo entero, balcón | tocador / 2 roperos | Sí | Final de la enfilada |
| Recámara de niños | 1–14 × 11–19 | dos camitas, caballito, baúl de juguetes | baúl / 2 roperos | Sí | Dos puertas |
| Rellano | 1–14 × 21–28 | llegada de la escalera principal | cómoda / ropero | No | Nudo vertical |
| Desván | 1–12 × 1–9 | techo bajo, triques, baúles | 3 baúles / baúl grande | Sí | Trampa |
| Cuarto de costura | 14–22 × 1–9 | máquina de coser, maniquí | costurero / ropero | Sí | Trampa |
| Coro alto | 24–35 × 1–4 | balcón interior que mira la capilla desde arriba | — | No | Mirador: se ve la capilla (y al ánima) desde arriba |
| Cuarto de la nana | 37–47 × 1–9 | cuna, mecedora; llega la escalera de servicio | cómoda / ropero | Sí | Nudo vertical |
| Sala de música | 45–58 × 11–19 | piano, arpa, atriles | gaveta de partituras / — | Sí | Dos puertas |
| Baño | 45–50 × 21–28 | tina de cobre, lavamanos | lavamanos / — | Sí | Trampa total |
| Recámara de huéspedes | 52–58 × 21–28 | cama, buró, ropero | buró / ropero | Sí | Trampa (solo da a la sala de música) |

#### Escondites

Hay **24 posibles**: roperos, vestidor, alacenas, confesionario, arcón, baúl grande y el librero que gira. Cada noche se abren de 14 a 16 y los demás tienen candado, como el sistema actual. Reglas del plano:

- Ninguno en corredor, galería, patio, zaguán, traspatio ni escaleras.
- Desde cualquier punto de la casa hay uno a 12 m de camino o menos.
- En los callejones (baño, despensa, planchaduría, costura, desván, capilla) el escondite es la única salvación: más riesgo, más tensión.

#### Muebles que se abren y dónde aparecen los objetos

Los objetos ya **no están tirados**: se guardan en muebles (`c`): cajones, alacenas, baúles, vitrinas, trinchero, costurero y cajonera de sacristía. Abrir uno es mantener E un segundo; hace ruido (cajón, rechinido, bisagra) y el ánima lo oye a 6 m. Cada mueble guarda 0, 1 o 2 cosas, y unos 2 de cada 3 están vacíos. Las herramientas siguen en la mesa de la base.

| Objeto | Dónde aparece con más probabilidad |
| --- | --- |
| Té de tila, pan de muerto | cocina, repostería, despensa, comedor |
| Veladoras, rosario, cruz de palma | capilla, coro alto, recámara de la abuela, cuarto de la nana |
| Ruda, copal, limpia con huevo | botica, cocina, recámara de la abuela |
| Puño de ceniza | cocina (fogón), capilla (incensario) |
| Focos de repuesto | portería, despacho, cochera |
| Cámara instantánea | despacho, salón, recámara de la hija |
| Objetos malditos | en su cuarto: muñeca en el de niños, tarot en la botica, espejo de plata en la recámara de la hija, tablilla en el desván |

#### Dónde pueden aparecer las anomalías

Solo en cuartos con muebles, y siempre fuera de la vista de quien está (regla actual de §2.11). Nunca en corredor, galería, patio, traspatio, escaleras, rellano ni afuera; el zaguán solo admite la de «puerta».

- **Cuadro de cabeza:** cuartos con retratos (salón, despacho, biblioteca, recámaras, comedor).
- **Objeto que flota:** cuartos con objetos sueltos.
- **Objeto que aparece:** cualquier cuarto con superficie (mesa, cómoda, altar).
- **Puerta que cambia:** cualquier cuarto con puerta interior.

#### Guaridas

Son elegibles los 22 cuartos marcados «Sí». Nunca lo son el zaguán, los corredores, el patio, las escaleras, el rellano, el coro ni el traspatio. Cada ánima tiene **afinidad ×2** con unos cuartos, por su leyenda:

| Ánima | Cuartos preferidos |
| --- | --- |
| La Llorona | baño, cocina, cuarto de la nana |
| Nachito, Chaneque | recámara de niños, repostería, despensa |
| Ánima en pena | capilla, sala de música |
| La Planchada | planchaduría, cuarto de costura |
| Charro Negro, Nahual, Cadejo, Uay Chivo | cochera, despacho, portería |
| Tlahuelpuchi, Cihuateteo | cuarto de la nana, recámara principal |
| La Mulata, Xtabay | recámara de la hija, recámara principal (espejos) |
| La Bruja, Mal Aire | botica, desván |
| Demonio, Guardián | capilla, biblioteca, despacho |
| Chocarrero, Aparecido | comedor, salón, recámara de huéspedes |
| Cucuy, Matlacíhuatl | desván, recámara de la abuela, recámara de niños |

**Nota para la siguiente fase de balance:** para que la guarida se pueda deducir, en estado tranquilo el ánima no debe rondar más allá de un cuarto vecino de su guarida.

#### Persecución: dónde acelera y dónde se marea

- **Pistas de aceleración:** los cuatro tramos del corredor y de la galería (24–28 m rectos) y el eje zaguán–patio–capilla. Ahí el ánima, que acelera mientras te ve, llega a su velocidad máxima. Huir en línea recta por el corredor es perder.
- **Mareo (romper la vista y dar vueltas):** los pilares del patio cada 4 m, la fuente, la mesa del comedor, el carruaje de la cochera, el mostrador de la botica y la **enfilada** de recámaras de la planta alta. Las recámaras se comunican entre sí y con la galería, así que se puede dar la vuelta cuarto por cuarto y salir por la galería.
- **Lazo vertical:** la escalera principal (oeste) y la de servicio (cocina ↔ cuarto de la nana) forman un circuito entre pisos de unos 70 m.
- **Trampas (callejones de una sola puerta):** baño, despensa, planchaduría, costura, desván, capilla, portería y huéspedes. Ahí solo salva un escondite.
- **Embudos:** el zaguán (única salida a la base) y el arco doble del cubo de escalera.
- **Metas medibles:** cada piso tiene al menos un lazo de 40 m o más; ningún tramo recto mide más de 28 m; los callejones son a lo más el 30 % de los cuartos; desde cualquier cuarto hay un escondite a 12 m o menos.

#### Luz, ventanas y detalles de época

- **Planta baja:** ventanas con reja de hierro solo a la calle (despacho, portería, botica, cochera). Los cuartos interiores reciben luz del patio por puertas y ventanas con postigos de madera.
- **Planta alta:** balcones con barandal de hierro a la calle en las recámaras y el salón; el balcón central queda sobre el zaguán.
- **Capilla** de doble altura con ventana alta. **Traspatio** a cielo abierto, con luz de luna.
- **Detalles:** vigas de madera, nichos con santos, macetas y tinajero en el corredor, piso de barro en los servicios y de duela en las recámaras, azulejo en cocina y baño, portón de madera con aldaba.

#### Notas para implementar

- **Escalera principal de dos tramos:** el tramo 1 (x 4–13, y 26–27) sube hacia el oeste hasta un descanso (x 1–3) a media altura; el tramo 2 (x 4–13, y 22–23) sube hacia el este y llega al rellano alto. Si el motor solo admite rampas rectas, usar dos rampas encadenadas con el descanso como zona «entre pisos».
- **Escalera de servicio:** recta, x 38–45, y 1; sube hacia el este de la cocina al cuarto de la nana.
- **Capilla de doble altura:** en la planta alta, la zona sobre la capilla (y 5–9) es vacío, con barandal en y 5; el coro alto (y 1–4) mira hacia abajo.
- **Escondites:** usan el sistema actual. Los **muebles que se abren** son nuevos: cada uno tiene posición, tipo, cuarto y lista de objetos, y se sincroniza en línea como las puertas.
- **Zaguán:** sin escalera. Su portón doble es la puerta que se cierra en el suceso «tocan el zaguán».

## 9. Cámara, controles, arte, audio e interfaz

La casa es un diorama 3D de papel visto desde arriba y de cerca: muros con volumen, personajes recortados y una sola luz cálida que pelea contra el índigo.

### 9.1 Cámara

|  | Investigador | Ánima |
| --- | --- | --- |
| Tipo | Tercera persona, ángulo 55°, 9 m de distancia | Tercera persona, ángulo 70°, 14 m de distancia |
| Muros que tapan | Se recortan a media altura solo en el cuarto donde estás; los demás quedan completos | Todos a media altura: ve la planta |
| Rotación | 4 posiciones fijas (Q/E en mando, rueda en ratón) | Libre |
| Visión | Cono de linterna con sombras; fuera de él, casi negro | Tonos fríos; solo muestra lo que su perfil de visión y oído percibe (§5.5) |

### 9.2 Controles

| Acción | Teclado y ratón | Mando | Táctil (navegador) |
| --- | --- | --- | --- |
| Moverse / apuntar la linterna | WASD / ratón | Stick izquierdo / derecho | Joystick / arrastrar |
| Correr | Shift | L3 | Botón |
| Usar el objeto en mano | Clic izquierdo (mantener para herramientas) | R2 | Botón |
| Cambiar de ranura | 1–4 o rueda | L1 / R1 | Botón |
| Aventar / pasar | Mantener clic derecho para apuntar, soltar para lanzar | L2 | Mantener el botón y arrastrar |
| Dejar en el piso | G | B / Círculo | Botón |
| Interactuar (tomar, escondite, apagador, maletín) | E | A / X | Botón |
| Libreta | Tab | Select | Botón |

### 9.3 Arte: escultura vectorial de aristas duras (18 de noviembre)

Todo el juego se ve como una **escultura low-poly de caras planas y colores mate**: homenaje a los polígonos sin textura de los años 90 (*Virtua Fighter*), con la sensación de papel grueso de *Tearaway*. Cada cambio de plano se lee como un trazo vectorial gracias a la luz, sin contornos negros ni texturas. Sustituye al «diorama de papel» con recortes 2D.

| Regla | Cómo se aplica | Por qué |
| --- | --- | --- |
| Sombreado por cara | Normales por cara, `flatShading`, nunca suavizado | El contraste en cada arista (bandas de Mach) hace de línea vectorial (Gouraud, 1971; Phong, 1975) |
| Mate puro | `roughness` 0,9 a 1, `metalness` 0 (metal real hasta 0,25) | Superficies de papel, barro y algodón sin brillo plástico (Oren y Nayar, 1994) |
| Sin curvas | Cilindros de 5 a 8 lados; cabezas de 6 a 8 lados con 3 o 4 cortes; extrusiones solo con rectas | Todo parece trazado con regla |
| Sin rostro | Sin ojos, cejas ni boca; solo planos de pómulo, mandíbula y nariz. Las ánimas pueden tener rombos emisivos como ojos | Abstracción icónica: evita el valle inquietante y pasa la expresión al cuerpo (McCloud, 1993) |
| Silueta primero | 80 % silueta, 15 % masas de ropa, cabello y accesorios, 5 % cortes de color | Se lee a la distancia de la cámara (Mitchell y otros, 2007) |
| Capas con grosor | Cada prenda (rebozo, poncho, chaleco, falda, abrigo) es una malla propia de 2 a 5 cm de grosor; las franjas de color son anillos o relieves, no texturas | Proyectan sombra entre sí, como pliegos de papel |
| Cabello en masas | 2 a 4 volúmenes grandes que sobresalen del cráneo; trenzas como rombos alternados | Se reconoce el peinado por detrás |
| Proporción adulta | 6 a 7 cabezas, extremidades ahusadas, manos en mitón angular; ni chibi ni bloques | Elegante, no prototipo |

- **Fuente de verdad:** las hojas aprobadas de los 13 personajes y las 6 apariencias del ánima (paquete v02): silueta, capas, accesorios y paleta hex. Los rostros dibujados se traducen a planos sin facciones.
- **Presupuesto:** personajes y ánimas de 500 a 1.800 triángulos; muebles de 150 a 600; herramientas de 60 a 250.
- **Ánimas:** sus apariencias usan bordes dentados de papel rasgado y humo hecho de poliedros, nunca partículas difusas. Al revelarse en la huida muestran la ilustración de su carta.
- **Escenario y luz:** la casona usa el mismo lenguaje (molduras rectas, patas ahusadas, arcos en segmentos) con sombras proyectadas nítidas. La paleta es la de las hojas: vino, cempasúchil, petróleo, hueso, ciruela e índigo.
- **Interfaz:** los íconos son los de las cartas.
- **Prohibido:** esferas suaves, cápsulas, toros redondos, cubos sin deformar, vóxeles, chibi, materiales brillantes y ruido aleatorio en los vértices.

### 9.4 Diseño de sonido

El sonido es información: casi todo lo que hace el ánima se oye antes de verse. Todo el audio es 3D (binaural con audífonos) y atraviesa muros y pisos con filtro de paso bajo.

| Momento | Sonido | Quién lo oye |
| --- | --- | --- |
| Ambiente | Madera que cruje, viento en el patio, perros lejanos y una campana de templo cada hora de la casa | Todos |
| Pasos de investigadores | Madera en los cuartos, piedra en patio y corredor, azulejo en cocina y baños; la escalera suena hueca y más fuerte | Todos; el ánima si están en su oído |
| **Escalofrío** | Un aliento helado y un susurro sin palabras **pegado a la nuca**: suena detrás de la cabeza aunque gires; vibra el mando | Solo quien lo recibe |
| Apagar la luz | Clic del apagador y el zumbido de un foco que muere | Quien esté en el cuarto o a 10 m |
| Encender la luz (Nachito) | Clic y una risa corta de niño | Igual |
| Portazo | Golpe seco con eco y el marco vibrando | A 20 m, también en el otro piso |
| Mover un objeto | Arrastre de madera o una pieza de barro que cae | A 12 m |
| Susurro | Voz sin palabras, filtrada, como de radio mal sintonizado | A 8 m |
| Herramientas | Termómetro: bip agudo; Grabadora: estática de cinta; EMF: chasquidos que aceleran; Lámpara UV: zumbido eléctrico; Cámara: obturador y rebobinado; Espejo: vidrio que tintinea; Sensor de gases: silbido y aguja | Todos cerca; el ánima a 12 m |
| Resultado | Sí: una campanita grave. No: un golpe sordo. Nada: estática que se corta | Quien lee |
| **Cacería** | Los focos zumban y parpadean; un latido que **se acelera al ritmo del ánima**; un son jarocho lento con jarana desafinada que también acelera; los pasos propios del ánima | Todos en el piso; el otro piso, apagado |
| Pasos del ánima en cacería | Base: pies descalzos arrastrados. Nahual: pezuñas. Planchada: tacones y tela almidonada. Nachito: pasos cortos y rápidos. Mal Aire: ninguno, solo viento helado | Todos en el piso |
| Escondido | Respiración contenida del personaje, el corazón y el mundo amortiguado | Quien se esconde |
| Rosario / Copal | Cuentas que chocan y un rezo entrecortado / resina que crepita y humo que sisea | Cerca |
| Nombrar en el altar | Las veladoras se avivan y se oye un coro lejano | Todos, en toda la casa |
| **Huida** | Las campanas del templo tocan a destiempo, la casa entera cruje y las puertas se azotan solas | Todos |
| Cordura baja | Acúfeno agudo y voces falsas que dicen tu nombre (no son pistas) | Quien tiene 50 o menos |
| Alba | Gallos y la primera campana; la música se disuelve | Todos |

**Sellos.** Cada sello tiene un sonido propio, distinto de su parecido: rezo lejano (Ánima en pena), risa de niño (Nachito), agua que gotea y llanto (Llorona), risita y algo que cae lejos (Chaneque), un nombre susurrado (Matlacíhuatl), bisagra lenta y respiración dentro de un ropero (Cucuy), monedas que tintinean (Guardián), gruñido (Nahual), cuentas que se rompen y ruedan (Demonio), sábanas que se estiran (Planchada), varios golpes a la vez (Chocarrero), aleteo (Tlahuelpuchi) y escarcha que cruje (Mal Aire).

**El ánima humana** oye el mundo con un filtro grave; lo que entra en su oído aparece en su pantalla como ondas que salen del lugar del ruido.

### 9.5 Interfaz

- **Mínima en pantalla:** la cordura es una vela que se consume junto al retrato; la herramienta elegida aparece en la mano del personaje.
- **Libreta de campo** (Tab): evidencias (Sí, No, sin probar), sellos presenciados con la hora y quién los vio, y las ánimas que siguen siendo posibles. Se acusa desde el altar, no desde la libreta.
- **HUD del ánima:** barra de presencia con su estado (libre, agotada, descanso), fenómenos con su espera y la cordura aproximada de cada investigador (en 3 niveles, no el número exacto).

## 10. Equilibrio, métricas y fundamento

La meta es que el ánima gane entre 45 y 55 % de las partidas con cualquier tamaño de mesa. El prototipo v0.1 ya lo logra entre bots, con 160 noches por ánima y tamaño de mesa.

### 10.1 Resultado del prototipo v0.1 (bots contra bots)

| Investigadores | El ánima gana | Lo justo | Fuera de rango |
| --- | --- | --- | --- |
| 1 (Duelo) | 56 % | 50 % | — |
| 2 | 48 % | 50 % | Matlacíhuatl 64 % |
| 3 | 52 % | 50 % | — |
| 4 | 47 % | 50 % | El Cucuy 42 % |

Sin la fuerza de la mesa (§5.1), el ánima ganaba 77 % en Duelo y 22 % con 4 investigadores. Es el mismo problema que la mesa resolvió con el dado bajo el vaso: más investigadores reparten mejor el riesgo.

Los bots no farolean ni sienten miedo. Estos números son una brújula; el playtest con personas decide.

Esta versión cambia reglas que mueven mucho el equilibrio: la cacería por cordura del grupo, la aceleración al ver, los perfiles, el segundo piso y la huida. Hay que volver a medir todo con la v0.2.

**Medido en v1.6** (66 noches, 4 bots, normal, casona v11, 19 nov 2026): la balanza quedó cerca de 50/50.

| Métrica | v1.4 | v1.6 |
| --- | --- | --- |
| Ánima en su guarida | 29 % | 62 % |
| Acciones visibles del ánima por minuto | ≈ 3,4 | ≈ 1,5 |
| Cacerías / muertes por noche | 2,5 / 1,3 | 1,7 / 0,5 |
| Bots encuentran la guarida | 35 % | 79 % (mediana 133 s) |
| Pruebas halladas por noche | 0,9 de 3 | 1,9 de 3 |
| Apuestas correctas | ≈ 25 % | 51 % |
| Gana equipo / ánima | 33 % / 67 % | 36–48 % / 44–56 % |
| Fusibles botados por noche | ≈ 2 | 0 |

La prueba más evidente es la cámara; la más difícil, el espejo (6 de 11 descartes del espejo fueron errores). Las cifras varían entre corridas: tomar los rangos, no un número.

### 10.2 Métricas que registra cada partida

| Métrica | Meta en Normal |
| --- | --- |
| Victoria del ánima | 45–55 %, y cada ánima a 5 puntos o menos de la media |
| Duración | 12–16 min |
| Primera cacería | Minuto 4 a 7 |
| Tiempo hasta la 1.ª prueba | 3–5 min |
| Partidas decididas por un sello | 30–60 % |
| Nombres equivocados | 5–15 % |
| Huidas en que escapa la mitad o más | 50–70 % |
| Muertes por cacería dentro de un escondite | Menos de 10 % (salvo el Cucuy) |
| Veces que el ánima queda agotada | 1–3 por partida |
| Jugadores que adivinan el ánima por su perfil antes de la 2.ª prueba | 20–40 % (se mide en playtest) |
| Rosarios usados que salvaron una vida | 60–80 %: si es menos, sobran; si es más, el Rosario decide demasiado |
| Objetos sin usar al final | Menos de 30 % del equipo |

### 10.3 Fundamento teórico

- **Señales costosas contra charla barata.** En la teoría de señales de [Spence (1973)](https://www.sfu.ca/~allen/Spence.pdf), una señal es creíble cuando imitarla le costaría demasiado a otro tipo. El sello cumple ese papel: otra ánima no puede producirlo. Los fenómenos compartidos son *charla barata* en el sentido de [Crawford y Sobel (1982)](https://www.econometricsociety.org/publications/econometrica/1982/11/01/Strategic-Information-Transmission): mensajes sin costo que, cuando los intereses chocan, solo transmiten información gruesa. Por eso el ánima humana puede despistar con ellos, pero no fingir un sello.
- **Mecánicas, dinámicas y estética.** El GDD sigue el marco MDA de [Hunicke, LeBlanc y Zubek (2004)](https://users.cs.northwestern.edu/~hunicke/MDA.pdf): las mecánicas (presencia, alcance, sellos) se eligen por la dinámica que producen (acercarse es peligroso; el ánima debe retirarse) y esa dinámica, por la emoción buscada (deducir con miedo).
- **Equilibrio de Nash ya medido.** En la mesa, el dado bajo el vaso quedó justo cuando los investigadores destapaban 75–85 % de las veces (*Estado del juego*). En el videojuego, la decisión equivalente es acercarse a leer o retirarse. Se medirá igual: estrategias de bots contra estrategias de bots.
- **Información por lectura.** Con 13 ánimas y 7 evidencias, dos evidencias dejan de 1 a 3 candidatas; un sello o un rasgo del perfil decide entre ellas. El bot elige la herramienta que mejor divide a las candidatas, que es la que da más información por lectura.

## 11. Tecnología, alcance y producción

La siguiente versión (v0.2) será un prototipo **3D en el navegador con Three.js**, sobre el mismo motor de reglas del v0.1. La producción final se hará en Unity 6.

### 11.1 Por qué dos tecnologías

|  | Prototipo web (Three.js) | Producción (Unity 6, URP) |
| --- | --- | --- |
| Para qué | Probar la cámara 3D, la oclusión y los sellos en días | Juego completo, arte final, juego en línea |
| Ventaja | Un enlace que se abre en cualquier navegador; se itera rápido | Herramientas de arte, iluminación, red y consolas |
| Límite | Sin juego en línea (la página no puede conectarse a servidores) | Más lento de iterar |
| Reglas | Motor en JavaScript sin dependencias | Mismo motor portado a C# puro, con las mismas pruebas |

El motor de reglas vive separado del dibujo. Así se simulan miles de noches sin gráficos en ambas tecnologías.

### 11.2 Alcance de la v0.2

**Entra:**

- La casona en 3D con sus dos pisos y dos escaleras, con todos los modelos hechos en código (low-poly de papel, sin archivos externos): muros de 2,4 m, puertas, apagadores, muebles simples y los 28 escondites posibles (12–14 activos).
- Cámara en tercera persona con muros que se recortan, linterna con sombras y oscuridad real.
- Jugar como investigador o como ánima, contra bots.
- Las 13 ánimas de §6.3 como perfiles de datos sobre el Ánima en pena, con su pasiva, habilidad, sello y Espanto.
- Percepción del ánima por visión cercana, lejana y oído; cacería por la regla de cada perfil y aceleración al ver.
- Las 7 herramientas y el equipo con maletín, 4 ranuras, dejar, pasar y aventar; la libreta con evidencias, sellos y rasgos; el altar y la huida.
- Sonidos básicos generados en el navegador: escalofrío en la nuca, pasos, portazo, latido y campanas.
- Simulador de equilibrio integrado.

**No entra:** juego en línea, modo espíritu jugable, las otras 9 ánimas, arte final y audio grabado.

**Preguntas que debe responder:** ¿se puede reconocer a un ánima por cómo ve, oye y persigue? ¿Da miedo la cámara 3D con dos pisos? ¿La huida es un buen cierre?

### 11.3 Plan de producción

Las fases son secuenciales y cada una termina con una puerta: si no se cumple su criterio, se repite la fase antes de seguir.

&#91;embedded content: plan de producción · 5 fases y sus puertas\]

Las duraciones suponen trabajo de medio tiempo de una persona con ayuda de IA; con un equipo, el *vertical slice* y la alpha se acortan.

### 11.4 Herramientas del equipo

- **Control de versiones:** Git con Git LFS para imágenes, modelos y audio; ramas por función y revisión por *pull request*. Sirve también como ejemplo para las clases.
- **Red (producción):** Netcode for GameObjects con los servicios de Relay y Lobby de Unity; se confirma en preproducción.
- **Arte:** Blender, ProBuilder, Krita y generadores de imagen con los prompts del proyecto.

### 11.5 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- |
| Los perfiles son demasiado sutiles y nadie los nota | Alta | Alto | Exagerar las diferencias en la v0.2 (Nachito en la puerta oscura, el punto ciego de la Matlacíhuatl) y medir cuántos adivinan por perfil |
| 13 ánimas son demasiadas para equilibrar a mano | Alta | Medio | Todas son datos sobre la misma base; el simulador mide cada una |
| Los sellos son demasiado obvios o demasiado ocultos | Alta | Alto | Medir «partidas decididas por un sello» y ajustar disparadores |
| La cacería por cordura del grupo castiga al que cuida su cordura | Media | Medio | Probar el umbral; las ánimas de regla individual dan variedad |
| El ánima humana se aburre esperando su presencia | Media | Alto | Ajustar recarga; puede usar Escalofrío en descanso |
| Los dos pisos hacen que la gente se pierda | Media | Medio | Mapa en la libreta y escaleras con luz propia |
| El alcance crece más rápido que el tiempo disponible | Alta | Alto | Las puertas de cada fase; nada de juego en línea antes del *vertical slice* |

## 12. Apéndice

### 12.1 Números ajustables

Son los valores del prototipo v0.1; los marcados «v1» son propuestas nuevas de este GDD y faltan por medir.

| Parámetro | Valor | Notas |
| --- | --- | --- |
| Duración de la noche | 900 s (15 min) | v0.1 duró 420 s |
| Ánima despierta tras | 15 s |  |
| Velocidad investigador / corriendo | 2,6 / 3,7 m/s | Aliento: 4 s |
| Cordura inicial | 100 |  |
| Oscuridad | −0,12/s (corredor y galería −0,05) |  |
| Ánima cerca (3 m) | −0,4/s |  |
| Lectura | Por herramienta, según §5.3; sin costo de cordura |  |
| Recalibración de herramienta | 5 s |  |
| Visión base cercana / lejana / oído | 5 / 14 / 12 m | Cono lejano de 120°; oído entre pisos a la mitad |
| Cacería base | Promedio de vivos ≤ 50; dura 20 s; espera 25 s; presencia mínima 8 s | Duelo: umbral −10 |
| Persecución base | 2,4 m/s; +0,15 por segundo viendo; tope 4,0; vuelve a 2,4 tras 3 s sin ver; aliento de 100, correr gasta 20/s |  |
| Escalofrío | −10 a 4 m; espera 10 s; cuesta 2 s |  |
| Apagar / portazo / mover / susurro | Esperas de 6 / 8 / 8 / 12 s | Por perfil: ×0 a ×3 |
| Equipo | 10, 17, 23 o 30 puntos según la mesa; 4 ranuras por persona | Rosario: ciega 5 s. Ver §5.8 |
| Escondites | 28 posibles; 12–14 activos; mínimo 6 por piso y 1 por ala | Uno a 18 m o menos de cualquier punto |
| Fuerza de la mesa | ×0,2 / ×1,1 / ×2,4 / ×3,4 | Para 1 / 2 / 3 / 4 investigadores; por medir de nuevo |
| Nombrar | 2 pruebas (Alba: 1); ritual de 2 s | Un sello cuenta como prueba |
| Huida | 90 s; gana el equipo si escapa la mitad de los vivos (mínimo 1) | Al Alba, el ánima al 70 % y sin Espanto |

### 12.2 Glosario

| Término | Significado |
| --- | --- |
| Ánima | El espíritu que habita la casona; lo controla la IA o una persona |
| Ánima en pena | El ánima base: todo estándar y sin habilidad especial |
| Perfil | Los valores que hacen distinta a cada ánima: visión, oído, velocidad, cacería, fenómenos |
| Visión cercana / lejana | Radio en el que ve en todas direcciones / alcance de su cono de 120° |
| Punto ciego | Distancia entre ambas visiones en la que el ánima pierde a alguien |
| Presencia | Temporizador del ánima fuera de su cuarto |
| Agotada / descanso forzado | Presencia en 0: vuelve sola y queda inmóvil hasta recargar |
| Evidencia | Lo que detecta una herramienta; cada ánima tiene 3 de 7 |
| Sello | Comportamiento que solo un ánima produce; cuenta como prueba |
| Parecido | El fenómeno compartido que se confunde con un sello |
| Fenómeno compartido | Acción que casi cualquier ánima puede hacer; no prueba nada |
| Prueba | Evidencia confirmada o sello presenciado |
| Cacería | Persecución mortal; empieza según la regla de cada perfil |
| Escondite activo | Uno de los 12–14 escondites habilitados en esta partida |
| Nombrar | Decir el nombre del ánima en el altar de la Capilla |
| Huida | Los 90 s tras nombrarla bien, para salir por el Zaguán |
| Espanto | El arma única del ánima durante la huida |
| Alba | Fin de la noche; última oportunidad con 1 prueba |
| Fuerza de la mesa | Multiplicador que equilibra según el número de investigadores |
| Maletín | El equipo inicial del grupo, en el Zaguán |
| Ranura | Espacio para un objeto; cada investigador tiene 4 |
| Puntos de equipo | Presupuesto que mantiene equilibrada la cantidad de objetos según la mesa |

### 12.3 Documentos relacionados

*Reglamento v5*, *Estado del juego*, *Prompts de arte* y *De la mesa al videojuego* (videojuego-demo), en el proyecto *Creación de juegos de Mesa*.

**Fuente central:** este documento manda. Una copia en Markdown vive en el repositorio como `docs/GDD.md` y se regenera desde aquí (los diagramas solo se ven en el documento vivo). Los documentos técnicos del repositorio lo complementan, no lo contradicen:

| Archivo del repositorio | Qué tiene |
| --- | --- |
| `docs/casona-v11.md`, `docs/casona-v12.md` | Construcción del plano, colisiones y recorridos de la casona |
| `docs/decoracion-v13.md` | Decoración y mobiliario de los cuartos |
| `docs/avance-grafico-v10.md`, `docs/arte-alex.md`, `docs/arte-elenco.md`, `docs/revision-mallas-personajes.md` | Arte y personajes aprobados |
| `juego/assets/s/CREDITOS.txt` | Sonidos usados y pendientes |

Si algo de esos archivos contradice al GDD, gana el GDD y se corrige el archivo.
