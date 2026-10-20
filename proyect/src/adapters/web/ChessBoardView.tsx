import { Position } from '../../core/board/Position';
import { GameSnapshot } from '../../core/ports/GameSnapshot';
import { ChessSquare, SquareHighlightRole } from './components/ChessSquare';

export interface ChessBoardViewProps {
  readonly snapshot: GameSnapshot;
  readonly selectedPosition: Position | null;
  readonly legalMoves: readonly Position[];
  readonly onSquareClick: (position: Position) => void;
  readonly activeMoveSquares?: { readonly from: string; readonly to: string } | null;
  readonly suggestedMoveSquares?: { readonly from: string; readonly to: string } | null;
  readonly readOnly?: boolean;
}

export function getFileLabel(colIndex: number): string {
  return String.fromCharCode(97 + colIndex);
}

export function getRankLabel(rowIndex: number): string {
  return (rowIndex + 1).toString();
}

export function resolveSquareHighlightRole(
  squareAlgebraic: string,
  activeMoveSquares: { readonly from: string; readonly to: string } | null,
  suggestedMoveSquares: { readonly from: string; readonly to: string } | null
): SquareHighlightRole | null {
  const isPlayedOrigin = activeMoveSquares?.from === squareAlgebraic;
  const isPlayedDest = activeMoveSquares?.to === squareAlgebraic;
  const isSuggestedOrigin = suggestedMoveSquares?.from === squareAlgebraic;
  const isSuggestedDest = suggestedMoveSquares?.to === squareAlgebraic;

  if (isPlayedDest && isSuggestedDest) {
    return 'destination-optimal';
  }
  if (isSuggestedDest) {
    return 'suggestion-destination';
  }
  if (isPlayedDest) {
    return 'destination';
  }
  if (isPlayedOrigin) {
    return 'origin';
  }
  if (isSuggestedOrigin) {
    return 'suggestion-origin';
  }
  return null;
}

export function ChessBoardView({
  snapshot,
  selectedPosition,
  legalMoves,
  onSquareClick,
  activeMoveSquares = null,
  suggestedMoveSquares = null,
  readOnly = false,
}: ChessBoardViewProps): JSX.Element {
  const rowIndices = Array.from({ length: snapshot.rows }, (_, i) => snapshot.rows - 1 - i);
  const colIndices = Array.from({ length: snapshot.cols }, (_, i) => i);
  const legalTargetKeys = new Set(legalMoves.map((move) => `${move.row},${move.col}`));

  const selectedPiece = selectedPosition
    ? snapshot.grid[selectedPosition.row][selectedPosition.col]
    : null;

  return (
    <div className="flex flex-col items-center justify-center select-none w-full">
      <div className="relative border-4 border-zinc-800 rounded-xl shadow-2xl bg-zinc-900 p-2 w-full aspect-square flex items-center justify-center">
        <div
          className="grid gap-0 border border-zinc-700/60 rounded overflow-hidden w-full h-full aspect-square"
          style={{
            gridTemplateColumns: `repeat(${snapshot.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${snapshot.rows}, minmax(0, 1fr))`,
          }}
          data-testid="chess-grid"
        >
          {rowIndices.map((row) =>
            colIndices.map((col) => {
              const piece = snapshot.grid[row][col];
              const isSelected = Boolean(
                selectedPosition && selectedPosition.row === row && selectedPosition.col === col
              );
              const isLegalTarget = legalTargetKeys.has(`${row},${col}`);
              const isEnPassantCapture = Boolean(
                selectedPiece &&
                  selectedPiece.type === 'PAWN' &&
                  selectedPosition &&
                  selectedPosition.col !== col
              );
              const isCaptureTarget = piece !== null || isEnPassantCapture;
              const squarePosition = new Position(row, col);
              const highlightRole = resolveSquareHighlightRole(
                squarePosition.toAlgebraic(),
                activeMoveSquares,
                suggestedMoveSquares
              );

              return (
                <ChessSquare
                  key={`${row}-${col}`}
                  position={squarePosition}
                  piece={piece}
                  isSelected={isSelected}
                  isLegalTarget={isLegalTarget}
                  isCaptureTarget={isCaptureTarget}
                  rankLabel={col === 0 ? getRankLabel(row) : null}
                  fileLabel={row === 0 ? getFileLabel(col) : null}
                  ariaLabel={`Casilla ${getFileLabel(col)}${getRankLabel(row)}`}
                  onClick={readOnly ? () => {} : onSquareClick}
                  highlightRole={highlightRole}
                  isHighlighted={highlightRole !== null}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
