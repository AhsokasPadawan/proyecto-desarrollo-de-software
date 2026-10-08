# 25: Modelo de Dominio de Historial de Jugadas (`MoveRecord`) y Exposición en `GameSnapshot`

**What to build:** Extender el Core para registrar cada jugada exitosa en una estructura inmutable `MoveRecord` y exponer la colección acumulada `moveHistory: readonly MoveRecord[]` dentro del contrato `GameSnapshot`. Cada registro debe contener el índice secuencial del medio-movimiento, color/turno, tipo de pieza movida, coordenadas origen y destino en formato algebraico letra-número (calculadas con `Position.toAlgebraic()`), pieza capturada opcional, e indicadores de enroque y coronación. La lista debe sincronizarse adecuadamente al ejecutar `undo()` y `redo()`.

**Blocked by:** `12-patron-observer-y-game-snapshot`, `23-panel-control-historial-y-selector-ia`

**Branch:** `ticket/25-modelo-dominio-historial-moverecord`

**Status:** done

## Acceptance Criteria

- [x] Se define el tipo/interfaz `MoveRecord` en `proyect/src/core/ports/GameSnapshot.ts` con tipado estricto e inmutable (`readonly`).
- [x] `MoveCommand` o `ChessGame` registra la metadata de cada movimiento exitoso, transformando las posiciones origen y destino a formato algebraico letra-número mediante `Position.toAlgebraic()`.
- [x] `GameSnapshot` incluye la propiedad `moveHistory: readonly MoveRecord[]` y es emitido a todos los observadores en cada cambio de estado.
- [x] Al invocar `engine.undo()`, el historial de jugadas activas del snapshot se sincroniza coherentemente con la posición temporal del tablero, y al invocar `engine.redo()` se restaura.
- [x] Se agregan tests unitarios aislados en el Core verificando la creación de `MoveRecord`, precisión de coordenadas y comportamiento ante `undo`/`redo`.
