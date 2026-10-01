import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { ChessGame } from '../../src/core/game/ChessGame';
import { Bishop } from '../../src/core/pieces/Bishop';
import { Chancellor } from '../../src/core/pieces/Chancellor';
import { King } from '../../src/core/pieces/King';
import { Pawn } from '../../src/core/pieces/Pawn';
import { Queen } from '../../src/core/pieces/Queen';
import { Rook } from '../../src/core/pieces/Rook';
import { IGameObserver } from '../../src/core/ports/IGameObserver';
import { GreedyMaterialAiStrategy } from '../../src/core/strategy/GreedyMaterialAiStrategy';
import { IAiStrategy } from '../../src/core/strategy/IAiStrategy';

describe('GreedyMaterialAiStrategy', () => {
  it('prioritizes capturing enemy queen over capturing enemy pawn', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whiteRook = new Rook('WHITE');
    const blackQueen = new Queen('BLACK');
    const blackPawn = new Pawn('BLACK');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(4, 4), whiteRook);
    board.placePiece(new Position(4, 7), blackQueen);
    board.placePiece(new Position(4, 1), blackPawn);
    const game = new ChessGame(board, 'WHITE');
    const strategy: IAiStrategy = new GreedyMaterialAiStrategy();

    const chosenMove = strategy.chooseMove(game);

    expect(chosenMove).not.toBeNull();
    expect(chosenMove?.from.equals(new Position(4, 4))).toBe(true);
    expect(chosenMove?.to.equals(new Position(4, 7))).toBe(true);
  });

  it('prioritizes checkmating move over capturing high-value piece', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const whiteBishop = new Bishop('WHITE');
    const whiteQueen = new Queen('WHITE');

    const blackKing = new King('BLACK');
    const blackQueen = new Queen('BLACK');
    const blackRook = new Rook('BLACK');
    const blackBishop = new Bishop('BLACK');
    const blackPawnD = new Pawn('BLACK');
    const blackPawnE = new Pawn('BLACK');

    board.placePiece(new Position(0, 1), whiteKing);
    board.placePiece(new Position(3, 2), whiteBishop);
    board.placePiece(new Position(4, 7), whiteQueen);

    board.placePiece(new Position(7, 4), blackKing);
    board.placePiece(new Position(4, 4), blackQueen);
    board.placePiece(new Position(7, 3), blackRook);
    board.placePiece(new Position(7, 5), blackBishop);
    board.placePiece(new Position(6, 3), blackPawnD);
    board.placePiece(new Position(6, 4), blackPawnE);

    const game = new ChessGame(board, 'WHITE');
    const strategy = new GreedyMaterialAiStrategy();

    const chosenMove = strategy.chooseMove(game);

    expect(chosenMove).toEqual({ from: new Position(3, 2), to: new Position(6, 5) });
    const mateResult = game.makeMove(chosenMove!.from, chosenMove!.to);
    expect(mateResult.success).toBe(true);
    if (!mateResult.success) {
      throw new Error('Expected move to succeed');
    }
    expect(mateResult.nextState).toBe('CHECKMATE');
  });

  it('evaluates capturing fairy chess piece using default fallback score', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const whiteRook = new Rook('WHITE');
    const blackBishop = new Bishop('BLACK');
    const blackChancellor = new Chancellor('BLACK');
    board.placePiece(new Position(0, 0), whiteKing);
    board.placePiece(new Position(7, 7), blackKing);
    board.placePiece(new Position(4, 4), whiteRook);
    board.placePiece(new Position(4, 1), blackBishop);
    board.placePiece(new Position(4, 7), blackChancellor);
    const game = new ChessGame(board, 'WHITE');
    const strategy = new GreedyMaterialAiStrategy();

    const chosenMove = strategy.chooseMove(game);

    expect(chosenMove).not.toBeNull();
    expect(chosenMove?.to.equals(new Position(4, 1))).toBe(true);
  });

  it('leaves engine observers and redo history untouched during evaluation', () => {
    const game = new ChessGame();
    game.makeMove(new Position(1, 4), new Position(3, 4));
    game.undo();
    let notificationCount = 0;
    const testObserver: IGameObserver = {
      onGameStateChanged: () => {
        notificationCount += 1;
      },
    };
    game.subscribe(testObserver);
    const strategy = new GreedyMaterialAiStrategy();

    const chosenMove = strategy.chooseMove(game);

    expect(chosenMove).not.toBeNull();
    expect(notificationCount).toBe(0);
    expect(game.getSnapshot().canRedo).toBe(true);
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
    const strategy = new GreedyMaterialAiStrategy();

    const move = strategy.chooseMove(game);

    expect(move).toBeNull();
  });
});
