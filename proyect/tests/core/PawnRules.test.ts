import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { Pawn } from '../../src/core/pieces/Pawn';
import { Rook } from '../../src/core/pieces/Rook';

describe('Pawn Rules & Pawn Piece', () => {
  it('allows white pawn to move one step forward when target square is empty', () => {
    const board = new Board(8, 8);
    const pawn = new Pawn('WHITE');
    const origin = new Position(2, 3);
    board.placePiece(origin, pawn);

    const moves = pawn.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(1);
    expect(moves[0].equals(new Position(3, 3))).toBe(true);
  });

  it('allows white pawn to move two steps forward from initial rank when path is clear', () => {
    const board = new Board(8, 8);
    const pawn = new Pawn('WHITE');
    const origin = new Position(1, 3);
    board.placePiece(origin, pawn);

    const moves = pawn.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(2);
    expect(moves.some((pos) => pos.equals(new Position(2, 3)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(3, 3)))).toBe(true);
  });

  it('blocks white pawn forward advance when adjacent square is occupied', () => {
    const board = new Board(8, 8);
    const pawn = new Pawn('WHITE');
    const obstacle = new Rook('BLACK');
    const origin = new Position(1, 3);
    board.placePiece(origin, pawn);
    board.placePiece(new Position(2, 3), obstacle);

    const moves = pawn.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(0);
  });

  it('blocks white pawn double step when second square is occupied', () => {
    const board = new Board(8, 8);
    const pawn = new Pawn('WHITE');
    const obstacle = new Rook('WHITE');
    const origin = new Position(1, 3);
    board.placePiece(origin, pawn);
    board.placePiece(new Position(3, 3), obstacle);

    const moves = pawn.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(1);
    expect(moves[0].equals(new Position(2, 3))).toBe(true);
  });

  it('enables diagonal capture for white pawn when rival piece occupies diagonal square', () => {
    const board = new Board(8, 8);
    const whitePawn = new Pawn('WHITE');
    const blackTarget = new Rook('BLACK');
    const origin = new Position(3, 3);
    board.placePiece(origin, whitePawn);
    board.placePiece(new Position(4, 4), blackTarget);

    const moves = whitePawn.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(2);
    expect(moves.some((pos) => pos.equals(new Position(4, 3)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(4, 4)))).toBe(true);
  });

  it('rejects white pawn diagonal move when diagonal square contains friendly piece', () => {
    const board = new Board(8, 8);
    const whitePawn = new Pawn('WHITE');
    const friendlyTarget = new Rook('WHITE');
    const origin = new Position(3, 3);
    board.placePiece(origin, whitePawn);
    board.placePiece(new Position(4, 4), friendlyTarget);

    const moves = whitePawn.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(1);
    expect(moves[0].equals(new Position(4, 3))).toBe(true);
  });

  it('rejects white pawn diagonal move when diagonal square is empty', () => {
    const board = new Board(8, 8);
    const whitePawn = new Pawn('WHITE');
    const origin = new Position(3, 3);
    board.placePiece(origin, whitePawn);

    const moves = whitePawn.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(1);
    expect(moves.some((pos) => pos.equals(new Position(4, 4)))).toBe(false);
    expect(moves.some((pos) => pos.equals(new Position(4, 2)))).toBe(false);
  });

  it('allows black pawn to advance one square forward outside starting rank when target is empty', () => {
    const board = new Board(8, 8);
    const pawn = new Pawn('BLACK');
    const origin = new Position(5, 4);
    board.placePiece(origin, pawn);

    const moves = pawn.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(1);
    expect(moves[0].equals(new Position(4, 4))).toBe(true);
  });

  it('allows black pawn to make initial two-square advance from starting rank', () => {
    const board = new Board(8, 8);
    const pawn = new Pawn('BLACK');
    const origin = new Position(6, 4);
    board.placePiece(origin, pawn);

    const moves = pawn.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(2);
    expect(moves.some((pos) => pos.equals(new Position(5, 4)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(4, 4)))).toBe(true);
  });

  it('blocks black pawn advance when adjacent square is occupied', () => {
    const board = new Board(8, 8);
    const pawn = new Pawn('BLACK');
    const obstacle = new Rook('WHITE');
    const origin = new Position(6, 4);
    board.placePiece(origin, pawn);
    board.placePiece(new Position(5, 4), obstacle);

    const moves = pawn.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(0);
  });

  it('blocks black pawn double step when second square is occupied', () => {
    const board = new Board(8, 8);
    const pawn = new Pawn('BLACK');
    const obstacle = new Rook('BLACK');
    const origin = new Position(6, 4);
    board.placePiece(origin, pawn);
    board.placePiece(new Position(4, 4), obstacle);

    const moves = pawn.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(1);
    expect(moves[0].equals(new Position(5, 4))).toBe(true);
  });

  it('enables diagonal capture for black pawn when rival piece occupies diagonal square', () => {
    const board = new Board(8, 8);
    const blackPawn = new Pawn('BLACK');
    const whiteTarget = new Rook('WHITE');
    const origin = new Position(4, 4);
    board.placePiece(origin, blackPawn);
    board.placePiece(new Position(3, 3), whiteTarget);

    const moves = blackPawn.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(2);
    expect(moves.some((pos) => pos.equals(new Position(3, 4)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(3, 3)))).toBe(true);
  });

  it('rejects black pawn diagonal move when diagonal square contains friendly piece', () => {
    const board = new Board(8, 8);
    const blackPawn = new Pawn('BLACK');
    const friendlyTarget = new Rook('BLACK');
    const origin = new Position(4, 4);
    board.placePiece(origin, blackPawn);
    board.placePiece(new Position(3, 3), friendlyTarget);

    const moves = blackPawn.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(1);
    expect(moves[0].equals(new Position(3, 4))).toBe(true);
  });

  it('rejects black pawn diagonal move when diagonal square is empty', () => {
    const board = new Board(8, 8);
    const blackPawn = new Pawn('BLACK');
    const origin = new Position(4, 4);
    board.placePiece(origin, blackPawn);

    const moves = blackPawn.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(1);
    expect(moves.some((pos) => pos.equals(new Position(3, 3)))).toBe(false);
    expect(moves.some((pos) => pos.equals(new Position(3, 5)))).toBe(false);
  });
});
