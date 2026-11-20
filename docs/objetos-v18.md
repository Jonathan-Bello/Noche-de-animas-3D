# Consumibles, complementos y objetos malditos · V18

Se renuevan **18 modelos con 399 piezas editables**: diez consumibles, la cámara instantánea y los siete objetos malditos. Comparten la estética de las herramientas V17: planos rectos, prismas y cilindros de 4–8 lados, colores sólidos y materiales mates. No se cambian los efectos, costos, probabilidades ni condiciones de uso del juego.

## Consumibles y complemento

| Objeto | Arte y uso conservado |
|---|---|
| Té de tila | Taza con asa, infusión, etiqueta e hilo; platillo separado, oculto al sostenerla. Beber recupera cordura y consume el objeto. |
| Rosario | Dieciséis cuentas facetadas, cordón y cruz. Descansa tendido; se sostiene o cuelga verticalmente. Conserva los usos y la protección actuales. El objeto colgado se representa en el marco de la puerta. |
| Ruda | Tres tallos, hojas angulares y atadura. Se consume al usarla junto a una puerta; el mismo modelo aparece colgado durante el efecto. Se retira la representación genérica anterior. |
| Copal | Brasero octagonal de barro con carbón y resina. Usarlo o aventarlo lo consume y produce la nube existente, ahora con volúmenes facetados. No queda un segundo brasero. |
| Veladora | Recipiente vino, base, cera, mecha y llama geométrica. La llama depende de `lit` y `litUntil`; colocarla la enciende, aventarla la apaga. No se añade una luz dinámica por objeto. |
| Puño de ceniza | Bolsita abierta de tela con ceniza visible. Usar o dejar esparce la ceniza y consume la bolsa. Las huellas siguen dependiendo del paso del ánima y de la UV. |
| Cruz de palma | Tres tiras entretejidas por brazo y dos ataduras visibles para las dos cargas. Se coloca para proteger el radio actual y desaparece cuando el juego la agota. |
| Pan de muerto | Pan facetado con huesitos cruzados, nudos y centro. Se deja como ofrenda; el ánima lo come según las reglas existentes. |
| Foco de repuesto | Ampolleta facetada, cuello, casquillo y tres bandas de rosca. Se usa con Q en un apagador con foco fundido. El repuesto no emite luz. |
| Limpia con huevo | Huevo de tres tramos facetados con una faja de tela. Conserva la limpia grupal. El resultado negro se comunica después de usarlo; el modelo previo no revela cercanía. |
| Cámara instantánea | Cuerpo marfil y verde azulado, salida de foto, objetivo octagonal, flash, visor y disparador. Se distingue de la cámara de video. El contador de dos cifras muestra `film`; no anticipa resultados de la foto. |

## Los siete objetos malditos

| Objeto | Estado visual y límites |
|---|---|
| Tarot | Diez cartas separadas y reverso ornamental. La altura del mazo y las cartas visibles disminuyen con `cards`. El reverso no anuncia la próxima carta. |
| Tablilla espiritista | Tablero hexagonal con alfabeto, SÍ, NO, ADIÓS y puntero de cuatro lados. La posición del puntero indica progreso de pregunta, sin deletrear ni anticipar una respuesta desconocida. Conserva las tres preguntas y su costo. |
| Espejo de plata | Marco plateado mate, detalles angulares, mango y soporte. Se distingue del espejo de vaho. `on` activa la superficie; la ubicación mostrada y el consumo de cordura siguen en la interfaz existente. |
| Mano del mono | Muñeca vendada, palma y cinco dedos articulados visualmente. Un dedo se cierra por deseo gastado. No muestra cuál será el precio ni si la resurrección tendrá éxito. Al agotarse se consume. |
| Muñeca de la isla | Tela sin rostro, vestido vino, cabello de dos masas, brazos y costuras. Solo aparecen los alfileres ya insertados, todos con la misma cabeza ocre. El arte nunca consulta `heart`. |
| Pentagrama | Tabla octagonal, estrella de cinco trazos y cinco velas con mecha. Solo se encienden las correspondientes a `candles`. La quinta sigue consumiendo el objeto e invocando al ánima mediante la lógica original. |
| Radio maldita | Caja de madera, rejilla, dial, perilla, asa y antena. La espera sigue `cd`; los dos chasquidos siguen siendo sonido. No se añade una luz que detecte cercanía. |

Los objetos que el juego elimina al consumirlos también desaparecen de la escena. El taller muestra estados intermedios válidos; no deja una copia gastada como decoración. Los contadores de interfaz son información de inventario, no pantallas digitales inventadas para objetos tradicionales.

## Componentes y edición

- Registro: `src/items-components.json`. Cada objeto tiene ID, categoría, instrucciones, notas, piezas, colores hex, medidas en metros y agarre.
- Fábrica y estados: `src/items-art3d.js`, sobre el constructor común `src/tools-art3d.js`. Las piezas fijas se agrupan por modelo en partida; los indicadores y articulaciones permanecen separados.
- Taller: `arte/objetos-v18/`. Usa el editor compartido con las siete herramientas, con catálogo, historial y guardado independientes.
- Guardado local: `POST /api/items`, disponible al abrir `Abrir editor.cmd`. Valida el catálogo, guarda un respaldo y reconstruye el juego. Ante errores restaura registro y compilado. Guardar no publica.

En la página pública se pueden editar, importar y exportar los componentes. Para guardar en el proyecto se usa el taller local. Se editan posición, giro, tamaño, color y agarre; los roles, IDs y grupos funcionales quedan protegidos. El visor ofrece frente, perfil, espalda, planta y giro libre, además de exportación PNG de 2048 × 2048.

Las paletas son las del equipo aprobado: marfil `#d8cdb5`, crema `#ede2c5`, vino `#6b2030`, verde azulado `#315c5b`, madera `#805937`, hoja `#526d44`, ocre `#ba8d49`, ceniza `#77736d` y plata mate `#aeb8bb`. El vidrio y la plata son superficies de color estilizadas; no se añaden reflejos dinámicos costosos.

## Integración con la casona

La tablilla y el pentagrama reservan el espacio de sus modelos antes que el pequeño decorado aleatorio. También se ajusta la reserva de cruces, rosarios y otros objetos anchos. Esto conserva despejadas las entradas y evita invadir adornos de sobremesa. No se cambia el plano, los escondites ni las colisiones de actores.

El rosario colgado usa el objeto real en el marco. La ruda usa su misma fábrica en el efecto temporal. Las antiguas marcas genéricas quedan ocultas para evitar duplicados. La nube de copal se representa con facetas; el ánima de humo aprobada permanece igual.

## Verificación

- `python tools/check_items.py`: 18 modelos y 399 piezas; medidas, materiales y transformaciones válidas.
- `node test/items-usage-test.cjs`: acciones reales de los 18 objetos, consumo, contadores, colocación, rosario/ruda colgados, cambio de foco y apagado de veladora al aventarla. Comprueba que ni `heart` ni la cercanía oculta modifican los indicadores.
- `python test/items-v18.py`: 54 estados de referencia, 18 modelos reales en la mano, guardado/deshacer y rechazo de cambios funcionales, PNG 2048 y representaciones en puertas.
- Regresión de las siete herramientas, cuatro perfiles gráficos y editor de la casona.
- Simulaciones completas con las 22 ánimas, sin atascos en escaleras.
- WebKit con iPhone 12 en vertical y horizontal: paneles de los 25 objetos y herramientas sin cubrir los botones táctiles.

Las pruebas móviles son emuladas; no equivalen a medir FPS en un iPhone físico. Las referencias y los resultados se publican en `arte/objetos-v18/`.
