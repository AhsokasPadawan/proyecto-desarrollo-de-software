import { ActionButton } from './ActionButton';
import { ControlSection } from './ControlSection';

export type PlaybackSpeed = 500 | 1000 | 2000;

export interface ReplayControlSectionProps {
  readonly currentMoveIndex: number;
  readonly totalMoves: number;
  readonly isPlaying: boolean;
  readonly playbackSpeed: PlaybackSpeed;
  readonly onGoToStart: () => void;
  readonly onStepBackward: () => void;
  readonly onTogglePlay: () => void;
  readonly onStepForward: () => void;
  readonly onGoToEnd: () => void;
  readonly onSpeedChange: (speed: PlaybackSpeed) => void;
  readonly onExitReplay: () => void;
}

const SPEED_OPTIONS: readonly { readonly speed: PlaybackSpeed; readonly label: string }[] = [
  { speed: 500, label: '0.5s' },
  { speed: 1000, label: '1.0s' },
  { speed: 2000, label: '2.0s' },
];

export function ReplayControlSection({
  currentMoveIndex,
  totalMoves,
  isPlaying,
  playbackSpeed,
  onGoToStart,
  onStepBackward,
  onTogglePlay,
  onStepForward,
  onGoToEnd,
  onSpeedChange,
  onExitReplay,
}: ReplayControlSectionProps): JSX.Element {
  const isAtStart = currentMoveIndex <= 0;
  const isAtEnd = currentMoveIndex >= totalMoves;

  return (
    <ControlSection title="Reproducción de Partida" hasDivider>
      <div
        className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-semibold text-center border border-zinc-700"
        data-testid="replay-progress-indicator"
      >
        Jugada {currentMoveIndex} de {totalMoves}
      </div>

      <div className="grid grid-cols-5 gap-1.5 mt-2">
        <ActionButton
          onClick={onGoToStart}
          disabled={isAtStart}
          testId="replay-start-button"
          className="text-xs px-1"
        >
          |&lt;&lt;
        </ActionButton>
        <ActionButton
          onClick={onStepBackward}
          disabled={isAtStart}
          testId="replay-prev-button"
          className="text-xs px-1"
        >
          &lt;
        </ActionButton>
        <ActionButton
          onClick={onTogglePlay}
          variant={isPlaying ? 'danger' : 'primary'}
          testId="replay-play-button"
          className="text-xs px-1 font-bold"
        >
          {isPlaying ? 'Pausa' : 'Play'}
        </ActionButton>
        <ActionButton
          onClick={onStepForward}
          disabled={isAtEnd}
          testId="replay-next-button"
          className="text-xs px-1"
        >
          &gt;
        </ActionButton>
        <ActionButton
          onClick={onGoToEnd}
          disabled={isAtEnd}
          testId="replay-end-button"
          className="text-xs px-1"
        >
          &gt;&gt;|
        </ActionButton>
      </div>

      <div className="flex items-center justify-between gap-1.5 mt-3">
        <span className="text-xs text-zinc-400">Velocidad:</span>
        <div className="flex gap-1">
          {SPEED_OPTIONS.map((option) => (
            <button
              key={option.speed}
              type="button"
              onClick={() => onSpeedChange(option.speed)}
              data-testid={`speed-button-${option.speed}`}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                playbackSpeed === option.speed
                  ? 'bg-amber-600 border-amber-500 text-zinc-100 font-bold'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <ActionButton
        onClick={onExitReplay}
        variant="danger"
        testId="exit-replay-button"
        className="mt-3 w-full"
      >
        Salir de Revisión
      </ActionButton>
    </ControlSection>
  );
}
