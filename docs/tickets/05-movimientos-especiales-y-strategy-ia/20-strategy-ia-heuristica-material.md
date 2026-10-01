# 20: Estrategia Heurística de Captura y Material (`GreedyMaterialAiStrategy`)

**What to build:** Implementar una segunda estrategia intercambiable `GreedyMaterialAiStrategy` (`IAiStrategy`) que puntúa cada `Legal Move` candidato utilizando una *lookup table* de valor de piezas (`PAWN: 100`, `KNIGHT: 300`, `BISHOP: 300`, `ROOK: 500`, `QUEEN: 900`) y bonificación por dar jaque/jaque mate, eligiendo la jugada de mayor ganancia inmediata.

**Blocked by:** `19-patron-strategy-ia-aleatoria`

**Branch:** `ticket/20-strategy-ia-heuristica-material`

**Status:** done

## Acceptance Criteria

- [x] Evalúa los `Legal Move`s disponibles priorizando jugadas que dan jaque mate o capturan la pieza enemiga de mayor valor según la *lookup table* de material (con valor *fallback* por defecto para piezas de *Fairy Chess*).
- [x] Es intercambiable en tiempo de ejecución con `RandomAiStrategy` detrás de la misma interfaz `IAiStrategy` sin modificar `ChessGame`.
- [x] Suite de tests unitarios **AAA** en memoria demostrando que ante múltiples opciones de captura o mate en 1, `GreedyMaterialAiStrategy` selecciona consistentemente la captura de mayor valor o el jaque mate.
