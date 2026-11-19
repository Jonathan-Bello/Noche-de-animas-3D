# Primera muestra gráfica de la casona

Dirección confirmada por el usuario: PC y celular con calidad ajustable; casona mexicana antigua y vivida, con recuerdos y desgaste moderado; terror legible en penumbra. La referencia de personajes sigue siendo la estilización facetada y mate aprobada, inspirada en Ashen.

## Alcance integrado

- Cinco apariencias de ánima aprobadas: encapuchada con papel picado, mujer de blanco, sombra alta, niño en camisón y anciano de sarape. `anima-art.js` conserva el contrato del rig y usa la animación original. Humo con ojos llama directamente a la fábrica original; no se integra la propuesta rechazada.
- Muestra del recorrido zaguán → corredor/patio → capilla: mesas con patas y travesaños, corredores de tela, retablo, cuadros geométricos, flores, cerámica, plantas angulares, zócalos, cornisas, arcos y fuente hueca facetada. Son cuatro zonas de muestra; el resto de los cuartos conserva su decoración anterior.
- Ambientación ligeramente más legible para investigadores. Se mantienen apagadores, focos, niebla y diferencias entre habitaciones iluminadas y apagadas.
- Calidad local Automática, Ligera, Equilibrada y Alta. Automática selecciona Ligera con puntero táctil y Equilibrada en escritorio. La preferencia persiste en el navegador y no viaja en las opciones de la partida multijugador.

## Integración

`house-art.js` genera cuatro mallas combinadas con colores por vértice, materiales mate y sin texturas. Ligera incorpora 15 518 triángulos; Equilibrada/Alta, 16 730. La resolución se limita a DPR 1 / 1,35 / 2. Ligera desactiva sombras; las otras usan mapas de 768 / 1024. Los objetos de adorno pequeños se omiten en Ligera. Cambiar de calidad desde el menú se aplica a la siguiente construcción de la casa; resolución y sombras se aplican al seleccionar.

El constructor conserva las cuadrículas, puertas, puntos de interacción y alturas de apoyo: mesa 0,78 m y altar 0,95 m. Sustituye únicamente la representación de mesas del zaguán/capilla, altar fijo y estanque del patio. Las decoraciones no son objetos recogibles nuevos. La animación de personajes humanos y sus reparaciones de ropa no se modifican.

El build incluye también `casa3d.js` y las funciones v1.4 incorporadas en el commit remoto `12c936f`.

## Verificación

Con Three.js 0.160.0 y Edge: cuatro perfiles gráficos, selección/persistencia del menú, arranque, geometría finita, alturas de apoyo y ejecución del constructor sin alterar datos de colisión. Simulación de móvil táctil 390 × 844, DPR 2; el render queda limitado a DPR 1 en Automática.

`test/anima-art-test.js` comprueba seis apariencias durante 600 fotogramas cada una, conservación de referencias del rig y desvanecimiento; compara geometría, materiales y transformaciones de humo con la fábrica original y comprueba que la función original de animación no cambió.

Las capturas de revisión proceden del render real del juego con cámara en primera persona, usando renderizado por software para QA. No representan una medición de FPS en celulares físicos. El siguiente control de rendimiento debe hacerse en dispositivos reales antes de extender esta densidad decorativa a toda la casa.

Pruebas de partida: investigador, ánima y bots arrancan y avanzan; anfitrión/invitado sincronizan movimiento, linterna y desconexión con PeerJS simulado. No se detectan excepciones de JavaScript. El arranque carga un audio ausente, `juego/assets/s/llorona.mp3` (404), ya referenciado y ausente en `origin/main` antes de este cambio. Queda señalado para el responsable de audio; no se sustituye por otro sonido.

## Continuación del plan

1. Revisar visualmente esta muestra y ajustar densidad, contraste y paleta.
2. Extender el kit arquitectónico y dar identidad propia a cocina, comedor, recámaras, biblioteca y demás cuartos; añadir recuerdos y desgaste geométrico moderado.
3. Unificar herramientas en primera persona, objetos interactivos y sus estados con el mismo lenguaje visual.
4. Afinar luz, efectos e interfaz, y medir rendimiento en PC y celular reales para cerrar los presupuestos gráficos.
