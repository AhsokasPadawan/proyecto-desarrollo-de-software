# ADR-008: Catálogo de Reglas Atómicas (`SlidingMoveRule`, `LeapMoveRule`, `PawnForwardRule`, `PawnCaptureRule`)

* **Estado:** Aceptado
* **Fecha:** 2026-09-27

## 1. What (Qué decidimos)

El comportamiento geométrico de las 6 piezas estándar (y cualquier pieza futura de *Fairy Chess*) se construye a partir de **4 implementaciones atómicas y reutilizables de `IMovementRule`**:

1. **`SlidingMoveRule(directions: DirectionVector[])`**: Recorre rayos continuos paso a paso en cada vector mientras `board.isWithinBounds(pos)` sea verdadero. Agrega casillas vacías; si encuentra una pieza, la incluye únicamente si es de color rival (captura) e inmediatamente detiene la propagación de ese rayo.
   * `Rook`: vectores ortogonales.
   * `Bishop`: vectores diagonales.
   * `Queen`: compone `[new SlidingMoveRule(ORTHOGONAL), new SlidingMoveRule(DIAGONAL)]`.
2. **`LeapMoveRule(offsets: DirectionVector[])`**: Evalúa desplazamientos discretos de un solo salto sin verificar casillas intermedias. Es válido si el destino está dentro de los límites y está vacío u ocupado por una pieza rival.
   * `Knight`: los 8 saltos en $L$ $(\pm 2, \pm 1)$ y $(\pm 1, \pm 2)$.
   * `King`: los 8 desplazamientos unitarios adyacentes.
3. **`PawnForwardRule`**: Calcula el avance frontal sin captura según el color (`deltaRow = +1` para Blancas, `-1` para Negras). Habilita 1 paso si la casilla frontal está vacía, y habilita el **avance doble inicial (2 pasos)** si el peón se encuentra en su fila de origen (`row === 1` para Blancas o `row === board.rows - 2` para Negras) y ambas casillas frontales están vacías.
4. **`PawnCaptureRule`**: Evalúa las dos diagonales frontales `(forwardDelta, -1)` y `(forwardDelta, +1)` y las habilita exclusivamente si están ocupadas por una pieza rival.
   * `Pawn`: compone `[new PawnForwardRule(), new PawnCaptureRule()]`.

## 2. Why (Por qué lo elegimos)

1. **Cohesión Atómica y Reutilización Total:** Ninguna clase de pieza contiene bucles ni condicionales de coordenadas; todas las piezas delegan en este conjunto mínimo de 4 constructores geométricos.
2. **Preparación Abierta/Cerrada para *En Passant* y *Fairy Chess*:** Separar el avance del peón (`PawnForwardRule`, que ya incluye el salto doble inicial necesario para habilitar la captura al paso) de su captura diagonal (`PawnCaptureRule`) permite que, si en el futuro se incorpora *En Passant*, no haya que modificar ni `PawnForwardRule` ni `PawnCaptureRule`: bastará con agregar una tercera regla `EnPassantCaptureRule` a la lista de composición del `Pawn`. Asimismo, habilita piezas híbridas en la defensa oral en segundos.

## 3. When to Break (Cuándo reconsiderar o romper esta decisión)

Esta decisión debería revisarse si:
* Se agregaran piezas cuyas trayectorias cambian de dirección a mitad de camino tras saltar un obstáculo (como el *Cañón* del Xiangqi, que se desliza como torre pero necesita saltar exactamente una pieza intermedia para capturar), lo cual se resuelve agregando una nueva implementación `HoppingSlideMoveRule` de `IMovementRule` sin alterar las 4 existentes.
