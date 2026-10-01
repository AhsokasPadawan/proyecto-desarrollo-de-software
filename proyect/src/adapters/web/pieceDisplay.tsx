import type { ReactNode } from 'react';
import { Color } from '../../core/pieces/types';
import { PieceSnapshot } from '../../core/ports/GameSnapshot';

export const STANDARD_PIECE_SYMBOLS: Record<Color, Record<string, string>> = {
  WHITE: {
    KING: '♔',
    QUEEN: '♕',
    ROOK: '♖',
    BISHOP: '♗',
    KNIGHT: '♘',
    PAWN: '♙',
  },
  BLACK: {
    KING: '♚',
    QUEEN: '♛',
    ROOK: '♜',
    BISHOP: '♝',
    KNIGHT: '♞',
    PAWN: '♟',
  },
};

export const COLOR_TEXT_CLASSES: Record<Color, string> = {
  WHITE: 'text-amber-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] filter',
  BLACK: 'text-zinc-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)] filter',
};

export const FALLBACK_BADGE_CLASSES: Record<Color, string> = {
  WHITE: 'bg-amber-100 text-amber-950 border border-amber-300 shadow font-extrabold',
  BLACK: 'bg-zinc-900 text-zinc-100 border border-zinc-600 shadow font-extrabold',
};

export function renderPieceContent(piece: PieceSnapshot): ReactNode {
  const symbol = STANDARD_PIECE_SYMBOLS[piece.color]?.[piece.type];

  if (symbol) {
    return (
      <span
        className={`text-4xl md:text-5xl select-none leading-none font-serif ${COLOR_TEXT_CLASSES[piece.color]}`}
        aria-label={`${piece.color} ${piece.type}`}
        data-testid={`piece-${piece.color.toLowerCase()}-${piece.type.toLowerCase()}`}
      >
        {symbol}
      </span>
    );
  }

  const initials = piece.type.slice(0, 2).toUpperCase();
  return (
    <span
      className={`px-1.5 py-0.5 text-xs uppercase rounded tracking-wider select-none ${FALLBACK_BADGE_CLASSES[piece.color]}`}
      aria-label={`${piece.color} ${piece.type}`}
      data-testid={`piece-fallback-${piece.color.toLowerCase()}-${piece.type.toLowerCase()}`}
      title={`${piece.color} ${piece.type}`}
    >
      {initials}
    </span>
  );
}
