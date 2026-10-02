import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { PlayerClockBar } from '../../src/adapters/web/components/PlayerClockBar';

describe('PlayerClockBar', () => {
  it('renders player label and formatted time', () => {
    render(
      <PlayerClockBar
        color="WHITE"
        formattedTime="10:00"
        isActive={false}
        isLowTime={false}
      />
    );

    expect(screen.getByText('Blancas')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByTestId('player-clock-white')).not.toHaveClass('animate-pulse');
  });

  it('highlights the clock when the player turn is active', () => {
    render(
      <PlayerClockBar
        color="BLACK"
        formattedTime="08:45"
        isActive={true}
        isLowTime={false}
      />
    );

    const clockElement = screen.getByTestId('player-clock-black');
    expect(clockElement).toHaveClass('ring-2');
    expect(screen.getByText('08:45')).toBeInTheDocument();
  });

  it('activates red warning and pulse animation when low time is reached', () => {
    render(
      <PlayerClockBar
        color="WHITE"
        formattedTime="00:24"
        isActive={true}
        isLowTime={true}
      />
    );

    const clockElement = screen.getByTestId('player-clock-white');
    expect(clockElement).toHaveClass('animate-pulse');
    expect(clockElement).toHaveClass('border-red-500');
    expect(screen.getByText('00:24')).toHaveClass('text-red-300');
  });

  it('displays paused indicator when paused', () => {
    render(
      <PlayerClockBar
        color="WHITE"
        formattedTime="05:00"
        isActive={true}
        isLowTime={false}
        isPaused={true}
      />
    );

    expect(screen.getByText('Pausa')).toBeInTheDocument();
  });
});
