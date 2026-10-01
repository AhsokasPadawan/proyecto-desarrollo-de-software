import { Position } from '../../../core/board/Position';
import { PieceSnapshot } from '../../../core/ports/GameSnapshot';
import { renderPieceContent } from '../pieceDisplay';

export type SquareHighlightRole = 'origin' | 'destination';

export interface ChessSquareProps {
  readonly position: Position;
  readonly piece: PieceSnapshot | null;
  readonly isSelected: boolean;
  readonly isLegalTarget: boolean;
  readonly isCaptureTarget: boolean;
  readonly rankLabel: string | null;
  readonly fileLabel: string | null;
  readonly ariaLabel: string;
  readonly onClick: (pos: Position) => void;
  readonly isHighlighted?: boolean;
  readonly highlightRole?: SquareHighlightRole | null;
}

const HIGHLIGHT_ROLE_CLASSES: Record<SquareHighlightRole, string> = {
  origin: 'ring-4 ring-sky-400 bg-sky-500/40 ring-inset z-10',
  destination: 'ring-4 ring-amber-400 bg-amber-500/40 ring-inset z-10',
};

export function ChessSquare({
  position,
  piece,
  isSelected,
  isLegalTarget,
  isCaptureTarget,
  rankLabel,
  fileLabel,
  ariaLabel,
  onClick,
  isHighlighted = false,
  highlightRole = null,
}: ChessSquareProps): JSX.Element {
  const isDarkSquare = (position.row + position.col) % 2 === 0;
  const squareBackground = isDarkSquare ? 'bg-emerald-800' : 'bg-emerald-100';
  const labelColor = isDarkSquare ? 'text-emerald-200/80' : 'text-emerald-900/80';

  const roleHighlightClass = highlightRole ? HIGHLIGHT_ROLE_CLASSES[highlightRole] : '';
  const fallbackHighlightClass = isHighlighted ? 'ring-4 ring-amber-400/80 ring-inset z-10' : '';
  const activeHighlightClass = roleHighlightClass || fallbackHighlightClass;

  const roleTitle =
    highlightRole === 'origin'
      ? `Origen (From: ${position.toAlgebraic()}): Casilla de salida`
      : highlightRole === 'destination'
      ? `Destino (To: ${position.toAlgebraic()}): Casilla de llegada`
      : undefined;

  return (
    <button
      type="button"
      onClick={() => onClick(position)}
      className={`relative w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center transition-colors focus:outline-none ${squareBackground} ${
        isSelected ? 'ring-4 ring-amber-400 ring-inset z-10' : activeHighlightClass
      }`}
      data-testid={`square-${position.row}-${position.col}`}
      data-highlighted={highlightRole || isHighlighted ? 'true' : undefined}
      data-highlight-role={highlightRole ?? undefined}
      aria-label={ariaLabel}
      title={roleTitle}
    >
      {rankLabel && (
        <span
          className={`absolute top-0.5 left-1 text-[10px] font-bold pointer-events-none ${labelColor}`}
        >
          {rankLabel}
        </span>
      )}

      {fileLabel && (
        <span
          className={`absolute bottom-0.5 right-1 text-[10px] font-bold pointer-events-none ${labelColor}`}
        >
          {fileLabel}
        </span>
      )}

      {piece && renderPieceContent(piece)}

      {isLegalTarget && !isCaptureTarget && (
        <span
          className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-950/40 ring-2 ring-emerald-400 shadow pointer-events-none"
          data-testid={`legal-target-empty-${position.row}-${position.col}`}
        />
      )}

      {isLegalTarget && isCaptureTarget && (
        <span
          className="absolute inset-0 ring-4 ring-red-500/90 ring-inset bg-red-600/30 pointer-events-none"
          data-testid={`legal-target-capture-${position.row}-${position.col}`}
        />
      )}
    </button>
  );
}
