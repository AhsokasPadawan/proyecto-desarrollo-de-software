# ADR-014: Relojes de Cuenta Regresiva Independientes para Modo Humano vs Humano

## Estado
Aprobado (Tras sesión de Grilling)

## Contexto
El sistema de ajedrez actualmente soporta partidas en modo Humano vs Humano, Humano vs IA Aleatoria y Humano vs IA Voraz, contando con historial de movimientos, exportación de transcripciones y modo replay (ADR-013).

Para enriquecer la experiencia competitiva entre dos personas en el mismo dispositivo, se requiere incorporar un sistema de control de tiempo (relojes de ajedrez independientes para Blancas y Negras). Dado que contra la IA las respuestas son instantáneas, este mecanismo se destina exclusivamente al modo Humano contra Humano de forma opcional.

## Decisiones de Diseño Tomadas

### 1. Modelo de Dominio y Máquina de Estados (Core)
* Se incorpora el estado terminal `'TIMEOUT'` a `GameStateKind` en el Core (`src/core/ports/MoveResult.ts` y máquina de estados `GameState`).
* Cuando el reloj de un jugador alcanza `00:00`, se invoca en el motor `ChessGame` el método de dominio `declareTimeout(timedOutColor: Color)` que transiciona la partida a `'TIMEOUT'` y fija como `winner` al oponente.
* Al ser un estado terminal reglamentario, se actualiza `isTerminalState` para habilitar las acciones post-partida ("Revisar Partida" y "Exportar Partida").

### 2. Ciclo de Vida y Activación del Reloj
* **Configuración Previa:** Antes de iniciar la partida, los jugadores pueden activar la opción "Jugar con Reloj" y ajustar sus minutos de manera independiente.
* **Tiempo por Defecto:** 10 minutos (600 segundos) para cada jugador.
* **Inicio Formal:** La partida y el reloj inician al presionar un botón explícito "Iniciar Partida", comenzando a descontar el tiempo de las Blancas para su primer movimiento.
* **Alternancia:** Cada jugada válida (`makeMove`) pausa el reloj del jugador que movió y activa el del rival.
* **Pausa / Reanudación:** Durante la partida se dispone de un botón "Pausar Tiempo" / "Reanudar Tiempo". Al pausar, se detienen los contadores y se bloquea la interacción con el tablero hasta reanudar.

### 3. Exclusión de Acciones de Rebobinado (`undo` / `redo`)
* Al seleccionar la modalidad con reloj, los botones "Deshacer" y "Rehacer" se ocultan de la interfaz, garantizando que los movimientos sean definitivos y evitando problemas de sincronización de tiempos revertidos.

### 4. Controles de Ajuste Independiente en la UI
* Para cada jugador se proveen:
  * Presets rápidos: `3 min` (Blitz), `5 min` (Blitz), `10 min` (Rápido, Default), `15 min` (Rápido).
  * Botones de ajuste fino `+` y `-` en un rango de 1 a 60 minutos.

### 5. Distribución Visual y Geometría en Pantalla
* **Reloj de Negras:** Ubicado en una barra horizontal superior inmediatamente arriba del tablero.
* **Reloj de Blancas:** Ubicado en una barra horizontal inferior entre el tablero y la barra de acciones.
* **Ancho Idéntico:** Ambas barras de reloj tienen exactamente el mismo ancho que el marco del tablero (474px), preservando la simetría y alineación con el panel de partida lateral.
* **Resaltado y Alertas:**
  * El reloj del jugador con el turno activo se destaca con borde y fondo activo.
  * Formato digital estándar `mm:ss`.
  * Alerta de tiempo bajo: Cuando el tiempo restante es menor a 30 segundos, el contador conmuta a color rojo de advertencia con un suave parpadeo.

### 6. Integración con Modo Replay y Exportación
* **Modo Replay:** Los relojes se mantienen visibles congelados con los tiempos finales registrados al concluir la partida.
* **Exportación de Transcripción (.txt):** El archivo exportado detalla en su encabezado si la partida se disputó con reloj y, de haber finalizado por tiempo, indica el resultado: `Resultado: Victoria de [Blancas/Negras] por Tiempo Agotado`.

## Consecuencias
* **Positivas:**
  * Experiencia de juego completa y reglamentaria para partidas competitivas entre humanos.
  * Respeto estricto del límite de responsabilidades (el Core conoce el estado `'TIMEOUT'` y el ganador, el temporizador web gestiona los intervalos sin violar reglas de hooks).
  * Diseño visual cohesivo y perfectamente integrado en el layout widescreen libre de scroll.
* **Trade-offs:**
  * No se permite deshacer jugadas en partidas con reloj (decisión consciente en favor de la rigurosidad competitiva).
