import { describe, expect, it } from 'vitest';
import { ChessGame } from '../../src/core/game/ChessGame';
import { Position } from '../../src/core/board/Position';
import { FenSerializer } from '../../src/core/board/FenSerializer';

describe('FenSerializer', () => {
  it('serializes standard initial chess position correctly', () => {
    const game = new ChessGame();
    const fen = FenSerializer.serializeSnapshot(game.getSnapshot());

    expect(fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  });

  it('serializes pawn advance with en passant target', () => {
    const game = new ChessGame();
    game.makeMove(Position.fromAlgebraic('e2'), Position.fromAlgebraic('e4'));
    const fen = FenSerializer.serializeSnapshot(game.getSnapshot());

    expect(fen).toBe('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
  });

  it('updates castling rights when a rook moves', () => {
    const game = new ChessGame();
    game.makeMove(Position.fromAlgebraic('a2'), Position.fromAlgebraic('a4'));
    game.makeMove(Position.fromAlgebraic('h7'), Position.fromAlgebraic('h5'));
    game.makeMove(Position.fromAlgebraic('a1'), Position.fromAlgebraic('a3'));

    const fen = FenSerializer.serializeSnapshot(game.getSnapshot());
    expect(fen).toContain('Kkq');
    expect(fen).not.toContain('KQkq');
  });

  it('updates halfmove clock when non-pawn non-capture moves occur', () => {
    const game = new ChessGame();
    game.makeMove(Position.fromAlgebraic('g1'), Position.fromAlgebraic('f3'));
    const fen = FenSerializer.serializeSnapshot(game.getSnapshot());

    expect(fen).toBe('rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1');
  });
});
