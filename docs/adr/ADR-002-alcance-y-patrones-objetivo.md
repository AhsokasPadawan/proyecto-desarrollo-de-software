# ADR-002: Alcance Funcional Completo y Demostradores de Patrones para Equipo de 6 Desarrolladores

* **Estado:** Aceptado
* **Fecha:** 2026-09-27

## 1. What (Qué decidimos)

Para distribuir equitativamente la carga de ingeniería y defensa oral entre los **6 desarrolladores** del equipo (6 épicas de 4 tickets cada una), el diseño del sistema abarca tanto el **Alcance Obligatorio (1.1)** como los **Demostradores de Patrones de la Sección 1.2**:
1. **Línea Base Obligatoria (1.1):** Tablero $8 \times 8$ (con dimensiones parametrizables $N \times M$), las 6 piezas estándar componiendo `IMovementRule`, alternancia de turnos, capturas, validación de trayectorias/obstáculos y detección activa de jaque (`CheckDetector`).
2. **Fases y Condiciones de Fin de Partida con Patrón `State` (`IGameState`):** `NormalPlayState`, `CheckState`, `CheckmateState`, `StalemateState` y `DrawState` (cubriendo tablas por **Regla de los 50 movimientos**, **Material Insuficiente** y **Triple Repetición de Posición**).
3. **Historial y Reversibilidad con Patrón `Command` (`MoveCommand` + `CommandHistory`):** Soporte de `Undo` / `Redo` garantizando $\text{State}_{\text{before}} \equiv \text{State}_{\text{Act(Undo)}}$ para movimientos normales y especiales.
4. **Movimientos Especiales:** **Coronación de Peón (*Promotion*)**, **Enroque (*Castling*)** y **Captura al Paso (*En Passant*)**, integrados de forma componible y reversibles mediante `Command`.
5. **Oponente Automatizado (IA) con Patrón `Strategy` (`IAiStrategy`):** Estrategias intercambiables en tiempo de ejecución (`RandomAiStrategy` y `GreedyMaterialAiStrategy`).
6. **Sincronización con Patrón `Observer` (`IGameObserver`) y Adaptador Visual Web:** Interfaz única en React + TypeScript + Tailwind CSS.

## 2. Why (Por qué lo elegimos)

1. **Equidad de Complejidad y Defensa Individual para 6 Integrantes:** Permite dividir el proyecto en 6 épicas simétricas de 4 tickets (24 tickets en total), asegurando que cada integrante implemente y defienda al menos un patrón GoF o subsistema algorítmico no trivial con su respectiva suite TDD en memoria.
2. **Cobertura Exhaustiva de la Especificación de Cátedra:** Cubre la totalidad de los patrones candidatos (`Strategy` tanto en reglas de movimiento como en IA, `Command`, `State`, `Observer`) sin comprometer el aislamiento tecnológico del Core.

## 3. When to Break (Cuándo reconsiderar o romper esta decisión)

Esta decisión debe revisarse si:
* El calendario de entrega se comprimiera o el tamaño del equipo se redujera, en cuyo caso las épicas 1, 2, 3 y 6 bastan para entregar un MVP 100% funcional que cumple el alcance obligatorio 1.1.
