import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { IPiece } from '../../src/core/pieces/IPiece';
import { Color, PieceType } from '../../src/core/pieces/types';
import { IBoardQuery } from '../../src/core/ports/IBoardQuery';

class StubPiece implements IPiece {
  constructor(
    readonly color: Color,
    readonly type: PieceType = 'PAWN'
  ) {}

  getPseudoLegalMoves(_from: Position, _board: IBoardQuery): Position[] {
    return [];
  }

  getAttackedSquares(_from: Position, _board: IBoardQuery): Position[] {
    return [];
  }
}

describe('Board', () => {
  it('initializes with default 8x8 dimensions', () => {
    const board = new Board();

    expect(board.rows).toBe(8);
    expect(board.cols).toBe(8);
  });

  it('accepts customizable positive dimensions', () => {
    const board = new Board(10, 10);

    expect(board.rows).toBe(10);
    expect(board.cols).toBe(10);
  });

  it('throws an error when instantiated with invalid dimensions', () => {
    expect(() => new Board(0, 8)).toThrow();
    expect(() => new Board(-5, 8)).toThrow();
    expect(() => new Board(8.5, 8)).toThrow();
  });

  it('verifies boundary limits dynamically according to configured dimensions', () => {
    const board = new Board(6, 6);

    expect(board.isWithinBounds(new Position(0, 0))).toBe(true);
    expect(board.isWithinBounds(new Position(5, 5))).toBe(true);
    expect(board.isWithinBounds(new Position(6, 5))).toBe(false);
    expect(board.isWithinBounds(new Position(5, 6))).toBe(false);
    expect(board.isWithinBounds(new Position(-1, 0))).toBe(false);
  });

  it('places a piece on an empty square and returns null as displaced piece', () => {
    const board = new Board();
    const piece = new StubPiece('WHITE', 'ROOK');
    const position = new Position(0, 0);

    const displaced = board.placePiece(position, piece);

    expect(displaced).toBeNull();
    expect(board.getPieceAt(position)).toBe(piece);
    expect(board.isEmpty(position)).toBe(false);
  });

  it('displaces and returns previous piece when placing on an occupied square', () => {
    const board = new Board();
    const originalPiece = new StubPiece('WHITE', 'ROOK');
    const newPiece = new StubPiece('BLACK', 'QUEEN');
    const position = new Position(0, 0);
    board.placePiece(position, originalPiece);

    const displaced = board.placePiece(position, newPiece);

    expect(displaced).toBe(originalPiece);
    expect(board.getPieceAt(position)).toBe(newPiece);
  });

  it('throws an error when placing a piece outside boundaries', () => {
    const board = new Board();
    const piece = new StubPiece('WHITE', 'ROOK');
    const outOfBounds = new Position(8, 8);

    expect(() => board.placePiece(outOfBounds, piece)).toThrow();
  });

  it('removes a piece and returns the removed instance', () => {
    const board = new Board();
    const piece = new StubPiece('BLACK', 'BISHOP');
    const position = new Position(3, 3);
    board.placePiece(position, piece);

    const removed = board.removePiece(position);

    expect(removed).toBe(piece);
    expect(board.getPieceAt(position)).toBeNull();
    expect(board.isEmpty(position)).toBe(true);
  });

  it('returns null when removing a piece from an empty square', () => {
    const board = new Board();
    const emptyPosition = new Position(2, 2);

    const removed = board.removePiece(emptyPosition);

    expect(removed).toBeNull();
  });

  it('moves a piece to an empty destination and returns null as captured piece', () => {
    const board = new Board();
    const piece = new StubPiece('WHITE', 'KNIGHT');
    const from = new Position(1, 0);
    const to = new Position(2, 2);
    board.placePiece(from, piece);

    const captured = board.movePiece(from, to);

    expect(captured).toBeNull();
    expect(board.getPieceAt(from)).toBeNull();
    expect(board.getPieceAt(to)).toBe(piece);
  });

  it('moves a piece capturing the opponent piece at destination', () => {
    const board = new Board();
    const whiteQueen = new StubPiece('WHITE', 'QUEEN');
    const blackPawn = new StubPiece('BLACK', 'PAWN');
    const from = new Position(0, 3);
    const to = new Position(4, 3);
    board.placePiece(from, whiteQueen);
    board.placePiece(to, blackPawn);

    const captured = board.movePiece(from, to);

    expect(captured).toBe(blackPawn);
    expect(board.getPieceAt(from)).toBeNull();
    expect(board.getPieceAt(to)).toBe(whiteQueen);
  });

  it('finds king position for a given color', () => {
    const board = new Board();
    const whiteKing = new StubPiece('WHITE', 'KING');
    const blackKing = new StubPiece('BLACK', 'KING');
    const whiteKingPos = new Position(0, 4);
    const blackKingPos = new Position(7, 4);
    board.placePiece(whiteKingPos, whiteKing);
    board.placePiece(blackKingPos, blackKing);

    expect(board.findKingPosition('WHITE')?.equals(whiteKingPos)).toBe(true);
    expect(board.findKingPosition('BLACK')?.equals(blackKingPos)).toBe(true);
  });

  it('returns null when king is not on the board', () => {
    const board = new Board();

    expect(board.findKingPosition('WHITE')).toBeNull();
  });

  it('retrieves all pieces belonging to a specified color', () => {
    const board = new Board();
    const whitePawn1 = new StubPiece('WHITE', 'PAWN');
    const whitePawn2 = new StubPiece('WHITE', 'PAWN');
    const blackRook = new StubPiece('BLACK', 'ROOK');
    board.placePiece(new Position(1, 0), whitePawn1);
    board.placePiece(new Position(1, 1), whitePawn2);
    board.placePiece(new Position(7, 0), blackRook);

    const whitePieces = board.getPiecesByColor('WHITE');
    const blackPieces = board.getPiecesByColor('BLACK');

    expect(whitePieces).toHaveLength(2);
    expect(whitePieces.map((entry) => entry.piece)).toContain(whitePawn1);
    expect(whitePieces.map((entry) => entry.piece)).toContain(whitePawn2);
    expect(blackPieces).toHaveLength(1);
    expect(blackPieces[0].piece).toBe(blackRook);
  });
});
