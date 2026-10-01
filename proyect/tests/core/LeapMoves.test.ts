import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { King } from '../../src/core/pieces/King';
import { Knight } from '../../src/core/pieces/Knight';
import { Pawn } from '../../src/core/pieces/Pawn';

describe('LeapMoveRule & Leaping Pieces (Knight, King)', () => {
  it('calculates 8 L-shaped moves for a knight in the center of an empty board', () => {
    const board = new Board(8, 8);
    const knight = new Knight('WHITE');
    const origin = new Position(3, 3);
    board.placePiece(origin, knight);

    const moves = knight.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(8);
    expect(moves.some((pos) => pos.equals(new Position(5, 4)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(5, 2)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(1, 4)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(1, 2)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(4, 5)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(4, 1)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(2, 5)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(2, 1)))).toBe(true);
  });

  it('restricts knight moves to only valid destinations when placed in the corner', () => {
    const board = new Board(8, 8);
    const knight = new Knight('WHITE');
    const corner = new Position(0, 0);
    board.placePiece(corner, knight);

    const moves = knight.getPseudoLegalMoves(corner, board);

    expect(moves).toHaveLength(2);
    expect(moves.some((pos) => pos.equals(new Position(1, 2)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(2, 1)))).toBe(true);
  });

  it('allows knight to jump cleanly over intervening friendly and enemy pieces', () => {
    const board = new Board(8, 8);
    const knight = new Knight('WHITE');
    const origin = new Position(0, 1);
    board.placePiece(origin, knight);
    board.placePiece(new Position(0, 0), new Pawn('WHITE'));
    board.placePiece(new Position(0, 2), new Pawn('WHITE'));
    board.placePiece(new Position(1, 0), new Pawn('WHITE'));
    board.placePiece(new Position(1, 1), new Pawn('WHITE'));
    board.placePiece(new Position(1, 2), new Pawn('BLACK'));

    const moves = knight.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(3);
    expect(moves.some((pos) => pos.equals(new Position(2, 0)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(2, 2)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(1, 3)))).toBe(true);
  });

  it('allows knight to capture rival piece on destination square', () => {
    const board = new Board(8, 8);
    const knight = new Knight('WHITE');
    const enemyTarget = new Pawn('BLACK');
    const origin = new Position(3, 3);
    const destination = new Position(5, 4);
    board.placePiece(origin, knight);
    board.placePiece(destination, enemyTarget);

    const moves = knight.getPseudoLegalMoves(origin, board);

    expect(moves.some((pos) => pos.equals(destination))).toBe(true);
  });

  it('rejects knight move when destination square contains friendly piece', () => {
    const board = new Board(8, 8);
    const knight = new Knight('WHITE');
    const friendlyTarget = new Pawn('WHITE');
    const origin = new Position(3, 3);
    const blockedSquare = new Position(5, 2);
    board.placePiece(origin, knight);
    board.placePiece(blockedSquare, friendlyTarget);

    const moves = knight.getPseudoLegalMoves(origin, board);

    expect(moves.some((pos) => pos.equals(blockedSquare))).toBe(false);
  });

  it('returns empty move list when knight is completely surrounded by friendly pieces on destination squares', () => {
    const board = new Board(8, 8);
    const knight = new Knight('WHITE');
    const origin = new Position(3, 3);
    board.placePiece(origin, knight);
    const leapTargets = [
      new Position(5, 4),
      new Position(5, 2),
      new Position(1, 4),
      new Position(1, 2),
      new Position(4, 5),
      new Position(4, 1),
      new Position(2, 5),
      new Position(2, 1),
    ];
    for (const target of leapTargets) {
      board.placePiece(target, new Pawn('WHITE'));
    }

    const moves = knight.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(0);
  });

  it('calculates 8 adjacent single-step moves for king in the center', () => {
    const board = new Board(8, 8);
    const king = new King('WHITE');
    const origin = new Position(3, 3);
    board.placePiece(origin, king);

    const moves = king.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(8);
  });

  it('restricts king moves to 3 adjacent squares when placed in the corner', () => {
    const board = new Board(8, 8);
    const king = new King('WHITE');
    const corner = new Position(0, 0);
    board.placePiece(corner, king);

    const moves = king.getPseudoLegalMoves(corner, board);

    expect(moves).toHaveLength(3);
    expect(moves.some((pos) => pos.equals(new Position(0, 1)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(1, 0)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(1, 1)))).toBe(true);
  });

  it('allows king to capture adjacent rival piece', () => {
    const board = new Board(8, 8);
    const king = new King('WHITE');
    const enemyPawn = new Pawn('BLACK');
    const origin = new Position(3, 3);
    const enemySquare = new Position(3, 2);
    board.placePiece(origin, king);
    board.placePiece(enemySquare, enemyPawn);

    const moves = king.getPseudoLegalMoves(origin, board);

    expect(moves.some((pos) => pos.equals(enemySquare))).toBe(true);
  });

  it('rejects king move when destination square contains friendly piece', () => {
    const board = new Board(8, 8);
    const king = new King('WHITE');
    const friendlyPawn = new Pawn('WHITE');
    const origin = new Position(3, 3);
    const friendlySquare = new Position(3, 4);
    board.placePiece(origin, king);
    board.placePiece(friendlySquare, friendlyPawn);

    const moves = king.getPseudoLegalMoves(origin, board);

    expect(moves.some((pos) => pos.equals(friendlySquare))).toBe(false);
  });

  it('returns empty move list when king is completely surrounded by friendly pieces', () => {
    const board = new Board(8, 8);
    const king = new King('WHITE');
    const origin = new Position(3, 3);
    board.placePiece(origin, king);
    const adjacentTargets = [
      new Position(4, 3),
      new Position(2, 3),
      new Position(3, 4),
      new Position(3, 2),
      new Position(4, 4),
      new Position(4, 2),
      new Position(2, 4),
      new Position(2, 2),
    ];
    for (const target of adjacentTargets) {
      board.placePiece(target, new Pawn('WHITE'));
    }

    const moves = king.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(0);
  });
});
