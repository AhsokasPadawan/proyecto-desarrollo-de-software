import { ActionButton } from './ActionButton';
import { PlayerTimePicker } from './PlayerTimePicker';

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

          <PlayerTimePicker
            color="WHITE"
            label="Blancas"
            minutes={whiteMinutes}
            isClockRunning={isClockRunning}
            onChange={onWhiteMinutesChange}
          />

          <PlayerTimePicker
            color="BLACK"
            label="Negras"
            minutes={blackMinutes}
            isClockRunning={isClockRunning}
            onChange={onBlackMinutesChange}
          />

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
