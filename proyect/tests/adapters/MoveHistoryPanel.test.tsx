import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MoveRecord } from '../../src/core/ports/GameSnapshot';
import { MoveHistoryPanel } from '../../src/adapters/web/components/MoveHistoryPanel';

describe('Web Adapter - MoveHistoryPanel', () => {
  it('renders panel title and empty state message when move history is empty', () => {
    render(<MoveHistoryPanel moveHistory={[]} currentMoveIndex={0} />);

    expect(screen.getByText('Historial de Jugadas')).toBeInTheDocument();
    expect(screen.getByTestId('move-count-badge')).toHaveTextContent('0');
    expect(screen.getByTestId('no-moves-message')).toHaveTextContent('Aún no se realizaron jugadas.');
  });

  it('renders move table with round details and color-coded from/to cells', () => {
    const mockMoves: MoveRecord[] = [
      {
        moveIndex: 0,
        turn: 'WHITE',
        piece: 'PAWN',
        from: 'e2',
        to: 'e4',
        isPromotion: false,
        isCastling: false,
      },
      {
        moveIndex: 1,
        turn: 'BLACK',
        piece: 'PAWN',
        from: 'e7',
        to: 'e5',
        isPromotion: false,
        isCastling: false,
      },
    ];

    render(<MoveHistoryPanel moveHistory={mockMoves} currentMoveIndex={1} />);

    expect(screen.getByTestId('move-count-badge')).toHaveTextContent('2');
    expect(screen.getByTestId('replay-move-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('replay-move-item-1')).toBeInTheDocument();

    expect(screen.getByText('e2')).toBeInTheDocument();
    expect(screen.getByText('e4')).toBeInTheDocument();
    expect(screen.getByText('e7')).toBeInTheDocument();
    expect(screen.getByText('e5')).toBeInTheDocument();

    expect(screen.getByText('Origen (From):')).toBeInTheDocument();
    expect(screen.getByText('Destino (To):')).toBeInTheDocument();
  });

  it('highlights the active move row and calls onJumpToMove on click', () => {
    const handleJumpToMove = vi.fn();
    const mockMoves: MoveRecord[] = [
      {
        moveIndex: 0,
        turn: 'WHITE',
        piece: 'KNIGHT',
        from: 'g1',
        to: 'f3',
        isPromotion: false,
        isCastling: false,
      },
      {
        moveIndex: 1,
        turn: 'BLACK',
        piece: 'KNIGHT',
        from: 'b8',
        to: 'c6',
        isPromotion: false,
        isCastling: false,
      },
    ];

    render(
      <MoveHistoryPanel
        moveHistory={mockMoves}
        currentMoveIndex={2}
        onJumpToMove={handleJumpToMove}
        isReplaying={true}
      />
    );

    const secondRow = screen.getByTestId('replay-move-item-1');
    expect(secondRow.className).toContain('border-amber-400');

    const firstRow = screen.getByTestId('replay-move-item-0');
    fireEvent.click(firstRow);

    expect(handleJumpToMove).toHaveBeenCalledTimes(1);
    expect(handleJumpToMove).toHaveBeenCalledWith(1);
  });

  it('renders special move badges for castling, promotion, and capture', () => {
    const specialMoves: MoveRecord[] = [
      {
        moveIndex: 0,
        turn: 'WHITE',
        piece: 'KING',
        from: 'e1',
        to: 'g1',
        isPromotion: false,
        isCastling: true,
      },
      {
        moveIndex: 1,
        turn: 'BLACK',
        piece: 'PAWN',
        from: 'd2',
        to: 'd1',
        isPromotion: true,
        promotionPiece: 'QUEEN',
        isCastling: false,
      },
      {
        moveIndex: 2,
        turn: 'WHITE',
        piece: 'BISHOP',
        from: 'c4',
        to: 'f7',
        capturedPiece: 'PAWN',
        isPromotion: false,
        isCastling: false,
      },
    ];

    render(<MoveHistoryPanel moveHistory={specialMoves} currentMoveIndex={3} />);

    expect(screen.getByText('Enroque')).toBeInTheDocument();
    expect(screen.getByText('Coronación')).toBeInTheDocument();
    expect(screen.getByText('Captura')).toBeInTheDocument();
  });
});
