import { Position } from '../board/Position';
import { IPiece } from '../pieces/IPiece';
import { IBoardQuery } from '../ports/IBoardQuery';
import { IMovementRule } from './IMovementRule';

export class EnPassantCaptureRule implements IMovementRule {
  getPseudoLegalMoves(from: Position, piece: IPiece, board: IBoardQuery): Position[] {
    const target = board.getEnPassantTarget();
    if (!target) {
      return [];
    }

    const forwardDelta = piece.color === 'WHITE' ? 1 : -1;
    const isAdjacentTargetRow = from.row + forwardDelta === target.row;
    const isAdjacentCol = Math.abs(from.col - target.col) === 1;

    if (isAdjacentTargetRow && isAdjacentCol) {
      return [target];
    }

    return [];
  }
}
