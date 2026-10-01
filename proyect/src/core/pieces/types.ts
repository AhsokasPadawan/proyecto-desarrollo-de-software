export type Color = 'WHITE' | 'BLACK';

export const PIECE_TYPES = {
  PAWN: 'PAWN',
  ROOK: 'ROOK',
  KNIGHT: 'KNIGHT',
  BISHOP: 'BISHOP',
  QUEEN: 'QUEEN',
  KING: 'KING',
} as const;

export type StandardPieceType = (typeof PIECE_TYPES)[keyof typeof PIECE_TYPES];

export type PieceType = StandardPieceType | (string & {});

export const OPPOSITE_COLOR: Record<Color, Color> = {
  WHITE: 'BLACK',
  BLACK: 'WHITE',
};
