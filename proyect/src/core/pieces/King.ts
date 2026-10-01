import { CastlingMoveRule } from '../rules/CastlingMoveRule';
import { IMovementRule } from '../rules/IMovementRule';
import { KING_OFFSETS, LeapMoveRule } from '../rules/LeapMoveRule';
import { Piece } from './Piece';
import { Color } from './types';

export class King extends Piece {
  constructor(
    color: Color,
    rules: readonly IMovementRule[] = [
      new LeapMoveRule(KING_OFFSETS),
      new CastlingMoveRule(),
    ]
  ) {
    super(color, 'KING', rules);
  }
}
