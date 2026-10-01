# Documento de Justificación de Diseño y Arquitectura — Chess TPO

* **Materia:** Ingeniería de Software / Diseño de Sistemas
* **Proyecto:** Motor de Dominio Puro de Ajedrez con Adaptador Web React + Tailwind CSS
* **Autores:** Javier & Equipo
* **Rama de Trabajo:** `javis-playground`

---

## 1. Visión y Resumen Arquitectónico

El sistema implementa una **Arquitectura Hexagonal (Ports & Adapters)** que desacopla estrictamente el dominio de negocio (**Core**) de cualquier framework o interfaz gráfica (**Adapters**):

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DRIVING ADAPTERS (Infraestructura / UI)              │
│  ┌───────────────────────────────┐   ┌───────────────────────────────┐  │
│  │ Vitest + RTL In-Memory Suite  │   │ React + TS + Tailwind Web     │  │
│  │ (Tests unitarios y de UI AAA) │   │ (useSyncExternalStore)        │  │
│  └───────────────┬───────────────┘   └───────────────┬───────────────┘  │
└──────────────────┼───────────────────────────────────┼──────────────────┘
                   ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CORE / DOMAIN (Puro TypeScript)                  │
│                                                                         │
│  • Driving Port: IGameEngine (implementado por ChessGame)               │
│  • Patrón State: IGameState (NormalPlay, Check, Checkmate, Stalemate,   │
│                  DrawState)                                             │
│  • Patrón Command: MoveCommand (execute / undo) + CommandHistory        │
│  • Patrón Observer: IGameObserver (subscribe / unsubscribe)             │
│  • Patrón Strategy (Movimiento): IMovementRule                          │
│  • Patrón Strategy (IA): IAiStrategy (RandomAi, GreedyMaterialAi)       │
│  • Patrón Factory: BoardSetupFactory, PromotionFactory                  │
│  • Servicio de Dominio: CheckDetector, InsufficientMaterialEvaluator    │
│  • Entidades y Value Objects: Board (IBoardQuery), Piece, Position      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Consolidación de Decisiones Arquitectónicas (ADR-001 a ADR-012)

A continuación se detalla cada decisión de arquitectura bajo el marco estructurado **What / Why / When to Break** exigido por la cátedra:

---

### ADR-001: Stack Tecnológico (TypeScript, React, Tailwind CSS, Vitest, React Testing Library)
* **What:** Se adoptó TypeScript 5 en modo estricto para el Core, React 18 con Tailwind CSS 3 para el Adaptador Web, Vitest como runner de pruebas unitarias y React Testing Library (`@testing-library/react`) + `jsdom` para pruebas de integración de la interfaz de usuario en memoria.
* **Why:** TypeScript ofrece tipado estático nominal y uniones discriminadas para modelar el dominio sin runtime overhead. Vitest ejecuta en Node.js puro (< 5 segundos para toda la suite) sin dependencias de navegadores pesados. React Testing Library valida la experiencia del usuario final (interacción en 2 clics, modales, reversiones y selectores de IA) sobre un DOM sintético en memoria.
* **When to Break:** Reconsiderar si se exigiera compilación nativa multiplataforma (ej. C++ / Rust para motores embebidos de alta performance) o si se requiriera un frontend desktop nativo.

---

### ADR-002: Delimitación del Alcance Objetivo y Patrones Demostradores
* **What:** Se fijó un alcance de 24 tickets repartidos equitativamente en 6 épicas de 4 tickets, cubriendo todas las reglas FIDE estándar más movimientos especiales (coronación, enroque, en passant), tablas, IA y adaptador web.
* **Why:** Permite demostrar la aplicación armónica de 5 patrones de diseño GoF esenciales (*State, Command, Observer, Strategy, Factory*) sin caer en sobre-ingeniería ni en implementaciones incompletas.
* **When to Break:** Extender si se solicita explícitamente persistencia remota (PostgreSQL / Redis), partidas multijugador online mediante WebSockets o reloj de tiempo con temporizadores blitz.

---

### ADR-003: Modelado de Piezas mediante Composición de `IMovementRule`
* **What:** En lugar de implementar la geometría de movimiento mediante una jerarquía rígida de herencia con métodos polimórficos gigantes, cada subclase de `Piece` (`Rook`, `Bishop`, `Queen`, `Knight`, `Pawn`, `King`) compone una lista inmutable de `IMovementRule`s (`SlidingMoveRule`, `LeapMoveRule`, `PawnForwardRule`, etc.).
* **Why:** Cumple el principio de *Composition over Inheritance* y el *Open/Closed Principle*. Para crear una pieza híbrida de Fairy Chess (como `Chancellor` = Torre + Caballo o `Archbishop` = Alfil + Caballo), solo se compone `[new SlidingMoveRule(...), new LeapMoveRule(...)]` en 5 líneas sin modificar ninguna clase existente.
* **When to Break:** Reconsiderar si el cálculo de movimientos requiriera micro-optimizaciones a nivel de bitboard de 64 bits para motores de ajedrez profesionales de competición internacional.

