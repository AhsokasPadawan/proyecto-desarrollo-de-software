import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { FeedbackBanner } from '../../src/adapters/web/components/FeedbackBanner';

describe('Web Adapter - FeedbackBanner', () => {
  it('renders provided error message text', () => {
    render(<FeedbackBanner message="Movimiento inválido: Casilla bloqueada" />);

    expect(screen.getByText('Movimiento inválido: Casilla bloqueada')).toBeInTheDocument();
  });

  it('assigns default testid rejection-feedback-banner', () => {
    render(<FeedbackBanner message="Error general" />);

    expect(screen.getByTestId('rejection-feedback-banner')).toBeInTheDocument();
  });

  it('supports custom testid when supplied', () => {
    render(<FeedbackBanner message="Aviso custom" testId="custom-feedback" />);

    expect(screen.getByTestId('custom-feedback')).toBeInTheDocument();
  });
});
