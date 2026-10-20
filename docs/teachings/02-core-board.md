# Sub-paquete `core/board/` — Tablero, Posiciones y Serialización

Modela el sistema de coordenadas espaciales, la grilla mutable del tablero, la fábrica de configuración inicial y la exportación a formato FEN.

---

## Archivos, Clases, Métodos y Conexiones

### 1. `Position.ts`
* **Clase**: `Position` (*Value Object* inmutable con `readonly row: number` y `readonly col: number` 0-indexed).
* **Métodos**:
  * `constructor(row: number, col: number)`: valida que ambas coordenadas sean números enteros.
  * `offset(deltaRow: number, deltaCol: number): Position`: retorna una nueva `Position` desplazada.
  * `equals(other: Position): boolean`: compara igualdad por valor (`row` y `col`).
  * `toAlgebraic(): string`: convierte `(row, col)` a notación algebraica (ej. `(0, 0)` $\rightarrow$ `'a1'`).
  * `static fromAlgebraic(algebraic: string): Position`: parsea una coordenada algebraica y devuelve su `Position`.
* **Cómo se conecta**: Utilizada en todo `core` para direccionar casillas, calcular rayos/saltos en `rules/` y registrar movimientos.

### 2. `Board.ts`
* **Clase**: `Board` (implementa `IBoardQuery`).
* **Estado interno**: dimensiones `rows` y `cols`, matriz `grid: (IPiece | null)[][]`, `enPassantTarget: Position | null` y conjunto `movedPieces: Set<IPiece>`.
* **Métodos de consulta (`IBoardQuery`)**:
  * `isWithinBounds(position)`, `getPieceAt(position)`, `isSquareEmpty(position)`, `findKingPosition(color)`, `getPiecesByColor(color)`, `getEnPassantTarget()`, `hasPieceMoved(piece)`.
* **Métodos de mutación**:
  * `placePiece(position: Position, piece: IPiece): IPiece | null`
  * `removePiece(position: Position): IPiece | null`
  * `movePiece(from: Position, to: Position): IPiece | null`
  * `setEnPassantTarget(target: Position | null): void`
  * `setPieceMoved(piece: IPiece, moved: boolean): void`
* **Cómo se conecta**: Es mutado únicamente por `boardSetup.ts` (`populateStandardBoard`) al crear el tablero inicial y por `MoveCommand` (`execute()` y `undo()`) durante el transcurso de la partida.

### 3. `boardSetup.ts`
* **Módulo utilitario y Constantes**: constante `BACK_RANK_PIECES` (`[Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook]`), tipo `PieceConstructor`.
* **Funciones**:
  * `createStandardBoard(): Board`: crea e inicializa un tablero estándar de $8 \times 8$ sin parámetros innecesarios.
  * `populateStandardBoard(board: Board, backRankPieces = BACK_RANK_PIECES): void`: valida dimensiones mínimas ($\ge 4$ filas y columnas coincidentes con la fila trasera) y coloca las piezas mayores y peones de ambos colores.
  * `createBoardFromSnapshot(snapshot: GameSnapshot): Board`: reconstruye un tablero `Board` aislado a partir de un snapshot inmutable utilizando la fábrica canónica `createPiece`, permitiendo simular jugadas sin alterar el estado real del motor.
* **Cómo se conecta**: Instancia las piezas iniciales desacoplando a `Board` y a `ChessGame` de las clases concretas de piezas. Es utilizado por defecto al construir `ChessGame()` y por estrategias de IA (`GreedyMaterialAiStrategy`) para simulación.

### 4. `FenSerializer.ts`
* **Clase**: `FenSerializer`.
* **Métodos**:
  * `static serializeSnapshot(snapshot: GameSnapshot): string`
  * Métodos privados auxiliares: `buildPiecePlacement`, `computeCastlingRights`, `hasKingMoved`, `hasSquareMoved`, `computeEnPassantTarget`, `computeHalfMoveClock`.
* **Cómo se conecta**: Recibe un `GameSnapshot` inmutable y devuelve la cadena FEN de 6 campos (ver [00-conceptos-dominio-ajedrez.md](./00-conceptos-dominio-ajedrez.md)).
