import { Color } from '../../core/pieces/types';
import { GameSnapshot } from '../../core/ports/GameSnapshot';
import { getStateBadgeClass, getStateLabel, isTerminalState } from './stateDisplayLookup';
import { GAME_MODES, GameMode } from './types';
import { ActionButton } from './components/ActionButton';
import { ModeSelectorButton } from './components/ModeSelectorButton';
import { ControlSection } from './components/ControlSection';
import { FeedbackBanner } from './components/FeedbackBanner';
import { PlaybackSpeed, ReplayControlSection } from './components/ReplayControlSection';

export interface ControlPanelViewProps {
  readonly snapshot: GameSnapshot;
  readonly currentGameMode: GameMode;
  readonly feedbackMessage: string | null;
  readonly onModeChange: (newMode: GameMode) => void;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onReset: () => void;
  readonly onExportMatch?: () => void;
  readonly isReplaying?: boolean;
  readonly isPlaying?: boolean;
  readonly playbackSpeed?: PlaybackSpeed;
  readonly onStartReplay?: () => void;
  readonly onExitReplay?: () => void;
  readonly onGoToStart?: () => void;
  readonly onStepBackward?: () => void;
  readonly onTogglePlay?: () => void;
  readonly onStepForward?: () => void;
  readonly onGoToEnd?: () => void;
  readonly onSpeedChange?: (speed: PlaybackSpeed) => void;
}

export const TURN_LABELS: Record<Color, string> = {
  WHITE: 'Blancas',
  BLACK: 'Negras',
};

export const TURN_BADGES: Record<Color, string> = {
  WHITE: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
  BLACK: 'bg-zinc-900 text-zinc-100 border-zinc-700 font-bold',
};

export function ControlPanelView({
  snapshot,
  currentGameMode,
  feedbackMessage,
  onModeChange,
  onUndo,
  onRedo,
  onReset,
  onExportMatch,
  isReplaying = false,
  isPlaying = false,
  playbackSpeed = 1000,
  onStartReplay,
  onExitReplay,
  onGoToStart,
  onStepBackward,
  onTogglePlay,
  onStepForward,
  onGoToEnd,
  onSpeedChange,
}: ControlPanelViewProps): JSX.Element {
  const turnLabel = TURN_LABELS[snapshot.currentTurn] ?? snapshot.currentTurn;
  const turnBadgeClass = TURN_BADGES[snapshot.currentTurn] ?? 'bg-zinc-800 text-zinc-200';
  const stateLabel = getStateLabel(snapshot.stateKind);
  const stateBadgeClass = getStateBadgeClass(snapshot.stateKind);

  return (
    <aside className="w-full max-w-sm flex flex-col gap-4 p-5 bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-md">
      <header className="border-b border-zinc-800 pb-3">
        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Panel de Partida</h2>
      </header>

      <ControlSection title="Turno Actual">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-md text-sm border shadow-sm flex items-center gap-2 ${turnBadgeClass}`}
            data-testid="turn-indicator"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                snapshot.currentTurn === 'WHITE' ? 'bg-amber-400' : 'bg-zinc-400'
              }`}
            />
            {turnLabel}
          </span>
        </div>
      </ControlSection>

      <ControlSection title="Fase del Juego">
        <div
          className={`px-3 py-2 rounded-lg text-sm border flex items-center justify-between ${stateBadgeClass}`}
          data-testid="game-state-banner"
        >
          <span>{stateLabel}</span>
          {snapshot.stateKind === 'CHECK' && (
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-800 text-red-100">
              Jaque
            </span>
          )}
        </div>
      </ControlSection>

      {feedbackMessage && <FeedbackBanner message={feedbackMessage} />}

      <ControlSection title="Modo de Juego" hasDivider>
        <div className="grid grid-cols-1 gap-1.5">
          {GAME_MODES.map((mode) => (
            <ModeSelectorButton
              key={mode.id}
              label={mode.label}
              isSelected={currentGameMode === mode.id}
              onClick={() => onModeChange(mode.id)}
              testId={`mode-selector-${mode.id.toLowerCase()}`}
            />
          ))}
        </div>
      </ControlSection>

      {isReplaying && onExitReplay && onGoToStart && onStepBackward && onTogglePlay && onStepForward && onGoToEnd && onSpeedChange ? (
        <ReplayControlSection
          currentMoveIndex={snapshot.currentMoveIndex}
          totalMoves={snapshot.moveHistory.length}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          onGoToStart={onGoToStart}
          onStepBackward={onStepBackward}
          onTogglePlay={onTogglePlay}
          onStepForward={onStepForward}
          onGoToEnd={onGoToEnd}
          onSpeedChange={onSpeedChange}
          onExitReplay={onExitReplay}
        />
      ) : (
        <ControlSection title="Historial y Acciones" hasDivider>
          {isTerminalState(snapshot.stateKind) && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {onStartReplay && (
                <ActionButton
                  onClick={onStartReplay}
                  variant="primary"
                  testId="review-match-button"
                >
                  Revisar Partida
                </ActionButton>
              )}
              {onExportMatch && (
                <ActionButton
                  onClick={onExportMatch}
                  testId="export-match-button"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white"
                >
                  Exportar (.txt)
                </ActionButton>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <ActionButton
              onClick={onUndo}
              disabled={!snapshot.canUndo}
              testId="undo-button"
            >
              Deshacer (Undo)
            </ActionButton>
            <ActionButton
              onClick={onRedo}
              disabled={!snapshot.canRedo}
              testId="redo-button"
            >
              Rehacer (Redo)
            </ActionButton>
          </div>
          <ActionButton
            onClick={onReset}
            variant="danger"
            testId="reset-button"
            className="mt-1"
          >
            Reiniciar Partida
          </ActionButton>
        </ControlSection>
      )}
    </aside>
  );
}
