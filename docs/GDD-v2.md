<!-- Copia del GDD v2 vivo: https://claude.ai/artifact/Pjw8cBSvPDTHDoSgFGjVms · 2026-11-19. Se edita en el documento y esta copia se regenera. El diagrama del ciclo solo se ve en el documento vivo. -->

# Noche de Ánimas — GDD v2: Liberar la casona

19 nov 2026 · Jonathan

La v2 convierte cada partida en una campaña: un ánima poderosa trajo a varias ánimas a la casona y el equipo debe liberarlas una por una. Cada ánima que no descubren se queda y otra llega, así que los fracasos se acumulan en la casa.

## 1. Visión v2

**Fantasía:** un ánima poderosa arrastró a muchas almas a la casona. El equipo vuelve noche tras noche a liberarlas una por una; cada fracaso deja a un ánima más atormentando la casa.

**Qué la separa de Phasmophobia:**

| | Phasmophobia | Noche de Ánimas v2 |
| --- | --- | --- |
| Partida | Independiente: ganes o pierdas, la siguiente empieza igual | Campaña: la casona recuerda quién sigue ahí |
| Fantasmas por partida | Uno | De 1 a 3 a la vez; los que no liberas se acumulan |
| Pregunta de deducción | ¿Qué fantasma es? | ¿Qué ánimas son y de cuál es cada prueba? |
| El mapa | Fijo | Se abre cuarto por cuarto al liberar ánimas |
| Meta final | Ninguna | Vencer al ánima poderosa y liberar la casona |

**Pilares v2:**

1. **La casona recuerda:** lo que no resuelves esta noche te espera la siguiente.
2. **Cada prueba tiene dueña:** encontrar la guarida importa tanto como leer la herramienta.
3. **Buscar siempre:** la guarida se sortea cada noche; abrir un cuarto nunca dice dónde está el ánima.
4. **Folclor y la casona como ente:** se quedan de la v1.

## 2. La campaña

Una campaña normal sortea **6 ánimas** y dura **unas 9 noches (≈ 2 h)**. Gana quien las libera a todas y luego vence al ánima poderosa; pierde quien llega a tener 3 ánimas a la vez y no libera ninguna.

*[Diagrama: ciclo de la campaña · noche, liberación, llegada y tope de 3 — ver el documento vivo]*

Si liberan a algunas pero no a todas, la siguiente noche solo siguen las que quedaron; si no queda ninguna activa, llega la siguiente del sorteo.

**Al empezar:**

- Se sortean en secreto las ánimas de la campaña: corta 4, normal 6, larga 9 (de las 22).
- Se elige el **ánima poderosa**, la que las trajo a todas. Propuesta: el **Charro Negro**, que cobra almas por deudas.
- La noche 1 empieza con **1 ánima activa** y la casona casi tapiada.

**Al terminar cada noche:**

1. Cada ánima activa que alguien vivo nombró bien al salir queda **liberada** y no vuelve.
2. La que no liberaron **se queda**: conserva su columna de la libreta con las pruebas ya confirmadas, pero **cambia de guarida** (§3).
3. **Llega una nueva** del sorteo solo si no liberaron ninguna, o si ya no queda ninguna activa. Liberar 1 de 2 da una noche de respiro: la siguiente solo queda 1.
4. Cada ánima liberada da **llaves para abrir cuartos: 3 en una campaña normal** (§5).

**Tope y derrota:** nunca hay más de **3 ánimas activas**. Si terminan una noche con 3 y no liberan ninguna, el ánima poderosa despierta antes de tiempo: **la campaña se pierde**. Lo que sí se conserva es el **bestiario**: las ánimas que alguna vez liberaron quedan con sus pruebas a la vista para la siguiente campaña.

**Victoria:** con todas las ánimas del sorteo liberadas se juega la **Noche grande** contra la poderosa (15 min, pesadilla). No se trata de adivinar quién es, sino de pagarle sus deudas (§8). Si pierden, se repite la Noche grande.

**Duración de la noche:** 10 min con 1 ánima, 13 con 2, 16 con 3.

