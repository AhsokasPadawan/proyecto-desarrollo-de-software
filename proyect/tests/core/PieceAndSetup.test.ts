import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { BoardSetupFactory, PieceConstructor } from '../../src/core/board/BoardSetupFactory';
import { Position } from '../../src/core/board/Position';
import { Bishop } from '../../src/core/pieces/Bishop';
import { King } from '../../src/core/pieces/King';
import { Knight } from '../../src/core/pieces/Knight';
import { Pawn } from '../../src/core/pieces/Pawn';
import { Piece } from '../../src/core/pieces/Piece';
import { Queen } from '../../src/core/pieces/Queen';
import { Rook } from '../../src/core/pieces/Rook';
import { IMovementRule } from '../../src/core/rules/IMovementRule';
import { IPiece } from '../../src/core/pieces/IPiece';
import { IBoardQuery } from '../../src/core/ports/IBoardQuery';

class FixedOffsetRule implements IMovementRule {
  constructor(private readonly offsets: readonly [number, number][]) {}

  getPseudoLegalMoves(from: Position, _piece: IPiece, board: IBoardQuery): Position[] {
    return this.offsets
      .map(([dRow, dCol]) => from.offset(dRow, dCol))
      .filter((target) => board.isWithinBounds(target));
  }
}

class TestHybridPiece extends Piece {
  constructor(color: 'WHITE' | 'BLACK', rules: readonly IMovementRule[]) {
    super(color, 'QUEEN', rules);
  }
}

describe('Piece & BoardSetupFactory', () => {
  it('combines and deduplicates positions across multiple composed movement rules', () => {
    const board = new Board(8, 8);
    const origin = new Position(3, 3);
    const ruleA = new FixedOffsetRule([[1, 0], [0, 1]]);
    const ruleB = new FixedOffsetRule([[0, 1], [-1, 0]]);
    const piece = new TestHybridPiece('WHITE', [ruleA, ruleB]);

    const moves = piece.getPseudoLegalMoves(origin, board);

    expect(moves).toHaveLength(3);
    expect(moves.some((pos) => pos.equals(new Position(4, 3)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(3, 4)))).toBe(true);
    expect(moves.some((pos) => pos.equals(new Position(2, 3)))).toBe(true);
  });

  it('populates standard 8x8 board with 32 pieces in correct positions using defaults', () => {
    const board = BoardSetupFactory.createStandardBoard();

    expect(board.rows).toBe(8);
    expect(board.cols).toBe(8);

    const whitePieces = board.getPiecesByColor('WHITE');
    const blackPieces = board.getPiecesByColor('BLACK');
    expect(whitePieces).toHaveLength(16);
    expect(blackPieces).toHaveLength(16);

    expect(board.getPieceAt(new Position(0, 0))).toBeInstanceOf(Rook);
    expect(board.getPieceAt(new Position(0, 1))).toBeInstanceOf(Knight);
    expect(board.getPieceAt(new Position(0, 2))).toBeInstanceOf(Bishop);
    expect(board.getPieceAt(new Position(0, 3))).toBeInstanceOf(Queen);
    expect(board.getPieceAt(new Position(0, 4))).toBeInstanceOf(King);
    expect(board.getPieceAt(new Position(0, 5))).toBeInstanceOf(Bishop);
    expect(board.getPieceAt(new Position(0, 6))).toBeInstanceOf(Knight);
    expect(board.getPieceAt(new Position(0, 7))).toBeInstanceOf(Rook);

    for (let col = 0; col < 8; col++) {
      const whitePawn = board.getPieceAt(new Position(1, col));
      expect(whitePawn).toBeInstanceOf(Pawn);
      expect(whitePawn?.color).toBe('WHITE');

      const blackPawn = board.getPieceAt(new Position(6, col));
      expect(blackPawn).toBeInstanceOf(Pawn);
      expect(blackPawn?.color).toBe('BLACK');
    }

    expect(board.getPieceAt(new Position(7, 0))).toBeInstanceOf(Rook);
    expect(board.getPieceAt(new Position(7, 1))).toBeInstanceOf(Knight);
    expect(board.getPieceAt(new Position(7, 2))).toBeInstanceOf(Bishop);
    expect(board.getPieceAt(new Position(7, 3))).toBeInstanceOf(Queen);
    expect(board.getPieceAt(new Position(7, 4))).toBeInstanceOf(King);
    expect(board.getPieceAt(new Position(7, 5))).toBeInstanceOf(Bishop);
    expect(board.getPieceAt(new Position(7, 6))).toBeInstanceOf(Knight);
    expect(board.getPieceAt(new Position(7, 7))).toBeInstanceOf(Rook);

    for (let row = 2; row <= 5; row++) {
      for (let col = 0; col < 8; col++) {
        expect(board.isEmpty(new Position(row, col))).toBe(true);
      }
    }

    const whiteKingPos = board.findKingPosition('WHITE');
    const blackKingPos = board.findKingPosition('BLACK');
    expect(whiteKingPos?.equals(new Position(0, 4))).toBe(true);
    expect(blackKingPos?.equals(new Position(7, 4))).toBe(true);
  });

  it('populates board with custom row dimensions placing black pieces at dynamic offsets', () => {
    const board = BoardSetupFactory.createStandardBoard(10, 8);

    expect(board.rows).toBe(10);
    expect(board.cols).toBe(8);

    expect(board.getPieceAt(new Position(0, 4))).toBeInstanceOf(King);
    expect(board.getPieceAt(new Position(1, 4))).toBeInstanceOf(Pawn);

    expect(board.getPieceAt(new Position(8, 4))).toBeInstanceOf(Pawn);
    expect(board.getPieceAt(new Position(9, 4))).toBeInstanceOf(King);

    for (let row = 2; row <= 7; row++) {
      expect(board.isEmpty(new Position(row, 4))).toBe(true);
    }
  });

  it('populates board with custom column dimensions and custom back rank pieces', () => {
    const customBackRank: readonly PieceConstructor[] = [Rook, Knight, Queen, King, Knight, Rook];
    const board = BoardSetupFactory.createStandardBoard(6, 6, customBackRank);

    expect(board.rows).toBe(6);
    expect(board.cols).toBe(6);

    expect(board.getPieceAt(new Position(0, 2))).toBeInstanceOf(Queen);
    expect(board.getPieceAt(new Position(0, 3))).toBeInstanceOf(King);
    expect(board.getPieceAt(new Position(1, 0))).toBeInstanceOf(Pawn);

    expect(board.getPieceAt(new Position(4, 0))).toBeInstanceOf(Pawn);
    expect(board.getPieceAt(new Position(5, 2))).toBeInstanceOf(Queen);
    expect(board.getPieceAt(new Position(5, 3))).toBeInstanceOf(King);
  });

  it('rejects boards with fewer than 4 rows', () => {
    const shallowBoard = new Board(3, 8);

    expect(() => BoardSetupFactory.populateStandardBoard(shallowBoard)).toThrow();
  });

  it('rejects boards where column count does not match back rank pieces length', () => {
    const mismatchedBoard = new Board(8, 10);

    expect(() => BoardSetupFactory.populateStandardBoard(mismatchedBoard)).toThrow();
  });
});
