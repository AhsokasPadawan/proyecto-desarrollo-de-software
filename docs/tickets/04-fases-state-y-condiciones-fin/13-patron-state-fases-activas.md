# 13: Patrón `State` (`IGameState`) para Fases Activas (`NormalPlayState` y `CheckState`)

**What to build:** Implementar el contrato del patrón `State` (`IGameState`) y las clases concretas de fases activas `NormalPlayState` (`IN_PROGRESS`) y `CheckState` (`CHECK`), resolviendo las transiciones polimórficas mediante una *lookup table* sin bloques `switch`.

**Blocked by:** `11-filtrado-movimientos-legales-y-clavadas`

**Branch:** `ticket/13-patron-state-fases-activas`

**Status:** ready-for-agent

## Acceptance Criteria

- [ ] `IGameState` define `kind: GameStateKind`, `canAcceptMoves(): boolean` y el contrato de evaluación de transición hacia el siguiente estado.
- [ ] Cuando una jugada deja al `King` del jugador entrante bajo amenaza (`isKingInCheck === true`) y dicho jugador posee al menos un `Legal Move`, la partida transiciona a `CheckState`.
- [ ] Cuando el jugador entrante resuelve el jaque en el turno siguiente, la partida transiciona de vuelta a `NormalPlayState`.
- [ ] Suite de tests unitarios **AAA** en memoria verificando transiciones `IN_PROGRESS` $\rightarrow$ `CHECK` $\rightarrow$ `IN_PROGRESS` tanto al avanzar como al deshacer con `undo()`.
