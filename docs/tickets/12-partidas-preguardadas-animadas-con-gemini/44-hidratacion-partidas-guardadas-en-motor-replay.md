# 44: Hidratación de Partidas Pre-guardadas en el Motor para Reproducción Animada

**What to build:** Implementar el servicio/helper de hidratación que toma un `SavedAnnotatedMatchRecord` proveniente de `IChessLibraryRepository` (con su disposición inicial opcional y secuencia de movimientos `MoveRecord[]`) y reconstruye la partida completa sobre una instancia de `ChessGame`, dejándola lista con todo su historial reversible (`undo` / `redo`) para ser recorrida paso a paso por el reproductor animado existente (`useMatchReplay`).

**Blocked by:** `27-reproductor-replay-y-controles-transporte`, `37-puerto-biblioteca-y-adaptador-json`

**Branch:** `ticket/44-hidratacion-partidas-guardadas-en-motor-replay`

**Status:** Done

## Acceptance Criteria

- [x] La función de hidratación instancia `ChessGame` (desde tablero estándar o desde la disposición personalizada del registro) y ejecuta en orden cada movimiento de la partida guardada (incluyendo coronaciones y enroques).
- [x] Una vez hidratada la partida y rebobinada al inicio (`currentMoveIndex === 0`), cada llamada a `redo()` avanza exactamente una jugada restaurando el estado del tablero y las casillas activas `from -> to`.
- [x] Se añaden pruebas unitarias AAA en memoria verificando la hidratación de partidas precargadas, el rebobinado completo al inicio y el avance paso a paso hasta el desenlace.
