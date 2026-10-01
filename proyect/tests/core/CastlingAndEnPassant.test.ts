import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { ChessGame } from '../../src/core/game/ChessGame';
import { King } from '../../src/core/pieces/King';
import { Pawn } from '../../src/core/pieces/Pawn';
import { Rook } from '../../src/core/pieces/Rook';

describe('Castling & En Passant', () => {
  it('executes kingside castling moving king two squares and rook to adjacent transit square', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const whiteRook = new Rook('WHITE');
    const blackKing = new King('BLACK');
    board.placePiece(new Position(0, 4), whiteKing);
    board.placePiece(new Position(0, 7), whiteRook);
    board.placePiece(new Position(7, 4), blackKing);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(0, 4), new Position(0, 6));

    expect(result.success).toBe(true);
    expect(board.getPieceAt(new Position(0, 6))).toBe(whiteKing);
    expect(board.getPieceAt(new Position(0, 5))).toBe(whiteRook);
    expect(board.getPieceAt(new Position(0, 4))).toBeNull();
    expect(board.getPieceAt(new Position(0, 7))).toBeNull();
  });

  it('executes queenside castling moving king two squares and rook to adjacent transit square', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const whiteRook = new Rook('WHITE');
    const blackKing = new King('BLACK');
    board.placePiece(new Position(0, 4), whiteKing);
    board.placePiece(new Position(0, 0), whiteRook);
    board.placePiece(new Position(7, 4), blackKing);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(0, 4), new Position(0, 2));

    expect(result.success).toBe(true);
    expect(board.getPieceAt(new Position(0, 2))).toBe(whiteKing);
    expect(board.getPieceAt(new Position(0, 3))).toBe(whiteRook);
    expect(board.getPieceAt(new Position(0, 4))).toBeNull();
    expect(board.getPieceAt(new Position(0, 0))).toBeNull();
  });

  it('rejects castling when king has already moved', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const whiteRook = new Rook('WHITE');
    const blackKing = new King('BLACK');
    board.placePiece(new Position(0, 4), whiteKing);
    board.placePiece(new Position(0, 7), whiteRook);
    board.placePiece(new Position(7, 4), blackKing);
    const game = new ChessGame(board, 'WHITE');
    game.makeMove(new Position(0, 4), new Position(0, 5));
    game.makeMove(new Position(7, 4), new Position(7, 5));
    game.makeMove(new Position(0, 5), new Position(0, 4));
    game.makeMove(new Position(7, 5), new Position(7, 4));

    const result = game.makeMove(new Position(0, 4), new Position(0, 6));

    expect(result.success).toBe(false);
  });

  it('rejects castling when rook has already moved', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const whiteRook = new Rook('WHITE');
    const blackKing = new King('BLACK');
    board.placePiece(new Position(0, 4), whiteKing);
    board.placePiece(new Position(0, 7), whiteRook);
    board.placePiece(new Position(7, 4), blackKing);
    const game = new ChessGame(board, 'WHITE');
    game.makeMove(new Position(0, 7), new Position(0, 6));
    game.makeMove(new Position(7, 4), new Position(7, 5));
    game.makeMove(new Position(0, 6), new Position(0, 7));
    game.makeMove(new Position(7, 5), new Position(7, 4));

    const result = game.makeMove(new Position(0, 4), new Position(0, 6));

    expect(result.success).toBe(false);
  });

  it('rejects castling when king is currently in check', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const whiteRook = new Rook('WHITE');
    const blackKing = new King('BLACK');
    const blackRook = new Rook('BLACK');
    board.placePiece(new Position(0, 4), whiteKing);
    board.placePiece(new Position(0, 7), whiteRook);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(6, 4), blackRook);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(0, 4), new Position(0, 6));

    expect(result.success).toBe(false);
  });

  it('rejects castling when transit square is under enemy attack', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const whiteRook = new Rook('WHITE');
    const blackKing = new King('BLACK');
    const blackRook = new Rook('BLACK');
    board.placePiece(new Position(0, 4), whiteKing);
    board.placePiece(new Position(0, 7), whiteRook);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(6, 5), blackRook);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(0, 4), new Position(0, 6));

    expect(result.success).toBe(false);
  });

  it('rejects castling when destination square is under enemy attack', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const whiteRook = new Rook('WHITE');
    const blackKing = new King('BLACK');
    const blackRook = new Rook('BLACK');
    board.placePiece(new Position(0, 4), whiteKing);
    board.placePiece(new Position(0, 7), whiteRook);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(6, 6), blackRook);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(0, 4), new Position(0, 6));

    expect(result.success).toBe(false);
  });

  it('restores king and rook to initial squares and resets hasMoved upon undoing castling', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const whiteRook = new Rook('WHITE');
    const blackKing = new King('BLACK');
    board.placePiece(new Position(0, 4), whiteKing);
    board.placePiece(new Position(0, 7), whiteRook);
    board.placePiece(new Position(7, 4), blackKing);
    const game = new ChessGame(board, 'WHITE');
    game.makeMove(new Position(0, 4), new Position(0, 6));

    const undone = game.undo();

    expect(undone).toBe(true);
    expect(board.getPieceAt(new Position(0, 4))).toBe(whiteKing);
    expect(board.getPieceAt(new Position(0, 7))).toBe(whiteRook);
    expect(board.getPieceAt(new Position(0, 6))).toBeNull();
    expect(board.getPieceAt(new Position(0, 5))).toBeNull();
    expect(whiteKing.hasMoved).toBe(false);
    expect(whiteRook.hasMoved).toBe(false);
  });

  it('executes valid en passant capture capturing double-advanced enemy pawn', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whitePawn = new Pawn('WHITE');
    const blackPawn = new Pawn('BLACK');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(1, 4), whitePawn);
    board.placePiece(new Position(3, 3), blackPawn);
    const game = new ChessGame(board, 'WHITE');
    game.makeMove(new Position(1, 4), new Position(3, 4));

    const enPassantResult = game.makeMove(new Position(3, 3), new Position(2, 4));

    expect(enPassantResult.success).toBe(true);
    if (!enPassantResult.success) {
      throw new Error('Expected move to succeed');
    }
    expect(board.getPieceAt(new Position(2, 4))).toBe(blackPawn);
    expect(board.getPieceAt(new Position(3, 4))).toBeNull();
    expect(enPassantResult.capturedPiece).toBe(whitePawn);
  });

  it('expires en passant opportunity when intervening non-capture move is made', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whitePawn = new Pawn('WHITE');
    const blackPawn = new Pawn('BLACK');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(1, 4), whitePawn);
    board.placePiece(new Position(3, 3), blackPawn);
    const game = new ChessGame(board, 'WHITE');
    game.makeMove(new Position(1, 4), new Position(3, 4));
    game.makeMove(new Position(7, 7), new Position(6, 7));
    game.makeMove(new Position(0, 0), new Position(0, 1));

    const expiredResult = game.makeMove(new Position(3, 3), new Position(2, 4));

    expect(expiredResult.success).toBe(false);
  });

  it('restores captured enemy pawn and capturing pawn upon undoing en passant capture', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whitePawn = new Pawn('WHITE');
    const blackPawn = new Pawn('BLACK');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(1, 4), whitePawn);
    board.placePiece(new Position(3, 3), blackPawn);
    const game = new ChessGame(board, 'WHITE');
    game.makeMove(new Position(1, 4), new Position(3, 4));
    game.makeMove(new Position(3, 3), new Position(2, 4));

    const undone = game.undo();

    expect(undone).toBe(true);
    expect(board.getPieceAt(new Position(3, 3))).toBe(blackPawn);
    expect(board.getPieceAt(new Position(3, 4))).toBe(whitePawn);
    expect(board.getPieceAt(new Position(2, 4))).toBeNull();
  });
});
