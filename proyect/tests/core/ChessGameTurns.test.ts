import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { ChessGame } from '../../src/core/game/ChessGame';
import { King } from '../../src/core/pieces/King';
import { Pawn } from '../../src/core/pieces/Pawn';
import { Rook } from '../../src/core/pieces/Rook';

describe('ChessGame Turns, Captures & MoveResult', () => {
  it('initializes with white as default active turn', () => {
    const defaultGame = new ChessGame();

    expect(defaultGame.getSnapshot().currentTurn).toBe('WHITE');
  });

  it('accepts custom initial turn configuration via constructor', () => {
    const board = new Board(8, 8);
    const customGame = new ChessGame(board, 'BLACK');

    expect(customGame.getSnapshot().currentTurn).toBe('BLACK');
  });

  it('rejects move when origin square is empty', () => {
    const board = new Board(8, 8);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(3, 3), new Position(4, 3));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('EMPTY_ORIGIN');
    }
  });

  it('rejects move when piece at origin belongs to opposing player', () => {
    const board = new Board(8, 8);
    const blackPawn = new Pawn('BLACK');
    board.placePiece(new Position(6, 4), blackPawn);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(6, 4), new Position(5, 4));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('WRONG_TURN');
    }
  });

  it('rejects move when destination violates piece movement rules', () => {
    const board = new Board(8, 8);
    const whiteRook = new Rook('WHITE');
    board.placePiece(new Position(0, 0), whiteRook);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(0, 0), new Position(2, 3));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('ILLEGAL_MOVE');
    }
  });

  it('executes valid move returning success result with next state', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whitePawn = new Pawn('WHITE');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(1, 4), whitePawn);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(1, 4), new Position(3, 4));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.capturedPiece).toBeNull();
      expect(result.nextState).toBe('IN_PROGRESS');
    }
  });

  it('alternates active turn to opponent upon successful move', () => {
    const board = new Board(8, 8);
    const whitePawn = new Pawn('WHITE');
    board.placePiece(new Position(1, 4), whitePawn);
    const game = new ChessGame(board, 'WHITE');

    game.makeMove(new Position(1, 4), new Position(3, 4));

    expect(game.getSnapshot().currentTurn).toBe('BLACK');
  });

  it('updates piece positions on board upon successful move', () => {
    const board = new Board(8, 8);
    const whitePawn = new Pawn('WHITE');
    const origin = new Position(1, 4);
    const target = new Position(3, 4);
    board.placePiece(origin, whitePawn);
    const game = new ChessGame(board, 'WHITE');

    game.makeMove(origin, target);

    expect(board.getPieceAt(origin)).toBeNull();
    expect(board.getPieceAt(target)).toBe(whitePawn);
  });

  it('executes capture move registering captured piece in result', () => {
    const board = new Board(8, 8);
    const whitePawn = new Pawn('WHITE');
    const blackRook = new Rook('BLACK');
    board.placePiece(new Position(4, 4), whitePawn);
    board.placePiece(new Position(5, 5), blackRook);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(4, 4), new Position(5, 5));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.capturedPiece).toBe(blackRook);
    }
    expect(board.getPieceAt(new Position(5, 5))).toBe(whitePawn);
  });

  it('reverts turn and board position upon undo', () => {
    const board = new Board(8, 8);
    const whitePawn = new Pawn('WHITE');
    board.placePiece(new Position(1, 4), whitePawn);
    const game = new ChessGame(board, 'WHITE');
    game.makeMove(new Position(1, 4), new Position(3, 4));

    const undone = game.undo();

    expect(undone).toBe(true);
    expect(game.getSnapshot().currentTurn).toBe('WHITE');
    expect(board.getPieceAt(new Position(1, 4))).toBe(whitePawn);
    expect(board.getPieceAt(new Position(3, 4))).toBeNull();
  });

  it('re-applies move and alternates turn upon redo', () => {
    const board = new Board(8, 8);
    const whitePawn = new Pawn('WHITE');
    board.placePiece(new Position(1, 4), whitePawn);
    const game = new ChessGame(board, 'WHITE');
    game.makeMove(new Position(1, 4), new Position(3, 4));
    game.undo();

    const redone = game.redo();

    expect(redone).toBe(true);
    expect(game.getSnapshot().currentTurn).toBe('BLACK');
    expect(board.getPieceAt(new Position(3, 4))).toBe(whitePawn);
  });
});
