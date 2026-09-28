# 16: Condición de Tablas por Triple Repetición de Posición

**What to build:** Implementar la detección de tablas por **Triple Repetición de Posición** generando una clave determinista de estado (ocupación de casillas + color de turno activo) y transicionando a `DrawState` cuando una misma clave aparece por tercera vez en la partida, sincronizada con `undo()` y `redo()`.

**Blocked by:** `14-state-jaque-mate-y-ahogado`

**Branch:** `ticket/16-tablas-triple-repeticion`

**Status:** ready-for-agent

## Acceptance Criteria

- [ ] Se registra la firma del estado tras cada jugada; cuando la misma disposición de piezas y turno activo ocurre por 3ra vez (consecutiva o alternada), la partida transiciona a `DrawState`.
- [ ] Ejecutar `undo()` decrementa el conteo de la posición revertida y restaura la partida al estado activo previo.
- [ ] Suite de tests unitarios **AAA** en memoria verificando secuencias de repetición triple y deshacer la tercera repetición con `undo()`.
