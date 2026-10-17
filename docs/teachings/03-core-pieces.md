# Sub-paquete `core/pieces/` — Piezas y Composición de Reglas

Modela las piezas del juego aplicando **Composición sobre Herencia**: cada pieza delega el cálculo de sus movimientos pseudo-legales en una lista de reglas `IMovementRule`.

---

## Archivos, Clases, Métodos y Conexiones

### 1. `types.ts`
* **Tipos y Constantes**:
  * `Color`: `'WHITE' | 'BLACK'`
  * `PIECE_TYPES`: objeto constante con las 6 piezas (`PAWN`, `ROOK`, `KNIGHT`, `BISHOP`, `QUEEN`, `KING`).
  * `PieceType`: `(typeof PIECE_TYPES)[keyof typeof PIECE_TYPES]`
  * `OPPOSITE_COLOR`: *Lookup Table* `Record<Color, Color>` para alternar turnos o consultar el color rival sin condicionales.

### 2. `IPiece.ts`
* **Interfaz**: `IPiece`
  * Propiedades: `readonly color: Color`, `readonly type: PieceType`.
  * Método: `getPseudoLegalMoves(from: Position, board: IBoardQuery): Position[]`.
* **Cómo se conecta**: Contrato 100% inmutable (*stateless*) que utiliza `Board` para almacenar piezas y `ChessGame` / `CheckDetector` para consultar movimientos sin depender de clases concretas.

### 3. `Piece.ts`
* **Clase abstracta**: `Piece` (implementa `IPiece`).
* **Estado interno**: `readonly color`, `readonly type`, `protected readonly rules: readonly IMovementRule[]`.
* **Métodos**:
  * `constructor(color: Color, type: PieceType, rules: readonly IMovementRule[] = [])`
  * `getPseudoLegalMoves(from: Position, board: IBoardQuery): Position[]`:
    * **¿Qué es `candidatePositions`?** Como una pieza puede componer varias reglas en `this.rules` (por ejemplo, `Queen` tiene una regla ortogonal y otra diagonal; `Pawn` tiene avance, captura diagonal y captura al paso), en cada vuelta del `for (const rule of this.rules)`, `candidatePositions` contiene las casillas habilitadas **por esa regla en particular**.
    * **¿Por qué se usa `uniquePositions` (`Map<string, Position>`)?**
      1. **Composición con solapamiento:** En las 6 piezas estándar las reglas son disjuntas, pero si se compone una pieza híbrida cuyas reglas se solapen (por ejemplo, una pieza que combine el salto de 1 casilla del Rey con el deslizamiento de la Torre, donde ambas reglas devolverían las 4 casillas ortogonales adyacentes), sin deduplicar esas casillas aparecerían repetidas en el resultado.
      2. **Igualdad por valor vs. referencia en JS/TS:** No se puede usar un `Set<Position>` directo porque en JavaScript `new Position(3, 4) !== new Position(3, 4)` (compara referencias de memoria). Al usar un `Map` cuya clave es el texto `"${candidate.row},${candidate.col}"`, se garantiza que cada coordenada aparezca una única vez.

### 4. Subclases concretas de `Piece` (Ejemplo clave de Composición sobre Herencia)
En lugar de crear una jerarquía profunda de herencia (ej. `SlidingPiece`, `SteppingPiece`) o escribir bucles de movimiento dentro de cada pieza, cada subclase concreta extiende superficialmente a `Piece` y **compone** en su constructor las instancias de `IMovementRule` que necesita:
* **`Pawn.ts` (`Pawn`)**: compone 3 reglas atómicas `[new PawnForwardRule(), new PawnCaptureRule(), new EnPassantCaptureRule()]`, separando su avance frontal de sus dos formas de captura sin usar condicionales internos.
* **`Rook.ts` (`Rook`)**: compone `[new SlidingMoveRule(ORTHOGONAL_DIRECTIONS)]`.
* **`Knight.ts` (`Knight`)**: compone `[new LeapMoveRule(KNIGHT_OFFSETS)]`.
* **`Bishop.ts` (`Bishop`)**: compone `[new SlidingMoveRule(DIAGONAL_DIRECTIONS)]`.
* **`Queen.ts` (`Queen`)**: compone `[new SlidingMoveRule(ORTHOGONAL_DIRECTIONS), new SlidingMoveRule(DIAGONAL_DIRECTIONS)]` (reutilizando exactamente las mismas reglas de `Rook` y `Bishop`).
* **`King.ts` (`King`)**: compone `[new LeapMoveRule(KING_OFFSETS), new CastlingMoveRule()]`.

### 5. `pieceFactory.ts` (Patrón Factory / GRASP Creator)
* **Funciones y Mapeos**:
  * `PIECE_CONSTRUCTORS`: *Lookup Table* `Record<PieceType, PieceConstructor>` que mapea cada tipo a su clase constructora concreta.
  * `createPiece(type: PieceType, color: Color): IPiece`: fábrica canónica centralizada para instanciar cualquier pieza del juego a partir de su tipo y color, eliminando la necesidad de que módulos externos como `MoveCommand` o `boardSetup` importen las clases concretas de cada pieza.

