import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { Chancellor } from '../../src/core/pieces/Chancellor';
import { King } from '../../src/core/pieces/King';
import { Knight } from '../../src/core/pieces/Knight';
import { Pawn } from '../../src/core/pieces/Pawn';
import { Rook } from '../../src/core/pieces/Rook';
import { CheckDetector } from '../../src/core/rules/CheckDetector';

describe('Fairy Chess and Alternative Dimensions Extensibility', () => {
  it('calculates combined orthogonal slides and knight leaps for chancellor piece', () => {
    const board = new Board(8, 8);
    const chancellor = new Chancellor('WHITE');
    const origin = new Position(3, 3);
    board.placePiece(origin, chancellor);

    const moves = chancellor.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(22);
    expect(moves.some((pos) => pos.equals(new Position(3, 7)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(7, 3)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(5, 4)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(1, 2)))).toBe(true);
  });

  it('blocks chancellor orthogonal slide when friendly obstacle is in path', () => {
    const board = new Board(8, 8);
    const chancellor = new Chancellor('WHITE');
    const blocker = new Pawn('WHITE');
    const origin = new Position(3, 3);
    board.placePiece(origin, chancellor);
    board.placePiece(new Position(3, 4), blocker);

    const moves = chancellor.getPseudoLegalMoves(origin, board);

    expect(moves.some((pos) => pos.equals(new Position(3, 4)))).toBe(false);
    expect(moves.some((pos) => pos.equals(new Position(3, 5)))).toBe(false);
  });

  it('allows chancellor to leap over obstacles using knight movement rules', () => {
    const board = new Board(8, 8);
    const chancellor = new Chancellor('WHITE');
    const blocker = new Pawn('WHITE');
    const origin = new Position(3, 3);
    board.placePiece(origin, chancellor);
    board.placePiece(new Position(3, 4), blocker);

    const moves = chancellor.getPseudoLegalMoves(origin, board);

    expect(moves.some((pos) => pos.equals(new Position(5, 4)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(1, 4)))).toBe(true);
  });

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

  it('detects check on king caused by fairy chancellor piece on 10x10 board', () => {
    const detector = new CheckDetector();
    const board = new Board(10, 10);
    const whiteKing = new King('WHITE');
    const blackChancellor = new Chancellor('BLACK');
    const kingPosition = new Position(0, 5);
    board.placePiece(kingPosition, whiteKing);
    board.placePiece(new Position(2, 4), blackChancellor);

    const inCheck = detector.isKingInCheck(board, 'WHITE');

    expect(inCheck).toBe(true);
  });
});
