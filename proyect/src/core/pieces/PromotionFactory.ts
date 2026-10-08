import { Bishop } from './Bishop';
import { IPiece } from './IPiece';
import { Knight } from './Knight';
import { Queen } from './Queen';
import { Rook } from './Rook';
import { Color, PieceType } from './types';

export type PieceFactoryFn = (color: Color) => IPiece;

export const PROMOTION_FACTORIES: Record<string, PieceFactoryFn> = {
  QUEEN: (color) => new Queen(color),
  ROOK: (color) => new Rook(color),
  BISHOP: (color) => new Bishop(color),
  KNIGHT: (color) => new Knight(color),
};

export class PromotionFactory {
  static createPromotedPiece(type: PieceType | undefined, color: Color): IPiece {
    const factory = (type && PROMOTION_FACTORIES[type]) || PROMOTION_FACTORIES.QUEEN;
    return factory(color);
  }
}
