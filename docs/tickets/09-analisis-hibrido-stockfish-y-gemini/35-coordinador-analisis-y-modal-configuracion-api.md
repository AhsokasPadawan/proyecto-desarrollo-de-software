# 35: Coordinador de Análisis y Modal de Configuración de API Key

**What to build:** Implementar el contrato `IAnalysisService` y su clase orquestadora `AnalysisService` desacoplada mediante las interfaces `IChessEngine` y `IAiCoachEngine` (con valores por defecto `ChessApiService` y `GeminiCoachService`), reconstruyendo la partida turno a turno con el `engineFactory` parametrizable, calculando el puntaje de precisión de ambos bandos y devolviendo el objeto cohesivo `FullGameAnalysisResult`. Crear además el componente visual `ApiKeyModal` accesible desde `AppHeader` para permitir a usuarios y evaluadores ingresar o eliminar su clave de Gemini con persistencia en `localStorage`.

**Blocked by:** `34-servicio-gemini-coach-y-evaluador-calidad-jugada`

**Branch:** `ticket/35-coordinador-analisis-y-modal-configuracion-api`

**Status:** done

## Acceptance Criteria

- [x] Se define el contrato `IAnalysisService` y se implementa en `AnalysisService`.
- [x] `AnalysisService` depende de las abstracciones `chessEngine: IChessEngine` y `aiCoachEngine: IAiCoachEngine`.
- [x] Se implementa `AnalysisService.analyzeFullGame` orquestando la evaluación secuencial de FENs y la revisión del coach de IA.
- [x] Se implementa `AnalysisService.getLiveHint` para solicitar la mejor jugada y explicación en vivo.
- [x] Se calcula la precisión de Blancas y Negras en base al puntaje ponderado de calidad de sus jugadas.
- [x] `analyzeFullGame` recibe `engineFactory` evitando acoplamientos rígidos con motores concretos.
- [x] Se crea `ApiKeyModal` con entrada de texto protegida, botón de guardado en `localStorage` y eliminación de clave.
- [x] Se añade botón de acceso al modal en `AppHeader` con indicador lumínico de estado de la clave (verde/ámbar).
- [x] Se añaden pruebas unitarias y de integración en `tests/adapters/AnalysisService.test.ts` y `tests/adapters/ApiKeyModal.test.tsx`.
