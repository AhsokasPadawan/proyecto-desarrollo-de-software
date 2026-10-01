import { IMovementRule } from '../rules/IMovementRule';
import { KNIGHT_OFFSETS, LeapMoveRule } from '../rules/LeapMoveRule';
import { Piece } from './Piece';
import { Color } from './types';

export class Knight extends Piece {
  constructor(
    color: Color,
    rules: readonly IMovementRule[] = [new LeapMoveRule(KNIGHT_OFFSETS)]
  ) {
    super(color, 'KNIGHT', rules);
  }
}
