# 23: Panel Lateral de Estado (`IGameState`), Controles `Undo`/`Redo` y Selector de Estrategia IA

**What to build:** Implementar el panel lateral de control de partida en React + Tailwind CSS mostrando el turno actual, el banner de fase (`IN_PROGRESS`, alerta de `CHECK`, o resultado final `CHECKMATE`, `STALEMATE`, `DRAW`), los botones `Undo`, `Redo` y `Reiniciar Partida`, y el selector de modo de juego (`Humano vs Humano` o `Humano vs IA` alternando en vivo entre `RandomAiStrategy` y `GreedyMaterialAiStrategy`).

**Blocked by:** `14-state-jaque-mate-y-ahogado`, `20-strategy-ia-heuristica-material`, `22-interaccion-dos-clics-y-feedback`

**Branch:** `ticket/23-panel-control-historial-y-selector-ia`

**Status:** done

## Acceptance Criteria

- [x] Muestra el turno activo y traduce `snapshot.stateKind` a indicadores visuales claros mediante una *lookup table* de estilos y etiquetas.
- [x] Los botones `Undo` y `Redo` se habilitan/deshabilitan según `snapshot.canUndo` y `snapshot.canRedo` e invocan `game.undo()` y `game.redo()` desde sus handlers `onClick`.
- [x] Permite elegir entre `Humano vs Humano`, `Humano vs IA (Aleatoria)` y `Humano vs IA (Heurística Material)`, disparando la jugada de la `IAiStrategy` seleccionada directamente tras el movimiento humano sin depender de `useEffect`.
- [x] El botón `Reiniciar Partida` restablece el tablero inicial y limpia la selección activa.
