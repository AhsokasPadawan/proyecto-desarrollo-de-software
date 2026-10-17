# Sub-paquete `core/ports/` — Contratos y Puertos del Dominio

Define los contratos de entrada y salida del dominio bajo **Arquitectura Hexagonal (Ports & Adapters)** y el patrón **Observer**.

---

## Archivos, Interfaces y Conexiones

### 1. `GameSnapshot.ts`
* **Interfaces**:
  * `PieceSnapshot`: `{ readonly type: PieceType; readonly color: Color }`
  * `MoveRecord`: registro inmutable de una jugada realizada (`moveIndex`, `turn`, `piece`, `from`, `to`, `capturedPiece?`, `isCastling?`, `isPromotion?`, `promotionPiece?`).
  * `GameSnapshot`: fotografía completa e inmutable del estado actual de la partida (`rows`, `cols`, `grid`, `currentTurn`, `stateKind`, `winner`, `canUndo`, `canRedo`, `moveHistory`, `currentMoveIndex`).
* **Cómo se conecta**: Emitido por `ChessGame.getSnapshot()`, consumido por `FenSerializer`, las estrategias de IA (`IAiStrategy`) y los adaptadores de interfaz gráfica (React). Garantiza que ningún consumidor externo pueda mutar objetos internos del dominio.

### 2. `IBoardQuery.ts`
* **Interfaces**:
  * `PiecePlacement`: `{ readonly position: Position; readonly piece: IPiece }`
  * `IBoardQuery`: interfaz de consulta del tablero.
* **Métodos**:
  * `isWithinBounds(position: Position): boolean`
  * `getPieceAt(position: Position): IPiece | null`
  * `isSquareEmpty(position: Position): boolean`
  * `findKingPosition(color: Color): Position | null`
  * `getPiecesByColor(color: Color): readonly PiecePlacement[]`
  * `getEnPassantTarget(): Position | null`
  * `hasPieceMoved(piece: IPiece): boolean`
* **Cómo se conecta**: Implementada por `Board`. Aplica el **Principio de Segregación de Interfaces (ISP)**: expone una vista estrictamente de solo lectura hacia `IPiece`, `IMovementRule` y `CheckDetector`, impidiendo que el cálculo de movimientos modifique accidentalmente el tablero.

### 3. `IGameEngine.ts`
* **Interfaz**: `IGameEngine` (Puerto *Driving* principal del motor).
* **Métodos**:
  * `getSnapshot(): GameSnapshot`
  * `getLegalMoves(from: Position): Position[]`
  * `makeMove(from: Position, to: Position, promotionPiece?: PieceType): MoveResult`
  * `declareTimeout(timedOutColor: Color): GameSnapshot`
  * `undo(): boolean`
  * `redo(): boolean`
  * `subscribe(observer: IGameObserver): UnsubscribeFn`
  * `unsubscribe(observer: IGameObserver): void`
* **Cómo se conecta**: Implementada por `ChessGame` y consumida por las estrategias de IA (`IAiStrategy`) y la capa de adaptadores.

### 4. `IGameObserver.ts`
* **Interfaz y Tipo**:
  * `IGameObserver`: `{ onGameStateChanged(snapshot: GameSnapshot): void }`
  * `UnsubscribeFn`: `() => void`
* **Cómo se conecta**: Implementa el patrón **Observer**. Permite a `ChessGame` notificar cambios de estado a suscriptores externos (como el hook `useSyncExternalStore` en React) sin que el Core conozca a React.

### 5. `MoveResult.ts`
* **Tipos**:
  * `GameStateKind`: `'IN_PROGRESS' | 'CHECK' | 'CHECKMATE' | 'STALEMATE' | 'DRAW' | 'TIMEOUT'`
  * `MoveRejectionReason`: `'GAME_OVER' | 'EMPTY_ORIGIN' | 'WRONG_TURN' | 'ILLEGAL_MOVE' | 'KING_LEFT_IN_CHECK'`
  * `MoveResult`: Unión discriminada por `success: true | false`.
* **Cómo se conecta**: Retornado por `ChessGame.makeMove()`. Obliga al consumidor a verificar `result.success` antes de acceder a `nextState` o `reason`.
