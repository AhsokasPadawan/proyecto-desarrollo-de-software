import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { ChessGame } from '../../src/core/game/ChessGame';
import { King } from '../../src/core/pieces/King';
import { Queen } from '../../src/core/pieces/Queen';
import { Rook } from '../../src/core/pieces/Rook';

describe('Terminal States: Checkmate & Stalemate', () => {
  it('transitions to CheckmateState declaring winning color when king cannot escape check', () => {
    const board = new Board(8, 8);
    const blackKing = new King('BLACK');
    const whiteKing = new King('WHITE');
    const whiteRookA = new Rook('WHITE');
    const whiteRookB = new Rook('WHITE');
    board.placePiece(new Position(7, 0), blackKing);
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(6, 7), whiteRookA);
    board.placePiece(new Position(0, 5), whiteRookB);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(0, 5), new Position(7, 5));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.nextState).toBe('CHECKMATE');
    }
    const snapshot = game.getSnapshot();
    expect(snapshot.stateKind).toBe('CHECKMATE');
    expect(snapshot.winner).toBe('WHITE');
  });

  it('transitions to StalemateState with null winner when player has no legal moves and is not in check', () => {
    const board = new Board(8, 8);
    const blackKing = new King('BLACK');
    const whiteKing = new King('WHITE');
    const whiteQueen = new Queen('WHITE');
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(5, 6), whiteKing);
    board.placePiece(new Position(0, 5), whiteQueen);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(0, 5), new Position(6, 5));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.nextState).toBe('STALEMATE');
    }
    const snapshot = game.getSnapshot();
    expect(snapshot.stateKind).toBe('STALEMATE');
    expect(snapshot.winner).toBeNull();
  });

  it('rejects moves in terminal checkmate state with GAME_OVER reason', () => {
    const board = new Board(8, 8);
    const blackKing = new King('BLACK');
    const whiteKing = new King('WHITE');
    const whiteRookA = new Rook('WHITE');
    const whiteRookB = new Rook('WHITE');
    board.placePiece(new Position(7, 0), blackKing);
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(6, 7), whiteRookA);
    board.placePiece(new Position(0, 5), whiteRookB);
    const game = new ChessGame(board, 'WHITE');
    game.makeMove(new Position(0, 5), new Position(7, 5));

    const rejectedMove = game.makeMove(new Position(7, 0), new Position(6, 0));

    expect(rejectedMove.success).toBe(false);
    if (!rejectedMove.success) {
      expect(rejectedMove.reason).toBe('GAME_OVER');
    }
  });

  it('restores active play state and allows moves after undoing a checkmate', () => {
    const board = new Board(8, 8);
    const blackKing = new King('BLACK');
    const whiteKing = new King('WHITE');
    const whiteRookA = new Rook('WHITE');
    const whiteRookB = new Rook('WHITE');
    board.placePiece(new Position(7, 0), blackKing);
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(6, 7), whiteRookA);
    board.placePiece(new Position(0, 5), whiteRookB);
    const game = new ChessGame(board, 'WHITE');
    game.makeMove(new Position(0, 5), new Position(7, 5));

    const undone = game.undo();

    expect(undone).toBe(true);
    const snapshot = game.getSnapshot();
    expect(snapshot.stateKind).toBe('IN_PROGRESS');
    expect(snapshot.winner).toBeNull();
  });

  it('transitions to CheckmateState on standard board via Fools Mate', () => {
    const game = new ChessGame();
    game.makeMove(new Position(1, 5), new Position(2, 5));
    game.makeMove(new Position(6, 4), new Position(4, 4));
    game.makeMove(new Position(1, 6), new Position(3, 6));

    const finalMove = game.makeMove(new Position(7, 3), new Position(3, 7));

    expect(finalMove.success).toBe(true);
    if (finalMove.success) {
      expect(finalMove.nextState).toBe('CHECKMATE');
    }
    const snapshot = game.getSnapshot();
    expect(snapshot.stateKind).toBe('CHECKMATE');
    expect(snapshot.winner).toBe('BLACK');
  });

  it('transitions to CheckmateState on standard board via Scholars Mate', () => {
    const game = new ChessGame();
    game.makeMove(new Position(1, 4), new Position(3, 4));
    game.makeMove(new Position(6, 4), new Position(4, 4));
    game.makeMove(new Position(0, 5), new Position(3, 2));
    game.makeMove(new Position(7, 1), new Position(5, 2));
    game.makeMove(new Position(0, 3), new Position(4, 7));
    game.makeMove(new Position(7, 6), new Position(5, 5));

    const mateMove = game.makeMove(new Position(4, 7), new Position(6, 5));

    expect(mateMove.success).toBe(true);
    if (mateMove.success) {
      expect(mateMove.nextState).toBe('CHECKMATE');
    }
    const snapshot = game.getSnapshot();
    expect(snapshot.stateKind).toBe('CHECKMATE');
    expect(snapshot.winner).toBe('WHITE');
  });
});

