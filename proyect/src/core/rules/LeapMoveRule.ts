import { Position } from '../board/Position';
import { IPiece } from '../pieces/IPiece';
import { IBoardQuery } from '../ports/IBoardQuery';
import { IMovementRule } from './IMovementRule';
import { DIAGONAL_DIRECTIONS, ORTHOGONAL_DIRECTIONS } from './SlidingMoveRule';

export type OffsetVector = readonly [number, number];

export const KNIGHT_OFFSETS: readonly OffsetVector[] = [
  [2, 1],
  [2, -1],
  [-2, 1],
  [-2, -1],
  [1, 2],
  [1, -2],
  [-1, 2],
  [-1, -2],
];

export const KING_OFFSETS: readonly OffsetVector[] = [
  ...ORTHOGONAL_DIRECTIONS,
  ...DIAGONAL_DIRECTIONS,
];

export class LeapMoveRule implements IMovementRule {
  private readonly offsets: readonly OffsetVector[];

  constructor(offsets: readonly OffsetVector[]) {
    this.offsets = offsets;
  }

  getPseudoLegalMoves(from: Position, piece: IPiece, board: IBoardQuery): Position[] {
    const legalMoves: Position[] = [];

    for (const [deltaRow, deltaCol] of this.offsets) {
      const targetPosition = from.offset(deltaRow, deltaCol);

      if (!board.isWithinBounds(targetPosition)) {
        continue;
      }

      const pieceAtTarget = board.getPieceAt(targetPosition);
      if (!pieceAtTarget || pieceAtTarget.color !== piece.color) {
        legalMoves.push(targetPosition);
      }
    }

    return legalMoves;
  }
}
