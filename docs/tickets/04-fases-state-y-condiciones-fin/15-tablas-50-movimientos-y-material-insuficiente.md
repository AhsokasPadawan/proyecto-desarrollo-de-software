# 15: Condiciones de Tablas por Regla de los 50 Movimientos y Material Insuficiente

**What to build:** Implementar `DrawState` y los evaluadores de tablas por **Regla de los 50 Movimientos** (100 medios turnos consecutivos sin captura ni avance de `Pawn`) y por **Material Insuficiente** (`King` vs `King`, `King + Bishop` vs `King`, `King + Knight` vs `King`), manteniendo el contador de medios turnos reversible con `undo()` / `redo()`.

**Blocked by:** `14-state-jaque-mate-y-ahogado`

**Branch:** `ticket/15-tablas-50-movimientos-y-material-insuficiente`

**Status:** ready-for-agent

## Acceptance Criteria

- [ ] El contador de medios turnos (`halfMoveClock`) se reinicia a `0` en cada movimiento de `Pawn` o captura, se incrementa en `+1` en cualquier otra jugada y restaura su valor exacto al ejecutar `undo()`.
- [ ] Al alcanzar 100 medios turnos sin captura ni movimiento de peón, la partida transiciona automáticamente a `DrawState`.
- [ ] Si tras una captura solo quedan en el tablero combinaciones sin material de mate posible (`K vs K`, `K+B vs K`, `K+N vs K`), la partida transiciona a `DrawState`.
- [ ] Suite de tests unitarios **AAA** en memoria probando ambos criterios de tablas y su reversión con `undo()`.
