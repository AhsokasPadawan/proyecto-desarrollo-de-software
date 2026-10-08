import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { Bishop } from '../../src/core/pieces/Bishop';
import { Pawn } from '../../src/core/pieces/Pawn';
import { Queen } from '../../src/core/pieces/Queen';
import { Rook } from '../../src/core/pieces/Rook';

describe('SlidingMoveRule & Sliding Pieces (Rook, Bishop, Queen)', () => {
  it('calculates full orthogonal rays for a rook on an empty board', () => {
    const board = new Board(8, 8);
    const rook = new Rook('WHITE');
    const origin = new Position(3, 3);
    board.placePiece(origin, rook);

    const moves = rook.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(14);
    expect(moves.some((pos) => pos.equals(new Position(3, 0)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(3, 7)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(0, 3)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(7, 3)))).toBe(true);
  });

  it('stops rook ray before friendly piece without including its square', () => {
    const board = new Board(8, 8);
    const rook = new Rook('WHITE');
    const friendlyBlocker = new Pawn('WHITE');
    const origin = new Position(3, 3);
    board.placePiece(origin, rook);
    board.placePiece(new Position(5, 3), friendlyBlocker);

    const moves = rook.getPseudoLegalMoves(origin, board);

    expect(moves.some((pos) => pos.equals(new Position(4, 3)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(5, 3)))).toBe(false);
    expect(moves.some((pos) => pos.equals(new Position(6, 3)))).toBe(false);
  });

  it('includes rival piece square as capture and stops ray', () => {
    const board = new Board(8, 8);
    const rook = new Rook('WHITE');
    const enemyPiece = new Pawn('BLACK');
    const origin = new Position(3, 3);
    board.placePiece(origin, rook);
    board.placePiece(new Position(5, 3), enemyPiece);

    const moves = rook.getPseudoLegalMoves(origin, board);

    expect(moves.some((pos) => pos.equals(new Position(4, 3)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(5, 3)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(6, 3)))).toBe(false);
  });

  it('calculates 4 diagonal rays for a bishop from the center of an empty board', () => {
    const board = new Board(8, 8);
    const bishop = new Bishop('WHITE');
    const origin = new Position(3, 3);
    board.placePiece(origin, bishop);

    const moves = bishop.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(13);
    expect(moves.some((pos) => pos.equals(new Position(0, 0)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(6, 6)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(0, 6)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(6, 0)))).toBe(true);
  });

  it('stops bishop ray when blocked by friendly piece diagonally', () => {
    const board = new Board(8, 8);
    const bishop = new Bishop('WHITE');
    const friendlyPawn = new Pawn('WHITE');
    const origin = new Position(2, 2);
    board.placePiece(origin, bishop);
    board.placePiece(new Position(4, 4), friendlyPawn);

    const moves = bishop.getPseudoLegalMoves(origin, board);

    expect(moves.some((pos) => pos.equals(new Position(3, 3)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(4, 4)))).toBe(false);
    expect(moves.some((pos) => pos.equals(new Position(5, 5)))).toBe(false);
  });

  it('captures rival piece on bishop diagonal ray', () => {
    const board = new Board(8, 8);
    const bishop = new Bishop('WHITE');
    const blackPawn = new Pawn('BLACK');
    const origin = new Position(2, 2);
    board.placePiece(origin, bishop);
    board.placePiece(new Position(4, 4), blackPawn);

    const moves = bishop.getPseudoLegalMoves(origin, board);

    expect(moves.some((pos) => pos.equals(new Position(3, 3)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(4, 4)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(5, 5)))).toBe(false);
  });

  it('combines orthogonal and diagonal rays for queen on an empty board', () => {
    const board = new Board(8, 8);
    const queen = new Queen('WHITE');
    const origin = new Position(3, 3);
    board.placePiece(origin, queen);

    const moves = queen.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(27);
  });

  it('stops queen rays at board edges when positioned in the corner', () => {
    const board = new Board(8, 8);
    const queen = new Queen('BLACK');
    const origin = new Position(0, 0);
    board.placePiece(origin, queen);

    const moves = queen.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(21);
    expect(moves.some((pos) => pos.equals(new Position(7, 0)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(0, 7)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(7, 7)))).toBe(true);
  });
});
