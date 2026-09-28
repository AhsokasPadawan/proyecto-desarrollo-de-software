# ADR-010: Unión Discriminada `MoveResult` para el Contrato de `makeMove`

* **Estado:** Aceptado
* **Fecha:** 2026-09-27

## 1. What (Qué decidimos)

El método `IGameEngine.makeMove(from: Position, to: Position)` retorna un objeto de valor tipado como unión discriminada (**`MoveResult`**) en lugar de arrojar excepciones ante jugadas inválidas:
* **Caso exitoso:** `{ success: true, capturedPiece: IPiece | null, nextState: GameStateKind }`
* **Caso rechazado:** `{ success: false, reason: MoveRejectionReason }`, donde `MoveRejectionReason` tipa explícitamente la causa del rechazo (`'GAME_OVER' | 'EMPTY_ORIGIN' | 'WRONG_TURN' | 'ILLEGAL_MOVE' | 'KING_LEFT_IN_CHECK'`).

Las excepciones de tiempo de ejecución se reservan exclusivamente para violaciones de precondiciones de programación (como coordenadas no enteras).

## 2. Why (Por qué lo elegimos)

1. **Flujo de Control Explícito y Tipado Seguro:** En un juego de mesa, intentar un movimiento ilegal es un evento de dominio esperado, no una falla excepcional de infraestructura. Una unión discriminada obliga al consumidor (en tiempo de compilación en TypeScript) a verificar `result.success` antes de continuar.
2. **Eliminación de Condicionales `switch` en Adaptadores mediante Lookup Tables:** Al contar con un tipo cerrado `MoveRejectionReason`, tanto el CLI como el adaptador React traducen el motivo de rechazo a un mensaje de usuario mediante un simple objeto de mapeo (`REJECTION_MESSAGES[result.reason]`) sin cadenas de `try/catch` ni `switch`.
3. **Aserciones Directas en Tests AAA:** Facilita verificar en una sola línea tanto que una jugada fue rechazada como la razón exacta por la cual falló.

## 3. When to Break (Cuándo reconsiderar o romper esta decisión)

Esta decisión debería revisarse si:
* El motor se integrara dentro de un framework transaccional que dependa obligatoriamente de excepciones no capturadas para disparar un *rollback* automático de infraestructura.
