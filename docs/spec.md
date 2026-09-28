# Especificación Funcional y Técnica — Chess TPO (`to-spec`)

* **Estado:** `ready-for-agent`
* **Referencias:** [`docs/architecture.md`](architecture.md) | [`docs/glossary.md`](glossary.md) | `docs/adr/ADR-001..012`

---

## Problem Statement

El equipo de 6 desarrolladores necesita construir un sistema de ajedrez académico completo que valide y ejecute partidas cumpliendo las reglas geométricas de las 6 piezas estándar, movimientos especiales (coronación, enroque, captura al paso), alternancia de turnos, capturas, detección de jaque, jaque mate, ahogado, reglas de tablas (50 movimientos, material insuficiente, triple repetición), reversión de jugadas (`undo`/`redo`) y oponente automatizado intercambiable. El problema central es estructurar el diseño bajo principios SOLID y patrones GoF de modo que el trabajo se reparta equitativamente en **6 épicas de 4 tickets (24 tickets)** y que el sistema permita inyectar una pieza híbrida de *Fairy Chess* o cambiar las dimensiones del tablero en menos de 15 minutos durante la defensa oral sin modificar las clases existentes.

---

## Solution

Construir un motor de dominio puro en TypeScript (**Core**) aislado de cualquier framework externo y expuesto a través de un único puerto de entrada (**`IGameEngine`**, implementado por **`ChessGame`**):

* **Épica 1 y 2 (Tablero, Piezas y Composición):** `Board` mutable *in-place* con dimensiones parametrizables (`IBoardQuery`), `Position` inmutable 0-indexed y las 6 clases nominales de `Piece` (`Pawn`, `Rook`, `Knight`, `Bishop`, `Queen`, `King`) componiendo `IMovementRule` (`SlidingMoveRule`, `LeapMoveRule`, `PawnForwardRule`, `PawnCaptureRule`).
* **Épica 3 (Motor, `Command` y `Observer`):** Orquestación de turnos, filtrado de `Legal Move`s mediante `CheckDetector` + simulación reversible con `MoveCommand` (`execute`/`undo`), `CommandHistory` (`undo`/`redo`) y notificación de `GameSnapshot` vía `IGameObserver`.
* **Épica 4 (Patrón `State` y Condiciones de Fin):** Gestión polimórfica de fases (`IGameState`: `NormalPlayState`, `CheckState`, `CheckmateState`, `StalemateState`, `DrawState`) incluyendo reglas de 50 movimientos, material insuficiente y triple repetición.
* **Épica 5 (Movimientos Especiales y Patrón `Strategy` para IA):** Coronación de peón, enroque y captura al paso reversibles con `MoveCommand`, más el contrato `IAiStrategy` (`RandomAiStrategy` y `GreedyMaterialAiStrategy`).
* **Épica 6 (Adaptador Web y Defensa):** Interfaz en React + TypeScript + Tailwind CSS conectada vía `useSyncExternalStore`, con interacción en 2 clics, grilla dinámica $N \times M$, *fallback* visual para piezas nuevas y sincronización final del Diagrama UML y documento de justificación (*What / Why / When to Break*).

---

## User Stories

### Épica 1: Tablero, Coordenadas y Base (`01-tablero-coordenadas-y-base`)
1. Como jugador, quiero que el `Board` estándar tenga una cuadrícula de $8 \times 8$ casillas identificadas por objetos de valor inmutables `Position` `(row, col)`, para que las piezas se ubiquen y desplacen dentro de coordenadas válidas.
2. Como desarrollador en la defensa oral, quiero poder instanciar un `Board` con dimensiones personalizadas `(rows, cols)` (por ejemplo $10 \times 10$ o $6 \times 6$), para que todas las reglas de movimiento validen los bordes dinámicamente mediante `isWithinBounds` sin modificar código existente.
3. Como autor de tests unitarios, quiero contar con conversores entre notación algebraica (`'e2'`) y `Position` `(row, col)` y poder colocar/mover/retirar piezas sobre `Board` e inyectarlo al constructor de `ChessGame`, para armar escenarios de prueba en memoria en una línea.
4. Como jugador, quiero poder iniciar una partida estándar mediante `BoardSetupFactory` donde las 16 piezas de `WHITE` ocupen las filas `0` y `1` y las 16 piezas de `BLACK` ocupen las filas `6` y `7` en su disposición oficial, para comenzar a jugar de inmediato.
5. Como motor de dominio, quiero que `CheckDetector` evalúe sobre `IBoardQuery` tanto si una casilla arbitraria está atacada por un color (`isSquareAttacked`) como si el `King` de un color está en jaque (`isKingInCheck`), para reutilizar el cálculo de amenazas en el filtrado de jugadas legales y en el enroque.

