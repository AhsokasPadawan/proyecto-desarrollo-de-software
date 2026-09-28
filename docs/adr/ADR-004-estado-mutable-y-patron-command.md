# ADR-004: Modelo de Tablero Mutable In-Place con Reversión Explícita vía Command

* **Estado:** Aceptado
* **Fecha:** 2026-09-27

## 1. What (Qué decidimos)

La entidad `Board` mantiene una estructura de datos **mutable in-place** para representar la grilla de casillas y la ubicación de las piezas.
* Las operaciones de modificación sobre `Board` (colocar, mover o retirar piezas) mutan el estado interno de la instancia activa.
* Cada jugada ejecutada se encapsula en una implementación del patrón **`Command` (`MoveCommand`)** que almacena las coordenadas `from`, `to` y la referencia a la pieza capturada (`capturedPiece`, si existiera).
* `MoveCommand.execute()` aplica la mutación sobre `Board`, mientras que `MoveCommand.undo()` revierte exactamente la mutación restaurando la pieza movida a `from` y reubicando la `capturedPiece` en `to`, cumpliendo la invariante $\text{State}_{\text{before}} \equiv \text{State}_{\text{Act(Undo)}}$.

## 2. Why (Por qué lo elegimos)

1. **Demostración Genuina del Patrón `Command`:** En un modelo orientado a objetos clásico, el patrón `Command` brilla cuando encapsula mutadores de estado y su operación inversa explícita (`execute()` / `undo()`), demostrando con claridad cómo revertir efectos sobre una entidad sin depender de copias completas de estado.
2. **Eficiencia Espacial:** Se mantiene una única instancia del tablero en memoria durante toda la vida de la partida, sin alojar nuevas grillas por cada movimiento o simulación.
3. **Reutilización del Mecanismo de Reversión:** La misma lógica de aplicar y deshacer un movimiento (`execute` $\rightarrow$ evaluar amenaza $\rightarrow$ `undo`, o un método de simulación acotado) permite verificar si un movimiento candidato deja al propio Rey en jaque manteniendo intacto el estado del tablero al finalizar la consulta.

## 3. When to Break (Cuándo reconsiderar o romper esta decisión)

Esta decisión debería revisarse si:
* Se introdujera evaluación concurrente o paralela de jugadas (por ejemplo, múltiples *workers* explorando ramas de un árbol de búsqueda simultáneamente sobre el mismo tablero), donde el estado mutable compartido provocaría condiciones de carrera (*race conditions*).
* Los adaptadores gráficos (como React) sufrieran bugs de sincronización por mutación de referencias; para prevenirlo en la frontera Core-Adapter, el puerto de consulta del Core entregará una vista/snapshot de lectura o copia superficial al adaptador visual en cada render.
