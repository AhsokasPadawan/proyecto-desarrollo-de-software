# 45: Catálogo UI de Partidas Comentadas y Reproducción Animada con Explicaciones de Gemini

**What to build:** Construir la vista **"Partidas Comentadas"** conectada a `IChessLibraryRepository.getAnnotatedMatches()`. Al seleccionar una partida pre-guardada de la lista, se hidrata en el motor, se activa automáticamente el reproductor animado (`useMatchReplay` + `ReplayControlSection`) y, a medida que la animación muestra cada jugada en el tablero, `CoachFeedbackCard` presenta la explicación didáctica de Gemini de por qué se realizó ese movimiento.

**Blocked by:** `36-integracion-ui-tarjetas-feedback-replay-y-exportacion`, `39-editor-visual-tablero-y-paleta-piezas`, `44-hidratacion-partidas-guardadas-en-motor-replay`

**Branch:** `ticket/45-catalogo-ui-partidas-comentadas-y-reproduccion-gemini`

**Status:** Done

## Acceptance Criteria

- [x] Al seleccionar **"Partidas Comentadas"** en `AppHeader`, el panel muestra la lista de partidas pre-guardadas obtenidas de `IChessLibraryRepository` con su título, descripción y cantidad de jugadas.
- [x] Al elegir una partida de la lista, el sistema hidrata la partida junto con su `FullGameAnalysisResult`, activa el modo de reproducción animada y resalta en el tablero cada movimiento.
- [x] Conforme avanza la animación (con `Play` automático o con los botones `<` / `>` y la tabla de historial), `CoachFeedbackCard` muestra sincrónicamente la explicación de Gemini correspondiente al turno actual (`analyzedMoves[currentMoveIndex - 1]`).
- [x] Se incluyen pruebas de integración con React Testing Library verificando que al abrir una partida comentada y avanzar jugadas en el reproductor se actualizan el tablero y la explicación de Gemini en pantalla.
