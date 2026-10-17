import { Bishop } from './Bishop';
import { IPiece } from './IPiece';
import { King } from './King';
import { Knight } from './Knight';
import { Pawn } from './Pawn';
import { Queen } from './Queen';
import { Rook } from './Rook';
import { Color, PieceType } from './types';

export type PieceConstructor = new (color: Color) => IPiece;

export const PIECE_CONSTRUCTORS: Record<PieceType, PieceConstructor> = {
  KING: King,
  QUEEN: Queen,
  ROOK: Rook,
  BISHOP: Bishop,
  KNIGHT: Knight,
  PAWN: Pawn,
};

export function createPiece(type: PieceType, color: Color): IPiece {
  const Constructor = PIECE_CONSTRUCTORS[type];
  return new Constructor(color);
}
