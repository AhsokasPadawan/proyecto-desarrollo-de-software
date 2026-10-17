# Especificación Funcional y Técnica — Épica 9: Análisis Híbrido con Motor y Coach de IA (Stockfish + Gemini)

* **Estado:** `ready-for-agent`
* **Épica:** `09-analisis-hibrido-stockfish-y-gemini`
* **Tickets:** `33..36`

---

## Problem Statement

Los jugadores de ajedrez en la aplicación no disponen de una herramienta de retroalimentación táctica o didáctica que les permita entender sus errores o encontrar mejores jugadas. Los motores de cálculo tradicionales como Stockfish brindan evaluaciones numéricas y variantes en notación UCI frías e incomprensibles para principiantes o jugadores intermedios, mientras que los modelos de lenguaje (LLMs) por sí solos sufren alucinaciones tácticas y sugieren jugadas ilegales si se les pide calcular variantes directamente. El usuario necesita una solución que combine la certeza táctica de un motor de cálculo con explicaciones pedagógicas y motivadoras en lenguaje natural, tanto bajo demanda durante la partida como en una revisión exhaustiva paso a paso al finalizar la misma.

---

## Solution

Construir una arquitectura híbrida desacoplada compuesta por:
1. **Serializador FEN:** Conversión en el dominio desde `GameSnapshot` hacia notación estándar Forsyth-Edwards (FEN) que incluya piezas, turno, derechos de enroque, peón al paso y reloj de medio turno.
2. **Servicio del Motor Táctico (Stockfish REST):** Conexión HTTP contra la API REST de `chess-api.com` para obtener la mejor jugada técnica (`bestMove`), evaluación objetiva en peones (`eval`), mate y cálculo profundo.
3. **Servicio de Coach de IA (Google Gemini Flash):** Conexión con Gemini API (`gemini-2.5-flash`) estructurada en dos modalidades:
   * **En vivo (bajo demanda):** Explicación didáctica de 2-3 oraciones sobre por qué la jugada recomendada por el motor es óptima.
   * **Post-partida por lote (Batch):** En una sola llamada HTTP con esquema JSON estructurado se transmiten todas las evaluaciones de la partida y se reciben explicaciones por turno más un resumen general de desempeño (evitando saturar el límite de 15 peticiones/minuto del tier gratuito).
4. **Clasificador de Calidad de Movimiento:** Evaluación de la pérdida de evaluación por turno mediante una lookup table que categoriza las jugadas en insignias (*Mejor jugada*, *Excelente*, *Buena*, *Imprecisión*, *Error*, *Blunder*).
5. **Experiencia de Usuario Integrada:**
   * Modal de configuración en la interfaz para ingresar la clave de Gemini en `localStorage` con fallback a `VITE_GEMINI_API_KEY` en `.env`.
   * Botón *"Pedir sugerencia"* durante la partida activa con resaltado en el tablero de las casillas origen/destino recomendadas.
   * Botón *"Analizar Partida (IA)"* al finalizar con barra de progreso que activa el visor de repetición.
   * Tarjeta didáctica en el panel de control con jugada realizada vs óptima, evaluación y consejo de Gemini.
   * Columna de insignias en la tabla del historial de movimientos.
   * Inclusión de las estadísticas de precisión, etiquetas y consejos del Coach en el archivo `.txt` de transcripción exportado.

---

## User Stories

