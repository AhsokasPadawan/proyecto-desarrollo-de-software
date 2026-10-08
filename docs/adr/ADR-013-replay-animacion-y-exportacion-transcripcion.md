# ADR-013: Modo Replay In-Place, Animación de Jugadas con Temporizadores Nativos y Transcripción Letra-Número Descargable

* **Estado:** Aceptado
* **Fecha:** 2026-10-01

## 1. What (Qué decidimos)

1. **Desencadenamiento Condicional en Estados Terminales con Acciones Diferenciadas:**
   * La funcionalidad de revisión y exportación se activa de manera exclusiva cuando la partida alcanza un estado terminal de fin de juego (`CHECKMATE`, `STALEMATE`, `DRAW_FIFTY_MOVES`, `DRAW_INSUFFICIENT_MATERIAL`, `DRAW_THREEFOLD_REPETITION`).
   * Se presentan dos botones independientes en el panel de control: `[Revisar Partida]` (para iniciar el reproductor interactivo y animación) y `[Exportar Partida]` (para descargar directamente la transcripción en archivo `.txt`).

2. **Replay In-Place con Tablero en Modo Solo Lectura:**
   * La reproducción se ejecuta sobre la misma instancia de `ChessGame` mediante el rebobinado y avance reversible provisto por `undo()` y `redo()`, sin duplicar el estado del tablero ni instanciar un motor secundario.
   * Al ingresar en revisión, el tablero entra en modo solo lectura (`readOnly`), inhabilitando cualquier selección o movimiento manual de piezas.
   * La UI ofrece un botón explícito `[Salir de Revisión]` que reposiciona el tablero en el estado final alcanzado en la partida.

3. **Modelo de Dominio para el Historial de Jugadas (`MoveRecord` en `GameSnapshot`):**
   * El puerto `GameSnapshot` se enriquece con una colección inmutable `moveHistory: readonly MoveRecord[]`.
   * Cada `MoveRecord` contiene: índice secuencial, turno (`Color`), tipo de pieza (`PieceType`), coordenadas algebraicas origen y destino (`from` y `to` obtenidas mediante `Position.toAlgebraic()`), pieza capturada opcional e indicadores booleanos de movimientos especiales (`isCastling`, `isPromotion`).
   * `ChessGame` registra cada jugada ejecutada con éxito y mantiene su sincronización ante operaciones de `undo` y `redo`.

4. **Formato Enriquecido de Transcripción y Descarga en `.txt`:**
   * La transcripción adopta un formato estructurado con metadatos de partida (Modo de Juego, Resultado, Total de movimientos) seguido de la secuencia de jugadas por rondas con coordenadas letra-número legibles:
     `1. Blancas: PEÓN (e2 -> e4) | Negras: PEÓN (e7 -> e5)`
   * La exportación se resuelve íntegramente en el adaptador web generando un `Blob` de texto en memoria y disparando la descarga con nomenclatura basada en timestamp: `partida-ajedrez-YYYYMMDD-HHmm.txt`.
   * El Core se mantiene 100% puro, libre de APIs de I/O, `Blob` o manipulación de archivos del navegador.

5. **Reproductor con Controles de Transporte y Animación sin `useEffect` Reactivo:**
   * La interfaz de revisión provee controles de transporte: `|<<` (Inicio), `<` (Anterior), `Play / Pausa`, `>` (Siguiente), `>>|` (Final), selector de velocidad (`0.5s`, `1s`, `2s`), indicador `"Jugada X de Y"` y una lista scrolleable interactiva que permite saltar directamente a cualquier movimiento.
   * La animación automática de reproducción se gestiona mediante temporizadores nativos de JavaScript (`setInterval` / `clearInterval`) disparados exclusivamente desde los controladores de eventos `onClick` (`handleStartPlayback` y `handlePausePlayback`), prohibiendo el uso de `useEffect` para encadenar transiciones de estado secundarias.

6. **Feedback Visual de Jugada Activa:**
   * Durante la reproducción (manual o automática), el tablero (`ChessBoardView`) destaca visualmente las casillas `from` y `to` del movimiento actualmente renderizado para una clara percepción visual del desplazamiento.

## 2. Why (Por qué lo elegimos)

1. **Reutilización Óptima del Patrón Command:** Dado que `MoveCommand` y `CommandHistory` ya garantizan matemáticamente la invariante $\text{State}_{\text{before}} \equiv \text{State}_{\text{Act(Undo)}}$, la navegación temporal de la partida reutiliza el mecanismo existente sin escribir código de simulación redundante.
2. **Preservación del Aislamiento Core vs. Adapter:** El Core únicamente expone datos puros de las jugadas (`MoveRecord`) dentro del contrato `GameSnapshot`. Toda la orquestación temporal, generación de strings legibles y manipulación de archivos `.txt` reside en el adaptador web.
3. **Flujo Unidireccional y Mantenibilidad en React:** Orquestar el avance del reproductor en los manejadores de eventos con timers explícitos evita condiciones de carrera, re-renders descontrolados y deuda técnica asociada al abuso de `useEffect`.
4. **Claridad para la Defensa Oral y Presentación:** Disponer de una reproducción animada con velocidad ajustable y exportación de bitácora en formato letra-número potencia la capacidad de demostración del sistema y la verificación de invariantes en vivo.

## 3. When to Break (Cuándo reconsiderar o romper esta decisión)

Esta decisión debería revisarse si:
* Se requiriera persistir o reproducir partidas en servidores remotos sin interfaz gráfica, en cuyo caso la generación de transcripción se abstraería detrás de un puerto de formateo reutilizable por adaptadores CLI o de backend.
* Se implementara edición de jugadas hacia ramas alternativas (*branching history* / árboles de análisis tipo PGN), lo que demandaría sustituir la pila lineal de `CommandHistory` por un árbol de movimientos (*MoveTree*).
