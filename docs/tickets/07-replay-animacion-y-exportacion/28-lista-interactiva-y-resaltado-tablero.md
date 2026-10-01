# 28: Lista Scrolleable Interactiva de Jugadas y Resaltado Visual en el Tablero

**What to build:** Complementar el modo Replay incorporando una lista lateral scrolleable interactiva de movimientos y feedback visual en el tablero. En la lista interactiva, cada movimiento indica su número, turno y coordenadas letra-número; al hacer clic en cualquier jugada de la lista, el sistema salta directamente a dicha posición temporal ejecutando los `undo`/`redo` necesarios y marcando visualmente la jugada activa. Asimismo, extender `ChessBoardView` para que, durante el Replay o la animación, se resalten visualmente las casillas `from` y `to` del movimiento recién reproducido, otorgando claridad perceptiva sobre el desplazamiento de las piezas.

**Blocked by:** `27-reproductor-replay-y-controles-transporte`

**Branch:** `ticket/28-lista-interactiva-y-resaltado-tablero`

**Status:** done

## Acceptance Criteria

- [x] Se renderiza la lista interactiva de jugadas con scroll vertical en el panel de revisión.
- [x] La jugada temporalmente activa se destaca con un estilo visual diferenciado en la lista.
- [x] Hacer clic en una jugada de la lista salta directamente a ese momento de la partida aplicando la cantidad exacta de `undo`/`redo`.
- [x] `ChessBoardView` acepta las casillas del último movimiento ejecutado (`activeMoveSquares: { from: Position, to: Position } | null`) y las resalta visualmente en la grilla con un fondo/borde suave.
- [x] El resaltado se actualiza en tiempo real tanto al avanzar manualmente como durante la animación automática y los saltos directos.
- [x] Pruebas unitarias de integración validando el salto temporal desde la lista y el renderizado del resaltado en el tablero.
