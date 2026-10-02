# 32: Integración de Fin de Partida por Tiempo con Replay y Exportación de Transcripción

**What to build:** Integrar el evento de caída de bandera con el flujo de fin de partida:
1. Conectar la señal de `onTimeout` del reloj para invocar `engine.declareTimeout(color)`.
2. Actualizar `stateDisplayLookup` para traducir `'TIMEOUT'` a `"Tiempo Agotado — Victoria de [Blancas/Negras]"`.
3. Tratar `'TIMEOUT'` como estado terminal en `isTerminalState`, habilitando los botones "Revisar Partida" y "Exportar Partida".
4. En modo Replay, mantener visibles los relojes de ambos jugadores congelados con el tiempo final alcanzado al concluir la partida.
5. Actualizar `formatMatchTranscription` para registrar si la partida se jugó con reloj y reflejar la victoria por tiempo agotado en el archivo `.txt` exportable.

**Blocked by:** `31-componentes-visuales-reloj-e-integracion-tablero`

**Branch:** `ticket/32-integracion-timeout-replay-y-transcripcion`

**Status:** todo

## Acceptance Criteria

- [ ] Cuando expira el tiempo de un jugador, la partida finaliza automáticamente en `'TIMEOUT'` y el cartel de estado informa la victoria del rival por tiempo agotado.
- [ ] Los botones "Revisar Partida" y "Exportar Partida" se activan al finalizar la partida por tiempo.
- [ ] En modo Replay, los relojes de Blancas y Negras continúan mostrándose congelados con el tiempo remanente con el que concluyó el juego.
- [ ] `formatMatchTranscription` incluye en el encabezado la información del modo (`Humano vs Humano (Con Reloj)`) y el resultado de victoria por caída de bandera.
- [ ] Se añaden pruebas de integración end-to-end en `tests/adapters/ChessApp.test.tsx` y pruebas de serialización en `tests/adapters/transcriptionFormatter.test.ts`.
