# 08: Demostrador de Extensibilidad (*Fairy Chess* y Dimensiones Alternativas)

**What to build:** Validar la invariante *Open/Closed* y *Composition over Inheritance* creando una pieza híbrida de *Fairy Chess* (por ejemplo `Chancellor` = Torre + Caballo o `Archbishop` = Alfil + Caballo) sin modificar ninguna clase existente y verificando el comportamiento de las piezas sobre tableros de dimensiones alternativas ($10 \times 10$ y $6 \times 6$).

**Blocked by:** `05-regla-deslizante-torre-alfil-reina`, `06-regla-salto-caballo-y-rey`, `07-reglas-peon-avance-y-captura`

**Branch:** `ticket/08-extensibilidad-fairy-chess-y-dimensiones`

**Status:** ready-for-agent

## Acceptance Criteria

- [ ] Se registra una clase de pieza híbrida que extiende `Piece` componiendo `SlidingMoveRule` y `LeapMoveRule` con cero líneas modificadas en `Rook`, `Bishop`, `Knight`, `Queen`, `King` o `Pawn`.
- [ ] Los movimientos deslizantes, saltos y el cálculo de fila inicial de `PawnForwardRule` (`board.rows - 2`) operan correctamente en un `Board(10, 10)` y en un `Board(6, 6)`.
- [ ] Suite de tests unitarios **AAA** en memoria certificando el escenario de la prueba de fuego de la defensa oral.
