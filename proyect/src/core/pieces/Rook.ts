import { IMovementRule } from '../rules/IMovementRule';
import { ORTHOGONAL_DIRECTIONS, SlidingMoveRule } from '../rules/SlidingMoveRule';
import { Piece } from './Piece';
import { Color } from './types';

export class Rook extends Piece {
  constructor(
    color: Color,
    rules: readonly IMovementRule[] = [new SlidingMoveRule(ORTHOGONAL_DIRECTIONS)]
  ) {
    super(color, 'ROOK', rules);
  }
}
