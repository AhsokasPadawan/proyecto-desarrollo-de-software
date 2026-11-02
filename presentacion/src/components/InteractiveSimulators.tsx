import { ReactNode, useState } from 'react';
import { InteractiveSimulatorId } from '../types';
import { IdeCodeBlock } from './IdeCodeBlock';

const SOLID_GRASP_CARDS = {
  SOLID: [
    {
      badge: 'SRP',
      title: 'Responsabilidad Única',
      contract: 'Piece ≠ CheckDetector ≠ ChessGame',
      summary: 'Las piezas calculan geometría, CheckDetector evalúa amenazas y ChessGame coordina turnos.',
    },
    {
      badge: 'OCP',
      title: 'Abierto / Cerrado',
      contract: 'IMovementRule · IGameState · IAiStrategy',
      summary: 'Agregar Chancellor o StudyPlayState requirió modificar 0 clases existentes.',
    },
    {
      badge: 'LSP',
      title: 'Sustitución de Liskov',
      contract: 'IPiece · ICommand · IGameState',
      summary: 'Cualquier implementación concreta es intercambiable sin romper las invariantes del motor.',
    },
    {
      badge: 'ISP',
      title: 'Segregación de Interfaces',
      contract: 'IBoardQuery vs. Board',
      summary: 'Las reglas y el detector de jaque reciben solo lectura (IBoardQuery) para no mutar el tablero.',
    },
    {
      badge: 'DIP',
      title: 'Inversión de Dependencias',
      contract: 'IGameEngine · IAnalysisService · IChessLibraryRepository',
      summary: 'El Core y la UI dependen exclusivamente de interfaces (puertos), nunca de infraestructura.',
    },
  ],
  GRASP: [
    {
      badge: 'Controlador',
      title: 'Controlador de Dominio',
      contract: 'ChessGame implements IGameEngine',
      summary: 'Recibe y coordina todas las operaciones del juego sin filtrar lógica de negocio a React.',
    },
    {
      badge: 'Experto',
      title: 'Experto en Información',
      contract: 'Board · Piece',
      summary: 'Board conoce las casillas ocupadas y cada Piece conoce sus reglas geométricas.',
    },
    {
      badge: 'Bajo Acoplamiento',
      title: 'Bajo Acoplamiento y Alta Cohesión',
      contract: 'IGameObserver + GameSnapshot',
      summary: 'Notificación mediante instantáneas inmutables con cero referencias a objetos internos.',
    },
  ],
} as const;

