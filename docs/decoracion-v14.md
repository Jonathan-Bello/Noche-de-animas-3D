# Decoración V14, taller visual y módulos de campaña

La primera entrega amuebla cocina (B04), comedor (B08), despensa seca (B01) y repostería/despensa de diario (B09). Hay **50 instancias nuevas de 12 modelos reutilizables**, con **22 objetos ligeros arrojables**: frascos, tazas, platos y molinillo. Canastas, costales, tinaja, olla, comal, pan y textiles permanecen fijos. La casa no recibe un poder nuevo de lanzamiento.

## Recorrido y composición

- **Cocina:** fogón y banco de trabajo continuos en el muro oeste, comal y olla; jarra/taza/molinillo sobre la mesa del muro sur. Una parte de las superficies se reserva para aparatos, altar variable y suministros; no llenar indiscriminadamente las encimeras.
- **Comedor:** seis servicios de vajilla con tazas, camino de mesa facetado y pan; canastas en el trinchero. La mesa central es una zona de reunión intencional con circulación perimetral, lejos de las puertas.
- **Despensa seca:** alacena norte con niveles de canastas, costales y frascos; banco al oeste con almacenamiento inferior, tinaja y pan. Se suprimen los frascos decorativos anteriores del mismo estante para evitar duplicados.
- **Repostería:** mesa contra el muro norte, canastas debajo, frascos y alimentos arriba, manteniendo la puerta del comedor y el cruce al corredor libres.

Las huellas siguen en el registro único y se validan durante la compilación. La cobertura de refugios se recalcula en 3211 posiciones transitables; ningún adorno fijo añade una colisión invisible. Los adornos nuevos quedan dentro de muebles que ya tienen colisión. Las partidas de prueba verifican que el botín variable encuentre soportes sin competir con las piezas nuevas.

## Componentes editables

El origen de datos sigue siendo `src/layout-v11.json`, que ahora contiene:

| Colección | Uso |
|---|---|
| `decorAssets` | Nombre, tamaño, altura, masa relativa y permiso de lanzamiento de cada familia |
| `decorInstances` | ID individual, cuarto, modelo, soporte, desplazamiento local y giro |
| `roomModules` | Límites del cuarto, referencias a muebles, puertas, decoración y metadatos de restauración |
| `campaignDesign` | Contrato de campaña suministrado por Jonathan; configuración futura, sin activar reglas nuevas |

Ejemplos: `B04_molinillo_01`, `B04_jar_01`, `B08_plate_03`. Para corregir una sola pieza basta indicar su ID; para corregir toda una familia se modifica su fábrica en `src/decor3d.js`. Los adornos se mueven con su mueble de apoyo. El decorado fijo se fusiona por cuarto conservando sus colores y la lista de IDs; cada objeto arrojable conserva una malla y estado propios. No se duplica al salir de su soporte.

`tools/export_room_modules.py`, llamado por el compilador, publica 27 paquetes JSON derivados en `arte/modulos-casona/`. Incluyen origen, medidas, muebles locales, decoración, escondites y conexiones. Las puertas y escondites conservan coordenadas compartidas del plano. Estos paquetes preparan la migración a cuartos habilitables; todavía no desactivan navegación, sucesos o habitaciones por sí solos.

## Taller visual: cómo usarlo

1. Abrir [el taller web](../editor/index.html). Elegir planta y cuarto.
2. Seleccionar una pieza en el plano o por su ID. Arrastrar o escribir sus coordenadas. Los muebles se ajustan a 1 m para respetar la cuadrícula de colisiones; los adornos, a 10 cm.
3. Elegir modelo y soporte para añadir un adorno. Ajustar base y giro; el visor 3D usa la misma fábrica del juego. Los escondites, puertas y estructura no se editan en esta primera versión.
4. Usar Deshacer/Rehacer. Las reservas de puertas se muestran en naranja y los errores se describen arriba del plano. No mover una cabecera lejos de su muro.
5. En la versión pública, **Exportar plano** descarga el JSON para compartirlo o importarlo después. El borrador queda también en el navegador, asociado a la revisión del plano publicado.
6. Para guardar en el proyecto sin copiar código, hacer doble clic en **`Abrir editor.cmd`** en la carpeta del repositorio. También sirve `python tools/editor_server.py --open`. Abre `http://127.0.0.1:8790/editor/`.
7. **Guardar en proyecto local** comprueba el plano y 20 distribuciones del juego, guarda una copia anterior en `test-results/editor-backup.json` y reconstruye la demo. Si falla, restaura los archivos anteriores. Después recargar el juego local. El servidor debe permanecer abierto.