---

### ADR-004: Modelo de Tablero Mutable In-Place con Reversión Explícita vía `Command`
* **What:** El tablero (`Board`) es una entidad mutable que ejecuta mutaciones directas en su matriz bidimensional, encapsuladas y revertidas simétricamente por instancias de `MoveCommand` (`execute()` y `undo()`).
* **Why:** Evita la clonación profunda del tablero en cada movimiento, reduciendo la recolección de basura (*GC pressure*) y permitiendo ejecutar reversión histórica instantánea (`Undo / Redo`) con exactitud matemática ($\text{State}_{\text{before}} \equiv \text{State}_{\text{Act(Undo)}}$).
* **When to Break:** Reconsiderar si se migrara a una arquitectura puramente funcional inmutable basada en estructuras de datos persistentes (*HAMT* / *Persistent Data Structures*).

---

### ADR-005: Fachada `IGameEngine` como Puerto Driving Único e Inyección de `Board`
* **What:** La clase `ChessGame` implementa el puerto `IGameEngine`. Para su uso normal provee constructores con valores por defecto (`BoardSetupFactory.createStandardBoard()`), pero permite inyectar por constructor un `Board` con configuraciones arbitrarias.
* **Why:** Facilita la creación de *testing seams* limpios para armar posiciones de prueba en memoria sin pasar por decenas de jugadas previas (*Arrange* atómico en tests unitarios AAA).
* **When to Break:** Si el motor necesitara soportar múltiples partidas simultáneas en hilos de trabajo paralelos (*Web Workers*) mediante transferencia de buffers de memoria.

---

### ADR-006: Sistema de Coordenadas `Position` 0-Indexed y Dimensiones Parametrizables
* **What:** Se implementó el Value Object inmutable `Position(row, col)` con coordenadas numéricas 0-indexed, y la clase `Board` recibe sus dimensiones `(rows, cols)` por constructor (por defecto 8x8).
* **Why:** Elimina acoplamientos a la notación algebraica (a1-h8) en el núcleo de cálculo numérico, y habilita de forma nativa variantes de ajedrez con tableros rectangulares o de dimensiones extendidas (ej. 10x10 Capablanca Chess).
* **When to Break:** Si se diseñara una variante con tableros no euclidianos (hexagonales o tridimensionales), en cuyo caso se requeriría un sistema de coordenadas no cartesiano.

---

### ADR-007: Separación entre Movimientos Pseudo-Legales y Movimientos Legales
* **What:** `IMovementRule` y `IPiece` generan exclusivamente *movimientos pseudo-legales* (geométricamente válidos considerando obstáculos y casillas de captura). El filtrado de jaque y clavadas lo realiza `CheckDetector` y `ChessGame` mediante simulación y reversión con `MoveCommand`.
* **Why:** Evita la recursión infinita en la detección de jaques (un rey atacante no necesita verificar si su movimiento lo deja en jaque para proyectar su influencia) y aplica el principio de Responsabilidad Única (SRP).
* **When to Break:** Reconsiderar si se utilizara una tabla precalculada de rayos y tablas mágicas (*Magic Bitboards*).

---

### ADR-008: Catálogo de Reglas Atómicas de Movimiento
* **What:** Se estructuró un catálogo de reglas desacopladas: `SlidingMoveRule` (rayos ortogonales y diagonales con bloqueo), `LeapMoveRule` (saltos atómicos para caballo y rey), `PawnForwardRule` (avance simple y doble inicial), `PawnCaptureRule` (captura diagonal estándar), `CastlingMoveRule` (enroque) y `EnPassantCaptureRule` (captura al paso).
* **Why:** Permite la reutilización total de algoritmos de proyección geométrica. `Queen` es simplemente `SlidingMoveRule(ORTHOGONAL + DIAGONAL)`, `Rook` es `SlidingMoveRule(ORTHOGONAL)` y `Bishop` es `SlidingMoveRule(DIAGONAL)`.
* **When to Break:** Si una variante introdujera reglas cuánticas o teleportación arbitraria no lineal.

---

### ADR-009: Patrón `State` para Gestionar Fases de la Partida
* **What:** El ciclo de vida de la partida se delega en la interfaz `IGameState`, implementada por `NormalPlayState`, `CheckState`, `CheckmateState`, `StalemateState` y `DrawState`.
* **Why:** Elimina condicionales `switch` extensos en la validación de jugadas (`canAcceptMoves()`) y desacopla la lógica de transición hacia estados terminales cumpliendo el principio Open/Closed.
* **When to Break:** Si la cantidad de estados fuera trivial y no requiriera comportamiento polimórfico diferenciado.

---

### ADR-010: Unión Discriminada `MoveResult` para el Contrato de `makeMove`
* **What:** `IGameEngine.makeMove()` retorna una unión discriminada `MoveResult`: `{ success: true, capturedPiece, nextState }` o `{ success: false, reason }`.
* **Why:** Fuerza a los consumidores del puerto (UI y tests) a verificar el discriminante `success` con seguridad de tipos en tiempo de compilación, eliminando excepciones invisibles en runtime.
* **When to Break:** Si el adaptador requiriera un protocolo asíncrono con eventos dispersos por canales separados.