function SolidGraspExplorer(): JSX.Element {
  const [activeGroup, setActiveGroup] = useState<'SOLID' | 'GRASP'>('SOLID');

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-2">
        {(['SOLID', 'GRASP'] as const).map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setActiveGroup(group)}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
              activeGroup === group
                ? 'bg-emerald-500 text-zinc-950 border-emerald-300 shadow-sm'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
            }`}
          >
            Principios {group}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SOLID_GRASP_CARDS[activeGroup].map((item) => (
          <div
            key={item.badge}
            className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs">
                {item.badge}
              </span>
              <code className="text-[11px] font-mono text-sky-300 truncate">{item.contract}</code>
            </div>
            <h4 className="text-sm font-bold text-white">{item.title}</h4>
            <p className="text-xs text-zinc-300 leading-snug">{item.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const SAMPLE_COMMAND_MOVES = [
  { id: 1, label: '1. e2 → e4', detail: 'Peón blanco avanza 2 casillas (hasMoved: false → true)' },
  { id: 2, label: '1... e7 → e5', detail: 'Peón negro responde (enPassantTarget actualizado)' },
  { id: 3, label: '2. g1 → f3', detail: 'Caballo blanco desarrolla atacando e5' },
  { id: 4, label: '2... b8 → c6', detail: 'Caballo negro defiende el peón central' },
  { id: 5, label: '3. f1 → c4', detail: 'Alfil blanco apunta a f7 (Apertura Italiana)' },
] as const;

function CommandStackSimulator(): JSX.Element {
  const [appliedCount, setAppliedCount] = useState<number>(3);
  const undoStack = SAMPLE_COMMAND_MOVES.slice(0, appliedCount);
  const redoStack = SAMPLE_COMMAND_MOVES.slice(appliedCount);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900 p-3 rounded-xl border border-zinc-700">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAppliedCount(0)}
            disabled={appliedCount === 0}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-100 disabled:opacity-40"
          >
            ⏮ Inicio (while undo)
          </button>
          <button
            type="button"
            onClick={() => setAppliedCount((c) => Math.max(0, c - 1))}
            disabled={appliedCount === 0}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-extrabold text-zinc-950 disabled:opacity-40"
          >
            ⏪ engine.undo()
          </button>
          <button
            type="button"
            onClick={() => setAppliedCount((c) => Math.min(SAMPLE_COMMAND_MOVES.length, c + 1))}
            disabled={appliedCount === SAMPLE_COMMAND_MOVES.length}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-extrabold text-zinc-950 disabled:opacity-40"
          >
            ⏩ engine.redo()
          </button>
          <button
            type="button"
            onClick={() => setAppliedCount(SAMPLE_COMMAND_MOVES.length)}
            disabled={appliedCount === SAMPLE_COMMAND_MOVES.length}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-100 disabled:opacity-40"
          >
            ⏭ Final (while redo)
          </button>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-xs font-mono text-emerald-300">
          currentMoveIndex: {appliedCount - 1}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-emerald-500/50 flex flex-col gap-2">
          <span className="text-xs font-bold text-emerald-400 font-mono">
            undoStack ({undoStack.length}) · Jugadas en el Tablero
          </span>
          {undoStack.length === 0 ? (
            <span className="text-xs text-zinc-400 italic">Tablero en posición inicial (0 jugadas)</span>
          ) : (
            undoStack.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setAppliedCount(m.id)}
                className="px-3 py-2 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-500/40 text-left text-xs text-emerald-100 flex items-center justify-between"
              >
                <span className="font-mono font-bold">{m.label}</span>
                <span className="text-[11px] text-emerald-300">Saltar acá</span>
              </button>
            ))
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900 border border-amber-500/50 flex flex-col gap-2">
          <span className="text-xs font-bold text-amber-300 font-mono">
            redoStack ({redoStack.length}) · Listas para Rehacer / Replay
          </span>
          {redoStack.length === 0 ? (
            <span className="text-xs text-zinc-400 italic">Pila Redo vacía (al día con la última jugada)</span>
          ) : (
            redoStack.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setAppliedCount(m.id)}
                className="px-3 py-2 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 text-left text-xs text-amber-100 flex items-center justify-between"
              >
                <span className="font-mono font-bold">{m.label}</span>
                <span className="text-[11px] text-amber-300">Avanzar acá →</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-700 text-xs text-zinc-200">
        <strong className="text-emerald-400">Estado:</strong>{' '}
        {appliedCount > 0
          ? SAMPLE_COMMAND_MOVES[appliedCount - 1].detail
          : 'Posición inicial estándar antes de ejecutar el primer MoveCommand.'}
      </div>
    </div>
  );
}

function StrategyHybridSimulator(): JSX.Element {
  const [selectedStage, setSelectedStage] = useState<'COMMAND' | 'STRATEGY' | 'HYBRID'>('COMMAND');

  const stageDescriptions: Record<'COMMAND' | 'STRATEGY' | 'HYBRID', { title: string; contract: string; detail: string }> = {
    COMMAND: {
      title: '1. Base Command: Historial Reproducible',
      contract: 'GameSnapshot.moveHistory (MoveRecord[]) + FenSerializer.serializeSnapshot()',
      detail:
        'Gracias a Command podemos recorrer toda la partida desde el turno 0 hasta el final, obteniendo la cadena FEN exacta de cada posición.',
    },
    STRATEGY: {
      title: '2. Base Strategy: Evaluación de una Posición',
      contract: 'IAiStrategy.chooseMove(engine: IGameEngine)',
      detail:
        'Strategy introdujo en el proyecto el patrón de inspeccionar un estado del juego y puntuar/seleccionar la mejor jugada disponible.',
    },
    HYBRID: {
      title: '3. El Salto: AnalysisService (Stockfish + Gemini Coach)',
      contract: 'IAnalysisService → IChessEngine (Stockfish) + IAiCoachEngine (Gemini)',
      detail:
        'Unimos ambos conceptos: evaluamos la secuencia de FENs con Stockfish (IChessEngine) para detectar mejores jugadas, imprecisiones o blunders, y enviamos ese contexto táctico a Gemini (IAiCoachEngine) para que redacte la explicación pedagógica.',
    },
  };

  const activeInfo = stageDescriptions[selectedStage];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => setSelectedStage('COMMAND')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedStage === 'COMMAND'
              ? 'bg-sky-950 border-sky-400 text-sky-200 font-bold'
              : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          <div className="text-[11px] uppercase text-sky-400 font-bold">Paso 1</div>
          <div className="text-sm mt-0.5">⏪ Patrón Command</div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStage('STRATEGY')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedStage === 'STRATEGY'
              ? 'bg-emerald-950 border-emerald-400 text-emerald-200 font-bold'
              : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          <div className="text-[11px] uppercase text-emerald-400 font-bold">Paso 2</div>
          <div className="text-sm mt-0.5">🧠 Patrón Strategy</div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStage('HYBRID')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedStage === 'HYBRID'
              ? 'bg-amber-950 border-amber-400 text-amber-200 font-bold'
              : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          <div className="text-[11px] uppercase text-amber-300 font-bold">Paso 3</div>
          <div className="text-sm mt-0.5">✨ Motor Chess + Gemini</div>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/40 flex flex-col gap-2">
        <h4 className="text-base font-bold text-white">{activeInfo.title}</h4>
        <code className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-700 text-xs font-mono text-emerald-300 self-start">
          {activeInfo.contract}
        </code>
        <p className="text-sm text-zinc-200 leading-relaxed">{activeInfo.detail}</p>
      </div>
    </div>
  );
}

type ActivityModeSimKey = 'CLASSIC' | 'STUDY' | 'PUZZLES' | 'SAVED';

const STATE_REACT_MODES_LOOKUP: Record<
  ActivityModeSimKey,
  {
    readonly title: string;
    readonly coreState: string;
    readonly reactHooksAndLookup: string;
    readonly explanation: string;
  }
> = {
  CLASSIC: {
    title: '♟ Modo Clásico',
    coreState: 'NormalPlayState → CheckState / CheckmateState / StalemateState / DrawState / TimeoutState',
    reactHooksAndLookup: 'useSyncExternalStore(engine.subscribe) + activityContentLookup.CLASSIC_MATCH',
    explanation:
      'Ciclo FIDE completo en el Core. En React, la vista escucha GameSnapshot inmutable vía IGameObserver sin usar useEffect.',
  },
  STUDY: {
    title: '🧪 Modo Estudio',
    coreState: 'StudyPlayState (STUDY_IN_PROGRESS) inyectado en new ChessGame(...)',
    reactHooksAndLookup: 'useState(editorPlacements) + activityContentLookup.STUDY_EDITOR',
    explanation:
      'Extendimos IGameState con StudyPlayState para permitir tableros personalizados o de un solo color en cancha (retainsTurnWhenSingleColor = true).',
  },
  PUZZLES: {
    title: '🎯 Mate en X',
    coreState: 'StudyPlayState + MatePuzzleController (IN_PROGRESS | SOLVED | FAILED)',
    reactHooksAndLookup: 'useRef<MatePuzzleController> + useState<PuzzleResolutionStatus>',
    explanation:
      'Reutiliza StudyPlayState en el motor y coordina las respuestas defensivas del rival y el límite de jugadas hasta dar jaque mate.',
  },
  SAVED: {
    title: '📚 Partidas Guardadas',
    coreState: 'hydrateSavedAnnotatedMatch() → Reconstruye MoveCommand[] e IGameState',
    reactHooksAndLookup: 'useMatchReplay(hydratedEngine) + activityContentLookup.ANNOTATED_MATCHES',
    explanation:
      'Hidrata las jugadas guardadas desde la biblioteca JSON y deja la partida lista para reproducirse con las insignias y consejos del Coach.',
  },
};

function StateReactSimulator(): JSX.Element {
  const [activeKey, setActiveKey] = useState<ActivityModeSimKey>('CLASSIC');
  const current = STATE_REACT_MODES_LOOKUP[activeKey];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(Object.keys(STATE_REACT_MODES_LOOKUP) as ActivityModeSimKey[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setActiveKey(k)}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
              activeKey === k
                ? 'bg-emerald-500 text-zinc-950 border-emerald-300 shadow-md'
                : 'bg-zinc-900 text-zinc-200 border-zinc-700 hover:bg-zinc-800'
            }`}
          >
            {STATE_REACT_MODES_LOOKUP[k].title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-emerald-500/40 flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase text-emerald-400">
            En el Core (Patrón State Polimórfico)
          </span>
          <code className="text-xs font-mono text-emerald-200 bg-zinc-950 p-2 rounded border border-zinc-800">
            {current.coreState}
          </code>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900 border border-sky-500/40 flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase text-sky-400">
            En React (Hooks + Lookup Table de Componentes)
          </span>
          <code className="text-xs font-mono text-sky-200 bg-zinc-950 p-2 rounded border border-zinc-800">
            {current.reactHooksAndLookup}
          </code>
        </div>
      </div>

      <p className="p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-xs sm:text-sm text-zinc-200">
        {current.explanation}
      </p>
    </div>
  );
}

