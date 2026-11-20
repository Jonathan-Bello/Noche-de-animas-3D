# Cómo usar el modo de decoración

**Actualización V20:** ya puedes editar con amigos y publicar desde internet sin instalar el repositorio. Consulta [la guía del editor en línea](editor-online-v20.md). Las instrucciones locales de esta página siguen disponibles.

El editor es un taller para acomodar la casona con una interacción inspirada en los modos de decoración: vista 3D del cuarto, catálogo con imágenes, selección directa, cuadrícula, giro y vista previa antes de colocar. El plano técnico anterior sigue disponible.

## La forma más fácil de empezar

1. En la carpeta del proyecto, haz doble clic en **Abrir editor.cmd**. Deja abierta la ventana que inicia el servidor. Se abrirá `http://127.0.0.1:8790/editor/`.
2. Elige **Piso** y **Cuarto**. Empieza por Comedor o Biblioteca para familiarizarte. Los botones de cámara giran la vista; ＋ y − acercan o alejan. Arrastrar el espacio vacío también gira la cámara.
3. Pulsa un mueble o adorno para seleccionarlo. Su nombre aparece a la derecha. También puedes buscarlo en **En este cuarto**, donde cada pieza tiene una imagen.
4. **Arrastra la pieza** al lugar nuevo. Otra opción, útil en celular: pulsa **Mover** y después toca el destino. **Girar 90°**, o la tecla R, cambia su orientación. Esc o **Cancelar** recupera la ubicación anterior.
5. Mira la vista previa: verde significa que no se detectan invasiones geométricas; rojo indica una puerta, otro mueble, un adorno u otra reserva ocupada. Una colocación inválida no se confirma. Al guardar se comprueban además la navegación y la cobertura de escondites.
6. Pulsa **Aplicar al juego local**. El taller valida el plano y reconstruye el juego. Después pulsa **Probar cambios locales** o recarga la partida local.

Los muebles se mueven por casillas de 1 m y los adornos por pasos de 10 cm. Esto coincide con las reservas y apoyos del mapa. Las camas conservan la cabecera contra un muro. Mover o girar un mueble desplaza sus adornos juntos.

## Añadir y acomodar adornos

Abre **Añadir adornos**, busca una pieza y pulsa su imagen. Acerca el cursor a una mesa o repisa y pulsa para colocarla. El modelo busca la superficie real sobre la que lo estás colocando, incluyendo los entrepaños. Los adornos murales se desplazan sobre su muro actual.

Con **Duplicar adorno** se crea una copia que puedes colocar o cancelar. **Quitar adorno** elimina únicamente el adorno seleccionado. Los muebles y los escondites conservan su inventario y sus funciones: se acomodan, no se borran ni se duplican desde este modo.

En celular, al pulsar Mover o añadir una pieza la vista regresa al cuarto. Los botones Girar y Cancelar aparecen sobre la vista para no depender del teclado ni tener que volver al panel lateral.

## Roperos y escondites

El editor muestra los posibles escondites, no una selección aleatoria de una noche. Al mover uno, se mueve también su entrada. Al girarlo, cambia el lado desde el que se entra. Se conserva su tipo, cuarto e identidad.

Guardar comprueba que ninguna puerta, escalera, entrada de escondite o ruta necesaria quede bloqueada. Si una ubicación rompe la cobertura de huida, el taller rechaza el guardado y conserva los archivos anteriores. Puedes usar Deshacer o ajustar la posición.

## Qué se guarda y dónde

| Acción | Resultado |
|---|---|
| Mover y colocar | Actualiza el borrador de este navegador y el historial de Deshacer/Rehacer. |
| Aplicar al juego local | Desde el servidor local, guarda `src/layout-v11.json`, valida el juego y reconstruye `juego/index.html`. |
| Archivo → Descargar plano | Descarga el JSON del mapa para respaldarlo o compartirlo. |
| Archivo → Abrir plano | Importa un plano compatible para revisarlo antes de aplicarlo. |
| Archivo → Volver al plano cargado | Recupera la versión que cargó el taller; también se puede deshacer. |

**La página pública conserva el borrador y ahora permite publicar en GitHub conectando la cuenta del anfitrión.** También puedes descargar el plano. Para ver tus cambios dentro del juego local, usa Abrir editor.cmd y Aplicar. Para aplicar cambios desde internet, sigue la guía V20; el botón Publicar valida, reconstruye y despliega el juego.

## Cambiar la apariencia de un mueble

Desde **Archivo y ayuda → Editar modelos de muebles**, abre el taller de componentes. Allí eliges un mueble y una pieza, y cambias colores, medidas o transformaciones de su modelo. Se ofrecen vistas ortográficas y PNG 2048.

Los tableros y entrepaños que sostienen objetos conservan sus medidas, orientación y altura. Puedes cambiar su color; sus apoyos permanecen protegidos para que nada flote. El modo de decoración se ocupa de mover el mueble completo.

El catálogo también incluye la plantilla del libro independiente y la del cajón animado. Cambiar su apariencia conserva las instancias, los lanzamientos y los deslizamientos del juego.

## Controles rápidos

- Arrastrar pieza: mover y soltar para colocar.
- Arrastrar espacio vacío: girar cámara.
- R: giro de 90° de una pieza compatible.
- Esc: cancelar colocación.
- Ctrl/Cmd Z: deshacer; Ctrl/Cmd Shift Z: rehacer.
- Rueda o ＋/−: acercar/alejar.
- Plano desde arriba: vista técnica, coordenadas exactas y selección por ID.

La estructura del cuarto se simplifica en la vista 3D para dejar ver el interior. El mapa compartido conserva la arquitectura y las reservas reales. Para revisar la composición con la iluminación nocturna, prueba la partida local.
