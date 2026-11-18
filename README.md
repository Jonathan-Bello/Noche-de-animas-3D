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
  - `net.js`: sala en línea, sincronización y voz.
  - `chars3d.js` y `game3d.js`: modelos, render e interfaz.
  - `shell2.html`: la página.
- `prueba-voz/`: prueba de sala, micrófono, voz por cercanía, radio y teléfono.
- `test/`: pruebas locales (`fakepeer.js` simula PeerJS entre pestañas).

## Cómo armar la demo

```
python3 src/build.py
```

Genera `juego/index.html` a partir de `src/`.