El guardado local no publica en GitHub. GitHub Pages permite editar/exportar pero no escribir en el disco del usuario. El editor actual es un plano 2D con inspección 3D de las piezas; no es todavía un editor completo de paredes, escaleras o escenas 3D. La prevención de accesos no reemplaza una revisión visual de adornos apilados manualmente.

## Observador e instrumentos

En modo de observar bots, seguir a un investigador de planta baja oculta la segunda planta, los techos y las vigas, y recorta los muros cercanos. Subir devuelve la planta alta. Se verificó siguiendo tanto al ánima como a un investigador; se corrigió también una oscilación de los bots al interrumpir el recorrido del termómetro en la entrada de una escalera; primera persona conserva el edificio completo.

Las siete herramientas tienen fábricas propias en `src/tools-art3d.js`: termómetro con cuerpo y pantalla; UV con empuñadura y cabeza violeta; grabadora con rejilla; cámara con lente y tripié que se oculta al sostenerla; EMF con cinco pilotos; espejo con marco octagonal y mango; detector de gases con dial y aguja. Pilotos, aguja, grabadora y grabación usan el estado real existente; la cámara sigue enviando la prueba a la tele de la base y el espejo conserva vaho/mano. No se cambian probabilidades, evidencias ni requisitos de uso.

[Visor 3D de instrumentos](../arte/instrumentos-v14/index.html).

## Campaña: contrato incorporado y siguiente trabajo

Se registraron cinco cuartos iniciales (Comedor, Cocina, Despacho, Portería y Despensa seca), Zaguán/Patio/Corredor siempre abiertos y **20 compras**. El rellano se habilita con la escalera, por eso no cuenta como compra adicional. Los complementos y favoritos de cada cuarto están en sus módulos. Se conservan las siete herramientas de la camioneta y las 22 ánimas desde la primera noche.

También quedan registrados: tres ofertas adyacentes, cuarta oferta de escalera, costos por grupos de cinco (3/4/5/6), preferencia de guarida del 40 %, recuento de veladoras, noche normal de 600 s y Noche grande de 900 s. Son datos de diseño; **no hay aún modo campaña, votación, economía ni guardado persistente de progreso**.

Antes de activar la campaña hay dos dependencias arquitectónicas:

1. La Despensa seca B01 solo tiene acceso por la Biblioteca B06. Como B01 empieza abierta y B06 tapiada, hace falta una circulación de servicio independiente o redistribuir ese sector. No basta con ocultar la biblioteca. Propuesta para la siguiente revisión de plano: separar una franja de paso de la biblioteca hacia el acceso de la despensa y reconectar su puerta al corredor, manteniendo un recinto de biblioteca cerrado independiente.
2. La escalera de servicio ya existe en Noche libre. En campaña debe permanecer cerrada hasta restaurar la escalera principal y el cuarto de la nana; de otro modo ofrecería una entrada prematura a planta alta. La principal seguirá siendo la compra que habilita el acceso vertical.

Orden de implementación futura: resolver esos accesos; ensamblar solo cuartos abiertos con paredes provisionales; derivar navegación/guaridas/escondites/aparatos/sucesos del mismo conjunto; probar conectividad de cada compra; añadir economía y ofertas, guardado del anfitrión y votación; implementar Noche grande. Noche libre permanece como regresión con casa completa.

## Pruebas

- Compilación con comprobación de 44 puertas, muebles, camas y 50 adornos dentro de soportes.
- Pruebas de navegación y escaleras con cápsulas reales, cobertura de refugios, 500 distribuciones aleatorias adicionales a las 60 del conjunto de navegación y 22 lanzamientos reales de componentes.
- Editor en navegador: seleccionar, modificar, deshacer, vista 3D, rechazo de una puerta obstruida y guardado local válido.
- Observador en ambas plantas y siete fábricas de instrumentos.
- Auditoría de triángulos de portales/ventanas, perfiles visuales, WebKit con dimensiones de iPhone 12 y sincronización entre clientes.

Las pruebas móviles son emuladas. No constituyen una medición de FPS en el iPhone 12 físico.
