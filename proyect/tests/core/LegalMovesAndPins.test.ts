import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { ChessGame } from '../../src/core/game/ChessGame';
import { Bishop } from '../../src/core/pieces/Bishop';
import { King } from '../../src/core/pieces/King';
import { Knight } from '../../src/core/pieces/Knight';
import { Queen } from '../../src/core/pieces/Queen';
import { Rook } from '../../src/core/pieces/Rook';

describe('Legal Moves, Pinned Pieces & Check Evasion', () => {
  it('prevents an absolutely pinned piece from moving outside the pin ray', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const whiteBishop = new Bishop('WHITE');
    const blackRook = new Rook('BLACK');
    const kingPos = new Position(0, 4);
    const bishopPos = new Position(0, 2);
    const attackerPos = new Position(0, 0);
    board.placePiece(kingPos, whiteKing);
    board.placePiece(bishopPos, whiteBishop);
    board.placePiece(attackerPos, blackRook);
    const game = new ChessGame(board, 'WHITE');

    const legalMoves = game.getLegalMoves(bishopPos);

    expect(legalMoves).toHaveLength(0);
  });

  it('allows an absolutely pinned rook to move along the pinning ray', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const whiteRook = new Rook('WHITE');
    const blackQueen = new Queen('BLACK');
    const kingPos = new Position(0, 4);
    const rookPos = new Position(2, 4);
    const attackerPos = new Position(6, 4);
    board.placePiece(kingPos, whiteKing);
    board.placePiece(rookPos, whiteRook);
    board.placePiece(attackerPos, blackQueen);
    const game = new ChessGame(board, 'WHITE');

    const legalMoves = game.getLegalMoves(rookPos);

    expect(legalMoves.some((pos) => pos.equals(new Position(1, 4)))).toBe(true);
    expect(legalMoves.some((pos) => pos.equals(new Position(3, 4)))).toBe(true);
    expect(legalMoves.some((pos) => pos.equals(new Position(6, 4)))).toBe(true);
    expect(legalMoves.some((pos) => pos.equals(new Position(2, 5)))).toBe(false);
  });

  it('rejects move leaving own king in check with KING_LEFT_IN_CHECK reason', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const whiteKnight = new Knight('WHITE');
    const blackRook = new Rook('BLACK');
    const kingPos = new Position(0, 4);
    const knightPos = new Position(0, 2);
    const attackerPos = new Position(0, 0);
    board.placePiece(kingPos, whiteKing);
    board.placePiece(knightPos, whiteKnight);
    board.placePiece(attackerPos, blackRook);
    const game = new ChessGame(board, 'WHITE');

    const result = game.makeMove(knightPos, new Position(2, 3));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('KING_LEFT_IN_CHECK');
    }
    expect(board.getPieceAt(knightPos)).toBe(whiteKnight);
  });

  it('prevents king from stepping onto an attacked square', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackRook = new Rook('BLACK');
    const kingPos = new Position(4, 4);
    const rookPos = new Position(7, 5);
    board.placePiece(kingPos, whiteKing);
    board.placePiece(rookPos, blackRook);
    const game = new ChessGame(board, 'WHITE');

    const legalMoves = game.getLegalMoves(kingPos);

    expect(legalMoves.some((pos) => pos.equals(new Position(4, 5)))).toBe(false);
    expect(legalMoves.some((pos) => pos.equals(new Position(3, 5)))).toBe(false);
    expect(legalMoves.some((pos) => pos.equals(new Position(5, 5)))).toBe(false);
  });

  it('allows king to step out of direct check to an unattacked square', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackRook = new Rook('BLACK');
    const kingPos = new Position(0, 4);
    const rookPos = new Position(0, 0);
    board.placePiece(kingPos, whiteKing);
    board.placePiece(rookPos, blackRook);
    const game = new ChessGame(board, 'WHITE');

    const legalMoves = game.getLegalMoves(kingPos);

    expect(legalMoves.some((pos) => pos.equals(new Position(1, 4)))).toBe(true);
    expect(legalMoves.some((pos) => pos.equals(new Position(1, 3)))).toBe(true);
    expect(legalMoves.some((pos) => pos.equals(new Position(1, 5)))).toBe(true);
  });

  it('allows friendly piece to block check ray between attacker and king', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const whiteBishop = new Bishop('WHITE');
    const blackRook = new Rook('BLACK');
    const kingPos = new Position(0, 4);
    const bishopPos = new Position(2, 1);
    const attackerPos = new Position(0, 0);
    board.placePiece(kingPos, whiteKing);
    board.placePiece(bishopPos, whiteBishop);
    board.placePiece(attackerPos, blackRook);
    const game = new ChessGame(board, 'WHITE');

    const bishopMoves = game.getLegalMoves(bishopPos);

    expect(bishopMoves.some((pos) => pos.equals(new Position(0, 3)))).toBe(true);
    expect(bishopMoves.some((pos) => pos.equals(new Position(3, 0)))).toBe(false);
  });

  it('allows friendly piece to capture checking attacker to resolve check', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const whiteKnight = new Knight('WHITE');
    const blackQueen = new Queen('BLACK');
    const kingPos = new Position(0, 4);
    const knightPos = new Position(2, 2);
    const attackerPos = new Position(0, 3);
    board.placePiece(kingPos, whiteKing);
    board.placePiece(knightPos, whiteKnight);
    board.placePiece(attackerPos, blackQueen);
    const game = new ChessGame(board, 'WHITE');

    const knightMoves = game.getLegalMoves(knightPos);

    expect(knightMoves).toHaveLength(1);
    expect(knightMoves[0].equals(attackerPos)).toBe(true);
  });
});
