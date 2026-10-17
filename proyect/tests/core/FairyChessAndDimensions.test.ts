import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { Knight } from '../../src/core/pieces/Knight';
import { Pawn } from '../../src/core/pieces/Pawn';
import { Rook } from '../../src/core/pieces/Rook';

describe('Alternative Board Dimensions Extensibility', () => {
  it('allows rook to traverse entire rank up to boundary on 10x10 board', () => {
    const board = new Board(10, 10);
    const rook = new Rook('WHITE');
    const origin = new Position(0, 0);
    board.placePiece(origin, rook);

    const moves = rook.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(18);
    expect(moves.some((pos) => pos.equals(new Position(0, 9)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(9, 0)))).toBe(true);
  });

  it('allows knight to leap within 10x10 board boundaries', () => {
    const board = new Board(10, 10);
    const knight = new Knight('WHITE');
    const origin = new Position(8, 8);
    board.placePiece(origin, knight);

    const moves = knight.getPseudoLegalMoves(origin, board);

    expect(moves.some((pos) => pos.equals(new Position(9, 6)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(7, 6)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(6, 7)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(6, 9)))).toBe(true);
  });

  it('calculates initial double advance for black pawn from row 8 on 10x10 board', () => {
    const board = new Board(10, 10);
    const blackPawn = new Pawn('BLACK');
    const origin = new Position(8, 4);
    board.placePiece(origin, blackPawn);

    const moves = blackPawn.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(2);
    expect(moves.some((pos) => pos.equals(new Position(7, 4)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(6, 4)))).toBe(true);
  });

  it('calculates initial double advance for black pawn from row 4 on 6x6 board', () => {
    const board = new Board(6, 6);
    const blackPawn = new Pawn('BLACK');
    const origin = new Position(4, 2);
    board.placePiece(origin, blackPawn);

    const moves = blackPawn.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(2);
    expect(moves.some((pos) => pos.equals(new Position(3, 2)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(2, 2)))).toBe(true);
  });

  it('allows rook to traverse entire rank up to boundary on 6x6 board', () => {
    const board = new Board(6, 6);
    const rook = new Rook('WHITE');
    const origin = new Position(0, 0);
    board.placePiece(origin, rook);

    const moves = rook.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(10);
    expect(moves.some((pos) => pos.equals(new Position(0, 5)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(5, 0)))).toBe(true);
  });

  it('allows knight to leap within 6x6 board boundaries', () => {
    const board = new Board(6, 6);
    const knight = new Knight('WHITE');
    const origin = new Position(0, 0);
    board.placePiece(origin, knight);

    const moves = knight.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(2);
    expect(moves.some((pos) => pos.equals(new Position(1, 2)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(2, 1)))).toBe(true);
  });
});
