import { Position } from '../../core/board/Position';
import { GameSnapshot } from '../../core/ports/GameSnapshot';
import { ChessSquare } from './components/ChessSquare';

export interface ChessBoardViewProps {
  readonly snapshot: GameSnapshot;
  readonly selectedPosition: Position | null;
  readonly legalMoves: readonly Position[];
  readonly onSquareClick: (position: Position) => void;
  readonly activeMoveSquares?: { readonly from: string; readonly to: string } | null;
}

export function getFileLabel(colIndex: number): string {
  return String.fromCharCode(97 + colIndex);
}

export function getRankLabel(rowIndex: number): string {
  return (rowIndex + 1).toString();
}

export function ChessBoardView({
  snapshot,
  selectedPosition,
  legalMoves,
  onSquareClick,
  activeMoveSquares = null,
}: ChessBoardViewProps): JSX.Element {
  const rowIndices = Array.from({ length: snapshot.rows }, (_, i) => snapshot.rows - 1 - i);
  const colIndices = Array.from({ length: snapshot.cols }, (_, i) => i);

  const legalTargetsMap = new Map<string, Position>();
  for (const move of legalMoves) {
    legalTargetsMap.set(`${move.row},${move.col}`, move);
  }

  const selectedPiece = selectedPosition
    ? snapshot.grid[selectedPosition.row][selectedPosition.col]
    : null;

  return (
    <div className="flex flex-col items-center justify-center p-3 select-none">
      <div className="relative border-4 border-zinc-800 rounded-lg shadow-2xl bg-zinc-900 p-2">
        <div
          className="grid gap-0 border border-zinc-700/60 rounded overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${snapshot.cols}, minmax(0, 1fr))`,
          }}
          data-testid="chess-grid"
        >
          {rowIndices.map((row) =>
            colIndices.map((col) => {
              const piece = snapshot.grid[row][col];
              const isSelected = selectedPosition
                ? selectedPosition.row === row && selectedPosition.col === col
                : false;
              const isLegalTarget = legalTargetsMap.has(`${row},${col}`);
              const isEnPassantCapture = Boolean(
                selectedPiece &&
                  selectedPiece.type === 'PAWN' &&
                  selectedPosition &&
                  selectedPosition.col !== col
              );
              const isCaptureTarget = piece !== null || isEnPassantCapture;
              const squarePosition = new Position(row, col);
              const squareAlgebraic = squarePosition.toAlgebraic();

              let highlightRole: 'origin' | 'destination' | null = null;
              if (activeMoveSquares) {
                if (activeMoveSquares.from === squareAlgebraic) {
                  highlightRole = 'origin';
                } else if (activeMoveSquares.to === squareAlgebraic) {
                  highlightRole = 'destination';
                }
              }

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
                  onClick={onSquareClick}
                  highlightRole={highlightRole}
                  isHighlighted={highlightRole !== null}
                />
              );
            })
          )}
        </div>
      </div>

      {activeMoveSquares && (
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-3 text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-lg shadow-md"
          data-testid="move-highlight-legend"
        >
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded border border-sky-400 bg-sky-500 ring-2 ring-sky-400/50 flex-shrink-0" />
            <span>
              <strong className="text-sky-300 font-bold">Origen (From: {activeMoveSquares.from}):</strong>
              <span className="text-zinc-400 ml-1">Casilla de salida</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded border border-amber-400 bg-amber-500 ring-2 ring-amber-400/50 flex-shrink-0" />
            <span>
              <strong className="text-amber-300 font-bold">Destino (To: {activeMoveSquares.to}):</strong>
              <span className="text-zinc-400 ml-1">Casilla de llegada</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
