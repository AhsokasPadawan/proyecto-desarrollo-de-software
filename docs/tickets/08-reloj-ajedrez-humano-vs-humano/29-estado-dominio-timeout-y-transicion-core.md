# 29: Estado de Dominio `TIMEOUT` y Métodos de Transición por Tiempo en el Core

**What to build:** Extender la máquina de estados y puertos del Core para incorporar el estado terminal `'TIMEOUT'` en `GameStateKind`. Implementar en el motor `ChessGame` el método de dominio `declareTimeout(timedOutColor: Color)` que transiciona la partida a `'TIMEOUT'` y fija como `winner` al color oponente. Garantizar que tras la caída de bandera la partida sea rechazada ante nuevos movimientos con motivo `GAME_OVER` y que el snapshot emitido a los observadores refleje el estado terminal y el ganador reglamentario.

**Blocked by:** `09-patron-state-fases-de-partida`, `12-patron-observer-y-game-snapshot`

**Branch:** `ticket/29-estado-dominio-timeout-y-transicion-core`

**Status:** todo

## Acceptance Criteria

- [ ] Se añade el valor literal `'TIMEOUT'` al tipo `GameStateKind` en `src/core/ports/MoveResult.ts`.
- [ ] Se implementa en `ChessGame` el método de dominio `declareTimeout(timedOutColor: Color): GameSnapshot`.
- [ ] Al declarar el timeout, el estado interno transiciona a `TIMEOUT`, se asigna el ganador correspondiente (si Blancas agota tiempo gana Negras, y viceversa), y se notifica el snapshot actualizado a los observadores.
- [ ] Ningún movimiento posterior es permitido una vez transicionado a `TIMEOUT`, retornando `{ success: false, reason: 'GAME_OVER' }`.
- [ ] Se crean pruebas unitarias exhaustivas en `tests/core/TimeoutLoss.test.ts` verificando la transición, el ganador opuesto y la inviolabilidad del estado terminal.
