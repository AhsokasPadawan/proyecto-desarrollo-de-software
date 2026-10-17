# Ejemplos de la Teoría Estudiada en el Proyecto

Este documento vincula cada concepto teórico, principio de diseño y patrón visto en la materia con **ejemplos reales y concretos** de nuestro código fuente, a medida que recorremos el proyecto archivo por archivo.

---

## 1. Principios Estructurales y Arquitectónicos

### 1.1 Composición sobre Herencia (*Composition over Inheritance*)
* **Concepto teórico:** Favorecer la construcción de objetos ensamblando comportamientos modulares (*"tiene-un"* / `has-a`) en lugar de crear árboles profundos y rígidos de herencia (*"es-un"* / `is-a`).
* **Ejemplo en nuestro código (`Piece.ts` + `Pawn.ts`, `Queen.ts`, `King.ts`, etc.):**
  * En lugar de que `Pawn`, `Queen` o `King` hereden de subclases intermedias (`SlidingPiece`, `DiagonalPiece`, `SteppingPiece`) o escriban sus propios bucles geométricos, la clase base [`Piece.ts`](../../proyect/src/core/pieces/Piece.ts) mantiene una colección `protected readonly rules: readonly IMovementRule[]` (*"tiene reglas de movimiento"*).
  * **Caso 1 — `Pawn.ts` (Composición de comportamientos distintos):** Como el peón avanza distinto de como captura y además tiene captura al paso, ensambla tres objetos de regla independientes en su constructor:
    ```ts
    export class Pawn extends Piece {
      constructor(
        color: Color,
        rules: readonly IMovementRule[] = [
          new PawnForwardRule(),
          new PawnCaptureRule(),
          new EnPassantCaptureRule(),
        ]
      ) {
        super(color, 'PAWN', rules);
      }
    }
    ```
  * **Caso 2 — `Queen.ts` (Reutilización total combinando las reglas de `Rook` y `Bishop`):** En una jerarquía de herencia clásica sería imposible que `Queen` herede simultáneamente de `Rook` y de `Bishop` (problema del diamante / herencia simple). Con composición, [`Queen.ts`](../../proyect/src/core/pieces/Queen.ts) simplemente combina la regla ortogonal de la Torre y la regla diagonal del Alfil sin escribir una sola línea de lógica nueva:
    ```ts
    export class Queen extends Piece {
      constructor(
        color: Color,
        rules: readonly IMovementRule[] = [
          new SlidingMoveRule(ORTHOGONAL_DIRECTIONS),
          new SlidingMoveRule(DIAGONAL_DIRECTIONS),
        ]
      ) {
        super(color, 'QUEEN', rules);
      }
    }
    ```

