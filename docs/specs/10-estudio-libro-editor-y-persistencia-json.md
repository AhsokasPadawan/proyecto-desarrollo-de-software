# Especificación Funcional y Técnica — Épica 10: Modo Estudio de Libro, Editor Visual de Tablero y Adaptador de Persistencia JSON

* **Estado:** `ready-for-agent`
* **Épica:** `10-estudio-libro-editor-y-persistencia-json`
* **Tickets:** `37..40`

---

## Problem Statement

Los estudiantes y docentes de ajedrez necesitan poder reproducir posiciones específicas extraídas de un libro o preparar lecciones sobre conceptos puntuales (como el movimiento de una pieza aislada, un final elemental o una estructura táctica) sin tener que jugar toda una partida desde la posición inicial estándar. Además, si una posición de estudio solo contiene piezas de un bando o carece de material suficiente según las reglas de torneo, los estados tradicionales (`NormalPlayState`) interrumpen inmediatamente el juego declarando ahogado (`STALEMATE`) o tablas por material insuficiente (`DRAW_INSUFFICIENT_MATERIAL`). Finalmente, las posiciones creadas o precargadas deben poder consultarse y guardarse de forma desacoplada mediante un puerto de persistencia.

---

## Solution

Construir una solución integral en tres niveles arquitectónicos:
1. **Puerto Asíncrono de Biblioteca (`IChessLibraryRepository`) y Adaptador JSON (`JsonFileLibraryAdapter`):**
   * Definir una única interfaz asíncrona (`Promise<...>`) inyectable en la aplicación y respaldada en producción por `JsonFileLibraryAdapter`, que lee y persiste registros en un archivo JSON (`chess-library.json`) con datos semilla precargados, permitiendo su sustitución directa por una implementación en memoria en los tests o por una base de datos relacional (como MySQL) en el futuro con cero modificaciones en el Core y la UI.
2. **Estado Polimórfico de Estudio (`StudyPlayState` en el Core):**
   * Implementar `StudyPlayState` (`type: 'STUDY_IN_PROGRESS'`) dentro del patrón GoF `State` (`IGameState`).
   * Permitir iniciar partidas de estudio desde cualquier disposición libre de piezas sin validaciones restrictivas.
   * Si el tablero solo tiene piezas de un único color, conservar el turno activo en ese color tras cada movimiento; si tiene piezas de ambos colores, alternar el turno normalmente.
   * Ignorar tablas automáticas (material insuficiente, 50 movimientos y triple repetición), pero detectar jaque (`CheckState`) y jaque mate (`CheckmateState`) cuando exista un Rey enemigo en el tablero.
3. **Editor Visual de Tablero y Catálogo de Posiciones de Libro:**
   * Incorporar la navegación de actividades en la barra lateral izquierda (`AppHeader`) renderizada mediante una *Lookup Table*.
   * Proveer una paleta visual de piezas (Blancas y Negras), herramienta de borrado de casilla, vaciado de tablero, restauración de posición estándar y selector de turno inicial, operando puramente con clics visuales (sin exponer cadenas FEN).
   * Permitir iniciar inmediatamente la partida de estudio desde el tablero editado, guardar la disposición con título y descripción en `chess-library.json`, o cargar cualquiera de las posiciones de libro precargadas.

---

## User Stories

1. Como docente o estudiante de ajedrez, quiero acceder al modo "Estudio / Editor de Libro" desde el panel lateral izquierdo para configurar cualquier disposición de piezas como si copiara el diagrama de un libro.
2. Como usuario en el editor visual, quiero seleccionar una pieza blanca o negra de una paleta gráfica y hacer clic en las casillas del tablero para colocarla en la posición deseada sin tener que escribir código FEN.
3. Como usuario en el editor visual, quiero seleccionar la herramienta "Borrar pieza" o el botón "Vaciar tablero" para limpiar casillas individuales o todo el tablero rápidamente.
4. Como usuario en el editor visual, quiero elegir de qué color es el turno inicial (Blancas o Negras) antes de comenzar la partida de estudio.
5. Como usuario en una partida de estudio, quiero poder colocar piezas de un solo color (por ejemplo, un único caballo blanco) y moverlas varios turnos seguidos sin que el motor declare ahogado ni cambie el turno a un bando sin piezas.
6. Como usuario en una partida de estudio, quiero practicar finales o posiciones con pocas piezas sin que el motor interrumpa la partida por tablas de material insuficiente, regla de 50 movimientos o triple repetición.
7. Como usuario en una partida de estudio donde sí coloqué al Rey oponente, quiero que el motor detecte jaques y jaque mate normalmente para poder ilustrar remates de libros.
8. Como usuario, quiero ver una lista de disposiciones de estudio precargadas desde la base JSON y cargar cualquiera de ellas en el tablero con un solo clic.
9. Como usuario, quiero poder guardar una disposición que armé en el editor (indicando título y nota pedagógica) para que quede persistida en la base de datos JSON y disponible en la lista de estudios.

---

## Implementation Decisions

* **Contrato Asíncrono de Persistencia (`IChessLibraryRepository`):** Todos los métodos de lectura y escritura retornan `Promise<...>` para garantizar el cumplimiento de DIP y OCP frente a futuros adaptadores de bases de datos SQL (como MySQL) sin alterar las firmas ni los consumidores.
* **Único Adaptador de Producción e Inyección en Tests:** En `src/` sólo se define la interfaz `IChessLibraryRepository` y el adaptador `JsonFileLibraryAdapter`. En `tests/` se inyecta por constructor/prop una implementación en memoria que satisface la interfaz.
* **Extensión Polimórfica del Patrón State (`StudyPlayState`):** En lugar de introducir condicionales booleanos dispersos, el comportamiento de estudio se modela como un nuevo estado `IGameState` (`STUDY_IN_PROGRESS`), preservando el diseño orientado a objetos del Core.
* **Lookup Tables y Cero `useEffect`:** El cambio entre vistas de actividad y las herramientas de la paleta del editor se resuelven mediante tablas de mapeo (`Record<ActivityMode, ...>`) y controladores de eventos `onClick` directos.

---

## Testing Decisions

* **Pruebas Unitarias de Dominio (`StudyPlayState` y `ChessGame`):** Verificar sobre el seam público `IGameEngine` / `ChessGame` que una partida iniciada en modo estudio permite mover piezas cuando hay un solo color en el tablero (manteniendo el turno), no transiciona a tablas por material insuficiente al quedar Rey contra Rey, y sí transiciona a `CHECKMATE` cuando se da jaque mate a un Rey presente.
* **Pruebas del Adaptador `JsonFileLibraryAdapter`:** Verificar la lectura de la semilla y la persistencia de nuevas posiciones de estudio utilizando mocks de red/almacenamiento sin tocar el disco real durante los tests.
* **Pruebas de Integración UI (React Testing Library):** Verificar en `ChessApp` (inyectando un `IChessLibraryRepository` en memoria) la colocación y borrado de piezas en el editor visual, el inicio de una partida de estudio y el guardado/carga desde el catálogo.

---

## Out of Scope

* Exposición de inputs de texto FEN o PGN crudos en la interfaz de usuario del editor.
* Validación restrictiva de torneos FIDE al crear disposiciones de estudio (como exigir exactamente 1 rey por bando o prohibir peones en primera/octava fila).
