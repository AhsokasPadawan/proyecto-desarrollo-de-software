import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { ChessGame } from '../../src/core/game/ChessGame';
import { King } from '../../src/core/pieces/King';
import { Pawn } from '../../src/core/pieces/Pawn';
import { Rook } from '../../src/core/pieces/Rook';

describe('Pawn Promotion', () => {
  it('promotes pawn to queen by default when reaching last rank via forward advance', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whitePawn = new Pawn('WHITE');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(6, 4), whitePawn);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(6, 4), new Position(7, 4));

    expect(result.success).toBe(true);
    const pieceAtDestination = board.getPieceAt(new Position(7, 4));
    expect(pieceAtDestination?.type).toBe('QUEEN');
    expect(pieceAtDestination?.color).toBe('WHITE');
  });

  it('promotes pawn to specified piece type when reaching last rank', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whitePawn = new Pawn('WHITE');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(6, 4), whitePawn);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(6, 4), new Position(7, 4), 'KNIGHT');

    expect(result.success).toBe(true);
    const pieceAtDestination = board.getPieceAt(new Position(7, 4));
    expect(pieceAtDestination?.type).toBe('KNIGHT');
    expect(pieceAtDestination?.color).toBe('WHITE');
  });

  it('promotes pawn while capturing enemy piece on the promotion rank', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whitePawn = new Pawn('WHITE');
    const blackRook = new Rook('BLACK');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(6, 4), whitePawn);
    board.placePiece(new Position(7, 5), blackRook);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(6, 4), new Position(7, 5), 'ROOK');

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error('Expected move to succeed');
    }
    expect(result.capturedPiece).toBe(blackRook);
    const pieceAtDestination = board.getPieceAt(new Position(7, 5));
    expect(pieceAtDestination?.type).toBe('ROOK');
  });

  it('transitions to CheckState when promoted piece immediately threatens opposing king', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whitePawn = new Pawn('WHITE');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 0), blackKing);
    board.placePiece(new Position(6, 4), whitePawn);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(6, 4), new Position(7, 4), 'QUEEN');

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error('Expected move to succeed');
    }
    expect(result.nextState).toBe('CHECK');
    expect(game.getSnapshot().stateKind).toBe('CHECK');
  });

  it('transitions to CheckmateState when promoted piece immediately delivers checkmate to opposing king', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whitePawn = new Pawn('WHITE');
    board.placePiece(new Position(5, 0), whiteKing);
    board.placePiece(new Position(7, 0), blackKing);
    board.placePiece(new Position(6, 2), whitePawn);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(6, 2), new Position(7, 2), 'QUEEN');

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error('Expected move to succeed');
    }
    expect(result.nextState).toBe('CHECKMATE');
    expect(game.getSnapshot().stateKind).toBe('CHECKMATE');
  });

  it('restores original pawn and captured piece upon undoing promotion', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whitePawn = new Pawn('WHITE');
    const blackRook = new Rook('BLACK');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(6, 4), whitePawn);
    board.placePiece(new Position(7, 5), blackRook);
    const game = new ChessGame(board, 'WHITE');
    game.makeMove(new Position(6, 4), new Position(7, 5), 'QUEEN');

    const undone = game.undo();

    expect(undone).toBe(true);
    expect(board.getPieceAt(new Position(6, 4))).toBe(whitePawn);
    expect(board.getPieceAt(new Position(7, 5))).toBe(blackRook);
  });
});
