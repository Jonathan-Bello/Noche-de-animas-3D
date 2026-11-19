# Casona v12 — mobiliario, uniones y recorridos

Esta revisión se integra sobre `cf15711`, conservando la libreta manual y la actualización territorial del ánima. Conserva personajes, animaciones, apariencias y reglas de evidencias. El [croquis amueblado](../arte/casona-v12/index.html) se genera del registro que usa el juego: permite seleccionar cada cuarto y consultar muebles, dimensiones, altura y contenido previsto.

## Fallos corregidos

**Esquinas rojas.** El color se evaluaba en cada vértice: un vértice sobre el límite de una habitación podía tomar el color del cuarto contiguo o el vino exterior. Ahora cada triángulo usa un color constante obtenido en su centro. No se mezclan colores de habitaciones sobre una cara plana.

**Arcos.** El marco extruido anterior invadía el volumen del dintel. Se sustituye por una construcción cuyas regiones de marco y muro comparten bordes y caras exteriores disjuntas. Se recorta la anchura completa del nuevo conjunto en la pared. También se retiran tapas internas coincidentes en sus encuentros y molduras que atravesaban el vano. La auditoría recorre las mallas transformadas a coordenadas del mundo y busca intersecciones coplanares de área positiva entre triángulos de los 44 vanos y los muros. Resultado: cero en las escenas comprobadas.

**Escaleras.** La comprobación anterior utilizaba radio de 0.22 m; los investigadores reales usan 0.30 m y el ánima, 0.32 m. La cápsula chocaba con el piso siguiente antes de que su raíz alcanzara el umbral del descanso. Se da holgura al cuerpo en el punto de transferencia, se centra la entrada antes de avanzar y se recupera dentro de su misma celda una cápsula que ya estuviera penetrando el borde. Se reduce la tolerancia de llegada de `steer`, que podía dejar al actor inmóvil a 0.039 m de una alineación requerida de 0.035 m. Los bots dejan de iniciar barridos de temperatura y desvíos para recoger suministros sobre los peldaños.

**Camioneta.** Se mueve al lado oeste de la explanada. Su malla, caja de colisión, punto de salida y posiciones iniciales se actualizan juntos. El eje del camino de acceso queda libre.

## Mobiliario coherente

Se elimina la búsqueda automática del primer hueco libre para colocar una mesa o un escondite. Todos tienen posición y orientación fijadas en `src/layout-v11.json`; se mantiene el nombre del archivo por compatibilidad con la herramienta de construcción, pero su versión interna es `casona-v12`.

- Cocina: fogón, fregadero, preparación y alacena; acceso de servicio libre.
- Despensas: conservas y repostería; mesas de trabajo y alacenas.
- Biblioteca: librero abierto de cuatro niveles, mesa de lectura y gabinete de doble fondo integrado al extremo del librero.
- Comedor: mesa, ocho sillas orientadas hacia ella, trinchero y vajilla.
- Despacho y portería: escritorios y archivos, reloj y materiales propios de su uso.
- Recámaras: camas con cabecero, almohadas, burós, cómodas y ropa; nana y huéspedes reciben camas propias.
- Costura, botica y estrado: mesa de costura, frascos, tocador y banca según la función del cuarto.
- Escaleras: arcones contra el perímetro de los vestíbulos, fuera de entradas, descansos y desembarcos.

Se mejoran también las siluetas de mecedora, caballito, máquina de coser, fregadero, reloj de péndulo, radio, muñeca, campanita y baúl. Los elementos rígidos de cada objeto se agrupan en una malla con colores por vértice y material mate compartido. Sus eventos y movimientos siguen perteneciendo a los mismos identificadores del juego.

Los **24 libros del librero son objetos sueltos independientes**, sincronizados como el resto de objetos arrojables. El lanzamiento usa una salida delante del estante para evitar que la propia colisión opaca del librero impida encontrar un destino. La animación empieza en la posición real del libro; no hay una copia estática que permanezca en la balda.

## Persecuciones y refugios

Los muebles no cambian de posición entre noches. Se sortea su disponibilidad y candado. Hay 24 candidatos; al llevar los refugios al perímetro y añadir arcones fuera de las escaleras, mantener la cobertura de 18 m requiere **21–22 activos** en las selecciones ensayadas. El nuevo presupuesto es 20–22, sustituyendo el de 18–20 de v11. Como antes, se mide el camino horizontal con puertas transitables y no garantiza sobrevivir a una cacería.

