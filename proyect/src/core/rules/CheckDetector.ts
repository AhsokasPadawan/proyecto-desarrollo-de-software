import { Position } from '../board/Position';
import { Color, OPPOSITE_COLOR } from '../pieces/types';
import { IBoardQuery, PiecePlacement } from '../ports/IBoardQuery';
import { PAWN_FORWARD_DELTAS } from './PawnForwardRule';

export class CheckDetector {
  isSquareAttacked(board: IBoardQuery, target: Position, byColor: Color): boolean {
    const attackingPlacements = board.getPiecesByColor(byColor);
    return attackingPlacements.some((placement) =>
      this.doesPieceAttackSquare(placement, target, board)
    );
  }

  isKingInCheck(board: IBoardQuery, kingColor: Color): boolean {
    const kingPosition = board.findKingPosition(kingColor);
    if (!kingPosition) {
      return false;
    }

    const attackingColor = OPPOSITE_COLOR[kingColor];
    return this.isSquareAttacked(board, kingPosition, attackingColor);
  }

  private doesPieceAttackSquare(
    placement: PiecePlacement,
    target: Position,
    board: IBoardQuery
  ): boolean {
    if (placement.piece.type === 'KING') {
      return this.doesKingAttackSquare(placement.position, target);
    }

    if (placement.piece.type === 'PAWN') {
      return this.doesPawnAttackSquare(placement.position, placement.piece.color, target);
    }

    return placement.piece
      .getPseudoLegalMoves(placement.position, board)
      .some((move) => move.equals(target));
  }

  private doesKingAttackSquare(kingPosition: Position, target: Position): boolean {
    const rowDiff = Math.abs(kingPosition.row - target.row);
    const colDiff = Math.abs(kingPosition.col - target.col);
    return rowDiff <= 1 && colDiff <= 1 && (rowDiff > 0 || colDiff > 0);
  }

  private doesPawnAttackSquare(
    pawnPosition: Position,
    pawnColor: Color,
    target: Position
  ): boolean {
    const forwardDelta = PAWN_FORWARD_DELTAS[pawnColor];
    return (
      pawnPosition.row + forwardDelta === target.row &&
      Math.abs(pawnPosition.col - target.col) === 1
    );
  }
}
