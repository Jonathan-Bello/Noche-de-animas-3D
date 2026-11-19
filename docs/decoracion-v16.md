# Costura, aperos, botica y resto de habitaciones · V16

Esta entrega agrega **109 componentes** a los **17 espacios restantes**. El inventario alcanza **203 piezas editables repartidas en las 27 habitaciones del plano**, además del mobiliario y los objetos anteriores. Se mantiene la estética facetada, colores sólidos, materiales mates y arquitectura aprobada.

## Prioridad de esta entrega

| Cuarto | Incorporaciones |
|---|---|
| Costura | Organizador con carretes y tijeras, patrón enmarcado, iluminación mural decorativa, canasta de ropa, rollos de tela y papeles sobre la mesa |
| Aperos | Herramientas colgadas, cuerda recogida, cajas etiquetadas, brochas, latas, farol apagado y textiles almacenados |
| Botica | Doce frascos individuales en dos niveles, canastas, hierbas secas colgadas, mortero, balanza y documento enmarcado |

Los útiles de los organizadores son partes de un modelo compuesto con ID propio; cajas, frascos, textiles, mortero y balanza tienen instancias separadas. Los cuadros y adornos permanecen editables por ID y comparten sus fábricas con el visor del taller.

## Habitaciones restantes

| Zona | Función de la decoración |
|---|---|
| Planchaduría | Ropa agrupada en canastas, prendas colgadas y patrón de trabajo |
| Capilla | Flores y veladoras apagadas, estampas laterales y cojines en las bancas; se conserva el único retablo central existente |
| Traspatio | Canasta de lavado, tinaja, toallero y prendas junto al lavadero |
| Biblioteca | Mapa, certificado, lectura sobre el escritorio y portarretrato; se conservan los 24 libros independientes existentes |
| Despacho | Correspondencia, tintero, sello, portarretrato y documentos |
| Portería y zaguán | Tableros de llaves, documentos, retratos y mapa de orientación |
| Desván | Estante de archivo con cajas, maleta y ropa guardada |
| Coro y sala de música | Partituras enmarcadas y sobre una consola, recuerdos y estampa; los modelos activos de piano y otros aparatos conservan sus animaciones |
| Baño | Toallero con jabonera, toalla sobre el borde real de la bañera y jabón sobre platillo |
| Estrado | Cojines sobre la banca, camino de mesa, retratos y portarretrato |
| Escalera y rellano | Cuadros en los muros perimetrales; vuelos, descanso, barandales y desembarcos permanecen despejados |

## Distribución, limpieza y soportes

Se reemplazan los contenidos genéricos de los estantes de aperos y botica; no se superponen los modelos nuevos sobre los frascos anteriores. Se retiran también los pequeños bloques genéricos del banco de trabajo y los retratos procedurales de los cuartos que ahora tienen composiciones propias.

El único mueble con colisión añadido es el estante del desván, contra el muro norte. El resto del decorado usa muebles existentes o soportes murales. Las canastas y latas bajo las mesas se colocan en los huecos reales entre patas; no se introducen en muebles con cuerpo cerrado. Las cajas del archivo descansan en niveles de estante. La toalla del baño se apoya a 77.5 cm sobre el borde modelado de la bañera.

Se verifican las reservas de las 44 puertas, los escondites y ambas escaleras. La cobertura se recalcula en 3205 posiciones transitables. Las rectas y el circuito del patio mantienen su función para persecuciones. No se añaden luces dinámicas a cada adorno: faroles y veladoras decorativos están apagados.

Se limita cada edificio de la ciudad de fondo al extremo de su manzana: una pieza procedural rebasaba ese límite e invadía aperos por el oeste.

La comprobación de ventanas ahora compara alturas globales: también protege el vano de la capilla que se prolonga hacia el coro de planta alta. El cuadro del coro se sitúa fuera de ese vano.

## Objetos arrojables

Esta fase agrega **dieciséis objetos móviles**: doce frascos de botica y cuatro portarretratos de sobremesa. El total de componentes decorativos arrojables pasa de 28 a **44**, más los libros y objetos anteriores del juego. El presupuesto de edición de esta fase es de 48 componentes móviles; el decorado fijo sigue agrupado por cuarto.

Los frascos y portarretratos desaparecen de su soporte cuando se arrojan: no queda una copia estática. Los portarretratos también pueden participar en la inversión de objetos del sistema existente; su pivote conserva el apoyo sobre la superficie al invertirse. Cajas, tejidos, útiles colgados, instrumentos pesados, veladoras y organizadores son fijos. No se incorporan poderes nuevos ni reglas de evidencia.

## Componentes y edición

`decorInstances` mantiene un ID por pieza o conjunto compuesto. Ejemplos: `A02_wall_sewing_01`, `B10_wall_tools_01`, `B14_jar_01`, `B14_balance_01`. `decorAssets` define modelo, dimensiones, altura y permisos.

Se agrega `decorSupports` para muros que no tienen un mueble delante. Son referencias de colocación, no muebles ni colisiones invisibles. Solo admiten piezas murales y declaran los lados donde realmente hay muro; el coro no admite decoración flotando sobre su barandal norte. El editor ofrece estos soportes al elegir un modelo mural y permite moverlo a lo largo del muro. El validador impide usarlos para colocar un objeto suelto en el aire.

Los paquetes de los 27 cuartos incluyen sus soportes e instancias, conservando la preparación para la campaña. Las reglas de progresión siguen sin activarse en esta entrega. El editor y el registro se cargan con versión V16 para evitar mezclar datos nuevos con scripts viejos en caché.

## Verificación

- `python test/room-decor-components.py`: los 27 espacios tienen decoración por componentes; se rechazan objetos sueltos sobre referencias murales y cuadros que tapan el vano entre capilla y coro.
- `node test/layout-v11-test.cjs`: navegación, cobertura, escaleras, cajones y lanzamientos reales de los 44 componentes móviles.
- 500 distribuciones adicionales con aparatos, botín y fusibles sin conflictos de soporte.
- Edición y guardado local del organizador de costura sobre una referencia mural.
- Perfiles visuales, sincronización entre clientes, partidas con las 22 ánimas y WebKit emulado de iPhone 12.

Las capturas usan luces encendidas para revisar el arte. Las pruebas móviles son emuladas, sin afirmar FPS de un teléfono físico. Cortinas exteriores recogidas y macetas adicionales quedan como ampliaciones opcionales del catálogo; las ventanas interiores permanecen abiertas.
