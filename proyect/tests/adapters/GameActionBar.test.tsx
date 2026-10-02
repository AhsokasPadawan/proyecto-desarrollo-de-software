import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { GameActionBar } from '../../src/adapters/web/components/GameActionBar';

describe('Web Adapter - GameActionBar', () => {
  it('renders undo and redo buttons and reflects disabled state', () => {
    render(
      <GameActionBar
        canUndo={false}
        canRedo={false}
        isTerminalState={false}
        onUndo={() => {}}
        onRedo={() => {}}
        onReset={() => {}}
      />
    );

    expect(screen.getByTestId('undo-button')).toBeDisabled();
    expect(screen.getByTestId('redo-button')).toBeDisabled();
    expect(screen.getByTestId('reset-button')).toBeEnabled();
    expect(screen.queryByTestId('review-match-button')).toBeNull();
    expect(screen.queryByTestId('export-match-button')).toBeNull();
  });

  it('enables undo and redo buttons and invokes callbacks on click', () => {
    const handleUndo = vi.fn();
    const handleRedo = vi.fn();
    const handleReset = vi.fn();

    render(
      <GameActionBar
        canUndo={true}
        canRedo={true}
        isTerminalState={false}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleReset}
      />
    );

    const undoButton = screen.getByTestId('undo-button');
    const redoButton = screen.getByTestId('redo-button');
    const resetButton = screen.getByTestId('reset-button');

    expect(undoButton).toBeEnabled();
    expect(redoButton).toBeEnabled();

    fireEvent.click(undoButton);
    expect(handleUndo).toHaveBeenCalledTimes(1);

    fireEvent.click(redoButton);
    expect(handleRedo).toHaveBeenCalledTimes(1);

    fireEvent.click(resetButton);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('renders review and export match buttons when terminal state is reached', () => {
    const handleStartReplay = vi.fn();
    const handleExportMatch = vi.fn();

    render(
      <GameActionBar
        canUndo={true}
        canRedo={false}
        isTerminalState={true}
        onUndo={() => {}}
        onRedo={() => {}}
        onReset={() => {}}
        onStartReplay={handleStartReplay}
        onExportMatch={handleExportMatch}
      />
    );

    const reviewButton = screen.getByTestId('review-match-button');
    const exportButton = screen.getByTestId('export-match-button');

    expect(reviewButton).toBeInTheDocument();
    expect(exportButton).toBeInTheDocument();

    fireEvent.click(reviewButton);
    expect(handleStartReplay).toHaveBeenCalledTimes(1);

    fireEvent.click(exportButton);
    expect(handleExportMatch).toHaveBeenCalledTimes(1);
  });
});
