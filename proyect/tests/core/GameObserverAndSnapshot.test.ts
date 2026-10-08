import { describe, expect, it, vi } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { ChessGame } from '../../src/core/game/ChessGame';
import { Pawn } from '../../src/core/pieces/Pawn';
import { IGameObserver } from '../../src/core/ports/IGameObserver';

describe('GameObserver & GameSnapshot', () => {
  it('builds an immutable GameSnapshot reflecting board dimensions, grid, turn, and history flags', () => {
    const board = new Board(8, 8);
    const whitePawn = new Pawn('WHITE');
    board.placePiece(new Position(1, 4), whitePawn);
    const game = new ChessGame(board, 'WHITE');

    const snapshot = game.getSnapshot();

    expect(snapshot.rows).toBe(8);
    expect(snapshot.cols).toBe(8);
    expect(snapshot.currentTurn).toBe('WHITE');
    expect(snapshot.stateKind).toBe('IN_PROGRESS');
    expect(snapshot.winner).toBeNull();
    expect(snapshot.canUndo).toBe(false);
    expect(snapshot.canRedo).toBe(false);
    expect(snapshot.grid[1][4]).toEqual({ type: 'PAWN', color: 'WHITE' });
    expect(snapshot.grid[0][0]).toBeNull();
  });

  it('notifies registered observer upon successful move execution', () => {
    const board = new Board(8, 8);
    const whitePawn = new Pawn('WHITE');
    board.placePiece(new Position(1, 4), whitePawn);
    const game = new ChessGame(board, 'WHITE');
    const mockObserver: IGameObserver = {
      onGameStateChanged: vi.fn(),
    };
    game.subscribe(mockObserver);

    game.makeMove(new Position(1, 4), new Position(3, 4));

    expect(mockObserver.onGameStateChanged).toHaveBeenCalledTimes(1);
    const lastCallSnapshot = vi.mocked(mockObserver.onGameStateChanged).mock.calls[0][0];
    expect(lastCallSnapshot.currentTurn).toBe('BLACK');
    expect(lastCallSnapshot.canUndo).toBe(true);
  });

  it('does not notify observers when makeMove rejects an invalid move', () => {
    const board = new Board(8, 8);
    const game = new ChessGame(board, 'WHITE');
    const mockObserver: IGameObserver = {
      onGameStateChanged: vi.fn(),
    };
    game.subscribe(mockObserver);

    game.makeMove(new Position(0, 0), new Position(1, 1));

    expect(mockObserver.onGameStateChanged).not.toHaveBeenCalled();
  });

  it('notifies observer upon undo action', () => {
    const board = new Board(8, 8);
    const whitePawn = new Pawn('WHITE');
    board.placePiece(new Position(1, 4), whitePawn);
    const game = new ChessGame(board, 'WHITE');
    const mockObserver: IGameObserver = {
      onGameStateChanged: vi.fn(),
    };
    game.makeMove(new Position(1, 4), new Position(3, 4));
    game.subscribe(mockObserver);

    game.undo();

    expect(mockObserver.onGameStateChanged).toHaveBeenCalledTimes(1);
  });

  it('notifies observer upon redo action', () => {
    const board = new Board(8, 8);
    const whitePawn = new Pawn('WHITE');
    board.placePiece(new Position(1, 4), whitePawn);
    const game = new ChessGame(board, 'WHITE');
    const mockObserver: IGameObserver = {
      onGameStateChanged: vi.fn(),
    };
    game.makeMove(new Position(1, 4), new Position(3, 4));
    game.undo();
    game.subscribe(mockObserver);

    game.redo();

    expect(mockObserver.onGameStateChanged).toHaveBeenCalledTimes(1);
  });

  it('stops sending notifications to observer after unsubscribe is invoked via return function', () => {
    const board = new Board(8, 8);
    const whitePawn = new Pawn('WHITE');
    const blackPawn = new Pawn('BLACK');
    board.placePiece(new Position(1, 4), whitePawn);
    board.placePiece(new Position(6, 4), blackPawn);
    const game = new ChessGame(board, 'WHITE');
    const mockObserver: IGameObserver = {
      onGameStateChanged: vi.fn(),
    };
    const unsubscribe = game.subscribe(mockObserver);

    game.makeMove(new Position(1, 4), new Position(3, 4));
    unsubscribe();
    game.makeMove(new Position(6, 4), new Position(4, 4));

    expect(mockObserver.onGameStateChanged).toHaveBeenCalledTimes(1);
  });
});
