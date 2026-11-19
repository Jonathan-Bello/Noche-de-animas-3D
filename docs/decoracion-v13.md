# Casona V13: distribución y decoración habitable

El croquis publicado en [arte/decoracion-v13](../arte/decoracion-v13/index.html) utiliza las coordenadas reales del juego. Cada habitación muestra uso, muebles construidos y propuestas siguientes. El [catálogo](../arte/decoracion-v13/catalogo.json) incluye 30 familias, estado de implementación, ubicación, fase y permisos de interacción, y un programa para las 27 habitaciones. No equivale a prometer que todos los modelos propuestos ya estén construidos.

## Correcciones construidas

- Seis camas con cabeceros en muros, patas, colchón, colcha y manta; burós contiguos donde cabe. Dormitorio infantil al oeste, nana al oeste, huéspedes al este, abuela al oeste, principal e hija al sur fuera de balcones. El tocador de hija queda al sur, separado del paso central. La cuna se gira hacia el muro este y tiene cuatro patas hasta el suelo.
- Refugios y muebles apartados de las entradas. Armario infantil al noreste; nana al este; arcones de rellano fuera de vuelos. Se conservan 24 posiciones candidatas y 20–22 refugios activos según partida. No se sortean sus posiciones físicas.
- Descanso intermedio de la escalera U protegido por barandal en sus lados expuestos y en la separación de vuelos, conservando dos desembarcos abiertos.
- Doce ventanas internas abiertas sin tablas, postigos ni rejas. Balcones interiores antiguos se convierten en ventanas con antepecho de 1.05 m. Ocho ventanas exteriores conservan su carácter cerrado, roto o tapiado; balcones exteriores tienen protección de madera, no rejas superpuestas.
- Marcos de ventana como una extrusión continua con hueco real en la pared. Se recortan los muros y molduras; se eliminan tapas ocultas coincidentes entre plantas. No se oculta el problema con polygonOffset.
- Primera capa decorativa: 22 alfombras/petates de geometría plana con patrones facetados sin planos superpuestos. En comedor y sala de música se colocan bajo mesa/piano como zonas de uso. Sin alfombras en escaleras ni anillo de carrera.
- Camioneta al este del camino de llegada y equipo al oeste. El antiguo garaje sigue siendo cuarto de aperos.

## Criterio arquitectónico y de juego

Las camas, tocadores, armarios y escritorios se apoyan en muros; se deja libre su frente de uso. Las excepciones intencionales son mesa de comedor, mesa de preparación, piano y fuente, cuyo uso requiere posición central o acceso por varios lados. Mover todos los muebles al perímetro sin atender su función también produciría cuartos poco creíbles.

Cada puerta reserva el vano completo más **1.15 m a ambos lados normales al muro y 0.15 m a los lados del vano**. Esta es una regla de diseño del juego, no una certificación normativa. Las aproximaciones y huecos de escalera son intocables. La reserva se usa para mobiliario, botín, apariciones y destino de objetos arrojados. El generador falla si un cambio de mobiliario fijo o refugio invade el acceso. Las reservas se ven en naranja en el croquis y se pueden ocultar.

La circulación central conecta puerta, puntos de uso y refugio. El anillo de 3 m y las rectas de 27/17 m se conservan sin nuevas obstrucciones altas. Los objetos decorativos no crean cobertura ni colisiones invisibles. El refugio sigue sujeto a disponibilidad, candado y reglas de cacería.

El alcance de refugios se mide por distancia geométrica horizontal con diagonales legales: no corta esquinas cerradas y en escaleras solo avanza ortogonalmente. La métrica anterior de cuatro vecinos sobreestimaba recorridos diagonales. El límite de 18 m es una comprobación de distribución con puertas transitables, no garantiza escapar. La auditoría recorre 3217 posiciones, no solo centros de habitaciones.

## Programa por áreas

| Área | Mobiliario y uso | Nuevas familias propuestas |
|---|---|---|
| Cocina, repostería y despensas | Preparación al muro, mesa de trabajo cuando corresponde, alimentos en estantes | Comal, ollas colgadas, cucharones, molinillo, frascos, pan, canastas, costales y tinajas |
| Capilla y coro | Un solo retablo, eje central libre, barandal hacia vacío | Flores secas, veladoras agrupadas, rosario, papel picado y partituras |
| Biblioteca, despacho y portería | Libreros y escritorios al muro; entrada visible | Cartas, tinta, certificados, retratos y perchero; conservar 24 libros independientes |
| Nana y niños | Dormir, cuidar y estudiar en zonas distintas | Canasta de ropa, toalla, trompo, muñeco de madera, dibujos y cometa plegada |
| Abuela, principal, hija y huéspedes | Cabecera con muro, buró accesible y zona para vestirse | Cojines, retratos de sobremesa, flores, espejo de mano, peine, joyero y maleta |
| Música y estrado | Piano y reunión; accesos perimetrales libres | Atril, partituras, cojines de sarape, mantel y grupos de retratos |
| Costura, planchaduría, desván y aperos | Trabajo y almacenaje ordenados por muro | Carretes, botones, tela doblada, cajas etiquetadas, cuerda y brochas colgadas |
| Baño, traspatio y patio | Agua y aseo; circuito de persecución despejado | Jabón, palangana, toallas y macetas solo en esquinas reservadas |

