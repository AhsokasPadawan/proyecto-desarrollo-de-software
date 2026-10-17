import { Position } from '../../../core/board/Position';
import { PieceSnapshot } from '../../../core/ports/GameSnapshot';
import { PieceDisplay } from '../pieceDisplay';

export type SquareHighlightRole =
  | 'origin'
  | 'destination'
  | 'suggestion-origin'
  | 'suggestion-destination'
  | 'destination-optimal';

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
  origin: 'ring-4 ring-sky-400 bg-sky-500/35 ring-inset z-10',
  destination: 'ring-4 ring-amber-400 bg-amber-500/35 ring-inset z-10',
  'suggestion-origin': 'ring-4 ring-dashed ring-emerald-400/90 bg-emerald-500/20 ring-inset z-10',
  'suggestion-destination': 'ring-4 ring-emerald-400 bg-emerald-500/40 ring-inset shadow-lg shadow-emerald-500/30 z-10',
  'destination-optimal': 'ring-4 ring-emerald-400 bg-emerald-500/40 ring-inset shadow-lg shadow-emerald-500/40 z-10',
};

const HIGHLIGHT_ROLE_TITLES: Record<SquareHighlightRole, (algebraic: string) => string> = {
  origin: (algebraic) => `Origen jugado (From: ${algebraic}): Casilla de salida`,
  destination: (algebraic) => `Destino jugado (To: ${algebraic}): Casilla de llegada`,
  'suggestion-origin': (algebraic) => `Origen sugerido (From: ${algebraic})`,
  'suggestion-destination': (algebraic) => `Mejor jugada sugerida por el motor (To: ${algebraic})`,
  'destination-optimal': (algebraic) => `Jugada realizada óptima (To: ${algebraic})`,
};

function SquareCoordinateLabels({
  rankLabel,
  fileLabel,
  labelColor,
}: {
  readonly rankLabel: string | null;
  readonly fileLabel: string | null;
  readonly labelColor: string;
}): JSX.Element {
  return (
    <>
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
    </>
  );
}

function OptimalMoveStarBadge(): JSX.Element {
  return (
    <span
      className="absolute top-0.5 right-1 text-[11px] font-black text-emerald-300 drop-shadow pointer-events-none select-none z-20"
      aria-hidden="true"
    >
      ★
    </span>
  );
}

function LegalMoveTargetIndicator({
  position,
  isCaptureTarget,
}: {
  readonly position: Position;
  readonly isCaptureTarget: boolean;
}): JSX.Element {
  if (isCaptureTarget) {
    return (
      <span
        className="absolute inset-0 ring-4 ring-red-500/90 ring-inset bg-red-600/30 pointer-events-none"
        data-testid={`legal-target-capture-${position.row}-${position.col}`}
      />
    );
  }

  return (
    <span
      className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-950/40 ring-2 ring-emerald-400 shadow pointer-events-none"
      data-testid={`legal-target-empty-${position.row}-${position.col}`}
    />
  );
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
  isHighlighted = false,
  highlightRole = null,
}: ChessSquareProps): JSX.Element {
  const isDarkSquare = (position.row + position.col) % 2 === 0;
  const squareBackground = isDarkSquare ? 'bg-emerald-800' : 'bg-emerald-100';
  const labelColor = isDarkSquare ? 'text-emerald-200/80' : 'text-emerald-900/80';

  const roleHighlightClass = highlightRole ? HIGHLIGHT_ROLE_CLASSES[highlightRole] : '';
  const fallbackHighlightClass = isHighlighted ? 'ring-4 ring-amber-400/80 ring-inset z-10' : '';
  const activeHighlightClass = roleHighlightClass || fallbackHighlightClass;

  const roleTitle = highlightRole ? HIGHLIGHT_ROLE_TITLES[highlightRole](position.toAlgebraic()) : undefined;
  const showStarBadge = highlightRole === 'suggestion-destination' || highlightRole === 'destination-optimal';

  return (
    <button
      type="button"
      onClick={() => onClick(position)}
      className={`relative w-full h-full min-w-7 min-h-7 aspect-square flex items-center justify-center transition-colors focus:outline-none ${squareBackground} ${
        isSelected ? 'ring-4 ring-amber-400 ring-inset z-10' : activeHighlightClass
      }`}
      data-testid={`square-${position.row}-${position.col}`}
      data-highlighted={highlightRole || isHighlighted ? 'true' : undefined}
      data-highlight-role={highlightRole ?? undefined}
      aria-label={ariaLabel}
      title={roleTitle}
    >
      <SquareCoordinateLabels rankLabel={rankLabel} fileLabel={fileLabel} labelColor={labelColor} />
      {showStarBadge && <OptimalMoveStarBadge />}
      {piece && <PieceDisplay piece={piece} />}
      {isLegalTarget && (
        <LegalMoveTargetIndicator position={position} isCaptureTarget={isCaptureTarget} />
      )}
    </button>
  );
}
