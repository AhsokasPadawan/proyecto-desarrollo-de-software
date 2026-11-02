# ADR-017: Ejercicios Tácticos "Mate en $X$" y Partidas Pre-guardadas con Animación y Explicaciones de Gemini

* **Estado:** Aceptado
* **Fecha:** 2026-10-29

## 1. What (Qué decidimos)

1. **Motor y Flujo de Resolución para Ejercicios "Mate en $X$ Movimientos":**
   * Los ejercicios tácticos (`MatePuzzleRecord`) almacenados en `chess-library.json` definen una disposición inicial de piezas, el color que debe resolver el problema, la cantidad máxima de jugadas (`maxMoves: X`, p. ej. Mate en 1, Mate en 2, Mate en 3) y las respuestas defensivas del oponente.
   * Cuando el usuario realiza una jugada legal:
     * Si el estado resultante del motor es `CHECKMATE` dentro del límite de $X$ jugadas del jugador activo, el ejercicio se marca como **¡Resuelto! (`SOLVED`)**.
     * Si aún no es jaque mate y restan jugadas disponibles, el oponente ejecuta automáticamente su respuesta defensiva (según la secuencia del ejercicio o estrategia de respaldo) y se descuenta $1$ del contador de movimientos restantes.
     * Si el jugador consume sus $X$ movimientos sin alcanzar `CHECKMATE` (o la partida termina en tablas/ahogado), el ejercicio pasa a estado **No superado (`FAILED`)**, ofreciendo acciones inmediatas para **Reintentar / Deshacer** o **Pedir sugerencia a Gemini**.

2. **Reproducción Animada de Partidas Pre-guardadas con Explicaciones de Gemini:**
   * El catálogo de partidas comentadas (`SavedAnnotatedMatchRecord`) en `chess-library.json` almacena la disposición inicial, el historial de movimientos (`MoveRecord[]`) y el resultado del análisis didáctico (`FullGameAnalysisResult` con la explicación `advice` de cada jugada y el resumen general).
   * Al seleccionar una partida del catálogo, el sistema hidrata los movimientos en el motor `ChessGame`, activa el reproductor animado existente (`useMatchReplay`) y, a medida que el temporizador o los botones de transporte avanzan jugada por jugada, `CoachFeedbackCard` muestra sincrónicamente la explicación pedagógica de por qué se efectuó cada movimiento.

3. **Guardado de Nuevas Partidas Analizadas con Gemini en la Base JSON:**
   * Al concluir y analizar cualquier partida jugada o de estudio mediante `GeminiCoachService`, el usuario puede presionar **"Guardar en Partidas Comentadas"**, persistiendo en `chess-library.json` (a través de `IChessLibraryRepository`) tanto la secuencia de jugadas como las explicaciones generadas por Gemini para futuras reproducciones instantáneas sin consumir nuevamente cuota de API.

## 2. Why (Por qué lo elegimos)

1. **Evaluación Basada en Reglas de Dominio (`CHECKMATE`) en lugar de Strings Rígidos:**
   * Validar que el ejercicio culmina en un estado real `CHECKMATE` en $\le X$ movimientos permite aceptar soluciones equivalentes cuando en la jugada final existen dos mates legales distintos, manteniendo la respuesta automática del rival en los pasos intermedios.
2. **Reutilización de Componentes y Cero Latencia en Demostraciones:**
   * Al persistir las explicaciones de Gemini dentro de `chess-library.json` tanto para las partidas precargadas como para las nuevas partidas guardadas, la animación paso a paso fluye sin esperas de red ni errores `HTTP 429` de límite de cuota durante la reproducción.
3. **Sinergia entre las 3 Épicas:**
   * El Editor Visual (Épica 10), el Catálogo de Ejercicios (Épica 11) y el Reproductor de Partidas Comentadas con Gemini (Épica 12) convergen sobre el mismo puerto `IChessLibraryRepository` y reutilizan `ChessGame`, `useMatchReplay` y `CoachFeedbackCard`.

## 3. When to Break (Cuándo reconsiderar o romper esta decisión)

Esta decisión debería revisarse si:
* Se incorporaran ejercicios cuyo objetivo no sea dar jaque mate sino obtener ventaja material (por ejemplo, *"Blancas ganan la dama en 3 jugadas"*), lo que requeriría un criterio de éxito basado en delta de evaluación táctica en lugar del estado `CHECKMATE`.
