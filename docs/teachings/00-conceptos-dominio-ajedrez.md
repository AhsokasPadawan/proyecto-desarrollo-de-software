# Conceptos de Dominio de Ajedrez

Explicación de conceptos y notaciones del dominio de ajedrez aplicados en el motor (`src/core`).

---

## 1. ¿Qué es FEN (*Forsyth–Edwards Notation*)?

**FEN** es el formato estándar universal en ajedrez para describir el estado exacto de una partida en un único texto de una sola línea. Permite "sacarle una foto" al tablero en cualquier momento para que un motor de ajedrez (como Stockfish) o un servicio de análisis externo sepa exactamente qué posición se está jugando sin necesidad de reproducir toda la partida desde el inicio.

### Ejemplo: Posición inicial de ajedrez en FEN
```text
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
```

Una cadena FEN siempre tiene **6 campos** separados por un espacio:

1. **Posición de las piezas (`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR`)**:
   * Describe el tablero desde la fila 8 (arriba, negras) hasta la fila 1 (abajo, blancas), separando cada fila con una barra `/`.
   * **Mayúsculas** = piezas blancas (`P` peón, `N` caballo, `B` alfil, `R` torre, `Q` dama, `K` rey).
   * **Minúsculas** = piezas negras (`p`, `n`, `b`, `r`, `q`, `k`).
   * **Números (`1` al `8`)** = cantidad de casillas vacías consecutivas en esa fila (por ejemplo, `8` significa una fila entera vacía).
2. **Turno activo (`w` o `b`)**:
   * `w` (*White*) si le toca mover a las blancas, `b` (*Black*) si le toca a las negras.
3. **Derechos de enroque (`KQkq` o `-`)**:
   * Indica qué enroques siguen siendo posibles (porque ni el rey ni esa torre se movieron aún):
     * `K` = Blanco del lado del rey (corto), `Q` = Blanco del lado de la dama (largo).
     * `k` = Negro corto, `q` = Negro largo.
     * `-` = Ningún jugador puede enrocar.
4. **Casilla de captura al paso / *En Passant* (`-` o casilla como `e3`)**:
   * Si en el turno anterior un peón acaba de avanzar dos casillas, aquí se anota la casilla intermedia (ej. `e3` o `d6`) donde puede ser capturado al paso. Si no hay captura al paso disponible, va `-`.
5. **Reloj de medios movimientos / *Halfmove clock* (`0`)**:
   * Cantidad de turnos individuales (*plies*) transcurridos desde el último movimiento de peón o captura. Sirve para controlar la **regla de los 50 movimientos** (cuando llega a 100 medios movimientos, es tablas).
6. **Número de jugada completa / *Fullmove number* (`1`)**:
   * Empieza en `1` y aumenta en 1 cada vez que mueven las negras.

### Uso en el proyecto
En `proyect/src/core/board/FenSerializer.ts`, el método `FenSerializer.serializeSnapshot(snapshot)` toma el `GameSnapshot` actual de la partida y construye esos 6 campos para enviárselos al servicio de análisis (`AnalysisService`).

---

## 2. Movimientos Pseudo-Legales vs. Movimientos Legales

En el diseño de motores de ajedrez se separa el cálculo de jugadas en dos etapas para evitar recursión infinita y respetar el Principio de Responsabilidad Única (SRP):

1. **Movimientos Pseudo-Legales (`IPiece.getPseudoLegalMoves` y `IMovementRule`):**
   * Evalúan únicamente la **geometría de la pieza**, los límites del tablero y los bloqueos por otras piezas (propias o rivales).
   * No verifican si, tras mover la pieza, el propio Rey queda expuesto en jaque (por ejemplo, si la pieza estaba "clavada" protegiendo al Rey).
2. **Movimientos Estrictamente Legales (`ChessGame.getLegalMoves`):**
   * Toman los movimientos pseudo-legales de la pieza y **simulan** cada uno sobre el tablero usando un `MoveCommand`.
   * Con `CheckDetector.isKingInCheck()` verifican si el Rey del jugador de turno queda en jaque luego del movimiento, y deshacen inmediatamente la simulación con `MoveCommand.undo()`.
   * Solo los movimientos que dejan al propio Rey a salvo son devueltos como movimientos legales.
