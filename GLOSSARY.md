# Chess TPO Glossary

Vocabulario técnico y de dominio canónico para la enseñanza, comprensión y defensa del motor de ajedrez y su arquitectura.

## Terms

**Arquitectura Hexagonal (Ports & Adapters)**:
Patrón arquitectónico que aísla la lógica de negocio pura (Core) de las dependencias externas (UI, frameworks, persistencia) mediante puertos abstractos (interfaces).
_Avoid_: Arquitectura en capas tradicional, MVC acoplado.

**Puerto Conductor (Driving Port)**:
Interfaz expuesta por el Core (ej. [`IGameEngine`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/ports/IGameEngine.ts)) que define las operaciones que los adaptadores externos pueden invocar para controlar el dominio.
_Avoid_: API interna, servicio web.

**Movimiento Pseudo-Legal**:
Movimiento que respeta estrictamente la geometría y los obstáculos físicos de una pieza en el tablero, sin considerar si deja o no a su propio rey en jaque.
_Avoid_: Movimiento tentativo, jugada no validada.

**Movimiento Legal**:
Movimiento pseudo-legal que además garantiza que, tras su ejecución, el rey del bando activo no queda bajo ninguna amenaza de jaque.
_Avoid_: Movimiento permitido, jugada final.

**Patrón State (GoF)**:
Patrón de comportamiento que permite a un objeto alterar su comportamiento cuando cambia su estado interno, representándolo mediante clases polimórficas que implementan una interfaz común ([`IGameState`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/game/IGameState.ts)).
_Avoid_: Máquina de estados con switches, bandera de estado.

**Patrón Command (GoF)**:
Patrón de diseño que encapsula una petición como un objeto independiente ([`MoveCommand`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/game/MoveCommand.ts)), conteniendo toda la información necesaria para ejecutar la acción y revertirla simétricamente (`undo()`).
_Avoid_: Registro de jugadas, log de historial.

**Patrón Observer (GoF)**:
Patrón que define una dependencia uno a muchos donde el sujeto notifica automáticamente a los observadores registrados ([`IGameObserver`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/ports/IGameObserver.ts)) mediante un snapshot inmutable ([`GameSnapshot`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/ports/GameSnapshot.ts)).
_Avoid_: Event emitter no tipado, callback directo en UI.

**Patrón Strategy (GoF)**:
Patrón que define una familia de algoritmos intercambiables en tiempo de ejecución, aplicado en el proyecto tanto a reglas de movimiento de piezas ([`IMovementRule`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/rules/IMovementRule.ts)) como a motores de oponentes automatizados ([`IAiStrategy`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/strategy/IAiStrategy.ts)).
_Avoid_: Switch de tipos de pieza, if/else de dificultad de IA.

**Testing Seam (Costura de Prueba)**:
Punto de inyección en el diseño (por ejemplo, el constructor de [`ChessGame`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/game/ChessGame.ts)) que permite inyectar dependencias o estados arbitrarios para aislar y verificar componentes sin alterar el código de producción.
_Avoid_: Mocking global invasivo, trampa de testing.

**Fairy Chess (Ajedrez Fantasía)**:
Variante del juego que introduce piezas con movimientos no estándar (como la combinación de Torre y Caballo en la pieza `Chancellor`), utilizada como prueba de fuego para validar el Principio de Abierto/Cerrado (OCP).
_Avoid_: Pieza personalizada, hack de pieza.

**Unión Discriminada (Discriminated Union)**:
Tipo compuesto en TypeScript que utiliza una propiedad literal común (ej. `success: true | false` en [`MoveResult`](file:///c:/Users/Javier/Desktop/Javi/Facu/Ingenieria%20de%20Software/proyecto-desarrollo-de-software/proyect/src/core/ports/MoveResult.ts)) para permitir al compilador inferir y validar exhaustivamente el tipo de datos en cada rama de control.
_Avoid_: Objeto polivalente con campos opcionales nulos.
