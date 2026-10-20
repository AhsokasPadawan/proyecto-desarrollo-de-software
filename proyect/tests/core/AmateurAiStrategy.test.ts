import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { ChessGame } from '../../src/core/game/ChessGame';
import { Bishop } from '../../src/core/pieces/Bishop';
import { King } from '../../src/core/pieces/King';
import { Knight } from '../../src/core/pieces/Knight';
import { Pawn } from '../../src/core/pieces/Pawn';
import { Queen } from '../../src/core/pieces/Queen';
import { Rook } from '../../src/core/pieces/Rook';
import {
  AmateurAiStrategy,
  evaluateBoardPosition,
  createSimulationBoard,
} from '../../src/core/strategy/AmateurAiStrategy';
import { DEFAULT_AMATEUR_CONFIG } from '../../src/core/strategy/AmateurAiConfig';
import { CheckDetector } from '../../src/core/rules/CheckDetector';

describe('AmateurAiStrategy - Custom Criteria & Minimax Search', () => {
  const checkDetector = new CheckDetector();

  it('1. reflects standard piece values in position evaluation', () => {
    const board = new Board(8, 8);
    board.placePiece(new Position(0, 4), new King('WHITE'));
    board.placePiece(new Position(7, 4), new King('BLACK'));

    board.placePiece(new Position(1, 0), new Pawn('WHITE')); // +100
    board.placePiece(new Position(0, 1), new Knight('WHITE')); // +300
    board.placePiece(new Position(0, 2), new Bishop('WHITE')); // +300
    board.placePiece(new Position(0, 0), new Rook('WHITE')); // +500
    board.placePiece(new Position(0, 3), new Queen('WHITE')); // +900

    // White material: 2100 (plus king 20000 = 22100), Black material: King 20000.
    // Total material difference: +2100
    const score = evaluateBoardPosition(
      board,
      'WHITE',
      'BLACK',
      checkDetector,
      DEFAULT_AMATEUR_CONFIG,
      []
    );

    expect(score).toBeGreaterThanOrEqual(2100);
  });

  it('2. awards 25 points for occupying core central squares', () => {
    const boardCentral = new Board(8, 8);
    boardCentral.placePiece(new Position(0, 4), new King('WHITE'));
    boardCentral.placePiece(new Position(7, 4), new King('BLACK'));
    boardCentral.placePiece(new Position(3, 3), new Knight('WHITE')); // Core center (d4)

    const boardPeripheral = new Board(8, 8);
    boardPeripheral.placePiece(new Position(0, 4), new King('WHITE'));
    boardPeripheral.placePiece(new Position(7, 4), new King('BLACK'));
    boardPeripheral.placePiece(new Position(2, 0), new Knight('WHITE')); // Non-center, but developed

    // Use moveHistory length > 20 so opening development (+50) is not active and doesn't skew center calculation
    const dummyHistory = Array(25).fill({
      moveIndex: 0,
      turn: 'WHITE' as const,
      piece: 'PAWN' as const,
      from: 'a2',
      to: 'a3',
    });

    const scoreCentral = evaluateBoardPosition(
      boardCentral,
      'WHITE',
      'BLACK',
      checkDetector,
      DEFAULT_AMATEUR_CONFIG,
      dummyHistory
    );
    const scorePeripheral = evaluateBoardPosition(
      boardPeripheral,
      'WHITE',
      'BLACK',
      checkDetector,
      DEFAULT_AMATEUR_CONFIG,
      dummyHistory
    );

    // Central piece gets +25 points
    expect(scoreCentral - scorePeripheral).toBe(25);
  });

  it('3. rewards opening development (+50) and penalizes early queen move (-30)', () => {
    const boardDeveloped = new Board(8, 8);
    boardDeveloped.placePiece(new Position(0, 4), new King('WHITE'));
    boardDeveloped.placePiece(new Position(7, 4), new King('BLACK'));
    boardDeveloped.placePiece(new Position(2, 0), new Knight('WHITE')); // Moved to row 2 outside center (col 0)

    const boardUndeveloped = new Board(8, 8);
    boardUndeveloped.placePiece(new Position(0, 4), new King('WHITE'));
    boardUndeveloped.placePiece(new Position(7, 4), new King('BLACK'));
    boardUndeveloped.placePiece(new Position(0, 1), new Knight('WHITE')); // On row 0 (undeveloped)

    const scoreDev = evaluateBoardPosition(
      boardDeveloped,
      'WHITE',
      'BLACK',
      checkDetector,
      DEFAULT_AMATEUR_CONFIG,
      []
    );
    const scoreUndev = evaluateBoardPosition(
      boardUndeveloped,
      'WHITE',
      'BLACK',
      checkDetector,
      DEFAULT_AMATEUR_CONFIG,
      []
    );

    // Opening development awards +50 points
    expect(scoreDev - scoreUndev).toBe(50);

    // Early queen move without developing minors
    const boardEarlyQueen = new Board(8, 8);
    boardEarlyQueen.placePiece(new Position(0, 4), new King('WHITE'));
    boardEarlyQueen.placePiece(new Position(7, 4), new King('BLACK'));
    boardEarlyQueen.placePiece(new Position(3, 3), new Queen('WHITE')); // Queen moved out without 2 minor pieces developed

    const scoreEarlyQueen = evaluateBoardPosition(
      boardEarlyQueen,
      'WHITE',
      'BLACK',
      checkDetector,
      DEFAULT_AMATEUR_CONFIG,
      []
    );

    const boardQueenHome = new Board(8, 8);
    boardQueenHome.placePiece(new Position(0, 4), new King('WHITE'));
    boardQueenHome.placePiece(new Position(7, 4), new King('BLACK'));
    boardQueenHome.placePiece(new Position(0, 3), new Queen('WHITE')); // Queen still home

    const scoreQueenHome = evaluateBoardPosition(
      boardQueenHome,
      'WHITE',
      'BLACK',
      checkDetector,
      DEFAULT_AMATEUR_CONFIG,
      []
    );

    // Early queen gives -30 penalty (minus 25 center control if on 3,3)
    // scoreEarlyQueen has center control (+25) and early queen penalty (-30) = net -5 compared to material
    expect(scoreEarlyQueen - scoreQueenHome).toBe(25 - 30);
  });

  it('4. rewards castling (+60) and penalizes king moving without castling (-50)', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    board.placePiece(new Position(0, 4), whiteKing);
    board.placePiece(new Position(7, 4), new King('BLACK'));

    const castledHistory = [
      {
        moveIndex: 0,
        turn: 'WHITE' as const,
        piece: 'KING' as const,
        from: 'e1',
        to: 'g1',
        isCastling: true,
      },
    ];

    const scoreCastled = evaluateBoardPosition(
      board,
      'WHITE',
      'BLACK',
      checkDetector,
      DEFAULT_AMATEUR_CONFIG,
      castledHistory
    );

    whiteKing.setHasMoved?.(true);
    const scoreMovedKing = evaluateBoardPosition(
      board,
      'WHITE',
      'BLACK',
      checkDetector,
      DEFAULT_AMATEUR_CONFIG,
      []
    );

    expect(scoreCastled).toBeGreaterThan(scoreMovedKing);
    // Difference is +60 (castled) - (-50 moved king) = 110
    expect(scoreCastled - scoreMovedKing).toBe(110);
  });

  it('5. awards 10 points bonus when leaving opponent in check', () => {
    const boardCheck = new Board(8, 8);
    boardCheck.placePiece(new Position(0, 4), new King('WHITE'));
    boardCheck.placePiece(new Position(7, 4), new King('BLACK'));
    boardCheck.placePiece(new Position(7, 0), new Rook('WHITE')); // Rook checks black king on row 7

    const boardNoCheck = new Board(8, 8);
    boardNoCheck.placePiece(new Position(0, 4), new King('WHITE'));
    boardNoCheck.placePiece(new Position(7, 4), new King('BLACK'));
    boardNoCheck.placePiece(new Position(6, 0), new Rook('WHITE')); // Rook on row 6, no check

    const scoreCheck = evaluateBoardPosition(
      boardCheck,
      'WHITE',
      'BLACK',
      checkDetector,
      DEFAULT_AMATEUR_CONFIG,
      []
    );
    const scoreNoCheck = evaluateBoardPosition(
      boardNoCheck,
      'WHITE',
      'BLACK',
      checkDetector,
      DEFAULT_AMATEUR_CONFIG,
      []
    );

    expect(scoreCheck - scoreNoCheck).toBe(10);
  });

  it('6. avoids bait and tactical blunders through Minimax lookahead', () => {
    // Setup a classic trap:
    // White Queen at (3, 3) can capture a Black Pawn at (4, 4), but that pawn is protected by Black Bishop at (6, 2).
    // Greedy AI would eat the pawn (+100) and lose the queen (-900).
    // Amateur AI with Minimax depth 3 will see the recapture and choose not to blunder the Queen!
    const board = new Board(8, 8);
    board.placePiece(new Position(0, 4), new King('WHITE'));
    board.placePiece(new Position(7, 4), new King('BLACK'));
    board.placePiece(new Position(3, 3), new Queen('WHITE'));
    board.placePiece(new Position(4, 4), new Pawn('BLACK'));
    board.placePiece(new Position(6, 2), new Bishop('BLACK')); // Defends (4, 4)

    const game = new ChessGame(board, 'WHITE');
    // Deterministic RNG (no blunders for this test)
    const strategy = new AmateurAiStrategy({ blunderRate: 0 }, () => 0.5);
    const move = strategy.chooseMove(game);

    expect(move).not.toBeNull();
    // It should NOT capture the bait at (4, 4)
    expect(move?.to.equals(new Position(4, 4))).toBe(false);
  });

  it('7. selects among moves within 20 points tolerance and executes blunder when triggered', () => {
    const board = new Board(8, 8);
    board.placePiece(new Position(0, 4), new King('WHITE'));
    board.placePiece(new Position(7, 4), new King('BLACK'));
    board.placePiece(new Position(1, 0), new Pawn('WHITE'));
    board.placePiece(new Position(1, 1), new Pawn('WHITE'));

    const game = new ChessGame(board, 'WHITE');

    // With 0 blunder rate, it chooses from top candidates
    const strategyClean = new AmateurAiStrategy({ blunderRate: 0, candidateScoreTolerance: 20 }, () => 0.1);
    const moveClean = strategyClean.chooseMove(game);
    expect(moveClean).not.toBeNull();

    // With 1.0 blunder rate, it triggers blunder path
    const strategyBlunder = new AmateurAiStrategy({ blunderRate: 1.0 }, () => 0.0);
    const moveBlunder = strategyBlunder.chooseMove(game);
    expect(moveBlunder).not.toBeNull();
  });

  it('8. penalizes doubled pawns with -20 points per extra pawn', () => {
    const boardDoubled = new Board(8, 8);
    boardDoubled.placePiece(new Position(0, 4), new King('WHITE'));
    boardDoubled.placePiece(new Position(7, 4), new King('BLACK'));
    boardDoubled.placePiece(new Position(1, 0), new Pawn('WHITE'));
    boardDoubled.placePiece(new Position(2, 0), new Pawn('WHITE')); // 2 pawns on col 0 (doubled, outside center!)

    const boardSeparated = new Board(8, 8);
    boardSeparated.placePiece(new Position(0, 4), new King('WHITE'));
    boardSeparated.placePiece(new Position(7, 4), new King('BLACK'));
    boardSeparated.placePiece(new Position(1, 0), new Pawn('WHITE'));
    boardSeparated.placePiece(new Position(1, 1), new Pawn('WHITE')); // Different cols (col 0 and col 1, outside center)

    const scoreDoubled = evaluateBoardPosition(
      boardDoubled,
      'WHITE',
      'BLACK',
      checkDetector,
      DEFAULT_AMATEUR_CONFIG,
      []
    );
    const scoreSeparated = evaluateBoardPosition(
      boardSeparated,
      'WHITE',
      'BLACK',
      checkDetector,
      DEFAULT_AMATEUR_CONFIG,
      []
    );

    // Doubled pawns receives -20 penalty
    expect(scoreDoubled - scoreSeparated).toBe(-20);
  });

  it('9. awards 15 points bonus for en passant capture', () => {
    const board = new Board(8, 8);
    board.placePiece(new Position(0, 4), new King('WHITE'));
    board.placePiece(new Position(7, 4), new King('BLACK'));
    const whitePawn = new Pawn('WHITE');
    board.placePiece(new Position(4, 4), whitePawn); // e5

    // Black just played d7-d5
    const game = new ChessGame(board, 'WHITE');
    // Reconstruct board with en passant target at (5, 3) (d6)
    const snapshot = {
      ...game.getSnapshot(),
      grid: [
        ...game.getSnapshot().grid.slice(0, 4),
        [
          null,
          null,
          null,
          { type: 'PAWN' as const, color: 'BLACK' as const },
          { type: 'PAWN' as const, color: 'WHITE' as const },
          null,
          null,
          null,
        ],
        ...game.getSnapshot().grid.slice(5),
      ],
      moveHistory: [
        {
          moveIndex: 0,
          turn: 'BLACK' as const,
          piece: 'PAWN' as const,
          from: 'd7',
          to: 'd5',
        },
      ],
    };

    const simBoard = createSimulationBoard(snapshot);
    expect(simBoard.getEnPassantTarget()).toEqual(new Position(5, 3));
  });

  it('10. penalizes retreating immediately after an offensive advance with -25 points', () => {
    const board = new Board(8, 8);
    board.placePiece(new Position(0, 4), new King('WHITE'));
    board.placePiece(new Position(7, 4), new King('BLACK'));
    board.placePiece(new Position(3, 4), new Knight('WHITE')); // Knight at e4
    board.placePiece(new Position(1, 0), new Pawn('WHITE'));

    const game = new ChessGame(board, 'WHITE');
    // Previous move by White was Knight from e2 (1, 4) to e4 (3, 4) (offensive advance forward)
    const mockSnapshot = {
      ...game.getSnapshot(),
      moveHistory: [
        {
          moveIndex: 0,
          turn: 'WHITE' as const,
          piece: 'KNIGHT' as const,
          from: 'e2',
          to: 'e4',
        },
        {
          moveIndex: 1,
          turn: 'BLACK' as const,
          piece: 'PAWN' as const,
          from: 'a7',
          to: 'a6',
        },
      ],
    };

    const mockEngine = {
      getSnapshot: () => mockSnapshot,
      getLegalMoves: (pos: Position) => game.getLegalMoves(pos),
      makeMove: game.makeMove.bind(game),
    };

    const strategy = new AmateurAiStrategy({ blunderRate: 0 }, () => 0.0);
    const chosenMove = strategy.chooseMove(mockEngine as any);

    // It should NOT retreat back to e2 (1, 4) immediately
    expect(chosenMove?.to.equals(new Position(1, 4))).toBe(false);
  });
});
