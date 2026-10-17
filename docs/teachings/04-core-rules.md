# Sub-paquete `core/rules/` — Reglas de Movimiento y Detección de Jaque

Encapsula los algoritmos geométricos de movimiento pseudo-legal (patrón **Strategy** a nivel de pieza) y el servicio de dominio para detección de ataques y jaque (`CheckDetector`).

---

## Archivos, Clases, Métodos y Conexiones

### 1. `IMovementRule.ts`
* **Interfaz**: `IMovementRule`
  * Método: `getPseudoLegalMoves(from: Position, piece: IPiece, board: IBoardQuery): Position[]`
* **Cómo se conecta**: Implementada por todas las reglas de movimiento y consumida por la clase base `Piece`.

### 2. `SlidingMoveRule.ts`
* **Clase y Constantes**: `SlidingMoveRule`, vectores `ORTHOGONAL_DIRECTIONS` y `DIAGONAL_DIRECTIONS`.
* **Método**: `getPseudoLegalMoves(from, piece, board)`
  * Recorre cada dirección paso a paso con `currentPosition.offset(deltaRow, deltaCol)` bajo la condición estructurada `while (board.isWithinBounds(currentPosition) && isRayUnblocked)` (sin `break` intermedios).
  * En cada paso, agrega `currentPosition` si no hay una pieza aliada (`pieceAtTarget?.color !== piece.color`) y actualiza `isRayUnblocked = pieceAtTarget === null` para detener el rayo tras el primer obstáculo.
* **Cómo se conecta**: Reutilizada por `Rook`, `Bishop` y `Queen`.

### 3. `LeapMoveRule.ts`
* **Clase y Constantes**: `LeapMoveRule`, vectores `KNIGHT_OFFSETS` (los 8 saltos en "L") y `KING_OFFSETS` (las 8 casillas adyacentes).
* **Método**: `getPseudoLegalMoves(from, piece, board)`
  * Como cada salto es independiente de las casillas intermedias, proyecta los desplazamientos de forma declarativa con `.map()` y filtra con `.filter()` aquellos que caen dentro del tablero (`board.isWithinBounds`) y no contienen una pieza aliada (`board.getPieceAt(targetPosition)?.color !== piece.color`).
* **Cómo se conecta**: Reutilizada por `Knight` y `King`.

### 4. `PawnForwardRule.ts`
* **Clase y Constantes**: `PawnForwardRule`, tabla `PAWN_FORWARD_DELTAS` (`WHITE: 1`, `BLACK: -1`).
* **Métodos**:
  * `getPseudoLegalMoves(from, piece, board)`: coordina el avance frontal consultando primero `getSingleStepMove` (si no está disponible retorna `[]`) y luego `getDoubleStepMove`.
  * `private getSingleStepMove(from, forwardDelta, board)`: evalúa el avance frontal de 1 casilla verificando que esté dentro del tablero y vacía.
  * `private getDoubleStepMove(from, color, forwardDelta, board)`: verifica mediante la *Lookup Table* `initialRowByColor` (`WHITE: 1`, `BLACK: board.rows - 2`) si el peón está en su fila de salida y si la casilla a 2 pasos está vacía.
* **Cómo se conecta**: Compuesta dentro de `Pawn`.

### 5. `PawnCaptureRule.ts`
* **Clase y Constantes**: `PawnCaptureRule`, `CAPTURE_COLUMN_OFFSETS = [-1, 1]`.
* **Método**: `getPseudoLegalMoves(from, piece, board)`
  * Proyecta con `.map()` las 2 diagonales frontales (`from.offset(forwardDelta, deltaCol)`) y filtra con `.filter()` aquellas donde existe una pieza enemiga (`pieceAtTarget !== null && pieceAtTarget.color !== piece.color`).
* **Cómo se conecta**: Compuesta dentro de `Pawn`.

### 6. `EnPassantCaptureRule.ts`
* **Clase**: `EnPassantCaptureRule`.
* **Método**: `getPseudoLegalMoves(from, piece, board)`
  * Consulta `board.getEnPassantTarget()`. Si existe una casilla objetivo al paso en la diagonal frontal inmediata del peón, la devuelve como destino válido.
* **Cómo se conecta**: Compuesta dentro de `Pawn`. El objetivo `enPassantTarget` en el tablero lo actualiza turno a turno `MoveCommand`.

### 7. `CastlingMoveRule.ts`
* **Clase**: `CastlingMoveRule` (100% *stateless* y *pseudo-legal*).
* **Métodos**:
  * `getPseudoLegalMoves(from, piece, board)`: verifica `canKingAttemptCastling` y proyecta los dos flancos (`kingside` y `queenside`) con `.map().filter()`.
  * `private canKingAttemptCastling(from, piece, board)`: verifica con una *Lookup Table* (`initialRowByColor`) que el Rey esté en su fila inicial y no se haya movido (`!board.hasPieceMoved(piece)`).
  * `private getCastlingTargetForSide(...)`, `private hasUnmovedRookAtCorner(...)` y `private isPathClearBetween(...)`: verifican que exista una Torre aliada sin moverse en esa esquina y que todas las casillas intermedias estén vacías.
* **Cómo se conecta**: Compuesta dentro de `King`. La validación de que el Rey no salga de jaque ni cruce una casilla atacada se delega a `ChessGame` (donde vive toda la evaluación de `CheckDetector`).

### 8. `CheckDetector.ts`
* **Clase**: `CheckDetector`.
* **Métodos**:
  * `isSquareAttacked(board: IBoardQuery, target: Position, byColor: Color): boolean`: evalúa de forma declarativa con `.some()` si alguna pieza de `byColor` ataca `target`.
  * `isKingInCheck(board: IBoardQuery, kingColor: Color): boolean`: busca la posición del Rey con `board.findKingPosition(kingColor)` y consulta `isSquareAttacked` por el color opuesto.
  * `private doesPieceAttackSquare`, `private doesKingAttackSquare`, `private doesPawnAttackSquare`: aíslan la evaluación de ataque por pieza (contemplando que el Rey ataca a 1 casilla de distancia y que el Peón ataca en sus dos diagonales incluso sobre casillas vacías como la casilla de paso del enroque).
* **Cómo se conecta**: Utilizado por `ChessGame` (filtrado de jugadas legales y detección de jaque/mate) y `GreedyMaterialAiStrategy`.

### 9. `legalMoveEvaluator.ts` (Evaluador de Legalidad en Tableros)
* **Funciones**:
  * `hasAnyLegalMove(board: Board, color: Color, checkDetector?: CheckDetector): boolean`: función pura del dominio que simula los movimientos pseudo-legales de cada pieza sobre un `Board` y evalúa si alguno no deja al rey en jaque mediante `try ... finally { testCommand.undo(); }`.
* **Cómo se conecta**: Permite que cualquier consumidor del dominio (como `GreedyMaterialAiStrategy`) verifique si un tablero simulado tiene respuestas legales para detectar el jaque mate, sin necesidad de duplicar la infraestructura de simulación de `ChessGame`.

