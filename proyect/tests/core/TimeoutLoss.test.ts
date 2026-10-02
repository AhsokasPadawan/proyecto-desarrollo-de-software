import { describe, expect, it, vi } from 'vitest';
import { ChessGame } from '../../src/core/game/ChessGame';
import { Position } from '../../src/core/board/Position';

describe('TimeoutLoss - Core Domain', () => {
  it('declares timeout for white player and awards victory to black', () => {
    const game = new ChessGame();
    const snapshot = game.declareTimeout('WHITE');

    expect(snapshot.stateKind).toBe('TIMEOUT');
    expect(snapshot.winner).toBe('BLACK');
    expect(game.getSnapshot().stateKind).toBe('TIMEOUT');
    expect(game.getSnapshot().winner).toBe('BLACK');
  });

  it('declares timeout for black player and awards victory to white', () => {
    const game = new ChessGame();
    const snapshot = game.declareTimeout('BLACK');

    expect(snapshot.stateKind).toBe('TIMEOUT');
    expect(snapshot.winner).toBe('WHITE');
    expect(game.getSnapshot().stateKind).toBe('TIMEOUT');
    expect(game.getSnapshot().winner).toBe('WHITE');
  });

  it('notifies registered observers when timeout occurs', () => {
    const game = new ChessGame();
    const observer = { onGameStateChanged: vi.fn() };
    game.subscribe(observer);

    game.declareTimeout('WHITE');

    expect(observer.onGameStateChanged).toHaveBeenCalledTimes(1);
    const emittedSnapshot = observer.onGameStateChanged.mock.calls[0][0];
    expect(emittedSnapshot.stateKind).toBe('TIMEOUT');
    expect(emittedSnapshot.winner).toBe('BLACK');
  });

  it('rejects subsequent moves with GAME_OVER once timeout is declared', () => {
    const game = new ChessGame();
    game.declareTimeout('WHITE');

    const result = game.makeMove(new Position(1, 4), new Position(3, 4));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('GAME_OVER');
    }
  });

  it('ignores timeout declaration if the game has already concluded by checkmate', () => {
    const game = new ChessGame();
    game.makeMove(new Position(1, 5), new Position(2, 5));
    game.makeMove(new Position(6, 4), new Position(4, 4));
    game.makeMove(new Position(1, 6), new Position(3, 6));
    game.makeMove(new Position(7, 3), new Position(3, 7));

    expect(game.getSnapshot().stateKind).toBe('CHECKMATE');
    expect(game.getSnapshot().winner).toBe('BLACK');

    const snapshotAfterTimeout = game.declareTimeout('BLACK');

    expect(snapshotAfterTimeout.stateKind).toBe('CHECKMATE');
    expect(snapshotAfterTimeout.winner).toBe('BLACK');
  });
});
