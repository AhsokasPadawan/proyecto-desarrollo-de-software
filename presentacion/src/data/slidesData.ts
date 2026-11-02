import { PresentationSlidePage } from '../types';

export const PRESENTATION_SLIDE_PAGES: readonly PresentationSlidePage[] = [
  {
    id: 'LANDING',
    pageNumber: 1,
    shortTabLabel: '1. Portada',
    slideTitle: 'Ingeniería de Software — Trabajo Práctico Final',
    slideHookSubtitle: 'Chess TPO · Motor de Ajedrez Orientado a Dominio con Arquitectura Hexagonal',
    icon: '♟',
    badge: 'Defensa Oral',
    focusSteps: [],
    nextBridgeLabel: 'Comenzar: 2. Introducción →',
    studyGuide: {
      estimatedTime: '1 minuto',
      mainGoal:
        'Presentar formalmente al equipo, el nombre de la materia y anticipar que contaremos la evolución del sistema como una historia de decisiones de ingeniería.',
      spokenScriptByStep: [
        {
          stepTitle: 'Apertura y Presentación del Equipo',
          whatToSay:
            '"Buenas tardes profesores. Somos Contreras Leonel, Cristiano Juan, Gabor Delli Roberta, Gulmanelli José, Martínez Rossi Javier y Soricetti Federico. Hoy vamos a presentar nuestro Trabajo Práctico Final de Ingeniería de Software: Chess TPO."',
          whenToClickModal: 'No hace falta abrir modales en la portada; mantener la vista limpia.',
        },
        {
          stepTitle: 'Planteo de la Defensa como una Historia',
          whatToSay:
            '"En lugar de enumerar clases aisladas, queremos contarles la historia de cómo cada decisión arquitectónica y cada patrón de diseño que elegimos para cumplir con la cátedra nos fue abriendo la puerta a nuevas funcionalidades sin tener que reescribir el núcleo del sistema."',
          whenToClickModal: 'Presionar la flecha derecha (→) o el botón "Comenzar: 2. Introducción".',
        },
      ],
      interfacesCheatSheet: [
        {
          name: 'Arquitectura Hexagonal (Ports & Adapters)',
          roleAndWhyItMatters:
            'Eje transversal de toda la defensa: el Core en TypeScript puro no conoce ni a React, ni a Stockfish, ni a Gemini, ni al archivo JSON.',
        },
      ],
      professorQuestions: [
        {
          question: '¿Cómo se dividieron el trabajo entre los 6 integrantes?',
          answer:
            'Dividimos el alcance inicial en 6 épicas independientes de 4 tickets cada una (24 tickets en total), trabajando en ramas por ticket con Pull Requests que requerían al menos 2 aprobaciones de compañeros y revisión automatizada de estándares.',
        },
      ],
      transitionPhraseToNextPage:
        '"Pasemos a la Introducción para ver el mapa general del sistema y nuestras primeras decisiones de diseño."',
    },
  },
  {
    id: 'INTRODUCTION',
    pageNumber: 2,
    shortTabLabel: '2. Introducción',
    slideTitle: 'Mapa Arquitectónico y Primeras Decisiones',
    slideHookSubtitle: 'Visión general sin entrar en detalle y el punto de partida de nuestra historia',
    icon: '🏛️',
    badge: 'Visión & Base',
    focusSteps: [
      {
        stepIndex: 0,
        stepTag: 'Paso 1 de 3 · Arquitectura',
        headline: 'Arquitectura Hexagonal: El Núcleo y los 3 Adaptadores',
        coreIdea: 'El dominio puro de ajedrez está 100% aislado de infraestructura mediante puertos.',
        visualBullets: [
          'Núcleo (Core): Reglas FIDE, tablero N×M y patrones GoF en TypeScript puro.',
          'Adaptador 1 (UI): Web interactiva en React 18 + Tailwind CSS.',
          'Adaptador 2 (Motores): Chess Engine (Stockfish) + IA Engine (Gemini Coach).',
          'Adaptador 3 (Persistencia): Base de datos en JSON (intercambiable por MySQL).',
        ],
        highlightedContracts: ['IGameEngine', 'IGameObserver', 'IAnalysisService', 'IChessLibraryRepository'],
        modals: [
          {
            id: 'modal-intro-engine',
            buttonLabel: '💻 Ver Puerto Driving: IGameEngine',
            modalTitle: 'IGameEngine — Único Punto de Entrada al Núcleo',
            modalSubtitle: 'Todo adaptador externo interactúa con ChessGame exclusivamente mediante este contrato.',
            filePath: 'proyect/src/core/ports/IGameEngine.ts',
            codeSnippet: `export interface IGameEngine {
  getSnapshot(): GameSnapshot;
  getLegalMoves(from: Position): readonly Position[];
  makeMove(from: Position, to: Position, promotionPiece?: PieceType): MoveResult;
  undo(): boolean;
  redo(): boolean;
  declareTimeout(loserColor: Color): MoveResult;
  subscribe(observer: IGameObserver): UnsubscribeFn;
  unsubscribe(observer: IGameObserver): void;
}`,
            keyTakeaway:
              'La UI jamás modifica el tablero ni cambia el turno por su cuenta: solo invoca comandos sobre IGameEngine y recibe copias inmutables GameSnapshot.',
          },
        ],
      },
      {
        stepIndex: 1,
        stepTag: 'Paso 2 de 3 · Estándares & Stack',
        headline: 'Principios SOLID, GRASP, Patrones y Tecnologías',
        coreIdea: 'Elegimos herramientas modernas que potencian el tipado estricto y el testeo en memoria.',
        visualBullets: [
          'SOLID & GRASP: SRP, Open/Closed, ISP, DIP + Controlador y Experto en Información.',
          'Patrones GoF centrales: Command, Strategy, State, Observer y Factory.',
          'Stack: TypeScript 5 (strict), React 18, Tailwind CSS 3 y Vite 5.',
          'Calidad: Vitest + React Testing Library (+309 tests corriendo en memoria).',
        ],
        highlightedContracts: ['SOLID', 'GRASP', 'TypeScript Strict', 'Vitest AAA'],
        modals: [
          {
            id: 'modal-intro-solid',
            buttonLabel: '🔍 Ver Mapa Rápido SOLID & GRASP',
            modalTitle: 'Aplicación Concreta de SOLID y GRASP en Chess TPO',
            modalSubtitle: 'Cada principio se traduce en una interfaz o separación real del repositorio.',
            filePath: 'docs/architecture.md · docs/design-justification.md',
            simulatorId: 'SOLID_GRASP_EXPLORER',
            keyTakeaway:
              'No aplicamos patrones por compromiso teórico: cada uno resuelve un requisito concreto de extensibilidad o testabilidad.',
          },
        ],
      },
      {
        stepIndex: 2,
        stepTag: 'Paso 3 de 3 · Inicio de la Historia',
        headline: 'Primeras Decisiones para Cumplir con la Cátedra',
        coreIdea: 'La Prueba de Fuego (< 15 min) definió cómo modelamos el tablero, las piezas y la validación.',
        visualBullets: [
          'Tablero parametrizable Board(rows, cols) y coordenadas Position(row, col) 0-indexed.',
          'Segregación con IBoardQuery: las reglas consultan el tablero sin poder mutarlo.',
          'Separación Pseudo-Legal vs. Legal: simular la jugada para ver si mi Rey queda en jaque.',
          'El disparador: ¿Cómo simulamos y deshacemos jugadas sin clonar el tablero? → Command.',
        ],
        highlightedContracts: ['Position', 'Board', 'IBoardQuery', 'CheckDetector'],
        modals: [
          {
            id: 'modal-intro-board-query',
            buttonLabel: '💻 Ver Contrato: IBoardQuery (ISP)',
            modalTitle: 'IBoardQuery — Segregación de Interfaz de Solo Lectura',
            modalSubtitle: 'Impide en tiempo de compilación que el cálculo de movimientos altere el estado del tablero.',
            filePath: 'proyect/src/core/board/IBoardQuery.ts',
            codeSnippet: `export interface IBoardQuery {
  readonly rows: number;
  readonly cols: number;
  isWithinBounds(pos: Position): boolean;
  getPieceAt(pos: Position): IPiece | null;
  isEmpty(pos: Position): boolean;
  findKingPosition(color: Color): Position | null;
  getPiecesByColor(color: Color): readonly PiecePlacement[];
  getEnPassantTarget(): Position | null;
}`,
            keyTakeaway:
              'Gracias a IBoardQuery, tanto las reglas geométricas como CheckDetector operan sobre una vista segura y adaptable a tableros de 8×8 o 10×10.',
          },
        ],
      },
    ],
    nextBridgeLabel: 'Siguiente: 3. Patrón Command →',
    studyGuide: {
      estimatedTime: '2 a 3 minutos',
      mainGoal:
        'Presentar el panorama general (Hexagonal, SOLID, GRASP, 3 Adaptadores y Stack) sin espolear el detalle fino, y arrancar la historia con las primeras decisiones de diseño para la cátedra.',
      spokenScriptByStep: [
        {
          stepTitle: 'Paso 1: Arquitectura Hexagonal y los 3 Adaptadores',
          whatToSay:
            '"Para empezar, queremos mostrarles la foto general del proyecto sin entrar todavía en el detalle de cada patrón. Elegimos una Arquitectura Hexagonal con un Núcleo puro en TypeScript y 3 grandes adaptadores: la interfaz gráfica en React, el adaptador híbrido que conecta el motor de ajedrez con la IA de Gemini, y el adaptador de base de datos en JSON."',
          whenToClickModal:
            'Opcional: abrir el modal "Ver Puerto Driving: IGameEngine" para mostrar rápido la frontera del Core.',
        },
        {
          stepTitle: 'Paso 2: SOLID, GRASP, Patrones y Tecnologías',
          whatToSay:
            '"Todo el diseño se apoya en principios SOLID y GRASP, y en tres patrones principales que van a guiar nuestra presentación: Command, Strategy y State. En cuanto a tecnologías, usamos TypeScript estricto, React 18, Tailwind CSS, Vite y Vitest con Testing Library para correr más de 300 tests en memoria."',
          whenToClickModal:
            'Si los profesores quieren ver un resumen de SOLID/GRASP, abrir el modal "Ver Mapa Rápido SOLID & GRASP".',
        },
        {
          stepTitle: 'Paso 3: El Inicio de la Historia (Decisiones para la Cátedra)',
          whatToSay:
            '"Acá empieza nuestra historia. La cátedra nos pedía cumplir todas las reglas del ajedrez y superar la Prueba de Fuego: agregar una pieza híbrida o cambiar las dimensiones del tablero en menos de 15 minutos sin modificar clases existentes. Por eso parametrizamos Board(rows, cols), separamos la interfaz de lectura IBoardQuery por ISP, y dividimos los movimientos en pseudo-legales y legales. Pero para saber si un movimiento es legal y no deja a nuestro propio Rey en jaque, necesitábamos ejecutar la jugada en el tablero, chequear amenazas y volver atrás... además de permitirle al usuario deshacer jugadas. Y eso nos llevó directo al Patrón Command."',
          whenToClickModal: 'Abrir el modal "Ver Contrato: IBoardQuery (ISP)" al mencionar que las reglas no pueden mutar el tablero.',
        },
      ],
      interfacesCheatSheet: [
        {
          name: 'IGameEngine',
          roleAndWhyItMatters: 'Driving Port del Core implementado por ChessGame; aísla toda la lógica de dominio.',
        },
        {
          name: 'IBoardQuery',
          roleAndWhyItMatters: 'Interfaz de solo lectura (ISP) que reciben las reglas IMovementRule y CheckDetector.',
        },
      ],
      professorQuestions: [
        {
          question: '¿Por qué eligieron TypeScript en lugar de Java para este proyecto?',
          answer:
            'Como documentamos en el ADR-001, TypeScript en modo estricto nos dio interfaces, clases abstractas y uniones discriminadas con cero overhead de runtime, ejecución de tests unitarios en memoria en menos de 5 segundos con Vitest, e integración directa con el adaptador React sin requerir una capa HTTP intermedia.',
        },
      ],
      transitionPhraseToNextPage:
        '"Veamos entonces en la Página 3 cómo el Patrón Command resolvió esa reversión de jugadas y qué otras funcionalidades nos destrabó."',
    },
  },
  {
    id: 'COMMAND',
    pageNumber: 3,
    shortTabLabel: '3. Command',
    slideTitle: 'Patrón Command: De Deshacer Jugadas a la Animación',
    slideHookSubtitle: 'Cómo encapsular cada movimiento nos permitió viajar en el tiempo, animar y exportar la partida',
    icon: '⏪',
    badge: 'Patrón GoF #1',
    focusSteps: [
      {
        stepIndex: 0,
        stepTag: 'Paso 1 de 3 · El Problema Inicial',
        headline: '¿Por qué elegimos Command? Reversión Exacta y Simulación',
        coreIdea: 'Cada jugada muta el tablero in-place y sabe exactamente cómo revertirse sin clonar matrices.',
        visualBullets: [
          'Evita clonar el tablero en cada jugada o validación de jaque (cero presión de memoria).',
          'MoveCommand guarda pieza movida, capturada, flag hasMoved, enroque, promoción y en passant.',
          'Garantiza la invariante matemática: Estado_Antes === Estado_Después(execute + undo).',
        ],
        highlightedContracts: ['ICommand', 'MoveCommand', 'CommandHistory'],
        modals: [
          {
            id: 'modal-command-contract',
            buttonLabel: '💻 Ver Código: ICommand & CommandHistory',
            modalTitle: 'ICommand, MoveCommand y CommandHistory',
            modalSubtitle: 'Encapsulación de mutaciones reversibles en el Core con doble pila undoStack / redoStack.',
            filePath: 'proyect/src/core/game/ICommand.ts · CommandHistory.ts',
            codeSnippet: `export interface ICommand {
  execute(): void;
  undo(): void;
}

export class CommandHistory {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];

  executeCommand(command: ICommand): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
  }

  undo(): boolean {
    const command = this.undoStack.pop();
    if (!command) return false;
    command.undo();
    this.redoStack.push(command);
    return true;
  }

  redo(): boolean {
    const command = this.redoStack.pop();
    if (!command) return false;
    command.execute();
    this.undoStack.push(command);
    return true;
  }
}`,
            keyTakeaway:
              'Ni la interfaz gráfica ni CheckDetector saben cómo revertir un enroque o una promoción: MoveCommand encapsula toda esa complejidad.',
          },
        ],
      },
      {
        stepIndex: 1,
        stepTag: 'Paso 2 de 3 · El Descubrimiento',
        headline: 'Reutilizar lo que ya teníamos: Lista Navegable, Animación y Exportación',
        coreIdea: 'Al tener la pila de comandos y MoveRecord[], descubrimos 3 funcionalidades gratis para el Core.',
        visualBullets: [
          '1. Lista interactiva de jugadas: clic en jugada #k ejecuta undo() o redo() hasta llegar.',
          '2. Animación de la partida (Replay): rebobina al inicio y avanza sola con redo() (0.5x, 1x, 2x).',
          '3. Exportación (.txt): recorre GameSnapshot.moveHistory para descargar la transcripción.',
        ],
        highlightedContracts: ['GameSnapshot.moveHistory', 'MoveRecord', 'useMatchReplay'],
        modals: [
          {
            id: 'modal-command-replay-code',
            buttonLabel: '💻 Ver Código: Salto Temporal y Animación con undo/redo',
            modalTitle: 'Reproducción y Salto Temporal sobre IGameEngine',
            modalSubtitle: 'El adaptador React anima la partida y viaja en el tiempo usando únicamente undo() y redo().',
            filePath: 'proyect/src/adapters/web/ChessApp.tsx',
            codeSnippet: `const enterReplayFromStart = useCallback((targetEngine: IGameEngine = engine) => {
  stopPlayback();
  setIsReplaying(true);
  while (targetEngine.undo()) {}
}, [engine, stopPlayback]);

const handleJumpToMove = useCallback((targetIndex: number) => {
  stopPlayback();
  const current = engine.getSnapshot().currentMoveIndex;
  if (targetIndex > current) {
    for (let i = 0; i < targetIndex - current; i++) engine.redo();
  } else if (targetIndex < current) {
    for (let i = 0; i < current - targetIndex; i++) engine.undo();
  }
}, [engine, stopPlayback]);`,
            keyTakeaway:
              'Cero métodos nuevos en el Core para soportar el reproductor animado: reutilizamos al 100% el patrón Command.',
          },
        ],
      },
      {
        stepIndex: 2,
        stepTag: 'Paso 3 de 3 · Independencia y Demo',
        headline: 'Desacoplamiento Total mediante Puertos Inmutables',
        coreIdea: 'La UI nunca toca instancias de MoveCommand: solo lee MoveRecord[] y llama a IGameEngine.',
        visualBullets: [
          'El Core protege sus comandos privados detrás de IGameEngine.undo() y IGameEngine.redo().',
          'Cada cambio emite un GameSnapshot con moveHistory y currentMoveIndex.',
          'Probá en el modal interactivo cómo se mueven los comandos entre undoStack y redoStack.',
        ],
        highlightedContracts: ['IGameEngine.undo()', 'IGameEngine.redo()', 'currentMoveIndex'],
        modals: [
          {
            id: 'modal-command-simulator',
            buttonLabel: '🎮 Abrir Simulador en Vivo: Pila Command & Salto a Jugada',
            modalTitle: 'Simulador Interactivo — CommandHistory (undoStack ↔ redoStack)',
            modalSubtitle: 'Probá deshacer, rehacer o saltar a cualquier jugada de la lista como lo hace la aplicación.',
            keyTakeaway:
              'Saltar a una jugada pasada o futura en la tabla de movimientos mueve comandos entre undoStack y redoStack manteniendo intacta la historia.',
            simulatorId: 'COMMAND_STACK_SIMULATOR',
          },
        ],
      },
    ],
    nextBridgeLabel: 'Siguiente: 4. Patrón Strategy →',
    studyGuide: {
      estimatedTime: '3 minutos',
      mainGoal:
        'Explicar cómo elegimos Command para deshacer jugadas y simular jaques, y cómo nos dimos cuenta de que esa misma información nos permitía saltar en la lista de jugadas, animar la partida y exportarla.',
      spokenScriptByStep: [
        {
          stepTitle: 'Paso 1: Por qué elegimos Command (Undo/Redo y Simulación)',
          whatToSay:
            '"Para resolver la simulación de jaque propio y permitir deshacer jugadas, elegimos el patrón Command a través de la interfaz ICommand, implementada por MoveCommand y administrada por CommandHistory. En ajedrez, deshacer no es solo volver una pieza atrás: hay que restaurar capturas, el flag hasMoved del rey o la torre, promociones y capturas al paso. Con MoveCommand, ejecutamos y revertimos sobre el mismo tablero con exactitud matemática sin clonar matrices."',
          whenToClickModal: 'Abrir el modal "Ver Código: ICommand & CommandHistory" para señalar execute(), undo() y las dos pilas.',
        },
        {
          stepTitle: 'Paso 2: El Descubrimiento (Lista, Animación y Exportación)',
          whatToSay:
            '"Y acá vino el primer gran descubrimiento del equipo: cuando vimos que ya teníamos todas las jugadas en CommandHistory y expuestas en el GameSnapshot como MoveRecord[], nos dimos cuenta de que sin tocar el Core podíamos hacer tres cosas nuevas: primero, una lista interactiva de jugadas donde al hacer clic volvés a cualquier momento de la partida llamando a undo() o redo() en bucle; segundo, un modo de animación de la partida que rebobina al principio y avanza solo con un timer llamando a redo(); y tercero, exportar toda la partida a un archivo de texto."',
          whenToClickModal: 'Abrir el modal "Ver Código: Salto Temporal y Animación con undo/redo" para mostrar while(engine.undo()) y handleJumpToMove.',
        },
        {
          stepTitle: 'Paso 3: Independencia por Interfaces y Simulador',
          whatToSay:
            '"Fíjense cómo se mantiene la independencia de la arquitectura hexagonal: la UI en React jamás ve la clase MoveCommand ni toca el tablero; solo lee MoveRecord[] del GameSnapshot e invoca IGameEngine.undo() y redo()."',
          whenToClickModal: 'Abrir el modal "Abrir Simulador en Vivo: Pila Command" y hacer 2 clics rápidos para mostrar cómo funciona la pila.',
        },
      ],
      interfacesCheatSheet: [
        {
          name: 'ICommand / MoveCommand / CommandHistory',
          roleAndWhyItMatters: 'Clases e interfaz internas del Core que encapsulan la mutación reversible sobre Board.',
        },
        {
          name: 'IGameEngine.undo() & redo() + MoveRecord',
          roleAndWhyItMatters: 'Contratos públicos del puerto que permiten a cualquier adaptador viajar en el tiempo sin acoplarse a MoveCommand.',
        },
      ],
      professorQuestions: [
        {
          question: '¿Qué pasa con el redoStack si el jugador retrocede 3 jugadas y hace un movimiento nuevo?',
          answer:
            'En CommandHistory.executeCommand(), al ejecutar una jugada nueva se limpia automáticamente redoStack (this.redoStack = []), bifurcando la línea temporal tal como exigen las reglas estándar de Undo/Redo.',
        },
      ],
      transitionPhraseToNextPage:
        '"Con el historial y la reproducción resueltos gracias a Command, necesitábamos resolver las reglas de movimiento extensibles y los distintos modos de partida contra la computadora. Ahí entra el Patrón Strategy."',
    },
  },
  {
    id: 'STRATEGY',
    pageNumber: 4,
    shortTabLabel: '4. Strategy',
    slideTitle: 'Patrón Strategy: De Modos de Partida al Coach con IA',
    slideHookSubtitle: 'Cómo elegir Strategy para el juego y unirlo con Command disparó el análisis con Stockfish y Gemini',
    icon: '🧠',
    badge: 'Patrón GoF #2',
    focusSteps: [
      {
        stepIndex: 0,
        stepTag: 'Paso 1 de 3 · Strategy en el Core',
        headline: 'Dos Aplicaciones de Strategy: Reglas de Piezas y Niveles de IA',
        coreIdea: 'Reemplazamos herencia rígida y condicionales por estrategias intercambiables en tiempo de ejecución.',
        visualBullets: [
          'Reglas de movimiento (IMovementRule): Sliding, Leap, Pawn, Castling y EnPassant componibles.',
          'Prueba de Fuego superada: Chancellor (Torre + Caballo) creado en 5 líneas con 0 cambios.',
          'Modos de partida (IAiStrategy): Humano vs. Humano y 3 niveles de IA (Principiante, Amateur y Pro con Minimax + poda Alfa-Beta) eligiendo Blancas o Negras.',
        ],
        highlightedContracts: [
          'IMovementRule',
          'IAiStrategy',
          'GreedyMaterialAiStrategy',
          'AmateurAiStrategy',
        ],
        modals: [
          {
            id: 'modal-strategy-core-code',
            buttonLabel: '💻 Ver Contratos: IAiStrategy (Niveles IA), IMovementRule & Chancellor',
            modalTitle: 'Patrón Strategy en Niveles de IA y Composición de Piezas',
            modalSubtitle: 'Inyección de estrategias de IA (Greedy y Minimax parametrizable) y reglas geométricas sin modificar ChessGame.',
            filePath: 'proyect/src/core/strategy/IAiStrategy.ts · AmateurAiStrategy.ts · Chancellor.ts',
            codeSnippet: `export interface IAiStrategy {
  chooseMove(engine: IGameEngine): AiMove | null;
}

export const GAME_MODES: readonly GameModeConfig[] = [
  { id: 'HUMAN_VS_HUMAN', label: 'Humano vs Humano' },
  {
    id: 'HUMAN_VS_GREEDY_AI',
    label: 'Humano vs IA (Principiante)',
    strategyFactory: () => new GreedyMaterialAiStrategy(),
  },
  {
    id: 'HUMAN_VS_AMATEUR_AI',
    label: 'Humano vs IA (Amateur)',
    strategyFactory: () => new AmateurAiStrategy(AMATEUR_LEVEL_CONFIG),
  },
  {
    id: 'HUMAN_VS_PRO_AI',
    label: 'Humano vs IA (Pro)',
    strategyFactory: () => new AmateurAiStrategy(PRO_AI_CONFIG),
  },
];

export class Chancellor extends Piece {
  constructor(color: Color) {
    super(color, 'CHANCELLOR', [
      new SlidingMoveRule(ORTHOGONAL_DIRECTIONS),
      new LeapMoveRule(KNIGHT_OFFSETS),
    ]);
  }
}`,
            keyTakeaway:
              'IAiStrategy recibe únicamente el puerto IGameEngine; agregar AmateurAiStrategy con Minimax, poda Alfa-Beta y perfiles Amateur/Pro no requirió tocar una sola línea de ChessGame.',
          },
        ],
      },
      {
        stepIndex: 1,
        stepTag: 'Paso 2 de 3 · La Sinergia (Command + Strategy)',
        headline: 'Cruzar Command + Strategy Nos Llevó al Análisis con IA',
        coreIdea: 'Si ya teníamos el historial reproducible (Command) y la evaluación de jugadas (Strategy)... ¡podíamos analizar toda la partida!',
        visualBullets: [
          'De Command teníamos la lista completa de jugadas y la capacidad de recrear cada posición.',
          'De Strategy teníamos el concepto de evaluar un tablero para recomendar el mejor movimiento.',
          'Idea: sumar un adaptador con un Motor de Ajedrez (Stockfish) + explicación pedagógica de Gemini.',
        ],
        highlightedContracts: ['FenSerializer', 'IAnalysisService', 'IChessEngine', 'IAiCoachEngine'],
        modals: [
          {
            id: 'modal-strategy-simulator',
            buttonLabel: '🎮 Ver Flujo Interactivo: Command + Strategy → Stockfish + Gemini',
            modalTitle: 'Sinergia Arquitectónica: De Command + Strategy al Entrenador Híbrido',
            modalSubtitle: 'Inspeccioná paso a paso cómo el historial y la evaluación se combinan en AnalysisService.',
            keyTakeaway:
              'Stockfish aporta exactitud táctica objetiva (evitando alucinaciones de cálculo) y Gemini aporta la explicación didáctica en lenguaje natural.',
            simulatorId: 'STRATEGY_HYBRID_SIMULATOR',
          },
        ],
      },
      {
        stepIndex: 2,
        stepTag: 'Paso 3 de 3 · Puertos del Análisis Híbrido',
        headline: 'Recomendaciones en Vivo y Análisis Post-Partida Desacoplados',
        coreIdea: 'Tres interfaces garantizan que podamos cambiar Stockfish o Gemini sin tocar el Core ni la UI.',
        visualBullets: [
          'IAnalysisService expone getLiveHint(snapshot) y analyzeFullGame(snapshot) a la vista.',
          'IChessEngine (ChessApiService) calcula mejor jugada y evaluación en centipeones desde el FEN.',
          'IAiCoachEngine (GeminiCoachService) traduce esos datos técnicos en consejos claros para aprender.',
        ],
        highlightedContracts: ['IAnalysisService', 'IChessEngine', 'IAiCoachEngine'],
        modals: [
          {
            id: 'modal-strategy-analysis-contracts',
            buttonLabel: '💻 Ver Contratos: IAnalysisService, IChessEngine & IAiCoachEngine',
            modalTitle: 'Puertos del Adaptador de Análisis Híbrido',
            modalSubtitle: 'Separación estricta entre el coordinador, el motor táctico de ajedrez y el modelo generativo de IA.',
            filePath: 'proyect/src/adapters/services/IAnalysisService.ts · IChessEngine.ts · IAiCoachEngine.ts',
            codeSnippet: `export interface IAnalysisService {
  getLiveHint(snapshot: GameSnapshot): Promise<LiveHintResult>;
  analyzeFullGame(
    snapshot: GameSnapshot,
    onProgress?: (step: number, total: number) => void,
    engineFactory?: () => IGameEngine
  ): Promise<FullGameAnalysisResult>;
}

export interface IChessEngine {
  evaluatePosition(fen: string): Promise<ChessEngineEvaluation>;
  evaluateSequence(fens: readonly string[], onProgress?: (done: number) => void): Promise<readonly ChessEngineEvaluation[]>;
}

export interface IAiCoachEngine {
  hasApiKey(): boolean;
  requestLiveHint(context: LiveHintContext): Promise<string>;
  requestBatchReview(moves: readonly AiCoachEvaluationContext[]): Promise<BatchGameReview>;
}`,
            keyTakeaway:
              'El Core solo aportó FenSerializer (función pura sobre GameSnapshot). Todo el tráfico HTTP con Stockfish y Gemini vive aislado en los adaptadores.',
          },
        ],
      },
    ],
    nextBridgeLabel: 'Siguiente: 5. Patrón State →',
    studyGuide: {
      estimatedTime: '3 minutos',
      mainGoal:
        'Mostrar cómo usamos Strategy para los modos y niveles de IA (IAiStrategy) y las reglas de piezas (IMovementRule), y contar cómo la unión de Command + Strategy nos dio la idea de agregar recomendaciones y análisis con Stockfish + Gemini.',
      spokenScriptByStep: [
        {
          stepTitle: 'Paso 1: Strategy para Niveles de IA y Reglas de Movimiento',
          whatToSay:
            '"El segundo patrón clave fue Strategy, que aplicamos en dos frentes dentro del Core: por un lado, en IMovementRule para componer el movimiento de las piezas sin herencia profunda, lo que nos permitió crear la pieza híbrida Chancellor en 5 líneas; y por otro lado, en IAiStrategy para los distintos niveles de partida contra la máquina: Principiante (GreedyMaterialAiStrategy) y los niveles Amateur y Pro (AmateurAiStrategy con Minimax, poda Alfa-Beta, control del centro, desarrollo y seguridad del rey), permitiendo además elegir jugar con Blancas o Negras e invirtiendo la orientación del tablero."',
          whenToClickModal: 'Abrir el modal "Ver Contratos: IAiStrategy (Niveles IA), IMovementRule & Chancellor".',
        },
        {
          stepTitle: 'Paso 2: Cómo Command + Strategy Dispararon la Idea del Análisis Híbrido',
          whatToSay:
            '"Acá se dio la segunda gran conexión de nuestra historia: miramos lo que teníamos y dijimos: con Command ya tenemos toda la secuencia de jugadas reproducible paso a paso, y con Strategy ya tenemos el concepto de evaluar una posición para sugerir una jugada. ¿Y si combinamos ambas cosas y agregamos un adaptador que conecte un motor profesional de ajedrez como Stockfish para calcular la jugada óptima, más Gemini para que nos explique en español por qué esa jugada es buena o por qué cometimos un error?"',
          whenToClickModal: 'Abrir el modal "Ver Flujo Interactivo: Command + Strategy → Stockfish + Gemini".',
        },
        {
          stepTitle: 'Paso 3: Las Interfaces que Independizan al Motor de Ajedrez y a Gemini',
          whatToSay:
            '"Para no ensuciar el Core con llamadas HTTP, diseñamos tres interfaces: IAnalysisService como fachada hacia React, IChessEngine para el motor táctico de ajedrez y IAiCoachEngine para el motor de inteligencia artificial generativa. Así, Stockfish calcula los números exactos sin alucinar y Gemini actúa como profesor pedagógico."',
          whenToClickModal: 'Abrir el modal "Ver Contratos: IAnalysisService, IChessEngine & IAiCoachEngine".',
        },
      ],
      interfacesCheatSheet: [
        {
          name: 'IAiStrategy (GreedyMaterialAiStrategy / AmateurAiStrategy) & IMovementRule',
          roleAndWhyItMatters: 'Estrategias del Core para oponentes en 3 niveles (Principiante, Amateur depth 2 y Pro depth 3 con Minimax + Alfa-Beta) y geometría de piezas.',
        },
        {
          name: 'IAnalysisService / IChessEngine / IAiCoachEngine',
          roleAndWhyItMatters: 'Puertos que desacoplan el análisis de partida tanto del motor de ajedrez como del proveedor de LLM.',
        },
      ],
      professorQuestions: [
        {
          question: '¿Cómo diferenciaron los niveles Amateur y Pro sin duplicar la clase de estrategia?',
          answer:
            'Aplicando parametrización sobre el patrón Strategy: AmateurAiStrategy recibe un objeto inmutable AmateurAiConfig (AMATEUR_LEVEL_CONFIG con profundidad 2 y mayor tolerancia de error vs. PRO_AI_CONFIG con profundidad 3, poda Alfa-Beta y evaluación posicional más estricta), reutilizando el mismo motor Minimax y MoveCommand para simular jugadas.',
        },
        {
          question: '¿Por qué usaron un motor de ajedrez (Stockfish) además de Gemini en vez de pedirle todo directo a Gemini?',
          answer:
            'Porque los LLMs como Gemini son excelentes explicando conceptos estratégicos en lenguaje natural, pero suelen alucinar coordenadas o cálculos tácticos profundos. Al combinar IChessEngine (Stockfish) para el cálculo exacto en centipeones e IAiCoachEngine (Gemini) para la explicación pedagógica, obtuvimos precisión matemática y claridad didáctica.',
        },
      ],
      transitionPhraseToNextPage:
        '"Ahora bien: tener un entrenador que te da recomendaciones y analiza tus partidas nos llevó a pensar en tener partidas de práctica, un modo estudio y ejercicios de Mate en X... y ahí entró en juego la extensión del Patrón State y su sinergia con React."',
    },
  },
  {
    id: 'STATE',
    pageNumber: 5,
    shortTabLabel: '5. State & React',
    slideTitle: 'Patrón State: De las Fases del Juego a los Modos de Práctica y React',
    slideHookSubtitle: 'Cómo extendimos IGameState para los nuevos modos y por qué React encaja tan bien con este diseño',
    icon: '🔄',
    badge: 'Patrón GoF #3 + UI',
    focusSteps: [
      {
        stepIndex: 0,
        stepTag: 'Paso 1 de 3 · State en el Core',
        headline: 'El Ciclo de Vida de la Partida sin Bloques switch (IGameState)',
        coreIdea: 'Cada fase del juego es una clase polimórfica que decide si acepta jugadas y cómo transicionar.',
        visualBullets: [
          'Estados iniciales del Core: NormalPlayState, CheckState, CheckmateState, StalemateState y DrawState.',
          'Con el reloj de ajedrez sumamos TimeoutState cuando un jugador se queda sin tiempo.',
          'ChessGame delega canAcceptMoves() y evaluateNextState(context) en el objeto de estado actual.',
        ],
        highlightedContracts: ['IGameState', 'NormalPlayState', 'CheckState', 'CheckmateState', 'DrawState'],
        modals: [
          {
            id: 'modal-state-core-contract',
            buttonLabel: '💻 Ver Contrato: IGameState y Transición Polimórfica',
            modalTitle: 'IGameState — Polimorfismo de Fases en el Dominio',
            modalSubtitle: 'Elimina los condicionales if/switch por estado dentro de ChessGame.',
            filePath: 'proyect/src/core/game/IGameState.ts · NormalPlayState.ts',
            codeSnippet: `export interface IGameState {
  readonly type: GameStateType;
  canAcceptMoves(): boolean;
  getWinner(currentTurn: Color): Color | null;
  retainsTurnWhenSingleColor(): boolean;
  evaluateNextState(context: GameStateContext): IGameState;
}

export class NormalPlayState implements IGameState {
  readonly type: GameStateType = 'IN_PROGRESS';
  canAcceptMoves(): boolean { return true; }
  getWinner(): Color | null { return null; }
  retainsTurnWhenSingleColor(): boolean { return false; }

  evaluateNextState(context: GameStateContext): IGameState {
    if (!context.hasLegalMoves) {
      return context.isKingInCheck ? new CheckmateState() : new StalemateState();
    }
    if (context.isDrawByFiftyMoveRule || context.isDrawByInsufficientMaterial || context.isDrawByThreefoldRepetition) {
      return new DrawState();
    }
    return context.isKingInCheck ? new CheckState(this) : new NormalPlayState();
  }
}`,
            keyTakeaway:
              'Cuando un estado terminal como CheckmateState está activo, canAcceptMoves() devuelve false y ChessGame rechaza jugadas automáticamente.',
          },
        ],
      },
      {
        stepIndex: 1,
        stepTag: 'Paso 2 de 3 · Extensión a Prácticas',
        headline: 'Las Recomendaciones Nos Llevaron a las Prácticas: StudyPlayState',
        coreIdea: 'Extendimos el Patrón State para soportar Modo Estudio, Mate en X y Partidas Guardadas.',
        visualBullets: [
          'La idea del Coach disparó 4 modos: Clásico, Estudio Libre, Mate en X y Partidas Guardadas.',
          'Creamos StudyPlayState implementando IGameState (permite tableros a medida o de un solo color).',
          'CheckState recibe previousState: IGameState para saber si al salir del jaque vuelve a Estudio o a Clásico.',
        ],
        highlightedContracts: ['StudyPlayState', 'MatePuzzleController', 'hydrateSavedAnnotatedMatch'],
        modals: [
          {
            id: 'modal-state-study-code',
            buttonLabel: '💻 Ver Código: StudyPlayState y su Inyección en Estudio y Mate en X',
            modalTitle: 'Extensión Open/Closed del Patrón State: StudyPlayState',
            modalSubtitle: 'Permite practicar posiciones personalizadas y puzzles tácticos sin alterar NormalPlayState.',
            filePath: 'proyect/src/core/game/StudyPlayState.ts · MatePuzzleController.ts',
            codeSnippet: `export class StudyPlayState implements IGameState {
  readonly type: GameStateType = 'STUDY_IN_PROGRESS';

  canAcceptMoves(): boolean { return true; }
  getWinner(): Color | null { return null; }
  retainsTurnWhenSingleColor(): boolean { return true; }

  evaluateNextState(context: GameStateContext): IGameState {
    if (!context.hasLegalMoves && context.isKingInCheck) return new CheckmateState();
    if (context.hasLegalMoves && context.isKingInCheck) return new CheckState(this);
    return new StudyPlayState();
  }
}

const studyEngine = new ChessGame(board, turn, undefined, undefined, new StudyPlayState());`,
            keyTakeaway:
              'Inyectando new StudyPlayState() por constructor en ChessGame habilitamos tanto el Editor de Estudio como los ejercicios de Mate en X.',
          },
        ],
      },
      {
        stepIndex: 2,
        stepTag: 'Paso 3 de 3 · Sinergia con React',
        headline: 'Por qué React se Presta Tan Bien para Este Patrón',
        coreIdea: 'Conectamos el estado del Core con Hooks de React y Lookup Tables de componentes funcionales.',
        visualBullets: [
          'Core → React sin useEffect: el puerto IGameObserver notifica a useSyncExternalStore.',
          'Hooks de estado (useState<ActivityMode>) gobiernan cuál de los 4 modos está activo.',
          'Lookup Tables (activitySetupLookup y activityContentLookup) montan cada componente sin switch.',
        ],
        highlightedContracts: ['IGameObserver', 'useSyncExternalStore', 'useState<ActivityMode>', 'Lookup Tables'],
        modals: [
          {
            id: 'modal-state-simulator',
            buttonLabel: '🎮 Explorador Interactivo: Los 4 Modos (Core State ↔ React Hooks)',
            modalTitle: 'Sinergia entre IGameState (Core) y React (Hooks + Lookup Tables)',
            modalSubtitle: 'Seleccioná cada uno de los 4 modos de juego para ver qué estado usa en el Core y qué monta en React.',
            keyTakeaway:
              'En el Core modelamos estados con clases polimórficas (IGameState), y en React modelamos las vistas con funciones puras, Hooks y Lookup Tables.',
            simulatorId: 'STATE_REACT_SIMULATOR',
          },
        ],
      },
    ],
    nextBridgeLabel: 'Siguiente: 6. Adaptadores →',
    studyGuide: {
      estimatedTime: '3 minutos',
      mainGoal:
        'Explicar cómo ya usábamos el patrón State para las fases del juego, cómo lo extendimos con StudyPlayState cuando creamos las partidas de práctica (Clásico, Estudio, Mate en X, Partidas Guardadas), y por qué React se acopla tan bien mediante sus hooks y componentes.',
      spokenScriptByStep: [
        {
          stepTitle: 'Paso 1: El Patrón State Original en el Core',
          whatToSay:
            '"Desde el inicio del proyecto usamos el patrón State a través de la interfaz IGameState para manejar las fases del juego: NormalPlayState, CheckState, CheckmateState, StalemateState, DrawState y luego TimeoutState para el reloj. Gracias a esto, ChessGame no tiene un solo switch preguntando en qué estado está: delega polimórficamente en el objeto de estado actual."',
          whenToClickModal: 'Abrir el modal "Ver Contrato: IGameState y Transición Polimórfica".',
        },
        {
          stepTitle: 'Paso 2: La Extensión para Partidas de Práctica (Estudio, Mate en X, Guardadas)',
          whatToSay:
            '"Cuando sumamos las recomendaciones del Coach, pensamos: sería ideal tener partidas de práctica para entrenar posiciones específicas. Así nacieron los nuevos modos: Modo Estudio, Mate en X y Partidas Guardadas. Para lograrlo sin tocar las reglas clásicas, volvimos a extender el patrón State creando StudyPlayState, que se inyecta en ChessGame tanto en el Editor de Estudio como en MatePuzzleController, y permite por ejemplo practicar con piezas de un solo color o salir de un jaque volviendo al estado de estudio."',
          whenToClickModal: 'Abrir el modal "Ver Código: StudyPlayState y su Inyección".',
        },
        {
          stepTitle: 'Paso 3: Cómo React Potencia este Diseño con Hooks y Componentes',
          whatToSay:
            '"Acá vimos además lo bien que se lleva React con este patrón: el estado del Core se publica mediante el puerto IGameObserver y React lo consume con el hook useSyncExternalStore sin necesitar useEffect. Y para cambiar entre los 4 modos de juego (Clásico, Estudio, Mate en X y Partidas Guardadas), combinamos el hook useState con Lookup Tables que renderizan el componente correspondiente de forma declarativa y modular."',
          whenToClickModal: 'Abrir el modal "Explorador Interactivo: Los 4 Modos (Core State ↔ React Hooks)".',
        },
      ],
      interfacesCheatSheet: [
        {
          name: 'IGameState & StudyPlayState',
          roleAndWhyItMatters: 'Permiten que ChessGame cambie sus reglas de transición según estemos en una partida oficial o en una práctica de estudio.',
        },
        {
          name: 'IGameObserver + useSyncExternalStore',
          roleAndWhyItMatters: 'Puente reactivo que mantiene a React sincronizado con el estado del Core sin acoplamiento ni efectos secundarios.',
        },
      ],
      professorQuestions: [
        {
          question: '¿Qué diferencia hay entre manejar estado con IGameState en el Core y manejar estado con useState en React?',
          answer:
            'IGameState en el Core modela las invariantes y transiciones de negocio del ajedrez (si se aceptan jugadas, si hay jaque mate o tablas) de manera independiente de cualquier UI. En cambio, useState en React modela el estado efímero de la vista (qué casilla está seleccionada con el primer clic, qué pestaña de actividad está abierta o si el modal de API Key está visible).',
        },
      ],
      transitionPhraseToNextPage:
        '"Tener posiciones de estudio, ejercicios de Mate en X y partidas analizadas nos trajo una nueva necesidad: dónde guardarlos. Y eso nos lleva a la Página 6: los 3 Adaptadores y el adaptador de Base de Datos en JSON."',
    },
  },
  {
    id: 'ADAPTERS',
    pageNumber: 6,
    shortTabLabel: '6. Adaptadores',
    slideTitle: 'El Núcleo y los 3 Adaptadores: Independencia por Interfaces',
    slideHookSubtitle: 'Por qué sumamos una Base de Datos en JSON para las prácticas y cómo cualquier adaptador es reemplazable',
    icon: '🔌',
    badge: 'Arquitectura Hexagonal',
    focusSteps: [
      {
        stepIndex: 0,
        stepTag: 'Paso 1 de 3 · El Adaptador JSON',
        headline: 'De las Partidas de Práctica a la Base de Datos en JSON',
        coreIdea: 'Elegimos JSON por simplicidad académica, pero detrás de una interfaz lista para migrar a MySQL.',
        visualBullets: [
          'Necesitábamos persistir posiciones de estudio, puzzles de Mate en X y partidas analizadas.',
          'Por tratarse de un proyecto simple y autocontenido, implementamos JsonFileLibraryAdapter.',
          'Al estar detrás del puerto IChessLibraryRepository, cambiarlo a MySQL requiere tocar 0 líneas del Core.',
        ],
        highlightedContracts: ['IChessLibraryRepository', 'JsonFileLibraryAdapter', 'StudyPositionRecord', 'MatePuzzleRecord'],
        modals: [
          {
            id: 'modal-adapters-repo-contract',
            buttonLabel: '💻 Ver Contrato: IChessLibraryRepository (JSON ↔ MySQL)',
            modalTitle: 'IChessLibraryRepository — Puerto de Persistencia Asíncrono',
            modalSubtitle: 'Diseñado con promesas (Promise) para que sea transparente si lee de un JSON local o de un servidor MySQL.',
            filePath: 'proyect/src/adapters/storage/IChessLibraryRepository.ts',
            codeSnippet: `export interface IChessLibraryRepository {
  getStudyPositions(): Promise<readonly StudyPositionRecord[]>;
  saveStudyPosition(record: StudyPositionRecord): Promise<void>;
  getMatePuzzles(): Promise<readonly MatePuzzleRecord[]>;
  saveMatePuzzle(record: MatePuzzleRecord): Promise<void>;
  getAnnotatedMatches(): Promise<readonly SavedAnnotatedMatchRecord[]>;
  saveAnnotatedMatch(record: SavedAnnotatedMatchRecord): Promise<void>;
  deleteAnnotatedMatch(matchId: string): Promise<void>;
}`,
            keyTakeaway:
              'Como todos los métodos retornan Promise<...>, reemplazar JsonFileLibraryAdapter por un MySqlLibraryAdapter con consultas SQL no cambia ni una firma.',
          },
        ],
      },
      {
        stepIndex: 1,
        stepTag: 'Paso 2 de 3 · Mapa Completo de Puertos',
        headline: 'Las Interfaces que Blindan al Núcleo frente a los 3 Adaptadores',
        coreIdea: 'Cada adaptador se comunica únicamente a través de su contrato (Puerto), nunca con implementaciones concretas.',
        visualBullets: [
          'Adaptador 1 (UI React): consume IGameEngine y se suscribe con IGameObserver (GameSnapshot).',
          'Adaptador 2 (Chess Engine + IA Engine): abstraído por IAnalysisService, IChessEngine e IAiCoachEngine.',
          'Adaptador 3 (Base de Datos JSON): abstraído por IChessLibraryRepository.',
        ],
        highlightedContracts: [
          'IGameEngine',
          'IGameObserver',
          'IAnalysisService',
          'IChessEngine',
          'IAiCoachEngine',
          'IChessLibraryRepository',
        ],
        modals: [
          {
            id: 'modal-adapters-di-code',
            buttonLabel: '💻 Ver Inyección de los 3 Adaptadores en ChessAppProps',
            modalTitle: 'Inyección de Dependencias en la Raíz del Adaptador Web',
            modalSubtitle: 'Los 3 puntos de integración entran como fábricas inyectables, facilitando el reemplazo y el testing con Mocks.',
            filePath: 'proyect/src/adapters/web/ChessApp.tsx',
            codeSnippet: `export interface ChessAppProps {
  readonly engineFactory?: () => IGameEngine;
  readonly analysisServiceFactory?: () => IAnalysisService;
  readonly libraryRepositoryFactory?: () => IChessLibraryRepository;
}

export function ChessApp({
  engineFactory = () => new ChessGame(),
  analysisServiceFactory = () => new AnalysisService(
    new ChessApiService(),
    new GeminiCoachService()
  ),
  libraryRepositoryFactory = () => new JsonFileLibraryAdapter(),
}: ChessAppProps): JSX.Element`,
            keyTakeaway:
              'Para cambiar a MySQL, a un motor local WASM o a otro proveedor de IA, solo se cambia la instancia inyectada en esta composición raíz.',
          },
        ],
      },
      {
        stepIndex: 2,
        stepTag: 'Paso 3 de 3 · Prueba de Reemplazo',
        headline: 'Demostración de Intercambio de Adaptadores (Hot-Swap)',
        coreIdea: 'Podemos reemplazar la UI, el motor táctico, la IA o la base de datos con 0 cambios en el Core.',
        visualBullets: [
          'UI Web React ↔ Suite de Tests Vitest / Consola CLI (vía IGameEngine).',
          'Stockfish REST API ↔ Stockfish Local WASM (vía IChessEngine).',
          'Gemini 2.5 Flash ↔ OpenAI / Modelo Local (vía IAiCoachEngine).',
          'Archivo JSON Local ↔ Base de Datos MySQL (vía IChessLibraryRepository).',
        ],
        highlightedContracts: ['0 líneas modificadas en src/core/'],
        modals: [
          {
            id: 'modal-adapters-simulator',
            buttonLabel: '🎮 Abrir Simulador Hot-Swap: Reemplazar los 3 Adaptadores en Vivo',
            modalTitle: 'Simulador de Independencia Hexagonal — Reemplazo de Adaptadores',
            modalSubtitle: 'Conmutá cada adaptador para mostrar al tribunal qué clase cambia y qué interfaz permanece intacta.',
            keyTakeaway:
              'Esta capacidad de reemplazar adaptadores sin tocar el núcleo es la demostración práctica del principio de Inversión de Dependencias (DIP) en la Arquitectura Hexagonal.',
            simulatorId: 'ADAPTERS_HOTSWAP_SIMULATOR',
          },
        ],
      },
    ],
    nextBridgeLabel: 'Siguiente: 7. Metodología →',
    studyGuide: {
      estimatedTime: '3 minutos',
      mainGoal:
        'Cerrar el arco técnico explicando cómo nacieron las bases de datos en JSON por las prácticas, y repasar todas las interfaces de los 3 adaptadores que demuestran que cualquiera puede reemplazarse (ej. JSON a MySQL) sin tocar el núcleo.',
      spokenScriptByStep: [
        {
          stepTitle: 'Paso 1: Por qué creamos el Adaptador de Base de Datos en JSON',
          whatToSay:
            '"Con las partidas de práctica, el editor de estudio, los ejercicios de Mate en X y las partidas analizadas, necesitábamos persistencia. Como este es un proyecto académico simple donde queríamos que cualquiera pudiera clonar el repositorio y ejecutarlo sin instalar servidores externos, decidimos crear un adaptador de base de datos en JSON (JsonFileLibraryAdapter). Pero lo diseñamos detrás de la interfaz asíncrona IChessLibraryRepository, sabiendo que si el día de mañana queremos cambiarlo por una base de datos MySQL, solo creamos MySqlLibraryAdapter implementando esa misma interfaz."',
          whenToClickModal: 'Abrir el modal "Ver Contrato: IChessLibraryRepository (JSON ↔ MySQL)".',
        },
        {
          stepTitle: 'Paso 2: Resumen de las Interfaces de los 3 Adaptadores',
          whatToSay:
            '"Este es el corazón de nuestra Arquitectura Hexagonal. Cada uno de los 3 adaptadores se apoya en interfaces explícitas que protegen al núcleo: primero, la UI en React se comunica mediante IGameEngine e IGameObserver; segundo, el adaptador de análisis coordina el motor de ajedrez y la IA mediante IAnalysisService, IChessEngine e IAiCoachEngine; y tercero, la persistencia en JSON se abstrae detrás de IChessLibraryRepository."',
          whenToClickModal: 'Abrir el modal "Ver Inyección de los 3 Adaptadores en ChessAppProps".',
        },
        {
          stepTitle: 'Paso 3: Demostración de Reemplazo sin tocar el Core',
          whatToSay:
            '"En cualquiera de los tres casos, si cambiamos React por una consola CLI, Stockfish REST por un motor local, Gemini por otro modelo, o el JSON por MySQL, la cantidad de archivos modificados en el Core es exactamente cero."',
          whenToClickModal: 'Abrir el modal "Abrir Simulador Hot-Swap" y alternar JSON ↔ MySQL frente a los profesores.',
        },
      ],
      interfacesCheatSheet: [
        {
          name: 'IGameEngine & IGameObserver',
          roleAndWhyItMatters: 'Puertos del Core hacia el Adaptador 1 (UI Web React y Suite de Tests Vitest).',
        },
        {
          name: 'IAnalysisService, IChessEngine & IAiCoachEngine',
          roleAndWhyItMatters: 'Puertos del Adaptador 2 (Motor táctico Stockfish + Explicación pedagógica de Gemini).',
        },
        {
          name: 'IChessLibraryRepository',
          roleAndWhyItMatters: 'Puerto del Adaptador 3 (JsonFileLibraryAdapter hoy, MySqlLibraryAdapter mañana).',
        },
      ],
      professorQuestions: [
        {
          question: 'Si hoy tuvieran que conectar MySQL en lugar del JSON, ¿qué archivo de React o de ChessGame tendrían que editar?',
          answer:
            'En ChessGame (Core) ninguno, y en los componentes visuales de React tampoco. Únicamente escribiríamos la clase MySqlLibraryAdapter implements IChessLibraryRepository y la inyectaríamos en la prop libraryRepositoryFactory al instanciar ChessApp.',
        },
      ],
      transitionPhraseToNextPage:
        '"Por último, en la Página 7 queremos contarles cómo trabajamos como equipo para construir todo esto apoyándonos en Gemini con Antigravity, Skills y TDD."',
    },
  },
  {
    id: 'METHODOLOGY',
    pageNumber: 7,
    shortTabLabel: '7. Metodología',
    slideTitle: 'Cómo lo Hicimos: Gemini + Antigravity, Skills y TDD',
    slideHookSubtitle: 'Ingeniería asistida por IA bajo contrato operativo, preguntas de diseño y auditoría total de estándares',
    icon: '🛠️',
    badge: 'Proceso & Calidad',
    focusSteps: [
      {
        stepIndex: 0,
        stepTag: 'Paso 1 de 3 · Antigravity & Skills',
        headline: 'Trabajo Guiado con Gemini en Antigravity y Uso de Skills',
        coreIdea: 'No generamos código a ciegas: estructuramos un flujo de 4 etapas guiado por entrevistas y Skills.',
        visualBullets: [
          'Contrato how-we-work.md: 4 etapas (Setup → Design → Implementation → Review).',
          'Skill grill-with-docs: preguntas una por una para definir arquitectura y 12 ADRs.',
          'Skills to-spec y to-tickets: Historias de Usuario, testing seams y backlog por épicas.',
          'Skills implement + tdd y code-review: desarrollo en ramas y auditoría en doble eje.',
        ],
        highlightedContracts: ['grill-with-docs', 'to-spec', 'to-tickets', 'implement + tdd', 'code-review'],
        modals: [
          {
            id: 'modal-methodology-pipeline',
            buttonLabel: '🔍 Ver Pipeline de las 4 Etapas y Skills',
            modalTitle: 'Pipeline de Ingeniería con Gemini + Antigravity',
            modalSubtitle: 'Cada etapa requería consenso del equipo antes de pasar a la siguiente.',
            filePath: 'docs/how-we-work.md · docs/project-setup.md',
            simulatorId: 'METHODOLOGY_PIPELINE_SIMULATOR',
            keyTakeaway:
              'Las preguntas interactivas (formato Grill-Me) nos obligaron a tomar todas las decisiones de diseño nosotros antes de que el agente escribiera código.',
          },
        ],
      },
      {
        stepIndex: 1,
        stepTag: 'Paso 2 de 3 · Patrón TDD',
        headline: 'Patrón TDD Estricto (Red → Green → Refactor) sobre Seams Públicos',
        coreIdea: '309 tests automatizados en 47 suites con estructura AAA corriendo 100% en memoria.',
        visualBullets: [
          'Primero el test fallando (Red) sobre las interfaces públicas IBoardQuery o IGameEngine.',
          'Inyección de tableros personalizados por constructor para armar escenarios en 1 línea (Arrange).',
          '309 tests automatizados (47 suites de dominio en Vitest + integración UI con Testing Library).',
        ],
        highlightedContracts: ['Red → Green → Refactor', 'Arrange-Act-Assert (AAA)', 'Testing Seams'],
        modals: [
          {
            id: 'modal-methodology-tdd-code',
            buttonLabel: '💻 Ver Ejemplos de Tests AAA en Memoria',
            modalTitle: 'Tests Unitarios AAA en Memoria sobre el Core',
            modalSubtitle: 'Escenarios claros de preparar, ejecutar y verificar sobre las interfaces públicas.',
            filePath: 'proyect/tests/core/CheckAndPin.test.ts · UndoRedo.test.ts',
            simulatorId: 'TDD_EXAMPLES_EXPLORER',
            keyTakeaway:
              'Como el Core no tiene dependencias de base de datos ni de DOM, toda la batería de tests corre en milisegundos.',
          },
        ],
      },
      {
        stepIndex: 2,
        stepTag: 'Paso 3 de 3 · Auditoría de Estándares',
        headline: 'Revisión de Todos los Archivos para Cumplir Nuestros Estándares',
        coreIdea: 'Auditamos el repositorio completo para verificar nuestras 3 reglas de calidad sin excepciones.',
        visualBullets: [
          '1. Cero bloques switch extensos: reemplazados por Polimorfismo GoF y Lookup Tables.',
          '2. Cero useEffect para lógica de juego: manejo en eventos onClick + useSyncExternalStore.',
          '3. Código 100% auto-documentado: nombres semánticos claros y cero comentarios explicativos.',
        ],
        highlightedContracts: ['Lookup Tables (Record<K,V>)', 'Cero useEffect en Juego', 'Código Auto-Documentado'],
        modals: [
          {
            id: 'modal-methodology-audit-code',
            buttonLabel: '💻 Ver Ejemplo de Lookup Table vs. switch en el Código Real',
            modalTitle: 'Cumplimiento de Estándares: Lookup Tables y Cero switch',
            modalSubtitle: 'Mapeo declarativo en lugar de estructuras condicionales extensas.',
            filePath: 'proyect/src/adapters/web/stateDisplayLookup.ts · ChessSquare.tsx',
            codeSnippet: `const STATE_BADGE_CLASS_LOOKUP: Record<GameStateType, string> = {
  IN_PROGRESS: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50',
  STUDY_IN_PROGRESS: 'bg-sky-950/70 text-sky-300 border-sky-600/60',
  CHECK: 'bg-amber-950/80 text-amber-300 border-amber-500/70 animate-pulse',
  CHECKMATE: 'bg-red-950/80 text-red-200 border-red-500/70 font-bold',
  STALEMATE: 'bg-zinc-800 text-zinc-200 border-zinc-600',
  DRAW: 'bg-zinc-800 text-zinc-200 border-zinc-600',
  TIMEOUT: 'bg-red-950/80 text-amber-200 border-amber-500/70 font-bold',
};

export function getStateBadgeClass(stateKind: GameStateType): string {
  return STATE_BADGE_CLASS_LOOKUP[stateKind];
}`,
            keyTakeaway:
              'Revisamos archivo por archivo tanto en src/core/ como en src/adapters/ para asegurar que cada módulo respetara estos estándares al 100%.',
          },
        ],
      },
    ],
    nextBridgeLabel: '↺ Volver a la Portada (Inicio)',
    studyGuide: {
      estimatedTime: '2 a 3 minutos',
      mainGoal:
        'Cerrar la presentación explicando cómo construimos el proyecto apoyándonos en Gemini con Antigravity, el uso de las Skills, el patrón TDD y la auditoría final de todos los archivos contra nuestros estándares.',
      spokenScriptByStep: [
        {
          stepTitle: 'Paso 1: Gemini + Antigravity, Preguntas y Skills',
          whatToSay:
            '"Para cerrar, queremos contarles cómo construimos el proyecto. Nos apoyamos en Gemini usando Antigravity, pero bajo una metodología rigurosa definida en how-we-work.md. Usamos las Skills paso a paso: primero grill-with-docs, donde mediante preguntas una por una definimos toda la arquitectura y los 12 ADRs; después to-spec para las historias de usuario y los seams de prueba; y luego to-tickets para dividir el trabajo en épicas y ramas independientes."',
          whenToClickModal: 'Abrir el modal "Ver Flujo Completo de las 4 Etapas y Skills".',
        },
        {
          stepTitle: 'Paso 2: El Patrón TDD en Memoria',
          whatToSay:
            '"Durante la implementación aplicamos el patrón TDD con la skill tdd: primero escribíamos el test unitario fallando con estructura Arrange-Act-Assert sobre las interfaces públicas como IGameEngine o IBoardQuery, y recién después el código de dominio para pasarlo a verde. Así alcanzamos 309 tests corriendo en memoria en pocos segundos."',
          whenToClickModal: 'Abrir el modal "Ver Ejemplo Real de Test AAA sobre Seam Público".',
        },
        {
          stepTitle: 'Paso 3: Revisión Exhaustiva de Todos los Archivos por Estándares',
          whatToSay:
            '"Finalmente, con la skill code-review y una auditoría completa archivo por archivo, revisamos todo el código para asegurarnos de cumplir al 100% los estándares que nos propusimos: cero bloques switch extensos reemplazados por polimorfismo y Lookup Tables, cero useEffect para manejar lógica de juego o redirecciones (manejando todo desde los eventos onClick y useSyncExternalStore), y código 100% auto-documentado con nombres semánticos sin comentarios redundantes. ¡Muchas gracias y quedamos abiertos a sus preguntas o a la Prueba de Fuego!"',
          whenToClickModal: 'Abrir el modal "Ver Ejemplo de Lookup Table vs. switch" para cerrar mostrando la limpieza del código.',
        },
      ],
      interfacesCheatSheet: [
        {
          name: 'grill-with-docs → to-spec → to-tickets → tdd → code-review',
          roleAndWhyItMatters: 'El pipeline de Skills que garantizó trazabilidad desde la idea inicial hasta cada test unitario.',
        },
        {
          name: 'Lookup Tables + useSyncExternalStore + Código Auto-Documentado',
          roleAndWhyItMatters: 'Los 3 estándares de codificación verificados en todos los archivos del repositorio.',
        },
      ],
      professorQuestions: [
        {
          question: '¿Cómo evitaron que el uso de IA introdujera código acoplado o difícil de mantener?',
          answer:
            'A través de tres barreras: primero, las reglas globales y el contrato how-we-work.md prohibían expresamente bloques switch, useEffect innecesarios y acoplamiento entre capas; segundo, exigimos TDD escribiendo primero los tests contra las interfaces (seams); y tercero, auditamos todos los archivos del proyecto con code-review y revisión entre pares antes de integrarlos.',
        },
      ],
      transitionPhraseToNextPage:
        '"Con esto concluimos el recorrido y podemos pasar directamente a mostrar la aplicación funcionando o realizar la Prueba de Fuego en vivo."',
    },
  },
];
