# Las siete herramientas · V17

Los siete instrumentos usan un catálogo común: `src/tools-components.json`, con **88 piezas nombradas**, geometría en metros y agarres compatibles con los personajes actuales. El juego, el taller y las referencias comparten `src/tools-art3d.js`. Se conserva la casona V16 y sus borradores; esta versión actualiza el arte del equipo.

## Modelos y lecturas

| Herramienta | Modelo | Normal / dudoso / positivo y modo real de uso |
|---|---|---|
| Termómetro | Carcasa marfil facetada, sonda, panel numérico, botón y barra de asentamiento | En mano muestra la lectura real del portador, con un decimal y signo. Necesita unos 8 s quieto; 1–3 °C orientan, una lectura bajo cero asentada es la prueba. Sin portador muestra guiones. |
| Detector EMF | Cuerpo verde azulado, cabeza sensora y cinco pilotos separados, con número de nivel | Nivel 1 en reposo; 2–4 por sucesos recientes; 4 también puede ser interferencia. Solo 5 es prueba. Los pilotos del modelo y del panel usan el nivel y su temporizador reales. |
| Grabadora | Carcasa vino, micrófono, antena, rejilla, botón de pregunta y pantalla de onda | Silencio, estática y voz tienen ondas diferentes. Usar hace la pregunta; necesita oscuridad, una o dos personas y cercanía del ánima para responder. La estática no cuenta. |
| Sensor de gases | Carcasa ocre, entrada de gas, rejilla y manómetro octagonal con aguja pivotada | Muestreo normal, amarillo dudoso y rojo positivo. Responde a `gasAcc`, `yellowUntil` y `redUntil`, llevado o colocado. |
| Espejo | Marco octagonal ocre, mango de madera, virola y pie con puntal | Superficie limpia, vaho y mano geométrica de cinco dedos. El vaho no cuenta. Al llevarlo se oculta el pie; al dejarlo se despliega el soporte. |
| Lámpara UV | Mango hexagonal, interruptor, cabezal y lente octagonal violeta, pie de apoyo | No tiene pantalla de resultados ni cambia de color al detectar. Apunta a puertas y ceniza; las marcas aparecen en el entorno por las reglas existentes. |
| Cámara de video | Cuerpo con asa, objetivo octagonal, pantalla de canal y piloto REC; tripié completo o plegado | En mano informa del canal y cómo colocarla. Desplegada, el objetivo queda a **132 cm**, coincidiendo con la cámara virtual. La silueta sigue apareciendo **solo en la tele de la base**. Su pantalla local no consulta `ghostOn`. |

La demostración ofrece normal, dudosa y positiva para comparar las lecturas. En UV y cámara esos selectores **no fabrican una lectura local**: la prueba pertenece a la superficie o al monitor remoto. Los mensajes eléctricos de la casa siguen apareciendo en el panel de interfaz.

## Dirección visual

Prismas, cilindros de 4–8 lados y planos rectos. Materiales `MeshStandardMaterial`, `flatShading: true`, `roughness: 1`, `metalness: 0`. Colores sólidos, sin texturas ni biseles. La luz del taller es neutra sobre gris; las capturas de la partida conservan la iluminación nocturna.

| Función | Hex |
|---|---|
| Carcasa oscura / goma | `#232b30` / `#151e22` |
| Marfil / pantalla | `#d8cdb5` / `#a9c3ad` |
| Verde azulado / vino | `#315c5b` / `#6b2030` |
| Ocre / marco | `#b18a3f` / `#ba8d49` |
| Madera / vidrio mate / UV | `#805937` / `#78939b` / `#7751ac` |
| Pilotos EMF 1–5 | `#557a43`, `#829542`, `#c49a37`, `#b76d30`, `#ad3b3a` |

El vidrio es una superficie de color mate estilizada, sin reflexión dinámica. Los números físicos se construyen con segmentos geométricos; los paneles de interfaz son SVG planos. No se crean texturas de pantalla por fotograma ni luces dinámicas por instrumento. En partida se agrupan las piezas fijas por cuerpo, soporte y tripié plegado; el taller conserva cada pieza separada.

## Taller editable

Abrir `Abrir editor.cmd` y entrar a **Editar las siete herramientas**. También se puede abrir `http://127.0.0.1:8790/arte/instrumentos-v17/` después de ejecutar `python tools/editor_server.py`.

1. Elegir herramienta y pieza, desde la lista o pulsando el modelo.
2. Ajustar posición, giro, tamaño y color. En cilindros, los tres tamaños son radio superior, radio inferior y altura. El color de un piloto EMF es su color encendido; apagado conserva el tono oscuro.
3. Revisar frente, perfil y espalda ortográficos, o girar arrastrando. El visor distingue soporte desplegado y configuración de mano. El agarre se aplica a las animaciones del personaje al reconstruir el juego; las referencias de partida muestran el resultado real.
4. Guardar en el proyecto local. `/api/tools` valida el catálogo, guarda una copia de respaldo y reconstruye `juego/index.html`. Ante un error restaura ambos archivos. Guardar no publica en GitHub.

En GitHub Pages se puede editar, deshacer, importar y descargar el JSON. El guardado al disco solo está disponible mediante el servidor local. El botón **PNG 2048** exporta el modelo visible sobre fondo gris, sin interfaz, a 2048 × 2048 px.

Los IDs, roles de indicadores y grupos quedan protegidos en el guardado local: una corrección artística no puede convertir una pieza en otro sensor. Las medidas y posiciones tienen límites y solo se admiten valores finitos. Los cambios en `grip` conservan la jerarquía y las animaciones existentes.

## Integración y comprobaciones

Se retiró el reemplazo antiguo de los siete modelos en `base3d.js`: antes anulaba las fábricas compartidas después de crearlas. La cámara instantánea adicional conserva su modelo anterior. Los modelos aprobados de personajes, sus huesos, la navegación y las probabilidades de evidencia se conservan.

La interfaz usa el mismo adaptador de estados que las piezas 3D. Se corrigieron el texto «Ver foto» de la cámara de video y la descripción antigua del EMF. En móvil, el panel deja libre la altura real de los nueve botones táctiles, tanto en vertical como en horizontal.

- `python tools/check_tools.py`: siete herramientas y 88 piezas con transformaciones y geometrías válidas.
- `python test/tools-v17.py`: 21 estados, siete configuraciones de mano, modelos reales en partida, temperaturas del portador, expiración de lecturas, ausencia de filtración de `ghostOn`, guardado/deshacer, rechazo de cambios funcionales y PNG 2048.
- `python test/browser-layout-v11.py`: los cuatro perfiles gráficos y la geometría de la casona siguen funcionando.
- `python test/iphone12-webkit.py`: los siete paneles en WebKit, perfil iPhone 12 vertical y horizontal, sin cubrir los botones táctiles.

Las pruebas de iPhone son emuladas en WebKit; no equivalen a medir FPS en un teléfono físico. Las referencias y los resultados están en `arte/instrumentos-v17/`.
