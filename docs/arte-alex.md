# Alex / El Curandero

Arte aprobado el 18 de noviembre de 2026, con lentes redondos. Ashen (A44 Games, 2018) es la referencia principal de abstracción: rostro sin ojos ni boca, volúmenes facetados, colores planos y materiales mate.

`src/alex-art.js` refina exclusivamente el rig de `curandero` al terminar `makeCharacter`. Conserva las posiciones, jerarquía, referencias de manos, codos y rodillas, escala y cuello del repositorio. El cabello usa tres masas angulares; camisa, chaleco con sisas y rebozo son capas separadas. Las monturas redondas se resuelven con diez segmentos. No contiene texturas ni activos externos.

No cambiar `animateCharacter` para adaptar este arte. El módulo conserva la lista de materiales que usa la transición a espíritu y clona los materiales por instancia. `src/build.py` incluye el módulo después de `chars3d.js`; regenerar la página con `python src/build.py`.

Validación con Three.js 0.160.0: ocho estados (reposo, caminar, correr, equipo, agacharse, arrojar, muerte y espíritu) conservan las articulaciones con diferencia cero frente al rig anterior. La función de animación, las configuraciones CHARS y los otros doce personajes permanecen iguales. `test/alex-art-test.js` expone `runAlexArtContractTest(THREE, baselineSource, charsSource, artSource)` para repetir estas comparaciones; baselineSource corresponde a chars3d.js del commit ce8b6d92c80f5858075b74d62cc87806d2acd2e7.

La variante del Sensitivo se prepara aparte para valoración: mismo cuerpo y cabello, camisa vino y maquillaje abstracto. Esta integración no cambia su modelo en el juego. Esperar la aprobación de esa variante antes de incorporarla o extender el estilo a los demás personajes.
