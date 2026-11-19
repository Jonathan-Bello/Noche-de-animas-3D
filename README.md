# Noche de Ánimas 3D

Juego asimétrico de deducción en el navegador: hasta 4 investigadores contra 1 ánima del folclor mexicano.

## Cómo se juega en línea sin servidor propio

- **GitHub Pages** solo entrega los archivos; el juego corre en el navegador de cada jugador.
- **Quien crea la sala es el anfitrión:** su navegador corre la partida y reparte el estado.
- **WebRTC** conecta a los jugadores directamente (datos y voz).
- **PeerJS** (servicio público gratuito) solo los presenta al inicio con el código de la sala.

## Privacidad de la voz

Las «frases robadas» que usa la casona se guardan solo en la memoria de la pestaña de cada jugador y se borran al cerrarla. Nunca se suben a ningún servidor.

## Contenido

- `juego/`: la demo 3D (se genera; no se edita a mano).
- `src/`: el código fuente.
  - `logic2.js`: reglas y bots, sin gráficos.
  - `rules3.js`: reglas v1.1 (22 ánimas, casona con dado de 100, luces, salida, fotos, dinero).
  - `net.js`: sala en línea, sincronización y voz.
  - `chars3d.js` y `game3d.js`: modelos, render e interfaz.
  - `casona3d.js`: lo que se ve y se oye de las reglas nuevas (sucesos, libreta, tragamonedas).
  - `shell2.html`: la página.
- `prueba-voz/`: prueba de sala, micrófono, voz por cercanía, radio y teléfono.
- `test/`: pruebas locales (`fakepeer.js` simula PeerJS entre pestañas).

## Cómo armar la demo

```
python3 src/build.py
```

Genera `juego/index.html` a partir de `src/`.

## Casona y decoración V13

- [Croquis amueblado interactivo](arte/decoracion-v13/index.html): distribución real, reservas de puertas y programa por habitación.
- [Plan de decoración y permisos del ánima/casa](docs/decoracion-v13.md).
- [Catálogo de 30 familias decorativas](arte/decoracion-v13/catalogo.json): diferencia lo construido y lo propuesto.

El compilador comprueba puertas, apoyos de camas y superposiciones de muebles antes de generar la demo. Las pruebas principales están documentadas en el plan.
