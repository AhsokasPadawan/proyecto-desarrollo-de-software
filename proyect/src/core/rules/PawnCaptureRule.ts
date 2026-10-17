import { Position } from '../board/Position';
import { IPiece } from '../pieces/IPiece';
import { IBoardQuery } from '../ports/IBoardQuery';
import { IMovementRule } from './IMovementRule';
import { PAWN_FORWARD_DELTAS } from './PawnForwardRule';

const CAPTURE_COLUMN_OFFSETS = [-1, 1] as const;

export class PawnCaptureRule implements IMovementRule {
  getPseudoLegalMoves(from: Position, piece: IPiece, board: IBoardQuery): Position[] {
    const forwardDelta = PAWN_FORWARD_DELTAS[piece.color];

    return CAPTURE_COLUMN_OFFSETS
      .map((deltaCol) => from.offset(forwardDelta, deltaCol))
      .filter((targetPosition) => {
        const pieceAtTarget = board.getPieceAt(targetPosition);
        return pieceAtTarget !== null && pieceAtTarget.color !== piece.color;
      });
  }
}
