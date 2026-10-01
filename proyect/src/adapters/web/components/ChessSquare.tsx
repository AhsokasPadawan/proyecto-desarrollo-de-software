import { Position } from '../../../core/board/Position';
import { PieceSnapshot } from '../../../core/ports/GameSnapshot';
import { renderPieceContent } from '../pieceDisplay';

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
}

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
}: ChessSquareProps): JSX.Element {
  const isDarkSquare = (position.row + position.col) % 2 === 0;
  const squareBackground = isDarkSquare ? 'bg-emerald-800' : 'bg-emerald-100';
  const labelColor = isDarkSquare ? 'text-emerald-200/80' : 'text-emerald-900/80';

  return (
    <button
      type="button"
      onClick={() => onClick(position)}
      className={`relative w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center transition-colors focus:outline-none ${squareBackground} ${
        isSelected ? 'ring-4 ring-amber-400 ring-inset z-10' : ''
      }`}
      data-testid={`square-${position.row}-${position.col}`}
      aria-label={ariaLabel}
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
