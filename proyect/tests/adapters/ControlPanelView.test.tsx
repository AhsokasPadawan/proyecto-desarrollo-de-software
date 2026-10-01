import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ControlPanelView } from '../../src/adapters/web/ControlPanelView';
import { GameSnapshot } from '../../src/core/ports/GameSnapshot';
import { ChessGame } from '../../src/core/game/ChessGame';

describe('Web Adapter - ControlPanelView', () => {
  it('renders turn indicator with white player label when current turn is white', () => {
    const game = new ChessGame();
    const snapshot = game.getSnapshot();

    render(
      <ControlPanelView
        snapshot={snapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        onReset={() => {}}
      />
    );

    const indicator = screen.getByTestId('turn-indicator');
    expect(indicator).toHaveTextContent('Blancas');
  });

  it('renders turn indicator with black player label when current turn is black', () => {
    const customSnapshot: GameSnapshot = {
      rows: 8,
      cols: 8,
      grid: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null)),
      currentTurn: 'BLACK',
      stateKind: 'IN_PROGRESS',
      winner: null,
      canUndo: true,
      canRedo: false,
      moveHistory: [],
      currentMoveIndex: 0,
    };

    render(
      <ControlPanelView
        snapshot={customSnapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        onReset={() => {}}
      />
    );

    const indicator = screen.getByTestId('turn-indicator');
    expect(indicator).toHaveTextContent('Negras');
  });

  it('renders game state banner with in progress label', () => {
    const game = new ChessGame();
    const snapshot = game.getSnapshot();

    render(
      <ControlPanelView
        snapshot={snapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        onReset={() => {}}
      />
    );

    const banner = screen.getByTestId('game-state-banner');
    expect(banner).toHaveTextContent('Partida en Curso');
  });

  it('renders game state banner with check warning label', () => {
    const customSnapshot: GameSnapshot = {
      rows: 8,
      cols: 8,
      grid: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null)),
      currentTurn: 'WHITE',
      stateKind: 'CHECK',
      winner: null,
      canUndo: true,
      canRedo: false,
      moveHistory: [],
      currentMoveIndex: 0,
    };

    render(
      <ControlPanelView
        snapshot={customSnapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        onReset={() => {}}
      />
    );

    const banner = screen.getByTestId('game-state-banner');
    expect(banner).toHaveTextContent('¡Jaque al Rey!');
  });

  it('disables undo button when canUndo snapshot property is false', () => {
    const game = new ChessGame();
    const snapshot = game.getSnapshot();

    render(
      <ControlPanelView
        snapshot={snapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        onReset={() => {}}
      />
    );

    expect(screen.getByTestId('undo-button')).toBeDisabled();
  });

  it('enables undo button and invokes onUndo callback when clicked', () => {
    const handleUndo = vi.fn();
    const customSnapshot: GameSnapshot = {
      rows: 8,
      cols: 8,
      grid: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null)),
      currentTurn: 'BLACK',
      stateKind: 'IN_PROGRESS',
      winner: null,
      canUndo: true,
      canRedo: false,
      moveHistory: [],
      currentMoveIndex: 0,
    };

    render(
      <ControlPanelView
        snapshot={customSnapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={() => {}}
        onUndo={handleUndo}
        onRedo={() => {}}
        onReset={() => {}}
      />
    );

    const undoButton = screen.getByTestId('undo-button');
    expect(undoButton).toBeEnabled();
    fireEvent.click(undoButton);
    expect(handleUndo).toHaveBeenCalledTimes(1);
  });

  it('disables redo button when canRedo snapshot property is false', () => {
    const game = new ChessGame();
    const snapshot = game.getSnapshot();

    render(
      <ControlPanelView
        snapshot={snapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        onReset={() => {}}
      />
    );

    expect(screen.getByTestId('redo-button')).toBeDisabled();
  });

  it('enables redo button and invokes onRedo callback when clicked', () => {
    const handleRedo = vi.fn();
    const customSnapshot: GameSnapshot = {
      rows: 8,
      cols: 8,
      grid: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null)),
      currentTurn: 'WHITE',
      stateKind: 'IN_PROGRESS',
      winner: null,
      canUndo: false,
      canRedo: true,
      moveHistory: [],
      currentMoveIndex: 0,
    };

    render(
      <ControlPanelView
        snapshot={customSnapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={() => {}}
        onUndo={() => {}}
        onRedo={handleRedo}
        onReset={() => {}}
      />
    );

    const redoButton = screen.getByTestId('redo-button');
    expect(redoButton).toBeEnabled();
    fireEvent.click(redoButton);
    expect(handleRedo).toHaveBeenCalledTimes(1);
  });

  it('invokes onReset callback when reset button is clicked', () => {
    const handleReset = vi.fn();
    const game = new ChessGame();
    const snapshot = game.getSnapshot();

    render(
      <ControlPanelView
        snapshot={snapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        onReset={handleReset}
      />
    );

    fireEvent.click(screen.getByTestId('reset-button'));
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('renders rejection feedback banner when feedback message is provided', () => {
    const game = new ChessGame();
    const snapshot = game.getSnapshot();

    render(
      <ControlPanelView
        snapshot={snapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage="Movimiento Ilegal"
        onModeChange={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        onReset={() => {}}
      />
    );

    const alertBanner = screen.getByTestId('rejection-feedback-banner');
    expect(alertBanner).toBeInTheDocument();
    expect(alertBanner).toHaveTextContent('Movimiento Ilegal');
  });

  it('does not render rejection feedback banner when feedback message is null', () => {
    const game = new ChessGame();
    const snapshot = game.getSnapshot();

    render(
      <ControlPanelView
        snapshot={snapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        onReset={() => {}}
      />
    );

    expect(screen.queryByTestId('rejection-feedback-banner')).toBeNull();
  });

  it('invokes onModeChange callback when a game mode button is clicked', () => {
    const handleModeChange = vi.fn();
    const game = new ChessGame();
    const snapshot = game.getSnapshot();

    render(
      <ControlPanelView
        snapshot={snapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={handleModeChange}
        onUndo={() => {}}
        onRedo={() => {}}
        onReset={() => {}}
      />
    );

    const greedyAiButton = screen.getByTestId('mode-selector-human_vs_greedy_ai');
    fireEvent.click(greedyAiButton);

    expect(handleModeChange).toHaveBeenCalledWith('HUMAN_VS_GREEDY_AI');
    expect(handleModeChange).toHaveBeenCalledTimes(1);
  });

  it('renders export button when state is terminal and invokes onExportMatch upon click', () => {
    const handleExportMatch = vi.fn();
    const terminalSnapshot: GameSnapshot = {
      rows: 8,
      cols: 8,
      grid: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null)),
      currentTurn: 'BLACK',
      stateKind: 'CHECKMATE',
      winner: 'WHITE',
      canUndo: true,
      canRedo: false,
      moveHistory: [],
      currentMoveIndex: 0,
    };

    render(
      <ControlPanelView
        snapshot={terminalSnapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        onReset={() => {}}
        onExportMatch={handleExportMatch}
      />
    );

    const exportButton = screen.getByTestId('export-match-button');
    expect(exportButton).toBeInTheDocument();
    fireEvent.click(exportButton);
    expect(handleExportMatch).toHaveBeenCalledTimes(1);
  });

  it('does not render export button when state is in progress', () => {
    const game = new ChessGame();
    const snapshot = game.getSnapshot();

    render(
      <ControlPanelView
        snapshot={snapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        onReset={() => {}}
        onExportMatch={() => {}}
      />
    );

    expect(screen.queryByTestId('export-match-button')).toBeNull();
  });
});

