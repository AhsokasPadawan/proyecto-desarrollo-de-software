# 14: Estados Terminales (`CheckmateState` y `StalemateState`) y Bloqueo de Fin de Juego

**What to build:** Implementar las clases de estado terminal `CheckmateState` (`CHECKMATE`) y `StalemateState` (`STALEMATE`) dentro del patrón `State` cuando el jugador activo carece de `Legal Move`s disponibles, determinando el ganador o empate e impidiendo jugadas adicionales (`GAME_OVER`).

**Blocked by:** `13-patron-state-fases-activas`

**Branch:** `ticket/14-state-jaque-mate-y-ahogado`

**Status:** ready-for-agent

## Acceptance Criteria

- [ ] Si el jugador de turno tiene `isKingInCheck === true` y `0` movimientos legales en todo su ejército, `ChessGame` transiciona a `CheckmateState` (`kind: 'CHECKMATE'`) asignando como `winner` al color opuesto.
- [ ] Si el jugador de turno tiene `isKingInCheck === false` y `0` movimientos legales en todo su ejército, `ChessGame` transiciona a `StalemateState` (`kind: 'STALEMATE'`) con `winner: null`.
- [ ] En estados terminales (`canAcceptMoves() === false`), cualquier invocación a `makeMove` es rechazada con `{ success: false, reason: 'GAME_OVER' }`, mientras que `undo()` restaura el estado activo previo.
- [ ] Suite de tests unitarios **AAA** en memoria (incluyendo Mate del Loco / Mate del Pastor y escenarios de Rey ahogado) y reversión de Jaque Mate mediante `undo()`.
