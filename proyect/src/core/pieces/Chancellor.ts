import { IMovementRule } from '../rules/IMovementRule';
import { KNIGHT_OFFSETS, LeapMoveRule } from '../rules/LeapMoveRule';
import { ORTHOGONAL_DIRECTIONS, SlidingMoveRule } from '../rules/SlidingMoveRule';
import { Piece } from './Piece';
import { Color } from './types';

export class Chancellor extends Piece {
  constructor(
    color: Color,
    rules: readonly IMovementRule[] = [
      new SlidingMoveRule(ORTHOGONAL_DIRECTIONS),
      new LeapMoveRule(KNIGHT_OFFSETS),
    ]
  ) {
    super(color, 'CHANCELLOR', rules);
  }
}