**Muertes:** quien muere vuelve la noche siguiente con 70 de cordura.

## 3. Guaridas: siempre hay que buscar

Abrir un cuarto **nunca** dice dónde está un ánima: cada noche, cada ánima activa sortea su guarida entre **todos** los cuartos abiertos, y el cuarto recién abierto tiene la mitad de probabilidad que los demás, nunca más.

**Peso de cada cuarto abierto en el sorteo:**

| Cuarto | Peso |
| --- | --- |
| Cualquier cuarto abierto | 1 |
| Su cuarto favorito (si está abierto) | ×2 |
| El último cuarto que se abrió | ×0,5 |
| Su guarida de la noche anterior (si se quedó) | 0: siempre se muda |
| La guarida de otra ánima activa | 0: nunca comparten |
| Un cuarto con puerta a la guarida de otra ánima | ×0,5: tienden a separarse |

El favorito **no es una ley**: solo pesa doble, y nadie lo conoce hasta abrir la Biblioteca (libro de leyendas) o liberar esa ánima una vez (bestiario).

**Probabilidad de que un ánima esté en el cuarto recién abierto:**

| Cuartos abiertos | Sin sesgo (uniforme) | Con estas reglas |
| --- | --- | --- |
| 8 | 12,5 % | 6,7 % |
| 8, y su favorito está abierto en otro cuarto | 12,5 % | 5,9 % |
| 14 | 7,1 % | 3,7 % |
| 22 | 4,5 % | 2,3 % |

Cálculo: con *n* cuartos abiertos de peso 1 y el nuevo de peso 0,5, la probabilidad es 0,5 / (n − 1 + 0,5). Lo nuevo es solo **más casa donde buscar**.

## 4. Varias ánimas a la vez

**Una prueba solo cuenta para el ánima en cuya guarida se leyó.** Sin esta regla no se podría deducir nada: con las 22 ánimas actuales, si las pruebas de dos ánimas se juntan, el **92 %** de las parejas son ambiguas (en promedio 5 parejas encajan igual).

**La libreta:**

- Una columna por ánima activa: *Ánima A, B, C*. Cada columna tiene sus 7 casillas de prueba y su apuesta.
- Una prueba leída dentro de una guarida va a la columna de esa guarida. Leída fuera (pasillos, cuartos vecinos) se anota como **sin dueña** y no cuenta hasta repetirse dentro de una guarida.
- Un ánima que se quedó de la noche anterior **conserva su columna**, pero se mudó: el equipo tiene que descubrir cuál de las guaridas de hoy es la suya. Sus pruebas ya confirmadas sirven para reconocerla.

**La noche con 2 o 3 ánimas:**

- Cada una tiene su perfil completo (velocidad, visión, habilidad). Ver cómo caza también ayuda a saber cuál es.
- **Una cacería a la vez:** cualquiera puede iniciarla, pero el enfriamiento es compartido. La presión total sube ×1,3 con 2 ánimas y ×1,5 con 3, no ×2 ni ×3.
- Son territoriales con su propia guarida: rondan su cuarto y los que tienen puerta con él, como en la v1.6. Así sus zonas casi no se mezclan.
- La casona sigue tirando un solo dado.
- Al salir, cada quien apuesta una ánima **por columna**. Cada columna acertada libera a esa ánima; una equivocada solo la deja en la casa.

**Lo que pide al equipo:** dividirse. Unos se quedan en una guarida y otros van a la otra, y eso deja a cada grupo más solo frente a las cacerías.

### Cómo se sabe de quién es cada prueba

Cuatro señales, de la más gruesa a la más fina:

1. **El frío marca las guaridas.** Con 2 ánimas hay 2 cuartos fríos; termómetro y EMF dicen cuáles son. Lo leído dentro de un cuarto frío es de esa ánima.
2. **Marca de la noche.** Al empezar, cada ánima activa recibe al azar una señal: olor a cempasúchil, campanita o gotas de agua. Cada vez que deja una prueba, su señal aparece débil en ese punto. Cambia cada noche y no depende de qué ánima sea: dice **de quién** es la prueba, no **qué** ánima es.
3. **Sin dueña:** lo leído en un pasillo o entre dos cuartos no cuenta hasta que la marca o una segunda lectura lo confirmen.
4. **La libreta avisa:** una columna con 4 pruebas, o sin ninguna ánima posible, tiene una prueba mal asignada.

