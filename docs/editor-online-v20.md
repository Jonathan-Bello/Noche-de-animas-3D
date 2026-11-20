# Decorar la casona desde internet · V20

Abre **[el editor público](https://jonathan-bello.github.io/Noche-de-animas-3D/editor/?v=editor-v20)**. No necesitas instalar el repositorio, Python ni un servidor local.

## Editar con tus amigos

1. Pulsa **Crear sala compartida**.
2. Pulsa **Copiar invitación** y envía ese enlace a tus amigos. Ellos pueden editar sin cuenta.
3. Elige piso y cuarto. Selecciona y arrastra una pieza, o pulsa **Mover** y toca el destino. Usa **Girar 90°**, **Cancelar**, **Deshacer** y **Añadir adornos**.
4. Deja abierta la pestaña del anfitrión. La sala comparte los cambios confirmados; cada participante puede mirar un cuarto diferente.
5. El anfitrión conecta GitHub y pulsa **Publicar en el juego** cuando la distribución esté lista.

La sala funciona entre navegadores mediante PeerJS/WebRTC, igual que la conexión del juego. No es una base de datos permanente. Al cerrar el anfitrión, los invitados conservan su copia como borrador, pueden descargarla o iniciar otra sala. Algunas redes no permiten conectar navegadores; el editor explica el error y mantiene el borrador.

Si llega un cambio mientras otro participante estaba editando, se conserva el intento anterior y aparece **Descargar intento anterior**. La distribución aceptada por el anfitrión tiene prioridad; no se sobrescribe silenciosamente con una versión antigua. Los visitantes de una sala no publican por separado: publica el anfitrión.

## Conectar GitHub: solo quien publica

GitHub Pages sirve la página; escribir en el repositorio requiere autorización de GitHub. La conexión de la aplicación Codex y la sesión normal de github.com no se heredan dentro de esta página.

1. Pulsa **Conectar GitHub para publicar**. El editor muestra las instrucciones y el enlace oficial para crear el token.
2. En GitHub, crea un **fine-grained personal access token** con tu cuenta como propietario y una caducidad corta.
3. En **Only select repositories**, elige **Noche-de-animas-3D**.
4. En permisos del repositorio, habilita **Contents: Read and write**. No hace falta permiso de Workflows ni de Actions para publicar desde el editor.
5. Pega la credencial en el campo de contraseña del editor y pulsa **Conectar cuenta**. Nunca la pegues en un chat, un archivo del repositorio o un enlace.

La credencial permanece únicamente en memoria de esa pestaña. Se envía a `api.github.com` en la cabecera de autorización; no se guarda en localStorage, en el plano, en GitHub ni se envía a los amigos. Recargar o desconectar borra esta conexión. Cada amigo que quiera alojar y publicar su propia sala necesita su propia autorización con acceso de escritura al repositorio; los invitados no la necesitan.

La API oficial de GitHub exige permiso de escritura de Contents para actualizar archivos: [documentación de GitHub](https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents).

## Publicar cambia el juego general

**Publicar en el juego** envía una propuesta de datos al repositorio. Un flujo de GitHub Actions:

1. Comprueba que el plano publicado no haya cambiado desde que empezaste.
2. Valida muebles, apoyos, puertas, escondites y componentes estructurales.
3. Recorre ambas escaleras y los 22 cuartos con la navegación real del juego; comprueba la cobertura de escondites y 20 distribuciones aleatorias de objetos.
4. Si todo funciona, guarda el plano, regenera el juego y los módulos de cuartos, y despliega GitHub Pages.
5. El editor muestra **Publicado** cuando el despliegue termina. Abre el juego de nuevo o recarga la página.

Si el plano falla, se publica el motivo en español y el juego conserva el plano anterior. **Ver publicación** abre el seguimiento de GitHub. Si otra persona publicó antes que tú, descarga tu borrador y usa **Cargar plano publicado** para partir de la versión vigente. No se mezclan silenciosamente dos distribuciones distintas.

El estado del juego en curso no cambia en caliente: la nueva distribución se utiliza al cargar la versión actualizada del juego. Las salas compartidas son temporales; lo publicado en GitHub sí permanece guardado.

## Mover escaleras y estructura

Activa **Editar estructura**. En **B07 Escalera principal**, **A07 Rellano**, **B04 Cocina** o **A04 Cuarto de la nana**, selecciona la escalera y pulsa **Mover**, o arrástrala.

Se desplazan juntos sus peldaños, barandales, hueco del piso superior, reservas de circulación, accesos, ruta de navegación y perfil de altura. El movimiento usa casillas de un metro y afecta a los dos pisos. Puedes deshacerlo.

La escalera debe permanecer dentro de sus dos cuartos conectados y dejar libres sus desembarcos. Esta versión permite **trasladarla**; no girarla, agrandarla ni conectarla con otros cuartos. Columnas y piezas fijas se pueden trasladar desde el plano cuando está activo el modo estructural. Los muros, puertas y límites de los cuartos conservan el plano.

## Entender los avisos

- **Bloquea el paso de una puerta:** deja libre la zona naranja frente al vano.
- **Choca con otra pieza:** separa los volúmenes; no basta con que sus centros estén alejados.
- **Sobresale de su superficie de apoyo:** mueve el adorno hacia el centro de la mesa o repisa.
- **Cabecera contra una pared:** mueve o gira la cama hasta apoyar su cabecera.
- **Entrada del escondite tapada:** libera la casilla por la que se entra.
- **Escalera fuera de sus cuartos:** necesita caber tanto abajo como arriba.
- **Zonas sin escondite alcanzable / ruta sin conexión:** el plano pasa la revisión visual, pero la navegación del juego detecta un problema. Ajusta o deshaz el último cambio.

La lista aparece junto a la vista mientras colocas. Rojo indica un problema; verde indica que no se detectan interferencias geométricas. La navegación completa se comprueba al guardar o publicar.

## Archivos y comprobaciones

- Interfaz de salas/publicación: `editor/online-editor.js`.
- Transformación estructural compartida: `src/stair-layout.js`; validación: `tools/check_structure.py`.
- Publicación: `.github/workflows/publicar-casona.yml`, `tools/publish_editor.py`, `editor-publications/request.json` y `status.json`.
- Pruebas: `test/editor-online-v20.py` (transporte y API simulados), `test/publication-v20.py` (validación y reconstrucción reales), `test/editor-navigation.cjs` (navegación real).

La edición local y los talleres de modelos V17–V19 siguen disponibles. Para cambiar la apariencia de una pieza, usa **Archivo y ayuda → Editar modelos de muebles**. La publicación en línea de esta entrega aplica la distribución; los talleres de modelos conservan sus métodos anteriores de guardado/exportación.
