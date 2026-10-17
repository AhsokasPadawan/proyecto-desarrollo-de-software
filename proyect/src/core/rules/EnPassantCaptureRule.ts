import { Position } from '../board/Position';
import { IPiece } from '../pieces/IPiece';
import { IBoardQuery } from '../ports/IBoardQuery';
import { IMovementRule } from './IMovementRule';
import { PAWN_FORWARD_DELTAS } from './PawnForwardRule';

export class EnPassantCaptureRule implements IMovementRule {
  getPseudoLegalMoves(from: Position, piece: IPiece, board: IBoardQuery): Position[] {
    const target = board.getEnPassantTarget();
    if (!target) {
      return [];
    }

    const forwardDelta = PAWN_FORWARD_DELTAS[piece.color];
    const isAdjacentTargetRow = from.row + forwardDelta === target.row;
    const isAdjacentCol = Math.abs(from.col - target.col) === 1;

    return isAdjacentTargetRow && isAdjacentCol ? [target] : [];
  }
}
