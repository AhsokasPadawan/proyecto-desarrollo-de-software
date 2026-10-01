import { Position } from '../board/Position';
import { IPiece } from '../pieces/IPiece';
import { IBoardQuery } from '../ports/IBoardQuery';
import { IMovementRule } from './IMovementRule';
import { PAWN_FORWARD_DELTAS } from './PawnForwardRule';

export class PawnCaptureRule implements IMovementRule {
  getPseudoLegalMoves(from: Position, piece: IPiece, board: IBoardQuery): Position[] {
    const captureMoves: Position[] = [];
    const forwardDelta = PAWN_FORWARD_DELTAS[piece.color];

    const diagonalOffsets: readonly [number, number][] = [
      [forwardDelta, -1],
      [forwardDelta, 1],
    ];

    for (const [deltaRow, deltaCol] of diagonalOffsets) {
      const targetPosition = from.offset(deltaRow, deltaCol);

      if (!board.isWithinBounds(targetPosition)) {
        continue;
      }

      const pieceAtTarget = board.getPieceAt(targetPosition);
      if (pieceAtTarget && pieceAtTarget.color !== piece.color) {
        captureMoves.push(targetPosition);
      }
    }

    return captureMoves;
  }
}
