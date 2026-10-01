import { Position } from '../board/Position';
import { IBoardQuery } from '../ports/IBoardQuery';
import { Color, PieceType } from './types';

export interface IPiece {
  readonly color: Color;
  readonly type: PieceType;
  readonly hasMoved?: boolean;
  getPseudoLegalMoves(from: Position, board: IBoardQuery): Position[];
  setHasMoved?(value: boolean): void;
}
