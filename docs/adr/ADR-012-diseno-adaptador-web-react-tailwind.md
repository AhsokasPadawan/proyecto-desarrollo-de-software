# ADR-012: Diseño del Adaptador Web Único (React + Tailwind CSS), Interacción en 2 Clics y Renderizado Resiliente a Extensiones

* **Estado:** Aceptado
* **Fecha:** 2026-09-27

## 1. What (Qué decidimos)

1. **Adaptador de Usuario Único (React + TypeScript + Tailwind CSS):**
   * Se prescinde del adaptador de consola (CLI). El único adaptador interactivo de usuario será la aplicación web en `proyect/src/adapters/web/`, estilizada con **Tailwind CSS** (mientras la suite de tests de Vitest actúa como el segundo consumidor independiente del puerto `IGameEngine`).
2. **Modelo de Interacción en 2 Clics (Sin Drag & Drop):**
   * **Primer clic (Selección):** Al hacer clic en una casilla con una pieza del jugador activo, el componente guarda localmente `selectedPosition` y consulta `game.getLegalMoves(selectedPosition)` para resaltar las casillas destino válidas (diferenciando visualmente casillas vacías de capturas).
   * **Segundo clic (Ejecución o Cambio de Selección):** Si el usuario hace clic en otra pieza de su propio color, cambia la selección a esa casilla; si hace clic en cualquier otro destino, invoca `game.makeMove(selectedPosition, target)` directamente desde el manejador `onClick`. Si el `MoveResult` es `{ success: false, reason }`, se muestra el motivo traducido mediante una *lookup table* (`REJECTION_MESSAGES[result.reason]`).
3. **Vista Única con Grilla Dinámica $N \times M$ y Fallback para *Fairy Chess*:**
   * La interfaz presenta en una sola pantalla el tablero y un panel lateral de estado/controles (indicador de turno, banner de fase `IN_PROGRESS / CHECK / CHECKMATE / STALEMATE`, botones `Undo`, `Redo` y `Reiniciar Partida`).
   * El tablero se dimensiona dinámicamente a partir de `snapshot.rows` y `snapshot.cols`.
   * Las piezas se renderizan consultando una *lookup table* de íconos/símbolos para las 6 piezas estándar, incluyendo un **renderizado *fallback* automático** (insignia con las iniciales de `piece.type` estilizada según `piece.color`) para cualquier nueva pieza inyectada durante la defensa oral.

## 2. Why (Por qué lo elegimos)

1. **Foco del Equipo en un Único Adaptador Visual de Alta Calidad:** Concentrar el esfuerzo de interfaz en React + Tailwind CSS evita mantener un parser de texto y renderizador ASCII de terminal que aportaría valor redundante teniendo ya la suite de tests en memoria y la UI web.
2. **Flujo Unidireccional Limpio en React (Cero `useEffect` para lógica de juego):** La interacción de 2 clics se resuelve íntegramente en los manejadores de eventos `onClick`, mientras la sincronización con `IGameEngine` ocurre a través del contrato `Observer` (`subscribe`/`unsubscribe` + `getSnapshot` vía `useSyncExternalStore`).
3. **Inmunidad de la UI en la Prueba de Fuego ($< 15\text{ min}$):** Al leer `rows`/`cols` dinámicamente del `GameSnapshot` y proveer un *fallback* visual para tipos de pieza desconocidos, agregar una pieza híbrida o cambiar las dimensiones del tablero en el Core durante la defensa oral se refleja de inmediato en la pantalla sin tocar código de React ni clases de Tailwind.

## 3. When to Break (Cuándo reconsiderar o romper esta decisión)

Esta decisión debería revisarse si:
* Se necesitara ejecutar partidas automatizadas por lotes en un servidor de integración continua sin entorno de navegador (por ejemplo, torneos entre motores por consola), caso en el cual se agregaría un adaptador CLI/Headless consumiendo el mismo puerto `IGameEngine`.
