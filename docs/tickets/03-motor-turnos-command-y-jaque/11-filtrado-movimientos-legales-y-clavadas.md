# 11: Filtrado de `Legal Move`s, Piezas Clavadas y Rechazo por Jaque Propio

**What to build:** Integrar `CheckDetector` con la simulación reversible de `MoveCommand` dentro de `ChessGame.getLegalMoves(from)` y `ChessGame.makeMove(from, to)` para filtrar movimientos que dejen o mantengan al propio `King` en jaque (incluyendo piezas clavadas y movimientos del Rey hacia casillas atacadas).

**Blocked by:** `04-detector-de-amenazas-check-detector`, `10-ejecucion-turnos-capturas-y-moveresult`

**Branch:** `ticket/11-filtrado-movimientos-legales-y-clavadas`

**Status:** ready-for-agent

## Acceptance Criteria

- [ ] `getLegalMoves(from)` evalúa cada `Pseudo-Legal Move` ejecutando temporalmente `MoveCommand.execute()`, consultando `checkDetector.isKingInCheck(board, piece.color)` y revirtiendo inmediatamente con `MoveCommand.undo()`.
- [ ] Si un jugador intenta en `makeMove(from, to)` un movimiento geométricamente válido pero que deja a su propio `King` en jaque, el tablero queda intacto y se retorna `{ success: false, reason: 'KING_LEFT_IN_CHECK' }`.
- [ ] Una pieza clavada (*pinned*) no puede moverse fuera de la línea de ataque que protege a su Rey, pero sí puede moverse sobre esa misma línea o capturar al atacante.
- [ ] Suite de tests unitarios **AAA** en memoria probando piezas clavadas absolutas, evasión de jaque (mover Rey, bloquear rayo o capturar atacante) y prohibición de suicidio del Rey.
