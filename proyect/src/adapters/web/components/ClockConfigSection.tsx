import { ActionButton } from './ActionButton';

export interface ClockConfigSectionProps {
  readonly isClockEnabled: boolean;
  readonly whiteMinutes: number;
  readonly blackMinutes: number;
  readonly isClockRunning?: boolean;
  readonly onToggleClock: (enabled: boolean) => void;
  readonly onWhiteMinutesChange: (minutes: number) => void;
  readonly onBlackMinutesChange: (minutes: number) => void;
  readonly onStartMatch: () => void;
}

const PRESET_OPTIONS = [3, 5, 10, 15] as const;

export function ClockConfigSection({
  isClockEnabled,
  whiteMinutes,
  blackMinutes,
  isClockRunning = false,
  onToggleClock,
  onWhiteMinutesChange,
  onBlackMinutesChange,
  onStartMatch,
}: ClockConfigSectionProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2.5 pt-2 border-t border-zinc-800 text-xs">
      <label className="flex items-center justify-between cursor-pointer select-none">
        <span className="font-semibold text-zinc-300">Jugar con Reloj</span>
        <input
          type="checkbox"
          checked={isClockEnabled}
          disabled={isClockRunning}
          onChange={(e) => onToggleClock(e.target.checked)}
          data-testid="clock-enable-toggle"
          className="w-4 h-4 rounded text-emerald-500 bg-zinc-800 border-zinc-700 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
        />
      </label>

      {isClockEnabled && (
        <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Configuración de Reloj
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-amber-200">Blancas:</span>
              <span className="font-bold text-zinc-200">{whiteMinutes} min</span>
            </div>
            <div className="flex items-center gap-1">
              {PRESET_OPTIONS.map((minutes) => (
                <button
                  key={`white-${minutes}`}
                  type="button"
                  disabled={isClockRunning}
                  onClick={() => onWhiteMinutesChange(minutes)}
                  data-testid={`white-preset-${minutes}`}
                  className={`flex-1 py-0.5 rounded text-[10px] font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    whiteMinutes === minutes
                      ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  {minutes}m
                </button>
              ))}
              <button
                type="button"
                disabled={isClockRunning}
                onClick={() => onWhiteMinutesChange(Math.max(1, whiteMinutes - 1))}
                data-testid="white-minus-button"
                className="w-6 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <button
                type="button"
                disabled={isClockRunning}
                onClick={() => onWhiteMinutesChange(Math.min(60, whiteMinutes + 1))}
                data-testid="white-plus-button"
                className="w-6 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-400">Negras:</span>
              <span className="font-bold text-zinc-200">{blackMinutes} min</span>
            </div>
            <div className="flex items-center gap-1">
              {PRESET_OPTIONS.map((minutes) => (
                <button
                  key={`black-${minutes}`}
                  type="button"
                  disabled={isClockRunning}
                  onClick={() => onBlackMinutesChange(minutes)}
                  data-testid={`black-preset-${minutes}`}
                  className={`flex-1 py-0.5 rounded text-[10px] font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    blackMinutes === minutes
                      ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  {minutes}m
                </button>
              ))}
              <button
                type="button"
                disabled={isClockRunning}
                onClick={() => onBlackMinutesChange(Math.max(1, blackMinutes - 1))}
                data-testid="black-minus-button"
                className="w-6 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <button
                type="button"
                disabled={isClockRunning}
                onClick={() => onBlackMinutesChange(Math.min(60, blackMinutes + 1))}
                data-testid="black-plus-button"
                className="w-6 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          <ActionButton
            onClick={onStartMatch}
            disabled={isClockRunning}
            variant="primary"
            testId="start-clock-match-button"
            className="w-full py-1.5 text-xs font-bold mt-1"
          >
            {isClockRunning ? 'Partida en Curso' : 'Iniciar Partida con Reloj'}
          </ActionButton>
        </div>
      )}
    </div>
  );
}
