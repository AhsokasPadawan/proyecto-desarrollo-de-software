# Discutiendo con la IA — Revisión del Proyecto

* **Mapa de referencia de archivos:** [mapa_de_archivos.md](./mapa_de_archivos.md)
* **Ejemplos de la teoría estudiada en clase:** [ejemplos_de_la_teoria_estudiada.md](./ejemplos_de_la_teoria_estudiada.md)
* **Explicaciones por módulo y conceptos:**
  * [00-conceptos-dominio-ajedrez.md](./00-conceptos-dominio-ajedrez.md)
  * [01-core-ports.md](./01-core-ports.md)
  * [02-core-board.md](./02-core-board.md)
  * [03-core-pieces.md](./03-core-pieces.md)
  * [04-core-rules.md](./04-core-rules.md)
  * [05-core-game.md](./05-core-game.md)
  * [06-core-strategy.md](./06-core-strategy.md)

---

## Registro de Discusiones

### Discusión 1: ¿Es sobreingeniería tener `StandardPieceType` y `Chancellor` antes del examen?

* **Archivo revisado:** `proyect/src/core/pieces/types.ts` (y `Chancellor.ts`)
* **Código original bajo análisis:**
  ```ts
  export const PIECE_TYPES = {
    PAWN: 'PAWN',
    ROOK: 'ROOK',
    KNIGHT: 'KNIGHT',
    BISHOP: 'BISHOP',
    QUEEN: 'QUEEN',
    KING: 'KING',
  } as const;

  export type StandardPieceType = (typeof PIECE_TYPES)[keyof typeof PIECE_TYPES];

  export type PieceType = StandardPieceType | (string & {});
  ```

#### Planteo del Desarrollador
Dado que aún no estamos en el examen con el profesor, y puede que el profesor decida pedirnos algo distinto, ¿no es sobreingeniería tener `StandardPieceType` y `Chancellor` pre-creados? Si más adelante en el examen queremos hacer esto, podemos seguir el camino al revés: crear el `StandardPieceType`, asignarle a `PieceType` la unión abierta que tenía, e implementar la pieza que pida en el momento.

