import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ReplayControlSection } from '../../src/adapters/web/components/ReplayControlSection';

describe('Web Adapter - ReplayControlSection', () => {
  it('renders progress indicator and playback buttons', () => {
    render(
      <ReplayControlSection
        currentMoveIndex={2}
        totalMoves={5}
        isPlaying={false}
        playbackSpeed={1000}
        onGoToStart={() => {}}
        onStepBackward={() => {}}
        onTogglePlay={() => {}}
        onStepForward={() => {}}
        onGoToEnd={() => {}}
        onSpeedChange={() => {}}
        onExitReplay={() => {}}
      />
    );

    expect(screen.getByTestId('replay-progress-indicator')).toHaveTextContent('Movimiento 2 de 5');
    expect(screen.getByTestId('replay-play-button')).toHaveTextContent('Play');
  });

  it('shows Pausa on play button when isPlaying is true', () => {
    render(
      <ReplayControlSection
        currentMoveIndex={2}
        totalMoves={5}
        isPlaying={true}
        playbackSpeed={1000}
        onGoToStart={() => {}}
        onStepBackward={() => {}}
        onTogglePlay={() => {}}
        onStepForward={() => {}}
        onGoToEnd={() => {}}
        onSpeedChange={() => {}}
        onExitReplay={() => {}}
      />
    );

    expect(screen.getByTestId('replay-play-button')).toHaveTextContent('Pausa');
  });

  it('disables backward buttons when at start', () => {
    render(
      <ReplayControlSection
        currentMoveIndex={0}
        totalMoves={5}
        isPlaying={false}
        playbackSpeed={1000}
        onGoToStart={() => {}}
        onStepBackward={() => {}}
        onTogglePlay={() => {}}
        onStepForward={() => {}}
        onGoToEnd={() => {}}
        onSpeedChange={() => {}}
        onExitReplay={() => {}}
      />
    );

    expect(screen.getByTestId('replay-start-button')).toBeDisabled();
    expect(screen.getByTestId('replay-prev-button')).toBeDisabled();
    expect(screen.getByTestId('replay-next-button')).not.toBeDisabled();
    expect(screen.getByTestId('replay-end-button')).not.toBeDisabled();
  });

  it('disables forward buttons when at end', () => {
    render(
      <ReplayControlSection
        currentMoveIndex={5}
        totalMoves={5}
        isPlaying={false}
        playbackSpeed={1000}
        onGoToStart={() => {}}
        onStepBackward={() => {}}
        onTogglePlay={() => {}}
        onStepForward={() => {}}
        onGoToEnd={() => {}}
        onSpeedChange={() => {}}
        onExitReplay={() => {}}
      />
    );

    expect(screen.getByTestId('replay-start-button')).not.toBeDisabled();
    expect(screen.getByTestId('replay-prev-button')).not.toBeDisabled();
    expect(screen.getByTestId('replay-next-button')).toBeDisabled();
    expect(screen.getByTestId('replay-end-button')).toBeDisabled();
  });

  it('triggers control callbacks on click', () => {
    const handleGoToStart = vi.fn();
    const handleStepBackward = vi.fn();
    const handleTogglePlay = vi.fn();
    const handleStepForward = vi.fn();
    const handleGoToEnd = vi.fn();
    const handleSpeedChange = vi.fn();
    const handleExitReplay = vi.fn();

    render(
      <ReplayControlSection
        currentMoveIndex={2}
        totalMoves={5}
        isPlaying={false}
        playbackSpeed={1000}
        onGoToStart={handleGoToStart}
        onStepBackward={handleStepBackward}
        onTogglePlay={handleTogglePlay}
        onStepForward={handleStepForward}
        onGoToEnd={handleGoToEnd}
        onSpeedChange={handleSpeedChange}
        onExitReplay={handleExitReplay}
      />
    );

    fireEvent.click(screen.getByTestId('replay-start-button'));
    expect(handleGoToStart).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('replay-prev-button'));
    expect(handleStepBackward).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('replay-play-button'));
    expect(handleTogglePlay).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('replay-next-button'));
    expect(handleStepForward).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('replay-end-button'));
    expect(handleGoToEnd).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('speed-button-500'));
    expect(handleSpeedChange).toHaveBeenCalledWith(500);

    fireEvent.click(screen.getByTestId('exit-replay-button'));
    expect(handleExitReplay).toHaveBeenCalledTimes(1);
  });
});


