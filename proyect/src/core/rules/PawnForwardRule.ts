import { Position } from '../board/Position';
import { IPiece } from '../pieces/IPiece';
import { Color } from '../pieces/types';
import { IBoardQuery } from '../ports/IBoardQuery';
import { IMovementRule } from './IMovementRule';

export const PAWN_FORWARD_DELTAS: Record<Color, number> = {
  WHITE: 1,
  BLACK: -1,
};

export class PawnForwardRule implements IMovementRule {
  getPseudoLegalMoves(from: Position, piece: IPiece, board: IBoardQuery): Position[] {
    const forwardDelta = PAWN_FORWARD_DELTAS[piece.color];
    const singleStepMove = this.getSingleStepMove(from, forwardDelta, board);

    if (!singleStepMove) {
      return [];
    }

    const doubleStepMove = this.getDoubleStepMove(from, piece.color, forwardDelta, board);
    return doubleStepMove ? [singleStepMove, doubleStepMove] : [singleStepMove];
  }

  private getSingleStepMove(
    from: Position,
    forwardDelta: number,
    board: IBoardQuery
  ): Position | null {
    const singleStepPosition = from.offset(forwardDelta, 0);
    const isStepAvailable = board.isSquareEmpty(singleStepPosition);

    return isStepAvailable ? singleStepPosition : null;
  }

  private getDoubleStepMove(
    from: Position,
    color: Color,
    forwardDelta: number,
    board: IBoardQuery
  ): Position | null {
    const initialRowByColor: Record<Color, number> = {
      WHITE: 1,
      BLACK: board.rows - 2,
    };

    if (from.row !== initialRowByColor[color]) {
      return null;
    }

    const doubleStepPosition = from.offset(forwardDelta * 2, 0);
    const isStepAvailable = board.isSquareEmpty(doubleStepPosition);

    return isStepAvailable ? doubleStepPosition : null;
  }
}
