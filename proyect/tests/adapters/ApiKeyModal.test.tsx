import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ApiKeyModal } from '../../src/adapters/web/components/ApiKeyModal';
import { GEMINI_API_KEY_STORAGE_KEY, GeminiCoachService } from '../../src/adapters/services/GeminiCoachService';

describe('ApiKeyModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders nothing when closed', () => {
    const { container } = render(<ApiKeyModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders input and saves key to localStorage', () => {
    const handleClose = vi.fn();
    const handleSaved = vi.fn();

    render(<ApiKeyModal isOpen={true} onClose={handleClose} onKeySaved={handleSaved} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Configuración Gemini AI Coach/)).toBeInTheDocument();

    const input = screen.getByLabelText(/Gemini API Key:/);
    fireEvent.change(input, { target: { value: 'TEST_API_KEY_123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY)).toBe('TEST_API_KEY_123');
    expect(handleSaved).toHaveBeenCalledTimes(1);
  });

  it('clears stored key when clear button clicked', () => {
    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, 'EXISTING_KEY');
    const handleSaved = vi.fn();

    render(<ApiKeyModal isOpen={true} onClose={vi.fn()} onKeySaved={handleSaved} />);

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar clave' }));

    expect(localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY)).toBe('');
    expect(handleSaved).toHaveBeenCalledTimes(1);
  });

  it('updates GeminiCoachService dynamically when key is changed', () => {
    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, 'INITIAL_KEY');
    const coach = new GeminiCoachService();
    expect(coach.apiKey).toBe('INITIAL_KEY');

    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, 'NEW_DYNAMIC_KEY');
    expect(coach.hasApiKey()).toBe(true);
    expect(coach.apiKey).toBe('NEW_DYNAMIC_KEY');
  });
});
