import { IMovementRule } from '../rules/IMovementRule';
import {
  DIAGONAL_DIRECTIONS,
  ORTHOGONAL_DIRECTIONS,
  SlidingMoveRule,
} from '../rules/SlidingMoveRule';
import { Piece } from './Piece';
import { Color } from './types';

export class Queen extends Piece {
  constructor(
    color: Color,
    rules: readonly IMovementRule[] = [
      new SlidingMoveRule(ORTHOGONAL_DIRECTIONS),
      new SlidingMoveRule(DIAGONAL_DIRECTIONS),
    ]
  ) {
    super(color, 'QUEEN', rules);
  }
}
