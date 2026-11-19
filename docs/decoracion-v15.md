# Recámaras V15

Se decoraron seis habitaciones con **44 piezas nuevas**, usando **19 familias nuevas de modelos**. El registro alcanza 94 instancias editables y 31 familias reutilizables. Se mantiene la estética facetada, colores sólidos y materiales mates, sin texturas nuevas ni luces dinámicas adicionales.

| Cuarto | Decoración incorporada |
|---|---|
| Nana A04 | Retratos, ropa limpia, perchero, zapatitos, aguamanil y canasta de ropa bajo la cuna |
| Niños A06 | Dibujos enmarcados, bloques de madera, trompo, cartas/dibujos sobre el escritorio, cojín y lámpara mural |
| Abuela A10 | Libro abierto, cojín de sarape, ropa doblada, retrato y flores secas en una repisa mural |
| Principal A11 | Retratos, prenda colgada, ropa doblada, joyero, correspondencia y maleta bajo la cama |
| Hija A14 | Espejo mural octagonal, peine, perfume, joyero, cartas, ropa doblada y recuerdos |
| Huéspedes A15 | Equipaje, ropa limpia, aguamanil junto a la cama, perchero y retratos |

La ropa y los libros sobre las camas descansan en la superficie visible del colchón, sin tocar las almohadas o la manta existente. Las maletas caben entre las patas y por debajo del bastidor. La canasta del bebé permanece en el suelo, independiente de la animación de la cuna. Los adornos murales tienen soportes físicos y quedan fuera de ventanas y puertas.

## Distribución y limpieza

Se conservaron las posiciones de las seis camas y sus cabeceros contra muros. Se agregaron dos burós junto a las cabeceras, en niños y huéspedes, y se prolongó el tocador de la nana un metro dentro de la misma pared. Ninguno invade puertas, escaleras ni aproximaciones de los escondites. La circulación se comprueba con 3208 posiciones transitables y el límite de cobertura de refugios de 18 m.

La muñeca ambiental infantil existente se sitúa sobre un mueble y conserva su animación; deja de ocupar el centro del cuarto.

Antes de decorar se retiraron los retratos procedurales de estos seis cuartos y el espejo fijo antiguo del tocador de la hija. Las piezas nuevas sustituyen esas representaciones; no se apilan delante de ellas. El primer punto de apoyo de cada cuarto y varias celdas adicionales permanecen disponibles para el altar, aparatos y suministros aleatorios.

## Componentes y editor

Cada pieza tiene un ID propio, por ejemplo `A06_top_01`, `A04_care_basket_01` o `A14_wall_mirror_01`. Se conserva el mismo registro `src/layout-v11.json` y el exportador actualiza los paquetes de los 27 cuartos.

Las nuevas familias están en `src/decor3d.js`. Las instancias se colocan mediante soporte, desplazamiento local, altura y giro. Los componentes murales declaran `mountWall` y su orientación. El editor los permite arrastrar a lo largo del muro, cambiar su altura y guardar; los ejes perpendiculares y el giro mural quedan protegidos. El validador usa ancho y profundidad reales, detecta ventanas tapadas y rechaza piezas separadas del muro o por encima del techo.

El editor conserva una copia recuperable del borrador anterior al detectar un registro publicado distinto; puede descargarse con **Exportar borrador anterior**. El nuevo plano se puede modificar y guardar usando el mismo lanzador local `Abrir editor.cmd`.

El decorado fijo sigue fusionado por cuarto, manteniendo sus IDs de origen. Los objetos móviles permanecen separados. Las piezas murales no consumen espacios del tablero de una mesa: se comprueba también su altura. La caja de fusibles evita los conjuntos decorativos del muro.

## Interacciones

Se añadieron seis piezas arrojables: **trompo, peine, dos joyeros, frasco de perfume y libro abierto**, respetando las familias ligeras del catálogo. Son componentes independientes y usan el lanzamiento existente, con destino transitable fuera de accesos. El total de la casa pasa de 22 a **28 adornos arrojables**. El presupuesto de esta etapa se ajusta a 32 para conservar margen de edición. Los 38 adornos nuevos restantes son fijos. El espejo de tocador es decoración, distinto de la herramienta de evidencia; la lámpara mural no añade una fuente de luz ni cambia las reglas de apagadores o fusibles.

Se corrigió además otra oscilación en la entrada de la escalera de servicio: el bot abandonaba una recogida de suministros al pisar un peldaño y retomaba el regreso a la base. Ahora termina el pequeño desvío hacia el objeto antes de continuar. No se cambian las decisiones de investigación ni las reglas de evidencia.

## Verificación

- `python test/bedroom-components.py`: inventario, soportes y rechazo de un retrato que tapa una ventana o se separa del muro.
- `node test/layout-v11-test.cjs`: navegación, cobertura, escaleras, distribuciones aleatorias, cajones y lanzamiento real de los 28 componentes móviles. Incluye regresión de la recogida junto a la escalera.
- `python test/editor-observer.py`: edición y guardado local de un dibujo infantil, deshacer y restauración del plano, además de las comprobaciones previas del editor y observador.
- Perfiles de navegador, WebKit emulado para iPhone 12, sincronización y partidas automatizadas con las 22 ánimas.

Las capturas usan luces encendidas para inspeccionar los modelos. Las pruebas móviles son emuladas y no equivalen a medir FPS en un iPhone físico. La campaña permanece preparada en datos; esta entrega no cambia sus desbloqueos ni economía.
