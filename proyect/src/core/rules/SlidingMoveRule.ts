import { Position } from '../board/Position';
import { IPiece } from '../pieces/IPiece';
import { IBoardQuery } from '../ports/IBoardQuery';
import { IMovementRule } from './IMovementRule';

export type DirectionVector = readonly [number, number];

export const ORTHOGONAL_DIRECTIONS: readonly DirectionVector[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export const DIAGONAL_DIRECTIONS: readonly DirectionVector[] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

export class SlidingMoveRule implements IMovementRule {
  private readonly directions: readonly DirectionVector[];

  constructor(directions: readonly DirectionVector[]) {
    this.directions = directions;
  }

  getPseudoLegalMoves(from: Position, piece: IPiece, board: IBoardQuery): Position[] {
    const legalMoves: Position[] = [];

    for (const [deltaRow, deltaCol] of this.directions) {
      let currentPosition = from.offset(deltaRow, deltaCol);
      let isRayUnblocked = true;

      while (board.isWithinBounds(currentPosition) && isRayUnblocked) {
        const pieceAtTarget = board.getPieceAt(currentPosition);

        if (pieceAtTarget?.color !== piece.color) {
          legalMoves.push(currentPosition);
        }

        isRayUnblocked = pieceAtTarget === null;
        currentPosition = currentPosition.offset(deltaRow, deltaCol);
      }
    }

    return legalMoves;
  }
}