1. Como jugador durante una partida, quiero presionar el botón "Pedir sugerencia" para obtener la jugada recomendada por el motor y una explicación didáctica en lenguaje natural generada por Gemini sin abandonar el tablero.
2. Como jugador durante una partida, quiero que al solicitar una sugerencia se resalten visualmente las casillas de origen y destino en el tablero para visualizar la jugada con claridad.
3. Como jugador al terminar una partida (jaque mate, tablas, timeout), quiero presionar "Analizar Partida (IA)" para evaluar exhaustivamente cada movimiento efectuado en la partida con el motor táctico.
4. Como jugador, quiero ver una barra de progreso que refleje el avance del análisis paso a paso mientras se evalúan las posiciones.
5. Como jugador en la revisión post-partida, quiero navegar por las jugadas en el modo repetición y ver en una tarjeta interactiva la jugada que hice, la mejor jugada técnica recomendada por el motor, la pérdida de evaluación y el consejo del Coach de IA.
6. Como jugador en la revisión post-partida, quiero ver el tablero resaltando la jugada óptima sugerida por el motor para comparar visualmente mi error con la alternativa correcta.
7. Como jugador en la revisión post-partida, quiero ver insignias visuales (Mejor jugada, Excelente, Buena, Imprecisión, Error, Blunder) en la tabla del historial para identificar rápidamente en qué turnos se cometieron fallos críticos.
8. Como jugador, quiero ver un resumen general de desempeño al concluir la partida con los porcentajes de precisión de Blancas y Negras calculados en base a la calidad de sus movimientos.
9. Como usuario o evaluador, quiero poder ingresar mi API Key de Gemini desde un modal en la barra superior y persistirla en `localStorage` (o leerla desde `VITE_GEMINI_API_KEY` en `.env`) para activar las explicaciones didácticas sin necesidad de recompilar.
10. Como jugador, quiero que al exportar la partida a archivo de texto (.txt) se incorporen las precisiones de ambos bandos, las insignias de cada jugada y las conclusiones del entrenador de IA.

---

## Implementation Decisions

* **Serialización FEN en el Core (`FenSerializer`):** Función pura encargada de traducir `GameSnapshot` a formato FEN estándar de 6 campos sin dependencias externas.
* **Desacoplamiento e Inversión de Dependencias (SOLID DIP & ISP):**
  * Contrato `IChessEngine` implementado por `ChessApiService` (fácilmente sustituible por Stockfish local/WASM u otro motor UCI/REST).
  * Contrato `IAiCoachEngine` implementado por `GeminiCoachService` (fácilmente sustituible por OpenAI, Claude, DeepSeek u Ollama local).
  * Contrato `IAnalysisService` implementado por `AnalysisService`, desacoplando la aplicación web de implementaciones concretas.
  * Inyección en `AnalysisService` mediante abstracciones `chessEngine: IChessEngine` y `aiCoachEngine: IAiCoachEngine` con valores por defecto.
* **Modelo Cohesivo de Resultado (`FullGameAnalysisResult`):**
  * Agrupación de `analyzedMoves`, `overallSummary`, `whiteAccuracy` y `blackAccuracy` en una sola estructura para evitar *Data Clumps*.
* **Lookup Tables y Cero Switch:** Clasificación de calidad de movimiento mediante `MOVE_QUALITY_LOOKUP` y funciones matemáticas de rango continuo de pérdida de peones.
* **Cero useEffect para Flujo Secundario:** Todas las acciones de disparo de análisis, sugerencia y persistencia se gestionan estrictamente en handlers de eventos (`onClick`).

---

## Testing Decisions

* **Pruebas Unitarias del Serializador FEN:** Validación de posición inicial estándar, avances de peón con peón al paso, pérdida de derechos de enroque y avance del reloj de 50 movimientos.
* **Pruebas del Servicio de Análisis:** Uso de mocks (`vi.fn()`) para simular respuestas HTTP de `chess-api.com` y Gemini, verificando el cálculo de precisiones, asignación de insignias y manejo de partidas vacías.
* **Pruebas de Componentes (React Testing Library):**
  * `CoachFeedbackCard`: Verificación de estados de carga, sugerencia en vivo, jugada analizada, resumen general y botón de invitación.
  * `ApiKeyModal`: Verificación de renderizado condicional, persistencia en `localStorage` y actualización dinámica del servicio.
  * `transcriptionFormatter`: Verificación de formato con y sin análisis de IA.

---

## Out of Scope

* Ejecución de modelos locales offline de gran tamaño (pesos de LLM en el cliente).
* Soporte de análisis de motor para piezas no estándar de *Fairy Chess* en `chess-api.com` (Stockfish estándar sólo evalúa ajedrez tradicional de 8x8).
* Base de datos persistente en servidor para almacenar historiales de partidas.

---

## Further Notes

* El uso de una única llamada por lote (Batch) a Gemini para toda la partida previene el error HTTP 429 asociado al límite de 15 RPM en el plan gratuito de Google AI Studio.
