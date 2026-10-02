import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ControlPanelView } from '../../src/adapters/web/ControlPanelView';
import { GameSnapshot, MoveRecord } from '../../src/core/ports/GameSnapshot';
import { ChessGame } from '../../src/core/game/ChessGame';

describe('Web Adapter - ControlPanelView', () => {
  it('renders turn indicator and game state banner side by side', () => {
    const game = new ChessGame();
    const snapshot = game.getSnapshot();

    render(
      <ControlPanelView
        snapshot={snapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={() => {}}
      />
    );

    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('Blancas');
    expect(screen.getByTestId('game-state-banner')).toHaveTextContent('Partida en Curso');
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
      />
    );

    expect(screen.getByTestId('turn-indicator')).toHaveTextContent('Negras');
  });

  it('renders game mode selectors when match has not started yet', () => {
    const game = new ChessGame();
    const snapshot = game.getSnapshot();

    render(
      <ControlPanelView
        snapshot={snapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={() => {}}
      />
    );

    expect(screen.getByTestId('mode-selector-human_vs_human')).toBeInTheDocument();
    expect(screen.getByTestId('mode-selector-human_vs_random_ai')).toBeInTheDocument();
    expect(screen.getByTestId('mode-selector-human_vs_greedy_ai')).toBeInTheDocument();
    expect(screen.queryByTestId('replay-move-list')).toBeNull();
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
      />
    );

    const greedyAiButton = screen.getByTestId('mode-selector-human_vs_greedy_ai');
    fireEvent.click(greedyAiButton);

    expect(handleModeChange).toHaveBeenCalledWith('HUMAN_VS_GREEDY_AI');
  });

  it('replaces game mode section with move history table once the match has started', () => {
    const mockMoves: MoveRecord[] = [
      {
        moveIndex: 0,
        turn: 'WHITE',
        piece: 'PAWN',
        from: 'e2',
        to: 'e4',
        isPromotion: false,
        isCastling: false,
      },
    ];

    const startedSnapshot: GameSnapshot = {
      rows: 8,
      cols: 8,
      grid: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null)),
      currentTurn: 'BLACK',
      stateKind: 'IN_PROGRESS',
      winner: null,
      canUndo: true,
      canRedo: false,
      moveHistory: mockMoves,
      currentMoveIndex: 1,
    };

    render(
      <ControlPanelView
        snapshot={startedSnapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={() => {}}
      />
    );

    expect(screen.queryByTestId('mode-selector-human_vs_human')).toBeNull();
    expect(screen.getByTestId('replay-move-list')).toBeInTheDocument();
    expect(screen.getByTestId('replay-move-item-0')).toHaveTextContent('e2');
    expect(screen.getByTestId('replay-move-item-0')).toHaveTextContent('e4');
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
      />
    );

    const alertBanner = screen.getByTestId('rejection-feedback-banner');
    expect(alertBanner).toBeInTheDocument();
    expect(alertBanner).toHaveTextContent('Movimiento Ilegal');
  });

  it('renders replay control section when isReplaying is true', () => {
    const mockMoves: MoveRecord[] = [
      {
        moveIndex: 0,
        turn: 'WHITE',
        piece: 'PAWN',
        from: 'e2',
        to: 'e4',
        isPromotion: false,
        isCastling: false,
      },
    ];

    const replaySnapshot: GameSnapshot = {
      rows: 8,
      cols: 8,
      grid: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null)),
      currentTurn: 'WHITE',
      stateKind: 'CHECKMATE',
      winner: 'WHITE',
      canUndo: false,
      canRedo: true,
      moveHistory: mockMoves,
      currentMoveIndex: 0,
    };

    const handleExitReplay = vi.fn();
    const handleTogglePlay = vi.fn();

    render(
      <ControlPanelView
        snapshot={replaySnapshot}
        currentGameMode="HUMAN_VS_HUMAN"
        feedbackMessage={null}
        onModeChange={() => {}}
        isReplaying={true}
        isPlaying={false}
        playbackSpeed={1000}
        onExitReplay={handleExitReplay}
        onGoToStart={() => {}}
        onStepBackward={() => {}}
        onTogglePlay={handleTogglePlay}
        onStepForward={() => {}}
        onGoToEnd={() => {}}
        onSpeedChange={() => {}}
      />
    );

    expect(screen.getByTestId('replay-progress-indicator')).toHaveTextContent('Jugada 0 de 1');
    expect(screen.getByTestId('replay-play-button')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('exit-replay-button'));
    expect(handleExitReplay).toHaveBeenCalledTimes(1);
  });
});
