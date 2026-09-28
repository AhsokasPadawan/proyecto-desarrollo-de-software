# 19: Patrón `Strategy` para Jugador Automatizado (`IAiStrategy` y `RandomAiStrategy`)

**What to build:** Definir el contrato del patrón `Strategy` (`IAiStrategy`) para oponentes automatizados e implementar `RandomAiStrategy` que selecciona un movimiento válido entre todos los `Legal Move`s disponibles para el color activo consumiendo `IGameEngine`.

**Blocked by:** `11-filtrado-movimientos-legales-y-clavadas`

**Branch:** `ticket/19-patron-strategy-ia-aleatoria`

**Status:** ready-for-agent

## Acceptance Criteria

- [ ] `IAiStrategy` declara `chooseMove(engine: IGameEngine): { from: Position; to: Position } | null`.
- [ ] `RandomAiStrategy` recopila todas las piezas del color `currentTurn` con al menos un `Legal Move` y selecciona una jugada válida (permitiendo inyectar una función generadora de números aleatorios opcional por constructor para que los tests sean $100\%$ deterministas).
- [ ] Retorna `null` cuando la partida está en un estado terminal o no existen movimientos legales.
- [ ] Suite de tests unitarios **AAA** en memoria verificando que la jugada elegida siempre es aceptada por `engine.makeMove` y que bajo jaque solo elige jugadas que salven al `King`.
