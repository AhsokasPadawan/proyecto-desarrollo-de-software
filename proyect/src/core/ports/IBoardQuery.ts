import { Position } from '../board/Position';
import { Color } from '../pieces/types';
import { IPiece } from '../pieces/IPiece';

export interface PiecePlacement {
  readonly position: Position;
  readonly piece: IPiece;
}

export interface IBoardQuery {
  readonly rows: number;
  readonly cols: number;
  isWithinBounds(position: Position): boolean;
  getPieceAt(position: Position): IPiece | null;
  isEmpty(position: Position): boolean;
  findKingPosition(color: Color): Position | null;
  getPiecesByColor(color: Color): readonly PiecePlacement[];
  getEnPassantTarget(): Position | null;
}