### 1.2 Principio YAGNI (*You Aren't Gonna Need It* — Evitar Sobreingeniería)
* **Concepto teórico:** No agregar abstracciones, tipos o clases para escenarios hipotéticos futuros que aún no son requeridos, ya que aumentan la complejidad, la indirección y pueden degradar las garantías estáticas del lenguaje.
* **Ejemplos en nuestro código:**
  * **Caso 1 — `types.ts` (Ver [Discusión 1](./discutiendo_con_la_ia.md#discusión-1-es-sobreingeniería-tener-standardpiecetype-y-chancellor-antes-del-examen)):** Se eliminó el tipo intermedio `StandardPieceType` y la unión abierta `| (string & {})` en [`types.ts`](../../proyect/src/core/pieces/types.ts), dejando `PieceType` cerrado sobre `PIECE_TYPES`. Esto recuperó el control de exhaustividad del compilador TypeScript en todas las tablas `Record<PieceType, ...>`.
  * **Caso 2 — Eliminación de `PromotionFactory.ts` (Ver [Discusión 3](./discutiendo_con_la_ia.md#discusión-3-realmente-necesitamos-promotionfactory-o-conviene-eliminarlo-aplicando-yagni-y-grasp-creator)):** Existía una clase `PromotionFactory` en un archivo separado cuyo único consumidor en todo el sistema era `MoveCommand.ts`. Siguiendo YAGNI y el principio **GRASP Creator**, se eliminó la fábrica dedicada y se integró el *Lookup Table* directamente en `MoveCommand.ts` (dejando documentado en las notas de diseño que solo tendría sentido extraer una fábrica compartida si en el futuro apareciera un segundo consumidor real, como un importador FEN/PGN).
  * **Caso 3 — `boardSetup.ts` (Ver [Discusión 8](./discutiendo_con_la_ia.md#discusión-8-es-sobreingeniería-tener-una-clase-boardsetupfactory-transformación-a-funciones-utilitarias-y-simplificación-de-createstandardboard)):** Se eliminó la clase con métodos estáticos `BoardSetupFactory` reemplazándola por funciones utilitarias limpias en `boardSetup.ts`. Además, se simplificó `createStandardBoard()` para que no reciba dimensiones por parámetro, dado que un tablero estándar es de $8 \times 8$ por definición.

### 1.3 Tablas de Búsqueda (*Lookup Tables*) en lugar de `switch`
* **Concepto teórico:** Reemplazar estructuras condicionales `switch`/`if-else` por diccionarios clave-valor tipados (*Polimorfismo de Datos*), mejorando la legibilidad y extensibilidad.
* **Ejemplos en nuestro código:**
  * [`types.ts`](../../proyect/src/core/pieces/types.ts): `OPPOSITE_COLOR: Record<Color, Color> = { WHITE: 'BLACK', BLACK: 'WHITE' }` para obtener el color contrario en $O(1)$ sin condicionales.
  * [`MoveCommand.ts`](../../proyect/src/core/game/MoveCommand.ts): `PROMOTION_PIECE_CONSTRUCTORS: Partial<Record<PieceType, new (color: Color) => IPiece>>` mapea cada tipo de pieza elegible para coronación (`QUEEN`, `ROOK`, `BISHOP`, `KNIGHT`) directamente a su constructor, evitando un bloque `switch (this.promotionType)`.
  * [`activeStateTransition.ts`](../../proyect/src/core/game/activeStateTransition.ts): `TERMINAL_DRAW_RULES` y `ACTIVE_STATE_FACTORIES` reemplazan cadenas condicionales para resolver transiciones de estado.
  * [`FenSerializer.ts`](../../proyect/src/core/game/FenSerializer.ts): `FEN_PIECE_SYMBOLS: Record<PieceType, Record<Color, string>>` mapea directamente cada pieza y color a su carácter FEN sin condicionales.
  * [`GreedyMaterialAiStrategy.ts`](../../proyect/src/core/strategy/GreedyMaterialAiStrategy.ts): `PIECE_MATERIAL_VALUES: Record<PieceType, number>` evalúa el valor material en $O(1)$.
  * [`PlayerClockBar.tsx`](../../proyect/src/adapters/web/components/PlayerClockBar.tsx) y [`ChessApp.tsx`](../../proyect/src/adapters/web/ChessApp.tsx): `PLAYER_BADGE_CONFIG`, `CLOCK_VISUAL_STATE_STYLES` y `BOARD_LAYOUT_DIMENSIONS` agrupan estilos y dimensiones en objetos cohesivos (*Ver [Discusiones 29 y 30](./discutiendo_con_la_ia.md#discusión-29-unificación-de-lookup-tables-paralelas-en-objetos-cohesivos-y-reutilización-entre-playerclockbar-y-controlpanelview)*).

### 1.4 Arquitectura Hexagonal (*Ports & Adapters*)
* **Concepto teórico:** Aislar la lógica de negocio central (el núcleo o *Hexágono*) de los mecanismos de entrega (UI, bases de datos, frameworks, tests) mediante puertos (interfaces abstractas) y adaptadores (implementaciones concretas). La regla de dependencia exige que las dependencias apunten siempre hacia adentro.
* **Ejemplos en nuestro código (`core/ports/`):**
  * **Puerto Primario / *Driving Port* ([`IGameEngine.ts`](../../proyect/src/core/ports/IGameEngine.ts)):** Contrato de entrada implementado por [`ChessGame.ts`](../../proyect/src/core/game/ChessGame.ts). La aplicación web en React ([`ChessApp.tsx`](../../proyect/src/adapters/web/ChessApp.tsx)), los motores de IA ([`IAiStrategy.ts`](../../proyect/src/core/strategy/IAiStrategy.ts)) y los tests unitarios interactúan con el motor exclusivamente a través de este puerto, sin acoplarse a detalles de infraestructura.
  * **Puerto Secundario / *Driven Port* ([`IGameObserver.ts`](../../proyect/src/core/ports/IGameObserver.ts)):** Contrato de notificación hacia el exterior. El Core notifica cambios de estado emitiendo [`GameSnapshot.ts`](../../proyect/src/core/ports/GameSnapshot.ts) sin conocer a React ni al DOM.
  * **Puerto Interno de Dominio ([`IBoardQuery.ts`](../../proyect/src/core/ports/IBoardQuery.ts)):** Segrega el acceso de consulta al tablero para reglas y piezas, protegiendo al tablero de mutaciones externas al patrón Command.

### 1.5 Objetos de Valor (*Value Objects* — DDD)
* **Concepto teórico:** Un Objeto de Valor es un objeto inmutable cuya identidad no está dada por un ID ni por su dirección de memoria, sino exclusivamente por el valor de sus atributos, ofreciendo igualdad estructural (`equals`) y operaciones libres de efectos secundarios (*side-effect free*) que devuelven nuevas instancias.
* **Ejemplo en nuestro código ([`Position.ts`](../../proyect/src/core/board/Position.ts)):**
  * Sus propiedades `readonly row: number` y `readonly col: number` son inmutables y se validan en el constructor (invariante de números enteros).
  * `offset(deltaRow, deltaCol)` no muta la coordenada actual, sino que devuelve un `new Position(this.row + deltaRow, this.col + deltaCol)`.
  * `equals(other: Position)` compara igualdad por valor (`this.row === other.row && this.col === other.col`).

### 1.6 Patrón Result / Unión Discriminada en lugar de Excepciones para Flujo de Control
* **Concepto teórico:** El manejo de errores esperados del dominio (como un intento de movimiento ilegal por parte del usuario) no debe recurrir a excepciones (`throw Error`), ya que las excepciones rompen el flujo tipado, son costosas y desvían el control. En su lugar, se utiliza un tipo suma / unión discriminada con una etiqueta común (`success: true | false`) que obliga a la comprobación exhaustiva estática.
* **Ejemplo en nuestro código ([`MoveResult.ts`](../../proyect/src/core/ports/MoveResult.ts)):**
  * `makeMove()` devuelve `MoveResult`, dividida en rama exitosa `{ success: true, capturedPiece, nextState }` y rama rechazada `{ success: false, reason: MoveRejectionReason }`.
  * La UI puede mapear el motivo de rechazo directamente a mensajes en español mediante un *Lookup Table* (`REJECTION_MESSAGES[result.reason]`), sin bloques `switch` ni bloques `try/catch`.

### 1.7 DTOs Planos (*Flat DTOs*) en Límites de Puertos vs. Sobre-fragmentación (KISS / YAGNI)
* **Concepto teórico:** Los Objetos de Transferencia de Datos (*Data Transfer Objects*) que cruzan los límites arquitectónicos deben privilegiar la simplicidad de consumo y serialización. Separar interfaces o anidar sub-objetos prematuramente para campos que solo aplican en casos especiales aumenta la verborragia de los adaptadores sin beneficio tangible.
* **Ejemplo en nuestro código ([`MoveRecord` en `GameSnapshot.ts`](../../proyect/src/core/ports/GameSnapshot.ts)):**
  * Mantiene una estructura plana con 5 propiedades obligatorias (`moveIndex`, `turn`, `piece`, `from`, `to`) y 4 opcionales (`capturedPiece?`, `isCastling?`, `isPromotion?`, `promotionPiece?`).
  * Evita la explosión combinatoria de subtipos y permite un consumo directo y limpio tanto en el panel de historial ([`MoveHistoryTable.tsx`](../../proyect/src/adapters/web/components/MoveHistoryTable.tsx)) como en el exportador de partidas ([`transcriptionFormatter.ts`](../../proyect/src/adapters/web/transcriptionFormatter.ts)).

### 1.8 Entidades (*Entities*) y Raíz de Agregado (*Aggregate Root* — DDD)
* **Concepto teórico:** A diferencia de un *Value Object*, una **Entidad** posee continuidad e identidad a lo largo del tiempo aunque sus atributos o ubicación cambien. Un **Agregado** es un clúster de entidades y objetos de valor tratados como una unidad de consistencia transaccional, gobernado por una única **Raíz de Agregado (*Aggregate Root*)** que impide que el exterior mute el estado interno rompiendo invariantes.
* **Ejemplos en nuestro código:**
  * **Entidades ([`Board.ts`](../../proyect/src/core/board/Board.ts) y [`Piece.ts`](../../proyect/src/core/pieces/Piece.ts)):** Una instancia de `Rook` o `King` conserva su identidad de referencia durante toda la partida (lo que permite a `Board` rastrear en `movedPieces: Set<IPiece>` si esa instancia específica se movió alguna vez para validar el derecho a enroque, independientemente de a qué casilla vaya o si se deshace la jugada).
  * **Raíz de Agregado ([`ChessGame.ts`](../../proyect/src/core/game/ChessGame.ts)):** Ningún adaptador externo recibe jamás una referencia a `Board` ni a `IPiece`. Toda operación pasa por `ChessGame` (`makeMove`, `undo`, `redo`, `declareTimeout`), quien garantiza las invariantes FIDE (nadie mueve fuera de turno, nadie deja a su Rey en jaque, nadie mueve en estado terminal) y expone hacia afuera únicamente copias inmutables (`GameSnapshot`).

### 1.9 Servicios de Dominio sin Estado (*Stateless Domain Services* — DDD)
* **Concepto teórico:** Cuando una operación o regla de negocio del dominio involucra múltiples entidades a la vez y no pertenece de forma natural a una sola entidad sin ensuciar su cohesión, se modela como un **Servicio de Dominio sin estado (*stateless*)**.
* **Ejemplos en nuestro código (`core/game/`):**
  * [`CheckDetector.ts`](../../proyect/src/core/game/CheckDetector.ts): `isKingInCheck(board, kingColor)` inspecciona todas las piezas rivales y la posición del Rey sobre `IBoardQuery`. No guarda estado propio ni pertenece a `King` ni a `Board`.
  * [`InsufficientMaterialEvaluator.ts`](../../proyect/src/core/game/InsufficientMaterialEvaluator.ts): `isInsufficientMaterial(board)` audita el inventario remanente de piezas de ambos bandos (Rey vs. Rey, Rey + Alfil/Caballo vs. Rey, Alfiles del mismo color de casilla).
  * [`PositionHasher.ts`](../../proyect/src/core/game/PositionHasher.ts) y [`FenSerializer.ts`](../../proyect/src/core/game/FenSerializer.ts): Servicios puros que proyectan el estado completo del tablero y derechos de enroque/al paso en claves de hash o cadenas FEN estándar (*Ver [Discusiones 14 y 15](./discutiendo_con_la_ia.md#discusión-14-simplificación-de-insufficientmaterialevaluator--eliminación-de-funciones-de-una-línea-y-extracción-de-collectremainingpieces)*).

### 1.10 Lenguaje Ubicuo (*Ubiquitous Language* — DDD)
* **Concepto teórico:** El vocabulario utilizado en el código fuente (nombres de clases, métodos, tipos y variables) debe coincidir exactamente con el vocabulario de los expertos del dominio y de los patrones arquitectónicos, sin términos genéricos ambiguos (`data`, `flag`, `manager`, `helper`).
* **Ejemplos en nuestro código:**
  * Distinción explícita entre `getPseudoLegalMoves` (geometría pura en `IPiece`) y `getLegalMoves` (jugadas filtradas contra jaque al propio Rey en `IGameEngine`).
  * Términos canónicos del ajedrez FIDE: `enPassantTarget`, `halfMoveClock`, `isThreefoldRepetition`, `isInsufficientMaterial`, `isFiftyMoveRuleReached`, `toAlgebraic()`.
  * Simetría de nomenclatura en patrones (*Ver [Discusión 12](./discutiendo_con_la_ia.md#discusión-12-eliminación-de-la-palabra-kind-en-igamestate--alineación-simétrica-con-type-gamestatetype-y-fidelidad-al-patrón-state-de-gof)*): `piece.type: PieceType` y `state.type: GameStateType`.

---

## 2. Principios GRASP (*General Responsibility Assignment Software Patterns*)

### 2.1 Principio `Creator` (Creador) e `Information Expert` (Experto en Información)
* **Concepto teórico:** El principio **Creator** de GRASP establece que la responsabilidad de instanciar una clase $A$ debe asignarse a la clase $B$ si $B$ posee los datos de inicialización necesarios para crear $A$ (*Information Expert* de la creación), registra/almacena la instancia de $A$, o la utiliza estrechamente.
* **Ejemplo en nuestro código (`MoveCommand.ts` — Ver [Discusión 3](./discutiendo_con_la_ia.md#discusión-3-realmente-necesitamos-promotionfactory-o-conviene-eliminarlo-aplicando-yagni-y-grasp-creator)):**
  * Cuando un peón corona en la última fila, [`MoveCommand.ts`](../../proyect/src/core/game/MoveCommand.ts) es quien instancia la pieza promovida a través de su método privado `createPromotedPiece(color: Color)` apoyado en `PROMOTION_PIECE_CONSTRUCTORS`:
    ```ts
    const PROMOTION_PIECE_CONSTRUCTORS: Partial<Record<PieceType, new (color: Color) => IPiece>> = {
      QUEEN: Queen,
      ROOK: Rook,
      BISHOP: Bishop,
      KNIGHT: Knight,
    };
    ```
  * `MoveCommand` cumple tres condiciones de **GRASP Creator** a la vez:
    1. **Tiene los datos de inicialización:** posee `this.promotionType` y `this.movedPiece.color`.
    2. **Registra la instancia creada:** la almacena en `private promotedPiece: IPiece | null` para poder revertir la coronación en `undo()`.
    3. **La utiliza estrechamente:** la coloca en el tablero (`this.board.placePiece(this.to, this.promotedPiece)`) y registra su estado en `this.board.setPieceMoved(this.promotedPiece, true)`.

### 2.2 Principios `Low Coupling` (Bajo Acoplamiento) y `High Cohesion` (Alta Cohesión)
* **Concepto teórico:** Mantener cada clase enfocada en responsabilidades estrechamente relacionadas (*Alta Cohesión*) y con la menor cantidad posible de dependencias hacia otras clases concretas (*Bajo Acoplamiento*), facilitando el mantenimiento, la reutilización y el testing aislado.
* **Ejemplos en nuestro código:**
  * **Caso 1 — `GameStateContext` en [`IGameState.ts`](../../proyect/src/core/game/IGameState.ts):** Las clases de estado (`NormalPlayState`, `CheckState`, `CheckmateState`, etc.) no conocen a `Board`, ni a `ChessGame`, ni a `CheckDetector`. Solo reciben una estructura inmutable con 5 booleanos pre-evaluados (`GameStateContext`), logrando acoplamiento nulo con la infraestructura del tablero.
  * **Caso 2 — Separación [`ChessClockController.ts`](../../proyect/src/adapters/web/clock/ChessClockController.ts) vs. [`useChessClock.ts`](../../proyect/src/adapters/web/clock/useChessClock.ts):** El controlador del reloj encapsula la máquina de tiempo pura en TypeScript sin depender de React, mientras que el hook `useChessClock` solo adapta sus notificaciones al estado de React.
  * **Caso 3 — Cohesión Funcional vs. Cohesión Coincidental en constantes (*Ver [Discusión 31](./discutiendo_con_la_ia.md#discusión-31-componentes-contenedores-con-children-modaldialog-y-coachcardshell-y-cohesión-de-constantes-compartidas-en-piecedisplaytsx)*):** Las constantes exclusivas de un componente permanecen junto a su componente, mientras que la identidad visual de jugador y pieza compartida por toda la UI se agrupa cohesivamente en [`pieceDisplay.tsx`](../../proyect/src/adapters/web/pieceDisplay.tsx) (`PLAYER_DISPLAY_CONFIG` y `PIECE_NAMES_LOOKUP`), evitando un archivo `constants.ts` "bolsa de gatos".

### 2.3 Principio `Controller` (Controlador)
* **Concepto teórico:** Asignar la responsabilidad de recibir y coordinar un evento del sistema a una clase que represente el sistema global o el caso de uso actual, en lugar de colocar lógica de negocio en la vista.
* **Ejemplos en nuestro código:**
  * **En el Core ([`ChessGame.ts`](../../proyect/src/core/game/ChessGame.ts)):** Actúa como controlador de fachada para los eventos de la partida (`makeMove`, `undo`, `redo`, `declareTimeout`), coordinando `Board`, `CommandHistory`, `CheckDetector` e `IGameState`.
  * **En la capa de Servicios ([`AnalysisService.ts`](../../proyect/src/adapters/services/AnalysisService.ts)):** Coordina el caso de uso de análisis completo de partida e *hints* en vivo, orquestando la reproducción en un motor auxiliar (`IGameEngine`), la serialización FEN (`FenSerializer`), la consulta táctica a Stockfish (`IChessEngine`) y la explicación pedagógica de Gemini (`IAiCoachEngine`).

### 2.4 Principio `Polymorphism` (Polimorfismo)
* **Concepto teórico:** Cuando el comportamiento varía según el tipo o estado, asignar la responsabilidad de la variación a los tipos mismos mediante operaciones polimórficas en lugar de usar condicionales `if/switch` preguntando por el tipo.
* **Ejemplos en nuestro código:**
  * [`IGameState.ts`](../../proyect/src/core/game/IGameState.ts): `ChessGame` nunca pregunta `if (this.state.type === 'CHECKMATE')` para saber quién ganó o si se permiten jugadas; invoca polimórficamente `this.currentState.canAcceptMoves()` y `this.currentState.getWinner(this.currentTurn)`.
  * [`IMovementRule.ts`](../../proyect/src/core/rules/IMovementRule.ts): `Piece.getPseudoLegalMoves()` itera sobre `this.rules` invocando `rule.getCandidatePositions(from, this.color, board)` sin conocer si la regla desliza, salta o captura al paso.

### 2.5 Principios `Pure Fabrication` (Fabricación Pura) e `Indirection` (Indirección)
* **Concepto teórico:** Cuando asignar una responsabilidad a una entidad del dominio (como `Board` o `Piece`) violaría la Alta Cohesión o el Bajo Acoplamiento, se **fabrica** una clase artificial que no representa un objeto físico del dominio real (*Pure Fabrication*), actuando además como intermediaria para desacoplar componentes (*Indirection*).
* **Ejemplos en nuestro código:**
  * [`CommandHistory.ts`](../../proyect/src/core/game/CommandHistory.ts): En un juego de ajedrez físico no existe un "administrador de pilas Undo/Redo". Fabricar esta clase evita ensuciar `Board` o `ChessGame` con el manejo de pilas `undoStack` y `redoStack`.
  * [`CheckDetector.ts`](../../proyect/src/core/game/CheckDetector.ts) y [`PositionHasher.ts`](../../proyect/src/core/game/PositionHasher.ts): Fabricaciones puras creadas para mantener a `Board` libre de reglas de jaque y de algoritmos de hashing para triple repetición.

---

## 3. Principios SOLID

### 3.1 **S** — Single Responsibility Principle (SRP)
* **Concepto teórico:** Una clase o módulo debe tener una única razón para cambiar, encapsulando una sola responsabilidad cohesiva.
* **Ejemplo en `pieces/` (`Piece.ts` + `Pawn.ts`):**
  * `Piece` solo se encarga de coordinar la consulta a sus reglas y deduplicar coordenadas (`uniquePositions`).
  * Cada regla de `Pawn` (`PawnForwardRule`, `PawnCaptureRule`, `EnPassantCaptureRule`) tiene una única razón para cambiar.
  * El seguimiento de qué piezas ya se movieron en la partida se delegó a `Board` (`movedPieces`), sacando ese estado mutable de `Piece`.

### 3.2 **O** — Open/Closed Principle (OCP)
* **Concepto teórico:** Las entidades de software deben estar abiertas para su extensión pero cerradas para su modificación.
* **Ejemplo en `pieces/` (`Piece.ts`):**
  * `Piece.getPseudoLegalMoves()` está **cerrado a la modificación** (su bucle de evaluación y deduplicación nunca se toca), pero **abierto a la extensión**: para crear una pieza con un movimiento nuevo, basta con inyectarle una nueva combinación de `IMovementRule` sin tocar `Piece` ni las demás piezas.

### 3.3 **L** — Liskov Substitution Principle (LSP)
* **Concepto teórico:** Los subtipos deben poder sustituir a sus tipos base sin alterar el correcto funcionamiento del programa ni violar el contrato esperado.
* **Ejemplo en `pieces/` (`Pawn`, `Rook`, `Knight`, `Bishop`, `Queen`, `King` $\rightarrow$ `Piece` / `IPiece`):**
  * Todas las subclases de `Piece` respetan exactamente el contrato de `IPiece`: ninguna lanza excepciones de "método no soportado" ni altera las precondiciones/postcondiciones de `getPseudoLegalMoves(from, board)`. Cualquier consumidor (`Board`, `ChessGame`, `CheckDetector`) opera con `IPiece` de manera indistinta.

### 3.4 **I** — Interface Segregation Principle (ISP)
* **Concepto teórico:** Ningún cliente debe verse forzado a depender de métodos que no utiliza; es preferible tener interfaces pequeñas y específicas.
* **Ejemplo en `IPiece.ts` y `IBoardQuery.ts` (Ver [Discusión 2](./discutiendo_con_la_ia.md#discusión-2-por-qué-hasmoved-y-sethasmoved-son-opcionales--en-ipiece-viola-isp)):**
  * Se quitaron los métodos opcionales `hasMoved?` y `setHasMoved?` de [`IPiece.ts`](../../proyect/src/core/pieces/IPiece.ts) para que piezas que no participan del enroque (`Knight`, `Bishop`, `Queen`, `Pawn`) no carguen con métodos innecesarios.
  * Además, [`IBoardQuery.ts`](../../proyect/src/core/ports/IBoardQuery.ts) segrega las operaciones de **solo lectura** (`getPieceAt`, `hasPieceMoved`, `getEnPassantTarget`) respecto de los métodos de **mutación** de `Board` (`placePiece`, `movePiece`, `setPieceMoved`, `setEnPassantTarget`), de modo que las piezas y reglas jamás puedan mutar el tablero.

### 3.5 **D** — Dependency Inversion Principle (DIP)
* **Concepto teórico:** Los módulos de alto nivel no deben depender de implementaciones concretas de bajo nivel; ambos deben depender de abstracciones (interfaces).
* **Ejemplo en `Piece.ts` e `IPiece.ts`:**
  * `Piece` no depende de clases concretas de reglas ni de la clase concreta `Board`: depende exclusivamente de las abstracciones `IMovementRule` e `IBoardQuery`, recibiendo sus reglas por inyección en el constructor.

---

## 4. Patrones de Diseño GoF (*Gang of Four*)

### 4.1 Patrón `Strategy`
* **Concepto teórico:** Define una familia de algoritmos, encapsula cada uno detrás de una interfaz común y los hace intercambiables para quien los consume.
* **Ejemplo 1 (Estrategias de movimiento a nivel de pieza):** `Piece` actúa como contexto que delega el algoritmo de cálculo geométrico en la interfaz `IMovementRule` (con estrategias intercambiables `SlidingMoveRule`, `LeapMoveRule`, `PawnForwardRule`, `PawnCaptureRule`, `EnPassantCaptureRule`, `CastlingMoveRule`).
* **Ejemplo 2 (Estrategias de IA — [`IAiStrategy.ts`](../../proyect/src/core/strategy/IAiStrategy.ts)):**
  * [`RandomAiStrategy.ts`](../../proyect/src/core/strategy/RandomAiStrategy.ts) y [`GreedyMaterialAiStrategy.ts`](../../proyect/src/core/strategy/GreedyMaterialAiStrategy.ts) implementan el mismo contrato `chooseMove(engine: IGameEngine): CandidateMove | null`, extrayendo la recolección común de jugadas legales en [`collectAllCandidateMoves.ts`](../../proyect/src/core/strategy/collectAllCandidateMoves.ts) (*Ver [Discusión 18](./discutiendo_con_la_ia.md#discusión-18-eliminación-de-código-duplicado-entre-randomaistrategy-y-greedymaterialaistrategy-mediante-collectallcandidatemoves)*).
  * El adaptador web ([`types.ts`](../../proyect/src/adapters/web/types.ts) y [`ChessApp.tsx`](../../proyect/src/adapters/web/ChessApp.tsx)) selecciona e instancia la estrategia dinámicamente mediante `GAME_MODES` sin acoplarse a ninguna implementación concreta.

### 4.2 Patrón `Factory` (Simple Factory / Factory Method) y su balance con YAGNI
* **Concepto teórico:** Encapsula la lógica de instanciación de objetos complejos o polimórficos para desacoplar al cliente de las clases concretas que se crean.
* **Análisis de Fábricas vs. YAGNI en el proyecto (Ver [Discusión 3](./discutiendo_con_la_ia.md#discusión-3-realmente-necesitamos-promotionfactory-o-conviene-eliminarlo-aplicando-yagni-y-grasp-creator), [Discusión 8](./discutiendo_con_la_ia.md#discusión-8-es-sobreingeniería-tener-una-clase-boardsetupfactory-transformación-a-funciones-utilitarias-y-simplificación-de-createstandardboard) y [Discusión 23](./discutiendo_con_la_ia.md#discusión-23-desacoplamiento-de-greedymaterialaistrategy-fábrica-canónica-de-piezas-reconstrucción-de-tableros-y-reglas-de-legalidad)):**
  * Se analizó la creación de piezas y tableros. En lugar de forzar clases artificiales con solo métodos estáticos, se centralizó la instanciación polimórfica de piezas en [`pieceFactory.ts`](../../proyect/src/core/pieces/pieceFactory.ts) (`createPiece(type, color)`) y la de tableros en [`boardSetup.ts`](../../proyect/src/core/board/boardSetup.ts).
* **Nota de diseño sobre evolución arquitectónica hacia Abstract Factory:**
  * Si el sistema creciera para soportar múltiples modos de juego simultáneos (ej. *Fischer Random / Chess960*, *Fairy Chess* o importadores de variantes desde FEN/PGN), el módulo [`boardSetup.ts`](../../proyect/src/core/board/boardSetup.ts) es el candidato natural para formalizarse como una jerarquía de fábricas de variantes (*Abstract Factory* o *Factory Method*).

### 4.3 Patrón `Command`
* **Concepto teórico:** Encapsula una petición como un objeto independiente, conteniendo toda la información necesaria para ejecutar la acción y revertirla (*undo/redo*), desacoplando al emisor del receptor.
* **Ejemplos en nuestro código ([`ICommand.ts`](../../proyect/src/core/game/ICommand.ts) y [`MoveCommand.ts`](../../proyect/src/core/game/MoveCommand.ts)):**
  * [`ICommand.ts`](../../proyect/src/core/game/ICommand.ts) define la interfaz simétrica `execute(): void` y `undo(): void`.
  * [`MoveCommand.ts`](../../proyect/src/core/game/MoveCommand.ts) encapsula una jugada completa sobre el tablero (`from`, `to`, `promotionType`). Para permitir la reversión exacta sin clonar todo el tablero en cada jugada (técnica de **Memento ligero**), almacena el estado previo en estructuras cohesivas (`CapturedPieceRecord`, `CastlingRecord`, `promotedPiece`, `wasPieceMovedBefore`, `previousEnPassantTarget`).
  * **Eliminación de *Data Clumps* (Ver [Discusión 11](./discutiendo_con_la_ia.md#discusión-11-code-smell-data-clumps-en-movecommand--agrupamiento-de-estado-cohesivo-en-registros-y-eliminación-de-flags-booleanos-redundantes)):** Se agruparon las 11 variables de estado dispersas en sub-estructuras con tipado estricto, suprimiendo banderas booleanas redundantes (`isCastling`, `isPromotion`) y eliminando comprobaciones nulas defensivas en `undo()`.


### 4.4 Patrón `State`
* **Concepto teórico:** Permite a un objeto alterar su comportamiento cuando su estado interno cambia. El objeto parecerá haber cambiado de clase, reemplazando condicionales complejos y banderas de estado por polimorfismo de clases que representan cada fase o estado del ciclo de vida.
* **Ejemplos en nuestro código ([`IGameState.ts`](../../proyect/src/core/game/IGameState.ts) y clases de estado):**
  * [`IGameState.ts`](../../proyect/src/core/game/IGameState.ts) define el contrato con `readonly type: GameStateType`, `canAcceptMoves(): boolean`, `getWinner(currentTurn: Color): Color | null` y `evaluateNextState(context: GameStateContext): IGameState`.
  * **Desacoplamiento con `GameStateContext`:** En lugar de que los estados se acoplen al tablero o motor, reciben un objeto inmutable con los hechos evaluados (`isKingInCheck`, `hasLegalMoves`, `isFiftyMoveRuleReached`, `isInsufficientMaterial`, `isThreefoldRepetition`).
  * **Estados Activos vs. Terminales:**
    * Activos ([`NormalPlayState.ts`](../../proyect/src/core/game/NormalPlayState.ts) y [`CheckState.ts`](../../proyect/src/core/game/CheckState.ts)): aceptan jugadas (`canAcceptMoves() === true`) y delegan la transición en [`activeStateTransition.ts`](../../proyect/src/core/game/activeStateTransition.ts).
    * Terminales ([`CheckmateState.ts`](../../proyect/src/core/game/CheckmateState.ts), [`StalemateState.ts`](../../proyect/src/core/game/StalemateState.ts), [`DrawState.ts`](../../proyect/src/core/game/DrawState.ts), [`TimeoutState.ts`](../../proyect/src/core/game/TimeoutState.ts)): bloquean jugadas (`canAcceptMoves() === false`), retornan `this` ante transiciones y calculan el ganador polimórficamente sin condicionales en el motor.
  * **Simetría y Lenguaje Ubicuo (Ver [Discusión 12](./discutiendo_con_la_ia.md#discusión-12-eliminación-de-la-palabra-kind-en-igamestate--alineación-simétrica-con-type-gamestatetype-y-fidelidad-al-patrón-state-de-gof)):** Se eliminó la palabra impersonal `kind` sustituyéndola por `readonly type: GameStateType`, manteniendo simetría total con `IPiece.type: PieceType`.


### 4.5 Patrón `Observer`
* **Concepto teórico:** Define una dependencia uno-a-muchos entre objetos de modo que cuando el sujeto cambia su estado, todos sus observadores dependientes son notificados automáticamente. En el modelo *Push*, el sujeto envía los datos del cambio (evitando que el observador deba consultar manualmente).
* **Ejemplos en nuestro código ([`IGameObserver.ts`](../../proyect/src/core/ports/IGameObserver.ts) y [`ChessGame.ts`](../../proyect/src/core/game/ChessGame.ts)):**
  * `ChessGame` implementa `subscribe(observer: IGameObserver): UnsubscribeFn` y mantiene una colección `private readonly observers: Set<IGameObserver>`.
  * Ante cada jugada aplicada, `undo`, `redo` o timeout, ejecuta `notifyObservers()` transmitiendo una foto inmutable [`GameSnapshot`](../../proyect/src/core/ports/GameSnapshot.ts).
  * **Integración con React sin `useEffect`:** El adaptador web ([`ChessApp.tsx`](../../proyect/src/adapters/web/ChessApp.tsx)) consume `engine.subscribe` y `engine.getSnapshot` mediante el hook nativo `useSyncExternalStore`. Esto elimina el doble render y los problemas de *tearing*, permitiendo que la vista se sincronice síncronamente en cada frame sin ningún `useEffect` para la lógica del juego.

### 4.6 Patrón `Facade` (Fachada)
* **Concepto teórico:** Proporciona una interfaz unificada y simplificada hacia un subsistema complejo compuesto por múltiples clases, reduciendo el acoplamiento entre los clientes y los componentes internos del subsistema.
* **Ejemplos en nuestro código:**
  * **En el Core ([`ChessGame.ts`](../../proyect/src/core/game/ChessGame.ts) detrás de [`IGameEngine.ts`](../../proyect/src/core/ports/IGameEngine.ts)):** Oculta la interacción entre `Board`, `MoveCommand`, `CommandHistory`, `CheckDetector`, `InsufficientMaterialEvaluator`, `PositionHasher` y las clases `IGameState` detrás de una interfaz simple de 8 métodos.
  * **En Servicios ([`AnalysisService.ts`](../../proyect/src/adapters/services/AnalysisService.ts) detrás de [`IAnalysisService.ts`](../../proyect/src/adapters/services/IAnalysisService.ts)):** Oculta a la UI la coordinación entre el motor de ajedrez (`ChessGame`), el serializador FEN (`FenSerializer`), la API de Stockfish (`IChessEngine`), el evaluador de calidad (`moveQualityEvaluator`) y el coach Gemini (`IAiCoachEngine`).
  * **En Componentes UI ([`PieceDisplay` en `pieceDisplay.tsx`](../../proyect/src/adapters/web/pieceDisplay.tsx)):** Actúa como fachada presentacional que decide internamente si renderizar `StandardPieceGlyph` o `FallbackPieceBadge` (para piezas de *Fairy Chess*), liberando a [`ChessSquare.tsx`](../../proyect/src/adapters/web/components/ChessSquare.tsx) de conocer los detalles de representación (*Ver [Discusión 25](./discutiendo_con_la_ia.md#discusión-25-refactorización-de-renderpiececontent-a-componentes-declarativos-standardpieceglyph-fallbackpiecebadge-y-piecedisplay-en-piecedisplaytsx)*).

### 4.7 Patrón `Adapter` (Adaptador / *Wrapper*)
* **Concepto teórico:** Convierte la interfaz de una clase o servicio externo en otra interfaz que el cliente espera, permitiendo que colaboren componentes con contratos incompatibles.
* **Ejemplos en nuestro código (`adapters/services/` y `adapters/web/clock/`):**
  * [`ChessApiService.ts`](../../proyect/src/adapters/services/ChessApiService.ts): Adapta el protocolo HTTP/JSON de `https://chess-api.com/v1` al contrato interno [`IChessEngine.ts`](../../proyect/src/adapters/services/IChessEngine.ts), incluyendo un mecanismo de respaldo heurístico local (*fallback*) cuando no hay red.
  * [`GeminiCoachService.ts`](../../proyect/src/adapters/services/GeminiCoachService.ts): Adapta la API REST de `generativelanguage.googleapis.com` (Google Gemini) al puerto [`IAiCoachEngine.ts`](../../proyect/src/adapters/services/IAiCoachEngine.ts).
  * [`useChessClock.ts`](../../proyect/src/adapters/web/clock/useChessClock.ts): Adapta la clase imperativa [`ChessClockController.ts`](../../proyect/src/adapters/web/clock/ChessClockController.ts) al modelo reactivo declarativo de React.

---

## 5. *Code Smells*, Refactorización y Buenas Prácticas en UI

Durante la revisión archivo por archivo (documentada en las 31 discusiones de [`discutiendo_con_la_ia.md`](./discutiendo_con_la_ia.md)) se identificaron y corrigieron los siguientes *Code Smells* clásicos de la literatura (Martin Fowler / *Refactoring*):

### 5.1 *Data Clumps* (Grupos de Datos Dispersos)
* **Concepto teórico:** Conjunto de variables que siempre viajan o se manipulan juntas pero están sueltas como campos o argumentos separados, ocultando un concepto cohesivo.
* **Ejemplos refactorizados:**
  * [`MoveCommand.ts`](../../proyect/src/core/game/MoveCommand.ts) (*[Discusión 11](./discutiendo_con_la_ia.md#discusión-11-code-smell-data-clumps-en-movecommand--agrupamiento-de-estado-cohesivo-en-registros-y-eliminación-de-flags-booleanos-redundantes)*): Se agruparon los campos dispersos de captura y enroque en registros tipados (`CapturedPieceRecord` y `CastlingRecord`), eliminando banderas booleanas redundantes (`isCastling`, `isPromotion`).
  * [`ControlPanelView.tsx`](../../proyect/src/adapters/web/ControlPanelView.tsx) (*[Discusión 29](./discutiendo_con_la_ia.md#discusión-29-unificación-de-tablas-de-mapeo-paralelas-en-objetos-cohesivos-en-playerclockbartsx)*): Se eliminaron las 8 props sueltas de configuración de reloj (`isClockEnabled`, `whiteMinutes`, `blackMinutes`, `onToggleClock`, etc.) reemplazándolas por el objeto cohesivo `clockConfig: ClockConfigSectionProps`.

### 5.2 *Dead Code* (Código Muerto)
* **Concepto teórico:** Código o componentes que nunca son invocados en el flujo real de ejecución de la aplicación (o que existen únicamente porque un test aislado los importa), generando costo de mantenimiento y confusión.
* **Ejemplo refactorizado (*[Discusión 28](./discutiendo_con_la_ia.md#discusión-28-eliminación-de-código-muerto-movehistorypaneltsx-y-unificación-en-movehistorytabletsx)*):**
  * Se detectó que `MoveHistoryPanel.tsx` duplicaba el 90% de [`MoveHistoryTable.tsx`](../../proyect/src/adapters/web/components/MoveHistoryTable.tsx) y su único consumidor en todo el repositorio era su propio archivo de test. Se migró la columna de detalle especial (`Enroque`, `Coronación`, `Captura`) a `MoveHistoryTable.tsx` y se eliminó el componente muerto.

### 5.3 Principio DRY (*Don't Repeat Yourself*) y Eliminación de Código Duplicado
* **Concepto teórico:** Cada pieza de conocimiento o lógica dentro de un sistema debe tener una representación única, inequívoca y autoritativa.
* **Ejemplos refactorizados:**
  * [`collectAllCandidateMoves.ts`](../../proyect/src/core/strategy/collectAllCandidateMoves.ts) (*[Discusión 18](./discutiendo_con_la_ia.md#discusión-18-eliminación-de-código-duplicado-entre-randomaistrategy-y-greedymaterialaistrategy-mediante-collectallcandidatemoves)*): Unificó el doble bucle de exploración del tablero que antes estaba copiado entre `RandomAiStrategy` y `GreedyMaterialAiStrategy`.
  * `useMatchReplay` en [`ChessApp.tsx`](../../proyect/src/adapters/web/ChessApp.tsx) (*[Discusión 30](./discutiendo_con_la_ia.md#discusión-30-modularización-de-chessapptsx-board_layout_dimensions-usematchreplay-y-boardcolumnarea)*): Unificó la creación del `setInterval` de reproducción en `startPlaybackInterval(speed)`, eliminando la duplicación entre `handleTogglePlay` y `handleSpeedChange`.
  * [`ModalDialog.tsx`](../../proyect/src/adapters/web/components/ModalDialog.tsx) (*[Discusión 31](./discutiendo_con_la_ia.md#discusión-31-componentes-contenedores-con-children-modaldialog-y-coachcardshell-y-cohesión-de-constantes-compartidas-en-piecedisplaytsx)*): Unificó el contenedor superpuesto y la guarda `if (!isOpen) return null` entre `ApiKeyModal.tsx` y `PromotionModal.tsx`.

### 5.4 Cláusulas de Guarda (*Guard Clauses*) y *Type Narrowing* vs. Abstracciones Forzadas
* **Concepto teórico:** Cuando se evalúan múltiples condiciones independientes con distinta prioridad y distintos tipos de datos opcionales, las cláusulas de retorno temprano (*Guard Clauses*) permiten que el analizador de flujo de control de TypeScript estreche los tipos automáticamente (*Type Narrowing*), resultando más simple y seguro que construir diccionarios intermedios con operadores ternarios redundantes.
* **Ejemplo en nuestro código ([`CoachFeedbackCard.tsx`](../../proyect/src/adapters/web/components/CoachFeedbackCard.tsx) — *[Discusión 27](./discutiendo_con_la_ia.md#discusión-27-guard-clauses-y-type-narrowing-de-typescript-vs-lookup-table-forzada-en-coachfeedbackcardtsx)*):**
  * Cada `if (liveHint) return <CoachLiveHintCard liveHint={liveHint} ... />` estrecha automáticamente el tipo de `liveHint | null | undefined` a `LiveHintData` sin aserciones no nulas (`!`) ni evaluación ansiosa innecesaria.

### 5.5 Patrón *Composed Component* en React
* **Concepto teórico:** Dividir componentes extensos en subcomponentes privados cohesivos con nombres semánticos dentro del mismo módulo, logrando que el componente principal exprese su estructura visual como un índice declarativo sin necesidad de comentarios divisores de sección.
* **Ejemplos en nuestro código (*[Discusiones 26, 30 y 31](./discutiendo_con_la_ia.md#discusión-26-aplicación-del-patrón-composed-component-subcomponentes-privados-y-lookup-tables-en-componentes-react)*):**
  * [`ApiKeyModal.tsx`](../../proyect/src/adapters/web/components/ApiKeyModal.tsx) (`ModalHeader`, `ModalDescription`, `ApiKeyInputField`, `SavedSuccessBanner`, `ModalFooterActions`), [`ReplayControlSection.tsx`](../../proyect/src/adapters/web/components/ReplayControlSection.tsx) (`ReplayTransportControls`, `PlaybackSpeedSelector`, `ReplayFooterActions`), [`CoachFeedbackCard.tsx`](../../proyect/src/adapters/web/components/CoachFeedbackCard.tsx) (`CoachCardShell` + las 5 tarjetas) y [`ChessApp.tsx`](../../proyect/src/adapters/web/ChessApp.tsx) (`BoardColumnArea`).

---

## 6. Estrategias de Testing, *Seams* y TDD

### 6.1 *Testing Seams* (Puntos de Costura) e Inyección de Dependencias
* **Concepto teórico:** Un *Seam* (concepto de Michael Feathers en *Working Effectively with Legacy Code*) es un punto donde se puede alterar el comportamiento o el estado inicial de un componente sin editar su código fuente, típicamente mediante inyección por constructor o por *props*.
* **Ejemplos en nuestro código:**
  * **Seam del Core ([`ChessGame.ts`](../../proyect/src/core/game/ChessGame.ts)):** El constructor `new ChessGame(board?, initialTurn?)` usa `createStandardBoard()` por defecto en producción, pero permite inyectar un `new Board(rows, cols)` armado a medida en 3 líneas dentro de los tests (por ejemplo, para probar un jaque mate, ahogado o coronación sin tener que simular 40 jugadas previas).
  * **Seam del Adaptador Web ([`ChessApp.tsx`](../../proyect/src/adapters/web/ChessApp.tsx)):** Recibe `engineFactory?: () => IGameEngine` y `analysisServiceFactory?: () => IAnalysisService`, permitiendo que [`ChessApp.test.tsx`](../../proyect/tests/adapters/ChessApp.test.tsx) inyecte tableros preconfigurados o servicios simulados.

### 6.2 Patrón **AAA** (*Arrange - Act - Assert*) e Invariantes de Reversibilidad
* **Concepto teórico:** Estructurar cada prueba unitaria en tres fases claras: preparar el escenario (*Arrange*), ejecutar la acción bajo prueba (*Act*) y verificar el resultado (*Assert*).
* **Ejemplo en nuestro código ([`CommandHistory.test.ts`](../../proyect/tests/core/CommandHistory.test.ts) y [`CastlingAndEnPassant.test.ts`](../../proyect/tests/core/CastlingAndEnPassant.test.ts)):**
  * Se verifica sistemáticamente la invariante algebraica del patrón Command: aplicar `makeMove` (*Act 1*) seguido de `undo` (*Act 2*) restaura exactamente las piezas, el turno, los derechos de enroque y el objetivo `enPassantTarget` al estado original ($\text{State}_{\text{before}} \equiv \text{State}_{\text{Act(Undo)}}$).

### 6.3 *Test Doubles*: **Stubs**, *Spies* y *Fake Timers* para Ejecución Determinista en Memoria
* **Concepto teórico:** Un **Stub** provee respuestas predefinidas ("enlatadas") a las llamadas realizadas durante el test, aislando las pruebas unitarias de factores externos lentos o no deterministas (red HTTP, APIs de terceros, paso del tiempo real del reloj del sistema).
* **Ejemplos en nuestro código:**
  * **Stubs de `IChessEngine` e `IAiCoachEngine` ([`AnalysisService.test.ts`](../../proyect/tests/adapters/AnalysisService.test.ts)):** Se inyectan *Stubs* con respuestas preprogramadas (`vi.fn().mockResolvedValue(...)`) en `new AnalysisService(mockEngine, mockCoach)` para verificar el cálculo de pérdida de centipeones, precisión y llamadas a los puertos en milisegundos y sin conexión a internet.
  * **Reloj Sintético / *Fake Timers* ([`ChessClock.test.ts`](../../proyect/tests/adapters/ChessClock.test.ts)):** Se utiliza `vi.useFakeTimers()` y `vi.advanceTimersByTime(10000)` para probar el descuento de milisegundos, la alerta de poco tiempo y la derrota automática por *Timeout* de manera instantánea y 100% determinista.



