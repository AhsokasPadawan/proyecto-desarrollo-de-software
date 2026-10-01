import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Position } from '../../src/core/board/Position';
import { GameSnapshot } from '../../src/core/ports/GameSnapshot';
import { ChessBoardView, getFileLabel, getRankLabel } from '../../src/adapters/web/ChessBoardView';
import { getStateBadgeClass, getStateLabel } from '../../src/adapters/web/stateDisplayLookup';
import { ChessGame } from '../../src/core/game/ChessGame';
import { Board } from '../../src/core/board/Board';
import { Chancellor } from '../../src/core/pieces/Chancellor';
import { King } from '../../src/core/pieces/King';
import { Pawn } from '../../src/core/pieces/Pawn';

describe('Web Adapter - ChessBoardView', () => {
  it('renders standard 8x8 chessboard with 64 interactive square buttons', () => {
    const game = new ChessGame();
    const snapshot = game.getSnapshot();

    render(
      <ChessBoardView
        snapshot={snapshot}
        selectedPosition={null}
        legalMoves={[]}
        onSquareClick={() => {}}
      />
    );

    const squares = screen.getAllByRole('button');
    expect(squares).toHaveLength(64);
  });

  it('renders standard piece glyphs on initial placement squares', () => {
    const game = new ChessGame();
    const snapshot = game.getSnapshot();

    render(
      <ChessBoardView
        snapshot={snapshot}
        selectedPosition={null}
        legalMoves={[]}
        onSquareClick={() => {}}
      />
    );

    expect(screen.getByTestId('piece-white-king')).toBeInTheDocument();
    expect(screen.getByTestId('piece-black-king')).toBeInTheDocument();
    expect(screen.getAllByTestId('piece-white-pawn')).toHaveLength(8);
    expect(screen.getAllByTestId('piece-black-pawn')).toHaveLength(8);
  });

  it('renders dynamic 10x10 board with 100 squares without breaking layout', () => {
    const emptyRow = Array.from({ length: 10 }, () => null);
    const grid10x10 = Array.from({ length: 10 }, () => [...emptyRow]);
    const customSnapshot: GameSnapshot = {
      rows: 10,
      cols: 10,
      grid: grid10x10,
      currentTurn: 'WHITE',
      stateKind: 'IN_PROGRESS',
      winner: null,
      canUndo: false,
      canRedo: false,
    };

    render(
      <ChessBoardView
        snapshot={customSnapshot}
        selectedPosition={null}
        legalMoves={[]}
        onSquareClick={() => {}}
      />
    );

    const squares = screen.getAllByRole('button');
    expect(squares).toHaveLength(100);
    expect(screen.getByTestId('chess-grid')).toHaveStyle({
      gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
    });
  });

  it('renders automatic fallback badge with initials for custom fairy chess piece', () => {
    const board = new Board(8, 8);
    const whiteKing = new King('WHITE');
    const blackKing = new King('BLACK');
    const blackChancellor = new Chancellor('BLACK');
    board.placePiece(new Position(0, 4), whiteKing);
    board.placePiece(new Position(7, 4), blackKing);
    board.placePiece(new Position(4, 4), blackChancellor);
    const game = new ChessGame(board, 'WHITE');
    const snapshot = game.getSnapshot();

    render(
      <ChessBoardView
        snapshot={snapshot}
        selectedPosition={null}
        legalMoves={[]}
        onSquareClick={() => {}}
      />
    );

    const fallbackBadge = screen.getByTestId('piece-fallback-black-chancellor');
    expect(fallbackBadge).toBeInTheDocument();
    expect(fallbackBadge).toHaveTextContent('CH');
  });

  it('maps column indices to algebraic file letters', () => {
    const fileA = getFileLabel(0);
    const fileH = getFileLabel(7);
    const fileJ = getFileLabel(9);

    expect(fileA).toBe('a');
    expect(fileH).toBe('h');
    expect(fileJ).toBe('j');
  });

  it('maps row indices to algebraic rank numbers', () => {
    const rank1 = getRankLabel(0);
    const rank8 = getRankLabel(7);
    const rank10 = getRankLabel(9);

    expect(rank1).toBe('1');
    expect(rank8).toBe('8');
    expect(rank10).toBe('10');
  });

  it('renders selection ring and legal move target indicators', () => {
    const game = new ChessGame();
    const snapshot = game.getSnapshot();
    const selectedPosition = new Position(1, 4);
    const legalMoves = [new Position(2, 4), new Position(3, 4)];

    render(
      <ChessBoardView
        snapshot={snapshot}
        selectedPosition={selectedPosition}
        legalMoves={legalMoves}
        onSquareClick={() => {}}
      />
    );

    const selectedSquare = screen.getByTestId('square-1-4');
    expect(selectedSquare.className).toContain('ring-amber-400');
    expect(screen.getByTestId('legal-target-empty-2-4')).toBeInTheDocument();
    expect(screen.getByTestId('legal-target-empty-3-4')).toBeInTheDocument();
  });

  it('highlights en passant capture target square as capture even when empty', () => {
    const board = new Board(8, 8);
    const whitePawn = new Pawn('WHITE');
    const blackPawn = new Pawn('BLACK');
    board.placePiece(new Position(4, 4), whitePawn);
    board.placePiece(new Position(4, 3), blackPawn);
    board.setEnPassantTarget(new Position(5, 3));
    const game = new ChessGame(board, 'WHITE');
    const snapshot = game.getSnapshot();
    const selectedPosition = new Position(4, 4);
    const legalMoves = [new Position(5, 4), new Position(5, 3)];

    render(
      <ChessBoardView
        snapshot={snapshot}
        selectedPosition={selectedPosition}
        legalMoves={legalMoves}
        onSquareClick={() => {}}
      />
    );

    expect(screen.getByTestId('legal-target-empty-5-4')).toBeInTheDocument();
    expect(screen.getByTestId('legal-target-capture-5-3')).toBeInTheDocument();
  });

  it('invokes onSquareClick callback with clicked position when square is clicked', () => {
    const handleSquareClick = vi.fn();
    const game = new ChessGame();
    const snapshot = game.getSnapshot();

    render(
      <ChessBoardView
        snapshot={snapshot}
        selectedPosition={null}
        legalMoves={[]}
        onSquareClick={handleSquareClick}
      />
    );

    const squareButton = screen.getByTestId('square-1-4');
    fireEvent.click(squareButton);

    expect(handleSquareClick).toHaveBeenCalledTimes(1);
    const receivedPosition = handleSquareClick.mock.calls[0][0] as Position;
    expect(receivedPosition.row).toBe(1);
    expect(receivedPosition.col).toBe(4);
  });

  it('maps game state kinds to Spanish display labels', () => {
    const inProgressLabel = getStateLabel('IN_PROGRESS');
    const checkLabel = getStateLabel('CHECK');
    const checkmateLabel = getStateLabel('CHECKMATE');
    const stalemateLabel = getStateLabel('STALEMATE');
    const drawLabel = getStateLabel('DRAW');

    expect(inProgressLabel).toBe('Partida en Curso');
    expect(checkLabel).toBe('¡Jaque al Rey!');
    expect(checkmateLabel).toBe('¡Jaque Mate! Partida Finalizada');
    expect(stalemateLabel).toBe('Tablas por Ahogado');
    expect(drawLabel).toBe('Tablas Declaradas');
  });

  it('maps game state kinds to badge CSS classes', () => {
    const inProgressClass = getStateBadgeClass('IN_PROGRESS');
    const checkClass = getStateBadgeClass('CHECK');
    const checkmateClass = getStateBadgeClass('CHECKMATE');

    expect(inProgressClass).toContain('bg-emerald-950');
    expect(checkClass).toContain('animate-pulse');
    expect(checkmateClass).toContain('bg-red-950');
  });
});
