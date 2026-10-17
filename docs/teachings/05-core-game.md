# Sub-paquete `core/game/` — Motor de Partida, Patrones Command y State

Contiene el orquestador principal (`ChessGame`), la infraestructura de comandos reversibles (patrón **Command**), las fases de la partida (patrón **State**) y los evaluadores de tablas.

---

## 1. Patrón Command (Ejecución, Simulación y Undo/Redo)

* **`ICommand.ts`**: Interfaz `ICommand` con `execute(): void` y `undo(): void`.
* **`MoveCommand.ts`**:
  * Encapsula toda mutación sobre `Board` al realizar una jugada: movimiento estándar, captura normal, captura al paso (`executeEnPassantCapture`), enroque moviendo también la torre (`executeCastling`), y coronación mediante `createPromotedPiece` (usando la *Lookup Table* `PROMOTION_PIECE_CONSTRUCTORS` bajo el principio **GRASP Creator**).
  * Guarda el estado previo exacto agrupado en sub-estructuras tipadas (`CapturedPieceRecord`, `CastlingRecord`, `promotedPiece`, `wasPieceMovedBefore`, `previousEnPassantTarget`), eliminando el *code smell* de *Data Clumps* y banderas booleanas redundantes, para que `undo()` restaure el tablero de forma idéntica ($\text{State}_{\text{before}} \equiv \text{State}_{\text{Act(Undo)}}$).
  * Es utilizado tanto para ejecutar jugadas reales como para simular jugadas temporales al validar si el Rey propio queda en jaque.
* **`CommandHistory.ts`**:
  * Gestiona las pilas `undoStack` y `redoStack` de `ICommand`.
  * Al ejecutar un nuevo comando (`executeCommand`), limpia `redoStack`. Expone `undo()`, `redo()`, `canUndo` y `canRedo`.

---

## 2. Patrón State (Ciclo de Vida y Fases de la Partida)

* **`IGameState.ts`**:
  * `GameStateContext`: estructura con los indicadores evaluados al final de un turno (`isKingInCheck`, `hasLegalMoves`, `isFiftyMoveRuleReached`, `isInsufficientMaterial`, `isThreefoldRepetition`).
  * `IGameState`: contrato con `readonly type: GameStateType`, `canAcceptMoves(): boolean`, `getWinner(currentTurn: Color): Color | null` y `evaluateNextState(context: GameStateContext): IGameState`.
* **`activeStateTransition.ts`**:
  * Función `evaluateActiveStateTransition(context)` apoyada en la *Lookup Table* `NEXT_STATE_FACTORIES` para resolver la transición desde estados activos sin cadenas de `switch`.
* **Implementaciones concretas de `IGameState`**:
  * `NormalPlayState` (`'IN_PROGRESS'`): acepta jugadas y delega la transición en `evaluateActiveStateTransition`.
  * `CheckState` (`'CHECK'`): acepta jugadas y delega la transición en `evaluateActiveStateTransition`.
  * `CheckmateState` (`'CHECKMATE'`): estado terminal (`canAcceptMoves() === false`), retorna como ganador a `OPPOSITE_COLOR[currentTurn]`.
  * `StalemateState` (`'STALEMATE'`): estado terminal por ahogado, sin ganador (`null`).
  * `DrawState` (`'DRAW'`): estado terminal por tablas (50 movimientos, material insuficiente o triple repetición), sin ganador (`null`).
  * `TimeoutState` (`'TIMEOUT'`): estado terminal por caída de reloj, retorna como ganador al rival de `timedOutColor`.

---

## 3. Evaluadores de Tablas y Orquestador Principal

* **`InsufficientMaterialEvaluator.ts`**:
  * `isInsufficientMaterial(board: IBoardQuery): boolean`: función pura desacoplada que opera sobre `IBoardQuery` (DIP/ISP) para detectar automáticamente tablas por material insuficiente (Rey vs. Rey, Rey + Alfil vs. Rey, o Rey + Caballo vs. Rey).
* **`PositionHasher.ts`**:
  * `computePositionSignature(board: IBoardQuery, currentTurn: Color): string`: función pura desacoplada que opera sobre `IBoardQuery` (DIP/ISP) para serializar las piezas, turno y objetivo *en passant* en una firma canónica única para contabilizar repeticiones de posición y detectar la **triple repetición**.
* **`ChessGame.ts`** (implementa `IGameEngine`):
  * Actúa como la **Raíz del Agregado (*Aggregate Root*)** de DDD y **Fachada (*Facade*)** del motor de ajedrez, garantizando la consistencia transaccional y los invariantes de toda la partida.
  * Coordina `Board`, `CommandHistory`, `CheckDetector`, el estado actual `IGameState` y el conjunto de `IGameObserver`.
  * Orquestación de `makeMove(from, to, promotionPiece)` mediante el patrón **Composed Method**:
    1. `validateMove`: aísla las cláusulas de guarda (*fail-fast*) devolviendo `{ piece }` o `{ errorReason }`.
    2. Ejecuta el `MoveCommand` definitivo mediante `this.history.executeCommand(command)`.
    3. `recordMove`: construye y apila el `MoveRecord` inmutable podando ramas futuras previas.
    4. `addSnapshotToTurnHistory`: almacena el snapshot del turno (`TurnRecord`) para `undo`/`redo`.
    5. `updateHalfMoveClock`: resetea o incrementa el contador de 50 jugadas según la regla del dominio.
    6. `switchTurn`: conmuta el turno activo mediante la tabla de búsqueda `OPPOSITE_COLOR`.
    7. `trackPositionRepetition`: calcula y registra la firma canónica para la triple repetición.
    8. `updateGameState`: evalúa las condiciones del nuevo turno y delega la transición en `this.currentState.evaluateNextState(...)`.
    9. `notifyObservers`: invalida la caché de snapshot y notifica a los suscriptores registrados.

