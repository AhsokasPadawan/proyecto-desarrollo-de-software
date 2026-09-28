# ADR-006: Objeto de Valor `Position` 0-Indexed y Límites Parametrizables en `Board`

* **Estado:** Aceptado
* **Fecha:** 2026-09-27

## 1. What (Qué decidimos)

1. **`Position`** se modela como un *Value Object* inmutable representado por coordenadas enteras 0-indexed `(row: number, col: number)`, donde por convención en el tablero estándar de $8 \times 8$:
   * `row = 0` corresponde a la fila inicial de las piezas Blancas (rango `1` algebraico) y `row = 7` a la fila inicial de las piezas Negras (rango `8` algebraico).
   * `col = 0` corresponde a la columna `'a'` y `col = 7` a la columna `'h'`.
   * Provee métodos puros de aritmética vectorial (`offset(deltaRow, deltaCol): Position`), igualdad por valor (`equals(other: Position): boolean`) y helpers de traducción algebraica (`fromAlgebraic`, `toAlgebraic`) para los adaptadores.
2. **Desacoplamiento de Límites (`Board`):** `Position` no restringe sus valores al rango `0..7`. En cambio, `Board` recibe sus dimensiones por constructor (`rows: number = 8, cols: number = 8`) y expone el método `isWithinBounds(position: Position): boolean`. Todas las reglas de movimiento (`IMovementRule`) consultan `board.isWithinBounds(target)` en lugar de asumir un tamaño fijo de $8 \times 8$.

## 2. Why (Por qué lo elegimos)

1. **Aritmética Vectorial Uniforme:** Las reglas de movimiento por rayos (`SlidingMoveRule`) y por saltos (`LeapMoveRule`) operan sumando vectores `(deltaRow, deltaCol)` directamente sobre enteros 0-indexed sin conversiones de cadenas o caracteres ASCII en el bucle interno del dominio.
2. **Cumplimiento de la Prueba de Estrés de Dimensiones (Open/Closed):** Al delegar la validación de bordes a `board.isWithinBounds(position)`, alterar el tamaño del tablero a $10 \times 10$, $6 \times 6$ o un tablero rectangular durante la defensa en vivo requiere únicamente instanciar `new Board(rows, cols)`, con cero modificaciones en `Position`, `IPiece` o `IMovementRule`.

## 3. When to Break (Cuándo reconsiderar o romper esta decisión)

Esta decisión debería revisarse si:
* El dominio debiera soportar tableros con topologías no rectangulares o grafos arbitrarios (por ejemplo, ajedrez hexagonal de Glinski o tableros cilíndricos/toroidales), en cuyo caso `Position` y la aritmética de desplazamientos deberían abstraerse detrás de un grafo de adyacencia de casillas (`IBoardTopology`) en lugar de una grilla cartesiana `(row, col)`.
