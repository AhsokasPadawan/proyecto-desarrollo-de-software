import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { King } from '../../src/core/pieces/King';
import { Piece } from '../../src/core/pieces/Piece';
import { Color } from '../../src/core/pieces/types';
import { CheckDetector } from '../../src/core/rules/CheckDetector';
import { IMovementRule } from '../../src/core/rules/IMovementRule';
import { IPiece } from '../../src/core/pieces/IPiece';
import { IBoardQuery } from '../../src/core/ports/IBoardQuery';

class RayMovementRule implements IMovementRule {
  constructor(private readonly direction: [number, number]) {}

  getPseudoLegalMoves(from: Position, piece: IPiece, board: IBoardQuery): Position[] {
    const moves: Position[] = [];
    let current = from.offset(this.direction[0], this.direction[1]);

    while (board.isWithinBounds(current)) {
      const obstacle = board.getPieceAt(current);
      if (obstacle) {
        if (obstacle.color !== piece.color) {
          moves.push(current);
        }
        break;
      }

      moves.push(current);
      current = current.offset(this.direction[0], this.direction[1]);
    }

    return moves;
  }
}

class LinearAttacker extends Piece {
  constructor(color: Color, direction: [number, number]) {
    super(color, 'ROOK', [new RayMovementRule(direction)]);
  }
}

describe('CheckDetector', () => {
  it('detects when a target square is attacked by an opposing piece', () => {
    const detector = new CheckDetector();
    const board = new Board(8, 8);
    const target = new Position(4, 4);
    const blackAttacker = new LinearAttacker('BLACK', [1, 0]);
    board.placePiece(new Position(2, 4), blackAttacker);

    const isAttacked = detector.isSquareAttacked(board, target, 'BLACK');

    expect(isAttacked).toBe(true);
  });

  it('reports false when the attacking path is blocked by an intervening piece', () => {
    const detector = new CheckDetector();
    const board = new Board(8, 8);
    const target = new Position(5, 4);
    const blackAttacker = new LinearAttacker('BLACK', [1, 0]);
    const blocker = new LinearAttacker('WHITE', [0, 1]);
    board.placePiece(new Position(2, 4), blackAttacker);
    board.placePiece(new Position(3, 4), blocker);

    const isAttacked = detector.isSquareAttacked(board, target, 'BLACK');

    expect(isAttacked).toBe(false);
  });

  it('reports false when requested color does not attack the square', () => {
    const detector = new CheckDetector();
    const board = new Board(8, 8);
    const target = new Position(4, 4);
    const whitePiece = new LinearAttacker('WHITE', [1, 0]);
    board.placePiece(new Position(2, 4), whitePiece);

    const isAttackedByBlack = detector.isSquareAttacked(board, target, 'BLACK');

    expect(isAttackedByBlack).toBe(false);
  });

  it('reports true when attacking color has piece targeting the square', () => {
    const detector = new CheckDetector();
    const board = new Board(8, 8);
    const target = new Position(4, 4);
    const whitePiece = new LinearAttacker('WHITE', [1, 0]);
    board.placePiece(new Position(2, 4), whitePiece);

    const isAttackedByWhite = detector.isSquareAttacked(board, target, 'WHITE');

    expect(isAttackedByWhite).toBe(true);
  });

  it('identifies that the king is directly in check', () => {
    const detector = new CheckDetector();
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackAttacker = new LinearAttacker('BLACK', [0, -1]);
    board.placePiece(new Position(4, 1), whiteKing);
    board.placePiece(new Position(4, 6), blackAttacker);

    const inCheck = detector.isKingInCheck(board, 'WHITE');

    expect(inCheck).toBe(true);
  });

  it('identifies that the king is safe when not in direct line of attack', () => {
    const detector = new CheckDetector();
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackAttacker = new LinearAttacker('BLACK', [1, 0]);
    board.placePiece(new Position(4, 1), whiteKing);
    board.placePiece(new Position(2, 6), blackAttacker);

    const inCheck = detector.isKingInCheck(board, 'WHITE');

    expect(inCheck).toBe(false);
  });

  it('safely returns false when the king of that color is not on the board', () => {
    const detector = new CheckDetector();
    const board = new Board(8, 8);

    const inCheck = detector.isKingInCheck(board, 'WHITE');

    expect(inCheck).toBe(false);
  });

  it('detects check on black king when white attacks', () => {
    const detector = new CheckDetector();
    const board = new Board(8, 8);
    const blackKing = new King('BLACK');
    const whiteAttacker = new LinearAttacker('WHITE', [1, 0]);
    board.placePiece(new Position(7, 4), blackKing);
    board.placePiece(new Position(2, 4), whiteAttacker);

    const inCheck = detector.isKingInCheck(board, 'BLACK');

    expect(inCheck).toBe(true);
  });
});
