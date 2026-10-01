# Chess TPO Glossary

Lenguaje ubicuo canónico del proyecto de Ajedrez. Todo el código del dominio, especificaciones, tickets, tests y discusiones técnicas deben emplear estrictamente estos términos.

## Arquitectura

**Core (Dominio)**:
Capa central que encapsula las entidades, objetos de valor, reglas de movimiento y estado del juego de ajedrez, libre de dependencias de interfaz gráfica, persistencia o frameworks externos.
_Avoid_: Backend, servidor, lógica de pantalla

**Driving Adapter (Adaptador de Entrada)**:
Módulo externo (interfaz Web en React + Tailwind CSS o suite de tests en Vitest) que traduce interacciones del usuario o casos de prueba en invocaciones a los puertos públicos del Core (`IGameEngine`).
_Avoid_: Controlador de dominio, vista con lógica

**GameEngine (`IGameEngine` / `ChessGame`)**:
Puerto de entrada principal (*Driving Port*) del Core que orquesta el flujo de la partida: validación de turnos, ejecución y reversión de jugadas mediante `MoveCommand`, y detección de jaque, jaque mate y ahogado.
_Avoid_: GameController, BoardManager, GameService

**Seam (Punto de Costura)**:
Frontera pública e inyectable del dominio (`ChessGame`, `Board`) a través de la cual los tests unitarios configuran escenarios (*Arrange*), disparan comportamientos (*Act*) y verifican invariantes (*Assert*) sin acoplarse a detalles privados.
_Avoid_: Mock interno, método privado expuesto

## Dominio y Movimiento

**Position (Posición)**:
Objeto de valor (*Value Object*) inmutable que identifica una coordenada mediante índices enteros 0-indexed `(row, col)` y provee operaciones de desplazamiento vectorial (`offset`) e igualdad por valor.
_Avoid_: Casillero, celda, tupla `[x, y]`, string `'e4'` en el Core

**Piece (Pieza)**:
Entidad del dominio con un color (`Color`) que representa una pieza en el tablero mediante su clase nominal (`Pawn`, `Rook`, `Knight`, `Bishop`, `Queen`, `King`) y delega el cálculo de sus movimientos candidatos a una colección compuesta de `MovementRule`.
_Avoid_: Ficha, token, figura

**MovementRule (Regla de Movimiento)**:
Contrato de estrategia componible (`IMovementRule`) que calcula los desplazamientos o trayectorias candidatas desde una posición origen sobre el tablero (por ejemplo, deslizamiento lineal por rayos o salto discreto).
_Avoid_: Validador global, lógica heredada de pieza

**SlidingMoveRule (Regla de Movimiento Deslizante)**:
Implementación de `IMovementRule` que proyecta rayos continuos en direcciones dadas hasta encontrar el borde del tablero o la primera pieza en su camino.
_Avoid_: Movimiento de torre/alfil hardcodeado

**LeapMoveRule (Regla de Movimiento por Salto)**:
Implementación de `IMovementRule` que evalúa desplazamientos discretos fijos ignorando piezas intermedias (utilizada tanto para el salto en $L$ del `Knight` como para el paso unitario del `King`).
_Avoid_: Movimiento especial de caballo

**Board (Tablero)**:
Entidad mutable del dominio que administra la cuadrícula de coordenadas (por defecto $8 \times 8$) y el estado de ocupación de cada casilla por instancias de `Piece`.
_Avoid_: Mapa, matriz cruda, grilla de UI

**MoveCommand (Comando de Movimiento)**:
Objeto del patrón `Command` que encapsula una transición sobre el `Board` (`from`, `to`, `movedPiece`, `capturedPiece`), exponiendo `execute()` para aplicar la jugada y `undo()` para restaurar exactamente el estado previo.
_Avoid_: Evento de historial pasivo, log de texto

**BoardQuery (`IBoardQuery`)**:
Interfaz segregada de solo lectura implementada por `Board` que expone consultas de límites y ocupación de casillas (`isWithinBounds`, `getPieceAt`, `isEmpty`, `findKingPosition`) a las reglas de movimiento y al detector de jaque, impidiendo mutaciones accidentales.
_Avoid_: Pasar la clase mutable `Board` completa a las reglas