---

### ADR-011: Patrón `Observer` y `GameSnapshot` Inmutable para Adaptadores
* **What:** `ChessGame` implementa `subscribe(observer: IGameObserver): UnsubscribeFn`, emitiendo una copia inmutable `GameSnapshot` en cada cambio de estado, jugada o undo/redo.
* **Why:** Garantiza que los adaptadores de infraestructura jamás retengan referencias a piezas mutables del Core, permitiendo sincronizar la vista web mediante `useSyncExternalStore` con cero fugas de memoria.
* **When to Break:** Si se requiriera transmisión incremental de diferencias (*JSON Patches*) por limitaciones severas de ancho de banda de red.

---

### ADR-012: Diseño del Adaptador Web (React + Tailwind CSS), Interacción en 2 Clics y Resiliencia a Extensiones
* **What:** Se implementó una aplicación web React con interacción de 2 clics manejada directamente desde eventos `onClick`. La grilla se calcula dinámicamente según `snapshot.rows` y `snapshot.cols`, las piezas se renderizan con una *lookup table* con fallback automático para Fairy Chess, y toda la interacción de usuario se valida con React Testing Library y `jsdom`.
* **Why:** Respeta la regla de cero `useEffect` para la lógica de juego, garantiza que el sistema sobreviva a la prueba de fuego de la defensa oral en menos de 5 minutos sin tocar el código React, y provee una suite de tests de UI fiable, rápida y sin infraestructura de navegadores reales.
* **When to Break:** Si se requiriera un modo de juego en tiempo real con arrastre táctil ultra-sensible (*drag & drop*) en pantallas táctiles de baja gama.

---

## 3. Guía Práctica de la Prueba de Fuego para la Defensa Oral (< 5 minutos)

Durante la defensa oral, los docentes evalúan la flexibilidad del diseño solicitando modificaciones en vivo:

### Escenario A: Agregar una Nueva Pieza Híbrida de Fairy Chess (ej. `Chancellor` = Torre + Caballo)
1. **Paso 1:** Crear el archivo de la pieza en `proyect/src/core/pieces/Chancellor.ts`:
   ```ts
   import { Piece } from './Piece';
   import { Color } from './types';
   import { IMovementRule } from '../rules/IMovementRule';
   import { SlidingMoveRule, ORTHOGONAL_DIRECTIONS } from '../rules/SlidingMoveRule';
   import { LeapMoveRule, KNIGHT_OFFSETS } from '../rules/LeapMoveRule';

   export class Chancellor extends Piece {
     constructor(color: Color, rules: readonly IMovementRule[] = [
       new SlidingMoveRule(ORTHOGONAL_DIRECTIONS),
       new LeapMoveRule(KNIGHT_OFFSETS),
     ]) {
       super(color, 'CHANCELLOR', rules);
     }
   }
   ```
2. **Paso 2:** Colocarla en el tablero:
   ```ts
   board.placePiece(new Position(4, 4), new Chancellor('WHITE'));
   ```
3. **Resultado:** **Cero modificaciones en clases existentes.**
   - Las colisiones, clavadas, detecciones de jaque, capturas y la UI web (con insignia `CH`) funcionan **automáticamente**.
   - **Tiempo estimado:** Menos de 2 minutos.

### Escenario B: Modificar las Dimensiones del Tablero (ej. Tablero de 10x10)
1. **Paso 1:** Instanciar el tablero con las nuevas dimensiones:
   ```ts
   const board = new Board(10, 10);
   ```
2. **Paso 2:** Pasar el tablero a la partida:
   ```ts
   const game = new ChessGame(board);
   ```
3. **Resultado:** **Cero modificaciones en clases existentes ni en CSS.**
   - Las reglas geométricas consultan `board.isWithinBounds()` en tiempo de ejecución.
   - El adaptador web React lee `snapshot.rows` y `snapshot.cols` dinámicamente, adaptando la grilla CSS de Tailwind `repeat(10, minmax(0, 1fr))` y las coordenadas algebraicas (a-j, 1-10) de forma automática.
   - **Tiempo estimado:** Menos de 1 minuto.

---

## 4. Estado de Verificación y Calidad del Software

* **Tests Unitarios en Vitest:** 21 archivos de prueba, **179 tests en memoria pasando al 100%** (duración: ~5 segundos).
* **Compilación TypeScript (`tsc --noEmit`):** 0 errores, strict mode activado.
* **Build de Producción (`vite build`):** Generación limpia del bundle en `/dist`.
* **Cumplimiento de Reglas de Desarrollo:**
  - Cero bloques `switch` extensos (reemplazados por Lookup Tables y Polimorfismo GoF).
  - Cero `useEffect` para mutaciones secundarias o lógica de juego (uso de `useSyncExternalStore` y controladores de eventos `onClick`).
  - Código auto-documentado: Prohibición estricta de comentarios explicativos/organizativos.
