import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ClockConfigSection } from '../../src/adapters/web/components/ClockConfigSection';

describe('ClockConfigSection', () => {
  it('renders toggle switch and initial state', () => {
    const handleToggle = vi.fn();
    render(
      <ClockConfigSection
        isClockEnabled={false}
        whiteMinutes={10}
        blackMinutes={10}
        onToggleClock={handleToggle}
        onWhiteMinutesChange={() => {}}
        onBlackMinutesChange={() => {}}
        onStartMatch={() => {}}
      />
    );

    const toggle = screen.getByTestId('clock-enable-toggle');
    expect(toggle).not.toBeChecked();

    fireEvent.click(toggle);
    expect(handleToggle).toHaveBeenCalledWith(true);
  });

  it('renders presets and stepper buttons when clock is enabled', () => {
    const handleWhiteChange = vi.fn();
    const handleBlackChange = vi.fn();
    const handleStart = vi.fn();

    render(
      <ClockConfigSection
        isClockEnabled={true}
        whiteMinutes={10}
        blackMinutes={10}
        onToggleClock={() => {}}
        onWhiteMinutesChange={handleWhiteChange}
        onBlackMinutesChange={handleBlackChange}
        onStartMatch={handleStart}
      />
    );

    expect(screen.getByText('Configuración de Reloj')).toBeInTheDocument();

    const white5mButton = screen.getByTestId('white-preset-5');
    fireEvent.click(white5mButton);
    expect(handleWhiteChange).toHaveBeenCalledWith(5);

    const blackPlusButton = screen.getByTestId('black-plus-button');
    fireEvent.click(blackPlusButton);
    expect(handleBlackChange).toHaveBeenCalledWith(11);

    const blackMinusButton = screen.getByTestId('black-minus-button');
    fireEvent.click(blackMinusButton);
    expect(handleBlackChange).toHaveBeenCalledWith(9);

    const startButton = screen.getByTestId('start-clock-match-button');
    fireEvent.click(startButton);
    expect(handleStart).toHaveBeenCalledTimes(1);
  });
});
