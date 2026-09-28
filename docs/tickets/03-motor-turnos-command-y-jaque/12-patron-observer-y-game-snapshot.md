# 12: Patrón `Observer` (`IGameObserver`) con `unsubscribe` y Emisión de `GameSnapshot`

**What to build:** Implementar el mecanismo de suscripción `Observer` en `ChessGame` (`subscribe`, `unsubscribe`) con rutina explícita de *teardown* y el método `getSnapshot(): GameSnapshot` que construye una vista inmutable del estado de la partida.

**Blocked by:** `10-ejecucion-turnos-capturas-y-moveresult`

**Branch:** `ticket/12-patron-observer-y-game-snapshot`

**Status:** ready-for-agent

## Acceptance Criteria

- [ ] `getSnapshot()` retorna una referencia inmutable `GameSnapshot` con dimensiones, grilla de casillas (`{ type, color } | null`), `currentTurn`, `stateKind`, `winner`, `canUndo` y `canRedo` sin exponer referencias mutables internas de `Board`.
- [ ] `subscribe(observer)` registra al observador y retorna una función de limpieza `UnsubscribeFn` que delega en `unsubscribe(observer)`.
- [ ] Todos los observadores activos reciben el nuevo `GameSnapshot` automáticamente cuando `makeMove` tiene éxito, o cuando `undo()` / `redo()` revierten o rehacen una jugada.
- [ ] Suite de tests unitarios **AAA** en memoria con dobles de prueba (*mocks/spies*) verificando notificaciones en jugadas, ausencia de notificación en jugadas rechazadas y limpieza efectiva tras `unsubscribe`.
