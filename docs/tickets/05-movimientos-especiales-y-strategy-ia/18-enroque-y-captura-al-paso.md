# 18: Enroque (*Castling*) y Captura al Paso (*En Passant*) Reversibles

**What to build:** Implementar las reglas componibles para **Enroque corto y largo (*Castling*)** y **Captura al Paso (*En Passant*)** y su soporte de ejecución/reversión en `MoveCommand` (desplazando y restaurando simultáneamente el `Rook` en el enroque o el `Pawn` capturado al paso).

**Blocked by:** `11-filtrado-movimientos-legales-y-clavadas`

**Branch:** `ticket/18-enroque-y-captura-al-paso`

**Status:** ready-for-agent

## Acceptance Criteria

- [ ] El Enroque se habilita únicamente si ni el `King` ni el `Rook` correspondiente se han movido previamente, las casillas entre ambos están vacías, el `King` no está actualmente en jaque y la casilla de paso ni la de destino están atacadas (`CheckDetector.isSquareAttacked`).
- [ ] La Captura al Paso (`EnPassantCaptureRule` compuesta en `Pawn`) se habilita únicamente en el turno inmediato posterior a que un `Pawn` rival haya ejecutado un avance doble inicial quedando adyacente en la misma fila.
- [ ] `MoveCommand.undo()` revierte tanto la posición del `King` y del `Rook` tras un enroque como el `Pawn` capturado en su casilla real tras un *en passant*, restaurando los derechos previos.
- [ ] Suite de tests unitarios **AAA** en memoria cubriendo enroque corto/largo, bloqueo de enroque bajo ataque, captura al paso válida, caducidad de *en passant* al turno siguiente y reversión `undo()`.
