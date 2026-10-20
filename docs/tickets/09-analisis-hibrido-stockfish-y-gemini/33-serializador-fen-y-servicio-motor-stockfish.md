# 33: Serializador FEN y Servicio del Motor Táctico (Stockfish REST)

**What to build:** Implementar en el Core el serializador `FenSerializer` para transformar un `GameSnapshot` en una cadena FEN reglamentaria (disposición de piezas, turno activo, derechos de enroque de ambos bandos, casilla de peón al paso y reloj de medio movimiento). Crear el contrato `IChessEngine` y el adaptador de infraestructura `ChessApiService` encargado de interactuar con el endpoint REST de `chess-api.com` para evaluar posiciones individuales y secuencias de posiciones de una partida, recuperando evaluación en centipeones/peones, mejor jugada técnica (`bestMove`) y línea de continuación.

**Blocked by:** `12-patron-observer-y-game-snapshot`, `25-modelo-dominio-historial-moverecord`

**Branch:** `ticket/33-serializador-fen-y-servicio-motor-stockfish`

**Status:** done

## Acceptance Criteria

- [x] Se implementa `FenSerializer.serializeSnapshot(snapshot: GameSnapshot): string` generando FEN válido de 6 campos.
- [x] Se deduce el enroque disponible (K, Q, k, q) evaluando la posición y el historial de jugadas de reyes y torres.
- [x] Se deduce la casilla de captura al paso a partir del último movimiento de peón doble.
- [x] Se define la interfaz `IChessEngine` con `evaluatePosition` y `evaluateSequence`.
- [x] Se implementa `ChessApiService implements IChessEngine`.
- [x] Se añaden pruebas unitarias en `tests/core/FenSerializer.test.ts` verificando la posición inicial, avances de peón, pérdida de enroque y medio turno.
