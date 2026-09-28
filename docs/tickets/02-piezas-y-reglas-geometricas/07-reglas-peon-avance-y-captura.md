# 07: Reglas de Peón (`PawnForwardRule`, `PawnCaptureRule`) y Clase `Pawn`

**What to build:** Implementar las estrategias atómicas `PawnForwardRule` (avance frontal simple y doble desde fila inicial sin captura según `Color`) y `PawnCaptureRule` (captura exclusiva en las dos diagonales frontales), componiéndolas en la clase nominal `Pawn`.

**Blocked by:** `03-contratos-pieza-y-setup-estandar`

**Branch:** `ticket/07-reglas-peon-avance-y-captura`

**Status:** ready-for-agent

## Acceptance Criteria

- [ ] `PawnForwardRule` avanza con `deltaRow = +1` para `WHITE` y `deltaRow = -1` para `BLACK` (usando *lookup table* de dirección por color) únicamente si la casilla frontal inmediata está vacía y dentro del tablero.
- [ ] Si el `Pawn` está en su fila inicial (`row === 1` para `WHITE` o `row === board.rows - 2` para `BLACK`) y tanto la primera como la segunda casilla frontal están vacías, `PawnForwardRule` incluye el avance doble de 2 casillas.
- [ ] `PawnCaptureRule` habilita las diagonales `(forwardDelta, -1)` y `(forwardDelta, +1)` exclusivamente cuando contienen una pieza del color oponente.
- [ ] Suite de tests unitarios **AAA** en memoria para peones `WHITE` y `BLACK` probando avance simple, salto doble inicial, bloqueo en primera o segunda casilla y capturas diagonales.
