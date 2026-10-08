import { Position } from '../board/Position';
import { Color, OPPOSITE_COLOR } from '../pieces/types';
import { IBoardQuery } from '../ports/IBoardQuery';

export class CheckDetector {
  isSquareAttacked(board: IBoardQuery, target: Position, byColor: Color): boolean {
    const attackingPlacements = board.getPiecesByColor(byColor);

    for (const placement of attackingPlacements) {
      if (placement.piece.type === 'KING') {
        const rowDiff = Math.abs(placement.position.row - target.row);
        const colDiff = Math.abs(placement.position.col - target.col);
        if (rowDiff <= 1 && colDiff <= 1 && (rowDiff > 0 || colDiff > 0)) {
          return true;
        }
        continue;
      }

      const pseudoLegalMoves = placement.piece.getPseudoLegalMoves(placement.position, board);
      const reachesTarget = pseudoLegalMoves.some((move) => move.equals(target));

      if (reachesTarget) {
        return true;
      }
    }

    return false;
  }

  isKingInCheck(board: IBoardQuery, kingColor: Color): boolean {
    const kingPosition = board.findKingPosition(kingColor);
    if (!kingPosition) {
      return false;
    }

    const attackingColor = OPPOSITE_COLOR[kingColor];
    return this.isSquareAttacked(board, kingPosition, attackingColor);
  }
}
