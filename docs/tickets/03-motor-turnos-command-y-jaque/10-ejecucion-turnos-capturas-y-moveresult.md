# 10: Ejecución de Turnos, Capturas y `MoveResult` en `ChessGame` (`IGameEngine`)

**What to build:** Implementar la fachada principal `ChessGame` (`IGameEngine`) con inyección de `Board` en constructor, alternancia estricta de turnos `WHITE` $\leftrightarrow$ `BLACK`, ejecución y reversión de jugadas mediante `CommandHistory` y retorno de la unión discriminada `MoveResult` para validaciones de origen, turno y geometría.

**Blocked by:** `05-regla-deslizante-torre-alfil-reina`, `06-regla-salto-caballo-y-rey`, `07-reglas-peon-avance-y-captura`, `09-patron-command-y-command-history`

**Branch:** `ticket/10-ejecucion-turnos-capturas-y-moveresult`

**Status:** ready-for-agent

## Acceptance Criteria

- [ ] `ChessGame` comienza en el turno configurado (por defecto `WHITE`) y alterna el turno mediante *lookup table* (`OPPOSITE_COLOR`) tras cada movimiento válido, `undo()` o `redo()`.
- [ ] `makeMove` retorna `{ success: false, reason: 'EMPTY_ORIGIN' }` si la casilla origen está vacía, `{ success: false, reason: 'WRONG_TURN' }` si la pieza es del color rival, e `{ success: false, reason: 'ILLEGAL_MOVE' }` si el destino no pertenece a los movimientos válidos de la pieza.
- [ ] En movimientos válidos, ejecuta el `MoveCommand`, registra la captura si aplica y retorna `{ success: true, capturedPiece, nextState }`.
- [ ] Suite de tests unitarios **AAA** en memoria sobre el seam `ChessGame` validando alternancia de turnos, capturas, `undo`/`redo` y cada motivo de rechazo.
