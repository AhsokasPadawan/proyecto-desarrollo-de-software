import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ChessApp } from '../../src/adapters/web/ChessApp';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { King } from '../../src/core/pieces/King';
import { Pawn } from '../../src/core/pieces/Pawn';
import { ChessGame } from '../../src/core/game/ChessGame';

describe('Web Adapter - ChessApp Integration', () => {
  it('renders complete application layout with board and control panel', () => {
    render(<ChessApp />);

    expect(screen.getByText(/Chess TPO/)).toBeInTheDocument();
    expect(screen.getByTestId('chess-grid')).toBeInTheDocument();
    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('Blancas');
    expect(screen.getByTestId('game-state-banner')).toHaveTextContent('Partida en Curso');
  });

  it('selects friendly piece on first click and displays legal moves', () => {
    render(<ChessApp />);

    const pawnSquare = screen.getByTestId('square-1-4');
    fireEvent.click(pawnSquare);

    expect(pawnSquare.className).toContain('ring-amber-400');
    expect(screen.getByTestId('legal-target-empty-2-4')).toBeInTheDocument();
    expect(screen.getByTestId('legal-target-empty-3-4')).toBeInTheDocument();
  });

  it('executes legal move on second click and switches turn to black', () => {
    render(<ChessApp />);

    fireEvent.click(screen.getByTestId('square-1-4'));
    fireEvent.click(screen.getByTestId('square-3-4'));

    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('Negras');
    expect(screen.getByTestId('square-1-4').className).not.toContain('ring-amber-400');
    expect(screen.queryByTestId('legal-target-empty-2-4')).toBeNull();
  });

  it('switches selected piece when clicking another friendly piece', () => {
    render(<ChessApp />);

    const firstPawn = screen.getByTestId('square-1-4');
    const secondPawn = screen.getByTestId('square-1-3');

    fireEvent.click(firstPawn);
    expect(firstPawn.className).toContain('ring-amber-400');

    fireEvent.click(secondPawn);
    expect(secondPawn.className).toContain('ring-amber-400');
    expect(firstPawn.className).not.toContain('ring-amber-400');
  });

  it('clears selection when clicking the already selected square', () => {
    render(<ChessApp />);

    const pawnSquare = screen.getByTestId('square-1-4');

    fireEvent.click(pawnSquare);
    expect(pawnSquare.className).toContain('ring-amber-400');

    fireEvent.click(pawnSquare);
    expect(pawnSquare.className).not.toContain('ring-amber-400');
  });

  it('displays rejection feedback banner when an illegal target square is clicked', () => {
    render(<ChessApp />);

    fireEvent.click(screen.getByTestId('square-1-4'));
    fireEvent.click(screen.getByTestId('square-5-5'));

    const alertBanner = screen.getByTestId('rejection-feedback-banner');
    expect(alertBanner).toBeInTheDocument();
    expect(alertBanner).toHaveTextContent('El movimiento elegido no cumple las reglas de la pieza.');
  });

  it('clears rejection feedback banner upon subsequent square click', () => {
    render(<ChessApp />);

    fireEvent.click(screen.getByTestId('square-1-4'));
    fireEvent.click(screen.getByTestId('square-5-5'));
    expect(screen.getByTestId('rejection-feedback-banner')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('square-1-4'));
    expect(screen.queryByTestId('rejection-feedback-banner')).toBeNull();
  });

  it('executes undo and redo actions through control panel buttons', () => {
    render(<ChessApp />);

    fireEvent.click(screen.getByTestId('square-1-4'));
    fireEvent.click(screen.getByTestId('square-3-4'));
    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('Negras');

    const undoButton = screen.getByTestId('undo-button');
    expect(undoButton).toBeEnabled();
    fireEvent.click(undoButton);

    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('Blancas');

    const redoButton = screen.getByTestId('redo-button');
    expect(redoButton).toBeEnabled();
    fireEvent.click(redoButton);

    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('Negras');
  });

  it('resets game to initial board layout when reset button is clicked', () => {
    render(<ChessApp />);

    fireEvent.click(screen.getByTestId('square-1-4'));
    fireEvent.click(screen.getByTestId('square-3-4'));
    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('Negras');

    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);

    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('Blancas');
    expect(screen.getByTestId('undo-button')).toBeDisabled();
    expect(screen.getByTestId('redo-button')).toBeDisabled();
  });

  it('opens promotion modal when pawn reaches last rank and promotes piece upon selection', () => {
    const customEngineFactory = () => {
      const board = new Board(8, 8);
      board.placePiece(new Position(0, 4), new King('WHITE'));
      board.placePiece(new Position(7, 4), new King('BLACK'));
      board.placePiece(new Position(6, 0), new Pawn('WHITE'));
      return new ChessGame(board, 'WHITE');
    };

    render(<ChessApp engineFactory={customEngineFactory} />);

    fireEvent.click(screen.getByTestId('square-6-0'));
    fireEvent.click(screen.getByTestId('square-7-0'));

    expect(screen.getByTestId('promotion-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('promotion-option-queen'));

    expect(screen.queryByTestId('promotion-modal')).toBeNull();
    expect(screen.getByTestId('piece-white-queen')).toBeInTheDocument();
    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('Negras');
  });

  it('cancels promotion modal and retains pawn at origin square', () => {
    const customEngineFactory = () => {
      const board = new Board(8, 8);
      board.placePiece(new Position(0, 4), new King('WHITE'));
      board.placePiece(new Position(7, 4), new King('BLACK'));
      board.placePiece(new Position(6, 0), new Pawn('WHITE'));
      return new ChessGame(board, 'WHITE');
    };

    render(<ChessApp engineFactory={customEngineFactory} />);

    fireEvent.click(screen.getByTestId('square-6-0'));
    fireEvent.click(screen.getByTestId('square-7-0'));

    expect(screen.getByTestId('promotion-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar movimiento' }));

    expect(screen.queryByTestId('promotion-modal')).toBeNull();
    expect(screen.getByTestId('piece-white-pawn')).toBeInTheDocument();
    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('Blancas');
  });

  it('automatically triggers AI response move when playing in greedy AI game mode', () => {
    render(<ChessApp />);

    const greedyModeButton = screen.getByTestId('mode-selector-human_vs_greedy_ai');
    fireEvent.click(greedyModeButton);

    fireEvent.click(screen.getByTestId('square-1-4'));
    fireEvent.click(screen.getByTestId('square-3-4'));

    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('Blancas');
    expect(screen.getByTestId('undo-button')).toBeEnabled();
  });

  it('automatically triggers AI response move when playing in random AI game mode', () => {
    render(<ChessApp />);

    const randomModeButton = screen.getByTestId('mode-selector-human_vs_random_ai');
    fireEvent.click(randomModeButton);

    fireEvent.click(screen.getByTestId('square-1-4'));
    fireEvent.click(screen.getByTestId('square-3-4'));

    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('Blancas');
    expect(screen.getByTestId('undo-button')).toBeEnabled();
  });

  it('enters replay mode upon checkmate and allows manual navigation', () => {
    render(<ChessApp />);

    fireEvent.click(screen.getByTestId('square-1-5'));
    fireEvent.click(screen.getByTestId('square-2-5'));

    fireEvent.click(screen.getByTestId('square-6-4'));
    fireEvent.click(screen.getByTestId('square-4-4'));

    fireEvent.click(screen.getByTestId('square-1-6'));
    fireEvent.click(screen.getByTestId('square-3-6'));

    fireEvent.click(screen.getByTestId('square-7-3'));
    fireEvent.click(screen.getByTestId('square-3-7'));

    expect(screen.getByTestId('game-state-banner')).toHaveTextContent('Jaque Mate');
    expect(screen.getByTestId('review-match-button')).toBeInTheDocument();
    expect(screen.getByTestId('export-match-button')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('review-match-button'));

    expect(screen.getByTestId('replay-progress-indicator')).toHaveTextContent('Jugada 0 de 4');

    fireEvent.click(screen.getByTestId('square-1-4'));
    expect(screen.getByTestId('square-1-4').className).not.toContain('ring-amber-400');

    fireEvent.click(screen.getByTestId('replay-next-button'));
    expect(screen.getByTestId('replay-progress-indicator')).toHaveTextContent('Jugada 1 de 4');
    expect(screen.getByTestId('square-1-5')).toHaveAttribute('data-highlighted', 'true');
    expect(screen.getByTestId('square-2-5')).toHaveAttribute('data-highlighted', 'true');

    fireEvent.click(screen.getByTestId('replay-move-item-2'));
    expect(screen.getByTestId('replay-progress-indicator')).toHaveTextContent('Jugada 3 de 4');
    expect(screen.getByTestId('square-1-6')).toHaveAttribute('data-highlighted', 'true');
    expect(screen.getByTestId('square-3-6')).toHaveAttribute('data-highlighted', 'true');

    fireEvent.click(screen.getByTestId('replay-end-button'));
    expect(screen.getByTestId('replay-progress-indicator')).toHaveTextContent('Jugada 4 de 4');

    fireEvent.click(screen.getByTestId('exit-replay-button'));
    expect(screen.queryByTestId('replay-progress-indicator')).toBeNull();
    expect(screen.getByTestId('review-match-button')).toBeInTheDocument();
  });

  it('supports chess clock match lifecycle with board locking and pause controls', () => {
    render(<ChessApp />);

    const clockToggle = screen.getByTestId('clock-enable-toggle');
    fireEvent.click(clockToggle);

    expect(screen.getByTestId('player-clock-white')).toBeInTheDocument();
    expect(screen.getByTestId('player-clock-black')).toBeInTheDocument();
    expect(screen.queryByTestId('undo-button')).toBeNull();
    expect(screen.queryByTestId('redo-button')).toBeNull();

    const whitePawn = screen.getByTestId('square-1-4');
    fireEvent.click(whitePawn);
    expect(whitePawn.className).not.toContain('ring-amber-400');

    const startClockButton = screen.getByTestId('start-clock-match-button');
    fireEvent.click(startClockButton);

    expect(screen.getByTestId('player-clock-white')).toHaveClass('ring-2');

    fireEvent.click(whitePawn);
    expect(whitePawn.className).toContain('ring-amber-400');
    fireEvent.click(screen.getByTestId('square-3-4'));

    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('Negras');
    expect(screen.getByTestId('player-clock-black')).toHaveClass('ring-2');

    const pauseButton = screen.getByTestId('toggle-clock-pause-button');
    expect(pauseButton).toHaveTextContent('Pausar Tiempo');
    fireEvent.click(pauseButton);

    expect(pauseButton).toHaveTextContent('Reanudar Tiempo');
    const blackPawn = screen.getByTestId('square-6-4');
    fireEvent.click(blackPawn);
    expect(blackPawn.className).not.toContain('ring-amber-400');

    fireEvent.click(pauseButton);
    expect(pauseButton).toHaveTextContent('Pausar Tiempo');
    fireEvent.click(blackPawn);
    expect(blackPawn.className).toContain('ring-amber-400');
  });

  it('declares timeout victory when player timer reaches zero and keeps frozen clocks in replay', () => {
    vi.useFakeTimers();
    try {
      render(<ChessApp />);

      fireEvent.click(screen.getByTestId('clock-enable-toggle'));

      fireEvent.click(screen.getByTestId('white-preset-3'));
      const whiteMinusButton = screen.getByTestId('white-minus-button');
      fireEvent.click(whiteMinusButton);
      fireEvent.click(whiteMinusButton);
      expect(screen.getByText('1 min')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('start-clock-match-button'));
      expect(screen.getByTestId('game-state-banner')).toHaveTextContent('Partida en Curso');

      act(() => {
        vi.advanceTimersByTime(60000);
      });

      expect(screen.getByTestId('game-state-banner')).toHaveTextContent('Victoria de Negras por Tiempo Agotado');
      expect(screen.getByTestId('review-match-button')).toBeInTheDocument();
      expect(screen.getByTestId('export-match-button')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('review-match-button'));
      expect(screen.getByTestId('player-clock-white')).toBeInTheDocument();
      expect(screen.getByTestId('player-clock-black')).toBeInTheDocument();
      expect(screen.getByTestId('player-clock-white')).toHaveTextContent('00:00');
      expect(screen.getByTestId('player-clock-white')).not.toHaveClass('ring-2');
    } finally {
      vi.useRealTimers();
    }
  });
});

