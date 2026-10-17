import { Color } from '../pieces/types';
import { IBoardQuery } from '../ports/IBoardQuery';

export function computePositionSignature(board: IBoardQuery, currentTurn: Color): string {
  const placements = [
    ...board.getPiecesByColor('WHITE'),
    ...board.getPiecesByColor('BLACK'),
  ];

  const piecesSummary = placements
    .map(
      (placement) =>
        `${placement.position.row},${placement.position.col}:${placement.piece.color}:${placement.piece.type}`
    )
    .sort()
    .join(';');

  const enPassant = board.getEnPassantTarget();
  const epSummary = enPassant ? `${enPassant.row},${enPassant.col}` : '-';

  return `${board.rows}x${board.cols}|${currentTurn}|${piecesSummary}|ep:${epSummary}`;
}
