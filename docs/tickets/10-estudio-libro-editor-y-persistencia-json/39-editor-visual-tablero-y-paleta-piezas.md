# 39: Navegación de Actividades y Editor Visual de Tablero con Paleta de Piezas

**What to build:** Incorporar en la columna izquierda (`AppHeader`) el selector de modo de actividad renderizado mediante una *Lookup Table* en el panel de control y construir la vista **"Estudio / Editor de Libro"**. En el editor visual, el usuario puede seleccionar cualquier pieza (Blancas o Negras) o la herramienta de borrado desde una paleta gráfica, hacer clic en las casillas del tablero para armar la posición como si la copiara de un libro, vaciar el tablero, restaurar la posición estándar, elegir el turno inicial (`Blancas` o `Negras`) y presionar **"Iniciar Partida de Estudio"**.

**Blocked by:** `38-estado-estudio-study-play-state-en-core`

**Branch:** `ticket/39-editor-visual-tablero-y-paleta-piezas`

**Status:** Done

## Acceptance Criteria

- [x] `AppHeader` expone la navegación entre actividades (Partida Clásica, Estudio / Editor de Libro, Ejercicios Mate en $X$, Partidas Comentadas) y el panel derecho selecciona la vista mediante un objeto de mapeo (*Lookup Table*), sin bloques `switch` ni `useEffect`.
- [x] En el modo Editor Visual, el usuario dispone de una paleta interactiva con las 6 piezas de cada color, herramienta *"Borrar casilla"*, botón *"Vaciar tablero"*, botón *"Posición estándar"* y selector de turno inicial (`WHITE` / `BLACK`), sin mostrar inputs FEN.
- [x] Al hacer clic en cualquier casilla del tablero con una herramienta activa de la paleta, se coloca o elimina la pieza correspondiente reflejándose instantáneamente en la grilla.
- [x] Al presionar *"Iniciar Partida de Estudio"*, se instancia `ChessGame` con el tablero configurado y `StudyPlayState`, habilitando el juego libre desde esa posición.
- [x] Se incluyen pruebas de componentes e integración con React Testing Library verificando el armado de una posición en el editor y el arranque de la partida de estudio.