**Pseudo-Legal Move (Movimiento Pseudo-Legal)**:
Desplazamiento válido según la geometría de una `Piece` (`IMovementRule`), los límites del tablero y las obstrucciones en la trayectoria, antes de verificar si deja al propio Rey en jaque.
_Avoid_: Movimiento bruto, movimiento sin validar

**Legal Move (Movimiento Legal)**:
Todo `Pseudo-Legal Move` cuya ejecución (simulada y revertida vía `MoveCommand`) no deja al Rey del jugador activo bajo amenaza (`isKingInCheck === false`).
_Avoid_: Movimiento definitivo, jugada filtrada

**CheckDetector (Detector de Jaque)**:
Servicio de dominio sin estado (*stateless*) que evalúa sobre `IBoardQuery` si la casilla del Rey de un color dado es alcanzada por algún `Pseudo-Legal Move` de las piezas oponentes.
_Avoid_: Validador de tablero, juez global

**GameState (`IGameState`)**:
Contrato del patrón `State` cuyas implementaciones concretas (`NormalPlayState`, `CheckState`, `CheckmateState`, `StalemateState`) gobiernan qué operaciones están permitidas en la fase actual de la partida y cómo transicionar a la siguiente fase tras cada jugada.
_Avoid_: Flag booleano `isGameOver`, strings sueltos de estado

**MoveResult (Resultado de Movimiento)**:
Unión discriminada devuelta por `IGameEngine.makeMove` que indica de forma tipada si la jugada fue aplicada (`{ success: true, ... }`) o rechazada por una regla del dominio (`{ success: false, reason: MoveRejectionReason }`).
_Avoid_: Excepciones de control de flujo, retorno booleano ambiguo

**GameObserver (`IGameObserver`)**:
Suscriptor registrado en `IGameEngine` mediante el patrón `Observer` que es notificado con un nuevo `GameSnapshot` cada vez que una jugada se ejecuta, deshace o rehace, contando con desuscripción explícita (`unsubscribe`).
_Avoid_: Callback acoplado a React, polling de estado

**GameSnapshot (Instantánea de Partida)**:
Estructura de datos inmutable de solo lectura emitida hacia los adaptadores que refleja el estado actual de las casillas, el turno activo, la fase (`GameStateKind`) y la disponibilidad de `undo`/`redo`, protegiendo las referencias internas mutables de `Board`.
_Avoid_: Exponer la instancia mutable de `Board` a la UI

**AiStrategy (`IAiStrategy`)**:
Contrato del patrón `Strategy` que encapsula un algoritmo intercambiable en tiempo de ejecución (`RandomAiStrategy`, `GreedyMaterialAiStrategy`) capaz de seleccionar una jugada válida a partir del estado expuesto por `IGameEngine`.
_Avoid_: Bot acoplado dentro de `ChessGame`

## Replay y Exportación de Partida

**MoveRecord (Registro de Jugada)**:
Estructura de datos inmutable generada por el Core que encapsula la metadata pura de una jugada ejecutada (`turn`, `piece`, `from`, `to` en formato algebraico letra-número, pieza capturada e indicadores de enroque y coronación), expuesta como parte de `GameSnapshot`.
_Avoid_: String crudo de log, comando ejecutable expuesto a la UI

**ReplayMode (Modo de Revisión)**:
Modo operativo de solo lectura del adaptador visual en el que se inhabilita la interacción de movimiento sobre el tablero y se delega el control a una barra de transporte temporal que invoca los métodos reversibles `undo()` y `redo()` del motor.
_Avoid_: Tablero interactivo secundario, motor duplicado

**TranscriptionExport (Exportación de Transcripción)**:
Procedimiento del adaptador web que formatea el historial `moveHistory` en una transcripción estructurada letra-número (`e2 -> e4`) con cabecera de partida y genera un archivo descargable `.txt` nombrado con marca temporal (`partida-ajedrez-YYYYMMDD-HHmm.txt`).
_Avoid_: Guardado en disco en el Core, formato binario propietario








