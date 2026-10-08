import { IMovementRule } from '../rules/IMovementRule';
import { DIAGONAL_DIRECTIONS, SlidingMoveRule } from '../rules/SlidingMoveRule';
import { Piece } from './Piece';
import { Color } from './types';

export class Bishop extends Piece {
  constructor(
    color: Color,
    rules: readonly IMovementRule[] = [new SlidingMoveRule(DIAGONAL_DIRECTIONS)]
  ) {
    super(color, 'BISHOP', rules);
  }
}
