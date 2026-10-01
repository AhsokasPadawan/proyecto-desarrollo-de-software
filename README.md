# Chess TPO — Motor de Ajedrez Orientado a Dominio con Adaptador Web React

Proyecto universitario de **Ingeniería de Software / Diseño de Sistemas**. Consiste en un motor de ajedrez puro (*Domain-Driven*), fuertemente tipado en **TypeScript**, desacoplado de dependencias externas bajo **Arquitectura Hexagonal (Ports & Adapters)** y acompañado por un adaptador web moderno e interactivo construido con **React + Tailwind CSS**.

---

## 1. Visión y Principios Arquitectónicos

El sistema implementa una estricta separación entre la lógica de negocio (**Core**) y los puntos de entrada e infraestructura (**Adapters**):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DRIVING ADAPTERS (Infraestructura / UI)                  │
│  ┌───────────────────────────────┐       ┌───────────────────────────────┐  │
│  │ Vitest + RTL In-Memory Suite  │       │ React + TS + Tailwind Web     │  │
│  │ (209 tests unitarios y de UI) │       │ (useSyncExternalStore)        │  │
│  └───────────────┬───────────────┘       └───────────────┬───────────────┘  │
└──────────────────┼───────────────────────────────────────┼──────────────────┘
                   │ Invoca IGameEngine / Seams            │ Invoca IGameEngine + Suscribe Observer
                   ▼                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CORE / DOMAIN (Puro TypeScript)                     │
│                                                                             │
│  • Driving Port: IGameEngine (implementado por ChessGame)                   │
│  • Patrón State: IGameState (NormalPlay, Check, Checkmate, Stalemate, Draw) │
│  • Patrón Command: MoveCommand (execute / undo) + CommandHistory            │
│  • Patrón Observer: IGameObserver (subscribe / unsubscribe) + GameSnapshot │
│  • Patrón Strategy (Movimiento): IMovementRule (Sliding, Leap, Pawn, Enroque)│
│  • Patrón Strategy (IA): IAiStrategy (RandomAi, GreedyMaterialAi)           │
│  • Patrón Factory: BoardSetupFactory, PromotionFactory                      │
│  • Servicios de Dominio: CheckDetector, InsufficientMaterial, PositionHasher│
│  • Entidades y Objetos de Valor: Board (IBoardQuery), Piece, Position       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Patrones de Diseño GoF Demostrados en el Core

| Patrón GoF | Rol en el Sistema | Clases / Interfaces Clave |
| :--- | :--- | :--- |
| **State** | Modela el ciclo de vida y las fases de juego dinámicamente sin condicionales de estado dispersos. | [`IGameState`](proyect/src/core/game/IGameState.ts), `NormalPlayState`, `CheckState`, `CheckmateState`, `StalemateState`, `DrawState` |
| **Command** | Encapsula cada movimiento como un comando reversible con soporte completo de Deshacer/Rehacer. | [`ICommand`](proyect/src/core/game/ICommand.ts), [`MoveCommand`](proyect/src/core/game/MoveCommand.ts), [`CommandHistory`](proyect/src/core/game/CommandHistory.ts) |
| **Observer** | Notifica cambios de estado de manera reactiva e inmutable a los adaptadores externos desacoplados. | [`IGameObserver`](proyect/src/core/ports/IGameObserver.ts), [`GameSnapshot`](proyect/src/core/ports/GameSnapshot.ts) |
| **Strategy (Movimiento)** | Descompone las trayectorias de piezas en reglas geométricas atómicas y componibles (*Composición sobre Herencia*). | [`IMovementRule`](proyect/src/core/rules/IMovementRule.ts), `SlidingMoveRule`, `LeapMoveRule`, `PawnForwardRule`, `PawnCaptureRule`, `CastlingMoveRule`, `EnPassantCaptureRule` |
| **Strategy (IA)** | Permite alternar en tiempo de ejecución oponentes automatizados con diferentes niveles de sofisticación. | [`IAiStrategy`](proyect/src/core/strategy/IAiStrategy.ts), [`RandomAiStrategy`](proyect/src/core/strategy/RandomAiStrategy.ts), [`GreedyMaterialAiStrategy`](proyect/src/core/strategy/GreedyMaterialAiStrategy.ts) |
| **Factory Method / Factory** | Centraliza la creación e inicialización de tableros estándar y la promoción de piezas. | [`BoardSetupFactory`](proyect/src/core/board/BoardSetupFactory.ts), [`PromotionFactory`](proyect/src/core/pieces/PromotionFactory.ts) |

---

## 2. Puesta en Marcha Rápida (Quick Start)

### Prerrequisitos
* **Node.js** (versión 18 LTS o superior)
* **npm** (incluido con Node.js)

### Instalación de dependencias
Desde la raíz del proyecto:
```bash
cd proyect
npm install
```

### Ejecutar la Aplicación Web (Frontend + Motor Integrado)
```bash
npm run dev
```
Abre en tu navegador la URL informada en la consola (por defecto: **`http://localhost:5173/`**).

