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
import { createPiece } from '../pieces/pieceFactory';
import { GameSnapshot } from '../ports/GameSnapshot';

export type PieceConstructor = new (color: Color) => Piece;

export const BACK_RANK_PIECES: readonly PieceConstructor[] = [
  Rook,
  Knight,
  Bishop,
  Queen,
  King,
  Bishop,
  Knight,
  Rook,
];

export function createStandardBoard(): Board {
  const board = new Board(8, 8);
  populateStandardBoard(board);
  return board;
}

export function populateStandardBoard(
  board: Board,
  backRankPieces: readonly PieceConstructor[] = BACK_RANK_PIECES
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
    const MajorPiece = backRankPieces[col];
    board.placePiece(new Position(whiteMajorRow, col), new MajorPiece('WHITE'));
    board.placePiece(new Position(whitePawnRow, col), new Pawn('WHITE'));

    board.placePiece(new Position(blackPawnRow, col), new Pawn('BLACK'));
    board.placePiece(new Position(blackMajorRow, col), new MajorPiece('BLACK'));
  }
}

export function createBoardFromSnapshot(snapshot: GameSnapshot): Board {
  const board = new Board(snapshot.rows, snapshot.cols);
  for (let row = 0; row < snapshot.rows; row++) {
    for (let col = 0; col < snapshot.cols; col++) {
      const pieceSnapshot = snapshot.grid[row][col];
      if (pieceSnapshot) {
        board.placePiece(
          new Position(row, col),
          createPiece(pieceSnapshot.type, pieceSnapshot.color)
        );
      }
    }
  }
  return board;
}
