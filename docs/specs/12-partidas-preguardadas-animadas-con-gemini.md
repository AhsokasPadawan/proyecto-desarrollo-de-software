# Especificación Funcional y Técnica — Épica 12: Partidas Pre-guardadas con Reproducción Animada y Explicaciones de Gemini

* **Estado:** `ready-for-agent`
* **Épica:** `12-partidas-preguardadas-animadas-con-gemini`
* **Tickets:** `44..46`

---

## Problem Statement

El sistema cuenta con un reproductor animado de partidas (`useMatchReplay` y `ReplayControlSection`) y con un servicio de análisis didáctico impulsado por IA (`GeminiCoachService` y `CoachFeedbackCard`), pero ambos sólo están disponibles después de que el usuario juega manualmente una partida completa hasta un estado terminal y solicita su análisis. El usuario necesita contar con una biblioteca de partidas pre-guardadas (tanto partidas instructivas precargadas en la base JSON como partidas propias que haya jugado y guardado) que, al seleccionarse, activen la animación paso a paso y vayan mostrando en cada turno la explicación de Gemini de por qué se realiza cada jugada.

---

## Solution

Integrar el reproductor animado existente, la tarjeta de explicaciones del Coach Gemini y el adaptador de persistencia JSON (`IChessLibraryRepository`):
1. **Catálogo de Partidas Comentadas en `chess-library.json` (`SavedAnnotatedMatchRecord`):**
   * Precargar en la base de datos JSON una selección de partidas clásicas e instructivas (por ejemplo, *El Mate de Legal*, *La Partida de la Ópera de Morphy*, *El Mate del Pastor Explicado*) que incluyan su disposición inicial, la secuencia completa de jugadas (`MoveRecord[]`) y el análisis pedagógico (`FullGameAnalysisResult`) con las explicaciones jugada por jugada y el resumen general.
2. **Hidratación y Reproducción Animada con Explicación Sincronizada:**
   * Al elegir una partida de la lista en la vista **"Partidas Comentadas"**, el sistema reconstruye e hidrata la partida en el motor `ChessGame`, posiciona el reproductor al inicio y permite darle **Play** (o avanzar/retroceder manualmente).
   * A medida que la animación ejecuta cada movimiento sobre el tablero resaltando origen y destino, `CoachFeedbackCard` actualiza automáticamente su contenido mostrando la insignia de calidad, la evaluación y la explicación en lenguaje natural de Gemini correspondiente a esa jugada exacta.
3. **Guardado de Nuevas Partidas Analizadas con Gemini en `chess-library.json`:**
   * Cuando el usuario finaliza una partida (clásica o de estudio) y obtiene las explicaciones con `AnalysisService` / `GeminiCoachService`, se habilita el botón **"Guardar en Partidas Comentadas"** para persistirla con un título personalizado dentro de `chess-library.json`, quedando disponible en el catálogo para futuras reproducciones animadas sin necesidad de volver a llamar a la API.

---

## User Stories

1. Como estudiante de ajedrez, quiero abrir la sección "Partidas Comentadas" desde el panel lateral y ver una lista de partidas instructivas pre-guardadas en la base JSON.
2. Como usuario, quiero seleccionar una partida pre-guardada de la lista para que se cargue inmediatamente en el tablero en modo de reproducción animada (`ReplayMode`).
3. Como usuario viendo una partida pre-guardada en reproducción automática (`Play`), quiero que a medida que la animación muestra cada jugada en el tablero, la tarjeta del Coach (`CoachFeedbackCard`) me vaya explicando por qué se hizo esa jugada sin demoras de red.
4. Como usuario viendo una partida comentada, quiero poder pausar la animación, cambiar la velocidad (`0.5s`, `1s`, `2s`), retroceder o hacer clic en cualquier fila de la tabla de historial para leer con calma la explicación de Gemini de ese movimiento puntual.
5. Como usuario que acaba de terminar y analizar una partida con el Coach de IA (o que cargó una partida sin explicaciones previas y solicitó su análisis a Gemini), quiero presionar "Guardar en Biblioteca" e ingresar un título para almacenarla en `chess-library.json` junto con todas las explicaciones generadas por Gemini.
6. Como usuario, quiero que las partidas que guardé aparezcan en el catálogo de "Partidas Comentadas" al levantar el juego nuevamente y puedan reproducirse con su animación y explicaciones intactas.

---

## Implementation Decisions

* **Hidratación Limpia sobre `IGameEngine`:** Se provee un helper de hidratación que instancia el tablero inicial de la partida guardada, aplica su secuencia de `MoveRecord` registrando el historial reversible de `MoveCommand` y rebobina al inicio (`enterReplayFromStart`) para reutilizar sin cambios `useMatchReplay` y `ReplayControlSection`.
* **Sincronización Directa por Índice (`currentMoveIndex`):** La explicación mostrada en `CoachFeedbackCard` durante la animación se obtiene indexando `analysisResult.analyzedMoves[snapshot.currentMoveIndex - 1]`, sin requerir `useEffect` ni llamadas asíncronas durante el intervalo de reproducción.
* **Persistencia Completa en `chess-library.json`:** Cada `SavedAnnotatedMatchRecord` persiste `id`, `title`, `description`, `initialBoardSetup` (opcional si es estándar), `moves` y `analysisResult: FullGameAnalysisResult` a través de `IChessLibraryRepository.saveAnnotatedMatch`.

---

## Testing Decisions

* **Pruebas Unitarias de Hidratación de Partidas:** Verificar que al hidratar un `SavedAnnotatedMatchRecord` en `ChessGame`, el motor contiene todos los `MoveRecord`, permite rebobinar hasta `currentMoveIndex === 0` y avanzar paso a paso con `redo()` restaurando cada posición e historial.
* **Pruebas de Integración UI (React Testing Library):** Verificar que al seleccionar una partida comentada del catálogo (`IChessLibraryRepository` en memoria), el tablero entra en modo replay, al avanzar de jugada (`redo` / siguiente paso) se actualiza la explicación de Gemini en `CoachFeedbackCard`, y al analizar y guardar una partida propia se invoca `saveAnnotatedMatch` y se suma a la lista.

---

## Out of Scope

* Variantes ramificadas o sub-árboles de comentarios PGN dentro de una misma partida guardada.
* Edición en caliente de jugadas intermedias de una partida histórica mientras está corriendo el reproductor animado.
