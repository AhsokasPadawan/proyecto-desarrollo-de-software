# 36: Integración en la UI: Tarjetas de Feedback, Replay y Exportación

**What to build:** Conectar toda la experiencia de usuario de análisis en la aplicación web (`ChessApp`):
1. Botón "Pedir sugerencia" en `GameActionBar` durante la partida activa, resaltando casillas en el tablero y mostrando `CoachFeedbackCard`.
2. Botón "Analizar Partida (IA)" disponible al finalizar la partida (`isTerminalState`), con barra de progreso durante el análisis y transición automática al modo repetición.
3. Componente `CoachFeedbackCard` para mostrar la jugada realizada vs la óptima recomendada, pérdida de evaluación y explicación didáctica del Coach.
4. Integración en `MoveHistoryTable` mostrando insignias visuales por movimiento analizado.
5. Resaltado en el tablero de las casillas de la mejor jugada técnica recomendada durante la revisión de repetición.
6. Actualización de `transcriptionFormatter` para exportar en el archivo `.txt` las precisiones, insignias y comentarios de la IA.

**Blocked by:** `35-coordinador-analisis-y-modal-configuracion-api`, `27-reproductor-replay-y-controles-transporte`

**Branch:** `ticket/36-integracion-ui-tarjetas-feedback-replay-y-exportacion`

**Status:** done

## Acceptance Criteria

- [x] Se añade el botón "Pedir sugerencia" en `GameActionBar` cuando la partida está activa, mostrando feedback en vivo y resaltando origen/destino.
- [x] Se añade el botón "Analizar Partida (IA)" en `GameActionBar` restringido a partidas finalizadas (`isTerminalState`).
- [x] Se implementa `CoachFeedbackCard` soportando estados de carga con barra de progreso, sugerencia en vivo, jugada analizada y resumen final.
- [x] `MoveHistoryTable` renderiza la columna con insignias de calidad de movimiento.
- [x] Durante la repetición con análisis, el tablero resalta la mejor jugada recomendada por el motor.
- [x] Al exportar la partida mediante `formatMatchTranscription`, el archivo `.txt` incluye las precisiones de cada color y el informe del Coach de IA.
- [x] Se añaden pruebas de componentes en `tests/adapters/CoachFeedbackCard.test.tsx` y se verifican los 283 tests del proyecto.
