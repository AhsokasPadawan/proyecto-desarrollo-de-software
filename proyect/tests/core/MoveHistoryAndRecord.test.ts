import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { ChessGame } from '../../src/core/game/ChessGame';
import { Bishop } from '../../src/core/pieces/Bishop';
import { King } from '../../src/core/pieces/King';
import { Pawn } from '../../src/core/pieces/Pawn';
import { Rook } from '../../src/core/pieces/Rook';

describe('MoveHistory and MoveRecord in GameSnapshot', () => {
  it('initializes with empty moveHistory and currentMoveIndex at 0', () => {
    const game = new ChessGame();
    const snapshot = game.getSnapshot();

    expect(snapshot.moveHistory).toEqual([]);
    expect(snapshot.currentMoveIndex).toBe(0);
  });

  it('records standard moves with algebraic coordinates and piece metadata', () => {
    const game = new ChessGame();

    game.makeMove(new Position(1, 4), new Position(3, 4));

    const snapshot = game.getSnapshot();
    expect(snapshot.moveHistory).toHaveLength(1);
    expect(snapshot.currentMoveIndex).toBe(1);
    expect(snapshot.moveHistory[0]).toEqual({
      moveIndex: 0,
      turn: 'WHITE',
      piece: 'PAWN',
      from: 'e2',
      to: 'e4',
      capturedPiece: undefined,
      isCastling: false,
      isPromotion: false,
    });
  });

  it('records captured piece when a capture occurs', () => {
    const board = new Board(8, 8);
    board.placePiece(new Position(1, 4), new Pawn('WHITE'));
    board.placePiece(new Position(2, 5), new Bishop('BLACK'));
    const game = new ChessGame(board, 'WHITE');

    game.makeMove(new Position(1, 4), new Position(2, 5));

    const snapshot = game.getSnapshot();
    expect(snapshot.moveHistory).toHaveLength(1);
    expect(snapshot.moveHistory[0].capturedPiece).toBe('BISHOP');
    expect(snapshot.moveHistory[0].from).toBe('e2');
    expect(snapshot.moveHistory[0].to).toBe('f3');
  });

  it('records castling moves with isCastling flag', () => {
    const board = new Board(8, 8);
    board.placePiece(new Position(0, 4), new King('WHITE'));
    board.placePiece(new Position(0, 7), new Rook('WHITE'));
    const game = new ChessGame(board, 'WHITE');

    game.makeMove(new Position(0, 4), new Position(0, 6));

    const snapshot = game.getSnapshot();
    expect(snapshot.moveHistory).toHaveLength(1);
    expect(snapshot.moveHistory[0].isCastling).toBe(true);
    expect(snapshot.moveHistory[0].piece).toBe('KING');
    expect(snapshot.moveHistory[0].from).toBe('e1');
    expect(snapshot.moveHistory[0].to).toBe('g1');
  });

  it('records pawn promotion with isPromotion flag and promotionPiece', () => {
    const board = new Board(8, 8);
    board.placePiece(new Position(6, 0), new Pawn('WHITE'));
    const game = new ChessGame(board, 'WHITE');

    game.makeMove(new Position(6, 0), new Position(7, 0), 'QUEEN');

    const snapshot = game.getSnapshot();
    expect(snapshot.moveHistory).toHaveLength(1);
    expect(snapshot.moveHistory[0].isPromotion).toBe(true);
    expect(snapshot.moveHistory[0].promotionPiece).toBe('QUEEN');
    expect(snapshot.moveHistory[0].from).toBe('a7');
    expect(snapshot.moveHistory[0].to).toBe('a8');
  });

  it('updates currentMoveIndex and preserves moveHistory on undo and redo', () => {
    const game = new ChessGame();
    game.makeMove(new Position(1, 4), new Position(3, 4));
    game.makeMove(new Position(6, 4), new Position(4, 4));

    const snapshotAfterMoves = game.getSnapshot();
    expect(snapshotAfterMoves.currentMoveIndex).toBe(2);
    expect(snapshotAfterMoves.moveHistory).toHaveLength(2);

    game.undo();
    const snapshotAfterUndo = game.getSnapshot();
    expect(snapshotAfterUndo.currentMoveIndex).toBe(1);
    expect(snapshotAfterUndo.moveHistory).toHaveLength(2);

    game.redo();
    const snapshotAfterRedo = game.getSnapshot();
    expect(snapshotAfterRedo.currentMoveIndex).toBe(2);
    expect(snapshotAfterRedo.moveHistory).toHaveLength(2);
  });

  it('truncates future moves in moveHistory when a branching move is made after undo', () => {
    const game = new ChessGame();
    game.makeMove(new Position(1, 4), new Position(3, 4));
    game.makeMove(new Position(6, 4), new Position(4, 4));

    game.undo();

    game.makeMove(new Position(6, 2), new Position(4, 2));

    const snapshot = game.getSnapshot();
    expect(snapshot.moveHistory).toHaveLength(2);
    expect(snapshot.currentMoveIndex).toBe(2);
    expect(snapshot.moveHistory[0].to).toBe('e4');
    expect(snapshot.moveHistory[1].to).toBe('c5');
  });
});
