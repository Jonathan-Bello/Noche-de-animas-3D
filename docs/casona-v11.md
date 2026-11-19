# Casona v11 — reconstrucción del escenario

La casona sustituye la construcción anterior: geometría, puertas, colisiones y navegación se generan sobre el mismo registro del plano. No se monta una segunda decoración sobre las habitaciones antiguas. Los personajes, sus animaciones y las apariencias aprobadas del ánima se conservan.

## Distribución y arte

- Huella de 60 × 40 m, dos plantas a 3.8 m, patio central y circulación de 3 m. Veintidós cuartos elegibles para el hogar del ánima.
- Escalera principal en U al oeste y escalera de servicio entre cocina y nana. Perfiles continuos de altura, descansos, huecos en el entrepiso y barandales.
- Galería y arquerías en los cuatro lados del patio; coro abierto sobre la nave de la capilla.
- Portón y puertas de dos hojas con perfiles angulares coincidentes con los vanos. Un solo retablo arquitectónico en la capilla; las cruces pequeñas recogibles siguen siendo objetos del juego.
- Ventanas recortadas en el muro, con postigos, rejas y vidrio roto, tablas o tapiado. El balcón principal queda sobre el portón. La luz direccional lunar y las luces cercanas conservan la lectura de volúmenes.
- Mobiliario funcional por cuarto, retratos geométricos, libros, papel picado, plantas, fuente y bañera. Arbustos separados y molduras con relieve real. Se eliminan caras internas de muros y se extruyen las masas escalonadas para evitar costuras de caras coincidentes.

## Reglas conectadas al plano

Hay 24 candidatos de escondite. El presupuesto aprobado es de 18–20 activos; la distribución física actual necesita **20** en las selecciones ensayadas. La cobertura máxima es de 18 m por camino horizontal en el mismo piso, hasta el punto de aproximación, con puertas transitables. No representa una garantía de escape durante una cacería.

Los muebles altos y las puertas cerradas ocluyen la visión; las mesas bajas no funcionan como paredes. Las puertas cerradas bloquean entidades físicas. Se corrige el cambio de piso de la navegación para que ocurra exclusivamente en la escalera, salvo entidades con desplazamiento etéreo permitido por sus reglas.

Altar, fusibles, hogar, escondites y objetos mantienen su selección aleatoria. El altar ritual se apoya sobre una superficie real; el retablo de la capilla es fijo. Los fusibles se montan en pared, evitando ventanas, puertas y refugios. El contenido inicial se coloca en superficies, evitando intersecciones entre dispositivos y objetos.

Cada cuarto elegible tiene tres cajones: 66 en total. Pulsar E inicia una búsqueda de un segundo, con ruido; alejarse la cancela. Los objetos guardados se revelan sobre la superficie del propio mueble. Solo se asignan contenidos alcanzables desde su punto de acceso; los demás permanecen sobre superficies. Las cantidades originales de suministros se conservan.

La libreta incluye un plano esquemático de ambas plantas, sin revelar posiciones aleatorias. Las instantáneas de red incluyen la versión del plano, cajones y posiciones de los objetos de ambiente. Una sala rechaza clientes con otra versión de distribución.

## Archivos que mantener

| Archivo | Responsabilidad |
| --- | --- |
| `src/layout-v11.json` | Cuartos, vanos, obstáculos, ventanas, perfiles de escaleras y contratos |
| `src/layout-runtime.js` | Retícula, superficies, aproximaciones, selección de refugios y navegación de escaleras |
| `src/layout-rules.js` | Posicionamiento, cajones y visibilidad por altura |
| `src/casona-layout3d.js` | Arquitectura y muebles estáticos, puertas, refugios y cajones |
| `src/house-art.js` | Preferencia de calidad local |
| `src/game3d.js` | Integración de objetos dinámicos, cámara e interfaz |
| `src/net.js` | Compatibilidad del plano y sincronización |

Para reconstruir la página publicada:

```sh
python src/build.py prod
```

`juego/index.html` es un archivo generado. Los ajustes se realizan en `src/` y se vuelve a compilar. No reintroducir `buildDecor` ni una fachada independiente en `base3d.js`. Al cambiar la trayectoria de una escalera también deben actualizarse sus celdas de navegación y la transición en `layout-runtime.js`.

## Validación reproducible

```sh
node test/layout-v11-test.cjs
python test/browser-layout-v11.py
python test/online-layout-v11.py
python tools/capture_casona_v11.py
```

La prueba Node comprueba cobertura en 100 selecciones, acceso a los 22 cuartos desde la base, ambas escaleras en ambos sentidos con cápsula de radio 0.22 m, puertas y oclusores, colocación en 60 noches y búsqueda/recogida en cajones.

Las pruebas Python requieren Playwright, Edge y una copia de Three.js 0.160.0 en `test/three.module.js` (ignorada por Git). Por defecto usan la instalación de QA de este proyecto en la carpeta hermana `QA_Arte_Alex/python_lib`; adaptar esas rutas al ejecutarlas en otro equipo. Cada script levanta su propio servidor local y escribe resultados en la carpeta hermana `Reconstruccion_Casona_v11`.

La prueba de navegador verifica cuatro calidades, pantalla táctil emulada, geometría y matrices finitas, búsqueda y reinicios de escena. La de red usa dos navegadores y un transporte PeerJS local de prueba: verifica movimiento, linterna, estado aleatorio, apertura de cajones y desconexión. No mide latencia de internet. Las capturas comprueban también por rayos que no queden huecos en los encuentros de tabiques con la fachada.

Las imágenes de `arte/casona-v11/` son capturas del juego con las luces encendidas para inspección; no representan el estado de iluminación de todas las partidas. Los planos de referencia corresponden al diseño aprobado anterior a pequeños ajustes de muebles y puntos de aproximación; el registro de `src/` gobierna el juego.

## Límites de la verificación

La calidad automática usa el perfil bajo en dispositivos táctiles y equilibrado en escritorio; también se puede elegir baja, equilibrada o alta. Se agrupa geometría y se comparten materiales, y el perfil bajo reduce luces y desactiva sombras. Las comprobaciones de pantalla móvil y renderizado por software no sustituyen una medición de FPS en un celular físico. La dificultad de los circuitos y las persecuciones debe afinarse con partidas humanas.
