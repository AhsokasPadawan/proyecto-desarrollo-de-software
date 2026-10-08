# 05: Regla Deslizante (`SlidingMoveRule`) y Clases `Rook`, `Bishop` y `Queen`

**What to build:** Implementar la estrategia componible `SlidingMoveRule` parametrizada por vectores de dirección continua y las clases nominales `Rook` (4 rayos ortogonales), `Bishop` (4 rayos diagonales) y `Queen` (composición de `SlidingMoveRule` ortogonal + diagonal).

**Blocked by:** `03-contratos-pieza-y-setup-estandar`

**Branch:** `ticket/05-regla-deslizante-torre-alfil-reina`

**Status:** Done

## Acceptance Criteria

- [x] `SlidingMoveRule` proyecta cada vector paso a paso mientras `board.isWithinBounds(pos)` sea verdadero, agregando casillas vacías.
- [x] Detiene el rayo inmediatamente antes de una casilla ocupada por una pieza del mismo color (bloqueo amigo).
- [x] Incluye la primera casilla ocupada por una pieza de color rival (captura) y detiene el rayo en esa casilla sin atravesarla.
- [x] `Rook`, `Bishop` y `Queen` extienden `Piece` configurando exclusivamente sus instancias de `SlidingMoveRule` sin duplicar bucles de recorrido.
- [x] Suite de tests unitarios **AAA** en memoria cubriendo movimientos en tablero libre, bordes, bloqueos amigos y capturas rivales para las 3 piezas.
