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
    const legalMoves: Position[] = [];
    const forwardDelta = PAWN_FORWARD_DELTAS[piece.color];

    const singleStepPosition = from.offset(forwardDelta, 0);
    if (!board.isWithinBounds(singleStepPosition) || !board.isEmpty(singleStepPosition)) {
      return legalMoves;
    }

    legalMoves.push(singleStepPosition);

    const initialRowByColor: Record<Color, number> = {
      WHITE: 1,
      BLACK: board.rows - 2,
    };

    const isAtInitialRow = from.row === initialRowByColor[piece.color];
    if (isAtInitialRow) {
      const doubleStepPosition = from.offset(forwardDelta * 2, 0);
      if (board.isWithinBounds(doubleStepPosition) && board.isEmpty(doubleStepPosition)) {
        legalMoves.push(doubleStepPosition);
      }
    }

    return legalMoves;
  }
}
