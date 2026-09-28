# 02: Entidad Mutable `Board` e Interfaz de Consulta `IBoardQuery`

**What to build:** Implementar la entidad mutable `Board` y su interfaz segregada de solo lectura `IBoardQuery` con dimensiones parametrizables por constructor `(rows = 8, cols = 8)`, validación dinámica de bordes `isWithinBounds(position)` y operaciones para colocar, consultar, mover y retirar piezas en memoria.

**Blocked by:** `01-scaffolding-y-position`

**Branch:** `ticket/02-board-mutable-y-board-query`

**Status:** ready-for-agent

## Acceptance Criteria

- [ ] `IBoardQuery` declara únicamente métodos de consulta sin efectos colaterales (`rows`, `cols`, `isWithinBounds`, `getPieceAt`, `isEmpty`, `findKingPosition`, listado de piezas por color).
- [ ] `Board` implementa `IBoardQuery`, se instancia por defecto en $8 \times 8$ pero acepta cualquier dimensión positiva `(rows, cols)` (ej. $10 \times 10$ o $6 \times 6$).
- [ ] `placePiece`, `removePiece` y `movePiece(from, to)` mutan la grilla *in-place* y devuelven la pieza retirada/capturada cuando corresponde.
- [ ] Suite de tests unitarios **AAA** en memoria verificando `isWithinBounds` en tableros de $8 \times 8$ y $N \times M$, colocación, movimiento, captura y búsqueda de `King`.
