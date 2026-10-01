# 04: Servicio de Detección de Amenazas (`CheckDetector`)

**What to build:** Implementar el servicio de dominio sin estado `CheckDetector` que opera sobre `IBoardQuery` para determinar tanto si una coordenada específica está bajo ataque por el ejército rival (`isSquareAttacked`) como si el `King` de un color dado se encuentra en jaque directo (`isKingInCheck`).

**Blocked by:** `03-contratos-pieza-y-setup-estandar`

**Branch:** `ticket/04-detector-de-amenazas-check-detector`

**Status:** Done

## Acceptance Criteria

- [x] `isSquareAttacked(board: IBoardQuery, target: Position, byColor: Color): boolean` verifica si alguna pieza de `byColor` en el tablero incluye `target` dentro de sus `Pseudo-Legal Move`s.
- [x] `isKingInCheck(board: IBoardQuery, kingColor: Color): boolean` localiza la posición del `King` de `kingColor` y evalúa si está atacada por el color opuesto (usando una *lookup table* `OPPOSITE_COLOR`).
- [x] Si un tablero de prueba no contiene un `King` de ese color, `isKingInCheck` retorna `false` de forma segura sin lanzar excepciones.
- [x] Suite de tests unitarios **AAA** en memoria validando amenazas directas, amenazas bloqueadas por otra pieza intermedia y ausencia de jaque.
