# 03: Contratos Base (`IPiece`, `Piece`, `IMovementRule`) y `BoardSetupFactory`

**What to build:** Definir los contratos de composición `IMovementRule`, `IPiece` y la clase base abstracta superficial `Piece` (que delega `getPseudoLegalMoves` en su arreglo compuesto de `IMovementRule[]`), junto con `BoardSetupFactory` para poblar un `Board` con la disposición inicial estándar de 32 piezas.

**Blocked by:** `02-board-mutable-y-board-query`

**Branch:** `ticket/03-contratos-pieza-y-setup-estandar`

**Status:** Done

## Acceptance Criteria

- [x] `IMovementRule` define `getPseudoLegalMoves(from: Position, piece: IPiece, board: IBoardQuery): Position[]`.
- [x] La clase abstracta `Piece` encapsula `color: Color`, `type: PieceType` y `rules: readonly IMovementRule[]`, combinando sin duplicados las posiciones devueltas por cada regla compuesta.
- [x] `BoardSetupFactory` inicializa un tablero estándar de $8 \times 8$ ubicando las 16 piezas `WHITE` en las filas `0` y `1` y las 16 piezas `BLACK` en las filas `6` y `7` utilizando *lookup tables* para la fila mayor.
- [x] Suite de tests unitarios **AAA** en memoria verificando la agregación de múltiples `IMovementRule` en `Piece` y la disposición inicial de las 32 piezas.
