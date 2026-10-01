# 22: Interacción de Juego en 2 Clics, Resaltado de `getLegalMoves` y Feedback de `MoveResult`

**What to build:** Implementar la interacción de selección y movimiento en 2 clics sobre el tablero React manejada directamente desde los eventos `onClick`, resaltando las casillas devueltas por `game.getLegalMoves(from)`, permitiendo elegir pieza en caso de coronación y mostrando mensajes descriptivos cuando `MoveResult` rechaza una jugada.

**Blocked by:** `21-tablero-web-dinamico-y-piezas`

**Branch:** `ticket/22-interaccion-dos-clics-y-feedback`

**Status:** done

## Acceptance Criteria

- [x] Un primer clic sobre una pieza del turno activo selecciona la casilla y resalta visualmente todos sus `Legal Move`s (distinguiendo casillas vacías de casillas con captura).
- [x] Un segundo clic sobre otra pieza del mismo color cambia la selección activa; un segundo clic sobre cualquier otra casilla invoca `game.makeMove(selected, target)` directamente en el handler `onClick`.
- [x] Si `MoveResult` es `{ success: false, reason }`, traduce `reason` mediante una *lookup table* de mensajes en español y lo muestra en la interfaz sin bloques `switch` ni `useEffect`.
- [x] Incluye selector visual compacto cuando un peón alcanza la fila de coronación.
