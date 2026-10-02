import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { GameLayout } from '../../src/adapters/web/components/GameLayout';

describe('Web Adapter - GameLayout', () => {
  it('renders header, board area, and control panel within bounded container', () => {
    render(
      <GameLayout
        header={<div data-testid="test-header">Header</div>}
        boardArea={<div data-testid="test-board">Board Area</div>}
        controlPanel={<div data-testid="test-panel">Control Panel</div>}
        boardMaxWidth="480px"
        boardColumnHeight="616px"
      />
    );

    expect(screen.getByTestId('game-layout-container')).toBeInTheDocument();
    expect(screen.getByTestId('test-header')).toBeInTheDocument();
    expect(screen.getByTestId('test-board')).toBeInTheDocument();
    expect(screen.getByTestId('test-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('test-replay-bar')).toBeNull();
  });

  it('renders replay bar underneath when provided', () => {
    render(
      <GameLayout
        header={<div data-testid="test-header">Header</div>}
        boardArea={<div data-testid="test-board">Board Area</div>}
        controlPanel={<div data-testid="test-panel">Control Panel</div>}
        replayBar={<div data-testid="test-replay-bar">Replay Controls</div>}
        boardMaxWidth="480px"
        boardColumnHeight="564px"
      />
    );

    expect(screen.getByTestId('test-replay-bar')).toBeInTheDocument();
  });
});