### Ejecutar la Suite de Pruebas Unitarias y de Integración
Toda la batería de tests corre $100\%$ en memoria sin dependencias de red ni navegadores pesados:
```bash
npm test
```
Para ejecutar en modo interactivo en vivo mientras programas:
```bash
npm run test:watch
```

### Compilar para Producción
```bash
npm run build
npm run preview
```

---

## 3. Estructura del Repositorio y Código Fuente

```
proyecto-desarrollo-de-software/
├── README.md                      # Entrada principal del repositorio
├── docs/                          # Documentación viva de ingeniería y diseño
│   ├── architecture.md            # Arquitectura detallada y diagrama UML Mermaid
│   ├── design-justification.md    # 12 ADRs (What/Why/When to Break) + Guía de defensa oral
│   ├── backlog.md                 # Maestro de 6 Épicas y 24 Tickets (100% Done)
│   ├── spec.md                    # Especificaciones formales e Historias de Usuario
│   ├── glossary.md                # Glosario canónico de dominio (Lenguaje Ubicuo)
│   ├── how-we-work.md             # Contrato de trabajo, gobernanza y DoD
│   ├── adr/                       # 12 Architecture Decision Records individuales
│   └── tickets/                   # Carpetas de tickets agrupados por épica
└── proyect/                       # Código fuente y suite de pruebas
    ├── src/
    │   ├── core/                  # Dominio puro de ajedrez (Cero UI, Cero Frameworks)
    │   │   ├── board/             # Board, Position, BoardSetupFactory
    │   │   ├── pieces/            # Piece (base), Pawn, Rook, Knight, Bishop, Queen, King, Chancellor
    │   │   ├── rules/             # IMovementRule y catálogo de reglas atómicas
    │   │   ├── game/              # ChessGame, IGameState, MoveCommand, CommandHistory
    │   │   ├── ports/             # IGameEngine, IGameObserver, GameSnapshot, MoveResult
    │   │   └── strategy/          # IAiStrategy, RandomAi, GreedyMaterialAi
    │   └── adapters/
    │       └── web/               # UI React + Tailwind CSS (main, App, index.css, ChessApp, ChessBoardView, etc.)
    └── tests/
        ├── core/                  # 166 tests unitarios de dominio puro AAA en memoria
        └── adapters/              # 43 tests de componentes e integración con React Testing Library
```

---

## 4. Guía para la Prueba de Fuego en la Defensa Oral (< 5 min)

Para demostrar que el sistema cumple el principio **Open/Closed (OCP)** y desacopla la lógica de negocio de la UI:

### Escenario: Inyección de una Pieza Híbrida de Fairy Chess (`Chancellor` = Torre + Alfil/Caballo)
1. **Paso 1:** Crear `proyect/src/core/pieces/Chancellor.ts`:
   ```ts
   import { Piece } from './Piece';
   import { Color } from './types';
   import { SlidingMoveRule, ORTHOGONAL_DIRECTIONS } from '../rules/SlidingMoveRule';
   import { LeapMoveRule, KNIGHT_OFFSETS } from '../rules/LeapMoveRule';

   export class Chancellor extends Piece {
     constructor(color: Color) {
       super(color, 'CHANCELLOR', [
         new SlidingMoveRule(ORTHOGONAL_DIRECTIONS),
         new LeapMoveRule(KNIGHT_OFFSETS),
       ]);
     }
   }
   ```
2. **Paso 2:** Instanciarla en el tablero: `board.placePiece(pos, new Chancellor('WHITE'))`.
3. **Resultado:**
   * **Archivos existentes modificados:** `0`.
   * El bucle de turnos, jaques, clavadas, `undo/redo`, e IA funcionan inmediatamente.
   * La interfaz gráfica renderiza automáticamente la insignia de respaldo (*fallback badge* con `CH` estilizado) sin necesidad de tocar código React ni estilos Tailwind.

### Escenario: Dimensiones de Tablero Dinámicas ($10 \times 10$ o $6 \times 8$)
1. Instanciar `new Board(10, 10)` o llamar a `BoardSetupFactory.createStandardBoard(10, 10)`.
2. **Resultado:**
   * **Archivos modificados:** `0`.
   * La interfaz web ajusta la grilla mediante CSS Grid dinámico (`repeat(10, minmax(0, 1fr))`) y numera las coordenadas algebraicas automáticamente.

---

## 5. Métricas de Calidad del Proyecto

* **Cobertura de Pruebas:** 24 suites de pruebas, **209 tests pasando al 100%**.
* **Tipado Estricto:** TypeScript en modo `strict` con cero advertencias (`tsc --noEmit`).
* **Reglas de Código:** Cero condicionales `switch` extensos (uso exclusivo de *Lookup Tables* y polimorfismo), cero `useEffect` para la lógica de juego (*useSyncExternalStore* y eventos en origen), y código auto-documentado.
* **Sincronización:** Cero *drift* entre el código fuente y el Diagrama de Clases UML documentado en [`docs/architecture.md`](docs/architecture.md).