### Épica 2: Piezas y Reglas Geométricas (`02-piezas-y-reglas-geometricas`)
6. Como jugador, quiero que `Rook`, `Bishop` y `Queen` calculen sus desplazamientos continuos componiendo `SlidingMoveRule` (ortogonal, diagonal o ambas), deteniéndose antes de una pieza propia e incluyendo como captura la primera pieza rival antes de frenar el rayo.
7. Como jugador, quiero que `Knight` y `King` calculen sus desplazamientos discretos mediante `LeapMoveRule` (saltos en $L$ ignorando piezas intermedias para el caballo, y pasos unitarios adyacentes para el rey), permitiendo mover a casillas vacías o capturar piezas rivales.
8. Como jugador, quiero que `Pawn` componga `PawnForwardRule` (avance de 1 casilla si está vacía, y salto doble desde la fila inicial si ambas casillas frontales están vacías según su `Color`) y `PawnCaptureRule` (captura exclusiva en las dos diagonales frontales), para respetar la asimetría entre avance y captura del peón.
9. Como desarrollador en la defensa oral, quiero contar con una pieza híbrida demostradora (*Fairy Chess*, ej. `Archbishop` componiendo `SlidingMoveRule` diagonal + `LeapMoveRule` de caballo) y pruebas en tableros de $10 \times 10$, para certificar el cumplimiento de *Open/Closed* y *Composition over Inheritance*.

### Épica 3: Motor de Turnos, `Command`, Jaque y `Observer` (`03-motor-turnos-command-y-jaque`)
10. Como jugador, quiero que cada movimiento sobre el `Board` mutable se encapsule en un `MoveCommand` administrado por `CommandHistory` (`execute`, `undo`, `redo`), garantizando la invariante $\text{State}_{\text{before}} \equiv \text{State}_{\text{Act(Undo)}}$.
11. Como jugador, quiero que `ChessGame` (`IGameEngine`) alterne estrictamente los turnos `WHITE` $\leftrightarrow$ `BLACK`, ejecute capturas y devuelva un `MoveResult` tipado rechazando casilla origen vacía (`EMPTY_ORIGIN`), pieza del turno equivocado (`WRONG_TURN`) o destino fuera de las reglas geométricas (`ILLEGAL_MOVE`).
12. Como jugador, quiero que `ChessGame.getLegalMoves(from)` y `makeMove(from, to)` filtren todo movimiento pseudo-legal simulándolo con `MoveCommand` y verificando con `CheckDetector` que no deje al propio `King` en jaque (`KING_LEFT_IN_CHECK`), impidiendo mover piezas clavadas (*pinned*) o suicidar al Rey.
13. Como `Driving Adapter`, quiero suscribirme a `IGameEngine` mediante `subscribe(observer)` (con función explícita `unsubscribe`) para recibir un `GameSnapshot` inmutable tras cada jugada, `undo` o `redo`.

### Épica 4: Fases con Patrón `State` y Condiciones de Fin (`04-fases-state-y-condiciones-fin`)
14. Como jugador, quiero que `ChessGame` delegue su fase activa en implementaciones del patrón `State` (`IGameState`), transicionando polimórficamente entre `NormalPlayState` (`IN_PROGRESS`) y `CheckState` (`CHECK`) según si el `King` del turno actual está amenazado.
15. Como jugador, quiero que cuando el jugador de turno no tenga ningún `Legal Move` disponible, `ChessGame` transicione a `CheckmateState` (`CHECKMATE`, declarando ganador al color opuesto si hay jaque) o a `StalemateState` (`STALEMATE`, declarando empate si no hay jaque), bloqueando nuevas jugadas con `{ success: false, reason: 'GAME_OVER' }` y restaurando la fase previa si se ejecuta `undo()`.
16. Como jugador, quiero que la partida transicione a estado de tablas (`DrawState` / `DRAW`) cuando se cumpla la **Regla de los 50 movimientos** (100 medios turnos consecutivos sin captura ni movimiento de `Pawn`, reversible con `undo()`) o por **Material Insuficiente** (`K vs K`, `K+B vs K`, `K+N vs K`).
17. Como jugador, quiero que la partida transicione a estado de tablas (`DrawState` / `DRAW`) cuando una misma posición (disposición de piezas y turno activo) se repita por tercera vez (**Triple Repetición**), mantendo el registro sincronizado al usar `undo()` y `redo()`.

