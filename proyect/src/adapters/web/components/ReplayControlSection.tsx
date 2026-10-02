import { ActionButton } from './ActionButton';

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
  readonly onReset?: () => void;
  readonly onExportMatch?: () => void;
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
  onReset,
  onExportMatch,
}: ReplayControlSectionProps): JSX.Element {
  const isAtStart = currentMoveIndex <= 0;
  const isAtEnd = currentMoveIndex >= totalMoves;

  return (
    <nav
      className="w-full flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-xl backdrop-blur-md"
      aria-label="Controles de reproducción de partida"
      data-testid="replay-control-bar"
    >
      <div className="flex items-center gap-3">
        <div
          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-bold border border-zinc-700 whitespace-nowrap"
          data-testid="replay-progress-indicator"
        >
          Jugada {currentMoveIndex} de {totalMoves}
        </div>

        <div className="flex items-center gap-1">
          <ActionButton onClick={onGoToStart} disabled={isAtStart} testId="replay-start-button" className="px-2.5 py-1.5 text-xs font-bold">
            |&lt;&lt;
          </ActionButton>
          <ActionButton onClick={onStepBackward} disabled={isAtStart} testId="replay-prev-button" className="px-2.5 py-1.5 text-xs font-bold">
            &lt;
          </ActionButton>
          <ActionButton onClick={onTogglePlay} variant={isPlaying ? 'danger' : 'primary'} testId="replay-play-button" className="px-3 py-1.5 text-xs font-bold">
            {isPlaying ? 'Pausa' : 'Play'}
          </ActionButton>
          <ActionButton onClick={onStepForward} disabled={isAtEnd} testId="replay-next-button" className="px-2.5 py-1.5 text-xs font-bold">
            &gt;
          </ActionButton>
          <ActionButton onClick={onGoToEnd} disabled={isAtEnd} testId="replay-end-button" className="px-2.5 py-1.5 text-xs font-bold">
            &gt;&gt;|
          </ActionButton>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400 font-medium">Velocidad:</span>
        <div className="flex items-center gap-1">
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

      <div className="flex items-center gap-2">
        {onExportMatch && (
          <ActionButton onClick={onExportMatch} testId="export-match-button" className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white">
            Exportar Partida
          </ActionButton>
        )}
        {onReset && (
          <ActionButton onClick={onReset} variant="danger" testId="reset-button" className="px-3 py-1.5 text-xs font-semibold">
            Reiniciar Partida
          </ActionButton>
        )}
        <ActionButton onClick={onExitReplay} variant="primary" testId="exit-replay-button" className="px-3 py-1.5 text-xs font-semibold">
          Salir de Revisión
        </ActionButton>
      </div>
    </nav>
  );
}