Los bots y el ánima hacen una pausa al abrir una puerta: 0.35 y 0.65 s respectivamente. Una puerta cerrada sobre la celda ocupada por el actor también se puede abrir desde dentro. Las comprobaciones visuales de testigos y bots reciben también el estado de las puertas; una puerta cerrada corta su línea de vista. No se modifican las velocidades ni las habilidades específicas de cada ánima para forzar un porcentaje de victorias.

## Calidad móvil e iPhone 12

El perfil automático táctil mantiene el límite de DPR 1 y las sombras desactivadas. El perfil bajo puede reducir gradualmente su resolución hasta el 65 % si la media de tiempo entre cuadros supera 40 ms, y recuperarla si vuelve a ser inferior a 24 ms. Se ajusta como máximo cada tres segundos. No se cambian colisiones, siluetas, materiales ni estado de red. Las calidades equilibrada y alta conservan su resolución elegida.

La geometría estática se agrupa por zona en vez de incluir todos los muebles de una planta en una única malla que no se podía descartar de la vista. Los suelos y plafones usan superficies sin caras internas de cajas contiguas. En la vista móvil de referencia, el recuento pasa de aproximadamente 84 mil a 33 mil triángulos por cuadro. Las cifras varían con objetos y jugadores; **no equivalen a una medición de FPS**.

Se prueba WebKit en Windows con los perfiles de Playwright `iPhone 12` y `iPhone 12 landscape`: entrada táctil, DPR de dispositivo 3 y renderizado limitado a 1. Se comprueban creación del contexto WebGL, compilación de materiales, renderizado y ausencia de errores JavaScript. Este perfil no reproduce la GPU ni la temperatura de un iPhone físico; incluso su cadena de identificación de GPU puede estar emulada.

## Validaciones

```sh
python src/build.py prod
node test/layout-v11-test.cjs
node test/visual-quality-test.cjs
GHOSTS=all node test/session-casona.cjs
python test/browser-layout-v11.py
python test/online-layout-v11.py
python test/review-casona-browser.py
python test/iphone12-webkit.py
python tools/capture_casona_v11.py
python tools/build_furnished_plan.py
```

En PowerShell, usar `$env:GHOSTS='all'; node test/session-casona.cjs` para la batería completa. Los scripts Python requieren las dependencias de QA descritas en [v11](casona-v11.md). WebKit usa la instalación aislada de `QA_Arte_Alex/browsers`; para instalarla en ese directorio, definir `PLAYWRIGHT_BROWSERS_PATH` al ejecutar `python -m playwright install webkit`.

Resultados de esta revisión:

- Acceso a los 22 cuartos; cobertura de refugios en 100 selecciones; colocación de suministros en 60 mundos.
- 24 recorridos de escalera con entradas descentradas, radios reales 0.30/0.32 m y tres pasos de tiempo diferentes.
- 22 partidas completas con cuatro bots y los 22 tipos de ánima: todas terminan, sin inmovilidad de más de 20 s detectada en las escaleras. Hubo 30 cacerías; 9 resultados a favor de investigadores y 13 a favor del ánima. La identificación de evidencias por bots influye en esos resultados, por lo que no son un estudio de balance humano.
- Partida completa en navegador con pantalla táctil emulada, dos cacerías y final a los 564.2 s de simulación. Se toman muestras de renderizado durante la sesión; no se presenta como una partida humana en tiempo real.
- Cuatro calidades, reinicio de escena, apertura de cajones, recuperación de resolución y croquis seleccionable sin desbordamiento horizontal móvil.
- Dos navegadores: movimiento, linterna, distribución aleatoria, cajones, lanzamiento de un libro independiente y desconexión sincronizados con transporte local de prueba.
- WebKit con iPhone 12 vertical y horizontal. Mallas y matrices finitas, colores constantes por cara y sin intersecciones coplanares detectadas entre vanos y paredes.

Los resultados resumidos están en `arte/casona-v12/`. Las capturas de inspección usan luces encendidas. Sigue pendiente verificar FPS, calentamiento y duración de batería en el iPhone 12 real del usuario, y afinar la dificultad mediante partidas humanas.
