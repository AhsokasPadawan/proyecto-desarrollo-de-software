import { ActionButton } from './ActionButton';

export interface GameActionBarProps {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly isTerminalState: boolean;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onReset: () => void;
  readonly onStartReplay?: () => void;
  readonly onExportMatch?: () => void;
  readonly isClockEnabled?: boolean;
  readonly isClockRunning?: boolean;
  readonly isClockPaused?: boolean;
  readonly onToggleClockPause?: () => void;
  readonly onAskHint?: () => void;
  readonly isHintLoading?: boolean;
  readonly onAnalyzeGame?: () => void;
  readonly isAnalyzingGame?: boolean;
}

function CurvedArrowBackIcon(): JSX.Element {
  return (
    <svg
      className="w-4 h-4 mr-1.5 inline-block"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
  );
}

function CurvedArrowForwardIcon(): JSX.Element {
  return (
    <svg
      className="w-4 h-4 ml-1.5 inline-block"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
    </svg>
  );
}

function UndoRedoButtons({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
}): JSX.Element {
  return (
    <>
      <ActionButton
        onClick={onUndo}
        disabled={!canUndo}
        testId="undo-button"
        className="px-3 py-1.5 text-xs flex items-center justify-center font-medium"
      >
        <CurvedArrowBackIcon />
        <span>Deshacer</span>
      </ActionButton>

      <ActionButton
        onClick={onRedo}
        disabled={!canRedo}
        testId="redo-button"
        className="px-3 py-1.5 text-xs flex items-center justify-center font-medium"
      >
        <span>Rehacer</span>
        <CurvedArrowForwardIcon />
      </ActionButton>
    </>
  );
}

function PostMatchButtons({
  onAnalyzeGame,
  isAnalyzingGame,
  onStartReplay,
  onExportMatch,
}: {
  readonly onAnalyzeGame?: () => void;
  readonly isAnalyzingGame: boolean;
  readonly onStartReplay?: () => void;
  readonly onExportMatch?: () => void;
}): JSX.Element {
  return (
    <>
      {onAnalyzeGame && (
        <ActionButton
          onClick={onAnalyzeGame}
          disabled={isAnalyzingGame}
          testId="analyze-game-button"
          className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-900/40"
        >
          <span>✨</span>
          <span>{isAnalyzingGame ? 'Analizando...' : 'Analizar Partida (IA)'}</span>
        </ActionButton>
      )}

      {onStartReplay && (
        <ActionButton
          onClick={onStartReplay}
          variant="primary"
          testId="review-match-button"
          className="px-3 py-1.5 text-xs font-semibold"
        >
          Revisar Partida
        </ActionButton>
      )}

      {onExportMatch && (
        <ActionButton
          onClick={onExportMatch}
          testId="export-match-button"
          className="px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
        >
          Exportar Partida
        </ActionButton>
      )}
    </>
  );
}

export function GameActionBar({
  canUndo,
  canRedo,
  isTerminalState,
  onUndo,
  onRedo,
  onReset,
  onStartReplay,
  onExportMatch,
  isClockEnabled = false,
  isClockRunning = false,
  isClockPaused = false,
  onToggleClockPause,
  onAskHint,
  isHintLoading = false,
  onAnalyzeGame,
  isAnalyzingGame = false,
}: GameActionBarProps): JSX.Element {
  const showClockPauseButton =
    isClockEnabled && !isTerminalState && onToggleClockPause && (isClockRunning || isClockPaused);

  return (
    <nav
      className="w-full flex flex-wrap items-center justify-center gap-2 p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-xl backdrop-blur-md"
      aria-label="Acciones de la partida"
      data-testid="game-action-bar"
    >
      {!isClockEnabled && (
        <UndoRedoButtons canUndo={canUndo} canRedo={canRedo} onUndo={onUndo} onRedo={onRedo} />
      )}

      {showClockPauseButton && (
        <ActionButton
          onClick={onToggleClockPause}
          variant={isClockPaused ? 'primary' : 'default'}
          testId="toggle-clock-pause-button"
          className="px-3 py-1.5 text-xs font-semibold"
        >
          {isClockPaused ? 'Reanudar Tiempo' : 'Pausar Tiempo'}
        </ActionButton>
      )}

      {!isTerminalState && onAskHint && (
        <ActionButton
          onClick={onAskHint}
          disabled={isHintLoading}
          testId="ask-hint-button"
          className="px-3 py-1.5 text-xs font-semibold bg-sky-700 hover:bg-sky-600 text-white flex items-center gap-1.5"
        >
          <span>💡</span>
          <span>{isHintLoading ? 'Consultando Coach...' : 'Pedir sugerencia'}</span>
        </ActionButton>
      )}

      <ActionButton
        onClick={onReset}
        variant="danger"
        testId="reset-button"
        className="px-3 py-1.5 text-xs"
      >
        Reiniciar Partida
      </ActionButton>

      {isTerminalState && (
        <PostMatchButtons
          onAnalyzeGame={onAnalyzeGame}
          isAnalyzingGame={isAnalyzingGame}
          onStartReplay={onStartReplay}
          onExportMatch={onExportMatch}
        />
      )}
    </nav>
  );
}
