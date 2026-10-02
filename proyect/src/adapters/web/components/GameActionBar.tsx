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

export function GameActionBar({
  canUndo,
  canRedo,
  isTerminalState,
  onUndo,
  onRedo,
  onReset,
  onStartReplay,
  onExportMatch,
}: GameActionBarProps): JSX.Element {
  return (
    <nav
      className="w-full flex flex-wrap items-center justify-center gap-2 p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-xl backdrop-blur-md"
      aria-label="Acciones de la partida"
      data-testid="game-action-bar"
    >
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

      <ActionButton
        onClick={onReset}
        variant="danger"
        testId="reset-button"
        className="px-3 py-1.5 text-xs"
      >
        Reiniciar Partida
      </ActionButton>

      {isTerminalState && onStartReplay && (
        <ActionButton
          onClick={onStartReplay}
          variant="primary"
          testId="review-match-button"
          className="px-3 py-1.5 text-xs font-semibold"
        >
          Revisar Partida
        </ActionButton>
      )}

      {isTerminalState && onExportMatch && (
        <ActionButton
          onClick={onExportMatch}
          testId="export-match-button"
          className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white"
        >
          Exportar Partida
        </ActionButton>
      )}
    </nav>
  );
}
