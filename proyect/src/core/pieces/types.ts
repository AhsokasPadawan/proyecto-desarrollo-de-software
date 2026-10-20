export type Color = 'WHITE' | 'BLACK';

export const PIECE_TYPES = {
  PAWN: 'PAWN',
  ROOK: 'ROOK',
  KNIGHT: 'KNIGHT',
  BISHOP: 'BISHOP',
  QUEEN: 'QUEEN',
  KING: 'KING',
} as const;

export type PieceType = (typeof PIECE_TYPES)[keyof typeof PIECE_TYPES];

export const OPPOSITE_COLOR: Record<Color, Color> = {
  WHITE: 'BLACK',
  BLACK: 'WHITE',
};
