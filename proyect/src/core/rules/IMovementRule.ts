import { Position } from '../board/Position';
import { IPiece } from '../pieces/IPiece';
import { IBoardQuery } from '../ports/IBoardQuery';

export interface IMovementRule {
  getPseudoLegalMoves(from: Position, piece: IPiece, board: IBoardQuery): Position[];
}
