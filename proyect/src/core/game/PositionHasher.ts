import { Board } from '../board/Board';
import { Color } from '../pieces/types';

export class PositionHasher {
  static computeSignature(board: Board, currentTurn: Color): string {
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
}
