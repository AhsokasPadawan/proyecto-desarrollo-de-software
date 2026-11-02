import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { ChessGame } from '../../src/core/game/ChessGame';
import { StudyPlayState } from '../../src/core/game/StudyPlayState';
import { King } from '../../src/core/pieces/King';
import { Knight } from '../../src/core/pieces/Knight';
import { Queen } from '../../src/core/pieces/Queen';

describe('StudyPlayState & Study Mode in ChessGame', () => {
  it('allows consecutive moves for a single color when the opponent has no pieces on the board', () => {
    const board = new Board(8, 8);
    board.placePiece(Position.fromAlgebraic('d4'), new Knight('WHITE'));

    const game = new ChessGame(board, 'WHITE', undefined, undefined, new StudyPlayState());

    expect(game.getSnapshot().stateKind).toBe('STUDY_IN_PROGRESS');

    const firstMove = game.makeMove(Position.fromAlgebraic('d4'), Position.fromAlgebraic('f5'));
    expect(firstMove.success).toBe(true);
    expect(game.getSnapshot().currentTurn).toBe('WHITE');
    expect(game.getSnapshot().stateKind).toBe('STUDY_IN_PROGRESS');

    const secondMove = game.makeMove(Position.fromAlgebraic('f5'), Position.fromAlgebraic('e7'));
    expect(secondMove.success).toBe(true);
    expect(game.getSnapshot().currentTurn).toBe('WHITE');

    expect(game.undo()).toBe(true);
    expect(game.getSnapshot().currentTurn).toBe('WHITE');
    expect(game.getSnapshot().grid[4][5]?.type).toBe('KNIGHT');
  });

  it('does not trigger automatic draw by insufficient material in study mode', () => {
    const board = new Board(8, 8);
    board.placePiece(Position.fromAlgebraic('e1'), new King('WHITE'));
    board.placePiece(Position.fromAlgebraic('d4'), new Knight('WHITE'));
    board.placePiece(Position.fromAlgebraic('e8'), new King('BLACK'));

    const game = new ChessGame(board, 'WHITE', undefined, undefined, new StudyPlayState());
    const result = game.makeMove(Position.fromAlgebraic('d4'), Position.fromAlgebraic('f5'));

    expect(result.success).toBe(true);
    expect(game.getSnapshot().stateKind).toBe('STUDY_IN_PROGRESS');
    expect(game.getSnapshot().currentTurn).toBe('BLACK');
  });

  it('transitions to CHECKMATE in study mode when an enemy King is checkmated', () => {
    const board = new Board(8, 8);
    board.placePiece(Position.fromAlgebraic('f6'), new King('WHITE'));
    board.placePiece(Position.fromAlgebraic('h6'), new Queen('WHITE'));
    board.placePiece(Position.fromAlgebraic('g8'), new King('BLACK'));

    const game = new ChessGame(board, 'WHITE', undefined, undefined, new StudyPlayState());
    const result = game.makeMove(Position.fromAlgebraic('h6'), Position.fromAlgebraic('g7'));

    expect(result.success).toBe(true);
    expect(game.getSnapshot().stateKind).toBe('CHECKMATE');
    expect(game.getSnapshot().winner).toBe('WHITE');
  });

  it('transitions to CHECK when giving non-mate check in study mode and returns to STUDY_IN_PROGRESS after escaping', () => {
    const board = new Board(8, 8);
    board.placePiece(Position.fromAlgebraic('e1'), new King('WHITE'));
    board.placePiece(Position.fromAlgebraic('e4'), new Knight('WHITE'));
    board.placePiece(Position.fromAlgebraic('e8'), new King('BLACK'));

    const game = new ChessGame(board, 'WHITE', undefined, undefined, new StudyPlayState());

    const checkMove = game.makeMove(Position.fromAlgebraic('e4'), Position.fromAlgebraic('f6'));
    expect(checkMove.success).toBe(true);
    expect(game.getSnapshot().stateKind).toBe('CHECK');

    const escapeMove = game.makeMove(Position.fromAlgebraic('e8'), Position.fromAlgebraic('d8'));
    expect(escapeMove.success).toBe(true);
    expect(game.getSnapshot().stateKind).toBe('STUDY_IN_PROGRESS');
  });
});
