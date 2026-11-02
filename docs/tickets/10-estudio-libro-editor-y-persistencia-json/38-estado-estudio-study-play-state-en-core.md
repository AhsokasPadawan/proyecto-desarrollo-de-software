# 38: Estado de Dominio `StudyPlayState` y Partida de Estudio en el Core

**What to build:** Extender el patrón GoF `State` en el Core con `StudyPlayState` (`type: 'STUDY_IN_PROGRESS'`) y habilitar el inicio de `ChessGame` en modo estudio desde cualquier disposición libre de piezas sin validaciones restrictivas. En una partida de estudio, si el tablero solo posee piezas de un único color se conserva el turno en ese color tras cada jugada; no se interrumpe la partida por tablas automáticas (material insuficiente, regla de 50 movimientos o triple repetición) ni ahogado por falta de piezas rivales, pero sí se detecta jaque y jaque mate cuando existe un Rey enemigo en el tablero.

**Blocked by:** `13-patron-state-fases-activas`, `14-state-jaque-mate-y-ahogado`

**Branch:** `ticket/38-estado-estudio-study-play-state-en-core`

**Status:** Done

## Acceptance Criteria

- [x] Se incorpora `'STUDY_IN_PROGRESS'` al tipo `GameStateType` y se implementa `StudyPlayState implements IGameState` sin introducir banderas booleanas dispersas de modo estudio.
- [x] `ChessGame` permite inicializarse con un estado inicial configurable (por defecto `NormalPlayState`, e inyectable con `StudyPlayState` para partidas de estudio) desde cualquier disposición de piezas en `Board`.
- [x] Si en una partida en `StudyPlayState` únicamente existen piezas de un solo color en el tablero, tras ejecutar `makeMove` el turno permanece en ese color permitiendo movimientos consecutivos (y `undo`/`redo` restaura el turno correctamente).
- [x] `StudyPlayState` no transiciona a tablas por material insuficiente, regla de 50 movimientos ni triple repetición, pero sí transiciona a `CheckmateState` cuando un Rey defensor recibe jaque mate.
- [x] Se actualiza `stateDisplayLookup.ts` en el adaptador web mediante su *Lookup Table* para mostrar la etiqueta e insignia correspondientes a `'STUDY_IN_PROGRESS'`.
- [x] Se añaden pruebas unitarias AAA 100% en memoria en `tests/core/` cubriendo tableros de un solo color, posiciones sin reyes, omisión de tablas por material insuficiente y detección de jaque mate en modo estudio.
