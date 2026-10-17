# 34: Servicio de Coach Gemini y Evaluador de Calidad de Jugadas

**What to build:** Definir el contrato `IAiCoachEngine` e implementar el servicio `GeminiCoachService` con integración a Google Gemini API (`gemini-2.5-flash`), permitiendo:
1. `requestLiveHint`: Generación de explicaciones motivadoras y pedagógicas en 2-3 oraciones sobre por qué la jugada calculada por el motor es óptima.
2. `requestBatchReview`: Generación en una única llamada por lote (modo JSON estructurado) del resumen global de la partida y los consejos por turno, evitando saturar cuotas de la API.
3. Gestión dinámica de la API Key con lectura desde `localStorage` y fallback a `VITE_GEMINI_API_KEY`.
Implementar además el clasificador de calidad de movimientos `moveQualityEvaluator` que asigna insignias según la pérdida de evaluación (`★ Mejor jugada`, `✓ Excelente`, `• Buena`, `?! Imprecisión`, `? Error`, `?? Blunder`).

**Blocked by:** `33-serializador-fen-y-servicio-motor-stockfish`

**Branch:** `ticket/34-servicio-gemini-coach-y-evaluador-calidad-jugada`

**Status:** done

## Acceptance Criteria

- [x] Se define el contrato `IAiCoachEngine` con `requestLiveHint`, `requestBatchReview` y `hasApiKey`.
- [x] Se implementa `GeminiCoachService implements IAiCoachEngine`.
- [x] Se implementa un getter dinámico para la clave de API permitiendo su actualización sin reiniciar la aplicación.
- [x] Se extrae un helper `extractCandidateText` para evitar encadenamientos de métodos y duplicación de código.
- [x] Se implementa `classifyMoveQuality` utilizando `MOVE_QUALITY_LOOKUP` con las 6 categorías reglamentarias.
- [x] Se manejan contingencias cuando no hay clave configurada o cuando la API no responde.