La marca es sutil a propósito: a veces no se nota y alguien anota en la columna equivocada. Corregirlo es parte del juego.

## 5. La casona que se abre

Cada ánima liberada da **llaves**, y cada llave abre un cuarto tapiado. La casona empieza con 5 cuartos y queda casi completa antes de la Noche grande.

| Campaña | Ánimas | Llaves por ánima liberada | Cuartos abiertos al final |
| --- | --- | --- | --- |
| Corta | 4 | 5 | 5 + 18 |
| Normal | 6 | 3 | 5 + 18 |
| Larga | 9 | 2 | 5 + 18 |

- **Cada llave:** la casona muestra 3 cuartos tapiados que tengan puerta con lo ya abierto; el equipo vota uno (empate: el anfitrión).
- **La escalera** cuesta 1 llave y aparece como 4.ª opción en cuanto haya 3 cuartos de la planta baja abiertos.
- **Desván y Coro** nunca se abren con llaves: ahí espera la poderosa y se abren solos en la Noche grande.
- **Las 7 herramientas base siempre están.** Cada cuarto agrega un complemento acorde a él, no poder: más opciones y más casa donde buscar.

**Abiertos desde el inicio:** Zaguán, Patio, Corredor y 5 cuartos (Comedor, Cocina, Despacho, Portería, Despensa seca).

| Cuarto | Piso | Complemento | Tipo |
| --- | --- | --- | --- |
| Capilla | PB | Rosario y cruz de palma | Protección |
| Botica | PB | Copal, ruda y limpia con huevo | Protección |
| Repostería | PB | Pan de muerto | Apoyo |
| Cuarto de aperos | PB | Focos de repuesto y +1 al límite de luces | Mapa |
| Planchaduría | PB | Armario escondite seguro | Mapa |
| Biblioteca | PB | Libro de leyendas: muestra el cuarto favorito de cada ánima | Información |
| Traspatio | PB | Segunda salida para la huida | Mapa |
| Escalera principal | PB | Abre la planta alta (Rellano y Galería) | Mapa |
| Recámara de la abuela | PA | Té de tila | Apoyo |
| Cuarto de la nana | PA | Veladoras (luz sin fusibles) | Apoyo |
| Recámara principal | PA | Puño de ceniza | Apoyo |
| Recámara de la hija | PA | Cámara instantánea | Información |
| Huéspedes | PA | Cama escondite y ruta por la galería | Mapa |
| Baño | PA | Espejo de plata | Maldito |
| Recámara de niños | PA | Tablilla espiritista | Maldito |
| Sala de música | PA | Radio | Maldito |
| Costura | PA | Mano del mono | Maldito |
| Salón de estrado | PA | Tarot | Maldito |
| Desván | PA | Muñeca de la isla (solo en la Noche grande) | Maldito |
| Coro | PA | Pentagrama (solo en la Noche grande) | Maldito |

Los cuartos favoritos de cada ánima son los de la propuesta del GDD v1, §3.4. Los malditos quedan arriba para cuando el equipo ya domina las herramientas.

## 6. Números

Con el tope de 3 ánimas, una campaña normal la gana casi 9 de cada 10 equipos como los bots actuales y 7 de cada 10 equipos novatos: se puede perder, pero no es una espiral sin salida. Simulación de 100 000 campañas por fila con las reglas del §2.

