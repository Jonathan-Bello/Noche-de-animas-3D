# Muebles y modo de decoración · V19

Esta entrega reemplaza los modelos de las cuatro familias solicitadas conservando sus identidades de instancia, colisiones, apoyos y vínculos jugables. Se autoran **66 componentes con 1100 piezas**: 39 muebles del plano, 24 escondites, la cuna, la plantilla del cajón animado y la del libro independiente.

## Arte del mobiliario

- **Librero, alacenas y herbolario:** costados, pilastras, respaldo, patas, entrepaños y cornisa diferenciados. Los entrepaños conservan sus alturas anteriores. El librero sigue recibiendo sus 24 libros como objetos independientes; no se añade una copia estática de ellos dentro del modelo.
- **Roperos y arcones:** carcasa, cornisa, paneles, tirador, candado y puerta con rendija real. La puerta gira sobre una bisagra. El confesionario mantiene su identidad con tejadillo y cruz. Las alturas de mirada de ropero y arcón se conservan.
- **Mesas, escritorios, burós y consolas:** tableros con espesor, faldones, patas, zapatas y travesaños. Los apoyos mantienen su altura exacta. Los cuerpos dejan espacio a los cajones activos; no se colocan frentes decorativos duplicados sobre ellos.
- **Camas:** bastidor, somier, patas, cabecera con postes y panel, piecera, colchón, sábana, cobija y almohadas separadas. Mantienen su huella y la orientación de la cabecera. Los adornos ya colocados conservan su apoyo a 61 cm donde corresponde.
- **Cuna:** base, colchón, cuatro postes apoyados, barrotes y pasamanos unidos. Usa el grupo del objeto animado, sin añadir una segunda cuna estática.
- **Cajón y libro:** piezas propias en el catálogo. El cajón conserva su pivote y apertura; el libro conserva páginas, cubiertas y lomo, IDs y trayectoria de lanzamiento.

Todos usan colores sólidos y materiales mate con facetas planas, sin texturas ni biseles. Las piezas fijas se agrupan al construir la escena. Los muebles anteriores se sustituyen en su punto de construcción; no se superponen dos versiones.

## Componentes editables

Registro: `src/furniture-components.json`. Fábrica: `src/furniture-art3d.js`. El taller de `arte/muebles-v19/` usa exactamente esos datos.

Cada mueble del plano tiene un ID estable, por ejemplo `librero_isla`, `mesa_comedor` o `cama_A10`. Los escondites se editan como `hide_HB13`, etc. `drawer_standard` controla el aspecto de los cajones activos y `book_standard` el del libro arrojable.

Se pueden modificar colores y piezas de carpintería sin alterar la huella reservada. Las piezas con rol `support` conservan tamaño, posición y giro; sus colores sí son editables. Así no se desplazan las superficies bajo los objetos. El servidor también rechaza adornos del modelo que salgan de la huella permitida.

## Mover en el mapa y editar el modelo

El modo de decoración del editor permite mover muebles, sillas y escondites, girar piezas compatibles y acomodar sus adornos. Mover una mesa mueve su decoración; mover un escondite mueve su entrada. Al girar un librero, también se giran las posiciones de los libros y sus puntos de liberación.

Los muebles conservan su cuarto y las camas permanecen contra un muro. Las puertas, ventanas, escaleras y estructura quedan protegidas. Las reservas de circulación se dibujan sobre el piso y el plano técnico continúa disponible.

El guardado local valida la arquitectura y ejecuta distribuciones del juego antes de reconstruirlo. No publica automáticamente en GitHub. La página pública sirve para decorar, mantener un borrador y exportar el plano. La explicación paso a paso está en [el manual del editor](editor-v19.md).

## Comprobaciones

- `python tools/check_furniture.py`: catálogo, piezas, apoyos protegidos y límites del modelo.
- `python test/furniture-v19.py`: geometría de los 66 componentes, materiales, guardado/deshacer, rechazo de cambios de apoyos y rendijas de escondite abiertas/cerradas.
- `python test/editor-decor-v19.py`: vista 3D, catálogo, colocación inválida, mover/girar/guardar/deshacer, mover escondite con su entrada, duplicar o añadir y cancelar. Cuatro giros no desplazan el mueble.
- `python test/editor-mobile-v19.py`: selección y controles táctiles en perfiles WebKit iPhone 12 vertical y horizontal.
- `python test/editor-observer.py`: compatibilidad del plano, guardado local, herramientas y cortes de piso del observador.
- Pruebas de navegación, 24 libros independientes, 44 adornos arrojables, cajones y escaleras; cuatro perfiles gráficos, WebKit del juego y sincronización entre clientes.

Las pruebas de celular son emuladas; no se afirma un rendimiento medido en un iPhone físico.
