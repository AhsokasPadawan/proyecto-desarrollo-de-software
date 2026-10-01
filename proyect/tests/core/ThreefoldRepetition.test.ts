import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { ChessGame } from '../../src/core/game/ChessGame';
import { King } from '../../src/core/pieces/King';
import { Knight } from '../../src/core/pieces/Knight';

describe('Draw Conditions: Threefold Repetition', () => {
  it('transitions to DrawState when the same position occurs for the third time', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whiteKnight = new Knight('WHITE');
    const blackKnight = new Knight('BLACK');
    board.placePiece(new Position(0, 4), whiteKing);
    board.placePiece(new Position(7, 4), blackKing);
    board.placePiece(new Position(0, 1), whiteKnight);
    board.placePiece(new Position(7, 1), blackKnight);
    const game = new ChessGame(board, 'WHITE');

    game.makeMove(new Position(0, 1), new Position(2, 2));
    game.makeMove(new Position(7, 1), new Position(5, 2));
    game.makeMove(new Position(2, 2), new Position(0, 1));
    game.makeMove(new Position(5, 2), new Position(7, 1));

    game.makeMove(new Position(0, 1), new Position(2, 2));
    game.makeMove(new Position(7, 1), new Position(5, 2));
    game.makeMove(new Position(2, 2), new Position(0, 1));
    const finalMove = game.makeMove(new Position(5, 2), new Position(7, 1));

    expect(finalMove.success).toBe(true);
    if (finalMove.success) {
      expect(finalMove.nextState).toBe('DRAW');
    }
    const snapshot = game.getSnapshot();
    expect(snapshot.stateKind).toBe('DRAW');
    expect(snapshot.winner).toBeNull();
  });

  it('restores active play state upon undoing the move causing threefold repetition', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whiteKnight = new Knight('WHITE');
    const blackKnight = new Knight('BLACK');
    board.placePiece(new Position(0, 4), whiteKing);
    board.placePiece(new Position(7, 4), blackKing);
    board.placePiece(new Position(0, 1), whiteKnight);
    board.placePiece(new Position(7, 1), blackKnight);
    const game = new ChessGame(board, 'WHITE');

    game.makeMove(new Position(0, 1), new Position(2, 2));
    game.makeMove(new Position(7, 1), new Position(5, 2));
    game.makeMove(new Position(2, 2), new Position(0, 1));
    game.makeMove(new Position(5, 2), new Position(7, 1));

    game.makeMove(new Position(0, 1), new Position(2, 2));
    game.makeMove(new Position(7, 1), new Position(5, 2));
    game.makeMove(new Position(2, 2), new Position(0, 1));
    game.makeMove(new Position(5, 2), new Position(7, 1));

    const undone = game.undo();

    expect(undone).toBe(true);
    expect(game.getSnapshot().stateKind).toBe('IN_PROGRESS');
  });
});
