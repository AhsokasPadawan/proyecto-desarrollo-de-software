# ADR-011: Patrón `Observer` con `unsubscribe` Explícito y `GameSnapshot` para Sincronizar Adaptadores

* **Estado:** Aceptado
* **Fecha:** 2026-09-27

## 1. What (Qué decidimos)

`ChessGame` (a través del puerto `IGameEngine`) implementa el patrón de comportamiento **`Observer`** combinado con la entrega de una vista inmutable **`GameSnapshot`**:
1. **Contrato de Suscripción y Teardown Explícito:**
   * `subscribe(observer: IGameObserver): UnsubscribeFn` (y método explícito `unsubscribe(observer: IGameObserver): void`), cumpliendo el mandato de limpieza de referencias de los estándares de diseño.
   * Cada vez que el estado del juego cambia (por `makeMove`, `undo` o `redo`), `ChessGame` notifica a todos los observadores registrados enviándoles un nuevo `GameSnapshot` inmutable.
2. **Integración Limpia en React sin `useEffect` Manual:**
   * Al exponer `subscribe` (con función de *teardown*) y `getSnapshot()`, el adaptador React puede conectarse de forma declarativa mediante `useSyncExternalStore` (o múltiples observadores desacoplados como un logger de consola y la vista web simultáneamente) sin necesidad de encadenar `useEffect` + `useState` manuales.

## 2. Why (Por qué lo elegimos)

1. **Demostración Académica Completa de Patrones GoF en el Core:** Sumado a Composición/`Strategy` (`IMovementRule`), `Command` (`MoveCommand`), `State` (`IGameState`) y `Factory` (`PieceFactory` / `BoardSetup`), el patrón `Observer` demuestra cómo desacoplar el motor de dominio de múltiples vistas o escuchas simultáneos (por ejemplo, actualizar el tablero visual y un panel de historial/telemetría sin que `ChessGame` conozca a los adaptadores).
2. **Prevención de Fugas de Memoria (*Memory Leaks*):** Proveer rutinas explícitas de `unsubscribe` garantiza que cuando un adaptador o componente deja de escuchar, la referencia se elimina del `Set` interno de observadores.

## 3. When to Break (Cuándo reconsiderar o romper esta decisión)

Esta decisión debería revisarse si:
* El motor se ejecutara como una función *serverless* pura de tipo *request/response* sin estado en memoria entre invocaciones, donde no existen suscriptores vivos durante la partida.
