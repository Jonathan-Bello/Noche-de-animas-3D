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

- `prueba-voz/`: prueba de sala, micrófono, voz por cercanía, radio y teléfono.