| Equipo | Campaña | Ganan | Noches (con la grande) | Llegan a tener 3 ánimas |
| --- | --- | --- | --- | --- |
| Novato | Corta (4) | 84 % | 8 | 32 % |
| Novato | Normal (6) | 71 % | 11 | 52 % |
| Novato | Larga (9) | 55 % | 15 | 71 % |
| Como los bots v1.6 | Corta (4) | 94 % | 7 | 22 % |
| Como los bots v1.6 | Normal (6) | 89 % | 10 | 38 % |
| Como los bots v1.6 | Larga (9) | 81 % | 14 | 56 % |
| Bueno | Corta (4) | 99 % | 6 | 9 % |
| Bueno | Normal (6) | 98 % | 9 | 18 % |
| Bueno | Larga (9) | 97 % | 12 | 28 % |

**Supuestos:** probabilidad de liberar cada ánima en una noche según cuántas haya: novato 40 / 35 / 30 %, bots 50 / 45 / 40 %, bueno 65 / 60 / 55 % (con 1 / 2 / 3 ánimas). La Noche grande cuenta como una noche más y se repite si se pierde. Las cifras de los bots salen de la v1.6; las de personas son estimadas y hay que medirlas en pruebas.

**Perillas de dificultad:** el tope (3) y el largo de la campaña. Con tope 4 los bots ganan el 98 %: demasiado fácil.

## 7. Qué se queda de la v1 y cómo implementarlo

