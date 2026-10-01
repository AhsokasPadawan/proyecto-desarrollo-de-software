import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { ChessGame } from '../../src/core/game/ChessGame';
import { King } from '../../src/core/pieces/King';
import { Queen } from '../../src/core/pieces/Queen';
import { Rook } from '../../src/core/pieces/Rook';

describe('Active States: NormalPlayState & CheckState', () => {
  it('transitions from IN_PROGRESS to CHECK when move places opposing king in check', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whiteQueen = new Queen('WHITE');
    board.placePiece(new Position(0, 4), whiteKing);
    board.placePiece(new Position(7, 4), blackKing);
    board.placePiece(new Position(1, 0), whiteQueen);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(1, 0), new Position(7, 0));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.nextState).toBe('CHECK');
    }
    expect(game.getSnapshot().stateKind).toBe('CHECK');
  });

  it('transitions from CHECK back to IN_PROGRESS when checked king resolves threat', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whiteRook = new Rook('WHITE');
    board.placePiece(new Position(0, 4), whiteKing);
    board.placePiece(new Position(7, 4), blackKing);
    board.placePiece(new Position(1, 4), whiteRook);
    const game = new ChessGame(board, 'WHITE');
    game.makeMove(new Position(1, 4), new Position(6, 4));

    const escapeResult = game.makeMove(new Position(7, 4), new Position(7, 5));

    expect(escapeResult.success).toBe(true);
    if (escapeResult.success) {
      expect(escapeResult.nextState).toBe('IN_PROGRESS');
    }
    expect(game.getSnapshot().stateKind).toBe('IN_PROGRESS');
  });

  it('reverts state from CHECK back to IN_PROGRESS upon undoing check delivery', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whiteRook = new Rook('WHITE');
    board.placePiece(new Position(0, 4), whiteKing);
    board.placePiece(new Position(7, 4), blackKing);
    board.placePiece(new Position(1, 4), whiteRook);
    const game = new ChessGame(board, 'WHITE');
    game.makeMove(new Position(1, 4), new Position(6, 4));

    game.undo();

    expect(game.getSnapshot().stateKind).toBe('IN_PROGRESS');
  });
});
