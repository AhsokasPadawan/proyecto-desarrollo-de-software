# Resumen Ejecutivo — Cierre de Etapa 2: Design (`design-summary.md`)

**Para:** Equipo de desarrollo (6 integrantes) — Proyecto Ingeniería de Software  
**Objetivo:** Presentar y ratificar el diseño arquitectónico, las especificaciones funcionales (`to-spec`) y la distribución simétrica de **6 Épicas $\times$ 4 Tickets (24 Tickets)** antes de iniciar la **Etapa 3: Implementation (TDD en ramas)**.

---

## 1. Artefactos Generados en la Etapa 2

1. **Arquitectura y Diagrama UML (`grill-with-docs`):**
   * [`docs/architecture.md`](architecture.md): Límites Hexagonales (*Core vs. Adapters*), estructura de directorios en `proyect/`, tabla de patrones GoF, Diagrama de Clases UML y estrategia para la prueba de fuego ($<15\text{ min}$).
   * [`docs/glossary.md`](glossary.md): Lenguaje ubicuo canónico del dominio.
   * **12 ADRs (`docs/adr/ADR-001..012`)** redactados bajo la matriz obligatoria **What / Why / When to Break**.
2. **Especificación Funcional y Técnica (`to-spec`):**
   * [`docs/spec.md`](spec.md): Historias de Usuario, contratos TypeScript de `IGameEngine`, `MoveResult` y `GameSnapshot`, y definición de los 2 *seams* públicos de prueba bajo el patrón **AAA**.
3. **Desglose en Épicas y Tickets (`to-tickets`):**
   * [`docs/backlog.md`](backlog.md) + 24 archivos de tickets en `docs/tickets/<epica>/<NN>-<slug>.md`.

---

## 2. Resumen de Decisiones Arquitectónicas Clave (ADRs)

* **Stack (`ADR-001`, `ADR-012`):** Core 100% en TypeScript puro sin dependencias externas + Vitest en memoria + Único adaptador de usuario en React, TypeScript y Tailwind CSS.
* **Composición sobre Herencia (`ADR-003`, `ADR-008`):** Las 6 piezas nominales (`Pawn`, `Rook`, `Knight`, `Bishop`, `Queen`, `King`) extienden una clase base superficial `Piece` y componen estrategias `IMovementRule` (`SlidingMoveRule`, `LeapMoveRule`, `PawnForwardRule`, `PawnCaptureRule`), operando sobre `IBoardQuery` (solo lectura).
* **Tablero Mutable y Patrón `Command` (`ADR-004`, `ADR-006`):** `Board` muta *in-place* con dimensiones parametrizables `(rows, cols)` y `Position` 0-indexed inmutable; `MoveCommand` encapsula `execute()` y `undo()` garantizando $\text{State}_{\text{before}} \equiv \text{State}_{\text{Act(Undo)}}$.
* **Filtrado de Jaque y Patrones `State`, `Strategy` y `Observer` (`ADR-007`, `ADR-009`, `ADR-010`, `ADR-011`):**
  * `CheckDetector` evalúa amenazas y `ChessGame` filtra `Legal Move`s simulando y revirtiendo cada candidato con `MoveCommand`.
  * `IGameState` modela polimórficamente las fases (`NormalPlayState`, `CheckState`, `CheckmateState`, `StalemateState`, `DrawState`).
  * `IAiStrategy` (`RandomAiStrategy`, `GreedyMaterialAiStrategy`) modela el oponente automatizado intercambiable.
  * `IGameObserver` (`subscribe` / `unsubscribe`) notifica el `GameSnapshot` inmutable al adaptador React vía `useSyncExternalStore` (sin usar `useEffect` para sincronizar estado de juego).

---

## 3. Distribución Equitativa para los 6 Desarrolladores (6 Épicas $\times$ 4 Tickets)

| Épica | Responsabilidad Principal y Patrón Defendible | Tickets |
| :--- | :--- | :---: |
| **1. `01-tablero-coordenadas-y-base`** | `Position` (Value Object), `Board` (`IBoardQuery` con ISP), `BoardSetupFactory` y `CheckDetector`. | `01` a `04` |
| **2. `02-piezas-y-reglas-geometricas`** | Composición (`IMovementRule`), las 6 clases de `Piece` y demostrador *Open/Closed* (*Fairy Chess* + tablero $N \times M$). | `05` a `08` |
| **3. `03-motor-turnos-command-y-jaque`** | Patrón `Command` (`MoveCommand`, `CommandHistory`), motor `ChessGame` (`MoveResult`), clavadas y patrón `Observer`. | `09` a `12` |
| **4. `04-fases-state-y-condiciones-fin`** | Patrón `State` (`IGameState`: jaque, jaque mate, ahogado) y tablas (50 movimientos, material insuficiente, triple repetición). | `13` a `16` |
| **5. `05-movimientos-especiales-y-strategy-ia`** | Coronación, Enroque, *En Passant* reversibles y patrón `Strategy` para IA (`RandomAiStrategy`, `GreedyMaterialAiStrategy`). | `17` a `20` |
| **6. `06-adaptador-web-y-entrega`** | Adaptador React + Tailwind CSS (grilla $N \times M$, 2 clics, panel de control/IA) y sincronización final de UML + documento de defensa. | `21` a `24` |

---

## 4. Cómo Iniciar la Etapa 3 (Implementation)

1. Comenzar por la frontera desbloqueada en [`docs/backlog.md`](backlog.md): **Ticket `01` (`ticket/01-scaffolding-y-position`)**.
2. Una vez mergeados los tickets base (`01`–`03`), se desbloquea el desarrollo en paralelo de las Épicas 2 y 3 (`04`, `05`, `06`, `07`, `09`).
3. En cada ticket, crear la rama `ticket/<NN>-<slug>` desde `main` y ejecutar la skill `implement` (que invoca obligatoriamente `tdd` bajo el ciclo Red $\rightarrow$ Green con tests **AAA** en memoria).