function AdaptersHotSwapSimulator(): JSX.Element {
  const [dbImpl, setDbImpl] = useState<'JSON' | 'MYSQL'>('JSON');
  const [engineImpl, setEngineImpl] = useState<'STOCKFISH_API' | 'STOCKFISH_WASM'>('STOCKFISH_API');
  const [aiImpl, setAiImpl] = useState<'GEMINI' | 'OPENAI'>('GEMINI');

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-emerald-500/50 flex flex-col justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-400">
              Adaptador Base de Datos
            </span>
            <p className="text-xs font-mono text-white mt-0.5">
              Puerto: IChessLibraryRepository
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDbImpl((v) => (v === 'JSON' ? 'MYSQL' : 'JSON'))}
            className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs flex items-center justify-between"
          >
            <span>
              {dbImpl === 'JSON' ? 'JsonFileLibraryAdapter' : 'MySqlLibraryAdapter (SQL)'}
            </span>
            <span>⇄ Cambiar</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900 border border-amber-500/50 flex flex-col justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-300">
              Adaptador Chess Engine
            </span>
            <p className="text-xs font-mono text-white mt-0.5">Puerto: IChessEngine</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setEngineImpl((v) => (v === 'STOCKFISH_API' ? 'STOCKFISH_WASM' : 'STOCKFISH_API'))
            }
            className="px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs flex items-center justify-between"
          >
            <span>
              {engineImpl === 'STOCKFISH_API' ? 'ChessApiService (REST)' : 'LocalWasmStockfish'}
            </span>
            <span>⇄ Cambiar</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900 border border-sky-500/50 flex flex-col justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase text-sky-300">
              Adaptador IA Coach
            </span>
            <p className="text-xs font-mono text-white mt-0.5">Puerto: IAiCoachEngine</p>
          </div>
          <button
            type="button"
            onClick={() => setAiImpl((v) => (v === 'GEMINI' ? 'OPENAI' : 'GEMINI'))}
            className="px-3 py-2 rounded-lg bg-sky-400 hover:bg-sky-300 text-zinc-950 font-extrabold text-xs flex items-center justify-between"
          >
            <span>
              {aiImpl === 'GEMINI' ? 'GeminiCoachService' : 'OpenAiCoachService'}
            </span>
            <span>⇄ Cambiar</span>
          </button>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-center text-xs sm:text-sm font-bold text-emerald-200">
        ✓ Archivos modificados en el Núcleo (src/core/**) al cambiar cualquiera de los 3 adaptadores: 0
      </div>
    </div>
  );
}

type PipelineStageKey = 'SETUP' | 'DESIGN' | 'IMPLEMENT' | 'REVIEW';

const METHODOLOGY_STAGES_LOOKUP: Record<
  PipelineStageKey,
  {
    readonly stageNumber: number;
    readonly title: string;
    readonly icon: string;
    readonly accentClass: string;
    readonly skillsUsed: readonly string[];
    readonly steps: readonly { readonly name: string; readonly detail: string }[];
    readonly deliverable: string;
  }
> = {
  SETUP: {
    stageNumber: 1,
    title: '1. Project Setup',
    icon: '🧭',
    accentClass: 'bg-sky-950 border-sky-400 text-sky-200',
    skillsUsed: ['Contrato Operativo', 'Alineación Grupal'],
    steps: [
      {
        name: 'Restricciones Innegociables',
        detail: 'Definimos Arquitectura Hexagonal, aislamiento del Core y cumplimiento de la Prueba de Fuego (< 15 min).',
      },
      {
        name: 'Elección del Stack',
        detail: 'Votación entre TypeScript vs. Java, ratificando TypeScript Strict + Vitest + React.',
      },
    ],
    deliverable: 'docs/how-we-work.md · docs/project-setup.md',
  },
  DESIGN: {
    stageNumber: 2,
    title: '2. Design (Skills)',
    icon: '📐',
    accentClass: 'bg-emerald-950 border-emerald-400 text-emerald-200',
    skillsUsed: ['grill-with-docs', 'to-spec', 'to-tickets'],
    steps: [
      {
        name: '2.1 Skill grill-with-docs',
        detail: 'Entrevista interactiva pregunta por pregunta para definir límites de módulos y los 12 ADRs (What / Why / When to Break).',
      },
      {
        name: '2.2 Skill to-spec',
        detail: 'Transformación del diseño en Historias de Usuario y definición de Testing Seams públicos.',
      },
      {
        name: '2.3 Skill to-tickets',
        detail: 'Desglose en 6 épicas y tickets verticales trazables en el backlog maestro.',
      },
    ],
    deliverable: 'docs/architecture.md · docs/spec.md · docs/backlog.md',
  },
  IMPLEMENT: {
    stageNumber: 3,
    title: '3. Implementation',
    icon: '🧪',
    accentClass: 'bg-amber-950 border-amber-400 text-amber-200',
    skillsUsed: ['implement', 'tdd (Red → Green → Refactor)'],
    steps: [
      {
        name: 'Ramas por Ticket',
        detail: 'Cada integrante trabaja en ramas aisladas ticket/<NN>-<slug> sin pushear directo a main.',
      },
      {
        name: 'Ciclo TDD en Memoria',
        detail: 'Primero escribimos el test AAA que falla sobre IGameEngine o IBoardQuery y luego la implementación.',
      },
    ],
    deliverable: '+209 Tests en Verde (Vitest + React Testing Library)',
  },
  REVIEW: {
    stageNumber: 4,
    title: '4. Code Review',
    icon: '🛡️',
    accentClass: 'bg-purple-950 border-purple-400 text-purple-200',
    skillsUsed: ['code-review (Standards + Spec)', '2 Aprobaciones/PR'],
    steps: [
      {
        name: 'Eje Standards',
        detail: 'Revisión de todos los archivos verificando SOLID, cero bloques switch, cero useEffect en juego y código auto-documentado.',
      },
      {
        name: 'Eje Spec & Pares',
        detail: 'Verificación de criterios de aceptación del ticket y mínimo 2 aprobaciones de compañeros antes de mergear.',
      },
    ],
    deliverable: 'Código 100% Auditado y Diagrama UML Sincronizado',
  },
};

function MethodologyPipelineSimulator(): JSX.Element {
  const [activeStage, setActiveStage] = useState<PipelineStageKey>('SETUP');
  const stage = METHODOLOGY_STAGES_LOOKUP[activeStage];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(Object.keys(METHODOLOGY_STAGES_LOOKUP) as PipelineStageKey[]).map((key) => {
          const item = METHODOLOGY_STAGES_LOOKUP[key];
          const isSelected = activeStage === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveStage(key)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? `${item.accentClass} font-extrabold shadow-lg scale-[1.02]`
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider opacity-80">
                Etapa {item.stageNumber}
              </div>
              <div className="text-xs sm:text-sm mt-0.5 flex items-center gap-1.5">
                <span>{item.icon}</span>
                <span className="truncate">{item.title}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">{stage.icon}</span>
            <h4 className="text-base font-extrabold text-white">{stage.title}</h4>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {stage.skillsUsed.map((skill) => (
              <code
                key={skill}
                className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300"
              >
                ⚡ {skill}
              </code>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {stage.steps.map((subStep) => (
            <div
              key={subStep.name}
              className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/90 flex flex-col gap-1"
            >
              <span className="text-xs font-extrabold text-emerald-400">{subStep.name}</span>
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">{subStep.detail}</p>
            </div>
          ))}
        </div>

        <div className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
            Resultado Verificable
          </span>
          <code className="font-mono text-sky-300">{stage.deliverable}</code>
        </div>
      </div>
    </div>
  );
}

type TddExampleKey = 'PINNED_KING_CHECK' | 'UNDO_RESTORES_BOARD';

const TDD_EXAMPLES_LOOKUP: Record<
  TddExampleKey,
  {
    readonly label: string;
    readonly arrangeSummary: string;
    readonly actSummary: string;
    readonly assertSummary: string;
    readonly code: string;
  }
> = {
  PINNED_KING_CHECK: {
    label: 'Ejemplo 1: Impedir jugada que deja al propio Rey en jaque',
    arrangeSummary: 'Colocamos el Rey blanco en e1, una Torre blanca delante en e2 y una Torre negra atacando desde e8.',
    actSummary: 'Intentamos mover nuestra Torre de e2 al costado (a2), dejando expuesto a nuestro Rey.',
    assertSummary: 'El motor rechaza la jugada devolviendo success: false y reason: KING_LEFT_IN_CHECK.',
    code: `it('rechaza mover una pieza clavada si deja a su propio Rey en jaque', () => {
  const board = new Board(8, 8);
  board.placePiece(Position.fromAlgebraic('e1'), new King('WHITE'));
  board.placePiece(Position.fromAlgebraic('e2'), new Rook('WHITE'));
  board.placePiece(Position.fromAlgebraic('e8'), new Rook('BLACK'));
  const game = new ChessGame(board, 'WHITE');

  const result = game.makeMove(
    Position.fromAlgebraic('e2'),
    Position.fromAlgebraic('a2')
  );

  expect(result).toEqual({
    success: false,
    reason: 'KING_LEFT_IN_CHECK',
  });
});`,
  },
  UNDO_RESTORES_BOARD: {
    label: 'Ejemplo 2: Deshacer una jugada restaura el tablero y el turno',
    arrangeSummary: 'Iniciamos una partida estándar y avanzamos el peón blanco de e2 a e4.',
    actSummary: 'Ejecutamos game.undo() sobre la fachada IGameEngine.',
    assertSummary: 'La casilla e4 vuelve a estar vacía, el peón regresa a e2 y el turno vuelve a ser WHITE.',
    code: `it('restaura la posicion exacta del tablero y el turno al ejecutar undo', () => {
  const game = new ChessGame();
  const from = Position.fromAlgebraic('e2');
  const to = Position.fromAlgebraic('e4');
  game.makeMove(from, to);

  const wasUndone = game.undo();
  const snapshot = game.getSnapshot();

  expect(wasUndone).toBe(true);
  expect(snapshot.currentTurn).toBe('WHITE');
  expect(snapshot.grid[from.row][from.col]?.type).toBe('PAWN');
  expect(snapshot.grid[to.row][to.col]).toBeNull();
});`,
  },
};

function TddExamplesExplorer(): JSX.Element {
  const [selectedExample, setSelectedExample] = useState<TddExampleKey>('PINNED_KING_CHECK');
  const current = TDD_EXAMPLES_LOOKUP[selectedExample];

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TDD_EXAMPLES_LOOKUP) as TddExampleKey[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSelectedExample(k)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all ${
              selectedExample === k
                ? 'bg-emerald-500 text-zinc-950 border-emerald-300 shadow-sm'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
            }`}
          >
            {TDD_EXAMPLES_LOOKUP[k].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/40 flex flex-col gap-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
            1. Arrange (Preparar)
          </span>
          <p className="text-xs text-zinc-200 leading-snug">{current.arrangeSummary}</p>
        </div>

        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 flex flex-col gap-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
            2. Act (Actuar)
          </span>
          <p className="text-xs text-zinc-200 leading-snug">{current.actSummary}</p>
        </div>

        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col gap-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
            3. Assert (Verificar)
          </span>
          <p className="text-xs text-zinc-200 leading-snug">{current.assertSummary}</p>
        </div>
      </div>

      <IdeCodeBlock code={current.code} />
    </div>
  );
}

const SIMULATORS_LOOKUP: Record<InteractiveSimulatorId, () => ReactNode> = {
  SOLID_GRASP_EXPLORER: () => <SolidGraspExplorer />,
  COMMAND_STACK_SIMULATOR: () => <CommandStackSimulator />,
  STRATEGY_HYBRID_SIMULATOR: () => <StrategyHybridSimulator />,
  STATE_REACT_SIMULATOR: () => <StateReactSimulator />,
  ADAPTERS_HOTSWAP_SIMULATOR: () => <AdaptersHotSwapSimulator />,
  METHODOLOGY_PIPELINE_SIMULATOR: () => <MethodologyPipelineSimulator />,
  TDD_EXAMPLES_EXPLORER: () => <TddExamplesExplorer />,
};

export function InteractiveSimulatorRenderer({
  simulatorId,
}: {
  readonly simulatorId: InteractiveSimulatorId;
}): JSX.Element {
  return <>{SIMULATORS_LOOKUP[simulatorId]()}</>;
}