El JSON detalla cantidades **propuestas**, cuarto por cuarto. Estas cantidades son objetivos de composición estática; no son un número automático de cuerpos físicos o interacciones. Cada conjunto se coloca como una viñeta con soporte real, no se dispersa al azar sobre el suelo.

## Qué puede mover cada entidad

| Clase | Ánima | Casa |
|---|---|---|
| Estructura, ventana, barandal, retablo | Nunca arrojar | Nunca desplazar |
| Cama, armario, mesa, librero, alfombra, cortina | Fijos | Fijos; posible movimiento visual futuro de cortina, sin tapar ventanas |
| Cuna, mecedora, piano, grifo y reloj | Activación propia existente; no se arrojan completos | Solo activaciones permitidas por CAS |
| Libros y vajilla ligera ya registrados | Puede lanzar | Giros/levitaciones según evento existente; no nuevo lanzamiento |
| Peine, espejo de mano, frasco, juguete o marco pequeño propuestos | Arrojables al implementarse como objetos independientes | Activaciones futuras explícitas; lanzamiento deshabilitado |
| Papel, tela, comida agrupada, ollas colgadas y herramientas del muro | Decoración fija | Sin desplazamiento físico |

No se añaden pruebas falsas, probabilidades nuevas ni reintentos a CAS. El lanzamiento de la casa queda **deshabilitado**: añadirlo sería un cambio de reglas aparte. Un libro arrojado desaparece de su soporte y conserva una sola representación. Para cada futuro objeto arrojable se exige ID, dueño del soporte, altura, tamaño, masa relativa y destino fuera de accesos; evitar penetración de paredes y colocar el reposo en suelo transitable. La animación de lanzamiento existente no es una simulación completa de cuerpos rígidos.

## Plan de ejecución

1. **Realizado: sanear distribución y geometría.** Limpiar el conjunto anterior antes de amueblar; comprobar entradas, apoyos, ventanas, capas y barandales. Conservar personajes, rigs y reglas v1.6.
2. **Realizado: primera capa doméstica.** Petates/alfombras, camas y textiles geométricos. Revisar composición con las capturas y el croquis actual.
3. **Siguiente: decorado fijo por funciones.** Primero cocina/comedor/despensas; después dormitorios; luego costura/aperos/botica; cerrar con capilla/música/estrado. En cada cuarto retirar duplicados, colocar grupos sobre soportes y revisar desde ambas entradas antes de continuar. No colocar todo el catálogo en cada habitación.
4. **Después: objetos ligeros independientes.** Máximo inicial de 24 objetos nuevos en toda la casa, además de los existentes, priorizando libros, frascos, juguetes y tocador. No convertir cada adorno en un cuerpo ni cambiar CAS para darles uso artificial.
5. **Cerrar: optimización y revisión en teléfono.** Decoración fija fusionada por cuarto/material, materiales mates de paleta compartida, sin texturas pesadas, tela simulada ni nuevas luces dinámicas por adorno. Perfil bajo conserva siluetas y rutas; reduce densidad de motivos, sombras y resolución. Medir en iPhone 12 físico antes de afirmar fluidez real.

## Verificación reproducible

- `python src/build.py prod`: incluye `tools/check_furnishing.py`; 44 puertas, 103 muebles/refugios, seis camas con muro, 12 ventanas internas abiertas y 22 alfombras sin invadir accesos.
- `node test/layout-v11-test.cjs`: cobertura, cápsulas reales en ambas escaleras, habitaciones alcanzables, 60 distribuciones, apertura de cajones, libro arrojado y reservas aleatorias.
- `GHOSTS=all node test/session-casona.cjs` (variable de entorno según shell): partidas con las 22 ánimas y reglas v1.6 actuales; registra finales y posibles atascos, no sustituye una evaluación humana de diversión.
- `python test/browser-layout-v11.py`: cuatro perfiles visuales y auditoría real de triángulos de 44 portales y 20 ventanas.
- `python test/iphone12-webkit.py`: WebKit con perfiles táctiles vertical y horizontal de iPhone 12. Emulación en Windows, no medición de GPU/FPS del teléfono físico.
- `python test/online-layout-v11.py`: sincronización del plano y objetos entre anfitrión y cliente.

Los archivos conservan algunos nombres v11 por compatibilidad con el compilador; el registro de ejecución declara `casona-v13`.
