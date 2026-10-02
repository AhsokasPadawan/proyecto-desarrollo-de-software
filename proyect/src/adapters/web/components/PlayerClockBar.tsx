import { Color } from '../../../core/pieces/types';

export interface PlayerClockBarProps {
  readonly color: Color;
  readonly formattedTime: string;
  readonly isActive: boolean;
  readonly isLowTime: boolean;
  readonly isPaused?: boolean;
}

const PLAYER_LABELS: Record<Color, string> = {
  WHITE: 'Blancas',
  BLACK: 'Negras',
};

const BADGE_COLOR_CLASSES: Record<Color, string> = {
  WHITE: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
  BLACK: 'bg-zinc-950 text-zinc-100 border-zinc-700 font-bold',
};

export function PlayerClockBar({
  color,
  formattedTime,
  isActive,
  isLowTime,
  isPaused = false,
}: PlayerClockBarProps): JSX.Element {
  const label = PLAYER_LABELS[color];
  const badgeClass = BADGE_COLOR_CLASSES[color];

  const stateClass = isLowTime && isActive
    ? 'bg-red-950/80 border-red-500 ring-2 ring-red-500/60 shadow-lg shadow-red-950/50 animate-pulse'
    : isActive
    ? 'bg-zinc-900 border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-950/30'
    : 'bg-zinc-900/80 border-zinc-800 opacity-80';

  const timeColorClass = isLowTime && isActive
    ? 'text-red-300'
    : isActive
    ? 'text-emerald-300'
    : 'text-zinc-300';

  return (
    <div
      className={`w-full max-w-[474px] flex items-center justify-between px-3.5 py-1.5 rounded-xl border backdrop-blur-md transition-all shadow-md ${stateClass}`}
      data-testid={`player-clock-${color.toLowerCase()}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            color === 'WHITE' ? 'bg-amber-400' : 'bg-zinc-400'
          }`}
        />
        <span
          className={`px-2 py-0.5 rounded text-[11px] border shadow-xs ${badgeClass}`}
        >
          {label}
        </span>
        {isPaused && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Pausa
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 font-mono">
        <span
          className={`text-xl sm:text-2xl font-black tracking-widest ${timeColorClass}`}
        >
          {formattedTime}
        </span>
      </div>
    </div>
  );
}
