# ADR-009: Aplicación del Patrón `State` para Gestionar las Fases de la Partida (`IGameState`)

* **Estado:** Aceptado
* **Fecha:** 2026-09-27

## 1. What (Qué decidimos)

El ciclo de vida de la partida dentro de `ChessGame` se modela mediante el patrón de comportamiento **`State`**, definiendo el contrato **`IGameState`** y clases discretas por cada fase:
1. **`NormalPlayState` (`IN_PROGRESS`)**: Estado activo estándar donde el Rey del jugador de turno no está amenazado y existen movimientos legales disponibles. Permite ejecutar jugadas válidas y evalúa la transición hacia el siguiente estado tras cambiar el turno.
2. **`CheckState` (`CHECK`)**: Estado activo donde el Rey del jugador de turno se encuentra bajo amenaza directa pero cuenta con al menos un movimiento legal para salir del jaque. Permite ejecutar únicamente jugadas que resuelvan la amenaza y transiciona al estado correspondiente del rival.
3. **`CheckmateState` (`CHECKMATE`)**: Estado terminal donde el Rey del jugador de turno está en jaque y no existe ningún movimiento legal disponible. Rechaza cualquier intento de nueva jugada (`makeMove`) e informa al jugador opuesto como ganador.
4. **`StalemateState` (`STALEMATE`)**: Estado terminal de tablas por ahogado donde el jugador de turno no está en jaque pero carece de movimientos legales. Rechaza cualquier intento de nueva jugada (`makeMove`) declarando empate.

Al ejecutar `undo()` sobre `ChessGame`, el contexto recalcula y restaura la instancia de `IGameState` correspondiente al estado revertido del tablero.

## 2. Why (Por qué lo elegimos)

1. **Demostración Explícita de los 3 Patrones GoF Centrales del Curso (`Strategy` / Composición en reglas, `Command` en historial y `State` en fases):** Permite exhibir en el código y en el Diagrama de Clases UML cómo encapsular comportamientos dependientes del estado y sus reglas de transición en objetos polimórficos, eliminando condicionales `if/else` o `switch` sobre el estado de la partida dentro de `ChessGame`.
2. **Alineación con los Estándares de Diseño (`> 3` fases):** Al contemplar 4 estados diferenciados (`NormalPlay`, `Check`, `Checkmate`, `Stalemate`), cumple el disparador formal definido en los estándares de ingeniería para introducir el patrón `State`.

## 3. When to Break (Cuándo reconsiderar o romper esta decisión)

Esta decisión debería revisarse si:
* El alcance se redujera a únicamente 2 estados (` Jugando` vs `Terminado`) sin distinción de fases ni reglas por estado, escenario donde polimorfismo por clases de estado introduciría indirección innecesaria frente a un valor booleano o `enum` simple.
