# 06: Regla de Salto (`LeapMoveRule`) y Clases `Knight` y `King`

**What to build:** Implementar la estrategia componible `LeapMoveRule` parametrizada por desplazamientos discretos de un salto y las clases nominales `Knight` (8 desplazamientos en $L$) y `King` (8 desplazamientos unitarios adyacentes).

**Blocked by:** `03-contratos-pieza-y-setup-estandar`

**Branch:** `ticket/06-regla-salto-caballo-y-rey`

**Status:** Done

## Acceptance Criteria

- [x] `LeapMoveRule` evalúa cada vector `(dRow, dCol)` desde `from`, incluyendo el destino si `board.isWithinBounds` es verdadero y la casilla está vacía u ocupada por una pieza rival.
- [x] `Knight` ignora cualquier pieza propia o enemiga en las casillas adyacentes intermedias (salto limpio).
- [x] `King` reutiliza `LeapMoveRule` con los 8 vectores de distancia 1 sin duplicar lógica de validación de destino.
- [x] Suite de tests unitarios **AAA** en memoria verificando `Knight` y `King` en el centro, en esquinas del tablero, rodeados de piezas propias y capturando piezas rivales.
