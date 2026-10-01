import { EnPassantCaptureRule } from '../rules/EnPassantCaptureRule';
import { IMovementRule } from '../rules/IMovementRule';
import { PawnCaptureRule } from '../rules/PawnCaptureRule';
import { PawnForwardRule } from '../rules/PawnForwardRule';
import { Piece } from './Piece';
import { Color } from './types';

export class Pawn extends Piece {
  constructor(
    color: Color,
    rules: readonly IMovementRule[] = [
      new PawnForwardRule(),
      new PawnCaptureRule(),
      new EnPassantCaptureRule(),
    ]
  ) {
    super(color, 'PAWN', rules);
  }
}
