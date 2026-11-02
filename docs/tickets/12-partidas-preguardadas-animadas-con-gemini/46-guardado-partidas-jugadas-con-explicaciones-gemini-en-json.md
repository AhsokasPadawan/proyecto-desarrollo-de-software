# 46: Guardado de Partidas Jugadas con Explicaciones de Gemini en la Base JSON

**What to build:** Habilitar al finalizar y analizar cualquier partida (clásica o de estudio) con `AnalysisService` / `GeminiCoachService` la acción **"Guardar en Partidas Comentadas"**. Permite al usuario asignar un título y descripción a la partida y persistirla mediante `IChessLibraryRepository.saveAnnotatedMatch` en `chess-library.json` (incluyendo todos los movimientos y las explicaciones generadas por Gemini), quedando disponible en el catálogo para reproducirla animadamente cuantas veces quiera.

**Blocked by:** `45-catalogo-ui-partidas-comentadas-y-reproduccion-gemini`

**Branch:** `ticket/46-guardado-partidas-jugadas-con-explicaciones-gemini-en-json`

**Status:** Done

## Acceptance Criteria

- [x] Cuando una partida cuenta con análisis del Coach de IA (`analysisResult`), se muestra la opción **"Guardar en Partidas Comentadas"** con campos de título y descripción breve.
- [x] Si una partida se guarda desde el modo revisión sin haber ejecutado previamente el análisis, permite invocar `AnalysisService.analyzeFullGame` para obtener las explicaciones de Gemini antes de persistirla en `IChessLibraryRepository`.
- [x] Al confirmar el guardado, se invoca `saveAnnotatedMatch` y la partida aparece en el catálogo de **"Partidas Comentadas"** lista para reproducirse con su animación y explicaciones de Gemini.
- [x] Se añaden pruebas de integración con React Testing Library verificando el flujo completo: analizar una partida con el servicio de IA, guardarla en el repositorio inyectado y cargarla desde el catálogo de partidas comentadas.
