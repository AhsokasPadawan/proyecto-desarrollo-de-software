# Especificación Funcional y Técnica — Épica 11: Ejercicios Tácticos Precargados ("Mate en $X$ Movimientos")

* **Estado:** `ready-for-agent`
* **Épica:** `11-ejercicios-tacticos-mate-en-x`
* **Tickets:** `41..43`

---

## Problem Statement

Una vez que el sistema permite iniciar partidas desde disposiciones de piezas personalizadas, los usuarios necesitan una forma estructurada e interactiva de poner a prueba su cálculo táctico mediante ejercicios clásicos de entrenamiento del tipo *"Blancas dan mate en $X$ movimientos"*. Sin un flujo específico de resolución de problemas, el usuario tendría que mover manualmente ambos bandos o jugar sin saber cuántos movimientos le restan para cumplir la consigna ni recibir confirmación de si resolvió el problema dentro del límite estipulado.

---

## Solution

Construir el módulo de **Ejercicios Tácticos ("Mate en $X$")** integrado con el adaptador de persistencia JSON y el motor de dominio:
1. **Catálogo Precargado en `chess-library.json`:** Incluir una colección curada de problemas tácticos clásicos (*Mate en 1*, *Mate en 2*, *Mate en 3*) con título, descripción de consigna, disposición inicial de piezas, turno inicial, límite de jugadas (`maxMoves: X`) y respuestas defensivas del oponente.
2. **Controlador de Resolución de Ejercicios:**
   * Al cargar un ejercicio, el tablero se inicializa con la posición del problema y muestra el contador de movimientos restantes ($X$).
   * Cuando el jugador ejecuta su movimiento legal:
     * Si el estado del motor alcanza `CHECKMATE` habiendo empleado $\le X$ movimientos del jugador activo, el ejercicio se declara **¡Resuelto! (`SOLVED`)**.
     * Si aún no es jaque mate y todavía restan jugadas disponibles ($< X$), las piezas del oponente responden automáticamente con la jugada defensiva del problema (o estrategia de respaldo si el jugador explora una línea alternativa) y se descuenta $1$ del contador restante.
     * Si el jugador alcanza su movimiento número $X$ sin lograr `CHECKMATE` (o si la partida termina en ahogado), el ejercicio se marca como **No superado (`FAILED`)**, ofreciendo botones para **Reintentar ejercicio**, **Deshacer jugada** o **Pedir sugerencia al Coach Gemini**.
3. **Creación de Nuevos Ejercicios desde el Editor Visual:** Permitir que cualquier posición configurada en el Editor de Tablero pueda guardarse en `chess-library.json` como un nuevo ejercicio definiendo la cantidad $X$ de movimientos para el mate.

---

## User Stories

1. Como estudiante de ajedrez, quiero abrir la sección "Ejercicios: Mate en $X$" y ver una lista de problemas tácticos precargados (Mate en 1, Mate en 2, Mate en 3) para elegir cuál resolver.
2. Como jugador resolviendo un ejercicio, quiero ver claramente en el panel la consigna (por ejemplo, *"Blancas dan mate en 2 movimientos"*) y el contador de cuántas jugadas me quedan disponibles.
3. Como jugador resolviendo un ejercicio de Mate en 2 o más, quiero que al realizar mi primera jugada el bando defensor ejecute automáticamente su respuesta para que yo pueda concentrarme en encontrar la jugada de remate.
4. Como jugador resolviendo un ejercicio, quiero que si logro dar jaque mate dentro de los $X$ movimientos (incluso si en la jugada final existen dos jaques mates válidos distintos), el sistema valide el estado `CHECKMATE` y felicite mi resolución con estado "¡Ejercicio Resuelto!".
5. Como jugador resolviendo un ejercicio, quiero que si agoto mis $X$ movimientos sin haber dado jaque mate, el sistema me indique que no se alcanzó el mate en el límite estipulado y me permita reintentar el problema o deshacer mi último movimiento.
6. Como jugador trabado en un ejercicio táctico, quiero poder presionar "Pedir sugerencia" para que el Coach Gemini me explique la idea táctica de la posición sin salir del ejercicio.
7. Como docente o usuario avanzado, quiero poder armar una posición en el Editor Visual y guardarla en la base JSON como un nuevo ejercicio de "Mate en $X$" para que se sume al catálogo de problemas.

---

## Implementation Decisions

* **Validación de Éxito Basada en Estado `CHECKMATE` del Dominio:** La condición de victoria del ejercicio verifica que `snapshot.stateKind === 'CHECKMATE'` y `snapshot.winner === puzzle.playerColor` dentro de `playerMovesUsed <= puzzle.maxMoves`, evitando rechazar mates alternativos igualmente legales en la jugada final.
* **Respuesta Defensiva Determinista con Fallback a Estrategia:** Cada `MatePuzzleRecord` puede especificar los movimientos de respuesta del defensor (`opponentResponses`) y, si el jugador realiza una variante distinta que no da mate inmediato, el defensor utiliza la respuesta predefinida si es legal o delega en `GreedyMaterialAiStrategy` para mantener una defensa válida.
* **Persistencia vía `IChessLibraryRepository`:** La lectura del catálogo de ejercicios y la creación de nuevos ejercicios utilizan exclusivamente el contrato asíncrono `IChessLibraryRepository`.

---

## Testing Decisions

* **Pruebas Unitarias y de Integración del Flujo de Ejercicios:** Verificar con un repositorio en memoria la resolución exitosa de un ejercicio de Mate en 1 y Mate en 2 (incluyendo la respuesta automática de las Negras), la detección de fallo cuando se agotan los $X$ movimientos sin dar jaque mate y el reinicio del ejercicio con el botón "Reintentar".
* **Pruebas de Guardado de Nuevos Ejercicios:** Verificar que desde el editor se puede registrar un nuevo `MatePuzzleRecord` en el repositorio inyectado y seleccionarlo inmediatamente desde la lista de ejercicios.

---

## Out of Scope

* Sistema de puntuación ELO o ranking competitivo online por tiempo de resolución de ejercicios.
* Ejercicios tácticos cuyo objetivo no sea el jaque mate (por ejemplo, ganar calidad o forzar tablas).
