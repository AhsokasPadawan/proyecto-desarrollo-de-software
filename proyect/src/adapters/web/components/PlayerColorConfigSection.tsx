import { Color } from '../../../core/pieces/types';
import { PLAYER_DISPLAY_CONFIG, STANDARD_PIECE_SYMBOLS } from '../pieceDisplay';
import { ActionButton } from './ActionButton';

export interface PlayerColorConfigSectionProps {
  readonly playerColor: Color;
  readonly isAiThinking?: boolean;
  readonly onPlayerColorChange: (color: Color) => void;
  readonly onStartMatch: () => void;
}

const COLOR_OPTIONS: readonly Color[] = ['WHITE', 'BLACK'];

export function WhiteMoveStartPrompt(): JSX.Element {
  return (
    <div
      className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs leading-relaxed"
      data-testid="white-start-prompt"
    >
      <span className="text-sm leading-none select-none mt-0.5" aria-hidden="true">
        💡
      </span>
      <span>
        <strong>Las Blancas comienzan:</strong> mové cualquier pieza blanca en el tablero para
        iniciar la partida.
      </span>
    </div>
  );
}

function ColorOptionButton({
  color,
  isSelected,
  disabled,
  onSelect,
}: {
  readonly color: Color;
  readonly isSelected: boolean;
  readonly disabled: boolean;
  readonly onSelect: () => void;
}): JSX.Element {
  const { tag, dotStyle } = PLAYER_DISPLAY_CONFIG[color];
  const kingSymbol = STANDARD_PIECE_SYMBOLS[color].KING;
  const selectedClass = isSelected
    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold shadow-sm'
    : 'bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      data-testid={`select-color-${color.toLowerCase()}`}
      aria-pressed={isSelected}
      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedClass}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotStyle}`} />
      <span className="text-base leading-none select-none" aria-hidden="true">
        {kingSymbol}
      </span>
      <span>{tag}</span>
    </button>
  );
}

export function PlayerColorConfigSection({
  playerColor,
  isAiThinking = false,
  onPlayerColorChange,
  onStartMatch,
}: PlayerColorConfigSectionProps): JSX.Element {
  return (
    <div
      className="flex flex-col gap-2.5 pt-2 border-t border-zinc-800 text-xs"
      data-testid="player-color-config-section"
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Jugar con Piezas
        </span>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_OPTIONS.map((color) => (
            <ColorOptionButton
              key={color}
              color={color}
              isSelected={playerColor === color}
              disabled={isAiThinking}
              onSelect={() => onPlayerColorChange(color)}
            />
          ))}
        </div>
      </div>

      {playerColor === 'WHITE' ? (
        <WhiteMoveStartPrompt />
      ) : (
        <div
          className="flex flex-col gap-2 p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80"
          data-testid="black-start-prompt"
        >
          <span className="text-zinc-300 leading-relaxed">
            La IA juega con <strong>Blancas</strong> y realiza el primer movimiento. Pulsá el botón
            cuando estés listo para comenzar.
          </span>
          <ActionButton
            onClick={onStartMatch}
            disabled={isAiThinking}
            variant="primary"
            testId="start-ai-match-button"
            className="w-full py-1.5 text-xs font-bold"
          >
            {isAiThinking ? 'Iniciando Partida...' : 'Iniciar Partida'}
          </ActionButton>
        </div>
      )}
    </div>
  );
}
