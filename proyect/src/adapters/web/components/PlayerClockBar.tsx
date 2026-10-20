import { Color } from '../../../core/pieces/types';
import { PLAYER_DISPLAY_CONFIG } from '../pieceDisplay';

export interface PlayerClockBarProps {
  readonly color: Color;
  readonly formattedTime: string;
  readonly isActive: boolean;
  readonly isLowTime: boolean;
  readonly isPaused?: boolean;
}

export type ClockVisualState = 'LOW_TIME' | 'ACTIVE' | 'INACTIVE';

interface ClockVisualStyle {
  readonly clockBarStyles: string;
  readonly clockTimeStyles: string;
}

export const CLOCK_VISUAL_STATE_STYLES: Record<ClockVisualState, ClockVisualStyle> = {
  LOW_TIME: {
    clockBarStyles:
      'bg-red-950/80 border-red-500 ring-2 ring-red-500/60 shadow-lg shadow-red-950/50 animate-pulse',
    clockTimeStyles: 'text-red-300',
  },
  ACTIVE: {
    clockBarStyles:
      'bg-zinc-900 border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-950/30',
    clockTimeStyles: 'text-emerald-300',
  },
  INACTIVE: {
    clockBarStyles: 'bg-zinc-900/80 border-zinc-800 opacity-80',
    clockTimeStyles: 'text-zinc-300',
  },
};

export function resolveClockVisualState(isActive: boolean, isLowTime: boolean): ClockVisualState {
  if (isActive && isLowTime) {
    return 'LOW_TIME';
  }
  if (isActive) {
    return 'ACTIVE';
  }
  return 'INACTIVE';
}

export function PlayerClockBar({
  color,
  formattedTime,
  isActive,
  isLowTime,
  isPaused = false,
}: PlayerClockBarProps): JSX.Element {
  const { tag, badgeStyle, dotStyle } = PLAYER_DISPLAY_CONFIG[color];
  const visualState = resolveClockVisualState(isActive, isLowTime);
  const { clockBarStyles, clockTimeStyles } = CLOCK_VISUAL_STATE_STYLES[visualState];

  return (
    <div
      className={`w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border backdrop-blur-md transition-all shadow-md ${clockBarStyles}`}
      data-testid={`player-clock-${color.toLowerCase()}`}
    >
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${dotStyle}`} />
        <span className={`px-2 py-0.5 rounded text-[11px] border shadow-xs ${badgeStyle}`}>
          {tag}
        </span>
        {isPaused && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Pausa
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 font-mono">
        <span className={`text-xl sm:text-2xl font-black tracking-widest ${clockTimeStyles}`}>
          {formattedTime}
        </span>
      </div>
    </div>
  );
}
