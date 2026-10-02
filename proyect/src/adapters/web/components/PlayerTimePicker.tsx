import { Color } from '../../../core/pieces/types';

export interface PlayerTimePickerProps {
  readonly color: Color;
  readonly label: string;
  readonly minutes: number;
  readonly isClockRunning?: boolean;
  readonly onChange: (minutes: number) => void;
}

const PRESET_OPTIONS = [3, 5, 10, 15] as const;

export function PlayerTimePicker({
  color,
  label,
  minutes,
  isClockRunning = false,
  onChange,
}: PlayerTimePickerProps): JSX.Element {
  const colorId = color.toLowerCase();
  const labelColorClass = color === 'WHITE' ? 'text-amber-200' : 'text-zinc-400';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-medium ${labelColorClass}`}>{label}:</span>
        <span className="font-bold text-zinc-200">{minutes} min</span>
      </div>
      <div className="flex items-center gap-1">
        {PRESET_OPTIONS.map((preset) => (
          <button
            key={`${colorId}-${preset}`}
            type="button"
            disabled={isClockRunning}
            onClick={() => onChange(preset)}
            data-testid={`${colorId}-preset-${preset}`}
            className={`flex-1 py-0.5 rounded text-[10px] font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              minutes === preset
                ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            {preset}m
          </button>
        ))}
        <button
          type="button"
          disabled={isClockRunning}
          onClick={() => onChange(Math.max(1, minutes - 1))}
          data-testid={`${colorId}-minus-button`}
          className="w-6 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        <button
          type="button"
          disabled={isClockRunning}
          onClick={() => onChange(Math.min(60, minutes + 1))}
          data-testid={`${colorId}-plus-button`}
          className="w-6 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
    </div>
  );
}
