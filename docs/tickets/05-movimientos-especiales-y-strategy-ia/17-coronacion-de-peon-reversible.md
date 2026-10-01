# 17: Coronación de Peón (*Pawn Promotion*) Reversible con `Command`

**What to build:** Implementar la promoción de `Pawn` al alcanzar la fila de coronación (`row === board.rows - 1` para `WHITE`, `row === 0` para `BLACK`), reemplazando el peón por la pieza promovida (`Queen`, `Rook`, `Bishop` o `Knight`, por defecto `Queen`) dentro de `MoveCommand` de manera 100% reversible al ejecutar `undo()`.

**Blocked by:** `11-filtrado-movimientos-legales-y-clavadas`

**Branch:** `ticket/17-coronacion-de-peon-reversible`

**Status:** done

## Acceptance Criteria

- [x] Cuando un `Pawn` mueve o captura hacia la última fila del tablero, es reemplazado en la casilla destino por una instancia del `PieceType` de coronación elegido (por defecto `QUEEN` usando una *lookup table* de constructores de pieza).
- [x] Al ejecutar `undo()`, la pieza promovida se retira, el `Pawn` original vuelve a su casilla previa y cualquier pieza capturada en la coronación es restaurada ($\text{State}_{\text{before}} \equiv \text{State}_{\text{Act(Undo)}}$).
- [x] Si la nueva pieza promovida amenaza al `King` rival, el estado de la partida transiciona inmediatamente a `CheckState` o `CheckmateState`.
- [x] Suite de tests unitarios **AAA** en memoria validando coronación con avance, coronación con captura, jaque inmediato tras coronar y reversión con `undo()`.
