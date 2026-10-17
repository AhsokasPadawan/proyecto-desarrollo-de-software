# Sub-paquete `core/strategy/` — Estrategias de Inteligencia Artificial

Implementa el patrón **Strategy** para permitir intercambiar algoritmos de selección de jugadas del oponente automatizado operando exclusivamente sobre el puerto público `IGameEngine`.

---

## Archivos, Clases, Métodos y Conexiones

### 1. `IAiStrategy.ts`
* **Interfaces y Funciones**:
  * `AiMove`: `{ readonly from: Position; readonly to: Position }`
  * `IAiStrategy`: `{ chooseMove(engine: IGameEngine): AiMove | null }`
  * `collectCandidateMoves(engine: IGameEngine): AiMove[]`: función auxiliar compartida que inspecciona el `GameSnapshot` actual; si la partida no está en estado terminal, recorre todas las piezas del color en turno y recolecta sus movimientos estrictamente legales invocando `engine.getLegalMoves(from)`.

### 2. `RandomAiStrategy.ts`
* **Clase**: `RandomAiStrategy` (implementa `IAiStrategy`).
* **Métodos**:
  * `constructor(rng: RandomGenerator = Math.random)`: permite inyectar un generador determinista en los tests unitarios.
  * `chooseMove(engine: IGameEngine): AiMove | null`: obtiene todas las jugadas posibles con `collectCandidateMoves(engine)` y elige una al azar.

### 3. `GreedyMaterialAiStrategy.ts`
* **Clase y Constantes**: `GreedyMaterialAiStrategy` (implementa `IAiStrategy`), `MATERIAL_LOOKUP_TABLE` (`Partial<Record<PieceType, number>>`).
* **Métodos y Colaboradores**:
  * `chooseMove(engine: IGameEngine): AiMove | null`:
    1. Obtiene las jugadas candidatas con `collectCandidateMoves(engine)`.
    2. Para cada jugada candidata, reconstruye un `Board` aislado a partir del `GameSnapshot` mediante la función de dominio `createBoardFromSnapshot` (ubicada en `core/board/boardSetup.ts`) para no disparar notificaciones de observadores ni ensuciar el historial `redo` del motor real.
    3. Ejecuta un `MoveCommand` sobre ese tablero de simulación y calcula un puntaje heurístico sumando: valor de la pieza capturada, ganancia de material por coronación, bono por dar jaque (`+50`) y bono máximo por dar jaque mate (`+100000`).
    4. Para la evaluación de jaque mate, delega la verificación en la función pura del dominio `hasAnyLegalMove(simulationBoard, opponentColor, checkDetector)` (ubicada en `core/rules/legalMoveEvaluator.ts`).
    5. Retorna la jugada con mayor puntaje.
