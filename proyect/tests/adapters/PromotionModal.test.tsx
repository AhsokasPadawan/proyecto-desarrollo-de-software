import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { PromotionModal } from '../../src/adapters/web/PromotionModal';

describe('Web Adapter - PromotionModal', () => {
  it('renders null when modal is closed', () => {
    render(
      <PromotionModal
        color="WHITE"
        isOpen={false}
        onSelectPiece={() => {}}
        onCancel={() => {}}
      />
    );

    const modal = screen.queryByTestId('promotion-modal');
    expect(modal).toBeNull();
  });

  it('renders modal dialog with 4 promotion choices when open', () => {
    render(
      <PromotionModal
        color="WHITE"
        isOpen={true}
        onSelectPiece={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByTestId('promotion-modal')).toBeInTheDocument();
    expect(screen.getByTestId('promotion-option-queen')).toBeInTheDocument();
    expect(screen.getByTestId('promotion-option-rook')).toBeInTheDocument();
    expect(screen.getByTestId('promotion-option-bishop')).toBeInTheDocument();
    expect(screen.getByTestId('promotion-option-knight')).toBeInTheDocument();
  });

  it('invokes onSelectPiece with QUEEN when queen option is clicked', () => {
    const handleSelectPiece = vi.fn();

    render(
      <PromotionModal
        color="WHITE"
        isOpen={true}
        onSelectPiece={handleSelectPiece}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId('promotion-option-queen'));

    expect(handleSelectPiece).toHaveBeenCalledWith('QUEEN');
    expect(handleSelectPiece).toHaveBeenCalledTimes(1);
  });

  it('invokes onSelectPiece with ROOK when rook option is clicked', () => {
    const handleSelectPiece = vi.fn();

    render(
      <PromotionModal
        color="WHITE"
        isOpen={true}
        onSelectPiece={handleSelectPiece}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId('promotion-option-rook'));

    expect(handleSelectPiece).toHaveBeenCalledWith('ROOK');
    expect(handleSelectPiece).toHaveBeenCalledTimes(1);
  });

  it('invokes onSelectPiece with BISHOP when bishop option is clicked', () => {
    const handleSelectPiece = vi.fn();

    render(
      <PromotionModal
        color="WHITE"
        isOpen={true}
        onSelectPiece={handleSelectPiece}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId('promotion-option-bishop'));

    expect(handleSelectPiece).toHaveBeenCalledWith('BISHOP');
    expect(handleSelectPiece).toHaveBeenCalledTimes(1);
  });

  it('invokes onSelectPiece with KNIGHT when knight option is clicked', () => {
    const handleSelectPiece = vi.fn();

    render(
      <PromotionModal
        color="WHITE"
        isOpen={true}
        onSelectPiece={handleSelectPiece}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId('promotion-option-knight'));

    expect(handleSelectPiece).toHaveBeenCalledWith('KNIGHT');
    expect(handleSelectPiece).toHaveBeenCalledTimes(1);
  });

  it('invokes onCancel when cancel button is clicked', () => {
    const handleCancel = vi.fn();

    render(
      <PromotionModal
        color="WHITE"
        isOpen={true}
        onSelectPiece={() => {}}
        onCancel={handleCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar movimiento' }));

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