El [GDD v1](https://claude.ai/artifact/MTSn6XdYSzKmtpxk5Hm9Un) (copia en `docs/GDD.md`) sigue mandando en todo lo que este documento no cambia: las 22 ánimas y sus pruebas, herramientas y qué cuenta como prueba, la casona como ente y su dado, cordura, luces, cacerías, voz y arte. Esta v2 **reemplaza** la campaña de veladoras del v1 §3.4. Del catálogo de cuartos de ese apartado se quedan los complementos y los favoritos; las veladoras y sus costos ya no existen.

| Qué | v1 | v2 |
| --- | --- | --- |
| Estructura | Noches sueltas | Campaña de 4, 6 o 9 ánimas + Noche grande |
| Ánimas por noche | 1 | 1 a 3 |
| Libreta | Una columna | Una columna por ánima activa |
| Abrir cuartos | Veladoras | Llaves por ánima liberada |
| Guarida | Sorteo con favorito al 40 % | Sorteo cada noche; favorito ×2, cuarto nuevo ×0,5 |
| Fin | Ninguno | Liberar la casona |

**Notas de implementación, en orden:**

1. **Varias ánimas en el motor:** pasar de un ánima (`w.g`) a una lista; cada una con su guarida, rastro, perfil y bot. Enfriamiento de cacería compartido.
2. **Pruebas con dueña:** cada lectura guarda en qué cuarto se leyó; la libreta y los bots las asignan por guarida.
3. **Libreta por columnas** y apuesta por columna al salir; en línea se sincroniza como hoy.
4. **Cuartos tapiados:** un cuarto tapiado no existe para el juego (no es guarida, sin escondites, aparatos ni sucesos, los bots no lo exploran). El mapa nuevo se diseña por alas que se puedan tapiar.
5. **Guardar la campaña** en el navegador del anfitrión: sorteo, ánimas activas con sus columnas, llaves, cuartos abiertos y bestiario.
6. **Pantalla entre noches:** quién se liberó, quién se quedó, quién llega, y la elección de cuartos.
7. **Menú:** *Campaña* (nueva o continuar) y *Noche libre* (la casa completa, una ánima, como hoy).
8. **Bots:** aprender a atribuir pruebas por guarida y a dividirse entre guaridas. Medir de nuevo con la simulación para calibrar los porcentajes del §6.

## 8. El Charro Negro: el jefe

El Charro Negro no está en el sorteo: es quien trajo a las demás y el jefe de toda campaña (quedan 21 ánimas para sortear). Su cuarto favorito es el Despacho, donde cierra sus tratos. Tiene tres mecánicas propias.

**1. Los tratos (desde la noche 2):** una vez por noche, como máximo, suena el teléfono, la radio o la tele de la base y el Charro ofrece algo a quien conteste:

| Ofrece (uno al azar) | La deuda |
| --- | --- |
| Revelar una prueba de una columna | Quedas **endeudado**: las ánimas siempre saben dónde estás y las cacerías te buscan primero |
| Revivir ya a un compañero muerto | Igual |
| Cordura al 100 | Igual |
| Una llave extra | Igual |

Una deuda se paga entregando una moneda extra en la Noche grande. Quien sigue endeudado al terminar la campaña **se queda en la casona**: su personaje aparece como un ánima de la siguiente campaña, con 3 pruebas al azar y su nombre.

**2. La Noche grande: pagar las deudas.** Ya saben quién es; no hay que adivinar.

- Cada ánima liberada dejó una **moneda del trato** que la ataba: 6 en una campaña normal, más 1 por cada deuda.
- Las monedas esperan en la mesa de la camioneta. Cada una ocupa una ranura y quien la carga es su presa favorita.
- Se entregan dejándolas en su guarida, que **cambia de cuarto cada 3 min** (se oye un relincho) y justo después de cada entrega.
- Se le rastrea con sus pruebas fijas: **bajo cero, EMF 5 y herraduras bajo la UV**. Por toda la casa aparecen **ecos falsos** de las pruebas de las ánimas liberadas; solo valen dentro de su guarida.
- 15 min. Con la última moneda pierde el caballo: 60 s para llegar a la camioneta y la casona queda liberada. Si mueren todos o llega el Alba, se repite la Noche grande.

**3. La cabalgata (su cacería):** a caballo es muy rápido en los espacios abiertos (patio, corredor, galería, rellano, zaguán), pero no cabe por las puertas de los cuartos. Si te ve entrar a un cuarto, a los 10 s se baja del caballo y entra a pie, más lento. La jugada es meterse a un cuarto, cerrar la puerta y esconderse. Se le oye venir por los cascos.

## 9. Plan para probarlo en el juego

**Estado de los cuartos (revisado el 19 nov):** los cuartos ya están en componentes, pero el juego aún no los usa para abrir o cerrar.

- Hay **27 módulos de cuarto** (`arte/modulos-casona/*.json` y `roomModules` en `src/layout-v11.json`) con medidas, muebles, decoración, escondites, puertas y datos de campaña: inicial o no, comprable, complemento y ánima favorita.
- **41 de las 44 conexiones son puertas** (2 arcos y el portón). Tapiar un cuarto puede ser trabar sus puertas con tablas, sin quitar geometría.
- **Dos bloqueos:** la Despensa seca solo tiene entrada por la Biblioteca (que empieza tapiada), y la escalera de servicio sube de la Cocina al Cuarto de la nana.
- **Para el prototipo:** empezar con la **Botica** en vez de la Despensa seca (tiene puertas a la Portería y al corredor) y tapiar el arranque de la escalera de servicio hasta abrir el Cuarto de la nana.

**Tres pruebas, una a la vez:**

| Prueba | Qué entra | Qué medimos | Pasa si |
| --- | --- | --- | --- |
| P1 · Campaña de 1 ánima | Puertas tapiadas; un cuarto tapiado no existe para ánima, bots, escondites ni sucesos; guarida sorteada con pesos; llaves y 1 de 3 cuartos; guardado del anfitrión | Qué tan seguido el ánima vive en el cuarto nuevo; tiempo para hallar la guarida según cuartos abiertos | Cuarto nuevo ≤ 7 %; nadie siente que «ya sabía dónde estaba» |
| P2 · Dos ánimas | Varias ánimas en el motor; marca de la noche; libreta por columnas; cacería compartida | Pruebas anotadas en la columna correcta; campañas ganadas | ≥ 70 % de columnas bien atribuidas por personas; campaña ganada 70–90 % |
| P3 · El Charro | Tratos, monedas, cabalgata, Noche grande | Cuántos aceptan tratos; duración y resultado de la Noche grande | Al menos 1 trato aceptado cada 2 noches; Noche grande de 10–15 min |

Cada prueba: primero simulación con bots, luego una partida con jugadores y 3 preguntas al final (¿qué fue lo más tenso?, ¿en qué momento te perdiste?, ¿querías jugar la siguiente noche?).
