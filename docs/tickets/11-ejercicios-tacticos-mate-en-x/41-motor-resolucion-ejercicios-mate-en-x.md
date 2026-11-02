# 41: Motor y Controlador de Resolución de Ejercicios "Mate en $X$ Movimientos"

**What to build:** Implementar el controlador de dominio/aplicación para los ejercicios tácticos de *"Blancas dan mate en $X$ movimientos"* (`MatePuzzleRecord`). Al iniciar un ejercicio, se configura la posición inicial del problema con un contador de $X$ jugadas restantes. Tras cada movimiento legal del jugador: si alcanza `CHECKMATE` en $\le X$ jugadas, el ejercicio pasa a estado **Resuelto (`SOLVED`)**; si aún no es mate y quedan jugadas disponibles, el bando defensor ejecuta automáticamente su respuesta defensiva y se descuenta $1$ del contador; si el jugador agota sus $X$ movimientos sin dar jaque mate, el ejercicio pasa a estado **No superado (`FAILED`)**.

**Blocked by:** `37-puerto-biblioteca-y-adaptador-json`, `38-estado-estudio-study-play-state-en-core`

**Branch:** `ticket/41-motor-resolucion-ejercicios-mate-en-x`

**Status:** Done

## Acceptance Criteria

- [x] El controlador de ejercicios inicializa `ChessGame` a partir de la disposición y turno de un `MatePuzzleRecord` y lleva el seguimiento de movimientos realizados vs `maxMoves` ($X$).
- [x] Al realizar el jugador un movimiento que produce `CHECKMATE` dentro de los $X$ movimientos permitidos (incluso si existen dos jaques mates distintos válidos en la jugada decisiva), el estado del ejercicio cambia a `SOLVED`.
- [x] En problemas de Mate en 2 o más, tras una jugada del usuario que no es mate inmediato, el oponente ejecuta automáticamente la respuesta defensiva definida en el problema (o fallback a estrategia de IA si el jugador desvió la línea) y resta 1 al contador de movimientos disponibles.
- [x] Si el jugador consume sus $X$ movimientos sin haber logrado `CHECKMATE` (o cae en ahogado), el estado del ejercicio cambia a `FAILED` bloqueando nuevos movimientos hasta reintentar o deshacer.
- [x] Se añaden pruebas unitarias AAA en memoria verificando escenarios de Mate en 1, Mate en 2 con respuesta automática y fallo por agotamiento de movimientos.
