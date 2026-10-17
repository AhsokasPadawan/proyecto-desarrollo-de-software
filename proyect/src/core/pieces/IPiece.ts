import { Position } from '../board/Position';
import { IBoardQuery } from '../ports/IBoardQuery';
import { Color, PieceType } from './types';

export interface IPiece {
  readonly color: Color;
  readonly type: PieceType;
  getPseudoLegalMoves(from: Position, board: IBoardQuery): Position[];
}
