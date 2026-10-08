import { Board } from './Board';
import { Position } from './Position';
import { Color } from '../pieces/types';
import { Piece } from '../pieces/Piece';
import { Pawn } from '../pieces/Pawn';
import { Rook } from '../pieces/Rook';
import { Knight } from '../pieces/Knight';
import { Bishop } from '../pieces/Bishop';
import { Queen } from '../pieces/Queen';
import { King } from '../pieces/King';

export type PieceConstructor = new (color: Color) => Piece;

export const BACK_RANK_FACTORIES: readonly PieceConstructor[] = [
  Rook,
  Knight,
  Bishop,
  Queen,
  King,
  Bishop,
  Knight,
  Rook,
];

export class BoardSetupFactory {
  static createStandardBoard(
    rows: number = 8,
    cols: number = 8,
    backRankPieces: readonly PieceConstructor[] = BACK_RANK_FACTORIES
  ): Board {
    const board = new Board(rows, cols);
    this.populateStandardBoard(board, backRankPieces);
    return board;
  }

  static populateStandardBoard(
    board: Board,
    backRankPieces: readonly PieceConstructor[] = BACK_RANK_FACTORIES
  ): void {
    if (board.rows < 4) {
      throw new Error(
        `Board setup requires at least 4 rows to place major ranks and pawns, received ${board.rows}`
      );
    }

    if (board.cols !== backRankPieces.length) {
      throw new Error(
        `Board columns (${board.cols}) must match back rank piece count (${backRankPieces.length})`
      );
    }

    const whiteMajorRow = 0;
    const whitePawnRow = 1;
    const blackPawnRow = board.rows - 2;
    const blackMajorRow = board.rows - 1;

    for (let col = 0; col < board.cols; col++) {
      const WhiteMajorPiece = backRankPieces[col];
      board.placePiece(new Position(whiteMajorRow, col), new WhiteMajorPiece('WHITE'));
      board.placePiece(new Position(whitePawnRow, col), new Pawn('WHITE'));

      board.placePiece(new Position(blackPawnRow, col), new Pawn('BLACK'));
      const BlackMajorPiece = backRankPieces[col];
      board.placePiece(new Position(blackMajorRow, col), new BlackMajorPiece('BLACK'));
    }
  }
}