### Épica 5: Movimientos Especiales y Patrón `Strategy` para IA (`05-movimientos-especiales-y-strategy-ia`)
18. Como jugador, quiero que cuando un `Pawn` alcance la última fila del tablero (`row === rows - 1` para `WHITE`, `row === 0` para `BLACK`) sea promovido a la pieza seleccionada (por defecto `Queen`), y que al ejecutar `undo()` la pieza promovida se revierta exactamente al `Pawn` original.
19. Como jugador, quiero poder ejecutar el **Enroque (*Castling*)** corto y largo (cuando ni el `King` ni el `Rook` involucrado se hayan movido, las casillas intermedias estén vacías y el `King` no esté en jaque ni pase por casillas atacadas) y la **Captura al Paso (*En Passant*)** (inmediatamente después de un avance doble de peón rival), ambos 100% reversibles con `MoveCommand.undo()`.
20. Como jugador individual, quiero contar con el contrato `IAiStrategy` (patrón `Strategy`) y una implementación `RandomAiStrategy` que elija un movimiento al azar entre todos los `Legal Move`s del color activo, para poder jugar contra un oponente automatizado básico.
21. Como jugador individual, quiero poder cambiar en tiempo de ejecución a una segunda estrategia `GreedyMaterialAiStrategy` que priorice capturas de mayor puntaje y jaques usando una *lookup table* de valor de piezas, para enfrentar a un oponente más competitivo sin modificar `ChessGame`.

### Épica 6: Adaptador Web (React + Tailwind) y Entrega (`06-adaptador-web-y-entrega`)
22. Como jugador en el navegador, quiero ver una pantalla estilizada con Tailwind CSS conectada a `IGameEngine` vía `useSyncExternalStore` que renderice dinámicamente una grilla de `snapshot.rows` $\times$ `snapshot.cols` casillas y muestre las piezas mediante una *lookup table* con *fallback* automático para piezas de *Fairy Chess*.
23. Como jugador en el navegador, quiero seleccionar una pieza propia con un primer clic (`onClick`) para ver resaltados sus `Legal Move`s, ejecutar la jugada con un segundo clic (eligiendo pieza en caso de coronación) y ver alertas descriptivas cuando `MoveResult` devuelve un `MoveRejectionReason`.
24. Como jugador en el navegador, quiero disponer de un panel lateral con indicador de turno, banner de fase (`IGameState`), botones `Undo`, `Redo` y `Reiniciar`, y selector de modo (`Humano vs Humano` o `Humano vs IA` eligiendo la `IAiStrategy`), y contar con el Diagrama UML y documento de justificación 100% sincronizados para la defensa.

---

## Implementation Decisions & Testing Seams

* Todos los contratos siguen lo estipulado en [`docs/architecture.md`](architecture.md) y `ADR-001` a `ADR-012`.
* **Seam 1 (Geometría y Tablero):** `Board` (`IBoardQuery`) + `IPiece` / `IMovementRule` + `CheckDetector`.
* **Seam 2 (Flujo de Partida, Patrones e IA):** `IGameEngine` (`ChessGame`) con inyección de `Board` en constructor + `IAiStrategy`.
* **Reglas de Código:** Prohibición de bloques `switch` extensos (uso obligatorio de *lookup tables*), prohibición de comentarios explicativos/organizativos (código auto-documentado), y manejo de eventos en React directamente desde handlers `onClick` + `useSyncExternalStore` (cero `useEffect` para sincronizar estado de juego).
