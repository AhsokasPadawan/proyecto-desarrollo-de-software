# ADR-007: Separación entre Movimientos Pseudo-Legales (`IMovementRule`) y Movimientos Legales (`CheckDetector` / `ChessGame`)

* **Estado:** Aceptado
* **Fecha:** 2026-09-27

## 1. What (Qué decidimos)

La validación de movimientos se particiona en dos niveles con responsabilidades disjuntas:

1. **Cálculo de Movimientos Pseudo-Legales (`IPiece` + `IMovementRule`):**
   * Cada estrategia `IMovementRule` implementa `getPseudoLegalMoves(from: Position, piece: IPiece, board: IBoardQuery): Position[]`.
   * Opera exclusivamente sobre una interfaz de solo lectura **`IBoardQuery`** (cumpliendo *Interface Segregation*), evaluando geometría, límites del tablero (`isWithinBounds`), bloqueo por piezas del mismo color y captura de piezas oponentes.
   * No evalúa estados globales de la partida ni amenazas sobre el Rey.
2. **Detección de Amenazas (`CheckDetector`) y Filtrado de Movimientos Legales (`ChessGame`):**
   * `CheckDetector.isKingInCheck(board: IBoardQuery, kingColor: Color): boolean` determina si el Rey de `kingColor` se encuentra amenazado comprobando si alguna pieza rival en el tablero incluye la casilla del Rey dentro de sus movimientos pseudo-legales.
   * `ChessGame.getLegalMoves(from: Position): Position[]` obtiene los movimientos pseudo-legales de la pieza en `from` y filtra cada candidato aplicando `MoveCommand.execute()`, consultando `CheckDetector.isKingInCheck(board, currentTurn)` y revirtiendo inmediatamente con `MoveCommand.undo()`. Solo son **Movimientos Legales** aquellos que no dejan al propio Rey en jaque.

## 2. Why (Por qué lo elegimos)

1. **Prevención de Ciclos de Recursión Infinita (Regla Oficial del Ajedrez):** En ajedrez, una pieza enemiga aun estando clavada (*pinned*) da jaque al Rey rival si su trayectoria geométrica lo alcanza. Si las reglas de movimiento intentaran verificar internamente si dejan a su propio Rey en jaque, calcular el jaque de Blancas requeriría validar la legalidad completa de Negras y viceversa. Separar *pseudo-legal* de *legal* corta el ciclo en un solo paso.
2. **Principio de Responsabilidad Única (SRP) y Segregación de Interfaces (ISP):** Las reglas de movimiento permanecen como funciones puras de geometría y colisión que solo conocen `IBoardQuery` (sin acceso a métodos mutadores de `Board`).
3. **Extensibilidad Instantánea para Nuevas Piezas:** Cualquier pieza nueva inyectada en la defensa solo necesita definir sus `IMovementRule` geométricas; el filtrado de clavadas, jaque, jaque mate y ahogado funciona automáticamente para ella sin escribir código adicional.

## 3. When to Break (Cuándo reconsiderar o romper esta decisión)

Esta decisión debería revisarse si:
* Se introdujeran reglas de variantes exóticas donde una pieza tiene prohibido dar jaque o donde la amenaza al Rey no depende de la capacidad de captura geométrica directa de las piezas rivales.
