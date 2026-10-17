import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { CoachFeedbackCard } from '../../src/adapters/web/components/CoachFeedbackCard';
import { MOVE_QUALITY_LOOKUP } from '../../src/adapters/web/moveQualityEvaluator';

describe('CoachFeedbackCard', () => {
  it('renders loading progress state', () => {
    render(
      <CoachFeedbackCard
        isLoading={true}
        progress={{ current: 3, total: 10 }}
      />
    );

    expect(screen.getByTestId('coach-loading-card')).toBeInTheDocument();
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
  });

  it('renders live hint with move details and advice', () => {
    const handleDismiss = vi.fn();
    render(
      <CoachFeedbackCard
        liveHint={{
          from: 'e2',
          to: 'e4',
          san: 'e4',
          evaluation: 0.35,
          advice: 'Controla el centro y libera diagonales.',
        }}
        onDismissHint={handleDismiss}
      />
    );

    expect(screen.getByTestId('coach-live-hint-card')).toBeInTheDocument();
    expect(screen.getByText(/e2 → e4/)).toBeInTheDocument();
    expect(screen.getByText(/Controla el centro y libera diagonales./)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Cerrar sugerencia'));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders analyzed move card with quality badge and comparison', () => {
    render(
      <CoachFeedbackCard
        analyzedMove={{
          moveIndex: 0,
          turn: 'WHITE',
          piece: 'PAWN',
          from: 'e2',
          to: 'e4',
          bestMoveFrom: 'e2',
          bestMoveTo: 'e4',
          evalBefore: 0.2,
          evalAfter: 0.2,
          evalLoss: 0,
          quality: MOVE_QUALITY_LOOKUP.BEST,
          advice: 'La jugada más sólida para abrir el juego.',
        }}
      />
    );

    expect(screen.getByTestId('coach-analyzed-move-card')).toBeInTheDocument();
    expect(screen.getAllByText(/Mejor jugada/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/La jugada más sólida para abrir el juego./)).toBeInTheDocument();
  });

  it('renders overall summary card with accuracies', () => {
    render(
      <CoachFeedbackCard
        analysisResult={{
          overallSummary: 'Excelente partida de ambos bandos.',
          whiteAccuracy: 92,
          blackAccuracy: 88,
          analyzedMoves: [],
        }}
      />
    );

    expect(screen.getByTestId('coach-summary-card')).toBeInTheDocument();
    expect(screen.getByTestId('coach-summary-content')).toHaveClass('overflow-y-auto');
    expect(screen.getByTestId('coach-summary-content')).toHaveClass('max-h-36');
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();
    expect(screen.getByText('Excelente partida de ambos bandos.')).toBeInTheDocument();
  });

  it('renders invite card when onAnalyzeGame is provided without active move', () => {
    const handleAnalyze = vi.fn();
    render(<CoachFeedbackCard onAnalyzeGame={handleAnalyze} />);

    expect(screen.getByTestId('coach-invite-card')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Analizar' }));
    expect(handleAnalyze).toHaveBeenCalledTimes(1);
  });
});
