import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { ChessGame } from '../../src/core/game/ChessGame';
import { King } from '../../src/core/pieces/King';
import { Rook } from '../../src/core/pieces/Rook';
import { RandomAiStrategy } from '../../src/core/strategy/RandomAiStrategy';

describe('RandomAiStrategy', () => {
  it('chooses a valid move that is accepted by the game engine', () => {
    const game = new ChessGame();
    const strategy = new RandomAiStrategy(() => 0);

    const move = strategy.chooseMove(game);

    expect(move).not.toBeNull();
    const result = game.makeMove(move!.from, move!.to);
    expect(result.success).toBe(true);
  });

  it('selects move deterministically using injected random number generator', () => {
    const game = new ChessGame();
    const firstMoveStrategy = new RandomAiStrategy(() => 0);
    const lastMoveStrategy = new RandomAiStrategy(() => 0.999);

    const firstMove = firstMoveStrategy.chooseMove(game);
    const lastMove = lastMoveStrategy.chooseMove(game);

    expect(firstMove).not.toBeNull();
    expect(lastMove).not.toBeNull();
    expect(firstMove?.from.equals(lastMove!.from) && firstMove?.to.equals(lastMove!.to)).toBe(false);
  });

  it('only chooses check evasions when active king is in check', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const blackRook = new Rook('BLACK');
    board.placePiece(new Position(0, 4), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(6, 4), blackRook);
    const game = new ChessGame(board, 'WHITE');
    const strategy = new RandomAiStrategy(() => 0.5);

    const move = strategy.chooseMove(game);

    expect(move).not.toBeNull();
    const result = game.makeMove(move!.from, move!.to);
    expect(result.success).toBe(true);
    expect(game.getSnapshot().stateKind).not.toBe('CHECK');
  });

  it('returns null when game is in terminal checkmate state', () => {
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
    const strategy = new RandomAiStrategy();

    const move = strategy.chooseMove(game);

    expect(move).toBeNull();
  });
});
