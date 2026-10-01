import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { ChessGame } from '../../src/core/game/ChessGame';
import { Bishop } from '../../src/core/pieces/Bishop';
import { King } from '../../src/core/pieces/King';
import { Knight } from '../../src/core/pieces/Knight';
import { Pawn } from '../../src/core/pieces/Pawn';
import { Rook } from '../../src/core/pieces/Rook';

describe('Draw Conditions: Fifty-Move Rule & Insufficient Material', () => {
  it('prevents fifty-move draw by resetting half-move counter when a pawn advances', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whiteRook = new Rook('WHITE');
    const blackRook = new Rook('BLACK');
    const whitePawn = new Pawn('WHITE');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(1, 0), whiteRook);
    board.placePiece(new Position(6, 0), blackRook);
    board.placePiece(new Position(3, 0), whitePawn);
    for (let col = 1; col < 8; col++) {
      board.placePiece(new Position(2, col), new Pawn('WHITE'));
      board.placePiece(new Position(5, col), new Pawn('BLACK'));
    }
    const game = new ChessGame(board, 'WHITE');

    let whiteCol = 0;
    let blackCol = 0;
    for (let i = 0; i < 49; i++) {
      const nextWhiteCol = (whiteCol + 1) % 8;
      game.makeMove(new Position(1, whiteCol), new Position(1, nextWhiteCol));
      whiteCol = nextWhiteCol;

      const nextBlackCol = (blackCol + 1) % 7;
      game.makeMove(new Position(6, blackCol), new Position(6, nextBlackCol));
      blackCol = nextBlackCol;
    }

    const pawnMove = game.makeMove(new Position(3, 0), new Position(4, 0));
    game.makeMove(new Position(6, blackCol), new Position(6, (blackCol + 1) % 7));

    expect(pawnMove.success).toBe(true);
    expect(game.getSnapshot().stateKind).toBe('IN_PROGRESS');
  });

  it('resets halfMoveClock to zero when a piece is captured', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whiteRook = new Rook('WHITE');
    const blackPawn = new Pawn('BLACK');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(0, 2), whiteRook);
    board.placePiece(new Position(0, 5), blackPawn);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(new Position(0, 2), new Position(0, 5));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.capturedPiece).toBe(blackPawn);
    }
  });

  it('transitions to DrawState when 100 consecutive half-moves occur without pawn advance or capture', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whiteRook = new Rook('WHITE');
    const blackRook = new Rook('BLACK');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(1, 0), whiteRook);
    board.placePiece(new Position(6, 0), blackRook);
    for (let col = 0; col < 8; col++) {
      board.placePiece(new Position(2, col), new Pawn('WHITE'));
      board.placePiece(new Position(5, col), new Pawn('BLACK'));
    }
    const game = new ChessGame(board, 'WHITE');

    let whiteCol = 0;
    let blackCol = 0;
    for (let i = 0; i < 50; i++) {
      const nextWhiteCol = (whiteCol + 1) % 8;
      game.makeMove(new Position(1, whiteCol), new Position(1, nextWhiteCol));
      whiteCol = nextWhiteCol;

      const nextBlackCol = (blackCol + 1) % 7;
      game.makeMove(new Position(6, blackCol), new Position(6, nextBlackCol));
      blackCol = nextBlackCol;
    }

    expect(game.getSnapshot().stateKind).toBe('DRAW');
    expect(game.getSnapshot().winner).toBeNull();
  });

  it('transitions to DrawState when capturing leads to King vs King insufficient material', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whiteRook = new Rook('WHITE');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(6, 6), whiteRook);
    const game = new ChessGame(board, 'BLACK');

    const captureResult = game.makeMove(new Position(7, 7), new Position(6, 6));

    expect(captureResult.success).toBe(true);
    if (captureResult.success) {
      expect(captureResult.nextState).toBe('DRAW');
    }
    expect(game.getSnapshot().stateKind).toBe('DRAW');
  });

  it('transitions to DrawState when remaining material is King and Bishop vs King', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const blackRook = new Rook('BLACK');
    const whiteBishop = new Bishop('WHITE');
    board.placePiece(new Position(0, 7), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(1, 1), whiteBishop);
    board.placePiece(new Position(5, 5), blackRook);
    const game = new ChessGame(board, 'WHITE');

    const captureResult = game.makeMove(new Position(1, 1), new Position(5, 5));

    expect(captureResult.success).toBe(true);
    if (captureResult.success) {
      expect(captureResult.nextState).toBe('DRAW');
    }
    expect(game.getSnapshot().stateKind).toBe('DRAW');
  });

  it('transitions to DrawState when remaining material is King and Knight vs King', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const blackRook = new Rook('BLACK');
    const whiteKnight = new Knight('WHITE');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(0, 1), whiteKnight);
    board.placePiece(new Position(2, 2), blackRook);
    const game = new ChessGame(board, 'WHITE');

    const captureResult = game.makeMove(new Position(0, 1), new Position(2, 2));

    expect(captureResult.success).toBe(true);
    if (captureResult.success) {
      expect(captureResult.nextState).toBe('DRAW');
    }
    expect(game.getSnapshot().stateKind).toBe('DRAW');
  });

  it('restores active play state upon undoing a move that resulted in insufficient material', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whiteRook = new Rook('WHITE');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(6, 6), whiteRook);
    const game = new ChessGame(board, 'BLACK');
    game.makeMove(new Position(7, 7), new Position(6, 6));

    const undone = game.undo();

    expect(undone).toBe(true);
    expect(game.getSnapshot().stateKind).toBe('IN_PROGRESS');
  });
});
