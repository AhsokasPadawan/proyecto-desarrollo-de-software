import { Color } from '../../core/pieces/types';
import { GameSnapshot } from '../../core/ports/GameSnapshot';
import { getStateBadgeClass, getStateLabel } from './stateDisplayLookup';
import { GAME_MODES, GameMode } from './types';
import { ModeSelectorButton } from './components/ModeSelectorButton';
import { ControlSection } from './components/ControlSection';
import { FeedbackBanner } from './components/FeedbackBanner';
import { MoveHistoryTable } from './components/MoveHistoryTable';
import { PlaybackSpeed, ReplayControlSection } from './components/ReplayControlSection';
import { ClockConfigSection } from './components/ClockConfigSection';

export interface ControlPanelViewProps {
  readonly snapshot: GameSnapshot;
  readonly currentGameMode: GameMode;
  readonly feedbackMessage: string | null;
  readonly onModeChange: (newMode: GameMode) => void;
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
  readonly onJumpToMove?: (targetIndex: number) => void;
  readonly isClockEnabled?: boolean;
  readonly isClockRunning?: boolean;
  readonly whiteMinutes?: number;
  readonly blackMinutes?: number;
  readonly onToggleClock?: (enabled: boolean) => void;
  readonly onWhiteMinutesChange?: (minutes: number) => void;
  readonly onBlackMinutesChange?: (minutes: number) => void;
  readonly onStartClockMatch?: () => void;
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
  isReplaying = false,
  isPlaying = false,
  playbackSpeed = 1000,
  onExitReplay,
  onGoToStart,
  onStepBackward,
  onTogglePlay,
  onStepForward,
  onGoToEnd,
  onSpeedChange,
  onJumpToMove,
  isClockEnabled = false,
  isClockRunning = false,
  whiteMinutes = 10,
  blackMinutes = 10,
  onToggleClock,
  onWhiteMinutesChange,
  onBlackMinutesChange,
  onStartClockMatch,
}: ControlPanelViewProps): JSX.Element {
  const turnLabel = TURN_LABELS[snapshot.currentTurn] ?? snapshot.currentTurn;
  const turnBadgeClass = TURN_BADGES[snapshot.currentTurn] ?? 'bg-zinc-800 text-zinc-200';
  const stateLabel = getStateLabel(snapshot.stateKind);
  const stateBadgeClass = getStateBadgeClass(snapshot.stateKind);
  const hasGameStarted = snapshot.moveHistory.length > 0;

  return (
    <aside className="w-full lg:w-72 xl:w-80 h-full flex flex-col justify-between gap-3 p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-md">
      <div className="flex flex-col gap-2.5">
        <header className="border-b border-zinc-800 pb-2">
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Panel de Partida</h2>
        </header>

      <ControlSection title="Estado de Partida">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Turno Actual</span>
            <span
              className={`px-2.5 py-1.5 rounded-md text-xs border shadow-sm flex items-center justify-center gap-1.5 ${turnBadgeClass}`}
              data-testid="turn-indicator"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  snapshot.currentTurn === 'WHITE' ? 'bg-amber-400' : 'bg-zinc-400'
                }`}
              />
              {turnLabel}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Fase del Juego</span>
            <div
              className={`px-2.5 py-1.5 rounded-md text-xs border flex items-center justify-center text-center font-medium ${stateBadgeClass}`}
              data-testid="game-state-banner"
            >
              <span className="truncate">{stateLabel}</span>
            </div>
          </div>
        </div>
      </ControlSection>

      {feedbackMessage && <FeedbackBanner message={feedbackMessage} />}

      {!hasGameStarted && !isReplaying ? (
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

          {currentGameMode === 'HUMAN_VS_HUMAN' && onToggleClock && onWhiteMinutesChange && onBlackMinutesChange && onStartClockMatch && (
            <ClockConfigSection
              isClockEnabled={isClockEnabled}
              isClockRunning={isClockRunning}
              whiteMinutes={whiteMinutes}
              blackMinutes={blackMinutes}
              onToggleClock={onToggleClock}
              onWhiteMinutesChange={onWhiteMinutesChange}
              onBlackMinutesChange={onBlackMinutesChange}
              onStartMatch={onStartClockMatch}
            />
          )}
        </ControlSection>
      ) : (
        <ControlSection title={`Historial de Jugadas (${snapshot.moveHistory.length})`} hasDivider>
          <MoveHistoryTable
            moveHistory={snapshot.moveHistory}
            currentMoveIndex={snapshot.currentMoveIndex}
            onJumpToMove={onJumpToMove}
          />
        </ControlSection>
      )}
      </div>

      {isReplaying && onExitReplay && onGoToStart && onStepBackward && onTogglePlay && onStepForward && onGoToEnd && onSpeedChange && (
        <div className="mt-auto pt-2 border-t border-zinc-800">
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
        </div>
      )}
    </aside>
  );
}
