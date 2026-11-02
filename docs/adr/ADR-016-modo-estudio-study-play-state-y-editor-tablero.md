# ADR-016: Modo Estudio Polimórfico (`StudyPlayState`) y Editor Visual de Tablero

* **Estado:** Aceptado
* **Fecha:** 2026-10-29

## 1. What (Qué decidimos)

1. **Nuevo Estado del Patrón GoF State (`StudyPlayState`):**
   * Se incorpora `StudyPlayState` (`type: 'STUDY_IN_PROGRESS'`) implementando el contrato `IGameState` en el Core para diferenciar una **Partida Común** (`NormalPlayState`) de una **Partida de Estudio** (`StudyPlayState`).
   * **Cero Validaciones Restrictivas de Entrada:** Una partida de estudio puede iniciarse desde cualquier disposición de piezas configurada por el usuario (por ejemplo, tableros sin reyes, con un único color para enseñar el movimiento de una pieza aislada, o posiciones extraídas de un libro de ajedrez que no ocurrirían en una partida estándar).
   * **Preservación de Turno para Bando Único:** Si en el tablero de estudio únicamente existen piezas de un solo color, `ChessGame` mantiene el turno activo en ese color tras cada movimiento para permitir ejecutar maniobras consecutivas; si existen piezas de ambos colores, alterna el turno normalmente.
   * **Omisión de Tablas Automáticas y Detección Condicional de Jaque Mate:** `StudyPlayState.evaluateNextState()` ignora las condiciones de tablas automáticas (material insuficiente, regla de 50 movimientos, triple repetición) y el ahogado por ausencia de piezas enemigas, pero si existe un Rey del bando defensor en el tablero, detecta el jaque y transiciona a `CheckmateState` cuando recibe jaque mate.

2. **Editor Visual de Tablero sin Exposición de FEN en la UI:**
   * En el modo **"Estudio / Editor de Libro"**, el usuario dispone de una paleta visual de piezas (Rey, Dama, Torre, Alfil, Caballo y Peón para Blancas y Negras), herramienta de borrado de casilla, botón de vaciado completo, botón de posición estándar y selector de turno inicial.
   * La interfaz gráfica opera puramente mediante clics visuales sobre la paleta y el tablero, sin exponer cadenas técnicas FEN al usuario.

3. **Navegación por Lookup Table en `AppHeader` y `ControlPanelView`:**
   * La columna izquierda (`AppHeader`) incorpora el selector de actividad (Partida Clásica, Estudio / Editor de Libro, Ejercicios Mate en $X$, Partidas Comentadas) y el panel lateral derecho renderiza la vista correspondiente mediante un objeto de mapeo (*Lookup Table*), sin condicionales `switch` extensos ni `useEffect` reactivos.

## 2. Why (Por qué lo elegimos)

1. **Fidelidad al Patrón GoF State y Polimorfismo:**
   * En lugar de ensuciar `ChessGame` y `NormalPlayState` con banderas booleanas (`isStudyMode`), delegar el comportamiento de transición en `StudyPlayState` mantiene la cohesión y demuestra la extensibilidad del patrón **State** ante nuevos modos de juego.
2. **Flexibilidad Pedagógica Real:**
   * Los libros de ajedrez frecuentemente presentan diagramas parciales (por ejemplo, cómo maniobra un caballo contra peones sin reyes en el tablero, o finales de Rey + pieza menor). Con `NormalPlayState`, esas posiciones terminarían instantáneamente por ahogado o material insuficiente en el primer turno; `StudyPlayState` permite practicarlas sin bloqueos.
3. **Experiencia de Usuario Directa:**
   * La paleta visual evita que el estudiante o docente tenga que conocer o redactar notación FEN para replicar el diagrama de un libro.

## 3. When to Break (Cuándo reconsiderar o romper esta decisión)

Esta decisión debería revisarse si:
* Se deseara exportar posiciones de estudio hacia plataformas externas de torneos (como Lichess o ChessBase), en cuyo caso se podría habilitar un botón opcional de *"Copiar FEN"* reutilizando internamente `FenSerializer`.
