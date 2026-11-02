import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { PlayerColorConfigSection } from '../../src/adapters/web/components/PlayerColorConfigSection';

describe('Web Adapter - PlayerColorConfigSection', () => {
  it('renders color selector buttons and informative banner when WHITE is selected', () => {
    const handleColorChange = vi.fn();
    render(
      <PlayerColorConfigSection
        playerColor="WHITE"
        onPlayerColorChange={handleColorChange}
        onStartMatch={() => {}}
      />
    );

    const whiteBtn = screen.getByTestId('select-color-white');
    const blackBtn = screen.getByTestId('select-color-black');

    expect(whiteBtn).toHaveAttribute('aria-pressed', 'true');
    expect(blackBtn).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('white-start-prompt')).toHaveTextContent(
      'mové cualquier pieza blanca en el tablero para iniciar la partida'
    );
    expect(screen.queryByTestId('start-ai-match-button')).toBeNull();

    fireEvent.click(blackBtn);
    expect(handleColorChange).toHaveBeenCalledWith('BLACK');
  });

  it('renders start match button and explanation when BLACK is selected', () => {
    const handleStartMatch = vi.fn();
    render(
      <PlayerColorConfigSection
        playerColor="BLACK"
        onPlayerColorChange={() => {}}
        onStartMatch={handleStartMatch}
      />
    );

    expect(screen.getByTestId('select-color-black')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByTestId('white-start-prompt')).toBeNull();
    expect(screen.getByTestId('black-start-prompt')).toBeInTheDocument();

    const startBtn = screen.getByTestId('start-ai-match-button');
    expect(startBtn).toHaveTextContent('Iniciar Partida');
    fireEvent.click(startBtn);
    expect(handleStartMatch).toHaveBeenCalledTimes(1);
  });

  it('disables color buttons and start button while AI is thinking', () => {
    render(
      <PlayerColorConfigSection
        playerColor="BLACK"
        isAiThinking={true}
        onPlayerColorChange={() => {}}
        onStartMatch={() => {}}
      />
    );

    expect(screen.getByTestId('select-color-white')).toBeDisabled();
    expect(screen.getByTestId('select-color-black')).toBeDisabled();
    expect(screen.getByTestId('start-ai-match-button')).toBeDisabled();
    expect(screen.getByTestId('start-ai-match-button')).toHaveTextContent('Iniciando Partida...');
  });
});
