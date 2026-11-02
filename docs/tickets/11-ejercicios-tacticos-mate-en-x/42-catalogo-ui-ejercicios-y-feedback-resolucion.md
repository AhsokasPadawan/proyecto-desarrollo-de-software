# 42: Catálogo UI de Ejercicios "Mate en $X$" y Feedback Interactivo de Resolución

**What to build:** Construir la vista **"Ejercicios: Mate en $X$"** en el panel de control conectada a `IChessLibraryRepository`. Muestra el catálogo de problemas precargados desde `chess-library.json` (Mate en 1, Mate en 2, Mate en 3), el banner de objetivo (*"Blancas dan mate en $X$ movimientos"*), el indicador en vivo de movimientos restantes, el feedback de **¡Ejercicio Resuelto!** o **Intento fallido**, el botón **"Reintentar ejercicio"** y la integración con **"Pedir sugerencia"** del Coach Gemini.

**Blocked by:** `39-editor-visual-tablero-y-paleta-piezas`, `41-motor-resolucion-ejercicios-mate-en-x`

**Branch:** `ticket/42-catalogo-ui-ejercicios-y-feedback-resolucion`

**Status:** Done

## Acceptance Criteria

- [x] Al seleccionar **"Ejercicios: Mate en $X$"** en `AppHeader`, se lista el catálogo de problemas obtenidos desde `IChessLibraryRepository.getMatePuzzles()` indicando título, dificultad y objetivo (`Mate en X`).
- [x] Al elegir un ejercicio, el tablero carga su posición y el panel muestra la consigna, el contador de movimientos restantes y el estado actual (`En curso`, `¡Resuelto!`, `No superado`).
- [x] El usuario dispone de un botón **"Reintentar ejercicio"** que restablece la posición inicial y el contador $X$, además de poder solicitar una pista didáctica a Gemini con **"Pedir sugerencia"**.
- [x] Se añaden pruebas de integración con React Testing Library verificando la selección de un ejercicio del catálogo, su resolución en el tablero y el funcionamiento del botón de reintento.