#### Análisis Técnico (IA)
El planteo es **100% acertado** bajo el principio **YAGNI** (*You Aren't Gonna Need It*) y la seguridad de tipos de TypeScript:

1. **Tipo huérfano sin consumidores:** `StandardPieceType` no se importaba ni utilizaba en ningún otro archivo del repositorio (`src/` ni `tests/`).
2. **Pérdida de verificación exhaustiva en el compilador:** Al abrir `PieceType` con `| (string & {})`, para TypeScript cualquier `Record<PieceType, ...>` (como en `FenSerializer.ts` o `GreedyMaterialAiStrategy.ts`) pasa a comportarse como `Record<string, ...>`, perdiendo el control estático si falta mapear una pieza estándar o si se escribe mal un literal.
3. **Camino inverso trivial:** Mantener `PieceType` cerrado hoy hace el código más simple y seguro. Si en la defensa oral el profesor pide una pieza *Fairy*, se agrega en el momento en segundos.

#### Decisión y Cambios Aplicados
* Se eliminó `StandardPieceType` y el escape `| (string & {})` en `proyect/src/core/pieces/types.ts`, simplificando la definición a:
  ```ts
  export type PieceType = (typeof PIECE_TYPES)[keyof typeof PIECE_TYPES];
  ```
* Se eliminó `Chancellor.ts` y sus referencias anticipadas en tablas de búsqueda y tests.

---

### Discusión 2: ¿Por qué `hasMoved` y `setHasMoved` son opcionales (`?`) en `IPiece`? ¿Viola ISP?

* **Archivo revisado:** `proyect/src/core/pieces/IPiece.ts`
* **Código bajo análisis:**
  ```ts
  export interface IPiece {
    readonly color: Color;
    readonly type: PieceType;
    readonly hasMoved?: boolean;
    getPseudoLegalMoves(from: Position, board: IBoardQuery): Position[];
    setHasMoved?(value: boolean): void;
  }
  ```

#### Planteo del Desarrollador
¿Por qué `hasMoved` y `setHasMoved` son opcionales (`?`)? El hecho de que sean opcionales en la interfaz hace pensar que estamos rompiendo el **Principio de Segregación de Interfaces (ISP)**: tener una interfaz tan grande que ciertas clases tendrían que implementar más de lo que necesitan (y usar `?` como parche para no obligarlas a implementarlo).

#### Análisis Técnico (IA)
El diagnóstico da exactamente en el clavo respecto al **Principio de Segregación de Interfaces (ISP - la "I" de SOLID)**:

1. **El síntoma técnico (`?` como parche de ISP):**
   En TypeScript, poner métodos opcionales en una interfaz suele ser un *code smell* que esconde una violación de ISP: en vez de obligar a escribir métodos vacíos (*no-op stubs*), se los marca con `?`.
   Históricamente en el proyecto, `IPiece` nació en el Ticket 02 sin `hasMoved`. Cuando en el Ticket 18 se agregó el Enroque (*Castling*), para no romper el `StubPiece implements IPiece` de `tests/core/Board.test.ts`, se agregaron `hasMoved?` y `setHasMoved?` como opcionales.
2. **¿Quiénes realmente usan `hasMoved` en el dominio?**
   * Aunque la clase base `Piece` lo implementa para todas las piezas, **solo el Enroque (`CastlingMoveRule`) lee `piece.hasMoved`** (únicamente para `King` y `Rook`).
   * Ni `Knight`, ni `Bishop`, ni `Queen`, ni siquiera `Pawn` (que verifica su doble paso inicial mirando si `from.row` es la fila inicial, no `hasMoved`) utilizan `hasMoved`.
   * Además, por culpa del `?` en `IPiece`, `MoveCommand` se ve forzado a usar *optional chaining* (`this.movedPiece.setHasMoved?.(true)`) en 5 lugares distintos.
3. **Segundo ángulo de ISP (Lectura vs. Mutación):**
   `IBoardQuery.getPieceAt()` pretende dar una vista de solo lectura del tablero a las reglas, pero como devuelve `IPiece`, expone también el mutador `setHasMoved?(value)`.

#### Repregunta del Desarrollador
1. Si hacemos que `hasMoved` y `setHasMoved` sean obligatorios en `IPiece`, ¿no estaríamos obligando a las piezas que no necesitan `hasMoved` (como `Knight`, `Bishop`, `Queen`, `StubPiece`) a implementarlo de todas formas?
2. Y si creamos una interfaz aparte `IHasMoved` solo para `King` y `Rook`, ¿no hay otra opción para evitar usar un *type guard* en runtime?

#### Análisis de la Solución Arquitectónica (IA)
Ambas preguntas exponen la raíz del problema: **¿" haberse movido en la partida" es responsabilidad de la pieza (`IPiece`) o del estado del tablero (`Board`)?**

Si miramos cómo está resuelto *En Passant* en el mismo proyecto:
* Un `Pawn` **no** tiene un booleano `canBeCapturedEnPassant` ni `setEnPassant(boolean)` dentro de `IPiece`.
* Ese estado vive en `Board` (`setEnPassantTarget` en `Board`, y `getEnPassantTarget` como solo lectura en `IBoardQuery`).

Si aplicamos exactamente el mismo criterio para las piezas movidas:
* **`Board` mantiene un `private readonly movedPieces = new Set<IPiece>()`**:
  * **`IBoardQuery`** (interfaz de solo lectura que ya reciben todas las reglas en `getPseudoLegalMoves(from, piece, board)`) expone `hasPieceMoved(piece: IPiece): boolean`.
  * **`Board`** (usado por `MoveCommand`) expone `setPieceMoved(piece: IPiece, moved: boolean): void`.
* **¿Qué ganamos con esto?**
  1. **ISP puro en `IPiece`:** `IPiece` y `Piece` quedan 100% libres de `hasMoved` y `setHasMoved`. Ninguna pieza ni `StubPiece` implementa métodos que no usa, y todas las piezas pasan a ser **100% inmutables (*stateless*)**.
  2. **Cero *Type Guards*:** `CastlingMoveRule` ya recibe `board: IBoardQuery`, por lo que simplemente consulta `board.hasPieceMoved(piece)` y `board.hasPieceMoved(rook)` sin hacer ningún *type guard* ni *downcasting*.
  3. **Segregación Lectura/Escritura real:** Quien tiene un `IPiece` o un `IBoardQuery` ya no tiene forma de mutar el estado de movimiento; solo `MoveCommand` (que tiene acceso a `Board`) puede llamar a `board.setPieceMoved(...)`, exactamente igual que ya hace con `board.setEnPassantTarget(...)`.

#### Decisión y Cambios Aplicados
* Se eliminaron `hasMoved?` y `setHasMoved?` de `IPiece.ts` y de la clase base `Piece.ts`, dejando a todas las piezas 100% inmutables.
* Se agregó `hasPieceMoved(piece: IPiece): boolean` en `IBoardQuery.ts` (solo lectura) y `setPieceMoved(piece: IPiece, moved: boolean): void` respaldado por un `Set<IPiece>` en `Board.ts`.
* Se actualizaron `CastlingMoveRule.ts` y `MoveCommand.ts` para consultar y actualizar el estado de movimiento a través de `Board` / `IBoardQuery`, eliminando todos los encadenamientos opcionales `?.` y evitando *type guards*.

---

### Discusión 3: ¿Realmente necesitamos `PromotionFactory` o conviene eliminarlo aplicando YAGNI y GRASP Creator?

* **Archivo revisado:** `proyect/src/core/pieces/PromotionFactory.ts` (y `MoveCommand.ts`)
* **Código original bajo análisis:**
  ```ts
  export type PieceFactoryFn = (color: Color) => IPiece;

  export const PROMOTION_FACTORIES: Record<string, PieceFactoryFn> = {
    QUEEN: (color) => new Queen(color),
    ROOK: (color) => new Rook(color),
    BISHOP: (color) => new Bishop(color),
    KNIGHT: (color) => new Knight(color),
  };

  export class PromotionFactory {
    static createPromotedPiece(type: PieceType | undefined, color: Color): IPiece {
      const factory = (type && PROMOTION_FACTORIES[type]) || PROMOTION_FACTORIES.QUEEN;
      return factory(color);
    }
  }
  ```

#### Planteo del Desarrollador
1. ¿Realmente necesitamos este factory (`PromotionFactory.ts`), cuál sería la otra opción y cuál sería el costo en cada caso?
2. ¿Por qué teníamos `undefined` en `type: PieceType | undefined`?
3. Basándonos en dos criterios vistos en clase:
   * **Criterio 1 (YAGNI / Sobreingeniería):** No tiene sentido tener una clase Factory separada para una sola clase consumidora (`MoveCommand`). Aunque en un futuro si se agregaran más clases consumidoras sería más limpio extraerla (y vale dejar una nota de diseño al respecto), hoy en el código es sobreingeniería.
   * **Criterio 2 (GRASP — Principio Creator / Creador):** El lugar natural para instanciar una clase es aquella clase que posee la información necesaria para crearla, la registra y la utiliza estrechamente.

#### Análisis Técnico (IA)
Ambos criterios teóricos justifican con total precisión la eliminación de `PromotionFactory.ts`:

1. **Principio GRASP *Creator* (Creador):**
   Según Craig Larman, debemos asignar a la clase $B$ la responsabilidad de crear una instancia de $A$ si se cumple una o más de las siguientes condiciones:
   * $B$ **tiene los datos de inicialización** necesarios para crear $A$ (*Information Expert* respecto a la creación).
   * $B$ **registra / almacena** la instancia de $A$.
   * $B$ **utiliza estrechamente** a $A$.
   * $B$ **agrega o contiene** lógicamente a $A$.

   `MoveCommand` cumple **tres de las cuatro condiciones de GRASP Creator simultáneamente**:
   * Posee los datos de inicialización (`this.promotionType` y `this.movedPiece.color`).
   * Registra la instancia creada en `private promotedPiece: IPiece | null` para administrar su ciclo de vida (`execute()` y reversión en `undo()`).
   * La utiliza inmediatamente para colocarla en el tablero (`this.board.placePiece(this.to, this.promotedPiece)`).

2. **Principio YAGNI (*You Aren't Gonna Need It*):**
   En todo `src/` y `tests/`, `MoveCommand.ts` era el **único** archivo que importaba `PromotionFactory`. Mantener un archivo y una clase estática aparte para 3 líneas de código con un único consumidor real agregaba indirección innecesaria.

3. **Nota de diseño hacia el futuro (Evolución arquitectónica):**
   Si en el futuro el sistema incorporara nuevos módulos que también necesitaran instanciar piezas por su `PieceType` (por ejemplo, un importador/deserializador de posiciones FEN o PGN que reconstruya el tablero desde texto), recién en ese momento aparecería un segundo consumidor real y estaría justificado extraer una fábrica compartida (`PieceFactory`) para no duplicar el *Lookup Table*.

#### Decisión y Cambios Aplicados
* Se eliminó el archivo `proyect/src/core/pieces/PromotionFactory.ts`.
* Se trasladó la creación de la pieza coronada directamente a `MoveCommand.ts` mediante el *Lookup Table* tipado `PROMOTION_PIECE_CONSTRUCTORS: Partial<Record<PieceType, new (color: Color) => IPiece>>` y el método privado `createPromotedPiece(color: Color): IPiece`.

---

### Discusión 4: ¿Se puede reescribir el bucle `while` de `SlidingMoveRule` sin `break` y sin duplicar `legalMoves.push(currentPosition)`?

* **Archivo revisado:** `proyect/src/core/rules/SlidingMoveRule.ts`
* **Código original bajo análisis:**
  ```ts
  while (board.isWithinBounds(currentPosition)) {
    const pieceAtTarget = board.getPieceAt(currentPosition);

    if (pieceAtTarget) {
      if (pieceAtTarget.color !== piece.color) {
        legalMoves.push(currentPosition);
      }
      break;
    }

    legalMoves.push(currentPosition);
    currentPosition = currentPosition.offset(deltaRow, deltaCol);
  }
  ```

#### Planteo del Desarrollador
¿Podría hacerse ese bloque con un `.filter()` o de alguna otra manera que no involucre usar un `break`? Además, tanto adentro como afuera del `if` se hace `legalMoves.push(currentPosition)`, lo que muestra que tenerlo repetido no es necesario. ¿Hay forma de reescribir todo ese `while`?

#### Análisis Técnico (IA)
1. **¿Por qué `.filter()` no alcanza en un movimiento deslizante?**
   * `.filter()` evalúa elementos de una colección de manera **independiente** sin memoria del elemento anterior (ideal para saltos discretos como en `LeapMoveRule`).
   * En un deslizamiento por rayos (*ray-casting*), existe **dependencia secuencial**: si la casilla 2 está ocupada, las casillas 3, 4 y 5 detrás de ella quedan bloqueadas aunque estén vacías. Un `.filter()` sobre las casillas de la línea no se detendría tras la primera pieza y daría como válidas las casillas vacías detrás del obstáculo.
2. **Eliminación del `break` (Programación Estructurada) y unificación del `push` (DRY):**
   * **Unificación de la condición de inserción:** Una casilla del rayo se agrega a `legalMoves` si y solo si **no contiene una pieza aliada**, es decir: `pieceAtTarget?.color !== piece.color` (cubre tanto el caso de casilla vacía `null` como el de captura de pieza enemiga).
   * **Condición explícita en el encabezado del `while`:** El rayo continúa avanzando a la siguiente casilla únicamente si la casilla actual estaba vacía (`isRayUnblocked = pieceAtTarget === null`). Al incorporar `isRayUnblocked` en la condición `while (board.isWithinBounds(currentPosition) && isRayUnblocked)`, desaparece el `break` intermedio y se elimina el `if` anidado.

#### Decisión y Cambios Aplicados
* Se refactorizó `SlidingMoveRule.getPseudoLegalMoves` en `proyect/src/core/rules/SlidingMoveRule.ts` eliminando el `break` y unificando el `push`:
  ```ts
  for (const [deltaRow, deltaCol] of this.directions) {
    let currentPosition = from.offset(deltaRow, deltaCol);
    let isRayUnblocked = true;

    while (board.isWithinBounds(currentPosition) && isRayUnblocked) {
      const pieceAtTarget = board.getPieceAt(currentPosition);

      if (pieceAtTarget?.color !== piece.color) {
        legalMoves.push(currentPosition);
      }

      isRayUnblocked = pieceAtTarget === null;
      currentPosition = currentPosition.offset(deltaRow, deltaCol);
    }
  }
  ```
* En `proyect/src/core/rules/LeapMoveRule.ts` y `proyect/src/core/rules/PawnCaptureRule.ts` (donde cada salto/diagonal sí es independiente de los demás), se reemplazó el bucle `for` imperativo con `continue` por una tubería declarativa `.map().filter()`:
  ```ts
  getPseudoLegalMoves(from: Position, piece: IPiece, board: IBoardQuery): Position[] {
    return this.offsets
      .map(([deltaRow, deltaCol]) => from.offset(deltaRow, deltaCol))
      .filter(
        (targetPosition) =>
          board.isWithinBounds(targetPosition) &&
          board.getPieceAt(targetPosition)?.color !== piece.color
      );
  }
  ```

---

### Discusión 5: Aislar el paso simple y el doble paso en funciones separadas dentro de `PawnForwardRule`

* **Archivo revisado:** `proyect/src/core/rules/PawnForwardRule.ts`

#### Planteo del Desarrollador
Dividir el paso simple hacia adelante y el doble paso inicial en dos funciones distintas llamadas desde `getPseudoLegalMoves`, de manera que cada responsabilidad quede aislada en una función y sea más claro al leer el código qué se hace en cada paso.

#### Análisis Técnico (IA)
Aplicar **Extracción de Métodos (*Extract Method* / SRP a nivel de métodos)** y el principio de **Código Auto-documentado** permite que `getPseudoLegalMoves` exprese únicamente la **regla de negocio de alto nivel** (si el paso simple está bloqueado no hay avances posibles; si está libre, se evalúa adicionalmente el doble paso inicial), delegando el detalle de coordenadas y límites en dos métodos privados con nombres semánticos: `getSingleStepMove` y `getDoubleStepMove`. Además, se elimina la necesidad de mutar un arreglo temporal con `.push()`.

#### Decisión y Cambios Aplicados
* Se refactorizó `PawnForwardRule.ts` extrayendo `getSingleStepMove` y `getDoubleStepMove`:
  ```ts
  getPseudoLegalMoves(from: Position, piece: IPiece, board: IBoardQuery): Position[] {
    const forwardDelta = PAWN_FORWARD_DELTAS[piece.color];
    const singleStepMove = this.getSingleStepMove(from, forwardDelta, board);

    if (!singleStepMove) {
      return [];
    }

    const doubleStepMove = this.getDoubleStepMove(from, piece.color, forwardDelta, board);
    return doubleStepMove ? [singleStepMove, doubleStepMove] : [singleStepMove];
  }
  ```

---

### Discusión 6: ¿Tiene sentido que `CastlingMoveRule` evalúe jaques y ataques con `CheckDetector`, o esa responsabilidad pertenece a `ChessGame`?

* **Archivos revisados:** `proyect/src/core/rules/CastlingMoveRule.ts` y `proyect/src/core/game/ChessGame.ts`

#### Planteo del Desarrollador
Además de dividir `CastlingMoveRule` en funciones más pequeñas, usar una Lookup Table para la fila inicial y aplicar `.map().filter()`, ¿tiene sentido que `CastlingMoveRule` sea quien detecte si las casillas están bajo ataque para ver si el enroque es posible? Comparando con *en passant*, esa responsabilidad de validación global no está en el Peón.

#### Análisis Técnico (IA)
El planteo descubre una **inconsistencia arquitectónica clave** entre el concepto de movimiento *Pseudo-Legal* (`IMovementRule.getPseudoLegalMoves`) y el de movimiento *Estrictamente Legal* (`ChessGame`):

1. **Violación del límite *Pseudo-Legal* vs. *Legal*:**
   * En todo el sub-paquete `rules/`, las implementaciones de `IMovementRule` (`SlidingMoveRule`, `LeapMoveRule`, `PawnForwardRule`, `PawnCaptureRule`, `EnPassantCaptureRule`) son **100% *stateless*** y evalúan únicamente geometría y estado del `Board` (sin saber qué es un jaque ni qué es `CheckDetector`).
   * `CastlingMoveRule` era la **única** regla en `rules/` que inyectaba `CheckDetector` (`ISquareAttackDetector`).
2. **Complejidad accidental y duplicación provocadas por esa mezcla:**
   * Por tener `CheckDetector` adentro de `CastlingMoveRule`, habían tenido que agregar un atributo mutable `private isEvaluating: boolean = false` con un bloque `try / finally` para evitar recursión infinita cuando `CheckDetector` consultaba movimientos pseudo-legales.
   * Además, la verificación de si la casilla destino del enroque (`destinationSquare`) estaba atacada se ejecutaba **dos veces**: primero en `CastlingMoveRule` y luego otra vez en `ChessGame` al simular la jugada con `MoveCommand` y llamar a `checkDetector.isKingInCheck`.

#### Decisión y Cambios Aplicados
* **`CastlingMoveRule.ts` (100% *Pseudo-Legal* e inmutable):**
  * Se eliminaron `ISquareAttackDetector`, la dependencia con `CheckDetector` y el flag mutable `isEvaluating`.
  * La regla ahora verifica únicamente las condiciones geométricas y del tablero, desglosadas en métodos privados auto-documentados (`canKingAttemptCastling`, `getCastlingTargetForSide`, `hasUnmovedRookAtCorner`, `isPathClearBetween`).
* **`ChessGame.ts` (Único responsable de evaluar Jaque / Ataques con `CheckDetector`):**
  * Se unificó la validación de jaque (que antes estaba duplicada entre `getLegalMoves` y `makeMove`) en el método privado `wouldMoveExposeKingToCheck(piece, from, to, promotionPiece)`, acompañado de `isCastlingOriginOrTransitAttacked(from, to, kingColor)`.
* **`CheckDetector.ts` (Declarativo con `.some()` y ataque diagonal real de Peón):**
  * Se refactorizó `isSquareAttacked` reemplazando el bucle `for` con `continue` por `attackingPlacements.some(...)` y extrayendo `doesPieceAttackSquare`, `doesKingAttackSquare` y `doesPawnAttackSquare` (de modo que al consultar si una casilla vacía como `transitSquare` está atacada por un Peón, se evalúen sus diagonales de ataque y no su avance frontal).

---

### Discusión 7: Claridad semántica en `Board` — Renombrar `isEmpty(position)` a `isSquareEmpty(position)`

* **Archivos revisados:** `proyect/src/core/board/Board.ts` y `proyect/src/core/ports/IBoardQuery.ts`

#### Planteo del Desarrollador
El nombre `isEmpty(position)` genera ambigüedad semántica: al leer `board.isEmpty(...)` da la impresión de preguntar si el tablero entero está vacío. Debería tener un nombre explícitamente relacionado a la casilla. Además, se analizó el propósito y los consumidores de `getPiecesByColor`.

#### Análisis Técnico (IA)
1. **Lenguaje Ubicuo (*Ubiquitous Language* de DDD) y Código Auto-documentado:**
   * En el dominio del ajedrez, cada celda se denomina formalmente **Square** (*casilla* / *escaque*), tal como ya se utiliza en `isSquareAttacked(target)` y `transitSquare`.
   * Renombrar el método a `isSquareEmpty(position: Position): boolean` elimina cualquier ambigüedad tanto en la interfaz `IBoardQuery` como en las llamadas (`board.isSquareEmpty(target)`), haciendo el código completamente auto-explicativo sin requerir comentarios.
2. **Propósito de `getPiecesByColor(color: Color)`:**
   * Devuelve un arreglo de objetos inmutables `PiecePlacement` (`{ position, piece }`) con todas las piezas vivas de ese color y sus casillas actuales.
   * Evita iterar a ciegas sobre las 64 casillas del tablero en 5 subsistemas críticos: detección de amenazas en `CheckDetector`, búsqueda de movimientos legales en `ChessGame.hasAnyLegalMove`, evaluación de tablas en `InsufficientMaterialEvaluator`, firma de repetición en `PositionHasher`, y simulación de capturas en `GreedyMaterialAiStrategy`.

#### Decisión y Cambios Aplicados
* Se renombró `isEmpty(position: Position): boolean` a `isSquareEmpty(position: Position): boolean` en `IBoardQuery.ts` y `Board.ts`.
* Se actualizaron todos sus puntos de consumo en `PawnForwardRule.ts`, `CastlingMoveRule.ts`, `MoveCommand.ts` y los tests de `Board.test.ts` y `PieceAndSetup.test.ts`.

---

### Discusión 8: ¿Es sobreingeniería tener una clase `BoardSetupFactory`? Transformación a funciones utilitarias y simplificación de `createStandardBoard()`

* **Archivos revisados:** `proyect/src/core/board/BoardSetupFactory.ts` (reemplazado por `boardSetup.ts`) y `proyect/src/core/board/Board.ts`

#### Planteo del Desarrollador
1. ¿Es realmente necesario un factory acá? ¿No se podría argumentar que es sobreingeniería tener una clase Factory para algo que se usa en un solo lugar? Sería mejor que sea un módulo con funciones utilitarias exportadas, dejando una nota de diseño de que si quisiéramos soportar múltiples modos de juego o variantes, este sería el lugar ideal para formalizar el patrón.
2. Siguiendo esta lógica, dado que un tablero estándar de ajedrez es de $8 \times 8$ por definición, `createStandardBoard()` no debería recibir dimensiones por parámetro (eso agrega complejidad para un caso que no la necesita). En cambio, `Board` sí debe conservar `rows = 8, cols = 8` por constructor para cumplir con la consigna de extensibilidad de la cátedra (demostrando que el motor soporta tableros de variantes como $10 \times 10$ o $6 \times 6$ sin números mágicos hardcodeados).

#### Análisis Técnico (IA)
1. **Funciones de primer orden vs. Clases estáticas en TypeScript (YAGNI):**
   * En TypeScript moderno, una clase con puros métodos estáticos (`class BoardSetupFactory { static ... }`) es un modismo innecesario heredado de lenguajes orientados a objetos estrictos.
   * La responsabilidad de aislar a `Board` y a `ChessGame` de las clases concretas de piezas se satisface con la misma eficacia mediante un módulo de funciones puras (`boardSetup.ts`), eliminando la sobreingeniería de clases artificiales.
2. **Definición de `createStandardBoard()` sin parámetros:**
   * Un "tablero estándar" en ajedrez internacional tiene $8 \times 8$ casillas y las 8 piezas clásicas. Pedirle `rows` y `cols` a `createStandardBoard` era redundante. `createStandardBoard()` ahora devuelve directamente `new Board(8, 8)` poblado con las piezas estándar.
   * Para tableros de dimensiones alternativas o variantes personalizadas, se expone `populateStandardBoard(board, backRankPieces?)`, desacoplando la creación estándar del soporte de variantes.

#### Decisión y Cambios Aplicados
* Se eliminó `BoardSetupFactory.ts` y se creó `boardSetup.ts` exportando `createStandardBoard(): Board` (sin parámetros) y `populateStandardBoard(board, backRankPieces?)`.
* Se actualizó `ChessGame.ts` para inicializarse con `board: Board = createStandardBoard()`.
* Se actualizaron los tests en `PieceAndSetup.test.ts`.

---

### Discusión 9: Propiedades opcionales en `MoveRecord` — ¿Por qué son opcionales y cuándo conviene separar interfaces vs. mantener un DTO plano?

* **Archivo revisado:** `proyect/src/core/ports/GameSnapshot.ts`
* **Código bajo análisis:**
  ```ts
  export interface MoveRecord {
    readonly moveIndex: number;
    readonly turn: Color;
    readonly piece: PieceType;
    readonly from: string;
    readonly to: string;
    readonly capturedPiece?: PieceType;
    readonly isCastling?: boolean;
    readonly isPromotion?: boolean;
    readonly promotionPiece?: PieceType;
  }
  ```

#### Planteo del Desarrollador
¿Por qué estas 4 propiedades (`capturedPiece`, `isCastling`, `isPromotion`, `promotionPiece`) son opcionales? ¿Podrían separarse en dos interfaces distintas?

#### Análisis Técnico (IA)
1. **Modelado del Dominio del Ajedrez:**
   * En ajedrez, más del 80% de las jugadas son traslados simples de una casilla a otra sin consecuencias colaterales (por ejemplo, `e2` a `e4` o `Nf3`).
   * Marcar estas 4 propiedades como opcionales (`?`) modela con fidelidad que la captura, el enroque y la coronación solo ocurren en circunstancias específicas.
2. **Evaluación de Alternativas de Diseño:**
   * **Alternativa A (Herencia/Extensión):** `BaseMoveRecord` (con los 5 campos obligatorios) y `MoveRecord extends BaseMoveRecord`. Solo aportaría valor si existieran consumidores en el sistema que usen exclusivamente `BaseMoveRecord`. De lo contrario, roza **YAGNI**.
   * **Alternativa B (Composición anidada):** `MoveRecord` con un objeto `details?: SpecialMoveDetails`. Agrega un nivel de anidamiento innecesario para los adaptadores (`record.details?.capturedPiece`).
   * **Alternativa C (Unión discriminada):** `StandardMove | CastlingMove | PromotionMove`. En ajedrez estos eventos no son mutuamente excluyentes (por ejemplo, una coronación puede ser al mismo tiempo una captura: `e7xd8=Q`), lo que generaría combinaciones cruzadas complejas.
   * **Alternativa D (DTO Plano / Flat DTO — Decisión elegida):** Mantener un DTO plano e inmutable es la convención más limpia y estándar en Arquitectura Hexagonal: facilita la serialización, el consumo directo en tablas de UI y formateadores de transcripción, y simplifica la creación de fixtures en tests.

#### Decisión y Conclusión
* Se mantiene `MoveRecord` como un **DTO plano inmutable** bajo los principios **YAGNI** y **KISS**, preservando su simplicidad para los adaptadores web y de transcripción.

---

### Discusión 10: Integración de `IGameEngine` y `IGameObserver` con React mediante `useSyncExternalStore` — Eliminación total de `useEffect` para la lógica de juego

* **Archivos revisados:** `proyect/src/core/ports/IGameEngine.ts`, `proyect/src/core/ports/IGameObserver.ts` y `proyect/src/adapters/web/ChessApp.tsx`

#### Planteo del Desarrollador
Explicación detallada de cómo se integra el patrón Observer con React y cómo esta arquitectura permite prescindir completamente de `useEffect` para reaccionar a cambios de la partida.

#### Análisis Técnico (IA)
1. **El antipatrón de `useEffect` + `useState` para tiendas externas:**
   * Suscribirse con `useEffect` y hacer `setSnapshot` genera **doble renderizado** (un render con estado inicial/anterior y otro tras el commit del efecto).
   * En React 18+ (Concurrent Mode), expone a la interfaz a **tearing** (inconsistencias visuales en el árbol de componentes si el estado cambia durante el render).
   * Altera el flujo unidireccional y dificulta el mantenimiento del código.
2. **La solución con `useSyncExternalStore`:**
   * React 18 introdujo `useSyncExternalStore` para conectar fuentes de datos externas (*external stores*) de forma síncrona y atómica.
   * Requiere dos métodos que nuestro puerto `IGameEngine` provee de forma nativa:
     * `subscribe(observer)` con retorno de función `UnsubscribeFn` para el ciclo de vida del suscriptor.
     * `getSnapshot()` que devuelve un `GameSnapshot` inmutable por referencia.
3. **Flujo unidireccional reactivo en origen:**
   * La interacción se inicia en el controlador de eventos `onClick` (`engine.makeMove(from, to)`).
   * El Core ejecuta el comando, actualiza su estado y notifica al observador.
   * `useSyncExternalStore` lee el nuevo snapshot síncronamente antes de pintar la pantalla, logrando **cero dobles renders**, **cero desfasajes** y **cero `useEffect`**.

---

### Discusión 11: Code Smell *Data Clumps* en `MoveCommand` — Agrupamiento de estado cohesivo en registros y eliminación de flags booleanos redundantes

* **Archivo revisado:** `proyect/src/core/game/MoveCommand.ts`

#### Planteo del Desarrollador
Observó que varios grupos de variables de instancia privadas estaban íntimamente relacionados:
1. `isCastling`, `castlingRook`, `castlingRookFrom`, `castlingRookTo`, `wasRookMovedBefore`.
2. `isPromotion`, `promotedPiece`.
3. `capturedPiece`, `capturedPiecePosition`.
¿Sería útil agrupar cada conjunto en un objeto en lugar de mantener 11 variables sueltas?

#### Análisis Técnico (IA)
El planteo identifica con precisión el *code smell* de **Data Clumps** (*Grupos de Datos*):
1. **Eliminación de variables de bandera redundantes (`isCastling`, `isPromotion`):**
   * Esos booleanos solo existían para indicar si los demás campos asociados contenían datos válidos o basura.
   * Al agrupar los datos en un registro opcional (`castlingRecord: CastlingRecord | null = null`), la existencia misma del objeto (`!== null`) comunica el evento (*Truthiness by existence*).
   * Del mismo modo, `promotedPiece !== null` determina directamente si hubo coronación.
2. **Eliminación de *null checks* defensivos:**
   * En `undo()`, se evitó la comprobación múltiple `if (this.castlingRook && this.castlingRookFrom && this.castlingRookTo)`: si `this.castlingRecord` existe, TypeScript garantiza que sus 4 atributos existen por construcción.
3. **Cohesión y reducción de estado:**
   * Las 11 variables de instancia mutables de la clase se redujeron a solo 6, agrupando la información en sub-estructuras inmutables `CapturedPieceRecord` y `CastlingRecord`.

#### Decisión y Cambios Aplicados
* Se definieron `CapturedPieceRecord` y `CastlingRecord` en [`MoveCommand.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/game/MoveCommand.ts).
* Se eliminaron los campos primitivos dispersos y los booleanos `isCastling` e `isPromotion`.
* Se simplificó `undo()` y los métodos privados auxiliares (`executeStandardMove`, `executeEnPassantCapture`, `executeCastling`), preservando el 100% de los tests en verde.

---

### Discusión 12: Eliminación de la palabra `kind` en `IGameState` — Alineación simétrica con `type: GameStateType` y fidelidad al patrón State de GoF

* **Archivos revisados:** `proyect/src/core/game/IGameState.ts`, `proyect/src/core/ports/MoveResult.ts` y las clases de estado (`NormalPlayState.ts`, etc.)

#### Planteo del Desarrollador
La propiedad `kind` no es representativa en el dominio. Se analizaron alternativas como `status` (descartada por estar sobrecargada en ingeniería de software) y `phase`. Surgió la observación de diseño de que si se usaba `phase`, la interfaz debería llamarse `IGamePhase` y el método `evaluateNextPhase` para mantener coherencia total. Se optó por el **Camino B**: mantener la identidad canónica del **Patrón State de GoF** para la defensa oral de la materia, pero eliminando la palabra técnica `kind` y adoptando `type: GameStateType`.

#### Análisis Técnico (IA)
1. **Simetría interna en el Modelo de Dominio:**
   * En [`IPiece.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/pieces/IPiece.ts) el discriminador se modela como `readonly type: PieceType`.
   * En [`IGameState.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/game/IGameState.ts), pasar de `kind: GameStateKind` a `readonly type: GameStateType` establece un patrón uniforme y consistente de discriminadores en todo el Core.
2. **Fidelidad al Patrón State de GoF para el Examen:**
   * Al conservar `IGameState`, `evaluateNextState` y las clases nominales de estado (`NormalPlayState`, `CheckState`, etc.), la implementación se mapea de forma directa con la bibliografía de la cátedra, facilitando su explicación durante la defensa académica.

#### Decisión y Cambios Aplicados
* Se introdujo `GameStateType` en [`MoveResult.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/ports/MoveResult.ts).
* Se actualizó [`IGameState.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/game/IGameState.ts) para declarar `readonly type: GameStateType;`.
* Se actualizaron las 6 clases concretas de estado (`NormalPlayState`, `CheckState`, `CheckmateState`, `StalemateState`, `DrawState`, `TimeoutState`) y el consumo en [`ChessGame.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/game/ChessGame.ts).
* 100% de tests en verde sin regresiones.

---

### Discusión 13: Eliminación de *Magic Strings* en `activeStateTransition.ts` — Extracción a constantes tipadas (`HAS_MOVES`, `NO_MOVES`, `IN_CHECK`, `SAFE`)

* **Archivo revisado:** `proyect/src/core/game/activeStateTransition.ts`

#### Planteo del Desarrollador
Reemplazar los literales `'hasMoves'`, `'noMoves'`, `'inCheck'`, `'safe'` dispersos en las claves de la tabla de búsqueda y en los operadores ternarios por constantes explícitas (`const`), utilizándolas tanto en las definiciones de tipos (`typeof`) como en la matriz de transición y la lógica de decisión.

#### Análisis Técnico (IA)
1. **Buenas prácticas de Clean Code y Mantenibilidad:**
   * Evita la dispersión de *magic strings* en múltiples lugares del archivo.
   * Si en el futuro se requiriera renombrar una clave, la modificación se realiza en un único punto canónico.
2. **Tipado seguro mediante `typeof`:**
   * Al derivar `type MoveAvailability = typeof HAS_MOVES | typeof NO_MOVES` y `type CheckStatus = typeof IN_CHECK | typeof SAFE`, TypeScript infiere exactamente los tipos literales correspondientes sin duplicación de definiciones.

#### Decisión y Cambios Aplicados
* Se crearon las 4 constantes `HAS_MOVES`, `NO_MOVES`, `IN_CHECK` y `SAFE`.
* Se actualizaron `MoveAvailability`, `CheckStatus`, la matriz de fábricas `NEXT_STATE_FACTORIES` y los ternarios en `evaluateActiveStateTransition(context)`.
* Se verificó la suite completa con 100% de tests pasando en verde.

---

### Discusión 14: ¿Por qué `getWinner()` retorna `null` en `NormalPlayState`? — Polimorfismo puro en el Patrón State y principio LSP vs. condicionales en el cliente

* **Archivo revisado:** `proyect/src/core/game/NormalPlayState.ts`

#### Planteo del Desarrollador
El hecho de que `getWinner` retorne `null` en `NormalPlayState` parece indicar a primera vista que no necesita implementar ese método o que es redundante.

#### Análisis Técnico (IA)
1. **Polimorfismo sin `if` en el cliente (`ChessGame.ts`):**
   * En `ChessGame.getSnapshot()` se consulta: `winner: this.currentState.getWinner(this.currentTurn)`.
   * Si `getWinner` no formara parte del contrato de `NormalPlayState`, el motor estaría forzado a introducir condicionales o *type guards* (`if (state.type === 'CHECKMATE')`) para saber a quién preguntarle por el ganador, violando el propósito esencial del patrón State.
2. **`null` como respuesta semántica válida:**
   * En el modelo de dominio, el ganador es de tipo `Color | null`.
   * Para una partida en juego (`NormalPlayState`, `CheckState`) o en empate (`DrawState`, `StalemateState`), el valor representativo y verdadero del dominio es legítimamente `null` (no hay vencedor).
3. **Principio de Sustitución de Liskov (LSP):**
   * Al responder todos los estados polimórficamente al mensaje `getWinner()`, cualquier instancia de `IGameState` puede sustituirse sin comprobaciones especiales.

#### Decisión y Conclusión
* Se mantiene `getWinner(): Color | null { return null; }` en `NormalPlayState` y en el contrato de `IGameState`, preservando el polimorfismo puro y evitando jerarquías de herencia artificiales.

---

### Discusión 15: Inversión de Dependencias (DIP/ISP) y eliminación de clases estáticas en `InsufficientMaterialEvaluator.ts` — Transformación a función pura `isInsufficientMaterial(board: IBoardQuery)`

* **Archivo revisado:** `proyect/src/core/game/InsufficientMaterialEvaluator.ts`

#### Planteo del Desarrollador
Se acordó desacoplar el evaluador reemplazando el parámetro concreto `board: Board` por la abstracción de solo lectura `board: IBoardQuery`, y transformar la clase con métodos estáticos en una función pura utilitaria.

#### Análisis Técnico (IA)
1. **Principio de Inversión de Dependencias (DIP) y Segregación de Interfaces (ISP):**
   * El evaluador solo necesita consultar piezas vivas mediante `board.getPiecesByColor()`.
   * Al depender de `Board`, se acoplaba a una clase concreta con métodos de mutación (`movePiece`, `removePiece`, etc.). Al sustituirlo por `IBoardQuery`, el compilador garantiza que la evaluación de tablas jamás mutará el tablero.
2. **Eliminación de clases artificiales (YAGNI en TypeScript):**
   * Una clase sin atributos de instancia ni estado interno con métodos estáticos (`class InsufficientMaterialEvaluator { static isInsufficient ... }`) es un modismo innecesario.
   * Transformarla en una función pura `export function isInsufficientMaterial(board: IBoardQuery): boolean` simplifica el archivo y hace más idiomático el código en TypeScript.

#### Decisión y Cambios Aplicados
* Se reemplazó la clase por `export function isInsufficientMaterial(board: IBoardQuery): boolean`.
* Se actualizaron el import y la invocación en [`ChessGame.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/game/ChessGame.ts).
* 100% de tests en verde sin errores.

---

### Discusión 16: Inversión de Dependencias (DIP/ISP) y función pura en `PositionHasher.ts` — Transformación a `computePositionSignature(board: IBoardQuery, currentTurn: Color)`

* **Archivo revisado:** `proyect/src/core/game/PositionHasher.ts`

#### Planteo del Desarrollador
Siguiendo la misma premisa aplicada a `InsufficientMaterialEvaluator`, se acordó desacoplar el serializador de repetición reemplazando `board: Board` por `board: IBoardQuery` y transformando la clase estática en una función pura utilitaria `computePositionSignature`.

#### Análisis Técnico (IA)
1. **Segregación de Interfaces (ISP) e Inversión de Dependencias (DIP):**
   * El cálculo de la firma de repetición para la regla de las tres repeticiones solo consulta las dimensiones (`rows`, `cols`), las piezas vivas (`getPiecesByColor`) y la casilla al paso (`getEnPassantTarget`).
   * Al depender de `IBoardQuery`, el generador de firmas depende de una interfaz abstracta y libre de mutabilidad.
2. **Funciones de primer orden en TypeScript:**
   * La clase con métodos estáticos `PositionHasher` era otro artefacto innecesario. Exportar `computePositionSignature` directamente es más idiomático, limpio y fácil de testear en aislamiento.

#### Decisión y Cambios Aplicados
* Se reemplazó la clase `PositionHasher` por `export function computePositionSignature(board: IBoardQuery, currentTurn: Color): string`.
* Se actualizaron el import y las llamadas en el constructor y en `makeMove()` de [`ChessGame.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/game/ChessGame.ts).
* 100% de tests en verde sin errores.

---

### Discusión 17: Inicialización determinista del estado en `ChessGame` (`new NormalPlayState()`) aplicando YAGNI

* **Archivo revisado:** `proyect/src/core/game/ChessGame.ts`

#### Planteo del Desarrollador
En el constructor de `ChessGame` se ejecutaba una comprobación previa: `const inCheck = this.checkDetector.isKingInCheck(...); this.currentState = inCheck ? new CheckState() : new NormalPlayState();`. El desarrollador planteó con total precisión que las partidas guardadas o puzzles que arrancan en jaque están fuera del alcance del proyecto, y que en una partida real de ajedrez el juego siempre comienza en estado normal. Calcular si hay jaque en el constructor es evaluar un escenario hipotético innecesario (**YAGNI**).

#### Análisis Técnico (IA)
El planteo es **100% certero bajo YAGNI**:
1. Toda partida en el alcance del sistema arranca en estado activo estándar (`NormalPlayState`).
2. Al suprimir `isKingInCheck` del constructor e inicializar directamente con `this.currentState = new NormalPlayState()`, se simplifica el constructor y se elimina el acoplamiento directo de `ChessGame` con la clase `CheckState` (las transiciones hacia jaque quedan delegadas exclusivamente a `activeStateTransition.ts` al ejecutarse jugadas).
3. La suite completa de 278 pruebas siguió pasando al 100%, demostrando que no existía ningún caso real que requiriera iniciar en jaque.

#### Decisión y Cambios Aplicados
* Se simplificó la asignación en el constructor de [`ChessGame.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/game/ChessGame.ts) a `this.currentState = new NormalPlayState();`.
* Se eliminó el import no utilizado de `CheckState`.
* Verificación 100% verde sin advertencias de TypeScript.

---

### Discusión 18: Descomposición de `makeMove` mediante *Composed Method* y código auto-documentado

* **Archivo revisado:** [`ChessGame.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/game/ChessGame.ts)

#### Planteo del Desarrollador
El método `makeMove` era extenso y concentraba muchas operaciones consecutivas (validaciones, ejecución de comandos, registro en auditoría, captura de snapshots para deshacer, conteo de 50 movimientos, alternancia de turno, cálculo de firmas de posición, evaluación de estado y notificación a observadores). El desarrollador propuso subdividirlo en métodos privados pequeños y focalizados, de modo que los propios nombres semánticos de los métodos documenten el flujo sin recurrir a comentarios explicativos. Además, se sugirió específicamente el nombre `addSnapshotToTurnHistory` para explicitar la preservación del snapshot.

#### Análisis Técnico (IA)
Esta propuesta encaja a la perfección con el patrón **Composed Method** (*Kent Beck / Martin Fowler*):
1. **Mismo nivel de abstracción (*Single Level of Abstraction Principle - SLAP*)**: `makeMove` se transforma en un orquestador legible de principio a fin, donde cada línea representa una fase nítida del dominio.
2. **Código auto-documentado (*Clean Code*)**: Al dar nombres descriptivos y precisos como `validateMove`, `recordMove`, `addSnapshotToTurnHistory`, `updateHalfMoveClock`, `switchTurn`, `trackPositionRepetition` y `updateGameState`, se erradican los comentarios en el código cumpliendo estrictamente con las reglas de desarrollo.
3. **Manejo de errores por unión discriminada**: `validateMove` aísla las cláusulas de guarda devolviendo `{ piece: IPiece } | { errorReason: MoveRejectionReason }`, asegurando tipado estricto sin aserciones `!` inseguras.

#### Decisión y Cambios Aplicados
* Se refactorizó `makeMove` en [`ChessGame.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/game/ChessGame.ts) aplicando el patrón *Composed Method*.
* Se extrajeron los métodos privados: `validateMove`, `recordMove`, `addSnapshotToTurnHistory`, `updateHalfMoveClock`, `switchTurn`, `trackPositionRepetition` y `updateGameState`.
* Se verificó la suite completa con 278/278 tests en verde y 0 errores de tipado.

---

### Discusión 19: Unificación DRY y métodos simétricos en `undo` y `redo`

* **Archivo revisado:** [`ChessGame.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/game/ChessGame.ts)

#### Planteo del Desarrollador
Al analizar `redo()`, el desarrollador identificó que realizaba operaciones prácticamente idénticas a `undo()` pero en sentido inverso, consultando si había métodos o lógica compartida que pudieran unificarse.

#### Análisis Técnico (IA)
Efectivamente, `undo()`, `redo()` y `addSnapshotToTurnHistory()` compartían duplicación oculta:
1. **Creación del objeto snapshot (`TurnRecord`)**: Los tres métodos construían manualmente el objeto literal `{ state, halfMoveClock, positionSignature }`.
2. **Restauración del contexto**: Tanto `undo` como `redo` reasignaban individualmente las tres propiedades del snapshot (`currentState`, `halfMoveClock`, `currentPositionSignature`).
3. **Conmutación de turno**: Ambos hacían manualmente `this.currentTurn = OPPOSITE_COLOR[this.currentTurn]`, sin reutilizar el método `this.switchTurn()` ya existente.
4. **Invalidación de caché en `declareTimeout`**: `declareTimeout` ejecutaba `this.cachedSnapshot = null;` de forma redundante justo antes de llamar a `notifyObservers()`, que ya realiza dicha invalidación en su primera línea.

#### Decisión y Cambios Aplicados
* Se eliminó la línea redundante en `declareTimeout`.
* Se extrajeron los métodos privados `createCurrentTurnRecord(): TurnRecord` y `restoreTurnRecord(record: TurnRecord): void`.
* Se refactorizaron `addSnapshotToTurnHistory`, `undo` y `redo` para reutilizar estos métodos y `this.switchTurn()`.
* Suite completa: 278/278 pruebas en verde con 0 errores de compilación.

---

### Discusión 20: Simplificación de `hasAnyLegalMove()` y eliminación de parámetro acoplado

* **Archivo revisado:** [`ChessGame.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/game/ChessGame.ts)

#### Planteo y Análisis Técnico
Durante la revisión del método `hasAnyLegalMove(color: Color)`, se detectó que el método recibía un parámetro `color`, pero en su implementación delegaba en `this.getLegalMoves(position)`. A su vez, `getLegalMoves` contiene una guardia estricta: `if (piece.color !== this.currentTurn) return []`.
Por lo tanto:
1. Si se le pasaba un color distinto a `this.currentTurn`, el método retornaba erróneamente `false`.
2. En las reglas del ajedrez, el jaque mate o el ahogado sólo se evalúan para el jugador que tiene el turno activo (`this.currentTurn`).
3. El parámetro `color` inducía a error y era redundante con el estado interno de la partida.

#### Decisión y Cambios Aplicados
* Se simplificó la firma a `private hasAnyLegalMove(): boolean`, consumiendo directamente `this.board.getPiecesByColor(this.currentTurn)`.
* Se actualizó la invocación en `updateGameState()`.
* 278/278 tests en verde sin errores.

---

### Discusión 21: ¿`ChessGame` hace demasiado? Cohesión, Principio de Responsabilidad Única (SRP) y Justificación bajo Domain-Driven Design (DDD)

* **Archivo revisado:** [`ChessGame.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/game/ChessGame.ts)

#### Planteo del Desarrollador
Al concluir la revisión completa de los 15 métodos de `ChessGame`, el desarrollador planteó una inquietud arquitectónica fundamental: la clase tiene muchas líneas y métodos, y mantiene múltiples variables de estado (tablero, turno, tres tipos de historiales, mapa de repetición, reloj de 50 movimientos, observadores, estados polimórficos). ¿No estará haciendo demasiadas cosas, violando el Principio de Responsabilidad Única (*Single Responsibility Principle - SRP*) o incurriendo en el olor a código *Large Class / God Object*?

#### Análisis Técnico y Justificación bajo Domain-Driven Design (DDD)
Esta es una discusión conceptual clásica entre la fragmentación extrema y el rol de una entidad coordinadora:

1. **El rol de `ChessGame` como Raíz del Agregado (*Aggregate Root*)**:
   - En DDD, un **Agregado** es un clúster de objetos del dominio tratados como una unidad para cambios de datos. La **Raíz del Agregado (*Aggregate Root*)** es la única puerta de entrada autorizada para mutar dicho conjunto.
   - En una partida de ajedrez, el tablero, las piezas, el turno, los estados de jaque, los relojes y la historia **no pueden mutar de forma independiente sin romper los invariantes del juego**. Si permitiéramos mutar el tablero sin actualizar el turno o sin verificar el jaque, el sistema caería en un estado inconsistente.
   - Por tanto, `ChessGame` asume la responsabilidad ineludible de garantizar la consistencia transaccional de todo el agregado. Su única razón de cambio de alto nivel es: *“coordinar las reglas y el ciclo de vida de una partida de ajedrez”*.

2. **Delegación real vs. Falsa centralización (*Facade Pattern*)**:
   - `ChessGame` no realiza cálculos algorítmicos complejos por sí misma; actúa como una **Fachada Orquestadora**:
     - Delega la geometría de movimiento en las piezas individuales (`IPiece.getPseudoLegalMoves`).
     - Delega los rayos de ataque y jaques en un servicio especializado (`CheckDetector`).
     - Delega las mutaciones del tablero en comandos reversibles (`MoveCommand`).
     - Delega la gestión de pilas de comandos en el invocador (`CommandHistory`).
     - Delega la regla de material insuficiente en una función pura (`isInsufficientMaterial`).
     - Delega la firma canónica de triple repetición en una función pura (`computePositionSignature`).
     - Delega las fases y el fin de partida en el patrón de estados (`IGameState` y `evaluateActiveStateTransition`).
   - Los métodos internos que contiene (como `validateMove`, `recordMove`, `addSnapshotToTurnHistory`, `updateHalfMoveClock`, `switchTurn`, etc.) son pasos de coordinación a un mismo nivel de abstracción (*Composed Method*), no lógica de bajo nivel.

3. **Análisis de Trade-off (Pragmatismo vs. Sobreingeniería)**:
   - Podrían extraerse clases colaboradoras adicionales, como un `PositionRepetitionTracker` (para encapsular el `Map` de firmas) o un `TurnHistoryManager` (para unificar las pilas de snapshots).
   - Sin embargo, para una clase de ~370 líneas donde cada método es conciso y auto-documentado, agregar más clases e interfaces aumentaría la dispersión de archivos y la indirección cognitiva sin aportar valor real al dominio en este punto.

#### Decisión y Conclusión
* Se mantiene `ChessGame` con su diseño actual, justificando su tamaño y responsabilidades bajo el patrón **Aggregate Root** de DDD y **Facade** del subsistema de juego.
* La suite de 278 pruebas ratifica la robustez y mantenibilidad de la solución.

---

### Discusión 22: Centralización de `isTerminalState` en el Dominio (`ports/MoveResult.ts`) bajo Clean Architecture

* **Archivos revisados / modificados:**
  - `src/core/ports/MoveResult.ts`
  - `src/core/strategy/IAiStrategy.ts`
  - `src/adapters/web/stateDisplayLookup.ts`

#### Planteo del Desarrollador
Al analizar la comprobación de estados terminales en `IAiStrategy.ts` (`CHECKMATE`, `STALEMATE`, `DRAW`), se acordó incluir `'TIMEOUT'` que había sido omitido. El desarrollador planteó una pregunta clave: *“¿No se usa en varios lugares? ¿No podríamos tenerlos declarados fuera de las clases en algún lugar en específico?”*.

#### Análisis Técnico (IA)
Una búsqueda transversal en la base de código reveló un problema clásico de violación de capas de **Clean Architecture**:
1. **Regla de negocio atrapada en la capa de adaptadores:** La función `isTerminalState(stateKind)` existía previamente en `src/adapters/web/stateDisplayLookup.ts` y era consumida por múltiples componentes de la UI (`ChessApp`, `ControlPanelView`, `GameActionBar`).
2. **Imposibilidad de reutilización por la Regla de Dependencia:** Por los principios de Arquitectura Limpia, el núcleo (`core/`) jamás debe depender ni importar de los adaptadores (`adapters/`). Debido a esto, cuando se programó `IAiStrategy.ts` (en `src/core/strategy/`), no pudo reutilizar `isTerminalState`, duplicó la comprobación a mano y en el camino olvidó incluir el estado `'TIMEOUT'`.
3. **El lugar natural en el Dominio:** Determinar si un estado del juego es terminal es una regla pura del dominio del ajedrez. Su hogar legítimo es `src/core/ports/MoveResult.ts`, donde ya residen `GameStateType` y `GameStateKind`.

#### Decisión y Cambios Aplicados
* En `src/core/ports/MoveResult.ts` se definieron y exportaron:
  - `TERMINAL_GAME_STATES: ReadonlySet<GameStateType>`
  - `isTerminalState(stateKind: GameStateKind): boolean`
* En `src/adapters/web/stateDisplayLookup.ts` se reemplazó la función inline por la re-exportación de `isTerminalState` desde `core/ports/MoveResult`, preservando 100% de compatibilidad hacia atrás en la UI.
* En `src/core/strategy/IAiStrategy.ts` se reemplazó la condición manual incompleta por `if (isTerminalState(snapshot.stateKind)) return [];`.
* 278/278 tests pasando en verde con 0 errores de TypeScript.

---

### Discusión 23: Desacoplamiento de `GreedyMaterialAiStrategy`, Fábrica Canónica de Piezas, Reconstrucción de Tableros y Reglas de Legalidad

* **Archivos revisados / modificados:**
  - `src/core/pieces/pieceFactory.ts` (Nuevo)
  - `src/core/game/MoveCommand.ts`
  - `src/core/board/boardSetup.ts`
  - `src/core/rules/legalMoveEvaluator.ts` (Nuevo)
  - `src/core/strategy/GreedyMaterialAiStrategy.ts`

#### Planteo del Desarrollador
Al analizar `GreedyMaterialAiStrategy.ts`, el desarrollador formuló tres preguntas clave que evidenciaron problemas de acoplamiento y duplicación:
1. *¿No creamos un tablero en otra clase? ¿`createBoardFromSnapshot` no debería pertenecer a una clase distinta? Las estrategias son adaptadores, ¿no? Suena a que eso tendría que ser parte del core.*
2. *¿Necesitamos este factory `PIECE_SNAPSHOT_FACTORIES`? ¿No teníamos un factory parecido en algún lado?*
3. *¿No definimos algo parecido a `hasAnyLegalMove` en algún otro lado?*

#### Análisis Técnico (IA)
Las tres observaciones demostraron que la estrategia de IA estaba asumiendo responsabilidades ajenas a su algoritmo de decisión:
1. **Fábrica Canónica de Piezas inexistente:** Tanto `GreedyMaterialAiStrategy` como `MoveCommand` y `boardSetup` inventaban diccionarios locales ad-hoc para instanciar piezas a partir de su tipo (`PieceType`). El lugar natural para una fábrica centralizada bajo el principio **GRASP Creator / Factory Pattern** es `src/core/pieces/pieceFactory.ts`, exportando `createPiece(type: PieceType, color: Color): IPiece`.
2. **Reconstrucción de Tableros en el Dominio de Tableros:** Reconstruir un `Board` a partir de un `GameSnapshot` no es competencia de una estrategia de IA, sino una función de inicialización de tableros. Su hogar legítimo es `src/core/board/boardSetup.ts` junto a `createStandardBoard`.
3. **Duplicación de la Lógica de Legalidad:** `GreedyMaterialAiStrategy` necesitaba saber si una jugada dejaba al oponente en jaque mate. Como `ChessGame.hasAnyLegalMove` era un método privado de la instancia real de juego, la estrategia duplicó textualmente todo el ciclo de simulación con `MoveCommand` y `CheckDetector`. Extraer esta evaluación a `src/core/rules/legalMoveEvaluator.ts` como una función pura del dominio elimina la duplicación y otorga alta cohesión.

#### Decisión y Cambios Aplicados
* **Fábrica de Piezas:** Se creó [`src/core/pieces/pieceFactory.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/pieces/pieceFactory.ts) con `createPiece(type, color)`. Se refactorizó `MoveCommand.ts` para usarla en coronaciones, eliminando constructores duplicados.
* **Reconstrucción de Tableros:** Se movió [`createBoardFromSnapshot`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/board/boardSetup.ts#L64-L78) a `src/core/board/boardSetup.ts`.
* **Evaluador de Legalidad:** Se creó [`src/core/rules/legalMoveEvaluator.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/rules/legalMoveEvaluator.ts) con `hasAnyLegalMove(board, color, checkDetector)`.
* **Estrategia Limpia:** [`GreedyMaterialAiStrategy.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/strategy/GreedyMaterialAiStrategy.ts) se redujo de 128 líneas a ~65 líneas, focalizada exclusivamente en su función heurística voraz, con `MATERIAL_LOOKUP_TABLE` tipada estrictamente como `Partial<Record<PieceType, number>>`.
* Suite completa: 278/278 pruebas en verde con 0 errores de TypeScript.

---

### Discusión 24: Reemplazo de cascada `if` por Tabla de Umbrales Declarativa (`QUALITY_THRESHOLDS`) en `moveQualityEvaluator.ts`

* **Archivo revisado:** [`src/adapters/web/moveQualityEvaluator.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/moveQualityEvaluator.ts)

#### Planteo del Desarrollador
Al revisar `classifyMoveQuality(evalLoss, wasBestMove)`, el desarrollador consultó si en lugar de encadenar múltiples `if (normalizedLoss <= ...)` se podría indexar por números en `MOVE_QUALITY_LOOKUP` o reescribir la función de manera declarativa.

#### Análisis Técnico (IA)
1. **Valor continuo vs. clave discreta:**Dado que `evalLoss` es un número en punto flotante continuo (ej. `0.14`, `0.48`), un acceso directo por clave exacta `lookup[evalLoss]` no aplica para evaluar intervalos ($\le 0.2$, $\le 0.6$, etc.).
2. **Patrón Tabla de Umbrales (*Threshold Lookup Table*):** En lugar de cablear los cortes en una cascada imperativa de `if`, los intervalos pueden modelarse como una estructura de datos ordenada `QUALITY_THRESHOLDS` consultada declarativamente mediante `.find((threshold) => normalizedLoss <= threshold.maxLoss)`.
3. **Preservación de claves semánticas:** Mantener `MOVE_QUALITY_LOOKUP` con sus claves de dominio (`BEST`, `EXCELLENT`, `GOOD`, etc.) conserva la legibilidad semántica y la compatibilidad con los tests de componentes.

#### Decisión y Cambios Aplicados
* Se definió `QUALITY_THRESHOLDS` en [`moveQualityEvaluator.ts`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/moveQualityEvaluator.ts) y se simplificó `classifyMoveQuality` eliminando la cascada de condicionales `if`.

---

### Discusión 25: Extracción de componentes `StandardPieceGlyph`, `FallbackPieceBadge` y `PieceDisplay` (SRP en React)

* **Archivos revisados:** [`src/adapters/web/pieceDisplay.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/pieceDisplay.tsx) y [`src/adapters/web/components/ChessSquare.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/ChessSquare.tsx)

#### Planteo del Desarrollador
Al revisar `renderPieceContent(piece)` en `pieceDisplay.tsx`, el desarrollador observó que la función tenía un `if (symbol)` con dos bloques `return` que devolvían JSX completamente distinto, y consultó:
1. Si en lugar de dos `return` en una función helper convendría extraer dos componentes React separados.
2. Quién llamaba a `renderPieceContent` y si convenía pasarle la decisión al componente padre (`ChessSquare`).

#### Análisis Técnico (IA)
1. **Componentes declarativos vs. helper `render*`:** Extraer `StandardPieceGlyph` (glifo Unicode estándar) y `FallbackPieceBadge` (insignia con iniciales para piezas de *Fairy Chess*) elimina el doble `return` de JSX heterogéneo y hace explícitas las dos representaciones visuales como componentes puros.
2. **SRP y Encapsulamiento frente a `ChessSquare`:** `ChessSquare` ya gestiona las responsabilidades propias del escaque (color claro/oscuro, coordenadas algebraicas, anillos de selección, roles de resaltado y marcadores de captura/movimiento legal). Si `ChessSquare` tuviera que consultar `STANDARD_PIECE_SYMBOLS` para decidir qué variante de pieza renderizar, conocería detalles internos de representación de las piezas.
3. **Componente Fachada (`PieceDisplay`):** Mantener un componente `<PieceDisplay piece={piece} />` que encapsula la selección entre `<StandardPieceGlyph />` y `<FallbackPieceBadge />` permite que `ChessSquare` simplemente declare `{piece && <PieceDisplay piece={piece} />}`, respetando **SRP** y el principio de menor conocimiento.

#### Decisión y Cambios Aplicados
* Se reemplazó `renderPieceContent` en [`pieceDisplay.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/pieceDisplay.tsx) por los componentes `StandardPieceGlyph`, `FallbackPieceBadge` y `PieceDisplay`.
* Se actualizó [`ChessSquare.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/ChessSquare.tsx) para renderizar `<PieceDisplay piece={piece} />`.

---

### Discusión 26: Subcomponentes Privados y Patrón *Composed Component* en `ApiKeyModal.tsx`, `AppHeader.tsx` y `ChessSquare.tsx`

* **Archivos revisados:** [`src/adapters/web/components/ApiKeyModal.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/ApiKeyModal.tsx), [`src/adapters/web/components/AppHeader.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/AppHeader.tsx) y [`src/adapters/web/components/ChessSquare.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/ChessSquare.tsx)

#### Planteo del Desarrollador
Al revisar `ApiKeyModal.tsx`, el desarrollador notó que el bloque JSX del componente era extenso y propuso descomponerlo en subcomponentes más pequeños privados al archivo, de modo análogo a las funciones privadas extraídas en clases del dominio. El mismo criterio se aplicó a continuación en `AppHeader.tsx` y `ChessSquare.tsx`.

#### Análisis Técnico (IA)
1. **Patrón *Composed Component* (equivalente React de *Composed Method*):** En lugar de un bloque JSX monolítico (o de agregar comentarios organizativos que violarían la regla de código auto-documentado), extraer subcomponentes locales no exportados hace que el `return` del componente principal exprese declarativamente su estructura visual en el mismo nivel de abstracción.
2. **Encapsulamiento de módulo y DRY:** Al no exportarse, estos subcomponentes actúan como detalles de implementación privados del módulo sin contaminar el espacio de nombres público de `components/`. En `AppHeader.tsx` se reemplazó la repetición manual de las 4 insignias de arquitectura por el arreglo declarativo `ARCHITECTURE_BADGES`, y en `ChessSquare.tsx` se extrajo `HIGHLIGHT_ROLE_TITLES` fuera del componente para evitar recrear el diccionario de títulos en las 64 casillas en cada render.

#### Decisión y Cambios Aplicados
* En [`ApiKeyModal.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/ApiKeyModal.tsx) se extrajeron los subcomponentes privados `ModalHeader`, `ModalDescription`, `ApiKeyInputField`, `SavedSuccessBanner` y `ModalFooterActions`.
* En [`AppHeader.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/AppHeader.tsx) se extrajeron `ARCHITECTURE_BADGES`, `HeaderBrand`, `ArchitectureBadgeList` y `GeminiCoachStatusButton`.
* En [`ChessSquare.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/ChessSquare.tsx) se extrajeron `HIGHLIGHT_ROLE_TITLES`, `SquareCoordinateLabels`, `OptimalMoveStarBadge` y `LegalMoveTargetIndicator`.
* En [`GameActionBar.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/GameActionBar.tsx) se extrajeron `UndoRedoButtons` y `PostMatchButtons`, unificando las tres evaluaciones repetidas de `isTerminalState`.
* En [`MoveHighlightLegend.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/MoveHighlightLegend.tsx) se extrajo el subcomponente privado `LegendItem` para eliminar la triplicación del layout de fila de leyenda.
* En [`PlayerTimePicker.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/PlayerTimePicker.tsx) se extrajo `LABEL_COLOR_CLASSES` y el subcomponente privado `StepAdjustButton` para los botones `-` y `+`.
* En [`ReplayControlSection.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/ReplayControlSection.tsx) se extrajeron los subcomponentes privados `ReplayTransportControls`, `PlaybackSpeedSelector` y `ReplayFooterActions`.
* En [`ChessBoardView.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/ChessBoardView.tsx) se reemplazó `legalTargetsMap` por `Set<string>` y se extrajo la función pura `resolveSquareHighlightRole` fuera del bucle de renderizado.

---

### Discusión 27: Cláusulas de Guarda y *Type Narrowing* vs. Lookup Table forzada en `CoachFeedbackCard.tsx`

* **Archivo revisado:** [`src/adapters/web/components/CoachFeedbackCard.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/CoachFeedbackCard.tsx)

#### Planteo del Desarrollador
Al extraer las 5 vistas del entrenador en subcomponentes privados (`CoachLoadingCard`, `CoachLiveHintCard`, `CoachAnalyzedMoveCard`, `CoachSummaryCard`, `CoachInviteCard`), el desarrollador consultó si en vez de las 5 cláusulas `if` se podía utilizar un objeto de mapeo `objeto[propiedad] ?? null`. Al comparar ambas alternativas en código, observó que con una bolsa de props opcionales independientes el objeto de mapeo seguía requiriendo ternarios para cada entrada, por lo que las cláusulas de guarda de una línea resultaban más limpias.

#### Análisis Técnico (IA)
1. **Cuándo brilla una Lookup Table vs. cuándo brillan las Guard Clauses:** Una Lookup Table (`lookup[key]`) es ideal cuando existe **un único discriminador discreto** (`key: Variant`). En cambio, cuando un componente recibe múltiples props opcionales heterogéneas (`liveHint?: LiveHintData | null`, `analyzedMove?: AnalyzedMove`, etc.) con orden de precedencia, forzar un objeto obliga a repetir operadores ternarios (`prop ? <Comp prop={prop} /> : null`) y evalúa ansiosamente todas las ramas.
2. **Aprovechamiento del *Control Flow Type Narrowing* de TypeScript:** Con cláusulas de guarda tempranas (`if (liveHint) return <CoachLiveHintCard liveHint={liveHint} />`), el compilador de TypeScript refina automáticamente el tipo de `liveHint` de `LiveHintData | null | undefined` a `LiveHintData` sin aserciones no nulas (`!`) ni ternarios redundantes.

#### Decisión y Cambios Aplicados
* Se extrajeron los 5 subcomponentes privados en [`CoachFeedbackCard.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/CoachFeedbackCard.tsx) y se mantuvo el despacho por cláusulas de guarda tempranas de una línea.

---

### Discusión 28: Eliminación de Código Muerto (`MoveHistoryPanel.tsx`) y Consolidación en `MoveHistoryTable.tsx`

* **Archivos revisados:** `src/adapters/web/components/MoveHistoryPanel.tsx` (eliminado) y [`src/adapters/web/components/MoveHistoryTable.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/MoveHistoryTable.tsx)

#### Planteo del Desarrollador
Al detectar que `MoveHistoryPanel.tsx` duplicaba casi el 100% de la tabla de `MoveHistoryTable.tsx` y que la aplicación real en producción (`ControlPanelView.tsx`) utilizaba únicamente `MoveHistoryTable.tsx`, el desarrollador señaló que si un componente solo existe por su propio archivo de test y no es utilizado en ningún lugar de la aplicación, debe eliminarse.

#### Análisis Técnico (IA)
1. **YAGNI y Eliminación de Código Muerto (*Dead Code Elimination*):** Mantener un componente huérfano que solo es importado por su test genera costos de mantenimiento fantasma y confusión sobre cuál es la fuente de verdad de la interfaz.
2. **Consolidación de funcionalidad útil y migración de tests:** `MoveHistoryPanel` incluía la columna `Detalle` con insignias para jugadas especiales (`Enroque`, `Coronación`, `Captura`). Se incorporó dicha columna y se extrajeron los subcomponentes privados (`EmptyMoveHistoryMessage`, `MoveHistoryTableHeader`, `MoveSpecialDetailBadge`, `MoveHistoryRow`) en [`MoveHistoryTable.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/MoveHistoryTable.tsx), migrando la suite de pruebas a [`MoveHistoryTable.test.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/tests/adapters/MoveHistoryTable.test.tsx) y eliminando `MoveHistoryPanel.tsx`.

---

### Discusión 29: Unificación de Tablas de Mapeo Paralelas en Objetos Cohesivos en `PlayerClockBar.tsx`

* **Archivo revisado:** [`src/adapters/web/components/PlayerClockBar.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/PlayerClockBar.tsx)

#### Planteo del Desarrollador
Al revisar `PlayerClockBar.tsx`, el desarrollador observó que existían tablas de mapeo paralelas indexadas por la misma clave (`PLAYER_LABELS` y `BADGE_COLOR_CLASSES` indexadas por `Color`, y `CLOCK_BAR_STYLES` junto con `CLOCK_TIME_STYLES` indexadas por `ClockVisualState`) y propuso unificarlas en dos objetos cohesivos donde cada clave agrupe sus propiedades relacionadas (`tag`/`style` y `clockBarStyles`/`clockTimeStyles`).

#### Análisis Técnico (IA)
1. **Alta Cohesión de Datos vs. Diccionarios Paralelos (*Parallel Lookup Tables*):** Tener múltiples diccionarios separados con las mismas claves dispersa la configuración de una misma variante visual y obliga a realizar múltiples accesos por clave. Agrupar todas las propiedades de cada clave en un único registro estructurado (`Record<Color, PlayerBadgeStyle>` y `Record<ClockVisualState, ClockVisualStyle>`) garantiza por tipado que al agregar o modificar un estado se actualicen todas sus propiedades juntas.
2. **Eliminación de ternario residual:** Al incluir también `dotStyle` dentro de `PLAYER_BADGE_CONFIG`, se eliminó además el operador ternario inline `color === 'WHITE' ? 'bg-amber-400' : 'bg-zinc-400'`.

#### Decisión y Cambios Aplicados
* Se unificaron los diccionarios en `PLAYER_BADGE_CONFIG` y `CLOCK_VISUAL_STATE_STYLES` dentro de [`PlayerClockBar.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/PlayerClockBar.tsx), desestructurando directamente `const { tag, style, dotStyle } = PLAYER_BADGE_CONFIG[color]` y `const { clockBarStyles, clockTimeStyles } = CLOCK_VISUAL_STATE_STYLES[visualState]`.
* En [`ControlPanelView.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/ControlPanelView.tsx) se reutilizó `PLAYER_BADGE_CONFIG` (eliminando `TURN_LABELS` y `TURN_BADGES` duplicados), se eliminaron las 8 props sueltas redundantes de reloj en favor del objeto cohesivo `clockConfig`, y se extrajeron los subcomponentes privados `MatchStatusSection` y `GameModeSelectionSection`.

---

### Discusión 30: Modularización de `ChessApp.tsx` (`BOARD_LAYOUT_DIMENSIONS`, `useMatchReplay` y `BoardColumnArea`)

* **Archivo revisado:** [`src/adapters/web/ChessApp.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/ChessApp.tsx)

#### Planteo del Desarrollador
Al revisar el controlador principal de la vista (`ChessApp.tsx`), se identificaron tres oportunidades para mejorar su cohesión y eliminar duplicación:
1. Unificar la lógica repetida de `setInterval` entre `handleTogglePlay` y `handleSpeedChange`.
2. Reemplazar los dos operadores ternarios doblemente anidados de dimensiones (`boardMaxWidth` y `boardColumnHeight`) por una tabla de búsqueda cohesiva `BOARD_LAYOUT_DIMENSIONS`.
3. Extraer un hook privado `useMatchReplay(engine)` para encapsular todo el estado y navegación del reproductor de jugadas, y un subcomponente privado `BoardColumnArea` para el área central del tablero.

#### Análisis Técnico (IA)
1. **Separación de Preocupaciones en Custom Hooks:** Extraer `useMatchReplay(engine)` aísla las 4 variables de estado/referencia del reproductor y sus 10 funciones de transporte (`startPlaybackInterval`, `stopPlayback`, `handleTogglePlay`, `handleSpeedChange`, `handleGoToStart`, `handleStepBackward`, `handleStepForward`, `handleGoToEnd`, `enterReplayFromStart`, `handleExitReplay`, `handleJumpToMove`), eliminando además la duplicación del temporizador `setInterval`.
2. **Lookup Table para Dimensiones Responsivas (`BOARD_LAYOUT_DIMENSIONS`):** Agrupar `{ boardMaxWidth, extraHeightPx }` por modo de layout (`REPLAY_WITH_CLOCK`, `REPLAY_NO_CLOCK`, `LIVE_WITH_CLOCK`, `LIVE_NO_CLOCK`) elimina los ternarios anidados paralelos y centraliza las constantes de diseño.

#### Decisión y Cambios Aplicados
* Se aplicaron las tres mejoras en [`ChessApp.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/ChessApp.tsx) manteniendo cero llamadas a `useEffect`.

---

### Discusión 31: Componentes Contenedores con `{children}` (`ModalDialog` y `CoachCardShell`) y Cohesión de Constantes Compartidas en `pieceDisplay.tsx`

* **Archivos revisados:** [`src/adapters/web/components/ModalDialog.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/ModalDialog.tsx), [`src/adapters/web/pieceDisplay.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/pieceDisplay.tsx), [`src/adapters/web/components/ApiKeyModal.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/ApiKeyModal.tsx), [`src/adapters/web/PromotionModal.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/PromotionModal.tsx) y [`src/adapters/web/components/CoachFeedbackCard.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/CoachFeedbackCard.tsx)

#### Planteo del Desarrollador
Antes de dar por cerrada la revisión de los componentes React, el desarrollador planteó dos preguntas transversales de diseño:
1. ¿Existen estilos compartidos entre componentes que puedan extraerse a un componente contenedor de presentación que reciba `{children}`?
2. ¿Existen constantes compartidas que convenga extraer a un archivo común, y cuándo tiene sentido hacerlo?

#### Análisis Técnico (IA)
1. **Componentes Contenedores de Estilo (`{children}`):**
   * `ApiKeyModal.tsx` y `PromotionModal.tsx` duplicaban la estructura de superposición modal (`fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4`) y la caja de diálogo (`rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl`). Extraer [`ModalDialog.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/ModalDialog.tsx) unifica el envoltorio, centraliza la guarda `if (!isOpen) return null` y garantiza los atributos de accesibilidad (`role="dialog"`, `aria-modal="true"`) en todos los modales.
   * En [`CoachFeedbackCard.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/CoachFeedbackCard.tsx), las 5 sub-tarjetas compartían el esqueleto `w-full rounded-xl border flex ...`, diferenciándose únicamente por su variante cromática. Se extrajo el contenedor privado `CoachCardShell` gobernado por la tabla `COACH_CARD_VARIANT_STYLES`.
2. **Cohesión Funcional vs. Cohesión Coincidental en Constantes:**
   * Crear un único archivo global `constants.ts` con constantes locales de un solo componente (`SPEED_OPTIONS`, `PRESET_OPTIONS`, `ARCHITECTURE_BADGES`) sería un anti-patrón de *Cohesión Coincidental*.
   * En cambio, la configuración visual de jugador (`PLAYER_DISPLAY_CONFIG: Record<Color, PlayerDisplayConfig>`) y los nombres de piezas en español (`PIECE_NAMES_LOOKUP: Record<PieceType, string>`) sí son transversales a múltiples vistas y antes provocaban importaciones cruzadas antinaturales (`ControlPanelView` importando de `PlayerClockBar`, y `MoveHistoryTable` importando de `transcriptionFormatter`).

#### Decisión y Cambios Aplicados
* Se creó [`ModalDialog.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/ModalDialog.tsx) y se adoptó en [`ApiKeyModal.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/ApiKeyModal.tsx) y [`PromotionModal.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/PromotionModal.tsx).
* Se extrajo `CoachCardShell` en [`CoachFeedbackCard.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/components/CoachFeedbackCard.tsx).
* Se centralizaron `PLAYER_DISPLAY_CONFIG` y `PIECE_NAMES_LOOKUP` en [`pieceDisplay.tsx`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/adapters/web/pieceDisplay.tsx), consumiéndolos de forma limpia desde `PlayerClockBar`, `ControlPanelView`, `PlayerTimePicker`, `MoveHistoryTable`, `CoachFeedbackCard` y `transcriptionFormatter`.

