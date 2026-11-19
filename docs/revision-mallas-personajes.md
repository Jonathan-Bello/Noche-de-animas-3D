# Reparación de prendas y revisión de mallas

Se corrigieron tres causas de roturas visibles: sisas demasiado bajas en sacos/abrigos, orientación inconsistente de caras y separación entre segmentos rígidos de mangas/pantalones. Las sisas ahora terminan bajo el hombro; solapas y cinturón siguen la superficie del abrigo y los faldones responden al movimiento de las piernas. Las mangas y pantalones usan tubos continuos con deformación progresiva en codos y rodillas. Se conserva la jerarquía y las referencias que usa la animación original; no se cambian alturas ni posiciones de las articulaciones.

`src/character-qc.js` prepara cada personaje una vez: elimina triángulos de área cero y caras duplicadas, propaga una orientación coherente entre triángulos vecinos y orienta hacia fuera los componentes cerrados. Conserva atributos y grupos de material. Cierra la entrepierna, raíz de trenzas y espesor de faldas. Cada instancia conserva sus materiales. `update` deforma las uniones continuas después de la animación existente.

La corrección se incluye desde `src/build.py`. Las funciones públicas de fábrica y animación mantienen sus nombres y contrato. Las pequeñas superficies abiertas permitidas por la auditoría corresponden exclusivamente a pintura de mechas y patillas planas de los lentes; no son huecos de prendas ni del cuerpo.

Validación con Three.js 0.160.0:

- `test/mesh-topology-test.js`: 717 mallas, 88 434 vértices en reposo. Sin coordenadas inválidas, triángulos degenerados, aristas no manifold, conflictos de orientación, piezas cerradas invertidas ni bordes estructurales abiertos.
- `test/character-mesh-qc-test.js`: 13 personajes × 14 casos × 240 fotogramas = 43 680 fotogramas, con 297 138 240 posiciones de vértices inspeccionadas. Sin coordenadas inválidas, triángulos colapsados en las uniones continuas ni separación entre vértices coincidentes de esas uniones.
- Casos: reposo, caminar, correr, linterna, apuntar con temblor, sostener equipo, agacharse, agacharse apuntando, usar objeto, movimiento de reacción, lanzar, correr lanzando, muerte y espíritu. Se recorren transiciones completas, no solo poses finales.
- Comparación de las articulaciones con la base previa, materiales independientes, cabello compartido de Alex y atributos aprobados del Sensitivo y Técnico.
- Capturas de los trece personajes usando equipo, corriendo, agachados y como espíritu; comparación antes/después del Guardaespaldas.

Estas pruebas cubren las animaciones y combinaciones indicadas. Las métricas de topología y costuras no sustituyen la inspección visual de intersecciones entre prendas: nuevas animaciones, accesorios o cambios de proporción deben pasar el mismo recorrido de revisión.
